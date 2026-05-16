# Watercolor Artwork Style Guide

This guide defines the visual language for Healing From Your Addiction artwork. Use it for generated images, smart gallery metadata, page illustrations, ads, and future visual assets so the site stays calm, consistent, and non-stigmatizing.

## Visual Direction

The artwork should feel quiet, confidential, and pattern-focused. It should not show crisis, shame, despair, medical treatment, dramatic addiction scenes, or realistic identifiable people. The preferred style is minimal watercolor with black ink character/object work, soft washes, and plenty of negative space.

Core principles:

- Simple first: one central idea per image.
- Calm over dramatic: avoid intense emotion, clutter, or danger signals.
- Pattern language: loops, pauses, pathways, circles, small steps, and gentle repetition.
- Human but anonymous: use simple black silhouettes, line figures, hands, or symbolic objects rather than detailed faces.
- Brand-led restraint: use the same limited palette and soft paper feel across every image.

## Palette

Base palette mirrors the site tokens in `app/globals.css`.

| Role | Hex | Use |
| --- | --- | --- |
| Warm paper | `#f7f3ea` | Background wash and page harmony |
| Surface cream | `#fffdfa` | Open negative space and card-like artwork fields |
| Deep teal | `#0a3f39` | Main brand accent, grounding shapes |
| Teal | `#0f5b52` | Secondary accent, soft pathway marks |
| Soft teal | `#e2eeea` | Pale watercolor wash |
| Muted gold | `#a87727` | Small highlight, ring, sun, or pause point |
| Gold wash | `#f1e4cb` | Gentle warmth behind the subject |
| Ink black | `#17231f` | Main character/object linework |
| Muted text grey | `#5a6963` | Very light secondary strokes only |

Usage ratio:

- 65 percent warm paper or cream.
- 20 percent ink black or near-black linework.
- 10 percent soft teal wash.
- 5 percent muted gold accent.

## Stroke And Texture

Use imperfect, hand-drawn lines with a watercolor or ink-brush feel. Lines should be confident but not sharp, with slight edge variation and natural opacity changes.

Stroke rules:

- Main ink stroke: near black, medium weight, rounded ends.
- Secondary stroke: teal or muted grey, thinner and lighter.
- Accent stroke: muted gold, used sparingly for focus points.
- Avoid hard vector precision, neon color, gradients that feel digital, or glossy 3D effects.
- Keep all artwork flat and painterly.

## Composition

Preferred composition:

- Square or wide landscape image, centered subject.
- Large quiet margins.
- One symbolic object or anonymous character.
- One or two abstract shapes behind the subject.
- Optional loop/path line to show pattern awareness.

Avoid:

- Crowded scenes.
- Real brand logos, casino branding, bottles with labels, social-media logos, explicit adult imagery, needles, money piles, panic scenes, or before/after body imagery.
- Text inside the image unless intentionally requested for a campaign asset.

## Subject Rules

Each category should be represented through metaphor, not literal harm.

- Gambling: dice, cards, circular loop, pause mark, or hand hovering away from a symbol.
- Food / binge eating: bowl, plate, spoon, gentle spiral, or hand with pause line.
- Alcohol: unlabeled glass silhouette, ripple, circular path, or water-like restraint motif.
- Cannabis: abstract leaf shape only, soft and non-promotional.
- Nicotine: simple vapor curl or small stick silhouette with break/pause line.
- Pornography: phone/window silhouette with privacy screen, no explicit content.
- Social media: abstract phone rectangle with looping dots, no platform logos.
- Gaming: simple controller outline with pause loop, no game branding.
- Pattern loop: abstract circular pathway, one black character silhouette, teal/gold wash.

## Image Generation Prompt Template

Use this base prompt for all generated assets:

```text
Minimal watercolor illustration for Healing From Your Addiction, warm cream paper background, anonymous black ink main subject, simple symbolic object for [CATEGORY], soft teal watercolor wash, tiny muted gold accent, rounded organic shapes, lots of negative space, calm confidential mood, hand-painted texture, no text, no logos, no realistic faces, no dramatic scene, no medical imagery, no stigma, flat composition, clean website artwork.
```

Add category-specific detail:

```text
Show [SYMBOL] as the main object. Add one loose circular pathway to suggest a habit loop and one clear pause point. Keep the object simple and non-sensational.
```

Negative prompt guidance:

```text
Avoid photorealism, neon colors, clutter, visible brand logos, readable text, distress, shame, needles, explicit content, medical treatment rooms, gambling venue scenes, alcohol labels, social media logos, detailed faces, and cartoon comedy.
```

## Alt Text Rules

Alt text should describe the image plainly and respectfully. It should not diagnose, shame, or overstate outcomes.

Good examples:

- `Minimal watercolor illustration of dice inside a gentle loop, suggesting gambling habit patterns.`
- `Simple watercolor artwork of a phone with looping dots, suggesting social media habit awareness.`
- `Black ink figure beside a soft teal circular path, suggesting a pause in an addiction pattern.`

Avoid:

- `Addict losing control at casino.`
- `Cure your gambling addiction.`
- `Scary food addiction image.`

## Gallery Metadata Rules

Every gallery item should include:

- Stable `id` matching the asset filename.
- Human-readable `title`.
- `category` matching the programme or shared use case.
- Public `src` path.
- Descriptive `alt`.
- Reusable generation `prompt`.
- Palette hex values.
- Suggested usage notes.

When an image is decorative in a component, the rendered `alt` may be empty, but the gallery metadata should still keep a descriptive alt value for reuse.
