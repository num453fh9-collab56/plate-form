"use client";

import { useEffect, useRef } from "react";

/** Counts one view per mount. The article itself is server-rendered. */
export default function ViewPing({ slug }: { slug: string }) {
  const sent = useRef(false);

  useEffect(() => {
    if (sent.current) return;
    sent.current = true;
    fetch(`/api/blog/view?slug=${encodeURIComponent(slug)}`, { method: "POST" }).catch(() => {});
  }, [slug]);

  return null;
}
