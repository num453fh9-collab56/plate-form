"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { useUI } from "@/lib/ui";
import { getSupabase } from "@/lib/supabase";
import { formatPrice } from "@/lib/format";

interface OrderDetail {
  id: string;
  gig_id: string | null;
  buyer_id: string;
  seller_id: string | null;
  amount: number;
  currency: string;
  status: string;
  requirements: string | null;
  delivery_note: string | null;
  revision_note: string | null;
  revision_count: number | null;
  created_at: string;
  delivered_at: string | null;
}

export default function OrderDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id ?? "";
  const { user } = useAuth();
  const { openAuth } = useUI();
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [gigTitle, setGigTitle] = useState("Gig");
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const supabase = getSupabase();
    if (!supabase || !user?.sub || !id) return;
    void supabase
      .from("orders")
      .select("*")
      .eq("id", id)
      .maybeSingle()
      .then(async ({ data, error }) => {
        if (error || !data) {
          setNotFound(true);
          setLoading(false);
          return;
        }
        const row = data as OrderDetail;
        setOrder(row);
        if (row.gig_id) {
          const { data: gig } = await supabase
            .from("gigs")
            .select("title")
            .eq("id", row.gig_id)
            .maybeSingle();
          if (gig) setGigTitle((gig as { title: string }).title);
        }
        setLoading(false);
      });
  }, [user, id]);

  if (!user) {
    return (
      <section className="section">
        <div className="wrap">
          <div className="empty">
            <h3>Sign in to view this order</h3>
            <button className="btn-primary" type="button" onClick={() => openAuth("login")}>
              Sign in
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="section">
      <div className="wrap">
        {loading ? (
          <p style={{ color: "var(--muted)" }}>Loading...</p>
        ) : notFound || !order ? (
          <div className="empty">
            <h3>Order not found</h3>
            <Link className="btn-primary" href="/orders">Back to orders</Link>
          </div>
        ) : (
          <div className="order-row">
            <div className="order-title">
              {order.gig_id ? <Link href={`/gig/${order.gig_id}`}>{gigTitle}</Link> : gigTitle}
            </div>
            <div className="order-meta">
              <span className={"status-pill " + (order.status === "cancelled" ? "muted" : order.status === "revision" ? "warn" : "ok")}>
                {order.status}
              </span>
              <span>${formatPrice(order.amount)}</span>
              <span>Placed {new Date(order.created_at).toLocaleString()}</span>
              {order.delivered_at ? <span>Delivered {new Date(order.delivered_at).toLocaleString()}</span> : null}
              {order.revision_count ? <span>Revisions: {order.revision_count}</span> : null}
            </div>
            {order.requirements ? <p className="order-note">Requirements: {order.requirements}</p> : null}
            {order.delivery_note ? <p className="order-note">Delivery note: {order.delivery_note}</p> : null}
            {order.revision_note ? <p className="order-note">Revision note: {order.revision_note}</p> : null}
          </div>
        )}
      </div>
    </section>
  );
}
