"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useI18n } from "@/lib/i18n";

/* ==========================================================================
   APEX · SUCCESS SHOWCASE
   --------------------------------------------------------------------------
   Fiverr-inspired case-study reel. Both HTML5 clips live in public/videos and
   are always mounted in the DOM; the reel cards below the player switch the
   active clip, reset playback and refresh the case-study caption.
   ========================================================================== */
const CLIPS = [
  {
    id: "brand",
    src: "/videos/showcase-1.mp4",
    type: "video/mp4",
    tag: "Brand Film",
    label: "Vontélle Eyewear",
    title: "Vontélle Eyewear turns to Apex freelancers to bring their vision to life.",
    desc: "A cinematic brand film crafted end-to-end by Apex creators.",
    thumb: "linear-gradient(140deg, #1d1d1f 0%, #0066cc 100%)",
  },
  {
    id: "product",
    src: "/videos/showcase-2.mp4",
    type: "video/mp4",
    tag: "Product Walkthrough",
    label: "How teams ship on Apex",
    title: "See how ambitious teams ship world-class work on Apex.",
    desc: "A guided tour of briefs, delivery and secure payments.",
    thumb: "linear-gradient(140deg, #004f9e 0%, #63b3ff 100%)",
  },
];

const GUIDES = [
  {
    step: "01",
    title: "Write a winning proposal",
    text: "Turn a client brief into a clear, confident pitch that wins the project.",
  },
  {
    step: "02",
    title: "Price your first project",
    text: "Set rates that reflect your skill and keep long-term clients coming back.",
  },
  {
    step: "03",
    title: "Build a standout profile",
    text: "Showcase your best work so the right clients find you first.",
  },
];

export default function SuccessShowcase() {
  const { t } = useI18n();
  const [active, setActive] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [errored, setErrored] = useState<Record<string, boolean>>({});
  const videoRefs = useRef<Array<HTMLVideoElement | null>>([]);
  const clip = CLIPS[active];

  const playActive = useCallback(() => {
    const video = videoRefs.current[active];
    if (!video) return;

    /* Reset to the start, but never throw if metadata is not ready yet. */
    try {
      if (video.readyState >= 1 && video.currentTime !== 0) {
        video.currentTime = 0;
      }
    } catch {
      /* Playback will simply begin from wherever the clip can start. */
    }

    const promise = video.play();
    if (promise && typeof promise.then === "function") {
      promise.then(() => setPlaying(true)).catch(() => setPlaying(false));
    }
  }, [active]);

  useEffect(() => {
    videoRefs.current.forEach((video, index) => {
      if (video && index !== active) video.pause();
    });
    playActive();
  }, [active, playActive]);

  const togglePlay = () => {
    const video = videoRefs.current[active];
    if (!video) return;
    if (video.paused) {
      const promise = video.play();
      if (promise && typeof promise.then === "function") {
        promise.then(() => setPlaying(true)).catch(() => setPlaying(false));
      } else {
        setPlaying(true);
      }
    } else {
      video.pause();
      setPlaying(false);
    }
  };

  const selectClip = (index: number) => {
    if (index === active) {
      const video = videoRefs.current[index];
      if (!video) return;
      try {
        video.currentTime = 0;
      } catch {
        /* ignore */
      }
      const promise = video.play();
      if (promise && typeof promise.then === "function") {
        promise.then(() => setPlaying(true)).catch(() => setPlaying(false));
      }
      return;
    }
    setPlaying(true);
    setActive(index);
  };

  return (
    <section className="section success" id="work">
      <div className="wrap">
        <div className="section-head">
          <div>
            <div className="kicker">{t("success.kicker")}</div>
            <h2>{t("success.title")}</h2>
            <p className="sub">{t("success.sub")}</p>
          </div>
        </div>

        <div className="showcase">
          <div className="player-card">
            <div className="player-media">
              {CLIPS.map((item, index) => (
                <video
                  key={item.id}
                  ref={(element) => {
                    videoRefs.current[index] = element;
                  }}
                  className={"player-video" + (index === active ? " is-active" : "")}
                  muted
                  loop
                  playsInline
                  preload={index === active ? "auto" : "metadata"}
                  autoPlay={index === 0}
                  onError={() =>
                    setErrored((previous) => ({ ...previous, [item.id]: true }))
                  }
                >
                  <source src={item.src} type={item.type} />
                </video>
              ))}

              {errored[clip.id] ? (
                <div className="player-fallback" role="status">
                  <span className="player-fallback-tag">{clip.tag}</span>
                  <p>{clip.title}</p>
                </div>
              ) : (
                <>
                  <span className="player-scrim" aria-hidden="true" />
                  <span className="player-counter">
                    0{active + 1} / 0{CLIPS.length}
                  </span>
                  <div className="player-caption">
                    <span className="player-caption-tag">{t("success.caseLabel")}</span>
                    <p className="player-caption-title" key={clip.id}>
                      {clip.title}
                    </p>
                    <p className="player-caption-desc">{clip.desc}</p>
                  </div>
                  <button
                    className="player-play"
                    type="button"
                    onClick={togglePlay}
                    aria-label={playing ? t("success.pause") : t("success.play")}
                  >
                    {playing ? (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                        <rect x="6" y="5" width="4" height="14" rx="1" />
                        <rect x="14" y="5" width="4" height="14" rx="1" />
                      </svg>
                    ) : (
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    )}
                  </button>
                </>
              )}
            </div>
          </div>

          <div className="reel" role="tablist" aria-label={t("success.switchLabel")}>
            {CLIPS.map((item, index) => (
              <button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={index === active}
                className={"reel-card" + (index === active ? " active" : "")}
                onClick={() => selectClip(index)}
              >
                <span className="reel-thumb" style={{ backgroundImage: item.thumb }}>
                  <span className="reel-num">0{index + 1}</span>
                  <span className="reel-play" aria-hidden="true">
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </span>
                </span>
                <span className="reel-meta">
                  <span className="reel-tag">{item.tag}</span>
                  <strong>{item.label}</strong>
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="guides-block">
          <div className="guides-head">
            <div>
              <div className="kicker">{t("success.guidesKicker")}</div>
              <h3>{t("success.guidesTitle")}</h3>
            </div>
            <a className="link-all" href="#experience">
              {t("success.seeMore")} <span aria-hidden="true">&rarr;</span>
            </a>
          </div>
          <div className="guides-grid">
            {GUIDES.map((guide) => (
              <article className="guide-card" key={guide.step}>
                <span className="guide-step" aria-hidden="true">
                  {guide.step}
                </span>
                <h4>{guide.title}</h4>
                <p>{guide.text}</p>
                <span className="guide-link">
                  {t("success.readGuide")} <span aria-hidden="true">&rarr;</span>
                </span>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
