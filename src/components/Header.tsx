"use client";

import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/lib/auth";
import { useUI } from "@/lib/ui";
import { initials } from "@/lib/format";

export default function Header() {
  const { user, configured, googleHostRef, signOut, promptSignIn } = useAuth();
  const { openPost, toast } = useUI();
  const [menuOpen, setMenuOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setUserOpen(false);
      }
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  const handleSignIn = () => {
    if (!configured) {
      toast("Add your Google OAuth client ID to enable sign-in.");
      return;
    }
    promptSignIn();
  };

  return (
    <header>
      <div className="wrap nav">
        <a href="#" className="logo">
          <span className="mark">W</span>
          <b>
            Work<span className="accent">Vortex</span>
          </b>
        </a>
        <button
          className="menu-toggle"
          type="button"
          aria-label="Toggle navigation"
          onClick={() => setMenuOpen((open) => !open)}
        >
          &#9776;
        </button>
        <nav className={"nav-links" + (menuOpen ? " open" : "")}>
          <a href="#gigs" onClick={() => setMenuOpen(false)}>
            Browse Gigs
          </a>
          <a
            href="#post"
            className="link-btn"
            onClick={(event) => {
              event.preventDefault();
              setMenuOpen(false);
              openPost();
            }}
          >
            Post a Project
          </a>

          {!user && (
            <span className="signin-wrap">
              <button className="btn-signin" type="button" onClick={handleSignIn}>
                Sign In
              </button>
              <span ref={googleHostRef} aria-hidden="true" />
            </span>
          )}

          {user && (
            <div className={"user-menu" + (userOpen ? " open" : "")} ref={menuRef}>
              <button
                className="user-trigger"
                type="button"
                aria-haspopup="true"
                aria-expanded={userOpen}
                onClick={(event) => {
                  event.stopPropagation();
                  setUserOpen((open) => !open);
                }}
              >
                {user.picture ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img className="user-avatar" src={user.picture} alt="" />
                ) : (
                  <span className="user-initials">{initials(user.name)}</span>
                )}
                <span className="user-label">{user.name.split(" ")[0]}</span>
                <svg
                  className="chev"
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                >
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </button>
              <div className="user-dropdown" role="menu">
                <div className="user-dd-head">
                  {user.picture ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={user.picture} alt="" />
                  ) : (
                    <span className="user-initials">{initials(user.name)}</span>
                  )}
                  <div className="user-dd-info">
                    <strong>{user.name}</strong>
                    <span>{user.email}</span>
                  </div>
                </div>
                <button
                  className="user-signout"
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    signOut();
                    setUserOpen(false);
                    toast("Signed out.");
                  }}
                >
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
