import { NextResponse } from "next/server";
import { markClientContentRead } from "@/lib/dashboard/notifications";
import { getAuthProfile, getClientProfileForUser } from "@/lib/supabase/auth";

type ReadRequestBody = {
  contentId?: string;
  contentKind?: string;
};

export async function POST(request: Request) {
  const profile = await getAuthProfile();

  if (!profile) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const clientProfile = await getClientProfileForUser(profile.id);

  if (!clientProfile) {
    return NextResponse.json({ ok: false }, { status: 404 });
  }

  const body = (await request.json().catch(() => ({}))) as ReadRequestBody;
  const contentId = body.contentId?.trim();
  const contentKind =
    body.contentKind === "document" || body.contentKind === "session" || body.contentKind === "programme_doc"
      ? body.contentKind
      : null;

  if (!contentId || !contentKind) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  await markClientContentRead(clientProfile.id, contentKind, contentId);
  return NextResponse.json({ ok: true });
}
