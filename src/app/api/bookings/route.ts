import { createClient } from "@supabase/supabase-js";
import { getUserFromRequest } from "@/lib/stripe-server";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

function adminSb() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
}

export async function GET(req: NextRequest) {
  const sb = adminSb();
  const mode = req.nextUrl.searchParams.get("mode");

  if (mode === "my-bookings") {
    const user = await getUserFromRequest(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { data } = await sb
      .from("bookings")
      .select("*, booking_slots(*)")
      .eq("client_id", user.id)
      .order("created_at", { ascending: false });
    return NextResponse.json({ bookings: data ?? [] });
  }

  if (mode === "all-bookings") {
    const user = await getUserFromRequest(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { data } = await sb
      .from("bookings")
      .select("*, booking_slots(*)")
      .order("created_at", { ascending: false });
    return NextResponse.json({ bookings: data ?? [] });
  }

  if (mode === "all-slots") {
    const user = await getUserFromRequest(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { data } = await sb
      .from("booking_slots")
      .select("*")
      .order("date", { ascending: true });
    return NextResponse.json({ slots: data ?? [] });
  }

  const from = req.nextUrl.searchParams.get("from") ?? new Date().toISOString().slice(0, 10);
  const to = req.nextUrl.searchParams.get("to");
  let q = sb
    .from("booking_slots")
    .select("*")
    .eq("is_active", true)
    .gte("date", from);
  if (to) q = q.lte("date", to);
  const { data } = await q.order("date").order("start_time");
  const available = (data ?? []).filter((s: { current_bookings: number; max_bookings: number }) => s.current_bookings < s.max_bookings);
  return NextResponse.json({ slots: available });
}

export async function POST(req: NextRequest) {
  const user = await getUserFromRequest(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { action } = body;
  const sb = adminSb();

  if (action === "book") {
    const { slot_id, client_name, client_email, client_phone, service, message } = body;
    if (!slot_id) return NextResponse.json({ error: "Slot required" }, { status: 400 });

    const { data: slot } = await sb.from("booking_slots").select("*").eq("id", slot_id).single();
    if (!slot) return NextResponse.json({ error: "Slot not found" }, { status: 404 });
    if (slot.current_bookings >= slot.max_bookings) return NextResponse.json({ error: "Slot is full" }, { status: 409 });

    const { data: existing } = await sb.from("bookings").select("id").eq("slot_id", slot_id).eq("client_id", user.id);
    if (existing && existing.length > 0) return NextResponse.json({ error: "Already booked" }, { status: 409 });

    const { data: booking, error } = await sb.from("bookings").insert({
      slot_id,
      client_id: user.id,
      client_name: client_name?.trim() ?? "",
      client_email: client_email?.trim() ?? "",
      client_phone: client_phone?.trim() ?? "",
      service: service ?? slot.service ?? "",
      message: message?.trim() ?? "",
      status: "confirmed",
    }).select().single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    await sb.from("booking_slots").update({
      current_bookings: slot.current_bookings + 1,
    }).eq("id", slot_id);

    return NextResponse.json({ booking });
  }

  if (action === "cancel") {
    const { bookingId } = body;
    const { data: booking } = await sb.from("bookings").select("*").eq("id", bookingId).single();
    if (!booking) return NextResponse.json({ error: "Not found" }, { status: 404 });

    await sb.from("bookings").update({ status: "cancelled" }).eq("id", bookingId);
    await sb.from("booking_slots").update({
      current_bookings: Math.max(0, (booking as { current_bookings?: number }).current_bookings ?? 1) - 1,
    }).eq("id", booking.slot_id);

    return NextResponse.json({ ok: true });
  }

  if (action === "create-slot") {
    const { title, service, date, start_time, end_time, max_bookings } = body;
    if (!date || !start_time || !end_time) return NextResponse.json({ error: "Date and times required" }, { status: 400 });

    const { data, error } = await sb.from("booking_slots").insert({
      title: title?.trim() || "Consultation",
      service: service ?? "",
      date,
      start_time,
      end_time,
      max_bookings: max_bookings ?? 1,
    }).select().single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ slot: data });
  }

  if (action === "bulk-slots") {
    const { slots } = body;
    if (!Array.isArray(slots) || slots.length === 0) return NextResponse.json({ error: "Slots array required" }, { status: 400 });
    const { data, error } = await sb.from("booking_slots").insert(
      slots.map((s: { title?: string; service?: string; date: string; start_time: string; end_time: string; max_bookings?: number }) => ({
        title: s.title?.trim() || "Consultation",
        service: s.service ?? "",
        date: s.date,
        start_time: s.start_time,
        end_time: s.end_time,
        max_bookings: s.max_bookings ?? 1,
      })),
    ).select();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ slots: data });
  }

  if (action === "delete-slot") {
    const { slotId } = body;
    await sb.from("booking_slots").update({ is_active: false }).eq("id", slotId);
    return NextResponse.json({ ok: true });
  }

  if (action === "update-booking-status") {
    const { bookingId, status } = body;
    await sb.from("bookings").update({ status }).eq("id", bookingId);
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
