import {
  Document,
  Page,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";
import type { AnalyticsBundle } from "@/lib/analytics/types";

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    color: "#17231f",
    fontFamily: "Helvetica",
    backgroundColor: "#fffdf9",
  },
  headerBand: {
    backgroundColor: "#0a3f39",
    color: "#f7f3ea",
    padding: 18,
    borderRadius: 8,
    marginBottom: 18,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 700,
    marginBottom: 4,
  },
  headerMeta: {
    fontSize: 9,
    color: "#d8ece8",
  },
  kpiRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 16,
  },
  kpiCard: {
    flex: 1,
    backgroundColor: "#f7f3ea",
    border: "1px solid #d8ded7",
    borderRadius: 8,
    padding: 10,
  },
  kpiLabel: {
    fontSize: 8,
    color: "#5f6f68",
    marginBottom: 4,
  },
  kpiValue: {
    fontSize: 16,
    color: "#0a3f39",
    fontWeight: 700,
  },
  sectionTitle: {
    fontSize: 12,
    color: "#0a3f39",
    fontWeight: 700,
    marginBottom: 8,
    marginTop: 6,
  },
  table: {
    border: "1px solid #d8ded7",
    borderRadius: 6,
    overflow: "hidden",
    marginBottom: 14,
  },
  tableRow: {
    flexDirection: "row",
    borderBottom: "1px solid #e2eeea",
  },
  tableHeader: {
    backgroundColor: "#e2eeea",
    fontWeight: 700,
  },
  tableCell: {
    flex: 1,
    padding: 6,
    fontSize: 8,
  },
  tableCellWide: {
    flex: 2,
    padding: 6,
    fontSize: 8,
  },
  funnelRow: {
    marginBottom: 6,
  },
  funnelLabelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 2,
  },
  funnelBarTrack: {
    height: 8,
    backgroundColor: "#e2eeea",
    borderRadius: 4,
  },
  funnelBarFill: {
    height: 8,
    backgroundColor: "#0f5b52",
    borderRadius: 4,
  },
  footer: {
    position: "absolute",
    bottom: 28,
    left: 40,
    right: 40,
    fontSize: 8,
    color: "#5f6f68",
    borderTop: "1px solid #d8ded7",
    paddingTop: 8,
  },
});

function formatGeneratedAt(iso: string) {
  return new Intl.DateTimeFormat("en-ZA", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(iso));
}

function TableHeader({ cells }: { cells: string[] }) {
  return (
    <View style={[styles.tableRow, styles.tableHeader]}>
      {cells.map((cell) => (
        <Text key={cell} style={styles.tableCell}>
          {cell}
        </Text>
      ))}
    </View>
  );
}

