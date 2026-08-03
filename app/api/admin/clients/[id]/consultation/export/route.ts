import { NextResponse } from "next/server";
import { buildConsultationAnswersPdf } from "@/lib/consultation/exportPdf";
import { getAdminClientBundle, getClientConsultation } from "@/lib/dashboard/queries";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const bundle = await getAdminClientBundle(id);
  if (!bundle) {
    return NextResponse.json({ error: "not-found" }, { status: 404 });
  }

  const consultation = await getClientConsultation(id);
  if (!consultation) {
    return NextResponse.json({ error: "not-started" }, { status: 404 });
  }

  const pdf = await buildConsultationAnswersPdf(consultation, bundle.profile?.full_name ?? "Client");
  return new NextResponse(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="consultation-${id.slice(0, 8)}.pdf"`,
      "Cache-Control": "no-store",
    },
  });
}
