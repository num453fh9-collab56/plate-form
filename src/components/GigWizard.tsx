"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { useUI } from "@/lib/ui";
import { useMarketplace } from "@/lib/marketplace";
import { CATEGORY_OPTIONS } from "@/lib/gigs";
import { categoryColors, glyphForCategory, isAllowedSkill, skillsForCategory } from "@/lib/taxonomy";
import { fetchGigById } from "@/lib/api";
import { uploadFile } from "@/lib/storage";
import { formatPrice } from "@/lib/format";
import { PACKAGE_KEYS } from "@/lib/gig-model";
import type { Gig, GigDraft, GigStatus, PackageKey, RequirementQuestion } from "@/lib/types";
import SkillPicker from "@/components/SkillPicker";

/* ==========================================================================
   HIRELYX · GIG WIZARD
   Six-step gig builder used for both new gigs and `?edit=<id>`. New gigs are
   autosaved to localStorage so a refresh never loses work; media uploads run
   in parallel and the whole gig is written in a single insert/update.
   ========================================================================== */

const STEPS = ["Overview", "Pricing", "Description", "Requirements", "Gallery", "Publish"] as const;
type StepIndex = 0 | 1 | 2 | 3 | 4 | 5;

const MAX_IMAGES = 6;
const MAX_IMAGE_MB = 5;
const MAX_VIDEO_MB = 50;
const MAX_TAGS = 5;
const TITLE_MAX = 80;
const DESC_MIN = 120;
const DESC_MAX = 1200;
const DRAFT_KEY = "wv_gig_draft";

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
  days: string;
}

interface FaqForm {
  question: string;
  answer: string;
}

/** A gallery slot: an already-hosted URL, or a local file waiting to upload. */
interface MediaItem {
  id: string;
  url: string;
  file?: File;
}

interface FormState {
  title: string;
  category: string;
  skills: string[];
  tags: string[];
  threePackages: boolean;
  packages: Record<PackageKey, PackageForm>;
  /** Shared feature rows; `included[key]` marks which tiers include each. */
  features: { label: string; included: Record<PackageKey, boolean> }[];
  extras: ExtraForm[];
  description: string;
  faq: FaqForm[];
  requirements: string;
  questions: RequirementQuestion[];
  videoUrl: string;
  videoName: string;
}

const EMPTY_FORM: FormState = {
  title: "",
  category: CATEGORY_OPTIONS[0],
  skills: [],
  tags: [],
  threePackages: true,
  packages: {
    basic: { name: "Basic", description: "", price: "", delivery: "3", revisions: "1" },
    standard: { name: "Standard", description: "", price: "", delivery: "5", revisions: "2" },
    premium: { name: "Premium", description: "", price: "", delivery: "7", revisions: "5" },
  },
  features: [
    { label: "Source files", included: { basic: false, standard: true, premium: true } },
    { label: "Commercial use", included: { basic: true, standard: true, premium: true } },
  ],
  extras: [{ label: "Extra-fast delivery", price: "", days: "-1" }],
  description: "",
  faq: [{ question: "", answer: "" }],
  requirements: "",
  questions: [{ question: "Please share a short brief of your project.", type: "text", required: true }],
  videoUrl: "",
  videoName: "",
};

const uid = () => Math.random().toString(36).slice(2, 10);

function formFromGig(gig: Gig): FormState {
  const pkgs = { ...EMPTY_FORM.packages };
  const featureLabels: string[] = [];
  for (const key of PACKAGE_KEYS) {
    const pkg = gig.packages?.[key];
    if (!pkg) continue;
    pkgs[key] = {
      name: pkg.name || EMPTY_FORM.packages[key].name,
      description: pkg.description || pkg.note || "",
      price: pkg.price ? String(pkg.price) : "",
      delivery: String(pkg.delivery || ""),
      revisions: String(pkg.revisions ?? ""),
    };
    for (const f of pkg.features ?? []) if (!featureLabels.includes(f)) featureLabels.push(f);
  }
  const hasTiers = Boolean(Number(gig.packages?.standard?.price) || Number(gig.packages?.premium?.price));
  if (!gig.packages) {
    pkgs.basic = { ...pkgs.basic, price: String(gig.price || ""), delivery: String(parseInt(gig.delivery, 10) || 1) };
  }
  return {
    title: gig.title,
    category: gig.category,
    skills: gig.skills,
    tags: gig.tags ?? [],
    threePackages: hasTiers,
    packages: pkgs,
    features: featureLabels.map((label) => ({
      label,
      included: Object.fromEntries(
        PACKAGE_KEYS.map((key) => [key, Boolean(gig.packages?.[key]?.features?.includes(label))]),
      ) as Record<PackageKey, boolean>,
    })),
    extras: (gig.extras ?? []).map((e) => ({ label: e.label, price: String(e.price), days: String(e.days ?? 0) })),
    description: gig.description,
    faq: gig.faq?.length ? gig.faq : [{ question: "", answer: "" }],
    requirements: gig.requirementsText ?? "",
    questions: gig.requirementQuestions ?? [],
    videoUrl: gig.video ?? "",
    videoName: gig.videoName ?? "",
  };
}

