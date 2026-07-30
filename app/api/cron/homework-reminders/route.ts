import { NextResponse } from "next/server";
import { sendHomeworkReminderEmail } from "@/lib/email/homeworkReminderEmail";
import { createServiceClient } from "@/lib/supabase/service";
import { isSupabaseServiceConfigured } from "@/lib/supabase/env";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function todayIsoDate() {
  return new Date().toISOString().slice(0, 10);
}

function authorizeCron(request: Request) {
  const secret = process.env.CRON_SECRET?.trim();
  if (!secret) return false;
  const auth = request.headers.get("authorization");
  return auth === `Bearer ${secret}`;
}

export async function GET(request: Request) {
  if (!authorizeCron(request)) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  if (!isSupabaseServiceConfigured()) {
    return NextResponse.json({ ok: false, error: "Service not configured" }, { status: 503 });
  }

  const supabase = createServiceClient();
  const today = todayIsoDate();
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://healingfromyouraddiction.co.za").replace(/\/$/, "");
  const portalUrl = `${siteUrl}/portal/#daily-check-in`;

  const { data: enrollments } = await supabase
    .from("enrollments")
    .select("id, client_profile_id, template_id")
    .eq("status", "active");

  if (!enrollments?.length) {
    return NextResponse.json({ ok: true, reminded: 0 });
  }

  let reminded = 0;
  let skipped = 0;

  for (const enrollment of enrollments) {
    const { data: tasks } = await supabase
      .from("programme_homework_tasks")
      .select("id, task_type")
      .eq("template_id", enrollment.template_id)
      .eq("cadence", "daily")
      .in("task_type", ["eft_daily", "affirmations_daily"]);

    if (!tasks?.length) {
      skipped += 1;
      continue;
    }

    const taskIds = tasks.map((task) => task.id);
    const { data: entries } = await supabase
      .from("client_homework_entries")
      .select("task_id, completed")
      .eq("enrollment_id", enrollment.id)
      .eq("entry_date", today)
      .in("task_id", taskIds);

    const completedIds = new Set((entries ?? []).filter((entry) => entry.completed).map((entry) => entry.task_id));
    const incomplete = tasks.some((task) => !completedIds.has(task.id));
    if (!incomplete) {
      skipped += 1;
      continue;
    }

    const { data: clientProfile } = await supabase
      .from("client_profiles")
      .select("id, user_id")
      .eq("id", enrollment.client_profile_id)
      .maybeSingle();

    if (!clientProfile) {
      skipped += 1;
      continue;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("id", clientProfile.user_id)
      .maybeSingle();

    const { data: authUser } = await supabase.auth.admin.getUserById(clientProfile.user_id);
    const email = authUser.user?.email;
    if (!email) {
      skipped += 1;
      continue;
    }

    const result = await sendHomeworkReminderEmail({
      to: email,
      firstName: profile?.full_name?.split(" ")[0] ?? null,
      portalUrl,
    });

    if (result.ok) reminded += 1;
    else skipped += 1;
  }

  return NextResponse.json({ ok: true, reminded, skipped, date: today });
}
