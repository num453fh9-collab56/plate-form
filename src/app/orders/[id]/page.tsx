"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { useUI } from "@/lib/ui";
import { getSupabase } from "@/lib/supabase";
import { formatPrice } from "@/lib/format";

interface OrderDetail {
  id: string;
  gig_id: string | null;
  buyer_id: string;
  seller_id: string | null;
  title: string | null;
  amount: number;
  currency: string;
  status: string;
  requirements: string | null;
  delivery_note: string | null;
  revision_note: string | null;
  revision_count: number | null;
  delivery_days: number | null;
  package_key: string | null;
  created_at: string;
  paid_at: string | null;
  delivered_at: string | null;
}

interface Milestone {
  id: string;
  position: number;
  title: string;
  amount: number;
  days: number;
  status: "pending" | "delivered" | "approved";
  delivery_note: string | null;
}

interface Dispute {
  id: string;
  opened_by: string;
  reason: string;
  details: string;
  status: string;
  resolution: string | null;
  refund_amount: number | null;
  admin_note: string | null;
  created_at: string;
}

interface DisputeMessage {
  id: string;
  sender_id: string;
  body: string;
  is_admin: boolean;
  created_at: string;
}

const STEPS = ["pending", "paid", "delivered", "completed"] as const;
const STEP_LABEL: Record<string, string> = {
  pending: "Awaiting payment",
  paid: "In progress",
  delivered: "Delivered",
  completed: "Completed",
};
const REASONS: [string, string][] = [
  ["not_delivered", "Work was not delivered"],
  ["poor_quality", "Poor quality work"],
  ["not_as_described", "Not what was agreed"],
  ["buyer_unresponsive", "Buyer is unresponsive"],
  ["other", "Something else"],
];

async function postJson(path: string, body: Record<string, unknown>): Promise<string | null> {
  const supabase = getSupabase();
  const token = supabase ? (await supabase.auth.getSession()).data.session?.access_token : null;
  if (!token) return "Please sign in.";
  const response = await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify(body),
  });
  const payload = (await response.json().catch(() => ({}))) as { error?: string };
  return response.ok ? null : payload.error ?? "Something went wrong.";
}

