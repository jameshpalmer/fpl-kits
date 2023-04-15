import json

from models import Club
from database import session


def get_club_data(club: Club):
    club_data = {
        'club_id': club.id,
        'club_name': club.name,
        'club_fpl_name': club.fpl_name,
        'seasons': []
    }
    for club_season in club.seasons:
        season = club_season.season
        season_data = {
            'season_id': season.id,
            'season_year': season.year,
            'season_kits': []
        }
        for kit in club_season.kits:
            kit_data = {
                'kit_id': kit.id,
                'kit_type': kit.type,
                'kit_name': kit.name,
                'kit_image_url': kit.image_url
            }
            season_data['season_kits'].append(kit_data)
        club_data['seasons'].append(season_data)
    return club_data


def get_all_data():
    data = []
    for club in session.query(Club).all():
        club_data = get_club_data(club)
        data.append(club_data)
    return data


def export_data(data, paths: str | list[str]):
    if isinstance(paths, str):
        paths = [paths]
    for path in paths:
        with open(path, 'w') as file:
            json.dump(data, file, indent=4)
    


def main(paths: str | list[str] = 'data/kits.json'):
    """
    Distributes all kit data to given paths in JSON files with the following format:

    ```
    [
        {
            "id": <int>,
            "name": <str>,
            "fpl_name": <str>,
            "seasons": [
                {
                    "id": <int>,
                    "year": <str>,
                    "kits": [
                        {
                            "id": <int>,
                            "type": <str>,
                            "name": <str>,
                            "image_url": <str>
                        },
                        ...
                    ]
                },
                ...
            ]
        },
    ]
    ```
    """
    data = get_all_data()
    export_data(data, paths)
