"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { FaArrowRightToBracket, FaBell, FaUser } from "react-icons/fa6";
import { SiteLink } from "@/components/SiteLink";
import { TrackedLink } from "@/components/TrackedLink";
import { blogPath, blogPosts } from "@/content/blog";
import { withBasePath } from "@/lib/basePath";

type NavLink = {
  href: string;
  label: string;
};

const navLinks: NavLink[] = [
  { href: "/", label: "Home" },
  { href: "/addictions/", label: "Addictions" },
  { href: "/programs/", label: "Programs" },
  { href: "/hypnotherapy-for-addiction/", label: "Hypnotherapy" },
  { href: "/about-the-therapist/", label: "About Gerald" },
  { href: "/blog/", label: "Resources" },
  { href: "/contact/", label: "Contact" },
];

const latestHeaderArticles = blogPosts.slice(0, 3);

function isActive(pathname: string | null, href: string) {
  if (!pathname) return false;
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(href);
}

export function Header() {
  const [open, setOpen] = useState(false);
  const [portalMenuOpen, setPortalMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const portalMenuRef = useRef<HTMLDivElement | null>(null);

  const close = useCallback(() => {
    setOpen(false);
    setPortalMenuOpen(false);
  }, []);

  useEffect(() => {
    close();
  }, [pathname, close]);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 20);
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    return () => window.removeEventListener("scroll", onScroll);
  }, []);

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

  useEffect(() => {
    function onPointerDown(event: MouseEvent) {
      if (!portalMenuRef.current?.contains(event.target as Node)) {
        setPortalMenuOpen(false);
      }
    }

    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setPortalMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKey);

    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  const headerClass = [
    "site-header",
    open && "is-open",
    scrolled && "is-scrolled",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <header className={headerClass}>
      <div className="header-shell">
        <div className="header-bar">
          <div className="header-inner">
            <SiteLink className="brand" href="/" aria-label="Healing From Your Addiction home" onClick={close}>
              <span className="brand-mark" aria-hidden="true">
                <img className="brand-mark-image" src={withBasePath("/icon.svg")} alt="" width={38} height={38} />
              </span>
              <span className="brand-text">
                <strong>Healing From Your Addiction</strong>
                <small>Gerald Crawford</small>
              </span>
            </SiteLink>
            <nav className="nav-links" aria-label="Main navigation">
              {navLinks.map((link) => (
                <SiteLink
                  key={link.href}
                  href={link.href}
                  className={isActive(pathname, link.href) ? "is-active" : undefined}
                  aria-current={isActive(pathname, link.href) ? "page" : undefined}
                >
                  {link.label}
                </SiteLink>
              ))}
            </nav>
            <div className="header-actions">
              <div className="header-utility-links" aria-label="Portal shortcuts">
                <TrackedLink
                  href="/portal/login/"
                  className="header-login-link"
                  tracking={{ ctaName: "client_login_header", linkLocation: "header" }}
                >
                  <FaArrowRightToBracket className="header-utility-icon" aria-hidden="true" />
                  <span className="header-login-label-full">Client login</span>
                  <span className="header-login-label-short">Log in</span>
                </TrackedLink>
                <div className="header-utility-menu" ref={portalMenuRef}>
                  <button
                    type="button"
                    className={`header-icon-button${portalMenuOpen ? " is-open" : ""}`}
                    aria-label="Client portal shortcuts"
                    aria-expanded={portalMenuOpen}
                    aria-haspopup="dialog"
                    onClick={() => setPortalMenuOpen((value) => !value)}
                  >
                    <FaBell className="header-utility-icon" aria-hidden="true" />
                    <span className="visually-hidden">Client portal shortcuts</span>
                  </button>
                  {portalMenuOpen ? (
                    <div className="header-utility-panel" role="dialog" aria-label="Client portal shortcuts">
                      <div className="header-utility-panel-copy">
                        <p className="header-utility-panel-title">Latest resources</p>
                        <p className="header-utility-panel-text">
                          Read the newest articles here, or open your secure client portal for messages and resources.
                        </p>
                      </div>
                      <div className="header-utility-articles">
                        {latestHeaderArticles.length ? (
                          latestHeaderArticles.map((article) => (
                            <SiteLink
                              key={article.slug}
                              href={blogPath(article.slug)}
                              className="header-utility-article-link"
                              onClick={() => setPortalMenuOpen(false)}
                            >
                              <strong>{article.title}</strong>
                              <span>{article.excerpt}</span>
                            </SiteLink>
                          ))
                        ) : (
                          <SiteLink
                            href="/blog/"
                            className="header-utility-article-link"
                            onClick={() => setPortalMenuOpen(false)}
                          >
                            <strong>Browse resources</strong>
                            <span>Open the full article library.</span>
                          </SiteLink>
                        )}
                      </div>
                      <div className="header-utility-panel-links">
                        <TrackedLink
                          href="/portal/messages/"
                          className="header-utility-panel-link"
                          tracking={{ ctaName: "messages_header", linkLocation: "header_panel" }}
                          onClick={() => setPortalMenuOpen(false)}
                        >
                          Secure messages
                        </TrackedLink>
                        <TrackedLink
                          href="/portal/resources/"
                          className="header-utility-panel-link"
                          tracking={{ ctaName: "resources_header_panel", linkLocation: "header_panel" }}
                          onClick={() => setPortalMenuOpen(false)}
                        >
                          New resources
                        </TrackedLink>
                        <TrackedLink
                          href="/portal/account/"
                          className="header-utility-panel-link"
                          tracking={{ ctaName: "profile_header", linkLocation: "header_panel" }}
                          onClick={() => setPortalMenuOpen(false)}
                        >
                          Account profile
                        </TrackedLink>
                      </div>
                    </div>
                  ) : null}
                </div>
                <TrackedLink
                  href="/portal/login/"
                  className="header-icon-link"
                  aria-label="Client portal login"
                  tracking={{ ctaName: "client_login_profile_header", linkLocation: "header" }}
                >
                  <FaUser className="header-utility-icon" aria-hidden="true" />
                  <span className="visually-hidden">Client portal login</span>
                </TrackedLink>
              </div>
              <TrackedLink
                href="/contact/"
                className="button button-primary button-small header-cta"
                tracking={{ ctaName: "need_help", linkLocation: "header" }}
              >
                <span className="header-cta-label-full">Need help?</span>
                <span className="header-cta-label-short">Help</span>
              </TrackedLink>
              <button
                type="button"
                className="nav-toggle"
                aria-label={open ? "Close menu" : "Open menu"}
                aria-expanded={open}
                aria-controls="mobile-menu"
                onClick={() => {
                  setPortalMenuOpen(false);
                  setOpen((value) => !value);
                }}
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
                  <SiteLink
                    key={link.href}
                    href={link.href}
                    className={isActive(pathname, link.href) ? "is-active" : undefined}
                    aria-current={isActive(pathname, link.href) ? "page" : undefined}
                    onClick={close}
                  >
                    {link.label}
                  </SiteLink>
                ))}
              </nav>
              <div className="mobile-menu-utility-links" aria-label="Portal shortcuts">
                <TrackedLink
                  href="/portal/messages/"
                  className="button button-secondary"
                  tracking={{ ctaName: "messages_header", linkLocation: "mobile_menu" }}
                  onClick={close}
                >
                  <FaBell className="header-utility-icon" aria-hidden="true" />
                  <span>Messages</span>
                </TrackedLink>
                <TrackedLink
                  href="/portal/account/"
                  className="button button-secondary"
                  tracking={{ ctaName: "profile_header", linkLocation: "mobile_menu" }}
                  onClick={close}
                >
                  <FaUser className="header-utility-icon" aria-hidden="true" />
                  <span>Profile</span>
                </TrackedLink>
              </div>
              <div className="mobile-menu-actions">
                <TrackedLink
                  href="/portal/login/"
                  className="button button-secondary"
                  tracking={{ ctaName: "client_login_header", linkLocation: "mobile_menu" }}
                  onClick={close}
                >
                  Client login
                </TrackedLink>
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
