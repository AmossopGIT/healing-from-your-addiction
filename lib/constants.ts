import { withBasePath } from "@/lib/basePath";

export const siteConfig = {
  name: "Healing From Your Addiction",
  owner: "Gerald Crawford",
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || "https://healingfromyouraddiction.co.za",
  description:
    "Confidential hypnotherapy and EFT-based support for addiction patterns, cravings, gambling addiction, food addiction and emotional triggers in South Africa.",
  email: process.env.NEXT_PUBLIC_CONTACT_EMAIL || "start@healingfromyouraddiction.co.za",
  phone: process.env.NEXT_PUBLIC_CONTACT_PHONE || "087 379 7668",
  whatsappNumber: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "",
  locale: "en_ZA",
};

export const siteSocialLinks = {
  facebook: "https://www.facebook.com/profile.php?id=61590084852348",
  instagram: "https://www.instagram.com/healingfromyouraddiction/",
} as const;

export const addictionOptions = [
  "Gambling",
  "Food / binge eating",
  "Alcohol",
  "Cannabis",
  "Nicotine",
  "Pornography",
  "Social media",
  "Gaming",
  "Other",
] as const;

export const contactMethods = ["WhatsApp", "Phone", "Email"] as const;

export const standardDisclaimer =
  "Healing From Your Addiction provides hypnotherapy, EFT, coaching-style support and educational resources. This is not a replacement for medical detox, psychiatric treatment, emergency care or licensed rehabilitation where those services are required. If you are experiencing severe withdrawal symptoms, overdose risk, suicidal thoughts or a medical emergency, please contact a doctor, emergency service or qualified addiction treatment centre immediately.";

export function absoluteUrl(path = "/") {
  const base = siteConfig.siteUrl.replace(/\/$/, "");
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${base}${cleanPath}`;
}

export function whatsappHref(message = "Hello Gerald, I would like to make a confidential enquiry about addiction support.") {
  if (!siteConfig.whatsappNumber) {
    return withBasePath("/contact/#enquiry");
  }

  return `https://wa.me/${siteConfig.whatsappNumber}?text=${encodeURIComponent(message)}`;
}

export function emailHref(subject = "Confidential addiction support enquiry") {
  return `mailto:${siteConfig.email}?subject=${encodeURIComponent(subject)}`;
}

export function phoneHref() {
  const normalized = normalizeSouthAfricanPhone(siteConfig.phone);
  return normalized ? `tel:${normalized}` : withBasePath("/contact/#enquiry");
}

function digitsOnly(value: string) {
  return value.replace(/\D+/g, "");
}

export function normalizeSouthAfricanPhone(phone: string) {
  const trimmed = phone.trim();
  if (!trimmed) return "";

  const hasPlus = trimmed.startsWith("+");
  const rawDigits = digitsOnly(trimmed);

  if (hasPlus && rawDigits.startsWith("27") && rawDigits.length >= 11) {
    return `+${rawDigits}`;
  }

  if (rawDigits.startsWith("27") && rawDigits.length >= 11) {
    return `+${rawDigits}`;
  }

  if (rawDigits.startsWith("0") && rawDigits.length >= 10) {
    return `+27${rawDigits.slice(1)}`;
  }

  return hasPlus ? `+${rawDigits}` : rawDigits;
}

export function formatSouthAfricanPhone(phone: string) {
  const normalized = normalizeSouthAfricanPhone(phone);
  if (!normalized.startsWith("+27")) return normalized;

  const localDigits = normalized.slice(3);
  const area = localDigits.slice(0, 2);
  const first = localDigits.slice(2, 5);
  const last = localDigits.slice(5, 9);
  if (!area || !first || !last) return normalized;

  return `+27 ${area} ${first} ${last}`;
}
