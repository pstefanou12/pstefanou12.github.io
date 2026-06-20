"""
Utils — shared UFC event-name utilities used across scrapers and templates.
"""
import re


def generate_card_id(event_name: str) -> str:
    """
    Derive a URL-slug card ID from a UFC event name.

    Handles both Sherdog format ('UFC Fight Night 279 - Kape vs. Horiguchi 2')
    and Tapology-style format ('UFC Fight Night: Kape vs. Horiguchi').

    Examples:
        UFC Fight Night 279 - Kape vs. Horiguchi 2  -> ufc-fight-night-kape-horiguchi
        UFC 326 - Holloway vs. Oliveira 2            -> ufc-326
        UFC 326: Holloway vs. Oliveira               -> ufc-326
    """
    event_name_lower = event_name.lower()

    if 'fight night' in event_name_lower:
        for sep in (' - ', ': ', ':'):
            if sep in event_name:
                fighters_part = event_name.split(sep, 1)[1].strip()
                fighters_part = re.sub(r'\s+\d+$', '', fighters_part).strip()
                fighters = re.split(r'\s+vs\.?\s+', fighters_part, flags=re.IGNORECASE)
                if len(fighters) >= 2:
                    f1_last = fighters[0].strip().split()[-1].lower()
                    f2_last = fighters[1].strip().split()[-1].lower()
                    return f'ufc-fight-night-{f1_last}-{f2_last}'
        slug = re.sub(r'[^a-z0-9]+', '-', event_name_lower.replace('ufc fight night', '').strip()).strip('-')
        return f'ufc-fight-night-{slug}'

    ufc_number = re.search(r'\bufc\s+(\d+)\b', event_name_lower)
    if ufc_number:
        return f'ufc-{ufc_number.group(1)}'

    if ':' in event_name and 'ufc' in event_name_lower:
        fighters_part = event_name.split(':', 1)[1].strip()
        fighters = re.split(r'\s+vs\.?\s+', fighters_part, flags=re.IGNORECASE)
        if len(fighters) >= 2:
            f1_last = fighters[0].strip().split()[-1].lower()
            f2_last = fighters[1].strip().split()[-1].lower()
            location = event_name.split(':')[0].replace('UFC', '').strip().lower()
            location_slug = re.sub(r'[^a-z0-9]+', '-', location).strip('-')
            return f'ufc-{location_slug}-{f1_last}-{f2_last}'

    return re.sub(r'[^a-z0-9]+', '-', event_name_lower).strip('-')


def extract_subtitle(event_name: str) -> str | None:
    ufc_number_match = re.search(r'ufc (\d+)\s+(.*)', event_name, re.IGNORECASE)
    if ufc_number_match:
        subtitle = ufc_number_match.group(2).strip()
        # Strip Sherdog's ' - ' prefix if present
        subtitle = re.sub(r'^[\s\-]+', '', subtitle)
        return subtitle if subtitle else None
    for sep in (' - ', ': ', ':'):
        if sep in event_name:
            return event_name.split(sep, 1)[1].strip() or None
    return None


def extract_title(event_name: str) -> tuple[str, str | None]:
    title, subtitle = event_name, None
    if 'fight night' not in event_name.lower():
        title_match = re.match(r'(UFC \d+|UFC [^:\-]+)', event_name, re.IGNORECASE)
        if title_match:
            title = title_match.group(1).strip()
            subtitle = extract_subtitle(event_name)
        else:
            title = event_name
    return title, subtitle
