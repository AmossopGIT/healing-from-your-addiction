import { createCipheriv, createDecipheriv, createHash, randomBytes } from "crypto";
import { READINESS_DRAFT_TTL_HOURS, type ReadinessResponses } from "@/content/readinessAssessment";

function getDraftSecret() {
  const secret =
    process.env.READINESS_DRAFT_SECRET?.trim() ||
    process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
  if (!secret) {
    throw new Error("Missing READINESS_DRAFT_SECRET for draft encryption.");
  }
  return createHash("sha256").update(secret).digest();
}

export function createDraftToken() {
  return randomBytes(32).toString("base64url");
}

export function hashDraftToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export function encryptDraftResponses(responses: ReadinessResponses) {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", getDraftSecret(), iv);
  const plaintext = Buffer.from(JSON.stringify(responses), "utf8");
  const encrypted = Buffer.concat([cipher.update(plaintext), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return {
    ciphertext: encrypted.toString("base64"),
    iv: iv.toString("base64"),
    authTag: authTag.toString("base64"),
  };
}

export function decryptDraftResponses(input: { ciphertext: string; iv: string; authTag: string }): ReadinessResponses {
  const decipher = createDecipheriv("aes-256-gcm", getDraftSecret(), Buffer.from(input.iv, "base64"));
  decipher.setAuthTag(Buffer.from(input.authTag, "base64"));
  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(input.ciphertext, "base64")),
    decipher.final(),
  ]);
  const parsed = JSON.parse(decrypted.toString("utf8")) as ReadinessResponses;
  return parsed;
}

export function draftExpiresAt(from = new Date()) {
  return new Date(from.getTime() + READINESS_DRAFT_TTL_HOURS * 60 * 60 * 1000).toISOString();
}
