"use server";

import { getMeetingActionById } from "@/content/meetings/catalog";
import type { MeetingActionStatus } from "@/content/meetings/types";
import { readMeetingActionStatusOverrides, writeMeetingActionStatusOverrides } from "@/lib/meetings/statusStore";
import { requireAuthProfile } from "@/lib/supabase/auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

const allowedStatuses = new Set<MeetingActionStatus>(["open", "in_progress", "done"]);

function sanitizeTab(value: string) {
  if (value === "today" || value === "future" || value === "archive") return value;
  return "today";
}

function sanitizeOwner(value: string) {
  if (value === "gerald" || value === "andy" || value === "joint" || value === "all") return value;
  return "all";
}

export async function updateMeetingActionStatusForm(formData: FormData) {
  await requireAuthProfile("admin");

  const actionId = String(formData.get("actionId") ?? "").trim();
  const status = String(formData.get("status") ?? "").trim() as MeetingActionStatus;
  const tab = sanitizeTab(String(formData.get("tab") ?? "today"));
  const owner = sanitizeOwner(String(formData.get("owner") ?? "all"));

  const action = getMeetingActionById(actionId);
  if (!action || !allowedStatuses.has(status)) {
    redirect(`/admin/meetings/?tab=${tab}&owner=${owner}`);
  }

  const overrides = await readMeetingActionStatusOverrides();
  overrides[actionId] = status;
  await writeMeetingActionStatusOverrides(overrides);

  revalidatePath("/admin/meetings/");
  redirect(`/admin/meetings/?tab=${tab}&owner=${owner}`);
}
