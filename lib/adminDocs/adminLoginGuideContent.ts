import { siteConfig } from "@/lib/constants";

export const ADMIN_LOGIN_EMAIL = "healingfromyouraddiction@geraldcrawford.co.za";

const siteRoot = siteConfig.siteUrl.replace(/\/$/, "");

export const adminLoginGuideContent = {
  title: "How to log in as admin",
  description:
    "Step-by-step guide to reaching the admin sign-in page, signing in, and confirming you have the right access.",
  category: "Operations" as const,
  adminLoginPath: "/admin/login/",
  adminLoginUrl: `${siteRoot}/admin/login/`,
  clientPortalLoginPath: "/portal/login/",
  clientPortalLoginUrl: `${siteRoot}/portal/login/`,
  adminEmail: ADMIN_LOGIN_EMAIL,
  accessPaths: [
    {
      id: "direct",
      title: "Direct admin link",
      summary: "Open the admin sign-in URL in your browser.",
    },
    {
      id: "header",
      title: "From the public site header",
      summary:
        "Click the account or bell icon in the top navigation, choose Log in, then use Staff admin sign in on the client portal card.",
      headerSteps: [
        "On any public page, open the top-right header and click the account icon or bell.",
        "Choose Log in — this opens the client portal sign-in page first.",
        "At the bottom of the sign-in card, click Staff admin sign in to reach the admin login page.",
      ],
    },
  ],
  steps: [
    {
      title: "Open the admin sign-in page",
      body: "You can go straight to the admin URL, or start from the public site header. The header Log in button opens the client portal first — staff use the Staff admin sign in link inside that card.",
      callout: "Bookmark the admin URL for the fastest route next time.",
    },
    {
      title: "Enter your admin email and password",
      body: "Use the admin email assigned to your account. Passwords are case-sensitive.",
      callout: "First visit? Ask your site administrator to confirm your account exists, then use Forgot password if needed.",
    },
    {
      title: "Confirm you land on the admin dashboard",
      body: "After signing in, you should see the admin sidebar with Overview, Leads, Clients, Content, and Docs — not the client portal home.",
      callout: "If you see a client-portal message, you are on the wrong sign-in page or the account role is not admin.",
    },
  ],
  smokeChecks: [
    "Overview loads at /admin/",
    "Leads opens at /admin/leads/",
    "Analytics opens at /admin/analytics/",
    "Content hub opens at /admin/content/",
  ],
  troubleshooting: [
    {
      issue: "This email is not set up for admin access",
      fix: "Your Supabase profile role is not admin. Contact the site administrator to promote your account.",
    },
    {
      issue: "This email is for the client portal",
      fix: "You signed in on the admin page with a client account. Use /portal/login/ instead, or sign in with an admin email.",
    },
    {
      issue: "Invalid login credentials",
      fix: "Check spelling and caps lock. Use Forgot password on the admin login page if you have not set a password yet.",
    },
    {
      issue: "Too many sign-in emails / rate limit",
      fix: "Wait about an hour and try again. If it persists, custom SMTP may need to be enabled in Supabase.",
    },
  ],
};
