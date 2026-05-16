import Link from "next/link";
import type { ComponentProps } from "react";
import { withBasePath } from "@/lib/basePath";

type SiteLinkProps = ComponentProps<typeof Link>;

function resolveHref(href: SiteLinkProps["href"]) {
  if (typeof href !== "string") {
    return href;
  }

  if (!href.startsWith("/") || href.startsWith("//")) {
    return href;
  }

  return withBasePath(href);
}

export function SiteLink({ href, ...props }: SiteLinkProps) {
  return <Link href={resolveHref(href)} {...props} />;
}
