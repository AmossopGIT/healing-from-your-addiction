"use client";

import dynamic from "next/dynamic";
import type { CatalogueGraphEdge, CatalogueGraphNode } from "@/components/dashboard/AdminProgrammeCatalogGraph";

const CatalogGraph = dynamic(
  () =>
    import("@/components/dashboard/AdminProgrammeCatalogGraph").then((mod) => mod.AdminProgrammeCatalogGraph),
  {
    ssr: false,
    loading: () => <p className="dashboard-inline-note">Loading catalog map…</p>,
  },
);

type Props = {
  nodes: CatalogueGraphNode[];
  edges: CatalogueGraphEdge[];
};

export function AdminProgrammeCatalogGraphLazy(props: Props) {
  return <CatalogGraph {...props} />;
}
