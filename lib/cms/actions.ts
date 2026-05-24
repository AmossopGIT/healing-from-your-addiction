"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { BlogSection } from "@/content/blog";
import type { CaseStudyType } from "@/content/caseStudies";
import { cmsBlogHeroArtId, cmsCaseStudyHeroArtId } from "@/lib/cms/mappers";
import {
  canTransitionWorkflow,
  parseSecondaryKeywords,
  parseSectionsJson,
  parseTagSlugs,
  validateBlogDraft,
  validateBlogPublish,
  validateCaseStudyDraft,
  validateCaseStudyPublish,
  type PublishableBlogInput,
  type PublishableCaseStudyInput,
} from "@/lib/cms/validation";
import { createClient } from "@/lib/supabase/server";
import { logAuditEvent } from "@/lib/supabase/audit";
import type { CmsBlogPostRow, CmsCaseStudyRow, CmsWorkflowStatus } from "@/types/cms";

type ParsedBlogForm = { error: string } | { input: PublishableBlogInput };
type ParsedCaseStudyForm = { error: string } | { input: PublishableCaseStudyInput };

async function requireAdminUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login/");

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") redirect("/portal/");

  return { supabase, user };
}

function parseBlogForm(formData: FormData): ParsedBlogForm {
  const sectionsRaw = String(formData.get("sectionsJson") ?? "[]");
  const sectionsResult = parseSectionsJson(sectionsRaw);
  if ("error" in sectionsResult) {
    return { error: sectionsResult.error } as const;
  }

  const slug = String(formData.get("slug") ?? "").trim();
  const input: PublishableBlogInput = {
    slug,
    title: String(formData.get("title") ?? "").trim(),
    description: String(formData.get("description") ?? "").trim(),
    excerpt: String(formData.get("excerpt") ?? "").trim(),
    h1: String(formData.get("h1") ?? "").trim(),
    primaryKeyword: String(formData.get("primaryKeyword") ?? "").trim(),
    secondaryKeywords: parseSecondaryKeywords(String(formData.get("secondaryKeywords") ?? "")),
    categorySlug: String(formData.get("categorySlug") ?? "").trim(),
    tagSlugs: parseTagSlugs(String(formData.get("tagSlugs") ?? "")),
    sections: sectionsResult.sections,
    heroArtId: String(formData.get("heroArtId") ?? cmsBlogHeroArtId(slug)).trim(),
    heroArtSrc: String(formData.get("heroArtSrc") ?? "").trim(),
    heroArtAlt: String(formData.get("heroArtAlt") ?? "").trim(),
    metaTitle: String(formData.get("metaTitle") ?? "").trim() || null,
    metaDescription: String(formData.get("metaDescription") ?? "").trim() || null,
    searchIntent: String(formData.get("searchIntent") ?? "").trim() || null,
    conversionGoal: String(formData.get("conversionGoal") ?? "").trim() || null,
    ogImageAlt: String(formData.get("ogImageAlt") ?? "").trim() || null,
  };

  return { input } as const;
}

function parseCaseStudyForm(formData: FormData): ParsedCaseStudyForm {
  const blogParsed = parseBlogForm(formData);
  if ("error" in blogParsed) {
    return { error: blogParsed.error };
  }

  const input: PublishableCaseStudyInput = {
    ...blogParsed.input,
    legacySlug: String(formData.get("legacySlug") ?? blogParsed.input.slug).trim(),
    caseStudyType: String(formData.get("caseStudyType") ?? "outcome") as CaseStudyType,
    addictionSlug: String(formData.get("addictionSlug") ?? "").trim(),
    heroArtId: String(formData.get("heroArtId") ?? cmsCaseStudyHeroArtId(blogParsed.input.slug)).trim(),
  };

  return { input } as const;
}

function blogRowFromInput(input: PublishableBlogInput, userId: string, workflowStatus: CmsWorkflowStatus) {
  return {
    slug: input.slug,
    title: input.title,
    description: input.description,
    excerpt: input.excerpt,
    h1: input.h1,
    meta_title: input.metaTitle,
    meta_description: input.metaDescription,
    primary_keyword: input.primaryKeyword,
    secondary_keywords: input.secondaryKeywords,
    search_intent: input.searchIntent,
    conversion_goal: input.conversionGoal,
    canonical_path: null,
    noindex: false,
    og_image_alt: input.ogImageAlt,
    category_slug: input.categorySlug,
    tag_slugs: input.tagSlugs,
    sections: input.sections as BlogSection[],
    hero_art_id: input.heroArtId,
    hero_art_src: input.heroArtSrc,
    hero_art_alt: input.heroArtAlt,
    hero_art_prompt: String(input.heroArtId),
    hero_art_palette: ["#f7f3ea", "#17231f", "#0a3f39"],
    workflow_status: workflowStatus,
    updated_by: userId,
  };
}

