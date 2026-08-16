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
            "text-max-width": "72px",
            "font-size": "10px",
            "font-weight": 700,
            color: "#17231f",
            "background-color": "#e2eeea",
            "border-width": 2,
            "border-color": "#0f5b52",
            width: 44,
            height: 44,
            "text-valign": "bottom",
            "text-halign": "center",
            "text-margin-y": 8,
            "min-zoomed-font-size": 8,
            "text-background-color": "#f7f3ea",
            "text-background-opacity": 0.92,
            "text-background-padding": "2px",
            "text-background-shape": "roundrectangle",
          },
        },
        {
          selector: 'node[kind = "programme"]',
          style: {
            "background-color": "#0f5b52",
            color: "#0a3f39",
            "border-color": "#0a3f39",
            width: 52,
            height: 52,
            "font-size": "11px",
            "text-max-width": "88px",
          },
        },
        {
          selector: 'node[kind = "hub"]',
          style: {
            "background-color": "#a87727",
            "border-color": "#a87727",
            color: "#5c3d12",
            width: 70,
            height: 70,
            "font-size": "12px",
            "text-max-width": "100px",
          },
        },
        {
          selector: 'node[kind = "interactive"]',
          style: {
            "background-color": "#7eb8b0",
            "border-color": "#0f5b52",
            width: 36,
            height: 36,
            "font-size": "9px",
            "text-max-width": "56px",
          },
        },
        {
          selector: 'node[kind = "doc"]',
          style: {
            "background-color": "#f1e4cb",
            "border-color": "#a87727",
            shape: "round-rectangle",
            width: 48,
            height: 34,
            "font-size": "9px",
            "text-max-width": "64px",
          },
        },
        {
          selector: "edge",
          style: {
            width: 1.25,
            "line-color": "#0f5b52",
            "target-arrow-color": "#0f5b52",
            "target-arrow-shape": "triangle",
            "curve-style": "bezier",
            opacity: 0.4,
            // Hide edge labels — they collide with node labels at this scale.
            label: "",
          },
        },
      ],
      layout: {
        name: "cose-bilkent",
        animate: false,
        randomize: true,
        fit: true,
        padding: 48,
        nodeDimensionsIncludeLabels: true,
        // Spread the 23×(programme+journey+guides) graph so labels do not stack.
        idealEdgeLength: 140,
        edgeElasticity: 0.2,
        nodeRepulsion: 12000,
        gravity: 0.15,
        nestingFactor: 0.05,
        numIter: 5000,
        tile: true,
        tilingPaddingVertical: 36,
        tilingPaddingHorizontal: 36,
      } as cytoscape.LayoutOptions,
      userZoomingEnabled: true,
      userPanningEnabled: true,
      boxSelectionEnabled: false,
      minZoom: 0.25,
      maxZoom: 2.5,
    });

    cy.on("tap", "node", (event) => {
      const href = event.target.data("href") as string;
      if (href) router.push(href);
    });

    // After layout settles, fit with generous padding so labels at edges stay visible.
    cy.one("layoutstop", () => {
      cy.fit(undefined, 56);
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
        <p className="dashboard-inline-note">
          Drag to pan · scroll to zoom · click a programme node to open it. Guides are grouped (one node per
          programme) to avoid overlap.
        </p>
        <button
          type="button"
          className="button button-small button-secondary"
          onClick={() => cyRef.current?.fit(undefined, 56)}
        >
          Fit view
        </button>
      </div>
      <div ref={containerRef} className="admin-catalog-graph-canvas" role="img" aria-label="Programme catalog connection map" />
    </div>
  );
}
