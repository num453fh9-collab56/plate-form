"use client";

import type { ReactNode } from "react";
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from "react";

interface UIValue {
  toast: (message: string, duration?: number) => void;
  toastMessage: string;
  toastVisible: boolean;
  isPostOpen: boolean;
  openPost: () => void;
  closePost: () => void;
}

const UIContext = createContext<UIValue | null>(null);

export function UIProvider({ children }: { children: ReactNode }) {
  const [isPostOpen, setIsPostOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastVisible, setToastVisible] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const toast = useCallback((message: string, duration = 3600) => {
    setToastMessage(message);
    setToastVisible(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setToastVisible(false), duration);
  }, []);

  const openPost = useCallback(() => setIsPostOpen(true), []);
  const closePost = useCallback(() => setIsPostOpen(false), []);

  const value = useMemo<UIValue>(
    () => ({
      toast,
      toastMessage,
      toastVisible,
      isPostOpen,
      openPost,
      closePost,
    }),
    [toast, toastMessage, toastVisible, isPostOpen, openPost, closePost],
  );

  return <UIContext.Provider value={value}>{children}</UIContext.Provider>;
}

export function useUI(): UIValue {
  const context = useContext(UIContext);
  if (!context) {
    throw new Error("useUI must be used within UIProvider");
  }
  return context;
}
