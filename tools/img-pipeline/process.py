"""
Image processing pipeline for Soccer Tycoon card art.

Drop raw SD outputs (white background, any size) into input/ named after
their card ID (e.g. rocket-boots.png), then run:

    uv run process.py

Outputs transparent 512x512 PNGs to img/cards/.
"""

import io
from pathlib import Path

from PIL import Image
from rembg import remove

INPUT_DIR  = Path(__file__).parent / "input"
OUTPUT_DIR = Path(__file__).parent / "../../img/cards/processed"
TARGET_SIZE = 512
EXTENSIONS  = {".png", ".jpg", ".jpeg", ".webp"}


def process_image(src: Path, dst: Path):
    print(f"  {src.name}", end=" ... ", flush=True)
    result = remove(src.read_bytes())
    img = Image.open(io.BytesIO(result)).convert("RGBA")

    # Shrink to fit within TARGET_SIZE, preserving aspect ratio
    img.thumbnail((TARGET_SIZE, TARGET_SIZE), Image.LANCZOS)

    # Pad to square with transparent background
    square = Image.new("RGBA", (TARGET_SIZE, TARGET_SIZE), (0, 0, 0, 0))
    offset_x = (TARGET_SIZE - img.width) // 2
    offset_y = (TARGET_SIZE - img.height) // 2
    square.paste(img, (offset_x, offset_y))

    dst.parent.mkdir(parents=True, exist_ok=True)
    square.save(dst, "PNG")
    print(f"→ {dst}")


def main():
    INPUT_DIR.mkdir(exist_ok=True)

    images = [p for p in INPUT_DIR.iterdir() if p.suffix.lower() in EXTENSIONS]
    if not images:
        print(f"No images found in {INPUT_DIR}/  — drop files there and re-run.")
        return

    print(f"Processing {len(images)} image(s)...\n")
    for src in sorted(images):
        dst = (OUTPUT_DIR / src.name).with_suffix(".png")
        process_image(src, dst)

    print(f"\nDone. {len(images)} file(s) written to img/cards/")


if __name__ == "__main__":
    main()
