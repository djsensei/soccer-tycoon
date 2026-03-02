# Card Art Guide

## Source images

- **Format**: PNG with transparent background
- **Dimensions**: 512 × 512 px
- **Location**: `img/cards/processed/[card-id].png` — filename must exactly match the card's `id` field in `data.js`

## Generation workflow

1. `uv run forge.py concepts --slot <slot> --rarity <rarity>` — scaffolds concepts in `new_options.json`
2. Populate options: run `/generate-card-concepts` or ask Claude Code to generate options for all concepts in `new_options.json`
3. `uv run forge.py select` — interactive picker; auto-generates `prompts.txt` on exit
4. Generate images in Stable Diffusion using prompts from `tools/card-forge/data/prompts.txt`
5. Drop raw PNG outputs into `tools/card-forge/input/`
6. `uv run forge.py rename` — assigns card IDs; then auto-runs `process` → `export --apply`
   - `process`: removes background (rembg), crops tight, resizes/pads to 512 × 512, saves to `img/cards/processed/`; archives raw input to `img/cards/originals/` (gitignored)
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

## Option generation (step 2) — recommended approach

Use a **single Task agent** that generates all concepts' options at once and writes `patch.json`, then runs `forge.py populate`. Do NOT spawn per-concept background agents — their results are lost when output files are empty.

Recommended flow inside the skill / manual prompt:

1. Read `tools/card-forge/data/new_options.json` to find concepts with empty `options` arrays
2. Launch **one** foreground `general-purpose` Task agent that:
   - Generates 10 options (name, flavourText, imageDesc, colors) per concept inline
   - Writes the merged result as `tools/card-forge/data/patch.json`
   - Runs `cd tools/card-forge && uv run forge.py populate --file data/patch.json`
3. Report a preview table (concept ID → first option name) so the user can sanity-check before `select`

Each option needs 4 fields: `name` (2-3 words), `flavourText` (<15 words, silly), `imageDesc` (detailed visual, no backgrounds), `colors` (3-4 color palette).

Themes should be diverse per concept (fantasy, sci-fi, nature, food, animals, mythology, absurd). Stats loosely inspire the theme but creativity is encouraged.

## Fallback behavior

If `img/cards/processed/[card-id].png` is missing, `cardImage()` renders a dark placeholder square
tinted with the card's rarity color. The layout never breaks during incremental art rollout.
