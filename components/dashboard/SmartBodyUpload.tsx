"use client";

import { useRef, useState } from "react";
import type { BlogSection } from "@/content/blog";
import { parseSmartBodyImport, type SmartBodyImportResult } from "@/lib/cms/smartBodyImport";

type SmartBodyUploadProps = {
  onImport: (sections: BlogSection[]) => void;
  hasExistingBody?: boolean;
};

export function SmartBodyUpload({ onImport, hasExistingBody = false }: SmartBodyUploadProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [paste, setPaste] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [pending, setPending] = useState<SmartBodyImportResult | null>(null);

  const commitResult = (result: SmartBodyImportResult) => {
    const kindLabel =
      result.source === "template-body"
        ? `Filled ${result.sections.length} body section${result.sections.length === 1 ? "" : "s"} from the template BODY block.`
        : `Filled ${result.sections.length} body section${result.sections.length === 1 ? "" : "s"} from the paste.`;

    setError(null);
    setPending(null);
    setStatus(`${kindLabel} Essentials stay as you set them. Fine-tune below, then Save draft.`);
    onImport(result.sections);
    setPaste("");
  };

  const applySource = (source: string, force = false) => {
    const { result, error: parseError } = parseSmartBodyImport(source);
    if (parseError || !result) {
      setError(parseError ?? "Could not parse that paste.");
      setStatus(null);
      setPending(null);
      return;
    }

    if (!force && hasExistingBody) {
      setError(null);
      setStatus(null);
      setPending(result);
      return;
    }

    commitResult(result);
  };

  const handleFile = async (file: File | null) => {
    if (!file) return;
    const text = await file.text();
    setPaste(text);
    applySource(text);
  };

  return (
    <div className="cms-smart-upload cms-smart-body-upload">
      <div className="cms-smart-upload-header">
        <div>
          <p className="cms-smart-upload-title">Smart Body Upload</p>
          <p className="cms-field-help">
            Skipped the top Smart Upload? Paste the article body here (## headings, paragraphs, bullets). Only body
            sections are replaced — title, excerpt, category, and tags stay as you set them.
          </p>
        </div>
      </div>

      <label className="form-field">
        <span>Paste article body</span>
        <textarea
          className="cms-smart-upload-textarea cms-smart-body-upload-textarea"
          rows={8}
          placeholder={`## Introduction\n\nOpening paragraph…\n\n## Next section\n\nMore copy…\n\n- Bullet one\n- Bullet two\n\n— or paste only the --- BODY --- … --- END BODY --- block from a writer template —`}
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
          Fill body from paste
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

      {pending ? (
        <div className="cms-import-confirm" role="alertdialog" aria-labelledby="cms-smart-body-confirm-title">
          <p id="cms-smart-body-confirm-title">
            <strong>Replace current body sections?</strong> Essentials stay the same. This overwrites headings,
            paragraphs, bullets, and H3s with the paste.
          </p>
          <div className="cms-form-actions">
            <button type="button" className="button button-primary" onClick={() => commitResult(pending)}>
              Replace body
            </button>
            <button
              type="button"
              className="button button-secondary"
              onClick={() => {
                setPending(null);
                setStatus(null);
              }}
            >
              Keep current body
            </button>
          </div>
        </div>
      ) : null}

      {error ? <p className="form-error">{error}</p> : null}
      {status ? <p className="cms-inline-status">{status}</p> : null}
    </div>
  );
}
