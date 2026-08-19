import { Document, Page, Text, View } from "@react-pdf/renderer";
import { leadTriagePlaybookContent } from "@/lib/adminDocs/leadTriagePlaybookContent";
import { adminDocPdfStyles as styles } from "@/lib/adminDocs/pdf/styles";
import { siteConfig } from "@/lib/constants";

export function LeadTriagePlaybookPdfDocument() {
  const guide = leadTriagePlaybookContent;
  const generatedAt = new Intl.DateTimeFormat("en-ZA", { dateStyle: "medium", timeStyle: "short" }).format(new Date());

  return (
    <Document title={guide.title}>
      <Page size="A4" style={styles.page}>
        <View style={styles.headerBand}>
          <Text style={styles.headerTitle}>{guide.title}</Text>
          <Text style={styles.headerMeta}>
            {siteConfig.name} · Internal admin guide · Generated {generatedAt}
          </Text>
        </View>

        <Text style={styles.bodyText}>{guide.description}</Text>
        <Text style={styles.bodyText}>{guide.intro}</Text>

        <Text style={styles.sectionTitle}>Key facts</Text>
        {guide.facts.map((fact) => (
          <View key={fact.label} style={{ marginBottom: 6 }} wrap={false}>
            <Text style={{ fontSize: 9, fontWeight: 700, color: "#0a3f39" }}>{fact.label}</Text>
            <Text style={styles.bodyText}>{fact.value}</Text>
          </View>
        ))}

        <Text style={styles.sectionTitle}>Response time targets</Text>
        {guide.sla.map((item) => (
          <Text key={item.level} style={styles.checklistItem}>
            • {item.level}: {item.target} — {item.when}
          </Text>
        ))}

        <Text style={styles.sectionTitle}>Status workflow</Text>
        <Text style={styles.bodyText}>{guide.workflowLine}</Text>
        {guide.statusWorkflow.map((item) => (
          <View key={item.status} style={styles.stepCard} wrap={false}>
            <Text style={styles.stepTitle}>{item.label}</Text>
            <Text style={styles.bodyText}>{item.meaning}</Text>
            <Text style={styles.bodyText}>Do this: {item.action}</Text>
            <Text style={styles.bodyText}>Then: {item.next}</Text>
          </View>
        ))}
      </Page>

      <Page size="A4" style={styles.page}>
        <Text style={styles.sectionTitle}>Step-by-step</Text>
        {guide.steps.map((step, index) => (
          <View key={step.id} style={styles.stepCard} wrap={false}>
            <Text style={styles.stepBadge}>{index + 1}</Text>
            <Text style={styles.stepTitle}>{step.title}</Text>
            <Text style={styles.bodyText}>{step.body}</Text>
            {step.callout ? <Text style={styles.bodyText}>{step.callout}</Text> : null}
          </View>
        ))}

        <Text style={styles.sectionTitle}>Triage checklist</Text>
        {guide.checklist.map((item) => (
          <Text key={item} style={styles.checklistItem}>
            • {item}
          </Text>
        ))}

        <Text style={styles.sectionTitle}>Safety language</Text>
        {guide.safetyLanguage.map((item) => (
          <Text key={item} style={styles.checklistItem}>
            • {item}
          </Text>
        ))}

        <Text style={styles.footerNote}>
          {siteConfig.name} · {guide.docUrl}
        </Text>
      </Page>
    </Document>
  );
}
