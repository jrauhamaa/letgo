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


window.setInterval(function() {
    chrome.tabs.query({active: false}, (tabs) => {
        const waitingTabs = tabs.filter((t) =>
            t.url.startsWith(`chrome-extension://${chrome.runtime.id}/data/blocked.html`));
        chrome.tabs.remove(waitingTabs.map((t) => t.id));
    });
    chrome.tabs.query({active: true}, (tabs) => {
        const activeTab = tabs[0];
        if (activeTab.url.indexOf("http://") != -1 || activeTab.url.indexOf("https://") != -1) {
            checkPage(activeTab);
        }
    });
}, 500);
