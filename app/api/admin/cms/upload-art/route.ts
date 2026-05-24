import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { cmsBlogHeroArtId, cmsCaseStudyHeroArtId } from "@/lib/cms/mappers";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { isSupabaseServiceConfigured } from "@/lib/supabase/env";

const allowedMimeTypes = new Set(["image/png", "image/jpeg", "image/webp"]);

async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") {
    return { error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  }

  return { user };
}

export async function POST(request: Request) {
  const auth = await requireAdmin();
  if ("error" in auth && auth.error) return auth.error;

  const formData = await request.formData();
  const file = formData.get("file");
  const contentKind = String(formData.get("contentKind") ?? "");
  const slug = String(formData.get("slug") ?? "").trim();
  const alt = String(formData.get("alt") ?? "").trim();

  if (!(file instanceof File) || !slug) {
    return NextResponse.json({ error: "File and slug are required." }, { status: 400 });
  }

  if (!allowedMimeTypes.has(file.type)) {
    return NextResponse.json({ error: "Only PNG, JPEG, or WebP images are allowed." }, { status: 400 });
  }

  const heroArtId = contentKind === "case-study" ? cmsCaseStudyHeroArtId(slug) : cmsBlogHeroArtId(slug);
  const extension = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
  const filename = `art-watercolor-${heroArtId}.${extension}`;
  const bytes = Buffer.from(await file.arrayBuffer());

  let heroArtSrc = `/art/watercolor/${filename}`;

  if (isSupabaseServiceConfigured()) {
    const service = createServiceClient();
    const storagePath = `${heroArtId}/${filename}`;
    const { error: uploadError } = await service.storage.from("cms-artwork").upload(storagePath, bytes, {
      contentType: file.type,
      upsert: true,
    });

    if (uploadError) {
      return NextResponse.json({ error: uploadError.message }, { status: 500 });
    }

    const { data: publicUrl } = service.storage.from("cms-artwork").getPublicUrl(storagePath);
    heroArtSrc = publicUrl.publicUrl;
  } else {
    try {
      const targetDir = path.join(process.cwd(), "public", "art", "watercolor");
      await mkdir(targetDir, { recursive: true });
      await writeFile(path.join(targetDir, filename), bytes);
    } catch {
      return NextResponse.json({ error: "Could not save artwork locally or to storage." }, { status: 500 });
    }
  }

  return NextResponse.json({
    heroArtId,
    heroArtSrc,
    heroArtAlt: alt || `Minimal watercolor illustration for ${slug.replace(/-/g, " ")}.`,
  });
}
