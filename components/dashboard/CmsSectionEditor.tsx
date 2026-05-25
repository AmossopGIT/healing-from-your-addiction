"use client";

import { useMemo, useState } from "react";
import type { BlogSection } from "@/content/blog";
import { cmsFieldMaxLengths } from "@/lib/cms/formValidation";

type CmsSectionEditorProps = {
  initialSections: BlogSection[];
};

function emptySection(): BlogSection {
  return { h2: "", paragraphs: [""], bullets: [] };
}

export function CmsSectionEditor({ initialSections }: CmsSectionEditorProps) {
  const [sections, setSections] = useState<BlogSection[]>(initialSections.length ? initialSections : [emptySection()]);
  const sectionsJson = useMemo(() => JSON.stringify(sections, null, 2), [sections]);

  function updateSection(index: number, patch: Partial<BlogSection>) {
    setSections((current) => current.map((section, i) => (i === index ? { ...section, ...patch } : section)));
  }

  return (
    <fieldset className="cms-fieldset">
      <legend>Structured sections</legend>
      <p className="cms-field-help">
        Each section needs an H2 and at least one paragraph. Optional bullets and H3 items can be edited in JSON below.
      </p>

      {sections.map((section, index) => (
        <div key={`section-${index}`} className="cms-section-card">
          <div className="cms-section-card-header">
            <strong>Section {index + 1}</strong>
            <button type="button" className="dashboard-signout" onClick={() => setSections((current) => current.filter((_, i) => i !== index))}>
              Remove
            </button>
          </div>
          <label className="form-field">
            <span>H2 heading</span>
            <input
              value={section.h2}
              maxLength={cmsFieldMaxLengths.sectionHeading}
              onChange={(event) => updateSection(index, { h2: event.target.value })}
              required
            />
          </label>
          <label className="form-field">
            <span>Paragraphs (one per line)</span>
            <textarea
              rows={4}
              maxLength={cmsFieldMaxLengths.sectionText * 4}
              value={section.paragraphs.join("\n")}
              onChange={(event) => updateSection(index, { paragraphs: event.target.value.split("\n") })}
            />
          </label>
          <label className="form-field">
            <span>Bullets (one per line, optional)</span>
            <textarea
              rows={3}
              maxLength={cmsFieldMaxLengths.sectionText * 3}
              value={(section.bullets ?? []).join("\n")}
              onChange={(event) => {
                const bullets = event.target.value
                  .split("\n")
                  .map((line) => line.trim())
                  .filter(Boolean);
                updateSection(index, { bullets: bullets.length ? bullets : undefined });
              }}
            />
          </label>
        </div>
      ))}

      <button type="button" className="button button-secondary" onClick={() => setSections((current) => [...current, emptySection()])}>
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
              if (Array.isArray(parsed)) setSections(parsed);
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
