"use client";

import type { DragEvent as ReactDragEvent, KeyboardEvent as ReactKeyboardEvent } from "react";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/lib/auth";
import { useI18n } from "@/lib/i18n";
import { useUI } from "@/lib/ui";
import {
  PORTFOLIO_CATEGORIES,
  deletePortfolioProject,
  portfolioGlyph,
  projectCoverStyle,
  savePortfolioOrder,
  savePortfolioProject,
} from "@/lib/portfolio";
import { AVATAR_ACCEPTED_TYPES, MAX_AVATAR_SOURCE_BYTES, resizeImageToCover } from "@/lib/media";
import { uploadDataUrl } from "@/lib/storage";
import { displayLink } from "@/lib/social";
import type { PortfolioProject } from "@/lib/types";

/* ==========================================================================
   HIRELYX · PORTFOLIO MANAGER
   Projects as visual cards (cover, category, tags, link) that can be dragged
   or arrow-moved into order. Add / edit happens in a focused dialog with a
   drag & drop cover uploader (centre-cropped to 16:10) and tag chips.
   ========================================================================== */

const MAX_PROJECTS = 12;
const MAX_TAGS = 8;
const SUMMARY_MAX = 300;

function uid(): string {
  try {
    if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
      return crypto.randomUUID();
    }
  } catch {
    /* fall through */
  }
  return `pf_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
}

function blankProject(): PortfolioProject {
  return {
    id: "",
    title: "",
    category: PORTFOLIO_CATEGORIES[0],
    summary: "",
    tags: [],
    link: "",
    image: "",
    cover: "",
    video: "",
    videoName: "",
  };
}

function validLink(value: string): boolean {
  if (!value.trim()) return true;
  try {
    const url = new URL(/^https?:\/\//i.test(value) ? value : `https://${value}`);
    return url.hostname.includes(".");
  } catch {
    return false;
  }
}

function withProtocol(value: string): string {
  const text = value.trim();
  if (!text) return "";
  return /^https?:\/\//i.test(text) ? text : `https://${text}`;
}

/* ------------------------------ editor dialog ------------------------------ */

