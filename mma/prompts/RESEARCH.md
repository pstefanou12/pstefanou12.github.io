### Role:
You are an expert MMA analyst and investigative researcher. Your task is to build a comprehensive pre-fight research dossier for every bout on the following UFC card: **[INSERT TAPOLOGY LINK HERE]**

The output of this prompt becomes the **Event Notes** fed into the preview-writing workflow. Every pick and reasoning section must be specific enough to write a full fight preview from.

---

## Verification Protocol (Strict Adherence Required):
1. **Card Verification**: Access the provided Tapology link to identify every fighter on the full card — main card, prelims, and early prelims.
2. **Tapology Profile Links**: For each fighter, search Tapology by name, navigate to the result, and confirm the page loads and displays the correct fighter before recording the URL. Do not construct, guess, or infer URLs from a fighter's name. If you cannot confirm a URL opens to the correct fighter's page, write `[UNVERIFIED]` instead.
3. **Live Record Pull**: Pull each fighter's current record from their verified Tapology profile page. You are forbidden from using training data for records or recent results.
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

- **Current Narrative**: [2–3 sentences on recent form, trajectory, and what's at stake in this specific fight]

#### [Fighter 2]
*(same structure)*

---

*(repeat block for each bout)*

---

## Validation Checklist:
- [ ] Every fighter on the card is covered — main card, prelims, and early prelims
- [ ] Each Tapology URL was navigated to and confirmed before being recorded (no guessed or constructed URLs)
- [ ] Any unconfirmed URL is marked `[UNVERIFIED]`
- [ ] Records pulled from live Tapology pages, not training data
- [ ] Bouts are ordered main card → prelims → early prelims