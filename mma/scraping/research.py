"""
Research — scrapes fighter profiles from Tapology and prints structured data.

For each fighter on the card, fetches record, current streak, and last 5 fights
from their Tapology profile page. Prints the result as JSON to stdout.

Public API:
    run(args)  — args.url
"""
import json
from types import SimpleNamespace

from scraping import tapology
from scraping.scraper import Scraper


def _bout_key(f1, f2):
    camel = lambda n: ''.join(w.capitalize() for w in n.split())
    return f'{camel(f1)}Vs{camel(f2)}'


def run(args: SimpleNamespace, scraper: Scraper):
    """Scrape fighter profiles and generate structured research notes for a UFC event."""
    event_name, bouts = tapology.scrape_event_research(scraper, args.url)
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
    profiles = {name: tapology.scrape_fighter(scraper, name, url) for name, url in fighters_to_fetch}

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

    print(json.dumps(output, indent=2, ensure_ascii=False))
