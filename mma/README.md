# UFC Event Generator Script

Python script to automatically generate UFC event preview and recap templates from Tapology event pages.

## Features

- Scrapes fight card data from Tapology
- Generates HTML templates for previews and recaps
- Automatically updates `ufc_cards.json` with event metadata
- Creates consistent file naming and structure

## Installation

```bash
pip install requests beautifulsoup4
```

## Usage

### 1. Generate Preview (Before Event)

Creates a preview template with fight picks sections:

```bash
python generate_recap.py "https://www.tapology.com/fightcenter/events/..." --mode preview
```

**Output:**
- `previews/{card-id}.html` - Preview template with pick sections for each fight
- Updates `ufc_cards.json` with preview URL
- Shows expected poster filename

### 2. Generate Recap (After Event)

Creates a recap template and adds rating to JSON:

```bash
python generate_recap.py "https://www.tapology.com/fightcenter/events/..." --mode recap --rating 7.6
```

**Output:**
- `recaps/{card-id}.html` - Recap template with fight sections
- Updates `ufc_cards.json` with rating and full metadata

### 3. Generate Both (Preview + Recap)

If you want to create both at once (rare use case):

```bash
python generate_recap.py "https://www.tapology.com/fightcenter/events/..." --rating 7.6
```

## File Naming Convention

The script automatically generates card IDs:

| Event Name | Card ID |
|------------|---------|
| UFC 326 | `ufc-326` |
| UFC Fight Night: Royval vs Kape | `ufc-fight-night-royval-kape` |
| UFC Qatar: Tsarukyan vs Hooker | `ufc-qatar-tsarukyan-hooker` |

## Workflow Example

**Week before UFC 326:**
```bash
# 1. Generate preview template
python generate_recap.py "https://www.tapology.com/..." --mode preview

# 2. Add poster to ./mma/img/ufc_326_poster.jpg

# 3. Fill in preview template with:
#    - Event overview
#    - Major storylines
#    - Fight analysis and picks
```

**After UFC 326:**
```bash
# 1. Generate recap template with rating
python generate_recap.py "https://www.tapology.com/..." --mode recap --rating 7.6

# 2. Fill in recap template with:
#    - Event summary
#    - Fight-by-fight analysis
```

## Generated Files

### Preview Template
- Header loads dynamically from JSON (via `preview.js`)
- Table of contents with fight picks
- Overview and storyline sections
- Fight pick sections with:
  - Fight context
  - Your prediction
  - Method (Decision/KO/Submission)
  - Reasoning

### Recap Template
- Header loads dynamically from JSON (via `recap.js`)
- Table of contents with all fights
- Summary section
- Fight sections grouped by card placement (Main Card, Prelims, etc.)

## JSON Metadata

The script updates `./mma/js/ufc_cards.json` with:

```json
{
  "id": "ufc-326",
  "title": "UFC 326",
  "subtitle": "Jones vs. Aspinall",
  "date": "2026-03-15",
  "rating": 7.6,
  "poster": "../img/ufc_326_poster.jpg",
  "recapUrl": "recaps/ufc-326.html",
  "previewUrl": "previews/ufc-326.html",
  "location": "Las Vegas, Nevada, United States",
  "eventTime": "Sat. 03.15.2026"
}
```

## Common Issues

### Date Parsing Error
If the script can't parse the date from Tapology, it falls back to the current date. Check the generated JSON and update manually if needed.

### Fighter Name Extraction
For Fight Night events, the script extracts last names from the event title. If the naming is unusual, the card ID might need manual adjustment.

### Poster Files
Remember to add the poster image to `./mma/img/` with the exact filename shown in the script output (e.g., `ufc_326_poster.jpg`).

## Tips

- Always run preview mode first to set up the event structure
- Use consistent rating scale (0.0-10.0)
- The script preserves existing data when updating JSON
- Files are sorted by date automatically in JSON