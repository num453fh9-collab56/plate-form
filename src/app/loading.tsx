/* Shown instantly while a route loads, so navigation never feels frozen. */
export default function Loading() {
  return (
    <section className="section" aria-busy="true" aria-label="Loading">
      <div className="wrap">
        <div className="skeleton skeleton-title" />
        <div className="skeleton skeleton-line" />
        <div className="skeleton-grid">
          {Array.from({ length: 6 }, (_, i) => (
            <div key={i} className="skeleton skeleton-card" />
          ))}
        </div>
      </div>
    </section>
  );
}
