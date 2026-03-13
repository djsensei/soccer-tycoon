#!/usr/bin/env python3
# /// script
# requires-python = ">=3.10"
# dependencies = ["Pillow"]
# ///
"""Re-process winning candidates without debug labels into img/backgrounds/."""
import sys
import urllib.request
from pathlib import Path

sys.stdout.reconfigure(encoding="utf-8")
from PIL import Image, ImageFilter

CANDIDATES_DIR = Path(__file__).resolve().parent / "candidates"
OUT_DIR = Path(__file__).resolve().parent.parent.parent / "img" / "backgrounds"
OUT_DIR.mkdir(parents=True, exist_ok=True)

TINT_COLOR = (13, 31, 13)

# Winners: (source cache name, blur, tint_alpha, output filename)
WINNERS = [
    ("local-D-park-soccer",        8, 160, "tier-local-1.jpg"),
    ("regional-B-bleachers",       8, 160, "tier-regional-1.jpg"),
    ("national-B-night-game",      8, 160, "tier-state-1.jpg"),
    ("national-A-stadium-pitch",   8, 160, "tier-national-1.jpg"),
    ("intl-A-packed-arena",        8, 160, "tier-international-1.jpg"),
]

def process(src_name, blur, alpha, out_name):
    src_path = CANDIDATES_DIR / f"_src_{src_name}.jpg"
    if not src_path.exists():
        print(f"  ERROR: source not found: {src_path}")
        return
    out_path = OUT_DIR / out_name

    img = Image.open(src_path).convert("RGB")
    if img.width > 1280:
        ratio = 1280 / img.width
        img = img.resize((1280, int(img.height * ratio)), Image.LANCZOS)

    img = img.filter(ImageFilter.GaussianBlur(radius=blur))

    overlay = Image.new("RGBA", img.size, (*TINT_COLOR, alpha))
    img = Image.composite(overlay, img.convert("RGBA"), overlay).convert("RGB")

    img.save(out_path, "JPEG", quality=75, optimize=True)
    print(f"  {out_name} ({out_path.stat().st_size // 1024}KB)")

def main():
    print(f"Promoting winners to {OUT_DIR}\n")
    for src_name, blur, alpha, out_name in WINNERS:
        process(src_name, blur, alpha, out_name)
    print("\nDone!")

if __name__ == "__main__":
    main()
