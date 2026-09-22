"use client";

import { useUI } from "@/lib/ui";

export default function Cta() {
  const { openPost } = useUI();

  return (
    <div className="wrap">
      <div className="cta" id="cta">
        <div>
          <h3>Turn your skills into a global business.</h3>
          <p>
            Join WorkVortex, showcase your expertise, and connect with clients who value
            quality.
          </p>
        </div>
        <div className="cta-actions">
          <button className="btn-primary" type="button" onClick={openPost}>
            Become a Seller
          </button>
          <button className="btn-dark" type="button" onClick={openPost}>
            Post a Project
          </button>
        </div>
      </div>
    </div>
  );
}
