"use client";

import { useEffect, useMemo, useState } from "react";
import type { BlogSection } from "@/content/blog";
import { artGallery } from "@/content/artGallery";
import { CmsRichTextArea } from "@/components/dashboard/CmsRichTextArea";
import { SmartBodyUpload } from "@/components/dashboard/SmartBodyUpload";
import { cmsFieldMaxLengths } from "@/lib/cms/formValidation";
import { bodyHasReplaceableContent } from "@/lib/cms/smartBodyImport";

type CmsSectionEditorProps = {
  initialSections: BlogSection[];
  onSectionsChange?: (sections: BlogSection[]) => void;
  slug?: string;
  /** When true, section cards start collapsed inside a details element (used by blog form). */
  collapsible?: boolean;
  defaultOpen?: boolean;
  /**
   * When false, the parent form owns the `sectionsJson` submit field
   * (recommended for Smart Upload so preview state and save payload stay in sync).
   */
  includeFormField?: boolean;
};

function emptySection(): BlogSection {
  return { h2: "", paragraphs: [""], bullets: [] };
}

function sectionsHaveCopy(sections: BlogSection[]): boolean {
  return sections.some(
    (section) =>
      section.h2.trim() ||
      (section.paragraphs ?? []).some((paragraph) => paragraph.trim()) ||
      (section.bullets ?? []).some((bullet) => bullet.trim()),
  );
}

async function uploadSectionMedia(file: File, kind: "image" | "video" | "audio", slug: string): Promise<string> {
  const body = new FormData();
  body.append("file", file);
  body.append("kind", kind);
  body.append("slug", slug || "blog-media");
  const response = await fetch("/api/admin/cms/upload-media/", { method: "POST", body });
  const payload = (await response.json()) as { src?: string; error?: string };
  if (!response.ok || !payload.src) throw new Error(payload.error ?? "Upload failed.");
  return payload.src;
}

