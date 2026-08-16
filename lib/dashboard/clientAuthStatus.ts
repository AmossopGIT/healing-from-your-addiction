import { createServiceClient } from "@/lib/supabase/service";

/** Admin-only: whether invite password setup has been cleared on the auth user. */
export async function getClientPasswordSetupStatus(userId: string): Promise<boolean | null> {
  try {
    const service = createServiceClient();
    const { data, error } = await service.auth.admin.getUserById(userId);
    if (error || !data.user) return null;
    return data.user.user_metadata?.needs_password_setup !== true;
  } catch {
    return null;
  }
}
