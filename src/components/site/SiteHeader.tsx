"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { useUI } from "@/lib/ui";
import { PRIMARY_NAV } from "@/lib/content/nav";
import type { NavItem } from "@/lib/content/nav";
import BrandMark from "@/components/BrandMark";
import AccountMenu from "@/components/AccountMenu";
import LanguageSelector from "@/components/LanguageSelector";
import CurrencySelector from "@/components/CurrencySelector";
import NotificationBell from "@/components/NotificationBell";
import { ArrowRight, ChevronDown } from "./Icons";

/* ==========================================================================
   HIRELYX · SITE HEADER
   --------------------------------------------------------------------------
   Desktop: a mega menu that opens on hover and on click, closes on Escape,
   on outside click and on route change. Each trigger is a real button with
   aria-expanded/aria-controls, and the panel is reachable with Tab.

   Mobile: a full-height drawer with disclosure groups.

   Preserved from the previous header: language and currency selectors,
   notification bell, account menu, the auth modal trigger and the
   dashboard link for signed-in users.
   ========================================================================== */

const HOVER_CLOSE_DELAY = 140;

function Logo({ onClick }: { onClick?: () => void }) {
  return (
    <Link href="/" className="hx-logo" aria-label="Hirelyx — home" onClick={onClick}>
      <span className="hx-logo-mark" aria-hidden>
        <BrandMark />
      </span>
      <span className="hx-logo-word">
        Hire<i>lyx</i>
      </span>
    </Link>
  );
}

