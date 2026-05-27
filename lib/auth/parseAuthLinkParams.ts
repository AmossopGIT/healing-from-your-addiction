export type AuthLinkParams = {
  code: string | null;
  tokenHash: string | null;
  otpType: string | null;
  hasHashAccessToken: boolean;
  hashType: string | null;
};

export function parseAuthLinkParams(searchParams: URLSearchParams): AuthLinkParams {
  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const otpType = searchParams.get("type");

  if (typeof window === "undefined" || !window.location.hash) {
    return { code, tokenHash, otpType, hasHashAccessToken: false, hashType: null };
  }

  const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ""));
  return {
    code,
    tokenHash: tokenHash ?? hashParams.get("token_hash"),
    otpType: otpType ?? hashParams.get("type"),
    hasHashAccessToken: Boolean(hashParams.get("access_token")),
    hashType: hashParams.get("type"),
  };
}
