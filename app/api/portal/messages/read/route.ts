import { NextResponse } from "next/server";
import { markAdminMessagesRead } from "@/lib/dashboard/notifications";
import { getAuthProfile, getClientProfileForUser } from "@/lib/supabase/auth";

export async function POST() {
  const profile = await getAuthProfile();

  if (!profile) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const clientProfile = await getClientProfileForUser(profile.id);

  if (!clientProfile) {
    return NextResponse.json({ ok: false }, { status: 404 });
  }

  await markAdminMessagesRead(clientProfile.id);
  return NextResponse.json({ ok: true });
}
