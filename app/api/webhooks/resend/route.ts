import { NextResponse } from "next/server";
import { applyResendConsultationWebhook } from "@/lib/email/resendConsultationWebhook";
import { createHmac, timingSafeEqual } from "crypto";

export const runtime = "nodejs";

function verifyResendSignature(rawBody: string, signatureHeader: string | null, secret: string) {
  if (!signatureHeader) return false;

  // Resend sends: "t=timestamp,v1=signature" or sometimes bare hex.
  const parts = Object.fromEntries(
    signatureHeader.split(",").map((part) => {
      const [key, ...rest] = part.trim().split("=");
      return [key, rest.join("=")];
    }),
  ) as Record<string, string>;

  const timestamp = parts.t;
  const signature = parts.v1 || signatureHeader.trim();
  if (!signature) return false;

  const signedPayload = timestamp ? `${timestamp}.${rawBody}` : rawBody;
  const expected = createHmac("sha256", secret).update(signedPayload).digest("hex");

  try {
    const a = Buffer.from(expected, "hex");
    const b = Buffer.from(signature, "hex");
    if (a.length !== b.length) return false;
    return timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

export async function POST(request: Request) {
  const rawBody = await request.text();
  const secret = process.env.RESEND_WEBHOOK_SECRET?.trim();

  if (secret) {
    const signature = request.headers.get("resend-signature") || request.headers.get("svix-signature");
    // Prefer Svix-style verification if Resend uses Svix headers.
    const svixId = request.headers.get("svix-id");
    const svixTimestamp = request.headers.get("svix-timestamp");
    const svixSignature = request.headers.get("svix-signature");

    if (svixId && svixTimestamp && svixSignature) {
      const signedPayload = `${svixId}.${svixTimestamp}.${rawBody}`;
      const expected = createHmac("sha256", secret.startsWith("whsec_") ? Buffer.from(secret.slice(6), "base64") : Buffer.from(secret)).update(signedPayload).digest("base64");
      const candidates = svixSignature.split(" ").map((part) => part.replace(/^v1,/, "").trim());
      const matched = candidates.some((candidate) => {
        try {
          const a = Buffer.from(expected);
          const b = Buffer.from(candidate);
          return a.length === b.length && timingSafeEqual(a, b);
        } catch {
          return false;
        }
      });
      if (!matched) {
        return NextResponse.json({ error: "invalid-signature" }, { status: 401 });
      }
    } else if (!verifyResendSignature(rawBody, signature, secret)) {
      return NextResponse.json({ error: "invalid-signature" }, { status: 401 });
    }
  }

  let payload: unknown;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "invalid-json" }, { status: 400 });
  }

  const result = await applyResendConsultationWebhook(payload as { type?: string; data?: { email_id?: string; created_at?: string } });
  return NextResponse.json(result);
}
