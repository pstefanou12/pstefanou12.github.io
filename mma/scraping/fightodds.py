"""
Fightodds — fetches moneyline odds from fightodds.io and writes them to cards.json.

Queries the fightodds.io GraphQL API for all sportsbook odds for a given event,
matches fights to existing card entries by fighter last name, and computes the
best EV book for each predicted winner.

Public API:
    run(args)  — args.event (event PK or URL), args.card_id
"""
import json
import re
import unicodedata
import requests

from scraping import constants


def _american_to_profit(odds):
    return odds / 100 if odds > 0 else 100 / abs(odds)


def _implied_probability(odds):
    if odds > 0:
        return 100 / (odds + 100)
    return abs(odds) / (abs(odds) + 100)


def _normalize(s):
    return unicodedata.normalize('NFKD', s).encode('ascii', 'ignore').decode('ascii')


def _last_name(name):
    return _normalize(name.strip().split()[-1].lower())


def _names_match(tap_name, fo_name):
    t, f = _last_name(tap_name), _last_name(fo_name)
    return t in f or f in t


def compute_best_odds(fights, ground_truth_book=constants.GROUND_TRUTH_BOOK):
    """Compute and store groundTruthProb + best EV book for each fight with a prediction."""
    for matchup, entry in fights.items():
        odds_data = entry.get("odds", {})
        pick = (entry.get("prediction") or {}).get("winner")

        if not pick or not odds_data:
            entry["bestOdds"] = None
            continue

        gt_lines = odds_data.get(ground_truth_book, {})
        pick_lower = pick.lower()
        p_true = None
        for fighter, odds in gt_lines.items():
            if fighter.lower() == pick_lower and odds is not None:
                p_true = _implied_probability(odds)
                break

        if p_true is None:
            entry["bestOdds"] = None
            continue

        best_platform, best_ev, best_odds = None, None, None
        for platform, lines in odds_data.items():
            for fighter, odds in lines.items():
                if fighter.lower() == pick_lower and odds is not None:
                    ev = p_true * _american_to_profit(odds) - (1 - p_true) * 1
                    if best_ev is None or ev > best_ev:
                        best_ev = ev
                        best_platform = platform
                        best_odds = odds

        entry["bestOdds"] = {
            "groundTruthProb": round(p_true, 4),
            "bestOdds": {"platform": best_platform, "odds": best_odds},
            "bestEv": round(best_ev, 4) if best_ev is not None else None,
        }


def scrape_fightodds(event_pk):
    """Fetch odds from fightodds.io GraphQL API for the given event PK."""
    query = """
    query EventOddsQuery($eventPk: Int!) {
      eventOfferTable(pk: $eventPk) {
        fightOffers {
          edges {
            node {
              fighter1 { firstName lastName }
              fighter2 { firstName lastName }
              straightOffers {
                edges {
                  node {
                    sportsbook { shortName }
                    outcome1 { odds }
                    outcome2 { odds }
                  }
                }
              }
            }
          }
        }
      }
    }
    """
    payload = {
        "operationName": "EventOddsQuery",
        "query": query,
        "variables": {"eventPk": int(event_pk)},
    }
    resp = requests.post(
        constants.FIGHTODDS_GQL,
        json=payload,
        headers={"Content-Type": "application/json"},
        timeout=60,
    )
    resp.raise_for_status()
    edges = (
        resp.json()
        .get("data", {})
        .get("eventOfferTable", {})
        .get("fightOffers", {})
        .get("edges", [])
    )

    result = []
    for edge in edges:
        node = edge.get("node", {})
        f1_data = node.get("fighter1", {})
        f2_data = node.get("fighter2", {})
        if not f1_data or not f2_data:
            continue
        fo_f1 = f"{f1_data['firstName']} {f1_data['lastName']}"
        fo_f2 = f"{f2_data['firstName']} {f2_data['lastName']}"
        books = {}
        for offer_edge in node.get("straightOffers", {}).get("edges", []):
            offer = offer_edge.get("node", {})
            short = (offer.get("sportsbook") or {}).get("shortName")
            if not short:
                continue
            o1 = (offer.get("outcome1") or {}).get("odds")
            o2 = (offer.get("outcome2") or {}).get("odds")
            if o1 is not None or o2 is not None:
                books[short] = {fo_f1: o1, fo_f2: o2}
        if books:
            result.append({"f1": fo_f1, "f2": fo_f2, "books": books})
    return result


def update_odds_in_json(card_id, fightodds_fights, json_path=constants.JSON_PATH):
    """Match fightodds fights to card fights by last name and write odds into cards.json."""
    with open(json_path, "r", encoding="utf-8") as f:
        data = json.load(f)

    card = next((c for c in data["cards"] if c["id"] == card_id), None)
    if not card:
        print(f"Error: Card '{card_id}' not found in {json_path}")
        return

    fights = card.get("fights", {})
    matched = 0

    for fo_fight in fightodds_fights:
        fo_f1, fo_f2 = fo_fight["f1"], fo_fight["f2"]

        matched_key = None
        for matchup in fights:
            tap_f1, tap_f2 = matchup.split(" vs. ", 1)
            if (_names_match(tap_f1, fo_f1) and _names_match(tap_f2, fo_f2)) or \
               (_names_match(tap_f1, fo_f2) and _names_match(tap_f2, fo_f1)):
                matched_key = matchup
                break

        if not matched_key:
            print(f"  Warning: No match for '{fo_f1} vs {fo_f2}'")
            continue

        tap_f1, tap_f2 = matched_key.split(" vs. ", 1)
        fo_to_tap = {fo_f1: tap_f1, fo_f2: tap_f2} if _names_match(tap_f1, fo_f1) \
                    else {fo_f1: tap_f2, fo_f2: tap_f1}

        odds = {}
        for book_name, book_odds in fo_fight["books"].items():
            odds[book_name] = {
                fo_to_tap[fo_f1]: book_odds.get(fo_f1),
                fo_to_tap[fo_f2]: book_odds.get(fo_f2),
            }
        fights[matched_key]["odds"] = odds
        matched += 1
        print(f"  {matched_key} — {len(odds)} books")

    compute_best_odds(fights)

    with open(json_path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

    print(f"\nOdds written for {matched}/{len(fightodds_fights)} fights in '{card_id}'")


def run(args):
    """Execute fightodds scraping based on parsed CLI args."""
    pk_match = re.search(r"(\d+)", args.event)
    if not pk_match:
        print("Error: Could not parse event PK from argument")
        return
    event_pk = pk_match.group(1)

    print(f"Scraping odds for event PK {event_pk}...")
    fightodds_fights = scrape_fightodds(event_pk)
    print(f"Found {len(fightodds_fights)} fights with odds\n")

    update_odds_in_json(args.card_id, fightodds_fights)
