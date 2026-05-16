import { blogCategories } from "@/content/blog";
import { permanentRedirect } from "next/navigation";

type PageProps = {
  params: Promise<{ slug: string; page: string }>;
};

export function generateStaticParams() {
  return blogCategories.flatMap((category) =>
    ["2", "3", "4"].map((page) => ({
      slug: category.slug,
      page,
    })),
  );
}

export default async function LegacyCategoryPaginationRedirectPage({ params }: PageProps) {
  const { slug } = await params;
  permanentRedirect(`/blog/category/${slug}/`);
}