function caseStudyRowFromInput(input: PublishableCaseStudyInput, userId: string, workflowStatus: CmsWorkflowStatus) {
  const blogBase = blogRowFromInput(input, userId, workflowStatus);
  const { category_slug: _categorySlug, ...shared } = blogBase;
  return {
    ...shared,
    legacy_slug: input.legacySlug,
    archive_page_id: input.slug,
    case_study_type: input.caseStudyType,
    addiction_slug: input.addictionSlug,
    hero_art_id: input.heroArtId,
  };
}

async function recordWorkflowEvent(
  supabase: Awaited<ReturnType<typeof createClient>>,
  contentType: "blog_post" | "case_study",
  contentId: string,
  fromStatus: CmsWorkflowStatus | null,
  toStatus: CmsWorkflowStatus,
  actorId: string,
  notes?: string,
) {
  await supabase.from("cms_workflow_events").insert({
    content_type: contentType,
    content_id: contentId,
    from_status: fromStatus,
    to_status: toStatus,
    notes: notes ?? null,
    actor_id: actorId,
  });
}

function revalidateContentPaths() {
  revalidatePath("/blog/");
  revalidatePath("/case-studies/");
  revalidatePath("/admin/content/");
  revalidatePath("/sitemap.xml");
}

export async function saveBlogPostDraft(formData: FormData) {
  const { supabase, user } = await requireAdminUser();
  const parsed = parseBlogForm(formData);
  if ("error" in parsed) redirect(`/admin/content/blog/new/?error=${encodeURIComponent(parsed.error)}`);

  const validation = validateBlogDraft(parsed.input);
  if (!validation.ok) {
    redirect(`/admin/content/blog/new/?error=${encodeURIComponent(validation.errors.join(" "))}`);
  }

  const id = String(formData.get("id") ?? "").trim();
  const row = blogRowFromInput(parsed.input, user.id, "draft");

  if (id) {
    const { error } = await supabase.from("cms_blog_posts").update(row).eq("id", id);
    if (error) redirect(`/admin/content/blog/${id}/?error=${encodeURIComponent(error.message)}`);
    await logAuditEvent({ userId: user.id, action: "cms_blog_update_draft", resourceType: "cms_blog_post", resourceId: id });
    revalidateContentPaths();
    redirect(`/admin/content/blog/${id}/?saved=1`);
  }

  const { data, error } = await supabase
    .from("cms_blog_posts")
    .insert({ ...row, created_by: user.id })
    .select("id")
    .single();

  if (error) redirect(`/admin/content/blog/new/?error=${encodeURIComponent(error.message)}`);

  await logAuditEvent({ userId: user.id, action: "cms_blog_create_draft", resourceType: "cms_blog_post", resourceId: data.id });
  revalidateContentPaths();
  redirect(`/admin/content/blog/${data.id}/?saved=1`);
}

export async function saveCaseStudyDraft(formData: FormData) {
  const { supabase, user } = await requireAdminUser();
  const parsed = parseCaseStudyForm(formData);
  if ("error" in parsed) redirect(`/admin/content/case-studies/new/?error=${encodeURIComponent(parsed.error)}`);

  const validation = validateCaseStudyDraft(parsed.input);
  if (!validation.ok) {
    redirect(`/admin/content/case-studies/new/?error=${encodeURIComponent(validation.errors.join(" "))}`);
  }

  const id = String(formData.get("id") ?? "").trim();
  const row = caseStudyRowFromInput(parsed.input, user.id, "draft");

  if (id) {
    const { error } = await supabase.from("cms_case_studies").update(row).eq("id", id);
    if (error) redirect(`/admin/content/case-studies/${id}/?error=${encodeURIComponent(error.message)}`);
    await logAuditEvent({ userId: user.id, action: "cms_case_study_update_draft", resourceType: "cms_case_study", resourceId: id });
    revalidateContentPaths();
    redirect(`/admin/content/case-studies/${id}/?saved=1`);
  }

  const { data, error } = await supabase
    .from("cms_case_studies")
    .insert({ ...row, created_by: user.id })
    .select("id")
    .single();

  if (error) redirect(`/admin/content/case-studies/new/?error=${encodeURIComponent(error.message)}`);

  await logAuditEvent({ userId: user.id, action: "cms_case_study_create_draft", resourceType: "cms_case_study", resourceId: data.id });
  revalidateContentPaths();
  redirect(`/admin/content/case-studies/${data.id}/?saved=1`);
}

