import requests
from bs4 import BeautifulSoup
import re
from datetime import datetime
import pprint
import json
import os

PLATFORMS = [
    'BetOnline', 'Bovada', 'MyBookie', 'BetUS', 'Bet105', 'BookMaker',
    'DraftKings', 'FanDuel', '4Cx', 'Circa', 'BetAnything', 'BetRivers',
    'HardRocketBet', 'BetMGM', 'Caesars', 'Jazz', 'Polymakr', 'Pinnacle',
    'Betway', 'Stake', 'Cloudbet', '4casters', 'SXBet',
]

def scrape_tapology_event(url, mode='both'):
    """Scrape fight data from Tapology event page"""
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    }
    
    response = requests.get(url, headers=headers)
    soup = BeautifulSoup(response.content, 'html.parser')
    
    # Extract event name from title tag
    title_tag = soup.find('title')
    if title_tag:
        event_name = title_tag.text.split('|')[0].strip()
    else:
        event_name = 'UFC Event'
    
    # Extract event date and location from the primary details section
    primary_details_container = soup.find_all(id='primaryDetailsContainer')
    
    date = primary_details_container[0].find_all('li')[0].find_all('span', class_='text-neutral-700')[0].get_text().strip()
    location = primary_details_container[0].find_all('li')[6].find_all('span', class_='text-neutral-700')[0].get_text().strip()

    # Parse fights - look for fight tables
    fights = []
    
    # Find all tables with fighter matchups
    fight_card_section = soup.find(id='sectionFightCard')

    bout_dict = None
    if fight_card_section:
        bouts = fight_card_section.find_all(id=re.compile('boutFullsize'))
        for bout in bouts: 
            # Find all fighter links within the bout 
            fighter_links =  bout.find_all('a', class_='link-primary-red', href=re.compile(r'/fightcenter/fighters/'))

            if len(fighter_links) >= 2: 
                fighter1 = fighter_links[0].get_text().strip()
                fighter2 = fighter_links[2].get_text().strip()

                # Extract additional bout information
                bout_info = bout.find_all('span', class_=re.compile('text-xs11'))

                method_of_victory, time_of_victory = None, None
                if mode != 'preview':
                    # Extract the method of victory from the bout
                    method_of_victory = bout.find_all('span', class_=re.compile('uppercase text-sm'))[0].get_text().strip()
                    # Extract time of victory from the bout
                    time_of_victory = bout_info[-2].get_text().strip()

                # Determine card placement by searching bout text for keywords
                bout_text = bout.get_text()
                if re.search(r'early\s*prelim', bout_text, re.IGNORECASE):
                    card_placement = 'Early Prelims'
                elif re.search(r'main\s*card', bout_text, re.IGNORECASE):
                    card_placement = 'Main Card'
                elif re.search(r'prelim', bout_text, re.IGNORECASE):
                    card_placement = 'Prelims'
                else:
                    card_placement = 'Main Card'

                bout_dict = {
                    'card_placement': card_placement,
                    'fighter1': fighter1,
                    'fighter2': fighter2,
                    'method_of_victory': method_of_victory,
                    'time_of_victory': time_of_victory
                }
                pprint.pprint(f"bout dict: {bout_dict}")
                fights.append(bout_dict)
    
    return {
        'event_name': event_name,
        'date': date,
        'location': location,
        'fights': fights
    }

