var content = document.getElementById("message");

// http://stackoverflow.com/questions/979975/how-to-get-the-value-from-the-url-parameter
var QueryString = function () {
  // This function is anonymous, is executed immediately and
  // the return value is assigned to QueryString!
  var query_string = {};
  var query = window.location.search.substring(1);
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
}();
var delay = 0;
if (QueryString["waitingTime"])
  delay = QueryString["waitingTime"];

var begin = new Date();

var interval = setInterval(wait, 100);

function seconds_since_epoch(dateObj){ return Math.floor( dateObj.getTime() / 1000 ) }

function wait() {
  var now = new Date();

  var timeDiff = seconds_since_epoch(now) - seconds_since_epoch(begin);

  if (QueryString["dst"]){
    var timeLeft = delay - timeDiff;
    var message = "You can view <span class='url'>"+window.atob(QueryString["dst"])+"</span> in <span class='time'>"+timeLeft+"</span> seconds";
    content.innerHTML = timeDiff <= delay ? message : "Redirecting...";
  } else {
    content.innerHTML = "Redirect destination not defined";
  }

  if (timeDiff >= delay) {
    if (QueryString["dst"]) {
      clearInterval(interval);
      var dst = window.atob(QueryString["dst"]);
      window.location = insertParam("letgowaitdone", "1", dst);
    }
  }
}

function insertParam(key,value, url)
{
  key = encodeURIComponent(key); value = encodeURIComponent(value);

  var kvp = key+"="+value;

  var index = url.indexOf('?');

  if (index === -1) {
    return url + '?'+kvp;
  } else {
    return url+'&'+kvp;
  }
}
