"""
Research — scrapes fighter profiles and writes structured event notes to a JSON file.

For each fighter on the card, fetches record, current streak, and last 5 fights
from their profile page. Saves the result to ./mma/notes/<card-id>.json and
prints the file path.

Public API:
    run(args, event_scraper)  — args.url
"""
import json
import os
from types import SimpleNamespace

from scraping import utils
from scraping.event_scraper import EventScraper


def _bout_key(f1: str, f2: str) -> str:
    camel = lambda n: ''.join(w.capitalize() for w in n.split())
    return f'{camel(f1)}Vs{camel(f2)}'


def run(args: SimpleNamespace, event_scraper: EventScraper):
    """Scrape fighter profiles and save structured research notes for a UFC event."""
    event_name, bouts = event_scraper.scrape_event_research(args.url)
    if not bouts:
        raise RuntimeError('No bouts found on event page.')

    seen: set[str] = set()
    fighters_to_fetch: list[tuple[str, str]] = []
    for bout in bouts:
        for name, url in (
            (bout['fighter1_name'], bout['fighter1_url']),
            (bout['fighter2_name'], bout['fighter2_url']),
        ):
            if name not in seen:
                fighters_to_fetch.append((name, url))
                seen.add(name)

    print(f'\nScraping {len(fighters_to_fetch)} fighter profiles...')
    profiles = {
        name: event_scraper.scrape_fighter(name, url)
        for name, url in fighters_to_fetch
    }

    card_id = utils.generate_card_id(event_name)

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

    notes_dir = './mma/notes'
    os.makedirs(notes_dir, exist_ok=True)
    notes_path = f'{notes_dir}/{card_id}.json'
    with open(notes_path, 'w', encoding='utf-8') as f:
        json.dump(output, f, indent=2, ensure_ascii=False)

    print(f'\nNotes saved to {notes_path}')
