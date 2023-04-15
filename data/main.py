from database import session
from models import Club, Season, ClubSeason, Kit
from utils.scraping import get_kits, get_clubs, get_seasons
from utils.integration import process_kits


def create_tables():
    Club.__table__.create(bind=session.bind, checkfirst=True)
    Season.__table__.create(bind=session.bind, checkfirst=True)
    ClubSeason.__table__.create(bind=session.bind, checkfirst=True)
    Kit.__table__.create(bind=session.bind, checkfirst=True)


# add data to empty database
def main():
    create_tables()
    
    clubs = get_clubs()
    seasons = get_seasons()

    for club_id, club_name in clubs.items():
        club = Club(id=club_id, name=club_name)
        session.add(club)
    
    for season_id, season_year in seasons.items():
        season = Season(id=season_id, year=season_year)
        session.add(season)

    kits = get_kits()
    
    for kit in process_kits(kits, clubs, seasons):
        club_season = session.query(ClubSeason).filter_by(club_id=kit['club_id'], season_id=kit['season_id']).first()
        if club_season is None:
            club_season = ClubSeason(club_id=kit['club_id'], season_id=kit['season_id'])
            session.add(club_season)
        
        kit = Kit(
            club_season_id=club_season.id,
            kit_type=kit['kit_type'],
            kit_name=kit['kit_name'],
            kit_image_url=kit['kit_image_url']
        )
        session.add(kit)
    
    session.commit()

    

if __name__ == "__main__":
    main()
