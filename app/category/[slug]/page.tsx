import { blogCategories } from "@/content/blog";
import { permanentRedirect } from "next/navigation";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return blogCategories.map((category) => ({ slug: category.slug }));
}

export default async function LegacyCategoryRedirectPage({ params }: PageProps) {
  const { slug } = await params;
  permanentRedirect(`/blog/category/${slug}/`);
}

