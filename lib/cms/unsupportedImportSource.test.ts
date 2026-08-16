import { describe, expect, it } from "vitest";
import {
  UNSUPPORTED_IMPORT_MESSAGE,
  getUnsupportedImportError,
  isUnsupportedImportFilename,
  looksLikeUnsupportedDocumentBinary,
} from "@/lib/cms/unsupportedImportSource";

describe("isUnsupportedImportFilename", () => {
  it("rejects PDF and Word extensions", () => {
    expect(isUnsupportedImportFilename("article.pdf")).toBe(true);
    expect(isUnsupportedImportFilename("article.DOCX")).toBe(true);
    expect(isUnsupportedImportFilename("notes.doc")).toBe(true);
  });

  it("rejects PDF and Word MIME types", () => {
    expect(isUnsupportedImportFilename("article.bin", "application/pdf")).toBe(true);
    expect(
      isUnsupportedImportFilename(
        "article.bin",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ),
    ).toBe(true);
  });

  it("allows txt and md", () => {
    expect(isUnsupportedImportFilename("article.txt")).toBe(false);
    expect(isUnsupportedImportFilename("article.md", "text/markdown")).toBe(false);
  });
});

describe("looksLikeUnsupportedDocumentBinary", () => {
  it("detects PDF header", () => {
    expect(looksLikeUnsupportedDocumentBinary("%PDF-1.4\n...")).toBe(true);
  });

  it("detects OLE .doc magic", () => {
    const ole = String.fromCharCode(0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1);
    expect(looksLikeUnsupportedDocumentBinary(ole)).toBe(true);
  });

  it("detects docx ZIP local header", () => {
    expect(looksLikeUnsupportedDocumentBinary("PK\u0003\u0004rest")).toBe(true);
  });

  it("allows normal markdown", () => {
    expect(looksLikeUnsupportedDocumentBinary("# Title\n\nBody")).toBe(false);
  });
});

describe("getUnsupportedImportError", () => {
  it("returns the staff message for a .docx name", () => {
    expect(getUnsupportedImportError({ filename: "draft.docx" })).toBe(UNSUPPORTED_IMPORT_MESSAGE);
  });

  it("returns null for plain text", () => {
    expect(getUnsupportedImportError({ filename: "draft.md", textPrefix: "# Hello" })).toBeNull();
  });
});
