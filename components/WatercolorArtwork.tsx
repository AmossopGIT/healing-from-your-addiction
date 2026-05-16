import Image from "next/image";
import type { ArtGalleryItem } from "@/content/artGallery";
import { withBasePath } from "@/lib/basePath";

type WatercolorArtworkProps = {
  item: ArtGalleryItem;
  className?: string;
  priority?: boolean;
  sizes?: string;
  fill?: boolean;
};

export function WatercolorArtwork({
  item,
  className = "",
  priority = false,
  sizes = "(min-width: 900px) 38vw, 92vw",
  fill = false,
}: WatercolorArtworkProps) {
  const figureClass = `watercolor-art ${className}`.trim();

  if (fill) {
    return (
      <figure className={figureClass}>
        <Image
          src={withBasePath(item.src)}
          alt={item.alt}
          fill
          priority={priority}
          sizes={sizes}
          className="watercolor-art-image"
        />
      </figure>
    );
  }

  return (
    <figure className={figureClass}>
      <Image
        src={withBasePath(item.src)}
        alt={item.alt}
        width={1024}
        height={640}
        priority={priority}
        sizes={sizes}
        className="watercolor-art-image"
      />
    </figure>
  );
}