type Errors = Partial<Record<string, string>>;

function validateStep(step: StepIndex, form: FormState, media: MediaItem[]): Errors {
  const errors: Errors = {};
  const activeKeys = form.threePackages ? PACKAGE_KEYS : (["basic"] as PackageKey[]);
  if (step === 0) {
    const title = form.title.trim();
    if (title.length < 15) errors.title = "Use at least 15 characters so buyers know what you offer.";
    else if (title.length > TITLE_MAX) errors.title = `Keep the title under ${TITLE_MAX} characters.`;
    if (form.skills.length === 0) errors.skills = "Add at least one skill.";
  }
  if (step === 1) {
    let prev = 0;
    for (const key of activeKeys) {
      const pkg = form.packages[key];
      const price = Number(pkg.price);
      if (!pkg.name.trim()) errors[`${key}.name`] = "Name this package.";
      if (!price || price < 5) errors[`${key}.price`] = "Minimum price is $5.";
      else if (price < prev) errors[`${key}.price`] = "Higher tiers should not cost less than lower ones.";
      if (!Number(pkg.delivery) || Number(pkg.delivery) < 1) errors[`${key}.delivery`] = "At least 1 day.";
      if (form.threePackages && pkg.description.trim().length < 10) errors[`${key}.description`] = "Describe what is included.";
      prev = price || prev;
    }
    form.extras.forEach((extra, i) => {
      if (extra.label.trim() && !(Number(extra.price) >= 0)) errors[`extra.${i}`] = "Enter a valid price.";
    });
  }
  if (step === 2) {
    const len = form.description.trim().length;
    if (len < DESC_MIN) errors.description = `Write at least ${DESC_MIN} characters (${len} so far).`;
    else if (len > DESC_MAX) errors.description = `Keep it under ${DESC_MAX} characters.`;
    form.faq.forEach((f, i) => {
      if (f.question.trim() && !f.answer.trim()) errors[`faq.${i}`] = "Add an answer or remove this question.";
    });
  }
  if (step === 3) {
    form.questions.forEach((q, i) => {
      if (!q.question.trim()) errors[`q.${i}`] = "Write the question or remove it.";
    });
  }
  if (step === 4) {
    if (media.length === 0) errors.media = "Add at least one image — gigs with photos get far more clicks.";
  }
  return errors;
}

function qualityChecks(form: FormState, media: MediaItem[]): { label: string; done: boolean }[] {
  return [
    { label: "Clear title (15+ characters)", done: form.title.trim().length >= 15 },
    { label: "3+ skills or search tags", done: form.skills.length + form.tags.length >= 3 },
    { label: "Three packages offered", done: form.threePackages },
    { label: "Detailed description (300+ characters)", done: form.description.trim().length >= 300 },
    { label: "At least 2 FAQs", done: form.faq.filter((f) => f.question.trim() && f.answer.trim()).length >= 2 },
    { label: "Buyer requirements set", done: form.questions.length > 0 || Boolean(form.requirements.trim()) },
    { label: "3+ gallery images", done: media.length >= 3 },
    { label: "Intro video", done: Boolean(form.videoUrl.trim()) },
  ];
}

function readDraft(key: string): FormState | null {
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return null;
    return { ...EMPTY_FORM, ...(JSON.parse(raw) as Partial<FormState>) };
  } catch {
    return null;
  }
}

