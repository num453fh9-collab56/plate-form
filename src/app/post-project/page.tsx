"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { useUI } from "@/lib/ui";
import { useMarketplace } from "@/lib/marketplace";
import { CATEGORY_OPTIONS } from "@/lib/gigs";
import { getSupabase } from "@/lib/supabase";
import SkillPicker from "@/components/SkillPicker";

const EMPTY_PACKAGE = { price: "", delivery: "", note: "" };

export default function PostProjectPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { openAuth, toast } = useUI();
  const { addGig } = useMarketplace();

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState(CATEGORY_OPTIONS[0]);
  const [skills, setSkills] = useState<string[]>([]);
  const [description, setDescription] = useState("");
  const [basic, setBasic] = useState({ ...EMPTY_PACKAGE, note: "Core delivery" });
  const [standard, setStandard] = useState({ ...EMPTY_PACKAGE, note: "More polish + faster" });
  const [premium, setPremium] = useState({ ...EMPTY_PACKAGE, note: "Everything + priority" });
  const [images, setImages] = useState(["", "", ""]);
  const [video, setVideo] = useState("");
  const [videoName, setVideoName] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!user) {
    return (
      <section className="section">
        <div className="wrap">
          <div className="empty">
            <h3>Sign in to post a project</h3>
            <button className="btn-primary" type="button" onClick={() => openAuth("login")}>
              Sign in
            </button>
          </div>
        </div>
      </section>
    );
  }

  const submit = async () => {
    if (title.trim().length < 8) {
      toast("Title must be at least 8 characters.");
      return;
    }
    const price = Number(basic.price);
    if (!price || price <= 0) {
      toast("Basic package needs a valid price.");
      return;
    }
    setSubmitting(true);
    const gig = await addGig({
      title: title.trim(),
      description: description.trim(),
      category,
      skills,
      price,
      deliveryDays: Math.max(1, Number(basic.delivery) || 1),
      seller: user.name ?? "Seller",
      video: video.trim() || undefined,
      videoName: videoName.trim() || undefined,
      images: images.map((u) => u.trim()).filter(Boolean),
    });
    if (!gig) {
      setSubmitting(false);
      toast("Could not publish gig.");
      return;
    }
    const supabase = getSupabase();
    if (supabase) {
      await supabase
        .from("gigs")
        .update({
          packages: {
            basic: { ...basic, price: Number(basic.price) || 0, delivery: Number(basic.delivery) || 1 },
            standard: { ...standard, price: Number(standard.price) || 0, delivery: Number(standard.delivery) || 3 },
            premium: { ...premium, price: Number(premium.price) || 0, delivery: Number(premium.delivery) || 7 },
          },
        })
        .eq("id", gig.id);
    }
    setSubmitting(false);
    toast("Gig published!");
    router.push(`/gig/${gig.id}`);
  };

  const fieldStyle = {
    display: "grid",
    gap: 6,
    marginBottom: 14,
  } as const;

  const inputStyle = {
    padding: "10px 12px",
    borderRadius: 10,
    border: "1px solid var(--line)",
    background: "var(--card)",
    font: "inherit",
  } as const;

  return (
    <section className="section">
      <div className="wrap" style={{ maxWidth: 860 }}>
        <div className="section-head">
          <div>
            <div className="kicker">Post a project</div>
            <h2>Create your gig</h2>
            <p className="sub">Fiverr-style listing — clear title, photos, packages, delivery.</p>
          </div>
        </div>

        <div className="order-row">
          <label style={fieldStyle}>
            <strong>Gig title</strong>
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="I will build a modern portfolio website" style={inputStyle} />
          </label>

          <label style={fieldStyle}>
            <strong>Category</strong>
            <select value={category} onChange={(e) => setCategory(e.target.value)} style={inputStyle}>
              {CATEGORY_OPTIONS.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </label>

          <div style={fieldStyle}>
            <strong>Skills</strong>
            <SkillPicker value={skills} onChange={setSkills} placeholder="Add skills" />
          </div>

          <label style={fieldStyle}>
            <strong>Description</strong>
            <textarea rows={5} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What is included, your process, what you need from the buyer..." style={{ ...inputStyle, resize: "vertical" }} />
          </label>

          <strong style={{ display: "block", marginBottom: 8 }}>Packages</strong>
          {([
            ["Basic", basic, setBasic],
            ["Standard", standard, setStandard],
            ["Premium", premium, setPremium],
          ] as const).map(([label, pkg, setPkg]) => (
            <div key={label} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 10 }}>
              <input value={pkg.price} onChange={(e) => setPkg({ ...pkg, price: e.target.value })} placeholder={`${label} price ($)`} type="number" style={inputStyle} />
              <input value={pkg.delivery} onChange={(e) => setPkg({ ...pkg, delivery: e.target.value })} placeholder={`${label} delivery (days)`} type="number" style={inputStyle} />
              <input value={pkg.note} onChange={(e) => setPkg({ ...pkg, note: e.target.value })} placeholder={`${label} includes`} style={inputStyle} />
            </div>
          ))}

          <strong style={{ display: "block", marginBottom: 8 }}>Photos (up to 3)</strong>
          {images.map((url, i) => (
            <input
              key={i}
              value={url}
              onChange={(e) => setImages((cur) => cur.map((u, idx) => (idx === i ? e.target.value : u)))}
              placeholder={`Photo ${i + 1} URL (https://...)`}
              style={{ ...inputStyle, marginBottom: 8, width: "100%", boxSizing: "border-box" }}
            />
          ))}

          <label style={fieldStyle}>
            <strong>Showcase video URL (optional)</strong>
            <input value={video} onChange={(e) => setVideo(e.target.value)} placeholder="https://... or YouTube link" style={inputStyle} />
          </label>
          <label style={fieldStyle}>
            <strong>Video name</strong>
            <input value={videoName} onChange={(e) => setVideoName(e.target.value)} placeholder="Intro video" style={inputStyle} />
          </label>

          <button className="btn-primary" type="button" disabled={submitting} onClick={submit}>
            {submitting ? "Publishing..." : "Publish gig"}
          </button>
        </div>
      </div>
    </section>
  );
}
