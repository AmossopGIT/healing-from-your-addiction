import { Document, Page, Text, View } from "@react-pdf/renderer";
import { adminLoginGuideContent } from "@/lib/adminDocs/adminLoginGuideContent";
import { adminDocPdfStyles as styles } from "@/lib/adminDocs/pdf/styles";
import { siteConfig } from "@/lib/constants";

function LoginScreenPreview() {
  const { adminEmail } = adminLoginGuideContent;
  return (
    <View style={styles.screenFrame}>
      <Text style={styles.screenBar}>{adminLoginGuideContent.adminLoginUrl}</Text>
      <View style={styles.screenBody}>
        <View style={styles.screenCard}>
          <Text style={styles.screenEyebrow}>Private access</Text>
          <Text style={styles.screenHeading}>Admin sign in</Text>
          <Text style={styles.screenMuted}>Sign in to manage leads, notes, and client invitations.</Text>
          <Text style={styles.fieldLabel}>Email</Text>
          <Text style={styles.fieldBox}>{adminEmail}</Text>
          <Text style={styles.fieldLabel}>Password</Text>
          <Text style={styles.fieldBox}>Your secure password</Text>
          <Text style={styles.primaryButton}>Sign in</Text>
        </View>
      </View>
    </View>
  );
}

function ClientPortalScreenPreview() {
  return (
    <View style={styles.screenFrame}>
      <Text style={styles.screenBar}>{adminLoginGuideContent.clientPortalLoginUrl}</Text>
      <View style={styles.screenBody}>
        <View style={styles.screenCard}>
          <Text style={styles.screenEyebrow}>Private access</Text>
          <Text style={styles.screenHeading}>Client portal sign in</Text>
          <Text style={styles.screenMuted}>Sign in to view your programme, resources, and secure messages.</Text>
          <Text style={styles.fieldLabel}>Email</Text>
          <Text style={styles.fieldBox}>client@example.com</Text>
          <Text style={styles.fieldLabel}>Password</Text>
          <Text style={styles.fieldBox}>Password</Text>
          <Text style={styles.primaryButton}>Sign in</Text>
          <Text style={{ ...styles.screenMuted, marginTop: 8, textAlign: "center", color: "#0a3f39", fontWeight: 700 }}>
            Staff admin sign in
          </Text>
        </View>
      </View>
    </View>
  );
}

function DashboardScreenPreview() {
  return (
    <View style={styles.screenFrame}>
      <Text style={styles.screenBar}>{`${siteConfig.siteUrl.replace(/\/$/, "")}/admin/`}</Text>
      <View style={styles.screenBody}>
        <View style={{ flexDirection: "row", gap: 8 }}>
          <View style={{ width: 88, backgroundColor: "#0a3f39", borderRadius: 6, padding: 8 }}>
            <Text style={{ color: "#f7f3ea", fontSize: 7, marginBottom: 6 }}>Admin dashboard</Text>
            <Text style={{ color: "#d8ece8", fontSize: 7, marginBottom: 2 }}>Overview</Text>
            <Text style={{ color: "#d8ece8", fontSize: 7, marginBottom: 2 }}>Leads</Text>
            <Text style={{ color: "#d8ece8", fontSize: 7, marginBottom: 2 }}>Clients</Text>
            <Text style={{ color: "#d8ece8", fontSize: 7 }}>Content</Text>
          </View>
          <View style={{ flex: 1, backgroundColor: "#fffdfa", border: "1px solid #d8ded7", borderRadius: 6, padding: 8 }}>
            <Text style={styles.screenEyebrow}>Overview</Text>
            <Text style={styles.screenHeading}>Welcome back</Text>
            <Text style={styles.screenMuted}>Review new enquiries, follow up with leads, and manage enrolled clients.</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

export function AdminLoginGuidePdfDocument() {
  const guide = adminLoginGuideContent;
  const headerPath = guide.accessPaths.find((path) => path.id === "header");
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
        <Text style={styles.bodyText}>Admin URL: {guide.adminLoginUrl}</Text>
        <Text style={styles.bodyText}>Client portal URL (header Log in): {guide.clientPortalLoginUrl}</Text>
        <Text style={styles.bodyText}>Admin email: {guide.adminEmail}</Text>

        <Text style={styles.sectionTitle}>Sign-in steps</Text>
        {guide.steps.map((step, index) => (
          <View key={step.title} style={styles.stepCard} wrap={false}>
            <Text style={styles.stepBadge}>{index + 1}</Text>
            <Text style={styles.stepTitle}>{step.title}</Text>
            <Text style={styles.bodyText}>{step.body}</Text>
            {index === 0 ? (
              <>
                <Text style={{ ...styles.stepTitle, fontSize: 10, marginTop: 4 }}>Option A — Direct admin link</Text>
                <LoginScreenPreview />
                <Text style={{ ...styles.stepTitle, fontSize: 10, marginTop: 8 }}>Option B — From the public site header</Text>
                {headerPath?.headerSteps?.map((headerStep, stepIndex) => (
                  <Text key={headerStep} style={styles.checklistItem}>
                    {stepIndex + 1}. {headerStep}
                  </Text>
                ))}
                <ClientPortalScreenPreview />
              </>
            ) : null}
            {index === 1 ? <LoginScreenPreview /> : null}
            {index === 2 ? <DashboardScreenPreview /> : null}
            {step.callout ? <Text style={styles.bodyText}>{step.callout}</Text> : null}
          </View>
        ))}

        <Text style={styles.sectionTitle}>After sign-in checklist</Text>
        {guide.smokeChecks.map((item) => (
          <Text key={item} style={styles.checklistItem}>
            • {item}
          </Text>
        ))}

        <Text style={styles.sectionTitle}>Troubleshooting</Text>
        {guide.troubleshooting.map((item) => (
          <View key={item.issue} style={{ marginBottom: 6 }}>
            <Text style={{ fontSize: 9, fontWeight: 700, color: "#0a3f39" }}>{item.issue}</Text>
            <Text style={styles.bodyText}>{item.fix}</Text>
          </View>
        ))}

        <Text style={styles.footerNote}>Keep admin credentials private. This PDF is for internal team use only.</Text>
      </Page>
    </Document>
  );
}
