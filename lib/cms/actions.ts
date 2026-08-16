"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { blogPostBySlug, type BlogSection } from "@/content/blog";
import { caseStudyBySlug, type CaseStudyType } from "@/content/caseStudies";
import { buildBlogRow, buildCaseStudyRow } from "@/lib/cms/backfillStaticContent";
import {
  cmsFieldMaxLengths,
  sanitizeAddictionSlug,
  sanitizeBlogCategorySlug,
  sanitizeCaseStudyType,
  sanitizeHeroArtSrc,
  sanitizeOptionalMultiline,
  sanitizeOptionalText,
  sanitizeRequiredText,
  sanitizeScheduledFor,
  sanitizeSecondaryKeywordList,
  sanitizeSectionsJson,
  sanitizeSlug,
  sanitizeTagSlugList,
  sanitizeUuid,
  sanitizeWorkflowStatus,
} from "@/lib/cms/formValidation";
import { cmsBlogHeroArtId, cmsCaseStudyHeroArtId } from "@/lib/cms/mappers";
import { withDraftDefaults } from "@/lib/cms/draftDefaults";
import {
  canTransitionWorkflow,
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

export type CmsFormActionState = {
  error?: string;
  errors?: string[];
};

type ParsedBlogForm =
  | { error: string; errors?: string[] }
  | { input: PublishableBlogInput };
type ParsedCaseStudyForm =
  | { error: string; errors?: string[] }
  | { input: PublishableCaseStudyInput };

function validationFailure(errors: string[]): CmsFormActionState {
  return { error: errors.join(" "), errors };
}

function isUniqueSlugViolation(message: string) {
  const lower = message.toLowerCase();
  return lower.includes("duplicate key") || lower.includes("unique constraint") || lower.includes("cms_blog_posts_slug");
}

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
  const sectionsResult = sanitizeSectionsJson(sectionsRaw);
  if ("error" in sectionsResult) {
    return {
      error: sectionsResult.error,
      errors: sectionsResult.errors ?? [sectionsResult.error],
    } as const;
  }

  const slug = sanitizeSlug(String(formData.get("slug") ?? ""));
  const input: PublishableBlogInput = {
    slug,
    title: sanitizeRequiredText(String(formData.get("title") ?? ""), cmsFieldMaxLengths.title),
    description: sanitizeRequiredText(String(formData.get("description") ?? ""), cmsFieldMaxLengths.description),
    excerpt: sanitizeOptionalMultiline(String(formData.get("excerpt") ?? ""), cmsFieldMaxLengths.excerpt) ?? "",
    h1: sanitizeRequiredText(String(formData.get("h1") ?? ""), cmsFieldMaxLengths.h1),
    primaryKeyword: sanitizeRequiredText(String(formData.get("primaryKeyword") ?? ""), cmsFieldMaxLengths.keyword),
    secondaryKeywords: sanitizeSecondaryKeywordList(String(formData.get("secondaryKeywords") ?? "")),
    categorySlug: sanitizeBlogCategorySlug(String(formData.get("categorySlug") ?? "")),
    tagSlugs: sanitizeTagSlugList(String(formData.get("tagSlugs") ?? "")),
    sections: sectionsResult.sections,
    heroArtId: sanitizeRequiredText(String(formData.get("heroArtId") ?? cmsBlogHeroArtId(slug)), cmsFieldMaxLengths.heroArtId),
    heroArtSrc: sanitizeHeroArtSrc(String(formData.get("heroArtSrc") ?? "")),
    heroArtAlt: sanitizeOptionalMultiline(String(formData.get("heroArtAlt") ?? ""), cmsFieldMaxLengths.heroArtAlt) ?? "",
    metaTitle: sanitizeOptionalText(String(formData.get("metaTitle") ?? ""), cmsFieldMaxLengths.metaTitle),
    metaDescription: sanitizeOptionalMultiline(String(formData.get("metaDescription") ?? ""), cmsFieldMaxLengths.metaDescription),
    searchIntent: sanitizeOptionalText(String(formData.get("searchIntent") ?? ""), cmsFieldMaxLengths.searchIntent),
    conversionGoal: sanitizeOptionalText(String(formData.get("conversionGoal") ?? ""), cmsFieldMaxLengths.conversionGoal),
    ogImageAlt: sanitizeOptionalText(String(formData.get("ogImageAlt") ?? ""), cmsFieldMaxLengths.ogImageAlt),
  };

  return { input } as const;
}