export function AnalyticsReportDocument({ bundle }: { bundle: AnalyticsBundle }) {
  const maxFunnel = Math.max(...bundle.funnel.map((step) => step.count), 1);
  const dailyPreview = bundle.dailySeries.slice(-10);

  return (
    <Document title={`HFYA Analytics — ${bundle.rangeLabel}`}>
      <Page size="A4" style={styles.page}>
        <View style={styles.headerBand}>
          <Text style={styles.headerTitle}>Healing From Your Addiction</Text>
          <Text style={styles.headerMeta}>Analytics report · {bundle.rangeLabel}</Text>
          <Text style={styles.headerMeta}>Generated {formatGeneratedAt(bundle.generatedAt)}</Text>
        </View>

        <View style={styles.kpiRow}>
          <View style={styles.kpiCard}>
            <Text style={styles.kpiLabel}>Page views</Text>
            <Text style={styles.kpiValue}>{bundle.summary.pageViews.toLocaleString()}</Text>
          </View>
          <View style={styles.kpiCard}>
            <Text style={styles.kpiLabel}>Sessions</Text>
            <Text style={styles.kpiValue}>{bundle.summary.sessions.toLocaleString()}</Text>
          </View>
          <View style={styles.kpiCard}>
            <Text style={styles.kpiLabel}>Conversions</Text>
            <Text style={styles.kpiValue}>{bundle.summary.conversions.toLocaleString()}</Text>
          </View>
          <View style={styles.kpiCard}>
            <Text style={styles.kpiLabel}>Conversion rate</Text>
            <Text style={styles.kpiValue}>{bundle.summary.conversionRate}%</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Consent split</Text>
        <View style={styles.kpiRow}>
          <View style={styles.kpiCard}>
            <Text style={styles.kpiLabel}>Pre-consent page views</Text>
            <Text style={styles.kpiValue}>{bundle.summary.preConsentShare}%</Text>
          </View>
          <View style={styles.kpiCard}>
            <Text style={styles.kpiLabel}>Post-consent page views</Text>
            <Text style={styles.kpiValue}>{bundle.summary.postConsentShare}%</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Conversion funnel</Text>
        {bundle.funnel.map((step) => (
          <View key={step.step} style={styles.funnelRow}>
            <View style={styles.funnelLabelRow}>
              <Text>{step.label}</Text>
              <Text>
                {step.count} ({step.rate}%)
              </Text>
            </View>
            <View style={styles.funnelBarTrack}>
              <View style={[styles.funnelBarFill, { width: `${Math.max(4, (step.count / maxFunnel) * 100)}%` }]} />
            </View>
          </View>
        ))}

        <Text style={styles.sectionTitle}>Recent daily traffic</Text>
        <View style={styles.table}>
          <TableHeader cells={["Date", "Views", "Sessions", "Conversions"]} />
          {dailyPreview.length ? (
            dailyPreview.map((row) => (
              <View key={row.date} style={styles.tableRow}>
                <Text style={styles.tableCell}>{row.date}</Text>
                <Text style={styles.tableCell}>{row.pageViews}</Text>
                <Text style={styles.tableCell}>{row.sessions}</Text>
                <Text style={styles.tableCell}>{row.conversions}</Text>
              </View>
            ))
          ) : (
            <View style={styles.tableRow}>
              <Text style={styles.tableCell}>No traffic recorded in this range.</Text>
            </View>
          )}
        </View>

        <Text style={styles.footer} render={({ pageNumber, totalPages }) =>
          `Page ${pageNumber} of ${totalPages} · First-party analytics · Pre-consent and post-consent tiers included · Not medical reporting`
        } fixed />
      </Page>

      <Page size="A4" style={styles.page}>
        <Text style={styles.sectionTitle}>Top pages</Text>
        <View style={styles.table}>
          <View style={[styles.tableRow, styles.tableHeader]}>
            <Text style={styles.tableCellWide}>Path</Text>
            <Text style={styles.tableCell}>Views</Text>
            <Text style={styles.tableCell}>Conversions</Text>
          </View>
          {(bundle.topPages.length ? bundle.topPages : [{ path: "—", views: 0, conversions: 0 }]).map((row) => (
            <View key={row.path} style={styles.tableRow}>
              <Text style={styles.tableCellWide}>{row.path}</Text>
              <Text style={styles.tableCell}>{row.views}</Text>
              <Text style={styles.tableCell}>{row.conversions}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Top events</Text>
        <View style={styles.table}>
          <TableHeader cells={["Event", "Total", "Essential", "Analytics"]} />
          {(bundle.topEvents.length ? bundle.topEvents : [{ event: "—", count: 0, essentialCount: 0, analyticsCount: 0 }]).map((row) => (
            <View key={row.event} style={styles.tableRow}>
              <Text style={styles.tableCell}>{row.event}</Text>
              <Text style={styles.tableCell}>{row.count}</Text>
              <Text style={styles.tableCell}>{row.essentialCount}</Text>
              <Text style={styles.tableCell}>{row.analyticsCount}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Lead attribution</Text>
        <View style={styles.table}>
          <TableHeader cells={["Source", "Medium", "Leads", "Qualified / enrolled"]} />
          {(bundle.attribution.length ? bundle.attribution : [{ source: "—", medium: "—", leads: 0, conversions: 0 }]).map((row) => (
            <View key={`${row.source}-${row.medium}`} style={styles.tableRow}>
              <Text style={styles.tableCell}>{row.source}</Text>
              <Text style={styles.tableCell}>{row.medium}</Text>
              <Text style={styles.tableCell}>{row.leads}</Text>
              <Text style={styles.tableCell}>{row.conversions}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.footer} render={({ pageNumber, totalPages }) =>
          `Page ${pageNumber} of ${totalPages} · Healing From Your Addiction analytics export`
        } fixed />
      </Page>
    </Document>
  );
}
