"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

export type ProgrammeLibraryCard = {
  slug: string;
  title: string;
  category: "behavioral" | "substance";
  activityCount: number;
  enrolled: number;
  guideCount: number;
  expectedGuides: number;
  dbStatus: string;
  needsReview: boolean;
  validationLabel: string;
  validationTone: "ok" | "warn" | "error";
};

type FilterId = "all" | "behavioral" | "substance" | "missing-guides" | "needs-review";

const FILTERS: Array<{ id: FilterId; label: string }> = [
  { id: "all", label: "All" },
  { id: "behavioral", label: "Behavioral" },
  { id: "substance", label: "Substance" },
  { id: "missing-guides", label: "Missing guides" },
  { id: "needs-review", label: "Needs review" },
];

type AdminProgrammeLibraryGridProps = {
  cards: ProgrammeLibraryCard[];
};

export function AdminProgrammeLibraryGrid({ cards }: AdminProgrammeLibraryGridProps) {
  const [filter, setFilter] = useState<FilterId>("all");

  const visible = useMemo(() => {
    return cards.filter((card) => {
      if (filter === "behavioral") return card.category === "behavioral";
      if (filter === "substance") return card.category === "substance";
      if (filter === "missing-guides") return card.guideCount < card.expectedGuides;
      if (filter === "needs-review") return card.needsReview || card.validationTone !== "ok";
      return true;
    });
  }, [cards, filter]);

  return (
    <section className="dashboard-panel">
      <div className="dashboard-panel-header">
        <h2>Programme catalogue</h2>
        <p className="dashboard-inline-note">
          {visible.length} of {cards.length} shown · one journey assigned per client
        </p>
      </div>

      <div className="admin-programme-filter-row" role="toolbar" aria-label="Filter programmes">
        {FILTERS.map((item) => (
          <button
            key={item.id}
            type="button"
            className={`admin-programme-filter-chip${filter === item.id ? " is-active" : ""}`}
            aria-pressed={filter === item.id}
            onClick={() => setFilter(item.id)}
          >
            {item.label}
          </button>
        ))}
      </div>

      {visible.length ? (
        <div className="admin-programme-card-grid">
          {visible.map((card) => (
            <Link key={card.slug} href={`/admin/programmes/${card.slug}/`} className="admin-programme-card">
              <div className="admin-programme-card-top">
                <h3>{card.title}</h3>
                <span className="admin-programme-chip">{card.category}</span>
              </div>
              <div className="admin-programme-card-chips">
                <span
                  className={`admin-programme-chip admin-programme-chip-${card.dbStatus === "published" ? "ok" : "muted"}`}
                >
                  {card.dbStatus}
                </span>
                <span
                  className={`admin-programme-chip ${
                    card.guideCount >= card.expectedGuides ? "admin-programme-chip-ok" : "admin-programme-chip-warn"
                  }`}
                >
                  Guides {card.guideCount}/{card.expectedGuides}
                </span>
                {card.needsReview ? <span className="admin-programme-chip admin-programme-chip-warn">Needs review</span> : null}
                <span className={`admin-programme-chip admin-programme-chip-${card.validationTone}`}>
                  {card.validationLabel}
                </span>
              </div>
              <p className="admin-programme-card-meta">
                {card.activityCount} activities · {card.enrolled} enrolled
              </p>
            </Link>
          ))}
        </div>
      ) : (
        <p className="dashboard-empty">No programmes match this filter.</p>
      )}
    </section>
  );
}
