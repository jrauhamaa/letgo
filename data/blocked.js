const content = document.getElementById("message");
const searchStrings = window.location.search.substring(1).split('&');
const urlString = searchStrings.filter((str) => str.startsWith('url'))[0];
const url = window.atob(urlString.split('=')[1]);
let currentDomain = url.split('://')[1];
if (currentDomain.startsWith('www.')) {
    currentDomain = currentDomain.substring(4);  // strip 'www.' from the beginning
}


chrome.storage.sync.get(['blockedDomains', 'pageLoadDelay'], (obj) => {
    const blockedDomains = obj.blockedDomains || {};
    const pageLoadDelay = obj.pageLoadDelay || 30;
    const blockedDomain = Object.keys(blockedDomains).filter((d) => currentDomain.startsWith(d))[0];

    function wait(timeLeft) {
        let message = `You can view <span class='url'>${url}</span> in <span class='time'>${timeLeft}</span> seconds`;
        if (timeLeft === 0) {
            message = 'Redirecting...';
        }
        content.innerHTML = message;

        if (timeLeft === 0) {
            message = 'Redirecting...';
            blockedDomains[blockedDomain] = new Date().toISOString();
            chrome.storage.sync.set({blockedDomains}, () => {
                window.location = url;
            });
        } else {
            setTimeout(wait, 1000, timeLeft - 1);
        }
    }

    wait(pageLoadDelay);
});
