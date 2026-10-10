import type { SupabaseClient } from "@supabase/supabase-js";
import { getAdminSupabase, getUserFromRequest } from "@/lib/stripe-server";
import { rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";

/* Admin API. Every request re-checks `public.admins` on the server with the
   service-role client — the browser's claim to be admin is never trusted. */

type View = "overview" | "gigs" | "users" | "orders" | "disputes" | "errors";
type Action = "pause-gig" | "publish-gig" | "delete-gig" | "ban-user" | "unban-user";

async function requireAdmin(
  request: Request,
): Promise<{ admin: SupabaseClient; userId: string } | Response> {
  const admin = getAdminSupabase();
  if (!admin) return Response.json({ error: "Backend not configured." }, { status: 503 });
  const user = await getUserFromRequest(request);
  if (!user) return Response.json({ error: "Not authenticated." }, { status: 401 });
  const { data } = await admin.from("admins").select("user_id").eq("user_id", user.id).maybeSingle();
  if (!data) return Response.json({ error: "Admins only." }, { status: 403 });
  const limited = await rateLimit(request, "admin", 120, 60, user.id);
  if (limited) return limited;
  return { admin, userId: user.id };
}

const count = async (admin: SupabaseClient, table: string, filter?: [string, string]) => {
  let query = admin.from(table).select("*", { count: "exact", head: true });
  if (filter) query = query.eq(filter[0], filter[1]);
  const { count: n } = await query;
  return n ?? 0;
};

export async function GET(request: Request) {
  const auth = await requireAdmin(request);
  if (auth instanceof Response) return auth;
  const { admin } = auth;
  const url = new URL(request.url);
  const view = (url.searchParams.get("view") ?? "overview") as View;
  const q = (url.searchParams.get("q") ?? "").trim().replace(/[,()%]/g, " ");

  if (view === "overview") {
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const [users, gigs, liveGigs, orders, banned, openDisputes, paid, errors24h] = await Promise.all([
      count(admin, "profiles"),
      count(admin, "gigs"),
      count(admin, "gigs", ["status", "published"]),
      count(admin, "orders"),
      count(admin, "banned_users"),
      count(admin, "disputes", ["status", "open"]),
      admin.from("orders").select("amount").in("status", ["paid", "delivered", "completed"]),
      admin.from("error_logs").select("*", { count: "exact", head: true }).gte("created_at", since),
    ]);
    const revenue = (paid.data ?? []).reduce((sum, o) => sum + Number((o as { amount: number }).amount ?? 0), 0);
    return Response.json({
      users,
      gigs,
      liveGigs,
      orders,
      banned,
      openDisputes,
      revenue: Math.round(revenue * 100) / 100,
      errors24h: errors24h.count ?? 0,
    });
  }

  if (view === "gigs") {
    let query = admin
      .from("gigs")
      .select("id, title, seller_name, seller_id, status, price, views, created_at")
      .order("created_at", { ascending: false })
      .limit(100);
    if (q) query = query.or(`title.ilike.%${q}%,seller_name.ilike.%${q}%`);
    const { data, error } = await query;
    if (error) return Response.json({ error: error.message }, { status: 500 });
    return Response.json({ items: data ?? [] });
  }

  if (view === "users") {
    let query = admin
      .from("profiles")
      .select("user_id, full_name, title, country, created_at")
      .order("created_at", { ascending: false })
      .limit(100);
    if (q) query = query.or(`full_name.ilike.%${q}%,title.ilike.%${q}%`);
    const [{ data, error }, { data: bans }, { data: admins }, authUsers] = await Promise.all([
      query,
      admin.from("banned_users").select("user_id, reason"),
      admin.from("admins").select("user_id"),
      admin.auth.admin.listUsers({ page: 1, perPage: 1000 }),
    ]);
    if (error) return Response.json({ error: error.message }, { status: 500 });
    const emails = new Map((authUsers.data?.users ?? []).map((u) => [u.id, u.email ?? ""]));
    const banMap = new Map((bans ?? []).map((b) => [b.user_id as string, (b.reason as string | null) ?? ""]));
    const adminSet = new Set((admins ?? []).map((a) => a.user_id as string));
    return Response.json({
      items: (data ?? []).map((p) => ({
        ...p,
        email: emails.get(p.user_id as string) ?? "",
        banned: banMap.has(p.user_id as string),
        banReason: banMap.get(p.user_id as string) ?? null,
        isAdmin: adminSet.has(p.user_id as string),
      })),
    });
  }

  if (view === "orders") {
    const { data, error } = await admin
      .from("orders")
      .select("id, gig_id, buyer_id, seller_id, amount, currency, status, package_key, created_at")
      .order("created_at", { ascending: false })
      .limit(100);
    if (error) return Response.json({ error: error.message }, { status: 500 });
    return Response.json({ items: data ?? [] });
  }

  if (view === "disputes") {
    const { data, error } = await admin
      .from("disputes")
      .select("id, order_id, opened_by, reason, details, status, resolution, refund_amount, admin_note, created_at, resolved_at")
      .order("created_at", { ascending: false })
      .limit(100);
    if (error) return Response.json({ error: error.message }, { status: 500 });
    const disputes = data ?? [];
    const orderIds = disputes.map((d) => d.order_id as string);
    const disputeIds = disputes.map((d) => d.id as string);
    const [{ data: orders }, { data: messages }] = await Promise.all([
      orderIds.length
        ? admin.from("orders").select("id, title, amount, buyer_id, seller_id, status").in("id", orderIds)
        : Promise.resolve({ data: [] as Record<string, unknown>[] }),
      disputeIds.length
        ? admin.from("dispute_messages").select("id, dispute_id, sender_id, body, is_admin, created_at").in("dispute_id", disputeIds).order("created_at")
        : Promise.resolve({ data: [] as Record<string, unknown>[] }),
    ]);
    const userIds = [
      ...new Set((orders ?? []).flatMap((o) => [o.buyer_id as string, o.seller_id as string]).filter(Boolean)),
    ];
    const { data: names } = userIds.length
      ? await admin.from("profiles").select("user_id, full_name").in("user_id", userIds)
      : { data: [] as { user_id: string; full_name: string | null }[] };
    const nameOf = new Map((names ?? []).map((n) => [n.user_id as string, (n.full_name as string | null) ?? "User"]));
    return Response.json({
      items: disputes.map((d) => {
        const order = (orders ?? []).find((o) => o.id === d.order_id) ?? null;
        return {
          ...d,
          order,
          buyerName: order ? nameOf.get(order.buyer_id as string) ?? "Buyer" : "Buyer",
          sellerName: order ? nameOf.get(order.seller_id as string) ?? "Seller" : "Seller",
          messages: (messages ?? []).filter((m) => m.dispute_id === d.id),
        };
      }),
    });
  }

  if (view === "errors") {
    const { data, error } = await admin
      .from("error_logs")
      .select("id, created_at, source, message, digest, path, user_id, context")
      .order("created_at", { ascending: false })
      .limit(100);
    if (error) return Response.json({ error: error.message }, { status: 500 });
    return Response.json({ items: data ?? [] });
  }

  return Response.json({ error: "Unknown view." }, { status: 400 });
}

export async function POST(request: Request) {
  const auth = await requireAdmin(request);
  if (auth instanceof Response) return auth;
  const { admin, userId } = auth;

  let body: { action?: Action; id?: string; reason?: string };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid request." }, { status: 400 });
  }
  const { action, id } = body;
  if (!action || !id) return Response.json({ error: "Missing fields." }, { status: 400 });

  switch (action) {
    case "pause-gig":
    case "publish-gig": {
      const status = action === "pause-gig" ? "paused" : "published";
      const { error } = await admin.from("gigs").update({ status }).eq("id", id);
      if (error) return Response.json({ error: error.message }, { status: 500 });
      return Response.json({ ok: true });
    }
    case "delete-gig": {
      const { error } = await admin.from("gigs").delete().eq("id", id);
      if (error) return Response.json({ error: error.message }, { status: 500 });
      return Response.json({ ok: true });
    }
    case "ban-user": {
      if (id === userId) return Response.json({ error: "You cannot ban yourself." }, { status: 400 });
      const { data: target } = await admin.from("admins").select("user_id").eq("user_id", id).maybeSingle();
      if (target) return Response.json({ error: "Remove admin rights before banning." }, { status: 400 });
      // Blocks sign-in at the auth layer (~100 years), hides their gigs, records why.
      const { error: banError } = await admin.auth.admin.updateUserById(id, { ban_duration: "876000h" });
      if (banError) return Response.json({ error: banError.message }, { status: 500 });
      await Promise.all([
        admin.from("banned_users").upsert({
          user_id: id,
          reason: (body.reason ?? "").slice(0, 500) || null,
          banned_by: userId,
        }),
        admin.from("gigs").update({ status: "paused" }).eq("seller_id", id).eq("status", "published"),
      ]);
      return Response.json({ ok: true });
    }
    case "unban-user": {
      const { error: unbanError } = await admin.auth.admin.updateUserById(id, { ban_duration: "none" });
      if (unbanError) return Response.json({ error: unbanError.message }, { status: 500 });
      await admin.from("banned_users").delete().eq("user_id", id);
      return Response.json({ ok: true });
    }
    default:
      return Response.json({ error: "Unknown action." }, { status: 400 });
  }
}
