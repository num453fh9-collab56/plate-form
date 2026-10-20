"use client";

import { useEffect, useMemo, useState } from "react";
import type { PortfolioProject } from "@/lib/types";
import { useAuth, useRequireAuth } from "@/lib/auth";
import { useUI } from "@/lib/ui";
import { useI18n } from "@/lib/i18n";
import {
  fetchPortfolioProjects,
  coverStyle,
  portfolioGlyph,
} from "@/lib/portfolio";
import VideoPlayer from "./VideoPlayer";

/* ==========================================================================
   HIRELYX · PORTFOLIO SHOWCASE — ENHANCED
   Category filters, animated cards, tech stack tags, lightbox-ready,
   and polished empty state.
   ========================================================================== */

function ExternalIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <path d="M15 3h6v6" />
      <path d="M10 14 21 3" />
    </svg>
  );
}

function PlayIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M8 5v14l11-7z" />
    </svg>
  );
}

function ProjectCard({
  project,
  mine,
  mineLabel,
  previewLabel,
  watchLabel,
}: {
  project: PortfolioProject;
  mine?: boolean;
  mineLabel: string;
  previewLabel: string;
  watchLabel: string;
}) {
  const { openVideo } = useUI();
  const videoSrc = project.video || null;
  const hasVideo = Boolean(videoSrc);

  const coverInner = (
    <>
      {project.image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          className="project-image"
          src={project.image}
          alt={project.title}
          loading="lazy"
        />
      ) : (
        <span className="project-glyph" aria-hidden="true">
          {portfolioGlyph(project.category)}
        </span>
      )}
      <span className="project-cat">{project.category}</span>
      {mine ? <span className="project-mine">{mineLabel}</span> : null}
      {hasVideo ? (
        <span className="video-play" aria-hidden="true">
          <PlayIcon />
        </span>
      ) : null}
    </>
  );

  return (
    <article className={"project-card" + (mine ? " is-mine" : "")}>
      {hasVideo ? (
        <button
          type="button"
          className="project-cover project-cover-play"
          style={project.image ? undefined : coverStyle(project.cover)}
          aria-label={watchLabel}
          onClick={() =>
            openVideo({
              src: videoSrc as string,
              title: project.videoName || project.title,
            })
          }
        >
          {coverInner}
        </button>
      ) : (
        <div className="project-cover" style={project.image ? undefined : coverStyle(project.cover)}>
          {coverInner}
        </div>
      )}
      <div className="project-body">
        <h3>{project.title}</h3>
        {project.summary ? <p>{project.summary}</p> : null}
        {project.tags.length > 0 ? (
          <div className="project-tags">
            {project.tags.map((tag) => (
              <span className="project-tag" key={tag}>
                {tag}
              </span>
            ))}
          </div>
        ) : null}
        {project.link ? (
          <a
            className="project-link"
            href={project.link}
            target="_blank"
            rel="noopener noreferrer"
          >
            {previewLabel}
            <ExternalIcon />
          </a>
        ) : null}
      </div>
    </article>
  );
}

