"use client";

import { useEffect } from "react";
import { useUI } from "@/lib/ui";
import VideoPlayer from "./VideoPlayer";

/* ==========================================================================
   APEX · VIDEO LIGHTBOX
   A single, app-wide cinema overlay. Any card (gig, portfolio project, or a
   freelancer intro) can call `openVideo(...)` from the UI context and the
   visitor gets a distraction-free player without leaving the page.
   ========================================================================== */

export default function VideoLightbox() {
  const { isVideoOpen, videoSrc, videoTitle, videoPoster, closeVideo } = useUI();

  useEffect(() => {
    if (!isVideoOpen) return;
    document.body.classList.add("modal-open");
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeVideo();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.classList.remove("modal-open");
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [isVideoOpen, closeVideo]);

  if (!isVideoOpen || !videoSrc) return null;

  return (
    <div
      className="video-lightbox"
      role="dialog"
      aria-modal="true"
      aria-label={videoTitle || "Video player"}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) closeVideo();
      }}
    >
      <div className="video-lightbox-inner">
        <div className="video-lightbox-bar">
          <span className="video-lightbox-title">{videoTitle}</span>
          <button
            className="video-lightbox-close"
            type="button"
            aria-label="Close"
            onClick={closeVideo}
          >
            &times;
          </button>
        </div>
        <VideoPlayer
          key={videoSrc}
          src={videoSrc}
          poster={videoPoster || undefined}
          title={videoTitle}
          autoPlay
        />
      </div>
    </div>
  );
}
