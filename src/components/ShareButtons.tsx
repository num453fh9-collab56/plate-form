"use client";

import { useState } from "react";

interface ShareButtonsProps {
  url: string;
  title: string;
  gigId?: string;
}

export default function ShareButtons({ url, title, gigId }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);
  const encoded = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  const track = (platform: string) => {
    if (gigId) {
      void fetch("/api/gig-share", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gigId, platform }),
      }).catch(() => {});
    }
  };

  return (
    <div className="share-btns">
      <button
        type="button"
        className="share-btn share-copy"
        onClick={() => {
          void navigator.clipboard.writeText(url).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
          }).catch(() => {});
          track("copy");
        }}
      >
        {copied ? "Copied!" : "Copy link"}
      </button>
      <a
        className="share-btn share-wa"
        href={`https://wa.me/?text=${encodedTitle}%20${encoded}`}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => track("whatsapp")}
      >
        WhatsApp
      </a>
      <a
        className="share-btn share-fb"
        href={`https://www.facebook.com/sharer/sharer.php?u=${encoded}`}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => track("facebook")}
      >
        Facebook
      </a>
      <a
        className="share-btn share-tw"
        href={`https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encoded}`}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => track("twitter")}
      >
        Twitter
      </a>
      <a
        className="share-btn share-li"
        href={`https://www.linkedin.com/sharing/share-offsite/?url=${encoded}`}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => track("linkedin")}
      >
        LinkedIn
      </a>
    </div>
  );
}
