var domainIds = [];
var domainCount = 0;
var wrapper         = $("#filteredDomains-list"); //Fields wrapper

Element.prototype.remove = function() {
  this.parentElement.removeChild(this);
}

Array.prototype.remove = function() {
  var what, a = arguments, L = a.length, ax;
  while (L && this.length) {
    what = a[--L];
    while ((ax = this.indexOf(what)) !== -1) {
      this.splice(ax, 1);
    }
  }
  return this;
};


self.on("message", function(message) {
  domainIds = [];
  domainCount = 0;
  render(message);
});

/*
var sample = {
  "active": true,
  "waitExpirationTime": 30,
  "waitingTime": 30,
  "filteredDomains": [
    "asdf",
    "qwer"
  ]
}
render(sample)

*/


function render(storage) {
  document.getElementById("active-input").checked = storage.active;
  document.getElementById("waitingTime-input").value = storage.waitingTime;
  document.getElementById("expirationTime-input").value = storage.waitExpirationTime;

  wrapper.empty();
  for (var i=0; i<storage.filteredDomains.length; i++) {
    $(wrapper).append('<div><input type="text" class="domain-input" value="'+storage.filteredDomains[i]+'"/><a href="#" class="remove_field">Remove</a></div>');
  }
}

$(wrapper).on("click",".remove_field", function(e){ //user click on remove text
    e.preventDefault(); $(this).parent('div').remove();
})

function Save() {
  var storage = {};
  storage.active = document.getElementById("active-input").checked;
  storage.waitingTime = document.getElementById("waitingTime-input").value;
  storage.waitExpirationTime = document.getElementById("expirationTime-input").value;
  var filteredDomains = [];
  var domainElems = document.getElementsByClassName("domain-input");
  for (var i=0; i<domainElems.length; i++) {
    filteredDomains.push(domainElems[i].value);
  }
  storage.filteredDomains = filteredDomains;

  self.postMessage(storage);
}

var add_button      = $("#newDomain-button"); //Add button ID

$(add_button).click(function(e){ //on add input button click
  e.preventDefault();
  $(wrapper).append('<div><input type="text" class="domain-input"/><a href="#" class="remove_field">Remove</a></div>'); //add input box
});


var saveButton = document.getElementById("save-button");
var newDomainButton = document.getElementById("newDomain-button");

saveButton.addEventListener("click", Save, false);
