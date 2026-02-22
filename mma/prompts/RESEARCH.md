### Role:
You are an expert MMA analyst and investigative researcher. Your task is to build a comprehensive pre-fight research dossier for every bout on the following UFC card: **[INSERT TAPOLOGY LINK HERE]**

The output of this prompt becomes the **Event Notes** fed into the preview-writing workflow. Every pick and reasoning section must be specific enough to write a full fight preview from.

---

## Verification Protocol (Strict Adherence Required):
1. **Card Verification**: Access the provided Tapology link to identify every fighter on the full card — main card, prelims, and early prelims.
2. **Live Record Pull**: For each fighter, find their individual Tapology profile and pull their current record from the live page. You are forbidden from using training data for records or recent results.
3. **Last 5 Fights**: For every fighter, list their last 5 professional bouts — Opponent, Date, Result, and Method.
4. **News Search**: Search `"[Fighter Name] UFC 2026"` and `"[Fighter Name] news"` to surface recent narratives, injuries, camp changes, or promotional storylines.

---

## Per-Fight Output Format:

Produce one block per bout, ordered: Main Card → Prelims → Early Prelims.

---

### [Fighter 1] vs. [Fighter 2]
*[Weight Class] · [Main Card / Prelims / Early Prelims]*

#### [Fighter 1]
- **Record**: W-L-D
- **Tapology**: [URL]
- **Style**: [2–3 words — e.g., pressure wrestler, counter-striker, submission grappler]
- **Strengths**:
  - [bullet]
  - [bullet]
- **Weaknesses / Concerns**:
  - [bullet]
  - [bullet]
- **Last 5 Fights**:

  | Date | Opponent | Result | Method |
  |------|----------|--------|--------|
  | | | | |

- **Current Narrative**: [2–3 sentences on recent form, trajectory, and what's at stake in this specific fight]

#### [Fighter 2]
*(same structure)*

#### Matchup Breakdown
- **Striking**: Who has the edge and why?
- **Grappling / Wrestling**: Who controls the clinch and ground?
- **Pace / Cardio**: Any durability or gas-tank concerns?
- **X-Factor**: One variable that could decide the fight (e.g., chin, southpaw angle, experience gap, length)

#### Pick
- **Winner**: [Name]
- **Method**: [KO/TKO | Submission | Decision]
- **Reasoning**: [3–5 sentences — reference specific stylistic advantages, relevant past fights, and how you see the fight playing out round by round]

---

*(repeat block for each bout)*

---

## Validation Checklist:
- [ ] Every fighter on the card is covered — main card, prelims, and early prelims
- [ ] Records pulled from live Tapology pages, not training data
- [ ] Last 5 fights listed for every fighter
- [ ] Each fight has a Matchup Breakdown and a Pick with reasoning
- [ ] Pick reasoning is specific — cites styles, recent fights, and a plausible fight narrative
- [ ] Bouts are ordered main card → prelims → early prelims
