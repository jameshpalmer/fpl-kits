// Remove user setting
chrome.storage.local.remove("fplClassicKitsSelectedClubId");
chrome.storage.sync.remove("fplClassicKitsData");

// Set selected kit to default
chrome.storage.sync.set({ "fplClassicKitsSelectedClubId": 1 });

// check if saved settings exist, otherwise create them
chrome.storage.sync.get(["fplClassicKitsData"], function (result) {
    if (!result.fplClassicKitsData) {
        const url = chrome.runtime.getURL('data/kits.json');

        fetch(url)
            .then((response) => response.json()) //assuming file contains json
            .then((kitData) => {

                const clubs = kitData.map((club) => {
                    return club.club_fpl_name;
                }).filter((club) => club);

                const userSettings = clubs.map((club) => {
                    // Get first season and first kit type for club
                    const clubData = kitData.find((clubData) => clubData.club_fpl_name === club);
                    const seasonId = clubData.seasons[0].season_id;
                    const kitType = 'home';
                    return {
                        'clubId': clubData.club_id,
                        'seasonId': seasonId,
                        'kitType': kitType
                    }
                });
                chrome.storage.sync.set({ "fplClassicKitsData": JSON.stringify(userSettings) });
            })
            .catch((error) => console.error(error));
    }
});
