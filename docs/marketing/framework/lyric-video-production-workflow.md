# Lyric Video Production Workflow

Use this process for every blog-song video so output is consistent, brand-aligned, and publish-ready in both desktop and mobile formats.

**Hub (queue, campaigns, posting):** [`../lyric-videos/README.md`](../lyric-videos/README.md)  
**Video paths on disk:** [`../../public/videos/README.md`](../../public/videos/README.md)  
**Config + render:** `tools/lyric-video/<song-slug>.config.json` → `tools/render_lyric_video_loop.ps1` (canonical scripts in [`boilerplate/lyric-video-kit/`](../../boilerplate/lyric-video-kit/))

**Auto-sync (optional):** set `lyricsPath` in config; render runs Whisper → align → phrase-split unless `-SkipSync` or `"skipLyricSync": true`. **3+ loops:** `loops[]` in config → `build_multi_loop_bg.py`; 2 loops still use alternating A/B.

## Scope

- Source: one blog article + one generated song audio file (`.wav` or `.mp3`)
- Outputs (required):
  - Horizontal video (`1920x1080`)
  - Portrait/mobile video (`1080x1920`)
  - Timed subtitle files (`.srt` and `.ass`)

## Non-Negotiables

- Use the **exact approved lyrics** (do not shorten or paraphrase).
- Always export **both**:
  - Horizontal video for web/video players
  - Portrait video for mobile/social reels
- Keep lyrics in the **lower third only** so artwork remains visible.
- Use brand styling:
  - White lyric text
  - Gold stroke from site footer token (`#a87727`)
  - Dark teal lower panel (`#102520`)

## Required Inputs

- Background image from `public/art/watercolor/` **or** paired Midjourney loop clips (see dual-loop section below)
- Audio file path (example: `C:\Users\amoss\Downloads\Same Loop, New Name.wav`)
- Exact final lyrics text (or an already-synced display `.srt` when only swapping the background)

## File Naming Convention

For a slug like `cross-addictions-same-loop-new-name`:

- `public/videos/<slug>-exact-v1.srt`
- `public/videos/<slug>-exact-v1.ass`
- `public/videos/<slug>-horizontal-exact-v4.mp4`
- `public/videos/<slug>-portrait-exact-v4.mp4`

Use incremented suffixes (`v2`, `v3`, `v4`, `loop-v5`) for revisions.

Loop-video exports (Midjourney background):

- `public/videos/<slug>-bg-alternating.mp4` (2 loops) or `<slug>-bg-loop.mp4` (3+ loops)
- `public/videos/<slug>-horizontal-loop-v5.mp4`
- `public/videos/<slug>-portrait-loop-v5.mp4`
- `public/videos/<slug>-youtube-thumb.png` (frame from horizontal master, not the blog hero PNG)

## Production Steps

1. **Prepare exact lyric subtitles**
   - Create `.srt` with exact lines in intended display order.
   - Do not rewrite lyric lines for compactness unless explicitly approved.

2. **Initial timing pass**
   - Use Whisper (or another aligner) for first timing estimate.
   - Expect inaccuracies on sung vocals; this is a rough pass only.

3. **Manual correction pass**
   - Open `.ass` in Aegisub (`C:\Program Files\Aegisub\aegisub.exe`).
   - Load audio and manually nudge lines for musical sync.
   - Save updated `.ass` and, if needed, regenerate `.srt`.

4. **Render horizontal master**
   - Ensure full image visibility via `force_original_aspect_ratio=decrease` + `pad`.
   - Add lower-third panel and subtitle styling.

5. **Render portrait/mobile master**
   - Same style rules as horizontal.
   - Keep image fit (no destructive crop).
   - Ensure lyrics stay in lower panel.

6. **Quality checks**
   - Verify timing on intro, chorus, bridge, and outro.
   - Confirm no random bottom line/artifact.
   - Confirm gold stroke is visible and readable on white text.
   - Confirm durations roughly match source audio.

## FFmpeg Style Baseline

Use these style values as default:

- Horizontal lower-third panel:
  - `drawbox=x=0:y=910:w=iw:h=170:color=0x102520@0.92:t=fill`
- Portrait lower-third panel:
  - `drawbox=x=0:y=1620:w=iw:h=300:color=0x102520@0.92:t=fill`
