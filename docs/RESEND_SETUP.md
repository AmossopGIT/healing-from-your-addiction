# Resend lead email setup

Enquiry forms post to `/api/leads/`. When Resend is configured, Gerald receives a notification email with the visitor's details, triage summary (urgency/risk/SLA), and attribution fields.

## 1. Resend account

1. Create a project at [resend.com](https://resend.com).
2. Add and verify your sending domain (for example `healingfromyouraddiction.co.za`).
3. Create an API key.

## 2. Environment variables

Copy `.env.example` to `.env.local` and set:

| Variable | Required | Purpose |
| --- | --- | --- |
| `RESEND_API_KEY` | Yes | Server-only Resend API key |
| `RESEND_FROM_EMAIL` | Yes | Verified sender, e.g. `Healing From Your Addiction <enquiries@healingfromyouraddiction.co.za>` |
| `LEAD_NOTIFICATION_EMAIL` | Recommended | Inbox that receives enquiries (defaults to `NEXT_PUBLIC_CONTACT_EMAIL`) |
| `RESEND_TO_EMAIL` | Optional | Legacy alias for the notification inbox; prefer `LEAD_NOTIFICATION_EMAIL` |
| `LEAD_API_ALLOWED_ORIGINS` | For cross-origin forms | Comma-separated site origins allowed to POST from the browser |

Never commit `.env.local` or expose `RESEND_API_KEY` as a `NEXT_PUBLIC_` variable.

## 3. Hosting

### Node / Vercel (recommended for live forms)

Deploy without `GITHUB_PAGES=true` so Next.js runs API routes:

```bash
npm run build
npm start
```

Set the Resend variables in your host's environment (Vercel → Project → Settings → Environment Variables).

At minimum, add:

```env
RESEND_API_KEY=re_...
RESEND_FROM_EMAIL=Healing From Your Addiction <enquiries@your-verified-domain.co.za>
LEAD_NOTIFICATION_EMAIL=start@healingfromyouraddiction.co.za
```

If you already use `RESEND_TO_EMAIL`, the server still accepts it as a fallback, but `LEAD_NOTIFICATION_EMAIL` is the preferred name going forward.

### GitHub Pages (static preview)

Static export does not run `/api/leads/` on Pages. Either:

- Keep the current mailto fallback (no env needed), or
- Host the API on Vercel/another Node service and set:

```env
NEXT_PUBLIC_LEAD_ENDPOINT=https://your-api-host.vercel.app/api/leads/
LEAD_API_ALLOWED_ORIGINS=https://healingfromyouraddiction.co.za,https://amossopgit.github.io
```

Rebuild the static site so the public endpoint is baked into the client bundle.

## 4. Test locally

```bash
# .env.local
RESEND_API_KEY=re_...
RESEND_FROM_EMAIL=Healing From Your Addiction <enquiries@your-verified-domain.co.za>
LEAD_NOTIFICATION_EMAIL=start@healingfromyouraddiction.co.za

npm run dev
```

Submit the form on `/contact/`. You should be redirected to `/thank-you/` and receive the notification email.

If `RESEND_API_KEY` is missing, the API returns `503` and the form shows an error (mailto fallback only applies when `NEXT_PUBLIC_STATIC_EXPORT=true` or no endpoint is configured).

## 5. Resend dashboard checks

- Domain shows **Verified**
- Test send from Resend succeeds
- API key has send permission
- `RESEND_FROM_EMAIL` uses an address on the verified domain
