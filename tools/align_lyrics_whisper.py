"""Thin wrapper — canonical script: boilerplate/lyric-video-kit/scripts/align_lyrics_whisper.py"""

from __future__ import annotations

import subprocess
import sys
from pathlib import Path

_REPO_ROOT = Path(__file__).resolve().parents[1]
_KIT_SCRIPT = _REPO_ROOT / "boilerplate" / "lyric-video-kit" / "scripts" / "align_lyrics_whisper.py"


def main() -> None:
    if not _KIT_SCRIPT.is_file():
        raise SystemExit(f"Kit align script not found: {_KIT_SCRIPT}")
    raise SystemExit(subprocess.call([sys.executable, str(_KIT_SCRIPT), *sys.argv[1:]]))


if __name__ == "__main__":
    main()
