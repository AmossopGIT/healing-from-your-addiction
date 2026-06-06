"use client";

import { useRef } from "react";

type CmsRichTextAreaProps = {
  value: string;
  onChange: (value: string) => void;
  rows?: number;
  maxLength?: number;
  placeholder?: string;
  name?: string;
  label?: string;
  required?: boolean;
};

type ToolbarAction = {
  label: string;
  title: string;
  wrap?: { before: string; after: string };
  insert?: string;
};

const TOOLBAR_ACTIONS: ToolbarAction[] = [
  { label: "B", title: "Bold", wrap: { before: "**", after: "**" } },
  { label: "I", title: "Italic", wrap: { before: "*", after: "*" } },
  { label: "H2", title: "Heading 2", insert: "## Section heading\n\n" },
  { label: "H3", title: "Heading 3", insert: "### Subheading\n\n" },
  { label: "P", title: "Paragraph break", insert: "\n\n" },
  { label: "Sm", title: "Small text", wrap: { before: "<small>", after: "</small>" } },
  { label: "Lg", title: "Large text", wrap: { before: '<span class="blog-text-large">', after: "</span>" } },
  { label: "Link", title: "Internal link", insert: "[link text](/contact/)" },
  { label: "Img", title: "Image", insert: "![Descriptive alt text](/art/watercolor/art-watercolor-home-hero.png)" },
  { label: "Video", title: "YouTube video note", insert: "\n(Use section video fields below for embeds — paste YouTube ID there.)\n" },
];

function applyToolbarAction(value: string, selectionStart: number, selectionEnd: number, action: ToolbarAction) {
  const selected = value.slice(selectionStart, selectionEnd);

  if (action.wrap) {
    const wrapped = `${action.wrap.before}${selected || "text"}${action.wrap.after}`;
    return {
      nextValue: value.slice(0, selectionStart) + wrapped + value.slice(selectionEnd),
      cursor: selectionStart + action.wrap.before.length + (selected || "text").length,
    };
  }

  if (action.insert) {
    return {
      nextValue: value.slice(0, selectionStart) + action.insert + value.slice(selectionEnd),
      cursor: selectionStart + action.insert.length,
    };
  }

  return { nextValue: value, cursor: selectionEnd };
}

export function CmsRichTextArea({
  value,
  onChange,
  rows = 4,
  maxLength,
  placeholder,
  name,
  label,
  required,
}: CmsRichTextAreaProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  function runAction(action: ToolbarAction) {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const { nextValue, cursor } = applyToolbarAction(
      value,
      textarea.selectionStart,
      textarea.selectionEnd,
      action,
    );
    onChange(nextValue);
    requestAnimationFrame(() => {
      textarea.focus();
      textarea.setSelectionRange(cursor, cursor);
    });
  }

  return (
    <div className="cms-rich-text-field">
      {label ? <span className="cms-rich-text-label">{label}</span> : null}
      <div className="cms-rich-text-toolbar" role="toolbar" aria-label="Formatting tools">
        {TOOLBAR_ACTIONS.map((action) => (
          <button
            key={action.title}
            type="button"
            className="cms-rich-text-tool"
            title={action.title}
            onClick={() => runAction(action)}
          >
            {action.label}
          </button>
        ))}
      </div>
      <textarea
        ref={textareaRef}
        name={name}
        rows={rows}
        maxLength={maxLength}
        placeholder={placeholder}
        required={required}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  );
}
