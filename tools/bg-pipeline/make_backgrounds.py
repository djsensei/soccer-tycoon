#!/usr/bin/env python3
# /// script
# requires-python = ">=3.10"
# dependencies = ["Pillow"]
# ///
"""
Download free stadium photos and process them into tinted, blurred backgrounds.
Usage: uv run make_backgrounds.py
"""
import sys
import urllib.request
from pathlib import Path

sys.stdout.reconfigure(encoding="utf-8")

from PIL import Image, ImageFilter

OUT_DIR = Path(__file__).resolve().parent.parent.parent / "img" / "backgrounds"
OUT_DIR.mkdir(parents=True, exist_ok=True)

# Free Pexels photos (direct download links, free license)
SOURCES = {
    "tier-local-1": "https://images.pexels.com/photos/1171084/pexels-photo-1171084.jpeg?auto=compress&cs=tinysrgb&w=1280",
    "tier-local-2": "https://images.pexels.com/photos/1618200/pexels-photo-1618200.jpeg?auto=compress&cs=tinysrgb&w=1280",
    "tier-regional-1": "https://images.pexels.com/photos/3621104/pexels-photo-3621104.jpeg?auto=compress&cs=tinysrgb&w=1280",
    "tier-regional-2": "https://images.pexels.com/photos/3148452/pexels-photo-3148452.jpeg?auto=compress&cs=tinysrgb&w=1280",
    "tier-national-1": "https://images.pexels.com/photos/46798/the-ball-stadion-football-the-pitch-46798.jpeg?auto=compress&cs=tinysrgb&w=1280",
    "tier-national-2": "https://images.pexels.com/photos/61143/pexels-photo-61143.jpeg?auto=compress&cs=tinysrgb&w=1280",
    "tier-international-1": "https://images.pexels.com/photos/270085/pexels-photo-270085.jpeg?auto=compress&cs=tinysrgb&w=1280",
    "tier-international-2": "https://images.pexels.com/photos/1884574/pexels-photo-1884574.jpeg?auto=compress&cs=tinysrgb&w=1280",
}

TINT_COLOR = (13, 31, 13)  # dark green matching --bg
TINT_ALPHA = 200  # 0-255; ~78%

def process(name: str, url: str) -> None:
    out_path = OUT_DIR / f"{name}.jpg"
    if out_path.exists():
        print(f"  skip {name} (exists)")
        return

    print(f"  downloading {name}...")
    tmp = OUT_DIR / f"_tmp_{name}.jpg"
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
        with urllib.request.urlopen(req, timeout=30) as resp, open(tmp, "wb") as f:
            f.write(resp.read())
    except Exception as e:
        print(f"  FAILED to download {name}: {e}")
        tmp.unlink(missing_ok=True)
        return

    print(f"  processing {name}...")
    img = Image.open(tmp).convert("RGB")
    # Resize to max 1280 wide
    if img.width > 1280:
        ratio = 1280 / img.width
        img = img.resize((1280, int(img.height * ratio)), Image.LANCZOS)

    # Gaussian blur
    img = img.filter(ImageFilter.GaussianBlur(radius=10))

    # Dark green tint overlay
    overlay = Image.new("RGBA", img.size, (*TINT_COLOR, TINT_ALPHA))
    img = Image.composite(overlay, img.convert("RGBA"), overlay).convert("RGB")

    img.save(out_path, "JPEG", quality=75, optimize=True)
    tmp.unlink(missing_ok=True)
    print(f"  saved {out_path.name} ({out_path.stat().st_size // 1024}KB)")

def main():
    print(f"Output: {OUT_DIR}")
    for name, url in SOURCES.items():
        process(name, url)
    print("Done!")

if __name__ == "__main__":
    main()
