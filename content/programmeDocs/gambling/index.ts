import type { ProgrammeDocModule } from "@/content/programmeDocs/types";

export type { ProgrammeDocModule } from "@/content/programmeDocs/types";

export const gamblingProgrammeDocs: ProgrammeDocModule[] = [
  {
    addictionSlug: "gambling",
    slug: "overview",
    title: "Gambling programme overview",
    summary: "How the four-week, eight-session gambling support programme works.",
    weekNumber: null,
    sortOrder: 1,
    bodyMarkdown: `# Gambling programme overview

This private guide sits alongside your live sessions. It is educational support, not a medical diagnosis or a cure claim.

## Shape of the work

- **Four weeks** with **eight sessions** (Tuesday and Friday)
- Session 1 is **90 minutes**; sessions 2–8 are **45 minutes**
- Daily practice: **EFT tapping** and **affirmations**, tracked lightly in your portal
- Weeks 1–2 stay steady and structured; weeks 3–4 invite more playful confidence

## What each week holds

1. **Week 1** — Orientation, pattern awareness, and settling into the Meet rhythm  
2. **Week 2** — Deeper urge mapping with hypnosis / EFT tools  
3. **Week 3** — Integration and lighter daily practice  
4. **Week 4** — Consolidation and forward rhythm  

## How to use this guide

Read before or after a session. Download the PDF if you prefer offline notes. Bring questions to Gerald in your secure messages.
`,
  },
  {
    addictionSlug: "gambling",
    slug: "week-1-guide",
    title: "Week 1 guide — steady foundations",
    summary: "Calm, structured practice for your first two sessions.",
    weekNumber: 1,
    sortOrder: 2,
    bodyMarkdown: `# Week 1 — Steady foundations

Keep practice simple. Consistency matters more than intensity.

## Daily ticks

- Complete today's **EFT** practice (even a short round)
- Sit with today's **affirmation** without arguing with it
- Log your mood check-in when you can

## Session focus

Notice triggers, chasing loops, and the moments you usually reach for gambling. You do not need to solve everything this week — only observe with kindness.

## Between sessions

If an urge rises, pause, tap, and message Gerald if you need containment. This programme is support, not crisis care.
`,
  },
  {
    addictionSlug: "gambling",
    slug: "homework-sheet",
    title: "Daily practice sheet",
    summary: "A printable reminder for EFT and affirmation ticks.",
    weekNumber: null,
    sortOrder: 3,
    bodyMarkdown: `# Daily practice sheet

Use this sheet alongside the portal ticks.

## Morning or evening

- [ ] EFT tapping completed  
- [ ] Affirmations read / spoken  
- [ ] Mood noted (calm / steady / low / anxious / irritable)  
- [ ] Optional note for Gerald  

## Points

Each completed daily practice awards a small number of practice points. Points are a gentle rhythm marker — not a competition.
`,
  },
];