def generate_card_id(event_name):
    """
    Generate card ID from event name following the naming convention:
    - UFC 320 -> ufc-320
    - UFC Fight Night: Royval vs Kape -> ufc-fight-night-royval-kape
    """
    event_name_lower = event_name.lower()
    
    # Check if it's a numbered UFC event
    ufc_number_match = re.search(r'ufc (\d+)', event_name_lower)
    if ufc_number_match:
        return f"ufc-{ufc_number_match.group(1)}"
    
    # Check if it's a Fight Night
    if 'fight night' in event_name_lower:
        # Extract fighter names after the colon
        if ':' in event_name:
            fighters_part = event_name.split(':')[1].strip()
            # Split by 'vs' or 'vs.'
            fighters = re.split(r'\s+vs\.?\s+', fighters_part, flags=re.IGNORECASE)
            if len(fighters) >= 2:
                # Get last names (assume last word is last name)
                fighter1_last = fighters[0].strip().split()[-1].lower()
                fighter2_last = fighters[1].strip().split()[-1].lower()
                return f"ufc-fight-night-{fighter1_last}-{fighter2_last}"
        
        # Fallback if we can't parse fighters
        return "ufc-fight-night-" + re.sub(r'[^a-z0-9]+', '-', event_name_lower.replace('ufc fight night', '').strip()).strip('-')
    
    # For other UFC events (e.g., "UFC Qatar: Tsarukyan vs Hooker")
    if ':' in event_name and 'ufc' in event_name_lower:
        fighters_part = event_name.split(':')[1].strip()
        fighters = re.split(r'\s+vs\.?\s+', fighters_part, flags=re.IGNORECASE)
        if len(fighters) >= 2:
            fighter1_last = fighters[0].strip().split()[-1].lower()
            fighter2_last = fighters[1].strip().split()[-1].lower()
            location = event_name.split(':')[0].replace('UFC', '').strip().lower()
            location_slug = re.sub(r'[^a-z0-9]+', '-', location).strip('-')
            return f"ufc-{location_slug}-{fighter1_last}-{fighter2_last}"
    
    # Default fallback
    return re.sub(r'[^a-z0-9]+', '-', event_name_lower).strip('-')

def parse_event_date(date_string):
    """
    Parse date string from Tapology format to YYYY-MM-DD
    Example: "Sat. 10.04.2025" -> "2025-10-04"
    """
    try:
        # Remove day of week and parse
        date_part = date_string.split()[-1]  # Get "10.04.2025"
        date_obj = datetime.strptime(date_part, "%m.%d.%Y")
        return date_obj.strftime("%Y-%m-%d")
    except:
        # Fallback to current date if parsing fails
        return datetime.now().strftime("%Y-%m-%d")

def extract_subtitle(event_name):
    """
    Extract subtitle from event name
    Example: "UFC 320 Ankalaev vs. Pereira 2" -> "Ankalaev vs. Pereira 2"
    """
    # For numbered UFC events, everything after the number is the subtitle
    ufc_number_match = re.search(r'ufc (\d+)\s+(.*)', event_name, re.IGNORECASE)
    if ufc_number_match:
        subtitle = ufc_number_match.group(2).strip()
        return subtitle if subtitle else None
    
    # For Fight Night, extract fighters
    if ':' in event_name:
        return event_name.split(':', 1)[1].strip()
    
    return None

