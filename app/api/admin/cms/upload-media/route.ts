import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { isSupabaseServiceConfigured } from "@/lib/supabase/env";
import { sanitizeSlug } from "@/lib/cms/formValidation";

const mediaTypes = {
  image: new Map([
    ["image/png", "png"],
    ["image/jpeg", "jpg"],
    ["image/webp", "webp"],
  ]),
  video: new Map([
    ["video/mp4", "mp4"],
    ["video/webm", "webm"],
    ["video/quicktime", "mov"],
  ]),
  audio: new Map([
    ["audio/mpeg", "mp3"],
    ["audio/mp4", "m4a"],
    ["audio/wav", "wav"],
    ["audio/ogg", "ogg"],
    ["audio/webm", "webm"],
  ]),
} as const;

const maxUploadBytes = 50 * 1024 * 1024;

async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") return { error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  return { user };
}

export async function POST(request: Request) {
  const auth = await requireAdmin();
  if ("error" in auth && auth.error) return auth.error;

  const formData = await request.formData();
  const file = formData.get("file");
  const kind = String(formData.get("kind") ?? "") as keyof typeof mediaTypes;
  const slug = sanitizeSlug(String(formData.get("slug") ?? "")) || "blog-media";
  const extension = file instanceof File ? mediaTypes[kind]?.get(file.type) : undefined;

  if (!(file instanceof File) || !extension) {
    return NextResponse.json({ error: "Choose a supported image, video, or audio file." }, { status: 400 });
  }
  if (file.size > maxUploadBytes) {
    return NextResponse.json({ error: "Media files must be 50 MB or smaller." }, { status: 400 });
  }

  const safeName = `${slug}-${Date.now()}.${extension}`;
  const storagePath = `blog-media/${slug}/${safeName}`;
  const bytes = Buffer.from(await file.arrayBuffer());
  let src = `/uploads/blog-media/${safeName}`;

  if (isSupabaseServiceConfigured()) {
    const service = createServiceClient();
    const { error } = await service.storage.from("cms-artwork").upload(storagePath, bytes, {
      contentType: file.type,
      upsert: false,
    });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    src = service.storage.from("cms-artwork").getPublicUrl(storagePath).data.publicUrl;
  } else {
    try {
      const targetDir = path.join(process.cwd(), "public", "uploads", "blog-media");
      await mkdir(targetDir, { recursive: true });
      await writeFile(path.join(targetDir, safeName), bytes);
    } catch {
      return NextResponse.json({ error: "Could not save media locally or to storage." }, { status: 500 });
    }
  }

  return NextResponse.json({ src, type: file.type });
}
