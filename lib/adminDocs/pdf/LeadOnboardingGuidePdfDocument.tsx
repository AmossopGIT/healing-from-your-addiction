import { Document, Page, Text, View } from "@react-pdf/renderer";
import { leadOnboardingGuideContent } from "@/lib/adminDocs/leadOnboardingGuideContent";
import { adminDocPdfStyles as styles } from "@/lib/adminDocs/pdf/styles";
import { siteConfig } from "@/lib/constants";

function LeadsListPdfPreview() {
  return (
    <View style={styles.screenFrame}>
      <Text style={styles.screenBar}>{leadOnboardingGuideContent.leadsUrl}</Text>
      <View style={styles.screenBody}>
        <View style={{ flexDirection: "row", gap: 8 }}>
          <View style={{ width: 72, backgroundColor: "#0a3f39", borderRadius: 6, padding: 6 }}>
            <Text style={{ color: "#f7f3ea", fontSize: 7, marginBottom: 4 }}>Admin</Text>
            <Text style={{ color: "#d8ece8", fontSize: 7, marginBottom: 2 }}>Overview</Text>
            <Text style={{ color: "#fffdfa", fontSize: 7, fontWeight: 700, marginBottom: 2 }}>Leads</Text>
            <Text style={{ color: "#d8ece8", fontSize: 7 }}>Clients</Text>
          </View>
          <View style={{ flex: 1, backgroundColor: "#fffdfa", border: "1px solid #d8ded7", borderRadius: 6, padding: 8 }}>
            <Text style={styles.screenEyebrow}>Leads</Text>
            <Text style={styles.screenHeading}>Enquiries</Text>
            <Text style={styles.screenMuted}>All | Overdue | New | Triage review</Text>
            <Text style={{ fontSize: 7, fontWeight: 700, marginBottom: 3 }}>Name · Triage · Status · Actions</Text>
            <Text style={{ fontSize: 7, marginBottom: 2 }}>Alex M. · Priority · New · Open | Invite</Text>
            <Text style={{ fontSize: 7 }}>Sam R. · Routine · Outreach · Open | Assign to me</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

function LeadDetailPdfPreview() {
  return (
    <View style={styles.screenFrame}>
      <Text style={styles.screenBar}>{leadOnboardingGuideContent.leadDetailUrl}</Text>
      <View style={styles.screenBody}>
        <View style={styles.screenCard}>
          <Text style={styles.screenEyebrow}>Lead detail</Text>
          <Text style={styles.screenHeading}>Alex M.</Text>
          <Text style={styles.fieldLabel}>Email</Text>
          <Text style={styles.fieldBox}>alex@example.com</Text>
          <Text style={styles.fieldLabel}>Follow-up consent</Text>
          <Text style={styles.fieldBox}>WhatsApp: Yes · Email: Yes · Phone: No</Text>
          <Text style={styles.primaryButton}>Accept & invite client</Text>
          <Text style={{ ...styles.screenMuted, marginTop: 6 }}>Assign to me · Do this next: invite to portal</Text>
        </View>
      </View>
    </View>
  );
}

function InviteClientPdfPreview() {
  return (
    <View style={styles.screenFrame}>
      <Text style={styles.screenBar}>{leadOnboardingGuideContent.inviteUrl}</Text>
      <View style={styles.screenBody}>
        <View style={styles.screenCard}>
          <Text style={styles.screenEyebrow}>Client onboarding</Text>
          <Text style={styles.screenHeading}>Invite client</Text>
          <Text style={styles.fieldLabel}>Full name</Text>
          <Text style={styles.fieldBox}>Alex M.</Text>
          <Text style={styles.fieldLabel}>Email</Text>
          <Text style={styles.fieldBox}>alex@example.com</Text>
          <Text style={styles.fieldLabel}>Addiction focus</Text>
          <Text style={styles.fieldBox}>Gambling addiction support</Text>
          <Text style={styles.primaryButton}>Send invitation</Text>
        </View>
      </View>
    </View>
  );
}

function PortalIntakePdfPreview() {
  return (
    <View style={styles.screenFrame}>
      <Text style={styles.screenBar}>{leadOnboardingGuideContent.portalIntakeUrl}</Text>
      <View style={styles.screenBody}>
        <View style={styles.screenCard}>
          <Text style={styles.screenEyebrow}>Intake</Text>
          <Text style={styles.screenHeading}>Pre-programme questions</Text>
          <Text style={styles.screenMuted}>Answer before your intake conversation. Save progress anytime.</Text>
          <Text style={styles.fieldLabel}>When do urges feel strongest?</Text>
          <Text style={styles.fieldBox}>Evenings after work…</Text>
          <Text style={styles.primaryButton}>Submit intake</Text>
        </View>
      </View>
    </View>
  );
}

function StepPdfPreview({ stepId }: { stepId: string }) {
  switch (stepId) {
    case "leads-list":
      return <LeadsListPdfPreview />;
    case "lead-detail":
      return <LeadDetailPdfPreview />;
    case "invite":
      return <InviteClientPdfPreview />;
    case "intake":
      return <PortalIntakePdfPreview />;
    default:
      return null;
  }
}

export function LeadOnboardingGuidePdfDocument() {
  const guide = leadOnboardingGuideContent;
  const generatedAt = new Intl.DateTimeFormat("en-ZA", { dateStyle: "medium", timeStyle: "short" }).format(new Date());
  const pageOneSteps = guide.steps.slice(0, 2);
  const pageTwoSteps = guide.steps.slice(2);

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

        <Text style={styles.sectionTitle}>Onboarding steps</Text>
        {pageOneSteps.map((step, index) => (
          <View key={step.id} style={styles.stepCard} wrap={false}>
            <Text style={styles.stepBadge}>{index + 1}</Text>
            <Text style={styles.stepTitle}>{step.title}</Text>
            <Text style={styles.bodyText}>{step.body}</Text>
            <StepPdfPreview stepId={step.id} />
            <Text style={{ ...styles.bodyText, fontSize: 8, marginTop: 4 }}>{step.screenCaption}</Text>
            {step.callout ? <Text style={styles.bodyText}>{step.callout}</Text> : null}
          </View>
        ))}
      </Page>

      <Page size="A4" style={styles.page}>
        <Text style={styles.sectionTitle}>Onboarding steps (continued)</Text>
        {pageTwoSteps.map((step, index) => (
          <View key={step.id} style={styles.stepCard} wrap={false}>
            <Text style={styles.stepBadge}>{index + 3}</Text>
            <Text style={styles.stepTitle}>{step.title}</Text>
            <Text style={styles.bodyText}>{step.body}</Text>
            <StepPdfPreview stepId={step.id} />
            <Text style={{ ...styles.bodyText, fontSize: 8, marginTop: 4 }}>{step.screenCaption}</Text>
            {step.callout ? <Text style={styles.bodyText}>{step.callout}</Text> : null}
          </View>
        ))}

        <Text style={styles.sectionTitle}>Entry routes by channel</Text>
        {guide.channels.map((channel) => (
          <View key={channel.id} style={{ marginBottom: 8 }} wrap={false}>
            <Text style={{ fontSize: 9, fontWeight: 700, color: "#0a3f39" }}>{channel.title}</Text>
            <Text style={styles.bodyText}>{channel.summary}</Text>
            {channel.steps.map((item, itemIndex) => (
              <Text key={item} style={styles.checklistItem}>
                {itemIndex + 1}. {item}
              </Text>
            ))}
          </View>
        ))}
      </Page>

      <Page size="A4" style={styles.page}>
        <Text style={styles.sectionTitle}>Admin checklist — new person today</Text>
        {guide.checklist.map((item) => (
          <Text key={item} style={styles.checklistItem}>
            ☐ {item}
          </Text>
        ))}

        <Text style={styles.sectionTitle}>Suggested SLA</Text>
        {guide.sla.map((item) => (
          <Text key={item} style={styles.checklistItem}>
            • {item}
          </Text>
        ))}

        <Text style={styles.sectionTitle}>Common questions</Text>
        {guide.faqs.map((item) => (
          <View key={item.issue} style={{ marginBottom: 6 }} wrap={false}>
            <Text style={{ fontSize: 9, fontWeight: 700, color: "#0a3f39" }}>{item.issue}</Text>
            <Text style={styles.bodyText}>{item.fix}</Text>
          </View>
        ))}

        <Text style={styles.sectionTitle}>Safety reminders</Text>
        {guide.safetyReminders.map((item) => (
          <Text key={item} style={styles.checklistItem}>
            • {item}
          </Text>
        ))}

        <Text style={styles.sectionTitle}>Quick routes</Text>
        {guide.quickRoutes.map((route) => (
          <Text key={route.path} style={styles.checklistItem}>
            {route.label}: {route.path}
          </Text>
        ))}

        <Text style={styles.footerNote}>
          Internal admin documentation · {siteConfig.name} · Consent PDF is not auto-sent from the backend yet.
        </Text>
      </Page>
    </Document>
  );
}
