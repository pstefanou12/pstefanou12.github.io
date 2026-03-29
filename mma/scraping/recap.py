"""
Recap — generates an HTML recap template and updates cards.json after an event.

Scrapes result data from Tapology, merges it with any existing predictions and
odds in cards.json, and writes a populated HTML template to mma/db/recaps/.

Public API:
    run(args)  — args.url, args.rating
"""
import json
import os
import re

from scraping import constants
from scraping import tapology


def _find_fight(fights, fighter1, fighter2):
    key1 = f"{fighter1} vs. {fighter2}"
    key2 = f"{fighter2} vs. {fighter1}"
    if key1 in fights:
        return fights[key1]
    if key2 in fights:
        return fights[key2]
    for matchup, fight in fights.items():
        if fighter1.lower() in matchup.lower() and fighter2.lower() in matchup.lower():
            return fight
    return None


def _update_json_metadata(event_data, card_id, rating, fights=None, json_path=constants.JSON_PATH):
    iso_date = tapology.parse_event_date(event_data['date'])
    event_name = event_data['event_name']

    if 'fight night' in event_name.lower():
        title = "UFC Fight Night"
        subtitle = event_name.split(':', 1)[1].strip() if ':' in event_name else None
    else:
        title_match = re.match(r'(UFC \d+|UFC [^:]+)', event_name, re.IGNORECASE)
        if title_match:
            title = title_match.group(1).strip()
            subtitle = tapology.extract_subtitle(event_name)
        else:
            title = event_name
            subtitle = None

    new_card = {
        "id": card_id,
        "title": title,
        "subtitle": subtitle,
        "date": iso_date,
        "rating": float(rating),
        "poster": f"/mma/db/img/{card_id.replace('-', '_')}_poster.jpg",
        "recapUrl": f"db/recaps/{card_id}.html",
        "previewUrl": None,
        "location": event_data['location'],
        "eventTime": event_data['date'],
        "fights": fights or {},
    }

    if os.path.exists(json_path):
        with open(json_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
    else:
        data = {"cards": []}

    existing_card = None
    for i, card in enumerate(data['cards']):
        if card['id'] == card_id:
            existing_card = i
            break

    if existing_card is not None:
        print(f"Updating existing card: {card_id}")
        if not fights and data['cards'][existing_card].get('fights'):
            new_card['fights'] = data['cards'][existing_card]['fights']
        if data['cards'][existing_card]['previewUrl'] is not None:
            new_card['previewUrl'] = data['cards'][existing_card]['previewUrl']
        data['cards'][existing_card] = new_card
    else:
        print(f"Adding new card: {card_id}")
        data['cards'].insert(0, new_card)

    data['cards'].sort(key=lambda x: x['date'], reverse=True)

    with open(json_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

    print(f"Updated JSON metadata at {json_path}")
    return new_card


def _generate_recap_template(event_data):
    sections = {}
    for fight in event_data['fights']:
        section = fight['card_placement']
        if section not in sections:
            sections[section] = []
        sections[section].append(fight)

    html = constants.HTML_HEAD.format(title=f"{event_data['event_name']} Recap", js_file='recap.js')
    html += '''\
    <div class="rating-container event-rating">
      <div class="rating-bar">
        <div class="rating-fill" style="width: 0%;"></div>
      </div>
      <span class="rating-score">-/10</span>
    </div>
    <div class="predictions-score"></div>

    <div class="recap-content">

      <h2 id="table-of-contents">Table of Contents</h2>
      <ul class="toc">
'''
    html += '        <li><a href="#summary">Summary</a></li>\n'
    for section, fights in sections.items():
        html += f'        <li><strong>{section}</strong>\n          <ul>\n'
        for fight in fights:
            fight_id = f"{fight['fighter1'].lower().replace(' ', '-')}-vs-{fight['fighter2'].lower().replace(' ', '-')}"
            html += f'            <li><a href="#{fight_id}">{fight["fighter1"]} vs. {fight["fighter2"]}</a></li>\n'
        html += '          </ul>\n        </li>\n'
    html += '        <li><a href="#betting-results">Betting Results</a></li>\n'
    html += '      </ul>\n      <br>\n\n'

    html += constants.RECAP_SUMMARY_SECTION
    for section, fights in sections.items():
        html += f'      <h2 id="{section.lower().replace(" ", "-")}">{section}</h2>\n      \n'
        for fight in fights:
            fight_id = f"{fight['fighter1'].lower().replace(' ', '-')}-vs-{fight['fighter2'].lower().replace(' ', '-')}"
            html += constants.RECAP_FIGHT_DIV.format(
                fight_id=fight_id,
                fighter1=fight['fighter1'],
                fighter2=fight['fighter2'],
                method=fight['method_of_victory'],
                time=fight['time_of_victory'],
            )
    html += constants.RECAP_BETTING
    return html


def run(args):
    """Scrape Tapology event results and generate a recap HTML template."""
    print("Scraping event data...")
    event_data = tapology.scrape_tapology_event(args.url, mode='recap')

    print(f"\nEvent: {event_data['event_name']}")
    print(f"Date: {event_data['date']}")
    print(f"Location: {event_data['location']}")
    print(f"Fights found: {len(event_data['fights'])}\n")

    card_id = tapology.generate_card_id(event_data['event_name'])
    print(f"Generated card ID: {card_id}\n")

    existing_fights = {}
    if os.path.exists(constants.JSON_PATH):
        with open(constants.JSON_PATH, 'r', encoding='utf-8') as f:
            data = json.load(f)
        for card in data['cards']:
            if card['id'] == card_id:
                existing_fights = card.get('fights', {})
                break

    fights = {}
    for fight in event_data['fights']:
        matchup = f"{fight['fighter1']} vs. {fight['fighter2']}"
        existing = _find_fight(existing_fights, fight['fighter1'], fight['fighter2'])
        prediction = existing['prediction'] if existing else {"winner": "", "method": ""}
        existing_odds = existing.get('odds') if existing else None
        existing_best_odds = existing.get('bestOdds') if existing else None
        method = fight.get('method_of_victory')
        if method and 'draw' in method.lower():
            winner = 'draw'
        elif method and 'no contest' in method.lower():
            winner = 'no contest'
        else:
            winner = fight['fighter1']
        result = {
            "winner": winner,
            "method": method,
            "time": fight['time_of_victory'],
        } if method else None
        entry = {"prediction": prediction, "result": result}
        if existing_odds:
            entry['odds'] = existing_odds
        if existing_best_odds:
            entry['bestOdds'] = existing_best_odds
        fights[matchup] = entry

    _update_json_metadata(event_data, card_id, args.rating, fights)
    print(f"✓ JSON metadata updated")

    html_content = _generate_recap_template(event_data)
    filename = f"./mma/db/recaps/{card_id}.html"
    with open(filename, 'w', encoding='utf-8') as f:
        f.write(html_content)

    print(f"✓ HTML template generated: {filename}")
    print(f"✓ Poster filename: {card_id.replace('-', '_')}_poster.jpg")
    print(f"\n📋 Next steps:")
    print(f"  1. Add poster image to ./mma/db/img/")
    print(f"  2. Fill in the [Add your event summary here] section")
    print(f"  3. Fill in each [Add your fight recap here] section")
