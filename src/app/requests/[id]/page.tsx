"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useAuth, useRequireAuth } from "@/lib/auth";
import { useUI } from "@/lib/ui";
import { useMessaging } from "@/lib/messaging";
import { useCurrency } from "@/lib/currency";
import { startCheckoutFor } from "@/lib/checkout";
import { fetchJob, fetchProposals, jobAction, timeAgo } from "@/lib/jobs";
import type { JobPost, Proposal } from "@/lib/jobs";
import { fetchSellerStats, LevelBadge } from "@/lib/seller-levels";
import type { SellerStats } from "@/lib/seller-levels";
import { initials } from "@/lib/format";

export default function RequestDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id ?? "";
  const { user } = useAuth();
  const requireAuth = useRequireAuth();
  const { toast, openMessages } = useUI();
  const { setActiveId, refresh: refreshChats } = useMessaging();
  const { format, converted } = useCurrency();
  const [job, setJob] = useState<JobPost | null>(null);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [stats, setStats] = useState<Record<string, SellerStats>>({});
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);

  const [cover, setCover] = useState("");
  const [amount, setAmount] = useState("");
  const [days, setDays] = useState("");

  const uid = user?.sub;
  const load = useCallback(async () => {
    const found = await fetchJob(id);
    setJob(found);
    if (found && uid) {
      const list = await fetchProposals(found.id);
      setProposals(list);
      if (found.buyerId === uid && list.length) {
        setStats(await fetchSellerStats(list.map((p) => p.sellerId)));
      }
    }
    setLoading(false);
  }, [id, uid]);

  useEffect(() => {
    const timer = setTimeout(() => void load(), 0);
    return () => clearTimeout(timer);
  }, [load]);

  if (loading) {
    return (
      <section className="section">
        <div className="wrap">
          <div className="skeleton skeleton-title" />
          <div className="skeleton" style={{ height: 220 }} />
        </div>
      </section>
    );
  }

  if (!job) {
    return (
      <section className="section">
        <div className="wrap">
          <div className="empty status-page">
            <h3>Request not found</h3>
            <p>It may have been closed or removed.</p>
            <Link className="btn-primary" href="/requests">Browse requests</Link>
          </div>
        </div>
      </section>
    );
  }

  const isOwner = user?.sub === job.buyerId;
  const mine = proposals.find((p) => p.sellerId === user?.sub);

  const run = async (key: string, body: Record<string, unknown>, success?: string) => {
    setBusy(key);
    const { error } = await jobAction(body);
    setBusy(null);
    if (error) {
      toast(error);
      return false;
    }
    if (success) toast(success);
    await load();
    return true;
  };

  const hire = async (proposal: Proposal) => {
    setBusy(`hire-${proposal.id}`);
    const result = await startCheckoutFor({ proposalId: proposal.id });
    setBusy(null);
    if (result.error) {
      toast(result.error);
      return;
    }
    if (result.url) window.location.assign(result.url);
  };

  const message = async (proposal: Proposal) => {
    setBusy(`msg-${proposal.id}`);
    const { data, error } = await jobAction<{ conversationId: string }>({ action: "message", proposalId: proposal.id });
    setBusy(null);
    if (error || !data) {
      toast(error ?? "Could not open chat.");
      return;
    }
    await refreshChats();
    setActiveId(data.conversationId);
    openMessages();
  };

  const budget =
    job.budgetMin != null && job.budgetMax != null
      ? job.budgetMin === job.budgetMax
        ? format(job.budgetMin)
        : `${format(job.budgetMin)} – ${format(job.budgetMax)}`
      : "Open budget";

  return (
    <section className="section">
      <div className="wrap">
        <nav className="crumb">
          <Link href="/requests">Requests</Link>
          <span>/</span>
          <span>{job.category ?? "General"}</span>
        </nav>

        <div className="req-layout">
          <div className="gw-card">
            <div className="req-card-top">
              <span className="gig-eyebrow">{job.category ?? "General"}</span>
              <span className={`gd-status ${job.status === "open" ? "published" : "draft"}`}>{job.status}</span>
            </div>
            <h1 className="req-title">{job.title}</h1>
            <p className="gw-muted">Posted {timeAgo(job.createdAt)} · {job.proposalsCount} proposal{job.proposalsCount === 1 ? "" : "s"}</p>
            <p className="req-desc">{job.description}</p>
            {job.skills.length ? (
              <div className="chips">
                {job.skills.map((s) => <span key={s} className="chip">{s}</span>)}
              </div>
            ) : null}
            {isOwner && job.status === "open" ? (
              <div>
                <button
                  className="btn-ghost btn-sm danger"
                  type="button"
                  disabled={busy === "close"}
                  onClick={() => {
                    if (window.confirm("Close this request? Sellers won't be able to send proposals.")) {
                      void run("close", { action: "close", jobId: job.id }, "Request closed.");
                    }
                  }}
                >
                  Close request
                </button>
              </div>
            ) : null}
          </div>

          <aside className="gw-card req-side">
            <div className="req-fact"><span>Budget</span><strong>{budget}</strong></div>
            <div className="req-fact"><span>Needed within</span><strong>{job.deliveryDays ? `${job.deliveryDays} days` : "Flexible"}</strong></div>
            {converted ? <p className="gw-muted">Budgets are set in USD.</p> : null}
          </aside>
        </div>

        {isOwner ? (
          <div className="req-proposals">
            <h2>Proposals ({proposals.length})</h2>
            {proposals.length === 0 ? (
              <p className="gw-muted">No proposals yet. Sellers usually reply within a day.</p>
            ) : (
              <ul className="admin-list">
                {proposals.map((p) => {
                  const s = stats[p.sellerId];
                  return (
                    <li key={p.id} className={`prop-card status-${p.status}`}>
                      <div className="prop-head">
                        <span className="avatar" aria-hidden="true">{initials(p.sellerName ?? "F")}</span>
                        <div>
                          <Link href={`/user/${p.sellerId}`} className="admin-row-title">{p.sellerName}</Link>
                          <div className="order-meta">
                            {s ? <LevelBadge level={s.level} compact /> : null}
                            {p.sellerTitle ? <span>{p.sellerTitle}</span> : null}
                            {s?.reviews ? <span>★ {s.rating.toFixed(1)} ({s.reviews})</span> : null}
                            {s?.completed ? <span>{s.completed} orders</span> : null}
                          </div>
                        </div>
                        <div className="prop-price">
                          <strong>{format(p.amount)}</strong>
                          <span>{p.deliveryDays} days</span>
                        </div>
                      </div>
                      <p className="prop-letter">{p.coverLetter}</p>
                      <div className="prop-actions">
                        {p.status !== "pending" ? <span className={`gd-status ${p.status === "declined" ? "draft" : "published"}`}>{p.status}</span> : null}
                        {job.status === "open" && p.status !== "declined" ? (
                          <button className="btn-primary btn-sm" type="button" disabled={Boolean(busy)} onClick={() => void hire(p)}>
                            {busy === `hire-${p.id}` ? "Opening checkout…" : `Hire · ${format(p.amount)}`}
                          </button>
                        ) : null}
                        <button className="btn-ghost btn-sm" type="button" disabled={Boolean(busy)} onClick={() => void message(p)}>
                          Message
                        </button>
                        {job.status === "open" && p.status === "pending" ? (
                          <button className="btn-ghost btn-sm" type="button" disabled={Boolean(busy)} onClick={() => void run(`sl-${p.id}`, { action: "shortlist", proposalId: p.id }, "Shortlisted.")}>
                            Shortlist
                          </button>
                        ) : null}
                        {job.status === "open" && (p.status === "pending" || p.status === "shortlisted") ? (
                          <button className="btn-ghost btn-sm danger" type="button" disabled={Boolean(busy)} onClick={() => void run(`dc-${p.id}`, { action: "decline", proposalId: p.id })}>
                            Decline
                          </button>
                        ) : null}
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        ) : mine ? (
          <div className="gw-card req-proposals">
            <h2>Your proposal</h2>
            <div className="order-meta">
              <span className={`gd-status ${mine.status === "declined" ? "draft" : "published"}`}>{mine.status}</span>
              <span>{format(mine.amount)}</span>
              <span>{mine.deliveryDays} days</span>
              <span>Sent {timeAgo(mine.createdAt)}</span>
            </div>
            <p className="prop-letter">{mine.coverLetter}</p>
            {mine.status !== "hired" ? (
              <div>
                <button className="btn-ghost btn-sm danger" type="button" disabled={busy === "withdraw"} onClick={() => void run("withdraw", { action: "withdraw", proposalId: mine.id }, "Proposal withdrawn.")}>
                  Withdraw proposal
                </button>
              </div>
            ) : null}
          </div>
        ) : job.status === "open" ? (
          <div className="gw-card req-proposals">
            <h2>Send a proposal</h2>
            <p className="gw-muted">Explain how you&apos;d do it, your price and how long it takes.</p>
            <div className="gw-field">
              <div className="gw-field-head">
                <strong>Cover letter</strong>
                <span className="gw-muted">{cover.trim().length}/3000 · min 30</span>
              </div>
              <textarea className="gw-input" rows={6} value={cover} maxLength={3000} onChange={(e) => setCover(e.target.value)} placeholder="Relevant experience, your approach, questions for the buyer…" />
            </div>
            <div className="offer-grid">
              <label className="gw-field">
                <strong>Your price (USD)</strong>
                <input className="gw-input" type="number" min={5} value={amount} onChange={(e) => setAmount(e.target.value)} />
              </label>
              <label className="gw-field">
                <strong>Delivery (days)</strong>
                <input className="gw-input" type="number" min={1} value={days} onChange={(e) => setDays(e.target.value)} />
              </label>
            </div>
            <div>
              <button
                className="btn-primary"
                type="button"
                disabled={busy === "propose"}
                onClick={() =>
                  requireAuth(() =>
                    void run(
                      "propose",
                      { action: "propose", jobId: job.id, coverLetter: cover, amount: Number(amount), deliveryDays: Number(days) },
                      "Proposal sent!",
                    ),
                  )
                }
              >
                {busy === "propose" ? "Sending…" : "Send proposal"}
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
