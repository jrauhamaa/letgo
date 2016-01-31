
var content = document.getElementById("content");
var messageField = document.getElementById("message");

var delay = 5;
var begin = new Date();

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

setInterval(wait, 100);


function seconds_since_epoch(dateObj){ return Math.floor( dateObj.getTime() / 1000 ) }

function wait() {
  var now = new Date();

  var timeDiff = seconds_since_epoch(now) - seconds_since_epoch(begin);

  content.innerHTML = timeDiff <= delay ? delay - timeDiff : "Redirecting...";

  if (timeDiff >= delay) {
    if (QueryString["dst"]) {
      window.location = window.atob(QueryString["dst"]);
    } else {
      messageField.innerHTML = "Redirect destination not defined";
      console.log("Error: dst not defined in the query string");
    }
  }
}
