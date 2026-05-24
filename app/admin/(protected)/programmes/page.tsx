import type { Metadata } from "next";
import { SeedProgrammesButton } from "@/components/dashboard/SeedProgrammesButton";
import { createClient } from "@/lib/supabase/server";
import { createMetadata } from "@/lib/seo";

export const metadata: Metadata = createMetadata({
  title: "Programmes | Admin",
  description: "Programme templates.",
  path: "/admin/programmes/",
  noIndex: true,
});

export default async function AdminProgrammesPage() {
  const supabase = await createClient();
  const { data: templates } = await supabase.from("programme_templates").select("*").order("addiction_slug");

  return (
    <div className="dashboard-stack">
      <section className="dashboard-page-header">
        <p className="eyebrow">Programmes</p>
        <h1>Programme templates</h1>
        <p>Templates seeded from case-study content for each addiction focus.</p>
      </section>
      <SeedProgrammesButton />
      <section className="dashboard-panel">
        {templates?.length ? (
          <div className="dashboard-table-wrap">
            <table className="dashboard-table">
              <thead><tr><th>Title</th><th>Addiction</th><th>Sessions</th></tr></thead>
              <tbody>
                {templates.map((template) => (
                  <tr key={template.id}>
                    <td>{template.title}</td>
                    <td>{template.addiction_slug}</td>
                    <td>{template.session_count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="dashboard-empty">No templates yet. Use the seed button to import from case-study content.</p>
        )}
      </section>
    </div>
  );
}
