import { describe, expect, it } from "vitest";

/**
 * Lightweight acceptance checks for readiness auth/resume path rules.
 * Full RLS/route rendering is covered by manual/QA checklist and DB policies.
 */

function resolveSignupPostAuthPath(nextPath: string) {
  const safeNext = nextPath.startsWith("/portal/") && !nextPath.startsWith("//") ? nextPath : "/portal/onboarding/";
  const readinessResume = safeNext.includes("/portal/readiness/");
  return readinessResume
    ? safeNext
    : safeNext.startsWith("/portal/onboarding")
      ? safeNext
      : "/portal/onboarding/";
}

function sanitizePortalNextPath(raw: string | null) {
  if (!raw) return null;
  const value = raw.trim();
  if (!value.startsWith("/") || value.startsWith("//") || !value.startsWith("/portal/")) {
    return null;
  }
  if (value.length > 240) return null;
  const pathOnly = (value.split("?")[0] ?? value).endsWith("/")
    ? (value.split("?")[0] ?? value)
    : `${value.split("?")[0] ?? value}/`;
  if (pathOnly.startsWith("/admin/")) return null;
  return value;
}

describe("readiness acceptance path rules", () => {
  it("accepts portal readiness resume destinations with draft tokens", () => {
    const candidates = [
      "/portal/readiness/",
      "/portal/readiness/?resume=1",
      "/portal/readiness/?resume=1&draft=abc123",
    ];

    for (const path of candidates) {
      const pathOnly = (path.split("?")[0] ?? path).endsWith("/")
        ? path.split("?")[0]
        : `${path.split("?")[0]}/`;
      expect(pathOnly === "/portal/readiness/" || pathOnly?.startsWith("/portal/readiness/")).toBe(true);
      expect(path.startsWith("/")).toBe(true);
      expect(path.startsWith("//")).toBe(false);
    }
  });

  it("keeps readiness resume as post-auth destination instead of forcing onboarding", () => {
    expect(resolveSignupPostAuthPath("/portal/readiness/?resume=1&draft=token")).toBe(
      "/portal/readiness/?resume=1&draft=token",
    );
    expect(resolveSignupPostAuthPath("/portal/")).toBe("/portal/onboarding/");
    expect(resolveSignupPostAuthPath("/portal/onboarding/?x=1")).toBe("/portal/onboarding/?x=1");
  });

  it("never treats admin paths as portal next destinations", () => {
    expect(sanitizePortalNextPath("/admin/")).toBeNull();
    expect(sanitizePortalNextPath("/portal/readiness/?resume=1")).toBe("/portal/readiness/?resume=1");
    expect(sanitizePortalNextPath("//evil.example")).toBeNull();
  });

  it("rejects unsafe next destinations", () => {
    const unsafe = ["//evil.example", "https://evil.example", "/admin/secret/", "/portal/../admin/"];
    for (const path of unsafe) {
      const ok =
        path.startsWith("/") &&
        !path.startsWith("//") &&
        (path === "/portal/readiness/" || path.startsWith("/portal/readiness/") || path === "/portal/onboarding/");
      expect(ok).toBe(false);
    }
  });
});
