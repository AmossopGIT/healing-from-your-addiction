import { createClient } from "@/lib/supabase/server";
import { computeAbstinenceDays, computeEngagementStreak, countPausesThisWeek } from "@/lib/portal/engagementStreak";
import type { ClientDailyCheckIn, ClientRecoveryGoal } from "@/types/database";

export type ClientEngagementSummary = {
  engagementStreak: number;
  pauseCountThisWeek: number;
  abstinenceDays: number;
  showAbstinence: boolean;
  lastCheckIn: ClientDailyCheckIn | null;
  recentCheckIns: ClientDailyCheckIn[];
};

export async function getClientEngagementSummary(clientProfileId: string, userId: string): Promise<ClientEngagementSummary> {
  const supabase = await createClient();

  const [{ data: checkIns }, { data: recoveryGoal }, { data: messages }, { data: intake }] = await Promise.all([
    supabase
      .from("client_daily_check_ins")
      .select("*")
      .eq("client_profile_id", clientProfileId)
      .order("check_in_date", { ascending: false })
      .limit(14),
    supabase.from("client_recovery_goals").select("*").eq("client_profile_id", clientProfileId).maybeSingle(),
    supabase
      .from("client_messages")
      .select("created_at, author_id")
      .eq("client_profile_id", clientProfileId)
      .eq("author_id", userId)
      .order("created_at", { ascending: false })
      .limit(20),
    supabase
      .from("client_intake_submissions")
      .select("updated_at")
      .eq("client_profile_id", clientProfileId)
      .maybeSingle(),
  ]);

  const recentCheckIns = (checkIns ?? []) as ClientDailyCheckIn[];
  const goal = (recoveryGoal ?? null) as ClientRecoveryGoal | null;
  const activityDates = [
    ...recentCheckIns.map((checkIn) => checkIn.check_in_date),
    ...(messages ?? []).map((message) => message.created_at),
  ];
  if (intake?.updated_at) activityDates.push(intake.updated_at);

  return {
    engagementStreak: computeEngagementStreak(activityDates),
    pauseCountThisWeek: countPausesThisWeek(recentCheckIns),
    abstinenceDays: goal?.show_abstinence_counter ? computeAbstinenceDays(goal.abstinence_start_date) : 0,
    showAbstinence: Boolean(goal?.show_abstinence_counter),
    lastCheckIn: recentCheckIns[0] ?? null,
    recentCheckIns,
  };
}
