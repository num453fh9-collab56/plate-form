"use client";

import { useState } from "react";
import Link from "next/link";

interface FAQ { q: string; a: string; cat: string; }

const FAQS: FAQ[] = [
  { cat: "General", q: "What services does Hirelyx offer?", a: "We offer Programming & Tech, Digital Marketing, Custom AI Agents, Social Media AI & Animation, Prompt Engineering, and n8n & Workflow Automation. Our team handles everything from web development to AI-powered business solutions." },
  { cat: "General", q: "How do I get started?", a: "Simply book a free consultation through our Bookings page, or use the chat widget to connect with us. We'll discuss your requirements and create a custom plan for your project." },
  { cat: "General", q: "Do you offer free consultations?", a: "Yes! Your first consultation is free. Book a time slot on our Bookings page and we'll understand your needs before proposing a solution." },
  { cat: "Projects", q: "How can I track my project progress?", a: "Once your project starts, you'll have access to a real-time project dashboard at /projects. You can see milestones, progress stages, and communicate with our team directly." },
  { cat: "Projects", q: "What are the project stages?", a: "Every project goes through 5 stages: Discovery (understanding requirements), Design (planning & wireframes), Development (building), Testing (QA & bug fixes), and Launch (deployment & delivery)." },
  { cat: "Projects", q: "Can I communicate with the team during the project?", a: "Absolutely! You can use the chat widget on any page, leave comments on your project dashboard, or email us at support@hirelyx.com. We believe in transparent communication." },
  { cat: "Payments", q: "How does pricing work?", a: "We provide custom quotes based on your project requirements. After consultation, we'll send you a detailed quote with line items. Once approved, it converts to an invoice." },
  { cat: "Payments", q: "What payment methods do you accept?", a: "We accept payments through Stripe (credit/debit cards) and can also arrange bank transfers for larger projects. All transactions are secure and encrypted." },
  { cat: "Payments", q: "Can I see my invoices online?", a: "Yes! All your quotes and invoices are available at /invoices. You can view details, track payment status, and download them anytime." },
  { cat: "Payments", q: "What's your refund policy?", a: "We offer milestone-based billing. If you're not satisfied with a deliverable, we'll revise it at no extra cost. For cancellations, unused milestone payments are refunded." },
  { cat: "Technical", q: "What technologies do you work with?", a: "We work with Next.js, React, Python, FastAPI, Java, Node.js, Supabase, PostgreSQL, n8n, and various AI/ML frameworks. We choose the best tech stack for each project." },
  { cat: "Technical", q: "Do you provide hosting and maintenance?", a: "Yes, we can handle deployment on Vercel, AWS, or your preferred platform. We also offer ongoing maintenance plans to keep your project running smoothly." },
  { cat: "Technical", q: "Can you build custom AI solutions?", a: "Absolutely! Our AI team builds custom agents, chatbots, workflow automations, and AI-powered tools tailored to your business needs. We specialize in practical AI that delivers results." },
  { cat: "Booking", q: "How do I book a meeting?", a: "Go to our Bookings page, select an available date and time slot, fill in your details, and confirm. You'll receive a confirmation email with meeting details." },
  { cat: "Booking", q: "Can I reschedule or cancel a booking?", a: "Yes, you can cancel bookings from your dashboard under 'My Bookings'. To reschedule, cancel the existing booking and book a new time slot." },
];

const CATS = ["All", ...Array.from(new Set(FAQS.map((f) => f.cat)))];

