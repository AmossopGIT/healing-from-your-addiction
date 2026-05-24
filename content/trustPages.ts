import { seoPages, type SeoPageRecord } from "@/content/seo";

export type TrustH3Item = {
  h3: string;
  body: string;
};

export type GeraldBook = {
  title: string;
  year: string;
  description: string;
  href: string;
};

export const geraldCrawfordBooks: GeraldBook[] = [
  {
    title: "What Men Need: Understanding and Nurturing the Modern Male – A Guidebook for Women",
    year: "2021",
    href: "https://whatmenneed.co.za/",
    description:
      "A guide for women seeking to understand modern men and nurture healthier, more respectful relationships.",
  },
  {
    title: "The Spiritual Mentor: A Guide to Inner Wisdom and Enlightenment",
    year: "2022",
    href: "https://spiritualmentorship.co.za/",
    description: "Explores spiritual mentorship, inner wisdom, and a grounded path toward enlightenment.",
  },
  {
    title: "Developing Your Emotional Intelligence",
    year: "2023",
    href: "https://emotional-intelligence.co.za/",
    description: "Practical guidance for cultivating emotional intelligence, self-regulation, and empathic awareness.",
  },
  {
    title: "Activate Your Self-awareness Workbook",
    year: "2024",
    href: "https://self-awareness.co.za/",
    description: "Workbook-style prompts and exercises to strengthen self-awareness and emotional balance.",
  },
  {
    title: "Remove the Doubt from Your Life",
    year: "2025",
    href: "https://removethedoubt.co.za/",
    description: "Tools to identify, challenge, and release doubt so decisions feel clearer and more grounded.",
  },
  {
    title: "Hypnotherapy Certificate Course – All Inclusive, Start Your Own Business",
    year: "2025",
    href: "https://hypnotherapycertificatecourse.co.za/",
    description: "Training-oriented material for people interested in hypnotherapy practice and ethical client support.",
  },
  {
    title: "Healing in Forgiveness",
    year: "2025",
    href: "https://healinginforgiveness.co.za/",
    description: "Forgiveness as part of emotional and spiritual healing, with practical reflection exercises.",
  },
  {
    title: "Awakening the Healer's Touch: Nourishing the World with Loving Energy",
    year: "2025",
    href: "https://awakeningthehealerstouch.co.za/",
    description: "Explores compassionate presence and the healer's role in offering calm, loving support.",
  },
  {
    title: "Navigating the Six Levels of Relationships",
    year: "2025",
    href: "https://sixleversofrelationships.co.za/",
    description: "A framework for understanding how relationships deepen, strain, and repair across six levels.",
  },
  {
    title: "EFT Tapping Script Workbook",
    year: "2026",
    href: "https://eftscript.co.za/",
    description: "Structured EFT tapping scripts for practitioners and learners working with emotional release.",
  },
  {
    title: "Re-New Your Mind",
    year: "2026",
    href: "https://renewyourmind.co.za/",
    description: "An extended journey through reflective wisdom practices for mental renewal and clarity.",
  },
  {
    title: "Letting Go of Your Fear 365 Times",
    year: "2026",
    href: "https://letgooffear.co.za/",
    description: "Daily reflections to reduce fear's grip on decisions, relationships, and self-trust.",
  },
];

export type TrustSection = {
  eyebrow?: string;
  title: string;
  paragraphs?: string[];
  bullets?: string[];
  h3Items?: TrustH3Item[];
  artId?: string;
};

export type TrustTestimony = {
  name: string;
  quote: string;
};

export type TrustPageLink = {
  label: string;
  href: string;
};

export type TrustPage = {
  seo: SeoPageRecord;
  hero: {
    eyebrow: string;
    title: string;
    description: string;
    primaryCta?: string;
    primaryHref?: string;
    secondaryCta?: string;
    secondaryHref?: string;
  };
  heroArtId: string;
  sections: TrustSection[];
  testimonies?: TrustTestimony[];
  closingParagraphs?: string[];
  links: TrustPageLink[];
  finalCta?: {
    title: string;
    body: string;
    button: string;
    href?: string;
  };
};

function rebrandLegalText(text: string) {
  return text
    .replace(/\bHHC\b/g, "Healing From Your Addiction")
    .replace(/\[Gerald Crawford\s*\]/g, "Gerald Crawford")
    .replace(/\[Western Cape, South Africa\]/g, "Western Cape, South Africa")
    .replace(/\[e-mail\]/g, "email")
    .replace(/\[info@healingfromyouraddiction\.co\.za\]/g, "info@healingfromyouraddiction.co.za")
    .replace(/\[Privacy Policy\]/g, "Privacy Policy");
}

