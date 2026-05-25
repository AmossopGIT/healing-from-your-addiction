import type { MetadataRoute } from "next";
import { withBasePath } from "@/lib/basePath";
import { siteConfig } from "@/lib/constants";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: withBasePath("/"),
    name: siteConfig.name,
    short_name: "HFYA",
    description: siteConfig.description,
    start_url: withBasePath("/"),
    scope: withBasePath("/"),
    display: "standalone",
    display_override: ["window-controls-overlay", "standalone", "minimal-ui"],
    orientation: "portrait",
    background_color: "#f7f3ea",
    theme_color: "#f7f3ea",
    categories: ["health", "education", "lifestyle"],
    lang: "en-ZA",
    icons: [
      {
        src: withBasePath("/icon.svg"),
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
      {
        src: withBasePath("/icon-maskable.svg"),
        sizes: "any",
        type: "image/svg+xml",
        purpose: "maskable",
      },
    ],
    shortcuts: [
      {
        name: "Programs",
        short_name: "Programs",
        description: "Explore structured support programmes",
        url: withBasePath("/programs/"),
      },
      {
        name: "Resources",
        short_name: "Resources",
        description: "Read articles and case studies",
        url: withBasePath("/blog/"),
      },
      {
        name: "Contact",
        short_name: "Contact",
        description: "Start a confidential enquiry",
        url: withBasePath("/contact/"),
      },
      {
        name: "Client portal",
        short_name: "Portal",
        description: "Open the private client portal",
        url: withBasePath("/portal/login/"),
      },
    ],
  };
}
