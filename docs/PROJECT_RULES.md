# Project Rules

## Build principle

This is a lead generation system, not a brochure site or blog.

Every page should do at least one of the following:

- Match search intent
- Build trust
- Explain the addiction pattern clearly
- Capture a lead
- Track a meaningful conversion action
- Support ethical, safe addiction messaging

## Technology rules

Use Next.js, React, TypeScript, semantic HTML, server-rendered metadata and reusable components.

Avoid bloated UI libraries, client-only SEO pages, duplicated landing page code and hardcoded tracking IDs.

## Content rules

Use safe language:

- May support
- Confidential enquiry
- Addiction pattern support
- Cravings and triggers
- Behaviour change support
- Structured support

Avoid unsafe language:

- Cure
- Guaranteed recovery
- Instant results
- Permanent freedom
- No need for medical care

## Landing page rules

Each landing page must include:

- One H1
- Clear search-intent headline
- Lead form near the top
- Pain point section
- Programme overview
- Trust section
- FAQ section
- Disclaimer
- Final CTA
- Metadata and schema

## Tracking rules

Centralise tracking in `lib/tracking.ts`.

Track:

- `lead_form_start`
- `lead_form_submit`
- `cta_click`
- `whatsapp_click`
- `email_click`
- `phone_click`
- `programme_card_click`
- `faq_open`

## Privacy rules

Do not expose sensitive enquiry data in URLs. Do not log full private messages. Use secure backend storage/email before launch.
