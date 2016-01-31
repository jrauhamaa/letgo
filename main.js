var tabs = require("sdk/tabs");
var pageMod = require("sdk/page-mod");
var data = require("sdk/self").data;
var tabs = require("sdk/tabs");
var ss = require("sdk/simple-storage");
var base64 = require("sdk/base64");
var { MatchPattern } = require("sdk/util/match-pattern");
var { ToggleButton } = require('sdk/ui/button/toggle');
var panels = require("sdk/panel");
var self = require("sdk/self");

var button = ToggleButton({
  id: "my-button",
  label: "my button",
  icon: {
    "16": data.url("firefox-16.png"),
    "32": data.url("firefox-32.png")
  },
  onChange: handleChange
});

var panel = panels.Panel({
  contentURL: data.url("panel.html"),
  onHide: handleHide
});

function handleChange(state) {
  if (state.checked) {
    panel.show({
      position: button
    });
  }
}

function handleHide() {
  button.state('window', {checked: false});
}





var patterns = ["*.google.fi"]

pageMod.PageMod({
  include: patterns,

  contentScript: '',

  contentScriptWhen: 'start',

  onAttach: function onAttach(worker) {

    var ourTab = worker.tab;

    // Never bounce for iframes.
    if (worker.url != ourTab.url)
      return;

    // find out which pattern is the one that matches with current url
    var currentPattern;
    for (var i=0; i<patterns.length; i++) {
      var pattern = new MatchPattern(patterns[i]);
      if(pattern.test(ourTab.url)){
        currentPattern = patterns[i];
        break;
      }
    }
    if(!currentPattern){
      console.log("Error: delaying function triggered without url matching to any pattern");
      return;
    }

    // check if last wait hasn't yet expired
    if (!waitExpired(currentPattern)) {
      return;
    }

    // save the time the site got visited
    if (!ss.storage.visits)
      ss.storage.visits = {};
    ss.storage.visits[currentPattern] = new Date().toISOString();

    // move to waiting page
    var redirURL = data.url("redirect.html") + "?" +
                           "dst" + "=" + base64.encode(ourTab.url);
    ourTab.url = redirURL;
  }
});


function waitExpired(currentPattern) {
  // if the site has never been visited
  if (!ss.storage.visits || !ss.storage.visits[currentPattern]) {
    return true;
  }

  // get the time period (in minutes) after which wait has expired
  var waitingPeriod;
  if (ss.storage.waitingPeriod) {
    waitingPeriod = ss.storage.waitingPeriod;
  } else {
    waitingPeriod = 1; // default waiting period is 30 minutes
  }

  // get time of last visit to the site
  var lastVisit = new Date(ss.storage.visits[currentPattern]);
  var now = new Date();
  var diffMinutes = Math.floor((now-lastVisit)/(1000*60));

  return diffMinutes >= waitingPeriod;
}
