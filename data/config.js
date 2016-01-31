self.on("message", function(message) {
  gFilteredDomains = message;
  var content = document.getElementById("content");
  content.innerHTML = message;
});
