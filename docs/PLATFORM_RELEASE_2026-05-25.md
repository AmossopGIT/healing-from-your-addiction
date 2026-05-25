# Platform Release 2026-05-25

This release bundles a major round of improvements across the public site, admin workspace, and private client portal. The work expands onboarding, notification, PWA, CMS, and content-production capabilities so the platform is easier to manage and more useful for clients on both desktop and mobile.

## Highlights

- Added Progressive Web App support with a web manifest, app icons, service worker, offline page, install prompt, and client-side PWA management hooks on public pages.
- Added browser push notifications with visitor subscription storage, category preferences, delivery logging, admin broadcast tools, and portal-aware subscription APIs.
- Added client portal self-sign-up and onboarding, including signup, check-email, forgot-password, and onboarding flows plus callback and middleware hardening around auth redirects and profile completion.
- Added portal notification/read-state support for admin messages, released documents, and programme sessions so unread items can be surfaced safely in the client dashboard.
- Expanded the dashboard shell and portal/admin layouts with notification UI, better navigation behavior, shared validation helpers, and stronger data/query plumbing.
- Improved CMS authoring workflows for blog posts and case studies, including hero art upload support, workflow controls, section editing, and content source updates.
- Refined public-site presentation and conversion plumbing across the marketing shell, header, footer, contact page, blog listing, SEO helpers, and lead validation.
- Added lyric-video production documentation, subtitle timing helpers, and new rendered media assets under `public/videos/`.

## Database And Infrastructure Notes

- Apply Supabase migrations `003_portal_notifications.sql`, `004_web_push_notifications.sql`, and `005_portal_self_signup.sql` before treating this release as production-ready.
- Configure `NEXT_PUBLIC_WEB_PUSH_PUBLIC_KEY`, `WEB_PUSH_PRIVATE_KEY`, and optionally `WEB_PUSH_SUBJECT` to enable browser push delivery.
- The release adds the `web-push` runtime dependency and `@types/web-push` for TypeScript support.
- Updated generated database types and case-study redirect artifacts are included in this release.

## Recommended Post-Deploy Checks

- Confirm portal signup, email verification callback, login, password set/reset, and onboarding redirection all work on the deployed domain.
- Verify PWA install behavior, offline fallback, and service worker registration on a production build.
- Send a test broadcast from the admin notifications page and confirm subscription, delivery logging, and unsubscribe behavior.
- Smoke-test admin client/message/document/programme screens and portal resources/messages/session read-state behavior.
