import Image from "next/image";
import type { ArtGalleryItem } from "@/content/artGallery";
import { withBasePath } from "@/lib/basePath";

type WatercolorArtworkProps = {
  item: ArtGalleryItem;
  className?: string;
  priority?: boolean;
  sizes?: string;
};

export function WatercolorArtwork({
  item,
  className = "",
  priority = false,
  sizes = "(min-width: 900px) 38vw, 92vw",
}: WatercolorArtworkProps) {
  return (
    <figure className={`watercolor-art ${className}`.trim()}>
      <Image
        src={withBasePath(item.src)}
        alt={item.alt}
        width={1024}
        height={640}
        priority={priority}
        sizes={sizes}
      />
    </figure>
  );
}
