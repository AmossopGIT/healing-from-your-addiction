"use client";

type SuggestTemplate = {
  id: string;
  title: string;
  addiction_slug: string;
  status?: string | null;
};

type AdminProgrammeAssignSuggestionsProps = {
  templates: SuggestTemplate[];
  preferredTemplateId?: string | null;
  clientFocusSlug?: string | null;
  selectName?: string;
};

export function AdminProgrammeAssignSuggestions({
  templates,
  preferredTemplateId,
  clientFocusSlug,
  selectName = "templateId",
}: AdminProgrammeAssignSuggestionsProps) {
  const preferred = preferredTemplateId
    ? templates.find((item) => item.id === preferredTemplateId)
    : templates.find((item) => item.addiction_slug === clientFocusSlug);

  const others = templates
    .filter((item) => item.id !== preferred?.id)
    .slice(0, preferred ? 3 : 4);

  const suggestions = preferred ? [preferred, ...others] : others;

  if (!suggestions.length) return null;

  return (
    <div className="admin-programme-assign-suggestions">
      <p className="cms-field-help">
        Suggested matches{clientFocusSlug ? ` for focus “${clientFocusSlug}”` : ""}. Click a card to select it, or use
        the full list below.
      </p>
      <div className="admin-programme-suggest-grid">
        {suggestions.map((item) => {
          const isPreferred = preferred?.id === item.id;
          return (
            <button
              key={item.id}
              type="button"
              className={`admin-programme-suggest-card${isPreferred ? " is-preferred" : ""}`}
              onClick={() => {
                const select = document.querySelector<HTMLSelectElement>(`select[name="${selectName}"]`);
                if (!select) return;
                select.value = item.id;
                select.dispatchEvent(new Event("change", { bubbles: true }));
              }}
            >
              <strong>{item.title}</strong>
              <span className="admin-programme-card-meta">
                {item.addiction_slug}
                {isPreferred ? " · matches focus" : ""}
                {item.status ? ` · ${item.status}` : ""}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
