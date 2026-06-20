import { Document, Page, Text, View } from "@react-pdf/renderer";
import { parseAdminDocBlocks } from "@/lib/adminDocs/renderMarkdown";
import { adminDocPdfStyles as styles } from "@/lib/adminDocs/pdf/styles";
import { siteConfig } from "@/lib/constants";
import type { AdminDocPdfPayload } from "@/lib/adminDocs/pdf/types";

type AdminDocMarkdownPdfDocumentProps = {
  payload: Extract<AdminDocPdfPayload, { kind: "markdown" }>;
};

function stripInlineMarkdown(text: string) {
  return text
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1");
}

export function AdminDocMarkdownPdfDocument({ payload }: AdminDocMarkdownPdfDocumentProps) {
  const blocks = parseAdminDocBlocks(payload.markdown);
  const generatedAt = new Intl.DateTimeFormat("en-ZA", { dateStyle: "medium", timeStyle: "short" }).format(new Date());

  return (
    <Document title={payload.title}>
      <Page size="A4" style={styles.page}>
        <View style={styles.headerBand}>
          <Text style={styles.headerTitle}>{payload.title}</Text>
          <Text style={styles.headerMeta}>
            {siteConfig.name} · {payload.category} · Generated {generatedAt}
          </Text>
        </View>

        {payload.description ? <Text style={styles.bodyText}>{payload.description}</Text> : null}

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
            case "code":
              return (
                <View key={key} style={{ ...styles.screenCard, marginBottom: 8 }}>
                  <Text style={{ fontSize: 8, fontFamily: "Courier" }}>{block.text}</Text>
                </View>
              );
            case "blockquote":
              return (
                <View key={key} style={{ ...styles.stepCard, backgroundColor: "#f7f3ea" }}>
                  <Text style={styles.bodyText}>{stripInlineMarkdown(block.text)}</Text>
                </View>
              );
            case "hr":
              return <View key={key} style={{ borderTop: "1px solid #e2eeea", marginVertical: 8 }} />;
            case "table":
              return (
                <View key={key} style={{ marginBottom: 10 }}>
                  <View style={{ flexDirection: "row", backgroundColor: "#e2eeea" }}>
                    {block.headers.map((header, headerIndex) => (
                      <Text key={`${key}-h-${headerIndex}`} style={{ flex: 1, fontSize: 8, padding: 4, fontWeight: 700 }}>
                        {stripInlineMarkdown(header)}
                      </Text>
                    ))}
                  </View>
                  {block.rows.map((row, rowIndex) => (
                    <View key={`${key}-r-${rowIndex}`} style={{ flexDirection: "row", borderBottom: "1px solid #e2eeea" }}>
                      {row.map((cell, cellIndex) => (
                        <Text key={`${key}-c-${rowIndex}-${cellIndex}`} style={{ flex: 1, fontSize: 8, padding: 4 }}>
                          {stripInlineMarkdown(cell)}
                        </Text>
                      ))}
                    </View>
                  ))}
                </View>
              );
            default:
              return null;
          }
        })}

        <Text style={styles.footerNote}>Internal admin documentation · {siteConfig.name}</Text>
      </Page>
    </Document>
  );
}
