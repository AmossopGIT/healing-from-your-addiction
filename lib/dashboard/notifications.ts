import { createClient } from "@/lib/supabase/server";
import type { PortalContentKind } from "@/types/database";

type ContentReceiptInput = {
  clientProfileId: string;
  contentKind: PortalContentKind;
  contentId: string;
  releasedAt?: string;
};

export async function markAdminMessagesRead(clientProfileId: string) {
  const supabase = await createClient();
  const { data: admins } = await supabase.from("profiles").select("id").eq("role", "admin");
  const adminIds = (admins ?? []).map((admin) => admin.id);

  if (!adminIds.length) {
    return;
  }

  await supabase
    .from("client_messages")
    .update({ read_at: new Date().toISOString() })
    .eq("client_profile_id", clientProfileId)
    .is("read_at", null)
    .in("author_id", adminIds);
}

export async function markClientContentRead(clientProfileId: string, contentKind: PortalContentKind, contentId: string) {
  const supabase = await createClient();
  await supabase
    .from("client_content_receipts")
    .update({ read_at: new Date().toISOString() })
    .eq("client_profile_id", clientProfileId)
    .eq("content_kind", contentKind)
    .eq("content_id", contentId)
    .is("read_at", null);
}

export async function upsertClientContentReceipts(receipts: ContentReceiptInput[]) {
  if (!receipts.length) {
    return;
  }

  const supabase = await createClient();
  await supabase.from("client_content_receipts").upsert(
    receipts.map((receipt) => ({
      client_profile_id: receipt.clientProfileId,
      content_kind: receipt.contentKind,
      content_id: receipt.contentId,
      released_at: receipt.releasedAt ?? new Date().toISOString(),
    })),
    { onConflict: "client_profile_id,content_kind,content_id" },
  );
}
