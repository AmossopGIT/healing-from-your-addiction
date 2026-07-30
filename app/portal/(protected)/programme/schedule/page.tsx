import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { saveEnrollmentSchedule } from "@/lib/dashboard/scheduleActions";
import { getAuthProfile } from "@/lib/supabase/auth";
import { getClientEnrollmentBundle } from "@/lib/dashboard/queries";
import { PROGRAMME_TIME_SLOTS, PROGRAMME_WEEKDAYS, slotLabel } from "@/lib/programme/schedule";
import { createMetadata } from "@/lib/seo";

export const metadata: Metadata = createMetadata({
  title: "Choose your session time | Client Portal",
  description: "Pick your Tuesday or Friday programme slot.",
  path: "/portal/programme/schedule/",
  noIndex: true,
});

type PageProps = {
  searchParams: Promise<{ error?: string }>;
};

const errorMessages: Record<string, string> = {
  "invalid-slot": "Please choose one of the available session times.",
  "save-failed": "We could not save your schedule right now. Please try again.",
};

export default async function PortalProgrammeSchedulePage({ searchParams }: PageProps) {
  const { error } = await searchParams;
  const profile = await getAuthProfile();
  const bundle = profile ? await getClientEnrollmentBundle(profile.id) : null;

  if (!bundle?.enrollment) {
    redirect("/portal/programme/");
  }

  if (bundle.schedule) {
    redirect("/portal/programme/");
  }

  return (
    <div className="dashboard-stack">
      <section className="dashboard-page-header">
        <p className="eyebrow">Programme schedule</p>
        <h1>Choose your session time</h1>
        <p>
          Sessions run Tuesday and Friday for four weeks (eight sessions). Choose your first session day and clock
          time — you keep that Meet group for the whole programme. Session 1 is 90 minutes; sessions 2–8 are 45
          minutes.
        </p>
      </section>

      {error && errorMessages[error] ? (
        <p className="dashboard-inline-note dashboard-error-note">{errorMessages[error]}</p>
      ) : null}

      <section className="dashboard-panel">
        <ul className="dashboard-session-list">
          {PROGRAMME_WEEKDAYS.flatMap((day) =>
            PROGRAMME_TIME_SLOTS.map((slot) => (
              <li key={`${day.value}-${slot.value}`} className="dashboard-session-item">
                <div>
                  <strong>{slotLabel(day.value, slot.value)}</strong>
                  <p>Africa/Johannesburg</p>
                </div>
              </li>
            )),
          )}
        </ul>
        <form action={saveEnrollmentSchedule} className="dashboard-form">
          <label className="form-field">
            <span>First session day</span>
            <select name="weekday" required defaultValue="">
              <option value="" disabled>
                Select day
              </option>
              {PROGRAMME_WEEKDAYS.map((day) => (
                <option key={day.value} value={day.value}>
                  {day.label}
                </option>
              ))}
            </select>
          </label>
          <label className="form-field">
            <span>Time</span>
            <select name="timeSlot" required defaultValue="">
              <option value="" disabled>
                Select time
              </option>
              {PROGRAMME_TIME_SLOTS.map((slot) => (
                <option key={slot.value} value={slot.value}>
                  {slot.label}
                </option>
              ))}
            </select>
          </label>
          <button type="submit" className="button button-primary">
            Confirm schedule
          </button>
        </form>
        <p className="dashboard-inline-note">
          <Link href="/portal/">Back to home</Link>
        </p>
      </section>
    </div>
  );
}
