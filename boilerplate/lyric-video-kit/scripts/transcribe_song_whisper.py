"""Transcribe audio with OpenAI Whisper; write JSON with word timestamps."""

from __future__ import annotations

import argparse
import json
from pathlib import Path


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--audio", type=Path, required=True)
    parser.add_argument("--output", type=Path, required=True)
    parser.add_argument("--model", default="medium")
    args = parser.parse_args()

    import whisper

    print(f"Loading Whisper model: {args.model}")
    model = whisper.load_model(args.model)
    print(f"Transcribing: {args.audio}")
    result = model.transcribe(
        str(args.audio),
        word_timestamps=True,
        language="en",
        verbose=False,
    )
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps(result, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"Wrote {args.output}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