export function CmsSectionEditor({
  initialSections,
  onSectionsChange,
  slug = "",
  collapsible = false,
  defaultOpen = false,
  includeFormField = true,
}: CmsSectionEditorProps) {
  const [sections, setSections] = useState<BlogSection[]>(initialSections.length ? initialSections : [emptySection()]);
  const [uploadingMedia, setUploadingMedia] = useState<string | null>(null);
  // Compact JSON for the hidden submit field (keeps payloads under the server limit).
  const sectionsJsonCompact = useMemo(() => JSON.stringify(sections), [sections]);
  const sectionsJsonPretty = useMemo(() => JSON.stringify(sections, null, 2), [sections]);
  const headingPreview = sections
    .map((section) => section.h2.trim())
    .filter(Boolean)
    .slice(0, 8);
  const readyCount = sectionsHaveCopy(sections)
    ? sections.filter(
        (section) =>
          section.h2.trim() ||
          (section.paragraphs ?? []).some((paragraph) => paragraph.trim()) ||
          (section.bullets ?? []).some((bullet) => bullet.trim()),
      ).length
    : 0;

  useEffect(() => {
    onSectionsChange?.(sections);
  }, []);

  function updateSections(next: BlogSection[] | ((current: BlogSection[]) => BlogSection[])) {
    setSections((current) => {
      const resolved = typeof next === "function" ? next(current) : next;
      onSectionsChange?.(resolved);
      return resolved;
    });
  }

  function updateSection(index: number, patch: Partial<BlogSection>) {
    updateSections((current) => current.map((section, i) => (i === index ? { ...section, ...patch } : section)));
  }

  const editor = (
    <>
      <p className="cms-field-help">
        Fine-tune headings, paragraphs, bullets, H3s, or video after Smart Body Upload (or the top Smart Upload for the
        full form).
      </p>

      {sections.map((section, index) => (
        <div key={`section-${index}`} className="cms-section-card">
          <div className="cms-section-card-header">
            <strong>Section {index + 1}</strong>
            <button
              type="button"
              className="dashboard-signout"
              onClick={() => updateSections((current) => current.filter((_, i) => i !== index))}
            >
              Remove
            </button>
          </div>
          <label className="form-field">
            <span>H2 heading</span>
            <input
              value={section.h2}
              maxLength={cmsFieldMaxLengths.sectionHeading}
              onChange={(event) => updateSection(index, { h2: event.target.value })}
              placeholder="Section heading"
            />
          </label>
          <CmsRichTextArea
            label="Paragraphs (one block per paragraph — use toolbar for formatting)"
            rows={5}
            maxLength={cmsFieldMaxLengths.sectionText * 4}
            value={(section.paragraphs ?? []).join("\n\n")}
            onChange={(value) =>
              updateSection(index, {
                paragraphs: value.split(/\n\s*\n/).map((paragraph) => paragraph.trim()).filter(Boolean).length
                  ? value.split(/\n\s*\n/).map((paragraph) => paragraph.trim()).filter(Boolean)
                  : [""],
              })
            }
          />
          {(section.paragraphs ?? []).some(
            (paragraph) => paragraph.trim().length >= Math.floor(cmsFieldMaxLengths.sectionText * 0.9),
          ) ? (
            <p className="cms-field-help" role="status">
              One or more paragraphs are near the {cmsFieldMaxLengths.sectionText.toLocaleString()}-character limit.
              Split long blocks so save does not reject them.
            </p>
          ) : null}
          <CmsRichTextArea
            label="Bullets (one per line, optional)"
            rows={3}
            maxLength={cmsFieldMaxLengths.sectionText * 3}
            value={(section.bullets ?? []).join("\n")}
            onChange={(value) => {
              const bullets = value
                .split("\n")
                .map((line) => line.trim())
                .filter(Boolean);
              updateSection(index, { bullets: bullets.length ? bullets : undefined });
            }}
          />
          <label className="form-field">
            <span>Watercolor section artwork (optional)</span>
            <select
              value={section.artId ?? ""}
              onChange={(event) => updateSection(index, { artId: event.target.value || undefined })}
            >
              <option value="">No section artwork</option>
              {artGallery
                .filter((item) => item.category.startsWith("blog-") || item.category === "shared")
                .map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.title}
                  </option>
                ))}
            </select>
            <span className="cms-field-help">Use one quiet illustration to break up a long section.</span>
          </label>

          <details className="cms-section-details">
            <summary>Subheadings (H3) and video</summary>
            <div className="cms-section-details-body">
              {(section.h3Items ?? []).map((item, h3Index) => (
                <div key={`h3-${index}-${h3Index}`} className="cms-subsection-card">
                  <label className="form-field">
                    <span>H3 subheading</span>
                    <input
                      value={item.h3}
                      maxLength={cmsFieldMaxLengths.sectionHeading}
                      onChange={(event) => {
                        const h3Items = [...(section.h3Items ?? [])];
                        h3Items[h3Index] = { ...h3Items[h3Index], h3: event.target.value };
                        updateSection(index, { h3Items });
                      }}
                    />
                  </label>
                  <CmsRichTextArea
                    label="H3 body"
                    rows={3}
                    value={item.body}
                    onChange={(value) => {
                      const h3Items = [...(section.h3Items ?? [])];
                      h3Items[h3Index] = { ...h3Items[h3Index], body: value };
                      updateSection(index, { h3Items });
                    }}
                  />
                  <button
                    type="button"
                    className="dashboard-signout"
                    onClick={() =>
                      updateSection(index, {
                        h3Items: (section.h3Items ?? []).filter((_, i) => i !== h3Index),
                      })
                    }
                  >
                    Remove H3
                  </button>
                </div>
              ))}
              <button
                type="button"
                className="button button-secondary"
                onClick={() =>
                  updateSection(index, {
                    h3Items: [...(section.h3Items ?? []), { h3: "", body: "" }],
                  })
                }
              >
                Add H3 subsection
              </button>

              <label className="form-field">
                <span>Video title</span>
                <input
                  value={section.video?.title ?? ""}
                  maxLength={cmsFieldMaxLengths.sectionHeading}
                  onChange={(event) =>
                    updateSection(index, {
                      video: {
                        ...section.video,
                        title: event.target.value,
                        youtubeId: section.video?.youtubeId,
                        src: section.video?.src,
                        description: section.video?.description,
                        posterSrc: section.video?.posterSrc,
                      },
                    })
                  }
                  placeholder="Optional section video title"
                />
              </label>
              <label className="form-field">
                <span>YouTube video ID</span>
                <input
                  value={section.video?.youtubeId ?? ""}
                  onChange={(event) =>
                    updateSection(index, {
                      video: event.target.value.trim() || section.video?.src
                        ? {
                            title: section.video?.title ?? (section.h2 || "Section video"),
                            youtubeId: event.target.value.trim() || undefined,
                            src: section.video?.src,
                            description: section.video?.description,
                            posterSrc: section.video?.posterSrc,
                          }
                        : undefined,
                    })
                  }
                  placeholder="e.g. jv9ML5VchMY"
                />
              </label>
              <label className="form-field">
                <span>Self-hosted MP4 path</span>
                <input
                  value={section.video?.src ?? ""}
                  onChange={(event) =>
                    updateSection(index, {
                      video: event.target.value.trim() || section.video?.youtubeId
                        ? {
                            title: section.video?.title ?? (section.h2 || "Section video"),
                            src: event.target.value.trim() || undefined,
                            youtubeId: section.video?.youtubeId,
                            description: section.video?.description,
                            posterSrc: section.video?.posterSrc,
                          }
                        : undefined,
                    })
                  }
                  placeholder="/videos/your-video.mp4"
                />
              </label>
              <label className="form-field">
                <span>Upload video</span>
                <input
                  type="file"
                  accept="video/mp4,video/webm,video/quicktime"
                  disabled={uploadingMedia !== null}
                  onChange={async (event) => {
                    const file = event.target.files?.[0];
                    event.target.value = "";
                    if (!file) return;
                    setUploadingMedia(`video-${index}`);
                    try {
                      const src = await uploadSectionMedia(file, "video", slug);
                      updateSection(index, {
                        video: {
                          title: section.video?.title ?? (section.h2 || "Section video"),
                          src,
                          youtubeId: undefined,
                          description: section.video?.description,
                          posterSrc: section.video?.posterSrc,
                        },
                      });
                    } catch (error) {
                      window.alert(error instanceof Error ? error.message : "Video upload failed.");
                    } finally {
                      setUploadingMedia(null);
                    }
                  }}
                />
                {uploadingMedia === `video-${index}` ? <span className="cms-field-help">Uploading…</span> : null}
              </label>
              <label className="form-field">
                <span>Image URL</span>
                <input
                  value={section.image?.src ?? ""}
                  onChange={(event) =>
                    updateSection(index, {
                      image: event.target.value.trim()
                        ? { src: event.target.value, alt: section.image?.alt ?? "", caption: section.image?.caption }
                        : undefined,
                    })
                  }
                  placeholder="/uploads/blog-media/article-image.webp"
                />
              </label>
              <label className="form-field">
                <span>Image alt text</span>
                <input
                  value={section.image?.alt ?? ""}
                  onChange={(event) =>
                    updateSection(index, {
                      image: section.image
                        ? { ...section.image, alt: event.target.value }
                        : { src: "", alt: event.target.value },
                    })
                  }
                />
              </label>
              <label className="form-field">
                <span>Upload image</span>
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  disabled={uploadingMedia !== null}
                  onChange={async (event) => {
                    const file = event.target.files?.[0];
                    event.target.value = "";
                    if (!file) return;
                    setUploadingMedia(`image-${index}`);
                    try {
                      const src = await uploadSectionMedia(file, "image", slug);
                      updateSection(index, {
                        image: { src, alt: section.image?.alt ?? file.name.replace(/\.[^.]+$/, ""), caption: section.image?.caption },
                      });
                    } catch (error) {
                      window.alert(error instanceof Error ? error.message : "Image upload failed.");
                    } finally {
                      setUploadingMedia(null);
                    }
                  }}
                />
                {uploadingMedia === `image-${index}` ? <span className="cms-field-help">Uploading…</span> : null}
              </label>
              <label className="form-field">
                <span>Audio title</span>
                <input
                  value={section.audio?.title ?? ""}
                  onChange={(event) =>
                    updateSection(index, {
                      audio: section.audio
                        ? { ...section.audio, title: event.target.value }
                        : { title: event.target.value, src: "" },
                    })
                  }
                  placeholder="Listen to this article"
                />
              </label>
              <label className="form-field">
                <span>Audio URL</span>
                <input
                  value={section.audio?.src ?? ""}
                  onChange={(event) =>
                    updateSection(index, {
                      audio: event.target.value.trim()
                        ? { title: section.audio?.title || "Article audio", src: event.target.value, description: section.audio?.description }
                        : undefined,
                    })
                  }
                  placeholder="/uploads/blog-media/article-audio.mp3"
                />
              </label>
              <label className="form-field">
                <span>Upload audio</span>
                <input
                  type="file"
                  accept="audio/mpeg,audio/mp4,audio/wav,audio/ogg,audio/webm"
                  disabled={uploadingMedia !== null}
                  onChange={async (event) => {
                    const file = event.target.files?.[0];
                    event.target.value = "";
                    if (!file) return;
                    setUploadingMedia(`audio-${index}`);
                    try {
                      const src = await uploadSectionMedia(file, "audio", slug);
                      updateSection(index, {
                        audio: { title: section.audio?.title || "Article audio", src, description: section.audio?.description },
                      });
                    } catch (error) {
                      window.alert(error instanceof Error ? error.message : "Audio upload failed.");
                    } finally {
                      setUploadingMedia(null);
                    }
                  }}
                />
                {uploadingMedia === `audio-${index}` ? <span className="cms-field-help">Uploading…</span> : null}
              </label>
            </div>
          </details>
        </div>
      ))}

      <button
        type="button"
        className="button button-secondary"
        onClick={() => updateSections((current) => [...current, emptySection()])}
      >
        Add section
      </button>

      <details className="cms-section-details cms-sections-json-details">
        <summary>Sections JSON (advanced)</summary>
        <div className="cms-section-details-body">
          <p className="cms-field-help">
            Auto-updates when you edit sections. Only edit this directly if you know the schema.
          </p>
          <label className="form-field">
            <span className="sr-only">Sections JSON</span>
            <textarea
              className="cms-json-editor"
              rows={12}
              maxLength={cmsFieldMaxLengths.sectionsJson}
              value={sectionsJsonPretty}
              onChange={(event) => {
                try {
                  const parsed = JSON.parse(event.target.value) as BlogSection[];
                  if (Array.isArray(parsed)) updateSections(parsed);
                } catch {
                  // Keep typed JSON editable even when temporarily invalid.
                }
              }}
            />
            <span className="cms-field-help">
              Payload size: {sectionsJsonCompact.length.toLocaleString()} /{" "}
              {cmsFieldMaxLengths.sectionsJson.toLocaleString()} characters
            </span>
          </label>
        </div>
      </details>
    </>
  );

  return (
    <fieldset className="cms-fieldset">
      <legend>Body</legend>
      <SmartBodyUpload
        hasExistingBody={bodyHasReplaceableContent(sections)}
        onImport={(nextSections) => updateSections(nextSections.length ? nextSections : [emptySection()])}
      />
      <div className="cms-body-summary">
        <p className="cms-body-summary-status">
          {readyCount > 0
            ? `${readyCount} section${readyCount === 1 ? "" : "s"} ready`
            : "No body sections yet — use Smart Body Upload above, or edit sections below."}
        </p>
        {headingPreview.length ? (
          <ul className="cms-body-heading-list">
            {headingPreview.map((heading) => (
              <li key={heading}>{heading}</li>
            ))}
          </ul>
        ) : null}
      </div>

      {collapsible ? (
        <details className="cms-section-details cms-body-edit-details" open={defaultOpen}>
          <summary>Edit sections</summary>
          <div className="cms-section-details-body">{editor}</div>
        </details>
      ) : (
        editor
      )}

      {includeFormField ? (
        // Textarea survives large ChatGPT article payloads better than input[type=hidden].
        <textarea
          className="sr-only"
          name="sectionsJson"
          value={sectionsJsonCompact}
          readOnly
          aria-hidden="true"
          tabIndex={-1}
        />
      ) : null}
    </fieldset>
  );
}
