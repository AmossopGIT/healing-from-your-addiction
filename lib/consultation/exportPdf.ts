import { CONSULTATION_STEPS } from "@/lib/consultation/schema";
import { siteConfig } from "@/lib/constants";
import type { ClientConsultation } from "@/types/database";

function formatValue(value: unknown): string {
  if (value == null) return "—";
  if (Array.isArray(value)) return value.length ? value.join(", ") : "—";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  const text = String(value).trim();
  return text || "—";
}

/** Lightweight text PDF without extra deps — printable export of online answers. */
export function buildConsultationAnswersPdf(consultation: ClientConsultation, clientName: string) {
  const lines: string[] = [
    siteConfig.name,
    "Hypnotherapy Client Consultation Form — Submitted Answers",
    `Client: ${clientName}`,
    `Status: ${consultation.status}`,
    `Completed: ${consultation.completed_at ?? "In progress"}`,
    `Mode: ${consultation.completion_mode ?? "—"}`,
    "",
  ];

  for (const step of CONSULTATION_STEPS) {
    lines.push(step.title.toUpperCase());
    lines.push("-".repeat(step.title.length));
    for (const field of step.fields) {
      lines.push(`${field.label}: ${formatValue(consultation.responses[field.key])}`);
      if (field.otherKey) {
        const other = consultation.responses[field.otherKey];
        if (other != null && String(other).trim()) {
          lines.push(`  Other: ${formatValue(other)}`);
        }
      }
    }
    lines.push("");
  }

  if (consultation.signature_name) {
    lines.push(`Signature: ${consultation.signature_name}`);
    lines.push(`Signed at: ${consultation.signed_at ?? "—"}`);
  }

  if (consultation.practitioner_notes) {
    lines.push("");
    lines.push("PRACTITIONER NOTES");
    lines.push(consultation.practitioner_notes);
  }

  const content = lines.join("\n");
  const escaped = content
    .replaceAll("\\", "\\\\")
    .replaceAll("(", "\\(")
    .replaceAll(")", "\\)")
    .replaceAll("\r", "");

  // Split into chunks that fit typical PDF text operators; keep simple single stream.
  const textObjects = escaped
    .split("\n")
    .map((line, index) => {
      const y = 800 - index * 14;
      if (y < 40) return null;
      return `BT /F1 10 Tf 40 ${y} Td (${line.slice(0, 110)}) Tj ET`;
    })
    .filter(Boolean)
    .join("\n");

  const stream = textObjects;
  const objects = [
    "1 0 obj<< /Type /Catalog /Pages 2 0 R >>endobj",
    "2 0 obj<< /Type /Pages /Kids [3 0 R] /Count 1 >>endobj",
    "3 0 obj<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 842] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>endobj",
    `4 0 obj<< /Length ${Buffer.byteLength(stream, "utf8")} >>stream\n${stream}\nendstream\nendobj`,
    "5 0 obj<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>endobj",
  ];

  let pdf = "%PDF-1.4\n";
  const offsets: number[] = [0];
  for (const object of objects) {
    offsets.push(Buffer.byteLength(pdf, "utf8"));
    pdf += `${object}\n`;
  }
  const xrefOffset = Buffer.byteLength(pdf, "utf8");
  pdf += `xref\n0 ${objects.length + 1}\n`;
  pdf += "0000000000 65535 f \n";
  for (let i = 1; i < offsets.length; i += 1) {
    pdf += `${String(offsets[i]).padStart(10, "0")} 00000 n \n`;
  }
  pdf += `trailer<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;

  return Buffer.from(pdf, "utf8");
}
