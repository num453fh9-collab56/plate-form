"use client";

import { useMemo } from "react";
import { useMarketplace } from "@/lib/marketplace";
import { useUI } from "@/lib/ui";
import { useRequireAuth } from "@/lib/auth";
import { useI18n } from "@/lib/i18n";
import { CATEGORY_LABEL_KEYS, CATEGORY_OPTIONS } from "@/lib/gigs";
import { POPULAR_SKILLS } from "@/lib/taxonomy";
import GigCard from "./GigCard";
import SkillPicker from "./SkillPicker";

export default function GigGrid() {
  const {
    gigs,
    loading,
    query,
    category,
    setCategory,
    selectedSkills,
    toggleSkill,
    setSkills,
    clearFilters,
  } = useMarketplace();
  const { openPost } = useUI();
  const requireAuth = useRequireAuth();
  const { t } = useI18n();

  const visibleGigs = useMemo(() => {
    const term = query.trim().toLowerCase();
    return gigs.filter((gig) => {
      if (category !== "All" && gig.category !== category) return false;
      // AND semantics: the gig must carry every skill the client selected.
      if (selectedSkills.length > 0 && !selectedSkills.every((s) => gig.skills.includes(s))) {
        return false;
      }
      if (!term) return true;
      return (
        gig.title.toLowerCase().includes(term) ||
        gig.seller.toLowerCase().includes(term) ||
        gig.description.toLowerCase().includes(term) ||
        gig.skills.some((skill) => skill.toLowerCase().includes(term))
      );
    });
  }, [gigs, query, category, selectedSkills]);

  const hasFilters =
    category !== "All" || selectedSkills.length > 0 || query.trim().length > 0;

  return (
    <section className="section" id="gigs">
      <div className="wrap">
        <div className="section-head">
          <div>
            <div className="kicker">{t("grid.kicker")}</div>
            <h2>{t("grid.title")}</h2>
            <p className="sub">{t("grid.sub")}</p>
          </div>
          <div className="head-actions">
            <a href="#gigs" className="link-all">
              {t("grid.browseAll")} <span>&rarr;</span>
            </a>
            <button className="btn-post" type="button" onClick={() => requireAuth(openPost)}>
              + {t("grid.postGig")}
            </button>
          </div>
        </div>

        <div className="taxonomy-filters">
          <div className="taxonomy-row">
            <span className="taxonomy-label">{t("grid.categoryLabel")}</span>
            <div className="taxonomy-chips">
              <button
                type="button"
                className={"taxonomy-chip" + (category === "All" ? " on" : "")}
                aria-pressed={category === "All"}
                onClick={() => setCategory("All")}
              >
                {t("grid.allCategories")}
              </button>
              {CATEGORY_OPTIONS.map((option) => (
                <button
                  key={option}
                  type="button"
                  className={"taxonomy-chip" + (category === option ? " on" : "")}
                  aria-pressed={category === option}
                  onClick={() => setCategory(option)}
                >
                  {t(CATEGORY_LABEL_KEYS[option])}
                </button>
              ))}
            </div>
          </div>

          <div className="taxonomy-row taxonomy-row-skill">
            <span className="taxonomy-label">{t("grid.skillLabel")}</span>
            <div className="taxonomy-skill-filter">
              <SkillPicker
                value={selectedSkills}
                onChange={setSkills}
                placeholder={t("grid.skillPlaceholder")}
              />
            </div>
            {hasFilters && (
              <button type="button" className="taxonomy-clear" onClick={clearFilters}>
                {t("grid.clearFilters")}
              </button>
            )}
          </div>

          <div className="taxonomy-row taxonomy-popular">
            <span className="taxonomy-label">{t("grid.popularLabel")}</span>
            <div className="taxonomy-chips">
              {POPULAR_SKILLS.map((skill) => {
                const on = selectedSkills.includes(skill);
                return (
                  <button
                    key={skill}
                    type="button"
                    className={"taxonomy-chip skill" + (on ? " on" : "")}
                    aria-pressed={on}
                    onClick={() => toggleSkill(skill)}
                  >
                    {skill}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="grid-meta">
          <span>{t("grid.count", { count: visibleGigs.length })}</span>
          {selectedSkills.length > 0 && (
            <span className="grid-meta-skills">
              {selectedSkills.join(" · ")}
            </span>
          )}
        </div>

        <div className="grid">
          {visibleGigs.map((gig) => (
            <GigCard key={gig.id} gig={gig} />
          ))}
          {visibleGigs.length === 0 &&
            (loading ? (
              <div className="empty" role="status">
                <p>Loading gigs…</p>
              </div>
            ) : (
              <div className="empty">
                <h3>{t("grid.emptyTitle")}</h3>
                <p>{t("grid.emptyText")}</p>
                {hasFilters && (
                  <button type="button" className="btn-ghost btn-sm" onClick={clearFilters}>
                    {t("grid.clearFilters")}
                  </button>
                )}
              </div>
            ))}
        </div>
      </div>
    </section>
  );
}
