"use client";

import { useEffect, useMemo, useState } from "react";
import type { BlogSection } from "@/content/blog";
import { CmsRichTextArea } from "@/components/dashboard/CmsRichTextArea";
import { cmsFieldMaxLengths } from "@/lib/cms/formValidation";

type CmsSectionEditorProps = {
  initialSections: BlogSection[];
  onSectionsChange?: (sections: BlogSection[]) => void;
};

function emptySection(): BlogSection {
  return { h2: "", paragraphs: [""], bullets: [] };
}

export function CmsSectionEditor({ initialSections, onSectionsChange }: CmsSectionEditorProps) {
  const [sections, setSections] = useState<BlogSection[]>(initialSections.length ? initialSections : [emptySection()]);
  const sectionsJson = useMemo(() => JSON.stringify(sections, null, 2), [sections]);

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

  return (
    <fieldset className="cms-fieldset">
      <legend>3. Body (article sections)</legend>
      <p className="cms-field-help">
        This is the full article — not the excerpt. Add one section per H2 topic. Use the formatting toolbar for bold,
        italic, links, and images. Optional H3 subsections and video are under each section.
      </p>

      {sections.map((section, index) => (
        <div key={`section-${index}`} className="cms-section-card">
          <div className="cms-section-card-header">
            <strong>Section {index + 1}</strong>
            <button type="button" className="dashboard-signout" onClick={() => updateSections((current) => current.filter((_, i) => i !== index))}>
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
            </div>
          </details>
        </div>
      ))}

      <button type="button" className="button button-secondary" onClick={() => updateSections((current) => [...current, emptySection()])}>
        Add section
      </button>

      <label className="form-field">
        <span>Sections JSON (advanced)</span>
        <textarea
          className="cms-json-editor"
          rows={12}
          maxLength={cmsFieldMaxLengths.sectionsJson}
          value={sectionsJson}
          onChange={(event) => {
            try {
              const parsed = JSON.parse(event.target.value) as BlogSection[];
              if (Array.isArray(parsed)) updateSections(parsed);
            } catch {
              // Keep typed JSON editable even when temporarily invalid.
            }
          }}
        />
      </label>

      <input type="hidden" name="sectionsJson" value={sectionsJson} readOnly />
    </fieldset>
  );
}
