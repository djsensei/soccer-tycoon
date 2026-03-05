"""
Card Forge — Soccer Tycoon card generation pipeline.

Usage:
  uv run forge.py concepts --slot feet --rarity common
  uv run forge.py select          # interactive; auto-generates prompts.txt
  # → generate SD images, drop in tools/card-forge/input/
  uv run forge.py rename          # interactive; auto: process → export --apply → cleanup
"""

import argparse
import io
import json
import re
import shutil
import sys
from pathlib import Path

# ── Config ────────────────────────────────────────────────────────────────────

STATS    = ['jumping', 'speed', 'strength', 'passing', 'shooting', 'reflexes', 'luck']
SLOTS    = ['feet', 'body', 'head', 'gloves']
RARITIES = ['common', 'uncommon', 'rare', 'epic', 'legendary']

SLOT_EXCLUSIONS = {
    'feet':   {'jumping'},
    'body':   {'reflexes'},
    'head':   {'speed'},
    'gloves': {'shooting', 'speed', 'jumping'},
}

RARITY_BUDGET = {
    'common':    1,
    'uncommon':  2,
    'rare':      4,
    'epic':      6,
    'legendary': 8,
}

RARITY_COLORS = {
    'common':    'grey and white with silver streaks',
    'uncommon':  'green and white with emerald streaks',
    'rare':      'blue and white with sapphire streaks',
    'epic':      'purple and black with amethyst streaks',
    'legendary': 'gold and orange with blazing amber streaks',
}

SLOT_TRAIL_ORIGIN = {
    'feet':   'the heel',
    'body':   'the shoulders',
    'head':   'the back',
    'gloves': 'the fingertips',
}

DATA_DIR     = Path(__file__).parent / 'data'
IMG_DIR       = Path(__file__).parent.parent.parent / 'img' / 'cards' / 'processed'
ORIGINALS_DIR = Path(__file__).parent.parent.parent / 'img' / 'cards' / 'originals'
INPUT_DIR    = Path(__file__).parent / 'input'
DATA_JS      = Path(__file__).parent.parent.parent / 'data.js'

FORGE_START  = '  // @forge:start'
FORGE_END    = '  // @forge:end'

NEW_FILE     = DATA_DIR / 'new_options.json'
VIEWED_FILE  = DATA_DIR / 'viewed_options.json'
LEGACY_FILE  = DATA_DIR / 'options.json'

# ── Helpers ───────────────────────────────────────────────────────────────────

def slugify(name):
    return re.sub(r'[^a-z0-9]+', '-', name.lower()).strip('-')

def valid_stats(slot):
    excluded = SLOT_EXCLUSIONS.get(slot, set())
    return [s for s in STATS if s not in excluded]

def stat_combos(slot, rarity):
    """All valid stat distributions for slot+rarity, sorted for stability."""
    budget = RARITY_BUDGET[rarity]
    stats  = valid_stats(slot)
    combos = []

    def add(*pairs):
        combos.append(dict(sorted(pairs)))

    if rarity == 'common':
        for s in stats:
            add((s, 1))

    elif rarity == 'uncommon':
        for s in stats:
            add((s, 2))
        for i, s1 in enumerate(stats):
            for s2 in stats[i+1:]:
                add((s1, 1), (s2, 1))

    elif rarity == 'rare':
        for s in stats:
            add((s, 4))
        for i, s1 in enumerate(stats):
            for s2 in stats[i+1:]:
                add((s1, 3), (s2, 1))
                add((s1, 2), (s2, 2))

    elif rarity == 'epic':
        for s in stats:
            add((s, 6))
        for i, s1 in enumerate(stats):
            for s2 in stats[i+1:]:
                add((s1, 4), (s2, 2))
                add((s1, 3), (s2, 3))

    elif rarity == 'legendary':
        for s in stats:
            add((s, 8))
        for i, s1 in enumerate(stats):
            for s2 in stats[i+1:]:
                add((s1, 5), (s2, 3))
                add((s1, 4), (s2, 4))

    return combos

def concept_id(slot, rarity, bonuses):
    stat_str = '_'.join(f'{s}{v}' for s, v in sorted(bonuses.items()))
    return f'{slot}-{rarity}-{stat_str}'

def _load_json(path):
    return json.loads(path.read_text()) if path.exists() else []

def load_new():
    return _load_json(NEW_FILE)

