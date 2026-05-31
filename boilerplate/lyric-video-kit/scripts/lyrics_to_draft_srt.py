"""Build a draft .srt from plain lyric lines (one cue per line) before Whisper alignment."""

from __future__ import annotations

import argparse
from pathlib import Path


def fmt_time(value: float) -> str:
    ms_total = max(0, int(round(value * 1000)))
    hh = ms_total // 3_600_000
    ms_total %= 3_600_000
    mm = ms_total // 60_000
    ms_total %= 60_000
    ss = ms_total // 1_000
    ms = ms_total % 1_000
    return f"{hh:02}:{mm:02}:{ss:02},{ms:03}"


def lyric_lines(text: str) -> list[str]:
    lines: list[str] = []
    for raw in text.splitlines():
        line = raw.strip()
        if not line or line.startswith("["):
            continue
        lines.append(line)
    return lines


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--lyrics", type=Path, required=True)
    parser.add_argument("--output", type=Path, required=True)
    parser.add_argument("--start", type=float, default=14.0)
    parser.add_argument("--end", type=float, default=242.0)
    args = parser.parse_args()

    lines = lyric_lines(args.lyrics.read_text(encoding="utf-8"))
    if not lines:
        raise SystemExit("No lyric lines found")

    span = max(1.0, args.end - args.start)
    step = span / len(lines)
    blocks: list[str] = []

    for i, text in enumerate(lines, start=1):
        s = args.start + (i - 1) * step
        e = args.start + i * step - 0.05
        blocks.append(str(i))
        blocks.append(f"{fmt_time(s)} --> {fmt_time(e)}")
        blocks.append(text)
        blocks.append("")

    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text("\n".join(blocks), encoding="utf-8")
    print(f"Wrote {len(lines)} cues to {args.output}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
