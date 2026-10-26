import Link from "next/link";
import { Btn, Section } from "@/components/site/ui";
import { SERVICES } from "@/lib/content/services";

export default function NotFound() {
  return (
    <>
      <Section>
        <div style={{ maxWidth: "44rem" }}>
          <p className="hx-num" style={{ fontSize: "0.9rem" }}>
            404
          </p>
          <h1 className="hx-h1" style={{ marginTop: "0.75rem" }}>
            That page is not here.
          </h1>
          <p className="hx-lead" style={{ marginTop: "1.1rem" }}>
            It may have moved, or the link may be wrong. Some older service URLs now redirect
            automatically — if you followed one of ours and landed here, we would like to know.
          </p>
          <div className="hx-actions" style={{ marginTop: "2rem" }}>
            <Btn href="/" arrow>
              Back to the homepage
            </Btn>
            <Btn href="/contact" variant="secondary">
              Report a broken link
            </Btn>
          </div>
        </div>
      </Section>

      <Section tone="alt" tight>
        <h2 className="hx-h3" style={{ marginBottom: "1.25rem" }}>
          Looking for one of these?
        </h2>
        <div className="hx-grid hx-grid-3">
          {SERVICES.map((service) => (
            <Link className="hx-card hx-card-link hx-card-hover" key={service.slug} href={`/services/${service.slug}`}>
              <h3 className="hx-h4">{service.name}</h3>
              <p className="hx-small">{service.tagline}</p>
            </Link>
          ))}
        </div>
      </Section>
    </>
  );
}
