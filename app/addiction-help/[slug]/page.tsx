import { permanentRedirect } from "next/navigation";
import { programmes, programmeBySlug } from "@/content/programmes";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  return programmes.map((programme) => ({ slug: programme.slug }));
}

export default async function PillarProgrammePage({ params }: PageProps) {
  const { slug } = await params;
  const programme = programmeBySlug.get(slug);
  permanentRedirect(programme?.pillarHref ?? "/addictions/");
}
