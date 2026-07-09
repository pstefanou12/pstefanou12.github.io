"""
WikipediaEventScraper — scrapes UFC event and fighter data from Wikipedia.

Public API:
    WikipediaEventScraper(scraper)  — construct with a Scraper instance

Card placement is read directly from section-header rows inside the fight
card table (e.g. "Main card (Paramount+)", "Preliminary card (Paramount+)",
"Early preliminary card (Paramount+)") — no positional inference needed.

Wikipedia fight-card tables (class="toccolours") contain a mix of:
  • section-header rows — single cell spanning all columns with card name
  • column-label rows  — <th> cells (Weight class / Fighter / Method / etc.)
  • fight rows         — <td>: weight | f1 | vs./def. | f2 | method | round | time | notes

Wikipedia fighter pages contain an MMA record table (class="wikitable")
under the "Mixed martial arts record" h2, with columns:
  Res. | Record | Opponent | Method | Event | Date | Round | Time | Location | Notes
"""
import datetime
import re
import sys
import time

import bs4

from scraping import constants
from scraping.event_scraper import EventScraper
from scraping.scraper import Scraper

WIKI_BASE = 'https://en.wikipedia.org'

# Checked in order — 'early preliminary' must precede 'preliminary' to avoid
# misclassifying Early Prelims rows as Prelims.
_CARD_SECTION_LABELS = [
    ('early preliminary', 'Early Prelims'),
    ('early prelim',      'Early Prelims'),
    ('main card',         'Main Card'),
    ('preliminary',       'Prelims'),
    ('prelim',            'Prelims'),
]

_STATUS_MAP = {
    'win':        'Win',
    'loss':       'Loss',
    'draw':       'Draw',
    'nc':         'NC',
    'no contest': 'NC',
}


def _card_placement_from_text(text: str) -> str | None:
    """
    Return the canonical card-placement label for a section header cell,
    or None if the text does not match any known section name.

    Examples:
        'Main card (Paramount+)'         → 'Main Card'
        'Preliminary card (ESPN+)'       → 'Prelims'
        'Early preliminary card (UFC+)'  → 'Early Prelims'
    """
    lowered = text.lower()
    for keyword, placement in _CARD_SECTION_LABELS:
        if keyword in lowered:
            return placement
    return None


def _normalize_href(href: str) -> str | None:
    """
    Convert Wikipedia href variants to a full https URL, or return None.

      '//en.wikipedia.org/wiki/…' → 'https://en.wikipedia.org/wiki/…'
      '/wiki/…'                   → 'https://en.wikipedia.org/wiki/…'
      '#…' / external links       → None
    """
    if not href or href.startswith('#'):
        return None
    if href.startswith('//'):
        return 'https:' + href
    if href.startswith('/wiki/'):
        return WIKI_BASE + href
    return None


def _parse_record_str(raw: str) -> str:
    """
    Normalise a Wikipedia record string (which uses en-dashes) to W-L-D.

      '14–5'       → '14-5-0'
      '14–5–1'     → '14-5-1'
      '14–5 (1 NC)' → '14-5-0'
    """
    cleaned = re.sub(r'\s*\(.*?\)', '', raw).strip()
    cleaned = re.sub(r'[–—]', '-', cleaned)
    parts = cleaned.split('-')
    if len(parts) == 2:
        return f'{parts[0]}-{parts[1]}-0'
    if len(parts) >= 3:
        return f'{parts[0]}-{parts[1]}-{parts[2]}'
    return raw


