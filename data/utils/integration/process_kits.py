"""
This script takes raw kit data from the Pulse API (via data/utils/scraping) 
and processes it into a more usable format for database insertion.

Return format:
[
    {
        "id": <int>,
        "club_id": <int>,
        "season_id": <int>,
        "kit_type": <str>,
        "kit_name": <str>,
        "kit_image_url": <str>
    },
    ...
]
"""
from logging import getLogger


def main(kits: list[dict], clubs: dict[str, str], seasons: dict[str, str]):
    log = getLogger(__name__)

    kit_data = []
    for kit in kits:
        club_id = [ref['id'] for ref in kit['references'] if ref['type'] == 'FOOTBALL_CLUB'][0]
        season_id = [ref['id'] for ref in kit['references'] if ref['type'] == 'FOOTBALL_COMPSEASON'][0]
        kit_title = kit['title'].lower()

        if 'home' in kit_title or 'hk' in kit_title:
            kit_type = 'home'
        elif 'away' in kit_title or 'ak' in kit_title:
            kit_type = 'away'
        elif 'third' in kit_title or 'tk' in kit_title:
            kit_type = 'third'
        else:
            log.warning(f'Kit {kit["id"]} has an unknown kit type: {kit_title}')
            continue

        kit_data.append({
            'id': kit['id'],
            'club_id': club_id,
            'season_id': season_id,
            'kit_type': kit_type,
            'kit_name': clubs[club_id] + ' ' + seasons[season_id] + ' ' + kit_type.title() + ' Kit',
            'kit_image_url': kit['onDemandUrl']
        })

    return kit_data
