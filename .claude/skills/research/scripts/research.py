#!/usr/bin/env python3
"""
research.py — Scrape Tapology to collect raw fighter data for a UFC event.

Pulls from live Tapology pages:
  - Card matchups and placement (Main Card / Prelims / Early Prelims)
  - Fighter Tapology profile URLs (extracted directly from the event page)
  - Fighter records (W-L-D)
  - Last 5 completed fights (opponent, result, method, date)

Outputs JSON to stdout. Pass --save to also write ./mma/notes/<card-id>.json.

Usage:
    python mma/research.py <tapology_event_url> [--save]

Example:
    python mma/research.py https://www.tapology.com/fightcenter/events/136871-ufc-326-holloway-vs-oliveira-2 --save
"""

import json
import os
import re
import sys
import time
from datetime import datetime

import requests
from bs4 import BeautifulSoup

PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..', '..'))
sys.path.insert(0, os.path.join(PROJECT_ROOT, 'mma'))
from tapology import generate_card_id

TAPOLOGY_BASE = 'https://www.tapology.com'
HEADERS = {
    'User-Agent': (
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) '
        'AppleWebKit/537.36 (KHTML, like Gecko) '
        'Chrome/120.0.0.0 Safari/537.36'
    )
}
REQUEST_DELAY = 1.2  # seconds between profile fetches

# Maps weight limit (lbs) → division name
WEIGHT_CLASS = {
    115: 'Strawweight',
    125: 'Flyweight',
    135: 'Bantamweight',
    145: 'Featherweight',
    155: 'Lightweight',
    170: 'Welterweight',
    185: 'Middleweight',
    205: 'Light Heavyweight',
    265: 'Heavyweight',
}

STATUS_MAP = {
    'win':        'Win',
    'loss':       'Loss',
    'draw':       'Draw',
    'nc':         'NC',
    'no_contest': 'NC',
}


# ---------------------------------------------------------------------------
# HTTP
# ---------------------------------------------------------------------------

def fetch(url):
    resp = requests.get(url, headers=HEADERS, timeout=15)
    resp.raise_for_status()
    return BeautifulSoup(resp.content, 'html.parser')


# ---------------------------------------------------------------------------
# Event page
# ---------------------------------------------------------------------------

def parse_weight_class(bout_soup):
    """
    Extract weight class from a bout element using the weight indicator span.

    Tapology renders a <span class="bg-tap_darkgold ... text-neutral-50 rounded">
    containing just the weight limit (e.g. "155") flanked by scale SVGs.
    """
    wc_span = bout_soup.find(
        'span',
        class_=lambda c: c and 'bg-tap_darkgold' in c and 'text-neutral-50' in c,
    )
    if wc_span:
        try:
            lbs = int(wc_span.get_text(strip=True))
            name = WEIGHT_CLASS.get(lbs, f'{lbs} lbs')
            if 'Women' in bout_soup.get_text():
                name = f"Women's {name}"
            return f'{name} ({lbs} lbs)'
        except ValueError:
            pass
    return 'Unknown'


def scrape_event(url):
    """
    Fetch the Tapology event page.

    Returns (event_name, bouts) where each bout dict has:
        fighter1_name, fighter1_url, fighter2_name, fighter2_url,
        weight_class, card_placement
    """
    print(f'Fetching event page: {url}', file=sys.stderr)
    soup = fetch(url)

    title_tag = soup.find('title')
    event_name = title_tag.text.split('|')[0].strip() if title_tag else 'UFC Event'
    print(f'Event: {event_name}', file=sys.stderr)

    card_section = soup.find(id='sectionFightCard')
    if not card_section:
        sys.exit('ERROR: #sectionFightCard not found on event page.')

    bouts = []
    for bout in card_section.find_all(id=re.compile(r'boutFullsize')):
        links = bout.find_all(
            'a',
            class_='link-primary-red',
            href=re.compile(r'/fightcenter/fighters/'),
        )
        if len(links) < 2:
            continue

        f1_name = links[0].get_text(strip=True)
        f1_url  = TAPOLOGY_BASE + links[0]['href']
        # Index 2 matches existing tapology.py logic: link at index 1 is the
        # fighter-1 record link, not the second fighter.
        f2_link = links[2] if len(links) > 2 else links[1]
        f2_name = f2_link.get_text(strip=True)
        f2_url  = TAPOLOGY_BASE + f2_link['href']

        bout_text = bout.get_text()
        if 'Early Prelim' in bout_text:
            placement = 'Early Prelims'
        elif 'Main Card' in bout_text:
            placement = 'Main Card'
        elif 'Prelim' in bout_text:
            placement = 'Prelims'
        else:
            placement = 'Main Card'

        bouts.append({
            'fighter1_name': f1_name,
            'fighter1_url':  f1_url,
            'fighter2_name': f2_name,
            'fighter2_url':  f2_url,
            'weight_class':  parse_weight_class(bout),
            'card_placement': placement,
        })

    print(f'Found {len(bouts)} bouts.', file=sys.stderr)
    return event_name, bouts


# ---------------------------------------------------------------------------
# Fighter profile
# ---------------------------------------------------------------------------

def parse_standard_detail(soup, label_text):
    """
    Extract the <span> value paired with a <strong> label in #standardDetails.

    E.g. label_text='Pro MMA Record' → '27-8-0 (Win-Loss-Draw)'
    """
    std = soup.find(id='standardDetails')
    if std:
        label = std.find('strong', string=re.compile(label_text, re.I))
        if label:
            span = label.find_next_sibling('span')
            if span:
                return span.get_text(strip=True)
    return None