export default function PortfolioShowcase() {
  const { user, profile } = useAuth();
  const { openAccount } = useUI();
  const requireAuth = useRequireAuth();
  const { t } = useI18n();

  const userId = user?.sub;
  const [allProjects, setAllProjects] = useState<PortfolioProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("All");

  useEffect(() => {
    let cancelled = false;
    void fetchPortfolioProjects().then((list) => {
      if (!cancelled) {
        setAllProjects(list);
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const categories = useMemo(() => {
    const cats = new Set(allProjects.map((p) => p.category).filter(Boolean));
    return ["All", ...Array.from(cats)];
  }, [allProjects]);

  const mine = useMemo(
    () => (userId ? allProjects.filter((project) => project.userId === userId) : []),
    [allProjects, userId],
  );

  const projects = useMemo(() => {
    const others = allProjects.filter((project) => project.userId !== userId);
    const all = [...mine, ...others];
    if (activeFilter === "All") return all;
    return all.filter((p) => p.category === activeFilter);
  }, [allProjects, mine, userId, activeFilter]);

  return (
    <section className="section portfolio" id="portfolio">
      <div className="wrap">
        <div className="section-head">
          <div>
            <div className="kicker">{t("portfolio.kicker")}</div>
            <h2>{t("portfolio.title")}</h2>
            <p className="sub">{t("portfolio.sub")}</p>
          </div>
          <button className="btn-post" type="button" onClick={() => requireAuth(openAccount)}>
            + {t("portfolio.add")}
          </button>
        </div>

        {/* Category Filters */}
        {categories.length > 2 && (
          <div className="pf-filters">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                className={"pf-filter" + (activeFilter === cat ? " pf-filter-active" : "")}
                onClick={() => setActiveFilter(cat)}
              >
                {cat}
                {cat !== "All" && (
                  <span className="pf-filter-count">
                    {allProjects.filter((p) => p.category === cat).length}
                  </span>
                )}
              </button>
            ))}
          </div>
        )}

        {user && profile.introVideo ? (
          <div className="portfolio-intro">
            <div className="portfolio-intro-media">
              <VideoPlayer
                src={profile.introVideo}
                title={profile.introVideoName || t("video.introTitle")}
              />
            </div>
            <div className="portfolio-intro-copy">
              <span className="kicker">{t("video.introKicker")}</span>
              <h3>{profile.fullName || user.name}</h3>
              <p>{profile.title || t("profile.subtitle")}</p>
              {profile.bio ? <p className="portfolio-intro-bio">{profile.bio}</p> : null}
            </div>
          </div>
        ) : null}

        <div className="project-grid">
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              mine={mine.some((item) => item.id === project.id)}
              mineLabel={t("portfolio.yours")}
              previewLabel={t("portfolio.livePreview")}
              watchLabel={t("portfolio.watch")}
            />
          ))}
          {projects.length === 0 && (
            <div className="pf-empty" role="status">
              <div className="pf-empty-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="3" width="20" height="14" rx="2" />
                  <line x1="8" y1="21" x2="16" y2="21" />
                  <line x1="12" y1="17" x2="12" y2="21" />
                </svg>
              </div>
              <h3>{loading ? "Loading portfolio..." : "No projects yet"}</h3>
              <p>
                {loading
                  ? "Fetching our latest work..."
                  : activeFilter !== "All"
                    ? "No projects in this category. Try another filter."
                    : "Our portfolio is being built. Check back soon for featured projects."}
              </p>
              {!loading && activeFilter !== "All" && (
                <button type="button" className="pf-empty-reset" onClick={() => setActiveFilter("All")}>
                  Show all projects
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      <style>{`
        .pf-filters {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
          margin-bottom: 2rem;
        }
        .pf-filter {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          padding: 0.4rem 0.9rem;
          border: 1.5px solid var(--border);
          border-radius: 999px;
          background: var(--surface);
          font: inherit;
          font-size: 0.8rem;
          font-weight: 500;
          color: var(--text-secondary);
          cursor: pointer;
          transition: all 0.2s;
        }
        .pf-filter:hover {
          border-color: var(--accent, #0066cc);
          color: var(--text-primary);
        }
        .pf-filter-active {
          background: var(--accent, #0066cc);
          color: #fff;
          border-color: var(--accent, #0066cc);
        }
        .pf-filter-active:hover {
          color: #fff;
        }
        .pf-filter-count {
          background: rgba(255,255,255,0.2);
          padding: 0.1rem 0.4rem;
          border-radius: 999px;
          font-size: 0.68rem;
          font-weight: 700;
        }
        .pf-filter:not(.pf-filter-active) .pf-filter-count {
          background: var(--hover);
        }

        .pf-empty {
          grid-column: 1 / -1;
          text-align: center;
          padding: 4rem 2rem;
        }
        .pf-empty-icon {
          color: var(--text-secondary);
          opacity: 0.4;
          margin-bottom: 1rem;
        }
        .pf-empty h3 {
          font-size: 1.1rem;
          color: var(--text-primary);
          margin: 0 0 0.5rem;
        }
        .pf-empty p {
          color: var(--text-secondary);
          font-size: 0.88rem;
          max-width: 360px;
          margin: 0 auto;
        }
        .pf-empty-reset {
          margin-top: 1rem;
          background: none;
          border: 1.5px solid var(--border);
          border-radius: 0.5rem;
          padding: 0.5rem 1rem;
          font: inherit;
          font-size: 0.82rem;
          font-weight: 500;
          color: var(--accent, #0066cc);
          cursor: pointer;
        }
        .pf-empty-reset:hover {
          background: rgba(0,102,204,0.05);
        }
      `}</style>
    </section>
  );
}
