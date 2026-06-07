# Tracking and Analytics

## Tools

Prepare the site for:

- Google Tag Manager (public pages only, Consent Mode v2)
- GA4 (via GTM after cookie consent)
- Google Ads conversion tracking
- Google Search Console (admin connector planned)
- First-party Supabase analytics (`analytics_events`)

## Consent tiers

Public pages use two tracking tiers:

| Tier | When | What is recorded |
|------|------|------------------|
| `essential` | Before and after a privacy choice | First-party events in Supabase: `page_view`, `session_start`, funnel events, CTA/form events. No GTM/GA4 storage. |
| `analytics` | After the visitor accepts analytics cookies | Same first-party events plus GTM `dataLayer` pushes for GA4/Ads tags. |

Consent is stored in `localStorage` and a first-party cookie (`hfya_cookie_consent`). Google Consent Mode defaults to denied until accept.

Admin and portal surfaces are excluded from public analytics collection and the cookie banner.

## First-party collection

Client events are queued in `lib/analytics/collect.ts` and sent to `POST /api/analytics/collect/`.

Stored fields include SEO context (`page_type`, `primary_keyword`, `conversion_goal`, `landing_page`), UTM/GCLID when present, `consent_tier`, and sanitized event properties (PII stripped).

## Admin analytics dashboard

- Overview summary: `/admin/` — 30-day snapshot
- Full dashboard: `/admin/analytics/` — filters for 7, 14, 30, 60, 90 days, or all time (`None`)
- PDF export: A4 branded report from the analytics page
- Future connectors: GA4 Reporting API (`GA4_PROPERTY_ID`), Search Console API (`GSC_SITE_URL`)

## Primary conversion

Form submission redirects to `/thank-you/`. Use that page as the primary Google Ads conversion destination.

## dataLayer events

GTM/dataLayer pushes only fire after analytics consent. First-party collection always records allowed events regardless of consent.

### Page view (first-party)

Recorded on every public page navigation (including client-side route changes):

```js
{
  event: "page_view",
  page_path: "/blog/example-post/",
  properties: {
    page_title: "Example | Healing From Your Addiction",
    referrer_path: "/"
  }
}
```

### Scroll depth

Fires once per page per session at 25%, 50%, 75%, 90%, and 100%:

```js
{
  event: "scroll_depth",
  properties: { depth_percent: 75, page_title: "..." }
}
```

### Link clicks

Generic internal navigation clicks (CTA/WhatsApp/email/phone use their own events):

```js
{
  event: "link_click",
  properties: {
    link_text: "Programmes",
    destination_path: "/programmes/",
    link_section: "header"
  }
}
```

Outbound links fire `outbound_click` with `link_href` instead of `destination_path`.

## Forms tracked

| Form | `form_name` | Key events |
|------|-------------|------------|
| Addiction enquiry form | `addiction_enquiry` | `lead_form_start`, `lead_form_submit`, `lead_form_safety_acknowledged` |
| Need help wizard | `need_help_wizard` | `need_help_wizard_start`, `need_help_wizard_step_complete`, `need_help_wizard_submit_attempt`, `lead_form_submit` |
| Chat widget | `chat_widget` | `chat_widget_open`, `chat_widget_start`, `chat_widget_submit_success`, `chat_widget_submit_error` |

Admin dashboard **Forms** table shows starts, submit attempts, submits, safety acknowledgements, errors, and completion rate per form.

## CTAs tracked

Named CTAs use `TrackedLink` with `ctaName` and optional `cta_location`:

- Hero buttons, sticky mobile bar, footer, header, contact page, programme cards, etc.
- Event: `cta_click` with `cta_name` + `cta_location`

Contact actions (separate events):

- `whatsapp_click` — `link_location`
- `email_click` — `link_location`
- `phone_click` — `link_location`
- `programme_card_click` — `programme_name`

Admin dashboard **CTAs & contact actions** table groups by name, type, and location.

### Time on page

Engaged time is recorded when a visitor leaves a page, switches tab, or hides the browser. The timer pauses while the tab is hidden.

```js
{
  event: "time_on_page",
  properties: {
    duration_seconds: 84,
    page_title: "..."
  }
}
```

Minimum recorded visit: 3 seconds. Maximum cap: 30 minutes per page view.

### Lead submit

```js
window.dataLayer.push({
  event: "lead_form_submit",
  form_name: "addiction_enquiry",
  addiction_type: selectedValue,
  preferred_contact_method: selectedContactMethod,
  urgency_level: selectedUrgency,
  readiness_stage: selectedReadinessStage,
  callback_window: selectedCallbackWindow,
  page_path: window.location.pathname
});
```

### Safety acknowledgment

```js
window.dataLayer.push({
  event: "lead_form_safety_acknowledged",
  form_name: "addiction_enquiry",
  urgency_level: selectedUrgency,
  withdrawal_risk: selectedWithdrawalRisk,
  page_path: window.location.pathname
});
```

### CTA click

```js
window.dataLayer.push({
  event: "cta_click",
  cta_name: "Book Confidential Enquiry",
  page_path: window.location.pathname
});
```

## Events implemented

- `page_view`
- `session_start`
- `need_help_page_view`
- `need_help_wizard_start`
- `need_help_wizard_step_complete`
- `need_help_wizard_submit_attempt`
- `need_help_wizard_submit_error`
- `lead_form_start`
- `lead_form_submit`
- `lead_form_safety_acknowledged`
- `cta_click`
- `whatsapp_click`
- `email_click`
- `phone_click`
- `programme_card_click`
- `faq_open`
- `thank_you_view`
- `scroll_depth`
- `link_click`
- `outbound_click`
- `time_on_page`
- `chat_widget_open`
- `chat_widget_start`
- `chat_widget_step_complete`
- `chat_widget_submit_attempt`
- `chat_widget_submit_success`
- `chat_widget_submit_error`
- `chat_widget_handoff_whatsapp`
- `chat_widget_handoff_email`

## Attribution fields

The form captures UTM fields, GCLID, landing page and referrer in the submission payload where available.

## Lead quality reporting hooks

Track quality dashboards from admin transitions and triage metadata:

- Triage mix: `triage_priority` and `risk_flag`
- Readiness segmentation: `readiness_stage`
- Response SLA adherence: `triage_sla_hours`, `follow_up_due_at`, `first_response_sent_at`
- Conversion chain: `new -> triage_review -> outreach_started -> care_pathway_defined -> qualified -> enrolled`
