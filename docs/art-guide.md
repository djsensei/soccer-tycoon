# Card Art Guide

## Source images

- **Format**: PNG with transparent background
- **Dimensions**: 512 × 512 px
- **Location**: `img/cards/[card-id].png` — filename must exactly match the card's `id` field in `data.js`

## Generation workflow

1. `uv run forge.py concepts --slot <slot> --rarity <rarity>` — scaffolds concepts in `new_options.json`
2. Ask Claude Code to run Haiku generation to populate 10 name/flavour/imageDesc options per concept
3. `uv run forge.py select` — interactive picker; auto-generates `prompts.txt` on exit
4. Generate images in Stable Diffusion using prompts from `tools/card-forge/data/prompts.txt`
5. Drop raw PNG outputs into `tools/card-forge/input/`
6. `uv run forge.py rename` — assigns card IDs; then auto-runs `process` → `export --apply`
   - `process`: removes background (rembg), resizes/pads to 512 × 512, saves to `img/cards/`
   - `export --apply`: patches the `@forge:start` / `@forge:end` sentinel block in `data.js`

## Display sizes

| Context | CSS class | Rendered size | Notes |
|---------|-----------|---------------|-------|
| Pack opening | `.card-img-wrap.large` | 160 × 160 px | Rarity glow applied via `.pack-card.rarity-*` |
| Inventory / gear slots | `.card-img-wrap.small` | 48 × 48 px | `image-rendering: pixelated` for crunchy look |

## Rarity styling (pack opening)

| Rarity | Border | Glow |
|--------|--------|------|
| Common | Solid grey | None |
| Uncommon | Solid green | None |
| Rare | Solid blue | `box-shadow` 14px blue |
| Epic | Solid purple | `box-shadow` 20px purple |
| Legendary | Solid gold | Pulsing keyframe animation |

## Prompt template

```
For video game "card" art, a square pixelated [item description],
angled diagonally towards the front corner.
The style is fast and angular, with [colors].
It should not use recognizable brand insignia.
A thick stream of sparkles in similar colors trails from [trail origin] to indicate [speed/energy].
Plain white background.
```

Trail origins by slot: feet → heel · body → shoulders · head → back · gloves → fingertips

## Fallback behavior

If `img/cards/[card-id].png` is missing, `cardImage()` renders a dark placeholder square
tinted with the card's rarity color. The layout never breaks during incremental art rollout.
