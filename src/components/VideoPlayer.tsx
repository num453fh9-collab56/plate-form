"use client";

import { useState } from "react";
import { parseVideo } from "@/lib/video";

/* ==========================================================================
   APEX · VIDEO PLAYER
   A light-mode friendly 16:9 media frame. Until the visitor clicks, it shows
   a real first-frame / poster thumbnail behind a clean play button overlay.
   Clicking swaps in a native <video controls> (MP4/WebM) or an <iframe>
   (YouTube / Vimeo) so buyers can watch right inside the profile card.
   ========================================================================== */

function BrandMark() {
  return (
    <span
      style={{
        position: "absolute",
        right: 10,
        bottom: 10,
        zIndex: 3,
        background: "rgba(17,17,17,0.72)",
        color: "#fff",
        padding: "4px 10px",
        borderRadius: 7,
        fontSize: "0.68rem",
        fontWeight: 800,
        letterSpacing: "0.08em",
        pointerEvents: "none",
        backdropFilter: "blur(2px)",
      }}
    >
      Apex
    </span>
  );
}

function PlayGlyph({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M8 5v14l11-7z" />
    </svg>
  );
}

export function VideoThumb({
  src,
  poster,
  title,
  ratio,
  className = "",
  onPlay,
  label,
}: {

  src: string;
  poster?: string;
  title?: string;
  ratio?: string;
  className?: string;
  onPlay: () => void;
  label?: string;
}) {
  const media = parseVideo(src, poster);

  return (
    <button
      type="button"
      className={"video-thumb " + className}
      style={ratio ? { aspectRatio: ratio, position: "relative" } : { position: "relative" }}
      onClick={onPlay}
      aria-label={label ?? title ?? "Play video"}
    >
      {media.kind === "file" ? (
        <video
          className="video-thumb-media"
          src={media.src}
          poster={media.poster}
          muted
          playsInline
          preload="metadata"
          aria-hidden="true"
          onLoadedMetadata={(event) => {
            try {
              event.currentTarget.currentTime = 0.05;
            } catch {
              /* some browsers block seeking before enough data is buffered */
            }
          }}
        />
      ) : media.poster ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img className="video-thumb-media" src={media.poster} alt="" loading="lazy" />
      ) : null}
      <span className="video-thumb-scrim" aria-hidden="true" />
      <span className="video-play" aria-hidden="true">
        <PlayGlyph />
      </span>
      {title ? <span className="video-thumb-title">{title}</span> : null}
      <BrandMark />
    </button>
  );
}

export default function VideoPlayer({
  src,
  poster,
  title,
  ratio = "16 / 9",
  className = "",
  autoPlay = false,
}: {
  src: string;
  poster?: string;
  title?: string;
  ratio?: string;
  className?: string;
  autoPlay?: boolean;
}) {
  const [active, setActive] = useState(autoPlay);
  const media = parseVideo(src, poster);

  if (active) {
    return (
      <div className={"video-player is-active " + className} style={{ position: "relative" }}>
        {media.kind === "embed" ? (
          <iframe
            className="video-player-media"
            src={media.src}
            title={title || "Video player"}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <video
            className="video-player-media"
            src={media.src}
            poster={media.poster}
            controls
            autoPlay
            playsInline
          />
        )}
        <BrandMark />
      </div>
    );
  }

  return (
    <div className={"video-player " + className} style={{ aspectRatio: ratio, position: "relative" }}>
      <VideoThumb
        src={src}
        poster={poster}
        title={title}
        className="video-player-fill"
        onPlay={() => setActive(true)}
        label={title ? `${title} — play` : "Play video"}
      />
    </div>
  );
}
