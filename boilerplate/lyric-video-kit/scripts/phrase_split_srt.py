"""Split long lyric cues at commas/dashes using word timing for on-beat display."""

from __future__ import annotations

import argparse
import json
import re
from pathlib import Path

from align_lyrics_whisper import Cue, parse_srt, write_srt


def normalize_token(text: str) -> str:
    return re.sub(r"[^a-z0-9]+", "", text.lower())


def flatten_words(transcript: dict) -> list[tuple[str, float, float]]:
    words: list[tuple[str, float, float]] = []
    for seg in transcript.get("segments", []):
        for w in seg.get("words", []):
            token = normalize_token(w.get("word", ""))
            if token:
                words.append(
                    (
                        token,
                        float(w.get("start", seg["start"])),
                        float(w.get("end", seg["end"])),
                    )
                )
    return words


def split_text_parts(text: str) -> list[str]:
    parts = re.split(r"\s*[,—]\s*", text)
    return [p.strip() for p in parts if p.strip()]


def tokens_in_text(text: str) -> list[str]:
    return [normalize_token(t) for t in text.split() if normalize_token(t)]


def find_part_start(
    words: list[tuple[str, float, float]], part: str, cursor: int, window_end: float
) -> tuple[float, int]:
    need = tokens_in_text(part)
    if not need:
        return words[cursor][1] if cursor < len(words) else 0.0, cursor

    for pos in range(cursor, len(words)):
        token, w_start, _ = words[pos]
        if w_start > window_end:
            break
        if token != need[0]:
            continue
        matched = True
        for offset, want in enumerate(need):
            idx = pos + offset
            if idx >= len(words) or words[idx][0] != want:
                matched = False
                break
        if matched:
            return max(0.0, words[pos][1] - 0.08), pos + len(need)
    return words[cursor][1] if cursor < len(words) else 0.0, cursor


def normalize_cues(cues: list[Cue]) -> list[Cue]:
    if not cues:
        return cues

    fixed: list[Cue] = []
    last_end = 0.0
    for i, cue in enumerate(cues):
        start = max(cue.start, last_end + 0.04)
        end = max(start + 0.28, cue.end)
        if i < len(cues) - 1:
            end = min(end, cues[i + 1].start - 0.03)
        if end <= start:
            end = start + 0.28
        fixed.append(Cue(i + 1, start, end, cue.text_lines))
        last_end = end
    return fixed


def phrase_split_cues(cues: list[Cue], words: list[tuple[str, float, float]]) -> list[Cue]:
    if not words:
        return cues

    out: list[Cue] = []
    word_cursor = 0
    idx = 1

    for cue in cues:
        parts = split_text_parts(" ".join(cue.text_lines))
        if len(parts) < 2:
            out.append(Cue(idx, cue.start, cue.end, cue.text_lines))
            idx += 1
            continue

        part_starts: list[float] = []
        cursor = word_cursor
        for part in parts:
            start, cursor = find_part_start(words, part, cursor, cue.end + 0.5)
            part_starts.append(max(start, cue.start))
            word_cursor = cursor

        for i, part in enumerate(parts):
            start = part_starts[i]
            end = part_starts[i + 1] - 0.06 if i < len(parts) - 1 else cue.end
            end = max(start + 0.35, min(end, cue.end))
            out.append(Cue(idx, start, end, [part]))
            idx += 1

    return normalize_cues(out)


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--input-srt", type=Path, required=True)
    parser.add_argument("--transcript-json", type=Path, required=True)
    parser.add_argument("--output-srt", type=Path, required=True)
    args = parser.parse_args()

    cues = parse_srt(args.input_srt)
    transcript = json.loads(args.transcript_json.read_text(encoding="utf-8"))
    words = flatten_words(transcript)
    split = phrase_split_cues(cues, words)
    args.output_srt.parent.mkdir(parents=True, exist_ok=True)
    write_srt(split, args.output_srt)
    print(f"Wrote {len(split)} cues (from {len(cues)}) to {args.output_srt}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
