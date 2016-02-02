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

      // check if we're being redirected from the waiting page
      var query = getQueryString(ourTab.url);
      if (query.letgowaitdone && query.letgowaitdone == "1") {
        visit(currentPattern);
        return;
      }

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
  if (!ss.storage.visits)
    ss.storage.visits = {};
  ss.storage.visits[currentPattern] = new Date().toISOString();
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

  return diffMinutes >= expirationTime;
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

// get query params from url
function getQueryString(url) {
  // This function is anonymous, is executed immediately and
  // the return value is assigned to QueryString!
  var query_string = {};

  var index = url.indexOf('?');
  if (index === -1) {
    return {};
  }

  var query = url.substring(index+1);
  var vars = query.split("&");
  for (var i=0;i<vars.length;i++) {
    var pair = vars[i].split("=");
        // If first entry with this name
    if (typeof query_string[pair[0]] === "undefined") {
      query_string[pair[0]] = decodeURIComponent(pair[1]);
        // If second entry with this name
    } else if (typeof query_string[pair[0]] === "string") {
      var arr = [ query_string[pair[0]],decodeURIComponent(pair[1]) ];
      query_string[pair[0]] = arr;
        // If third or later entry with this name
    } else {
      query_string[pair[0]].push(decodeURIComponent(pair[1]));
    }
  }
  return query_string;
}
