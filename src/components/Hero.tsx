"use client";

import { useMarketplace } from "@/lib/marketplace";

const PILLS = [
  { label: "All Services", value: "All" },
  { label: "Web Development", value: "Web Development" },
  { label: "UI/UX Design", value: "UI/UX Design" },
  { label: "Digital Marketing", value: "Digital Marketing" },
  { label: "Video & Animation", value: "Video & Animation" },
  { label: "AI & Data", value: "AI & Data" },
  { label: "Writing", value: "Writing" },
];

const STATS = [
  { num: "1.8", suffix: "M+", label: "Projects Delivered" },
  { num: "4.9", suffix: "★", label: "Average Rating" },
  { num: "190", suffix: "+", label: "Countries Served" },
  { num: "24", suffix: "/7", label: "Global Support" },
];

export default function Hero() {
  const { query, setQuery, category, setCategory } = useMarketplace();

  const scrollToGigs = () => {
    document.getElementById("gigs")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <section className="hero">
      <div className="wrap">
        <div className="eyebrow">
          <span className="dot" /> Trusted by 24,000+ professionals
        </div>
        <h1>
          Hire Expert Freelance Talent or <span className="grad">Find Your Next Gig</span>
        </h1>
        <p className="sub">
          A high-end marketplace where verified experts deliver world-class work — on time,
          on budget, every time.
        </p>

        <div className="search-shell">
          <form
            className="search-bar"
            onSubmit={(event) => {
              event.preventDefault();
              scrollToGigs();
            }}
          >
            <label className="field">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              >
                <circle cx="11" cy="11" r="7" />
                <path d="m21 21-4.3-4.3" />
              </svg>
              <input
                type="text"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search for a service, skill, or freelancer…"
              />
            </label>
            <span className="divider" />
            <label className="select-wrap">
              <select
                aria-label="Category"
                value={category === "All" ? "" : category}
                onChange={(event) => setCategory(event.target.value || "All")}
              >
                <option value="">All Categories</option>
                {PILLS.slice(1).map((pill) => (
                  <option key={pill.value} value={pill.value}>
                    {pill.label}
                  </option>
                ))}
              </select>
              <span className="chev">
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                >
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </span>
            </label>
            <button className="btn-search" type="submit">
              Search
            </button>
          </form>
        </div>

        <div className="pills">
          {PILLS.map((pill) => (
            <button
              key={pill.value}
              type="button"
              className={"pill" + (category === pill.value ? " active" : "")}
              onClick={() => setCategory(pill.value)}
            >
              {pill.label}
            </button>
          ))}
        </div>

        <div className="stats">
          {STATS.map((stat) => (
            <div className="stat" key={stat.label}>
              <div className="num">
                {stat.num}
                <span>{stat.suffix}</span>
              </div>
              <div className="label">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
