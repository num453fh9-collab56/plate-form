"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth, useRequireAuth } from "@/lib/auth";
import { useCurrency } from "@/lib/currency";
import { CATEGORY_OPTIONS } from "@/lib/gigs";
import { fetchMyJobs, fetchOpenJobs, timeAgo } from "@/lib/jobs";
import type { JobPost } from "@/lib/jobs";
import { useRouter } from "next/navigation";

export default function RequestsPage() {
  const { user } = useAuth();
  const requireAuth = useRequireAuth();
  const router = useRouter();
  const { format } = useCurrency();
  const [tab, setTab] = useState<"browse" | "mine">("browse");
  const [category, setCategory] = useState("All");
  const [query, setQuery] = useState("");
  const [jobs, setJobs] = useState<JobPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const timer = setTimeout(() => {
      setLoading(true);
      const request =
        tab === "mine" && user?.sub ? fetchMyJobs(user.sub) : fetchOpenJobs({ category, q: query });
      void request.then((list) => {
        if (cancelled) return;
        setJobs(list);
        setLoading(false);
      });
    }, query ? 300 : 0);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [tab, category, query, user?.sub]);

  return (
    <section className="section">
      <div className="wrap">
        <div className="section-head">
          <div>
            <div className="kicker">Buyer requests</div>
            <h2>Find work, or tell sellers what you need</h2>
            <p className="sub">Buyers post a brief and budget. Sellers send proposals. You hire the best fit.</p>
          </div>
          <button className="btn-post" type="button" onClick={() => requireAuth(() => router.push("/requests/new"))}>
            + Post a request
          </button>
        </div>

        <div className="gd-filter" role="tablist">
          <button type="button" role="tab" aria-selected={tab === "browse"} className={tab === "browse" ? "active" : ""} onClick={() => setTab("browse")}>
            Open requests
          </button>
          {user ? (
            <button type="button" role="tab" aria-selected={tab === "mine"} className={tab === "mine" ? "active" : ""} onClick={() => setTab("mine")}>
              My requests
            </button>
          ) : null}
        </div>

        {tab === "browse" ? (
          <div className="req-filters">
            <input className="gw-input" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search requests…" />
            <select className="gw-input" value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="All">All categories</option>
              {CATEGORY_OPTIONS.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        ) : null}

        {loading ? (
          <div className="req-list">
            {[0, 1, 2].map((i) => (
              <div key={i} className="skeleton" style={{ height: 140 }} />
            ))}
          </div>
        ) : jobs.length === 0 ? (
          <div className="empty">
            <h3>{tab === "mine" ? "You haven't posted any requests" : "No open requests right now"}</h3>
            <p>{tab === "mine" ? "Describe what you need and let sellers come to you." : "Check back soon, or post your own."}</p>
          </div>
        ) : (
          <ul className="req-list">
            {jobs.map((job) => (
              <li key={job.id}>
                <Link href={`/requests/${job.id}`} className="req-card">
                  <div className="req-card-top">
                    <span className="gig-eyebrow">{job.category ?? "General"}</span>
                    {job.status !== "open" ? <span className={`gd-status ${job.status === "hired" ? "published" : "draft"}`}>{job.status}</span> : null}
                  </div>
                  <h3>{job.title}</h3>
                  <p>{job.description.slice(0, 220)}{job.description.length > 220 ? "…" : ""}</p>
                  {job.skills.length ? (
                    <div className="chips">
                      {job.skills.slice(0, 5).map((s) => <span key={s} className="chip">{s}</span>)}
                    </div>
                  ) : null}
                  <div className="req-card-foot">
                    <strong>
                      {job.budgetMin != null && job.budgetMax != null
                        ? job.budgetMin === job.budgetMax
                          ? format(job.budgetMin)
                          : `${format(job.budgetMin)} – ${format(job.budgetMax)}`
                        : "Open budget"}
                    </strong>
                    {job.deliveryDays ? <span>{job.deliveryDays} days</span> : null}
                    <span>{job.proposalsCount} proposal{job.proposalsCount === 1 ? "" : "s"}</span>
                    <span>{timeAgo(job.createdAt)}</span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
