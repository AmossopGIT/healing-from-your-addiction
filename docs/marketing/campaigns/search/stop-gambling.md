# HFYA | Search | Stop Gambling | ZA

## Campaign Summary

- **Channel:** Search
- **Region:** South Africa (month-one geo: Gauteng + Western Cape only)
- **Location include:** Presence — people in or regularly in targeted locations
- **Primary goal:** Confidential lead enquiries
- **Sibling campaign:** [`gambling-treatment.md`](gambling-treatment.md)
- **Landing page:** `https://healingfromyouraddiction.co.za/addictions/gambling-addiction-help/`
- **Do not use as final URL:** `https://healingfromyouraddiction.co.za/gambling-addiction-gambling-disorder-healing-program/` (legacy redirect only)
- **Positioning:** Structured 8-session hypnotherapy programme focused on awareness, urge control, trigger deconditioning, emotional regulation, financial reset, relapse prevention, and long-term control.

## Messaging Guardrail Alignment

- Use support-oriented wording.
- Avoid cure and guaranteed outcome language.
- Keep claims factual and programme-based.
- Maintain private and confidential framing.

## Launch Configuration

- **Campaign name:** `HFYA | Search | Stop Gambling | ZA`
- **Objective in Google Ads UI:** Create a campaign without guidance → **Search**
- **Networks:** Google Search only
- **Search partners:** Off for first test
- **Display expansion:** Off
- **AI Max / Final URL expansion:** Off for first test
- **Bidding:** Maximize Clicks (initial phase)
- **Month-one budget:** Average daily R13 (~R400/month)
- **Primary conversions:** Form submit (primary), phone click, WhatsApp click

## Ad Group Structure

1. **Stop Gambling Help** (single launch ad group; one RSA)

Keep this ad group **stop-intent only**. Do not mix treatment, online/betting, or hypnotherapy keyword themes here.

Deferred to sibling / later ad groups:

- Online / betting stop terms → later Online Gambling ad group
- Problem / addiction / treatment terms → [`gambling-treatment.md`](gambling-treatment.md)
- Hypnotherapy-specific terms → later Gambling Hypnotherapy ad group

## Launch RSA (improved Ad 1)

### Headlines

1. Stop Gambling Support *(pin H1)*
2. Break The Gambling Loop *(pin H2)*
3. 8-Session Healing Program *(pin H3)*
4. Private Gambling Help
5. Stop Chasing Losses
6. Gambling Urge Support
7. Hypnotherapy Support
8. Help Me Stop Gambling
9. Regain Control Today
10. Change The Pattern
11. Confidential Enquiry
12. Healing From Your Addiction

Removed from this RSA for relevance:

- Problem Gambling Support → Treatment campaign
- Support For Betting Urges → Online/Betting later
- Start With One Enquiry → weaker CTA than Confidential Enquiry

### Descriptions

1. Private support to stop gambling urges, triggers, chasing losses and habit loops.
2. An 8-session hypnotherapy programme focused on awareness, control and relapse prevention.
3. Work on the emotional and subconscious loop behind gambling behaviour with guided support.
4. Start with a private enquiry and take the first step toward changing the pattern.

### Pinning Guidance

- H1: `Stop Gambling Support`
- H2: `Break The Gambling Loop`
- H3: `8-Session Healing Program`
- Do not pin the remaining headlines. Let Google test them.

### Final URL

`https://healingfromyouraddiction.co.za/addictions/gambling-addiction-help/`

### Tracking template / UTM final URL suffix

```text
utm_source=google&utm_medium=cpc&utm_campaign={campaignid}&utm_content={adgroupid}&utm_term={keyword}
```

## Keyword Strategy

Phrase match only for month-one test:

- `"how to stop gambling"`
- `"how do i stop gambling"`
- `"how to quit gambling"`
- `"stop gambling help"`
- `"help me stop gambling"`
- `"quit gambling"`
- `"stop gambling"`
- `"how to stop a gambling problem"`

Full seed list also lives in [`search-stop-gambling.za.json`](../../data/campaigns/search-stop-gambling.za.json).

## Notes

- Keep ad-to-landing-page message match tight.
- Do not use casino-intent terms as positives.
- Apply shared and gambling-specific negative lists before launch.
- Review search terms weekly; add `software` and other junk if they appear.
