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
   APEX · PORTFOLIO SHOWCASE
   A clean, light-mode grid of digital projects from Apex professionals.
   Signed-in users see their own projects pinned to the front of the grid,
   plus a featured intro video buyers can play without leaving the page.
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
  const hasVideo = Boolean(project.video);

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
              src: project.video as string,
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

  const mine = useMemo(
    () => (userId ? allProjects.filter((project) => project.userId === userId) : []),
    [allProjects, userId],
  );

  const projects = useMemo(() => {
    const others = allProjects.filter((project) => project.userId !== userId);
    return [...mine, ...others];
  }, [allProjects, mine, userId]);

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
            <div className="empty" role="status">
              <h3>{t("grid.emptyTitle")}</h3>
              <p>
                {loading
                  ? "Loading portfolio…"
                  : "No portfolio projects yet. Be the first to add one."}
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
