import { getAdminSupabase, getUserFromRequest } from "@/lib/stripe-server";
import { rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";

const DEEPSEEK_API = "https://api.deepseek.com/chat/completions";

const SYSTEM_PROMPT = `You are Gemi, the friendly AI assistant for Hirelyx — a freelance marketplace where buyers hire skilled freelancers for projects. You are a professional, warm, and helpful AI agent.

ABOUT HIRELYX:
- Hirelyx connects buyers with freelancers for digital services (design, development, writing, marketing, video, etc.)
- Sellers create "gigs" (service listings) with packages (Basic/Standard/Premium)
- Buyers browse, order gigs, or post project requests and receive proposals
- Payment is secure through Stripe — money is held in escrow until the buyer approves delivery
- Platform fee: 10% from the seller's earnings
- Sellers get paid via Stripe Connect to their bank account (2-7 business days)
- Hirelyx supports 16 languages and multiple currencies
- Sellers have levels: New → Level 1 → Level 2 → Top Rated (based on orders, ratings, tenure)
- Messaging system with custom offers, milestones, and video calls (Jitsi)
- Dispute resolution with admin review

HOW IT WORKS:
1. Buyer finds a gig or posts a project request
2. Buyer places order → pays via Stripe Checkout
3. Seller works on the project and delivers (with files)
4. Buyer reviews delivery → accepts or requests revision
5. On acceptance → payment released to seller (minus 10% fee)
6. Buyer can leave a review (1-5 stars + comment)

RULES:
- Be concise. Keep answers 2-4 sentences max.
- Be friendly but professional
- If someone asks about order status and provides an order ID, say you'll look it up
- If you don't know something specific about their account, suggest they check their dashboard or contact support
- Never make up information about specific orders or users
- For technical issues, suggest refreshing the page or contacting support
- You can help with: how the platform works, pricing questions, getting started, seller tips, buyer guidance
- Respond in the same language the user writes in`;

interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export async function POST(request: Request) {
  const user = await getUserFromRequest(request);

  const limited = await rateLimit(request, "chatbot", 20, 60, user?.id);
  if (limited) return limited;

  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    return Response.json({ error: "Chatbot not configured." }, { status: 503 });
  }

  let body: { messages?: { role: string; content: string }[]; orderId?: string };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return Response.json({ error: "Invalid request." }, { status: 400 });
  }

  const messages: ChatMessage[] = [{ role: "system", content: SYSTEM_PROMPT }];

  if (user && body.orderId) {
    const admin = getAdminSupabase();
    if (admin) {
      const { data: order } = await admin
        .from("orders")
        .select("id, buyer_id, seller_id, status, amount, currency, created_at, delivered_at, title")
        .eq("id", body.orderId)
        .maybeSingle();
      const o = order as { buyer_id?: string; seller_id?: string } | null;
      if (order && (o?.buyer_id === user.id || o?.seller_id === user.id)) {
        messages.push({
          role: "system",
          content: `Order info: ID=${order.id}, Status=${order.status}, Amount=$${order.amount}, Created=${order.created_at}${order.delivered_at ? `, Delivered=${order.delivered_at}` : ""}, Title="${order.title || "Order"}"`,
        });
      }
    }
  }

  const userMessages = (body.messages ?? [])
    .filter((m) => m.role === "user" || m.role === "assistant")
    .slice(-10)
    .map((m) => ({ role: m.role as "user" | "assistant", content: String(m.content).slice(0, 1000) }));

  messages.push(...userMessages);

  try {
    const response = await fetch(DEEPSEEK_API, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages,
        max_tokens: 500,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errText = await response.text().catch(() => "");
      console.error("DeepSeek error:", response.status, errText);
      return Response.json({ error: "AI service temporarily unavailable." }, { status: 502 });
    }

    const data = (await response.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const reply = data.choices?.[0]?.message?.content ?? "Sorry, I couldn't process that. Please try again.";

    return Response.json({ reply });
  } catch (err) {
    console.error("Chat error:", err);
    return Response.json({ error: "Could not reach AI service." }, { status: 502 });
  }
}
