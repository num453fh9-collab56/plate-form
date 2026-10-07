"use client";

import type { FormEvent } from "react";
import { useEffect, useRef, useState } from "react";
import { useUI } from "@/lib/ui";
import { useAuth } from "@/lib/auth";
import { useMarketplace } from "@/lib/marketplace";
import { useI18n } from "@/lib/i18n";
import type { Translate } from "@/lib/i18n";
import { CATEGORY_LABEL_KEYS, CATEGORY_OPTIONS } from "@/lib/gigs";
import { isAllowedCategory, normalizeSkills } from "@/lib/taxonomy";
import IntroVideo from "./IntroVideo";
import SkillPicker from "./SkillPicker";

interface FormValues {
  title: string;
  category: string;
  skills: string[];
  description: string;
  price: string;
  delivery: string;
  seller: string;
  video: string;
  videoName: string;
}

type FieldKey = keyof FormValues;

const EMPTY: FormValues = {
  title: "",
  category: "",
  skills: [],
  description: "",
  price: "",
  delivery: "",
  seller: "",
  video: "",
  videoName: "",
};

const URL_ONLY = /^(https?:\/\/|www\.)\S+$/i;

function wordCount(value: string): number {
  return value.trim().split(/\s+/).filter(Boolean).length;
}

function looksFake(value: string): boolean {
  const compact = value.replace(/\s+/g, "").toLowerCase();
  if (compact.length < 4) return true;
  return new Set(compact).size < 4;
}

function validate(values: FormValues, t: Translate): Partial<Record<FieldKey, string>> {
  const errors: Partial<Record<FieldKey, string>> = {};

  const title = values.title.trim();
  if (title.length < 8) {
    errors.title = t("err.titleShort");
  } else if (URL_ONLY.test(title)) {
    errors.title = t("err.titleUrl");
  } else if (wordCount(title) < 2) {
    errors.title = t("err.titleWords");
  } else if (looksFake(title)) {
    errors.title = t("err.titleFake");
  }

  if (!isAllowedCategory(values.category)) {
    errors.category = t("err.category");
  } else if (values.skills.length === 0) {
    errors.skills = t("err.skillsRequired");
  } else if (normalizeSkills(values.skills, values.category).length !== values.skills.length) {
    errors.skills = t("err.skillsCategory");
  }

  const description = values.description.trim();
  if (description.length < 30) {
    errors.description = t("err.descShort");
  } else if (wordCount(description) < 5) {
    errors.description = t("err.descWords");
  } else if (looksFake(description)) {
    errors.description = t("err.descFake");
  }

  const price = Number(values.price);
  if (values.price.trim() === "" || !Number.isFinite(price) || price <= 0) {
    errors.price = t("err.price");
  } else if (price > 1000000) {
    errors.price = t("err.priceMax");
  }

  const days = Number(values.delivery);
  if (
    values.delivery.trim() === "" ||
    !Number.isInteger(days) ||
    days < 1 ||
    days > 90
  ) {
    errors.delivery = t("err.delivery");
  }

  return errors;
}

