"use client";

import type { KeyboardEvent as ReactKeyboardEvent, PointerEvent as ReactPointerEvent } from "react";
import { useEffect, useRef, useState } from "react";
import { useI18n } from "@/lib/i18n";
import {
  AVATAR_ACCEPTED_TYPES,
  AVATAR_MIN_SIDE,
  MAX_AVATAR_SOURCE_BYTES,
  cropImageToSquare,
  loadImage,
  maxCropOffset,
  readFileAsDataUrl,
} from "@/lib/media";
import type { SquareCrop } from "@/lib/media";

/* ==========================================================================
   HIRELYX · AVATAR UPLOADER
   Drag & drop (or click) a photo, validate type / size / resolution, then
   frame it in a circular crop with zoom + drag-to-pan before it is saved.
   The crop renders to a 400×400 JPEG so storage stays small and every avatar
   across the marketplace is a consistent, centred square.
   ========================================================================== */

const MIN_ZOOM = 1;
const MAX_ZOOM = 3;
const CENTRED: SquareCrop = { zoom: 1, offsetX: 0, offsetY: 0 };

interface Source {
  src: string;
  width: number;
  height: number;
}

function clampCrop(crop: SquareCrop, source: Source): SquareCrop {
  const zoom = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, crop.zoom));
  const limit = maxCropOffset(source.width, source.height, zoom);
  return {
    zoom,
    offsetX: Math.max(-limit.x, Math.min(limit.x, crop.offsetX)),
    offsetY: Math.max(-limit.y, Math.min(limit.y, crop.offsetY)),
  };
}

function UploadIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 16V4M7 9l5-5 5 5" />
      <path d="M4 16v3a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-3" />
    </svg>
  );
}

