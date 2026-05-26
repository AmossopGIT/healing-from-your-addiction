"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { FaBell, FaRegCircleUser } from "react-icons/fa6";
import hfyaLogo from "@/app/icon.png";
import { SiteLink } from "@/components/SiteLink";
import { TrackedLink } from "@/components/TrackedLink";
import { blogPath, blogPosts } from "@/content/blog";
import { createClient, getSupabaseBrowserConfigError } from "@/lib/supabase/client";
import type { UserRole } from "@/types/database";

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

type HeaderAccount = {
  isSignedIn: boolean;
  role: UserRole | null;
  fullName: string | null;
  email: string | null;
};

const signedOutAccount: HeaderAccount = {
  isSignedIn: false,
  role: null,
  fullName: null,
  email: null,
};

function isActive(pathname: string | null, href: string) {
  if (!pathname) return false;
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(href);
}

function getAccountDisplayName(account: HeaderAccount) {
  const name = account.fullName?.trim();
  if (name) return name.split(/\s+/)[0];
  const emailName = account.email?.split("@")[0]?.trim();
  if (emailName) return emailName;
  return "Account";
}

function getAccountHref(account: HeaderAccount) {
  if (!account.isSignedIn) return "/portal/login/";
  return account.role === "admin" ? "/admin/" : "/portal/account/";
}

function getPrimaryPortalHref(account: HeaderAccount) {
  if (!account.isSignedIn) return "/portal/login/";
  return account.role === "admin" ? "/admin/" : "/portal/";
}

