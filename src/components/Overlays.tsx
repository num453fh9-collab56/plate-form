"use client";

import { useUI } from "@/lib/ui";
import PostProjectModal from "./PostProjectModal";

export default function Overlays() {
  const { toastMessage, toastVisible } = useUI();

  return (
    <>
      <PostProjectModal />
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
