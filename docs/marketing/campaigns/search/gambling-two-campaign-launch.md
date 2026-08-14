# Gambling Two-Campaign Launch (R800 Month-One Test)

Operational build guide for launching **two separate Google Search campaigns** with a combined **R800 first-month** budget.

## Campaign pair

| Campaign | Brief | JSON payload | Month-one budget | Daily approx |
| --- | --- | --- | --- | --- |
| `HFYA \| Search \| Stop Gambling \| ZA` | [`stop-gambling.md`](stop-gambling.md) | [`search-stop-gambling.za.json`](../../data/campaigns/search-stop-gambling.za.json) | R400 | ~R13 |
| `HFYA \| Search \| Gambling Treatment \| ZA` | [`gambling-treatment.md`](gambling-treatment.md) | [`search-gambling-treatment.za.json`](../../data/campaigns/search-gambling-treatment.za.json) | R400 | ~R13 |

Shared landing page (canonical):

`https://healingfromyouraddiction.co.za/addictions/gambling-addiction-help/`

Legacy URL that redirects to the same page (do not use as final URL):

`https://healingfromyouraddiction.co.za/gambling-addiction-gambling-disorder-healing-program/`

## Google Ads UI steps (both campaigns)

1. Choose **Create a campaign without guidance**.
2. Select campaign type **Search**.
3. Set locations to **Gauteng** + **Western Cape** (month-one), language **English**, include mode **Presence** (not interest).
4. Turn **Search partners** off and **Display Network / expansion** off. Keep **AI Max / Final URL expansion** off.
5. Bidding: **Maximize Clicks**.
6. Budget: average daily **R13** per campaign (~R400/month each). Ignore Google’s high recommended daily budgets.
7. Create **one ad group** and **one RSA** per campaign from the brief. Confirm Review shows Ads = 1 RSA, not None.
8. Add phrase-match keywords from the JSON payload.
   - For Stop Gambling: use stop-intent keywords only from [`stop-gambling.md`](stop-gambling.md). Do not paste mixed treatment/online/hypnotherapy terms into that ad group.
9. Apply shared negatives + gambling negatives before enabling.
10. Attach shared callouts, sitelinks, and structured snippets from [`shared-assets.md`](../../assets/shared-assets.md).
11. Set final URL suffix / UTM template from the JSON `tracking.finalUrlSuffix`.

## Tracking verification checklist

Complete before enabling spend:

- [ ] Final URL opens the gambling programme page (not homepage).
- [ ] Enquiry form submits and lands on `/thank-you/`.
- [ ] Google Ads primary conversion = form submit / thank-you view.
- [ ] Phone click conversion fires.
- [ ] WhatsApp click conversion fires.
- [ ] UTM / GCLID values appear on lead submissions when ads are clicked.
- [ ] Consent Mode / analytics consent path still allows Ads conversion tagging after accept.

Reference: [`docs/TRACKING_AND_ANALYTICS.md`](../../../TRACKING_AND_ANALYTICS.md)

## Budget increase rules

- Do **not** increase budget because of clicks alone.
- After **30 days**, increase the better campaign by **20–30%** only if it has **qualified enquiries** and clean search terms.
- If both produce qualified enquiries, increase each by 20–30% monthly.
- If a campaign spends without qualified enquiries: hold or reduce, tighten keywords/landing match, add negatives first.
- Reassess the split monthly; move budget toward the better qualified-lead rate and cost per qualified lead.

## Weekly operating rhythm

1. Check spend vs R800 month-one cap.
2. Export search terms; add junk (casino, software, jobs, free, etc.).
3. Log enquiries and qualified leads per campaign.
4. Update [`docs/marketing/data/performance/`](../../data/performance/) snapshot notes.
5. Decide next week’s hold / pause / negative actions only — no premature budget jumps.

## Supersedes

The older single-campaign brief [`gambling-addiction.md`](gambling-addiction.md) and payload [`search-gambling-addiction.za.json`](../../data/campaigns/search-gambling-addiction.za.json) are archived for this R800 two-campaign test.
