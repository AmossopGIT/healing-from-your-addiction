"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import cytoscape, { type Core, type ElementDefinition } from "cytoscape";
// @ts-expect-error no types shipped for layout extension
import coseBilkent from "cytoscape-cose-bilkent";

if (typeof window !== "undefined" && !(cytoscape as unknown as { __coseRegistered?: boolean }).__coseRegistered) {
  cytoscape.use(coseBilkent);
  (cytoscape as unknown as { __coseRegistered?: boolean }).__coseRegistered = true;
}

export type CatalogueGraphNode = {
  id: string;
  label: string;
  kind: "programme" | "doc" | "interactive" | "hub";
  href?: string;
  meta?: string;
};

export type CatalogueGraphEdge = {
  id: string;
  source: string;
  target: string;
  label?: string;
};

type AdminProgrammeCatalogGraphProps = {
  nodes: CatalogueGraphNode[];
  edges: CatalogueGraphEdge[];
};

export function AdminProgrammeCatalogGraph({ nodes, edges }: AdminProgrammeCatalogGraphProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const cyRef = useRef<Core | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (!containerRef.current) return;

    const elements: ElementDefinition[] = [
      ...nodes.map((node) => ({
        data: {
          id: node.id,
          label: node.label,
          kind: node.kind,
          href: node.href ?? "",
          meta: node.meta ?? "",
        },
      })),
      ...edges.map((edge) => ({
        data: {
          id: edge.id,
          source: edge.source,
          target: edge.target,
          label: edge.label ?? "",
        },
      })),
    ];

    const cy = cytoscape({
      container: containerRef.current,
      elements,
      style: [
        {
          selector: "node",
          style: {
            label: "data(label)",
            "text-wrap": "wrap",
            "text-max-width": "90px",
            "font-size": "11px",
            "font-weight": 700,
            color: "#17231f",
            "background-color": "#e2eeea",
            "border-width": 2,
            "border-color": "#0f5b52",
            width: 52,
            height: 52,
            "text-valign": "bottom",
            "text-margin-y": 6,
          },
        },
        {
          selector: 'node[kind = "programme"]',
          style: {
            "background-color": "#0f5b52",
            color: "#f7f3ea",
            "border-color": "#0a3f39",
            "text-outline-width": 2,
            "text-outline-color": "#0f5b52",
          },
        },
        {
          selector: 'node[kind = "hub"]',
          style: {
            "background-color": "#a87727",
            "border-color": "#a87727",
            color: "#fffdfa",
            width: 64,
            height: 64,
          },
        },
        {
          selector: 'node[kind = "doc"]',
          style: {
            "background-color": "#f1e4cb",
            "border-color": "#a87727",
            shape: "round-rectangle",
          },
        },
        {
          selector: "edge",
          style: {
            width: 1.5,
            "line-color": "#0f5b52",
            "target-arrow-color": "#0f5b52",
            "target-arrow-shape": "triangle",
            "curve-style": "bezier",
            opacity: 0.55,
            label: "data(label)",
            "font-size": "9px",
            color: "#17231f",
            "text-rotation": "autorotate",
          },
        },
      ],
      layout: {
        name: "cose-bilkent",
        animate: false,
        padding: 24,
        nodeDimensionsIncludeLabels: true,
      } as cytoscape.LayoutOptions,
      userZoomingEnabled: true,
      userPanningEnabled: true,
      boxSelectionEnabled: false,
    });

    cy.on("tap", "node", (event) => {
      const href = event.target.data("href") as string;
      if (href) router.push(href);
    });

    cyRef.current = cy;
    return () => {
      cy.destroy();
      cyRef.current = null;
    };
  }, [nodes, edges, router]);

  return (
    <div className="admin-catalog-graph">
      <div className="admin-catalog-graph-toolbar">
        <p className="dashboard-inline-note">Drag to pan · scroll to zoom · click a programme node to open it.</p>
        <button
          type="button"
          className="button button-small button-secondary"
          onClick={() => cyRef.current?.fit(undefined, 32)}
        >
          Fit view
        </button>
      </div>
      <div ref={containerRef} className="admin-catalog-graph-canvas" role="img" aria-label="Programme catalog connection map" />
    </div>
  );
}
