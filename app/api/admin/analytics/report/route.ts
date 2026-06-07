import { NextResponse } from "next/server";
import { parseAnalyticsRange } from "@/lib/analytics/types";
import { getAnalyticsReport } from "@/lib/analytics/providers";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
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

  const url = new URL(request.url);
  const range = parseAnalyticsRange(url.searchParams.get("range"));
  const source = url.searchParams.get("source") ?? "first_party";

  if (source !== "first_party" && source !== "ga4" && source !== "gsc") {
    return NextResponse.json({ error: "Invalid source." }, { status: 400 });
  }

  const result = await getAnalyticsReport(source, range);
  return NextResponse.json(result);
}
