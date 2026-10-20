import { createClient } from "@supabase/supabase-js";
import { getUserFromRequest } from "@/lib/stripe-server";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

function adminSb() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
}

const STAGES = ["discovery", "design", "development", "testing", "launch", "completed"] as const;

export async function GET(req: NextRequest) {
  const user = await getUserFromRequest(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const sb = adminSb();
  const projectId = req.nextUrl.searchParams.get("id");

  if (projectId) {
    const [proj, milestones, activity] = await Promise.all([
      sb.from("projects").select("*").eq("id", projectId).single(),
      sb.from("project_milestones").select("*").eq("project_id", projectId).order("sort_order"),
      sb.from("project_activity").select("*").eq("project_id", projectId).order("created_at", { ascending: true }),
    ]);
    return NextResponse.json({
      project: proj.data,
      milestones: milestones.data ?? [],
      activity: activity.data ?? [],
    });
  }

  const { data } = await sb
    .from("projects")
    .select("*")
    .order("updated_at", { ascending: false });
  return NextResponse.json({ projects: data ?? [] });
}

export async function POST(req: NextRequest) {
  const user = await getUserFromRequest(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { action } = body;
  const sb = adminSb();

  if (action === "create") {
    const { title, description, client_id, client_name, client_email, service, budget, deadline } = body;
    if (!title?.trim()) return NextResponse.json({ error: "Title required" }, { status: 400 });

    const { data, error } = await sb.from("projects").insert({
      title: title.trim(),
      description: description?.trim() ?? "",
      client_id: client_id || null,
      client_name: client_name?.trim() ?? "",
      client_email: client_email?.trim() ?? "",
      service: service ?? "",
      budget: budget ?? "",
      deadline: deadline || null,
      status: "discovery",
      stage: 0,
    }).select().single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    const defaultMilestones = [
      { title: "Discovery & Requirements", stage: 0, sort_order: 0 },
      { title: "Design & Planning", stage: 1, sort_order: 1 },
      { title: "Development", stage: 2, sort_order: 2 },
      { title: "Testing & QA", stage: 3, sort_order: 3 },
      { title: "Launch & Delivery", stage: 4, sort_order: 4 },
    ];
    await sb.from("project_milestones").insert(
      defaultMilestones.map((m) => ({ ...m, project_id: data.id })),
    );

    await sb.from("project_activity").insert({
      project_id: data.id,
      user_id: user.id,
      user_role: "team",
      type: "status",
      content: "Project created",
    });

    return NextResponse.json({ project: data });
  }

  if (action === "update-stage") {
    const { projectId, stage } = body;
    const status = STAGES[stage] ?? "discovery";
    await sb.from("projects").update({
      stage, status, updated_at: new Date().toISOString(),
    }).eq("id", projectId);

    if (stage > 0) {
      await sb.from("project_milestones")
        .update({ status: "completed", completed_at: new Date().toISOString() })
        .eq("project_id", projectId)
        .lt("stage", stage);
    }
    await sb.from("project_milestones")
      .update({ status: "in_progress" })
      .eq("project_id", projectId)
      .eq("stage", stage);

    await sb.from("project_activity").insert({
      project_id: projectId,
      user_id: user.id,
      user_role: "team",
      type: "status",
      content: `Stage updated to ${status}`,
    });

    return NextResponse.json({ ok: true });
  }

  if (action === "comment") {
    const { projectId, content, userRole } = body;
    if (!content?.trim()) return NextResponse.json({ error: "Empty comment" }, { status: 400 });
    await sb.from("project_activity").insert({
      project_id: projectId,
      user_id: user.id,
      user_role: userRole ?? "team",
      type: "comment",
      content: content.trim(),
    });
    await sb.from("projects").update({ updated_at: new Date().toISOString() }).eq("id", projectId);
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
