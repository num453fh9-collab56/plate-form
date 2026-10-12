"use client";

import { useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { startTracking } from "@/lib/analytics";

export default function PageTracker() {
  const { user } = useAuth();
  useEffect(() => {
    return startTracking(user?.sub ?? null);
  }, [user?.sub]);
  return null;
}