def load_viewed():
    return _load_json(VIEWED_FILE)

def load_options():
    """All concepts (viewed + new) for use by prompts/export/concepts."""
    return load_viewed() + load_new()

def save_new(concepts):
    DATA_DIR.mkdir(exist_ok=True)
    NEW_FILE.write_text(json.dumps(concepts, indent=2))

def save_viewed(concepts):
    DATA_DIR.mkdir(exist_ok=True)
    VIEWED_FILE.write_text(json.dumps(concepts, indent=2))

def migrate_legacy():
    """One-time migration: options.json → viewed_options.json."""
    if LEGACY_FILE.exists() and not NEW_FILE.exists() and not VIEWED_FILE.exists():
        concepts = _load_json(LEGACY_FILE)
        save_viewed(concepts)
        LEGACY_FILE.rename(DATA_DIR / 'options.json.bak')
        print(f"Migrated options.json → viewed_options.json ({len(concepts)} concepts).")

def build_card_lines(concepts):
    """Build the JS card definition lines for all selected options."""
    lines = []
    for c in concepts:
        picks = c.get('selected') or []
        for idx in picks:
            opt     = c['options'][idx]
            name    = re.sub(r"['\"]", '', opt['name'])
            slug    = slugify(name)
            bonuses = ', '.join(f'{s}: {v}' for s, v in c['statBonuses'].items())
            flavour = opt['flavourText'].replace('"', '\\"')
            img_ok  = (IMG_DIR / f'{slug}.png').exists()
            note    = '' if img_ok else '  // ⚠ image pending'
            lines.append(
                f"  '{slug}': {{ id: '{slug}', name: '{name}', slot: '{c['slot']}', "
                f"rarity: '{c['rarity']}', flavourText: \"{flavour}\", "
                f"statBonuses: {{ {bonuses} }} }},{note}"
            )
    return lines

# ── Commands ──────────────────────────────────────────────────────────────────

def cmd_concepts(args):
    combos      = stat_combos(args.slot, args.rarity)
    all_ids     = {c['concept_id'] for c in load_options()}
    new_queue   = load_new()
    new_count   = 0

    for bonuses in combos:
        cid = concept_id(args.slot, args.rarity, bonuses)
        if cid not in all_ids:
            new_queue.append({
                'concept_id':  cid,
                'slot':        args.slot,
                'rarity':      args.rarity,
                'statBonuses': bonuses,
                'options':     [],   # populated by Haiku
                'selected':    [],
            })
            new_count += 1

    save_new(new_queue)
    print(f"Added {new_count} new concepts ({args.slot}/{args.rarity}) — {len(combos)} total for this combo.")
    print(f"new_options.json now has {len(new_queue)} unselected concepts.")
    print(f"\nNext: ask Claude Code to run Haiku generation on new_options.json.")


def cmd_populate(args):
    """Merge Haiku-generated options into new_options.json from a patch file.

    Patch file is JSON: {"concept_id": [array of 10 options], ...}
    Each option must have: name, flavourText, imageDesc, colors.
    """
    patch_path = Path(args.file)
    if not patch_path.exists():
        sys.exit(f"Patch file not found: {patch_path}")

    patch = json.loads(patch_path.read_text(encoding='utf-8'))
    if not isinstance(patch, dict):
        sys.exit("Patch file must be a JSON object mapping concept_id → options array.")

    required_keys = {'name', 'flavourText', 'imageDesc', 'colors'}
    concepts = load_new()
    cid_map  = {c['concept_id']: c for c in concepts}
    filled   = 0
    errors   = []

    for cid, options in patch.items():
        if cid not in cid_map:
            errors.append(f"  Unknown concept_id: {cid}")
            continue
        if not isinstance(options, list) or len(options) != 10:
            errors.append(f"  {cid}: expected 10 options, got {len(options) if isinstance(options, list) else 'non-list'}")
            continue
        bad = [i for i, o in enumerate(options) if not required_keys.issubset(o.keys())]
        if bad:
            errors.append(f"  {cid}: options {bad} missing keys (need {required_keys})")
            continue
        cid_map[cid]['options'] = options
        filled += 1

    save_new(concepts)
    print(f"Populated {filled}/{len(patch)} concepts in new_options.json.")
    if errors:
        print("Errors:")
        for e in errors:
            print(e)
    empty = sum(1 for c in concepts if not c['options'])
    if empty:
        print(f"{empty} concept(s) still have empty options.")
    else:
        print("All concepts populated! Next: uv run forge.py select")


