"""
Tapology scraping — fetches event and fighter data from Tapology.

Public API:
    scrape_tapology_event(url, mode)  — event page scrape for preview/recap
    scrape_event_research(url)        — event page scrape with fighter profile URLs
    scrape_fighter(name, url)         — individual fighter profile scrape
    generate_card_id(event_name)      — derive a card ID slug from the event name
    parse_event_date(date_string)     — parse Tapology event date to YYYY-MM-DD
    extract_title(event_name)         — split event name into (title, subtitle)
    extract_subtitle(event_name)      — extract subtitle portion of event name
"""
import bs4
import cloudscraper
import datetime
import re
import sys
import time

from scraping import constants

_scraper = cloudscraper.create_scraper()


def _fetch(url):
    resp = _scraper.get(url, headers=constants.HEADERS, timeout=15)
    resp.raise_for_status()
    return bs4.BeautifulSoup(resp.content, 'html.parser')


def parse_event_date(date_string):
    """Parse Tapology event date string to YYYY-MM-DD. E.g. 'Sat. 10.04.2025' -> '2025-10-04'."""
    try:
        date_part = date_string.split()[-1]
        date_obj = datetime.datetime.strptime(date_part, "%m.%d.%Y")
        return date_obj.strftime("%Y-%m-%d")
    except Exception:
        return datetime.datetime.now().strftime("%Y-%m-%d")


def _parse_fight_date(date_div):
    """Parse date from a fighter profile fight history row. E.g. '2025 Jul 19' -> 'July 19, 2025'."""
    raw = date_div.get_text(separator=' ', strip=True)
    m = re.match(r'(\d{4})\s+(\w{3})\s+(\d{1,2})', raw)
    if m:
        try:
            dt = datetime.datetime.strptime(f'{m.group(2)} {m.group(3)} {m.group(1)}', '%b %d %Y')
            return dt.strftime('%B %d, %Y')
        except ValueError:
            pass
    return raw


def generate_card_id(event_name):
    """
    Generate card ID from event name:
    - UFC 320 -> ufc-320
    - UFC Fight Night: Royval vs Kape -> ufc-fight-night-royval-kape
    """
    event_name_lower = event_name.lower()

    ufc_number_match = re.search(r'ufc (\d+)', event_name_lower)
    if ufc_number_match:
        return f"ufc-{ufc_number_match.group(1)}"

    if 'fight night' in event_name_lower:
        if ':' in event_name:
            fighters_part = event_name.split(':')[1].strip()
            fighters = re.split(r'\s+vs\.?\s+', fighters_part, flags=re.IGNORECASE)
            if len(fighters) >= 2:
                fighter1_last = fighters[0].strip().split()[-1].lower()
                fighter2_last = fighters[1].strip().split()[-1].lower()
                return f"ufc-fight-night-{fighter1_last}-{fighter2_last}"
        return "ufc-fight-night-" + re.sub(r'[^a-z0-9]+', '-', event_name_lower.replace('ufc fight night', '').strip()).strip('-')

    if ':' in event_name and 'ufc' in event_name_lower:
        fighters_part = event_name.split(':')[1].strip()
        fighters = re.split(r'\s+vs\.?\s+', fighters_part, flags=re.IGNORECASE)
        if len(fighters) >= 2:
            fighter1_last = fighters[0].strip().split()[-1].lower()
            fighter2_last = fighters[1].strip().split()[-1].lower()
            location = event_name.split(':')[0].replace('UFC', '').strip().lower()
            location_slug = re.sub(r'[^a-z0-9]+', '-', location).strip('-')
            return f"ufc-{location_slug}-{fighter1_last}-{fighter2_last}"

    return re.sub(r'[^a-z0-9]+', '-', event_name_lower).strip('-')


def extract_subtitle(event_name):
    ufc_number_match = re.search(r'ufc (\d+)\s+(.*)', event_name, re.IGNORECASE)
    if ufc_number_match:
        subtitle = ufc_number_match.group(2).strip()
        return subtitle if subtitle else None
    if ':' in event_name:
        return event_name.split(':', 1)[1].strip()
    return None


def extract_title(event_name):
    title, subtitle = event_name, None
    if 'fight night' not in event_name.lower():
        title_match = re.match(r'(UFC \d+|UFC [^:]+)', event_name, re.IGNORECASE)
        if title_match:
            title = title_match.group(1).strip()
            subtitle = extract_subtitle(event_name)
        else:
            title = event_name
    return title, subtitle


