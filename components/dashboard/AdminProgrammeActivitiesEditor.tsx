"use client";

import Link from "next/link";
import { useActionState, useMemo, useState } from "react";
import type { ProgrammeActivity } from "@/content/interactiveProgrammes/types";
import {
  saveProgrammeActivitiesDraft,
  type ProgrammeDraftActionState,
} from "@/lib/dashboard/interactiveProgrammeActions";
import type { ActivityPatch } from "@/lib/programme/interactive/adminDraft";

type AdminProgrammeActivitiesEditorProps = {
  slug: string;
  activities: ProgrammeActivity[];
};

function buildPatches(activities: ProgrammeActivity[]): ActivityPatch[] {
  return activities.map((activity) => ({
    id: activity.id,
    title: activity.title,
    prompt: activity.prompt ?? "",
    affirmation: activity.affirmation ?? "",
    points: activity.points,
    fields: (activity.fields ?? []).map((field) => ({
      key: field.key,
      label: field.label,
      required: Boolean(field.required),
    })),
  }));
}

export function AdminProgrammeActivitiesEditor({ slug, activities: initialActivities }: AdminProgrammeActivitiesEditorProps) {
  const [activities, setActivities] = useState(() =>
    [...initialActivities].sort((a, b) => a.sortOrder - b.sortOrder),
  );
  const [actionState, formAction] = useActionState<ProgrammeDraftActionState, FormData>(
    saveProgrammeActivitiesDraft,
    {},
  );

  const activitiesJson = useMemo(() => JSON.stringify(buildPatches(activities)), [activities]);
  const formErrors = actionState.errors?.length
    ? actionState.errors
    : actionState.error
      ? [actionState.error]
      : [];

  function updateActivity(id: string, patch: Partial<ProgrammeActivity>) {
    setActivities((current) => current.map((activity) => (activity.id === id ? { ...activity, ...patch } : activity)));
  }

  function updateField(activityId: string, fieldKey: string, patch: { label?: string; required?: boolean }) {
    setActivities((current) =>
      current.map((activity) => {
        if (activity.id !== activityId || !activity.fields) return activity;
        return {
          ...activity,
          fields: activity.fields.map((field) =>
            field.key === fieldKey
              ? {
                  ...field,
                  label: patch.label !== undefined ? patch.label : field.label,
                  required: patch.required !== undefined ? patch.required : field.required,
                }
              : field,
          ),
        };
      }),
    );
  }

  return (
    <form action={formAction} className="dashboard-form admin-programme-activities-editor">
      <input type="hidden" name="slug" value={slug} />
      <textarea className="sr-only" name="activitiesJson" value={activitiesJson} readOnly aria-hidden="true" tabIndex={-1} />

      <p className="dashboard-inline-note">
        Edits save as an unpublished draft only. Activity id, origin, and type stay locked. Review resets to pending;
        enrolled clients keep their existing snapshot until you publish a new version.
      </p>

      {formErrors.length ? (
        <div className="cms-publish-blockers" role="alert">
          <p className="form-error">Could not save draft. Fix these and try again:</p>
          <ul>
            {formErrors.map((message) => (
              <li key={message}>{message}</li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="cms-form-actions">
        <button type="submit" className="button button-primary">
          Save draft activities
        </button>
      </div>

      <ul className="dashboard-session-list">
        {activities.map((activity) => (
          <li key={activity.id} className="dashboard-session-item">
            <details className="cms-section-details admin-programme-activity-details">
              <summary>
                <strong>{activity.title}</strong>
                <span className="dashboard-inline-note">
                  {" "}
                  · {activity.origin === "source" ? "Source content" : "Platform exercise"} · {activity.type} · week{" "}
                  {activity.weekNumber}
                  {activity.dayNumber ? ` · day ${activity.dayNumber}` : ""} · {activity.points} pts
                </span>
              </summary>
              <div className="cms-section-details-body">
                <p className="cms-field-help">
                  Locked id: <code>{activity.id}</code>
                </p>
                <label className="form-field">
                  <span>Title</span>
                  <input
                    value={activity.title}
                    maxLength={200}
                    onChange={(event) => updateActivity(activity.id, { title: event.target.value })}
                  />
                </label>
                <label className="form-field">
                  <span>Points (0–100)</span>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={activity.points}
                    onChange={(event) => updateActivity(activity.id, { points: Number(event.target.value) })}
                  />
                </label>
                <label className="form-field">
                  <span>Prompt</span>
                  <textarea
                    rows={3}
                    value={activity.prompt ?? ""}
                    onChange={(event) => updateActivity(activity.id, { prompt: event.target.value })}
                  />
                </label>
                <label className="form-field">
                  <span>Affirmation</span>
                  <textarea
                    rows={3}
                    value={activity.affirmation ?? ""}
                    onChange={(event) => updateActivity(activity.id, { affirmation: event.target.value })}
                  />
                </label>
                {(activity.fields ?? []).length ? (
                  <fieldset className="cms-fieldset">
                    <legend>Fields</legend>
                    {activity.fields!.map((field) => (
                      <div key={field.key} className="admin-programme-activity-field">
                        <p className="cms-field-help">
                          Field key <code>{field.key}</code> · {field.kind}
                        </p>
                        <label className="form-field">
                          <span>Label</span>
                          <input
                            value={field.label}
                            maxLength={200}
                            onChange={(event) => updateField(activity.id, field.key, { label: event.target.value })}
                          />
                        </label>
                        <label className="form-field">
                          <span>
                            <input
                              type="checkbox"
                              checked={Boolean(field.required)}
                              onChange={(event) =>
                                updateField(activity.id, field.key, { required: event.target.checked })
                              }
                            />{" "}
                            Required
                          </span>
                        </label>
                      </div>
                    ))}
                  </fieldset>
                ) : null}
                <p>
                  <Link href={`/admin/programmes/${slug}/preview/${activity.id}/`}>Preview as client</Link>
                </p>
              </div>
            </details>
          </li>
        ))}
      </ul>

      <div className="cms-form-actions">
        <button type="submit" className="button button-primary">
          Save draft activities
        </button>
      </div>
    </form>
  );
}
