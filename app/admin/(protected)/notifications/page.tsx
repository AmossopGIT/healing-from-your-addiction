import type { Metadata } from "next";
import { sendPushBroadcastAction } from "@/lib/pwa/actions";
import { isWebPushConfigured, webPushCategories } from "@/lib/pwa/push";
import { createMetadata } from "@/lib/seo";
import { isSupabaseServiceConfigured } from "@/lib/supabase/env";
import { createServiceClient } from "@/lib/supabase/service";

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export const metadata: Metadata = createMetadata({
  title: "Notifications | Admin Dashboard",
  description: "Send browser push notifications to subscribed visitors.",
  path: "/admin/notifications/",
  noIndex: true,
});

function readSingleParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function AdminNotificationsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const supabaseReady = isSupabaseServiceConfigured();
  const pushReady = isWebPushConfigured();

  const [subscriptions, recentLogs] = supabaseReady
    ? await Promise.all([
        createServiceClient()
          .from("web_push_subscriptions")
          .select("*")
          .eq("status", "active")
          .eq("consent_state", "subscribed")
          .order("created_at", { ascending: false }),
        createServiceClient().from("web_push_delivery_logs").select("*").order("created_at", { ascending: false }).limit(8),
      ])
    : [{ data: [] }, { data: [] }];

  const activeSubscriptions = subscriptions.data ?? [];
  const categoryCounts = webPushCategories.map((category) => ({
    ...category,
    count: activeSubscriptions.filter((subscription) => subscription.categories?.includes(category.id)).length,
  }));

  const sent = Number(readSingleParam(params.sent) ?? "0");
  const failed = Number(readSingleParam(params.failed) ?? "0");
  const total = Number(readSingleParam(params.total) ?? "0");
  const error = readSingleParam(params.error);

  return (
    <div className="dashboard-stack">
      <section className="dashboard-page-header">
        <p className="eyebrow">Notifications</p>
        <h1>Visitor browser notifications</h1>
        <p>Send respectful updates to people who explicitly subscribed from the public site.</p>
      </section>

      <section className="dashboard-stat-grid">
        <article className="dashboard-stat-card">
          <p className="dashboard-stat-label">Active subscriptions</p>
          <p className="dashboard-stat-value">{activeSubscriptions.length}</p>
        </article>
        {categoryCounts.map((category) => (
          <article key={category.id} className="dashboard-stat-card">
            <p className="dashboard-stat-label">{category.label}</p>
            <p className="dashboard-stat-value">{category.count}</p>
          </article>
        ))}
      </section>

      <section className="dashboard-panel">
        <div className="dashboard-panel-header">
          <h2>Send a broadcast</h2>
        </div>
        {!pushReady ? (
          <p className="dashboard-empty">
            Add `NEXT_PUBLIC_WEB_PUSH_PUBLIC_KEY`, `WEB_PUSH_PRIVATE_KEY`, and optionally `WEB_PUSH_SUBJECT` before
            sending notifications.
          </p>
        ) : null}
        {error ? (
          <p className="dashboard-empty">The last notification request could not be sent: {error.replace(/-/g, " ")}.</p>
        ) : null}
        {!error && total > 0 ? (
          <p className="dashboard-empty">
            Broadcast finished. Sent: <strong>{sent}</strong> of <strong>{total}</strong>. Failed: <strong>{failed}</strong>.
          </p>
        ) : null}
        <form action={sendPushBroadcastAction} className="dashboard-form">
          <label className="form-field">
            <span>Category</span>
            <select name="category" defaultValue="site_updates" required>
              {webPushCategories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.label}
                </option>
              ))}
            </select>
          </label>
          <label className="form-field">
            <span>Title</span>
            <input type="text" name="title" maxLength={80} placeholder="New addiction recovery guide available" required />
          </label>
          <label className="form-field">
            <span>Message</span>
            <textarea
              name="body"
              rows={4}
              maxLength={160}
              placeholder="Open the latest article or support update from Healing From Your Addiction."
              required
            />
          </label>
          <label className="form-field">
            <span>Target path</span>
            <input type="text" name="url" defaultValue="/blog/" placeholder="/blog/" required />
          </label>
          <button type="submit" className="button button-primary" disabled={!pushReady}>
            Send notification
          </button>
        </form>
      </section>

      <section className="dashboard-panel">
        <div className="dashboard-panel-header">
          <h2>Recent delivery log</h2>
        </div>
        {recentLogs.data?.length ? (
          <div className="dashboard-table-wrap">
            <table className="dashboard-table">
              <thead>
                <tr>
                  <th>Category</th>
                  <th>Title</th>
                  <th>Status</th>
                  <th>Target</th>
                </tr>
              </thead>
              <tbody>
                {recentLogs.data.map((entry) => (
                  <tr key={entry.id}>
                    <td>{entry.category.replace(/_/g, " ")}</td>
                    <td>{entry.title}</td>
                    <td>
                      <span className={`status-badge status-badge-${entry.status === "sent" ? "qualified" : "closed"}`}>
                        {entry.status}
                      </span>
                    </td>
                    <td>{entry.target_url}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="dashboard-empty">Notifications that you send from this page will appear here.</p>
        )}
      </section>
    </div>
  );
}
