# MMA Scraping

Python package for scraping UFC event data from Tapology and fightodds.io, generating HTML templates, and updating `cards.json`.

## Installation

```bash
pip install cloudscraper beautifulsoup4 requests
```

---

## Usage

All commands are run from the `mma/` directory via the single entry point:

```bash
python3 -m scraping.bin.scraping_main <--flag> [options]
```

### Research (before the event)

Scrapes every fighter's Tapology profile — record, streak, last 5 fights — and saves structured JSON notes to `notes/<card-id>.json`.

```bash
python3 -m scraping.bin.scraping_main --research https://www.tapology.com/fightcenter/events/...
```

### Preview (before the event)

Scrapes the event page, generates an HTML preview template, and adds the card to `cards.json` with an empty predictions and odds scaffold.

```bash
python3 -m scraping.bin.scraping_main --preview https://www.tapology.com/fightcenter/events/...
```

**Output:**
- `db/previews/{card-id}.html` — preview template with per-fight pick sections
- `db/cards.json` — new card entry with fight scaffold:
  ```json
  "Fighter A vs. Fighter B": {
    "prediction": {"winner": "", "method": ""},
    "result": null,
    "odds": {"DraftKings": {"Fighter A": null, "Fighter B": null}, ...}
  }
  ```

### Odds (before the event)

Fetches moneyline odds from fightodds.io and writes them into the card's `odds` fields in `cards.json`. Computes the best EV book for each predicted winner.

```bash
python3 -m scraping.bin.scraping_main --fightodds <event-pk-or-url> --card-id <card-id>
```

**Example:**
```bash
python3 -m scraping.bin.scraping_main --fightodds https://fightodds.io/mma-events/8823/ufc-326/odds --card-id ufc-326
```

### Recap (after the event)

Scrapes results from the event page, merges them with existing predictions and odds in `cards.json`, and generates an HTML recap template.

```bash
python3 -m scraping.bin.scraping_main --recap https://www.tapology.com/fightcenter/events/... --rating 7.6
```

**Output:**
- `db/recaps/{card-id}.html` — recap template pre-filled with fight results
- `db/cards.json` — updated with results, rating, and `recapUrl`:
  ```json
  "Fighter A vs. Fighter B": {
    "prediction": {"winner": "Fighter A", "method": "Decision"},
    "result": {"winner": "Fighter A", "method": "Decision, Unanimous", "time": "3 Rounds, 15:00 Total"}
  }
  ```

---

## Typical Workflow

**Before the event:**
```bash
# 1. Research fighter profiles
python3 -m scraping.bin.scraping_main --research https://www.tapology.com/fightcenter/events/...

# 2. Generate preview template
python3 -m scraping.bin.scraping_main --preview https://www.tapology.com/fightcenter/events/...

# 3. Populate odds
python3 -m scraping.bin.scraping_main --fightodds <event-pk> --card-id <card-id>

# 4. Add poster image to db/img/{card-id}_poster.jpg

# 5. Fill in predictions and write preview content
```

**After the event:**
```bash
# 1. Generate recap template
python3 -m scraping.bin.scraping_main --recap https://www.tapology.com/fightcenter/events/... --rating 7.6

# 2. Write recap content
```

---

## Package Structure

```
scraping/
  bin/
    scraping_main.py  — CLI entry point
  constants.py        — shared config, platform list, HTML templates
  tapology.py         — Tapology scraping and shared utilities
  research.py         — run() for research mode
  preview.py          — run() for preview mode
  recap.py            — run() for recap mode
  fightodds.py        — run() for odds scraping
```

---

## Card ID Convention

Card IDs are derived automatically from the event name:

| Event Name | Card ID |
|---|---|
| UFC 326 | `ufc-326` |
| UFC Fight Night: Royval vs Kape | `ufc-fight-night-royval-kape` |
| UFC Qatar: Tsarukyan vs Hooker | `ufc-qatar-tsarukyan-hooker` |

---

## cards.json Schema

```json
{
  "id": "ufc-326",
  "title": "UFC 326",
  "subtitle": "Holloway vs. Oliveira 2",
  "date": "2025-07-19",
  "rating": 7.6,
  "poster": "/mma/db/img/ufc_326_poster.jpg",
  "recapUrl": "db/recaps/ufc-326.html",
  "previewUrl": "db/previews/ufc-326.html",
  "location": "Las Vegas, Nevada, United States",
  "eventTime": "Sat. 07.19.2025",
  "fights": {
    "Fighter A vs. Fighter B": {
      "prediction": {"winner": "Fighter A", "method": "Decision"},
      "result": {"winner": "Fighter A", "method": "Decision, Unanimous", "time": "3 Rounds, 15:00 Total"},
      "odds": {
        "DraftKings": {"Fighter A": -180, "Fighter B": +150}
      },
      "bestOdds": {
        "groundTruthProb": 0.6429,
        "bestOdds": {"platform": "Pinnacle", "odds": -165},
        "bestEv": 0.0412
      }
    }
  }
}
```

---

## Supported Sportsbooks

BetOnline, Bovada, MyBookie, BetUS, Bet105, BookMaker, DraftKings, FanDuel, 4Cx, BetAnything, Circa, BetRivers, HardRocketBet, BetMGM, Caesars, Jazz, Polymarket, Pinnacle, Betway, Stake, Cloudbet, 4casters, SXBet

---

## Common Issues

**Date parsing** — If Tapology's date format can't be parsed, the event date falls back to today. Check `cards.json` and correct manually if needed.

**Fighter name matching** — Odds matching uses last-name fuzzy matching. If a fight shows `Warning: No match for '...'`, check for accented characters or name discrepancies between Tapology and fightodds.io.

**Poster files** — Add the poster image to `db/img/` using the filename printed by the script (e.g. `ufc_326_poster.jpg`).
