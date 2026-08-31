import type { NextConfig } from "next";

const githubRepo = "healing-from-your-addiction";
const isGithubPages = process.env.GITHUB_PAGES === "true";
const pagesAssetPrefix = isGithubPages ? `/${githubRepo}` : "";

const nextConfig: NextConfig = {
  output: isGithubPages ? "export" : undefined,
  assetPrefix: pagesAssetPrefix ? `${pagesAssetPrefix}/` : undefined,
  trailingSlash: true,
  poweredByHeader: false,
  // Admin markdown docs are read at runtime via fs; NFT cannot see dynamic cwd paths,
  // so include them explicitly. Do not exclude content/admin-docs or registry docs files.
  outputFileTracingIncludes: {
    "/admin/docs": [
      "./content/admin-docs/**/*",
      "./docs/CMS_BLOG_ADMIN.md",
      "./docs/MARKETING_GERALD_CHECKLIST.md",
      "./docs/DEPLOY_PRODUCTION.md",
    ],
    "/admin/docs/[slug]": [
      "./content/admin-docs/**/*",
      "./docs/CMS_BLOG_ADMIN.md",
      "./docs/MARKETING_GERALD_CHECKLIST.md",
      "./docs/DEPLOY_PRODUCTION.md",
    ],
  },
  outputFileTracingExcludes: {
    "*": [
      "public/**",
      "tools/**",
      "boilerplate/**",
      "docs/**",
      "supabase/**",
      ".git/**",
      "content/interactiveProgrammes/generated/**",
      "content/blogArchive*.ts",
      "content/caseStudyArchive*.ts",
    ],
    "/admin/docs": [
      "public/**",
      "tools/**",
      "boilerplate/**",
      "supabase/**",
      ".git/**",
      "content/interactiveProgrammes/**",
      "content/artGallery.ts",
      "content/blog*.ts",
      "content/caseStud*.ts",
    ],
    "/admin/docs/[slug]": [
      "public/**",
      "tools/**",
      "boilerplate/**",
      "supabase/**",
      ".git/**",
      "content/interactiveProgrammes/**",
      "content/artGallery.ts",
      "content/blog*.ts",
      "content/caseStud*.ts",
    ],
  },
  images: {
    unoptimized: isGithubPages,
    formats: ["image/avif", "image/webp"],
  },
  async redirects() {
    return [
      {
        source: "/cravings/urge-surfing/",
        destination: "/eft-tapping-for-cravings/",
        permanent: true,
      },
      {
        source: "/about-gerald-crawford/",
        destination: "/about-the-therapist/",
        permanent: true,
      },
      {
        source: "/hypnotherapy-addiction-healing-programs/",
        destination: "/blog/what-makes-hypnotherapy-programs-effective/",
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
      {
        source: "/cross-addictions/",
        destination: "/blog/cross-addictions/",
        permanent: true,
      },
      {
        source: "/hypnotherapy-addiction-healing-model-hahm-model/",
        destination: "/blog/hypnotherapy-addiction-healing-model-hahm-model/",
        permanent: true,
      },
      {
        source: "/hypnotherapy-addiction-teaching-and-education-model-htem-model/",
        destination: "/blog/hypnotherapy-addiction-teaching-and-education-model-htem-model/",
        permanent: true,
      },
      {
        source: "/core-themes-in-website-healing-from-your-addiction-using-hypnotherapy/",
        destination: "/blog/core-themes-in-website-healing-from-your-addiction-using-hypnotherapy/",
        permanent: true,
      },
      {
        source: "/core-topics-covered-in-the-website-healing-from-your-addiction-using-hypnotherapy/",
        destination: "/blog/core-topics-covered-in-the-website-healing-from-your-addiction-using-hypnotherapy/",
        permanent: true,
      },
      {
        source: "/gambling-addiction-gambling-disorder-healing-program/",
        destination: "/addictions/gambling-addiction-help/",
        permanent: true,
      },
      {
        source: "/gambling-addiction-help/",
        destination: "/addictions/gambling-addiction-help/",
        permanent: true,
      },
      {
        source: "/food-addiction-binge-eating-help/",
        destination: "/addictions/food-addiction-binge-eating-help/",
        permanent: true,
      },
      {
        source: "/food-addiction-binge-eating-healing-program/",
        destination: "/addictions/food-addiction-binge-eating-help/",
        permanent: true,
      },
      {
        source: "/addiction-healing-programmes/",
        destination: "/programs/",
        permanent: true,
      },
      {
        source: "/addiction-help/gambling/",
        destination: "/addictions/gambling-addiction-help/",
        permanent: true,
      },
      {
        source: "/addiction-help/food-binge-eating/",
        destination: "/addictions/food-addiction-binge-eating-help/",
        permanent: true,
      },
      {
        source: "/addiction-help/alcohol/",
        destination: "/addictions/alcohol-addiction-help/",
        permanent: true,
      },
      {
        source: "/addiction-help/cannabis/",
        destination: "/addictions/cannabis-addiction-help/",
        permanent: true,
      },
      {
        source: "/addiction-help/nicotine/",
        destination: "/addictions/nicotine-addiction-help/",
        permanent: true,
      },
      {
        source: "/addiction-help/pornography/",
        destination: "/addictions/pornography-addiction-help/",
        permanent: true,
      },
      {
        source: "/addiction-help/social-media/",
        destination: "/addictions/social-media-addiction-help/",
        permanent: true,
      },
      {
        source: "/addiction-help/gaming/",
        destination: "/addictions/gaming-addiction-help/",
        permanent: true,
      },
            {
        source: "/case-study-307-profound-changes-after-undergoing-the-4-week-healing-from-your-food-addiction-binge-eating-healing-therapy-model-hahm-model-real-world-real-people/",
        destination: "/case-studies/food-binge-eating-hahm-recovery-story/",
        permanent: true,
      },
      {
        source: "/case-study-301-profound-changes-after-undergoing-the-4-week-healing-from-your-sex-addiction-healing-therapy-model-hahm-model-real-world-real-people/",
        destination: "/case-studies/sex-addiction-hahm-recovery-story/",
        permanent: true,
      },
      {
        source: "/case-study-202-more-peace-and-calm-experiencing-after-4-week-healing-from-your-alcohol-addiction-alcohol-use-disorder-real-world-real-people/",
        destination: "/case-studies/alcohol-use-disorder-recovery-peace/",
        permanent: true,
      },
      {
        source: "/case-study-302-profound-changes-after-undergoing-the-4-week-healing-from-your-shopping-addiction-compulsive-buying-healing-therapy-model-hahm-model-real-world-real-people/",
        destination: "/case-studies/shopping-addiction-hahm-recovery-story/",
        permanent: true,
      },
      {
        source: "/case-study-642-more-peace-and-calm-experiencing-after-4-week-healing-from-your-pornography-addiction-real-world-real-people/",
        destination: "/case-studies/pornography-addiction-recovery-peace/",
        permanent: true,
      },
      {
        source: "/case-study-203-more-peace-and-calm-experiencing-after-4-week-healing-from-your-alcohol-addiction-alcohol-use-disorder-real-world-real-people/",
        destination: "/case-studies/alcohol-addiction-recovery-calm/",
        permanent: true,
      },
      {
        source: "/case-study-423-more-peace-and-calm-experiencing-after-4-week-healing-from-your-gaming-addiction-internet-gaming-disorder-real-world-real-people/",
        destination: "/case-studies/gaming-disorder-recovery-peace/",
        permanent: true,
      },
      {
        source: "/case-study-220-more-peace-and-calm-experiencing-after-4-week-healing-from-your-nicotine-addiction-cigarettes-vaping-real-world-real-people/",
        destination: "/case-studies/nicotine-addiction-recovery-peace/",
        permanent: true,
      },
      {
        source: "/case-study-640-more-peace-and-calm-experiencing-after-4-week-healing-from-your-pornography-addiction-real-world-real-people/",
        destination: "/case-studies/pornography-recovery-peace-and-calm/",
        permanent: true,
      },
      {
        source: "/case-study-320-more-peace-and-calm-experiencing-after-4-week-healing-from-your-cannabis-dependence-addiction-real-world-real-people/",
        destination: "/case-studies/cannabis-dependence-recovery-peace/",
        permanent: true,
      },
      {
        source: "/case-study-422-more-peace-and-calm-experiencing-after-4-week-healing-from-your-social-media-addiction-real-world-real-people/",
        destination: "/case-studies/social-media-addiction-recovery-peace/",
        permanent: true,
      },
      {
        source: "/case-study-201-more-peace-and-calm-experiencing-after-4-week-healing-from-your-alcohol-addiction-alcohol-use-disorder-real-world-real-people/",
        destination: "/case-studies/alcohol-recovery-peace-after-four-weeks/",
        permanent: true,
      },
      {
        source: "/case-study-641-more-peace-and-calm-experiencing-after-4-week-healing-from-your-pornography-addiction-real-world-real-people/",
        destination: "/case-studies/pornography-addiction-calmer-responses/",
        permanent: true,
      },
      {
        source: "/case-study-420-more-peace-and-calm-experiencing-after-4-week-healing-from-your-gambling-addiction-gambling-disorder-real-world-real-people/",
        destination: "/case-studies/gambling-disorder-recovery-peace/",
        permanent: true,
      },
      {
        source: "/case-study-421-more-peace-and-calm-experiencing-after-4-week-healing-from-your-internet-addiction-real-world-real-people/",
        destination: "/case-studies/internet-addiction-recovery-peace/",
        permanent: true,
      },
      {
        source: "/case-study-00744-10-january-2026-gambling-addiction-gambling-disorder-eft-tapping-emotionally-focused-therapy-script/",
        destination: "/case-studies/gambling-disorder-eft-tapping-script/",
        permanent: true,
      },
      {
        source: "/case-study-00830-week-1-custom-healing-hypnotherapy-script-to-address-your-cannabis-dependence/",
        destination: "/case-studies/cannabis-dependence-hypnotherapy-week-one-script/",
        permanent: true,
      },
      {
        source: "/case-study-00744-week-1-custom-healing-hypnotherapy-script-to-address-your-gambling-addiction-gambling-disorder/",
        destination: "/case-studies/gambling-disorder-hypnotherapy-week-one-script/",
        permanent: true,
      },
      {
        source: "/case-study-00931-week-1-custom-healing-hypnotherapy-script-to-address-your-alcohol-addiction-alcohol-use-disorder/",
        destination: "/case-studies/alcohol-use-disorder-hypnotherapy-week-one-script/",
        permanent: true,
      },
      {
        source: "/case-study-00931-20-march-2026-4-week-custom-healing-program-to-address-your-alcohol-addiction-alcohol-use-disorder-with-hypnotherapy/",
        destination: "/case-studies/alcohol-use-disorder-four-week-healing-program/",
        permanent: true,
      },
      {
        source: "/case-study-00744-10-january-2026-4-week-custom-healing-program-to-address-your-gambling-addiction-gambling-disorder-with-hypnotherapy/",
        destination: "/case-studies/gambling-disorder-four-week-healing-program/",
        permanent: true,
      },
      {
        source: "/case-study-00521-17-april-2026-4-week-custom-healing-program-to-address-your-pornography-addiction-with-hypnotherapy/",
        destination: "/case-studies/pornography-addiction-four-week-healing-program/",
        permanent: true,
      },
      {
        source: "/case-study-00521-week-1-custom-healing-hypnotherapy-script-to-address-your-pornography-addiction/",
        destination: "/case-studies/pornography-addiction-hypnotherapy-week-one-script/",
        permanent: true,
      },
      {
        source: "/case-study-00830-12-february-2026-4-week-custom-healing-program-to-address-your-cannabis-dependence-with-hypnotherapy/",
        destination: "/case-studies/cannabis-dependence-four-week-healing-program/",
        permanent: true,
      },
      {
        source: "/case-study-00830-12-february-2026-cannabis-dependence-eft-tapping-emotionally-focused-therapy-script/",
        destination: "/case-studies/cannabis-dependence-eft-tapping-script/",
        permanent: true,
      },
      {
        source: "/case-study-00931-20-march-2026-alcohol-addiction-alcohol-use-disorder-eft-tapping-emotionally-focused-therapy-script/",
        destination: "/case-studies/alcohol-use-disorder-eft-tapping-script/",
        permanent: true,
      },
      {
        source: "/case-study-00521-17-april-2026-pornography-addiction-eft-tapping-emotionally-focused-therapy-script/",
        destination: "/case-studies/pornography-addiction-eft-tapping-script/",
        permanent: true,
      },
      {
        source: "/case-study-00931-20-march-2026-30-affirmation-to-help-you-with-your-cope-with-you-alcohol-addiction-alcohol-use-disorder-and-performance/",
        destination: "/case-studies/alcohol-addiction-affirmations-performance/",
        permanent: true,
      },
      {
        source: "/case-study-00521-17-april-2026-30-questions-a-hypnotherapist-might-ask-to-customize-a-healing-program-for-you-to-address-your-pornography-addiction-using-hypnotherapy/",
        destination: "/case-studies/pornography-addiction-hypnotherapy-intake-questions/",
        permanent: true,
      },
      {
        source: "/case-study-00830-12-february-2026-30-questions-a-hypnotherapist-might-ask-to-customize-a-healing-program-for-you-to-address-your-cannabis-dependence-using-hypnotherapy/",
        destination: "/case-studies/cannabis-dependence-hypnotherapy-intake-questions/",
        permanent: true,
      },
      {
        source: "/case-study-00744-10-january-2026-30-affirmation-to-help-you-with-your-cope-with-you-gambling-addiction-gambling-disorder-and-performance/",
        destination: "/case-studies/gambling-addiction-affirmations-performance/",
        permanent: true,
      },
      {
        source: "/case-study-00744-10-january-2026-30-questions-a-hypnotherapist-might-ask-to-customize-a-healing-program-for-you-to-address-your-gambling-addiction-gambling-disorder-using-hypnoth/",
        destination: "/case-studies/gambling-disorder-hypnotherapy-intake-questions/",
        permanent: true,
      },
      {
        source: "/case-study-00830-12-february-2026-30-affirmation-to-help-you-with-your-cope-with-you-cannabis-dependence-and-performance/",
        destination: "/case-studies/cannabis-dependence-affirmations-performance/",
        permanent: true,
      },
      {
        source: "/case-study-00931-20-march-2026-30-questions-a-hypnotherapist-might-ask-to-customize-a-healing-program-for-you-to-address-your-alcohol-addiction-alcohol-use-disorder-using-hypnoth/",
        destination: "/case-studies/alcohol-addiction-hypnotherapy-intake-questions/",
        permanent: true,
      },
      {
        source: "/case-study-00521-17-april-2026-30-affirmation-to-help-you-with-your-cope-with-you-pornography-addiction-and-performance/",
        destination: "/case-studies/pornography-addiction-affirmations-performance/",
        permanent: true,
      },
      {
        source: "/case-studies/cs-307-food-binge-eating-profound/",
        destination: "/case-studies/food-binge-eating-hahm-recovery-story/",
        permanent: true,
      },
      {
        source: "/case-studies/cs-301-sex-profound/",
        destination: "/case-studies/sex-addiction-hahm-recovery-story/",
        permanent: true,
      },
      {
        source: "/case-studies/cs-202-alcohol-peace/",
        destination: "/case-studies/alcohol-use-disorder-recovery-peace/",
        permanent: true,
      },
      {
        source: "/case-studies/cs-302-shopping-profound/",
        destination: "/case-studies/shopping-addiction-hahm-recovery-story/",
        permanent: true,
      },
      {
        source: "/case-studies/cs-642-pornography-peace/",
        destination: "/case-studies/pornography-addiction-recovery-peace/",
        permanent: true,
      },
      {
        source: "/case-studies/cs-203-alcohol-peace/",
        destination: "/case-studies/alcohol-addiction-recovery-calm/",
        permanent: true,
      },
      {
        source: "/case-studies/cs-423-gaming-peace/",
        destination: "/case-studies/gaming-disorder-recovery-peace/",
        permanent: true,
      },
      {
        source: "/case-studies/cs-220-nicotine-peace/",
        destination: "/case-studies/nicotine-addiction-recovery-peace/",
        permanent: true,
      },
      {
        source: "/case-studies/cs-640-pornography-peace/",
        destination: "/case-studies/pornography-recovery-peace-and-calm/",
        permanent: true,
      },
      {
        source: "/case-studies/cs-320-cannabis-peace/",
        destination: "/case-studies/cannabis-dependence-recovery-peace/",
        permanent: true,
      },
      {
        source: "/case-studies/cs-422-social-media-peace/",
        destination: "/case-studies/social-media-addiction-recovery-peace/",
        permanent: true,
      },
      {
        source: "/case-studies/cs-201-alcohol-peace/",
        destination: "/case-studies/alcohol-recovery-peace-after-four-weeks/",
        permanent: true,
      },
      {
        source: "/case-studies/cs-641-pornography-peace/",
        destination: "/case-studies/pornography-addiction-calmer-responses/",
        permanent: true,
      },
      {
        source: "/case-studies/cs-420-gambling-peace/",
        destination: "/case-studies/gambling-disorder-recovery-peace/",
        permanent: true,
      },
      {
        source: "/case-studies/cs-421-internet-peace/",
        destination: "/case-studies/internet-addiction-recovery-peace/",
        permanent: true,
      },
      {
        source: "/case-studies/cs-00744-gambling-eft/",
        destination: "/case-studies/gambling-disorder-eft-tapping-script/",
        permanent: true,
      },
      {
        source: "/case-studies/cs-00830-cannabis-hypno-week1/",
        destination: "/case-studies/cannabis-dependence-hypnotherapy-week-one-script/",
        permanent: true,
      },
      {
        source: "/case-studies/cs-00744-gambling-hypno-week1/",
        destination: "/case-studies/gambling-disorder-hypnotherapy-week-one-script/",
        permanent: true,
      },
      {
        source: "/case-studies/cs-00931-alcohol-hypno-week1/",
        destination: "/case-studies/alcohol-use-disorder-hypnotherapy-week-one-script/",
        permanent: true,
      },
      {
        source: "/case-studies/cs-00931-alcohol-programme/",
        destination: "/case-studies/alcohol-use-disorder-four-week-healing-program/",
        permanent: true,
      },
      {
        source: "/case-studies/cs-00744-gambling-programme/",
        destination: "/case-studies/gambling-disorder-four-week-healing-program/",
        permanent: true,
      },
      {
        source: "/case-studies/cs-00521-pornography-programme/",
        destination: "/case-studies/pornography-addiction-four-week-healing-program/",
        permanent: true,
      },
      {
        source: "/case-studies/cs-00521-pornography-hypno-week1/",
        destination: "/case-studies/pornography-addiction-hypnotherapy-week-one-script/",
        permanent: true,
      },
      {
        source: "/case-studies/cs-00830-cannabis-programme/",
        destination: "/case-studies/cannabis-dependence-four-week-healing-program/",
        permanent: true,
      },
      {
        source: "/case-studies/cs-00830-cannabis-eft/",
        destination: "/case-studies/cannabis-dependence-eft-tapping-script/",
        permanent: true,
      },
      {
        source: "/case-studies/cs-00931-alcohol-eft/",
        destination: "/case-studies/alcohol-use-disorder-eft-tapping-script/",
        permanent: true,
      },
      {
        source: "/case-studies/cs-00521-pornography-eft/",
        destination: "/case-studies/pornography-addiction-eft-tapping-script/",
        permanent: true,
      },
      {
        source: "/case-studies/cs-00931-alcohol-affirmations/",
        destination: "/case-studies/alcohol-addiction-affirmations-performance/",
        permanent: true,
      },
      {
        source: "/case-studies/cs-00521-pornography-questions/",
        destination: "/case-studies/pornography-addiction-hypnotherapy-intake-questions/",
        permanent: true,
      },
      {
        source: "/case-studies/cs-00830-cannabis-questions/",
        destination: "/case-studies/cannabis-dependence-hypnotherapy-intake-questions/",
        permanent: true,
      },
      {
        source: "/case-studies/cs-00744-gambling-affirmations/",
        destination: "/case-studies/gambling-addiction-affirmations-performance/",
        permanent: true,
      },
      {
        source: "/case-studies/cs-00744-gambling-questions/",
        destination: "/case-studies/gambling-disorder-hypnotherapy-intake-questions/",
        permanent: true,
      },
      {
        source: "/case-studies/cs-00830-cannabis-affirmations/",
        destination: "/case-studies/cannabis-dependence-affirmations-performance/",
        permanent: true,
      },
      {
        source: "/case-studies/cs-00931-alcohol-questions/",
        destination: "/case-studies/alcohol-addiction-hypnotherapy-intake-questions/",
        permanent: true,
      },
      {
        source: "/case-studies/cs-00521-pornography-affirmations/",
        destination: "/case-studies/pornography-addiction-affirmations-performance/",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
