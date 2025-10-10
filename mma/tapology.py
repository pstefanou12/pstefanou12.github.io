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
        event_name = title_tag.text.split('|')[0].strip().replace(':', '')
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
      <div class="footer">
      <div class="footer-side" id="left">
        <div>Copyright © Patroklos Stefanou</div>
      </div>
      <div class="social-media">
        <a class="platform" target="_blank" href="https://www.linkedin.com/in/patroklos-stefanou/", rel="noopener noreferrer">
          <svg xmlns="http://www.w3.org/2000/svg", viewBox="0 0 24 24">
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
    filename = './mma/recaps/' f"{event_data['event_name'].replace(' ', '_')}_recap.html"
    with open(filename, 'w', encoding='utf-8') as f:
        f.write(html_content)
    
    print(f"\nHTML template generated: {filename}")

if __name__ == "__main__":
    main()