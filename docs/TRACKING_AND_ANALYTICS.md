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

- `lead_form_start`
- `lead_form_submit`
- `cta_click`
- `whatsapp_click`
- `email_click`
- `phone_click`
- `programme_card_click`
- `faq_open`
- `thank_you_view`

## Attribution fields

The form captures UTM fields, GCLID, landing page and referrer in the submission payload where available.
