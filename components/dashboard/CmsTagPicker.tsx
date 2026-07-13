"use client";

import { blogTags } from "@/content/blog";

type CmsTagPickerProps = {
  name?: string;
  value: string[];
  onChange: (slugs: string[]) => void;
  maxTags?: number;
};

export function CmsTagPicker({ name = "tagSlugs", value, onChange, maxTags = 12 }: CmsTagPickerProps) {
  const selected = new Set(value);

  function toggle(slug: string) {
    if (selected.has(slug)) {
      onChange(value.filter((item) => item !== slug));
      return;
    }
    if (value.length >= maxTags) return;
    onChange([...value, slug]);
  }

  return (
    <div className="cms-tag-picker">
      <div className="cms-tag-picker-header">
        <span className="cms-tag-picker-label">Tags</span>
        <span className="cms-field-help">
          {value.length}/{maxTags} selected — click to toggle. These appear on the public blog post.
        </span>
      </div>
      <div className="cms-tag-picker-list" role="group" aria-label="Blog tags">
        {blogTags.map((tag) => {
          const isSelected = selected.has(tag.slug);
          return (
            <button
              key={tag.slug}
              type="button"
              className={`cms-tag-chip${isSelected ? " is-selected" : ""}`}
              aria-pressed={isSelected}
              onClick={() => toggle(tag.slug)}
              title={tag.slug}
            >
              {tag.label}
            </button>
          );
        })}
      </div>
      <input type="hidden" name={name} value={value.join(", ")} readOnly />
      {value.length === 0 ? (
        <p className="cms-field-help">No tags selected yet. Drafts default to “Addiction recovery” if left empty.</p>
      ) : null}
    </div>
  );
}
