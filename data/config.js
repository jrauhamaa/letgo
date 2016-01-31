self.on("message", function(message) {

  render(message);
});


var sample = {
  "active": true,
  "waitExpirationTime": 30,
  "waitingTime": 30,
  "filteredDomains": [
    "asdf",
    "qwer"
  ]
}
function render(storage) {
  document.getElementById("active-input").checked = storage.active;
  document.getElementById("waitingTime-input").value = storage.waitingTime;
  document.getElementById("expirationTime-input").value = storage.waitExpirationTime;

  var list = document.getElementById("filteredDomains-list")
  list.innerHTML = '<label for="filteredDomains">Filtered domains</label><br>';
  for (var i=0; i<storage.filteredDomains.length; i++) {
    var html = '<div class="domain-name"><input value='+storage.filteredDomains[i]+'> <button type="button" class="btn btn-default btn-xs">-</button></div>';
    list.innerHTML += html;
  }
  list.innerHTML += '<div class="domain-name"><button type="button" class="btn btn-default btn-sm">+</button></div>';
}

render(sample)

function Save() {
  var storage = {};
  storage.active = document.getElementById("active-input").checked;
  storage.waitingTime = document.getElementById("waitingTime-input").value;
  storage.waitExpirationTime = document.getElementById("expirationTime-input").value;

  self.postMessage(storage);
}

var saveButton = document.getElementById("save-button");

saveButton.addEventListener("click", Save, false);
