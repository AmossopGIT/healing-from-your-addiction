import { NextResponse } from "next/server";
import { backfillStaticContent } from "@/lib/cms/backfillStaticContent";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseServiceConfigured } from "@/lib/supabase/env";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (!isSupabaseServiceConfigured()) {
    return NextResponse.json({ error: "Supabase service role is not configured." }, { status: 503 });
  }

  let insertMissing = true;
  try {
    const body = await request.json();
    if (body && typeof body.insertMissing === "boolean") {
      insertMissing = body.insertMissing;
    }
  } catch {
    // Default insert-missing when body omitted.
  }

  try {
    const result = await backfillStaticContent({
      insertMissing,
      actorId: user.id,
    });

    return NextResponse.json({
      message: `Synced static content: ${result.blogInserted} blog posts and ${result.caseStudyInserted} case studies inserted (${result.blogSkipped} blogs skipped, ${result.caseStudySkipped} case studies skipped).`,
      ...result,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Backfill failed." },
      { status: 500 },
    );
  }
}
