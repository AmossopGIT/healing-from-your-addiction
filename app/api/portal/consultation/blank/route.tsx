import { NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { ConsultationBlankPdf } from "@/lib/consultation/blankPdf";
import { getAuthProfile } from "@/lib/supabase/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const profile = await getAuthProfile();
  if (!profile) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const pdf = await renderToBuffer(<ConsultationBlankPdf />);

  return new NextResponse(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": 'attachment; filename="hfya-current-consultation-form.pdf"',
      "Cache-Control": "no-store",
    },
  });
}
