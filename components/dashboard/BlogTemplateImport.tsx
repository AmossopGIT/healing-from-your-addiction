"use client";

import { useRef, useState } from "react";
import { parseBlogTemplateDocument, type BlogTemplateImportData } from "@/lib/cms/templateImport";

export type BlogTemplateImportMode = "soft" | "hard";

type BlogTemplateImportProps = {
  onImport: (data: BlogTemplateImportData, mode: BlogTemplateImportMode) => void;
  hasExistingContent?: boolean;
};

export function BlogTemplateImport({ onImport, hasExistingContent = false }: BlogTemplateImportProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [paste, setPaste] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [pendingHard, setPendingHard] = useState<BlogTemplateImportData | null>(null);

  const applyParsed = (source: string, mode: BlogTemplateImportMode) => {
    const { data, error: parseError } = parseBlogTemplateDocument(source);
    if (parseError || !data) {
      setError(parseError ?? "Unknown format.");
      setStatus(null);
      setPendingHard(null);
      return;
    }

    if (mode === "hard" && hasExistingContent) {
      setError(null);
      setStatus(null);
      setPendingHard(data);
      return;
    }

    setError(null);
    setPendingHard(null);
    setStatus(
      mode === "hard"
        ? "Hard import applied — all fields overwritten. Review the preview, then save."
        : "Soft import applied — empty fields filled from the template. Review, then save draft.",
    );
    onImport(data, mode);
    setPaste("");
  };

  const handleFile = async (file: File | null, mode: BlogTemplateImportMode) => {
    if (!file) return;
    const text = await file.text();
    applyParsed(text, mode);
  };

  const confirmHardImport = () => {
    if (!pendingHard) return;
    setStatus("Hard import applied — all fields overwritten. Review the preview, then save.");
    onImport(pendingHard, "hard");
    setPendingHard(null);
    setPaste("");
  };

  return (
    <div className="cms-template-import">
      <div className="cms-template-import-header">
        <div>
          <p className="cms-template-import-title">Import blog copy</p>
          <p className="cms-field-help">
            Soft import fills empty fields only. Hard import replaces title, excerpt, SEO, tags, and body sections.
            Nothing is saved until you click Save draft.
          </p>
        </div>
        <a className="button button-secondary" href="/templates/blog-post-template.md" download="blog-post-template.md">
          Download template
        </a>
      </div>

      <div className="cms-template-import-panel">
        <label className="form-field">
          <span>Paste from Google Doc / Word export (include TITLE:, META DESCRIPTION:, --- BODY ---, etc.)</span>
          <textarea
            className="cms-json-editor"
            rows={6}
            placeholder="Paste full template including TITLE:, META DESCRIPTION:, --- BODY ---, etc."
            value={paste}
            onChange={(event) => setPaste(event.target.value)}
          />
        </label>

        <div className="cms-form-actions">
          <button
            type="button"
            className="button button-secondary"
            disabled={!paste.trim()}
            onClick={() => applyParsed(paste, "soft")}
          >
            Soft import (fill empty)
          </button>
          <button
            type="button"
            className="button button-primary"
            disabled={!paste.trim()}
            onClick={() => applyParsed(paste, "hard")}
          >
            Hard import (overwrite all)
          </button>
          <button type="button" className="button button-secondary" onClick={() => fileRef.current?.click()}>
            Upload .txt / .md
          </button>
          <input
            ref={fileRef}
            type="file"
            accept=".txt,.md,text/plain,text/markdown"
            className="sr-only"
            onChange={(event) => {
              const file = event.target.files?.[0] ?? null;
              // File upload defaults to hard import so staff get a full replace from a document export.
              void handleFile(file, "hard");
              event.target.value = "";
            }}
          />
        </div>
        <p className="cms-field-help">Upload always runs as a hard import (full replace). Confirm if the form already has content.</p>
      </div>

      {pendingHard ? (
        <div className="cms-import-confirm" role="alertdialog" aria-labelledby="cms-hard-import-title">
          <p id="cms-hard-import-title">
            <strong>Hard import will overwrite</strong> title, excerpt, SEO fields, tags, and body sections on this form.
          </p>
          <div className="cms-form-actions">
            <button type="button" className="button button-primary" onClick={confirmHardImport}>
              Yes, overwrite form
            </button>
            <button type="button" className="button button-secondary" onClick={() => setPendingHard(null)}>
              Cancel
            </button>
          </div>
        </div>
      ) : null}

      {error ? <p className="form-error">{error}</p> : null}
      {status ? <p className="cms-inline-status">{status}</p> : null}
    </div>
  );
}
