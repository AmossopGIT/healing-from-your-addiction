import { withBasePath } from "@/lib/basePath";
import { siteConfig } from "@/lib/constants";

type LeadPayload = Record<string, unknown>;

export function getLeadSubmitUrl() {
  const customEndpoint = process.env.NEXT_PUBLIC_LEAD_ENDPOINT?.trim();
  if (customEndpoint) {
    return customEndpoint;
  }

  if (process.env.NEXT_PUBLIC_STATIC_EXPORT === "true") {
    return "";
  }

  return withBasePath("/api/leads/");
}

export async function submitLead(payload: LeadPayload): Promise<"api" | "mailto"> {
  const endpoint = getLeadSubmitUrl();

  if (!endpoint) {
    submitLeadByEmail(payload);
    return "mailto";
  }

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error("Lead submission failed");
  }

  return "api";
}

function submitLeadByEmail(payload: LeadPayload) {
  const subject = "Confidential addiction support enquiry";
  const body = [
    `Name: ${payload.fullName ?? ""}`,
    `Email: ${payload.email ?? ""}`,
    `Phone: ${payload.phone ?? ""}`,
    `Concern: ${payload.addictionConcern ?? ""}`,
    `Preferred contact: ${payload.preferredContactMethod ?? ""}`,
    `Message: ${payload.message ?? ""}`,
    `Source page: ${payload.sourcePage ?? ""}`,
  ].join("\n");

  const mailto = `mailto:${siteConfig.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  window.location.href = mailto;
}
