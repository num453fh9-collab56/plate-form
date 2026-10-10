import { getAdminSupabase, getUserFromRequest } from "@/lib/stripe-server";
import { rateLimit } from "@/lib/rate-limit";
import { notifyUser } from "@/lib/notify";
import { isAllowedCategory, normalizeSkills } from "@/lib/taxonomy";

export const runtime = "nodejs";

/* Buyer requests.
   create / close            — the buyer who owns the request
   propose / withdraw        — sellers (not the owner), while the request is open
   shortlist / decline       — the owner, on a proposal
   message                   — the owner opens a chat with a proposer
   (Hiring = paying: POST /api/checkout { proposalId }.) */

interface JobBody {
  action?: "create" | "close" | "propose" | "withdraw" | "shortlist" | "decline" | "message";
  jobId?: string;
  proposalId?: string;
  title?: string;
  description?: string;
  category?: string;
  skills?: string[];
  budgetMin?: number;
  budgetMax?: number;
  deliveryDays?: number;
  coverLetter?: string;
  amount?: number;
}

const money = (value: unknown) => Math.round(Number(value) * 100) / 100;

export async function POST(request: Request) {
  const admin = getAdminSupabase();
  if (!admin) return Response.json({ error: "Backend not configured." }, { status: 503 });
  const user = await getUserFromRequest(request);
  if (!user) return Response.json({ error: "Not authenticated." }, { status: 401 });

  let body: JobBody;
  try {
    body = (await request.json()) as JobBody;
  } catch {
    return Response.json({ error: "Invalid request." }, { status: 400 });
  }

  if (body.action === "create") {
    const limited = await rateLimit(request, "job-create", 5, 3600, user.id);
    if (limited) return limited;
    const title = (body.title ?? "").trim().slice(0, 120);
    const description = (body.description ?? "").trim().slice(0, 4000);
    if (title.length < 10) return Response.json({ error: "Title needs at least 10 characters." }, { status: 400 });
    if (description.length < 50) return Response.json({ error: "Describe the work in at least 50 characters." }, { status: 400 });
    const category = body.category && isAllowedCategory(body.category) ? body.category : null;
    const budgetMin = money(body.budgetMin);
    const budgetMax = money(body.budgetMax);
    if (!(budgetMin >= 5) || !(budgetMax >= budgetMin) || budgetMax > 50000) {
      return Response.json({ error: "Budget must be $5–$50,000 and max ≥ min." }, { status: 400 });
    }
    const days = Math.round(Number(body.deliveryDays));
    const { data, error } = await admin
      .from("job_posts")
      .insert({
        buyer_id: user.id,
        title,
        description,
        category,
        skills: normalizeSkills(Array.isArray(body.skills) ? body.skills.slice(0, 10) : [], category ?? undefined),
        budget_min: budgetMin,
        budget_max: budgetMax,
        delivery_days: days >= 1 && days <= 365 ? days : null,
      })
      .select("id")
      .single();
    if (error || !data) return Response.json({ error: "Could not post the request." }, { status: 500 });
    return Response.json({ ok: true, jobId: data.id });
  }

  const limited = await rateLimit(request, "jobs", 40, 60, user.id);
  if (limited) return limited;

  if (body.action === "close") {
    const { data } = await admin
      .from("job_posts")
      .update({ status: "closed" })
      .eq("id", body.jobId ?? "")
      .eq("buyer_id", user.id)
      .eq("status", "open")
      .select("id")
      .maybeSingle();
    if (!data) return Response.json({ error: "Request not found or already closed." }, { status: 404 });
    return Response.json({ ok: true });
  }

  if (body.action === "propose") {
    const { data: job } = await admin
      .from("job_posts")
      .select("id, buyer_id, title, status")
      .eq("id", body.jobId ?? "")
      .maybeSingle();
    if (!job) return Response.json({ error: "Request not found." }, { status: 404 });
    if (job.status !== "open") return Response.json({ error: "This request is closed." }, { status: 409 });
    if (job.buyer_id === user.id) return Response.json({ error: "You cannot propose on your own request." }, { status: 400 });
    const coverLetter = (body.coverLetter ?? "").trim().slice(0, 3000);
    const amount = money(body.amount);
    const days = Math.round(Number(body.deliveryDays));
    if (coverLetter.length < 30) return Response.json({ error: "Write at least 30 characters about your approach." }, { status: 400 });
    if (!(amount >= 5) || amount > 50000) return Response.json({ error: "Price must be $5–$50,000." }, { status: 400 });
    if (!(days >= 1) || days > 365) return Response.json({ error: "Delivery must be 1–365 days." }, { status: 400 });
    const { error } = await admin.from("proposals").insert({
      job_id: job.id,
      seller_id: user.id,
      cover_letter: coverLetter,
      amount,
      delivery_days: days,
    });
    if (error) return Response.json({ error: "You already sent a proposal for this request." }, { status: 409 });
    await notifyUser(admin, job.buyer_id, "New proposal", `Someone offered $${amount} for "${job.title}".`, `/requests/${job.id}`);
    return Response.json({ ok: true });
  }

  const { data: proposal } = await admin
    .from("proposals")
    .select("id, job_id, seller_id, status")
    .eq("id", body.proposalId ?? "")
    .maybeSingle();
  if (!proposal) return Response.json({ error: "Proposal not found." }, { status: 404 });

  if (body.action === "withdraw") {
    if (proposal.seller_id !== user.id) return Response.json({ error: "Not your proposal." }, { status: 403 });
    if (proposal.status === "hired") return Response.json({ error: "You were already hired." }, { status: 409 });
    await admin.from("proposals").delete().eq("id", proposal.id);
    return Response.json({ ok: true });
  }

  const { data: job } = await admin
    .from("job_posts")
    .select("id, buyer_id, title")
    .eq("id", proposal.job_id)
    .maybeSingle();
  if (!job || job.buyer_id !== user.id) return Response.json({ error: "Not your request." }, { status: 403 });

  if (body.action === "shortlist" || body.action === "decline") {
    if (proposal.status === "hired") return Response.json({ error: "Already hired." }, { status: 409 });
    const status = body.action === "shortlist" ? "shortlisted" : "declined";
    await admin.from("proposals").update({ status }).eq("id", proposal.id);
    if (status === "shortlisted") {
      await notifyUser(admin, proposal.seller_id, "You were shortlisted", `The buyer shortlisted your proposal for "${job.title}".`, `/requests/${job.id}`);
    }
    return Response.json({ ok: true, status });
  }

  if (body.action === "message") {
    const { data: existing } = await admin
      .from("conversations")
      .select("id")
      .eq("buyer_id", user.id)
      .eq("seller_id", proposal.seller_id)
      .is("gig_id", null)
      .limit(1)
      .maybeSingle();
    if (existing) return Response.json({ ok: true, conversationId: existing.id });
    const { data: created, error } = await admin
      .from("conversations")
      .insert({ buyer_id: user.id, seller_id: proposal.seller_id, gig_id: null })
      .select("id")
      .single();
    if (error || !created) return Response.json({ error: "Could not open chat." }, { status: 500 });
    return Response.json({ ok: true, conversationId: created.id });
  }

  return Response.json({ error: "Unknown action." }, { status: 400 });
}
