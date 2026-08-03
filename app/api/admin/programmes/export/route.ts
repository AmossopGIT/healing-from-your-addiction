import { NextResponse } from "next/server";
import { getProgrammeReportingSummary, reportingRowsToCsv } from "@/lib/programme/interactive/reporting";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
  if (profile?.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const url = new URL(request.url);
  const programme = url.searchParams.get("programme");
  const from = url.searchParams.get("from");
  const to = url.searchParams.get("to");
  const rows = await getProgrammeReportingSummary({
    programmeSlug: programme,
    from,
    to,
  });
  const csv = reportingRowsToCsv(rows);

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="programme-reporting.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
