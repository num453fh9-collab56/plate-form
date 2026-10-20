import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Accessibility",
  description: "Learn about Hirelyx's commitment to making our platform accessible to everyone.",
  alternates: { canonical: "/accessibility" },
};

export default function AccessibilityPage() {
  return (
    <section className="section">
      <div className="wrap legal">
        <div className="kicker">Commitment</div>
        <h1>Accessibility Statement</h1>
        <p className="gw-muted">Last updated: October 2026</p>

        <h2>Our Commitment</h2>
        <p>
          Hirelyx is committed to ensuring digital accessibility for people of all abilities.
          We are continually improving the user experience for everyone and applying the relevant
          accessibility standards.
        </p>

        <h2>What We Do</h2>
        <ul>
          <li><strong>Semantic HTML:</strong> We use proper heading structure, landmarks, and ARIA labels throughout the site.</li>
          <li><strong>Keyboard Navigation:</strong> All interactive elements are accessible via keyboard. Focus indicators are visible on all buttons, links, and form fields.</li>
          <li><strong>Color Contrast:</strong> Text and interactive elements meet WCAG 2.1 AA contrast requirements.</li>
          <li><strong>Responsive Design:</strong> The site adapts to different screen sizes and supports text scaling up to 200%.</li>
          <li><strong>Alt Text:</strong> Images include descriptive alt text where applicable.</li>
          <li><strong>Form Accessibility:</strong> All form inputs have associated labels and clear error messages.</li>
        </ul>

        <h2>Known Limitations</h2>
        <p>
          While we strive for full accessibility, some areas may still need improvement. We actively
          work to identify and fix accessibility issues as we find them.
        </p>

        <h2>Feedback</h2>
        <p>
          If you encounter any accessibility barriers on our site, please let us know.
          We take your feedback seriously and will do our best to address issues promptly.
        </p>
        <ul>
          <li>Email: <a href="mailto:support@hirelyx.com" style={{ color: "var(--accent)", fontWeight: 600 }}>support@hirelyx.com</a></li>
          <li>Use the chat widget on any page to speak with our AI assistant</li>
        </ul>
      </div>
    </section>
  );
}
