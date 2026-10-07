"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import type { Gig, PortfolioProject } from "@/lib/types";
import { fetchGigsBySeller, fetchPublicProfile } from "@/lib/api";
import type { PublicProfile } from "@/lib/api";
import { fetchMyPortfolioProjects, portfolioGlyph, projectCoverStyle } from "@/lib/portfolio";
import { initials } from "@/lib/format";
import { useI18n } from "@/lib/i18n";
import VideoPlayer from "@/components/VideoPlayer";
import GigCard from "@/components/GigCard";

export default function UserProfilePage() {
  const params = useParams<{ id: string }>();
  const id = params?.id ?? "";
  const router = useRouter();
  const { t } = useI18n();

  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [gigs, setGigs] = useState<Gig[]>([]);
  const [projects, setProjects] = useState<PortfolioProject[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    void Promise.all([
      fetchPublicProfile(id),
      fetchGigsBySeller(id),
      fetchMyPortfolioProjects(id),
    ]).then(([profileData, gigList, projectList]) => {
      if (cancelled) return;
      setProfile(profileData);
      setGigs(gigList);
      setProjects(projectList);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) {
    return (
      <section className="section">
        <div className="wrap"><p style={{ color: "var(--muted)" }}>Loading profile…</p></div>
      </section>
    );
  }

  if (!profile) {
    return (
      <section className="section">
        <div className="wrap">
          <div className="empty">
            <h3>Profile not found</h3>
            <p>This user does not exist or has hidden their profile.</p>
            <button className="btn-primary" type="button" onClick={() => router.push("/search")}>
              Browse gigs
            </button>
          </div>
        </div>
      </section>
    );
  }

  const displayName = profile.fullName || "Apex Professional";

  return (
    <section className="section user-profile">
      <div className="wrap">
        <div className="profile-hero">
          <div className="profile-hero-avatar">
            {profile.avatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={profile.avatar} alt={displayName} />
            ) : (
              <span>{initials(displayName)}</span>
            )}
          </div>
          <div className="profile-hero-info">
            <h1>{displayName}</h1>
            {profile.title ? <p className="profile-hero-title">{profile.title}</p> : null}
            <div className="profile-hero-meta">
              {profile.country ? <span>{profile.country}</span> : null}
              {profile.languages ? <span>{profile.languages}</span> : null}
              {profile.availability ? <span>{profile.availability}</span> : null}
            </div>
            <div className="profile-hero-badges">
              {profile.idVerified ? <span className="status-pill ok">ID verified</span> : null}
              {profile.paymentVerified ? (
                <span className="status-pill ok">Payment verified</span>
              ) : null}
              {profile.hourlyRate ? (
                <span className="status-pill muted">${profile.hourlyRate}/hr</span>
              ) : null}
            </div>
          </div>
        </div>

        {profile.bio ? (
          <div className="exp-card wide" style={{ marginTop: 24 }}>
            <div className="exp-label">About</div>
            <p className="exp-text">{profile.bio}</p>
          </div>
        ) : null}

        {profile.skills.length > 0 ? (
          <div style={{ marginTop: 24 }}>
            <div className="exp-label">Skills</div>
            <div className="chips">
              {profile.skills.map((skill) => (
                <span className="chip" key={skill}>{skill}</span>
              ))}
            </div>
          </div>
        ) : null}

        {profile.introVideo ? (
          <div style={{ marginTop: 24, maxWidth: 720 }}>
            <div className="exp-label">Intro video</div>
            <VideoPlayer src={profile.introVideo} title={profile.introVideoName || displayName} />
          </div>
        ) : null}

        <div className="section-head" style={{ marginTop: 40 }}>
          <div>
            <div className="kicker">{t("grid.kicker")}</div>
            <h2>Gigs by {displayName}</h2>
          </div>
        </div>
        {gigs.length === 0 ? (
          <p style={{ color: "var(--muted)" }}>No active gigs yet.</p>
        ) : (
          <div className="grid">
            {gigs.map((gig) => (
              <GigCard key={gig.id} gig={gig} />
            ))}
          </div>
        )}

        {projects.length > 0 ? (
          <>
            <div className="section-head" style={{ marginTop: 40 }}>
              <div>
                <div className="kicker">{t("portfolio.kicker")}</div>
                <h2>Portfolio</h2>
              </div>
            </div>
            <div className="project-grid">
              {projects.map((project) => (
                <article className="project-card" key={project.id}>
                  <div className="project-cover" style={projectCoverStyle(project)}>
                    {project.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img className="project-image" src={project.image} alt={project.title} loading="lazy" />
                    ) : (
                      <span className="project-glyph" aria-hidden="true">
                        {portfolioGlyph(project.category)}
                      </span>
                    )}
                    <span className="project-cat">{project.category}</span>
                  </div>
                  <div className="project-body">
                    <h3>{project.title}</h3>
                    {project.summary ? <p>{project.summary}</p> : null}
                    {project.link ? (
                      <Link className="project-link" href={project.link} target="_blank" rel="noopener noreferrer">
                        Live preview
                      </Link>
                    ) : null}
                  </div>
                </article>
              ))}
            </div>
          </>
        ) : null}
      </div>
    </section>
  );
}
