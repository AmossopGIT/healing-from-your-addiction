import argparse
import pathlib
import re


TIME_PATTERN = re.compile(
    r"(\d\d):(\d\d):(\d\d),(\d\d\d) --> (\d\d):(\d\d):(\d\d),(\d\d\d)"
)


def to_ms(h: str, m: str, s: str, ms: str) -> int:
    return (((int(h) * 60 + int(m)) * 60) + int(s)) * 1000 + int(ms)


def format_ms(ms: float) -> str:
    value = max(0, int(round(ms)))
    h = value // 3_600_000
    value %= 3_600_000
    m = value // 60_000
    value %= 60_000
    s = value // 1_000
    value %= 1_000
    return f"{h:02}:{m:02}:{s:02},{value:03}"


def main() -> None:
    parser = argparse.ArgumentParser(description="Scale all SRT timestamps by factor.")
    parser.add_argument("--input", required=True, type=pathlib.Path)
    parser.add_argument("--output", required=True, type=pathlib.Path)
    parser.add_argument("--factor", required=True, type=float)
    args = parser.parse_args()

    text = args.input.read_text(encoding="utf-8")

    def replacer(match: re.Match[str]) -> str:
        start = to_ms(*match.group(1, 2, 3, 4))
        end = to_ms(*match.group(5, 6, 7, 8))
        return f"{format_ms(start * args.factor)} --> {format_ms(end * args.factor)}"

    retimed = TIME_PATTERN.sub(replacer, text)
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(retimed, encoding="utf-8")


if __name__ == "__main__":
    main()
