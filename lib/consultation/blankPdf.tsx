import {
  Document,
  Page,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";
import { CONSULTATION_STEPS } from "@/lib/consultation/schema";
import { siteConfig } from "@/lib/constants";
import type { ClientConsultation } from "@/types/database";

const styles = StyleSheet.create({
  page: {
    backgroundColor: "#f7f3ea",
    color: "#17231f",
    fontFamily: "Helvetica",
    paddingBottom: 42,
    paddingHorizontal: 42,
    paddingTop: 42,
  },
  header: {
    borderBottomColor: "#0f5b52",
    borderBottomWidth: 2,
    marginBottom: 20,
    paddingBottom: 14,
  },
  eyebrow: {
    color: "#0f5b52",
    fontSize: 8,
    fontWeight: 700,
    letterSpacing: 1.3,
    marginBottom: 7,
    textTransform: "uppercase",
  },
  title: {
    fontSize: 22,
    fontWeight: 700,
    marginBottom: 6,
  },
  subtitle: {
    color: "#58645f",
    fontSize: 10,
    lineHeight: 1.4,
  },
  notice: {
    backgroundColor: "#e2eeea",
    borderRadius: 5,
    color: "#0a3f39",
    fontSize: 9,
    lineHeight: 1.4,
    marginBottom: 18,
    padding: 10,
  },
  step: {
    marginBottom: 17,
  },
  stepHeader: {
    backgroundColor: "#0a3f39",
    borderRadius: 5,
    color: "#fffdfa",
    marginBottom: 9,
    padding: 9,
  },
  stepTitle: {
    fontSize: 13,
    fontWeight: 700,
  },
  stepDescription: {
    color: "#e2eeea",
    fontSize: 8.5,
    lineHeight: 1.35,
    marginTop: 3,
  },
  field: {
    marginBottom: 9,
  },
  label: {
    fontSize: 9.5,
    fontWeight: 700,
    lineHeight: 1.3,
    marginBottom: 4,
  },
  hint: {
    color: "#58645f",
    fontSize: 8,
    lineHeight: 1.3,
    marginBottom: 4,
  },
  line: {
    borderBottomColor: "#a9b8b1",
    borderBottomWidth: 1,
    height: 17,
  },
  optionGrid: {
    display: "flex",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 4,
  },
  option: {
    borderColor: "#c6d1ca",
    borderRadius: 4,
    borderWidth: 1,
    color: "#17231f",
    fontSize: 8.5,
    marginBottom: 3,
    padding: 5,
    width: "48%",
  },
  footer: {
    borderTopColor: "#c6d1ca",
    borderTopWidth: 1,
    color: "#58645f",
    fontSize: 8,
    lineHeight: 1.35,
    marginTop: 6,
    paddingTop: 9,
  },
});

function AnswerLines({ count = 1 }: { count?: number }) {
  return (
    <View>
      {Array.from({ length: count }, (_, index) => (
        <View key={index} style={styles.line} />
      ))}
    </View>
  );
}

function BlankField({
  label,
  type,
  options,
  hint,
}: {
  label: string;
  type: string;
  options?: Array<{ label: string }>;
  hint?: string;
}) {
  if (options?.length) {
    return (
      <View style={styles.field} wrap={false}>
        <Text style={styles.label}>{label}</Text>
        {hint ? <Text style={styles.hint}>{hint}</Text> : null}
        <View style={styles.optionGrid}>
          {options.map((option) => (
            <Text key={option.label} style={styles.option}>
              [ ] {option.label}
            </Text>
          ))}
        </View>
        <AnswerLines count={1} />
      </View>
    );
  }

  return (
    <View style={styles.field} wrap={false}>
      <Text style={styles.label}>{label}</Text>
      {hint ? <Text style={styles.hint}>{hint}</Text> : null}
      <AnswerLines count={type === "textarea" ? 3 : 1} />
    </View>
  );
}

function formatAnswer(value: unknown): string {
  if (value == null) return "Not provided";
  if (Array.isArray(value)) return value.length ? value.join(", ") : "Not provided";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  const text = String(value).trim();
  return text || "Not provided";
}

export function ConsultationBlankPdf() {
  return (
    <Document
      author={siteConfig.name}
      title="Hypnotherapy client consultation form"
      subject="Current printable consultation form"
    >
      <Page size="A4" style={styles.page} wrap>
        <View style={styles.header}>
          <Text style={styles.eyebrow}>Healing from Your Addiction</Text>
          <Text style={styles.title}>Hypnotherapy consultation</Text>
          <Text style={styles.subtitle}>
            Printable companion to the current online consultation and informed consent form.
          </Text>
        </View>

        <Text style={styles.notice}>
          Please complete what feels relevant and legible. This form supports safe preparation for your consultation; it
          is not an emergency service. If you are in immediate danger, contact local emergency services or your GP.
        </Text>

        {CONSULTATION_STEPS.map((step, index) => (
          <View key={step.key} style={styles.step}>
            <View style={styles.stepHeader}>
              <Text style={styles.stepTitle}>
                {index + 1}. {step.title}
              </Text>
              <Text style={styles.stepDescription}>{step.description}</Text>
            </View>
            {step.fields.map((field) => (
              <BlankField
                key={field.key}
                label={field.label}
                type={field.type}
                options={field.options}
                hint={field.hint}
              />
            ))}
          </View>
        ))}

        <View style={styles.footer}>
          <Text>
            Return this completed form through the secure upload on your portal, or complete the online version instead.
            Please do not email sensitive health information unless Gerald has given you a secure method.
          </Text>
          <Text>Signature: ____________________________________   Date: __________________</Text>
        </View>
      </Page>
    </Document>
  );
}

export function ConsultationAnswersPdf({
  consultation,
  clientName,
}: {
  consultation: ClientConsultation;
  clientName: string;
}) {
  return (
    <Document
      author={siteConfig.name}
      title="Hypnotherapy consultation answers"
      subject="Current consultation answers"
    >
      <Page size="A4" style={styles.page} wrap>
        <View style={styles.header}>
          <Text style={styles.eyebrow}>Healing from Your Addiction</Text>
          <Text style={styles.title}>Hypnotherapy consultation answers</Text>
          <Text style={styles.subtitle}>
            Prepared for {clientName} · {consultation.completed_at ? "Submitted" : "Draft"}
          </Text>
        </View>

        <Text style={styles.notice}>
          This is a secure export of the current online consultation record. Gerald will review the information before
          sessions begin. It is not an emergency service.
        </Text>

        {CONSULTATION_STEPS.map((step, index) => (
          <View key={step.key} style={styles.step}>
            <View style={styles.stepHeader}>
              <Text style={styles.stepTitle}>
                {index + 1}. {step.title}
              </Text>
              <Text style={styles.stepDescription}>{step.description}</Text>
            </View>
            {step.fields.map((field) => (
              <View key={field.key} style={styles.field} wrap={false}>
                <Text style={styles.label}>{field.label}</Text>
                <Text style={styles.subtitle}>{formatAnswer(consultation.responses[field.key])}</Text>
                {field.otherKey && consultation.responses[field.otherKey] ? (
                  <Text style={styles.hint}>Other: {formatAnswer(consultation.responses[field.otherKey])}</Text>
                ) : null}
              </View>
            ))}
          </View>
        ))}

        {consultation.signature_name ? (
          <View style={styles.footer}>
            <Text>Signed by: {consultation.signature_name}</Text>
            <Text>Signed at: {consultation.signed_at ?? "Not recorded"}</Text>
          </View>
        ) : null}
      </Page>
    </Document>
  );
}