async function transitionContentWorkflow(
  formData: FormData,
  contentType: "blog_post" | "case_study",
  adminPath: string,
) {
  const { supabase, user } = await requireAdminUser();
  const id = String(formData.get("id") ?? "").trim();
  const toStatus = String(formData.get("toStatus") ?? "") as CmsWorkflowStatus;
  const notes = String(formData.get("notes") ?? "").trim() || undefined;
  const scheduledFor = String(formData.get("scheduledFor") ?? "").trim();

  if (!id || !toStatus) redirect(adminPath);

  if (contentType === "blog_post") {
    const { data: existing, error: fetchError } = await supabase.from("cms_blog_posts").select("*").eq("id", id).single();
    if (fetchError || !existing) redirect(`${adminPath}${id}/?error=${encodeURIComponent("Content not found.")}`);

    const fromStatus = existing.workflow_status as CmsWorkflowStatus;
    if (!canTransitionWorkflow(fromStatus, toStatus)) {
      redirect(`${adminPath}${id}/?error=${encodeURIComponent(`Cannot move from ${fromStatus} to ${toStatus}.`)}`);
    }

    if (toStatus === "published" || toStatus === "scheduled") {
      const publishValidation = validateBlogPublish({
        slug: existing.slug,
        title: existing.title,
        description: existing.description,
        excerpt: existing.excerpt,
        h1: existing.h1,
        primaryKeyword: existing.primary_keyword,
        secondaryKeywords: existing.secondary_keywords,
        categorySlug: existing.category_slug,
        tagSlugs: existing.tag_slugs,
        sections: existing.sections,
        heroArtId: existing.hero_art_id,
        heroArtSrc: existing.hero_art_src,
        heroArtAlt: existing.hero_art_alt,
        metaTitle: existing.meta_title,
        metaDescription: existing.meta_description,
        searchIntent: existing.search_intent,
        conversionGoal: existing.conversion_goal,
        ogImageAlt: existing.og_image_alt,
      });

      if (!publishValidation.ok) {
        redirect(`${adminPath}${id}/?error=${encodeURIComponent(publishValidation.errors.join(" "))}`);
      }
    }

    const updatePayload: Partial<CmsBlogPostRow> = {
      workflow_status: toStatus,
      updated_by: user.id,
      review_notes: notes ?? existing.review_notes,
    };

    if (toStatus === "published") {
      updatePayload.published_at = new Date().toISOString();
      updatePayload.scheduled_for = null;
      updatePayload.approved_by = user.id;
    }

    if (toStatus === "scheduled") {
      if (!scheduledFor) {
        redirect(`${adminPath}${id}/?error=${encodeURIComponent("Scheduled publish date is required.")}`);
      }
      updatePayload.scheduled_for = new Date(scheduledFor).toISOString();
      updatePayload.approved_by = user.id;
    }

    const { error } = await supabase.from("cms_blog_posts").update(updatePayload).eq("id", id);
    if (error) redirect(`${adminPath}${id}/?error=${encodeURIComponent(error.message)}`);

    await recordWorkflowEvent(supabase, contentType, id, fromStatus, toStatus, user.id, notes);
    await logAuditEvent({
      userId: user.id,
      action: `cms_${contentType}_workflow_${toStatus}`,
      resourceType: contentType,
      resourceId: id,
      metadata: { fromStatus, toStatus, notes },
    });

    revalidateContentPaths();
    redirect(`${adminPath}${id}/?saved=1`);
  }

  const { data: existing, error: fetchError } = await supabase.from("cms_case_studies").select("*").eq("id", id).single();
  if (fetchError || !existing) redirect(`${adminPath}${id}/?error=${encodeURIComponent("Content not found.")}`);

  const fromStatus = existing.workflow_status as CmsWorkflowStatus;
  if (!canTransitionWorkflow(fromStatus, toStatus)) {
    redirect(`${adminPath}${id}/?error=${encodeURIComponent(`Cannot move from ${fromStatus} to ${toStatus}.`)}`);
  }

  if (toStatus === "published" || toStatus === "scheduled") {
    const publishValidation = validateCaseStudyPublish({
      slug: existing.slug,
      title: existing.title,
      description: existing.description,
      excerpt: existing.excerpt,
      h1: existing.h1,
      primaryKeyword: existing.primary_keyword,
      secondaryKeywords: existing.secondary_keywords,
      categorySlug: "",
      tagSlugs: existing.tag_slugs,
      sections: existing.sections,
      heroArtId: existing.hero_art_id,
      heroArtSrc: existing.hero_art_src,
      heroArtAlt: existing.hero_art_alt,
      metaTitle: existing.meta_title,
      metaDescription: existing.meta_description,
      searchIntent: existing.search_intent,
      conversionGoal: existing.conversion_goal,
      ogImageAlt: existing.og_image_alt,
      legacySlug: existing.legacy_slug,
      caseStudyType: existing.case_study_type,
      addictionSlug: existing.addiction_slug,
    });

    if (!publishValidation.ok) {
      redirect(`${adminPath}${id}/?error=${encodeURIComponent(publishValidation.errors.join(" "))}`);
    }
  }

  const updatePayload: Partial<CmsCaseStudyRow> = {
    workflow_status: toStatus,
    updated_by: user.id,
    review_notes: notes ?? existing.review_notes,
  };

  if (toStatus === "published") {
    updatePayload.published_at = new Date().toISOString();
    updatePayload.scheduled_for = null;
    updatePayload.approved_by = user.id;
  }

  if (toStatus === "scheduled") {
    if (!scheduledFor) {
      redirect(`${adminPath}${id}/?error=${encodeURIComponent("Scheduled publish date is required.")}`);
    }
    updatePayload.scheduled_for = new Date(scheduledFor).toISOString();
    updatePayload.approved_by = user.id;
  }

  const { error } = await supabase.from("cms_case_studies").update(updatePayload).eq("id", id);
  if (error) redirect(`${adminPath}${id}/?error=${encodeURIComponent(error.message)}`);

  await recordWorkflowEvent(supabase, contentType, id, fromStatus, toStatus, user.id, notes);
  await logAuditEvent({
    userId: user.id,
    action: `cms_${contentType}_workflow_${toStatus}`,
    resourceType: contentType,
    resourceId: id,
    metadata: { fromStatus, toStatus, notes },
  });

  revalidateContentPaths();
  redirect(`${adminPath}${id}/?saved=1`);
}

