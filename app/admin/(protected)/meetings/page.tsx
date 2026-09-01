import { redirect } from "next/navigation";

type PageProps = {
  searchParams: Promise<{ tab?: string; owner?: string }>;
};

export default async function AdminMeetingsRedirectPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const query = new URLSearchParams();
  if (params.tab) query.set("tab", params.tab);
  if (params.owner) query.set("owner", params.owner);
  const qs = query.toString();
  redirect(qs ? `/admin/planning/?${qs}` : "/admin/planning/");
}
