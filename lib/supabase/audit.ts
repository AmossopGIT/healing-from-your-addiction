import { createServiceClient } from "@/lib/supabase/service";
import { isSupabaseServiceConfigured } from "@/lib/supabase/env";

export async function logAuditEvent(input: {
  userId?: string | null;
  action: string;
  resourceType: string;
  resourceId?: string | null;
  metadata?: Record<string, unknown>;
}) {
  if (!isSupabaseServiceConfigured()) {
    return;
  }

  const supabase = createServiceClient();
  await supabase.from("audit_log").insert({
    user_id: input.userId ?? null,
    action: input.action,
    resource_type: input.resourceType,
    resource_id: input.resourceId ?? null,
    metadata: input.metadata ?? null,
  });
}
