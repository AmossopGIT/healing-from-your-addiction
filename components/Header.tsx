"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { TrackedLink } from "@/components/TrackedLink";

type NavLink = {
  href: string;
  label: string;
};

const navLinks: NavLink[] = [
  { href: "/gambling-addiction-help/", label: "Gambling" },
  { href: "/food-addiction-binge-eating-help/", label: "Food" },
  { href: "/addiction-healing-programmes/", label: "Programmes" },
  { href: "/about-gerald-crawford/", label: "About" },
  { href: "/contact/", label: "Contact" },
];

function isActive(pathname: string | null, href: string) {
  if (!pathname) return false;
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(href);
}

export function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const pathname = usePathname();
  const lastScrollY = useRef(0);

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    close();
  }, [pathname, close]);

  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    function onScroll() {
      const y = window.scrollY;
      setScrolled(y > 20);

      if (!open && !reducedMotion) {
        const delta = y - lastScrollY.current;
        if (y > 100 && delta > 8) {
          setHidden(true);
        } else if (delta < -8 || y < 72) {
          setHidden(false);
        }
      }

      lastScrollY.current = y;
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    return () => window.removeEventListener("scroll", onScroll);
  }, [open]);

  useEffect(() => {
    if (open) {
      setHidden(false);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;

    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        close();
      }
    }

    document.addEventListener("keydown", onKey);
    document.body.classList.add("no-scroll");

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.classList.remove("no-scroll");
    };
  }, [open, close]);

  const headerClass = [
    "site-header",
    open && "is-open",
    scrolled && "is-scrolled",
    hidden && "is-hidden",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <header className={headerClass}>
      <div className="header-shell">
        <div className="header-bar">
          <div className="header-inner">
            <Link className="brand" href="/" aria-label="Healing From Your Addiction home" onClick={close}>
              <span className="brand-mark" aria-hidden="true">HFYA</span>
              <span className="brand-text">
                <strong>Healing From Your Addiction</strong>
                <small>Gerald Crawford</small>
              </span>
            </Link>
            <nav className="nav-links" aria-label="Main navigation">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={isActive(pathname, link.href) ? "is-active" : undefined}
                  aria-current={isActive(pathname, link.href) ? "page" : undefined}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
            <div className="header-actions">
              <TrackedLink
                href="/contact/"
                className="button button-primary button-small header-cta"
                tracking={{ ctaName: "need_help", linkLocation: "header" }}
              >
                Need help?
              </TrackedLink>
              <button
                type="button"
                className="nav-toggle"
                aria-label={open ? "Close menu" : "Open menu"}
                aria-expanded={open}
                aria-controls="mobile-menu"
                onClick={() => setOpen((value) => !value)}
              >
                <span aria-hidden="true" />
                <span aria-hidden="true" />
                <span aria-hidden="true" />
              </button>
            </div>
          </div>
          <div
            id="mobile-menu"
            className="mobile-menu"
            data-open={open}
            aria-hidden={!open}
            inert={!open}
          >
            <div className="mobile-menu-inner">
              <nav className="mobile-menu-links" aria-label="Mobile navigation">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={isActive(pathname, link.href) ? "is-active" : undefined}
                    aria-current={isActive(pathname, link.href) ? "page" : undefined}
                    onClick={close}
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
              <div className="mobile-menu-actions">
                <TrackedLink
                  href="/contact/"
                  className="button button-primary"
                  tracking={{ ctaName: "need_help", linkLocation: "mobile_menu" }}
                  onClick={close}
                >
                  Need help?
                </TrackedLink>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