export default function GigWizard({ editId }: { editId?: string }) {
  const router = useRouter();
  const { user } = useAuth();
  const { openAuth, toast } = useUI();
  const { saveGig } = useMarketplace();

  const [step, setStep] = useState<StepIndex>(0);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<Errors>({});
  const [loaded, setLoaded] = useState(!editId);
  const [currentStatus, setCurrentStatus] = useState<GigStatus | null>(null);
  const [saving, setSaving] = useState<GigStatus | null>(null);
  const [tagInput, setTagInput] = useState("");
  const [featureInput, setFeatureInput] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const objectUrls = useRef<string[]>([]);

  const draftKey = `${DRAFT_KEY}:${user?.sub ?? "anon"}`;

  /* Load the gig being edited, or restore the autosaved draft. */
  useEffect(() => {
    let cancelled = false;
    if (editId) {
      void fetchGigById(editId).then((gig) => {
        if (cancelled) return;
        if (!gig || (user?.sub && gig.sellerId !== user.sub)) {
          toast("That gig could not be opened for editing.");
          router.replace("/dashboard");
          return;
        }
        setForm(formFromGig(gig));
        setMedia((gig.images ?? []).map((url) => ({ id: uid(), url })));
        setCurrentStatus(gig.status ?? "published");
        setLoaded(true);
      });
    } else {
      const draft = readDraft(draftKey);
      if (draft) {
        const timer = setTimeout(() => {
          if (!cancelled) setForm(draft);
        }, 0);
        return () => {
          cancelled = true;
          clearTimeout(timer);
        };
      }
    }
    return () => {
      cancelled = true;
    };
  }, [editId, draftKey, user?.sub, router, toast]);

  /* Autosave new-gig drafts (text only — files cannot be serialised). */
  useEffect(() => {
    if (editId || !loaded) return;
    const timer = setTimeout(() => {
      try {
        window.localStorage.setItem(draftKey, JSON.stringify(form));
      } catch {
        /* storage unavailable */
      }
    }, 600);
    return () => clearTimeout(timer);
  }, [form, editId, loaded, draftKey]);

  useEffect(() => {
    const urls = objectUrls.current;
    return () => urls.forEach((u) => URL.revokeObjectURL(u));
  }, []);

  const checks = useMemo(() => qualityChecks(form, media), [form, media]);
  const score = Math.round((checks.filter((c) => c.done).length / checks.length) * 100);

  if (!user) {
    return (
      <div className="empty">
        <h3>Sign in to create a gig</h3>
        <button className="btn-primary" type="button" onClick={() => openAuth("login")}>
          Sign in
        </button>
      </div>
    );
  }

  if (!loaded) {
    return <p className="gw-muted">Loading your gig…</p>;
  }

  const patch = (next: Partial<FormState>) => setForm((cur) => ({ ...cur, ...next }));
  const setPackage = (key: PackageKey, next: Partial<PackageForm>) =>
    setForm((cur) => ({ ...cur, packages: { ...cur.packages, [key]: { ...cur.packages[key], ...next } } }));
  const activeKeys = form.threePackages ? PACKAGE_KEYS : (["basic"] as PackageKey[]);

  const goTo = (target: StepIndex) => {
    if (target > step) {
      for (let s = step; s < target; s += 1) {
        const found = validateStep(s as StepIndex, form, media);
        if (Object.keys(found).length) {
          setErrors(found);
          setStep(s as StepIndex);
          toast("Please fix the highlighted fields first.");
          return;
        }
      }
    }
    setErrors({});
    setStep(target);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const changeCategory = (category: string) => {
    const allowed = new Set(skillsForCategory(category));
    patch({ category, skills: form.skills.filter((s) => allowed.has(s)) });
  };

  const addTag = () => {
    const tag = tagInput.trim().toLowerCase().replace(/\s+/g, " ").slice(0, 24);
    if (!tag) return;
    if (form.tags.length >= MAX_TAGS) {
      toast(`Up to ${MAX_TAGS} search tags.`);
      return;
    }
    if (!form.tags.includes(tag)) patch({ tags: [...form.tags, tag] });
    setTagInput("");
  };

  const addFeature = () => {
    const label = featureInput.trim();
    if (!label || form.features.some((f) => f.label.toLowerCase() === label.toLowerCase())) return;
    patch({ features: [...form.features, { label, included: { basic: false, standard: true, premium: true } }] });
    setFeatureInput("");
  };

  const addFiles = (files: FileList | File[]) => {
    const list = Array.from(files).filter((f) => f.type.startsWith("image/"));
    const room = MAX_IMAGES - media.length;
    if (room <= 0) {
      toast(`Up to ${MAX_IMAGES} images.`);
      return;
    }
    const tooBig = list.filter((f) => f.size > MAX_IMAGE_MB * 1024 * 1024);
    if (tooBig.length) toast(`Images must be under ${MAX_IMAGE_MB} MB — skipped ${tooBig.length}.`);
    const accepted = list.filter((f) => f.size <= MAX_IMAGE_MB * 1024 * 1024).slice(0, room);
    const items = accepted.map((file) => {
      const url = URL.createObjectURL(file);
      objectUrls.current.push(url);
      return { id: uid(), url, file };
    });
    setMedia((cur) => [...cur, ...items]);
    setErrors((cur) => ({ ...cur, media: undefined }));
  };

  const moveMedia = (index: number, delta: number) => {
    setMedia((cur) => {
      const target = index + delta;
      if (target < 0 || target >= cur.length) return cur;
      const next = cur.slice();
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  };

  const pickVideo = (file: File | null) => {
    if (file && file.size > MAX_VIDEO_MB * 1024 * 1024) {
      toast(`Video must be under ${MAX_VIDEO_MB} MB.`);
      return;
    }
    setVideoFile(file);
    if (file && !form.videoName) patch({ videoName: file.name.replace(/\.[^.]+$/, "") });
  };

  const submit = async (status: GigStatus) => {
    if (status === "published") {
      for (let s = 0; s < 5; s += 1) {
        const found = validateStep(s as StepIndex, form, media);
        if (Object.keys(found).length) {
          setErrors(found);
          setStep(s as StepIndex);
          toast(`Step "${STEPS[s]}" needs attention before publishing.`);
          return;
        }
      }
    } else if (form.title.trim().length < 5) {
      setStep(0);
      setErrors({ title: "Give your draft a title first." });
      return;
    }
    if (!user.sub) return;
    setSaving(status);
    try {
      const userId = user.sub;
      const [imageUrls, uploadedVideo] = await Promise.all([
        Promise.all(media.map((item) => (item.file ? uploadFile("gig-media", userId, item.file) : item.url))),
        videoFile ? uploadFile("gig-media", userId, videoFile) : Promise.resolve(null),
      ]);
      const failed = imageUrls.filter((u) => !u).length;
      if (failed) toast(`${failed} image(s) failed to upload and were skipped.`);
      if (videoFile && !uploadedVideo) toast("Video upload failed — the gig was saved without it.");

      const packages = Object.fromEntries(
        activeKeys.map((key) => {
          const pkg = form.packages[key];
          return [
            key,
            {
              name: pkg.name.trim() || key,
              description: pkg.description.trim(),
              price: Number(pkg.price) || 0,
              delivery: Math.max(1, Number(pkg.delivery) || 1),
              revisions: Math.max(0, Number(pkg.revisions) || 0),
              features: form.features.filter((f) => f.included[key] && f.label.trim()).map((f) => f.label.trim()),
            },
          ];
        }),
      );

      const draft: GigDraft = {
        title: form.title.trim(),
        description: form.description.trim(),
        category: form.category,
        skills: form.skills.filter(isAllowedSkill),
        price: Number(form.packages.basic.price) || 0,
        deliveryDays: Math.max(1, Number(form.packages.basic.delivery) || 1),
        seller: user.name ?? "Seller",
        video: uploadedVideo || form.videoUrl.trim() || undefined,
        videoName: form.videoName.trim() || undefined,
        images: imageUrls.filter((u): u is string => Boolean(u)),
        packages,
        extras: form.extras
          .filter((e) => e.label.trim() && Number(e.price) >= 0)
          .map((e) => ({ label: e.label.trim(), price: Number(e.price) || 0, days: Number(e.days) || 0 })),
        faq: form.faq
          .filter((f) => f.question.trim() && f.answer.trim())
          .map((f) => ({ question: f.question.trim(), answer: f.answer.trim() })),
        requirements: form.requirements.trim(),
        requirementQuestions: form.questions
          .filter((q) => q.question.trim())
          .map((q) => ({ ...q, question: q.question.trim() })),
        tags: form.tags,
        status,
      };

      const gig = await saveGig(draft, editId);
      if (!gig) {
        toast("Could not save the gig. Have you run the latest database migration?");
        return;
      }
      if (!editId) {
        try {
          window.localStorage.removeItem(draftKey);
        } catch {
          /* storage unavailable */
        }
      }
      toast(status === "published" ? (editId ? "Gig updated!" : "Gig published!") : "Draft saved.");
      router.push(status === "published" ? `/gig/${gig.id}` : "/dashboard");
    } finally {
      setSaving(null);
    }
  };

  const discardDraft = () => {
    if (!window.confirm("Clear this draft and start over?")) return;
    try {
      window.localStorage.removeItem(draftKey);
    } catch {
      /* storage unavailable */
    }
    setForm(EMPTY_FORM);
    setMedia([]);
    setVideoFile(null);
    setErrors({});
    setStep(0);
  };

  const err = (key: string) => (errors[key] ? <span className="gw-error">{errors[key]}</span> : null);
  const colors = categoryColors(form.category);
  const cover = media[0]?.url;
  const basicPrice = Number(form.packages.basic.price) || 0;

  return (
    <div className="gw">
      <ol className="gw-steps" aria-label="Gig steps">
        {STEPS.map((label, i) => (
          <li key={label}>
            <button
              type="button"
              className={"gw-step" + (i === step ? " active" : "") + (i < step ? " done" : "")}
              onClick={() => goTo(i as StepIndex)}
              aria-current={i === step ? "step" : undefined}
            >
              <span className="gw-step-num">{i < step ? "✓" : i + 1}</span>
              <span className="gw-step-label">{label}</span>
            </button>
          </li>
        ))}
      </ol>

      <div className="gw-layout">
        <div className="gw-main">
          {step === 0 ? (
            <Card title="Gig overview" hint="Buyers search by title, category and tags — be specific.">
              <Field label="Gig title" counter={`${form.title.length}/${TITLE_MAX}`} error={err("title")}>
                <div className="gw-prefix-input">
                  <span>I will</span>
                  <input
                    value={form.title.replace(/^i will\s*/i, "")}
                    maxLength={TITLE_MAX}
                    onChange={(e) => patch({ title: `I will ${e.target.value.replace(/^i will\s*/i, "")}` })}
                    placeholder="design a modern logo for your brand"
                  />
                </div>
              </Field>
              <Field label="Category">
                <select className="gw-input" value={form.category} onChange={(e) => changeCategory(e.target.value)}>
                  {CATEGORY_OPTIONS.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </Field>
              <Field label="Skills" hint="Only skills from the chosen category are offered." error={err("skills")}>
                <SkillPicker
                  value={form.skills}
                  onChange={(skills) => patch({ skills })}
                  category={form.category}
                  max={10}
                  placeholder="Search skills"
                />
              </Field>
              <Field label="Search tags" counter={`${form.tags.length}/${MAX_TAGS}`} hint="Words buyers might type, e.g. “minimalist”, “startup”.">
                <div className="gw-tags">
                  {form.tags.map((tag) => (
                    <span key={tag} className="gw-tag">
                      {tag}
                      <button type="button" aria-label={`Remove ${tag}`} onClick={() => patch({ tags: form.tags.filter((t) => t !== tag) })}>×</button>
                    </span>
                  ))}
                  <input
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === ",") {
                        e.preventDefault();
                        addTag();
                      }
                    }}
                    onBlur={addTag}
                    placeholder={form.tags.length < MAX_TAGS ? "Type and press Enter" : ""}
                    disabled={form.tags.length >= MAX_TAGS}
                  />
                </div>
              </Field>
            </Card>
          ) : null}

          {step === 1 ? (
            <>
              <Card
                title="Packages"
                hint="Three tiers let buyers pick their budget — most sellers earn more this way."
                action={
                  <label className="gw-switch">
                    <input type="checkbox" checked={form.threePackages} onChange={(e) => patch({ threePackages: e.target.checked })} />
                    <span>Offer 3 packages</span>
                  </label>
                }
              >
                <div className={"gw-pkg-grid" + (form.threePackages ? "" : " single")}>
                  {activeKeys.map((key) => {
                    const pkg = form.packages[key];
                    return (
                      <div key={key} className={`gw-pkg gw-pkg-${key}`}>
                        <div className="gw-pkg-tier">{key}</div>
                        <input className="gw-input" value={pkg.name} onChange={(e) => setPackage(key, { name: e.target.value })} placeholder="Package name" />
                        {err(`${key}.name`)}
                        <textarea className="gw-input" rows={3} value={pkg.description} onChange={(e) => setPackage(key, { description: e.target.value })} placeholder="What's included in this package" />
                        {err(`${key}.description`)}
                        <div className="gw-pkg-row">
                          <label>
                            <span>Price ($)</span>
                            <input className="gw-input" type="number" min={5} value={pkg.price} onChange={(e) => setPackage(key, { price: e.target.value })} />
                          </label>
                          <label>
                            <span>Days</span>
                            <input className="gw-input" type="number" min={1} value={pkg.delivery} onChange={(e) => setPackage(key, { delivery: e.target.value })} />
                          </label>
                          <label>
                            <span>Revisions</span>
                            <input className="gw-input" type="number" min={0} value={pkg.revisions} onChange={(e) => setPackage(key, { revisions: e.target.value })} />
                          </label>
                        </div>
                        {err(`${key}.price`)}
                        {err(`${key}.delivery`)}
                      </div>
                    );
                  })}
                </div>
              </Card>

              <Card title="What each package includes" hint="Tick the features every tier gets.">
                <div className="gw-features">
                  <div className={"gw-feature-row head" + (form.threePackages ? "" : " single")}>
                    <span>Feature</span>
                    {activeKeys.map((key) => <span key={key} className="gw-cap">{key}</span>)}
                    <span />
                  </div>
                  {form.features.map((feature, i) => (
                    <div key={feature.label} className={"gw-feature-row" + (form.threePackages ? "" : " single")}>
                      <span>{feature.label}</span>
                      {activeKeys.map((key) => (
                        <input
                          key={key}
                          type="checkbox"
                          aria-label={`${feature.label} in ${key}`}
                          checked={feature.included[key]}
                          onChange={(e) =>
                            patch({
                              features: form.features.map((f, idx) =>
                                idx === i ? { ...f, included: { ...f.included, [key]: e.target.checked } } : f,
                              ),
                            })
                          }
                        />
                      ))}
                      <button type="button" className="gw-icon-btn" aria-label={`Remove ${feature.label}`} onClick={() => patch({ features: form.features.filter((_, idx) => idx !== i) })}>×</button>
                    </div>
                  ))}
                  <div className="gw-inline-add">
                    <input
                      className="gw-input"
                      value={featureInput}
                      onChange={(e) => setFeatureInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addFeature();
                        }
                      }}
                      placeholder="e.g. Responsive design"
                    />
                    <button type="button" className="btn-ghost" onClick={addFeature}>Add feature</button>
                  </div>
                </div>
              </Card>

              <Card title="Gig extras" hint="Optional add-ons buyers can tick at checkout.">
                {form.extras.map((extra, i) => (
                  <div key={i} className="gw-extra-row">
                    <input className="gw-input" value={extra.label} onChange={(e) => patch({ extras: form.extras.map((x, idx) => (idx === i ? { ...x, label: e.target.value } : x)) })} placeholder="e.g. Extra revision" />
                    <label>
                      <span>+ $</span>
                      <input className="gw-input" type="number" min={0} value={extra.price} onChange={(e) => patch({ extras: form.extras.map((x, idx) => (idx === i ? { ...x, price: e.target.value } : x)) })} />
                    </label>
                    <label>
                      <span>± days</span>
                      <input className="gw-input" type="number" value={extra.days} onChange={(e) => patch({ extras: form.extras.map((x, idx) => (idx === i ? { ...x, days: e.target.value } : x)) })} />
                    </label>
                    <button type="button" className="gw-icon-btn" aria-label="Remove extra" onClick={() => patch({ extras: form.extras.filter((_, idx) => idx !== i) })}>×</button>
                    {err(`extra.${i}`)}
                  </div>
                ))}
                <button type="button" className="btn-ghost" onClick={() => patch({ extras: [...form.extras, { label: "", price: "", days: "0" }] })}>+ Add extra</button>
              </Card>
            </>
          ) : null}

          {step === 2 ? (
            <>
              <Card title="Description" hint="Explain what you deliver, your process and why buyers should pick you.">
                <Field label="About this gig" counter={`${form.description.trim().length}/${DESC_MAX}`} error={err("description")}>
                  <textarea
                    className="gw-input"
                    rows={10}
                    maxLength={DESC_MAX + 200}
                    value={form.description}
                    onChange={(e) => patch({ description: e.target.value })}
                    placeholder={"What you'll get:\n• …\n\nMy process:\n1. …\n\nWhy me: …"}
                  />
                  <div className="gw-meter" aria-hidden="true">
                    <span style={{ width: `${Math.min(100, (form.description.trim().length / 300) * 100)}%` }} />
                  </div>
                </Field>
              </Card>
              <Card title="Frequently asked questions" hint="Answer what buyers usually ask before ordering.">
                {form.faq.map((item, i) => (
                  <div key={i} className="gw-faq">
                    <div className="gw-faq-head">
                      <strong>Q{i + 1}</strong>
                      <button type="button" className="gw-icon-btn" aria-label="Remove question" onClick={() => patch({ faq: form.faq.filter((_, idx) => idx !== i) })}>×</button>
                    </div>
                    <input className="gw-input" value={item.question} onChange={(e) => patch({ faq: form.faq.map((f, idx) => (idx === i ? { ...f, question: e.target.value } : f)) })} placeholder="Question" />
                    <textarea className="gw-input" rows={2} value={item.answer} onChange={(e) => patch({ faq: form.faq.map((f, idx) => (idx === i ? { ...f, answer: e.target.value } : f)) })} placeholder="Answer" />
                    {err(`faq.${i}`)}
                  </div>
                ))}
                <button type="button" className="btn-ghost" onClick={() => patch({ faq: [...form.faq, { question: "", answer: "" }] })}>+ Add FAQ</button>
              </Card>
            </>
          ) : null}

          {step === 3 ? (
            <Card title="Buyer requirements" hint="Questions the buyer answers when ordering, so you can start right away.">
              {form.questions.map((q, i) => (
                <div key={i} className="gw-question">
                  <div className="gw-faq-head">
                    <strong>Question {i + 1}</strong>
                    <button type="button" className="gw-icon-btn" aria-label="Remove question" onClick={() => patch({ questions: form.questions.filter((_, idx) => idx !== i) })}>×</button>
                  </div>
                  <input className="gw-input" value={q.question} onChange={(e) => patch({ questions: form.questions.map((x, idx) => (idx === i ? { ...x, question: e.target.value } : x)) })} placeholder="e.g. What is your brand name?" />
                  <div className="gw-question-opts">
                    <select className="gw-input" value={q.type} onChange={(e) => patch({ questions: form.questions.map((x, idx) => (idx === i ? { ...x, type: e.target.value as RequirementQuestion["type"] } : x)) })}>
                      <option value="text">Free text answer</option>
                      <option value="file">File / link</option>
                    </select>
                    <label className="gw-switch">
                      <input type="checkbox" checked={q.required} onChange={(e) => patch({ questions: form.questions.map((x, idx) => (idx === i ? { ...x, required: e.target.checked } : x)) })} />
                      <span>Required</span>
                    </label>
                  </div>
                  {err(`q.${i}`)}
                </div>
              ))}
              <button type="button" className="btn-ghost" onClick={() => patch({ questions: [...form.questions, { question: "", type: "text", required: false }] })}>+ Add question</button>
              <Field label="Extra instructions (optional)">
                <textarea className="gw-input" rows={3} value={form.requirements} onChange={(e) => patch({ requirements: e.target.value })} placeholder="Anything else the buyer should know before ordering" />
              </Field>
            </Card>
          ) : null}

          {step === 4 ? (
            <>
              <Card title="Gallery" hint={`Up to ${MAX_IMAGES} images, ${MAX_IMAGE_MB} MB each. The first image is your cover.`}>
                <label
                  className={"gw-drop" + (dragOver ? " over" : "")}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragOver(true);
                  }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setDragOver(false);
                    addFiles(e.dataTransfer.files);
                  }}
                >
                  <strong>Drag & drop images here</strong>
                  <span>or click to browse · {media.length}/{MAX_IMAGES}</span>
                  <input type="file" accept="image/*" multiple hidden onChange={(e) => {
                    if (e.target.files) addFiles(e.target.files);
                    e.target.value = "";
                  }} />
                </label>
                {err("media")}
                {media.length > 0 ? (
                  <div className="gw-media-grid">
                    {media.map((item, i) => (
                      <figure key={item.id} className={"gw-media" + (i === 0 ? " cover" : "")}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={item.url} alt={`Gallery image ${i + 1}`} />
                        {i === 0 ? <span className="gw-cover-badge">Cover</span> : null}
                        <figcaption>
                          <button type="button" aria-label="Move left" disabled={i === 0} onClick={() => moveMedia(i, -1)}>‹</button>
                          {i !== 0 ? <button type="button" onClick={() => moveMedia(i, -i)}>Make cover</button> : null}
                          <button type="button" aria-label="Move right" disabled={i === media.length - 1} onClick={() => moveMedia(i, 1)}>›</button>
                          <button type="button" aria-label="Remove image" onClick={() => setMedia((cur) => cur.filter((m) => m.id !== item.id))}>×</button>
                        </figcaption>
                      </figure>
                    ))}
                  </div>
                ) : null}
              </Card>
              <Card title="Intro video (optional)" hint={`Upload an MP4/WebM up to ${MAX_VIDEO_MB} MB, or paste a YouTube link.`}>
                <div className="gw-video-row">
                  <label className="btn-ghost gw-file-btn">
                    {videoFile ? `✓ ${videoFile.name}` : "Upload video"}
                    <input type="file" accept="video/mp4,video/webm,video/quicktime" hidden onChange={(e) => pickVideo(e.target.files?.[0] ?? null)} />
                  </label>
                  {videoFile ? <button type="button" className="gw-icon-btn" aria-label="Remove video" onClick={() => setVideoFile(null)}>×</button> : null}
                  <span className="gw-muted">or</span>
                  <input className="gw-input" value={form.videoUrl} disabled={Boolean(videoFile)} onChange={(e) => patch({ videoUrl: e.target.value })} placeholder="https://youtube.com/…" />
                </div>
                <Field label="Video title">
                  <input className="gw-input" value={form.videoName} onChange={(e) => patch({ videoName: e.target.value })} placeholder="Meet your designer" />
                </Field>
              </Card>
            </>
          ) : null}

          {step === 5 ? (
            <Card title="Ready to publish?" hint="Review your gig. You can edit or pause it anytime from your dashboard.">
              <div className="gw-score">
                <div className="gw-score-ring" style={{ ["--p" as string]: `${score}%` }}>
                  <span>{score}%</span>
                </div>
                <div>
                  <strong>Gig quality score</strong>
                  <p className="gw-muted">Higher-quality gigs rank better in search.</p>
                </div>
              </div>
              <ul className="gw-checks">
                {checks.map((c) => (
                  <li key={c.label} className={c.done ? "done" : ""}>
                    <span aria-hidden="true">{c.done ? "✓" : "○"}</span> {c.label}
                  </li>
                ))}
              </ul>
              <div className="gw-summary">
                {activeKeys.map((key) => (
                  <div key={key}>
                    <span className="gw-cap">{form.packages[key].name || key}</span>
                    <strong>${formatPrice(Number(form.packages[key].price) || 0)}</strong>
                    <span className="gw-muted">{form.packages[key].delivery} days · {form.packages[key].revisions} revisions</span>
                  </div>
                ))}
              </div>
            </Card>
          ) : null}

          <div className="gw-nav">
            {step > 0 ? (
              <button type="button" className="btn-ghost" onClick={() => goTo((step - 1) as StepIndex)}>← Back</button>
            ) : !editId ? (
              <button type="button" className="btn-ghost danger" onClick={discardDraft}>Clear draft</button>
            ) : <span />}
            <div className="gw-nav-right">
              {currentStatus !== "published" ? (
                <button type="button" className="btn-ghost" disabled={Boolean(saving)} onClick={() => void submit("draft")}>
                  {saving === "draft" ? "Saving…" : "Save draft"}
                </button>
              ) : null}
              {step < 5 ? (
                <button type="button" className="btn-primary" onClick={() => goTo((step + 1) as StepIndex)}>Continue →</button>
              ) : (
                <button type="button" className="btn-primary" disabled={Boolean(saving)} onClick={() => void submit("published")}>
                  {saving === "published" ? "Publishing…" : editId && currentStatus === "published" ? "Save changes" : "Publish gig"}
                </button>
              )}
            </div>
          </div>
        </div>

        <aside className="gw-side" aria-label="Live preview">
          <div className="gw-side-label">Live preview</div>
          <div className="gw-preview">
            <div className="gw-preview-media" style={{ background: `linear-gradient(135deg, ${colors[0]}, ${colors[1]})` }}>
              {cover ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={cover} alt="" />
              ) : (
                <span className="gw-preview-glyph">{glyphForCategory(form.category)}</span>
              )}
            </div>
            <div className="gw-preview-body">
              <div className="gw-preview-seller">
                <span className="avatar" aria-hidden="true">{(user.name ?? "S").slice(0, 1)}</span>
                {user.name}
              </div>
              <p className="gw-preview-title">{form.title || "I will …"}</p>
              <div className="gw-preview-foot">
                <span className="gw-muted">{form.category}</span>
                <span>From <strong>${formatPrice(basicPrice)}</strong></span>
              </div>
            </div>
          </div>
          <div className="gw-side-score">
            <span>Quality</span>
            <div className="gw-meter"><span style={{ width: `${score}%` }} /></div>
            <strong>{score}%</strong>
          </div>
          {!editId ? <p className="gw-muted gw-autosave">Draft autosaves on this device.</p> : null}
        </aside>
      </div>
    </div>
  );
}

function Card({ title, hint, action, children }: { title: string; hint?: string; action?: ReactNode; children: ReactNode }) {
  return (
    <section className="gw-card">
      <header className="gw-card-head">
        <div>
          <h3>{title}</h3>
          {hint ? <p className="gw-muted">{hint}</p> : null}
        </div>
        {action}
      </header>
      {children}
    </section>
  );
}

function Field({ label, hint, counter, error, children }: { label: string; hint?: string; counter?: string; error?: ReactNode; children: ReactNode }) {
  return (
    <div className="gw-field">
      <div className="gw-field-head">
        <strong>{label}</strong>
        {counter ? <span className="gw-muted">{counter}</span> : null}
      </div>
      {children}
      {hint ? <span className="gw-muted gw-hint">{hint}</span> : null}
      {error}
    </div>
  );
}
