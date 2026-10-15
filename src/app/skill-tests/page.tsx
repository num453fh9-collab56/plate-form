"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/lib/auth";
import { useUI } from "@/lib/ui";
import { getSupabase } from "@/lib/supabase";

interface SkillTest {
  id: string;
  skill_name: string;
  category: string;
  description: string;
  time_limit_minutes: number;
  passing_score: number;
  question_count: number;
}

interface Question {
  q: string;
  options: string[];
}

interface TestResult {
  test_id: string;
  score: number;
  passed: boolean;
  completed_at: string;
}

async function getToken(): Promise<string | null> {
  const s = getSupabase();
  if (!s) return null;
  const { data } = await s.auth.getSession();
  return data.session?.access_token ?? null;
}

export default function SkillTestsPage() {
  const { user } = useAuth();
  const { toast } = useUI();
  const [tests, setTests] = useState<SkillTest[]>([]);
  const [results, setResults] = useState<TestResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTest, setActiveTest] = useState<string | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<number[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [lastResult, setLastResult] = useState<{ score: number; passed: boolean } | null>(null);

  const load = useCallback(async () => {
    const token = await getToken();
    const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};
    const res = await fetch("/api/skill-tests", { headers });
    if (res.ok) {
      const j = await res.json();
      setTests(j.tests ?? []);
      setResults(j.results ?? []);
    }
    setLoading(false);
  }, []);

  useEffect(() => { void load(); }, [load]);

  const startTest = async (testId: string) => {
    const token = await getToken();
    if (!token) { toast("Please sign in to take tests."); return; }
    const res = await fetch(`/api/skill-tests?testId=${testId}`, { headers: { Authorization: `Bearer ${token}` } });
    if (!res.ok) { toast("Failed to load test."); return; }
    const j = await res.json();
    setQuestions(j.questions ?? []);
    setAnswers(new Array((j.questions ?? []).length).fill(-1));
    setActiveTest(testId);
    setLastResult(null);
  };

  const submitTest = async () => {
    if (!activeTest) return;
    setSubmitting(true);
    const token = await getToken();
    const res = await fetch("/api/skill-tests", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token ?? ""}` },
      body: JSON.stringify({ testId: activeTest, answers }),
    });
    const j = await res.json();
    if (res.ok) {
      setLastResult({ score: j.score, passed: j.passed });
      toast(j.passed ? `Passed with ${j.score}%!` : `Score: ${j.score}% — need ${tests.find((t) => t.id === activeTest)?.passing_score}% to pass`);
      void load();
    } else toast(j.error || "Failed to submit.");
    setSubmitting(false);
  };

  const getResult = (testId: string) => results.find((r) => r.test_id === testId);

  if (loading) return <main className="container py-lg"><p>Loading...</p></main>;

  if (activeTest && questions.length > 0) {
    const test = tests.find((t) => t.id === activeTest);
    return (
      <main className="container py-lg" style={{ maxWidth: 700 }}>
        <button className="btn-ghost btn-sm" onClick={() => { setActiveTest(null); setLastResult(null); }} style={{ marginBottom: 16 }}>&larr; Back to tests</button>
        <h1>{test?.skill_name}</h1>
        <p className="muted" style={{ marginBottom: 24 }}>Time limit: {test?.time_limit_minutes} minutes &middot; Passing score: {test?.passing_score}%</p>

        {lastResult ? (
          <div className="card" style={{ padding: 24, textAlign: "center", marginBottom: 24 }}>
            <div style={{ fontSize: "2.5rem", fontWeight: 800, color: lastResult.passed ? "#22c55e" : "#ef4444" }}>
              {lastResult.score}%
            </div>
            <div style={{ fontSize: "1.1rem", fontWeight: 600, marginTop: 8 }}>
              {lastResult.passed ? "Congratulations! You passed!" : "Not quite — try again later!"}
            </div>
          </div>
        ) : (
          <>
            {questions.map((q, i) => (
              <div key={i} className="card" style={{ padding: 20, marginBottom: 16 }}>
                <p style={{ fontWeight: 600, marginBottom: 12 }}>{i + 1}. {q.q}</p>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {q.options.map((opt, oi) => (
                    <label key={oi} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", borderRadius: 8, cursor: "pointer", border: `1px solid ${answers[i] === oi ? "var(--accent)" : "var(--border)"}`, background: answers[i] === oi ? "var(--hover)" : "transparent" }}>
                      <input type="radio" name={`q${i}`} checked={answers[i] === oi} onChange={() => { const a = [...answers]; a[i] = oi; setAnswers(a); }} />
                      {opt}
                    </label>
                  ))}
                </div>
              </div>
            ))}
            <button className="btn-primary" onClick={() => void submitTest()} disabled={submitting || answers.includes(-1)} style={{ width: "100%", padding: "14px 0" }}>
              {submitting ? "Submitting..." : `Submit Test (${answers.filter((a) => a >= 0).length}/${questions.length} answered)`}
            </button>
          </>
        )}
      </main>
    );
  }

  return (
    <main className="container py-lg" style={{ maxWidth: 800 }}>
      <h1>Skill Tests</h1>
      <p className="muted" style={{ marginBottom: 24 }}>Take skill tests to earn verified badges on your profile. Prove your expertise to buyers!</p>

      {tests.length === 0 ? (
        <div className="card" style={{ padding: 32, textAlign: "center" }}>
          <p className="muted">No skill tests available yet. Check back soon!</p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16 }}>
          {tests.map((t) => {
            const result = getResult(t.id);
            return (
              <div key={t.id} className="card" style={{ padding: 20 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                  <h3 style={{ margin: 0, fontSize: "1.05rem" }}>{t.skill_name}</h3>
                  {result ? (
                    <span className={`badge badge-${result.passed ? "green" : "red"}`}>
                      {result.passed ? `Passed ${result.score}%` : `Failed ${result.score}%`}
                    </span>
                  ) : null}
                </div>
                {t.category ? <span className="badge" style={{ marginBottom: 8 }}>{t.category}</span> : null}
                <p className="muted" style={{ fontSize: "0.88rem", margin: "8px 0 16px" }}>{t.description || `Test your ${t.skill_name} knowledge`}</p>
                <div className="muted" style={{ fontSize: "0.82rem", marginBottom: 12 }}>
                  {t.question_count} questions &middot; {t.time_limit_minutes} min &middot; Pass: {t.passing_score}%
                </div>
                <button className="btn-primary btn-sm" onClick={() => void startTest(t.id)} disabled={!user?.sub}>
                  {result?.passed ? "Retake Test" : "Start Test"}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}
