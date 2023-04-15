"""
To obtain team data, e.g. team name & ids used across the PL site,\
we use the season selection dropdown on the PL site. 
"""
from bs4 import BeautifulSoup

def main():
    """
    Get season data from season dropdown on PL site.
    """
    with open("data/static_content/seasonDropdown.html") as f:
        soup = BeautifulSoup(f, "html.parser")

    options = soup.find_all("li")

    # Create dict of season id: season name
    season_data = {}
    for option in options:
        season_id = int(option["data-option-id"])
        season_name = option["data-option-name"]
        season_data[season_id] = season_name

    return season_data