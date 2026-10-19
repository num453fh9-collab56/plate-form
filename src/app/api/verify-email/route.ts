import { NextResponse } from "next/server";
import dns from "dns/promises";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();
    if (!email || typeof email !== "string") {
      return NextResponse.json({ valid: false });
    }

    const domain = email.split("@")[1]?.toLowerCase();
    if (!domain) {
      return NextResponse.json({ valid: false });
    }

    const mxRecords = await dns.resolveMx(domain).catch(() => []);
    if (mxRecords.length === 0) {
      return NextResponse.json({ valid: false });
    }

    return NextResponse.json({ valid: true });
  } catch {
    return NextResponse.json({ valid: true });
  }
}
