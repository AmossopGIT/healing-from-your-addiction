"use client";

import { useRef, useState } from "react";
import { parseBlogTemplateDocument, type BlogTemplateImportData } from "@/lib/cms/templateImport";

type BlogTemplateImportProps = {
  onImport: (data: BlogTemplateImportData) => void;
};

export function BlogTemplateImport({ onImport }: BlogTemplateImportProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [paste, setPaste] = useState("");
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);

  const applyParsed = (source: string) => {
    const { data, error: parseError } = parseBlogTemplateDocument(source);
    if (parseError || !data) {
      setError(parseError ?? "Unknown format.");
      setStatus(null);
      return;
    }
    setError(null);
    setStatus("Template loaded. Review SEO checklist, add hero image, then save draft.");
    onImport(data);
    setPaste("");
    setOpen(false);
  };

  const handleFile = async (file: File | null) => {
    if (!file) return;
    const text = await file.text();
    applyParsed(text);
  };

  return (
    <div className="cms-template-import">
      <div className="cms-template-import-header">
        <div>
          <p className="cms-template-import-title">Import from template</p>
          <p className="cms-field-help">
            Export your Google Doc or Word file as .txt or .md, or paste labeled copy — title, SEO, and body map
            automatically.
          </p>
        </div>
        <button type="button" className="button button-secondary" onClick={() => setOpen((value) => !value)}>
          {open ? "Hide import" : "Show import"}
        </button>
      </div>

      <div className="cms-template-import-actions">
        <a className="button button-secondary" href="/templates/blog-post-template.md" download="blog-post-template.md">
          Download template
        </a>
      </div>

      {open ? (
        <div className="cms-template-import-panel">
          <div className="cms-form-actions">
            <button type="button" className="button button-secondary" onClick={() => fileRef.current?.click()}>
              Upload .txt / .md
            </button>
            <button type="button" className="button button-secondary" disabled={!paste.trim()} onClick={() => applyParsed(paste)}>
              Load pasted copy
            </button>
            <input
              ref={fileRef}
              type="file"
              accept=".txt,.md,text/plain,text/markdown"
              className="sr-only"
              onChange={(event) => {
                void handleFile(event.target.files?.[0] ?? null);
                event.target.value = "";
              }}
            />
          </div>
          <label className="form-field">
            <span>Paste from your document (include TITLE:, META DESCRIPTION:, --- BODY ---, etc.)</span>
            <textarea
              className="cms-json-editor"
              rows={6}
              placeholder="Paste full template including TITLE:, META DESCRIPTION:, --- BODY ---, etc."
              value={paste}
              onChange={(event) => setPaste(event.target.value)}
            />
          </label>
        </div>
      ) : null}

      {error ? <p className="form-error">{error}</p> : null}
      {status ? <p className="cms-inline-status">{status}</p> : null}
    </div>
  );
}
