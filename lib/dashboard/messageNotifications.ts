import { absoluteUrl, siteConfig } from "@/lib/constants";
import {
  sendClientMessageNotification,
  sendTherapistMessageNotification,
} from "@/lib/email/clientMessageNotifications";
import { isResendConfigured } from "@/lib/email/resend";
import { createServiceClient } from "@/lib/supabase/service";
import { isSupabaseServiceConfigured } from "@/lib/supabase/env";

type NotifySecureMessageInput = {
  clientProfileId: string;
  authorId: string;
  body: string;
};

export async function notifySecureMessageRecipients(input: NotifySecureMessageInput) {
  if (!isResendConfigured() || !isSupabaseServiceConfigured()) {
    return;
  }

  try {
    const service = createServiceClient();
    const [{ data: author }, { data: clientProfile }] = await Promise.all([
      service.from("profiles").select("role, full_name").eq("id", input.authorId).single(),
      service.from("client_profiles").select("user_id").eq("id", input.clientProfileId).single(),
    ]);

    if (!author || !clientProfile?.user_id) {
      return;
    }

    const { data: authUser } = await service.auth.admin.getUserById(clientProfile.user_id);
    const clientEmail = authUser.user?.email?.trim() ?? "";
    const clientName =
      authUser.user?.user_metadata?.full_name?.trim() ||
      authUser.user?.email?.trim() ||
      "Client";

    if (author.role === "client") {
      await sendTherapistMessageNotification({
        clientName,
        clientEmail,
        body: input.body,
        adminMessagesUrl: absoluteUrl(`/admin/clients/${input.clientProfileId}/messages/`),
      });
      return;
    }

    if (author.role === "admin" && clientEmail) {
      await sendClientMessageNotification({
        clientEmail,
        clientName,
        therapistName: author.full_name?.trim() || siteConfig.owner,
        body: input.body,
        portalMessagesUrl: absoluteUrl("/portal/messages/"),
      });
    }
  } catch (error) {
    console.error("Secure message notification failed:", error);
  }
}