export default function FAQPage() {
  const [search, setSearch] = useState("");
  const [cat, setCat] = useState("All");
  const [open, setOpen] = useState<number | null>(null);

  const filtered = FAQS.filter((f) => {
    if (cat !== "All" && f.cat !== cat) return false;
    if (search) {
      const s = search.toLowerCase();
      return f.q.toLowerCase().includes(s) || f.a.toLowerCase().includes(s);
    }
    return true;
  });

  return (
    <section className="section">
      <div className="wrap">
        <div className="fq-head">
          <h1>Frequently Asked Questions</h1>
          <p>Find answers to common questions about our services.</p>
        </div>

        <div className="fq-search">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" /></svg>
          <input placeholder="Search questions..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>

        <div className="fq-cats">
          {CATS.map((c) => (
            <button key={c} className={`fq-cat ${cat === c ? "fq-cat-active" : ""}`} onClick={() => setCat(c)}>
              {c}
            </button>
          ))}
        </div>

        <div className="fq-list">
          {filtered.length === 0 ? (
            <div className="fq-empty">
              <p>No matching questions found. Try a different search or <Link href="/contact" style={{ color: "var(--accent)" }}>contact us</Link>.</p>
            </div>
          ) : filtered.map((f, i) => (
            <div key={i} className={`fq-item ${open === i ? "fq-item-open" : ""}`}>
              <button className="fq-question" onClick={() => setOpen(open === i ? null : i)}>
                <div>
                  <span className="fq-item-cat">{f.cat}</span>
                  <span>{f.q}</span>
                </div>
                <span className="fq-chevron">{open === i ? "−" : "+"}</span>
              </button>
              {open === i && (
                <div className="fq-answer">
                  <p>{f.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="fq-cta">
          <h2>Still have questions?</h2>
          <p>Our team is here to help. Reach out and we&apos;ll get back to you quickly.</p>
          <div className="fq-cta-btns">
            <Link href="/contact" className="btn-primary">Contact Us</Link>
            <Link href="/bookings" className="fq-cta-secondary">Book a Call</Link>
          </div>
        </div>
      </div>

      <style>{`
        .fq-head{text-align:center;padding:2.5rem 0 1.5rem}
        .fq-head h1{font-size:1.6rem;font-weight:800;margin:0}
        .fq-head p{color:var(--text-secondary);font-size:.9rem;margin:.3rem 0 0}

        .fq-search{display:flex;align-items:center;gap:.6rem;max-width:500px;margin:0 auto 1.2rem;padding:.6rem 1rem;border:1.5px solid var(--border);border-radius:999px;background:var(--surface);transition:border-color .15s}
        .fq-search:focus-within{border-color:var(--accent)}
        .fq-search input{flex:1;border:none;background:transparent;font-size:.88rem;outline:none;color:var(--text-primary);font-family:inherit}

        .fq-cats{display:flex;gap:.3rem;justify-content:center;flex-wrap:wrap;margin-bottom:1.5rem}
        .fq-cat{padding:.35rem .75rem;border-radius:999px;border:1px solid var(--border);background:transparent;font-size:.78rem;font-weight:600;cursor:pointer;color:var(--text-secondary);transition:all .15s}
        .fq-cat:hover{border-color:var(--accent);color:var(--accent)}
        .fq-cat-active{background:var(--accent);color:#fff;border-color:var(--accent)}

        .fq-list{max-width:700px;margin:0 auto;display:flex;flex-direction:column;gap:.4rem}
        .fq-empty{text-align:center;padding:2rem;color:var(--text-secondary)}
        .fq-item{background:var(--surface);border:1px solid var(--border);border-radius:.6rem;overflow:hidden;transition:box-shadow .15s}
        .fq-item-open{box-shadow:0 2px 12px rgba(0,0,0,.04)}
        .fq-question{width:100%;display:flex;justify-content:space-between;align-items:center;gap:1rem;padding:.9rem 1.1rem;border:none;background:transparent;cursor:pointer;text-align:left;font-family:inherit;color:var(--text-primary)}
        .fq-question>div{display:flex;align-items:center;gap:.6rem}
        .fq-question span:last-of-type{font-size:.9rem;font-weight:600}
        .fq-item-cat{font-size:.62rem;font-weight:700;text-transform:uppercase;color:var(--accent);background:rgba(0,102,204,.06);padding:.15rem .4rem;border-radius:999px;flex-shrink:0}
        .fq-chevron{font-size:1.2rem;font-weight:700;color:var(--text-secondary);flex-shrink:0;width:24px;text-align:center}
        .fq-answer{padding:0 1.1rem 1rem;animation:fqFade .2s ease}
        @keyframes fqFade{from{opacity:0}to{opacity:1}}
        .fq-answer p{font-size:.86rem;color:var(--text-secondary);line-height:1.7;margin:0}

        .fq-cta{text-align:center;padding:3rem 1rem;margin:2rem 0;background:linear-gradient(135deg,#0066cc08,#7c3aed08);border:1px solid #0066cc15;border-radius:1rem}
        .fq-cta h2{font-size:1.2rem;font-weight:800;margin:0 0 .4rem}
        .fq-cta p{color:var(--text-secondary);font-size:.88rem;margin:0 0 1rem}
        .fq-cta-btns{display:flex;gap:.6rem;justify-content:center}
        .fq-cta-secondary{padding:.6rem 1.2rem;border-radius:.5rem;border:1.5px solid var(--accent);color:var(--accent);text-decoration:none;font-weight:600;font-size:.88rem;transition:all .15s}
        .fq-cta-secondary:hover{background:var(--accent);color:#fff}
      `}</style>
    </section>
  );
}
