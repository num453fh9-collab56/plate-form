"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/lib/auth";
import Link from "next/link";

interface LineItem { description: string; qty: number; rate: number; }
interface Invoice {
  id: string; invoice_number: string; type: string; status: string;
  client_name: string; client_email: string; items: LineItem[];
  subtotal: number; tax_rate: number; tax_amount: number; discount: number;
  total: number; currency: string; notes: string; due_date: string | null;
  created_at: string;
}

const STATUS_STYLE: Record<string, { bg: string; color: string }> = {
  draft: { bg: "#64748b18", color: "#64748b" },
  sent: { bg: "#0066cc18", color: "#0066cc" },
  paid: { bg: "#05966918", color: "#059669" },
  overdue: { bg: "#dc262618", color: "#dc2626" },
  converted: { bg: "#7c3aed18", color: "#7c3aed" },
  cancelled: { bg: "#dc262618", color: "#dc2626" },
};

export default function ManageInvoicesPage() {
  const { user } = useAuth();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [creating, setCreating] = useState(false);

  const [form, setForm] = useState({
    type: "quote" as "quote" | "invoice",
    client_name: "", client_email: "", currency: "USD", tax_rate: "0", discount: "0", notes: "", due_date: "",
  });
  const [items, setItems] = useState<LineItem[]>([{ description: "", qty: 1, rate: 0 }]);

  const load = useCallback(async () => {
    const res = await fetch("/api/invoices");
    if (res.ok) { const d = await res.json(); setInvoices(d.invoices ?? []); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const addItem = () => setItems([...items, { description: "", qty: 1, rate: 0 }]);
  const removeItem = (i: number) => setItems(items.filter((_, idx) => idx !== i));
  const updateItem = (i: number, field: keyof LineItem, val: string | number) => {
    const updated = [...items];
    updated[i] = { ...updated[i], [field]: field === "description" ? val : Number(val) || 0 };
    setItems(updated);
  };

  const subtotal = items.reduce((s, i) => s + i.qty * i.rate, 0);
  const taxAmt = subtotal * (parseFloat(form.tax_rate) || 0) / 100;
  const total = subtotal + taxAmt - (parseFloat(form.discount) || 0);

  const create = async () => {
    if (!form.client_name.trim() || items.length === 0) return;
    setCreating(true);
    await fetch("/api/invoices", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "create", ...form,
        tax_rate: parseFloat(form.tax_rate) || 0,
        discount: parseFloat(form.discount) || 0,
        items,
      }),
    });
    setForm({ type: "quote", client_name: "", client_email: "", currency: "USD", tax_rate: "0", discount: "0", notes: "", due_date: "" });
    setItems([{ description: "", qty: 1, rate: 0 }]);
    setShowForm(false);
    setCreating(false);
    load();
  };

  const updateStatus = async (id: string, action: string) => {
    await fetch("/api/invoices", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, id }),
    });
    load();
  };

  const convertToInvoice = async (id: string) => {
    await fetch("/api/invoices", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "convert-to-invoice", id }),
    });
    load();
  };

  let filtered = invoices;
  if (filter !== "all") filtered = filtered.filter((i) => i.status === filter);
  if (typeFilter !== "all") filtered = filtered.filter((i) => i.type === typeFilter);

  const fmt = (n: number, c: string) => `${c === "PKR" ? "Rs " : "$"}${n.toFixed(2)}`;

  if (!user) return <section className="section"><div className="wrap"><p>Please sign in.</p></div></section>;

  return (
    <section className="section">
      <div className="wrap">
        <div className="mi-head">
          <div>
            <Link href="/dashboard" className="mi-back">← Dashboard</Link>
            <h1>Quotes & Invoices</h1>
          </div>
          <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
            {showForm ? "Cancel" : "+ Create New"}
          </button>
        </div>

        {showForm && (
          <div className="mi-form">
            <div className="mi-form-top">
              <div className="bk-tabs" style={{ marginBottom: ".8rem" }}>
                <button className={`bk-tab ${form.type === "quote" ? "bk-tab-active" : ""}`} onClick={() => setForm({ ...form, type: "quote" })}>Quote</button>
                <button className={`bk-tab ${form.type === "invoice" ? "bk-tab-active" : ""}`} onClick={() => setForm({ ...form, type: "invoice" })}>Invoice</button>
              </div>
            </div>

            <div className="mi-form-grid">
              <div className="bk-field">
                <label>Client Name *</label>
                <input value={form.client_name} onChange={(e) => setForm({ ...form, client_name: e.target.value })} placeholder="Client name" />
              </div>
              <div className="bk-field">
                <label>Client Email</label>
                <input type="email" value={form.client_email} onChange={(e) => setForm({ ...form, client_email: e.target.value })} />
              </div>
              <div className="bk-field">
                <label>Currency</label>
                <select value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value })}>
                  <option value="USD">USD ($)</option>
                  <option value="PKR">PKR (Rs)</option>
                  <option value="EUR">EUR</option>
                  <option value="GBP">GBP</option>
                </select>
              </div>
              <div className="bk-field">
                <label>Due Date</label>
                <input type="date" value={form.due_date} onChange={(e) => setForm({ ...form, due_date: e.target.value })} />
              </div>
            </div>

            <h4 style={{ margin: "1rem 0 .5rem", fontSize: ".9rem" }}>Line Items</h4>
            <div className="mi-items">
              {items.map((item, i) => (
                <div key={i} className="mi-item-row">
                  <input className="mi-item-desc" placeholder="Description" value={item.description} onChange={(e) => updateItem(i, "description", e.target.value)} />
                  <input className="mi-item-num" type="number" min="1" placeholder="Qty" value={item.qty || ""} onChange={(e) => updateItem(i, "qty", e.target.value)} />
                  <input className="mi-item-num" type="number" min="0" step="0.01" placeholder="Rate" value={item.rate || ""} onChange={(e) => updateItem(i, "rate", e.target.value)} />
                  <span className="mi-item-total">{fmt(item.qty * item.rate, form.currency)}</span>
                  {items.length > 1 && <button className="mi-item-rm" onClick={() => removeItem(i)}>×</button>}
                </div>
              ))}
              <button className="mi-add-item" onClick={addItem}>+ Add Item</button>
            </div>

            <div className="mi-form-grid" style={{ marginTop: ".8rem" }}>
              <div className="bk-field">
                <label>Tax Rate (%)</label>
                <input type="number" min="0" step="0.5" value={form.tax_rate} onChange={(e) => setForm({ ...form, tax_rate: e.target.value })} />
              </div>
              <div className="bk-field">
                <label>Discount ({form.currency})</label>
                <input type="number" min="0" step="0.01" value={form.discount} onChange={(e) => setForm({ ...form, discount: e.target.value })} />
              </div>
            </div>

            <div className="mi-summary">
              <div className="mi-sum-row"><span>Subtotal</span><span>{fmt(subtotal, form.currency)}</span></div>
              {taxAmt > 0 && <div className="mi-sum-row"><span>Tax ({form.tax_rate}%)</span><span>{fmt(taxAmt, form.currency)}</span></div>}
              {parseFloat(form.discount) > 0 && <div className="mi-sum-row"><span>Discount</span><span>-{fmt(parseFloat(form.discount), form.currency)}</span></div>}
              <div className="mi-sum-row mi-sum-total"><span>Total</span><span>{fmt(total, form.currency)}</span></div>
            </div>

            <div className="bk-field" style={{ marginTop: ".6rem" }}>
              <label>Notes</label>
              <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Payment terms, additional notes..." rows={2} style={{ padding: ".5rem .65rem", border: "1px solid var(--border)", borderRadius: ".45rem", fontSize: ".84rem", fontFamily: "inherit", background: "var(--bg)", color: "var(--text-primary)", outline: "none", resize: "vertical" }} />
            </div>

            <button className="btn-primary" onClick={create} disabled={!form.client_name.trim() || items.length === 0 || creating} style={{ marginTop: "1rem", width: "100%" }}>
              {creating ? "Creating..." : `Create ${form.type === "quote" ? "Quote" : "Invoice"}`}
            </button>
          </div>
        )}

        <div className="mi-filters">
          <div className="bk-tabs">
            <button className={`bk-tab ${typeFilter === "all" ? "bk-tab-active" : ""}`} onClick={() => setTypeFilter("all")}>All</button>
            <button className={`bk-tab ${typeFilter === "quote" ? "bk-tab-active" : ""}`} onClick={() => setTypeFilter("quote")}>Quotes</button>
            <button className={`bk-tab ${typeFilter === "invoice" ? "bk-tab-active" : ""}`} onClick={() => setTypeFilter("invoice")}>Invoices</button>
          </div>
          <div style={{ display: "flex", gap: ".3rem", flexWrap: "wrap" }}>
            {["all", "draft", "sent", "paid", "overdue", "converted"].map((s) => (
              <button key={s} className={`mp-filter ${filter === s ? "mp-filter-active" : ""}`} onClick={() => setFilter(s)} style={{ padding: ".3rem .6rem", borderRadius: "999px", border: "1px solid var(--border)", background: filter === s ? "var(--accent)" : "transparent", color: filter === s ? "#fff" : "var(--text-secondary)", fontSize: ".72rem", fontWeight: 600, cursor: "pointer" }}>
                {s === "all" ? "All" : s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="mi-list">
          {filtered.length === 0 ? (
            <div className="mb-empty" style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: ".75rem", textAlign: "center", padding: "3rem", color: "var(--text-secondary)" }}>No {typeFilter !== "all" ? typeFilter + "s" : "invoices"} found.</div>
          ) : filtered.map((inv) => (
            <div key={inv.id} className="mi-row">
              <div className="mi-row-main">
                <div>
                  <div className="mi-row-top">
                    <span className="mi-row-type">{inv.type}</span>
                    <strong>{inv.invoice_number}</strong>
                    <span className="iv-status" style={{ background: STATUS_STYLE[inv.status]?.bg, color: STATUS_STYLE[inv.status]?.color, fontSize: ".68rem", fontWeight: 700, padding: ".15rem .5rem", borderRadius: "999px", marginLeft: ".4rem" }}>
                      {inv.status}
                    </span>
                  </div>
                  <div className="mi-row-meta">
                    <span>👤 {inv.client_name || "—"}</span>
                    <span>📅 {new Date(inv.created_at).toLocaleDateString()}</span>
                    <span>{inv.items.length} items</span>
                  </div>
                </div>
                <strong className="mi-row-total">{fmt(inv.total, inv.currency)}</strong>
              </div>
              <div className="mi-row-actions">
                {inv.status === "draft" && <button className="mi-btn" onClick={() => updateStatus(inv.id, "send")}>Send</button>}
                {inv.type === "quote" && inv.status === "sent" && <button className="mi-btn mi-btn-primary" onClick={() => convertToInvoice(inv.id)}>Convert to Invoice</button>}
                {inv.type === "invoice" && (inv.status === "sent" || inv.status === "overdue") && <button className="mi-btn mi-btn-green" onClick={() => updateStatus(inv.id, "mark-paid")}>Mark Paid</button>}
                <Link href={`/invoices`} className="mi-btn">View</Link>
              </div>
            </div>
          ))}
        </div>

        {/* Stats */}
        <div className="mi-stats">
          <div className="mi-stat">
            <span>Total Outstanding</span>
            <strong>{fmt(invoices.filter((i) => i.type === "invoice" && (i.status === "sent" || i.status === "overdue")).reduce((s, i) => s + i.total, 0), "USD")}</strong>
          </div>
          <div className="mi-stat">
            <span>Total Paid</span>
            <strong style={{ color: "#059669" }}>{fmt(invoices.filter((i) => i.status === "paid").reduce((s, i) => s + i.total, 0), "USD")}</strong>
          </div>
          <div className="mi-stat">
            <span>Pending Quotes</span>
            <strong>{invoices.filter((i) => i.type === "quote" && i.status === "sent").length}</strong>
          </div>
        </div>
      </div>

      <style>{`
        .mi-head{display:flex;justify-content:space-between;align-items:flex-end;padding:1.5rem 0;flex-wrap:wrap;gap:1rem}
        .mi-head h1{font-size:1.4rem;font-weight:800;margin:.25rem 0 0}
        .mi-back{font-size:.85rem;color:var(--accent);text-decoration:none;font-weight:600}

        .mi-form{background:var(--surface);border:1px solid var(--border);border-radius:1rem;padding:1.5rem;margin-bottom:1.5rem;animation:mbSlide .3s ease}
        .mi-form-grid{display:grid;grid-template-columns:1fr 1fr 1fr 1fr;gap:.6rem}
        .bk-field{display:flex;flex-direction:column;gap:.2rem}
        .bk-field label{font-size:.7rem;font-weight:700;color:var(--text-secondary);text-transform:uppercase;letter-spacing:.04em}
        .bk-field input,.bk-field select{padding:.5rem .65rem;border:1px solid var(--border);border-radius:.45rem;font-size:.84rem;font-family:inherit;background:var(--bg);color:var(--text-primary);outline:none}
        .bk-field input:focus,.bk-field select:focus{border-color:var(--accent)}
        .bk-tabs{display:flex;gap:.3rem;background:var(--surface);border:1px solid var(--border);border-radius:.5rem;padding:3px}
        .bk-tab{padding:.4rem 1rem;border-radius:.4rem;border:none;background:transparent;font-size:.82rem;font-weight:600;cursor:pointer;color:var(--text-secondary)}
        .bk-tab-active{background:var(--accent);color:#fff}
        @keyframes mbSlide{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:translateY(0)}}

        .mi-items{display:flex;flex-direction:column;gap:.4rem}
        .mi-item-row{display:flex;gap:.4rem;align-items:center}
        .mi-item-desc{flex:1;padding:.45rem .6rem;border:1px solid var(--border);border-radius:.4rem;font-size:.82rem;background:var(--bg);color:var(--text-primary);outline:none;font-family:inherit}
        .mi-item-num{width:80px;padding:.45rem .5rem;border:1px solid var(--border);border-radius:.4rem;font-size:.82rem;background:var(--bg);color:var(--text-primary);outline:none;text-align:center;font-family:inherit}
        .mi-item-total{font-size:.82rem;font-weight:700;min-width:80px;text-align:right}
        .mi-item-rm{width:28px;height:28px;border-radius:50%;border:1px solid #dc2626;color:#dc2626;background:transparent;cursor:pointer;font-size:1rem;display:flex;align-items:center;justify-content:center}
        .mi-add-item{align-self:flex-start;border:1px dashed var(--border);background:transparent;padding:.4rem .8rem;border-radius:.4rem;font-size:.78rem;font-weight:600;color:var(--accent);cursor:pointer;margin-top:.3rem}

        .mi-summary{max-width:250px;margin-left:auto;margin-top:.8rem}
        .mi-sum-row{display:flex;justify-content:space-between;padding:.3rem 0;font-size:.84rem}
        .mi-sum-total{border-top:2px solid var(--border);padding-top:.5rem;font-weight:800;font-size:1rem}

        .mi-filters{display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:.6rem;margin-bottom:1rem}

        .mi-list{display:flex;flex-direction:column;gap:.6rem;margin-bottom:1.5rem}
        .mi-row{background:var(--surface);border:1px solid var(--border);border-radius:.75rem;padding:1rem 1.25rem}
        .mi-row-main{display:flex;justify-content:space-between;align-items:flex-start}
        .mi-row-top{display:flex;align-items:center;gap:.4rem}
        .mi-row-type{font-size:.65rem;font-weight:700;text-transform:uppercase;color:var(--text-secondary);background:var(--border);padding:.1rem .4rem;border-radius:.3rem}
        .mi-row-meta{display:flex;gap:.8rem;font-size:.72rem;color:var(--text-secondary);margin-top:.3rem;flex-wrap:wrap}
        .mi-row-total{font-size:1.05rem;color:var(--text-primary)}
        .mi-row-actions{display:flex;gap:.4rem;margin-top:.6rem;justify-content:flex-end;flex-wrap:wrap}
        .mi-btn{font-size:.74rem;padding:.35rem .75rem;border-radius:.4rem;border:1px solid var(--border);color:var(--text-secondary);background:transparent;cursor:pointer;font-weight:600;text-decoration:none;transition:all .15s}
        .mi-btn:hover{border-color:var(--text-primary);color:var(--text-primary)}
        .mi-btn-primary{border-color:var(--accent);color:var(--accent)}
        .mi-btn-primary:hover{background:var(--accent);color:#fff}
        .mi-btn-green{border-color:#059669;color:#059669}
        .mi-btn-green:hover{background:#059669;color:#fff}

        .mi-stats{display:grid;grid-template-columns:repeat(3,1fr);gap:1rem;padding-bottom:2rem}
        .mi-stat{background:var(--surface);border:1px solid var(--border);border-radius:.75rem;padding:1.2rem;text-align:center}
        .mi-stat span{font-size:.72rem;font-weight:700;text-transform:uppercase;color:var(--text-secondary);letter-spacing:.04em;display:block;margin-bottom:.3rem}
        .mi-stat strong{font-size:1.2rem}

        @media(max-width:768px){.mi-form-grid{grid-template-columns:1fr 1fr}.mi-stats{grid-template-columns:1fr}}
        @media(max-width:500px){.mi-form-grid{grid-template-columns:1fr}.mi-item-row{flex-wrap:wrap}.mi-item-desc{min-width:100%}}
      `}</style>
    </section>
  );
}
