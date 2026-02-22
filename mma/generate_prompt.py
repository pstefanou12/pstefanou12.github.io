#!/usr/bin/env python3
"""Assemble a complete LLM prompt for writing UFC recap or preview content.

Usage:
  python mma/generate_prompt.py recap  <card-id> <notes.txt>
  python mma/generate_prompt.py preview <card-id> <notes.txt>

Output is written to mma/prompts/generated_prompts/<card-id>-<mode>.txt
"""

import argparse
import json
import os
import sys


SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROMPTS_DIR = os.path.join(SCRIPT_DIR, 'prompts')
GENERATED_DIR = os.path.join(PROMPTS_DIR, 'generated_prompts')
CARDS_JSON = os.path.join(SCRIPT_DIR, 'js', 'ufc_cards.json')


def validate_card_id(card_id: str) -> dict:
    """Confirm card_id exists in ufc_cards.json and return the card entry."""
    if not os.path.exists(CARDS_JSON):
        print(f"Error: {CARDS_JSON} not found", file=sys.stderr)
        sys.exit(1)
    with open(CARDS_JSON, 'r', encoding='utf-8') as f:
        data = json.load(f)
    for card in data['cards']:
        if card['id'] == card_id:
            return card
    print(f"Error: card ID '{card_id}' not found in ufc_cards.json", file=sys.stderr)
    print("Available IDs:", file=sys.stderr)
    for card in data['cards']:
        print(f"  {card['id']}", file=sys.stderr)
    sys.exit(1)


def read_file(path: str, label: str) -> str:
    if not os.path.exists(path):
        print(f"Error: {label} not found at '{path}'", file=sys.stderr)
        sys.exit(1)
    with open(path, 'r', encoding='utf-8') as f:
        return f.read()


def assemble_prompt(mode: str, card: dict, notes_path: str) -> str:
    card_id = card['id']
    prompt_template_path = os.path.join(PROMPTS_DIR, 'RECAP.md' if mode == 'recap' else 'PREVIEW.md')
    html_subdir = 'recaps' if mode == 'recap' else 'previews'
    html_path = os.path.join(SCRIPT_DIR, html_subdir, f'{card_id}.html')

    prompt_template = read_file(prompt_template_path, 'Prompt template')
    notes = read_file(notes_path, 'Notes file')
    html_template = read_file(html_path, f'HTML {mode} template')

    event_title = card['title']
    if card.get('subtitle'):
        event_title += f": {card['subtitle']}"

    return f"""{prompt_template}
---

## Event: {event_title}

## Event Notes (`{os.path.basename(notes_path)}`):

{notes}

---

## HTML Template (`mma/{html_subdir}/{card_id}.html`):

```html
{html_template}
```
"""


def main():
    parser = argparse.ArgumentParser(
        description='Assemble a complete LLM prompt for a UFC recap or preview.'
    )
    parser.add_argument('mode', choices=['recap', 'preview'], help='recap or preview')
    parser.add_argument('card_id', help='Card ID (must exist in ufc_cards.json)')
    parser.add_argument('notes', help='Path to the event notes .txt file')
    args = parser.parse_args()

    card = validate_card_id(args.card_id)

    # Validate all required paths upfront before doing any work
    html_subdir = 'recaps' if args.mode == 'recap' else 'previews'
    paths_to_check = {
        'Notes file': args.notes,
        'Prompt template': os.path.join(PROMPTS_DIR, 'RECAP.md' if args.mode == 'recap' else 'PREVIEW.md'),
        f'HTML {args.mode} template': os.path.join(SCRIPT_DIR, html_subdir, f'{args.card_id}.html'),
    }
    errors = [f"  {label}: '{path}'" for label, path in paths_to_check.items() if not os.path.exists(path)]
    if errors:
        print("Error: the following paths do not exist:", file=sys.stderr)
        for e in errors:
            print(e, file=sys.stderr)
        sys.exit(1)

    prompt = assemble_prompt(args.mode, card, args.notes)

    os.makedirs(GENERATED_DIR, exist_ok=True)
    output_path = os.path.join(GENERATED_DIR, f'{args.card_id}-{args.mode}.md')
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write(prompt)
    print(f"Prompt written to {output_path}", file=sys.stderr)


if __name__ == '__main__':
    main()
