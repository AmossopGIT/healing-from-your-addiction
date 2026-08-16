"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Background,
  Controls,
  MiniMap,
  ReactFlow,
  ReactFlowProvider,
  type Edge,
  type Node,
  type NodeMouseHandler,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

export type ConnectionOutlineItem = {
  id: string;
  label: string;
  detail: string;
  href: string;
  status?: "current" | "open" | "locked" | "done";
};

type AdminClientConnectionFlowProps = {
  clientName: string;
  adminName?: string;
  templateTitle: string | null;
  journeyLabel: string | null;
  liveSessionsLabel: string;
  docsLabel: string;
  outline: ConnectionOutlineItem[];
};

const palette = {
  cream: "#f7f3ea",
  teal: "#0f5b52",
  tealDark: "#0a3f39",
  gold: "#a87727",
  soft: "#e2eeea",
  ink: "#17231f",
};

function nodeStyle(kind: "client" | "admin" | "template" | "journey" | "sessions" | "docs", current = false) {
  const base = {
    borderRadius: 16,
    borderWidth: 2,
    fontWeight: 700,
    fontSize: 12,
    padding: 10,
    color: palette.ink,
    background: palette.cream,
    borderColor: palette.teal,
  };
  if (kind === "admin") return { ...base, background: palette.soft, borderColor: palette.tealDark };
  if (kind === "journey" || current) {
    return { ...base, background: "#f1e4cb", borderColor: palette.gold, color: palette.tealDark };
  }
  if (kind === "docs") return { ...base, background: "#fffdfa", borderColor: palette.gold };
  if (kind === "sessions") return { ...base, background: palette.soft };
  if (kind === "template") return { ...base, background: palette.teal, color: palette.cream, borderColor: palette.tealDark };
  return base;
}

export function AdminClientConnectionFlow({
  clientName,
  adminName = "Gerald",
  templateTitle,
  journeyLabel,
  liveSessionsLabel,
  docsLabel,
  outline,
}: AdminClientConnectionFlowProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [isNarrow, setIsNarrow] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(max-width: 768px)");
    const sync = () => {
      const matches = media.matches;
      setIsNarrow(matches);
      if (matches) setCollapsed(true);
    };
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  const initialNodes = useMemo<Node[]>(
    () => [
      {
        id: "admin",
        position: { x: 40, y: 40 },
        data: { label: adminName },
        style: nodeStyle("admin"),
      },
      {
        id: "client",
        position: { x: 280, y: 40 },
        data: { label: clientName },
        style: nodeStyle("client"),
      },
      {
        id: "template",
        position: { x: 160, y: 160 },
        data: { label: templateTitle ?? "No template" },
        style: nodeStyle("template"),
      },
      {
        id: "journey",
        position: { x: 40, y: 300 },
        data: { label: journeyLabel ? `Journey · ${journeyLabel}` : "Journey" },
        style: nodeStyle("journey", true),
      },
      {
        id: "sessions",
        position: { x: 280, y: 300 },
        data: { label: liveSessionsLabel },
        style: nodeStyle("sessions"),
      },
      {
        id: "docs",
        position: { x: 160, y: 420 },
        data: { label: docsLabel },
        style: nodeStyle("docs"),
      },
    ],
    [adminName, clientName, docsLabel, journeyLabel, liveSessionsLabel, templateTitle],
  );

  const initialEdges = useMemo<Edge[]>(
    () => [
      { id: "e-admin-client", source: "admin", target: "client", label: "supports", style: { stroke: palette.teal } },
      { id: "e-client-template", source: "client", target: "template", label: "assigned", style: { stroke: palette.teal } },
      { id: "e-template-journey", source: "template", target: "journey", label: "current step", style: { stroke: palette.gold } },
      { id: "e-template-sessions", source: "template", target: "sessions", label: "live", style: { stroke: palette.teal } },
      { id: "e-template-docs", source: "template", target: "docs", label: "released / locked", style: { stroke: palette.gold } },
    ],
    [],
  );

  const onNodeClick = useCallback<NodeMouseHandler>((_event, node) => {
    const target =
      node.id === "journey"
        ? "#journey"
        : node.id === "docs"
          ? "#docs"
          : node.id === "sessions"
            ? "#sessions"
            : node.id === "client"
              ? `#`
              : null;
    if (target === "#") {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    if (!target) return;
    const el = document.querySelector(target);
    el?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  return (
    <section className="admin-connection-flow dashboard-panel" id="connection-map">
      <div className="admin-connection-flow-header">
        <div>
          <p className="eyebrow">Connection map</p>
          <h2>Client check-in map</h2>
          <p className="dashboard-inline-note">
            Obsidian-style links between Gerald, this client, their template, journey, sessions, and guides.
          </p>
        </div>
        <button type="button" className="button button-small button-secondary" onClick={() => setCollapsed((value) => !value)}>
          {collapsed ? "Show outline" : "Hide outline"}
        </button>
      </div>
      <div className={`admin-connection-flow-layout${collapsed ? " is-collapsed" : ""}`}>
        {!collapsed ? (
          <nav className="admin-connection-outline" aria-label="Connection outline">
            <ul>
              {outline.map((item) => (
                <li key={item.id} className={item.status ? `is-${item.status}` : undefined}>
                  <a href={item.href}>
                    <strong>{item.label}</strong>
                    <span>{item.detail}</span>
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        ) : null}
        <div className="admin-connection-flow-canvas">
          <ReactFlowProvider>
            <ReactFlow
              defaultNodes={initialNodes}
              defaultEdges={initialEdges}
              fitView
              minZoom={0.4}
              maxZoom={1.6}
              onNodeClick={onNodeClick}
              proOptions={{ hideAttribution: true }}
            >
              <Background color="#e2eeea" gap={18} />
              <Controls showInteractive={false} />
              {!isNarrow ? (
                <MiniMap
                  pannable
                  zoomable
                  nodeColor={() => palette.teal}
                  maskColor="rgba(247, 243, 234, 0.7)"
                />
              ) : null}
            </ReactFlow>
          </ReactFlowProvider>
        </div>
      </div>
    </section>
  );
}
