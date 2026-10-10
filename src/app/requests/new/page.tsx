"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { useUI } from "@/lib/ui";
import { CATEGORY_OPTIONS } from "@/lib/gigs";
import { jobAction } from "@/lib/jobs";
import SkillPicker from "@/components/SkillPicker";

export default function NewRequestPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { openAuth, toast } = useUI();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState(CATEGORY_OPTIONS[0]);
  const [skills, setSkills] = useState<string[]>([]);
  const [budgetMin, setBudgetMin] = useState("");
  const [budgetMax, setBudgetMax] = useState("");
  const [days, setDays] = useState("7");
  const [busy, setBusy] = useState(false);

  if (!user) {
    return (
      <section className="section">
        <div className="wrap">
          <div className="empty">
            <h3>Sign in to post a request</h3>
            <button className="btn-primary" type="button" onClick={() => openAuth("login")}>Sign in</button>
          </div>
        </div>
      </section>
    );
  }

  const submit = async () => {
    setBusy(true);
    const { data, error } = await jobAction<{ jobId: string }>({
      action: "create",
      title,
      description,
      category,
      skills,
      budgetMin: Number(budgetMin),
      budgetMax: Number(budgetMax || budgetMin),
      deliveryDays: Number(days),
    });
    setBusy(false);
    if (error || !data) {
      toast(error ?? "Could not post the request.");
      return;
    }
    toast("Request posted! Sellers can now send proposals.");
    router.push(`/requests/${data.jobId}`);
  };

  return (
    <section className="section">
      <div className="wrap" style={{ maxWidth: 760 }}>
        <div className="section-head">
          <div>
            <div className="kicker">Buyer request</div>
            <h2>What do you need done?</h2>
            <p className="sub">Clear briefs get better proposals. Sellers will reply with a price and timeline.</p>
          </div>
        </div>

        <div className="gw-card">
          <div className="gw-field">
            <div className="gw-field-head">
              <strong>Title</strong>
              <span className="gw-muted">{title.length}/120</span>
            </div>
            <input className="gw-input" value={title} maxLength={120} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Need a Shopify store for my clothing brand" />
          </div>
          <div className="gw-field">
            <div className="gw-field-head">
              <strong>Describe the work</strong>
              <span className="gw-muted">{description.trim().length}/4000 · min 50</span>
            </div>
            <textarea className="gw-input" rows={7} value={description} maxLength={4000} onChange={(e) => setDescription(e.target.value)} placeholder={"Goals, deliverables, examples you like, files you'll provide…"} />
          </div>
          <div className="offer-grid">
            <label className="gw-field">
              <strong>Category</strong>
              <select
                className="gw-input"
                value={category}
                onChange={(e) => {
                  setCategory(e.target.value);
                  setSkills([]);
                }}
              >
                {CATEGORY_OPTIONS.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </label>
            <label className="gw-field">
              <strong>Needed within</strong>
              <select className="gw-input" value={days} onChange={(e) => setDays(e.target.value)}>
                {[1, 3, 7, 14, 30, 60].map((d) => <option key={d} value={d}>{d} day{d === 1 ? "" : "s"}</option>)}
              </select>
            </label>
          </div>
          <div className="gw-field">
            <strong>Skills needed</strong>
            <SkillPicker value={skills} onChange={setSkills} category={category} max={10} placeholder="Search skills" />
          </div>
          <div className="offer-grid">
            <label className="gw-field">
              <strong>Budget from (USD)</strong>
              <input className="gw-input" type="number" min={5} value={budgetMin} onChange={(e) => setBudgetMin(e.target.value)} />
            </label>
            <label className="gw-field">
              <strong>Budget up to (USD)</strong>
              <input className="gw-input" type="number" min={5} value={budgetMax} onChange={(e) => setBudgetMax(e.target.value)} placeholder="Same as from" />
            </label>
          </div>
          <div className="gw-nav">
            <button className="btn-ghost" type="button" onClick={() => router.back()}>Cancel</button>
            <button className="btn-primary" type="button" disabled={busy} onClick={() => void submit()}>
              {busy ? "Posting…" : "Post request"}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