def cmd_select(args):
    try:
        import questionary
    except ImportError:
        sys.exit("Run 'uv sync' first to install questionary.")

    show_all        = getattr(args, 'all', False)
    new_concepts    = load_new()
    viewed_concepts = load_viewed()

    pool  = (viewed_concepts + new_concepts) if show_all else new_concepts
    ready = [c for c in pool if c['options']]

    if not ready:
        if show_all:
            sys.exit("No options yet — ask Claude Code to run Haiku generation first.")
        msg = "No new concepts to select from."
        if viewed_concepts:
            msg += " Use --all to reconsider previous selections."
        sys.exit(msg)

    if show_all:
        print(f"Showing all {len(ready)} concepts (new + previously viewed).")
    else:
        print(f"Showing {len(ready)} new concept(s). Use --all to revisit previous selections.")

    seen_ids = set()
    i = 0
    while i < len(ready):
        c         = ready[i]
        seen_ids.add(c['concept_id'])
        stat_desc = ', '.join(f'+{v} {s}' for s, v in c['statBonuses'].items())
        position  = f"({i + 1}/{len(ready)})"
        print(f"\n── {c['slot'].upper()} · {c['rarity'].upper()} · {stat_desc}  {position} ──")

        choices = [
            questionary.Choice(
                title=f"{opt['name']}  —  \"{opt['flavourText']}\"",
                value=idx,
                checked=(idx in (c.get('selected') or [])),
            )
            for idx, opt in enumerate(c['options'])
        ]

        picks = questionary.checkbox("Pick favourites (space to toggle, enter to confirm):", choices).ask()
        if picks is None:   # ctrl-c
            break
        c['selected'] = picks

        nav_choices = ['→ Next']
        if i > 0:
            nav_choices.append('← Go back')
        nav_choices.append('✕ Stop here')

        nav = questionary.select("", choices=nav_choices).ask()
        if nav is None or nav == '✕ Stop here':
            break
        if nav == '← Go back':
            i -= 1
        else:
            i += 1

    # Move seen new concepts to viewed; leave unseen new concepts in place
    new_by_id    = {c['concept_id']: c for c in new_concepts}
    viewed_by_id = {c['concept_id']: c for c in viewed_concepts}

    for cid in seen_ids:
        # Grab updated concept from ready (selections may have changed)
        c = next(c for c in ready if c['concept_id'] == cid)
        viewed_by_id[cid] = c
        new_by_id.pop(cid, None)

    save_viewed(list(viewed_by_id.values()))
    save_new(list(new_by_id.values()))

    moved = len(seen_ids - set(c['concept_id'] for c in viewed_concepts))
    total_selected = sum(len(c.get('selected') or []) for c in load_options())
    print(f"\nSaved. {moved} concept(s) moved to viewed. {total_selected} cards selected total.")

    print("\n" + "─" * 60)
    print("Auto-generating prompts.txt...")
    cmd_prompts(args)


def cmd_prompts(args):
    concepts = load_options()
    lines    = []

    for c in concepts:
        picks = c.get('selected') or []
        for idx in picks:
            opt    = c['options'][idx]
            name   = re.sub(r"['\"]", '', opt['name'])
            colors = opt.get('colors') or RARITY_COLORS[c['rarity']]
            origin = SLOT_TRAIL_ORIGIN[c['slot']]
            item   = opt.get('imageDesc') or name.lower()

            prompt = (
                f'For video game "card" art, a square pixelated {item}, '
                f'angled diagonally towards the front corner. '
                f'The style is fast and angular, with {colors}. '
                f'It should not use recognizable brand insignia. '
                f'A thick stream of sparkles in similar colors trails from {origin} to indicate [speed/energy]. '
                f'Plain white background.'
            )

            slug  = slugify(name)
            bonus = ', '.join(f'+{v} {s}' for s, v in c['statBonuses'].items())
            lines += [f'# {slug}', f'# {name} ({c["rarity"]} {c["slot"]}) — {bonus}', prompt, '']

    if not lines:
        sys.exit("No selections yet — run 'forge.py select' first.")

    out = DATA_DIR / 'prompts.txt'
    out.write_text('\n'.join(lines))
    print(f"Written {len([l for l in lines if l.startswith('# ') and not l.startswith('# #')])} prompts → {out}")