class WikipediaEventScraper(EventScraper):
    def __init__(self, scraper: Scraper):
        self._scraper = scraper

    # ------------------------------------------------------------------
    # scrape_event — used by preview.py and recap.py
    # ------------------------------------------------------------------

    def scrape_event(self, url: str, mode: str = 'both') -> dict:
        """
        Scrape a Wikipedia UFC event page and return structured event data.

        Args:
            url:  Wikipedia URL for the event
                  (e.g. 'https://en.wikipedia.org/wiki/UFC_329').
            mode: 'preview' — omit result fields (method / time);
                  'recap' or 'both' — include them for completed bouts.

        Returns:
            {
                event_name: str,          # e.g. 'UFC 329: McGregor vs. Holloway 2'
                date:       str,          # ISO YYYY-MM-DD
                location:   str,          # 'Venue, City'
                fights: [{
                    card_placement:    str,        # 'Main Card' | 'Prelims' | 'Early Prelims'
                    fighter1:          str,
                    fighter2:          str,
                    method_of_victory: str | None, # None when mode == 'preview'
                    time_of_victory:   str | None, # e.g. 'R2 0:15'
                }]
            }
        """
        soup = self._scraper.fetch(url)
        return {
            'event_name': self._parse_event_name(soup),
            'date':       self._parse_date(soup),
            'location':   self._parse_location(soup),
            'fights':     self._parse_fights(soup, mode=mode, research=False),
        }

    # ------------------------------------------------------------------
    # scrape_event_research — used by research.py
    # ------------------------------------------------------------------

    def scrape_event_research(self, url: str) -> tuple[str, list[dict]]:
        """
        Scrape a Wikipedia UFC event page for research, including fighter
        Wikipedia profile URLs needed by the subsequent scrape_fighter calls.

        Args:
            url: Wikipedia URL for the event
                 (e.g. 'https://en.wikipedia.org/wiki/UFC_329').

        Returns:
            (event_name, bouts) where each bout dict contains:
            {
                fighter1_name:  str,
                fighter1_url:   str | None,   # Wikipedia URL, or None if not linked
                fighter2_name:  str,
                fighter2_url:   str | None,
                weight_class:   str,
                card_placement: str,          # 'Main Card' | 'Prelims' | 'Early Prelims'
            }
        """
        print(f'Fetching event page: {url}', file=sys.stderr)
        soup = self._scraper.fetch(url)

        event_name = self._parse_event_name(soup)
        print(f'Event: {event_name}', file=sys.stderr)

        bouts = self._parse_fights(soup, mode='preview', research=True)
        if not bouts:
            raise RuntimeError('No bouts found on event page.')

        print(f'Found {len(bouts)} bouts.', file=sys.stderr)
        return event_name, bouts

    # ------------------------------------------------------------------
    # scrape_fighter — used by research.py
    # ------------------------------------------------------------------

    def scrape_fighter(self, name: str, url: str | None) -> dict:
        """
        Scrape a fighter's Wikipedia page and return their MMA record,
        current streak, and last five fights.

        Args:
            name: Fighter's display name.
            url:  Wikipedia URL for the fighter
                  (e.g. 'https://en.wikipedia.org/wiki/Rafael_Fiziev'),
                  or None if the fighter has no Wikipedia page.

        Returns:
            {
                name:          str,
                profile_url:   str | None,
                record:        str | None,  # 'W-L-D', e.g. '22-7-0'
                streak:        str | None,  # e.g. '3 Win' or '2 Loss'
                recent_fights: [{
                    result:   str,   # 'Win' | 'Loss' | 'Draw' | 'NC'
                    opponent: str,
                    method:   str,
                    date:     str,   # e.g. 'June 27, 2026'
                }]
            }
        """
        if not url:
            print(f'  {name} ... no Wikipedia page', file=sys.stderr)
            return {'name': name, 'profile_url': None, 'record': None, 'streak': None, 'recent_fights': []}

        print(f'  {name} ...', file=sys.stderr, end=' ', flush=True)
        try:
            soup = self._scraper.fetch(url)
            record, streak, recent_fights = self._parse_fighter_profile(soup)
            print(f'record={record}, streak={streak}, fights={len(recent_fights)}', file=sys.stderr)
            return {
                'name':          name,
                'profile_url':   url,
                'record':        record,
                'streak':        streak,
                'recent_fights': recent_fights,
            }
        except Exception as exc:
            print(f'ERROR: {exc}', file=sys.stderr)
            return {'name': name, 'profile_url': url, 'record': None, 'streak': None, 'recent_fights': []}
        finally:
            time.sleep(constants.REQUEST_DELAY)

    # ------------------------------------------------------------------
    # Fight-card parsing (shared by scrape_event and scrape_event_research)
    # ------------------------------------------------------------------

    def _parse_fights(
        self,
        soup: bs4.BeautifulSoup,
        mode: str,
        research: bool,
    ) -> list[dict]:
        table = soup.find('table', class_='toccolours')
        if not table:
            return []

        fights: list[dict] = []
        current_placement = 'Main Card'

        for row in table.find_all('tr'):
            cells = row.find_all(['th', 'td'])
            if not cells:
                continue

            # Section-header row: a single cell spanning the whole table
            if len(cells) == 1:
                placement = _card_placement_from_text(cells[0].get_text(strip=True))
                if placement:
                    current_placement = placement
                continue

            # Column-label row (all <th> elements)
            if all(c.name == 'th' for c in cells):
                continue

            # Fight row: weight | fighter1 | vs./def. | fighter2 | method | round | time | notes
            if len(cells) < 4:
                continue

            weight_class = cells[0].get_text(strip=True)
            connector    = cells[2].get_text(strip=True).lower()
            f1_name      = cells[1].get_text(strip=True)
            f2_name      = cells[3].get_text(strip=True)
            if not f1_name or not f2_name:
                continue

            is_completed = connector == 'def.'

            method, time_val = None, None
            if mode != 'preview' and is_completed and len(cells) >= 7:
                method_text = cells[4].get_text(strip=True)
                round_num   = cells[5].get_text(strip=True)
                time_str    = cells[6].get_text(strip=True)
                method   = method_text or None
                if method and time_str:
                    time_val = f'R{round_num} {time_str}' if round_num else time_str

            if research:
                f1_link = cells[1].find('a')
                f2_link = cells[3].find('a')
                fights.append({
                    'fighter1_name': f1_name,
                    'fighter1_url':  _normalize_href(f1_link['href']) if f1_link else None,
                    'fighter2_name': f2_name,
                    'fighter2_url':  _normalize_href(f2_link['href']) if f2_link else None,
                    'weight_class':  weight_class,
                    'card_placement': current_placement,
                })
            else:
                fights.append({
                    'card_placement':    current_placement,
                    'fighter1':          f1_name,
                    'fighter2':          f2_name,
                    'method_of_victory': method,
                    'time_of_victory':   time_val,
                })

        return fights

    # ------------------------------------------------------------------
    # Fighter-profile parsing
    # ------------------------------------------------------------------

    def _parse_fighter_profile(
        self,
        soup: bs4.BeautifulSoup,
        limit: int = 5,
    ) -> tuple[str | None, str | None, list[dict]]:
        """
        Parse the MMA record table once and return (record, streak, recent_fights).

        A single pass over the table rows derives all three values:
          • record       — from the Record column of the first data row
          • streak       — consecutive identical results from the most recent bout
          • recent_fights — the first `limit` bouts (most recent first)

        Streak counting stops at the first result that differs from the most
        recent one, but row iteration continues until `limit` fights are collected.
        """
        table = self._find_mma_record_table(soup)
        if not table:
            return None, None, []

        header_row = table.find('tr')
        if not header_row:
            return None, None, []
        header = [c.get_text(strip=True).lower() for c in header_row.find_all(['th', 'td'])]

        try:
            idx_res    = header.index('res.')
            idx_record = header.index('record')
            idx_opp    = header.index('opponent')
            idx_method = header.index('method')
            idx_date   = header.index('date')
        except ValueError:
            return None, None, []

        max_idx = max(idx_res, idx_record, idx_opp, idx_method, idx_date)

        record: str | None = None
        streak_status: str | None = None
        streak_count: int = 0
        streak_broken = False
        recent_fights: list[dict] = []

        for row in table.find_all('tr')[1:]:
            cells = row.find_all(['th', 'td'])
            if len(cells) <= max_idx:
                continue

            status = _STATUS_MAP.get(cells[idx_res].get_text(strip=True).lower())
            if status is None:
                continue

            # Record: read once from the first data row's Record column
            if record is None:
                record_text = cells[idx_record].get_text(strip=True)
                if re.search(r'\d+[–\-]\d+', record_text):
                    record = _parse_record_str(record_text)

            # Streak: count consecutive identical results from the top of the table
            if not streak_broken:
                if streak_status is None:
                    streak_status = status
                    streak_count = 1
                elif status == streak_status:
                    streak_count += 1
                else:
                    streak_broken = True

            # Recent fights: collect up to `limit` rows
            if len(recent_fights) < limit:
                recent_fights.append({
                    'result':   status,
                    'opponent': cells[idx_opp].get_text(strip=True),
                    'method':   cells[idx_method].get_text(strip=True),
                    'date':     cells[idx_date].get_text(strip=True),
                })

            # Stop iterating once we have enough fights and the streak is settled
            if len(recent_fights) >= limit and streak_broken:
                break

        streak = f'{streak_count} {streak_status}' if streak_status else None
        return record, streak, recent_fights

    @staticmethod
    def _find_mma_record_table(soup: bs4.BeautifulSoup) -> bs4.Tag | None:
        """
        Locate the fight-by-fight MMA record table on a Wikipedia fighter page.

        Wikipedia Parsoid HTML wraps headings in a div.mw-heading; the tables
        that belong to the section are siblings of that div within a <section>:

          <section>
            <div class="mw-heading mw-heading2">
              <h2>Mixed martial arts record</h2>
            </div>
            <table class="wikitable mw-collapsible">…summary…</table>   ← skip
            <table class="wikitable">…fight-by-fight list…</table>       ← want this
          </section>

        The fight list is identified by 'Res.' as its first column header.
        Falls back to a document-wide search for any wikitable with that header.
        """
        content = soup.find(id='mw-content-text')
        if not content:
            return None

        for h2 in content.find_all('h2'):
            if 'mixed martial arts record' not in h2.get_text(strip=True).lower():
                continue

            # h2 lives inside a div.mw-heading; siblings of that div are the tables
            heading_div = h2.parent
            sibling = heading_div.find_next_sibling()
            while sibling:
                if sibling.name == 'table' and 'wikitable' in (sibling.get('class') or []):
                    header = sibling.find('tr')
                    if header:
                        cols = [c.get_text(strip=True).lower() for c in header.find_all(['th', 'td'])]
                        if cols and cols[0] == 'res.':
                            return sibling
                # Stop when the next major section heading is reached
                if sibling.name == 'div' and 'mw-heading2' in (sibling.get('class') or []):
                    break
                sibling = sibling.find_next_sibling()
            break

        # Fallback: first wikitable anywhere in the page with 'Res.' as first header
        for table in content.find_all('table', class_='wikitable'):
            header = table.find('tr')
            if header:
                cols = [c.get_text(strip=True).lower() for c in header.find_all(['th', 'td'])]
                if cols and cols[0] == 'res.':
                    return table

        return None

    # ------------------------------------------------------------------
    # Infobox helpers
    # ------------------------------------------------------------------

    @staticmethod
    def _parse_event_name(soup: bs4.BeautifulSoup) -> str:
        infobox = soup.find('table', class_='infobox')
        if infobox:
            first_row = infobox.find('tr')
            if first_row:
                return first_row.get_text(strip=True)
        return 'UFC Event'

    @staticmethod
    def _parse_date(soup: bs4.BeautifulSoup) -> str:
        span = soup.find('span', class_='bday')
        if span:
            return span.get_text(strip=True)
        return datetime.date.today().isoformat()

    @staticmethod
    def _parse_location(soup: bs4.BeautifulSoup) -> str:
        infobox = soup.find('table', class_='infobox')
        if not infobox:
            return ''
        venue, city = '', ''
        for row in infobox.find_all('tr'):
            cells = row.find_all(['th', 'td'])
            if len(cells) >= 2:
                label = cells[0].get_text(strip=True)
                value = cells[1].get_text(strip=True)
                if label == 'Venue':
                    venue = value
                elif label == 'City':
                    city = value
        if venue and city:
            return f'{venue}, {city}'
        return venue or city
