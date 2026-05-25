"use client";

import { useState } from "react";
import type { ArtGalleryItem } from "@/content/artGallery";
import { cmsFieldMaxLengths } from "@/lib/cms/formValidation";

type CmsHeroArtFieldsProps = {
  contentKind: "blog" | "case-study";
  slug: string;
  galleryItems: ArtGalleryItem[];
  defaultArtId: string;
  defaultArtSrc: string;
  defaultArtAlt: string;
};

export function CmsHeroArtFields({
  contentKind,
  slug,
  galleryItems,
  defaultArtId,
  defaultArtSrc,
  defaultArtAlt,
}: CmsHeroArtFieldsProps) {
  const [heroArtId, setHeroArtId] = useState(defaultArtId);
  const [heroArtSrc, setHeroArtSrc] = useState(defaultArtSrc);
  const [heroArtAlt, setHeroArtAlt] = useState(defaultArtAlt);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const prefix = contentKind === "blog" ? "blog-" : "case-study-";
  const expectedId = `${prefix}${slug}`;

  function applyGalleryItem(item: ArtGalleryItem) {
    setHeroArtId(item.id);
    setHeroArtSrc(item.src);
    setHeroArtAlt(item.alt);
  }

  async function handleUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file || !slug) {
      setUploadStatus("Enter a slug before uploading artwork.");
      return;
    }

    setIsUploading(true);
    setUploadStatus(null);

    try {
      const body = new FormData();
      body.append("file", file);
      body.append("contentKind", contentKind);
      body.append("slug", slug);
      body.append("alt", heroArtAlt || `Minimal watercolor illustration for ${slug}.`);

      const response = await fetch("/api/admin/cms/upload-art/", { method: "POST", body });
      const payload = (await response.json()) as { error?: string; heroArtId?: string; heroArtSrc?: string; heroArtAlt?: string };

      if (!response.ok) {
        setUploadStatus(payload.error ?? "Upload failed.");
        return;
      }

      setHeroArtId(payload.heroArtId ?? expectedId);
      setHeroArtSrc(payload.heroArtSrc ?? "");
      if (payload.heroArtAlt) setHeroArtAlt(payload.heroArtAlt);
      setUploadStatus("Artwork uploaded successfully.");
    } catch {
      setUploadStatus("Upload failed. Try again.");
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <fieldset className="cms-fieldset">
      <legend>Hero artwork</legend>
      <p className="cms-field-help">
        Use existing gallery art or upload a watercolor PNG. Required before publish. Expected ID: <code>{expectedId}</code>
      </p>

      <label className="form-field">
        <span>Select from gallery</span>
        <select
          value={galleryItems.some((item) => item.id === heroArtId) ? heroArtId : ""}
          onChange={(event) => {
            const item = galleryItems.find((entry) => entry.id === event.target.value);
            if (item) applyGalleryItem(item);
          }}
        >
          <option value="">Choose existing artwork</option>
          {galleryItems.map((item) => (
            <option key={item.id} value={item.id}>
              {item.title}
            </option>
          ))}
        </select>
      </label>

      <label className="form-field">
        <span>Upload PNG artwork</span>
        <input type="file" accept="image/png,image/jpeg,image/webp" onChange={handleUpload} disabled={isUploading} />
      </label>

      {uploadStatus ? <p className="cms-inline-status">{uploadStatus}</p> : null}

      <input type="hidden" name="heroArtId" value={heroArtId} readOnly />
      <input type="hidden" name="heroArtSrc" value={heroArtSrc} readOnly />

      <label className="form-field">
        <span>Hero image alt text</span>
        <textarea
          name="heroArtAlt"
          rows={3}
          required
          maxLength={cmsFieldMaxLengths.heroArtAlt}
          value={heroArtAlt}
          onChange={(event) => setHeroArtAlt(event.target.value)}
        />
      </label>

      {heroArtSrc ? (
        <p className="cms-art-preview-path">
          Current path: <code>{heroArtSrc}</code>
        </p>
      ) : null}
    </fieldset>
  );
}