export async function transitionBlogWorkflow(formData: FormData) {
  await transitionContentWorkflow(formData, "blog_post", "/admin/content/blog/");
}

export async function transitionCaseStudyWorkflow(formData: FormData) {
  await transitionContentWorkflow(formData, "case_study", "/admin/content/case-studies/");
}

export async function updateBlogFromForm(formData: FormData) {
  const { supabase, user } = await requireAdminUser();
  const parsed = parseBlogForm(formData);
  const id = String(formData.get("id") ?? "").trim();
  if ("error" in parsed) {
    redirect(`/admin/content/blog/${id || "new"}/?error=${encodeURIComponent(parsed.error)}`);
  }

  if (!id) {
    redirect("/admin/content/blog/new/?error=Missing%20id");
  }

  const validation = validateBlogDraft(parsed.input);
  if (!validation.ok) {
    redirect(`/admin/content/blog/${id}/?error=${encodeURIComponent(validation.errors.join(" "))}`);
  }

  const { data: existing } = await supabase.from("cms_blog_posts").select("workflow_status").eq("id", id).single();
  const row = blogRowFromInput(parsed.input, user.id, (existing?.workflow_status as CmsWorkflowStatus) ?? "draft");

  const { error } = await supabase.from("cms_blog_posts").update(row).eq("id", id);
  if (error) redirect(`/admin/content/blog/${id}/?error=${encodeURIComponent(error.message)}`);

  await logAuditEvent({ userId: user.id, action: "cms_blog_update", resourceType: "cms_blog_post", resourceId: id });
  revalidateContentPaths();
  redirect(`/admin/content/blog/${id}/?saved=1`);
}

export async function updateCaseStudyFromForm(formData: FormData) {
  const { supabase, user } = await requireAdminUser();
  const parsed = parseCaseStudyForm(formData);
  const id = String(formData.get("id") ?? "").trim();
  if ("error" in parsed) {
    redirect(`/admin/content/case-studies/${id || "new"}/?error=${encodeURIComponent(parsed.error)}`);
  }

  if (!id) {
    redirect("/admin/content/case-studies/new/?error=Missing%20id");
  }

  const validation = validateCaseStudyDraft(parsed.input);
  if (!validation.ok) {
    redirect(`/admin/content/case-studies/${id}/?error=${encodeURIComponent(validation.errors.join(" "))}`);
  }

  const { data: existing } = await supabase.from("cms_case_studies").select("workflow_status").eq("id", id).single();
  const row = caseStudyRowFromInput(parsed.input, user.id, (existing?.workflow_status as CmsWorkflowStatus) ?? "draft");

  const { error } = await supabase.from("cms_case_studies").update(row).eq("id", id);
  if (error) redirect(`/admin/content/case-studies/${id}/?error=${encodeURIComponent(error.message)}`);

  await logAuditEvent({ userId: user.id, action: "cms_case_study_update", resourceType: "cms_case_study", resourceId: id });
  revalidateContentPaths();
  redirect(`/admin/content/case-studies/${id}/?saved=1`);
}
