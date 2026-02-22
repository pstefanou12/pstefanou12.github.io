# UFC Event Scripts

Two Python scripts for generating UFC event templates and LLM-ready recap/preview prompts.

## Installation

```bash
pip install requests beautifulsoup4
```

---

## `tapology.py` — Template & Metadata Generator

Scrapes Tapology event pages to generate HTML templates and update `ufc_cards.json`.

### Usage

#### Preview mode (before event)

```bash
python mma/tapology.py "https://www.tapology.com/fightcenter/events/..." --mode preview
```

**Output:**
- `mma/previews/{card-id}.html` — Preview template with per-fight pick sections
- Updates `ufc_cards.json` with event metadata and a `fights` scaffold:
  ```json
  "fights": {
    "Fighter A vs. Fighter B": {
      "prediction": {"winner": "", "method": ""},
      "result": null
    }
  }
  ```

#### Recap mode (after event)

```bash
python mma/tapology.py "https://www.tapology.com/fightcenter/events/..." --mode recap --rating 7.6
```

**Output:**
- `mma/recaps/{card-id}.html` — Recap template with fight sections pre-filled with result data
- Updates `ufc_cards.json`: merges scraped results into the existing `fights` entries and sets the rating:
  ```json
  "fights": {
    "Fighter A vs. Fighter B": {
      "prediction": {"winner": "Fighter A", "method": "Decision"},
      "result": {"winner": "Fighter A", "method": "Decision, Unanimous", "time": "3 Rounds, 15:00 Total"}
    }
  }
  ```

#### Both modes

```bash
python mma/tapology.py "https://www.tapology.com/fightcenter/events/..." --rating 7.6
```

### File Naming Convention

Card IDs are generated automatically:

| Event Name | Card ID |
|---|---|
| UFC 326 | `ufc-326` |
| UFC Fight Night: Royval vs Kape | `ufc-fight-night-royval-kape` |
| UFC Qatar: Tsarukyan vs Hooker | `ufc-qatar-tsarukyan-hooker` |

### JSON Schema

`ufc_cards.json` entries follow this structure:

```json
{
  "id": "ufc-326",
  "title": "UFC 326",
  "subtitle": "Jones vs. Aspinall",
  "date": "2026-03-15",
  "rating": 7.6,
  "poster": "/mma/img/ufc_326_poster.jpg",
  "recapUrl": "recaps/ufc-326.html",
  "previewUrl": "previews/ufc-326.html",
  "location": "Las Vegas, Nevada, United States",
  "eventTime": "Sat. 03.15.2026",
  "fights": {
    "Fighter A vs. Fighter B": {
      "prediction": {"winner": "Fighter A", "method": "Decision"},
      "result": {"winner": "Fighter A", "method": "Decision, Unanimous", "time": "3 Rounds, 15:00 Total"}
    }
  }
}
```

### Typical Workflow

**Before the event:**
```bash
# 1. Generate preview template and fights scaffold
python mma/tapology.py "https://www.tapology.com/..." --mode preview

# 2. Add poster to mma/img/{card-id}_poster.jpg

# 3. Fill in prediction winner/method in ufc_cards.json for each fight

# 4. Generate the recap prompt and write preview content (see generate_prompt.py below)
```

**After the event:**
```bash
# 1. Generate recap template (populates results from Tapology, preserves predictions)
python mma/tapology.py "https://www.tapology.com/..." --mode recap --rating 7.6

# 2. Generate the recap prompt and write recap content (see generate_prompt.py below)
```

---

## `generate_prompt.py` — LLM Prompt Assembler

Combines a prompt template, your event notes, and the HTML template into a single file ready to paste into any model.

### Usage

```bash
python mma/generate_prompt.py <mode> <card-id> <notes.txt>
```

- `mode` — `recap` or `preview`
- `card-id` — must exist in `ufc_cards.json` (validated at runtime)
- `notes.txt` — path to your handwritten event notes

**Example:**
```bash
python mma/generate_prompt.py recap ufc-fight-night-strickland-hernandez ~/Downloads/"UFC Fight Night Strickland vs Hernandez.txt"
```

**Output:**
- `mma/prompts/generated_prompts/{card-id}-{mode}.md` — assembled prompt (gitignored)

The generated file contains:
1. The prompt template (`mma/prompts/RECAP.md` or `mma/prompts/PREVIEW.md`)
2. Your event notes under `## Event Notes`
3. The HTML template under `## HTML Template`

Paste the contents into any model to produce a fully written recap or preview.

### Prompt Templates

| File | Purpose |
|---|---|
| `mma/prompts/RECAP.md` | Role, task, and formatting rules for recap writing |
| `mma/prompts/PREVIEW.md` | Role, task, and formatting rules for preview writing |

---

## `fetch_odds.py` — Betting Odds Populator

Populates `ufc_cards.json` with the best available odds for each predicted winner.
For each fight, it stores the platform with the highest payout for your pick under `fights[matchup].odds`.

These odds are then rendered automatically on preview pages (projected returns) and recap pages (actual P&L).

### Usage

#### Interactive mode

```bash
python mma/fetch_odds.py ufc-325 --interactive
```

Walks through each fight and prompts for the platform name and American odds.

#### Odds file mode

```bash
python mma/fetch_odds.py ufc-325 --odds-file ~/odds.json
```

**Odds file format:**
```json
{
  "Fighter A vs. Fighter B": {
    "BetOnline":  {"Fighter A": -175, "Fighter B": 145},
    "DraftKings": {"Fighter A": -180, "Fighter B": 150}
  }
}
```

The script picks the platform with the best (highest) payout for the predicted winner.

#### URL scraping (best-effort)

```bash
python mma/fetch_odds.py ufc-325 --url https://fightodds.io/odds/...
```

Attempts to scrape odds from the given URL with `requests` + `beautifulsoup4`. Many sportsbook sites require JavaScript rendering and will return a 403 or empty page — use `--odds-file` or `--interactive` as a fallback.

### Odds schema (written to `ufc_cards.json`)

```json
"odds": {
  "winner": "Fighter A",
  "platform": "BetOnline",
  "american": -175,
  "profit_per_dollar": 0.5714,
  "return_pct": 57.1
}
```

### American odds reference

| Odds | Profit per $1 |
|------|--------------|
| -200 | $0.50 |
| -150 | $0.67 |
| -110 | $0.91 |
| +100 | $1.00 |
| +150 | $1.50 |
| +200 | $2.00 |

---

## Common Issues

**Date parsing** — If Tapology's date format can't be parsed, the script falls back to the current date. Check the JSON and correct manually if needed.

**Card ID mismatch** — `generate_prompt.py` will error and list all valid IDs if the provided card ID isn't found in `ufc_cards.json`.

**Poster files** — Add the poster image to `mma/img/` using the exact filename shown in the script output (e.g., `ufc_326_poster.jpg`).
