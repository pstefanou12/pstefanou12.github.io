"""
Constants — shared configuration values and HTML template fragments for the scraping package.
"""
TAPOLOGY_BASE = 'https://www.tapology.com'
HEADERS = {
    'User-Agent': (
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) '
        'AppleWebKit/537.36 (KHTML, like Gecko) '
        'Chrome/120.0.0.0 Safari/537.36'
    )
}
REQUEST_DELAY = 1.2  # seconds between fighter profile fetches

FIGHTODDS_GQL = 'https://api.fightodds.io/gql'
GROUND_TRUTH_BOOK = 'DraftKings'

JSON_PATH = './mma/db/cards.json'

PLATFORMS = [
    'BetOnline', 'Bovada', 'MyBookie', 'BetUS', 'Bet105', 'BookMaker',
    'DraftKings', 'FanDuel', '4Cx', 'BetAnything', 'Circa', 'BetRivers',
    'HardRocketBet', 'BetMGM', 'Caesars', 'Jazz', 'Polymarket', 'Pinnacle',
    'Betway', 'Stake', 'Cloudbet', '4casters', 'SXBet',
]

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

# HTML templates — use .format(title=..., js_file=...) / .format(fight_id=...) etc.
# Double braces {{ }} produce literal { } in the rendered output.

HTML_HEAD = '''\
<!DOCTYPE html>
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
  <title>{title}</title>
  <link rel="stylesheet" href="../../css/mma.css">
  <link rel="icon" type="image/png" href="../../db/img/hardcore_mma.png">
  <script type="module" src="../../dist/{js_file}"></script>
</head>
<body>

  <div class="section">
    <a href="../../mma.html">
      <img id="logo" src="../../db/img/hardcore_mma.png">
    </a>

    <h1>Loading...</h1>
    <p class="event-date">Loading...</p>

    <img src="" alt="Event Poster" class="event-poster">
'''

RECAP_SUMMARY_SECTION = '''\
      <h2 id="summary">Summary</h2>
        [Add your event summary here]
        <br>
        <br>

'''

RECAP_FIGHT_DIV = '''\
      <div class="fight" id="{fight_id}">
        <h3>{fighter1} vs. {fighter2}</h3>
        <p class="fight-result"><strong>Result: </strong>{method} at {time}</p>
        <p class="fight-prediction"></p>
        <p>
          [Add your fight recap here]
        </p>
      </div>

'''

RECAP_BETTING = '''\
      <h2 id="betting-results">Betting Results</h2>
      <div class="betting-results">
        [Add your betting results here]
      </div>

    </div>
  </div>

</body>
</html>'''

PREVIEW_OVERVIEW_SECTION = '''\
      <li><a href="#projected-betting-returns">Projected Betting Returns</a></li>
    </ul>

    <div class="recap-content">

      <h2 id="overview">Overview</h2>
      <p>
        [Add your event overview here - describe the card, main storylines, significance]
      </p>
      <br>
'''

PREVIEW_FIGHT_DIV = '''\
      <div id="{fight_id}">
        <h3>{fighter1} vs. {fighter2}</h3>

        <div class="fight-overview">
          <p>
            [Add fight context: records, recent form, styles, what\'s at stake]
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

PREVIEW_BETTING = '''\
      <h2 id="projected-betting-returns">Projected Betting Returns</h2>
      <div class="projected-betting-returns"></div>

    </div>
  </div>

</body>
</html>'''
