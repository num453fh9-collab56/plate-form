"use client";

import { useEffect } from "react";
import { useUI } from "@/lib/ui";
import { computeProfileStrength, useAuth } from "@/lib/auth";
import PostProjectModal from "./PostProjectModal";
import AuthModal from "./AuthModal";
import ProfileBuilder from "./ProfileBuilder";
import AccountSettings from "./AccountSettings";

const ONBOARD_KEY = "wv_onboard_prompted";

export default function Overlays() {
  const { toastMessage, toastVisible, openProfile } = useUI();
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
      <PostProjectModal />
      <AuthModal />
      <ProfileBuilder />
      <AccountSettings />
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