function parseCaseStudyForm(formData: FormData): ParsedCaseStudyForm {
  const blogParsed = parseBlogForm(formData);
  if ("error" in blogParsed) {
    return { error: blogParsed.error, errors: blogParsed.errors };
  }

  const input: PublishableCaseStudyInput = {
    ...blogParsed.input,
    legacySlug: sanitizeSlug(String(formData.get("legacySlug") ?? blogParsed.input.slug)),
    caseStudyType: (sanitizeCaseStudyType(String(formData.get("caseStudyType") ?? "outcome")) || "outcome") as CaseStudyType,
    addictionSlug: sanitizeAddictionSlug(String(formData.get("addictionSlug") ?? "")),
    heroArtId: sanitizeRequiredText(
      String(formData.get("heroArtId") ?? cmsCaseStudyHeroArtId(blogParsed.input.slug)),
      cmsFieldMaxLengths.heroArtId,
    ),
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

export async function saveBlogPostDraft(
  _prevState: CmsFormActionState,
  formData: FormData,
): Promise<CmsFormActionState> {
  const { supabase, user } = await requireAdminUser();
  const parsed = parseBlogForm(formData);
  if ("error" in parsed) return { error: parsed.error, errors: parsed.errors };

  const validation = validateBlogDraft(parsed.input);
  if (!validation.ok) {
    return validationFailure(validation.errors);
  }

  const input = withDraftDefaults(parsed.input);
  const publishRequested = formData.get("workflowIntent") === "publish";
  if (publishRequested) {
    const publishValidation = validateBlogPublish(input);
    if (!publishValidation.ok) {
      return validationFailure(publishValidation.errors);
    }
  }
  const id = sanitizeUuid(String(formData.get("id") ?? ""));
  const workflowStatus: CmsWorkflowStatus = publishRequested ? "published" : "draft";
  const row = blogRowFromInput(input, user.id, workflowStatus);
  const publishFields = publishRequested
    ? { published_at: new Date().toISOString(), approved_by: user.id, scheduled_for: null }
    : {};

  if (id) {
    const { error } = await supabase.from("cms_blog_posts").update({ ...row, ...publishFields }).eq("id", id);
    if (error) {
      if (isUniqueSlugViolation(error.message)) {
        return validationFailure([
          `The slug “${input.slug}” is already used by another CMS post. Open that post to improve it, or choose a different slug.`,
        ]);
      }
      return { error: error.message };
    }
    await logAuditEvent({ userId: user.id, action: "cms_blog_update_draft", resourceType: "cms_blog_post", resourceId: id });
    if (publishRequested) {
      await recordWorkflowEvent(supabase, "blog_post", id, "draft", "published", user.id);
    }
    revalidateContentPaths();
    redirect(`/admin/content/blog/${id}/?saved=1`);
  }

  const { data: existingBySlug } = await supabase
    .from("cms_blog_posts")
    .select("id")
    .eq("slug", input.slug)
    .maybeSingle();
  if (existingBySlug?.id) {
    return validationFailure([
      `A CMS post with slug “${input.slug}” already exists. Open /admin/content/blog/${existingBySlug.id}/ to improve it instead of creating a duplicate.`,
    ]);
  }

  if (blogPostBySlug.has(input.slug)) {
    return validationFailure([
      `“${input.slug}” is already live from the site content files. Use Improve this article on the blog list instead of creating a new post.`,
    ]);
  }

  const { data, error } = await supabase
    .from("cms_blog_posts")
    .insert({ ...row, ...publishFields, created_by: user.id })
    .select("id")
    .single();

  if (error) {
    if (isUniqueSlugViolation(error.message)) {
      return validationFailure([
        `The slug “${input.slug}” is already used. Open the existing post from the blog list, or choose a different slug.`,
      ]);
    }
    return { error: error.message };
  }

  await logAuditEvent({ userId: user.id, action: "cms_blog_create_draft", resourceType: "cms_blog_post", resourceId: data.id });
  if (publishRequested) {
    await recordWorkflowEvent(supabase, "blog_post", data.id, null, "published", user.id);
  }
  revalidateContentPaths();
  redirect(`/admin/content/blog/${data.id}/?saved=1`);
}

export async function saveCaseStudyDraft(
  _prevState: CmsFormActionState,
  formData: FormData,
): Promise<CmsFormActionState> {
  const { supabase, user } = await requireAdminUser();
  const parsed = parseCaseStudyForm(formData);
  if ("error" in parsed) return { error: parsed.error, errors: parsed.errors };

  const validation = validateCaseStudyDraft(parsed.input);
  if (!validation.ok) {
    return validationFailure(validation.errors);
  }

  const blogDefaults = withDraftDefaults(parsed.input);
  const input: PublishableCaseStudyInput = {
    ...blogDefaults,
    legacySlug: parsed.input.legacySlug || blogDefaults.slug,
    caseStudyType: parsed.input.caseStudyType,
    addictionSlug: parsed.input.addictionSlug,
    heroArtId: parsed.input.heroArtId.trim() || cmsCaseStudyHeroArtId(blogDefaults.slug),
  };

  const id = sanitizeUuid(String(formData.get("id") ?? ""));
  const row = caseStudyRowFromInput(input, user.id, "draft");

  if (id) {
    const { error } = await supabase.from("cms_case_studies").update(row).eq("id", id);
    if (error) {
      if (isUniqueSlugViolation(error.message)) {
        return validationFailure([
          `The slug “${input.slug}” is already used by another CMS case study. Open that entry to improve it, or choose a different slug.`,
        ]);
      }
      return { error: error.message };
    }
    await logAuditEvent({ userId: user.id, action: "cms_case_study_update_draft", resourceType: "cms_case_study", resourceId: id });
    revalidateContentPaths();
    redirect(`/admin/content/case-studies/${id}/?saved=1`);
  }

  const { data: existingBySlug } = await supabase
    .from("cms_case_studies")
    .select("id")
    .eq("slug", input.slug)
    .maybeSingle();
  if (existingBySlug?.id) {
    return validationFailure([
      `A CMS case study with slug “${input.slug}” already exists. Open /admin/content/case-studies/${existingBySlug.id}/ to improve it instead of creating a duplicate.`,
    ]);
  }

  if (caseStudyBySlug.has(input.slug)) {
    return validationFailure([
      `“${input.slug}” is already live from the site content files. Use Improve this case study on the case study list instead of creating a new entry.`,
    ]);
  }

  const { data, error } = await supabase
    .from("cms_case_studies")
    .insert({ ...row, created_by: user.id })
    .select("id")
    .single();

  if (error) {
    if (isUniqueSlugViolation(error.message)) {
      return validationFailure([
        `The slug “${input.slug}” is already used. Open the existing case study from the list, or choose a different slug.`,
      ]);
    }
    return { error: error.message };
  }

  await logAuditEvent({ userId: user.id, action: "cms_case_study_create_draft", resourceType: "cms_case_study", resourceId: data.id });
  revalidateContentPaths();
  redirect(`/admin/content/case-studies/${data.id}/?saved=1`);
}

/** Open an existing CMS case study row, or create a draft clone from a static live study. */
export async function openCaseStudyForImprovement(formData: FormData): Promise<void> {
  const { supabase, user } = await requireAdminUser();
  const slug = sanitizeSlug(String(formData.get("slug") ?? ""));
  if (!slug) {
    redirect("/admin/content/case-studies/?error=" + encodeURIComponent("Missing case study slug."));
  }

  const { data: existing } = await supabase.from("cms_case_studies").select("id").eq("slug", slug).maybeSingle();
  if (existing?.id) {
    redirect(`/admin/content/case-studies/${existing.id}/`);
  }

  const staticStudy = caseStudyBySlug.get(slug);
  if (!staticStudy) {
    redirect(
      "/admin/content/case-studies/?error=" +
        encodeURIComponent(`No live case study found for slug “${slug}”. Create a new case study instead.`),
    );
  }

  const row = buildCaseStudyRow(staticStudy, user.id);
  const { data, error } = await supabase
    .from("cms_case_studies")
    .insert({ ...row, created_by: user.id, updated_by: user.id })
    .select("id")
    .single();

  if (error) {
    if (isUniqueSlugViolation(error.message)) {
      const { data: raced } = await supabase.from("cms_case_studies").select("id").eq("slug", slug).maybeSingle();
      if (raced?.id) redirect(`/admin/content/case-studies/${raced.id}/`);
    }
    redirect("/admin/content/case-studies/?error=" + encodeURIComponent(error.message));
  }

  await logAuditEvent({
    userId: user.id,
    action: "cms_case_study_open_for_improvement",
    resourceType: "cms_case_study",
    resourceId: data.id,
    metadata: { slug },
  });
  revalidateContentPaths();
  redirect(`/admin/content/case-studies/${data.id}/?imported=1`);
}

/** Open an existing CMS blog row, or create a draft clone from a static live post. */
export async function openBlogForImprovement(formData: FormData): Promise<void> {
  const { supabase, user } = await requireAdminUser();
  const slug = sanitizeSlug(String(formData.get("slug") ?? ""));
  if (!slug) {
    redirect("/admin/content/blog/?error=" + encodeURIComponent("Missing blog slug."));
  }

  const { data: existing } = await supabase.from("cms_blog_posts").select("id").eq("slug", slug).maybeSingle();
  if (existing?.id) {
    redirect(`/admin/content/blog/${existing.id}/`);
  }

  const staticPost = blogPostBySlug.get(slug);
  if (!staticPost) {
    redirect(
      "/admin/content/blog/?error=" +
        encodeURIComponent(`No live article found for slug “${slug}”. Create a new post instead.`),
    );
  }

  const row = buildBlogRow(staticPost, user.id);
  const { data, error } = await supabase
    .from("cms_blog_posts")
    .insert({ ...row, created_by: user.id, updated_by: user.id })
    .select("id")
    .single();

  if (error) {
    if (isUniqueSlugViolation(error.message)) {
      const { data: raced } = await supabase.from("cms_blog_posts").select("id").eq("slug", slug).maybeSingle();
      if (raced?.id) redirect(`/admin/content/blog/${raced.id}/`);
    }
    redirect("/admin/content/blog/?error=" + encodeURIComponent(error.message));
  }

  await logAuditEvent({
    userId: user.id,
    action: "cms_blog_open_for_improvement",
    resourceType: "cms_blog_post",
    resourceId: data.id,
    metadata: { slug },
  });
  revalidateContentPaths();
  redirect(`/admin/content/blog/${data.id}/?imported=1`);
}

async function transitionContentWorkflow(
  formData: FormData,
  contentType: "blog_post" | "case_study",
  adminPath: string,
): Promise<CmsFormActionState> {
  const { supabase, user } = await requireAdminUser();
  const id = sanitizeUuid(String(formData.get("id") ?? ""));
  const toStatus = sanitizeWorkflowStatus(String(formData.get("toStatus") ?? "")) as CmsWorkflowStatus;
  const notes = sanitizeOptionalMultiline(String(formData.get("notes") ?? ""), cmsFieldMaxLengths.workflowNotes);
  const rawScheduledFor = String(formData.get("scheduledFor") ?? "");
  const scheduledFor = sanitizeScheduledFor(rawScheduledFor);

  if (!id || !toStatus) return { error: "Missing content id or workflow status." };

  if (contentType === "blog_post") {
    const { data: existing, error: fetchError } = await supabase.from("cms_blog_posts").select("*").eq("id", id).single();
    if (fetchError || !existing) return { error: "Content not found." };

    const fromStatus = existing.workflow_status as CmsWorkflowStatus;
    if (!canTransitionWorkflow(fromStatus, toStatus)) {
      return { error: `Cannot move from ${fromStatus} to ${toStatus}.` };
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
        return validationFailure(publishValidation.errors);
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
      if (!rawScheduledFor.trim() || !scheduledFor) {
        return { error: "Scheduled publish date is required." };
      }
      updatePayload.scheduled_for = scheduledFor;
      updatePayload.approved_by = user.id;
    }

    if ((toStatus === "draft" || toStatus === "approved") && fromStatus === "scheduled") {
      updatePayload.scheduled_for = null;
    }

    const { error } = await supabase.from("cms_blog_posts").update(updatePayload).eq("id", id);
    if (error) return { error: error.message };

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
  if (fetchError || !existing) return { error: "Content not found." };

  const fromStatus = existing.workflow_status as CmsWorkflowStatus;
  if (!canTransitionWorkflow(fromStatus, toStatus)) {
    return { error: `Cannot move from ${fromStatus} to ${toStatus}.` };
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
      return validationFailure(publishValidation.errors);
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
    if (!rawScheduledFor.trim() || !scheduledFor) {
      return { error: "Scheduled publish date is required." };
    }
    updatePayload.scheduled_for = scheduledFor;
    updatePayload.approved_by = user.id;
  }

  if ((toStatus === "draft" || toStatus === "approved") && fromStatus === "scheduled") {
    updatePayload.scheduled_for = null;
  }

  const { error } = await supabase.from("cms_case_studies").update(updatePayload).eq("id", id);
  if (error) return { error: error.message };

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

export async function transitionBlogWorkflow(
  _prevState: CmsFormActionState,
  formData: FormData,
): Promise<CmsFormActionState> {
  return transitionContentWorkflow(formData, "blog_post", "/admin/content/blog/");
}

export async function transitionCaseStudyWorkflow(
  _prevState: CmsFormActionState,
  formData: FormData,
): Promise<CmsFormActionState> {
  return transitionContentWorkflow(formData, "case_study", "/admin/content/case-studies/");
}

export async function updateBlogFromForm(
  _prevState: CmsFormActionState,
  formData: FormData,
): Promise<CmsFormActionState> {
  const { supabase, user } = await requireAdminUser();
  const parsed = parseBlogForm(formData);
  const id = sanitizeUuid(String(formData.get("id") ?? ""));
  if ("error" in parsed) {
    return { error: parsed.error, errors: parsed.errors };
  }

  if (!id) {
    return { error: "Missing id" };
  }

  const validation = validateBlogDraft(parsed.input);
  if (!validation.ok) {
    return validationFailure(validation.errors);
  }

  const { data: existing } = await supabase.from("cms_blog_posts").select("workflow_status").eq("id", id).single();
  const input = withDraftDefaults(parsed.input);
  const existingStatus = (existing?.workflow_status as CmsWorkflowStatus) ?? "draft";
  const publishRequested = formData.get("workflowIntent") === "publish";
  if (publishRequested) {
    const publishValidation = validateBlogPublish(input);
    if (!publishValidation.ok) {
      return validationFailure(publishValidation.errors);
    }
  }
  const nextStatus: CmsWorkflowStatus = publishRequested ? "published" : existingStatus;
  const row = blogRowFromInput(input, user.id, nextStatus);
  const publishFields = publishRequested
    ? { published_at: new Date().toISOString(), approved_by: user.id, scheduled_for: null }
    : {};

  const { error } = await supabase.from("cms_blog_posts").update({ ...row, ...publishFields }).eq("id", id);
  if (error) {
    if (isUniqueSlugViolation(error.message)) {
      return validationFailure([
        `The slug “${input.slug}” is already used by another CMS post. Choose a different slug.`,
      ]);
    }
    return { error: error.message };
  }

  await logAuditEvent({ userId: user.id, action: "cms_blog_update", resourceType: "cms_blog_post", resourceId: id });
  if (publishRequested && existingStatus !== "published") {
    await recordWorkflowEvent(supabase, "blog_post", id, existingStatus, "published", user.id);
  }
  revalidateContentPaths();
  redirect(`/admin/content/blog/${id}/?saved=1`);
}

export async function updateCaseStudyFromForm(
  _prevState: CmsFormActionState,
  formData: FormData,
): Promise<CmsFormActionState> {
  const { supabase, user } = await requireAdminUser();
  const parsed = parseCaseStudyForm(formData);
  const id = sanitizeUuid(String(formData.get("id") ?? ""));
  if ("error" in parsed) {
    return { error: parsed.error, errors: parsed.errors };
  }

  if (!id) {
    return { error: "Missing id" };
  }

  const validation = validateCaseStudyDraft(parsed.input);
  if (!validation.ok) {
    return validationFailure(validation.errors);
  }

  const { data: existing } = await supabase.from("cms_case_studies").select("workflow_status").eq("id", id).single();
  const blogDefaults = withDraftDefaults(parsed.input);
  const input: PublishableCaseStudyInput = {
    ...blogDefaults,
    legacySlug: parsed.input.legacySlug || blogDefaults.slug,
    caseStudyType: parsed.input.caseStudyType,
    addictionSlug: parsed.input.addictionSlug,
    heroArtId: parsed.input.heroArtId.trim() || cmsCaseStudyHeroArtId(blogDefaults.slug),
  };
  const row = caseStudyRowFromInput(input, user.id, (existing?.workflow_status as CmsWorkflowStatus) ?? "draft");

  const { error } = await supabase.from("cms_case_studies").update(row).eq("id", id);
  if (error) {
    if (isUniqueSlugViolation(error.message)) {
      return validationFailure([
        `The slug “${input.slug}” is already used by another CMS case study. Choose a different slug.`,
      ]);
    }
    return { error: error.message };
  }

  await logAuditEvent({ userId: user.id, action: "cms_case_study_update", resourceType: "cms_case_study", resourceId: id });
  revalidateContentPaths();
  redirect(`/admin/content/case-studies/${id}/?saved=1`);
}
