import { TEAM } from "@/lib/content/team";
import { Chips } from "./ui";
import { GitHub, LinkedIn } from "./Icons";

/* ==========================================================================
   HIRELYX · TEAM GRID
   Editorial team cards. Photographs are served from /public and sized to the
   rendered box; members without a photograph get an initials panel rather
   than a stock portrait.
   ========================================================================== */

export default function TeamGrid() {
  return (
    <div className="hx-team">
      {TEAM.map((member) => (
        <article className="hx-team-card hx-reveal" key={member.name}>
          <div className="hx-team-photo">
            {member.photo ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={member.photo}
                alt={`${member.name}, ${member.role} at Hirelyx`}
                width={480}
                height={600}
                loading="lazy"
                decoding="async"
              />
            ) : (
              <span className="hx-team-initials" aria-hidden>
                {member.initials}
              </span>
            )}
          </div>
          <div className="hx-team-body">
            <p className="hx-team-role">{member.badge}</p>
            <h3>{member.name}</h3>
            <p style={{ fontWeight: 600, color: "var(--hx-fg)" }}>{member.role}</p>
            <p>{member.bio}</p>
            <p className="hx-xs">
              {member.experience} experience
              {member.certifications.length > 0 ? ` · ${member.certifications.join(", ")}` : ""}
            </p>
            <Chips items={member.skills.slice(0, 4)} />
            {member.github || member.linkedin ? (
              <div className="hx-team-links">
                {member.github ? (
                  <a
                    href={member.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${member.name} on GitHub`}
                  >
                    <GitHub size={16} />
                  </a>
                ) : null}
                {member.linkedin ? (
                  <a
                    href={member.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${member.name} on LinkedIn`}
                  >
                    <LinkedIn size={16} />
                  </a>
                ) : null}
              </div>
            ) : null}
          </div>
        </article>
      ))}
    </div>
  );
}
