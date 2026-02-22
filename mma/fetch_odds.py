#!/usr/bin/env python3
"""
fetch_odds.py — Populate betting odds in ufc_cards.json

For each fight in a card, finds the best (highest payout) odds for the
predicted winner and writes them to ufc_cards.json under:
  fights[matchup].odds = {
    "winner": "...",
    "platform": "...",
    "american": -175,
    "profit_per_dollar": 0.571,
    "return_pct": 57.1
  }

Usage:
  # Scrape odds from a URL (requires requests + beautifulsoup4):
  python mma/fetch_odds.py ufc-325 --url https://...

  # Load odds from a JSON file:
  python mma/fetch_odds.py ufc-325 --odds-file ~/odds.json

  # Enter odds interactively:
  python mma/fetch_odds.py ufc-325 --interactive

Odds file JSON format:
  {
    "Fighter A vs. Fighter B": {
      "BetOnline":  {"Fighter A": -175, "Fighter B": 145},
      "DraftKings": {"Fighter A": -180, "Fighter B": 150}
    },
    ...
  }
  Fighter names must match (case-insensitive) those in ufc_cards.json.
  The script picks the platform with the best (highest) payout for the
  predicted winner.
"""

import argparse
import json
import os
import sys

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
CARDS_JSON = os.path.join(SCRIPT_DIR, 'js', 'ufc_cards.json')


# ---------------------------------------------------------------------------
# JSON helpers
# ---------------------------------------------------------------------------

def load_cards():
    with open(CARDS_JSON, encoding='utf-8') as f:
        return json.load(f)


