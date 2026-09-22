"use client";

import type { FormEvent } from "react";
import { useEffect, useRef, useState } from "react";
import { useUI } from "@/lib/ui";
import { useAuth } from "@/lib/auth";
import { useMarketplace } from "@/lib/marketplace";
import { CATEGORY_OPTIONS } from "@/lib/gigs";

interface FormValues {
  title: string;
  category: string;
  description: string;
  price: string;
  delivery: string;
  seller: string;
}

type FieldKey = keyof FormValues;

const EMPTY: FormValues = {
  title: "",
  category: "",
  description: "",
  price: "",
  delivery: "",
  seller: "",
};

function validate(values: FormValues): Partial<Record<FieldKey, string>> {
  const errors: Partial<Record<FieldKey, string>> = {};
  if (values.title.trim().length < 6) {
    errors.title = "Give your project a descriptive title (at least 6 characters).";
  }
  if (!values.category) errors.category = "Choose a category.";
  if (values.description.trim().length < 20) {
    errors.description = "Describe the work in at least 20 characters.";
  }
  const price = Number(values.price);
  if (values.price === "" || !Number.isFinite(price) || price <= 0) {
    errors.price = "Enter a price greater than 0.";
  }
  const days = Number(values.delivery);
  if (values.delivery === "" || !Number.isFinite(days) || days < 1 || days > 90) {
    errors.delivery = "Delivery must be between 1 and 90 days.";
  }
  return errors;
}

function PostProjectForm() {
  const { closePost, toast } = useUI();
  const { user } = useAuth();
  const { addGig } = useMarketplace();

  const [values, setValues] = useState<FormValues>(() => ({
    ...EMPTY,
    seller: user?.name ?? "",
  }));
  const [errors, setErrors] = useState<Partial<Record<FieldKey, string>>>({});
  const [touched, setTouched] = useState<Partial<Record<FieldKey, boolean>>>({});
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
      setErrors(validate({ ...values, [field]: value }));
    }
  };

  const blurField = (field: FieldKey) => {
    setTouched((current) => ({ ...current, [field]: true }));
    setErrors(validate(values));
  };

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const nextErrors = validate(values);
    setErrors(nextErrors);
    setTouched({
      title: true,
      category: true,
      description: true,
      price: true,
      delivery: true,
      seller: true,
    });
    const firstError = (Object.keys(nextErrors) as FieldKey[])[0];
    if (firstError) {
      toast("Please fix the highlighted fields.");
      return;
    }

    const gig = addGig({
      title: values.title.trim(),
      description: values.description.trim(),
      category: values.category,
      price: Number(values.price),
      deliveryDays: Number(values.delivery),
      seller: values.seller.trim() || user?.name || "Independent Professional",
    });

    closePost();
    toast(`"${gig.title.slice(0, 42)}${gig.title.length > 42 ? "…" : ""}" is now live.`);
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
            <h3 id="postModalTitle">Post a Project / Create Gig</h3>
            <p>Publish your service to the marketplace — it goes live instantly.</p>
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
                Project title <span className="req">*</span>
              </label>
              <input
                id="gigTitle"
                ref={titleRef}
                type="text"
                value={values.title}
                placeholder="e.g. I will build a responsive React landing page"
                autoComplete="off"
                onChange={(event) => setField("title", event.target.value)}
                onBlur={() => blurField("title")}
              />
              <span className="error-msg">{fieldError("title")}</span>
            </div>

            <div className="field-row">
              <div className={"form-field" + (fieldError("category") ? " invalid" : "")}>
                <label htmlFor="gigCategory">
                  Category <span className="req">*</span>
                </label>
                <select
                  id="gigCategory"
                  value={values.category}
                  onChange={(event) => setField("category", event.target.value)}
                  onBlur={() => blurField("category")}
                >
                  <option value="">Select a category</option>
                  {CATEGORY_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
                <span className="error-msg">{fieldError("category")}</span>
              </div>
              <div className={"form-field" + (fieldError("price") ? " invalid" : "")}>
                <label htmlFor="gigPrice">
                  Starting price <span className="req">*</span>
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
              className={"form-field" + (fieldError("description") ? " invalid" : "")}
            >
              <label htmlFor="gigDescription">
                Description <span className="req">*</span>
              </label>
              <textarea
                id="gigDescription"
                value={values.description}
                placeholder="Describe what you will deliver, what is included, and how you work…"
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
                  Delivery time (days) <span className="req">*</span>
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
                <label htmlFor="gigSeller">Your name / brand</label>
                <input
                  id="gigSeller"
                  type="text"
                  autoComplete="name"
                  value={values.seller}
                  placeholder="Auto-filled when signed in"
                  onChange={(event) => setField("seller", event.target.value)}
                />
              </div>
            </div>
          </div>
          <div className="modal-foot">
            <button className="btn-ghost" type="button" onClick={closePost}>
              Cancel
            </button>
            <button className="btn-primary" type="submit">
              Publish Gig
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
