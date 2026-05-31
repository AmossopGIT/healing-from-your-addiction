"""Concatenate two prepped loop clips in A,B,A,B order for a target duration."""

from __future__ import annotations

import argparse
import subprocess
import sys
from pathlib import Path


def ffprobe_duration(path: Path) -> float:
    result = subprocess.run(
        [
            "ffprobe",
            "-v",
            "error",
            "-show_entries",
            "format=duration",
            "-of",
            "default=noprint_wrappers=1:nokey=1",
            str(path),
        ],
        capture_output=True,
        text=True,
        check=True,
    )
    return float(result.stdout.strip())


def write_concat_list(loop_a: Path, loop_b: Path, pairs: int, out_list: Path) -> None:
    lines: list[str] = []
    for _ in range(pairs):
        lines.append(f"file '{loop_a.as_posix()}'")
        lines.append(f"file '{loop_b.as_posix()}'")
    out_list.write_text("\n".join(lines) + "\n", encoding="utf-8")


def run_ffmpeg(args: list[str]) -> None:
    print(" ".join(args))
    subprocess.run(args, check=True)


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--loop-a", type=Path, required=True)
    parser.add_argument("--loop-b", type=Path, required=True)
    parser.add_argument("--duration", type=float, default=226.16)
    parser.add_argument("--output", type=Path, required=True)
    parser.add_argument(
        "--concat-list",
        type=Path,
        default=None,
        help="Optional path for ffmpeg concat demuxer list file",
    )
    args = parser.parse_args()

    loop_a = args.loop_a.resolve()
    loop_b = args.loop_b.resolve()
    output = args.output.resolve()
    output.parent.mkdir(parents=True, exist_ok=True)

    clip_duration = ffprobe_duration(loop_a)
    pair_duration = clip_duration * 2
    pairs = max(1, int((args.duration / pair_duration) + 0.999))

    concat_list = args.concat_list or output.with_suffix(".concat.txt")
    write_concat_list(loop_a, loop_b, pairs, concat_list)

    temp_concat = output.with_suffix(".concat-full.mp4")
    run_ffmpeg(
        [
            "ffmpeg",
            "-y",
            "-f",
            "concat",
            "-safe",
            "0",
            "-i",
            str(concat_list),
            "-c",
            "copy",
            str(temp_concat),
        ]
    )

    run_ffmpeg(
        [
            "ffmpeg",
            "-y",
            "-i",
            str(temp_concat),
            "-t",
            str(args.duration),
            "-c",
            "copy",
            str(output),
        ]
    )

    print(f"Wrote {output} ({pairs} A/B pairs, trimmed to {args.duration}s)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
