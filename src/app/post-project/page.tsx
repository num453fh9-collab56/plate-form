"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import GigWizard from "@/components/GigWizard";

function PostProjectContent() {
  const searchParams = useSearchParams();
  const editId = searchParams.get("edit") ?? undefined;

  return (
    <section className="section">
      <div className="wrap">
        <div className="section-head">
          <div>
            <div className="kicker">{editId ? "Edit gig" : "Post a project"}</div>
            <h2>{editId ? "Update your gig" : "Create your gig"}</h2>
            <p className="sub">
              Six quick steps — overview, pricing, description, requirements, gallery, publish.
            </p>
          </div>
        </div>
        {/* key resets the wizard when switching between new and edit */}
        <GigWizard key={editId ?? "new"} editId={editId} />
      </div>
    </section>
  );
}

export default function PostProjectPage() {
  return (
    <Suspense
      fallback={
        <section className="section">
          <div className="wrap">
            <p style={{ color: "var(--muted)" }}>Loading…</p>
          </div>
        </section>
      }
    >
      <PostProjectContent />
    </Suspense>
  );
}
