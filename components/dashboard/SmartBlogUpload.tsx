"use client";

import { useRef, useState } from "react";
import { parseSmartBlogImport, type SmartBlogImportResult } from "@/lib/cms/smartBlogImport";
import {
  getUnsupportedImportError,
  readFileMagicPrefix,
} from "@/lib/cms/unsupportedImportSource";

type SmartBlogUploadProps = {
  onImport: (result: SmartBlogImportResult) => void;
  hasExistingContent?: boolean;
};

export function SmartBlogUpload({ onImport, hasExistingContent = false }: SmartBlogUploadProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [paste, setPaste] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [pending, setPending] = useState<SmartBlogImportResult | null>(null);

  const applySource = (source: string, force = false) => {
    const { result, error: parseError } = parseSmartBlogImport(source);
    if (parseError || !result) {
      setError(parseError ?? "Could not parse that paste.");
      setStatus(null);
      setPending(null);
      return;
    }

    if (!force && hasExistingContent) {
      setError(null);
      setStatus(null);
      setPending(result);
      return;
    }

    const kindLabel =
      result.kind === "template"
        ? "Detected full template — filled title, SEO, tags, and body sections."
        : "Detected article body — filled title, SEO suggestions, excerpt, and body sections.";

    setError(null);
    setPending(null);
    setStatus(`${kindLabel} Next: pick tags and hero art, then Save draft.`);
    onImport(result);
    setPaste("");
  };

  const handleFile = async (file: File | null) => {
    if (!file) return;

    const magic = await readFileMagicPrefix(file);
    const unsupported = getUnsupportedImportError({
      filename: file.name,
      mimeType: file.type,
      textPrefix: magic,
    });
    if (unsupported) {
      setError(unsupported);
      setStatus(null);
      setPending(null);
      return;
    }

    const text = await file.text();
    setPaste(text);
    applySource(text);
  };

  return (
    <div className="cms-smart-upload">
      <div className="cms-smart-upload-header">
        <div>
          <p className="cms-smart-upload-title">Smart Upload</p>
          <p className="cms-field-help">
            Paste a ChatGPT / Docs article, or a labeled writer template. We detect the format and fill the form, including
            safe SEO suggestions for plain articles.
            Nothing is saved until you click Save draft.
          </p>
        </div>
        <a className="button button-secondary" href="/templates/blog-post-template.md" download="blog-post-template.md">
          Download writer template
        </a>
      </div>

      <label className="form-field">
        <span>Paste full blog (article or template)</span>
        <textarea
          className="cms-smart-upload-textarea"
          rows={10}
          placeholder={`# Your article title\n\nOpening paragraph…\n\n## First section\n\nBody copy…\n\n— or paste a labeled TITLE: / --- BODY --- template —`}
          value={paste}
          onChange={(event) => {
            setPaste(event.target.value);
            setPending(null);
            setError(null);
          }}
        />
      </label>

      <div className="cms-form-actions">
        <button
          type="button"
          className="button button-primary"
          disabled={!paste.trim()}
          onClick={() => applySource(paste)}
        >
          Fill form from paste
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
            void handleFile(event.target.files?.[0] ?? null);
            event.target.value = "";
          }}
        />
      </div>
      <p className="cms-field-help">
        PDF and Word files are not supported. Paste the article text, or export as <code>.txt</code> / <code>.md</code>{" "}
        first.
      </p>

      {pending ? (
        <div className="cms-import-confirm" role="alertdialog" aria-labelledby="cms-smart-upload-confirm-title">
          <p id="cms-smart-upload-confirm-title">
            <strong>Replace current form content?</strong> This overwrites title, excerpt, SEO fields, tags, and body
            sections with the paste.
          </p>
          <div className="cms-form-actions">
            <button
              type="button"
              className="button button-primary"
              onClick={() => {
                if (!pending) return;
                const kindLabel =
                  pending.kind === "template"
                    ? "Detected full template — filled title, SEO, tags, and body sections."
                    : "Detected article body — filled title, SEO suggestions, excerpt, and body sections.";
                setError(null);
                setStatus(`${kindLabel} Next: pick tags and hero art, then Save draft.`);
                onImport(pending);
                setPending(null);
                setPaste("");
              }}
            >
              Yes, fill form
            </button>
            <button type="button" className="button button-secondary" onClick={() => setPending(null)}>
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