export function Header() {
  const [open, setOpen] = useState(false);
  const [portalMenuOpen, setPortalMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [account, setAccount] = useState<HeaderAccount>(signedOutAccount);
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

  useEffect(() => {
    if (getSupabaseBrowserConfigError()) {
      setAccount(signedOutAccount);
      return;
    }

    const supabase = createClient();
    let isActive = true;

    async function loadAccount(user: { id: string; email?: string | null } | null) {
      if (!user) {
        if (isActive) {
          setAccount(signedOutAccount);
        }
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, role")
        .eq("id", user.id)
        .maybeSingle();

      if (!isActive) return;

      setAccount({
        isSignedIn: true,
        role: profile?.role ?? null,
        fullName: profile?.full_name ?? null,
        email: user.email ?? null,
      });
    }

    void supabase.auth.getUser().then(({ data }) => loadAccount(data.user));

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      void loadAccount(session?.user ?? null);
    });

    return () => {
      isActive = false;
      subscription.unsubscribe();
    };
  }, []);

  const headerClass = [
    "site-header",
    open && "is-open",
    scrolled && "is-scrolled",
  ]
    .filter(Boolean)
    .join(" ");
  const accountDisplayName = getAccountDisplayName(account);
  const accountHref = getAccountHref(account);
  const primaryPortalHref = getPrimaryPortalHref(account);
  const isAdmin = account.role === "admin";
  const isSignedIn = account.isSignedIn;
  const accountAriaLabel = isSignedIn ? `Open account for ${accountDisplayName}` : "Log in or sign up";

  return (
    <header className={headerClass}>
      <div className="header-shell">
        <div className="header-bar">
          <div className="header-inner">
            <SiteLink className="brand" href="/" aria-label="Healing From Your Addiction home" onClick={close}>
              <span className="brand-mark" aria-hidden="true">
                <img className="brand-mark-image" src={hfyaLogo.src} alt="" width={38} height={38} />
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
                  href={accountHref}
                  className="header-icon-link"
                  aria-label={accountAriaLabel}
                  title={accountAriaLabel}
                  tracking={{
                    ctaName: isSignedIn ? "account_header" : "client_login_header",
                    linkLocation: "header",
                  }}
                >
                  <FaRegCircleUser className="header-utility-icon" aria-hidden="true" />
                  <span className="visually-hidden">{accountAriaLabel}</span>
                </TrackedLink>
                <div className="header-utility-menu" ref={portalMenuRef}>
                  <button
                    type="button"
                    className={`header-icon-button${portalMenuOpen ? " is-open" : ""}`}
                    aria-label="Portal and resource shortcuts"
                    aria-expanded={portalMenuOpen}
                    aria-haspopup="dialog"
                    onClick={() => setPortalMenuOpen((value) => !value)}
                  >
                    <FaBell className="header-utility-icon" aria-hidden="true" />
                    <span className="visually-hidden">Client portal shortcuts</span>
                  </button>
                  {portalMenuOpen ? (
                    <div className="header-utility-panel" role="dialog" aria-label="Portal and resource shortcuts">
                      <div className="header-utility-panel-copy">
                        <p className="header-utility-panel-title">
                          {isSignedIn ? `Hello, ${accountDisplayName}` : "Latest resources"}
                        </p>
                        <p className="header-utility-panel-text">
                          {isSignedIn
                            ? "Open your account area or browse the latest resources from the site."
                            : "Read the newest articles here, or log in and create your account from one place."}
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
                        {isSignedIn ? (
                          <>
                            <TrackedLink
                              href={primaryPortalHref}
                              className="header-utility-panel-link header-utility-panel-link-primary"
                              tracking={{ ctaName: isAdmin ? "admin_header" : "portal_header", linkLocation: "header_panel" }}
                              onClick={() => setPortalMenuOpen(false)}
                            >
                              {isAdmin ? "Open admin dashboard" : "Open client portal"}
                            </TrackedLink>
                            {!isAdmin ? (
                              <>
                                <TrackedLink
                                  href="/portal/messages/"
                                  className="header-utility-panel-link"
                                  tracking={{ ctaName: "messages_header", linkLocation: "header_panel" }}
                                  onClick={() => setPortalMenuOpen(false)}
                                >
                                  Secure messages
                                </TrackedLink>
                                <TrackedLink
                                  href="/portal/account/"
                                  className="header-utility-panel-link"
                                  tracking={{ ctaName: "profile_header", linkLocation: "header_panel" }}
                                  onClick={() => setPortalMenuOpen(false)}
                                >
                                  Account profile
                                </TrackedLink>
                              </>
                            ) : (
                              <TrackedLink
                                href="/blog/"
                                className="header-utility-panel-link"
                                tracking={{ ctaName: "resources_header_panel", linkLocation: "header_panel" }}
                                onClick={() => setPortalMenuOpen(false)}
                              >
                                Browse resources
                              </TrackedLink>
                            )}
                          </>
                        ) : (
                          <>
                            <TrackedLink
                              href="/portal/login/"
                              className="header-utility-panel-link header-utility-panel-link-primary"
                              tracking={{ ctaName: "client_login_header", linkLocation: "header_panel" }}
                              onClick={() => setPortalMenuOpen(false)}
                            >
                              Log in
                            </TrackedLink>
                            <TrackedLink
                              href="/portal/sign-up/"
                              className="header-utility-panel-link"
                              tracking={{ ctaName: "client_signup_header", linkLocation: "header_panel" }}
                              onClick={() => setPortalMenuOpen(false)}
                            >
                              Sign up
                            </TrackedLink>
                          </>
                        )}
                      </div>
                    </div>
                  ) : null}
                </div>
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
                {isSignedIn ? (
                  <>
                    <TrackedLink
                      href={primaryPortalHref}
                      className="button button-secondary"
                      tracking={{ ctaName: isAdmin ? "admin_header" : "portal_header", linkLocation: "mobile_menu" }}
                      onClick={close}
                    >
                      <span>{isAdmin ? "Admin dashboard" : accountDisplayName}</span>
                    </TrackedLink>
                    {!isAdmin ? (
                      <TrackedLink
                        href="/portal/messages/"
                        className="button button-secondary"
                        tracking={{ ctaName: "messages_header", linkLocation: "mobile_menu" }}
                        onClick={close}
                      >
                        <FaBell className="header-utility-icon" aria-hidden="true" />
                        <span>Messages</span>
                      </TrackedLink>
                    ) : (
                      <TrackedLink
                        href="/blog/"
                        className="button button-secondary"
                        tracking={{ ctaName: "resources_header_panel", linkLocation: "mobile_menu" }}
                        onClick={close}
                      >
                        <span>Resources</span>
                      </TrackedLink>
                    )}
                  </>
                ) : (
                  <>
                    <TrackedLink
                      href="/portal/login/"
                      className="button button-secondary"
                      tracking={{ ctaName: "client_login_header", linkLocation: "mobile_menu" }}
                      onClick={close}
                    >
                      <span>Log in</span>
                    </TrackedLink>
                    <TrackedLink
                      href="/portal/sign-up/"
                      className="button button-secondary"
                      tracking={{ ctaName: "client_signup_header", linkLocation: "mobile_menu" }}
                      onClick={close}
                    >
                      <span>Sign up</span>
                    </TrackedLink>
                  </>
                )}
              </div>
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
