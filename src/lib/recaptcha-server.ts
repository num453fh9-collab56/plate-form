const SECRET_KEY = (process.env.RECAPTCHA_SECRET_KEY ?? "").trim();

export const RECAPTCHA_SERVER_CONFIGURED = SECRET_KEY.length > 0;

interface VerifyResult {
  pass: boolean;
  score: number;
}

export async function verifyRecaptcha(
  token: string | null | undefined,
  expectedAction: string,
  minScore = 0.5,
): Promise<VerifyResult> {
  if (!RECAPTCHA_SERVER_CONFIGURED) return { pass: true, score: 1 };
  if (!token) return { pass: false, score: 0 };

  try {
    const res = await fetch("https://www.google.com/recaptcha/api/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `secret=${encodeURIComponent(SECRET_KEY)}&response=${encodeURIComponent(token)}`,
    });
    const data = (await res.json()) as {
      success?: boolean;
      score?: number;
      action?: string;
    };
    const score = data.score ?? 0;
    const pass =
      data.success === true &&
      data.action === expectedAction &&
      score >= minScore;
    return { pass, score };
  } catch {
    return { pass: true, score: 1 };
  }
}
