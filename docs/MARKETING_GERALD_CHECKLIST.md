# Marketing and operations checklist — Gerald

Items for Gerald to complete outside the codebase. Andy handles dev/content in the repo.

## Immediate (this week)

- [ ] Pay R2,500 marketing budget (Wednesday) — split Google Ads + social test
- [ ] **Admin login:** use `healingfromyouraddiction@geraldcrawford.co.za` at `/admin/login/` (see [`docs/DEPLOY_PRODUCTION.md`](DEPLOY_PRODUCTION.md) — Andy runs SQL promote script after Gerald’s auth user exists)
- [ ] Build two gambling Search campaigns from [`docs/marketing/campaigns/search/gambling-two-campaign-launch.md`](marketing/campaigns/search/gambling-two-campaign-launch.md) (R800 month-one total)
- [ ] Optimise Google Ads using Search Console data (gambling terms: how to quit gambling, etc.)
- [ ] Confirm ads land on `/addictions/gambling-addiction-help/` and food landing — not homepage
- [ ] Send pillar content outline for gambling + food blog categories
- [ ] Send current client intake form / question list for portal wizard spec (`docs/INTAKE_WIZARD_SPEC.md`)

## Content (ongoing)

- [ ] Write or review blog drafts in admin CMS (`/admin/content/blog/`)
- [ ] Add watercolor hero images for new blog posts (filenames in `content/artGallery.ts` metadata)
- [ ] Record first **When You Decide** gambling video (3–5 min) for social/YouTube
- [ ] Animate loop videos with captions for Facebook/Instagram

## Weekly rhythm

| Day | Action |
| --- | --- |
| Monday | Send 1–2 blog drafts or video recording |
| Wednesday | Review Ads + Search Console; confirm budget spend |
| Friday | WhatsApp sync on leads and conversions |

## Admin workflow (leads → clients)

1. Check `/admin/leads/` daily for new enquiries
2. Respond using first-response templates
3. Invite enrolled clients via `/admin/clients/invite/`
4. Assign programme at `/admin/clients/[id]/programme/`
5. Release documents and unlock sessions as appropriate

## Payment

No online payment on the site. Arrange payment directly with clients after enquiry — do not expect checkout in portal yet.

## Video playlist

YouTube playlist: **When You Decide**

First video: Gambling addiction — problem → decision to heal → hypnotherapy as structured option

Track production in `docs/marketing/lyric-videos/QUEUE.md`
