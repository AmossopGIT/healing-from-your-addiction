import type { NextConfig } from "next";

const githubRepo = "healing-from-your-addiction";
const isGithubPages = process.env.GITHUB_PAGES === "true";
const basePath = isGithubPages ? `/${githubRepo}` : "";

const nextConfig: NextConfig = {
  output: isGithubPages ? "export" : undefined,
  basePath: basePath || undefined,
  assetPrefix: basePath ? `${basePath}/` : undefined,
  trailingSlash: true,
  poweredByHeader: false,
  images: {
    unoptimized: isGithubPages,
    formats: ["image/avif", "image/webp"],
  },
  async redirects() {
    return [
      {
        source: "/hypnotherapy-addiction-healing-programs/",
        destination: "/blog/what-makes-hypnotherapy-programs-effective/",
        permanent: true,
      },
      {
        source: "/hypnotherapy-for-addiction/",
        destination: "/blog/how-hypnotherapy-works-in-addiction-support/",
        permanent: true,
      },
      {
        source: "/addiction-recovery-south-africa/",
        destination: "/blog/addiction-recovery-south-africa-core-approaches/",
        permanent: true,
      },
      {
        source: "/psychological-vs-physical-dependence/",
        destination: "/blog/psychological-vs-physical-dependence/",
        permanent: true,
      },
      {
        source: "/category/healing-program/",
        destination: "/blog/category/healing-program/",
        permanent: true,
      },
      {
        source: "/signs-of-behavioral-addictions/",
        destination: "/blog/signs-of-behavioral-addictions/",
        permanent: true,
      },
      {
        source: "/signs-of-substance-addictions/",
        destination: "/blog/signs-of-substance-addictions/",
        permanent: true,
      },
      {
        source: "/one-unified-model-of-addiction/",
        destination: "/blog/one-unified-model-of-addiction/",
        permanent: true,
      },
      {
        source: "/the-core-pattern-behind-all-addictions/",
        destination: "/blog/the-core-pattern-behind-all-addictions/",
        permanent: true,
      },
      {
        source: "/addictions-develop-from-a-combination-of-biological-psychological-and-environmental-factors/",
        destination:
          "/blog/addictions-develop-from-a-combination-of-biological-psychological-and-environmental-factors/",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
