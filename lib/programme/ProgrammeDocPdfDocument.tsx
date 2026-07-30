import { Document, Page, Text, View } from "@react-pdf/renderer";
import { parseAdminDocBlocks } from "@/lib/adminDocs/renderMarkdown";
import { adminDocPdfStyles as styles } from "@/lib/adminDocs/pdf/styles";
import { siteConfig } from "@/lib/constants";

type ProgrammeDocPdfDocumentProps = {
  title: string;
  summary?: string | null;
  bodyMarkdown: string;
  addictionLabel: string;
};

function stripInlineMarkdown(text: string) {
  return text
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1");
}

export function ProgrammeDocPdfDocument({
  title,
  summary,
  bodyMarkdown,
  addictionLabel,
}: ProgrammeDocPdfDocumentProps) {
  const blocks = parseAdminDocBlocks(bodyMarkdown);
  const generatedAt = new Intl.DateTimeFormat("en-ZA", { dateStyle: "medium", timeStyle: "short" }).format(new Date());

  return (
    <Document title={title}>
      <Page size="A4" style={styles.page}>
        <View style={styles.headerBand}>
          <Text style={styles.headerTitle}>{title}</Text>
          <Text style={styles.headerMeta}>
            {siteConfig.name} · {addictionLabel} · Generated {generatedAt}
          </Text>
        </View>

        {summary ? <Text style={styles.bodyText}>{summary}</Text> : null}

        {blocks.map((block, index) => {
          const key = `block-${index}`;
          switch (block.type) {
            case "heading":
              return (
                <Text
                  key={key}
                  style={{
                    ...styles.sectionTitle,
                    fontSize: block.level === 1 ? 14 : block.level === 2 ? 12 : 10,
                  }}
                >
                  {stripInlineMarkdown(block.text)}
                </Text>
              );
            case "paragraph":
              return (
                <Text key={key} style={styles.bodyText}>
                  {stripInlineMarkdown(block.text)}
                </Text>
              );
            case "ul":
              return block.items.map((item, itemIndex) => (
                <Text key={`${key}-${itemIndex}`} style={styles.checklistItem}>
                  • {stripInlineMarkdown(item)}
                </Text>
              ));
            case "ol":
              return block.items.map((item, itemIndex) => (
                <Text key={`${key}-${itemIndex}`} style={styles.checklistItem}>
                  {itemIndex + 1}. {stripInlineMarkdown(item)}
                </Text>
              ));
            default:
              return null;
          }
        })}

        <Text style={styles.bodyText}>
          Educational support only. Not a medical diagnosis or a guarantee of outcomes.
        </Text>
      </Page>
    </Document>
  );
}
