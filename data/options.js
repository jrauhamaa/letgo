const wrapper    = $("#filteredDomains-list");
const addButton = $("#newDomain-button");
const saveButton = $("#save-button");

// pre-fill input fields
function render(storage) {
    $("#feedback").empty();
    $("#error-message").empty();

    $("#pageLoadDelay-input").val(storage.pageLoadDelay || 30);
    $("#pageVisitTime-input").val(storage.pageVisitTime || 15);

    const domainElems = Object.keys(storage.blockedDomains || {}).map((domain) =>
        '<div><input type="text" class="domain-input" value="' + domain + '"/>' +
        '<button class="remove_field btn btn-default btn-xs">x</button></div>'
    );
    wrapper.html(domainElems.join(''));
}

// remove input field
wrapper.on("click",".remove_field", function(e){ //user click on remove text
    e.preventDefault(); $(this).parent('div').remove();
});

// validate input
function validate() {
    const errors = [];

    const pageLoadDelay = $("#pageLoadDelay-input").val();
    if (pageLoadDelay.length === 0 || isNaN(pageLoadDelay)){
        errors.push("Waiting time must be a number");
    }

    const pageVisitTime = $("#pageVisitTime-input").val();
    if (pageVisitTime.length === 0 || isNaN(pageVisitTime)){
        errors.push("Expiration time must be a number");
    }

    return errors;
}

addButton.click(function(e){
  e.preventDefault();
  $(wrapper).append('<div><input type="text" class="domain-input"/><button class="remove_field btn btn-default btn-xs">x</button></div>');
});

saveButton.click(function() {
    const errorField = $("#error-message");
    errorField.empty();
    $("#feedback").empty();
    errors = validate();
    if (errors.length) {
        errorField.html(errors.map((e) => `<div>${e}</div>`).join(''));
        return;
    }

    const pageLoadDelay = $("#pageLoadDelay-input").val();
    const waitExpirationTime = $("#pageVisitTime-input").val();

    chrome.storage.sync.get(['blockedDomains'], (obj) => {
        const blockedDomains = {};
        const oldBlockedDomains = obj.blockedDomains || {};
        const domainElems = document.getElementsByClassName("domain-input")
        let i;
        for (i=0; i<domainElems.length; i++) {
            const domain = domainElems[i].value;
            if (domain.length) {
                if (Object.keys(oldBlockedDomains).includes(domain)) {
                    blockedDomains[domain] = oldBlockedDomains[domain];
                } else {
                    blockedDomains[domain] = new Date(0).toISOString();  // epoch
                }
            }
        };

        chrome.storage.sync.set({pageLoadDelay, waitExpirationTime, blockedDomains}, () => {
            $("#feedback").html("Changes successfully saved");
        });
    });
});


chrome.storage.sync.get(['blockedDomains', 'pageVisitTime', 'pageLoadDelay'], (obj) => render(obj));
