# Supabase auth email (password reset, sign-up, invites)

Portal sign-up, password reset, and admin invite emails are sent by **Supabase Auth**, not the `/api/leads/` Resend route.

## Why you see “email rate limit exceeded”

On Supabase’s **built-in** email sender, auth emails are limited to about **2 per hour per project** (all users combined). Repeated password-reset tests during development hit this quickly.

**Fix:** connect **custom SMTP** (Resend recommended — you already use Resend for lead notifications).

## 1. Resend SMTP credentials

From [Resend → API Keys](https://resend.com/api-keys) and a **verified domain** (e.g. `healingfromyouraddiction.co.za`):

| Field | Value |
| --- | --- |
| Host | `smtp.resend.com` |
| Port | `465` |
| Username | `resend` |
| Password | Your Resend API key (`re_...`) |
| Sender email | `enquiries@healingfromyouraddiction.co.za` (or another address on the verified domain) |
| Sender name | `Healing From Your Addiction` |

## 2. Enable in Supabase

1. Open [Supabase Dashboard](https://supabase.com/dashboard) → project **yjgxzzmljyksqhcmhsty**.
2. **Authentication** → **Emails** (under Notifications) → **SMTP Settings**.
3. Turn on **Enable custom SMTP** and paste the Resend values above.
4. Save.

## 3. URL configuration (required for correct reset links)

**Authentication** → **URL configuration**:

| Setting | Value |
| --- | --- |
| Site URL | `https://healingfromyouraddiction.co.za` |
| Redirect URLs | `https://healingfromyouraddiction.co.za/portal/set-password/` |
| | `https://healingfromyouraddiction.co.za/auth/callback/` |
| | `http://localhost:3000/portal/set-password/` (local dev only) |

Do **not** leave Site URL as `http://localhost:3000` in production.

## 4. Optional: raise auth email rate limits

After custom SMTP is enabled:

**Authentication** → **Rate limits** → increase **Email sent** (e.g. 30/hour or higher for your traffic).

## 5. Test

1. Wait until the current limit window passes (about 1 hour if you just hit the cap), **or** complete SMTP setup first (new sends use Resend limits).
2. On the live site: `/portal/forgot-password/`
3. Submit once; check inbox for the reset email from your domain (not `noreply@mail.app.supabase.io`).

## Related env vars

| Variable | Where | Purpose |
| --- | --- | --- |
| `RESEND_API_KEY` | Vercel / `.env.local` | Lead form API only |
| `NEXT_PUBLIC_SITE_URL` | Vercel production | Auth redirect URLs in the app |
| SMTP in Supabase Dashboard | Not in this repo | Auth emails (reset, sign-up, invite) |

Lead notification setup: [`RESEND_SETUP.md`](./RESEND_SETUP.md).
