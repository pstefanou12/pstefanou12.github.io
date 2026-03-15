"""
Research — scrapes fighter profiles from Tapology and saves structured notes.

For each fighter on the card, fetches record, current streak, and last 5 fights
from their Tapology profile page. Saves output as JSON to mma/notes/<card-id>.json
for use as input to the preview workflow.

Public API:
    run(args)  — args.url
"""
import json
import os

from scraping import tapology


def _bout_key(f1, f2):
    camel = lambda n: ''.join(w.capitalize() for w in n.split())
    return f'{camel(f1)}Vs{camel(f2)}'


def run(args):
    """Scrape fighter profiles and generate structured research notes for a UFC event."""
    event_name, bouts = tapology.scrape_event_research(args.url)
    if not bouts:
        raise RuntimeError('No bouts found on event page.')

    seen = set()
    fighters_to_fetch = []
    for bout in bouts:
        for name, url in ((bout['fighter1_name'], bout['fighter1_url']),
                          (bout['fighter2_name'], bout['fighter2_url'])):
            if name not in seen:
                fighters_to_fetch.append((name, url))
                seen.add(name)

    print(f'\nScraping {len(fighters_to_fetch)} fighter profiles...')
    profiles = {name: tapology.scrape_fighter(name, url) for name, url in fighters_to_fetch}

    card_id = tapology.generate_card_id(event_name)

    output = {
        'event_name': event_name,
        'card_id': card_id,
        'bouts': {
            _bout_key(bout['fighter1_name'], bout['fighter2_name']): {
                'card_placement': bout['card_placement'],
                'weight_class': bout['weight_class'],
                'fighter1': profiles[bout['fighter1_name']],
                'fighter2': profiles[bout['fighter2_name']],
            }
            for bout in bouts
        },
    }

    json_str = json.dumps(output, indent=2, ensure_ascii=False)

    notes_dir = './notes'
    os.makedirs(notes_dir, exist_ok=True)
    out_path = os.path.join(notes_dir, f'{card_id}.json')
    with open(out_path, 'w', encoding='utf-8') as f:
        f.write(json_str)
    print(f'\n✓ Saved: {out_path}')
