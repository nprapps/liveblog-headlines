var Sidechain = require("@nprapps/sidechain");
var guest = Sidechain.registerGuest();

// load the various result elements
require("./liveblog-headlines");

var checkIfNPR = function() {
  var params = new URLSearchParams(window.location.search);
  var parentURL = new URL(decodeURI(params.get("parentUrl")));

  if (parentURL.hostname.includes("npr.org")) {
    return true;
  } else {
    return false;
  }
}

var isNPR = checkIfNPR();
if (isNPR) {
  document.body.addEventListener("click", function(e) {
    var target = e.target;
    var link = target.closest("a[href]");
    if (link) {
      var href = link.getAttribute("href");
      guest.sendLegacy("pjax-navigate", href);
      console.log(`Dispatching pjax-navigate for ${href}`);
      e.preventDefault();
    }
  })
}