function PostProjectForm() {
  const { closePost, toast } = useUI();
  const { user } = useAuth();
  const { addGig } = useMarketplace();
  const { t } = useI18n();

  const [values, setValues] = useState<FormValues>(() => ({
    ...EMPTY,
    seller: user?.name ?? "",
  }));
  const [errors, setErrors] = useState<Partial<Record<FieldKey, string>>>({});
  const [touched, setTouched] = useState<Partial<Record<FieldKey, boolean>>>({});
  const [submitting, setSubmitting] = useState(false);
  const titleRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    document.body.classList.add("modal-open");
    const focusTimer = window.setTimeout(() => titleRef.current?.focus(), 60);
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closePost();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      window.clearTimeout(focusTimer);
      document.body.classList.remove("modal-open");
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [closePost]);

  const setField = (field: FieldKey, value: string) => {
    setValues((current) => ({ ...current, [field]: value }));
    if (touched[field]) {
      setErrors(validate({ ...values, [field]: value }, t));
    }
  };

  const blurField = (field: FieldKey) => {
    setTouched((current) => ({ ...current, [field]: true }));
    setErrors(validate(values, t));
  };

  const setCategory = (category: string) => {
    const skills = normalizeSkills(values.skills, category);
    setValues((current) => ({ ...current, category, skills }));
    if (touched.category) {
      setErrors(validate({ ...values, category, skills }, t));
    }
  };

  const setSkills = (skills: string[]) => {
    setValues((current) => ({ ...current, skills }));
    if (touched.skills) {
      setErrors(validate({ ...values, skills }, t));
    }
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (submitting) return;
    const nextErrors = validate(values, t);
    setErrors(nextErrors);
    setTouched({
      title: true,
      category: true,
      skills: true,
      description: true,
      price: true,
      delivery: true,
      seller: true,
    });
    const firstError = (Object.keys(nextErrors) as FieldKey[])[0];
    if (firstError) {
      toast(t("post.fixFields"));
      return;
    }

    setSubmitting(true);
    const gig = await addGig({
      title: values.title.trim(),
      description: values.description.trim(),
      category: values.category,
      skills: values.skills,
      price: Number(values.price),
      deliveryDays: Number(values.delivery),
      seller: values.seller.trim() || user?.name || "Independent Professional",
      video: values.video,
      videoName: values.videoName,
    });
    setSubmitting(false);

    if (!gig) {
      toast("Could not publish your gig. Please sign in and try again.");
      return;
    }

    closePost();
    const shortTitle = `${gig.title.slice(0, 42)}${gig.title.length > 42 ? "…" : ""}`;
    toast(t("post.isLive", { title: shortTitle }));
    document.getElementById("gigs")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const fieldError = (field: FieldKey) => (touched[field] ? errors[field] : undefined);

  return (
    <div
      className="modal-overlay open"
      role="dialog"
      aria-modal="true"
      aria-labelledby="postModalTitle"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) closePost();
      }}
    >
      <div className="modal">
        <div className="modal-head">
          <div>
            <h3 id="postModalTitle">{t("post.title")}</h3>
            <p>{t("post.subtitle")}</p>
          </div>
          <button
            className="modal-close"
            type="button"
            aria-label="Close"
            onClick={closePost}
          >
            &times;
          </button>
        </div>
        <form onSubmit={submit} noValidate>
          <div className="modal-body">
            <div className={"form-field" + (fieldError("title") ? " invalid" : "")}>
              <label htmlFor="gigTitle">
                {t("post.gigTitle")} <span className="req">*</span>
              </label>
              <input
                id="gigTitle"
                ref={titleRef}
                type="text"
                value={values.title}
                placeholder={t("post.titlePlaceholder")}
                autoComplete="off"
                onChange={(event) => setField("title", event.target.value)}
                onBlur={() => blurField("title")}
              />
              <span className="error-msg">{fieldError("title")}</span>
            </div>

            <div className="field-row">
              <div className={"form-field" + (fieldError("category") ? " invalid" : "")}>
                <label htmlFor="gigCategory">
                  {t("post.category")} <span className="req">*</span>
                </label>
                <select
                  id="gigCategory"
                  value={values.category}
                  onChange={(event) => setCategory(event.target.value)}
                  onBlur={() => blurField("category")}
                >
                  <option value="">{t("post.selectCategory")}</option>
                  {CATEGORY_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {t(CATEGORY_LABEL_KEYS[option])}
                    </option>
                  ))}
                </select>
                <span className="error-msg">{fieldError("category")}</span>
              </div>
              <div className={"form-field" + (fieldError("price") ? " invalid" : "")}>
                <label htmlFor="gigPrice">
                  {t("post.startingPrice")} <span className="req">*</span>
                </label>
                <span className="price-input">
                  <span className="prefix">$</span>
                  <input
                    id="gigPrice"
                    type="number"
                    min="1"
                    step="1"
                    inputMode="decimal"
                    value={values.price}
                    placeholder="150"
                    onChange={(event) => setField("price", event.target.value)}
                    onBlur={() => blurField("price")}
                  />
                </span>
                <span className="error-msg">{fieldError("price")}</span>
              </div>
            </div>

            <div
              className={
                "form-field taxonomy-field" + (fieldError("skills") ? " invalid" : "")
              }
            >
              <label>
                {t("post.skills")} <span className="req">*</span>
                <span className="field-tag">{t("post.skillsTag")}</span>
              </label>
              <p className="field-hint">{t("post.skillsHint")}</p>
              {isAllowedCategory(values.category) ? (
                <SkillPicker
                  value={values.skills}
                  onChange={setSkills}
                  category={values.category}
                  placeholder={t("post.skillsPlaceholder")}
                  max={12}
                />
              ) : (
                <div className="taxonomy-locked">{t("post.skillsPickCategory")}</div>
              )}
              <span className="error-msg">{fieldError("skills")}</span>
            </div>

            <div
              className={"form-field" + (fieldError("description") ? " invalid" : "")}
            >
              <label htmlFor="gigDescription">
                {t("post.description")} <span className="req">*</span>
              </label>
              <textarea
                id="gigDescription"
                value={values.description}
                placeholder={t("post.descriptionPlaceholder")}
                onChange={(event) => setField("description", event.target.value)}
                onBlur={() => blurField("description")}
              />
              <span className="error-msg">{fieldError("description")}</span>
            </div>

            <div className="field-row">
              <div
                className={"form-field" + (fieldError("delivery") ? " invalid" : "")}
              >
                <label htmlFor="gigDelivery">
                  {t("post.delivery")} <span className="req">*</span>
                </label>
                <input
                  id="gigDelivery"
                  type="number"
                  min="1"
                  max="90"
                  step="1"
                  inputMode="numeric"
                  value={values.delivery}
                  placeholder="5"
                  onChange={(event) => setField("delivery", event.target.value)}
                  onBlur={() => blurField("delivery")}
                />
                <span className="error-msg">{fieldError("delivery")}</span>
              </div>
              <div className="form-field">
                <label htmlFor="gigSeller">{t("post.seller")}</label>
                <input
                  id="gigSeller"
                  type="text"
                  autoComplete="name"
                  value={values.seller}
                  placeholder={t("post.sellerPlaceholder")}
                  onChange={(event) => setField("seller", event.target.value)}
                />
              </div>
            </div>

            <div className="form-field">
              <label>
                {t("post.video")}
                <span className="field-tag">{t("post.optional")}</span>
              </label>
              <p className="field-hint">{t("post.videoHint")}</p>
              <IntroVideo
                src={values.video}
                name={values.videoName}
                bucket="gig-media"
                onChange={(src, name) =>
                  setValues((current) => ({ ...current, video: src, videoName: name }))
                }
              />
            </div>
          </div>
          <div className="modal-foot">
            <button className="btn-ghost" type="button" onClick={closePost}>
              {t("post.cancel")}
            </button>
            <button className="btn-publish" type="submit" disabled={submitting}>
              {t("post.publish")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function PostProjectModal() {
  const { isPostOpen } = useUI();
  if (!isPostOpen) return null;
  return <PostProjectForm />;
}