def update_json_metadata(event_data, card_id, rating, fights=None, json_path='./mma/js/ufc_cards.json'):
    """
    Add or update card metadata in the JSON file
    """
    # Parse the date
    iso_date = parse_event_date(event_data['date'])

    # Extract title and subtitle
    event_name = event_data['event_name']

    # Determine title based on event type
    if 'fight night' in event_name.lower():
        title = "UFC Fight Night"
        if ':' in event_name:
            subtitle = event_name.split(':', 1)[1].strip()
        else:
            subtitle = None
    else:
        # For numbered events or other UFC events
        title_match = re.match(r'(UFC \d+|UFC [^:]+)', event_name, re.IGNORECASE)
        if title_match:
            title = title_match.group(1).strip()
            subtitle = extract_subtitle(event_name)
        else:
            title = event_name
            subtitle = None

    # Create the new card entry
    new_card = {
        "id": card_id,
        "title": title,
        "subtitle": subtitle,
        "date": iso_date,
        "rating": float(rating),
        "poster": f"/mma/img/{card_id.replace('-', '_')}_poster.jpg",
        "recapUrl": f"recaps/{card_id}.html",
        "previewUrl": None,  # Can be added manually later
        "location": event_data['location'],
        "eventTime": event_data['date'],
        "fights": fights or {}
    }

    # Load existing JSON or create new structure
    if os.path.exists(json_path):
        with open(json_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
    else:
        data = {"cards": []}

    # Check if card already exists and update, otherwise append
    existing_card = None
    for i, card in enumerate(data['cards']):
        if card['id'] == card_id:
            existing_card = i
            break

    if existing_card is not None:
        print(f"Updating existing card: {card_id}")
        # Preserve fights from existing card if not provided
        if not fights and data['cards'][existing_card].get('fights'):
            new_card['fights'] = data['cards'][existing_card]['fights']
        if data['cards'][existing_card]['previewUrl'] is not None:
            new_card['previewUrl'] = data['cards'][existing_card]['previewUrl']
        data['cards'][existing_card] = new_card
    else:
        print(f"Adding new card: {card_id}")
        data['cards'].insert(0, new_card)  # Add to beginning (most recent first)

    # Sort by date (newest first)
    data['cards'].sort(key=lambda x: x['date'], reverse=True)

    # Save updated JSON
    with open(json_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

    print(f"Updated JSON metadata at {json_path}")
    return new_card

def find_fight(fights, fighter1, fighter2):
    """Find fight entry for a matchup, handling different fighter orderings"""
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

def generate_html_template(event_data):
    """Generate HTML template from scraped event data"""

    # Group fights by section
    sections = {}
    for fight in event_data['fights']:
        section = fight['card_placement']
        if section not in sections:
            sections[section] = []
        sections[section].append(fight)

    # Generate HTML
    html = f'''<!DOCTYPE html>
<html lang="en">
<head>
  <!-- Google tag (gtag.js) -->
  <script async src="https://www.googletagmanager.com/gtag/js?id=G-34EDHY08Q8"></script>
  <script>
      window.dataLayer = window.dataLayer || [];
      function gtag(){{dataLayer.push(arguments);}}
      gtag('js', new Date());

      gtag('config', 'G-34EDHY08Q8');
  </script>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{event_data['event_name']} Recap</title>
  <link rel="stylesheet" href="../css/mma.css">
  <link rel="icon" type="image/png" href="../img/hardcore_mma.png">
  <script src="../js/ufc_recaps.js"></script>
</head>
<body>
  
  <div class="section">
    <a href="../mma.html">
      <img id="logo" src="../img/hardcore_mma.png">
    </a>

    <h1>Loading...</h1>
    <p class="event-date">Loading...</p>
   
    <img src="" alt="Event Poster" class="event-poster">
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
    
    # Add table of contents links for Summary and all fights
    html += '        <li><a href="#summary">Summary</a></li>\n'
    
    for section, fights in sections.items():
        section_id = section.lower().replace(' ', '-')
        html += f'        <li><strong>{section}</strong>\n'
        html += '          <ul>\n'
        
        for fight in fights:
            # Create a unique ID for each fight
            fight_id = f"{fight['fighter1'].lower().replace(' ', '-')}-vs-{fight['fighter2'].lower().replace(' ', '-')}"
            html += f'            <li><a href="#{fight_id}">{fight["fighter1"]} vs. {fight["fighter2"]}</a></li>\n'
        
        html += '          </ul>\n'
        html += '        </li>\n'
    
    html += '      </ul>\n      <br>\n\n'
    
    html += '''      <h2 id="summary">Summary</h2>
        [Add your event summary here]
        <br>
        <br>

'''
    
    # Add fights by section with anchor IDs
    for section, fights in sections.items():
        section_id = section.lower().replace(' ', '-')
        html += f'      <h2 id="{section_id}">{section}</h2>\n      \n'
        
        for fight in fights:
            # Create the same unique ID for each fight
            fight_id = f"{fight['fighter1'].lower().replace(' ', '-')}-vs-{fight['fighter2'].lower().replace(' ', '-')}"
            html += f'''      <div class="fight" id="{fight_id}">
        <h3>{fight['fighter1']} vs. {fight['fighter2']}</h3>
        <p class="fight-result"><strong>Result: </strong>{fight['method_of_victory']} at {fight['time_of_victory']}</p>
        <p class="fight-prediction"></p>
        <p>
          [Add your fight recap here]
        </p>
      </div>

'''
    
    html += '''    </div>
  </div>
  
  <div class="footer">
    <div class="footer-side" id="left">
      <div>Copyright © Patroklos Stefanou</div>
    </div>
    <div class="social-media">
      <a class="platform" target="_blank" href="https://www.linkedin.com/in/patroklos-stefanou/" rel="noopener noreferrer">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
          <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z"/>
        </svg>
      </a>
      <a class="platform" target="_blank" href="https://github.com/pstefanou12">
        <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 00-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0020 4.77 5.07 5.07 0 0019.91 1S18.73.65 16 2.48a13.38 13.38 0 00-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 005 4.77a5.44 5.44 0 00-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 009 18.13V22"/>
        </svg>
      </a>
      <a class="platform" target="_blank" href="https://x.com/formyxscarfalo1/">
        <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z"/>
          <circle cx="4" cy="4" r="2"/>
        </svg>        
      </a>
      <a class="platform" target="_blank" href="https://www.strava.com/athletes/23695440">
        <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066m-7.008-5.599l2.836 5.598h4.172L10.463 0l-7 13.828h4.169"/>
        </svg>
      </a>
    </div>
    <div class="footer-side" id="right">
      <div>Email: <a href="mailto:patstefanou@gmail.com">patstefanou@gmail.com</a></div>
    </div>
  </div>
  
</body>
</html>'''
    
    return html

def collect_odds_interactive(fights_list):
    """
    Interactively collect betting odds for each fight.

    fights_list: list of dicts with 'fighter1' and 'fighter2' keys (from scrape_tapology_event)
    Returns: {matchup: {platform: {fighter1: int, fighter2: int}}}
    """
    print('\n' + '=' * 60)
    print('BETTING ODDS ENTRY')
    print('=' * 60)
    print('Known platforms: ' + ', '.join(PLATFORMS))
    print()

    all_odds = {}

    for fight in fights_list:
        f1 = fight['fighter1']
        f2 = fight['fighter2']
        matchup = f"{f1} vs. {f2}"
        fight_odds = {}

        last1 = f1.split()[-1].upper()
        last2 = f2.split()[-1].upper()

        print(f'--- {matchup} ---')
        print(f'  Format: PLATFORM {last1} {last2}  (e.g. BetOnline -175 +145)')
        print(f'  Press Enter with no input to move to the next fight.')

        while True:
            line = input('  > ').strip()
            if not line:
                break

            parts = line.split()
            if len(parts) != 3:
                print(f'    Expected: PLATFORM ODDS1 ODDS2')
                continue

            platform = parts[0]
            try:
                odds1 = int(parts[1].replace('+', ''))
                odds2 = int(parts[2].replace('+', ''))
            except ValueError:
                print(f'    Invalid odds. Use integers like -175 or +145.')
                continue

            fight_odds[platform] = {f1: odds1, f2: odds2}
            print(f'    Saved: {platform} → {f1}: {odds1:+d}, {f2}: {odds2:+d}')

        if fight_odds:
            all_odds[matchup] = fight_odds
        print()

    return all_odds


def merge_odds_into_fights(fights_dict, new_odds):
    """
    Merge new_odds into fights_dict[matchup]['odds'], preserving any
    existing platform entries not re-entered this session.
    """
    def norm(s):
        return s.lower().replace(' vs. ', ' vs ')

    for matchup, platform_odds in new_odds.items():
        # Find matching key in fights_dict
        target_key = None
        for key in fights_dict:
            if norm(key) == norm(matchup):
                target_key = key
                break

        if target_key is None:
            continue

        existing = fights_dict[target_key].get('odds') or {}
        existing.update(platform_odds)
        fights_dict[target_key]['odds'] = existing

    return fights_dict


def update_json_odds(card_id, updated_fights, json_path='./mma/js/ufc_cards.json'):
    """Write updated fights (odds only) back to JSON without touching other fields."""
    with open(json_path, 'r', encoding='utf-8') as f:
        data = json.load(f)

    for card in data['cards']:
        if card['id'] == card_id:
            for matchup, entry in updated_fights.items():
                if 'odds' not in entry:
                    continue
                # Find matching fight in existing card
                def norm(s):
                    return s.lower().replace(' vs. ', ' vs ')
                for key in card.get('fights', {}):
                    if norm(key) == norm(matchup):
                        existing = card['fights'][key].get('odds') or {}
                        existing.update(entry['odds'])
                        card['fights'][key]['odds'] = existing
                        break
            break

    with open(json_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    print(f"Updated odds in {json_path}")


def main():
    import argparse

    parser = argparse.ArgumentParser(description='Generate UFC event recap templates and update metadata')
    parser.add_argument('url', help='Tapology event URL')
    parser.add_argument('--mode', choices=['preview', 'recap', 'both', 'odds'], default='both',
                      help='Mode: preview, recap, both (default), or odds (update odds only)')
    parser.add_argument('--rating', type=float, help='Event rating (0.0-10.0). Required for recap/both mode.')
    parser.add_argument('--odds', action='store_true',
                      help='Interactively enter betting odds after the main flow')

    args = parser.parse_args()

    # Validate rating requirement
    if args.mode in ['recap', 'both'] and args.rating is None:
        parser.error("--rating is required when mode is 'recap' or 'both'")
    
    print("Scraping event data...")
    scrape_mode = 'preview' if args.mode == 'odds' else args.mode
    event_data = scrape_tapology_event(args.url, mode=scrape_mode)

    print(f"\nEvent: {event_data['event_name']}")
    print(f"Date: {event_data['date']}")
    print(f"Location: {event_data['location']}")
    print(f"Fights found: {len(event_data['fights'])}\n")

    # Generate card ID
    card_id = generate_card_id(event_data['event_name'])
    print(f"Generated card ID: {card_id}\n")

    # Handle odds-only mode
    if args.mode == 'odds':
        new_odds = collect_odds_interactive(event_data['fights'])
        if new_odds:
            # Build a temporary fights dict to pass to merge helper
            temp_fights = {f"{f['fighter1']} vs. {f['fighter2']}": {'odds': new_odds.get(f"{f['fighter1']} vs. {f['fighter2']}", {})}
                           for f in event_data['fights']}
            update_json_odds(card_id, temp_fights)
            print(f"✓ Betting odds updated for {card_id}")
        else:
            print("No odds entered.")
        return

    # Handle preview mode
    if args.mode == 'preview':
        # Build fights scaffolding from fight matchups
        fights = {}
        for fight in event_data['fights']:
            matchup = f"{fight['fighter1']} vs. {fight['fighter2']}"
            fights[matchup] = {"prediction": {"winner": "", "method": ""}, "result": None}

        # Collect odds interactively if requested
        if args.odds:
            new_odds = collect_odds_interactive(event_data['fights'])
            fights = merge_odds_into_fights(fights, new_odds)

        # Update JSON with preview URL only (no rating needed for preview)
        preview_card = {
            "id": card_id,
            "title": extract_title(event_data['event_name'])[0],
            "subtitle": extract_title(event_data['event_name'])[1],
            "date": parse_event_date(event_data['date']),
            "rating": None,  # Will be filled in later
            "poster": f"/mma/img/{card_id.replace('-', '_')}_poster.jpg",
            "recapUrl": None,
            "previewUrl": f"previews/{card_id}.html",
            "location": event_data['location'],
            "eventTime": event_data['date'],
            "fights": fights
        }

        update_json_with_preview(preview_card)

        # Generate preview HTML template
        preview_html = generate_preview_template(event_data)
        preview_filename = f"./mma/previews/{card_id}.html"
        with open(preview_filename, 'w', encoding='utf-8') as f:
            f.write(preview_html)

        print(f"✓ JSON updated with preview URL")
        print(f"✓ Preview template generated: {preview_filename}")
        print(f"✓ Poster filename: {card_id.replace('-', '_')}_poster.jpg")
        print(f"\n📋 Next steps:")
        print(f"  1. Add poster image to ./mma/img/")
        print(f"  2. Fill in the [Add your event overview here] section")
        print(f"  3. Add your major storyline sections")
        print(f"  4. Fill in fight analysis and picks for each matchup")
        return

    # Handle recap or both modes
    rating = args.rating

    # Load existing fights from JSON (contains predictions filled in during preview mode)
    existing_fights = {}
    json_path = './mma/js/ufc_cards.json'
    if os.path.exists(json_path):
        with open(json_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        for card in data['cards']:
            if card['id'] == card_id:
                existing_fights = card.get('fights', {})
                break

    # Build updated fights dict merging existing predictions with scraped results
    fights = {}
    for fight in event_data['fights']:
        matchup = f"{fight['fighter1']} vs. {fight['fighter2']}"
        existing = find_fight(existing_fights, fight['fighter1'], fight['fighter2'])
        prediction = existing['prediction'] if existing else {"winner": "", "method": ""}
        existing_odds = existing.get('odds') if existing else None
        result = {
            "winner": fight['fighter1'],  # Tapology lists winner first on completed events
            "method": fight['method_of_victory'],
            "time": fight['time_of_victory']
        } if fight.get('method_of_victory') else None
        entry = {"prediction": prediction, "result": result}
        if existing_odds:
            entry['odds'] = existing_odds
        fights[matchup] = entry

    # Collect odds interactively if requested
    if args.odds:
        new_odds = collect_odds_interactive(event_data['fights'])
        fights = merge_odds_into_fights(fights, new_odds)

    # Update JSON metadata
    update_json_metadata(event_data, card_id, rating, fights)
    print(f"✓ JSON metadata updated")

    # Generate HTML template
    html_content = generate_html_template(event_data)

    # Save to file using card_id as filename
    filename = f"./mma/recaps/{card_id}.html"
    with open(filename, 'w', encoding='utf-8') as f:
        f.write(html_content)

    print(f"✓ HTML template generated: {filename}")
    print(f"✓ Poster filename: {card_id.replace('-', '_')}_poster.jpg")
    print(f"\n📋 Next steps:")
    print(f"  1. Add poster image to ./mma/img/")
    print(f"  2. Fill in the [Add your event summary here] section")
    print(f"  3. Fill in each [Add your fight recap here] section")

def extract_title(event_name):
    """Helper function to extract title and subtitle"""
    title, subtitle = event_name, None
    if 'fight night' not in event_name.lower():
        title_match = re.match(r'(UFC \d+|UFC [^:]+)', event_name, re.IGNORECASE)
        if title_match:
            title = title_match.group(1).strip()
            subtitle = extract_subtitle(event_name)
        else:
            title = event_name
    return title, subtitle

def generate_preview_template(event_data):
    """Generate preview HTML template from scraped event data"""
    
    # Group fights by section
    sections = {}
    for fight in event_data['fights']:
        section = fight['card_placement']
        if section not in sections:
            sections[section] = []
        sections[section].append(fight)
    
    # Generate HTML
    html = f'''<!DOCTYPE HTML>
<html lang="en">
  <head>
    <!-- Google tag (gtag.js) -->
    <script async src="https://www.googletagmanager.com/gtag/js?id=G-34EDHY08Q8"></script>
    <script>
        window.dataLayer = window.dataLayer || [];
        function gtag(){{dataLayer.push(arguments);}}
        gtag('js', new Date());
        gtag('config', 'G-34EDHY08Q8');
    </script>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>{event_data['event_name']} Preview</title>
    <link rel="stylesheet" href="../css/mma.css">
    <link rel="icon" type="image/png" sizes="16x16" href="../img/hardcore_mma.png">
    <script src="../js/ufc_previews.js"></script>
  </head>
  <body>

  <div class="section">
    <a href="../mma.html">
      <img id="logo" src="../img/hardcore_mma.png">
    </a>

    <!-- This content will be populated by preview.js -->
    <h1>Loading...</h1>
    <p class="event-date">Loading...</p>
    
    <img src="" alt="Event Poster" class="event-poster">
    
    <h2 id="table-of-contents">Table of Contents</h2>
    <ul class="toc">
      <li><a href="#overview">Overview</a></li>
'''
    
    # Add fights to table of contents
    for section, fights in sections.items():
        html += f'      <li><strong>{section} Picks</strong>\n'
        html += '        <ul>\n'
        for fight in fights:
            fight_id = f"{fight['fighter1'].lower().replace(' ', '-')}-vs-{fight['fighter2'].lower().replace(' ', '-')}"
            html += f'          <li><a href="#{fight_id}">{fight["fighter1"]} vs. {fight["fighter2"]}</a></li>\n'
        html += '        </ul>\n'
        html += '      </li>\n'
    
    html += '''    </ul>

    <div class="recap-content">

      <h2 id="overview">Overview</h2>
      <p>
        [Add your event overview here - describe the card, main storylines, significance]
      </p>
      <br>
'''
    
    # Add fight picks sections
    for section, fights in sections.items():
        section_id = section.lower().replace(' ', '-')
        html += f'      <h2 id="{section_id}-picks">{section} Picks</h2>\n      \n'
        
        for fight in fights:
            fight_id = f"{fight['fighter1'].lower().replace(' ', '-')}-vs-{fight['fighter2'].lower().replace(' ', '-')}"
            html += f'''      <div id="{fight_id}">
        <h3>{fight['fighter1']} vs. {fight['fighter2']}</h3>
        
        <div class="fight-overview">
          <p>
            [Add fight context: records, recent form, styles, what's at stake]
          </p>
        </div>
        
        <div class="pick">
          <h4>Pick: </h4>
          <div class="method">
            <strong>Method:</strong>
          </div>
          <div class="reasoning">
            <p>
              [Explain your pick - why will this fighter win? What advantages do they have?]
            </p>
          </div>
        </div>
      </div>
      
'''
    
    html += '''    </div>
  </div>
  
  <div class="footer">
    <div class="footer-side" id="left">
      <div>Copyright © Patroklos Stefanou</div>
    </div>
    <div class="social-media">
      <a class="platform" target="_blank" href="https://www.linkedin.com/in/patroklos-stefanou/" rel="noopener noreferrer">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
          <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z"/>
        </svg>
      </a>
      <a class="platform" target="_blank" href="https://github.com/pstefanou12">
        <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 00-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0020 4.77 5.07 5.07 0 0019.91 1S18.73.65 16 2.48a13.38 13.38 0 00-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 005 4.77a5.44 5.44 0 00-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 009 18.13V22"/>
        </svg>
      </a>
      <a class="platform" target="_blank" href="https://x.com/formyxscarfalo1/">
        <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z"/>
          <circle cx="4" cy="4" r="2"/>
        </svg>        
      </a>
      <a class="platform" target="_blank" href="https://www.strava.com/athletes/23695440">
        <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066m-7.008-5.599l2.836 5.598h4.172L10.463 0l-7 13.828h4.169"/>
        </svg>
      </a>
    </div>
    <div class="footer-side" id="right">
      <div>Email: <a href="mailto:patstefanou@gmail.com">patstefanou@gmail.com</a></div>
    </div>
  </div>
    
  </body>
</html>'''
    
    return html

def update_json_with_preview(preview_card, json_path='./mma/js/ufc_cards.json'):
    """Update JSON with preview URL only"""
    if os.path.exists(json_path):
        with open(json_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
    else:
        data = {"cards": []}
    
    # Check if card exists
    existing_index = None
    for i, card in enumerate(data['cards']):
        if card['id'] == preview_card['id']:
            existing_index = i
            break
    
    if existing_index is not None:
        # Update existing card with preview URL
        data['cards'][existing_index]['previewUrl'] = preview_card['previewUrl']
        # Update other fields if they don't have values
        if not data['cards'][existing_index].get('location'):
            data['cards'][existing_index]['location'] = preview_card['location']
        if not data['cards'][existing_index].get('eventTime'):
            data['cards'][existing_index]['eventTime'] = preview_card['eventTime']
        # Add fights scaffolding if not already present
        if not data['cards'][existing_index].get('fights') and preview_card.get('fights'):
            data['cards'][existing_index]['fights'] = preview_card['fights']
    else:
        # Add new card
        data['cards'].insert(0, preview_card)
    
    # Sort by date
    data['cards'].sort(key=lambda x: x['date'], reverse=True)
    
    with open(json_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

if __name__ == "__main__":
    main()