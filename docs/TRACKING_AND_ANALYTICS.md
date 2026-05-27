# Tracking and Analytics

## Tools

Prepare the site for:

- Google Tag Manager
- GA4
- Google Ads conversion tracking
- Google Search Console

## Primary conversion

Form submission redirects to `/thank-you/`. Use that page as the primary Google Ads conversion destination.

## dataLayer events

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
- `chat_widget_step_complete`
- `chat_widget_submit_attempt`
- `chat_widget_submit_success`
- `chat_widget_submit_error`

## Attribution fields

The form captures UTM fields, GCLID, landing page and referrer in the submission payload where available.

## Lead quality reporting hooks

Track quality dashboards from admin transitions and triage metadata:

- Triage mix: `triage_priority` and `risk_flag`
- Readiness segmentation: `readiness_stage`
- Response SLA adherence: `triage_sla_hours`, `follow_up_due_at`, `first_response_sent_at`
- Conversion chain: `new -> triage_review -> outreach_started -> care_pathway_defined -> qualified -> enrolled`
