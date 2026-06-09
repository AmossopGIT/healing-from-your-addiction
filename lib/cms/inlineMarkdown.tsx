import type { ReactNode } from "react";
import { BlogInternalLink } from "@/components/BlogInternalLink";

type Token =
  | { type: "text"; value: string }
  | { type: "bold"; value: string }
  | { type: "italic"; value: string }
  | { type: "small"; value: string }
  | { type: "large"; value: string }
  | { type: "link"; label: string; href: string }
  | { type: "image"; alt: string; src: string };

function tokenizeInlineMarkdown(text: string): Token[] {
  const tokens: Token[] = [];
  const pattern =
    /(\*\*[^*]+\*\*|\*[^*]+\*|<small>[\s\S]*?<\/small>|<span class="blog-text-large">[\s\S]*?<\/span>|!\[[^\]]*\]\([^)]+\)|\[[^\]]+\]\([^)]+\))/g;

  let lastIndex = 0;
  for (const match of text.matchAll(pattern)) {
    const index = match.index ?? 0;
    if (index > lastIndex) {
      tokens.push({ type: "text", value: text.slice(lastIndex, index) });
    }

    const value = match[0];
    if (value.startsWith("**")) {
      tokens.push({ type: "bold", value: value.slice(2, -2) });
    } else if (value.startsWith("*")) {
      tokens.push({ type: "italic", value: value.slice(1, -1) });
    } else if (value.startsWith("<small>")) {
      tokens.push({ type: "small", value: value.replace(/<\/?small>/g, "") });
    } else if (value.startsWith('<span class="blog-text-large">')) {
      tokens.push({ type: "large", value: value.replace(/<\/?span[^>]*>/g, "") });
    } else if (value.startsWith("![")) {
      const imageMatch = value.match(/^!\[([^\]]*)\]\(([^)]+)\)$/);
      if (imageMatch) tokens.push({ type: "image", alt: imageMatch[1], src: imageMatch[2] });
    } else if (value.startsWith("[")) {
      const linkMatch = value.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
      if (linkMatch) tokens.push({ type: "link", label: linkMatch[1], href: linkMatch[2] });
    }

    lastIndex = index + value.length;
  }

  if (lastIndex < text.length) {
    tokens.push({ type: "text", value: text.slice(lastIndex) });
  }

  return tokens.length ? tokens : [{ type: "text", value: text }];
}

function renderToken(token: Token, key: string, sourceSlug?: string): ReactNode {
  switch (token.type) {
    case "bold":
      return <strong key={key}>{parseInlineMarkdown(token.value, sourceSlug)}</strong>;
    case "italic":
      return <em key={key}>{parseInlineMarkdown(token.value, sourceSlug)}</em>;
    case "small":
      return <small key={key}>{parseInlineMarkdown(token.value, sourceSlug)}</small>;
    case "large":
      return (
        <span key={key} className="blog-text-large">
          {parseInlineMarkdown(token.value, sourceSlug)}
        </span>
      );
    case "link":
      return token.href.startsWith("/") ? (
        <BlogInternalLink key={key} href={token.href} label={token.label} sourceSlug={sourceSlug} />
      ) : (
        <a key={key} href={token.href} rel="noreferrer noopener" target="_blank">
          {token.label}
        </a>
      );
    case "image":
      return (
        // eslint-disable-next-line @next/next/no-img-element
        <img key={key} src={token.src} alt={token.alt || "Article illustration"} className="blog-inline-image" />
      );
    default:
      return token.value;
  }
}

export function parseInlineMarkdown(text: string, sourceSlug?: string): ReactNode[] {
  return tokenizeInlineMarkdown(text).map((token, index) => renderToken(token, `${token.type}-${index}`, sourceSlug));
}

export function ArticleInlineContent({ text, sourceSlug }: { text: string; sourceSlug?: string }) {
  return <>{parseInlineMarkdown(text, sourceSlug)}</>;
}
