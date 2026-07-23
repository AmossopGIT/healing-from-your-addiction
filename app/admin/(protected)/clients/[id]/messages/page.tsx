import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { dashboardFieldMaxLengths } from "@/lib/dashboard/formValidation";
import { sendClientMessage } from "@/lib/dashboard/programmeActions";
import { getAdminClientBundle, getClientMessages } from "@/lib/dashboard/queries";
import { formatDashboardDate } from "@/lib/dashboard/constants";
import { createMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type PageProps = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  return createMetadata({
    title: "Client messages | Admin",
    description: "Client messages.",
    path: `/admin/clients/${id}/messages/`,
    noIndex: true,
  });
}

export default async function AdminClientMessagesPage({ params }: PageProps) {
  const { id } = await params;
  const bundle = await getAdminClientBundle(id);
  if (!bundle) notFound();
  const messages = await getClientMessages(id);

  return (
    <div className="dashboard-stack">
      <section className="dashboard-page-header">
        <p className="eyebrow">Messages</p>
        <h1>Secure messages</h1>
        <p>
          The client receives an email when you reply. You receive an email when they message you.{" "}
          <Link href={`/admin/clients/${id}/`}>Back to client</Link>
        </p>
      </section>
      <section className="dashboard-panel">
        <form action={sendClientMessage} className="dashboard-note-form">
          <input type="hidden" name="clientProfileId" value={id} />
          <input type="hidden" name="redirectTo" value={`/admin/clients/${id}/messages/`} />
          <label className="form-field">
            <span>Message to client</span>
            <textarea name="body" rows={4} maxLength={dashboardFieldMaxLengths.messageBody} required />
          </label>
          <button type="submit" className="button button-primary">
            Send message
          </button>
        </form>
        <ul className="dashboard-message-list">
          {messages.map((message) => (
            <li
              key={message.id}
              className={(message.profiles as { role?: string } | null)?.role === "admin" ? "message-admin" : "message-client"}
            >
              <p>{message.body}</p>
              <p className="dashboard-note-meta">
                {(message.profiles as { full_name?: string | null; role?: string } | null)?.full_name ?? "User"} ·{" "}
                {formatDashboardDate(message.created_at)}
              </p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
