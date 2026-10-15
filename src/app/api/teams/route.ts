import { getAdminSupabase, getUserFromRequest } from "@/lib/stripe-server";
import { rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const user = await getUserFromRequest(request);
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const admin = getAdminSupabase();
  if (!admin) return Response.json({ error: "Not configured" }, { status: 503 });

  const { data: memberships } = await admin
    .from("team_members")
    .select("team_id, role")
    .eq("user_id", user.id);

  const teamIds = (memberships ?? []).map((m) => (m as { team_id: string }).team_id);

  const { data: owned } = await admin
    .from("teams")
    .select("id, name, description, logo, created_at")
    .eq("owner_id", user.id);

  const ownedIds = (owned ?? []).map((t) => (t as { id: string }).id);
  const memberTeamIds = teamIds.filter((id) => !ownedIds.includes(id));

  let memberTeams: unknown[] = [];
  if (memberTeamIds.length > 0) {
    const { data } = await admin
      .from("teams")
      .select("id, name, description, logo, created_at")
      .in("id", memberTeamIds);
    memberTeams = data ?? [];
  }

  return Response.json({
    owned: owned ?? [],
    memberOf: memberTeams,
    roles: Object.fromEntries((memberships ?? []).map((m) => [(m as { team_id: string }).team_id, (m as { role: string }).role])),
  });
}

export async function POST(request: Request) {
  const user = await getUserFromRequest(request);
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const limited = await rateLimit(request, "teams", 10, 60, user.id);
  if (limited) return limited;

  const admin = getAdminSupabase();
  if (!admin) return Response.json({ error: "Not configured" }, { status: 503 });

  let body: { action?: string; name?: string; description?: string; teamId?: string; userId?: string; role?: string; email?: string } = {};
  try { body = await request.json(); } catch { return Response.json({ error: "Invalid" }, { status: 400 }); }

  if (body.action === "create") {
    if (!body.name?.trim()) return Response.json({ error: "Team name is required." }, { status: 400 });
    const { data: team, error } = await admin
      .from("teams")
      .insert({ name: body.name.trim(), owner_id: user.id, description: body.description ?? "" })
      .select("id")
      .single();
    if (error) return Response.json({ error: error.message }, { status: 500 });
    await admin.from("team_members").insert({
      team_id: (team as { id: string }).id,
      user_id: user.id,
      role: "owner",
    });
    return Response.json({ ok: true, teamId: (team as { id: string }).id });
  }

  if (body.action === "invite" && body.teamId && body.email) {
    const { data: team } = await admin.from("teams").select("owner_id").eq("id", body.teamId).maybeSingle();
    if (!team || (team as { owner_id: string }).owner_id !== user.id) {
      return Response.json({ error: "Not authorized." }, { status: 403 });
    }
    const { data: target } = await admin.auth.admin.listUsers();
    const found = target.users.find((u) => u.email === body.email);
    if (!found) return Response.json({ error: "User not found." }, { status: 404 });
    const { error } = await admin.from("team_members").insert({
      team_id: body.teamId,
      user_id: found.id,
      role: body.role ?? "member",
    });
    if (error) return Response.json({ error: error.message }, { status: 409 });
    return Response.json({ ok: true });
  }

  if (body.action === "remove" && body.teamId && body.userId) {
    const { data: team } = await admin.from("teams").select("owner_id").eq("id", body.teamId).maybeSingle();
    if (!team || (team as { owner_id: string }).owner_id !== user.id) {
      return Response.json({ error: "Not authorized." }, { status: 403 });
    }
    if (body.userId === user.id) return Response.json({ error: "Can't remove yourself." }, { status: 400 });
    await admin.from("team_members").delete().eq("team_id", body.teamId).eq("user_id", body.userId);
    return Response.json({ ok: true });
  }

  return Response.json({ error: "Unknown action." }, { status: 400 });
}
