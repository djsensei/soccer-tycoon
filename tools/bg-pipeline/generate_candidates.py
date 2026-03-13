#!/usr/bin/env python3
# /// script
# requires-python = ">=3.10"
# dependencies = ["Pillow"]
# ///
"""
Generate a large batch of stadium background candidates with varied sources,
blur radii, and tint strengths. Browse the output folder and pick winners.

Usage: uv run generate_candidates.py
"""
import sys
import urllib.request
from pathlib import Path
from itertools import product

sys.stdout.reconfigure(encoding="utf-8")

from PIL import Image, ImageFilter, ImageDraw, ImageFont

OUT_DIR = Path(__file__).resolve().parent / "candidates"
OUT_DIR.mkdir(parents=True, exist_ok=True)

# --- Source photos (Pexels, free license) ---
# Multiple candidates per tier, heavy on local since those need the most work
SOURCES = {
    # LOCAL — park pitches, pickup games, neighborhood fields
    "local-A-park-field":        "https://images.pexels.com/photos/1171084/pexels-photo-1171084.jpeg?auto=compress&cs=tinysrgb&w=1280",
    "local-B-kids-pitch":        "https://images.pexels.com/photos/1618200/pexels-photo-1618200.jpeg?auto=compress&cs=tinysrgb&w=1280",
    "local-C-grass-closeup":     "https://images.pexels.com/photos/1227513/pexels-photo-1227513.jpeg?auto=compress&cs=tinysrgb&w=1280",
    "local-D-park-soccer":       "https://images.pexels.com/photos/114296/pexels-photo-114296.jpeg?auto=compress&cs=tinysrgb&w=1280",
    "local-E-backyard-goal":     "https://images.pexels.com/photos/3651674/pexels-photo-3651674.jpeg?auto=compress&cs=tinysrgb&w=1280",
    "local-F-field-sunset":      "https://images.pexels.com/photos/1667583/pexels-photo-1667583.jpeg?auto=compress&cs=tinysrgb&w=1280",
    "local-G-empty-park":        "https://images.pexels.com/photos/2291006/pexels-photo-2291006.jpeg?auto=compress&cs=tinysrgb&w=1280",
    "local-H-soccer-ball-grass": "https://images.pexels.com/photos/47730/the-ball-stadion-football-the-pitch-47730.jpeg?auto=compress&cs=tinysrgb&w=1280",

    # REGIONAL — small stadiums, school fields, community grounds
    "regional-A-small-stadium":  "https://images.pexels.com/photos/3621104/pexels-photo-3621104.jpeg?auto=compress&cs=tinysrgb&w=1280",
    "regional-B-bleachers":      "https://images.pexels.com/photos/3148452/pexels-photo-3148452.jpeg?auto=compress&cs=tinysrgb&w=1280",
    "regional-C-floodlit-pitch": "https://images.pexels.com/photos/1884574/pexels-photo-1884574.jpeg?auto=compress&cs=tinysrgb&w=1280",
    "regional-D-training-ground":"https://images.pexels.com/photos/274422/pexels-photo-274422.jpeg?auto=compress&cs=tinysrgb&w=1280",
    "regional-E-community-game": "https://images.pexels.com/photos/3621120/pexels-photo-3621120.jpeg?auto=compress&cs=tinysrgb&w=1280",
    "regional-F-stands":         "https://images.pexels.com/photos/3991976/pexels-photo-3991976.jpeg?auto=compress&cs=tinysrgb&w=1280",

    # NATIONAL — mid-size stadiums, night games, atmosphere
    "national-A-stadium-pitch":  "https://images.pexels.com/photos/46798/the-ball-stadion-football-the-pitch-46798.jpeg?auto=compress&cs=tinysrgb&w=1280",
    "national-B-night-game":     "https://images.pexels.com/photos/61143/pexels-photo-61143.jpeg?auto=compress&cs=tinysrgb&w=1280",
    "national-C-stadium-lights": "https://images.pexels.com/photos/2570139/pexels-photo-2570139.jpeg?auto=compress&cs=tinysrgb&w=1280",
    "national-D-match-night":    "https://images.pexels.com/photos/3448250/pexels-photo-3448250.jpeg?auto=compress&cs=tinysrgb&w=1280",
    "national-E-stadium-dusk":   "https://images.pexels.com/photos/1884576/pexels-photo-1884576.jpeg?auto=compress&cs=tinysrgb&w=1280",
    "national-F-pitch-lines":    "https://images.pexels.com/photos/399187/pexels-photo-399187.jpeg?auto=compress&cs=tinysrgb&w=1280",

    # INTERNATIONAL — massive arenas, packed crowds, world-class
    "intl-A-packed-arena":       "https://images.pexels.com/photos/270085/pexels-photo-270085.jpeg?auto=compress&cs=tinysrgb&w=1280",
    "intl-B-world-class":        "https://images.pexels.com/photos/1884574/pexels-photo-1884574.jpeg?auto=compress&cs=tinysrgb&w=1280",
    "intl-C-big-stadium":        "https://images.pexels.com/photos/1619830/pexels-photo-1619830.jpeg?auto=compress&cs=tinysrgb&w=1280",
    "intl-D-fireworks":          "https://images.pexels.com/photos/2346043/pexels-photo-2346043.jpeg?auto=compress&cs=tinysrgb&w=1280",
    "intl-E-aerial-stadium":     "https://images.pexels.com/photos/1667071/pexels-photo-1667071.jpeg?auto=compress&cs=tinysrgb&w=1280",
    "intl-F-grand-arena":        "https://images.pexels.com/photos/3600942/pexels-photo-3600942.jpeg?auto=compress&cs=tinysrgb&w=1280",
}

