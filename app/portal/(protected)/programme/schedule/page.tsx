import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { saveEnrollmentSchedule } from "@/lib/dashboard/scheduleActions";
import { getAuthProfile } from "@/lib/supabase/auth";
import { getClientEnrollmentBundle } from "@/lib/dashboard/queries";
import {
  computeFirstSessionAt,
  formatSessionDateShort,
  generateSessionDates,
  PROGRAMME_SLOT_OPTIONS,
} from "@/lib/programme/schedule";
import { createMetadata } from "@/lib/seo";

export const metadata: Metadata = createMetadata({
  title: "Choose your session time | Client Portal",
  description: "Pick your Tuesday or Friday live coaching slot.",
  path: "/portal/programme/schedule/",
  noIndex: true,
});

type PageProps = {
  searchParams: Promise<{ error?: string }>;
};

const errorMessages: Record<string, string> = {
  "invalid-slot": "Please choose one of the four session times below.",
  "save-failed": "We could not save your schedule right now. Please try again.",
  "slot-full": "That coaching slot is currently full. Please choose another available time.",
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

  const liveSessionCount =
    (bundle.template?.session_count && bundle.template.session_count > 0
      ? bundle.template.session_count
      : null) ??
    (typeof bundle.template?.cadence_json === "object" &&
    bundle.template.cadence_json &&
    "liveSessionCount" in bundle.template.cadence_json &&
    typeof (bundle.template.cadence_json as { liveSessionCount?: unknown }).liveSessionCount === "number"
      ? Number((bundle.template.cadence_json as { liveSessionCount: number }).liveSessionCount)
      : 8);

  const startDate = bundle.enrollment.start_date;
  const slotPreviews = PROGRAMME_SLOT_OPTIONS.map((option) => {
    const firstSessionAt = computeFirstSessionAt({
      fromDate: startDate,
      weekday: option.weekday,
      timeSlot: option.timeSlot,
    });
    const dates = generateSessionDates(firstSessionAt, option.weekday, liveSessionCount);
    return { ...option, firstSessionAt, lastSessionAt: dates[dates.length - 1] };
  });

  return (
    <div className="dashboard-stack">
      <section className="dashboard-page-header">
        <p className="eyebrow">Step 1 of 1</p>
        <h1>Choose your live coaching time</h1>
        <p>
          Daily interactive programme activities are separate from optional live coaching sessions. This form books{" "}
          {liveSessionCount} live session{liveSessionCount === 1 ? "" : "s"} on Tuesdays and Fridays in South African
          time. Completed or past sessions stay fixed if you reschedule later.
        </p>
      </section>

      {error && errorMessages[error] ? (
        <p className="dashboard-inline-note dashboard-error-note">{errorMessages[error]}</p>
      ) : null}

      <section className="dashboard-panel">
        <form action={saveEnrollmentSchedule} className="dashboard-form">
          <fieldset className="programme-slot-fieldset">
            <legend className="programme-slot-legend">
              Available times
              <span>All times are South African time</span>
            </legend>

            <div className="programme-slot-grid">
              {slotPreviews.map((option, index) => (
                <label key={option.value} className="programme-slot-card">
                  <input
                    type="radio"
                    name="slot"
                    value={option.value}
                    required
                    defaultChecked={index === 0}
                  />
                  <span className="programme-slot-body">
                    <span className="programme-slot-title">{option.label}</span>
                    <span className="programme-slot-meta">
                      Starts {formatSessionDateShort(option.firstSessionAt)}
                    </span>
                    <span className="programme-slot-meta">
                      Ends {formatSessionDateShort(option.lastSessionAt)}
                    </span>
                  </span>
                </label>
              ))}
            </div>
          </fieldset>

          <div className="programme-slot-explainer">
            <h2>What to expect</h2>
            <ul>
              <li>
                <strong>Session 1 is 90 minutes.</strong> It is longer so there is room to talk properly.
              </li>
              <li>
                <strong>Sessions 2–8 are 45 minutes,</strong> twice a week for four weeks.
              </li>
              <li>
                <strong>You meet on Google Meet.</strong> The same link works for every session.
              </li>
              <li>
                <strong>You can change this later.</strong> Message Gerald and he will move your slot.
              </li>
            </ul>
          </div>

          <button type="submit" className="button button-primary">
            Confirm my sessions
          </button>
        </form>
      </section>

      <p className="dashboard-inline-note">
        <Link href="/portal/">Back to home</Link>
      </p>
    </div>
  );
}
