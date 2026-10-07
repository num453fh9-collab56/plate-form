"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { useUI } from "@/lib/ui";
import { fetchFavoriteGigs } from "@/lib/favorites";
import type { Gig } from "@/lib/types";
import GigCard from "@/components/GigCard";

export default function FavoritesPage() {
  const { user } = useAuth();
  const { openAuth } = useUI();
  const [gigs, setGigs] = useState<Gig[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.sub) return;
    void fetchFavoriteGigs().then((items) => {
      setGigs(items);
      setLoading(false);
    });
  }, [user]);

  if (!user) {
    return (
      <section className="section">
        <div className="wrap">
          <div className="empty">
            <h3>Sign in to see saved gigs</h3>
            <button className="btn-primary" type="button" onClick={() => openAuth("login")}>
              Sign in
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="section">
      <div className="wrap">
        <div className="section-head">
          <div>
            <div className="kicker">Saved</div>
            <h2>Your saved gigs</h2>
          </div>
        </div>
        {loading ? (
          <p style={{ color: "var(--muted)" }}>Loading...</p>
        ) : gigs.length === 0 ? (
          <div className="empty">
            <h3>Nothing saved yet</h3>
            <p>Tap the heart on any gig to save it here.</p>
          </div>
        ) : (
          <div className="grid">
            {gigs.map((gig) => (
              <GigCard key={gig.id} gig={gig} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
