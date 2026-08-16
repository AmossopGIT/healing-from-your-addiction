"use client";

import { useActionState, useRef, useState } from "react";
import {
  importProgrammeJsonDraft,
  type ProgrammeDraftActionState,
} from "@/lib/dashboard/interactiveProgrammeActions";
import {
  getUnsupportedImportError,
  readFileMagicPrefix,
} from "@/lib/cms/unsupportedImportSource";
import { parseProgrammeImportJson } from "@/lib/programme/interactive/adminDraft";

export function AdminProgrammeJsonImport() {
  const fileRef = useRef<HTMLInputElement>(null);
  const [paste, setPaste] = useState("");
  const [filename, setFilename] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);
  const [localWarnings, setLocalWarnings] = useState<string[]>([]);
  const [previewSlug, setPreviewSlug] = useState<string | null>(null);
  const [actionState, formAction] = useActionState<ProgrammeDraftActionState, FormData>(
    importProgrammeJsonDraft,
    {},
  );

  const formErrors = actionState.errors?.length
    ? actionState.errors
    : actionState.error
      ? [actionState.error]
      : localError
        ? [localError]
        : [];

  function validateLocal(source: string, name = "") {
    const unsupported = getUnsupportedImportError({
      filename: name,
      textPrefix: source.slice(0, 16),
    });
    if (unsupported) {
      setLocalError(
        "This file is a PDF or Word document. Programme import only accepts .json (or pasted JSON text).",
      );
      setLocalWarnings([]);
      setPreviewSlug(null);
      return false;
    }
    const parsed = parseProgrammeImportJson(source, { filename: name });
    if (!parsed.ok) {
      setLocalError(parsed.errors[0] ?? "Invalid programme JSON.");
      setLocalWarnings([]);
      setPreviewSlug(null);
      return false;
    }
    setLocalError(null);
    setLocalWarnings(parsed.warnings);
    setPreviewSlug(parsed.programme.slug);
    return true;
  }

  async function handleFile(file: File | null) {
    if (!file) return;
    const magic = await readFileMagicPrefix(file);
    const unsupported = getUnsupportedImportError({
      filename: file.name,
      mimeType: file.type,
      textPrefix: magic,
    });
    if (unsupported) {
      setLocalError(
        "This file is a PDF or Word document. Programme import only accepts .json (or pasted JSON text).",
      );
      setFilename("");
      setPaste("");
      setPreviewSlug(null);
      return;
    }
    if (!file.name.toLowerCase().endsWith(".json") && file.type !== "application/json" && file.type !== "text/plain") {
      setLocalError("Upload a .json file, or paste JSON text.");
      return;
    }
    const text = await file.text();
    setFilename(file.name);
    setPaste(text);
    validateLocal(text, file.name);
  }

  return (
    <section className="dashboard-panel">
      <h2>Import programme JSON</h2>
      <p className="dashboard-inline-note">
        Paste or upload a full programme definition. Import always creates or updates an <strong>unpublished draft</strong>{" "}
        and sets review to pending. Live enrolled clients are not changed. PDF and Word are rejected.
      </p>

      <form
        action={formAction}
        className="dashboard-form"
        onSubmit={(event) => {
          if (!validateLocal(paste, filename)) {
            event.preventDefault();
          }
        }}
      >
        <input type="hidden" name="filename" value={filename} />
        <label className="form-field">
          <span>Paste programme JSON</span>
          <textarea
            name="programmeJson"
            rows={8}
            value={paste}
            onChange={(event) => {
              setPaste(event.target.value);
              setFilename("");
              setLocalError(null);
              setPreviewSlug(null);
            }}
            placeholder='{ "slug": "example", "title": "...", "activities": [ ... ] }'
          />
        </label>
        <div className="cms-form-actions">
          <button type="button" className="button button-secondary" onClick={() => fileRef.current?.click()}>
            Upload .json
          </button>
          <input
            ref={fileRef}
            type="file"
            accept=".json,application/json,text/plain"
            className="sr-only"
            onChange={(event) => {
              void handleFile(event.target.files?.[0] ?? null);
              event.target.value = "";
            }}
          />
          <button type="submit" className="button button-primary" disabled={!paste.trim()}>
            Import as draft
          </button>
        </div>
      </form>

      {previewSlug ? (
        <p className="cms-inline-status">
          Ready to import draft for <code>{previewSlug}</code>
          {localWarnings.length ? ` · ${localWarnings.length} warning(s)` : ""}.
        </p>
      ) : null}
      {localWarnings.length ? (
        <ul className="dashboard-inline-note">
          {localWarnings.map((warning) => (
            <li key={warning}>{warning}</li>
          ))}
        </ul>
      ) : null}
      {formErrors.length ? (
        <div className="cms-publish-blockers" role="alert">
          <p className="form-error">Import blocked:</p>
          <ul>
            {formErrors.map((message) => (
              <li key={message}>{message}</li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
}
