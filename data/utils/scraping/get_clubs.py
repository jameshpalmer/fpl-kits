"""
To obtain team data, e.g. team name & ids used across the PL site,\
we use the club selection dropdown on the PL site. 
"""
from bs4 import BeautifulSoup

def main():
    """
    Get club data from club dropdown on PL site.
    """
    with open("data/static_content/clubDropdown.html") as f:
        soup = BeautifulSoup(f, "html.parser")

    options = soup.find_all("li")

    # Create dict of club id: club name
    club_data = {}
    for option in options:
        club_id = int(option["data-option-id"])
        club_name = option["data-option-name"]
        club_data[club_id] = club_name

    return club_data