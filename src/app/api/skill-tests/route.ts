import { getAdminSupabase, getUserFromRequest } from "@/lib/stripe-server";
import { rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";

interface TestQuestion {
  question: string;
  options: string[];
  correct: number;
}

export async function GET(request: Request) {
  const admin = getAdminSupabase();
  if (!admin) return Response.json({ error: "Not configured" }, { status: 503 });

  const url = new URL(request.url);
  const testId = url.searchParams.get("id");
  const category = url.searchParams.get("category");

  if (testId) {
    const { data } = await admin
      .from("skill_tests")
      .select("id, skill_name, category, description, time_limit_minutes, passing_score, questions")
      .eq("id", testId)
      .eq("is_active", true)
      .maybeSingle();
    if (!data) return Response.json({ error: "Test not found" }, { status: 404 });
    const test = data as { questions: TestQuestion[] } & Record<string, unknown>;
    const questions = test.questions.map((q: TestQuestion) => ({
      question: q.question,
      options: q.options,
    }));
    return Response.json({ ...test, questions });
  }

  let query = admin
    .from("skill_tests")
    .select("id, skill_name, category, description, time_limit_minutes, passing_score")
    .eq("is_active", true);
  if (category) query = query.eq("category", category);

  const { data } = await query.order("skill_name");
  return Response.json({ tests: data ?? [] });
}

export async function POST(request: Request) {
  const user = await getUserFromRequest(request);
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const limited = await rateLimit(request, "skill-test", 5, 3600, user.id);
  if (limited) return limited;

  const admin = getAdminSupabase();
  if (!admin) return Response.json({ error: "Not configured" }, { status: 503 });

  let body: { testId?: string; answers?: number[] } = {};
  try { body = await request.json(); } catch { return Response.json({ error: "Invalid" }, { status: 400 }); }

  if (!body.testId || !Array.isArray(body.answers)) {
    return Response.json({ error: "Missing test ID or answers." }, { status: 400 });
  }

  const { data: test } = await admin
    .from("skill_tests")
    .select("id, questions, passing_score")
    .eq("id", body.testId)
    .maybeSingle();
  if (!test) return Response.json({ error: "Test not found." }, { status: 404 });

  const questions = (test as { questions: TestQuestion[] }).questions;
  const passingScore = (test as { passing_score: number }).passing_score;
  let correct = 0;
  for (let i = 0; i < questions.length; i++) {
    if (body.answers[i] === questions[i].correct) correct++;
  }
  const score = Math.round((correct / Math.max(1, questions.length)) * 100);
  const passed = score >= passingScore;

  const { data: existing } = await admin
    .from("skill_test_results")
    .select("id, score")
    .eq("user_id", user.id)
    .eq("test_id", body.testId)
    .maybeSingle();

  if (existing) {
    if ((existing as { score: number }).score >= score) {
      return Response.json({ score, passed, improved: false, message: "Your previous score was higher." });
    }
    await admin
      .from("skill_test_results")
      .update({ score, passed, answers: body.answers, completed_at: new Date().toISOString() })
      .eq("id", (existing as { id: string }).id);
  } else {
    await admin.from("skill_test_results").insert({
      user_id: user.id,
      test_id: body.testId,
      score,
      passed,
      answers: body.answers,
    });
  }

  return Response.json({ score, passed, correct, total: questions.length, improved: true });
}
