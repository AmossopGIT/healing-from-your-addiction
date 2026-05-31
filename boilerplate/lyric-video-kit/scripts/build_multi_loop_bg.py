"""Concatenate prepped loop clips in repeating order (A,B,C,...) for a target duration."""

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


def write_concat_list(loops: list[Path], cycles: int, out_list: Path) -> None:
    lines: list[str] = []
    for _ in range(cycles):
        for loop in loops:
            lines.append(f"file '{loop.as_posix()}'")
    out_list.write_text("\n".join(lines) + "\n", encoding="utf-8")


def run_ffmpeg(args: list[str]) -> None:
    print(" ".join(args))
    subprocess.run(args, check=True)


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--loop",
        type=Path,
        action="append",
        required=True,
        help="Prepped loop; repeat --loop for each clip in play order",
    )
    parser.add_argument("--duration", type=float, required=True)
    parser.add_argument("--output", type=Path, required=True)
    parser.add_argument("--concat-list", type=Path, default=None)
    args = parser.parse_args()

    loops = [p.resolve() for p in args.loop]
    output = args.output.resolve()
    output.parent.mkdir(parents=True, exist_ok=True)

    cycle_duration = sum(ffprobe_duration(p) for p in loops)
    cycles = max(1, int((args.duration / cycle_duration) + 0.999))

    concat_list = args.concat_list or output.with_suffix(".concat.txt")
    write_concat_list(loops, cycles, concat_list)

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

    print(
        f"Wrote {output} ({cycles} cycles x {len(loops)} loops, "
        f"trimmed to {args.duration}s)"
    )
    return 0


if __name__ == "__main__":
    sys.exit(main())
