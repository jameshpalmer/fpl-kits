const url = chrome.runtime.getURL('data/kits.json');
// Get prefs, and save to variable
const getPrefs = () => {
    return new Promise((resolve, reject) => {
        chrome.storage.sync.get(["fplClassicKitsData"], function (result) {
            if (chrome.runtime.lastError) {
                reject(chrome.runtime.lastError);
            } else {
                resolve(result.fplClassicKitsData);
            }
        });
    });
};



fetch(url)
    .then((response) => response.json()) //assuming file contains json
    .then((json) => {
        document.kits = json;
    })
    .catch((error) => console.error(error));

getPrefs().then((prefs) => {
    document.fplClassicKitsUserSettings = JSON.parse(prefs);
    // Wait for the DOM to finish loading
    document.addEventListener('DOMContentLoaded', function () {
        // Wait for prefs to be fetched
        const targetNode = document.body;

        const observer = new MutationObserver(function (mutationsList) {
            for (let mutation of mutationsList) {
                if (mutation.type === 'childList') {
                    for (let node of mutation.addedNodes) {
                        if (node.nodeName === 'IMG' && node.classList.contains('Shirt__StyledShirt-k5q8zl-0')) {
                            parent = node.parentNode;
                            updatePictureElement(parent);
                        }
                        else if (node.getElementsByTagName) {
                            // Check if the added node has any img descendants
                            const addedImgs = node.getElementsByTagName('img');
                            for (let img of addedImgs) {
                                if (img.classList.contains('Shirt__StyledShirt-k5q8zl-0')) {
                                    parent = img.parentNode;
                                    updatePictureElement(parent);
                                }
                            }
                        }
                    }
                } else if (mutation.type === 'attributes') { // For substitutions without formation change
                    if (mutation.target.nodeName === 'IMG' && mutation.target.classList.contains('Shirt__StyledShirt-k5q8zl-0') && mutation.attributeName === 'alt') {
                        parent = mutation.target.parentNode;
                        updatePictureElement(parent);
                    }
                }
            }
        });

        const config = { childList: true, subtree: true, attributes: true };

        observer.observe(targetNode, config);


    });
});

// Listen for changes in user settings
chrome.storage.onChanged.addListener(function (changes, namespace) {
    for (var key in changes) {
        if (key === 'fplClassicKitsData') {
            document.fplClassicKitsUserSettings = JSON.parse(changes[key].newValue);
            updateAllKits();
        }
    }
});


function getImageUrl(clubId, seasonId, kitType) {
    for (let i = 0; i < document.kits.length; i++) {
        if (document.kits[i].club_id === clubId) {
            for (let j = 0; j < document.kits[i].seasons.length; j++) {
                if (document.kits[i].seasons[j].season_id === seasonId) {
                    for (let k = 0; k < document.kits[i].seasons[j].season_kits.length; k++) {
                        if (document.kits[i].seasons[j].season_kits[k].kit_type === kitType) {
                            return document.kits[i].seasons[j].season_kits[k].kit_image_url;
                        }
                    }
                }
            }
        }
    }
}

function updatePictureElement(pictureElement) {
    const sourceElements = pictureElement.querySelectorAll('source');
    const imgElement = pictureElement.querySelector('img');
    const fplTeam = imgElement.getAttribute('alt');

    if (!fplTeam) {
        return;
    }

    const clubId = document.kits.find((kit) => kit.club_fpl_name === fplTeam).club_id;
    const seasonId = document.fplClassicKitsUserSettings.find((setting) => setting.clubId === clubId).seasonId;
    const kitType = document.fplClassicKitsUserSettings.find((setting) => setting.clubId === clubId).kitType;

    imageUrl = getImageUrl(clubId, seasonId, kitType);

    if (!imageUrl) {
        return;
    }

    const srcsetWidths = ['66', '110', '220'];
    const sourceSrcset = srcsetWidths.map((width) => `${imageUrl}?width=${width} ${width}w`).join(', ');

    sourceElements.forEach((sourceElement) => {
        sourceElement.setAttribute('srcset', sourceSrcset);
    });

    imgElement.setAttribute('src', `${imageUrl}?width=${srcsetWidths[0]}`);
    imgElement.setAttribute('srcset', sourceSrcset);
}

function updateAllKits() {
    // Gert all shirt images
    const pictureElements = document.querySelectorAll('.Shirt__StyledShirt-k5q8zl-0');
    pictureElements.forEach((pictureElement) => {
        updatePictureElement(pictureElement.parentNode);
    });
}
