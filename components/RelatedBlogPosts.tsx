import Link from "next/link";
import { BlogPostCard } from "@/components/BlogPostCard";
import { blogPosts, type BlogPost } from "@/content/blog";

type RelatedBlogPostsProps = {
  currentSlug: string;
  categorySlug: string;
  limit?: number;
};

export function RelatedBlogPosts({ currentSlug, categorySlug, limit = 3 }: RelatedBlogPostsProps) {
  const related = blogPosts
    .filter((post) => post.categorySlug === categorySlug && post.slug !== currentSlug)
    .slice(0, limit);

  if (!related.length) return null;

  return (
    <section className="blog-related-posts section" aria-labelledby="related-posts-heading">
      <div className="container narrow">
        <h2 id="related-posts-heading">Related reading</h2>
        <div className="blog-card-grid">
          {related.map((post) => (
            <BlogPostCard key={post.slug} post={post} />
          ))}
        </div>
        <p className="blog-related-more">
          <Link href={`/blog/category/${categorySlug}/`}>Browse more in this category</Link>
        </p>
      </div>
    </section>
  );
}

export function getRelatedPosts(currentSlug: string, categorySlug: string, limit = 3): BlogPost[] {
  return blogPosts
    .filter((post) => post.categorySlug === categorySlug && post.slug !== currentSlug)
    .slice(0, limit);
}
