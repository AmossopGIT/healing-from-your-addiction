import { NextResponse } from "next/server";
import { seedInteractiveProgrammes } from "@/lib/dashboard/interactiveProgrammeSeed";
import { seedProgrammeTemplates } from "@/lib/dashboard/programmeSeed";
import { createClient } from "@/lib/supabase/server";

export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") {
    return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
  }

  const interactive = await seedInteractiveProgrammes({ publish: true });
  if (!interactive.ok) {
    return NextResponse.json({ ok: false, error: interactive.error }, { status: 503 });
  }

  // Keep gambling live-session scaffolding available where case-study content exists.
  const legacy = await seedProgrammeTemplates();

  return NextResponse.json({
    ...interactive,
    ok: true,
    templatesCreated: "templatesCreated" in legacy ? legacy.templatesCreated : 0,
    sessionsCreated: "sessionsCreated" in legacy ? legacy.sessionsCreated : 0,
    docsCreated: "docsCreated" in legacy ? legacy.docsCreated : 0,
    homeworkCreated: "homeworkCreated" in legacy ? legacy.homeworkCreated : 0,
  });
}