function MegaPanel({ item, id }: { item: NavItem; id: string }) {
  return (
    <div className="hx-mega" id={id}>
      <div className="hx-wrap">
        <div className="hx-mega-inner">
          <div className="hx-mega-groups">
            {item.groups?.map((group) => (
              <div className="hx-mega-group" key={group.id}>
                <h3>{group.title}</h3>
                <ul className="hx-mega-list">
                  {group.links.map((link) => (
                    <li key={link.href + link.label}>
                      <Link className="hx-mega-link" href={link.href}>
                        <b>{link.label}</b>
                        {link.hint ? <span>{link.hint}</span> : null}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {item.feature ? (
            <aside className="hx-mega-aside">
              <p className="hx-kicker">{item.feature.kicker}</p>
              <h3>{item.feature.title}</h3>
              <p>{item.feature.body}</p>
              <Link className="hx-btn hx-btn-light hx-btn-sm" href={item.feature.cta.href}>
                {item.feature.cta.label}
                <ArrowRight size={15} className="hx-btn-arrow" />
              </Link>
            </aside>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function MobileGroup({
  item,
  onNavigate,
}: {
  item: NavItem;
  onNavigate: () => void;
}) {
  const [open, setOpen] = useState(false);
  const panelId = `hx-drawer-${item.id}`;

  if (!item.groups) {
    return (
      <div className="hx-drawer-group">
        <Link className="hx-drawer-top" href={item.href} onClick={onNavigate}>
          {item.label}
        </Link>
      </div>
    );
  }

  return (
    <div className="hx-drawer-group">
      <button
        type="button"
        className="hx-drawer-top"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((v) => !v)}
      >
        {item.label}
        <ChevronDown size={18} />
      </button>
      <div id={panelId} hidden={!open}>
        <div className="hx-drawer-body">
          <div className="hx-drawer-sub">
            <h3>Overview</h3>
            <ul>
              <li>
                <Link href={item.href} onClick={onNavigate}>
                  All {item.label.toLowerCase()}
                </Link>
              </li>
            </ul>
          </div>
          {item.groups.map((group) => (
            <div className="hx-drawer-sub" key={group.id}>
              <h3>{group.title}</h3>
              <ul>
                {group.links.map((link) => (
                  <li key={link.href + link.label}>
                    <Link href={link.href} onClick={onNavigate}>
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function SiteHeader() {
  const { user } = useAuth();
  const { openAuth } = useUI();
  const pathname = usePathname();

  const [openId, setOpenId] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const hoverTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const closeAll = useCallback(() => {
    setOpenId(null);
    setDrawerOpen(false);
  }, []);

  /* Close everything when the route changes. Adjusting state during render
     (rather than in an effect) avoids a frame where a stale mega panel or
     drawer is still painted over the new page. */
  const [navPath, setNavPath] = useState(pathname);
  if (navPath !== pathname) {
    setNavPath(pathname);
    if (openId !== null) setOpenId(null);
    if (drawerOpen) setDrawerOpen(false);
  }

  /* Elevate the bar once the page scrolls. */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* Escape closes; outside click closes the mega panel. */
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeAll();
    };
    const onPointer = (event: PointerEvent) => {
      if (!headerRef.current) return;
      if (!headerRef.current.contains(event.target as Node)) setOpenId(null);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointer);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointer);
    };
  }, [closeAll]);

  /* Lock background scroll while the mobile drawer is open. */
  useEffect(() => {
    if (!drawerOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [drawerOpen]);

  useEffect(() => () => {
    if (hoverTimer.current) clearTimeout(hoverTimer.current);
  }, []);

  const hoverOpen = (id: string) => {
    if (hoverTimer.current) clearTimeout(hoverTimer.current);
    setOpenId(id);
  };
  const hoverClose = () => {
    if (hoverTimer.current) clearTimeout(hoverTimer.current);
    hoverTimer.current = setTimeout(() => setOpenId(null), HOVER_CLOSE_DELAY);
  };

  const isActive = (item: NavItem) =>
    item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);

  return (
    <header
      ref={headerRef}
      className="hx-header"
      data-scrolled={scrolled ? "true" : "false"}
      data-open={openId || drawerOpen ? "true" : "false"}
    >
      <a className="hx-skip" href="#main">
        Skip to main content
      </a>

      <div className="hx-wrap">
        <div className="hx-header-bar">
          <Logo onClick={closeAll} />

          <nav className="hx-nav" aria-label="Main">
            {PRIMARY_NAV.map((item) => {
              if (!item.groups) {
                return (
                  <div className="hx-nav-item" key={item.id}>
                    <Link
                      className="hx-nav-trigger"
                      href={item.href}
                      data-active={isActive(item) ? "true" : undefined}
                    >
                      {item.label}
                    </Link>
                  </div>
                );
              }
              const panelId = `hx-mega-${item.id}`;
              const expanded = openId === item.id;
              return (
                <div
                  className="hx-nav-item"
                  key={item.id}
                  onMouseEnter={() => hoverOpen(item.id)}
                  onMouseLeave={hoverClose}
                >
                  <button
                    type="button"
                    className="hx-nav-trigger"
                    aria-expanded={expanded}
                    aria-controls={panelId}
                    data-active={isActive(item) ? "true" : undefined}
                    onClick={() => setOpenId(expanded ? null : item.id)}
                  >
                    {item.label}
                    <ChevronDown />
                  </button>
                  {expanded ? <MegaPanel item={item} id={panelId} /> : null}
                </div>
              );
            })}
          </nav>

          <div className="hx-header-actions">
            <LanguageSelector />
            <CurrencySelector />
            <NotificationBell />
            {user ? (
              <>
                <Link className="hx-btn hx-btn-secondary hx-btn-sm" href="/dashboard">
                  Dashboard
                </Link>
                <AccountMenu />
              </>
            ) : (
              <button
                type="button"
                className="hx-btn hx-btn-secondary hx-btn-sm"
                onClick={() => openAuth("login")}
              >
                Sign in
              </button>
            )}
            <Link className="hx-btn hx-btn-sm" href="/contact">
              Start a Project
              <ArrowRight size={15} className="hx-btn-arrow" />
            </Link>
          </div>

          <button
            type="button"
            className="hx-burger"
            aria-expanded={drawerOpen}
            aria-controls="hx-drawer"
            aria-label={drawerOpen ? "Close navigation menu" : "Open navigation menu"}
            onClick={() => setDrawerOpen((v) => !v)}
          >
            <span className="hx-burger-lines" aria-hidden>
              <span />
              <span />
              <span />
            </span>
          </button>
        </div>
      </div>

      {drawerOpen ? (
        <div className="hx-drawer" id="hx-drawer">
          {PRIMARY_NAV.map((item) => (
            <MobileGroup key={item.id} item={item} onNavigate={closeAll} />
          ))}

          <div className="hx-drawer-foot">
            <Link className="hx-btn" href="/contact" onClick={closeAll}>
              Start a Project
              <ArrowRight size={15} className="hx-btn-arrow" />
            </Link>
            {user ? (
              <Link className="hx-btn hx-btn-secondary" href="/dashboard" onClick={closeAll}>
                Go to dashboard
              </Link>
            ) : (
              <button
                type="button"
                className="hx-btn hx-btn-secondary"
                onClick={() => {
                  closeAll();
                  openAuth("login");
                }}
              >
                Sign in
              </button>
            )}
          </div>

          <div className="hx-drawer-meta">
            <LanguageSelector />
            <CurrencySelector />
            <NotificationBell />
            {user ? <AccountMenu /> : null}
          </div>
        </div>
      ) : null}
    </header>
  );
}
