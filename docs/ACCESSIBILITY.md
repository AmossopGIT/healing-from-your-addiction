# Accessibility checklist

Use this checklist when adding or updating public pages, forms, and portal screens.

## Page structure

- [ ] One clear `<h1>` per page
- [ ] Logical heading order (H2 → H3, no skipped levels without reason)
- [ ] `<main id="main-content">` present (via `MarketingShell` or portal layout)
- [ ] Skip link visible on keyboard focus (`SkipLink` component)

## Images

- [ ] Hero and section art use descriptive `alt` from `content/artGallery.ts`
- [ ] Decorative images use empty alt or `aria-hidden` where appropriate
- [ ] Inline blog images include human-first alt text

## Forms and wizards

- [ ] Every input has a visible `<label>` or `aria-label`
- [ ] Form errors use `role="alert"` and `aria-describedby` where applicable
- [ ] Invalid fields use `aria-invalid="true"` when field-level validation exists
- [ ] Honeypot fields use `aria-hidden="true"` and `tabIndex={-1}`
- [ ] Chip/radio groups use `role="radiogroup"` and `aria-checked` on options

## Keyboard and focus

- [ ] Interactive elements reachable by Tab
- [ ] Wizard step changes move focus to the step heading
- [ ] `:focus-visible` styles remain visible (see `app/globals.css`)
- [ ] Modals/dialogs trap focus where possible (chat widget: improve over time)

## Tracking and SEO (accessibility-adjacent)

- [ ] Page carries SEO context for analytics (`PageSeoContextScript` or layout lookup)
- [ ] Conversion pages fire `thank_you_view` with concern context

## Manual smoke tests

1. Keyboard-only: Home → lead form → submit → thank-you
2. Keyboard-only: Portal sign-up → onboarding → account
3. Screen reader spot-check: error message announced on failed form submit
4. Zoom 200%: no horizontal scroll on lead form and blog article
