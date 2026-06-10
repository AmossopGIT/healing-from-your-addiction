import { submitDailyCheckIn } from "@/lib/portal/engagementActions";
import { dashboardFieldMaxLengths } from "@/lib/dashboard/formValidation";
import type { ClientDailyCheckIn, CheckInMood } from "@/types/database";

const moodOptions: Array<{ value: CheckInMood; label: string }> = [
  { value: "calm", label: "Calm" },
  { value: "steady", label: "Steady" },
  { value: "low", label: "Low" },
  { value: "anxious", label: "Anxious" },
  { value: "irritable", label: "Irritable" },
];

type PortalCheckInFormProps = {
  todayCheckIn: ClientDailyCheckIn | null;
};

export function PortalCheckInForm({ todayCheckIn }: PortalCheckInFormProps) {
  return (
    <form action={submitDailyCheckIn} className="portal-home-checkin-form dashboard-form">
      <input type="hidden" name="redirectTo" value="/portal/" />
      <fieldset className="portal-home-checkin-fieldset">
        <legend>Mood</legend>
        <div className="portal-home-mood-options">
          {moodOptions.map((option) => (
            <label key={option.value} className="portal-home-mood-option">
              <input
                type="radio"
                name="mood"
                value={option.value}
                defaultChecked={todayCheckIn?.mood === option.value || (!todayCheckIn && option.value === "steady")}
                required
              />
              <span>{option.label}</span>
            </label>
          ))}
        </div>
      </fieldset>
      <label className="form-field">
        <span>Craving level (0 = none, 5 = very strong)</span>
        <input
          type="range"
          name="cravingLevel"
          min={0}
          max={5}
          step={1}
          defaultValue={todayCheckIn?.craving_level ?? 2}
        />
      </label>
      <label className="form-field portal-home-checkbox-field">
        <input type="checkbox" name="pauseTaken" defaultChecked={todayCheckIn?.pause_taken ?? false} />
        <span>I paused instead of acting on the urge</span>
      </label>
      <label className="form-field">
        <span>Note (optional)</span>
        <textarea
          name="note"
          rows={2}
          maxLength={dashboardFieldMaxLengths.checkInNote}
          defaultValue={todayCheckIn?.note ?? ""}
          placeholder="What helped, or what felt hard today?"
        />
      </label>
      <button type="submit" className="button button-primary button-small">
        {todayCheckIn ? "Update today's check-in" : "Complete check-in"}
      </button>
    </form>
  );
}
