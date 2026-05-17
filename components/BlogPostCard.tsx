import { SiteLink } from "@/components/SiteLink";
import { WatercolorArtwork } from "@/components/WatercolorArtwork";
import { artGalleryById } from "@/content/artGallery";
import { blogCategoryBySlug, blogCategoryPath, blogPath, type BlogPost } from "@/content/blog";
import { formatBlogDate } from "@/lib/formatBlogDate";

type BlogPostCardProps = {
  post: BlogPost;
  showArt?: boolean;
};

export function BlogPostCard({ post, showArt = true }: BlogPostCardProps) {
  const art = artGalleryById.get(post.heroArtId);
  const category = blogCategoryBySlug.get(post.categorySlug);

  return (
    <article className="blog-post-card">
      {showArt && art ? (
        <SiteLink href={blogPath(post.slug)} className="blog-post-card-art-link" aria-hidden tabIndex={-1}>
          <WatercolorArtwork item={art} className="card-artwork" sizes="(min-width: 900px) 28vw, 94vw" />
        </SiteLink>
      ) : null}
      <div className="blog-post-card-body">
        <div className="blog-meta-row">
          {category ? (
            <SiteLink href={blogCategoryPath(category.slug)} className="blog-category-badge">
              {category.title}
            </SiteLink>
          ) : null}
          <time dateTime={post.publishedAt}>{formatBlogDate(post.publishedAt)}</time>
        </div>
        <h3>
          <SiteLink href={blogPath(post.slug)} className="blog-post-card-title">
            {post.title}
          </SiteLink>
        </h3>
        <p>{post.excerpt}</p>
        <SiteLink className="card-link" href={blogPath(post.slug)}>
          Read article
        </SiteLink>
      </div>
    </article>
  );
}
