#!/usr/bin/env python3
# /// script
# requires-python = ">=3.10"
# dependencies = ["Pillow"]
# ///
"""Generate state-tier background candidates (between regional and national)."""
import sys
import urllib.request
from pathlib import Path

sys.stdout.reconfigure(encoding="utf-8")
from PIL import Image, ImageFilter, ImageDraw

OUT_DIR = Path(__file__).resolve().parent / "candidates"
OUT_DIR.mkdir(parents=True, exist_ok=True)

TINT_COLOR = (13, 31, 13)

# State tier: bigger than community fields, smaller than pro stadiums
# School tournament vibes, county grounds, small-town football
SOURCES = {
    "state-A-county-ground":     "https://images.pexels.com/photos/3991976/pexels-photo-3991976.jpeg?auto=compress&cs=tinysrgb&w=1280",
    "state-B-school-field":      "https://images.pexels.com/photos/274422/pexels-photo-274422.jpeg?auto=compress&cs=tinysrgb&w=1280",
    "state-C-small-stands":      "https://images.pexels.com/photos/3148452/pexels-photo-3148452.jpeg?auto=compress&cs=tinysrgb&w=1280",
    "state-D-floodlit":          "https://images.pexels.com/photos/3621120/pexels-photo-3621120.jpeg?auto=compress&cs=tinysrgb&w=1280",
    "state-E-evening-match":     "https://images.pexels.com/photos/3621104/pexels-photo-3621104.jpeg?auto=compress&cs=tinysrgb&w=1280",
    "state-F-pitch-wide":        "https://images.pexels.com/photos/399187/pexels-photo-399187.jpeg?auto=compress&cs=tinysrgb&w=1280",
}

COMBOS = [
    (6, 160, "vivid-sharp"),
    (8, 160, "vivid"),
    (8, 180, "light"),
    (10, 180, "med"),
]

def download(name, url):
    cache = OUT_DIR / f"_src_{name}.jpg"
    if cache.exists():
        return cache
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
        with urllib.request.urlopen(req, timeout=30) as resp, open(cache, "wb") as f:
            f.write(resp.read())
        return cache
    except Exception as e:
        print(f"  SKIP {name}: {e}")
        return None

def process(src_path, name, blur, alpha, label):
    out_path = OUT_DIR / f"{name}__{label}.jpg"
    if out_path.exists():
        return
    img = Image.open(src_path).convert("RGB")
    if img.width > 1280:
        ratio = 1280 / img.width
        img = img.resize((1280, int(img.height * ratio)), Image.LANCZOS)
    img = img.filter(ImageFilter.GaussianBlur(radius=blur))
    overlay = Image.new("RGBA", img.size, (*TINT_COLOR, alpha))
    img = Image.composite(overlay, img.convert("RGBA"), overlay).convert("RGB")
    draw = ImageDraw.Draw(img)
    tag = f"{name} | blur={blur} tint={alpha} ({label})"
    draw.rectangle([(0, 0), (len(tag) * 7 + 10, 18)], fill=(0, 0, 0))
    draw.text((5, 2), tag, fill=(200, 200, 200))
    img.save(out_path, "JPEG", quality=80, optimize=True)

def main():
    print(f"Generating state-tier candidates...")
    results = []
    for name, url in SOURCES.items():
        print(f"[{name}]")
        src = download(name, url)
        if not src:
            continue
        for blur, alpha, label in COMBOS:
            process(src, name, blur, alpha, label)
            results.append(f"{name}__{label}.jpg")
            print(f"  ✓ {label}")

    # Append to index
    index_path = OUT_DIR / "index.html"
    if index_path.exists():
        existing = index_path.read_text(encoding="utf-8")
        # Insert before closing </body>
        state_html = '<h2 style="color:#6dbf67;margin:1.5rem 0 0.5rem">STATE (new)</h2>'
        state_html += '<div style="display:flex;flex-wrap:wrap;gap:8px">'
        for f in sorted(results):
            state_html += (
                f'<div style="width:320px;text-align:center">'
                f'<img src="{f}" style="width:100%;border-radius:6px;border:2px solid #333">'
                f'<div style="font-size:11px;color:#aaa;margin-top:2px">{f.replace(".jpg","")}</div>'
                f'</div>'
            )
        state_html += '</div>'
        existing = existing.replace('</body>', state_html + '</body>')
        index_path.write_text(existing, encoding="utf-8")

    print(f"\nGenerated {len(results)} state candidates!")
    print(f"Browse: {index_path}")

if __name__ == "__main__":
    main()
