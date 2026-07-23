import { NextResponse } from "next/server";
import { getAdminClientBundle, getClientConsultation } from "@/lib/dashboard/queries";
import { createClient } from "@/lib/supabase/server";
import { getClientProfileForUser } from "@/lib/supabase/auth";

export const runtime = "nodejs";

type RouteContext = { params: Promise<{ id: string }> };

async function createSignedUploadUrl(clientProfileId: string, asAdmin: boolean) {
  const supabase = await createClient();
  const consultation = await getClientConsultation(clientProfileId);
  if (!consultation?.upload_storage_path) {
    return NextResponse.json({ error: "no-upload" }, { status: 404 });
  }

  if (!asAdmin) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    const clientProfile = await getClientProfileForUser(user.id);
    if (!clientProfile || clientProfile.id !== clientProfileId) {
      return NextResponse.json({ error: "forbidden" }, { status: 403 });
    }
  }

  const { data, error } = await supabase.storage
    .from("client-documents")
    .createSignedUrl(consultation.upload_storage_path, 60 * 10);

  if (error || !data?.signedUrl) {
    return NextResponse.json({ error: "sign-failed" }, { status: 500 });
  }

  return NextResponse.redirect(data.signedUrl);
}

export async function GET(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role === "admin") {
    const bundle = await getAdminClientBundle(id);
    if (!bundle) return NextResponse.json({ error: "not-found" }, { status: 404 });
    return createSignedUploadUrl(id, true);
  }

  if (profile?.role === "client") {
    const clientProfile = await getClientProfileForUser(user.id);
    if (!clientProfile || clientProfile.id !== id) {
      return NextResponse.json({ error: "forbidden" }, { status: 403 });
    }
    return createSignedUploadUrl(id, false);
  }

  return NextResponse.json({ error: "forbidden" }, { status: 403 });
}
