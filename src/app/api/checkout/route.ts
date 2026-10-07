import {
  getAdminSupabase,
  getStripe,
  getUserFromRequest,
} from "@/lib/stripe-server";

export const runtime = "nodejs";

interface CheckoutBody {
  gigId?: string;
  requirements?: string;
}

export async function POST(request: Request) {
  const stripe = getStripe();
  const admin = getAdminSupabase();
  if (!stripe || !admin) {
    return Response.json(
      { error: "Payments are not configured yet." },
      { status: 503 },
    );
  }

  const user = await getUserFromRequest(request);
  if (!user) {
    return Response.json({ error: "Please sign in to place an order." }, { status: 401 });
  }

  let body: CheckoutBody;
  try {
    body = (await request.json()) as CheckoutBody;
  } catch {
    return Response.json({ error: "Invalid request." }, { status: 400 });
  }

  const gigId = body.gigId;
  if (!gigId) {
    return Response.json({ error: "Missing gig." }, { status: 400 });
  }

  const { data: gig, error: gigError } = await admin
    .from("gigs")
    .select("id, title, price, seller_id")
    .eq("id", gigId)
    .maybeSingle();

  if (gigError || !gig) {
    return Response.json({ error: "Gig not found." }, { status: 404 });
  }
  if (gig.seller_id && gig.seller_id === user.id) {
    return Response.json({ error: "You cannot order your own gig." }, { status: 400 });
  }
  if (!gig.price || Number(gig.price) <= 0) {
    return Response.json({ error: "This gig has no price set." }, { status: 400 });
  }

  const amount = Math.round(Number(gig.price) * 100);

  const { data: order, error: orderError } = await admin
    .from("orders")
    .insert({
      gig_id: gig.id,
      buyer_id: user.id,
      seller_id: gig.seller_id ?? null,
      amount: Number(gig.price),
      currency: "usd",
      status: "pending",
      requirements: (body.requirements ?? "").slice(0, 4000),
    })
    .select("*")
    .single();

  if (orderError || !order) {
    return Response.json({ error: "Could not create the order." }, { status: 500 });
  }

  const origin =
    request.headers.get("origin") ??
    process.env.NEXT_PUBLIC_SITE_URL ??
    "http://localhost:3000";

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "usd",
            unit_amount: amount,
            product_data: { name: gig.title, description: "Apex marketplace order" },
          },
        },
      ],
      success_url: `${origin}/orders?paid=1&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/gig/${gig.id}?canceled=1`,
      metadata: { order_id: order.id, buyer_id: user.id, seller_id: gig.seller_id ?? "" },
    });

    await admin
      .from("orders")
      .update({ stripe_session_id: session.id })
      .eq("id", order.id);

    return Response.json({ url: session.url, orderId: order.id });
  } catch (error) {
    await admin.from("orders").delete().eq("id", order.id);
    const message = error instanceof Error ? error.message : "Checkout failed.";
    return Response.json({ error: message }, { status: 500 });
  }
}
