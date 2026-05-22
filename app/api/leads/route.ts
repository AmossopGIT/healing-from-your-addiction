import { getLeadApiCorsHeaders } from "@/lib/leads/cors";
import { handleLeadSubmission } from "@/lib/leads/handleLeadSubmission";
import type { LeadPayload } from "@/lib/leads/types";

export const runtime = "nodejs";

function jsonResponse(body: Record<string, unknown>, status: number, request: Request) {
  const origin = request.headers.get("origin");
  return Response.json(body, {
    status,
    headers: getLeadApiCorsHeaders(origin),
  });
}

export async function OPTIONS(request: Request) {
  return new Response(null, {
    status: 204,
    headers: getLeadApiCorsHeaders(request.headers.get("origin")),
  });
}

export async function POST(request: Request) {
  let payload: LeadPayload;

  try {
    payload = (await request.json()) as LeadPayload;
  } catch {
    return jsonResponse({ ok: false, error: "Invalid JSON body." }, 400, request);
  }

  const result = await handleLeadSubmission(payload);
  return jsonResponse(result.body, result.status, request);
}
