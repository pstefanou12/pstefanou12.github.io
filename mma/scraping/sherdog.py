"""
SherdogEventScraper — scrapes UFC event and fighter data from Sherdog.

Public API:
    SherdogEventScraper(scraper)  — construct with a Scraper instance

Card-placement is inferred from match number since Sherdog does not label
Main Card / Prelims / Early Prelims explicitly:
    match >= MAIN_CARD_THRESHOLD  → Main Card
    match >= EARLY_PRELIM_THRESHOLD → Prelims
    otherwise                     → Early Prelims
"""
import bs4
import datetime
import re
import sys
import time

from scraping import constants
from scraping.event_scraper import EventScraper
from scraping.scraper import Scraper

SHERDOG_BASE = 'https://www.sherdog.com'

MAIN_CARD_THRESHOLD = 8   # matches >= this are Main Card (typical Fight Night: 5 main card)
EARLY_PRELIM_THRESHOLD = 3  # matches < this are Early Prelims

_STATUS_MAP = {
    'win':  'Win',
    'loss': 'Loss',
    'draw': 'Draw',
    'nc':   'NC',
}


def _name_from_slug(href: str) -> str:
    """'/fighter/Ion-Cutelaba-101427' → 'Ion Cutelaba'"""
    slug = href.rstrip('/').split('/')[-1]
    slug = re.sub(r'-\d+$', '', slug)
    return slug.replace('-', ' ')


def _parse_date_display(raw: str) -> str:
    """'Dec / 13 / 2025' → 'December 13, 2025'"""
    try:
        dt = datetime.datetime.strptime(raw.replace(' ', ''), '%b/%d/%Y')
        return dt.strftime('%B %d, %Y')
    except ValueError:
        return raw


def _card_placement(match_num: int) -> str:
    if match_num >= MAIN_CARD_THRESHOLD:
        return 'Main Card'
    if match_num < EARLY_PRELIM_THRESHOLD:
        return 'Early Prelims'
    return 'Prelims'


