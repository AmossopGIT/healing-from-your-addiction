"use client";

import { pdf } from "@react-pdf/renderer";
import { useState } from "react";
import { AnalyticsReportDocument } from "@/lib/analytics/pdf/AnalyticsReportDocument";
import type { AnalyticsBundle } from "@/lib/analytics/types";

function buildFilename(bundle: AnalyticsBundle) {
  const rangePart = bundle.range === null ? "all-time" : `${bundle.range}d`;
  const datePart = new Date(bundle.generatedAt).toISOString().slice(0, 10);
  return `hfya-analytics-${rangePart}-${datePart}.pdf`;
}

export function AnalyticsPdfExport({ bundle, disabled }: { bundle: AnalyticsBundle; disabled?: boolean }) {
  const [exporting, setExporting] = useState(false);

  async function handleExport() {
    setExporting(true);
    try {
      const blob = await pdf(<AnalyticsReportDocument bundle={bundle} />).toBlob();
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = buildFilename(bundle);
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
      {exporting ? "Preparing PDF…" : "Export PDF"}
    </button>
  );
}
