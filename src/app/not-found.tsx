import Link from "next/link";

export default function NotFound() {
  return (
    <section className="section">
      <div className="wrap">
        <div className="empty status-page">
          <div className="status-page-icon" aria-hidden="true">404</div>
          <h3>Page not found</h3>
          <p>The page you are looking for does not exist or has been moved.</p>
          <div className="status-page-actions">
            <Link className="btn-primary" href="/search">
              Browse gigs
            </Link>
            <Link className="btn-ghost" href="/">
              Go home
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
