#!/usr/bin/env python3
"""
Entry point for MMA data scraping.

Usage:
    python3 -m scraping.bin.scraping_main --preview <sherdog_url>
    python3 -m scraping.bin.scraping_main --recap <sherdog_url> --rating <rating>
    python3 -m scraping.bin.scraping_main --research <sherdog_url>
    python3 -m scraping.bin.scraping_main --fightodds <event_pk_or_url> --card-id <card_id>

    Add --driver to any command to use Selenium (Firefox) instead of requests.

Examples:
    python3 -m scraping.bin.scraping_main --preview https://www.sherdog.com/events/UFC-Fight-Night-279-Kape-vs-Horiguchi-2-112139
    python3 -m scraping.bin.scraping_main --recap https://www.sherdog.com/events/UFC-326-Holloway-vs-Oliveira-2-110782 --rating 7.5
    python3 -m scraping.bin.scraping_main --research https://www.sherdog.com/events/UFC-Fight-Night-279-Kape-vs-Horiguchi-2-112139
    python3 -m scraping.bin.scraping_main --fightodds https://fightodds.io/mma-events/8823/ufc-326/odds --card-id ufc-326
"""

import argparse
from types import SimpleNamespace

from scraping import fightodds
from scraping import preview
from scraping import recap
from scraping import research
from scraping.scraper import Scraper
from scraping.sherdog import SherdogEventScraper


def main():
    parser = argparse.ArgumentParser(
        description='MMA data scraping tools',
        formatter_class=argparse.RawDescriptionHelpFormatter,
    )

    mode = parser.add_mutually_exclusive_group(required=True)
    mode.add_argument('--preview', metavar='URL', help='Generate preview template from Sherdog event URL')
    mode.add_argument('--recap', metavar='URL', help='Generate recap template from Sherdog event URL')
    mode.add_argument('--research', metavar='URL', help='Scrape fighter profiles and save research notes to ./mma/notes/')
    mode.add_argument('--fightodds', metavar='EVENT', help='Scrape odds from fightodds.io (event PK or URL)')

    parser.add_argument('--rating', type=float, help='Event rating 0.0–10.0 (required for --recap)')
    parser.add_argument('--card-id', dest='card_id', help='Card ID in cards.json (required for --fightodds)')
    parser.add_argument('--driver', action='store_true', help='Use Selenium (Firefox) instead of requests')

    args = parser.parse_args()

    http_client = Scraper(use_driver=args.driver)
    event_scraper = SherdogEventScraper(http_client)

    try:
        if args.preview:
            preview.run(SimpleNamespace(url=args.preview), event_scraper)

        elif args.recap:
            if args.rating is None:
                parser.error('--rating is required when using --recap')
            recap.run(SimpleNamespace(url=args.recap, rating=args.rating), event_scraper)

        elif args.research:
            research.run(SimpleNamespace(url=args.research), event_scraper)

        elif args.fightodds:
            if not args.card_id:
                parser.error('--card-id is required when using --fightodds')
            fightodds.run(SimpleNamespace(event=args.fightodds, card_id=args.card_id))

    finally:
        http_client.close()


if __name__ == '__main__':
    main()
