# The Signs of My Trigger — approved lyrics

**Blog:** [Signs of Behavioral Addictions](https://www.healingfromyouraddiction.co.za/blog/signs-of-behavioral-addictions/)  
**Song slug:** `signs-of-behavioral-addictions-the-signs-of-my-trigger`  
**Hero art:** `/art/watercolor/art-watercolor-blog-signs-of-behavioral-addictions.png` (winding road, pause point)  
**Status:** Dark / sad / metaphorical revision (trigger–gun + the road).

## Suno / generation notes

- **Style:** Sad cinematic acoustic — **minor key**, ~78–86 BPM, sparse piano or fingerpicked guitar, light mournful strings, room reverb.
- **Mood:** Dark, lonely, metaphor-heavy — **not** aggressive; grief and recognition, not glorifying harm.
- **Vocal:** Soft, tired, honest — chorus slightly lifts but stays heavy.
- **Metaphor rule:** “Trigger” = gun imagery **and** addiction trigger; no violence toward others; the “shot” is the behaviour, the “wound” is the cost.
- **Length:** ~3:30–4:00.

### Paste block (lyrics only)

```
[Verse 1]
No powder, no bottle, nothing in my vein,
But the pull still finds me — pleasure, pain, again.
Winning, scrolling, buying, chasing someone's view,
The high is in the doing — and the loop runs through.
No metal in my hand — still I hear the click,
Finger on a trigger that was never meant to stick.
Loaded with a feeling I can't put back down,
Safety off inside me — no warning, no sound.

[Pre-chorus]
Longer than I planned it, can't quite set it down,
Mind already sighting where and when next round.
Stress pulls back the hammer, boredom feeds the flame,
I fire for a second — then I wear the shame.
Seven signs like bullet holes I hide beneath my coat,
Walking roads I know by heart — but never quite afloat.

[Chorus]
The signs of my trigger — same reward, same loop,
No blood upon the sheet — still the shot runs through.
Pull, crave, act, brief relief,
Then the smoke that stays too long with me.
I'm not broken — I'm the road still learning how to bend,
Same dark loop, same sad end — till I pause and start again.
The signs of my trigger — read the marks along the way,
Not the gun, not the game — what the pattern has to say.

[Verse 2]
Chasing bets like muzzle flash against the rain,
Screen-light on my face — offline world goes grey.
Likes that cock the chamber, games that hold me past the dawn,
Shopping carts like empty clips — I load them on and on.
Food that fills the silence, work that won't release the lock,
Different rooms, same hallway — same knock, same knock.
I lose the count of hours, lose the grip I swore I'd keep,
Need a louder calibre just to fall asleep.

[Chorus]
The signs of my trigger — same reward, same loop,
No blood upon the sheet — still the shot runs through.
Pull, crave, act, brief relief,
Then the smoke that stays too long with me.
I'm not broken — I'm the road still learning how to bend,
Same dark loop, same sad end — till I pause and start again.
The signs of my trigger — read the marks along the way,
Not the gun, not the game — what the pattern has to say.

[Bridge]
Harder to see it — dressed like normal days,
No powder, no track marks — just a trigger in the haze.
Same brain as any addiction — same recoil, same cost,
It's not the scroll, the bet, the cart — it's what I'm lost in most.
When the behaviour holds the wheel and I am just the ghost,
When I want to stop and can't — that's when it hurts the most.
The road goes on through gravel, through the cold, through the doubt,
There's a pause point on the map — that's where I turn about.

[Chorus]
The signs of my trigger — same reward, same loop,
No blood upon the sheet — still the shot runs through.
Pull, crave, act, brief relief,
Then the smoke that stays too long with me.
I'm not broken — I'm the road still learning how to bend,
Same dark loop, same sad end — till I pause and start again.
The signs of my trigger — read the marks along the way,
Not the gun, not the game — what the pattern has to say.

[Outro]
One breath on the roadside, one step past the bend,
Less trigger, more horizon — slow miles, slow mend.
The signs of my trigger — I know the call by name,
Same sad loop — different road — I'm walking just the same.
```

## Metaphor map

| Image | Meaning |
|-------|---------|
| Click / loaded / safety off | Urge building before behaviour |
| Muzzle flash, smoke, shot | Brief relief, lasting hangover |
| Bullet holes / calibre | Escalation, harm, tolerance |
| No blood on the sheet | No substance — behavioural loop |
| Road, bend, pause point, gravel | Recovery path (hero art); sad but moving |
| Holster / put back | _(optional future line)_ — choosing pause |

## Sync and render (done)

1. `powershell -File tools/sync_lyrics_whisper.ps1 -SongSlug signs-of-behavioral-addictions-the-signs-of-my-trigger`
2. `powershell -File tools/render_signs_of_behavioral_addictions.ps1 -SkipSync`

Uses **Whisper word timestamps** (not static spacing). Phrase-split breaks lines at commas/dashes so lyrics step with the vocal (~137 cues).

Manual fine-tune: open `exact-v1-aligned.srt` in Aegisub, adjust, re-run phrase split + `-SkipSync` render.

## Related

- [CAMPAIGN.md](./CAMPAIGN.md)
