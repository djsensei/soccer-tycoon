"""
Card Forge — Soccer Tycoon card generation pipeline.

Usage:
  uv run forge.py concepts --slot feet --rarity common
  uv run forge.py select
  uv run forge.py prompts
  uv run forge.py export
"""

import argparse
import json
import re
import sys
from pathlib import Path

# ── Config ────────────────────────────────────────────────────────────────────

STATS    = ['height', 'speed', 'strength', 'passing', 'shooting', 'reflexes', 'luck']
SLOTS    = ['feet', 'body', 'head', 'gloves']
RARITIES = ['common', 'uncommon', 'rare', 'epic', 'legendary']

SLOT_EXCLUSIONS = {
    'feet':   {'height'},
    'body':   {'reflexes'},
    'head':   {'speed'},
    'gloves': {'shooting', 'speed'},
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

DATA_DIR = Path(__file__).parent / 'data'
IMG_DIR  = Path(__file__).parent.parent.parent / 'img' / 'cards'

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
        for i, s1 in enumerate(stats):
            for j, s2 in enumerate(stats[i+1:], i+1):
                for s3 in stats[j+1:]:
                    add((s1, 2), (s2, 2), (s3, 2))

    elif rarity == 'legendary':
        for i, s1 in enumerate(stats):
            for s2 in stats[i+1:]:
                add((s1, 5), (s2, 3))
                add((s1, 4), (s2, 4))
        for i, s1 in enumerate(stats):
            for j, s2 in enumerate(stats[i+1:], i+1):
                for s3 in stats[j+1:]:
                    add((s1, 4), (s2, 2), (s3, 2))
                    add((s1, 3), (s2, 3), (s3, 2))
        for i, s1 in enumerate(stats):
            for j, s2 in enumerate(stats[i+1:], i+1):
                for k, s3 in enumerate(stats[j+1:], j+1):
                    for s4 in stats[k+1:]:
                        add((s1, 2), (s2, 2), (s3, 2), (s4, 2))

    return combos

def concept_id(slot, rarity, bonuses):
    stat_str = '_'.join(f'{s}{v}' for s, v in sorted(bonuses.items()))
    return f'{slot}-{rarity}-{stat_str}'

def load_options():
    f = DATA_DIR / 'options.json'
    return json.loads(f.read_text()) if f.exists() else []

def save_options(concepts):
    DATA_DIR.mkdir(exist_ok=True)
    (DATA_DIR / 'options.json').write_text(json.dumps(concepts, indent=2))

# ── Commands ──────────────────────────────────────────────────────────────────

def cmd_concepts(args):
    combos    = stat_combos(args.slot, args.rarity)
    existing  = {c['concept_id']: c for c in load_options()}
    new_count = 0

    for bonuses in combos:
        cid = concept_id(args.slot, args.rarity, bonuses)
        if cid not in existing:
            existing[cid] = {
                'concept_id': cid,
                'slot':       args.slot,
                'rarity':     args.rarity,
                'statBonuses': bonuses,
                'options':    [],   # populated by Haiku
                'selected':   [],   # list of chosen option indices
            }
            new_count += 1

    save_options(list(existing.values()))
    print(f"Added {new_count} new concepts ({args.slot}/{args.rarity}) — {len(combos)} total for this combo.")
    print(f"options.json now has {len(existing)} concepts total.")
    print(f"\nNext: ask Claude Code to run Haiku generation on options.json.")


def cmd_select(args):
    try:
        import questionary
    except ImportError:
        sys.exit("Run 'uv sync' first to install questionary.")

    concepts = load_options()
    ready    = [c for c in concepts if c['options']]

    if not ready:
        sys.exit("No options yet — ask Claude Code to run Haiku generation first.")

    changed = 0
    for c in ready:
        stat_desc = ', '.join(f'+{v} {s}' for s, v in c['statBonuses'].items())
        header    = f"\n── {c['slot'].upper()} · {c['rarity'].upper()} · {stat_desc} ──"
        print(header)

        choices = [
            questionary.Choice(
                title=f"{opt['name']}  —  \"{opt['flavourText']}\"",
                value=i,
                checked=(i in (c.get('selected') or [])),
            )
            for i, opt in enumerate(c['options'])
        ]

        picks = questionary.checkbox("Pick favourites (space to toggle, enter to confirm):", choices).ask()
        if picks is None:   # ctrl-c
            break
        c['selected'] = picks
        changed += 1

    save_options(concepts)
    total_selected = sum(len(c.get('selected') or []) for c in concepts)
    print(f"\nSaved. {total_selected} cards selected across all concepts.")


def cmd_prompts(args):
    concepts = load_options()
    lines    = []

    for c in concepts:
        picks = c.get('selected') or []
        for idx in picks:
            opt    = c['options'][idx]
            name   = opt['name']
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
        return

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


def cmd_export(args):
    concepts = load_options()
    lines    = ['// ── Generated cards — paste into CARDS in data.js ──────────────────']

    for c in concepts:
        picks = c.get('selected') or []
        for idx in picks:
            opt     = c['options'][idx]
            name    = opt['name']
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

    out = DATA_DIR / 'export.js'
    out.write_text('\n'.join(lines), encoding='utf-8')
    print(f"Written -> {out}")
    print("Paste into the CARDS object in data.js.")


# ── CLI ───────────────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(description='Card Forge')
    sub    = parser.add_subparsers(dest='cmd', required=True)

    p_concepts = sub.add_parser('concepts', help='Generate card concepts for a slot+rarity')
    p_concepts.add_argument('--slot',   required=True, choices=SLOTS)
    p_concepts.add_argument('--rarity', required=True, choices=RARITIES)

    sub.add_parser('select',  help='Browse Haiku options and pick favourites')
    sub.add_parser('prompts', help='Write SD prompts for selected cards')

    p_rename = sub.add_parser('rename', help='Interactively rename raw SD outputs to card IDs')
    p_rename.add_argument('--dir', default=str(Path(__file__).parent.parent.parent / 'img'),
                          help='Directory containing images to rename (default: img/)')

    sub.add_parser('export',  help='Write data.js card definitions')

    args = parser.parse_args()
    {'concepts': cmd_concepts, 'select':  cmd_select,
     'prompts':  cmd_prompts,  'rename':  cmd_rename,
     'export':   cmd_export}[args.cmd](args)

if __name__ == '__main__':
    main()