def save_cards(data):
    with open(CARDS_JSON, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    print(f"Saved: {CARDS_JSON}")


# ---------------------------------------------------------------------------
# Odds math
# ---------------------------------------------------------------------------

def american_to_profit(american):
    """Return profit per $1 wagered for given American odds integer."""
    if american > 0:
        return round(american / 100, 4)
    else:
        return round(100 / abs(american), 4)


def best_odds_for_winner(fight_odds, predicted_winner):
    """
    fight_odds: {platform: {fighter_name: american_odds_int}, ...}
    predicted_winner: str

    Returns (platform, american_odds) with the best payout for the
    predicted winner, or None if not found.
    """
    winner_lower = predicted_winner.lower()
    best_platform = None
    best_american = None

    for platform, lines in fight_odds.items():
        for fighter, odds in lines.items():
            if fighter.lower() == winner_lower:
                # Higher American odds = better payout
                # e.g. -110 > -200 (less juice); +200 > +150 (more return)
                if best_american is None or odds > best_american:
                    best_american = int(odds)
                    best_platform = platform

    if best_platform is None:
        return None
    return best_platform, best_american


# ---------------------------------------------------------------------------
# Fight matching
# ---------------------------------------------------------------------------

def find_fight_key(card_fights, matchup_key):
    """
    Fuzzy-match matchup_key against keys in card_fights.
    Returns the exact card_fights key, or None.
    """
    # Exact
    if matchup_key in card_fights:
        return matchup_key

    # Case-insensitive exact
    matchup_lower = matchup_key.lower()
    for key in card_fights:
        if key.lower() == matchup_lower:
            return key

    # Normalise "vs" / "vs." and retry
    def norm(s):
        return s.lower().replace(' vs. ', ' vs ').replace(' vs. ', ' vs ')

    norm_matchup = norm(matchup_key)
    for key in card_fights:
        if norm(key) == norm_matchup:
            return key

    # Both fighter names appear in key
    parts = norm(matchup_key).split(' vs ')
    if len(parts) == 2:
        f1, f2 = parts[0].strip(), parts[1].strip()
        for key in card_fights:
            key_lower = key.lower()
            if f1 in key_lower and f2 in key_lower:
                return key

    return None


# ---------------------------------------------------------------------------
# Core processing
# ---------------------------------------------------------------------------

def process_odds(card, raw_odds):
    """
    raw_odds: {matchup_str: {platform: {fighter: american_int}}}

    Updates card['fights'][matchup]['odds'] for each matched fight.
    Returns count of updated fights.
    """
    if 'fights' not in card or not card['fights']:
        print(f"  Card '{card['id']}' has no fights.")
        return 0

    updated = 0
    for matchup_key, fight_odds in raw_odds.items():
        card_key = find_fight_key(card['fights'], matchup_key)
        if card_key is None:
            print(f"  WARNING: '{matchup_key}' not found in card fights — skipping")
            continue

        fight_entry = card['fights'][card_key]
        predicted_winner = (fight_entry.get('prediction') or {}).get('winner', '').strip()
        if not predicted_winner:
            print(f"  SKIP: {card_key} — no predicted winner set")
            continue

        result = best_odds_for_winner(fight_odds, predicted_winner)
        if result is None:
            print(f"  SKIP: {card_key} — '{predicted_winner}' not found in odds data")
            continue

        platform, american = result
        profit = american_to_profit(american)
        return_pct = round(profit * 100, 1)

        fight_entry['odds'] = {
            'winner': predicted_winner,
            'platform': platform,
            'american': american,
            'profit_per_dollar': profit,
            'return_pct': return_pct,
        }

        sign = '+' if american > 0 else ''
        print(f"  {card_key}")
        print(f"    Pick: {predicted_winner}  |  {sign}{american} on {platform}  |  ${profit:.2f}/$ ({return_pct}%)")
        updated += 1

    return updated


# ---------------------------------------------------------------------------
# Odds sources
# ---------------------------------------------------------------------------

def scrape_url(url):
    """
    Attempt to scrape odds from a URL using requests + BeautifulSoup.
    Returns raw_odds dict or None on failure.
    """
    try:
        import requests
        from bs4 import BeautifulSoup
    except ImportError:
        print("ERROR: 'requests' and 'beautifulsoup4' are required for URL scraping.")
        print("  Install with: pip install requests beautifulsoup4")
        return None

    headers = {
        'User-Agent': (
            'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 '
            '(KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
        ),
        'Accept': 'text/html,application/xhtml+xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate, br',
        'DNT': '1',
        'Connection': 'keep-alive',
    }

    print(f"Fetching: {url}")
    try:
        response = requests.get(url, headers=headers, timeout=15)
    except requests.exceptions.RequestException as e:
        print(f"  ERROR: {e}")
        return None

    if response.status_code != 200:
        print(f"  HTTP {response.status_code} — site may require JavaScript or block bots.")
        print("  Try --odds-file with manually formatted JSON, or --interactive.")
        return None

    soup = BeautifulSoup(response.text, 'html.parser')

    if 'fightodds.io' in url:
        return _parse_fightodds(soup)

    print(f"  No parser implemented for this URL.")
    print("  Use --odds-file or --interactive instead.")
    return None


def _parse_fightodds(soup):
    """
    Parse fightodds.io HTML. fightodds.io is a JS-rendered SPA so a basic
    requests scrape likely returns empty tables. This is a best-effort parser.

    Returns raw_odds dict (may be empty if JS rendering required).
    """
    raw_odds = {}
    print("  Parsing fightodds.io ...")

    tables = soup.find_all('table')
    if not tables:
        print("  No tables found — page likely requires JavaScript rendering.")
        print("  Use --odds-file or --interactive instead.")
        return raw_odds

    # fightodds.io table structure (when available):
    # thead row: fighter names across columns
    # tbody rows: one per sportsbook with cells containing odds
    for table in tables:
        rows = table.find_all('tr')
        if not rows:
            continue
        headers = [th.get_text(strip=True) for th in rows[0].find_all(['th', 'td'])]
        if len(headers) < 3:
            continue
        # headers[0] = book name column; headers[1:] = fighter/matchup names
        # Each subsequent row: book name + odds per fighter
        fight_name = headers[1] if len(headers) > 1 else 'Unknown'
        book_data = {}
        for row in rows[1:]:
            cells = row.find_all(['th', 'td'])
            if not cells:
                continue
            book = cells[0].get_text(strip=True)
            if not book:
                continue
            odds_by_fighter = {}
            for i, cell in enumerate(cells[1:], start=1):
                if i < len(headers):
                    odds_text = cell.get_text(strip=True).replace(' ', '')
                    try:
                        odds_by_fighter[headers[i]] = int(odds_text.replace('+', ''))
                    except ValueError:
                        pass
            if odds_by_fighter:
                book_data[book] = odds_by_fighter
        if book_data:
            raw_odds[fight_name] = book_data

    return raw_odds


def load_odds_file(path):
    """Load odds from a JSON file. Returns raw_odds dict."""
    if not os.path.exists(path):
        print(f"ERROR: Odds file not found: {path}")
        sys.exit(1)
    with open(path, encoding='utf-8') as f:
        data = json.load(f)
    print(f"Loaded odds from: {path}  ({len(data)} fight(s))")
    return data


def interactive_entry(card):
    """
    Walk the user through entering odds per fight interactively.
    Returns raw_odds dict.
    """
    raw_odds = {}
    fights = card.get('fights') or {}
    if not fights:
        print("No fights found in card.")
        return raw_odds

    print(f"\nEntering odds for: {card['title']}")
    print("Enter the best American odds for the predicted winner of each fight.")
    print("Press Enter to skip a fight.\n")

    for matchup, entry in fights.items():
        predicted_winner = (entry.get('prediction') or {}).get('winner', '').strip()
        if not predicted_winner:
            continue

        print(f"  {matchup}")
        print(f"    Predicted winner: {predicted_winner}")

        platform = input("    Platform (e.g. BetOnline): ").strip()
        if not platform:
            print("    Skipped.\n")
            continue

        odds_str = input(f"    American odds for {predicted_winner} (e.g. -175 or +130): ").strip()
        if not odds_str:
            print("    Skipped.\n")
            continue

        try:
            american = int(odds_str.replace('+', ''))
        except ValueError:
            print(f"    Invalid: '{odds_str}' — skipped.\n")
            continue

        raw_odds[matchup] = {platform: {predicted_winner: american}}
        print()

    return raw_odds


# ---------------------------------------------------------------------------
# Entry point
# ---------------------------------------------------------------------------

def main():
    parser = argparse.ArgumentParser(
        description='Populate betting odds in ufc_cards.json',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Odds file JSON format:
  {
    "Fighter A vs. Fighter B": {
      "BetOnline":  {"Fighter A": -175, "Fighter B": 145},
      "DraftKings": {"Fighter A": -180, "Fighter B": 150}
    }
  }

Fighter names must match (case-insensitive) those in ufc_cards.json.
The best payout (highest American odds) for the predicted winner is kept.
""",
    )
    parser.add_argument('card_id', help='Card ID from ufc_cards.json (e.g. ufc-325)')

    source = parser.add_mutually_exclusive_group()
    source.add_argument('--url', help='Sportsbook URL to scrape')
    source.add_argument('--odds-file', metavar='FILE', help='JSON file with odds data')
    source.add_argument('--interactive', action='store_true', help='Enter odds interactively')

    args = parser.parse_args()

    # Load and validate card
    data = load_cards()
    card = next((c for c in data['cards'] if c['id'] == args.card_id), None)
    if card is None:
        valid_ids = [c['id'] for c in data['cards']]
        print(f"ERROR: '{args.card_id}' not found in ufc_cards.json.")
        print("Available IDs:")
        for cid in valid_ids:
            print(f"  {cid}")
        sys.exit(1)

    print(f"Card: {card['title']}\n")

    # Obtain raw odds
    raw_odds = {}
    if args.url:
        raw_odds = scrape_url(args.url) or {}
    elif args.odds_file:
        raw_odds = load_odds_file(args.odds_file)
    elif args.interactive:
        raw_odds = interactive_entry(card)
    else:
        parser.print_help()
        sys.exit(0)

    if not raw_odds:
        print("No odds data to process.")
        sys.exit(0)

    # Process and save
    print("\nProcessing odds...")
    updated = process_odds(card, raw_odds)

    if updated > 0:
        save_cards(data)
        print(f"\nDone. Updated {updated} fight(s).")
    else:
        print("\nNo fights updated.")


if __name__ == '__main__':
    main()
