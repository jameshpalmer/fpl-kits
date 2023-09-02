import pandas as pd

from database import session
from models import Club, Season, ClubSeason, Kit
from utils.scrape import get_kits, get_clubs, get_seasons
from utils.integrate import process_kits
from utils.export import export_kits


def create_tables():
    """Create tables if they don't exist. Table content is removed if they do exist."""
    # Drop tables if they exist
    Club.__table__.drop(session.bind, checkfirst=True)
    Season.__table__.drop(session.bind, checkfirst=True)
    ClubSeason.__table__.drop(session.bind, checkfirst=True)
    Kit.__table__.drop(session.bind, checkfirst=True)

    Club.__table__.create(session.bind, checkfirst=True)
    Season.__table__.create(session.bind, checkfirst=True)
    ClubSeason.__table__.create(session.bind, checkfirst=True)
    Kit.__table__.create(session.bind, checkfirst=True)


def load_data():
    clubs = get_clubs()
    seasons = get_seasons()

    print(clubs)

    fpl_names = pd.read_csv("data/static-content/fplClubNames.csv", index_col=0)

    for club_id, club_name in clubs.items():
        try:  # FPL name is taken from fplClubNames.csv if it exists
            fpl_name = fpl_names.loc[club_id, "fpl_name"]
        except KeyError:
            fpl_name = None
        club = Club(id=club_id, name=club_name, fpl_name=fpl_name)
        session.add(club)

    for season_id, season_year in seasons.items():
        season = Season(id=season_id, year=season_year)
        session.add(season)

    kits = get_kits()

    for kit in process_kits(kits, clubs, seasons):
        club_season = (
            session.query(ClubSeason)
            .filter_by(club_id=kit["club_id"], season_id=kit["season_id"])
            .first()
        )

        if club_season is None:
            club_season = ClubSeason(club_id=kit["club_id"], season_id=kit["season_id"])
            session.add(club_season)
            session.commit()

        if (
            session.query(Kit)
            .filter_by(club_season_id=club_season.id, type=kit["kit_type"])
            .first()
            is not None
        ):
            continue

        kit = Kit(
            id=kit["id"],
            club_season_id=club_season.id,
            type=kit["kit_type"],
            name=kit["kit_name"],
            image_url=kit["kit_image_url"],
        )
        session.add(kit)
        session.commit()

    session.commit()


def main():
    """
    Create tables and load data from web.
    Export data to kits.json.
    """
    create_tables()
    load_data()

    distribute_to = [
        "data/kits.json",
        "chrome-extensions/unzipped/fpl-classic-kits/data/kits.json",
    ]
    export_kits(distribute_to)


if __name__ == "__main__":
    main()
