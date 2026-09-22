"use client";

import { useUI } from "@/lib/ui";

export default function Footer() {
  const { openPost } = useUI();

  return (
    <footer>
      <div className="wrap">
        <div className="foot-grid">
          <div className="foot-brand">
            <a href="#" className="logo">
              <span className="mark">W</span>
              <b>
                Work<span className="accent">Vortex</span>
              </b>
            </a>
            <p>
              The high-end global marketplace for expert freelance talent and ambitious
              businesses.
            </p>
          </div>
          <div className="foot-col">
            <h4>Marketplace</h4>
            <a href="#gigs">Browse Gigs</a>
            <a href="#gigs">Categories</a>
            <button className="link-btn" type="button" onClick={openPost}>
              Post a Project
            </button>
          </div>
          <div className="foot-col">
            <h4>Freelancers</h4>
            <button className="link-btn" type="button" onClick={openPost}>
              Become a Seller
            </button>
            <a href="#gigs">Success Stories</a>
            <a href="#gigs">Seller Academy</a>
          </div>
          <div className="foot-col">
            <h4>Company</h4>
            <a href="#">About Us</a>
            <a href="#">Careers</a>
            <a href="#">Contact</a>
          </div>
        </div>
        <div className="foot-bottom">
          <span>&copy; 2026 WorkVortex. All rights reserved.</span>
          <span>Terms &middot; Privacy &middot; Trust &amp; Safety</span>
        </div>
      </div>
    </footer>
  );
}
