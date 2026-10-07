"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { useUI } from "@/lib/ui";
import { useMarketplace } from "@/lib/marketplace";
import { CATEGORY_OPTIONS } from "@/lib/gigs";
import { getSupabase } from "@/lib/supabase";
import { uploadFile } from "@/lib/storage";
import SkillPicker from "@/components/SkillPicker";

interface PackageForm {
  name: string;
  description: string;
  price: string;
  delivery: string;
  revisions: string;
}

interface ExtraForm {
  label: string;
  price: string;
}

interface FaqForm {
  question: string;
  answer: string;
}

const EMPTY_PACKAGES: Record<"basic" | "standard" | "premium", PackageForm> = {
  basic: { name: "Basic", description: "", price: "", delivery: "", revisions: "1" },
  standard: { name: "Standard", description: "", price: "", delivery: "", revisions: "2" },
  premium: { name: "Premium", description: "", price: "", delivery: "", revisions: "5" },
};

const inputStyle = {
  padding: "10px 12px",
  borderRadius: 10,
  border: "1px solid var(--line)",
  background: "var(--card)",
  font: "inherit",
  width: "100%",
  boxSizing: "border-box" as const,
};

export default function PostProjectPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { openAuth, toast } = useUI();
  const { addGig } = useMarketplace();

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState(CATEGORY_OPTIONS[0]);
  const [skills, setSkills] = useState<string[]>([]);
  const [packages, setPackages] = useState(EMPTY_PACKAGES);
  const [extras, setExtras] = useState<ExtraForm[]>([
    { label: "Fast delivery (extra charge)", price: "" },
  ]);
  const [description, setDescription] = useState("");
  const [faq, setFaq] = useState<FaqForm[]>([{ question: "", answer: "" }]);
  const [requirements, setRequirements] = useState("");
  const [photoFiles, setPhotoFiles] = useState<(File | null)[]>([null, null, null]);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>(["", "", ""]);
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

  const setPackage = (key: keyof typeof packages, patch: Partial<PackageForm>) => {
    setPackages((cur) => ({ ...cur, [key]: { ...cur[key], ...patch } }));
  };

  const onPickPhoto = (index: number, file: File | null) => {
    setPhotoFiles((cur) => cur.map((f, i) => (i === index ? file : f)));
    setPhotoPreviews((cur) =>
      cur.map((p, i) => (i === index && file ? URL.createObjectURL(file) : p)),
    );
  };

  const submit = async () => {
    if (title.trim().length < 8) {
      toast("Title must be at least 8 characters.");
      return;
    }
    if (!Number(packages.basic.price)) {
      toast("Basic package needs a price.");
      return;
    }
    setSubmitting(true);
    try {
      const urls: string[] = [];
      for (const file of photoFiles) {
        if (!file) continue;
        const url = await uploadFile("gig-media", user.sub ?? "", file);
        if (url) urls.push(url);
      }
      const gig = await addGig({
        title: title.trim(),
        description: description.trim(),
        category,
        skills,
        price: Number(packages.basic.price),
        deliveryDays: Math.max(1, Number(packages.basic.delivery) || 1),
        seller: user.name ?? "Seller",
        video: video.trim() || undefined,
        videoName: videoName.trim() || undefined,
        images: urls,
      });
      if (!gig) {
        toast("Could not publish gig.");
        setSubmitting(false);
        return;
      }
      const supabase = getSupabase();
      if (supabase) {
        await supabase
          .from("gigs")
          .update({
            packages: {
              basic: { ...packages.basic, price: Number(packages.basic.price) || 0, delivery: Number(packages.basic.delivery) || 1, revisions: Number(packages.basic.revisions) || 1 },
              standard: { ...packages.standard, price: Number(packages.standard.price) || 0, delivery: Number(packages.standard.delivery) || 3, revisions: Number(packages.standard.revisions) || 2 },
              premium: { ...packages.premium, price: Number(packages.premium.price) || 0, delivery: Number(packages.premium.delivery) || 7, revisions: Number(packages.premium.revisions) || 5 },
            },
            extras: extras.filter((e) => e.label.trim() && Number(e.price) > 0).map((e) => ({ label: e.label.trim(), price: Number(e.price) })),
            faq: faq.filter((f) => f.question.trim()).map((f) => ({ question: f.question.trim(), answer: f.answer.trim() })),
            requirements: requirements.trim() || null,
          })
          .eq("id", gig.id);
      }
      toast("Gig published!");
      router.push(`/gig/${gig.id}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="section">
      <div className="wrap" style={{ maxWidth: 860 }}>
        <div className="section-head">
          <div>
            <div className="kicker">Post a project</div>
            <h2>Create your gig</h2>
            <p className="sub">Fiverr-style listing — title, packages, extras, photos, publish.</p>
          </div>
        </div>

        <div className="order-row">
          <h3>Overview</h3>
          <label style={{ display: "grid", gap: 6, marginBottom: 14 }}>
            <strong>Title (start with &quot;I will...&quot;)</strong>
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="I will build a modern portfolio website" style={inputStyle} />
          </label>
          <label style={{ display: "grid", gap: 6, marginBottom: 14 }}>
            <strong>Category</strong>
            <select value={category} onChange={(e) => setCategory(e.target.value)} style={inputStyle}>
              {CATEGORY_OPTIONS.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </label>
          <div style={{ display: "grid", gap: 6, marginBottom: 14 }}>
            <strong>Tags / Skills</strong>
            <SkillPicker value={skills} onChange={setSkills} placeholder="Add skills" />
          </div>

          <h3>Pricing (3 packages)</h3>
          {(["basic", "standard", "premium"] as const).map((key) => (
            <div key={key} style={{ border: "1px solid var(--line)", borderRadius: 12, padding: 14, marginBottom: 12 }}>
              <strong style={{ textTransform: "capitalize" }}>{key} package</strong>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 10, marginTop: 8 }}>
                <input value={packages[key].name} onChange={(e) => setPackage(key, { name: e.target.value })} placeholder="Name" style={inputStyle} />
                <input value={packages[key].price} onChange={(e) => setPackage(key, { price: e.target.value })} placeholder="Price ($)" type="number" style={inputStyle} />
                <input value={packages[key].delivery} onChange={(e) => setPackage(key, { delivery: e.target.value })} placeholder="Days" type="number" style={inputStyle} />
                <input value={packages[key].revisions} onChange={(e) => setPackage(key, { revisions: e.target.value })} placeholder="Revisions" type="number" style={inputStyle} />
              </div>
              <textarea rows={2} value={packages[key].description} onChange={(e) => setPackage(key, { description: e.target.value })} placeholder="What this package includes" style={{ ...inputStyle, marginTop: 8, resize: "vertical" }} />
            </div>
          ))}

          <h3>Extras (optional add-ons)</h3>
          {extras.map((extra, i) => (
            <div key={i} style={{ display: "grid", gridTemplateColumns: "2fr 1fr auto", gap: 10, marginBottom: 8 }}>
              <input value={extra.label} onChange={(e) => setExtras((cur) => cur.map((x, idx) => (idx === i ? { ...x, label: e.target.value } : x)))} placeholder='e.g. "Extra fast delivery"' style={inputStyle} />
              <input value={extra.price} onChange={(e) => setExtras((cur) => cur.map((x, idx) => (idx === i ? { ...x, price: e.target.value } : x)))} placeholder="+ $ charge" type="number" style={inputStyle} />
              <button className="btn-ghost" type="button" onClick={() => setExtras((cur) => cur.filter((_, idx) => idx !== i))}>Remove</button>
            </div>
          ))}
          <button className="btn-ghost" type="button" onClick={() => setExtras((cur) => [...cur, { label: "", price: "" }])} style={{ marginBottom: 14 }}>+ Add extra</button>

          <h3>Description & FAQ</h3>
          <label style={{ display: "grid", gap: 6, marginBottom: 14 }}>
            <strong>Description</strong>
            <textarea rows={5} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What is included, your process, what you need from the buyer..." style={{ ...inputStyle, resize: "vertical" }} />
          </label>
          {faq.map((item, i) => (
            <div key={i} style={{ display: "grid", gap: 8, marginBottom: 10 }}>
              <input value={item.question} onChange={(e) => setFaq((cur) => cur.map((f, idx) => (idx === i ? { ...f, question: e.target.value } : f)))} placeholder="Question" style={inputStyle} />
              <input value={item.answer} onChange={(e) => setFaq((cur) => cur.map((f, idx) => (idx === i ? { ...f, answer: e.target.value } : f)))} placeholder="Answer" style={inputStyle} />
            </div>
          ))}
          <button className="btn-ghost" type="button" onClick={() => setFaq((cur) => [...cur, { question: "", answer: "" }])} style={{ marginBottom: 14 }}>+ Add FAQ</button>

          <h3>Requirements from buyer</h3>
          <textarea rows={3} value={requirements} onChange={(e) => setRequirements(e.target.value)} placeholder="Details the buyer must provide before you start" style={{ ...inputStyle, marginBottom: 14, resize: "vertical" }} />

          <h3>Gallery</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 14 }}>
            {photoFiles.map((file, i) => (
              <label key={i} style={{ border: "1px dashed var(--line)", borderRadius: 12, padding: 12, textAlign: "center", cursor: "pointer", display: "block" }}>
                {photoPreviews[i] ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={photoPreviews[i]} alt={`Photo ${i + 1} preview`} style={{ width: "100%", aspectRatio: "4 / 3", objectFit: "cover", borderRadius: 8 }} />
                ) : (
                  <span style={{ color: "var(--muted)" }}>{file ? file.name : `Choose photo ${i + 1}`}</span>
                )}
                <input type="file" accept="image/*" hidden onChange={(e) => onPickPhoto(i, e.target.files?.[0] ?? null)} />
              </label>
            ))}
          </div>
          <label style={{ display: "grid", gap: 6, marginBottom: 14 }}>
            <strong>Video URL</strong>
            <input value={video} onChange={(e) => setVideo(e.target.value)} placeholder="https://... or YouTube link" style={inputStyle} />
          </label>
          <label style={{ display: "grid", gap: 6, marginBottom: 14 }}>
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