const when = (iso: string | null) => (iso ? new Date(iso).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" }) : "");

export default function OrderDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id ?? "";
  const { user } = useAuth();
  const { openAuth, toast } = useUI();
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [gigTitle, setGigTitle] = useState<string | null>(null);
  const [counterpart, setCounterpart] = useState("");
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [dispute, setDispute] = useState<Dispute | null>(null);
  const [thread, setThread] = useState<DisputeMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [disputeOpen, setDisputeOpen] = useState(false);
  const [reason, setReason] = useState(REASONS[0][0]);
  const [reply, setReply] = useState("");
  const [now] = useState(() => Date.now());
  const uid = user?.sub;

  const load = useCallback(async () => {
    const supabase = getSupabase();
    if (!supabase || !uid || !id) return;
    const { data } = await supabase.from("orders").select("*").eq("id", id).maybeSingle();
    if (!data) {
      setOrder(null);
      setLoading(false);
      return;
    }
    const row = data as OrderDetail;
    const otherId = row.buyer_id === uid ? row.seller_id : row.buyer_id;
    const [gig, profile, ms, disputes] = await Promise.all([
      row.gig_id ? supabase.from("gigs").select("title").eq("id", row.gig_id).maybeSingle() : Promise.resolve({ data: null }),
      otherId ? supabase.from("profiles").select("full_name").eq("user_id", otherId).maybeSingle() : Promise.resolve({ data: null }),
      supabase.from("order_milestones").select("*").eq("order_id", row.id).order("position"),
      supabase.from("disputes").select("*").eq("order_id", row.id).order("created_at", { ascending: false }).limit(1),
    ]);
    setOrder(row);
    setGigTitle((gig.data as { title?: string } | null)?.title ?? null);
    setCounterpart((profile.data as { full_name?: string } | null)?.full_name ?? "");
    setMilestones((ms.data ?? []) as Milestone[]);
    const latest = ((disputes.data ?? []) as Dispute[])[0] ?? null;
    setDispute(latest);
    if (latest) {
      const { data: msgs } = await supabase
        .from("dispute_messages")
        .select("*")
        .eq("dispute_id", latest.id)
        .order("created_at");
      setThread((msgs ?? []) as DisputeMessage[]);
    } else {
      setThread([]);
    }
    setLoading(false);
  }, [uid, id]);

  useEffect(() => {
    const timer = setTimeout(() => void load(), 0);
    return () => clearTimeout(timer);
  }, [load]);

  if (!user) {
    return (
      <section className="section">
        <div className="wrap">
          <div className="empty">
            <h3>Sign in to view this order</h3>
            <button className="btn-primary" type="button" onClick={() => openAuth("login")}>Sign in</button>
          </div>
        </div>
      </section>
    );
  }

  if (loading) {
    return (
      <section className="section">
        <div className="wrap">
          <div className="skeleton skeleton-title" />
          <div className="skeleton" style={{ height: 260 }} />
        </div>
      </section>
    );
  }

  if (!order) {
    return (
      <section className="section">
        <div className="wrap">
          <div className="empty status-page">
            <h3>Order not found</h3>
            <Link className="btn-primary" href="/orders">Back to orders</Link>
          </div>
        </div>
      </section>
    );
  }

  const isBuyer = order.buyer_id === user.sub;
  const isSeller = order.seller_id === user.sub;
  const hasMilestones = milestones.length > 0;
  const title = order.title || gigTitle || "Order";
  const dueAt = order.paid_at ? new Date(new Date(order.paid_at).getTime() + (order.delivery_days ?? 1) * 86400000) : null;
  const late = Boolean(dueAt && now > dueAt.getTime() && !["delivered", "completed", "cancelled"].includes(order.status));
  const active = ["paid", "delivered", "revision"].includes(order.status);
  const stepIndex = order.status === "revision" ? 1 : STEPS.indexOf(order.status as (typeof STEPS)[number]);
  const released = milestones.filter((m) => m.status === "approved").reduce((s, m) => s + Number(m.amount), 0);

  const act = async (key: string, body: Record<string, unknown>, success: string) => {
    setBusy(key);
    const error = await postJson("/api/orders/action", { orderId: order.id, ...body });
    setBusy(null);
    if (error) {
      toast(error);
      return;
    }
    toast(success);
    setNote("");
    setDisputeOpen(false);
    await load();
  };

  const disputeAct = async (key: string, body: Record<string, unknown>, success?: string) => {
    if (!dispute) return;
    setBusy(key);
    const error = await postJson("/api/disputes", { disputeId: dispute.id, ...body });
    setBusy(null);
    if (error) {
      toast(error);
      return;
    }
    if (success) toast(success);
    setReply("");
    await load();
  };

  return (
    <section className="section">
      <div className="wrap od">
        <nav className="crumb">
          <Link href="/orders">Orders</Link>
          <span>/</span>
          <span>#{order.id.slice(0, 8)}</span>
        </nav>

        <div className="od-head">
          <div>
            <h1 className="req-title">
              {order.gig_id ? <Link href={`/gig/${order.gig_id}`}>{title}</Link> : title}
            </h1>
            <p className="gw-muted">
              {isBuyer ? "Seller" : "Buyer"}: <strong>{counterpart || "—"}</strong> · Placed {when(order.created_at)}
              {order.package_key ? ` · ${order.package_key} package` : ""}
            </p>
          </div>
          <div className="od-amount">
            <strong>${formatPrice(Number(order.amount))}</strong>
            <span className={`od-status s-${order.status}`}>{order.status}</span>
          </div>
        </div>

        {order.status !== "cancelled" && order.status !== "disputed" ? (
          <ol className="od-steps">
            {STEPS.map((step, i) => (
              <li key={step} className={i < stepIndex ? "done" : i === stepIndex ? "current" : ""}>
                <span className="od-dot">{i < stepIndex ? "✓" : i + 1}</span>
                <span>{STEP_LABEL[step]}</span>
              </li>
            ))}
          </ol>
        ) : null}

        <div className="req-layout">
          <div className="od-main">
            {late ? (
              <div className="od-alert warn">
                ⏰ This order is past its due date ({dueAt?.toLocaleDateString()}).
                {isBuyer ? " You can now cancel for a full refund, or keep waiting." : " Please deliver as soon as possible."}
              </div>
            ) : null}
            {order.status === "revision" && order.revision_note ? (
              <div className="od-alert">
                <strong>Revision requested:</strong> {order.revision_note}
              </div>
            ) : null}

            {hasMilestones ? (
              <div className="gw-card">
                <div className="gw-card-head">
                  <h3>Milestones</h3>
                  <span className="gw-muted">${formatPrice(released)} of ${formatPrice(Number(order.amount))} released</span>
                </div>
                <div className="gw-meter"><span style={{ width: `${(released / Number(order.amount || 1)) * 100}%` }} /></div>
                <ol className="od-ms">
                  {milestones.map((m, i) => {
                    const isNext = milestones.find((x) => x.status !== "approved")?.id === m.id;
                    return (
                      <li key={m.id} className={`od-ms-item ms-${m.status}`}>
                        <div className="od-ms-head">
                          <span className="od-dot">{m.status === "approved" ? "✓" : i + 1}</span>
                          <div>
                            <strong>{m.title}</strong>
                            <div className="gw-muted">${formatPrice(Number(m.amount))} · {m.days} days · {m.status}</div>
                          </div>
                        </div>
                        {m.delivery_note ? <p className="order-note">Delivery: {m.delivery_note}</p> : null}
                        {active && isSeller && isNext && m.status === "pending" ? (
                          <div className="od-actions">
                            <input className="gw-input" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Delivery note / link to files" />
                            <button className="btn-primary btn-sm" type="button" disabled={Boolean(busy)} onClick={() => void act("dm", { action: "deliver-milestone", milestoneId: m.id, note }, "Milestone delivered.")}>
                              Deliver milestone
                            </button>
                          </div>
                        ) : null}
                        {active && isBuyer && m.status === "delivered" ? (
                          <div className="od-actions">
                            <button className="btn-primary btn-sm" type="button" disabled={Boolean(busy)} onClick={() => void act("am", { action: "approve-milestone", milestoneId: m.id }, "Milestone approved and paid out.")}>
                              Approve &amp; release ${formatPrice(Number(m.amount))}
                            </button>
                            <input className="gw-input" value={note} onChange={(e) => setNote(e.target.value)} placeholder="What should change? (for revision)" />
                            <button className="btn-ghost btn-sm" type="button" disabled={Boolean(busy)} onClick={() => void act("rv", { action: "revision", note }, "Revision requested.")}>
                              Request revision
                            </button>
                          </div>
                        ) : null}
                      </li>
                    );
                  })}
                </ol>
              </div>
            ) : null}

            {!hasMilestones && active ? (
              <div className="gw-card">
                <h3>Next step</h3>
                {isSeller && (order.status === "paid" || order.status === "revision") ? (
                  <div className="od-actions col">
                    <textarea className="gw-input" rows={3} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Delivery message and link to your files" />
                    <button className="btn-primary" type="button" disabled={Boolean(busy)} onClick={() => void act("dl", { action: "deliver", note }, "Delivered!")}>
                      {busy === "dl" ? "Delivering…" : "Deliver work"}
                    </button>
                  </div>
                ) : null}
                {isBuyer && order.status === "delivered" ? (
                  <div className="od-actions col">
                    {order.delivery_note ? <p className="order-note">Seller says: {order.delivery_note}</p> : null}
                    <button className="btn-primary" type="button" disabled={Boolean(busy)} onClick={() => void act("ac", { action: "accept" }, "Order completed. Thank you!")}>
                      Accept delivery &amp; release payment
                    </button>
                    <textarea className="gw-input" rows={2} value={note} onChange={(e) => setNote(e.target.value)} placeholder="What should change? (required for a revision)" />
                    <button className="btn-ghost" type="button" disabled={Boolean(busy)} onClick={() => void act("rv", { action: "revision", note }, "Revision requested.")}>
                      Request revision
                    </button>
                  </div>
                ) : null}
                {(isBuyer && (order.status === "paid" || order.status === "revision")) || (isSeller && order.status === "delivered") ? (
                  <p className="gw-muted">Waiting for the {isBuyer ? "seller to deliver" : "buyer to review your delivery"}.</p>
                ) : null}
              </div>
            ) : null}

            {dispute ? (
              <div className="gw-card od-dispute">
                <div className="gw-card-head">
                  <h3>Resolution center</h3>
                  <span className={`gd-status ${dispute.status === "open" ? "paused" : "published"}`}>{dispute.status}</span>
                </div>
                <p className="gw-muted">
                  Opened {when(dispute.created_at)} by {dispute.opened_by === user.sub ? "you" : isBuyer ? "the seller" : "the buyer"} ·{" "}
                  {REASONS.find(([k]) => k === dispute.reason)?.[1] ?? dispute.reason}
                </p>
                <p className="od-dispute-details">{dispute.details}</p>
                {dispute.status === "resolved" && dispute.resolution ? (
                  <div className="od-alert ok">
                    <strong>Resolved:</strong> {dispute.resolution.replace(/_/g, " ")}
                    {dispute.refund_amount ? ` · refund $${formatPrice(Number(dispute.refund_amount))}` : ""}
                    {dispute.admin_note ? <p>{dispute.admin_note}</p> : null}
                  </div>
                ) : null}
                <ul className="od-thread">
                  {thread.map((m) => (
                    <li key={m.id} className={m.is_admin ? "admin" : m.sender_id === user.sub ? "mine" : ""}>
                      <strong>{m.is_admin ? "Hirelyx support" : m.sender_id === user.sub ? "You" : counterpart || "Other party"}</strong>
                      <p>{m.body}</p>
                      <small>{when(m.created_at)}</small>
                    </li>
                  ))}
                </ul>
                {dispute.status === "open" ? (
                  <div className="od-actions col">
                    <textarea className="gw-input" rows={2} value={reply} onChange={(e) => setReply(e.target.value)} placeholder="Add details or evidence links for the admin…" />
                    <div className="od-actions">
                      <button className="btn-primary btn-sm" type="button" disabled={Boolean(busy) || !reply.trim()} onClick={() => void disputeAct("reply", { action: "message", body: reply })}>
                        Send
                      </button>
                      {dispute.opened_by === user.sub ? (
                        <button className="btn-ghost btn-sm" type="button" disabled={Boolean(busy)} onClick={() => void disputeAct("wd", { action: "withdraw" }, "Dispute withdrawn.")}>
                          Withdraw dispute
                        </button>
                      ) : null}
                    </div>
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>

          <aside className="od-side">
            <div className="gw-card">
              <h3>Details</h3>
              <div className="req-fact"><span>Status</span><strong>{order.status}</strong></div>
              {order.paid_at ? <div className="req-fact"><span>Paid</span><strong>{when(order.paid_at)}</strong></div> : null}
              {dueAt ? <div className="req-fact"><span>Due</span><strong>{dueAt.toLocaleDateString()}</strong></div> : null}
              {order.delivered_at ? <div className="req-fact"><span>Delivered</span><strong>{when(order.delivered_at)}</strong></div> : null}
              {order.revision_count ? <div className="req-fact"><span>Revisions</span><strong>{order.revision_count}</strong></div> : null}
              {order.requirements ? (
                <div className="od-req">
                  <span className="gw-muted">Requirements</span>
                  <p>{order.requirements}</p>
                </div>
              ) : null}
            </div>

            {active && dispute?.status !== "open" ? (
              <div className="gw-card">
                <h3>Need help?</h3>
                {disputeOpen ? (
                  <div className="od-actions col">
                    <select className="gw-input" value={reason} onChange={(e) => setReason(e.target.value)}>
                      {REASONS.map(([k, label]) => <option key={k} value={k}>{label}</option>)}
                    </select>
                    <textarea className="gw-input" rows={4} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Explain what went wrong (min 20 characters). An admin will review both sides." />
                    <button className="btn-primary btn-sm" type="button" disabled={Boolean(busy)} onClick={() => void act("od", { action: "open-dispute", reason, note }, "Dispute opened. An admin will review it.")}>
                      Open dispute
                    </button>
                    <button className="btn-ghost btn-sm" type="button" onClick={() => setDisputeOpen(false)}>Cancel</button>
                  </div>
                ) : (
                  <>
                    <p className="gw-muted">Can&apos;t agree with the {isBuyer ? "seller" : "buyer"}? Our team will step in and decide fairly.</p>
                    <button className="btn-ghost btn-sm" type="button" onClick={() => setDisputeOpen(true)}>
                      Open a dispute
                    </button>
                  </>
                )}
                {(isSeller || (isBuyer && late)) ? (
                  <button
                    className="btn-ghost btn-sm danger"
                    type="button"
                    disabled={Boolean(busy)}
                    onClick={() => {
                      if (window.confirm(isSeller ? "Cancel and refund the buyer?" : "Cancel this late order for a refund?")) {
                        void act("cx", { action: "cancel" }, "Order cancelled and refunded.");
                      }
                    }}
                  >
                    {isSeller ? "Cancel & refund buyer" : "Cancel late order"}
                  </button>
                ) : null}
              </div>
            ) : null}
            {order.status === "pending" ? (
              <div className="gw-card">
                <p className="gw-muted">Payment not completed yet.</p>
                <button className="btn-ghost btn-sm danger" type="button" disabled={Boolean(busy)} onClick={() => void act("cx", { action: "cancel" }, "Order cancelled.")}>
                  Cancel order
                </button>
              </div>
            ) : null}
          </aside>
        </div>
      </div>
    </section>
  );
}