function ProjectEditor({
  initial,
  onCancel,
  onSave,
}: {
  initial: PortfolioProject;
  onCancel: () => void;
  onSave: (project: PortfolioProject) => Promise<void>;
}) {
  const { t } = useI18n();
  const [project, setProject] = useState<PortfolioProject>(initial);
  const [tagText, setTagText] = useState("");
  const [over, setOver] = useState(false);
  const [issue, setIssue] = useState("");
  const [busy, setBusy] = useState(false);
  const [tried, setTried] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const titleRef = useRef<HTMLInputElement>(null);

  /* Focus once on open; Escape closes only this dialog, not the onboarding shell. */
  useEffect(() => {
    titleRef.current?.focus();
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.stopImmediatePropagation();
        onCancel();
      }
    };
    document.addEventListener("keydown", onKeyDown, true);
    return () => document.removeEventListener("keydown", onKeyDown, true);
  }, [onCancel]);

  const titleOk = project.title.trim().length >= 3;
  const linkOk = validLink(project.link);

  const addTags = (raw: string) => {
    const incoming = raw
      .split(",")
      .map((tag) => tag.trim().slice(0, 30))
      .filter(Boolean);
    if (incoming.length === 0) return;
    const next = [...project.tags];
    for (const tag of incoming) {
      if (next.length >= MAX_TAGS) break;
      if (!next.some((item) => item.toLowerCase() === tag.toLowerCase())) next.push(tag);
    }
    setProject({ ...project, tags: next });
    setTagText("");
  };

  const onTagKey = (event: ReactKeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" || event.key === ",") {
      event.preventDefault();
      addTags(tagText);
    } else if (event.key === "Backspace" && !tagText && project.tags.length) {
      setProject({ ...project, tags: project.tags.slice(0, -1) });
    }
  };

  const pickCover = async (file: File) => {
    setIssue("");
    if (!AVATAR_ACCEPTED_TYPES.includes(file.type)) {
      setIssue(t("avatar.errType"));
      return;
    }
    if (file.size > MAX_AVATAR_SOURCE_BYTES) {
      setIssue(t("avatar.errSize", { max: Math.round(MAX_AVATAR_SOURCE_BYTES / 1048576) }));
      return;
    }
    try {
      const dataUrl = await resizeImageToCover(file);
      setProject((current) => ({ ...current, image: dataUrl }));
    } catch {
      setIssue(t("video.errRead"));
    }
  };

  const submit = async () => {
    setTried(true);
    if (!titleOk || !linkOk) return;
    setBusy(true);
    const pendingTags = tagText.trim() ? [...project.tags, tagText.trim()].slice(0, MAX_TAGS) : project.tags;
    await onSave({
      ...project,
      title: project.title.trim(),
      summary: project.summary.trim(),
      link: withProtocol(project.link),
      tags: pendingTags,
      updatedAt: Date.now(),
    });
    setBusy(false);
  };

  return (
    <div className="pm-modal" role="dialog" aria-modal="true" aria-labelledby="pmTitle">
      <div className="pm-modal-card">
        <div className="pm-modal-head">
          <h3 id="pmTitle">{initial.id ? t("pm.editTitle") : t("pm.addTitle")}</h3>
          <button type="button" className="pm-close" aria-label={t("avatar.cancel")} onClick={onCancel}>
            &times;
          </button>
        </div>

        <div
          className={"pm-cover" + (over ? " over" : "") + (project.image ? " filled" : "")}
          style={project.image ? { backgroundImage: `url("${project.image}")` } : undefined}
          onDragOver={(event) => {
            event.preventDefault();
            setOver(true);
          }}
          onDragLeave={() => setOver(false)}
          onDrop={(event) => {
            event.preventDefault();
            setOver(false);
            const file = event.dataTransfer.files?.[0];
            if (file) void pickCover(file);
          }}
        >
          {project.image ? (
            <div className="pm-cover-actions">
              <button type="button" onClick={() => fileRef.current?.click()}>
                {t("pm.changeCover")}
              </button>
              <button type="button" onClick={() => setProject({ ...project, image: "" })}>
                {t("profile.remove")}
              </button>
            </div>
          ) : (
            <button type="button" className="pm-cover-empty" onClick={() => fileRef.current?.click()}>
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <rect x="3" y="4" width="18" height="16" rx="2" />
                <circle cx="9" cy="10" r="2" />
                <path d="m21 16-5-5-9 9" />
              </svg>
              <strong>{t("pm.coverTitle")}</strong>
              <span>{t("pm.coverHint")}</span>
            </button>
          )}
          <input
            ref={fileRef}
            type="file"
            accept={AVATAR_ACCEPTED_TYPES.join(",")}
            hidden
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) void pickCover(file);
              event.target.value = "";
            }}
          />
        </div>
        {issue ? <p className="wiz-inline-error">{issue}</p> : null}

        <div className="pm-grid">
          <div className={"pm-field pm-wide" + (tried && !titleOk ? " invalid" : "")}>
            <label htmlFor="pm-title">
              {t("account.projectTitle")} <b aria-hidden="true">*</b>
            </label>
            <input
              ref={titleRef}
              id="pm-title"
              type="text"
              maxLength={80}
              value={project.title}
              placeholder={t("account.projectTitlePlaceholder")}
              onChange={(event) => setProject({ ...project, title: event.target.value })}
            />
            {tried && !titleOk ? <em>{t("account.projectTitleShort")}</em> : null}
          </div>

          <div className="pm-field">
            <label htmlFor="pm-category">{t("account.projectCategory")}</label>
            <select
              id="pm-category"
              value={project.category}
              onChange={(event) => setProject({ ...project, category: event.target.value })}
            >
              {PORTFOLIO_CATEGORIES.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          <div className={"pm-field" + (tried && !linkOk ? " invalid" : "")}>
            <label htmlFor="pm-link">{t("account.projectLink")}</label>
            <input
              id="pm-link"
              type="text"
              inputMode="url"
              value={project.link}
              placeholder="your-project.com"
              onChange={(event) => setProject({ ...project, link: event.target.value })}
            />
            {tried && !linkOk ? <em>{t("links.invalid")}</em> : null}
          </div>

          <div className="pm-field pm-wide">
            <label htmlFor="pm-summary">{t("profile.projectDescription")}</label>
            <textarea
              id="pm-summary"
              rows={3}
              maxLength={SUMMARY_MAX}
              value={project.summary}
              placeholder={t("pm.summaryPlaceholder")}
              onChange={(event) => setProject({ ...project, summary: event.target.value })}
            />
            <small>
              {project.summary.length}/{SUMMARY_MAX}
            </small>
          </div>

          <div className="pm-field pm-wide">
            <label htmlFor="pm-tags">
              {t("account.projectTags")} <small>({project.tags.length}/{MAX_TAGS})</small>
            </label>
            <div className="pm-tags">
              {project.tags.map((tag) => (
                <span key={tag}>
                  {tag}
                  <button
                    type="button"
                    aria-label={t("skills.remove", { skill: tag })}
                    onClick={() => setProject({ ...project, tags: project.tags.filter((item) => item !== tag) })}
                  >
                    &times;
                  </button>
                </span>
              ))}
              {project.tags.length < MAX_TAGS ? (
                <input
                  id="pm-tags"
                  type="text"
                  value={tagText}
                  placeholder={project.tags.length ? "" : "React, Next.js, Figma"}
                  onChange={(event) => setTagText(event.target.value)}
                  onKeyDown={onTagKey}
                  onBlur={() => addTags(tagText)}
                />
              ) : null}
            </div>
          </div>
        </div>

        <div className="pm-modal-foot">
          <button type="button" className="ob-btn-ghost" onClick={onCancel}>
            {t("avatar.cancel")}
          </button>
          <button type="button" className="ob-btn-primary" onClick={() => void submit()} disabled={busy}>
            {busy ? t("avatar.saving") : initial.id ? t("pm.saveChanges") : t("account.addProject")}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------ the manager ------------------------------ */

export default function PortfolioManager({
  projects,
  onChange,
}: {
  projects: PortfolioProject[];
  onChange: (projects: PortfolioProject[]) => void;
}) {
  const { t } = useI18n();
  const { toast } = useUI();
  const { account } = useAuth();
  const accountId = account?.id ?? "";
  const [editing, setEditing] = useState<PortfolioProject | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);
  const full = projects.length >= MAX_PROJECTS;

  const commitOrder = (next: PortfolioProject[]) => {
    onChange(next);
    if (accountId) void savePortfolioOrder(next);
  };

  const save = async (project: PortfolioProject) => {
    let saved = project;
    if (accountId && project.image.startsWith("data:")) {
      const url = await uploadDataUrl("portfolio", accountId, project.image, "cover");
      if (url) saved = { ...saved, image: url };
    }
    const isNew = !saved.id;
    if (isNew) saved = { ...saved, id: uid() };
    const next = isNew
      ? [saved, ...projects]
      : projects.map((item) => (item.id === saved.id ? saved : item));
    onChange(next);
    if (accountId) {
      const ok = await savePortfolioProject(accountId, saved);
      if (!ok) toast(t("pm.saveFailed"));
      if (isNew) void savePortfolioOrder(next);
    }
    setEditing(null);
    toast(isNew ? t("account.projectAdded") : t("pm.updated"));
  };

  const remove = (id: string) => {
    const next = projects.filter((item) => item.id !== id);
    onChange(next);
    void deletePortfolioProject(id);
    if (accountId) void savePortfolioOrder(next);
    setConfirmId(null);
    toast(t("account.projectRemoved"));
  };

  const move = (from: number, to: number) => {
    if (from === to || to < 0 || to >= projects.length) return;
    const next = [...projects];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    commitOrder(next);
  };

  const dragProps = (index: number) => ({
    draggable: true,
    onDragStart: (event: ReactDragEvent<HTMLLIElement>) => {
      setDragIndex(index);
      event.dataTransfer.effectAllowed = "move";
      event.dataTransfer.setData("text/plain", String(index));
    },
    onDragOver: (event: ReactDragEvent<HTMLLIElement>) => {
      event.preventDefault();
      setOverIndex(index);
    },
    onDrop: (event: ReactDragEvent<HTMLLIElement>) => {
      event.preventDefault();
      if (dragIndex !== null) move(dragIndex, index);
      setDragIndex(null);
      setOverIndex(null);
    },
    onDragEnd: () => {
      setDragIndex(null);
      setOverIndex(null);
    },
  });

  return (
    <div className="wiz-card pm-card">
      <div className="wiz-card-head sl-head">
        <div>
          <h3>{t("account.portfolioTitle")}</h3>
          <p>{t("pm.sub")}</p>
        </div>
        <span className={"sk-counter" + (projects.length > 0 ? " ok" : "")}>
          {projects.length}/{MAX_PROJECTS}
        </span>
      </div>

      <ul className="pm-list">
        <li className="pm-add-tile">
          <button
            id="field-projects"
            type="button"
            className="pm-add"
            disabled={full}
            onClick={() => setEditing(blankProject())}
          >
            <span aria-hidden="true">+</span>
            <strong>{full ? t("pm.limit", { max: MAX_PROJECTS }) : t("account.addProject")}</strong>
            <em>{t("pm.addHint")}</em>
          </button>
        </li>

        {projects.map((project, index) => (
          <li
            key={project.id}
            className={
              "pm-item" +
              (dragIndex === index ? " dragging" : "") +
              (overIndex === index && dragIndex !== index ? " over" : "")
            }
            {...dragProps(index)}
          >
            <div className="pm-thumb" style={projectCoverStyle(project)}>
              {!project.image ? <span>{portfolioGlyph(project.category)}</span> : null}
              <span className="pm-order">{index + 1}</span>
            </div>
            <div className="pm-body">
              <strong>{project.title}</strong>
              <span className="pm-cat">{project.category}</span>
              {project.tags.length > 0 ? (
                <div className="pm-chips">
                  {project.tags.slice(0, 3).map((tag) => (
                    <span key={tag}>{tag}</span>
                  ))}
                  {project.tags.length > 3 ? <span>+{project.tags.length - 3}</span> : null}
                </div>
              ) : null}
              {project.link ? (
                <a className="pm-link" href={project.link} target="_blank" rel="noopener noreferrer">
                  {displayLink(project.link)}
                </a>
              ) : null}
            </div>

            {confirmId === project.id ? (
              <div className="pm-confirm">
                <span>{t("pm.confirmDelete")}</span>
                <button type="button" className="danger" onClick={() => remove(project.id)}>
                  {t("pm.yesDelete")}
                </button>
                <button type="button" onClick={() => setConfirmId(null)}>
                  {t("avatar.cancel")}
                </button>
              </div>
            ) : (
              <div className="pm-actions">
                <button type="button" aria-label={t("pm.moveLeft", { title: project.title })} disabled={index === 0} onClick={() => move(index, index - 1)}>
                  ‹
                </button>
                <button
                  type="button"
                  aria-label={t("pm.moveRight", { title: project.title })}
                  disabled={index === projects.length - 1}
                  onClick={() => move(index, index + 1)}
                >
                  ›
                </button>
                <button type="button" className="pm-edit" onClick={() => setEditing(project)}>
                  {t("wizard.edit")}
                </button>
                <button type="button" className="pm-del" onClick={() => setConfirmId(project.id)}>
                  {t("account.removeProject")}
                </button>
              </div>
            )}
          </li>
        ))}
      </ul>

      {editing ? <ProjectEditor initial={editing} onCancel={() => setEditing(null)} onSave={save} /> : null}
    </div>
  );
}
