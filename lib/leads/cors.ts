const DEFAULT_ALLOWED_HEADERS = "Content-Type";

export type LeadApiCorsHeaders = Record<string, string>;

function parseAllowedOrigins() {
  const configured = process.env.LEAD_API_ALLOWED_ORIGINS?.trim();
  if (configured) {
    return configured
      .split(",")
      .map((origin) => origin.trim())
      .filter(Boolean);
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (siteUrl) {
    return [siteUrl.replace(/\/$/, "")];
  }

  return [];
}

export function getLeadApiCorsHeaders(requestOrigin: string | null): LeadApiCorsHeaders {
  const baseHeaders: LeadApiCorsHeaders = {
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": DEFAULT_ALLOWED_HEADERS,
  };

  const allowedOrigins = parseAllowedOrigins();
  if (!requestOrigin || allowedOrigins.length === 0) {
    return baseHeaders;
  }

  const normalizedOrigin = requestOrigin.replace(/\/$/, "");
  const isAllowed = allowedOrigins.some((allowed) => allowed.replace(/\/$/, "") === normalizedOrigin);

  if (!isAllowed) {
    return baseHeaders;
  }

  return {
    ...baseHeaders,
    "Access-Control-Allow-Origin": requestOrigin,
    Vary: "Origin",
  };
}