function rebrandSection(section: TrustSection): TrustSection {
  return {
    ...section,
    paragraphs: section.paragraphs?.map(rebrandLegalText),
    bullets: section.bullets?.map(rebrandLegalText),
    h3Items: section.h3Items?.map((item) => ({
      h3: rebrandLegalText(item.h3),
      body: rebrandLegalText(item.body),
    })),
  };
}

const testimonyEntries: TrustTestimony[] = [
  {
    name: "Michael T., 42, Male – Johannesburg",
    quote:
      "I tried everything—rehab, willpower, even isolation. Nothing worked long-term. This was the first time I understood why I was addicted. That changed everything.",
  },
  {
    name: "Lerato M., 34, Female – Pretoria",
    quote:
      "I wasn't addicted to food—I was using it to cope. Once I understood that, the cravings lost their power. I feel free for the first time in years.",
  },
  {
    name: "Jason R., 29, Male – Cape Town",
    quote:
      "This didn't feel like treatment. It felt like finally understanding myself. I didn't just stop drinking—I stopped needing to.",
  },
  {
    name: "Thabo K., 47, Male – Durban",
    quote:
      "I always thought I lacked discipline. Turns out, I had unresolved patterns. Once those shifted, everything else followed naturally.",
  },
  {
    name: "Angela D., 39, Female – Sandton",
    quote:
      "I used shopping to escape stress. Now I actually deal with life instead of running from it. That's the real freedom.",
  },
  {
    name: "Pieter V., 51, Male – Bloemfontein",
    quote:
      "I've been struggling with alcohol for over 20 years. This is the first time I feel calm—not fighting myself every day.",
  },
  {
    name: "Nomsa Z., 27, Female – Soweto",
    quote:
      "I used to feel ashamed of my behaviour. Now I understand it. That alone removed so much of the guilt—and the behaviour started changing.",
  },
  {
    name: "David L., 45, Male – Port Elizabeth",
    quote:
      "This program didn't just help me stop—it helped me rebuild who I am. That's something no other approach ever did.",
  },
  {
    name: "Carla B., 36, Female – Centurion",
    quote:
      "I went from feeling out of control to feeling grounded. It's not about resisting anymore—it's just not who I am now.",
  },
  {
    name: "Sipho N., 31, Male – Nelspruit",
    quote:
      "I thought addiction was my identity. Now I see it was just a pattern. And patterns can change. My life is proof.",
  },
];

