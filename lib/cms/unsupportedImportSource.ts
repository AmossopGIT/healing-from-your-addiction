/** Shared rejection for PDF / Word uploads and pastes in Smart Upload flows. */

export const UNSUPPORTED_IMPORT_MESSAGE =
  "This file is a PDF or Word document. The importer only reads .txt or .md. Copy the article text, or export as .txt / .md, then paste or upload that.";

const WORD_MIME_TYPES = new Set([
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-word",
  "application/vnd.ms-word.document.macroEnabled.12",
]);

const PDF_MIME_TYPES = new Set(["application/pdf"]);

function extensionOf(filename: string): string {
  const match = filename.toLowerCase().match(/\.([a-z0-9]+)$/);
  return match?.[1] ?? "";
}

/** True when filename or MIME clearly indicates PDF or Word. */
export function isUnsupportedImportFilename(filename: string, mimeType = ""): boolean {
  const ext = extensionOf(filename);
  if (ext === "pdf" || ext === "doc" || ext === "docx") return true;
  const mime = mimeType.toLowerCase().trim();
  if (PDF_MIME_TYPES.has(mime) || WORD_MIME_TYPES.has(mime)) return true;
  return false;
}

/**
 * Detect PDF / Word / binary magic in the start of a file or paste.
 * Safe to call with a short prefix (first ~16 bytes as latin1 / UTF-8 text).
 */
export function looksLikeUnsupportedDocumentBinary(prefix: string): boolean {
  if (!prefix) return false;
  const trimmed = prefix.replace(/^\uFEFF/, "");
  if (trimmed.startsWith("%PDF")) return true;

  // OLE Compound File (legacy .doc)
  if (
    trimmed.length >= 4 &&
    trimmed.charCodeAt(0) === 0xd0 &&
    trimmed.charCodeAt(1) === 0xcf &&
    trimmed.charCodeAt(2) === 0x11 &&
    trimmed.charCodeAt(3) === 0xe0
  ) {
    return true;
  }

  // ZIP container used by .docx (PK..) — only when not obviously plain text
  if (trimmed.startsWith("PK") && trimmed.length >= 4) {
    const third = trimmed.charCodeAt(2);
    const fourth = trimmed.charCodeAt(3);
    // Local file header: PK\x03\x04 or empty ZIP PK\x05\x06
    if ((third === 3 && fourth === 4) || (third === 5 && fourth === 6) || (third === 7 && fourth === 8)) {
      return true;
    }
  }

  return false;
}

export function getUnsupportedImportError(input: {
  filename?: string;
  mimeType?: string;
  textPrefix?: string;
}): string | null {
  if (input.filename && isUnsupportedImportFilename(input.filename, input.mimeType ?? "")) {
    return UNSUPPORTED_IMPORT_MESSAGE;
  }
  if (input.textPrefix && looksLikeUnsupportedDocumentBinary(input.textPrefix)) {
    return UNSUPPORTED_IMPORT_MESSAGE;
  }
  return null;
}

/** Read a short binary-safe prefix from a File for magic-byte checks. */
export async function readFileMagicPrefix(file: File, byteLength = 16): Promise<string> {
  const slice = file.slice(0, byteLength);
  const buffer = await slice.arrayBuffer();
  return Array.from(new Uint8Array(buffer), (byte) => String.fromCharCode(byte)).join("");
}
