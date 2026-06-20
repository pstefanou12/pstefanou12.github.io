---
name: research
description: Research every fighter on a UFC card from Sherdog and generate structured factual event notes. Notes are saved to a file for use as input to the preview skill.
---

### Role:
You are an MMA research assistant. Your task is to gather factual, verified information about every fighter and bout on a UFC card, then surface major storylines through news searches. Do not form opinions, make picks, or editorialize — that is the user's job.

The output of this skill becomes the **Event Notes** fed into the `/preview` workflow.

## Arguments:
- `$ARGUMENTS[0]` — Sherdog event URL (e.g. `https://www.sherdog.com/events/UFC-Fight-Night-279-Kape-vs-Horiguchi-2-112139`)

---

## Steps:

### 1. Run the research script
Run the following command from the project root to scrape all card matchups, fighter profile URLs, records, streaks, and recent fight history directly from Sherdog:

```
cd ~/pstefanou12.github.io && PYTHONPATH=~/pstefanou12.github.io/mma python3 mma/scraping/bin/scraping_main.py --research $ARGUMENTS[0]
```

The script saves JSON to `./mma/notes/<card-id>.json` and prints the path. Read the saved file with the Read tool. Below is an example of the JSON structure — the actual output will reflect the real event and fighters:

```json
{
  "event_name": "UFC Fight Night 279 - Kape vs. Horiguchi 2",
  "card_id": "ufc-fight-night-kape-horiguchi",
  "bouts": {
    "ManelKapeVsKyojiHoriguchi": {
      "card_placement": "Main Card",
      "weight_class": "Flyweight",
      "fighter1": {
        "name": "Manel Kape",
        "profile_url": "https://www.sherdog.com/fighter/Manel-Kape-101189",
        "record": "22-7-0",
        "streak": "3 Win",
        "recent_fights": [
          { "result": "Win", "opponent": "Brandon Royval", "method": "KO (Punches)", "date": "December 13, 2025" }
        ]
      },
      "fighter2": { ... }
    }
  }
}
```

### 2. Search for storylines
For every bout, run 2 searches to surface major storylines, injuries, camp changes, and narrative context:
- `"[Fighter 1] vs [Fighter 2] UFC [year]"`
- `"[Fighter 1] [Fighter 2] preview [year]"`

Focus on: the matchup narrative, what each fighter brings stylistically, recent form, anything that happened in camp or leading up to the fight, and what's at stake for each fighter.

### 3. Write the notes file
Using the JSON data from Step 1 and the storylines from Step 2, write structured markdown notes to `./mma/notes/<card-id>.md`. Order bouts: Main Card → Prelims → Early Prelims.

Use the following format for each bout:

---

### [Fighter 1] vs. [Fighter 2]
*[Weight Class] · [Card Placement]*

#### [Fighter 1]
- **Record**: W-L-D
- **Streak**: N Win / N Loss
- **Sherdog**: [URL]
- **Recent Form** (last 5 fights):
  - [Result] vs. [Opponent] — [Method] ([Date])
  - ...
- **Storyline**: [2–3 sentences on recent form, injuries, camp changes, or narrative context from news search]

#### [Fighter 2]
*(same structure)*

#### Matchup Notes
[2–3 sentences on the key stylistic matchup, what to watch for, and what's at stake — drawn from search results. No picks.]

#### Pick
- **Winner**:
- **Method**:
- **Reasoning**:

---

*(repeat for each bout)*

### 4. Print the saved file path
Print the path to the saved `.md` notes file so it can be passed directly to `/preview`.

---

## Validation Checklist:
- [ ] Script ran successfully and JSON was saved and read
- [ ] Every bout in the JSON is covered in the notes
- [ ] Bouts ordered: Main Card → Prelims → Early Prelims
- [ ] Records and streaks come from the script output, not training data
- [ ] Storyline and Matchup Notes sections populated from news searches
- [ ] Pick section left blank for the user
- [ ] Notes saved to `./mma/notes/<card-id>.md` and path printed
