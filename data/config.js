var wrapper    = $("#filteredDomains-list");
var add_button = $("#newDomain-button");
var saveButton = $("#save-button");

// pre-fill input fields
function render(storage) {
  $("#active-input").prop('checked', storage.active);
  $("#waitingTime-input").val(storage.waitingTime);
  $("#expirationTime-input").val(storage.waitExpirationTime);

  wrapper.empty();
  for (var i=0; i<storage.filteredDomains.length; i++) {
    wrapper.append('<div><input type="text" class="domain-input" value="'+storage.filteredDomains[i]+'"/><a href="#" class="remove_field">Remove</a></div>');
  }
}

// add new input field
add_button.click(function(e){
  e.preventDefault();
  $(wrapper).append('<div><input type="text" class="domain-input"/><a href="#" class="remove_field">Remove</a></div>'); //add input box
});

// remove input field
wrapper.on("click",".remove_field", function(e){ //user click on remove text
    e.preventDefault(); $(this).parent('div').remove();
});

// save settings
saveButton.click(function() {
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
});

// react to messages sent by main script
self.on("message", function(message) {
  domainIds = [];
  domainCount = 0;
  render(message);
});

// debug
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
