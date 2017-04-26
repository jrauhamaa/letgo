const warningPage = chrome.extension.getURL('data/blocked.html');


function checkPage(tab) {
    const url = tab.url;
    let currentDomain = url.split('://')[1];
    if (currentDomain.startsWith('www.')) {
        currentDomain = currentDomain.substring(4);  // strip 'www.' from the beginning
    }

    chrome.storage.sync.get(['blockedDomains', 'pageVisitTime'], (obj) => {
        const blockedDomains = obj.blockedDomains || {};
        const pageVisitTime = obj.pageVisitTime || 15;
        const pageLoadDelay = obj.pageLoadDelay || 30;
        const now = new Date();
        let restricted = false;
        Object.keys(blockedDomains).forEach((domainName) => {
            if (currentDomain.startsWith(domainName)) {
                const visitTime = new Date(blockedDomains[domainName]);
                const timeDiff = Math.floor((now - visitTime) / (60 * 1000));  // time diff in minutes
                if (timeDiff >= pageVisitTime) {
                    restricted = true;
                }
            }
        });

        if (restricted) {
            const newURL = `${warningPage}?url=${window.btoa(url)}`;
            chrome.tabs.update(tab.id, {
                url: newURL
            });
        }
    });
}


function removeWaitingTabs(tabs) {
    const waitingTabs = tabs.filter((t) => t.url.startsWith(warningPage));
    chrome.tabs.remove(waitingTabs.map((t) => t.id));
}


window.setInterval(function() {
    // remove inactive waiting tabs from current window
    chrome.tabs.query({active: false, currentWindow: true}, removeWaitingTabs);
    // remove all waiting tabs from inactive windows
    chrome.tabs.query({currentWindow: false}, removeWaitingTabs);
    // check current tab
    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
        if (tabs.length) checkPage(tabs[0]);
    });
}, 1000);
