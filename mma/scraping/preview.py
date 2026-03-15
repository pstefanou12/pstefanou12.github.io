import json
import os

from scraping import constants
from scraping import tapology


def _build_odds_scaffold(fighter1, fighter2):
    return {platform: {fighter1: None, fighter2: None} for platform in constants.PLATFORMS}


def _update_json_with_preview(preview_card, json_path=constants.JSON_PATH):
    if os.path.exists(json_path):
        with open(json_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
    else:
        data = {"cards": []}

    existing_index = None
    for i, card in enumerate(data['cards']):
        if card['id'] == preview_card['id']:
            existing_index = i
            break

    if existing_index is not None:
        data['cards'][existing_index]['previewUrl'] = preview_card['previewUrl']
        if not data['cards'][existing_index].get('location'):
            data['cards'][existing_index]['location'] = preview_card['location']
        if not data['cards'][existing_index].get('eventTime'):
            data['cards'][existing_index]['eventTime'] = preview_card['eventTime']
        if not data['cards'][existing_index].get('fights') and preview_card.get('fights'):
            data['cards'][existing_index]['fights'] = preview_card['fights']
    else:
        data['cards'].insert(0, preview_card)

    data['cards'].sort(key=lambda x: x['date'], reverse=True)

    with open(json_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)


def _generate_preview_template(event_data):
    sections = {}
    for fight in event_data['fights']:
        section = fight['card_placement']
        if section not in sections:
            sections[section] = []
        sections[section].append(fight)

    html = constants.HTML_HEAD.format(title=f"{event_data['event_name']} Preview", js_file='preview.js')
    html += '''\
    <h2 id="table-of-contents">Table of Contents</h2>
    <ul class="toc">
      <li><a href="#overview">Overview</a></li>
'''
    for section, fights in sections.items():
        html += f'      <li><strong>{section} Picks</strong>\n        <ul>\n'
        for fight in fights:
            fight_id = f"{fight['fighter1'].lower().replace(' ', '-')}-vs-{fight['fighter2'].lower().replace(' ', '-')}"
            html += f'          <li><a href="#{fight_id}">{fight["fighter1"]} vs. {fight["fighter2"]}</a></li>\n'
        html += '        </ul>\n      </li>\n'

    html += constants.PREVIEW_OVERVIEW_SECTION
    for section, fights in sections.items():
        html += f'      <h2 id="{section.lower().replace(" ", "-")}-picks">{section} Picks</h2>\n      \n'
        for fight in fights:
            fight_id = f"{fight['fighter1'].lower().replace(' ', '-')}-vs-{fight['fighter2'].lower().replace(' ', '-')}"
            html += constants.PREVIEW_FIGHT_DIV.format(
                fight_id=fight_id,
                fighter1=fight['fighter1'],
                fighter2=fight['fighter2'],
            )
    html += constants.PREVIEW_BETTING
    return html


def run(args):
    """Scrape Tapology event and generate a preview HTML template."""
    print("Scraping event data...")
    event_data = tapology.scrape_tapology_event(args.url, mode='preview')

    print(f"\nEvent: {event_data['event_name']}")
    print(f"Date: {event_data['date']}")
    print(f"Location: {event_data['location']}")
    print(f"Fights found: {len(event_data['fights'])}\n")

    card_id = tapology.generate_card_id(event_data['event_name'])
    print(f"Generated card ID: {card_id}\n")

    fights = {}
    for fight in event_data['fights']:
        matchup = f"{fight['fighter1']} vs. {fight['fighter2']}"
        fights[matchup] = {
            "prediction": {"winner": "", "method": ""},
            "result": None,
            "odds": _build_odds_scaffold(fight['fighter1'], fight['fighter2']),
        }

    preview_card = {
        "id": card_id,
        "title": tapology.extract_title(event_data['event_name'])[0],
        "subtitle": tapology.extract_title(event_data['event_name'])[1],
        "date": tapology.parse_event_date(event_data['date']),
        "rating": None,
        "poster": f"/mma/db/img/{card_id.replace('-', '_')}_poster.jpg",
        "recapUrl": None,
        "previewUrl": f"db/previews/{card_id}.html",
        "location": event_data['location'],
        "eventTime": event_data['date'],
        "fights": fights,
    }

    _update_json_with_preview(preview_card)

    preview_html = _generate_preview_template(event_data)
    preview_filename = f"./mma/db/previews/{card_id}.html"
    with open(preview_filename, 'w', encoding='utf-8') as f:
        f.write(preview_html)

    print(f"✓ JSON updated with preview URL")
    print(f"✓ Preview template generated: {preview_filename}")
    print(f"✓ Poster filename: {card_id.replace('-', '_')}_poster.jpg")
    print(f"\n📋 Next steps:")
    print(f"  1. Add poster image to ./mma/db/img/")
    print(f"  2. Fill in the [Add your event overview here] section")
    print(f"  3. Add your major storyline sections")
    print(f"  4. Fill in fight analysis and picks for each matchup")
