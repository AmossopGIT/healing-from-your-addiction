# What the Body Asks For — approved lyrics

**Blog:** [Signs of Substance Addictions](https://www.healingfromyouraddiction.co.za/blog/signs-of-substance-addictions/)  
**Song slug:** `signs-of-substance-addictions-what-the-body-asks-for`  
**Hero art:** `/art/watercolor/art-watercolor-blog-signs-of-substance-addictions.png` (seated figure, broken circle, glass, smoke)  
**Status:** Dark / sad / metaphorical revision (river/undertow + broken ring + glass moon + smoke).

## Suno / generation notes

- **Style:** Sad cinematic acoustic — **minor key**, ~78–86 BPM, sparse piano or fingerpicked guitar, light mournful strings, room reverb.
- **Mood:** Dark, lonely, grief-heavy — exhaustion, isolation, shame without preaching; medical safety as plea, not lecture.
- **Vocal:** Soft, tired, worn — chorus lifts slightly but stays grave.
- **Metaphor rule:** Universal physical dependence — no substance checklist. **River/undertow** = body adapted; **broken ring** = dependence loop; **glass/watermark** = tolerance; **masks/anatomy** = same pattern in any form. Medical safety in bridge without naming drugs.
- **Length:** ~3:30–4:00.

### Paste block (lyrics only)

```
[Verse 1]
My body let the river in because I couldn't bear the sound,
Now the river knows my name — I shake before the light is found.
Charcoal circle on the floorboards — broken like a vow undone,
I sit inside the empty gap, back turned from everyone.
Glass beside my shoulder like a moon too tired to shine,
Pour until the watermark hurts — less of me each time.
I'm not looking for a heaven — just a moment without fear,
Cut the current, cut the cup — the sickness draws me near.

[Pre-chorus]
It whispers when I'm near — behind my lids, behind the door,
More than I could carry — swore I'd stop, crawled back for more.
Not to fly — just hold the floor, just to feel like I belong,
That's the undertow that pulls me — never quite ashore.

[Chorus]
What the body asks for — not the flood, just the shore,
Broken ring, bitter glass — same wound at the core.
Pour, sink, one gasp of air,
Then the grief — same harm, same harm.
I'm so tired of drowning quiet where no one sees me grieve,
This body learned to need too much — too much to leave.
What the body asks for — written in the weathered bone,
Not the cup, not the shame — I'm a ghost inside my own home.

[Verse 2]
More each time to reach the line — less of me behind the glass,
Slow it down — the shaking starts, the sweat that won't pass.
Craving hammers on the silence — won't let morning through the door,
Past the edge I swore I'd keep — crawled back to the floor.
Not to rise — not to escape — just to stand and feel like me,
Every hunger wears a different mask — same anatomy.
Dawn breaks brittle, marrow cold, the mind a static hum,
Every name the ache adopts — and the body calls for more.

[Chorus]
(repeat)

[Bridge]
Some tides can take you under if you face them on your own,
Don't walk off that ledge alone — please let someone hold the chill.
Convulsions, fever-mirage — my body begging to be heard,
When I need the river just to stand — say the mercy, say the word.
Different storms, one lonely harbour — drink the calm to feel like ground,
Gold fault-line in the broken ring — still the body calls for shore.

[Chorus]
(repeat)

[Outro]
One thin breath above the waterline, one slow step past the ring,
Less this undertow, more empty sky — slow miles, slow everything.
What the body asks for — I know that ghost by name,
Same sad tide, same dark sea — still the pattern, still the same.
```

## Metaphor map

| Image | Meaning |
|-------|---------|
| River / undertow / tide | Body adapted; withdrawal pulls you back when you try to stop |
| Broken ring / charcoal circle | Dependence loop (hero art); gap at crown = can't close without substance |
| Seated figure, back turned | Sitting inside the pattern; avoidance |
| Glass / moon that won't reflect | Pouring to hit a watermark — less self left; not chasing lightning |
| Smoke | Brief relief, lasting haze (chorus) |
| Weather in the bone | Physical withdrawal signs read as inner forecast |
| Watermark / less behind glass | Tolerance — need more for the same effect |
| Shaking, sweat, marrow cold | Universal withdrawal symptoms |
| Different mask, same anatomy | Any substance — same bodily dependence |
| Every name the ache adopts | Surface form changes; pattern does not |
| Different storms, one harbour | All substances lead to the same loop |
| Gold fault-line in circle | Pause point — medical help, turning (hero art gold dot) |
| Waterline / horizon | Recovery outro — slow mend |

## Article coverage

| Blog section | Lyric anchor |
|--------------|--------------|
| Overview — body adapted | Verse 1 river / sickness draws near |
| Tolerance | "More each time to reach the line — less of me behind the glass" |
| Withdrawal symptoms | Shaking, sweat, marrow cold, static hum |
| Cravings / compulsion | "Craving hammers on the silence" |
| Loss of control | "Past the edge I swore I'd keep — crawled back to the floor" |
| Using to feel normal (not high) | "Not to rise — just to stand and feel like me" |
| All substances — shared pattern | "Every hunger wears a different mask — same anatomy" |
| Critical safety | Bridge "Some tides can take you under if you face them on your own" |
| Deeper pattern | Bridge "Different storms, one lonely harbour" |
| When to seek help | Bridge "When I need the river just to stand" |
| Grounded perspective | Chorus "Not the cup, not the shame" |

## Sync and render (after WAV)

1. `powershell -File tools/sync_lyrics_whisper.ps1 -SongSlug signs-of-substance-addictions-what-the-body-asks-for`
2. `powershell -ExecutionPolicy Bypass -File tools/render_lyric_video_loop.ps1 -Config tools/lyric-video/signs-of-substance-addictions-what-the-body-asks-for.config.json`

Whisper **medium** + line align + phrase split (same pipeline as behavioral campaign).

## Related

- [CAMPAIGN.md](./CAMPAIGN.md)
- [Signs of Behavioral Addictions — *The Signs of My Trigger*](../signs-of-behavioral-addictions/lyrics.md) (sister song)
