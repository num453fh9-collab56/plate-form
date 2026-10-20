"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/lib/auth";
import Link from "next/link";

interface Slot {
  id: string; title: string; service: string; date: string;
  start_time: string; end_time: string; max_bookings: number; current_bookings: number; is_active: boolean;
}
interface Booking {
  id: string; client_name: string; client_email: string; client_phone: string;
  service: string; message: string; status: string; created_at: string;
  booking_slots: Slot;
}

const SERVICES = ["Programming & Tech", "Digital Marketing", "Custom AI Agents", "Social Media AI & Animation", "Prompt Engineering", "n8n & Workflow Automation"];

export default function ManageBookingsPage() {
  const { user } = useAuth();
  const [tab, setTab] = useState<"slots" | "bookings">("bookings");
  const [slots, setSlots] = useState<Slot[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "Consultation", service: "", date: "", start_time: "10:00", end_time: "10:30", max_bookings: "1" });
  const [bulkDays, setBulkDays] = useState<number[]>([]);
  const [creating, setCreating] = useState(false);

  const loadSlots = useCallback(async () => {
    const res = await fetch("/api/bookings?mode=all-slots");
    if (res.ok) { const d = await res.json(); setSlots(d.slots ?? []); }
  }, []);

  const loadBookings = useCallback(async () => {
    const res = await fetch("/api/bookings?mode=all-bookings");
    if (res.ok) { const d = await res.json(); setBookings(d.bookings ?? []); }
  }, []);

  useEffect(() => { loadSlots(); loadBookings(); }, [loadSlots, loadBookings]);

  const createSlot = async () => {
    if (!form.date || !form.start_time || !form.end_time) return;
    setCreating(true);
    await fetch("/api/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "create-slot", ...form, max_bookings: parseInt(form.max_bookings) || 1 }),
    });
    setForm({ title: "Consultation", service: "", date: "", start_time: "10:00", end_time: "10:30", max_bookings: "1" });
    setShowForm(false);
    setCreating(false);
    loadSlots();
  };

  const createBulkSlots = async () => {
    if (bulkDays.length === 0 || !form.start_time || !form.end_time) return;
    setCreating(true);
    const today = new Date();
    const slotsToCreate = [];
    for (let week = 0; week < 4; week++) {
      for (const day of bulkDays) {
        const d = new Date(today);
        d.setDate(today.getDate() + ((day - today.getDay() + 7) % 7) + week * 7);
        if (d <= today) d.setDate(d.getDate() + 7);
        slotsToCreate.push({
          title: form.title,
          service: form.service,
          date: d.toISOString().slice(0, 10),
          start_time: form.start_time,
          end_time: form.end_time,
          max_bookings: parseInt(form.max_bookings) || 1,
        });
      }
    }
    await fetch("/api/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "bulk-slots", slots: slotsToCreate }),
    });
    setBulkDays([]);
    setShowForm(false);
    setCreating(false);
    loadSlots();
  };

  const deleteSlot = async (id: string) => {
    await fetch("/api/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "delete-slot", slotId: id }),
    });
    loadSlots();
  };

  const updateStatus = async (id: string, status: string) => {
    await fetch("/api/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "update-booking-status", bookingId: id, status }),
    });
    loadBookings();
  };

  const toggleBulkDay = (d: number) => setBulkDays((prev) => prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d]);

  if (!user) return <section className="section"><div className="wrap"><p>Please sign in.</p></div></section>;

  const activeSlots = slots.filter((s) => s.is_active);
  const futureSlots = activeSlots.filter((s) => s.date >= new Date().toISOString().slice(0, 10));

  return (
    <section className="section">
      <div className="wrap">
        <div className="mb-head">
          <div>
            <Link href="/dashboard" className="mb-back">← Dashboard</Link>
            <h1>Manage Bookings</h1>
          </div>
          <div className="mb-head-actions">
            <div className="bk-tabs">
              <button className={`bk-tab ${tab === "bookings" ? "bk-tab-active" : ""}`} onClick={() => setTab("bookings")}>
                Bookings ({bookings.filter((b) => b.status === "confirmed").length})
              </button>
              <button className={`bk-tab ${tab === "slots" ? "bk-tab-active" : ""}`} onClick={() => setTab("slots")}>
                Slots ({futureSlots.length})
              </button>
            </div>
            {tab === "slots" && (
              <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
                {showForm ? "Cancel" : "+ Add Slots"}
              </button>
            )}
          </div>
        </div>

        {showForm && tab === "slots" && (
          <div className="mb-form">
            <h3>Create Time Slots</h3>
            <div className="mb-form-grid">
              <div className="bk-field">
                <label>Title</label>
                <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
              </div>
              <div className="bk-field">
                <label>Service</label>
                <select value={form.service} onChange={(e) => setForm({ ...form, service: e.target.value })}>
                  <option value="">General</option>
                  {SERVICES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="bk-field">
                <label>Start Time</label>
                <input type="time" value={form.start_time} onChange={(e) => setForm({ ...form, start_time: e.target.value })} />
              </div>
              <div className="bk-field">
                <label>End Time</label>
                <input type="time" value={form.end_time} onChange={(e) => setForm({ ...form, end_time: e.target.value })} />
              </div>
              <div className="bk-field">
                <label>Max Bookings</label>
                <input type="number" min="1" value={form.max_bookings} onChange={(e) => setForm({ ...form, max_bookings: e.target.value })} />
              </div>
              <div className="bk-field">
                <label>Specific Date</label>
                <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
              </div>
            </div>

            <div className="mb-bulk">
              <label>Or bulk create for next 4 weeks:</label>
              <div className="mb-days">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d, i) => (
                  <button key={d} className={`mb-day ${bulkDays.includes(i) ? "mb-day-active" : ""}`} onClick={() => toggleBulkDay(i)}>{d}</button>
                ))}
              </div>
            </div>

            <div className="mb-form-btns">
              {form.date && (
                <button className="btn-primary" onClick={createSlot} disabled={creating}>
                  {creating ? "Creating..." : "Create Single Slot"}
                </button>
              )}
              {bulkDays.length > 0 && (
                <button className="btn-primary" onClick={createBulkSlots} disabled={creating}>
                  {creating ? "Creating..." : `Create Bulk (${bulkDays.length} days × 4 weeks)`}
                </button>
              )}
            </div>
          </div>
        )}

        {tab === "bookings" ? (
          <div className="mb-list">
            {bookings.length === 0 ? (
              <div className="mb-empty">No bookings yet.</div>
            ) : bookings.map((b) => (
              <div key={b.id} className="mb-row">
                <div className="mb-row-main">
                  <div className="mb-row-av">{(b.client_name || "?")[0].toUpperCase()}</div>
                  <div className="mb-row-info">
                    <strong>{b.client_name || "Unknown"}</strong>
                    <div className="mb-row-meta">
                      {b.client_email && <span>📧 {b.client_email}</span>}
                      {b.client_phone && <span>📱 {b.client_phone}</span>}
                      {b.service && <span>🏷️ {b.service}</span>}
                    </div>
                    {b.booking_slots && (
                      <div className="mb-row-slot">
                        📅 {new Date(b.booking_slots.date + "T00:00").toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })}
                        {" · "}{fmtTime(b.booking_slots.start_time)} — {fmtTime(b.booking_slots.end_time)}
                      </div>
                    )}
                    {b.message && <p className="mb-row-msg">{b.message}</p>}
                  </div>
                  <span className={`bk-my-status bk-st-${b.status}`}>{b.status}</span>
                </div>
                <div className="mb-row-actions">
                  {b.status === "confirmed" && (
                    <>
                      <button className="mb-btn-complete" onClick={() => updateStatus(b.id, "completed")}>Mark Completed</button>
                      <button className="bk-cancel" onClick={() => updateStatus(b.id, "cancelled")}>Cancel</button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="mb-list">
            {futureSlots.length === 0 ? (
              <div className="mb-empty">No upcoming slots. Add some above!</div>
            ) : futureSlots.map((s) => (
              <div key={s.id} className="mb-row">
                <div className="mb-row-main">
                  <div className="mb-row-info">
                    <strong>{s.title}</strong>
                    <div className="mb-row-meta">
                      <span>📅 {new Date(s.date + "T00:00").toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })}</span>
                      <span>🕐 {fmtTime(s.start_time)} — {fmtTime(s.end_time)}</span>
                      {s.service && <span>🏷️ {s.service}</span>}
                      <span>👥 {s.current_bookings}/{s.max_bookings} booked</span>
                    </div>
                  </div>
                  <button className="bk-cancel" onClick={() => deleteSlot(s.id)} style={{ fontSize: ".7rem" }}>Remove</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <style>{`
        .mb-head{display:flex;justify-content:space-between;align-items:flex-end;padding:1.5rem 0;flex-wrap:wrap;gap:1rem}
        .mb-head h1{font-size:1.4rem;font-weight:800;margin:.25rem 0 0}
        .mb-back{font-size:.85rem;color:var(--accent);text-decoration:none;font-weight:600}
        .mb-head-actions{display:flex;gap:.6rem;align-items:center;flex-wrap:wrap}

        .bk-tabs{display:flex;gap:.3rem;background:var(--surface);border:1px solid var(--border);border-radius:.5rem;padding:3px}
        .bk-tab{padding:.4rem 1rem;border-radius:.4rem;border:none;background:transparent;font-size:.82rem;font-weight:600;cursor:pointer;color:var(--text-secondary)}
        .bk-tab-active{background:var(--accent);color:#fff}

        .mb-form{background:var(--surface);border:1px solid var(--border);border-radius:1rem;padding:1.5rem;margin-bottom:1.5rem;animation:mbSlide .3s ease}
        @keyframes mbSlide{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:translateY(0)}}
        .mb-form h3{font-size:1.05rem;margin:0 0 1rem}
        .mb-form-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:.7rem}
        .bk-field{display:flex;flex-direction:column;gap:.2rem}
        .bk-field label{font-size:.7rem;font-weight:700;color:var(--text-secondary);text-transform:uppercase;letter-spacing:.04em}
        .bk-field input,.bk-field select,.bk-field textarea{padding:.5rem .65rem;border:1px solid var(--border);border-radius:.45rem;font-size:.84rem;font-family:inherit;background:var(--bg);color:var(--text-primary);outline:none}
        .bk-field input:focus,.bk-field select:focus{border-color:var(--accent)}

        .mb-bulk{margin-top:1rem;padding-top:.8rem;border-top:1px solid var(--border)}
        .mb-bulk label{font-size:.78rem;font-weight:600;color:var(--text-secondary);display:block;margin-bottom:.5rem}
        .mb-days{display:flex;gap:.35rem}
        .mb-day{padding:.4rem .7rem;border-radius:.4rem;border:1px solid var(--border);background:transparent;font-size:.78rem;font-weight:600;cursor:pointer;color:var(--text-secondary);transition:all .15s}
        .mb-day:hover{border-color:var(--accent)}
        .mb-day-active{background:var(--accent);color:#fff;border-color:var(--accent)}
        .mb-form-btns{display:flex;gap:.6rem;margin-top:1rem}

        .mb-list{display:flex;flex-direction:column;gap:.6rem;padding-bottom:2rem}
        .mb-empty{text-align:center;padding:3rem;color:var(--text-secondary);font-size:.88rem;background:var(--surface);border:1px solid var(--border);border-radius:.75rem}
        .mb-row{background:var(--surface);border:1px solid var(--border);border-radius:.75rem;padding:1rem 1.25rem}
        .mb-row-main{display:flex;align-items:flex-start;gap:.8rem}
        .mb-row-av{width:36px;height:36px;border-radius:50%;background:linear-gradient(135deg,#0066cc,#0891b2);color:#fff;display:flex;align-items:center;justify-content:center;font-size:.8rem;font-weight:800;flex-shrink:0}
        .mb-row-info{flex:1;min-width:0}
        .mb-row-info strong{font-size:.92rem;display:block}
        .mb-row-meta{display:flex;gap:.8rem;font-size:.72rem;color:var(--text-secondary);margin-top:.2rem;flex-wrap:wrap}
        .mb-row-slot{font-size:.78rem;color:var(--accent);font-weight:600;margin-top:.2rem}
        .mb-row-msg{font-size:.8rem;color:var(--text-secondary);margin:.3rem 0 0;line-height:1.5;font-style:italic}
        .mb-row-actions{display:flex;gap:.5rem;margin-top:.6rem;justify-content:flex-end}
        .mb-btn-complete{font-size:.75rem;padding:.35rem .8rem;border-radius:.4rem;border:1px solid #059669;color:#059669;background:transparent;cursor:pointer;font-weight:600;transition:all .15s}
        .mb-btn-complete:hover{background:#059669;color:#fff}

        .bk-my-status{font-size:.68rem;font-weight:700;padding:.15rem .5rem;border-radius:999px;flex-shrink:0}
        .bk-st-confirmed{background:#05966918;color:#059669}
        .bk-st-cancelled{background:#dc262618;color:#dc2626}
        .bk-st-completed{background:#0066cc18;color:#0066cc}
        .bk-cancel{font-size:.75rem;padding:.35rem .8rem;border-radius:.4rem;border:1px solid #dc2626;color:#dc2626;background:transparent;cursor:pointer;font-weight:600;transition:all .15s}
        .bk-cancel:hover{background:#dc2626;color:#fff}

        @media(max-width:600px){.mb-form-grid{grid-template-columns:1fr 1fr}.mb-days{flex-wrap:wrap}}
      `}</style>
    </section>
  );
}

function fmtTime(t: string): string {
  const [h, m] = t.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  const hr = h % 12 || 12;
  return `${hr}:${String(m).padStart(2, "0")} ${ampm}`;
}
