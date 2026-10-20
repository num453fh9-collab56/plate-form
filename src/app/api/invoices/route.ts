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

async function nextInvoiceNumber(sb: ReturnType<typeof adminSb>, type: string): Promise<string> {
  const prefix = type === "quote" ? "Q" : "INV";
  const year = new Date().getFullYear();
  const { count } = await sb
    .from("invoices")
    .select("*", { count: "exact", head: true })
    .eq("type", type)
    .gte("created_at", `${year}-01-01`);
  const num = ((count ?? 0) + 1).toString().padStart(4, "0");
  return `${prefix}-${year}-${num}`;
}

export async function GET(req: NextRequest) {
  const user = await getUserFromRequest(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const sb = adminSb();
  const mode = req.nextUrl.searchParams.get("mode");
  const id = req.nextUrl.searchParams.get("id");

  if (id) {
    const { data } = await sb.from("invoices").select("*").eq("id", id).single();
    return NextResponse.json({ invoice: data });
  }

  if (mode === "my") {
    const { data } = await sb
      .from("invoices")
      .select("*")
      .eq("client_id", user.id)
      .order("created_at", { ascending: false });
    return NextResponse.json({ invoices: data ?? [] });
  }

  const { data } = await sb
    .from("invoices")
    .select("*")
    .order("created_at", { ascending: false });
  return NextResponse.json({ invoices: data ?? [] });
}

export async function POST(req: NextRequest) {
  const user = await getUserFromRequest(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { action } = body;
  const sb = adminSb();

  if (action === "create") {
    const { type, client_id, client_name, client_email, project_id, items, tax_rate, discount, currency, notes, due_date } = body;
    const t = type === "invoice" ? "invoice" : "quote";
    const invoiceNumber = await nextInvoiceNumber(sb, t);

    const lineItems = Array.isArray(items) ? items : [];
    const subtotal = lineItems.reduce((sum: number, i: { qty: number; rate: number }) => sum + (i.qty || 0) * (i.rate || 0), 0);
    const taxAmt = subtotal * ((tax_rate || 0) / 100);
    const total = subtotal + taxAmt - (discount || 0);

    const { data, error } = await sb.from("invoices").insert({
      invoice_number: invoiceNumber,
      type: t,
      project_id: project_id || null,
      client_id: client_id || null,
      client_name: client_name?.trim() ?? "",
      client_email: client_email?.trim() ?? "",
      status: "draft",
      items: lineItems,
      subtotal,
      tax_rate: tax_rate || 0,
      tax_amount: taxAmt,
      discount: discount || 0,
      total,
      currency: currency || "USD",
      notes: notes?.trim() ?? "",
      due_date: due_date || null,
    }).select().single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ invoice: data });
  }

  if (action === "update") {
    const { id, items, tax_rate, discount, notes, due_date, status } = body;
    const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };

    if (items !== undefined) {
      const lineItems = Array.isArray(items) ? items : [];
      const subtotal = lineItems.reduce((sum: number, i: { qty: number; rate: number }) => sum + (i.qty || 0) * (i.rate || 0), 0);
      const taxR = tax_rate ?? 0;
      const taxAmt = subtotal * (taxR / 100);
      const d = discount ?? 0;
      Object.assign(updates, { items: lineItems, subtotal, tax_rate: taxR, tax_amount: taxAmt, discount: d, total: subtotal + taxAmt - d });
    }
    if (notes !== undefined) updates.notes = notes;
    if (due_date !== undefined) updates.due_date = due_date || null;
    if (status) updates.status = status;

    await sb.from("invoices").update(updates).eq("id", id);
    return NextResponse.json({ ok: true });
  }

  if (action === "send") {
    const { id } = body;
    await sb.from("invoices").update({ status: "sent", updated_at: new Date().toISOString() }).eq("id", id);
    return NextResponse.json({ ok: true });
  }

  if (action === "convert-to-invoice") {
    const { id } = body;
    const { data: quote } = await sb.from("invoices").select("*").eq("id", id).single();
    if (!quote) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const invoiceNumber = await nextInvoiceNumber(sb, "invoice");
    const { data, error } = await sb.from("invoices").insert({
      ...quote,
      id: undefined,
      invoice_number: invoiceNumber,
      type: "invoice",
      status: "draft",
      created_at: undefined,
      updated_at: undefined,
    }).select().single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    await sb.from("invoices").update({ status: "converted" }).eq("id", id);
    return NextResponse.json({ invoice: data });
  }

  if (action === "mark-paid") {
    const { id } = body;
    await sb.from("invoices").update({
      status: "paid",
      paid_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }).eq("id", id);
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
