import type { ReactNode } from "react";
import { parseInlineMarkdown } from "@/lib/cms/inlineMarkdown";

type Block =
  | { type: "heading"; level: 1 | 2 | 3 | 4; text: string }
  | { type: "paragraph"; text: string }
  | { type: "ul"; items: string[] }
  | { type: "ol"; items: string[] }
  | { type: "code"; language: string; text: string }
  | { type: "blockquote"; text: string }
  | { type: "hr" }
  | { type: "table"; headers: string[]; rows: string[][] };

const HEADING_PATTERN = /^(#{1,4})\s+(.+)$/;
const UL_PATTERN = /^[-*]\s+(.+)$/;
const OL_PATTERN = /^(\d+)\.\s+(.+)$/;
const BLOCKQUOTE_PATTERN = /^>\s?(.+)$/;

function parseBlocks(markdown: string): Block[] {
  const lines = markdown.replace(/\r\n/g, "\n").split("\n");
  const blocks: Block[] = [];
  let index = 0;

  while (index < lines.length) {
    const line = lines[index];
    const trimmed = line.trim();

    if (!trimmed) {
      index += 1;
      continue;
    }

    if (trimmed === "---") {
      blocks.push({ type: "hr" });
      index += 1;
      continue;
    }

    if (trimmed.startsWith("```")) {
      const language = trimmed.slice(3).trim();
      const codeLines: string[] = [];
      index += 1;
      while (index < lines.length && !lines[index].trim().startsWith("```")) {
        codeLines.push(lines[index]);
        index += 1;
      }
      blocks.push({ type: "code", language, text: codeLines.join("\n") });
      index += 1;
      continue;
    }

    const headingMatch = trimmed.match(HEADING_PATTERN);
    if (headingMatch) {
      blocks.push({
        type: "heading",
        level: headingMatch[1].length as 1 | 2 | 3 | 4,
        text: headingMatch[2].trim(),
      });
      index += 1;
      continue;
    }

    const blockquoteMatch = trimmed.match(BLOCKQUOTE_PATTERN);
    if (blockquoteMatch) {
      const quoteLines: string[] = [blockquoteMatch[1]];
      index += 1;
      while (index < lines.length) {
        const next = lines[index].trim();
        const nextQuote = next.match(BLOCKQUOTE_PATTERN);
        if (!nextQuote) break;
        quoteLines.push(nextQuote[1]);
        index += 1;
      }
      blocks.push({ type: "blockquote", text: quoteLines.join("\n") });
      continue;
    }

    if (trimmed.includes("|") && index + 1 < lines.length && lines[index + 1].includes("|")) {
      const headerCells = trimmed
        .split("|")
        .map((cell) => cell.trim())
        .filter(Boolean);
      const divider = lines[index + 1].trim();
      if (/^\|?[\s:-|]+\|?$/.test(divider)) {
        const rows: string[][] = [];
        index += 2;
        while (index < lines.length && lines[index].includes("|") && lines[index].trim()) {
          rows.push(
            lines[index]
              .split("|")
              .map((cell) => cell.trim())
              .filter(Boolean),
          );
          index += 1;
        }
        blocks.push({ type: "table", headers: headerCells, rows });
        continue;
      }
    }

    const ulMatch = trimmed.match(UL_PATTERN);
    if (ulMatch) {
      const items: string[] = [ulMatch[1]];
      index += 1;
      while (index < lines.length) {
        const next = lines[index].trim();
        const nextItem = next.match(UL_PATTERN);
        if (!nextItem) break;
        items.push(nextItem[1]);
        index += 1;
      }
      blocks.push({ type: "ul", items });
      continue;
    }

    const olMatch = trimmed.match(OL_PATTERN);
    if (olMatch) {
      const items: string[] = [olMatch[2]];
      index += 1;
      while (index < lines.length) {
        const next = lines[index].trim();
        const nextItem = next.match(OL_PATTERN);
        if (!nextItem) break;
        items.push(nextItem[2]);
        index += 1;
      }
      blocks.push({ type: "ol", items });
      continue;
    }

    const paragraphLines: string[] = [line];
    index += 1;
    while (index < lines.length) {
      const next = lines[index];
      const nextTrimmed = next.trim();
      if (
        !nextTrimmed ||
        nextTrimmed.startsWith("#") ||
        nextTrimmed.startsWith("```") ||
        nextTrimmed.startsWith(">") ||
        nextTrimmed === "---" ||
        UL_PATTERN.test(nextTrimmed) ||
        OL_PATTERN.test(nextTrimmed) ||
        (nextTrimmed.includes("|") && index + 1 < lines.length && lines[index + 1].includes("|"))
      ) {
        break;
      }
      paragraphLines.push(next);
      index += 1;
    }
    blocks.push({ type: "paragraph", text: paragraphLines.join("\n").trim() });
  }

  return blocks;
}

function renderInline(text: string, keyPrefix: string): ReactNode {
  return <>{parseInlineMarkdown(text).map((node, index) => <span key={`${keyPrefix}-${index}`}>{node}</span>)}</>;
}

function renderBlock(block: Block, index: number): ReactNode {
  const key = `block-${index}`;

  switch (block.type) {
    case "heading": {
      const Tag = block.level === 1 ? "h1" : block.level === 2 ? "h2" : block.level === 3 ? "h3" : "h4";
      return (
        <Tag key={key} className={`admin-doc-heading admin-doc-h${block.level}`}>
          {renderInline(block.text, key)}
        </Tag>
      );
    }
    case "paragraph":
      return (
        <p key={key}>
          {renderInline(block.text, key)}
        </p>
      );
    case "ul":
      return (
        <ul key={key}>
          {block.items.map((item, itemIndex) => (
            <li key={`${key}-item-${itemIndex}`}>{renderInline(item, `${key}-item-${itemIndex}`)}</li>
          ))}
        </ul>
      );
    case "ol":
      return (
        <ol key={key}>
          {block.items.map((item, itemIndex) => (
            <li key={`${key}-item-${itemIndex}`}>{renderInline(item, `${key}-item-${itemIndex}`)}</li>
          ))}
        </ol>
      );
    case "code":
      return (
        <pre key={key} className="admin-doc-code-block">
          <code>{block.text}</code>
        </pre>
      );
    case "blockquote":
      return (
        <blockquote key={key}>
          {block.text.split("\n").map((line, lineIndex) => (
            <p key={`${key}-line-${lineIndex}`}>{renderInline(line, `${key}-line-${lineIndex}`)}</p>
          ))}
        </blockquote>
      );
    case "hr":
      return <hr key={key} />;
    case "table":
      return (
        <div key={key} className="admin-doc-table-wrap">
          <table className="admin-doc-table">
            <thead>
              <tr>
                {block.headers.map((header, headerIndex) => (
                  <th key={`${key}-header-${headerIndex}`}>{renderInline(header, `${key}-header-${headerIndex}`)}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {block.rows.map((row, rowIndex) => (
                <tr key={`${key}-row-${rowIndex}`}>
                  {row.map((cell, cellIndex) => (
                    <td key={`${key}-cell-${rowIndex}-${cellIndex}`}>
                      {renderInline(cell, `${key}-cell-${rowIndex}-${cellIndex}`)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    default:
      return null;
  }
}

type AdminDocBodyProps = {
  markdown: string;
};

export function AdminDocBody({ markdown }: AdminDocBodyProps) {
  const blocks = parseBlocks(markdown);

  return (
    <article className="admin-doc-prose">
      {blocks.map((block, index) => renderBlock(block, index))}
    </article>
  );
}

export { parseBlocks as parseAdminDocBlocks };
