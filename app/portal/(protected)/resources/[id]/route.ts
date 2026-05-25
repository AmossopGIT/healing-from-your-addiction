import { NextResponse } from "next/server";
import { markClientContentRead } from "@/lib/dashboard/notifications";
import { getAuthProfile, getClientProfileForUser } from "@/lib/supabase/auth";
import { createClient } from "@/lib/supabase/server";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(request: Request, { params }: RouteContext) {
  const { id } = await params;
  const profile = await getAuthProfile();

  if (!profile) {
    return NextResponse.redirect(new URL("/portal/login/", request.url));
  }

  const clientProfile = await getClientProfileForUser(profile.id);
  if (!clientProfile) {
    return NextResponse.redirect(new URL("/portal/resources/?error=missing-profile", request.url));
  }

  const supabase = await createClient();
  const { data: document } = await supabase
    .from("client_documents")
    .select("id, storage_path")
    .eq("id", id)
    .eq("client_profile_id", clientProfile.id)
    .maybeSingle();

  if (!document) {
    return NextResponse.redirect(new URL("/portal/resources/?error=not-found", request.url));
  }

  await markClientContentRead(clientProfile.id, "document", document.id);

  const { data, error } = await supabase.storage.from("client-documents").createSignedUrl(document.storage_path, 60);

  if (error || !data?.signedUrl) {
    return NextResponse.redirect(new URL("/portal/resources/?error=download-failed", request.url));
  }

  return NextResponse.redirect(data.signedUrl);
}
