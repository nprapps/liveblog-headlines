var ElementBase = require("./element-base");
var dot = require("./lib/dot");
var template = dot.compile(require("./_headlines.html"));
var $ = require("./lib/qsa");
var track = require("./lib/tracking");

var { formatTime, formatAPDate } = require("./utils");

var defaultRefresh = 60;

var ago = {
  minute: 1000 * 60,
  hour: 1000 * 60 * 60,
  day: 1000 * 60 * 60 * 24,
  week: 1000 * 60 * 60 * 24 * 7
};

var relativeTime = function(timestamp) {
  var now = Date.now();
  var delta = now - timestamp;
  if (delta > ago.week) {
    return formatAPDate(new Date(timestamp));
  }
  var pluralize = (word, count) => count == 1 ? word : word + "s";
  for (var d of ["week", "day", "hour", "minute",]) {
    var duration = ago[d];
    if (delta > duration) {
      var count = (delta / duration) | 0;
      return [count, pluralize(d, count), "ago"].join(" ");
    }
  }
  return "Less than a minute ago";
}

class LiveblogHeadlines extends ElementBase {
  constructor() {
    super();
    this.interval = null;
  }

  static get boundMethods() {
    return ["load"]
  }

  static get observedAttributes() {
    return ["src", "href", "headline"]
  }

  connectedCallback() {
    if (this.interval) clearInterval(this.interval);
    this.interval = setInterval(this.load, defaultRefresh * 1000);
  }

  disconnectedCallback() {
    if (this.interval) clearInterval(this.interval);
    this.interval = null;
  }

  attributeChangedCallback(attr, was, value) {
    switch (attr) {

      // keeping this for backwards compatibility, but going forward use the "theme" url param instead
      case "headline":
        var { headline } = this.illuminate();
        if (value.trim() == "Morning Edition Live") {
          headline.innerHTML = '<img src="./assets/logo-morning-edition.svg" alt="Morning Edition"><span class="live-bug">Live</span>';
          headline.classList.add("morning-edition");
        } else if (value.toLowerCase().includes("olympic")) {
          headline.classList.add("olympics");
          headline.innerHTML = value.trim();
        } else if (value.toLowerCase().includes("election") && value.toLowerCase().includes("2022")) {
          headline.classList.add("election-2022");
          headline.innerHTML = value.trim();
        } else {
          headline.innerHTML = value.trim();
        }
        break;
      
      default:
        this.load();
    }
  }

  getDocument(url) {
    return new Promise(function(ok, fail) {
      var xhr = new XMLHttpRequest();
      xhr.responseType = "document";
      xhr.open("GET", url);
      xhr.send();
      xhr.onload = function() {
        ok(xhr.response);
      };
      xhr.onerror = fail;
    });
  }

  async load() {
    var elements = this.illuminate();
    var src = this.getAttribute("src");
    var theme = this.getAttribute("theme");
    var href = this.getAttribute("href");
    // if (!href) {
    //   href = src.replace(/\/[^\/]+$/, "/");
    // }
    if (href) {
      elements.moreLink.href = elements.titleLink.href = href;
    } else {
      // if no link is specified, don't show the "more" link
      elements.moreLink.style.display = 'none';
    }
    var rss = await this.getDocument(src);

    var timestamps = true;
    if (this.hasAttribute("timestamps")) {
      if (this.getAttribute("timestamps") == "false") {
        timestamps = false;
      }
    }
    if (theme == "tinydesk") {
      timestamps = false;
    }

    var headlines = $("item", rss).map(function(element) {
      var tags = $("category", element).map(c => c.innerHTML);
      var [flag] = tags.filter(t => t == "Fact Check" || t == "Major Development");
      var showTimestamps = timestamps;
      var pubDate = $.one("pubDate", element).innerHTML
      var date = Date.parse(pubDate);
      var relative = relativeTime(date);
      var articleURL = $.one("link", element).textContent;
      var link = new URL(articleURL);
      // remove UTM parameters
      ["utm_medium", "utm_campaign"].forEach(p => link.searchParams.delete(p));
      link = link.toString();
      return {
        headline: $.one("title", element).innerHTML,
        link, date, relative, tags, flag, showTimestamps
      }
    });

    var max = this.hasAttribute("max") ? this.getAttribute("max") : 6;
    if (max == "all") {
      max = headlines.length;
    }
    headlines = headlines.sort((a, b) => b.date - a.date).slice(0, max);
    elements.headlines.innerHTML = template({ headlines, formatAPDate, formatTime });
    $("a", elements.headlines).forEach(function(a) {
      if (theme == "tinydesk") {
        a.addEventListener("click", () => track("tinydesk most popular module", "click link", a.href));
      } else {
        a.addEventListener("click", () => track("liveblogs homepage module", "click link", a.href));
      }
    });
  }

  static get template() {
    return `
<div class="title">
  <a data-as="titleLink">
    <h2 data-as="headline">
      This Just In
    </h2>
  </a>
  <a data-as="moreLink" class="more">More &rsaquo;</a>
</div>

<ol data-as="headlines">`
  }
}

LiveblogHeadlines.define("liveblog-headlines");
