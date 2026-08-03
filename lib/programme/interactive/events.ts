import { createClient } from "@/lib/supabase/server";

export type ProgrammeEventType =
  | "started"
  | "viewed"
  | "saved"
  | "completed"
  | "unlocked"
  | "skipped"
  | "paused"
  | "resumed"
  | "safety_flag"
  | "module_completed"
  | "programme_completed";

export async function recordProgrammeEvent(input: {
  enrollmentId: string;
  clientProfileId: string;
  programmeSlug?: string | null;
  programmeVersion?: number | null;
  moduleId?: string | null;
  activityId?: string | null;
  eventType: ProgrammeEventType;
  actorRole?: "client" | "admin" | "system";
  actorId?: string | null;
  idempotencyKey: string;
  metadata?: Record<string, unknown>;
  supabase?: Awaited<ReturnType<typeof createClient>>;
}) {
  const supabase = input.supabase ?? (await createClient());
  const { error } = await supabase.from("programme_activity_events").upsert(
    {
      enrollment_id: input.enrollmentId,
      client_profile_id: input.clientProfileId,
      programme_slug: input.programmeSlug ?? null,
      programme_version: input.programmeVersion ?? null,
      module_id: input.moduleId ?? null,
      activity_id: input.activityId ?? null,
      event_type: input.eventType,
      actor_role: input.actorRole ?? "client",
      actor_id: input.actorId ?? null,
      idempotency_key: input.idempotencyKey,
      metadata: input.metadata ?? {},
      occurred_at: new Date().toISOString(),
    },
    { onConflict: "idempotency_key", ignoreDuplicates: true },
  );

  if (error) {
    console.error("programme event write failed", error);
  }
}
