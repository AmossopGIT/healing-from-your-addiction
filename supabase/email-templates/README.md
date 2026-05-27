# Supabase auth email templates (branded)

These templates match the visual style used in `lib/email/formatLeadEmail.ts` (warm cream background, green CTA, dark footer).

Supabase sends portal **password reset**, **sign-up confirmation**, and **admin invite** emails. Paste these into the dashboard — they are not deployed from this repo automatically.

## Where to paste

1. [Supabase Dashboard](https://supabase.com/dashboard/project/yjgxzzmljyksqhcmhsty/auth/templates)
2. **Authentication** → **Emails** → **Templates**
3. For each template type below, set **Subject** and **Body** (HTML). If Supabase shows a plain-text field, use the matching `.txt` file.

| Supabase template | Subject file | HTML file | Plain text file |
| --- | --- | --- | --- |
| **Reset password** | `recovery.subject.txt` | `recovery.html` | `recovery.txt` |
| **Invite user** | `invite.subject.txt` | `invite.html` | `invite.txt` |
| **Confirm sign up** | `confirmation.subject.txt` | `confirmation.html` | `confirmation.txt` |

## Important

- Keep `{{ .TokenHash }}`, `{{ .SiteURL }}`, and `{{ .Email }}` exactly as written — Supabase replaces them when sending.
- Password reset uses `token_hash` links (works without PKCE cookies). Do not switch the button back to `{{ .ConfirmationURL }}` only.
- Do not remove the fallback link block; some clients hide styled buttons.
- SMTP must be configured first — see [`docs/SUPABASE_AUTH_EMAIL.md`](../../docs/SUPABASE_AUTH_EMAIL.md).

## Preview in code

`lib/email/brandEmailLayout.ts` exports `renderBrandAuthEmailHtml()` for local previews using the same layout (with real URLs instead of Go template variables).
