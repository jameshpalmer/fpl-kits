const url = chrome.runtime.getURL('data/kits.json');

fetch(url)
    .then((response) => response.json()) //assuming file contains json
    .then((json) => console.log(json))
    .catch((error) => console.error(error));


// Wait for the DOM to finish loading
document.addEventListener('DOMContentLoaded', function() {

    const targetNode = document.body;

    const observer = new MutationObserver(function(mutationsList) {
        for(let mutation of mutationsList) {
            if (mutation.type === 'childList') {
                for(let node of mutation.addedNodes) {
                    if(node.nodeName === 'IMG' && node.classList.contains('Shirt__StyledShirt-k5q8zl-0')) {
                        parent = node.parentNode;
                                updatePictureElement(parent, 'https://resources.premierleague.com/photos/premierleague/photo/2018/01/31/a8dc885a-06dd-4f74-b0d6-182e2282dc35/COrpMvyQ.png');
                    }
                    else if(node.getElementsByTagName) {
                        // Check if the added node has any img descendants
                        const addedImgs = node.getElementsByTagName('img');
                        for(let img of addedImgs) {
                            if(img.classList.contains('Shirt__StyledShirt-k5q8zl-0')) {
                                parent = img.parentNode;
                                updatePictureElement(parent, 'https://resources.premierleague.com/photos/premierleague/photo/2018/01/31/a8dc885a-06dd-4f74-b0d6-182e2282dc35/COrpMvyQ.png');
                            }
                        }
                    }
                }
            } else if (mutation.type === 'attributes') { // For substitutions without formation change
                if(mutation.target.nodeName === 'IMG' && mutation.target.classList.contains('Shirt__StyledShirt-k5q8zl-0') && mutation.attributeName === 'alt') {
                    parent = mutation.target.parentNode;
                    updatePictureElement(parent, 'https://resources.premierleague.com/photos/premierleague/photo/2018/01/31/a8dc885a-06dd-4f74-b0d6-182e2282dc35/COrpMvyQ.png');
                }
            }
        }
    });

    const config = { childList: true, subtree: true, attributes: true };

    observer.observe(targetNode, config);


});


function updatePictureElement(pictureElement, imageUrl) {
    const sourceElements = pictureElement.querySelectorAll('source');
    const imgElement = pictureElement.querySelector('img');
  
    const srcsetWidths = ['66', '110', '220'];
    const sourceSrcset = srcsetWidths.map((width) => `${imageUrl}?width=${width} ${width}w`).join(', ');
  
    sourceElements.forEach((sourceElement) => {
      sourceElement.setAttribute('srcset', sourceSrcset);
    });
  
    imgElement.setAttribute('src', `${imageUrl}?width=${srcsetWidths[0]}`);
    imgElement.setAttribute('srcset', sourceSrcset);
  }
  