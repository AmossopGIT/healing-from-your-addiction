import { NextResponse } from "next/server";
import { buildConsultationAnswersPdf } from "@/lib/consultation/exportPdf";
import { getClientConsultation } from "@/lib/dashboard/queries";
import { createClient } from "@/lib/supabase/server";
import { getClientProfileForUser } from "@/lib/supabase/auth";

export const runtime = "nodejs";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { data: profile } = await supabase.from("profiles").select("role, full_name").eq("id", user.id).single();
  if (profile?.role !== "client") {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const clientProfile = await getClientProfileForUser(user.id);
  if (!clientProfile) {
    return NextResponse.json({ error: "not-found" }, { status: 404 });
  }

  const consultation = await getClientConsultation(clientProfile.id);
  if (!consultation) {
    return NextResponse.json({ error: "not-started" }, { status: 404 });
  }

  const pdf = buildConsultationAnswersPdf(consultation, profile.full_name ?? "Client");
  return new NextResponse(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": 'attachment; filename="consultation-answers.pdf"',
      "Cache-Control": "no-store",
    },
  });
}
