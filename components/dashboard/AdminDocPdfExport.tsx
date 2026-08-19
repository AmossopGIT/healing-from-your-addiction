"use client";

import { pdf } from "@react-pdf/renderer";
import { useState } from "react";
import { AdminDocMarkdownPdfDocument } from "@/lib/adminDocs/pdf/AdminDocMarkdownPdfDocument";
import { AdminLoginGuidePdfDocument } from "@/lib/adminDocs/pdf/AdminLoginGuidePdfDocument";
import { LeadOnboardingGuidePdfDocument } from "@/lib/adminDocs/pdf/LeadOnboardingGuidePdfDocument";
import { LeadTriagePlaybookPdfDocument } from "@/lib/adminDocs/pdf/LeadTriagePlaybookPdfDocument";
import { ProgrammeStartGuidePdfDocument } from "@/lib/adminDocs/pdf/ProgrammeStartGuidePdfDocument";
import type { AdminDocPdfPayload } from "@/lib/adminDocs/pdf/types";

function buildFilename(payload: AdminDocPdfPayload) {
  const datePart = new Date().toISOString().slice(0, 10);
  return `hfya-admin-doc-${payload.slug}-${datePart}.pdf`;
}

function resolvePdfDocument(payload: AdminDocPdfPayload) {
  if (payload.kind === "admin-login-guide") {
    return <AdminLoginGuidePdfDocument />;
  }
  if (payload.kind === "lead-onboarding-guide") {
    return <LeadOnboardingGuidePdfDocument />;
  }
  if (payload.kind === "lead-triage-playbook") {
    return <LeadTriagePlaybookPdfDocument />;
  }
  if (payload.kind === "programme-start-guide") {
    return <ProgrammeStartGuidePdfDocument />;
  }
  return <AdminDocMarkdownPdfDocument payload={payload} />;
}

export function AdminDocPdfExport({ payload, disabled }: { payload: AdminDocPdfPayload; disabled?: boolean }) {
  const [exporting, setExporting] = useState(false);

  async function handleExport() {
    setExporting(true);
    try {
      const pdfDocument = resolvePdfDocument(payload);
      const blob = await pdf(pdfDocument).toBlob();
      const url = URL.createObjectURL(blob);
      const anchor = window.document.createElement("a");
      anchor.href = url;
      anchor.download = buildFilename(payload);
      anchor.click();
      URL.revokeObjectURL(url);
    } finally {
      setExporting(false);
    }
  }

  return (
    <button
      type="button"
      className="button button-secondary dashboard-export-button"
      onClick={() => void handleExport()}
      disabled={disabled || exporting}
    >
      {exporting ? "Preparing PDF…" : "Download PDF"}
    </button>
  );
}
