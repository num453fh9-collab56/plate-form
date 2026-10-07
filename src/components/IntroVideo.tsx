"use client";

import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/lib/auth";
import { useI18n } from "@/lib/i18n";
import { useUI } from "@/lib/ui";
import {
  dataUrlBytes,
  formatBytes,
  MAX_RECORDING_SECONDS,
  MAX_VIDEO_BYTES,
  readFileAsDataUrl,
} from "@/lib/media";
import { uploadBlob, uploadFile } from "@/lib/storage";
import type { MediaBucket } from "@/lib/storage";
import VideoPlayer from "./VideoPlayer";

const MAX_MB = Math.round(MAX_VIDEO_BYTES / 1048576);

function pickMimeType(): string | undefined {
  if (typeof MediaRecorder === "undefined") return undefined;
  const candidates = [
    "video/webm;codecs=vp9,opus",
    "video/webm;codecs=vp8,opus",
    "video/webm",
    "video/mp4",
  ];
  return candidates.find((type) => {
    try {
      return MediaRecorder.isTypeSupported(type);
    } catch {
      return false;
    }
  });
}

interface IntroVideoProps {
  src: string;
  name: string;
  onChange: (src: string, name: string) => void;
  bucket?: MediaBucket;
}

export default function IntroVideo({
  src,
  name,
  onChange,
  bucket = "intro-videos",
}: IntroVideoProps) {
  const { t } = useI18n();
  const { toast } = useUI();
  const { account } = useAuth();
  const fileRef = useRef<HTMLInputElement>(null);
  const liveRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);
  const elapsedRef = useRef(0);

  const [link, setLink] = useState("");
  const [recording, setRecording] = useState(false);
  const [live, setLive] = useState(false);
  const [elapsed, setElapsed] = useState(0);

  function stopStream() {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    setLive(false);
  }

  function stopRecording() {
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
    const recorder = recorderRef.current;
    if (recorder && recorder.state !== "inactive") recorder.stop();
    recorderRef.current = null;
    setRecording(false);
  }

  useEffect(() => {
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
      const recorder = recorderRef.current;
      if (recorder && recorder.state !== "inactive") recorder.stop();
      streamRef.current?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  useEffect(() => {
    if (live && liveRef.current && streamRef.current) {
      liveRef.current.srcObject = streamRef.current;
      liveRef.current.play().catch(() => {});
    }
  }, [live]);

  async function handleFile(file: File) {
    if (!file.type.startsWith("video/")) {
      toast(t("video.errRead"));
      return;
    }
    if (file.size > MAX_VIDEO_BYTES) {
      toast(t("video.tooLarge", { max: MAX_MB }));
      return;
    }
    try {
      const dataUrl = await readFileAsDataUrl(file);
      if (account?.id) {
        const url = await uploadFile(bucket, account.id, file);
        if (url) {
          onChange(url, file.name);
          return;
        }
      }
      onChange(dataUrl, file.name);
    } catch {
      toast(t("video.errRead"));
    }
  }

  function attachLink() {
    const clean = link.trim();
    if (!/^https?:\/\/\S+$/i.test(clean)) {
      toast(t("video.errUrl"));
      return;
    }
    const label = clean.replace(/^https?:\/\//, "").slice(0, 64);
    onChange(clean, label);
    setLink("");
  }

  async function startRecording() {
    if (
      typeof navigator === "undefined" ||
      !navigator.mediaDevices?.getUserMedia ||
      typeof MediaRecorder === "undefined"
    ) {
      toast(t("video.errRecord"));
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      streamRef.current = stream;
      setLive(true);

      const mimeType = pickMimeType();
      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      chunksRef.current = [];
      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) chunksRef.current.push(event.data);
      };
      recorder.onstop = async () => {
        const type = recorder.mimeType || "video/webm";
        const blob = new Blob(chunksRef.current, { type });
        chunksRef.current = [];
        streamRef.current?.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
        setLive(false);
        try {
          const dataUrl = await readFileAsDataUrl(blob);
          if (dataUrlBytes(dataUrl) > MAX_VIDEO_BYTES) {
            toast(t("video.tooLarge", { max: MAX_MB }));
            return;
          }
          if (account?.id) {
            const url = await uploadBlob(bucket, account.id, blob, "intro");
            if (url) {
              onChange(url, "apex-intro.webm");
              return;
            }
          }
          onChange(dataUrl, "apex-intro.webm");
        } catch {
          toast(t("video.errRead"));
        }
      };

      recorderRef.current = recorder;
      recorder.start();
      setRecording(true);
      setElapsed(0);
      elapsedRef.current = 0;
      timerRef.current = window.setInterval(() => {
        elapsedRef.current += 1;
        setElapsed(elapsedRef.current);
        if (elapsedRef.current >= MAX_RECORDING_SECONDS) stopRecording();
      }, 1000);
    } catch {
      stopStream();
      toast(t("video.errCamera"));
    }
  }

  if (src) {
    return (
      <div className="intro-video">
        <VideoPlayer src={src} title={name || t("video.ready")} />
        <div className="intro-video-meta">
          <span className="intro-video-name">{name || t("video.ready")}</span>
          {/^https?:/i.test(src) ? null : (
            <span className="intro-video-size">{formatBytes(dataUrlBytes(src))}</span>
          )}
        </div>
        <div className="intro-video-actions">
          <button type="button" className="btn-ghost btn-sm" onClick={() => fileRef.current?.click()}>
            {t("video.replace")}
          </button>
          <button type="button" className="btn-ghost btn-sm danger" onClick={() => onChange("", "")}>
            {t("video.remove")}
          </button>
        </div>
        <input
          ref={fileRef}
          type="file"
          accept="video/*"
          hidden
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) void handleFile(file);
            event.target.value = "";
          }}
        />
      </div>
    );
  }

  return (
    <div className="intro-video">
      {live && (
        <div className="intro-recorder">
          <video ref={liveRef} className="intro-live" muted playsInline />
          <div className="intro-recorder-bar">
            {recording ? (
              <>
                <span className="rec-dot" aria-hidden="true" />
                <span>{t("video.recording", { time: elapsed })}</span>
                <button type="button" className="btn-dark btn-sm" onClick={stopRecording}>
                  {t("video.stop")}
                </button>
              </>
            ) : (
              <button type="button" className="btn-primary btn-sm" onClick={startRecording}>
                {t("video.start")}
              </button>
            )}
          </div>
        </div>
      )}

      <div className="intro-drop">
        <button type="button" className="intro-action" onClick={() => fileRef.current?.click()}>
          <span className="intro-action-icon" aria-hidden="true">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 5v14" />
              <path d="M5 12h14" />
            </svg>
          </span>
          <span className="intro-action-title">{t("video.upload")}</span>
        </button>
        <button
          type="button"
          className="intro-action"
          onClick={() => {
            if (live) {
              stopStream();
            } else {
              void startRecording();
            }
          }}
        >
          <span className="intro-action-icon" aria-hidden="true">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="9" />
              <circle cx="12" cy="12" r="3.2" fill="currentColor" stroke="none" />
            </svg>
          </span>
          <span className="intro-action-title">{t("video.record")}</span>
        </button>
      </div>

      <div className="intro-link">
        <input
          type="text"
          value={link}
          placeholder={t("video.urlPlaceholder")}
          onChange={(event) => setLink(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              attachLink();
            }
          }}
        />
        <button type="button" className="btn-ghost btn-sm" onClick={attachLink}>
          {t("video.attach")}
        </button>
      </div>

      <p className="intro-hint">{t("video.maxHint", { max: MAX_MB, seconds: MAX_RECORDING_SECONDS })}</p>

      <input
        ref={fileRef}
        type="file"
        accept="video/*"
        hidden
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) void handleFile(file);
          event.target.value = "";
        }}
      />
    </div>
  );
}
