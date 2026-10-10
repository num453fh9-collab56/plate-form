"use client";

import { useEffect } from "react";
import { useUI } from "@/lib/ui";
import { computeProfileStrength, useAuth } from "@/lib/auth";
import dynamic from "next/dynamic";

/* Modals are heavy (the profile builder alone pulls in every onboarding step)
   and closed on almost every page view, so load each bundle on first open. */
const AuthModal = dynamic(() => import("./AuthModal"), { ssr: false });
const ProfileBuilder = dynamic(() => import("./ProfileBuilder"), { ssr: false });
const AccountSettings = dynamic(() => import("./AccountSettings"), { ssr: false });
const MessagesModal = dynamic(() => import("./MessagesModal"), { ssr: false });
const VideoLightbox = dynamic(() => import("./VideoLightbox"), { ssr: false });

const ONBOARD_KEY = "wv_onboard_prompted";

export default function Overlays() {
  const {
    toastMessage,
    toastVisible,
    openProfile,
    isAuthOpen,
    isProfileOpen,
    isAccountOpen,
    isMessagesOpen,
    isVideoOpen,
  } = useUI();
  const { user, profile } = useAuth();

  useEffect(() => {
    if (!user) return;
    const flag = `${ONBOARD_KEY}:${user.email}`;
    let prompted = false;
    try {
      prompted = window.sessionStorage.getItem(flag) === "1";
    } catch {
      /* storage unavailable */
    }
    if (prompted) return;

    const strength = computeProfileStrength(profile);
    const requiredDone = (["fullName", "title", "bio", "phone", "avatar"] as const).every(
      (key) => strength.items.find((item) => item.key === key)?.done,
    );

    try {
      window.sessionStorage.setItem(flag, "1");
    } catch {
      /* storage unavailable */
    }

    if (!requiredDone) openProfile();
  }, [user, profile, openProfile]);

  return (
    <>
      {isAuthOpen ? <AuthModal /> : null}
      {isProfileOpen ? <ProfileBuilder /> : null}
      {isAccountOpen ? <AccountSettings /> : null}
      {isMessagesOpen ? <MessagesModal /> : null}
      {isVideoOpen ? <VideoLightbox /> : null}
      <div
        className={"toast" + (toastVisible ? " show" : "")}
        role="status"
        aria-live="polite"
      >
        {toastMessage}
      </div>
    </>
  );
}
