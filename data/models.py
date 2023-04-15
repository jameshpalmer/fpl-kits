from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship, declarative_base


Base = declarative_base()

class Club(Base):
    __tablename__ = 'club'
    id = Column(Integer, primary_key=True)
    name = Column(String)
    fpl_name = Column(String)
    seasons = relationship('ClubSeason', back_populates='club')

class Season(Base):
    __tablename__ = 'season'
    id = Column(Integer, primary_key=True)
    year = Column(String)
    clubs = relationship('ClubSeason', back_populates='season')

class ClubSeason(Base):
    __tablename__ = 'club_season'
    id = Column(Integer, primary_key=True)
    club_id = Column(Integer, ForeignKey('club.id'))
    season_id = Column(Integer, ForeignKey('season.id'))
    club = relationship('Club', back_populates='seasons')
    season = relationship('Season', back_populates='clubs')
    kits = relationship('Kit', back_populates='club_season')

class Kit(Base):
    __tablename__ = 'kit'
    id = Column(Integer, primary_key=True)
    club_season_id = Column(Integer, ForeignKey('club_season.id'))
    club_season = relationship('ClubSeason', back_populates='kits')
    kit_type = Column(String)
    kit_name = Column(String)
    kit_image_url = Column(String)
