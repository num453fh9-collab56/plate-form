import { getAdminSupabase, getUserFromRequest } from "@/lib/stripe-server";
import { rateLimit } from "@/lib/rate-limit";
import { notifyUser } from "@/lib/notify";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const user = await getUserFromRequest(request);
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const limited = await rateLimit(request, "review", 10, 60, user.id);
  if (limited) return limited;

  const body = (await request.json().catch(() => ({}))) as {
    action?: string;
    orderId?: string;
    reviewId?: string;
    rating?: number;
    comment?: string;
    reply?: string;
  };

  const supabase = getAdminSupabase();
  if (!supabase) return Response.json({ error: "Server error." }, { status: 500 });

  const action = body.action ?? "submit";

  if (action === "submit") {
    const { orderId, rating, comment } = body;
    if (!orderId) return Response.json({ error: "orderId required." }, { status: 400 });
    if (!rating || rating < 1 || rating > 5) return Response.json({ error: "Rating must be 1-5." }, { status: 400 });

    const { data: order } = await supabase
      .from("orders")
      .select("id, buyer_id, seller_id, gig_id, status")
      .eq("id", orderId)
      .maybeSingle();

    if (!order) return Response.json({ error: "Order not found." }, { status: 404 });
    if (order.buyer_id !== user.id) return Response.json({ error: "Only the buyer can leave a review." }, { status: 403 });
    if (order.status !== "completed") return Response.json({ error: "Order must be completed first." }, { status: 400 });
    if (!order.gig_id || !order.seller_id) return Response.json({ error: "Invalid order." }, { status: 400 });

    const { data: existing } = await supabase
      .from("reviews")
      .select("id")
      .eq("order_id", orderId)
      .maybeSingle();

    if (existing) return Response.json({ error: "You already reviewed this order." }, { status: 409 });

    const { error } = await supabase.from("reviews").insert({
      order_id: orderId,
      gig_id: order.gig_id,
      reviewer_id: user.id,
      seller_id: order.seller_id,
      rating: Math.round(rating),
      comment: (comment ?? "").trim().slice(0, 2000),
    });

    if (error) return Response.json({ error: error.message }, { status: 500 });

    void notifyUser(supabase, order.seller_id, "New review received", `You received a ${Math.round(rating)}-star review.`, `/orders/${orderId}`, "review");

    return Response.json({ ok: true });
  }

  if (action === "reply") {
    const { reviewId, reply } = body;
    if (!reviewId) return Response.json({ error: "reviewId required." }, { status: 400 });
    if (!reply?.trim()) return Response.json({ error: "Reply cannot be empty." }, { status: 400 });

    const { data: review } = await supabase
      .from("reviews")
      .select("id, seller_id, reviewer_id, seller_reply, order_id")
      .eq("id", reviewId)
      .maybeSingle();

    if (!review) return Response.json({ error: "Review not found." }, { status: 404 });
    if (review.seller_id !== user.id) return Response.json({ error: "Only the seller can reply." }, { status: 403 });
    if (review.seller_reply) return Response.json({ error: "You already replied." }, { status: 409 });

    const { error } = await supabase
      .from("reviews")
      .update({
        seller_reply: reply.trim().slice(0, 2000),
        seller_replied_at: new Date().toISOString(),
      })
      .eq("id", reviewId);

    if (error) return Response.json({ error: error.message }, { status: 500 });

    const rv = review as { reviewer_id?: string; order_id?: string };
    if (rv.reviewer_id) {
      void notifyUser(supabase, rv.reviewer_id, "Seller replied to your review", reply.trim().slice(0, 100), `/orders/${rv.order_id ?? ""}`, "review");
    }

    return Response.json({ ok: true });
  }

  return Response.json({ error: "Unknown action." }, { status: 400 });
}
