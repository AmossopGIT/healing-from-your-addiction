# Interactive programmes

Structured recovery journeys generated from the source affirmation PDFs.

## Layout

- `types.ts` — shared TypeScript contracts
- `index.ts` — registry loader for all 23 programmes
- `validate.ts` — publish/completeness checks
- `generated/*.json` — programme definitions (modules, daily affirmations, interactive activities)

## Source handling

- Extractable PDFs were parsed into day/week affirmations, weekly focus, reflections, and safety copy.
- Three Win2PDF exports (`cannabis`, `nicotine`, `opioid`) store text as vector drawings rather than selectable text. Those were OCR-extracted from rendered pages and imported as normal programme content.
- Clients never receive static PDFs as the primary experience. Content is rendered through the portal activity wizard.

## Validation

```bash
npm run programmes:validate
```

## Admin publish

Use **Admin → Programmes → Publish / refresh interactive programmes** to upsert templates and homework into Supabase.
