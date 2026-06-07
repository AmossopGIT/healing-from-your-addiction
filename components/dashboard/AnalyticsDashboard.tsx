"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo, useState, useTransition } from "react";
import { AnalyticsPdfExport } from "@/components/dashboard/AnalyticsPdfExport";
import { formatEngagedDuration } from "@/lib/analytics/timeOnPage";
import type { AnalyticsBundle, AnalyticsRange } from "@/lib/analytics/types";
import { withBasePath } from "@/lib/basePath";

const RANGE_OPTIONS: Array<{ value: AnalyticsRange; label: string }> = [
  { value: 7, label: "7 days" },
  { value: 14, label: "14 days" },
  { value: 30, label: "30 days" },
  { value: 60, label: "60 days" },
  { value: 90, label: "90 days" },
  { value: null, label: "None" },
];

type AnalyticsTab = "site" | "ga4" | "gsc";

function formatShortDate(value: string) {
  return new Intl.DateTimeFormat("en-ZA", { month: "short", day: "numeric" }).format(new Date(value));
}

function rangeQueryValue(range: AnalyticsRange) {
  return range === null ? "none" : String(range);
}

export function AnalyticsDashboard({ initialBundle }: { initialBundle: AnalyticsBundle }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [bundle, setBundle] = useState(initialBundle);
  const [activeTab, setActiveTab] = useState<AnalyticsTab>("site");
  const [isPending, startTransition] = useTransition();

  const currentRange = bundle.range;

  const loadRange = useCallback(
    (range: AnalyticsRange) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("range", rangeQueryValue(range));
      router.replace(`${withBasePath("/admin/analytics/")}?${params.toString()}`);

      startTransition(async () => {
        const response = await fetch(
          withBasePath(`/api/admin/analytics/report/?range=${rangeQueryValue(range)}&source=first_party`),
        );
        const result = await response.json();
        if (result.status === "ok" && result.data) {
          setBundle(result.data as AnalyticsBundle);
        }
      });
    },
    [router, searchParams],
  );

  const chartColors = useMemo(
    () => ({
      teal: "#0f5b52",
      tealDark: "#0a3f39",
      gold: "#b1842f",
      muted: "#8aa29a",
    }),
    [],
  );

  const timeByPage = useMemo(
    () =>
      bundle.pageEngagement
        .filter((row) => row.timeSamples > 0)
        .sort((a, b) => b.avgTimeSeconds - a.avgTimeSeconds)
        .slice(0, 8)
        .map((row) => ({
          path: row.path.length > 32 ? `${row.path.slice(0, 32)}…` : row.path,
          avgTimeSeconds: row.avgTimeSeconds,
        })),
    [bundle.pageEngagement],
  );

  return (
    <div className="dashboard-stack">
      <section className="dashboard-page-header dashboard-analytics-header">
        <div>
          <p className="eyebrow">Analytics</p>
          <h1>Site activity</h1>
          <p>First-party analytics with consent-tier visibility. GA4 and Search Console connectors arrive next.</p>
        </div>
        <AnalyticsPdfExport bundle={bundle} disabled={isPending} />
      </section>

      <section className="dashboard-analytics-toolbar">
        <div className="dashboard-filter-row" role="tablist" aria-label="Analytics source">
          <button
            type="button"
            className={activeTab === "site" ? "dashboard-filter-active dashboard-filter-link" : "dashboard-filter-link"}
            onClick={() => setActiveTab("site")}
          >
            Site activity
          </button>
          <button
            type="button"
            className={activeTab === "ga4" ? "dashboard-filter-active dashboard-filter-link" : "dashboard-filter-link"}
            onClick={() => setActiveTab("ga4")}
          >
            GA4
          </button>
          <button
            type="button"
            className={activeTab === "gsc" ? "dashboard-filter-active dashboard-filter-link" : "dashboard-filter-link"}
            onClick={() => setActiveTab("gsc")}
          >
            Search Console
          </button>
        </div>

        {activeTab === "site" ? (
          <div className="dashboard-filter-row" aria-label="Date range">
            {RANGE_OPTIONS.map((option) => (
              <button
                key={option.label}
                type="button"
                className={
                  currentRange === option.value
                    ? "dashboard-filter-active dashboard-filter-link"
                    : "dashboard-filter-link"
                }
                onClick={() => loadRange(option.value)}
                disabled={isPending}
              >
                {option.label}
              </button>
            ))}
          </div>
        ) : null}
      </section>

      {activeTab !== "site" ? (
        <section className="dashboard-panel dashboard-analytics-placeholder">
          <h2>{activeTab === "ga4" ? "Google Analytics 4" : "Google Search Console"}</h2>
          <p>
            {activeTab === "ga4"
              ? "Connect GA4_PROPERTY_ID and a Google service account to pull live reporting data into this dashboard."
              : "Connect GSC_SITE_URL and Search Console credentials to surface queries, clicks, and impressions here."}
          </p>
          <p className="dashboard-inline-note">This build stores first-party events in Supabase and is ready for API wiring.</p>
        </section>
      ) : (
        <>
          {bundle.storageMessage ? (
            <section className="dashboard-panel dashboard-analytics-placeholder">
              <h2>Analytics storage</h2>
              <p>{bundle.storageMessage}</p>
            </section>
          ) : null}

          <section className="dashboard-stat-grid dashboard-stat-grid-6">
            <article className="dashboard-stat-card">
              <p className="dashboard-stat-label">Page views</p>
              <p className="dashboard-stat-value">{bundle.summary.pageViews.toLocaleString()}</p>
            </article>
            <article className="dashboard-stat-card">
              <p className="dashboard-stat-label">Sessions</p>
              <p className="dashboard-stat-value">{bundle.summary.sessions.toLocaleString()}</p>
            </article>
            <article className="dashboard-stat-card">
              <p className="dashboard-stat-label">Avg time on page</p>
              <p className="dashboard-stat-value dashboard-stat-value-sm">
                {formatEngagedDuration(bundle.summary.avgTimeOnPageSeconds)}
              </p>
            </article>
            <article className="dashboard-stat-card">
              <p className="dashboard-stat-label">Total engaged time</p>
              <p className="dashboard-stat-value dashboard-stat-value-sm">
                {formatEngagedDuration(bundle.summary.totalEngagedMinutes * 60)}
              </p>
            </article>
            <article className="dashboard-stat-card">
              <p className="dashboard-stat-label">Form submits</p>
              <p className="dashboard-stat-value">{bundle.summary.formSubmits.toLocaleString()}</p>
            </article>
            <article className="dashboard-stat-card">
              <p className="dashboard-stat-label">CTA clicks</p>
              <p className="dashboard-stat-value">{bundle.summary.ctaClicks.toLocaleString()}</p>
            </article>
          </section>

          <section className="dashboard-panel dashboard-chart-panel">
            <div className="dashboard-panel-header">
              <h2>Traffic over time</h2>
              <span className="dashboard-inline-note">{bundle.rangeLabel}</span>
            </div>
            <div className="dashboard-chart-wrap">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={bundle.dailySeries}>
                  <CartesianGrid stroke="#e2eeea" strokeDasharray="4 4" />
                  <XAxis dataKey="date" tickFormatter={formatShortDate} stroke="#5f6f68" fontSize={12} />
                  <YAxis stroke="#5f6f68" fontSize={12} allowDecimals={false} />
                  <Tooltip labelFormatter={(value) => formatShortDate(String(value))} />
                  <Legend />
                  <Line type="monotone" dataKey="pageViews" name="Page views" stroke={chartColors.teal} strokeWidth={2.5} dot={false} />
                  <Line type="monotone" dataKey="sessions" name="Sessions" stroke={chartColors.gold} strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="conversions" name="Conversions" stroke={chartColors.tealDark} strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </section>

          <section className="dashboard-two-col">
            <article className="dashboard-panel">
              <div className="dashboard-panel-header">
                <h2>Forms</h2>
                <span className="dashboard-inline-note">Starts, submits & drop-off by form</span>
              </div>
              <div className="dashboard-table-wrap">
                <table className="dashboard-table">
                  <thead>
                    <tr>
                      <th>Form</th>
                      <th>Starts</th>
                      <th>Attempts</th>
                      <th>Submits</th>
                      <th>Safety ack</th>
                      <th>Errors</th>
                      <th>Complete %</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bundle.forms.length ? (
                      bundle.forms.map((row) => (
                        <tr key={row.formKey}>
                          <td>{row.label}</td>
                          <td>{row.starts}</td>
                          <td>{row.submitAttempts}</td>
                          <td>{row.submits}</td>
                          <td>{row.safetyAcks}</td>
                          <td>{row.errors}</td>
                          <td>{row.completionRate}%</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={7}>No form activity yet.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </article>

            <article className="dashboard-panel dashboard-chart-panel">
              <div className="dashboard-panel-header">
                <h2>Form funnel</h2>
                <span className="dashboard-inline-note">All forms combined</span>
              </div>
              <div className="dashboard-chart-wrap dashboard-chart-wrap-short">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={bundle.funnel} layout="vertical" margin={{ left: 24, right: 16 }}>
                    <CartesianGrid stroke="#e2eeea" strokeDasharray="4 4" horizontal={false} />
                    <XAxis type="number" stroke="#5f6f68" fontSize={12} allowDecimals={false} />
                    <YAxis type="category" dataKey="label" stroke="#5f6f68" fontSize={12} width={120} />
                    <Tooltip formatter={(value, _name, item) => [`${value} (${item.payload.rate}%)`, "Count"]} />
                    <Bar dataKey="count" fill={chartColors.gold} radius={[0, 8, 8, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </article>
          </section>

          <section className="dashboard-panel">
            <div className="dashboard-panel-header">
              <h2>CTAs & contact actions</h2>
              <span className="dashboard-inline-note">Named buttons, WhatsApp, email, phone & programme cards</span>
            </div>
            <div className="dashboard-table-wrap">
              <table className="dashboard-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Type</th>
                    <th>Location</th>
                    <th>Clicks</th>
                  </tr>
                </thead>
                <tbody>
                  {bundle.ctas.length ? (
                    bundle.ctas.map((row) => (
                      <tr key={`${row.type}-${row.name}-${row.location}`}>
                        <td>{row.name}</td>
                        <td>{row.type}</td>
                        <td>{row.location}</td>
                        <td>{row.clicks}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4}>No CTA clicks recorded yet.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>

          <section className="dashboard-panel">
            <div className="dashboard-panel-header">
              <h2>Pages — views, time, clicks & scroll</h2>
              <span className="dashboard-inline-note">Engaged time pauses when the tab is hidden</span>
            </div>
            <div className="dashboard-table-wrap">
              <table className="dashboard-table">
                <thead>
                  <tr>
                    <th>Path</th>
                    <th>Type</th>
                    <th>Views</th>
                    <th>Avg time</th>
                    <th>Total time</th>
                    <th>Link clicks</th>
                    <th>Outbound</th>
                    <th>Scroll 75%+</th>
                    <th>Scroll 100%</th>
                  </tr>
                </thead>
                <tbody>
                  {bundle.pageEngagement.length ? (
                    bundle.pageEngagement.map((row) => (
                      <tr key={row.path}>
                        <td>{row.path}</td>
                        <td>{row.pageType ?? "—"}</td>
                        <td>{row.views}</td>
                        <td>{row.timeSamples ? formatEngagedDuration(row.avgTimeSeconds) : "—"}</td>
                        <td>{row.totalTimeSeconds ? formatEngagedDuration(row.totalTimeSeconds) : "—"}</td>
                        <td>{row.linkClicks}</td>
                        <td>{row.outboundClicks}</td>
                        <td>{row.scroll75}</td>
                        <td>{row.scroll100}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={9}>No page activity yet. Browse the public site to populate this table.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>

          {timeByPage.length ? (
            <section className="dashboard-panel dashboard-chart-panel">
              <div className="dashboard-panel-header">
                <h2>Time spent by page</h2>
                <span className="dashboard-inline-note">Average engaged time per visit</span>
              </div>
              <div className="dashboard-chart-wrap dashboard-chart-wrap-short">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={timeByPage} layout="vertical" margin={{ left: 24, right: 16 }}>
                    <CartesianGrid stroke="#e2eeea" strokeDasharray="4 4" horizontal={false} />
                    <XAxis type="number" stroke="#5f6f68" fontSize={12} allowDecimals={false} unit="s" />
                    <YAxis type="category" dataKey="path" stroke="#5f6f68" fontSize={11} width={140} />
                    <Tooltip
                      formatter={(value) => [formatEngagedDuration(Number(value)), "Avg time"]}
                      labelFormatter={(value) => String(value)}
                    />
                    <Bar dataKey="avgTimeSeconds" fill={chartColors.gold} radius={[0, 8, 8, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </section>
          ) : null}

          <section className="dashboard-two-col">
            <article className="dashboard-panel dashboard-chart-panel">
              <div className="dashboard-panel-header">
                <h2>Scroll depth</h2>
                <span className="dashboard-inline-note">Milestone reaches across all pages</span>
              </div>
              <div className="dashboard-chart-wrap dashboard-chart-wrap-short">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={bundle.scrollDepth}>
                    <CartesianGrid stroke="#e2eeea" strokeDasharray="4 4" />
                    <XAxis dataKey="milestone" tickFormatter={(value) => `${value}%`} stroke="#5f6f68" fontSize={12} />
                    <YAxis stroke="#5f6f68" fontSize={12} allowDecimals={false} />
                    <Tooltip formatter={(value) => [value, "Reached"]} labelFormatter={(value) => `${value}% depth`} />
                    <Bar dataKey="count" fill={chartColors.tealDark} radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </article>

            <article className="dashboard-panel">
              <div className="dashboard-panel-header">
                <h2>Top clicks</h2>
                <span className="dashboard-inline-note">Links people use most</span>
              </div>
              <div className="dashboard-table-wrap">
                <table className="dashboard-table">
                  <thead>
                    <tr>
                      <th>Label</th>
                      <th>Destination</th>
                      <th>Section</th>
                      <th>Clicks</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bundle.topLinks.length ? (
                      bundle.topLinks.map((row) => (
                        <tr key={`${row.label}-${row.destination}-${row.section}`}>
                          <td>{row.label}</td>
                          <td>{row.destination}</td>
                          <td>{row.section}</td>
                          <td>{row.clicks}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4}>No link clicks recorded yet.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </article>
          </section>

          <section className="dashboard-two-col">
            <article className="dashboard-panel">
              <div className="dashboard-panel-header">
                <h2>Top pages (conversions)</h2>
              </div>
              <div className="dashboard-table-wrap">
                <table className="dashboard-table">
                  <thead>
                    <tr>
                      <th>Path</th>
                      <th>Views</th>
                      <th>Conversions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bundle.topPages.length ? (
                      bundle.topPages.map((row) => (
                        <tr key={row.path}>
                          <td>{row.path}</td>
                          <td>{row.views}</td>
                          <td>{row.conversions}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={3}>No page data yet for this range.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </article>

            <article className="dashboard-panel">
              <div className="dashboard-panel-header">
                <h2>Top events</h2>
              </div>
              <div className="dashboard-table-wrap">
                <table className="dashboard-table">
                  <thead>
                    <tr>
                      <th>Event</th>
                      <th>Total</th>
                      <th>Essential</th>
                      <th>Analytics</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bundle.topEvents.length ? (
                      bundle.topEvents.map((row) => (
                        <tr key={row.event}>
                          <td>{row.event}</td>
                          <td>{row.count}</td>
                          <td>{row.essentialCount}</td>
                          <td>{row.analyticsCount}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4}>No events recorded yet.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </article>
          </section>

          <section className="dashboard-panel">
            <div className="dashboard-panel-header">
              <h2>Lead attribution</h2>
              <span className="dashboard-inline-note">From enquiry submissions</span>
            </div>
            <div className="dashboard-table-wrap">
              <table className="dashboard-table">
                <thead>
                  <tr>
                    <th>Source</th>
                    <th>Medium</th>
                    <th>Leads</th>
                    <th>Qualified / enrolled</th>
                  </tr>
                </thead>
                <tbody>
                  {bundle.attribution.length ? (
                    bundle.attribution.map((row) => (
                      <tr key={`${row.source}-${row.medium}`}>
                        <td>{row.source}</td>
                        <td>{row.medium}</td>
                        <td>{row.leads}</td>
                        <td>{row.conversions}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4}>No leads in this range.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>

          <section className="dashboard-panel dashboard-chart-panel">
            <div className="dashboard-panel-header">
              <h2>Consent split over time</h2>
              <span className="dashboard-inline-note">Pre-consent vs post-consent page views</span>
            </div>
            <div className="dashboard-chart-wrap">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={bundle.dailySeries}>
                  <CartesianGrid stroke="#e2eeea" strokeDasharray="4 4" />
                  <XAxis dataKey="date" tickFormatter={formatShortDate} stroke="#5f6f68" fontSize={12} />
                  <YAxis stroke="#5f6f68" fontSize={12} allowDecimals={false} />
                  <Tooltip labelFormatter={(value) => formatShortDate(String(value))} />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="preConsentViews"
                    name="Pre-consent"
                    stackId="consent"
                    stroke={chartColors.muted}
                    fill="#d8ded7"
                  />
                  <Area
                    type="monotone"
                    dataKey="postConsentViews"
                    name="Post-consent"
                    stackId="consent"
                    stroke={chartColors.teal}
                    fill="#b8d9d2"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </section>

          <section className="dashboard-panel dashboard-chart-panel">
            <div className="dashboard-panel-header">
              <h2>Lead velocity</h2>
            </div>
            <div className="dashboard-chart-wrap dashboard-chart-wrap-short">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={bundle.leadVelocity}>
                  <CartesianGrid stroke="#e2eeea" strokeDasharray="4 4" />
                  <XAxis dataKey="date" tickFormatter={formatShortDate} stroke="#5f6f68" fontSize={12} />
                  <YAxis stroke="#5f6f68" fontSize={12} allowDecimals={false} />
                  <Tooltip labelFormatter={(value) => formatShortDate(String(value))} />
                  <Legend />
                  <Bar dataKey="newLeads" name="New leads" fill={chartColors.teal} radius={[8, 8, 0, 0]} />
                  <Bar dataKey="enrolled" name="Enrolled" fill={chartColors.gold} radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </section>
        </>
      )}

      {activeTab === "site" ? (
        <p className="dashboard-inline-note">
          Need operational lead metrics too?{" "}
          <Link href="/admin/leads/" className="dashboard-panel-link">
            Open leads
          </Link>
        </p>
      ) : null}
    </div>
  );
}
