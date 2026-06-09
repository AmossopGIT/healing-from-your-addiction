# Content internal linking map

Use this map when authoring blog posts, case studies, and campaign content. Every published gambling or food article should include **at least two internal links** to programme or funnel pages.

## Gambling addiction posts (`gambling-addiction` category)

| Link to | URL | When to use |
| --- | --- | --- |
| Gambling programme landing | `/addictions/gambling-addiction-help/` | Primary CTA; conversion-focused paragraphs |
| 4-week programme overview | `/programs/4-week-addiction-healing-program/` | Explaining structure, sessions, or fit |
| Need help wizard | `/need-help/?concern=Gambling` | Soft CTA; awareness-stage posts |
| Hypnotherapy method | `/hypnotherapy-for-addiction/` | Method education |
| EFT for cravings | `/eft-tapping-for-cravings/` | Craving/urge content |
| How to stop gambling | `/addictions/gambling-addiction-help/how-to-stop-gambling/` | Practical tips cross-link |
| Stop chasing losses | `/addictions/gambling-addiction-help/stop-chasing-losses/` | Loss-chasing topics |

## Food addiction posts (`food-addiction` category)

| Link to | URL | When to use |
| --- | --- | --- |
| Food programme landing | `/addictions/food-addiction-binge-eating-help/` | Primary CTA |
| 4-week programme overview | `/programs/4-week-addiction-healing-program/` | Programme structure |
| Need help wizard | `/need-help/?concern=Food%20%2F%20binge%20eating` | Soft CTA |
| Emotional eating help | `/addictions/food-addiction-binge-eating-help/emotional-eating-help/` | Emotional eating topics |
| How to stop binge eating | `/addictions/food-addiction-binge-eating-help/how-to-stop-binge-eating/` | Binge pattern topics |
| Sugar cravings help | `/addictions/food-addiction-binge-eating-help/sugar-cravings-help/` | Craving-focused posts |

## All addiction content

| Link to | URL | When to use |
| --- | --- | --- |
| Contact | `/contact/` | General enquiry |
| FAQs | `/faqs/` | Trust and safety questions |
| Addictions hub | `/addictions/` | Broader context |

## Markdown syntax

```markdown
[confidential gambling support](/addictions/gambling-addiction-help/)
[start a guided enquiry](/need-help/?concern=Gambling)
```

## Editorial checklist

- [ ] At least 2 internal links in the body (not just related posts)
- [ ] One link points to the matching programme landing page
- [ ] One link points to a funnel page (need-help, contact, or programme overview)
- [ ] Link anchor text is descriptive (not "click here")
- [ ] Row added to `docs/SEO_KEYWORDS.md` before publish

## Validation

Run `node tools/cms/validate-internal-links.mjs` to scan static blog posts for broken paths and missing links.

Admin blog list at `/admin/content/blog/` shows **internal link count** per CMS post.