def scrape_tapology_event(url, mode='both'):
    """Scrape fight data from a Tapology event page."""
    response = _scraper.get(url, headers=constants.HEADERS)
    soup = bs4.BeautifulSoup(response.content, 'html.parser')

    title_tag = soup.find('title')
    event_name = title_tag.text.split('|')[0].strip() if title_tag else 'UFC Event'

    primary_details_container = soup.find_all(id='primaryDetailsContainer')
    date = primary_details_container[0].find_all('li')[0].find_all('span', class_='text-neutral-700')[0].get_text().strip()
    location = primary_details_container[0].find_all('li')[6].find_all('span', class_='text-neutral-700')[0].get_text().strip()

    fights = []
    fight_card_section = soup.find(id='sectionFightCard')

    if fight_card_section:
        for bout in fight_card_section.find_all(id=re.compile('boutFullsize')):
            fighter_links = bout.find_all('a', class_='link-primary-red', href=re.compile(r'/fightcenter/fighters/'))

            if len(fighter_links) >= 2:
                fighter1 = fighter_links[0].get_text().strip()
                fighter2 = fighter_links[2].get_text().strip()

                bout_info = bout.find_all('span', class_=re.compile('text-xs11'))

                method_of_victory, time_of_victory = None, None
                if mode != 'preview':
                    method_of_victory = bout.find_all('span', class_=re.compile('uppercase text-sm'))[0].get_text().strip()
                    time_of_victory = bout_info[-2].get_text().strip()

                bout_text = bout.get_text()
                if re.search(r'early\s*prelim', bout_text, re.IGNORECASE):
                    card_placement = 'Early Prelims'
                elif re.search(r'main\s*card', bout_text, re.IGNORECASE):
                    card_placement = 'Main Card'
                elif re.search(r'prelim', bout_text, re.IGNORECASE):
                    card_placement = 'Prelims'
                else:
                    card_placement = 'Main Card'

                fights.append({
                    'card_placement': card_placement,
                    'fighter1': fighter1,
                    'fighter2': fighter2,
                    'method_of_victory': method_of_victory,
                    'time_of_victory': time_of_victory,
                })

    return {'event_name': event_name, 'date': date, 'location': location, 'fights': fights}


def _parse_weight_class(bout_soup):
    wc_span = bout_soup.find(
        'span',
        class_=lambda c: c and 'bg-tap_darkgold' in c and 'text-neutral-50' in c,
    )
    if wc_span:
        try:
            lbs = int(wc_span.get_text(strip=True))
            name = constants.WEIGHT_CLASS.get(lbs, f'{lbs} lbs')
            if 'Women' in bout_soup.get_text():
                name = f"Women's {name}"
            return f'{name} ({lbs} lbs)'
        except ValueError:
            pass
    return 'Unknown'


def _parse_standard_detail(soup, label_text):
    std = soup.find(id='standardDetails')
    if std:
        label = std.find('strong', string=re.compile(label_text, re.I))
        if label:
            span = label.find_next_sibling('span')
            if span:
                return span.get_text(strip=True)
    return None


def _parse_record(soup):
    raw = _parse_standard_detail(soup, r'Pro MMA Record')
    return raw.split()[0].rstrip(',') if raw else None


def _parse_streak(soup):
    return _parse_standard_detail(soup, r'Current MMA Streak')


def _parse_fight_history(soup, limit=5):
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

        result = constants.STATUS_MAP.get(row.get('data-status', ''))
        if result is None:
            continue

        opp_link = row.find('a', href=re.compile(r'/fightcenter/fighters/'))
        opponent = opp_link.get_text(strip=True) if opp_link else None

        bout_link = row.find('a', href=re.compile(r'/fightcenter/bouts/'))
        method = bout_link.get_text(strip=True) if bout_link else None

        date_div = row.find('div', class_=lambda c: c and 'basis-[14%]' in c)
        date = _parse_fight_date(date_div) if date_div else None

        fights.append({'result': result, 'opponent': opponent, 'method': method, 'date': date})

    return fights


def scrape_event_research(url):
    """Scrape a Tapology event page for research, returning fighter profile URLs alongside bout data."""
    print(f'Fetching event page: {url}', file=sys.stderr)
    soup = _fetch(url)

    title_tag = soup.find('title')
    event_name = title_tag.text.split('|')[0].strip() if title_tag else 'UFC Event'
    print(f'Event: {event_name}', file=sys.stderr)

    card_section = soup.find(id='sectionFightCard')
    if not card_section:
        raise RuntimeError('#sectionFightCard not found on event page.')

    bouts = []
    for bout in card_section.find_all(id=re.compile(r'boutFullsize')):
        links = bout.find_all('a', class_='link-primary-red', href=re.compile(r'/fightcenter/fighters/'))
        if len(links) < 2:
            continue

        f1_name = links[0].get_text(strip=True)
        f1_url = constants.TAPOLOGY_BASE + links[0]['href']
        f2_link = links[2] if len(links) > 2 else links[1]
        f2_name = f2_link.get_text(strip=True)
        f2_url = constants.TAPOLOGY_BASE + f2_link['href']

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
            'fighter1_url': f1_url,
            'fighter2_name': f2_name,
            'fighter2_url': f2_url,
            'weight_class': _parse_weight_class(bout),
            'card_placement': placement,
        })

    print(f'Found {len(bouts)} bouts.', file=sys.stderr)
    return event_name, bouts


def scrape_fighter(name, url):
    """Scrape a fighter's Tapology profile page and return a profile dict."""
    print(f'  {name} ...', file=sys.stderr, end=' ', flush=True)
    try:
        soup = _fetch(url)
        record = _parse_record(soup)
        streak = _parse_streak(soup)
        recent_fights = _parse_fight_history(soup)
        print(f'record={record}, streak={streak}, fights={len(recent_fights)}', file=sys.stderr)
        return {'name': name, 'tapology_url': url, 'record': record, 'streak': streak, 'recent_fights': recent_fights}
    except Exception as exc:
        print(f'ERROR: {exc}', file=sys.stderr)
        return {'name': name, 'tapology_url': url, 'record': None, 'streak': None, 'recent_fights': []}
    finally:
        time.sleep(constants.REQUEST_DELAY)