def parse_prompts_file():
    """Parse prompts.txt into {card_id: prompt_text}."""
    prompts_file = DATA_DIR / 'prompts.txt'
    if not prompts_file.exists():
        sys.exit("No prompts.txt found — run 'forge.py prompts' first.")

    cards = {}
    current_id = None
    for line in prompts_file.read_text().splitlines():
        if not line.strip():
            current_id = None
            continue
        if line.startswith('# '):
            content = line[2:].strip()
            # Card ID lines are slug-format: no spaces, no parens
            if current_id is None and ' ' not in content and '(' not in content:
                current_id = content
        elif current_id and not line.startswith('#'):
            cards[current_id] = line.strip()
            current_id = None
    return cards


def normalize_tokens(text):
    return set(re.sub(r'[^a-z0-9\s]', ' ', text.lower()).split())


def cmd_process(args):
    """Remove backgrounds, resize/pad to 512×512, write to img/cards/, delete from input/."""
    try:
        from rembg import remove
        from PIL import Image
    except ImportError:
        sys.exit("Run 'uv sync' first to install rembg and Pillow.")

    src_dir = Path(getattr(args, 'dir', None) or INPUT_DIR)
    if not src_dir.exists():
        print("input/ directory not found — nothing to process.")
        return

    imgs = sorted(src_dir.glob('*.png'))
    if not imgs:
        print("No PNG files in input/ — nothing to process.")
        return

    IMG_DIR.mkdir(parents=True, exist_ok=True)
    ORIGINALS_DIR.mkdir(parents=True, exist_ok=True)
    processed = 0

    for img_path in imgs:
        print(f"  Processing {img_path.name}...")
        raw    = img_path.read_bytes()
        output = remove(raw)
        img    = Image.open(io.BytesIO(output)).convert('RGBA')

        # Crop to non-transparent bounding box with a small margin
        bbox = img.getbbox()
        if bbox:
            margin = max(img.width, img.height) // 20   # ~5% padding
            bbox = (max(0, bbox[0] - margin), max(0, bbox[1] - margin),
                    min(img.width, bbox[2] + margin), min(img.height, bbox[3] + margin))
            img = img.crop(bbox)

        # Resize to fit within 512×512 preserving aspect ratio, then center on canvas
        img.thumbnail((512, 512), Image.LANCZOS)
        canvas = Image.new('RGBA', (512, 512), (0, 0, 0, 0))
        offset = ((512 - img.width) // 2, (512 - img.height) // 2)
        canvas.paste(img, offset)

        dest = IMG_DIR / img_path.name
        canvas.save(dest, 'PNG')
        print(f"    → {dest}")

        # Archive original, then remove from input
        shutil.copy2(img_path, ORIGINALS_DIR / img_path.name)
        img_path.unlink()
        processed += 1

    print(f"\nProcessed {processed} image(s) → {IMG_DIR}")


def cmd_rename(args):
    try:
        import questionary
    except ImportError:
        sys.exit("Run 'uv sync' first to install questionary.")

    src_dir = Path(args.dir)
    if not src_dir.exists():
        sys.exit(f"Directory not found: {src_dir}")

    card_prompts  = parse_prompts_file()
    prompt_tokens = {cid: normalize_tokens(text) for cid, text in card_prompts.items()}

    unknowns = [p for p in sorted(src_dir.glob('*.png')) if p.stem not in card_prompts]
    if not unknowns:
        print("No unrecognized PNGs found — nothing to rename.")
    else:
        renamed = auto_count = 0

        for img in unknowns:
            file_tokens = normalize_tokens(img.stem)
            scores      = {cid: len(file_tokens & toks) for cid, toks in prompt_tokens.items()}
            ranked      = sorted(scores.items(), key=lambda x: x[1], reverse=True)
            best_id, best_score = ranked[0]
            second_score        = ranked[1][1] if len(ranked) > 1 else 0

            dest = img.parent / f'{best_id}.png'

            if best_score >= 2 and best_score > second_score:
                if dest.exists():
                    print(f"SKIP {img.name}  (auto-match: {best_id}, score {best_score}, but dest exists)")
                    continue
                img.rename(dest)
                print(f"AUTO  {img.name}  →  {best_id}.png  (score {best_score})")
                renamed += 1
                auto_count += 1
            else:
                print(f"\nFile: {img.name}")
                if best_score > 0:
                    print("  Top matches: " + ", ".join(f"{cid} ({s})" for cid, s in ranked[:3] if s > 0))
                else:
                    print("  No keyword matches found.")

                choice = questionary.select(
                    "Which card is this?",
                    choices=list(card_prompts.keys()) + ['(skip)'],
                ).ask()

                if not choice or choice == '(skip)':
                    continue

                dest = img.parent / f'{choice}.png'
                if dest.exists():
                    if not questionary.confirm(f"{dest.name} already exists — overwrite?").ask():
                        continue

                img.rename(dest)
                print(f"  → {dest.name}")
                renamed += 1

        print(f"\nDone. {renamed} file(s) renamed ({auto_count} automatic).")

    print("\n" + "─" * 60)
    print("Auto-processing input/ images...")
    cmd_process(args)

    print("\n" + "─" * 60)
    print("Auto-applying export to data.js...")
    args.apply = True
    cmd_export(args)


def cmd_export(args):
    concepts   = load_options()
    card_lines = build_card_lines(concepts)
    apply      = getattr(args, 'apply', False)

    if apply:
        if not DATA_JS.exists():
            sys.exit(f"data.js not found at {DATA_JS}")

        content   = DATA_JS.read_text(encoding='utf-8')
        start_idx = content.find(FORGE_START)
        end_idx   = content.find(FORGE_END)

        if start_idx == -1 or end_idx == -1:
            sys.exit("Sentinel markers not found in data.js — add them first.")

        start_line_end = content.index('\n', start_idx) + 1
        inner = ('\n'.join(card_lines) + '\n') if card_lines else ''
        new_content = content[:start_line_end] + inner + content[end_idx:]

        DATA_JS.write_text(new_content, encoding='utf-8')
        print(f"Patched {len(card_lines)} card(s) into data.js sentinel block.")

        # Clean up stale export.js
        export_js = DATA_DIR / 'export.js'
        if export_js.exists():
            export_js.unlink()
            print("Deleted stale export.js.")
    else:
        lines = ['// ── Generated cards — paste into CARDS in data.js ──────────────────'] + card_lines
        out   = DATA_DIR / 'export.js'
        out.write_text('\n'.join(lines), encoding='utf-8')
        print(f"Written -> {out}")
        print("Paste into the CARDS object in data.js.")


# ── CLI ───────────────────────────────────────────────────────────────────────

def main():
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')
    migrate_legacy()
    parser = argparse.ArgumentParser(description='Card Forge')
    sub    = parser.add_subparsers(dest='cmd', required=True)

    p_concepts = sub.add_parser('concepts', help='Generate card concepts for a slot+rarity')
    p_concepts.add_argument('--slot',   required=True, choices=SLOTS)
    p_concepts.add_argument('--rarity', required=True, choices=RARITIES)

    p_populate = sub.add_parser('populate', help='Merge Haiku-generated options from a JSON patch file')
    p_populate.add_argument('--file', required=True,
                            help='JSON file mapping concept_id → array of 10 options')

    p_select = sub.add_parser('select', help='Browse new options and pick favourites (auto-generates prompts.txt)')
    p_select.add_argument('--all', action='store_true',
                          help='Also show previously viewed concepts for reconsideration')
    sub.add_parser('prompts', help='Write SD prompts for selected cards')
    p_process = sub.add_parser('process', help='Remove backgrounds and resize images from input/ → img/cards/')
    p_process.add_argument('--dir', default=str(INPUT_DIR),
                           help='Directory containing images to process (default: input/)')

    p_rename = sub.add_parser('rename', help='Rename raw SD outputs; then auto: process → export --apply')
    p_rename.add_argument('--dir', default=str(INPUT_DIR),
                          help='Directory containing images to rename (default: input/)')

    p_export = sub.add_parser('export', help='Write card definitions to data.js or export.js')
    p_export.add_argument('--apply', action='store_true',
                          help='Patch data.js between sentinel markers instead of writing export.js')

    args = parser.parse_args()
    {'concepts': cmd_concepts, 'populate': cmd_populate,
     'select':  cmd_select,   'prompts':  cmd_prompts,
     'process': cmd_process,  'rename':   cmd_rename,
     'export':  cmd_export}[args.cmd](args)

if __name__ == '__main__':
    main()
