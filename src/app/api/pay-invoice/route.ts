import { createClient } from "@supabase/supabase-js";
import { getStripe, getUserFromRequest } from "@/lib/stripe-server";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

function adminSb() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
}

export async function POST(req: NextRequest) {
  const user = await getUserFromRequest(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { invoiceId } = await req.json();
  if (!invoiceId) return NextResponse.json({ error: "Invoice ID required" }, { status: 400 });

  const sb = adminSb();
  const { data: invoice } = await sb.from("invoices").select("*").eq("id", invoiceId).single();
  if (!invoice) return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
  if (invoice.status === "paid") return NextResponse.json({ error: "Already paid" }, { status: 400 });
  if (invoice.total <= 0) return NextResponse.json({ error: "Invalid amount" }, { status: 400 });

  const stripe = getStripe();
  if (!stripe) return NextResponse.json({ error: "Stripe not configured" }, { status: 500 });

  const origin = req.headers.get("origin") || "https://plate-form-4hmb.vercel.app";

  const lineItems = (invoice.items as { description: string; qty: number; rate: number }[]).map((item) => ({
    price_data: {
      currency: (invoice.currency || "usd").toLowerCase(),
      product_data: { name: item.description || "Service" },
      unit_amount: Math.round(item.rate * 100),
    },
    quantity: item.qty || 1,
  }));

  if (invoice.tax_amount > 0) {
    lineItems.push({
      price_data: {
        currency: (invoice.currency || "usd").toLowerCase(),
        product_data: { name: "Tax" },
        unit_amount: Math.round(invoice.tax_amount * 100),
      },
      quantity: 1,
    });
  }

  const discounts = invoice.discount > 0 ? [{
    coupon: (await stripe.coupons.create({
      amount_off: Math.round(invoice.discount * 100),
      currency: (invoice.currency || "usd").toLowerCase(),
      duration: "once",
      name: `Discount on ${invoice.invoice_number}`,
    })).id,
  }] : [];

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: lineItems,
    discounts,
    metadata: {
      invoice_id: invoice.id,
      invoice_number: invoice.invoice_number,
    },
    customer_email: invoice.client_email || undefined,
    success_url: `${origin}/invoices?paid=${invoice.id}`,
    cancel_url: `${origin}/invoices?cancelled=${invoice.id}`,
  });

  return NextResponse.json({ url: session.url });
}