export default function AvatarUploader({
  value,
  fallback,
  error,
  onSave,
  onRemove,
}: {
  value: string;
  fallback: string;
  error?: string;
  onSave: (dataUrl: string) => Promise<void> | void;
  onRemove: () => void;
}) {
  const { t } = useI18n();
  const inputRef = useRef<HTMLInputElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ x: number; y: number; crop: SquareCrop; side: number } | null>(null);
  const [over, setOver] = useState(false);
  const [issue, setIssue] = useState("");
  const [source, setSource] = useState<Source | null>(null);
  const [crop, setCrop] = useState<SquareCrop>(CENTRED);
  const [saving, setSaving] = useState(false);

  /* The crop dialog sits above the onboarding shell — Escape closes only it. */
  useEffect(() => {
    if (!source) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.stopImmediatePropagation();
        setSource(null);
      }
    };
    document.addEventListener("keydown", onKeyDown, true);
    return () => document.removeEventListener("keydown", onKeyDown, true);
  }, [source]);

  const pick = async (file: File) => {
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
      const src = await readFileAsDataUrl(file);
      const image = await loadImage(src);
      if (Math.min(image.width, image.height) < AVATAR_MIN_SIDE) {
        setIssue(t("avatar.errSmall", { min: AVATAR_MIN_SIDE }));
        return;
      }
      setCrop(CENTRED);
      setSource({ src, width: image.width, height: image.height });
    } catch {
      setIssue(t("video.errRead"));
    }
  };

  const updateCrop = (next: SquareCrop) => {
    if (source) setCrop(clampCrop(next, source));
  };

  const onPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    const frame = frameRef.current;
    if (!frame) return;
    frame.setPointerCapture(event.pointerId);
    dragRef.current = {
      x: event.clientX,
      y: event.clientY,
      crop,
      side: frame.getBoundingClientRect().width,
    };
  };

  const onPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.side <= 0) return;
    updateCrop({
      zoom: drag.crop.zoom,
      offsetX: drag.crop.offsetX + (event.clientX - drag.x) / drag.side,
      offsetY: drag.crop.offsetY + (event.clientY - drag.y) / drag.side,
    });
  };

  const endDrag = () => {
    dragRef.current = null;
  };

  const onFrameKey = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    const step = 0.02;
    const moves: Record<string, [number, number]> = {
      ArrowLeft: [-step, 0],
      ArrowRight: [step, 0],
      ArrowUp: [0, -step],
      ArrowDown: [0, step],
    };
    const move = moves[event.key];
    if (move) {
      event.preventDefault();
      updateCrop({ ...crop, offsetX: crop.offsetX + move[0], offsetY: crop.offsetY + move[1] });
    } else if (event.key === "+" || event.key === "=") {
      updateCrop({ ...crop, zoom: crop.zoom + 0.1 });
    } else if (event.key === "-") {
      updateCrop({ ...crop, zoom: crop.zoom - 0.1 });
    }
  };

  const save = async () => {
    if (!source) return;
    setSaving(true);
    try {
      const dataUrl = await cropImageToSquare(source.src, crop);
      setSource(null);
      await onSave(dataUrl);
    } catch {
      setIssue(t("video.errRead"));
    } finally {
      setSaving(false);
    }
  };

  const shortSide = source ? Math.min(source.width, source.height) : 1;
  const message = issue || error;

  return (
    <div className="avu">
      <div
        className={"avu-drop" + (over ? " over" : "") + (message ? " invalid" : "")}
        onDragOver={(event) => {
          event.preventDefault();
          setOver(true);
        }}
        onDragLeave={() => setOver(false)}
        onDrop={(event) => {
          event.preventDefault();
          setOver(false);
          const file = event.dataTransfer.files?.[0];
          if (file) void pick(file);
        }}
      >
        <div className={"avu-avatar" + (value ? " filled" : "")}>
          {value ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={value} alt="" />
          ) : (
            <span>{fallback}</span>
          )}
          {value ? (
            <span className="avu-avatar-ok" aria-hidden="true">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 6 9 17l-5-5" />
              </svg>
            </span>
          ) : null}
        </div>

        <div className="avu-copy">
          <span className="avu-icon" aria-hidden="true">
            <UploadIcon />
          </span>
          <strong>{t("avatar.dropTitle")}</strong>
          <span className="avu-hint">{t("avatar.dropHint", { max: Math.round(MAX_AVATAR_SOURCE_BYTES / 1048576) })}</span>
          <div className="avu-actions">
            <button
              id="field-avatar"
              type="button"
              className="ob-btn-primary btn-sm"
              onClick={() => inputRef.current?.click()}
            >
              {value ? t("profile.photoChange") : t("profile.photoUpload")}
            </button>
            {value ? (
              <button
                type="button"
                className="ob-btn-ghost btn-sm danger"
                onClick={() => {
                  setIssue("");
                  onRemove();
                }}
              >
                {t("profile.remove")}
              </button>
            ) : null}
          </div>
        </div>

        <ul className="avu-tips">
          <li>{t("avatar.tip1")}</li>
          <li>{t("avatar.tip2")}</li>
          <li>{t("avatar.tip3")}</li>
        </ul>

        <input
          ref={inputRef}
          type="file"
          accept={AVATAR_ACCEPTED_TYPES.join(",")}
          hidden
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) void pick(file);
            event.target.value = "";
          }}
        />
      </div>
      {message ? (
        <p className="wiz-inline-error" role="alert">
          {message}
        </p>
      ) : null}

      {source ? (
        <div className="avu-modal" role="dialog" aria-modal="true" aria-labelledby="avuTitle">
          <div className="avu-modal-card">
            <div className="avu-modal-head">
              <h3 id="avuTitle">{t("avatar.cropTitle")}</h3>
              <p>{t("avatar.cropSub")}</p>
            </div>

            <div
              ref={frameRef}
              className="avu-frame"
              tabIndex={0}
              aria-label={t("avatar.cropTitle")}
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={endDrag}
              onPointerCancel={endDrag}
              onKeyDown={onFrameKey}
              onWheel={(event) => updateCrop({ ...crop, zoom: crop.zoom - event.deltaY * 0.0015 })}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={source.src}
                alt=""
                draggable={false}
                style={{
                  width: `${(source.width / shortSide) * crop.zoom * 100}%`,
                  left: `${50 + crop.offsetX * 100}%`,
                  top: `${50 + crop.offsetY * 100}%`,
                }}
              />
              <span className="avu-frame-ring" aria-hidden="true" />
            </div>

            <label className="avu-zoom">
              <span aria-hidden="true">−</span>
              <input
                type="range"
                min={MIN_ZOOM}
                max={MAX_ZOOM}
                step={0.01}
                value={crop.zoom}
                aria-label={t("avatar.zoom")}
                onChange={(event) => updateCrop({ ...crop, zoom: Number(event.target.value) })}
              />
              <span aria-hidden="true">+</span>
            </label>

            <div className="avu-modal-foot">
              <button type="button" className="ob-btn-ghost btn-sm" onClick={() => setCrop(CENTRED)}>
                {t("avatar.reset")}
              </button>
              <div className="avu-modal-actions">
                <button type="button" className="ob-btn-ghost" onClick={() => setSource(null)}>
                  {t("avatar.cancel")}
                </button>
                <button type="button" className="ob-btn-primary" onClick={() => void save()} disabled={saving}>
                  {saving ? t("avatar.saving") : t("avatar.save")}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
