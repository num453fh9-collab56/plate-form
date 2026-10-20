"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/lib/auth";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

interface Invoice {
  id: string; invoice_number: string; type: string; status: string;
  client_name: string; items: { description: string; qty: number; rate: number }[];
  subtotal: number; tax_amount: number; discount: number; total: number;
  currency: string; notes: string; due_date: string | null;
  paid_at: string | null; created_at: string;
}

const STATUS_STYLE: Record<string, { bg: string; color: string }> = {
  draft: { bg: "#64748b18", color: "#64748b" },
  sent: { bg: "#0066cc18", color: "#0066cc" },
  paid: { bg: "#05966918", color: "#059669" },
  overdue: { bg: "#dc262618", color: "#dc2626" },
  converted: { bg: "#7c3aed18", color: "#7c3aed" },
  cancelled: { bg: "#dc262618", color: "#dc2626" },
};

export default function InvoicesPage() {
  const { user } = useAuth();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Invoice | null>(null);
  const [paying, setPaying] = useState(false);
  const [banner, setBanner] = useState<{ type: "success" | "cancelled"; id: string } | null>(null);
  const searchParams = useSearchParams();

  const load = useCallback(async () => {
    if (!user) { setLoading(false); return; }
    const res = await fetch("/api/invoices?mode=my");
    if (res.ok) { const d = await res.json(); setInvoices(d.invoices ?? []); }
    setLoading(false);
  }, [user]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    const paid = searchParams.get("paid");
    const cancelled = searchParams.get("cancelled");
    if (paid) setBanner({ type: "success", id: paid });
    else if (cancelled) setBanner({ type: "cancelled", id: cancelled });
    if (paid || cancelled) {
      const url = new URL(window.location.href);
      url.searchParams.delete("paid");
      url.searchParams.delete("cancelled");
      window.history.replaceState({}, "", url.pathname);
    }
  }, [searchParams]);

  if (!user) {
    return (
      <section className="section"><div className="wrap" style={{ textAlign: "center", padding: "4rem 1rem" }}>
        <h1 style={{ fontSize: "1.5rem", marginBottom: ".5rem" }}>Invoices & Quotes</h1>
        <p style={{ color: "var(--text-secondary)" }}>Please sign in to view your invoices.</p>
      </div></section>
    );
  }

  const fmt = (n: number, c: string) => `${c === "PKR" ? "Rs " : "$"}${n.toFixed(2)}`;

  return (
    <section className="section">
      <div className="wrap">
        <div className="iv-head">
          <div>
            <h1>Invoices & Quotes</h1>
            <p>View and manage your quotes and invoices.</p>
          </div>
          <Link href="/contact" className="btn-primary">Request Quote</Link>
        </div>

        {banner && (
          <div className={`iv-banner ${banner.type === "success" ? "iv-banner-ok" : "iv-banner-warn"}`}>
            <span>{banner.type === "success"
              ? "Payment successful! Your invoice has been marked as paid."
              : "Payment was cancelled. You can try again anytime."}</span>
            <button className="iv-banner-close" onClick={() => setBanner(null)}>×</button>
          </div>
        )}

        {loading ? (
          <div style={{ textAlign: "center", padding: "4rem", color: "var(--text-secondary)" }}>Loading...</div>
        ) : invoices.length === 0 ? (
          <div className="iv-empty">
            <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>📄</div>
            <h2>No invoices yet</h2>
            <p>When we send you a quote or invoice, it will appear here.</p>
          </div>
        ) : selected ? (
          /* Invoice detail view */
          <div className="iv-detail">
            <button className="iv-back" onClick={() => setSelected(null)}>← Back to list</button>
            <div className="iv-doc">
              <div className="iv-doc-head">
                <div>
                  <h2 className="iv-doc-title">{selected.type === "quote" ? "Quote" : "Invoice"}</h2>
                  <span className="iv-doc-num">{selected.invoice_number}</span>
                </div>
                <div className="iv-doc-right">
                  <span className="iv-status" style={{ background: STATUS_STYLE[selected.status]?.bg, color: STATUS_STYLE[selected.status]?.color }}>
                    {selected.status.toUpperCase()}
                  </span>
                  <span className="iv-doc-date">{new Date(selected.created_at).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })}</span>
                </div>
              </div>

              <div className="iv-doc-meta">
                <div><span className="iv-lbl">Billed To</span><strong>{selected.client_name || "—"}</strong></div>
                {selected.due_date && <div><span className="iv-lbl">Due Date</span><strong>{new Date(selected.due_date).toLocaleDateString()}</strong></div>}
                {selected.paid_at && <div><span className="iv-lbl">Paid</span><strong>{new Date(selected.paid_at).toLocaleDateString()}</strong></div>}
              </div>

              <table className="iv-table">
                <thead>
                  <tr><th>Description</th><th>Qty</th><th>Rate</th><th>Amount</th></tr>
                </thead>
                <tbody>
                  {selected.items.map((item, i) => (
                    <tr key={i}>
                      <td>{item.description}</td>
                      <td>{item.qty}</td>
                      <td>{fmt(item.rate, selected.currency)}</td>
                      <td>{fmt(item.qty * item.rate, selected.currency)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="iv-totals">
                <div className="iv-total-row"><span>Subtotal</span><span>{fmt(selected.subtotal, selected.currency)}</span></div>
                {selected.tax_amount > 0 && <div className="iv-total-row"><span>Tax</span><span>{fmt(selected.tax_amount, selected.currency)}</span></div>}
                {selected.discount > 0 && <div className="iv-total-row"><span>Discount</span><span>-{fmt(selected.discount, selected.currency)}</span></div>}
                <div className="iv-total-row iv-total-final"><span>Total</span><span>{fmt(selected.total, selected.currency)}</span></div>
              </div>

              {selected.notes && (
                <div className="iv-notes">
                  <span className="iv-lbl">Notes</span>
                  <p>{selected.notes}</p>
                </div>
              )}

              {selected.type === "invoice" && (selected.status === "sent" || selected.status === "overdue") && (
                <div className="iv-pay">
                  <button
                    className="iv-pay-btn"
                    disabled={paying}
                    onClick={async () => {
                      setPaying(true);
                      const res = await fetch("/api/pay-invoice", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ invoiceId: selected.id }),
                      });
                      if (res.ok) {
                        const { url } = await res.json();
                        if (url) window.location.href = url;
                      }
                      setPaying(false);
                    }}
                  >
                    {paying ? "Redirecting to payment..." : `Pay Now — ${fmt(selected.total, selected.currency)}`}
                  </button>
                  <span className="iv-pay-secure">🔒 Secure payment via Stripe</span>
                </div>
              )}

              {selected.status === "paid" && (
                <div className="iv-paid-badge">
                  <span>✅ Paid {selected.paid_at ? `on ${new Date(selected.paid_at).toLocaleDateString()}` : ""}</span>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Invoice list */
          <div className="iv-list">
            {invoices.map((inv) => (
              <button key={inv.id} className="iv-card" onClick={() => setSelected(inv)}>
                <div className="iv-card-top">
                  <div>
                    <span className="iv-card-type">{inv.type === "quote" ? "Quote" : "Invoice"}</span>
                    <strong className="iv-card-num">{inv.invoice_number}</strong>
                  </div>
                  <span className="iv-status" style={{ background: STATUS_STYLE[inv.status]?.bg, color: STATUS_STYLE[inv.status]?.color }}>
                    {inv.status}
                  </span>
                </div>
                <div className="iv-card-body">
                  <span className="iv-card-total">{fmt(inv.total, inv.currency)}</span>
                  <span className="iv-card-items">{inv.items.length} item{inv.items.length !== 1 ? "s" : ""}</span>
                  <span className="iv-card-date">{new Date(inv.created_at).toLocaleDateString()}</span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      <style>{`
        .iv-head{display:flex;justify-content:space-between;align-items:center;padding:2rem 0 1.5rem;flex-wrap:wrap;gap:1rem}
        .iv-head h1{font-size:1.6rem;font-weight:800;margin:0}
        .iv-head p{color:var(--text-secondary);font-size:.9rem;margin:.2rem 0 0}
        .iv-empty{text-align:center;padding:4rem 1rem;background:var(--surface);border:1px solid var(--border);border-radius:1rem}
        .iv-empty h2{font-size:1.2rem;margin:0 0 .4rem}
        .iv-empty p{color:var(--text-secondary);font-size:.88rem;margin:0}

        .iv-list{display:flex;flex-direction:column;gap:.6rem;padding-bottom:2rem}
        .iv-card{display:block;background:var(--surface);border:1px solid var(--border);border-radius:.75rem;padding:1rem 1.25rem;text-align:left;cursor:pointer;transition:box-shadow .2s;width:100%}
        .iv-card:hover{box-shadow:0 4px 16px rgba(0,0,0,.06)}
        .iv-card-top{display:flex;justify-content:space-between;align-items:center;margin-bottom:.5rem}
        .iv-card-type{font-size:.68rem;font-weight:700;text-transform:uppercase;color:var(--text-secondary);letter-spacing:.04em}
        .iv-card-num{font-size:.92rem;display:block;margin-top:.1rem}
        .iv-status{font-size:.68rem;font-weight:700;padding:.2rem .55rem;border-radius:999px;text-transform:capitalize}
        .iv-card-body{display:flex;gap:1.2rem;font-size:.78rem;color:var(--text-secondary)}
        .iv-card-total{font-weight:700;color:var(--text-primary);font-size:.88rem}

        .iv-back{font-size:.85rem;color:var(--accent);background:none;border:none;cursor:pointer;font-weight:600;padding:0;margin-bottom:1rem;display:inline-block}
        .iv-doc{background:var(--surface);border:1px solid var(--border);border-radius:1rem;padding:2rem;margin-bottom:2rem}
        .iv-doc-head{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:1.5rem;flex-wrap:wrap;gap:1rem}
        .iv-doc-title{font-size:1.4rem;font-weight:800;margin:0}
        .iv-doc-num{font-size:.85rem;color:var(--text-secondary)}
        .iv-doc-right{display:flex;flex-direction:column;align-items:flex-end;gap:.3rem}
        .iv-doc-date{font-size:.78rem;color:var(--text-secondary)}
        .iv-doc-meta{display:flex;gap:2rem;margin-bottom:1.5rem;flex-wrap:wrap}
        .iv-lbl{font-size:.68rem;font-weight:700;text-transform:uppercase;color:var(--text-secondary);letter-spacing:.04em;display:block;margin-bottom:.2rem}

        .iv-table{width:100%;border-collapse:collapse;margin-bottom:1rem}
        .iv-table th{text-align:left;font-size:.72rem;font-weight:700;text-transform:uppercase;color:var(--text-secondary);padding:.6rem .5rem;border-bottom:2px solid var(--border);letter-spacing:.04em}
        .iv-table td{padding:.6rem .5rem;font-size:.85rem;border-bottom:1px solid var(--border)}
        .iv-table th:last-child,.iv-table td:last-child{text-align:right}

        .iv-totals{max-width:280px;margin-left:auto;margin-bottom:1.5rem}
        .iv-total-row{display:flex;justify-content:space-between;padding:.4rem 0;font-size:.85rem}
        .iv-total-final{border-top:2px solid var(--border);padding-top:.6rem;font-weight:800;font-size:1rem}

        .iv-notes{padding-top:1rem;border-top:1px solid var(--border)}
        .iv-notes p{font-size:.85rem;color:var(--text-secondary);line-height:1.6;margin:.2rem 0 0;white-space:pre-wrap}

        .iv-pay{text-align:center;padding:1.5rem 0;border-top:1px solid var(--border);margin-top:1rem}
        .iv-pay-btn{padding:.8rem 2rem;border-radius:.6rem;background:linear-gradient(135deg,#059669,#0891b2);color:#fff;border:none;font-size:1rem;font-weight:700;cursor:pointer;transition:transform .15s,box-shadow .15s}
        .iv-pay-btn:hover{transform:translateY(-2px);box-shadow:0 6px 20px rgba(5,150,105,.25)}
        .iv-pay-btn:disabled{opacity:.6;cursor:not-allowed;transform:none}
        .iv-pay-secure{display:block;font-size:.72rem;color:var(--text-secondary);margin-top:.5rem}
        .iv-paid-badge{text-align:center;padding:1rem;background:#05966910;border-radius:.6rem;margin-top:1rem;font-weight:700;color:#059669;font-size:.92rem}

        .iv-banner{display:flex;align-items:center;justify-content:space-between;gap:1rem;padding:.8rem 1.2rem;border-radius:.6rem;margin-bottom:1.2rem;font-size:.88rem;font-weight:600;animation:ivBannerIn .3s ease}
        @keyframes ivBannerIn{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:translateY(0)}}
        .iv-banner-ok{background:#05966914;color:#059669;border:1px solid #05966930}
        .iv-banner-warn{background:#ea580c14;color:#ea580c;border:1px solid #ea580c30}
        .iv-banner-close{background:none;border:none;font-size:1.2rem;cursor:pointer;color:inherit;opacity:.7;padding:0 .2rem}
        .iv-banner-close:hover{opacity:1}

        @media(max-width:500px){.iv-doc{padding:1.2rem}.iv-doc-meta{flex-direction:column;gap:.8rem}}
      `}</style>
    </section>
  );
}
