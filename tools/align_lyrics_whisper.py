import argparse
import json
import re
from dataclasses import dataclass
from pathlib import Path


STOPWORDS = {
    "i",
    "a",
    "an",
    "the",
    "and",
    "or",
    "to",
    "of",
    "for",
    "in",
    "on",
    "is",
    "am",
    "are",
    "was",
    "were",
    "it",
    "my",
    "me",
    "you",
    "we",
    "they",
    "that",
    "this",
    "with",
    "by",
    "at",
    "from",
    "now",
}


@dataclass
class Cue:
    index: int
    start: float
    end: float
    text_lines: list[str]


def parse_srt(path: Path) -> list[Cue]:
    chunks = re.split(r"\r?\n\r?\n", path.read_text(encoding="utf-8").strip())
    cues: list[Cue] = []
    for chunk in chunks:
        lines = [line.strip() for line in chunk.splitlines() if line.strip()]
        if len(lines) < 3:
            continue
        idx = int(lines[0])
        time_line = lines[1]
        start_str, end_str = [x.strip() for x in time_line.split("-->")]
        text_lines = lines[2:]
        cues.append(
            Cue(
                index=idx,
                start=parse_time(start_str),
                end=parse_time(end_str),
                text_lines=text_lines,
            )
        )
    return cues


def parse_time(value: str) -> float:
    hh, mm, rest = value.split(":")
    ss, ms = rest.split(",")
    return int(hh) * 3600 + int(mm) * 60 + int(ss) + int(ms) / 1000.0


def fmt_time(value: float) -> str:
    ms_total = max(0, int(round(value * 1000)))
    hh = ms_total // 3_600_000
    ms_total %= 3_600_000
    mm = ms_total // 60_000
    ms_total %= 60_000
    ss = ms_total // 1_000
    ms = ms_total % 1_000
    return f"{hh:02}:{mm:02}:{ss:02},{ms:03}"


def normalize_token(text: str) -> str:
    return re.sub(r"[^a-z0-9]+", "", text.lower())


def cue_tokens(cue: Cue) -> list[str]:
    joined = " ".join(cue.text_lines)
    raw = [normalize_token(tok) for tok in joined.split()]
    tokens = [tok for tok in raw if tok and tok not in STOPWORDS]
    if not tokens:
        return []
    preferred = tokens[:4]
    if len(tokens) > 4:
        preferred.extend(tokens[-2:])
    # Keep order but dedupe
    seen: set[str] = set()
    unique: list[str] = []
    for tok in preferred:
        if tok not in seen:
            unique.append(tok)
            seen.add(tok)
    return unique


def flatten_words(transcript: dict) -> list[tuple[str, float, float]]:
    words: list[tuple[str, float, float]] = []
    for seg in transcript.get("segments", []):
        for w in seg.get("words", []):
            token = normalize_token(w.get("word", ""))
            if not token:
                continue
            words.append((token, float(w.get("start", seg["start"])), float(w.get("end", seg["end"]))))
    return words


def align_cues(cues: list[Cue], words: list[tuple[str, float, float]], audio_end: float) -> list[Cue]:
    if not words:
        return cues

    aligned: list[Cue] = []
    word_cursor = 0
    last_start = -1.0

    for i, cue in enumerate(cues):
        tokens = cue_tokens(cue)
        chosen_start = cue.start

        match_index = None
        for pos in range(word_cursor, len(words)):
            token, w_start, _ = words[pos]
            if token in tokens:
                match_index = pos
                chosen_start = max(0.0, w_start - 0.1)
                break

        if match_index is not None:
            word_cursor = match_index + 1
        else:
            # fallback: keep relative progression if no lexical match
            chosen_start = cue.start

        # Prevent overlap and keep minimum spacing
        chosen_start = max(chosen_start, last_start + 0.12 if aligned else 0.0)
        aligned.append(Cue(cue.index, chosen_start, cue.end, cue.text_lines))
        last_start = chosen_start

    # Build end times from next cue starts with small gap.
    for i in range(len(aligned)):
        start = aligned[i].start
        if i < len(aligned) - 1:
            next_start = aligned[i + 1].start
            end = max(start + 0.55, next_start - 0.06)
            if end >= next_start:
                end = max(start + 0.3, next_start - 0.03)
            end = min(end, next_start - 0.01)
            if end <= start:
                end = start + 0.2
        else:
            end = audio_end
        aligned[i].end = end

    return aligned


def write_srt(cues: list[Cue], out_path: Path) -> None:
    lines: list[str] = []
    for cue in cues:
        lines.append(str(cue.index))
        lines.append(f"{fmt_time(cue.start)} --> {fmt_time(cue.end)}")
        lines.extend(cue.text_lines)
        lines.append("")
    out_path.write_text("\n".join(lines), encoding="utf-8")


def main() -> None:
    parser = argparse.ArgumentParser(description="Align lyric cues using Whisper word timestamps.")
    parser.add_argument("--input-srt", required=True, type=Path)
    parser.add_argument("--transcript-json", required=True, type=Path)
    parser.add_argument("--output-srt", required=True, type=Path)
    args = parser.parse_args()

    cues = parse_srt(args.input_srt)
    transcript = json.loads(args.transcript_json.read_text(encoding="utf-8"))
    words = flatten_words(transcript)
    audio_end = float(transcript.get("segments", [{}])[-1].get("end", cues[-1].end if cues else 0.0))
    aligned = align_cues(cues, words, audio_end)
    write_srt(aligned, args.output_srt)


if __name__ == "__main__":
    main()
