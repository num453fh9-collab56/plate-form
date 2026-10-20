"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/lib/auth";
import { useUI } from "@/lib/ui";

interface Slot {
  id: string; title: string; service: string; date: string;
  start_time: string; end_time: string; max_bookings: number; current_bookings: number;
}
interface Booking {
  id: string; slot_id: string; status: string; service: string; created_at: string;
  booking_slots: Slot;
}

const SERVICES = ["Programming & Tech", "Digital Marketing", "Custom AI Agents", "Social Media AI & Animation", "Prompt Engineering", "n8n & Workflow Automation"];

export default function BookingsPage() {
  const { user } = useAuth();
  const { openAuth } = useUI();
  const [slots, setSlots] = useState<Slot[]>([]);
  const [myBookings, setMyBookings] = useState<Booking[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [calMonth, setCalMonth] = useState(() => { const n = new Date(); return new Date(n.getFullYear(), n.getMonth(), 1); });
  const [form, setForm] = useState({ client_name: "", client_email: "", client_phone: "", service: "", message: "" });
  const [booking, setBooking] = useState(false);
  const [tab, setTab] = useState<"book" | "my">("book");
  const [success, setSuccess] = useState(false);

  const loadSlots = useCallback(async () => {
    const from = calMonth.toISOString().slice(0, 10);
    const to = new Date(calMonth.getFullYear(), calMonth.getMonth() + 1, 0).toISOString().slice(0, 10);
    const res = await fetch(`/api/bookings?from=${from}&to=${to}`);
    if (res.ok) { const d = await res.json(); setSlots(d.slots ?? []); }
  }, [calMonth]);

  const loadMyBookings = useCallback(async () => {
    if (!user) return;
    const res = await fetch("/api/bookings?mode=my-bookings");
    if (res.ok) { const d = await res.json(); setMyBookings(d.bookings ?? []); }
  }, [user]);

  useEffect(() => { loadSlots(); }, [loadSlots]);
  useEffect(() => { if (user && tab === "my") loadMyBookings(); }, [user, tab, loadMyBookings]);

  useEffect(() => {
    if (user) {
      setForm((f) => ({ ...f, client_name: user.name ?? "", client_email: user.email ?? "" }));
    }
  }, [user]);

  const daysInMonth = new Date(calMonth.getFullYear(), calMonth.getMonth() + 1, 0).getDate();
  const firstDay = new Date(calMonth.getFullYear(), calMonth.getMonth(), 1).getDay();
  const today = new Date().toISOString().slice(0, 10);

  const slotsByDate = slots.reduce<Record<string, Slot[]>>((acc, s) => {
    (acc[s.date] ??= []).push(s);
    return acc;
  }, {});

  const daySlots = selectedDate ? (slotsByDate[selectedDate] ?? []) : [];

  const bookSlot = async () => {
    if (!selectedSlot || booking) return;
    setBooking(true);
    const res = await fetch("/api/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "book",
        slot_id: selectedSlot.id,
        ...form,
      }),
    });
    setBooking(false);
    if (res.ok) {
      setSuccess(true);
      setSelectedSlot(null);
      setSelectedDate("");
      loadSlots();
      setTimeout(() => setSuccess(false), 4000);
    }
  };

  const cancelBooking = async (id: string) => {
    await fetch("/api/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "cancel", bookingId: id }),
    });
    loadMyBookings();
  };

  const prevMonth = () => setCalMonth(new Date(calMonth.getFullYear(), calMonth.getMonth() - 1, 1));
  const nextMonth = () => setCalMonth(new Date(calMonth.getFullYear(), calMonth.getMonth() + 1, 1));
  const monthLabel = calMonth.toLocaleDateString(undefined, { month: "long", year: "numeric" });

  return (
    <section className="section">
      <div className="wrap">
        <div className="bk-head">
          <div>
            <h1>Book a Consultation</h1>
            <p>Select an available time slot to schedule a meeting with our team.</p>
          </div>
          {user && (
            <div className="bk-tabs">
              <button className={`bk-tab ${tab === "book" ? "bk-tab-active" : ""}`} onClick={() => setTab("book")}>Book</button>
              <button className={`bk-tab ${tab === "my" ? "bk-tab-active" : ""}`} onClick={() => setTab("my")}>My Bookings</button>
            </div>
          )}
        </div>

        {success && (
          <div className="bk-success">Booking confirmed! We&apos;ll be in touch shortly.</div>
        )}

        {tab === "book" ? (
          <div className="bk-layout">
            {/* Calendar */}
            <div className="bk-calendar">
              <div className="bk-cal-head">
                <button onClick={prevMonth} className="bk-cal-nav">&lt;</button>
                <strong>{monthLabel}</strong>
                <button onClick={nextMonth} className="bk-cal-nav">&gt;</button>
              </div>
              <div className="bk-cal-weekdays">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
                  <div key={d} className="bk-cal-wd">{d}</div>
                ))}
              </div>
              <div className="bk-cal-grid">
                {Array.from({ length: firstDay }, (_, i) => <div key={`e${i}`} className="bk-cal-cell bk-cal-empty" />)}
                {Array.from({ length: daysInMonth }, (_, i) => {
                  const day = i + 1;
                  const dateStr = `${calMonth.getFullYear()}-${String(calMonth.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                  const hasSlots = !!slotsByDate[dateStr]?.length;
                  const isPast = dateStr < today;
                  const isSelected = dateStr === selectedDate;
                  return (
                    <button
                      key={day}
                      className={`bk-cal-cell ${hasSlots && !isPast ? "bk-cal-has" : ""} ${isPast ? "bk-cal-past" : ""} ${isSelected ? "bk-cal-selected" : ""} ${dateStr === today ? "bk-cal-today" : ""}`}
                      disabled={!hasSlots || isPast}
                      onClick={() => { setSelectedDate(dateStr); setSelectedSlot(null); }}
                    >
                      {day}
                      {hasSlots && !isPast && <span className="bk-cal-dot" />}
                    </button>
                  );
                })}
              </div>
              <div className="bk-cal-legend">
                <span><span className="bk-cal-dot-lg bk-dot-avail" /> Available</span>
                <span><span className="bk-cal-dot-lg bk-dot-sel" /> Selected</span>
              </div>
            </div>

            {/* Slot selection + form */}
            <div className="bk-side">
              {!selectedDate ? (
                <div className="bk-placeholder">
                  <div style={{ fontSize: "2.5rem", marginBottom: ".8rem" }}>📅</div>
                  <h3>Select a Date</h3>
                  <p>Pick a highlighted date on the calendar to see available time slots.</p>
                </div>
              ) : daySlots.length === 0 ? (
                <div className="bk-placeholder">
                  <h3>No slots available</h3>
                  <p>No time slots are available for {new Date(selectedDate + "T00:00").toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}.</p>
                </div>
              ) : (
                <>
                  <h3 className="bk-side-date">
                    {new Date(selectedDate + "T00:00").toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}
                  </h3>
                  <div className="bk-slots">
                    {daySlots.map((s) => (
                      <button
                        key={s.id}
                        className={`bk-slot ${selectedSlot?.id === s.id ? "bk-slot-active" : ""}`}
                        onClick={() => setSelectedSlot(s)}
                      >
                        <div className="bk-slot-time">
                          {fmtTime(s.start_time)} — {fmtTime(s.end_time)}
                        </div>
                        <div className="bk-slot-meta">
                          <span className="bk-slot-title">{s.title}</span>
                          {s.service && <span className="bk-slot-service">{s.service}</span>}
                        </div>
                        <span className="bk-slot-avail">{s.max_bookings - s.current_bookings} left</span>
                      </button>
                    ))}
                  </div>

                  {selectedSlot && (
                    <div className="bk-form">
                      {!user ? (
                        <div className="bk-login-prompt">
                          <p>Sign in to book this slot</p>
                          <button className="btn-primary" onClick={() => openAuth("login")}>Sign In</button>
                        </div>
                      ) : (
                        <>
                          <h4>Complete Your Booking</h4>
                          <div className="bk-form-grid">
                            <div className="bk-field">
                              <label>Name</label>
                              <input value={form.client_name} onChange={(e) => setForm({ ...form, client_name: e.target.value })} />
                            </div>
                            <div className="bk-field">
                              <label>Email</label>
                              <input type="email" value={form.client_email} onChange={(e) => setForm({ ...form, client_email: e.target.value })} />
                            </div>
                            <div className="bk-field">
                              <label>Phone (optional)</label>
                              <input value={form.client_phone} onChange={(e) => setForm({ ...form, client_phone: e.target.value })} placeholder="+92 300 ..." />
                            </div>
                            <div className="bk-field">
                              <label>Service</label>
                              <select value={form.service} onChange={(e) => setForm({ ...form, service: e.target.value })}>
                                <option value="">Select service</option>
                                {SERVICES.map((s) => <option key={s} value={s}>{s}</option>)}
                              </select>
                            </div>
                            <div className="bk-field bk-field-full">
                              <label>Message (optional)</label>
                              <textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} placeholder="Briefly describe what you need..." rows={3} />
                            </div>
                          </div>
                          <button className="btn-primary" onClick={bookSlot} disabled={booking} style={{ width: "100%", marginTop: ".8rem" }}>
                            {booking ? "Booking..." : "Confirm Booking"}
                          </button>
                        </>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        ) : (
          /* My Bookings Tab */
          <div className="bk-my">
            {myBookings.length === 0 ? (
              <div className="bk-placeholder" style={{ padding: "3rem" }}>
                <h3>No bookings yet</h3>
                <p>Book a consultation to get started.</p>
              </div>
            ) : myBookings.map((b) => (
              <div key={b.id} className="bk-my-card">
                <div className="bk-my-top">
                  <div>
                    <strong>{b.booking_slots?.title ?? "Consultation"}</strong>
                    <span className={`bk-my-status bk-st-${b.status}`}>{b.status}</span>
                  </div>
                  <time>{new Date(b.created_at).toLocaleDateString()}</time>
                </div>
                <div className="bk-my-details">
                  {b.booking_slots && (
                    <>
                      <span>📅 {new Date(b.booking_slots.date + "T00:00").toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })}</span>
                      <span>🕐 {fmtTime(b.booking_slots.start_time)} — {fmtTime(b.booking_slots.end_time)}</span>
                    </>
                  )}
                  {b.service && <span>🏷️ {b.service}</span>}
                </div>
                {b.status === "confirmed" && (
                  <button className="bk-cancel" onClick={() => cancelBooking(b.id)}>Cancel Booking</button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <style>{`
        .bk-head{display:flex;justify-content:space-between;align-items:flex-end;padding:2rem 0 1.5rem;flex-wrap:wrap;gap:1rem}
        .bk-head h1{font-size:1.6rem;font-weight:800;margin:0}
        .bk-head p{color:var(--text-secondary);font-size:.9rem;margin:.2rem 0 0}
        .bk-tabs{display:flex;gap:.3rem;background:var(--surface);border:1px solid var(--border);border-radius:.5rem;padding:3px}
        .bk-tab{padding:.4rem 1rem;border-radius:.4rem;border:none;background:transparent;font-size:.82rem;font-weight:600;cursor:pointer;color:var(--text-secondary)}
        .bk-tab-active{background:var(--accent);color:#fff}

        .bk-success{background:#05966920;color:#059669;padding:.8rem 1.2rem;border-radius:.6rem;font-weight:600;font-size:.88rem;margin-bottom:1rem;text-align:center;animation:bkFade .3s ease}
        @keyframes bkFade{from{opacity:0;transform:translateY(-5px)}to{opacity:1;transform:translateY(0)}}

        .bk-layout{display:grid;grid-template-columns:380px 1fr;gap:1.5rem;padding-bottom:2rem}
        .bk-calendar{background:var(--surface);border:1px solid var(--border);border-radius:1rem;padding:1.25rem;align-self:start}
        .bk-cal-head{display:flex;justify-content:space-between;align-items:center;margin-bottom:1rem}
        .bk-cal-head strong{font-size:1rem}
        .bk-cal-nav{width:32px;height:32px;border-radius:50%;border:1px solid var(--border);background:transparent;cursor:pointer;font-size:.9rem;display:flex;align-items:center;justify-content:center;color:var(--text-primary);transition:all .15s}
        .bk-cal-nav:hover{background:var(--accent);color:#fff;border-color:var(--accent)}
        .bk-cal-weekdays{display:grid;grid-template-columns:repeat(7,1fr);gap:2px;margin-bottom:.4rem}
        .bk-cal-wd{text-align:center;font-size:.68rem;font-weight:700;color:var(--text-secondary);text-transform:uppercase;padding:.3rem 0}
        .bk-cal-grid{display:grid;grid-template-columns:repeat(7,1fr);gap:2px}
        .bk-cal-cell{width:100%;aspect-ratio:1;border:none;border-radius:.4rem;background:transparent;font-size:.82rem;font-weight:600;color:var(--text-primary);cursor:default;position:relative;display:flex;align-items:center;justify-content:center}
        .bk-cal-has{cursor:pointer;background:rgba(0,102,204,.06);color:var(--accent);font-weight:700}
        .bk-cal-has:hover{background:rgba(0,102,204,.14)}
        .bk-cal-past{opacity:.35}
        .bk-cal-today{box-shadow:inset 0 0 0 1.5px var(--accent);border-radius:.4rem}
        .bk-cal-selected{background:var(--accent)!important;color:#fff!important}
        .bk-cal-dot{position:absolute;bottom:3px;width:4px;height:4px;border-radius:50%;background:var(--accent)}
        .bk-cal-selected .bk-cal-dot{background:#fff}
        .bk-cal-empty{cursor:default}
        .bk-cal-legend{display:flex;gap:1.2rem;justify-content:center;margin-top:.8rem;font-size:.7rem;color:var(--text-secondary)}
        .bk-cal-dot-lg{display:inline-block;width:8px;height:8px;border-radius:50%;margin-right:.3rem;vertical-align:middle}
        .bk-dot-avail{background:rgba(0,102,204,.3)}
        .bk-dot-sel{background:var(--accent)}

        .bk-side{background:var(--surface);border:1px solid var(--border);border-radius:1rem;padding:1.5rem;min-height:300px}
        .bk-placeholder{text-align:center;padding:2rem;color:var(--text-secondary)}
        .bk-placeholder h3{font-size:1.05rem;margin:0 0 .3rem;color:var(--text-primary)}
        .bk-placeholder p{font-size:.85rem;margin:0}
        .bk-side-date{font-size:1rem;font-weight:700;margin:0 0 .8rem}

        .bk-slots{display:flex;flex-direction:column;gap:.5rem;margin-bottom:1rem}
        .bk-slot{display:flex;align-items:center;gap:.8rem;padding:.7rem .9rem;border:1.5px solid var(--border);border-radius:.6rem;background:transparent;cursor:pointer;text-align:left;transition:all .15s}
        .bk-slot:hover{border-color:var(--accent)}
        .bk-slot-active{border-color:var(--accent);background:rgba(0,102,204,.05)}
        .bk-slot-time{font-size:.88rem;font-weight:700;color:var(--accent);white-space:nowrap}
        .bk-slot-meta{flex:1}
        .bk-slot-title{font-size:.82rem;font-weight:600;display:block}
        .bk-slot-service{font-size:.7rem;color:var(--text-secondary)}
        .bk-slot-avail{font-size:.68rem;font-weight:700;color:#059669;background:#05966914;padding:.2rem .5rem;border-radius:999px}

        .bk-form{animation:bkFade .3s ease}
        .bk-form h4{font-size:.95rem;font-weight:700;margin:0 0 .8rem}
        .bk-form-grid{display:grid;grid-template-columns:1fr 1fr;gap:.6rem}
        .bk-field{display:flex;flex-direction:column;gap:.2rem}
        .bk-field-full{grid-column:1/-1}
        .bk-field label{font-size:.7rem;font-weight:700;color:var(--text-secondary);text-transform:uppercase;letter-spacing:.04em}
        .bk-field input,.bk-field select,.bk-field textarea{padding:.5rem .65rem;border:1px solid var(--border);border-radius:.45rem;font-size:.84rem;font-family:inherit;background:var(--bg);color:var(--text-primary);outline:none}
        .bk-field input:focus,.bk-field select:focus,.bk-field textarea:focus{border-color:var(--accent)}
        .bk-field textarea{resize:vertical}
        .bk-login-prompt{text-align:center;padding:1.5rem}
        .bk-login-prompt p{margin:0 0 .8rem;font-size:.88rem;color:var(--text-secondary)}

        .bk-my{display:flex;flex-direction:column;gap:.8rem;padding-bottom:2rem}
        .bk-my-card{background:var(--surface);border:1px solid var(--border);border-radius:.75rem;padding:1rem 1.25rem}
        .bk-my-top{display:flex;justify-content:space-between;align-items:center;margin-bottom:.5rem}
        .bk-my-top strong{font-size:.92rem}
        .bk-my-top time{font-size:.72rem;color:var(--text-secondary)}
        .bk-my-status{font-size:.68rem;font-weight:700;padding:.15rem .5rem;border-radius:999px;margin-left:.5rem}
        .bk-st-confirmed{background:#05966918;color:#059669}
        .bk-st-cancelled{background:#dc262618;color:#dc2626}
        .bk-st-completed{background:#0066cc18;color:#0066cc}
        .bk-my-details{display:flex;gap:1rem;font-size:.78rem;color:var(--text-secondary);flex-wrap:wrap}
        .bk-cancel{margin-top:.6rem;font-size:.75rem;padding:.35rem .8rem;border-radius:.4rem;border:1px solid #dc2626;color:#dc2626;background:transparent;cursor:pointer;font-weight:600;transition:all .15s}
        .bk-cancel:hover{background:#dc2626;color:#fff}

        @media(max-width:768px){.bk-layout{grid-template-columns:1fr}.bk-form-grid{grid-template-columns:1fr}}
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
