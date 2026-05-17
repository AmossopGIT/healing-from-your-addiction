import { SiteLink } from "@/components/SiteLink";
import { WatercolorArtwork } from "@/components/WatercolorArtwork";
import { artGalleryById } from "@/content/artGallery";
import { blogCategoryPath, type BlogCategory } from "@/content/blog";

type BlogCategoryCardProps = {
  category: BlogCategory;
  postCount: number;
};

export function BlogCategoryCard({ category, postCount }: BlogCategoryCardProps) {
  const art = artGalleryById.get(category.heroArtId);

  return (
    <article className="blog-category-card">
      {art ? <WatercolorArtwork item={art} className="card-artwork" sizes="(min-width: 900px) 32vw, 94vw" /> : null}
      <div className="blog-category-card-body">
        <p className="blog-category-card-count">
          {postCount} {postCount === 1 ? "article" : "articles"}
        </p>
        <h3>{category.title}</h3>
        <p>{category.description}</p>
        <SiteLink className="card-link" href={blogCategoryPath(category.slug)}>
          Browse {category.title.toLowerCase()}
        </SiteLink>
      </div>
    </article>
  );
}
