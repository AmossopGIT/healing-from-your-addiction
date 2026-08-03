"use client";

import { useMemo, useState } from "react";
import { ActivityWizard } from "@/components/programme/ActivityWizard";
import type { InteractiveProgrammeDefinition, ProgrammeActivity } from "@/content/interactiveProgrammes/types";
import type { ActivityProgressStatus } from "@/types/database";

type ProgrammePreviewWizardProps = {
  definition: InteractiveProgrammeDefinition;
  activity: ProgrammeActivity;
};

export function ProgrammePreviewWizard({ definition, activity }: ProgrammePreviewWizardProps) {
  const [status, setStatus] = useState<ActivityProgressStatus>("available");
  const [savedResponses, setSavedResponses] = useState<Record<string, unknown>>({});
  const [message, setMessage] = useState<string | null>(null);

  const ordered = useMemo(
    () => [...definition.activities].sort((a, b) => a.sortOrder - b.sortOrder || a.id.localeCompare(b.id)),
    [definition.activities],
  );
  const currentIndex = ordered.findIndex((item) => item.id === activity.id);
  const next = currentIndex >= 0 ? ordered[currentIndex + 1] ?? null : null;

  return (
    <div className="dashboard-stack">
      <p className="dashboard-inline-note">
        Preview mode uses the real client wizard. Answers stay local and never write progress, private answers, or analytics.
      </p>
      {message ? <p className="dashboard-inline-note">{message}</p> : null}
      <ActivityWizard
        activity={activity}
        enrollmentId="preview"
        status={status}
        initialResponses={savedResponses}
        programmeSlug={definition.slug}
        programmeVersion={definition.version}
        highUrgeThreshold={definition.dailyCheckIn?.highUrgeThreshold ?? 4}
        previewMode
        onPreviewComplete={(responses) => {
          setSavedResponses(responses);
          setStatus("completed");
          setMessage(
            next
              ? `Preview completed. Next activity would unlock: ${next.title}.`
              : "Preview completed. This would finish the programme journey.",
          );
        }}
      />
      {next ? (
        <p>
          <a className="button button-secondary button-small" href={`/admin/programmes/${definition.slug}/preview/${next.id}/`}>
            Preview next activity
          </a>
        </p>
      ) : null}
    </div>
  );
}
