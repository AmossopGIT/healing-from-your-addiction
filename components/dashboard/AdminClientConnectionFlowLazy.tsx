"use client";

import dynamic from "next/dynamic";
import type { ConnectionOutlineItem } from "@/components/dashboard/AdminClientConnectionFlow";

const ConnectionFlow = dynamic(
  () =>
    import("@/components/dashboard/AdminClientConnectionFlow").then((mod) => mod.AdminClientConnectionFlow),
  {
    ssr: false,
    loading: () => <p className="dashboard-inline-note">Loading connection map…</p>,
  },
);

type Props = {
  clientName: string;
  adminName?: string;
  templateTitle: string | null;
  journeyLabel: string | null;
  liveSessionsLabel: string;
  docsLabel: string;
  outline: ConnectionOutlineItem[];
};

export function AdminClientConnectionFlowLazy(props: Props) {
  return <ConnectionFlow {...props} />;
}
