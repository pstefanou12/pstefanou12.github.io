import requests
from bs4 import BeautifulSoup
import re
from datetime import datetime
import pprint

def scrape_tapology_event(url):
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

    if fight_card_section:
        bouts = fight_card_section.find_all(id=re.compile('boutFullsize'))
        for bout in bouts: 
            # Find all fighter links within the bout 
            fighter_links =  bout.find_all('a', class_='link-primary-red', href=re.compile(r'/fightcenter/fighters/'))

            if len(fighter_links) >= 2: 
                fighter1 = fighter_links[0].get_text().strip()
                fighter2 = fighter_links[2].get_text().strip()

                # Extract the method of victory from the bout
                method_of_victory = bout.find_all('span', class_=re.compile('uppercase text-sm'))[0].get_text().strip()

                # Extract additional bout information
                bout_info = bout.find_all('span', class_=re.compile('text-xs11'))

                # Extract time of victory from the bout
                time_of_victory = bout_info[-2].get_text().strip()
                
                card_placement = bout_info[-1].find_all('a')[0].get_text().strip()

                if 'main' in card_placement.lower(): 
                    card_placement = 'Main'
                elif card_placement.lower() == 'prelim': 
                    card_placement = 'Prelim'

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

def generate_html_template(event_data, rating='0.0', rating_class='poor'):
    """Generate HTML template from scraped event data"""
    
    # Group fights by section
    sections = {}
    for fight in event_data['fights']:
        section = fight['card_placement']
        if section not in sections:
            sections[section] = []
        sections[section].append(fight)
    
    # Calculate rating width percentage
    rating_float = float(rating)
    rating_width = int(rating_float * 10)
    
    # Generate HTML
    html = f'''<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{event_data['event_name']} Recap</title>
  <link rel="stylesheet" href="../../css/index.css">
  <link rel="stylesheet" href="../../css/mma.css">
  <link rel="icon" type="image/png" href="../../img/chibili.jpeg">
</head>
<body>
  
  <div class="section">
    <a href="../mma.html" class="back-button">← Back to All Recaps</a>
    
    <h1>{event_data['event_name']} Recap</h1>
    <p class="event-date">{event_data['date']} • {event_data['location']}</p>
   
    <img src="../../img/{event_data['event_name'].replace(' ', '_')}_poster.jpg" alt="{event_data['event_name']} Poster" class="event-poster">
    <div class="rating-container event-rating">
      <div class="rating-bar">
        <div class="rating-fill {rating_class}" style="width: {rating_width}%;"></div>
      </div>
      <span class="rating-score">{rating}/10</span>
    </div>
    
    <div class="recap-content">

      <h2>Summary</h2>
        [Add your event summary here]
        <br>
        <br>

'''
    
    # Add fights by section
    for section, fights in sections.items():
        html += f'      <h2>{section}</h2>\n      \n'
        
        for fight in fights:
            html += f'''      <div class="fight">
        <h3>{fight['fighter1']} vs. {fight['fighter2']}</h3>
        <p class="fight-result"><strong>Result: </strong>{fight['method_of_victory']} at {fight['time_of_victory']}</p>
        <p>
          [Add your fight recap here]
        </p>
      </div>
      
'''
    
    html += '''    </div>
  </div>
  
</body>
</html>'''
    
    return html

def main():
    # Example usage
    url = input("Enter Tapology event URL: ")
    
    print("Scraping event data...")
    event_data = scrape_tapology_event(url)
    
    print(f"\nEvent: {event_data['event_name']}")
    print(f"Date: {event_data['date']}")
    print(f"Location: {event_data['location']}")
    print(f"Fights found: {len(event_data['fights'])}\n")
    
    # Get rating info
    rating = input("Enter event rating (0.0-10.0): ")
    
    # Determine rating class
    rating_float = float(rating)
    if rating_float >= 8.0:
        rating_class = 'excellent'
    elif rating_float >= 7.0:
        rating_class = 'good'
    elif rating_float >= 5.0:
        rating_class = 'average'
    elif rating_float >= 3.0:
        rating_class = 'below-average'
    else:
        rating_class = 'poor'
    
    # Generate HTML
    html_content = generate_html_template(event_data, rating, rating_class)
    
    # Save to file
    filename = './mma/recaps' f"{event_data['event_name'].replace(' ', '_')}_recap.html"
    with open(filename, 'w', encoding='utf-8') as f:
        f.write(html_content)
    
    print(f"\nHTML template generated: {filename}")

if __name__ == "__main__":
    main()