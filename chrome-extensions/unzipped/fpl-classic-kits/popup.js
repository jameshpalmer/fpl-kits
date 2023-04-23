const popup = {
    kitData: null,
    userSettings: null,
    clubs: null,
    selectedClubId: null,
    selectedSeasonId: null,
    selectedKitType: null,
    init: function () {
        const url = chrome.runtime.getURL('data/kits.json');
        fetch(url)
            .then((response) => response.json()) //assuming file contains json
            .then((json) => {
                popup.kitData = json;

                chrome.storage.local.get(["fplClassicKitsSelectedClubId"], function (result) {
                    if (result.fplClassicKitsSelectedClubId) {
                        popup.selectedClubId = result.fplClassicKitsSelectedClubId;
                    } else {
                        popup.selectedClubId = popup.kitData[0].club_id;
                    }

                    // User settings at chrome.storage.sync.get(["fplClassicKitsData"]); Must be fetched as promise
                    chrome.storage.sync.get(["fplClassicKitsData"], function (result) {
                        popup.userSettings = JSON.parse(result.fplClassicKitsData);
                        popup.selectedSeasonId = popup.userSettings.find((setting) => setting.clubId === popup.selectedClubId).seasonId;
                        popup.selectedKitType = popup.userSettings.find((setting) => setting.clubId === popup.selectedClubId).kitType;
                        popup.clubs = popup.kitData.map((club) => club).filter((club) => club.club_fpl_name);

                        popup.updatePreview();
                    });
                });
            })
            .catch((error) => console.error(error));

        // Add event listener on previous and next buttons
        document.getElementById('prev').addEventListener('click', popup.goToPreviousClub);
        document.getElementById('next').addEventListener('click', popup.goToNextClub);

        // Add event listener on season dropdown
        document.getElementById('season-select').addEventListener('change', popup.onSeasonDropdownChange);

        // Add event listener on kit-type dropdown
        document.getElementById('kit-type-select').addEventListener('change', popup.onKitTypeDropdownChange);

        // Add event listener on reset button
        document.getElementById('reset-all').addEventListener('click', popup.resetPrefs);
    },
    setKit: function (clubId, seasonId, kitType) {
        console.log('setKit', clubId, seasonId, kitType);
        const userSetting = popup.userSettings.find((setting) => setting.clubId === clubId);
        userSetting.seasonId = seasonId;
        userSetting.kitType = kitType;
        chrome.storage.sync.set({ "fplClassicKitsData": JSON.stringify(popup.userSettings) });
    },
    selectClub: function (clubId) {
        this.selectedClubId = clubId;
        chrome.storage.local.set({ "fplClassicKitsSelectedClubId": clubId });
        this.selectedSeasonId = popup.userSettings.find((setting) => setting.clubId === clubId).seasonId;
        this.selectedKitType = popup.userSettings.find((setting) => setting.clubId === clubId).kitType;
        this.updatePreview();
    },
    onSeasonDropdownChange: function () {
        const seasonDropdown = document.getElementById('season-select');
        popup.selectSeason(seasonDropdown.value);
    },
    selectSeason: function (seasonId) {
        popup.selectedSeasonId = parseInt(seasonId);
        popup.renderKitTypeDropdown(true);
        popup.renderKitImage();
    },
    onKitTypeDropdownChange: function () {
        const kitTypeDropdown = document.getElementById('kit-type-select');
        popup.selectKitType(kitTypeDropdown.value);
    },
    selectKitType: function (kitType) {
        this.selectedKitType = kitType;
        this.setKit(this.selectedClubId, this.selectedSeasonId, this.selectedKitType);
        this.renderKitImage();
    },
    renderTeamName: function () {
        const teamNameElement = document.getElementById('team-name');
        teamNameElement.innerHTML = popup.kitData.find((club) => club.club_id === this.selectedClubId).club_fpl_name;
    },
    renderSeasonDropdown: function () {
        // Update season dropdown to contain seasons for selected team
        const seasonDropdown = document.getElementById('season-select');
        seasonDropdown.innerHTML = '';
        const seasons = popup.kitData.find((club) => club.club_id === this.selectedClubId).seasons;
        seasons.forEach((season) => {
            const option = document.createElement('option');
            option.value = season.season_id;
            option.text = season.season_year;
            seasonDropdown.appendChild(option);
        });

        seasonDropdown.value = popup.selectedSeasonId;
    },
    renderKitTypeDropdown: function (setHomeKit) {
        if (setHomeKit) {
            popup.selectedKitType = 'home';
        }
        const kitTypeDropdown = document.getElementById('kit-type-select');
        kitTypeDropdown.innerHTML = '';
        const kitTypes = popup.kitData.find((club) => club.club_id === this.selectedClubId).seasons.find((season) => season.season_id === this.selectedSeasonId).season_kits;
        kitTypes.forEach((kitType) => {
            const option = document.createElement('option');
            option.value = kitType.kit_type;
            option.text = capitalizeFirstLetter(kitType.kit_type);
            kitTypeDropdown.appendChild(option);
        });

        kitTypeDropdown.value = popup.selectedKitType;

        this.setKit(this.selectedClubId, this.selectedSeasonId, this.selectedKitType);
    },
    renderKitImage: function () {
        const previewImage = document.getElementById('club-image');
        previewImage.src = popup.kitData.find((club) => club.club_id === this.selectedClubId).seasons.find((season) => season.season_id === this.selectedSeasonId).season_kits.find((kit) => kit.kit_type === this.selectedKitType).kit_image_url + '?width=300';
    },
    updatePreview: function () {
        this.renderTeamName();
        this.renderSeasonDropdown();
        this.renderKitTypeDropdown();
        this.renderKitImage();
    },
    goToNextClub: function () {
        const currentClubIndex = popup.clubs.findIndex((club) => club.club_id === popup.selectedClubId);
        const nextClubIndex = currentClubIndex + 1;
        if (nextClubIndex < popup.clubs.length) {
            popup.selectClub(popup.clubs[nextClubIndex].club_id);
        } else {
            popup.selectClub(popup.clubs[0].club_id);
        }
    },
    goToPreviousClub: function () {
        const currentClubIndex = popup.clubs.findIndex((club) => club.club_id === popup.selectedClubId);
        const previousClubIndex = currentClubIndex - 1;
        if (previousClubIndex >= 0) {
            popup.selectClub(popup.clubs[previousClubIndex].club_id);
        } else {
            popup.selectClub(popup.clubs[popup.clubs.length - 1].club_id);
        }
    },
    resetPrefs: function () {
        prefs = popup.clubs.map((club) => {
            const clubData = popup.kitData.find((clubData) => clubData.club_id === club.club_id);
            const seasonId = clubData.seasons[0].season_id;
            const kitType = 'home';
            return {
                'clubId': clubData.club_id,
                'seasonId': seasonId,
                'kitType': kitType
            }
        });
        chrome.storage.sync.set({ "fplClassicKitsData": JSON.stringify(prefs) });
        popup.userSettings = prefs;
        popup.selectClub(popup.selectedClubId);
    }
}

popup.init();

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}