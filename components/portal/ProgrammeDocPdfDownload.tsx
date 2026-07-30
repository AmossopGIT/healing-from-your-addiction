"use client";

import { pdf } from "@react-pdf/renderer";
import { useState } from "react";
import { ProgrammeDocPdfDocument } from "@/lib/programme/ProgrammeDocPdfDocument";

type ProgrammeDocPdfDownloadProps = {
  title: string;
  summary?: string | null;
  bodyMarkdown: string;
  addictionLabel: string;
};

export function ProgrammeDocPdfDownload({
  title,
  summary,
  bodyMarkdown,
  addictionLabel,
}: ProgrammeDocPdfDownloadProps) {
  const [busy, setBusy] = useState(false);

  async function handleDownload() {
    setBusy(true);
    try {
      const blob = await pdf(
        <ProgrammeDocPdfDocument
          title={title}
          summary={summary}
          bodyMarkdown={bodyMarkdown}
          addictionLabel={addictionLabel}
        />,
      ).toBlob();
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.pdf`;
      anchor.click();
      URL.revokeObjectURL(url);
    } finally {
      setBusy(false);
    }
  }

  return (
    <button type="button" className="button button-secondary button-small" onClick={handleDownload} disabled={busy}>
      {busy ? "Preparing PDF…" : "Download PDF"}
    </button>
  );
}