export const trustPages = {
  testimonies: {
    seo: seoPages.testimonies,
    hero: {
      eyebrow: "Illustrative stories",
      title: "Testimonies",
      description:
        "Real-world style reflections on the HAHM healing model. These are educational illustrations of pattern change—not guarantees, medical outcomes, or promises of specific results.",
      primaryCta: "Start a Confidential Enquiry",
      secondaryCta: "Browse case studies",
      secondaryHref: "/case-studies/",
    },
    heroArtId: "testimonies-shared-stories",
    sections: [
      {
        title: "Healing From Your Addiction (HAHM Model)",
        paragraphs: [
          "Real World. Real People.",
          "The stories below describe how people relate to cravings, triggers, and behaviour loops after structured hypnotherapy-informed support. Names and details are illustrative and anonymised for privacy.",
        ],
        artId: "gerald-crawford-recovery-path",
      },
    ],
    testimonies: testimonyEntries,
    closingParagraphs: [
      "These are not just success stories.",
      "They are proof that when you address the root, change can become more natural—but every person’s path is different.",
    ],
    links: [
      { label: "Case studies library", href: "/case-studies/" },
      { label: "About Gerald Crawford", href: "/about-the-therapist/" },
      { label: "Medical disclaimer", href: "/medical-disclaimer/" },
      { label: "Contact", href: "/contact/" },
    ],
    finalCta: {
      title: "Ask about support confidentially",
      body: "If a story resonates with your pattern, you can start a private enquiry to explore whether the programme approach may fit your situation.",
      button: "Start Your Confidential Enquiry",
      href: "/contact/#enquiry",
    },
  },
  books: {
    seo: seoPages.otherBooks,
    hero: {
      eyebrow: "Author background",
      title: "Other Books Written by Gerald Crawford",
      description:
        "Explore Gerald Crawford's books on emotional intelligence, relationships, forgiveness, hypnotherapy training, and self-awareness—alongside his addiction pattern support work in South Africa.",
      primaryCta: "About Gerald Crawford",
      primaryHref: "/about-the-therapist/",
      secondaryCta: "Start a Confidential Enquiry",
      secondaryHref: "/contact/#enquiry",
    },
    heroArtId: "gerald-crawford-books",
    sections: [],
    links: [
      { label: "About Gerald Crawford", href: "/about-the-therapist/" },
      { label: "Hypnotherapy for addiction", href: "/hypnotherapy-for-addiction/" },
      { label: "Contact", href: "/contact/" },
    ],
    finalCta: {
      title: "Explore addiction pattern support",
      body: "Gerald's books sit alongside his confidential hypnotherapy and EFT-informed addiction support. Start with a private enquiry if you want to discuss your pattern.",
      button: "Start Your Confidential Enquiry",
      href: "/contact/#enquiry",
    },
  },
  terms: {
    seo: seoPages.terms,
    hero: {
      eyebrow: "Legal",
      title: "Terms and Conditions of Use",
      description:
        "These terms govern use of the Healing From Your Addiction website operated by Gerald Crawford. Effective 1 May 2026. Please read them alongside the privacy policy and medical disclaimer.",
      primaryCta: "Privacy Policy",
      primaryHref: "/privacy-policy/",
      secondaryCta: "Medical Disclaimer",
      secondaryHref: "/medical-disclaimer/",
    },
    heroArtId: "terms-site-use",
    sections: [
      rebrandSection({
        title: "Introduction",
        paragraphs: [
          "Welcome to Healing From Your Addiction. These Terms and Conditions of Use (\"Terms\") govern your use of this website. By accessing or using the website, you agree to be bound by these Terms.",
        ],
      }),
      rebrandSection({
        title: "Use of the website",
        bullets: [
          "The website is intended for personal, non-commercial use.",
          "You may not use the website for any purpose that is unlawful or prohibited by these Terms.",
          "You may not use the website in a way that could damage, disable, overburden, or impair the website or interfere with anyone else's use of the website.",
          "You may not attempt to gain unauthorized access to the website, any part of the website, or any other accounts, computer systems, or networks connected to the website.",
        ],
      }),
      rebrandSection({
        title: "Intellectual property",
        bullets: [
          "All content on the website, including text, images, graphics, and software, is the property of Gerald Crawford or its licensors unless stated otherwise.",
          "You may not reproduce, modify, distribute, or display any content on the website without prior written consent from Gerald Crawford.",
          "You may not use any content on the website for commercial purposes without prior written consent from Gerald Crawford.",
        ],
      }),
      rebrandSection({
        title: "Privacy",
        bullets: [
          "Gerald Crawford respects your privacy and is committed to protecting your personal data.",
          "By using the website, you agree to the Privacy Policy.",
          "We will not sell, rent, or trade your personal data to any third party.",
        ],
      }),
      rebrandSection({
        title: "Links to other websites",
        bullets: [
          "The website may contain links to other websites that are not owned or controlled by Gerald Crawford.",
          "We are not responsible for the content, policies, or practices of any other website.",
          "You should review the terms and conditions and privacy policy of any other website before using it.",
        ],
      }),
      rebrandSection({
        title: "Disclaimer",
        bullets: [
          "The website is provided \"as is\" and \"as available\".",
          "Gerald Crawford makes no warranties, express or implied, about the website, including its accuracy, completeness, or reliability.",
          "Gerald Crawford is not responsible for any loss or damage that may occur as a result of using the website.",
          "Addiction support content is educational and does not replace medical, psychiatric, or emergency care. See the Medical Disclaimer for safety boundaries.",
        ],
      }),
      rebrandSection({
        title: "Limitation of liability",
        bullets: [
          "In no event will Gerald Crawford be liable for any indirect, special, consequential, or punitive damages arising out of or in connection with use of the website.",
          "Gerald Crawford's liability for direct damages shall be limited to the amount of fees, if any, paid by you for use of the website.",
        ],
      }),
      rebrandSection({
        title: "Governing law",
        bullets: [
          "These Terms will be governed by and construed in accordance with the laws of Western Cape, South Africa.",
          "Any disputes arising out of or in connection with these Terms will be resolved through good-faith communication by email where possible.",
        ],
      }),
      rebrandSection({
        title: "Changes to these terms",
        bullets: [
          "Gerald Crawford may modify these Terms at any time, with or without notice.",
          "By continuing to use the website after changes are posted, you agree to be bound by the modified Terms.",
        ],
      }),
      rebrandSection({
        title: "Contact us",
        paragraphs: [
          "If you have any questions or concerns about these Terms, please contact info@healingfromyouraddiction.co.za.",
          "By using the website, you acknowledge that you have read, understand, and agree to be bound by these Terms.",
          "Last updated: 1 May 2026.",
        ],
      }),
    ],
    links: [
      { label: "Privacy Policy", href: "/privacy-policy/" },
      { label: "Medical Disclaimer", href: "/medical-disclaimer/" },
      { label: "Contact", href: "/contact/" },
    ],
  },
} satisfies Record<string, TrustPage>;
