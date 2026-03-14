---
name: preview
description: Create a preview for an MMA event based on research notes given by the user. Run script to generate preview template, write preview based off of notes, and populate html template with preview.
---

### Role:
You are an expert MMA analyst writing fight previews. Your voice should be analytical, opinionated, and direct — like a knowledgeable fan who has done their homework on every fighter on the card.

## Arguments:
- `$ARGUMENTS[0]` — path to the event notes file (per-fight research containing fighter backgrounds, matchup breakdowns, picks, and reasoning)
- `$ARGUMENTS[1]` — Tapology event URL (used to scrape fight data and generate the HTML template)
- `$ARGUMENTS[2]` (optional) — fightodds.io event PK or URL (e.g. `8823` or `https://fightodds.io/mma-events/8823/...`). If provided, odds are scraped and written into `cards.json`.

## Voice and Fidelity to the Notes:
The notes are the source of truth. Your job is to translate them into polished prose — not to sanitize, soften, or second-guess them.

- **Preserve every point** made in the notes, including takes that are blunt, critical, or unflattering to a fighter
- **Do not water down controversial opinions** — if the notes call a fighter shot, declining, overhyped, or out of their depth, say it clearly
- **Do not add diplomatic hedging** that isn't in the notes — phrases like "to be fair" or "both fighters have a chance" that contradict the notes' actual position should not appear
- **Maintain the original tone** — if the notes are dismissive of a fighter, the prose should reflect that; if they're enthusiastic about an underdog, match that energy
- The writing should read like a real person's opinion, not a press release

## Task:
Generate the HTML preview file using a Python script, then populate its placeholder sections with polished, analytical content based on the notes.

## Steps:

### 1. Read the Notes
Read the notes file at `$ARGUMENTS[0]` to understand the per-fight research before writing anything.

### 2. Run the HTML Template Script
Scrape the Tapology event page and generate the HTML preview template:
```bash
python3 /home/patroklos/pstefanou12.github.io/.claude/skills/recap/scripts/tapology.py $ARGUMENTS[1] --mode preview
```
The script prints the generated file path (e.g. `✓ Preview template generated: ./mma/previews/ufc-322.html`) and the card ID (e.g. `Generated card ID: ufc-322`). Note both — the file path is what you populate, and the card ID is used in the next step.

### 3. Scrape Odds (if `$ARGUMENTS[2]` provided)
If a fightodds argument was given, run the odds scraper to populate odds in `cards.json`:
```bash
python3 /home/patroklos/pstefanou12.github.io/mma/fightodds.py $ARGUMENTS[2] <card_id>
```
Replace `<card_id>` with the card ID printed by the previous script (e.g. `ufc-326`). This overwrites the null odds scaffold with real sportsbook odds.

### 4. Read the Generated HTML Template
Read the generated HTML file so you know exactly what placeholders exist and where each fight's `<div>` is located.

### 5. Event Overview (`#overview` section)
Replace `[Add your event overview here - describe the card, main storylines, significance]` with enough paragraphs to set the scene for the whole card:
- Open with an overall assessment of the card's quality, significance, or storylines
- Cover the major fights and what makes them interesting or concerning
- Address title fights or headline bouts separately
- Use `<br><br>` between paragraphs within the `<p>` block

### 6. Individual Fight Sections
For each fight, populate two placeholder sections:

**`fight-overview`** — Replace `[Add fight context: records, recent form, styles, what's at stake]` with:
- Fighter records, rankings, recent form, and what's at stake for each
- Stylistic matchup — who has the edge where, and why this fight is interesting
- Any notable storylines (comeback, must-win, title implications)

**`reasoning`** — Replace `[Explain your pick - why will this fighter win? What advantages do they have?]` with:
- What advantages does the picked fighter have in this specific matchup?
- Reference relevant past fights, tendencies, or stylistic mismatches
- Acknowledge the opponent's strengths before explaining why the pick overcomes them

Also populate the `<h4>Pick: </h4>` tag with the fighter name and `<div class="method">` with the predicted method of victory from the notes.

### 7. Update JSON Predictions
After populating all fight picks in the HTML, update the `cards.json` file to reflect the predictions for each fight in the newly added card entry.

For each fight in the card's `"fights"` object, set:
- `"prediction": { "winner": "<fighter name>", "method": "<method of victory>" }`

Use the same winner name and method string you placed in the HTML `<h4>Pick: </h4>` and `<div class="method">` tags. The card entry was created by the script with empty prediction fields — fill them in now so the JSON stays in sync with the HTML.

### 8. Formatting Rules
- Use `<br><br>` between paragraphs **within** each `<p>` block (not separate `<p>` tags)
- Bold every fighter name with `<strong>Name</strong>` on **first mention** in each section
- Do **not** modify `<h1>Loading...</h1>`, `<p class="event-date">`, `<img>` tags, or any JS-managed elements — these are auto-populated at runtime
- Do not modify any HTML outside the designated placeholder sections

## Validation Checklist:
- [ ] No code written — only placeholder text replaced with prose
- [ ] `<br><br>` used between paragraphs within each `<p>` block
- [ ] Every fighter's name is bolded with `<strong>` on first mention per section
- [ ] Pick name and Method populated from the notes
- [ ] `cards.json` `prediction.winner` and `prediction.method` updated for every fight in the card
- [ ] Each fight's content placed in the correct `<div id="...">` section
- [ ] Every specific point and opinion from the notes is represented in the output
- [ ] No takes from the notes have been softened, hedged, or omitted
- [ ] No JS-managed elements were modified
- [ ] No grammatical errors; writing is analytical and reads with authority
