"use client";

import { useEffect, useRef, useState } from "react";
import { useI18n } from "@/lib/i18n";

/* ==========================================================================
   APEX · SUCCESS SHOWCASE
   --------------------------------------------------------------------------
   Videos are served from public/videos. Drop your own .mp4 files there and
   update CLIPS below. TOPICS control the expertise blocks under the player.
   ========================================================================== */
const CLIPS = [
  {
    id: "brand",
    src: "/videos/showcase-1.mp4",
    tag: "Brand Film",
    title: "The Apex story, in ten seconds",
  },
  {
    id: "product",
    src: "/videos/showcase-2.mp4",
    tag: "Product Walkthrough",
    title: "How work gets done on Apex",
  },
];

const TOPICS = [
  {
    badge: "UX",
    title: "Design & Brand",
    text: "Product design, brand identity and design systems built to scale.",
  },
  {
    badge: "DEV",
    title: "Web Development",
    text: "Fast, accessible web apps built with modern frameworks.",
  },
  {
    badge: "MOT",
    title: "Motion & Video",
    text: "Story-driven edits, motion graphics and cinematic brand films.",
  },
  {
    badge: "AI",
    title: "AI & Automation",
    text: "Practical AI and workflow automation for real products.",
  },
  {
    badge: "MKT",
    title: "Marketing & Growth",
    text: "Positioning, campaigns and content that convert.",
  },
  {
    badge: "DOC",
    title: "Writing & Content",
    text: "Clear copy and content for products and brands.",
  },
];

export default function SuccessShowcase() {
  const { t } = useI18n();
  const [active, setActive] = useState(0);
  const [playing, setPlaying] = useState(true);
  const videoRefs = useRef<Array<HTMLVideoElement | null>>([]);
  const clip = CLIPS[active];

  useEffect(() => {
    videoRefs.current.forEach((video, index) => {
      if (!video) return;
      if (index === active) {
        video.currentTime = 0;
        const playPromise = video.play();
        if (playPromise) {
          playPromise.then(() => setPlaying(true)).catch(() => setPlaying(false));
        }
      } else {
        video.pause();
      }
    });
  }, [active]);

  const togglePlay = () => {
    const video = videoRefs.current[active];
    if (!video) return;
    if (video.paused) {
      const playPromise = video.play();
      if (playPromise) playPromise.catch(() => {});
      setPlaying(true);
    } else {
      video.pause();
      setPlaying(false);
    }
  };

  const selectClip = (index: number) => {
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

        <div className="player-card">
          <div className="player-media">
            {CLIPS.map((item, index) => (
              <video
                key={item.id}
                ref={(element) => {
                  videoRefs.current[index] = element;
                }}
                className={"player-video" + (index === active ? " is-active" : "")}
                src={item.src}
                muted
                loop
                playsInline
                preload="auto"
                autoPlay={index === 0}
              />
            ))}
            <span className="player-scrim" aria-hidden="true" />
            <span className="player-tag">{clip.tag}</span>
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
          </div>
          <div className="player-bar">
            <div className="player-now">
              <span className="player-now-label">{t("success.nowPlaying")}</span>
              <strong key={clip.id}>{clip.title}</strong>
            </div>
            <div
              className="player-switch"
              role="tablist"
              aria-label={t("success.switchLabel")}
            >
              {CLIPS.map((item, index) => (
                <button
                  key={item.id}
                  type="button"
                  role="tab"
                  aria-selected={index === active}
                  className={"switch" + (index === active ? " active" : "")}
                  onClick={() => selectClip(index)}
                >
                  <span className="switch-dot" aria-hidden="true" />
                  {item.tag}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="success-topics">
          {TOPICS.map((topic) => (
            <article className="topic-card" key={topic.title}>
              <span className="topic-badge" aria-hidden="true">
                {topic.badge}
              </span>
              <h3>{topic.title}</h3>
              <p>{topic.text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