# Processing parameter grid
TINT_COLOR = (13, 31, 13)  # dark green matching --bg

PARAM_COMBOS = [
    # (blur_radius, tint_alpha, label)
    (6,  180, "light-sharp"),
    (8,  200, "med"),
    (10, 200, "med-blurry"),
    (12, 220, "heavy"),
    (8,  160, "vivid"),
]


def download(name: str, url: str) -> Path | None:
    """Download source image, return path or None on failure."""
    cache = OUT_DIR / f"_src_{name}.jpg"
    if cache.exists():
        return cache
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
        with urllib.request.urlopen(req, timeout=30) as resp, open(cache, "wb") as f:
            f.write(resp.read())
        return cache
    except Exception as e:
        print(f"  SKIP {name}: download failed ({e})")
        return None


def process(src_path: Path, name: str, blur: int, alpha: int, label: str) -> None:
    out_name = f"{name}__{label}.jpg"
    out_path = OUT_DIR / out_name
    if out_path.exists():
        return  # already generated

    img = Image.open(src_path).convert("RGB")
    if img.width > 1280:
        ratio = 1280 / img.width
        img = img.resize((1280, int(img.height * ratio)), Image.LANCZOS)

    img = img.filter(ImageFilter.GaussianBlur(radius=blur))

    overlay = Image.new("RGBA", img.size, (*TINT_COLOR, alpha))
    img = Image.composite(overlay, img.convert("RGBA"), overlay).convert("RGB")

    # Burn the param label into the corner for easy comparison
    draw = ImageDraw.Draw(img)
    tag = f"{name} | blur={blur} tint={alpha} ({label})"
    draw.rectangle([(0, 0), (len(tag) * 7 + 10, 18)], fill=(0, 0, 0))
    draw.text((5, 2), tag, fill=(200, 200, 200))

    img.save(out_path, "JPEG", quality=80, optimize=True)


def generate_index(results: list[str]) -> None:
    """Write an HTML index page for easy browsing."""
    # Group by tier
    tiers = {"local": [], "regional": [], "national": [], "intl": []}
    for fname in sorted(results):
        for t in tiers:
            if fname.startswith(t):
                tiers[t].append(fname)
                break

    rows = []
    for tier, files in tiers.items():
        rows.append(f'<h2 style="color:#6dbf67;margin:1.5rem 0 0.5rem">{tier.upper()}</h2>')
        rows.append('<div style="display:flex;flex-wrap:wrap;gap:8px">')
        for f in files:
            rows.append(
                f'<div style="width:320px;text-align:center">'
                f'<img src="{f}" style="width:100%;border-radius:6px;border:2px solid #333">'
                f'<div style="font-size:11px;color:#aaa;margin-top:2px">{f.replace(".jpg","")}</div>'
                f'</div>'
            )
        rows.append('</div>')

    html = f"""<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>BG Candidates</title>
<style>body{{background:#0d1f0d;color:#e4f0e4;font-family:system-ui;padding:1rem}}
h1{{color:#6dbf67}}img{{cursor:pointer}}img:hover{{outline:3px solid #6dbf67}}</style></head>
<body><h1>Stadium Background Candidates ({len(results)} images)</h1>
<p style="color:#8aaa88">Click to open full size. Pick your favorites and tell me the filenames.</p>
{''.join(rows)}
</body></html>"""
    index_path = OUT_DIR / "index.html"
    index_path.write_text(html, encoding="utf-8")
    print(f"\n  Browse: {index_path}")


def main():
    print(f"Output: {OUT_DIR}")
    print(f"Sources: {len(SOURCES)} photos × {len(PARAM_COMBOS)} param combos = {len(SOURCES) * len(PARAM_COMBOS)} candidates\n")

    results = []
    for name, url in SOURCES.items():
        print(f"[{name}]")
        src = download(name, url)
        if not src:
            continue
        for blur, alpha, label in PARAM_COMBOS:
            process(src, name, blur, alpha, label)
            results.append(f"{name}__{label}.jpg")
            print(f"  ✓ {label}")

    generate_index(results)
    print(f"\nGenerated {len(results)} candidates!")


if __name__ == "__main__":
    main()
