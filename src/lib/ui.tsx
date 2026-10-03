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

export type AuthModalMode = "signup" | "login";

export interface VideoPayload {
  src: string;
  title?: string;
  poster?: string;
}

interface UIValue {
  toast: (message: string, duration?: number) => void;
  toastMessage: string;
  toastVisible: boolean;
  isVideoOpen: boolean;
  videoSrc: string;
  videoTitle: string;
  videoPoster: string;
  openVideo: (payload: VideoPayload) => void;
  closeVideo: () => void;
  isPostOpen: boolean;
  openPost: () => void;
  closePost: () => void;
  isAuthOpen: boolean;
  authMode: AuthModalMode;
  openAuth: (mode?: AuthModalMode) => void;
  closeAuth: () => void;
  isProfileOpen: boolean;
  openProfile: () => void;
  closeProfile: () => void;
  isAccountOpen: boolean;
  openAccount: () => void;
  closeAccount: () => void;
}

const UIContext = createContext<UIValue | null>(null);

export function UIProvider({ children }: { children: ReactNode }) {
  const [isPostOpen, setIsPostOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<AuthModalMode>("signup");
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastVisible, setToastVisible] = useState(false);
  const [video, setVideo] = useState<VideoPayload | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const toast = useCallback((message: string, duration = 3600) => {
    setToastMessage(message);
    setToastVisible(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setToastVisible(false), duration);
  }, []);

  const openPost = useCallback(() => setIsPostOpen(true), []);
  const closePost = useCallback(() => setIsPostOpen(false), []);

  const openAuth = useCallback((mode: AuthModalMode = "signup") => {
    setAuthMode(mode);
    setIsAuthOpen(true);
    setIsProfileOpen(false);
    setIsAccountOpen(false);
  }, []);
  const closeAuth = useCallback(() => setIsAuthOpen(false), []);

  const openProfile = useCallback(() => {
    setIsAuthOpen(false);
    setIsAccountOpen(false);
    setIsProfileOpen(true);
  }, []);
  const closeProfile = useCallback(() => setIsProfileOpen(false), []);

  const openAccount = useCallback(() => {
    setIsAuthOpen(false);
    setIsProfileOpen(false);
    setIsAccountOpen(true);
  }, []);
  const closeAccount = useCallback(() => setIsAccountOpen(false), []);

  const openVideo = useCallback((payload: VideoPayload) => {
    setVideo({
      src: payload.src,
      title: payload.title ?? "",
      poster: payload.poster ?? "",
    });
  }, []);
  const closeVideo = useCallback(() => setVideo(null), []);

  const value = useMemo<UIValue>(
    () => ({
      toast,
      toastMessage,
      toastVisible,
      isVideoOpen: video !== null,
      videoSrc: video?.src ?? "",
      videoTitle: video?.title ?? "",
      videoPoster: video?.poster ?? "",
      openVideo,
      closeVideo,
      isPostOpen,
      openPost,
      closePost,
      isAuthOpen,
      authMode,
      openAuth,
      closeAuth,
      isProfileOpen,
      openProfile,
      closeProfile,
      isAccountOpen,
      openAccount,
      closeAccount,
    }),
    [
      toast,
      toastMessage,
      toastVisible,
      video,
      openVideo,
      closeVideo,
      isPostOpen,
      openPost,
      closePost,
      isAuthOpen,
      authMode,
      openAuth,
      closeAuth,
      isProfileOpen,
      openProfile,
      closeProfile,
      isAccountOpen,
      openAccount,
      closeAccount,
    ],
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
