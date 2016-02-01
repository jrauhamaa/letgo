var wrapper    = $("#filteredDomains-list");
var add_button = $("#newDomain-button");
var saveButton = $("#save-button");

// pre-fill input fields
function render(storage) {
  $("#feedback").empty();
  $("#active-input").prop('checked', storage.active);
  $("#waitingTime-input").val(storage.waitingTime);
  $("#expirationTime-input").val(storage.waitExpirationTime);

  wrapper.empty();
  for (var i=0; i<storage.filteredDomains.length; i++) {
    wrapper.append('<div><input type="text" class="domain-input" value="'+storage.filteredDomains[i]+'"/><button class="remove_field btn btn-default btn-xs">x</button></div>');
  }
}

// validate input
function valid() {
  var errors = [];

  var waitingTime = $("#waitingTime-input").val();
  if (waitingTime.length === 0 || isNaN(waitingTime)){
    errors.push("Waiting time must be a number");
  }

  var expirationTime = $("#expirationTime-input").val();
  if (expirationTime.length === 0 || isNaN(expirationTime)){
    errors.push("Expiration time must be a number");
  }

  var errorField = $("#error-message");
  errorField.empty();

  for (var i=0; i<errors.length; i++) {
    errorField.append("<div>"+errors[i]+"</div>");
  }

  return errors.length === 0;
}

// add new input field
add_button.click(function(e){
  e.preventDefault();
  $(wrapper).prepend('<div><input type="text" class="domain-input"/><button class="remove_field btn btn-default btn-xs">x</button></div>');
});

// remove input field
wrapper.on("click",".remove_field", function(e){ //user click on remove text
    e.preventDefault(); $(this).parent('div').remove();
});

// save settings
saveButton.click(function() {
  $("#feedback").empty();
  if (!valid())
    return;

  var storage = {};
  storage.active = $("#active-input").prop('checked');
  storage.waitingTime = $("#waitingTime-input").val();
  storage.waitExpirationTime = $("expirationTime-input").val();
  var filteredDomains = [];
  var domainElems = document.getElementsByClassName("domain-input");
  for (var i=0; i<domainElems.length; i++) {
    if(domainElems[i].value.length)
      filteredDomains.push(domainElems[i].value);
  }
  storage.filteredDomains = filteredDomains;

  self.postMessage(storage);

  $("#feedback").html("Changes successfully saved");

});

// react to messages sent by main script
self.on("message", function(message) {
  domainIds = [];
  domainCount = 0;
  render(message);
});