class SherdogEventScraper(EventScraper):
    def __init__(self, scraper: Scraper):
        self._scraper = scraper

    # ------------------------------------------------------------------
    # scrape_event — used by preview.py and recap.py
    # ------------------------------------------------------------------

    def scrape_event(self, url: str, mode: str = 'both') -> dict:
        soup = self._scraper.fetch(url)

        event_name = self._parse_event_name(soup)
        date = self._parse_date(soup)
        location = self._parse_location(soup)

        fights = []

        main_sub = soup.find(itemprop='subEvent')
        if main_sub:
            fight = self._parse_main_event_fight(main_sub, mode)
            if fight:
                fights.append(fight)

        table = soup.find('table', class_='new_table')
        if table:
            for row in table.find_all('tr')[1:]:
                fight = self._parse_table_fight(row, mode)
                if fight:
                    fights.append(fight)

        return {'event_name': event_name, 'date': date, 'location': location, 'fights': fights}

    def _parse_main_event_fight(self, sub: bs4.Tag, mode: str) -> dict | None:
        left = sub.find('div', class_='left_side')
        right = sub.find('div', class_='right_side')
        if not left or not right:
            return None

        f1_h3 = left.find('h3')
        f2_h3 = right.find('h3')
        if not f1_h3 or not f2_h3:
            return None

        method, time_val = None, None
        if mode != 'preview':
            resume = sub.find('table', class_='fight_card_resume')
            if resume:
                method, round_num, time_str = None, None, None
                for td in resume.find_all('td'):
                    em = td.find('em')
                    if not em:
                        continue
                    label = em.get_text(strip=True)
                    value = td.get_text(strip=True)[len(label):].strip()
                    if label == 'Method':
                        method = value
                    elif label == 'Round':
                        round_num = value
                    elif label == 'Time':
                        time_str = value
                if method and round_num and time_str:
                    time_val = f'R{round_num} {time_str}'
                elif method and time_str:
                    time_val = time_str

        return {
            'card_placement': 'Main Card',
            'fighter1': f1_h3.get_text(strip=True),
            'fighter2': f2_h3.get_text(strip=True),
            'method_of_victory': method,
            'time_of_victory': time_val,
        }

    def _parse_table_fight(self, row: bs4.Tag, mode: str) -> dict | None:
        cols = row.find_all('td')
        if len(cols) < 4:
            return None

        try:
            match_num = int(cols[0].get_text(strip=True))
        except ValueError:
            return None

        f1_link = cols[1].find('a', href=re.compile(r'/fighter/'))
        f2_link = cols[3].find('a', href=re.compile(r'/fighter/'))
        if not f1_link or not f2_link:
            return None

        f1_name = _name_from_slug(f1_link['href'])
        f2_name = _name_from_slug(f2_link['href'])

        method, time_val = None, None
        if mode != 'preview' and len(cols) >= 7:
            method_b = cols[4].find('b')
            if method_b:
                method = method_b.get_text(strip=True)
            round_num = cols[5].get_text(strip=True)
            time_str = cols[6].get_text(strip=True)
            if method and time_str:
                time_val = f'R{round_num} {time_str}' if round_num else time_str

        return {
            'card_placement': _card_placement(match_num),
            'fighter1': f1_name,
            'fighter2': f2_name,
            'method_of_victory': method,
            'time_of_victory': time_val,
        }

    # ------------------------------------------------------------------
    # scrape_event_research — used by research.py
    # ------------------------------------------------------------------

    def scrape_event_research(self, url: str) -> tuple[str, list[dict]]:
        print(f'Fetching event page: {url}', file=sys.stderr)
        soup = self._scraper.fetch(url)

        event_name = self._parse_event_name(soup)
        print(f'Event: {event_name}', file=sys.stderr)

        bouts = []

        main_sub = soup.find(itemprop='subEvent')
        if main_sub:
            bout = self._parse_main_event_research(main_sub)
            if bout:
                bouts.append(bout)

        table = soup.find('table', class_='new_table')
        if table:
            for row in table.find_all('tr')[1:]:
                bout = self._parse_table_row_research(row)
                if bout:
                    bouts.append(bout)

        if not bouts:
            raise RuntimeError('No bouts found on event page.')

        print(f'Found {len(bouts)} bouts.', file=sys.stderr)
        return event_name, bouts

    def _parse_main_event_research(self, sub: bs4.Tag) -> dict | None:
        left = sub.find('div', class_='left_side')
        right = sub.find('div', class_='right_side')
        if not left or not right:
            return None

        f1_link = left.find('a', href=re.compile(r'/fighter/'))
        f2_link = right.find('a', href=re.compile(r'/fighter/'))
        if not f1_link or not f2_link:
            return None

        f1_h3 = left.find('h3')
        f2_h3 = right.find('h3')
        f1_name = f1_h3.get_text(strip=True) if f1_h3 else _name_from_slug(f1_link['href'])
        f2_name = f2_h3.get_text(strip=True) if f2_h3 else _name_from_slug(f2_link['href'])

        weight_el = sub.find('span', class_='weight_class')
        weight_class = weight_el.get_text(strip=True) if weight_el else 'Unknown'

        return {
            'fighter1_name': f1_name,
            'fighter1_url': SHERDOG_BASE + f1_link['href'],
            'fighter2_name': f2_name,
            'fighter2_url': SHERDOG_BASE + f2_link['href'],
            'weight_class': weight_class,
            'card_placement': 'Main Card',
        }

    def _parse_table_row_research(self, row: bs4.Tag) -> dict | None:
        cols = row.find_all('td')
        if len(cols) < 4:
            return None

        try:
            match_num = int(cols[0].get_text(strip=True))
        except ValueError:
            return None

        f1_link = cols[1].find('a', href=re.compile(r'/fighter/'))
        f2_link = cols[3].find('a', href=re.compile(r'/fighter/'))
        if not f1_link or not f2_link:
            return None

        weight_el = cols[2].find('span', class_='weight_class')
        weight_class = weight_el.get_text(strip=True) if weight_el else cols[2].get_text(strip=True)

        return {
            'fighter1_name': _name_from_slug(f1_link['href']),
            'fighter1_url': SHERDOG_BASE + f1_link['href'],
            'fighter2_name': _name_from_slug(f2_link['href']),
            'fighter2_url': SHERDOG_BASE + f2_link['href'],
            'weight_class': weight_class,
            'card_placement': _card_placement(match_num),
        }

    # ------------------------------------------------------------------
    # scrape_fighter — used by research.py
    # ------------------------------------------------------------------

    def scrape_fighter(self, name: str, url: str) -> dict:
        print(f'  {name} ...', file=sys.stderr, end=' ', flush=True)
        try:
            soup = self._scraper.fetch(url)
            record = self._parse_record(soup)
            streak = self._parse_streak(soup)
            recent_fights = self._parse_fight_history(soup)
            print(f'record={record}, streak={streak}, fights={len(recent_fights)}', file=sys.stderr)
            return {
                'name': name,
                'profile_url': url,
                'record': record,
                'streak': streak,
                'recent_fights': recent_fights,
            }
        except Exception as exc:
            print(f'ERROR: {exc}', file=sys.stderr)
            return {'name': name, 'profile_url': url, 'record': None, 'streak': None, 'recent_fights': []}
        finally:
            time.sleep(constants.REQUEST_DELAY)

    def _parse_record(self, soup: bs4.BeautifulSoup) -> str | None:
        def _stat(cls: str) -> str:
            el = soup.find(class_=cls)
            if not el:
                return '0'
            spans = el.find_all('span')
            return spans[1].get_text(strip=True) if len(spans) >= 2 else '0'

        wins = _stat('wins')
        losses = _stat('loses')  # Sherdog uses 'loses', not 'losses'
        draws = _stat('draws')
        if wins == '0' and losses == '0':
            return None
        return f'{wins}-{losses}-{draws}'

    def _parse_streak(self, soup: bs4.BeautifulSoup) -> str | None:
        table = soup.find('table', class_='new_table')
        if not table:
            return None

        results = []
        for row in table.find_all('tr')[1:]:
            td = row.find('td')
            if td:
                r = td.get_text(strip=True).lower()
                if r in _STATUS_MAP:
                    results.append(r)

        if not results:
            return None

        first = results[0]
        count = 0
        for r in results:
            if r == first:
                count += 1
            else:
                break
        return f'{count} {first.capitalize()}'

    def _parse_fight_history(self, soup: bs4.BeautifulSoup, limit: int = 5) -> list[dict]:
        table = soup.find('table', class_='new_table')
        if not table:
            return []

        fights = []
        for row in table.find_all('tr')[1:]:
            if len(fights) >= limit:
                break

            cols = row.find_all('td')
            if len(cols) < 6:
                continue

            result_span = cols[0].find('span', class_='final_result')
            if not result_span:
                continue
            result = _STATUS_MAP.get(result_span.get_text(strip=True).lower())
            if result is None:
                continue

            opp_link = cols[1].find('a')
            opponent = opp_link.get_text(strip=True) if opp_link else None

            date_span = cols[2].find('span', class_='sub_line')
            date = _parse_date_display(date_span.get_text(strip=True)) if date_span else None

            method_b = cols[3].find('b')
            method = method_b.get_text(strip=True) if method_b else None

            fights.append({'result': result, 'opponent': opponent, 'method': method, 'date': date})

        return fights

    # ------------------------------------------------------------------
    # Shared helpers
    # ------------------------------------------------------------------

    @staticmethod
    def _parse_event_name(soup: bs4.BeautifulSoup) -> str:
        el = soup.find(itemprop='name')
        return el.get_text(strip=True) if el else 'UFC Event'

    @staticmethod
    def _parse_date(soup: bs4.BeautifulSoup) -> str:
        el = soup.find(itemprop='startDate')
        if el:
            return el.get('content', '')[:10]
        return datetime.date.today().isoformat()

    @staticmethod
    def _parse_location(soup: bs4.BeautifulSoup) -> str:
        el = soup.find(itemprop='location')
        return el.get_text(strip=True) if el else ''