- Subtitle style:
  - `PrimaryColour=&H00FFFFFF`
  - `OutlineColour=&H002777A8` (ASS BGR for `#a87727`)
  - `BorderStyle=1`
  - `Outline=2`
  - `Shadow=0`
  - `WrapStyle=0`

## Example Render Commands

Replace placeholders:
- `<IMG>` background image path
- `<AUDIO>` audio path
- `<SRT>` subtitle path
- `<OUT>` output path

Horizontal:

`ffmpeg -y -loop 1 -i "<IMG>" -i "<AUDIO>" -vf "scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2:color=#f7f3ea,drawbox=x=0:y=910:w=iw:h=170:color=0x102520@0.92:t=fill,subtitles='<SRT>':original_size=1920x1080:force_style='FontName=Arial,FontSize=15,Alignment=2,MarginL=120,MarginR=120,MarginV=24,PrimaryColour=&H00FFFFFF,OutlineColour=&H002777A8,BackColour=&H00000000,BorderStyle=1,Outline=2,Shadow=0,WrapStyle=0'" -c:v libx264 -preset veryfast -pix_fmt yuv420p -r 30 -c:a aac -b:a 192k -shortest "<OUT>"`

Portrait:

`ffmpeg -y -loop 1 -i "<IMG>" -i "<AUDIO>" -vf "scale=1080:1920:force_original_aspect_ratio=decrease,pad=1080:1920:(ow-iw)/2:(oh-ih)/2:color=#f7f3ea,drawbox=x=0:y=1620:w=iw:h=300:color=0x102520@0.92:t=fill,subtitles='<SRT>':original_size=1080x1920:force_style='FontName=Arial,FontSize=14,Alignment=2,MarginL=70,MarginR=70,MarginV=36,PrimaryColour=&H00FFFFFF,OutlineColour=&H002777A8,BackColour=&H00000000,BorderStyle=1,Outline=2,Shadow=0,WrapStyle=0'" -c:v libx264 -preset veryfast -pix_fmt yuv420p -r 30 -c:a aac -b:a 192k -shortest "<OUT>"`

## Dual Midjourney Loop Background (`loop-v5`)

Use two seamless loops that alternate **A → B → A → B** for the full song length.

1. **Store source loops** under `public/videos/loops/<blog-slug>/` (cross-addictions still uses flat `loops/cross-addictions-*.mp4` — see campaign README):
   - Loop A (figure / flow)
   - Loop B (accent / pause variant)
2. **Prep each clip**: trim bottom artifact (`crop=iw:ih-8:0:0`), normalize to 30 fps, re-encode to `-prepped.mp4`.
3. **Build background**: `python tools/build_alternating_loop_bg.py --loop-a ...-prepped.mp4 --loop-b ...-prepped.mp4 --duration 226.16 --output public/videos/<slug>-bg-alternating.mp4`
4. **Render masters** from the alternating background + **exact** synced `.srt` (`<slug>-exact-v1.srt`). Do not use `display-synced-v2.srt` for publish exports — that file shortens lines and omits the second chorus.
5. **YouTube thumbnail**: extract a chorus frame from the horizontal export (`ffmpeg -ss 42 -i <horizontal-loop-v5.mp4> -frames:v 1 -update 1 ...-youtube-thumb.png`). Keep the blog hero watercolor for the site; use the video frame for YouTube/social.

**Layout (`loop-v5`):**

| Format | Video | Lyrics |
|--------|-------|--------|
| Horizontal `1920x1080` | Full bleed (`increase` + `crop`) | No teal `drawbox`; `FontSize=16`, `MarginV=24` |
| Portrait `1080x1920` | Top half (`1080x960`, cream pad) | `FontSize=17`, `MarginV=48` (bottom cream band); `-map "[v]" -map 1:a` |

**One-command render** (from repo root):

`powershell -ExecutionPolicy Bypass -File tools/render_lyric_video_loop.ps1 -Config tools/lyric-video/cross-addictions-same-loop-new-name.config.json`

Legacy wrapper: `tools/render_cross_addictions_loop_v5.ps1`

## Review Checklist (Per Post)

- Lyrics match approved text exactly.
- Timing feels synced through whole song.
- Horizontal export exists and plays.
- Portrait export exists and plays.
- Image remains visible above lower-third.
- Lower-third has no artifact lines.
- Stroke color matches brand gold.
- Final files stored under `public/videos/` with stable names.
