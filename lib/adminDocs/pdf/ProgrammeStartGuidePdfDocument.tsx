import { Document, Page, Text, View } from "@react-pdf/renderer";
import { programmeStartGuideContent } from "@/lib/adminDocs/programmeStartGuideContent";
import { adminDocPdfStyles as styles } from "@/lib/adminDocs/pdf/styles";
import { siteConfig } from "@/lib/constants";

function ProgrammeWeek1PdfPreview() {
  return (
    <View style={styles.screenFrame}>
      <Text style={styles.screenBar}>{programmeStartGuideContent.clientProgrammeUrl}</Text>
      <View style={styles.screenBody}>
        <View style={styles.screenCard}>
          <Text style={styles.screenEyebrow}>Programme</Text>
          <Text style={styles.screenHeading}>Week 1 launch checklist</Text>
          <Text style={styles.screenMuted}>3/7 complete · Intake ✓ · Consultation ✓ · Assign programme…</Text>
          <Text style={styles.fieldLabel}>What the client sees next</Text>
          <Text style={styles.fieldBox}>Week 1 · Continue journey: Orientation</Text>
        </View>
      </View>
    </View>
  );
}

function AssignProgrammePdfPreview() {
  return (
    <View style={styles.screenFrame}>
      <Text style={styles.screenBar}>{`${programmeStartGuideContent.clientProgrammeUrl}#assign`}</Text>
      <View style={styles.screenBody}>
        <View style={styles.screenCard}>
          <Text style={styles.screenEyebrow}>Assign</Text>
          <Text style={styles.screenHeading}>Interactive programme</Text>
          <Text style={styles.fieldLabel}>Template</Text>
          <Text style={styles.fieldBox}>Gambling addiction support · matches client focus</Text>
          <Text style={styles.primaryButton}>Assign interactive programme</Text>
        </View>
      </View>
    </View>
  );
}

export function ProgrammeStartGuidePdfDocument() {
  const guide = programmeStartGuideContent;
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

        <Text style={styles.sectionTitle}>Journey map</Text>
        {guide.journeyMap.map((item, index) => (
          <Text key={item.stage} style={styles.checklistItem}>
            {index + 1}. {item.stage} — {item.detail}
          </Text>
        ))}

        <Text style={styles.sectionTitle}>Week 1 steps</Text>
        {guide.steps.map((step, index) => (
          <View key={step.id} style={styles.stepCard} wrap={false}>
            <Text style={styles.stepBadge}>{index + 1}</Text>
            <Text style={styles.stepTitle}>{step.title}</Text>
            <Text style={styles.bodyText}>{step.body}</Text>
            {step.callout ? <Text style={styles.bodyText}>{step.callout}</Text> : null}
          </View>
        ))}

        <ProgrammeWeek1PdfPreview />
      </Page>

      <Page size="A4" style={styles.page}>
        <AssignProgrammePdfPreview />

        <Text style={styles.sectionTitle}>Week 1 launch checklist</Text>
        {guide.checklist.map((item) => (
          <Text key={item} style={styles.checklistItem}>
            • {item}
          </Text>
        ))}

        <Text style={styles.sectionTitle}>Troubleshooting</Text>
        {guide.troubleshooting.map((item) => (
          <View key={item.title} style={styles.stepCard} wrap={false}>
            <Text style={styles.stepTitle}>{item.title}</Text>
            <Text style={styles.bodyText}>{item.body}</Text>
          </View>
        ))}

        <Text style={styles.footerNote}>
          {siteConfig.name} · {guide.docUrl}
        </Text>
      </Page>
    </Document>
  );
}
