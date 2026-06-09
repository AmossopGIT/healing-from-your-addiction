# Production deploy checklist

Use this after merging launch-plan work to production.

## 1. Supabase migrations (006, 007, 009)

Open [Supabase SQL Editor](https://supabase.com/dashboard/project/yjgxzzmljyksqhcmhsty/sql/new) and run:

[`supabase/scripts/production-deploy.sql`](../supabase/scripts/production-deploy.sql)

This script:

- **Verifies** migration **006** (`handle_new_user` search_path, `onboarding_completed_at` column)
- **Verifies** migration **007** (`is_admin`, `get_my_client_profile_id` helpers)
- **Applies** migration **009** (`client_profiles_insert_own` RLS policy) if missing
- **Promotes** Gerald to admin (see below)

If 006 or 007 verification queries return no rows or `has_search_path_fix = false`, run the full migration files from `supabase/migrations/` in order before 009.

## 2. Gerald admin access

**Email:** `healingfromyouraddiction@geraldcrawford.co.za`

### If Gerald does not have an auth account yet

1. Supabase → **Authentication** → **Users** → **Add user**
2. Email: `healingfromyouraddiction@geraldcrawford.co.za`
3. **Auto confirm user:** on (or send invite email)
4. **App Metadata** (raw_app_meta_data):

```json
{"role": "admin"}
```

5. Run the promote section of `production-deploy.sql` (or the full script)

### Gerald logs in at

- **Admin dashboard:** `https://healingfromyouraddiction.co.za/admin/login/`
- **Leads:** `/admin/leads/`
- **Analytics:** `/admin/analytics/`
- **Blog CMS:** `/admin/content/blog/`

First visit: use **Forgot password** on admin login if no password was set during user creation.

### Smoke test (Gerald)

- [ ] Login at `/admin/login/` succeeds (not redirected to client portal)
- [ ] `/admin/leads/` loads
- [ ] `/admin/analytics/` loads (keyword table visible after site traffic)
- [ ] `/admin/content/blog/` — can create/edit draft

## 3. Blog hero artwork

New posts in `content/blogArchiveChunk4.ts` require PNGs:

`public/art/watercolor/art-watercolor-blog-{slug}.png`

Generate or refresh with:

```bash
node tools/art/generate-missing-blog-heroes.mjs
```

Metadata is auto-synced in `content/artGallery.ts` from blog posts.

## 4. Deploy app

Redeploy the Next.js site (Vercel/host) so code changes (tracking, portal fix, blog posts) are live.

## 5. Gerald marketing (external)

See [`docs/MARKETING_GERALD_CHECKLIST.md`](MARKETING_GERALD_CHECKLIST.md) — budget, Google Ads, social, pillar content.
