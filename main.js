var data = require("sdk/self").data;
var ss = require("sdk/simple-storage");
var base64 = require("sdk/base64");
var { MatchPattern } = require("sdk/util/match-pattern");
var { ToggleButton } = require('sdk/ui/button/toggle');
var panels = require("sdk/panel");

var pageMod;

// create config panel
var panel = panels.Panel({
  contentURL: data.url("config.html"),
  contentScriptFile: [data.url("jquery.min.js"), data.url("config.js")],
  contentScriptWhen: "ready",
  onMessage: storeConfig,
  onHide: handleHide,
  onShow: function() {panel.postMessage(ss.storage);}
});
function handleHide() {
  button.state('window', {checked: false});
}
var button = ToggleButton({
  id: "letgo-panel",
  label: "LetGo",
  icon: {
    "16": data.url("letgo.ico") // from bholley's older version of the addon
  },
  onChange: handleChange
});
function handleChange(state) {
  if (state.checked) {
    panel.show({
      position: button
    });
  }
}

activatePageMod();

function activatePageMod() {

  // init storage
  initStorage();

  if (ss.storage.filteredDomains.length === 0)
    return;
  // filter patterns
  var patterns = ss.storage.filteredDomains.map(domainToPattern);

  pageMod = require("sdk/page-mod").PageMod({
    include: patterns,

    contentScript: '',

    contentScriptWhen: 'start',

    onAttach: function onAttach(worker) {

      var ourTab = worker.tab;

      // Never bounce for iframes.
      if (worker.url != ourTab.url)
        return;

      // find out which pattern is the one that matches with current url
      var currentPattern = findPattern(patterns, ourTab.url);
      if(!currentPattern){
        console.log("Error: delaying function triggered without url matching to any pattern");
        return;
      }

      // check if last wait hasn't yet expired
      if (!waitExpired(currentPattern)) {
        return;
      }

      // save the time the site got visited
      visit(currentPattern);

      // move to waiting page
      var redirURL = data.url("redirect.html") + "?" +
                             "dst" + "=" + base64.encode(ourTab.url) + "&" +
                             "waitingTime" + "=" + ss.storage.waitingTime;
      ourTab.url = redirURL;
    }
  });
}

// set default values to the variables that are not defined
function initStorage() {
  // init storage
  if (!ss.storage)
    ss.storage = {};
  if (!ss.storage.waitExpirationTime)
    ss.storage.waitExpirationTime = 30;
  if (typeof ss.storage.active == "undefined")
    ss.storage.active = true;
  if (!ss.storage.waitingTime)
    ss.storage.waitingTime = 30;
  if (!ss.storage.filteredDomains)
    ss.storage.filteredDomains = [];
}

// find which pattern matched with the url
function findPattern(patterns, url) {
  for (var i=0; i<patterns.length; i++) {
    var pattern = new MatchPattern(patterns[i]);
    if(pattern.test(url)){
      return patterns[i];
    }
  }
  return false;
}

// save the time the site got visited
function visit(currentPattern) {
  if (!ss.storage.visits) {
    ss.storage.visits = {};
    ss.storage.visits[currentPattern] = new Date().toISOString();
  } else if (!ss.storage.visits[currentPattern]) {
    ss.storage.visits[currentPattern] = new Date().toISOString();
  } else {
    var lastVisit = new Date(ss.storage.visits[currentPattern]);
    var now = new Date();
    var diffMinutes = Math.floor((now-lastVisit)/(1000*60))

    // avoid infinite redirect loop
    if (diffMinutes >= ss.storage.waitExpirationTime + 2){
      ss.storage.visits[currentPattern] = new Date().toISOString();
    }
  }
}

// Check if waiting time for the match pattern has expired
function waitExpired(currentPattern) {

  if(ss.storage && ss.storage.active == false)
    return;

  // if the site has never been visited
  if (!ss.storage.visits || !ss.storage.visits[currentPattern]) {
    return true;
  }

  // get the time period (in minutes) after which wait has expired
  var expirationTime;
  if (ss.storage.waitExpirationTime) {
    expirationTime = ss.storage.waitExpirationTime;
  } else {
    expirationTime = 30; // default waiting period is 30 minutes
  }

  // get time of last visit to the site
  var lastVisit = new Date(ss.storage.visits[currentPattern]);
  var now = new Date();
  var diffMinutes = Math.floor((now-lastVisit)/(1000*60));

  // check that the user has waited for the waiting time
  if (diffMinutes < expirationTime) {
    var diffSeconds = Math.floor((now-lastVisit)/(1000));

    return diffSeconds < ss.storage.waitingTime - 5;
  }

  return true;
}

// convert domain name to a match pattern
function domainToPattern(domain) {
  return '*.'+domain;
}

// store config changes and apply them to pagemod
function storeConfig(data) {
  ss.storage.active = data.active;
  ss.storage.waitExpirationTime = data.waitExpirationTime;
  ss.storage.waitingTime = data.waitingTime;
  ss.storage.filteredDomains = data.filteredDomains;

  if (pageMod)
    pageMod.destroy();

  activatePageMod();
}