def parse_record(soup):
    """Extract W-L-D record string. Returns e.g. '27-8-0'."""
    raw = parse_standard_detail(soup, r'Pro MMA Record')
    # "27-8-0 (Win-Loss-Draw)" → "27-8-0"
    return raw.split()[0].rstrip(',') if raw else None


def parse_streak(soup):
    """Extract current streak. Returns e.g. '1 Win' or '2 Loss'."""
    return parse_standard_detail(soup, r'Current MMA Streak')


def parse_date(date_div):
    """
    Parse date from the date-column div in a fight row.

    Tapology splits the year into a bold <span> and the month+day into another,
    which concatenates as e.g. "2025 Jul 19".
    """
    raw = date_div.get_text(separator=' ', strip=True)
    m = re.match(r'(\d{4})\s+(\w{3})\s+(\d{1,2})', raw)
    if m:
        try:
            dt = datetime.strptime(f'{m.group(2)} {m.group(3)} {m.group(1)}', '%b %d %Y')
            return dt.strftime('%B %d, %Y')
        except ValueError:
            pass
    return raw


def parse_fight_history(soup, limit=5):
    """
    Extract up to `limit` completed fights from #proResults.

    Fight rows are <div id="b{digits}"> elements with a data-status attribute.
    Only win/loss/draw/nc rows are included; upcoming and cancelled are skipped.

    Returns list of dicts: result, opponent, method, date
    """
    pro = soup.find(id='proResults')
    if not pro:
        return []

    fights = []
    for row in pro.find_all('div', recursive=False):
        if len(fights) >= limit:
            break

        row_id = row.get('id', '')
        if not (row_id.startswith('b') and row_id[1:].isdigit()):
            continue

        result = STATUS_MAP.get(row.get('data-status', ''))
        if result is None:
            continue  # skip upcoming, cancelled, etc.

        # Opponent — first fighter link inside the row
        opp_link = row.find('a', href=re.compile(r'/fightcenter/fighters/'))
        opponent = opp_link.get_text(strip=True) if opp_link else None

        # Method detail — bout page link text, e.g. "Decision · Unanimous"
        bout_link = row.find('a', href=re.compile(r'/fightcenter/bouts/'))
        method = bout_link.get_text(strip=True) if bout_link else None

        # Date — div with Tailwind class basis-[14%]
        date_div = row.find('div', class_=lambda c: c and 'basis-[14%]' in c)
        date = parse_date(date_div) if date_div else None

        fights.append({
            'result': result,
            'opponent': opponent,
            'method': method,
            'date': date,
        })

    return fights


def scrape_fighter(name, url):
    """Fetch a fighter's Tapology profile and return a profile dict."""
    print(f'  {name} ...', file=sys.stderr, end=' ', flush=True)
    try:
        soup = fetch(url)
        record = parse_record(soup)
        streak = parse_streak(soup)
        recent_fights = parse_fight_history(soup)
        print(f'record={record}, streak={streak}, fights={len(recent_fights)}', file=sys.stderr)
        return {
            'name': name,
            'tapology_url': url,
            'record': record,
            'streak': streak,
            'recent_fights': recent_fights,
        }
    except Exception as exc:
        print(f'ERROR: {exc}', file=sys.stderr)
        return {
            'name': name,
            'tapology_url': url,
            'record': None,
            'streak': None,
            'recent_fights': [],
        }
    finally:
        time.sleep(REQUEST_DELAY)


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main():
    if len(sys.argv) < 2:
        print(__doc__)
        sys.exit(1)

    event_url = sys.argv[1]
    save = '--save' in sys.argv

    # 1. Scrape event page
    event_name, bouts = scrape_event(event_url)
    if not bouts:
        sys.exit('ERROR: No bouts found on event page.')

    # 2. Scrape each unique fighter profile (preserve card order)
    seen = set()
    fighters_to_fetch = []
    for bout in bouts:
        for name, url in ((bout['fighter1_name'], bout['fighter1_url']),
                          (bout['fighter2_name'], bout['fighter2_url'])):
            if name not in seen:
                fighters_to_fetch.append((name, url))
                seen.add(name)

    print(f'\nScraping {len(fighters_to_fetch)} fighter profiles...', file=sys.stderr)
    profiles = {name: scrape_fighter(name, url) for name, url in fighters_to_fetch}

    # 3. Build output
    card_id = generate_card_id(event_name)

    def bout_key(f1, f2):
        """'Max Holloway' + 'Charles Oliveira' → 'MaxHollowayVsCharlesOliveira'"""
        camel = lambda name: ''.join(w.capitalize() for w in name.split())
        return f'{camel(f1)}Vs{camel(f2)}'

    output = {
        'event_name': event_name,
        'card_id': card_id,
        'bouts': {
            bout_key(bout['fighter1_name'], bout['fighter2_name']): {
                'card_placement': bout['card_placement'],
                'weight_class': bout['weight_class'],
                'fighter1': profiles[bout['fighter1_name']],
                'fighter2': profiles[bout['fighter2_name']],
            }
            for bout in bouts
        },
    }

    json_str = json.dumps(output, indent=2, ensure_ascii=False)

    if save:
        notes_dir = os.path.join(PROJECT_ROOT, 'mma', 'notes')
        os.makedirs(notes_dir, exist_ok=True)
        out_path = os.path.join(notes_dir, f'{card_id}.json')
        with open(out_path, 'w', encoding='utf-8') as f:
            f.write(json_str)
        print(f'Saved: {out_path}', file=sys.stderr)

    print(json_str)


if __name__ == '__main__':
    main()
