import { getAdminSupabase } from "@/lib/stripe-server";

export const runtime = "nodejs";

export async function GET() {
  const admin = getAdminSupabase();
  if (!admin) return Response.json({ error: "Not configured" }, { status: 503 });

  const { data } = await admin
    .from("tax_rates")
    .select("country_code, country_name, tax_rate, tax_name")
    .eq("is_active", true)
    .order("country_name");

  return Response.json({ rates: data ?? [] });
}
