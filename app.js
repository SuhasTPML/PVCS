(function () {
  var siteData = window.CINE_SITE_DATA || {};
  var STAGE_KEY = "pvcs-stage";
  var STAGES = {
    pre: "pre-vote",
    during: "during-vote",
    post: "post-vote"
  };

  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function formatNumber(value) {
    return Number(value || 0).toLocaleString("en-IN");
  }

  function formatDate(value) {
    var date = new Date(String(value) + "T00:00:00");
    if (isNaN(date.getTime())) {
      return String(value || "");
    }

    return new Intl.DateTimeFormat("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric"
    }).format(date);
  }

  function getStage() {
    return window.localStorage.getItem(STAGE_KEY) || siteData.defaultStage || STAGES.pre;
  }

  function setStage(stage) {
    window.localStorage.setItem(STAGE_KEY, stage);
    document.body.setAttribute("data-stage", stage);
    renderSharedChrome();
    window.dispatchEvent(new Event("pvcs:render"));
  }

  function getRoute() {
    return location.hash.replace(/^#\/?/, "").trim() || "home";
  }

  function getRoutePageMap() {
    return {
      home: "home",
      voting: "voting",
      nominations: "nominations",
      winners: "winners",
      about: "about",
      contest: "contest",
      process: "process",
      jury: "jury",
      "cine-corner": "cine-corner",
      "previous-years": "previous-years",
      terms: "terms"
    };
  }

  function getCurrentPageValue(route) {
    var map = getRoutePageMap();
    return map.hasOwnProperty(route) ? map[route] : map.home;
  }

  function getEffectiveHref(item) {
    var stage = getStage();
    if (stage === STAGES.post && item.pageUrl === "#/voting") {
      return "#/winners";
    }
    return item.pageUrl;
  }

  function createNavIcon(name) {
    var pathMap = {
      home: "M12 3.5 3.5 10v10.5h5.5v-6h6v6h5.5V10z",
      vote: "M5 6.5h14v11H5zm2 2v7h10v-7zm2.5-4h5l1 2h-7z",
      contest: "M7 5h10v3h2v10H5V8h2zm2 5.5 2 2 4-4",
      process: "M6 6h12v3H6zm0 5h12v3H6zm0 5h8v3H6z",
      menu: "M4.5 7h15M4.5 12h15M4.5 17h15",
      about: "M12 2.75a3.25 3.25 0 1 1 0 6.5a3.25 3.25 0 0 1 0-6.5zm-4 8.75h8a2 2 0 0 1 2 2v7H6v-7a2 2 0 0 1 2-2z",
      jury: "M12 3.5l6 2v4.5c0 4-2.5 7.5-6 10-3.5-2.5-6-6-6-10V5.5l6-2zm0 3a1.5 1.5 0 1 0 0 3a1.5 1.5 0 0 0 0-3zm-2 4.5v1h4v-1h-4z",
      cineCorner: "M6 7h12v10H6zm2 2v6h8V9H8zm1 1.5h6v1H9zm0 2h6v1H9z",
      previousYears: "M7 5h10v3H7zm-1 5h12v9H6zm3-3h6v2H9z",
      terms: "M7 4.5h10l2 2V19.5H7zM9 9h6M9 12h6M9 15h4"
    };
    return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="' + (pathMap[name] || pathMap.menu) + '"/></svg>';
  }

  function itemIconName(item) {
    var page = item.pageUrl || "";
    if (item.menuTrigger) return "menu";
    if (page === "#/") return "home";
    if (page === "#/voting") return "vote";
    if (page === "#/contest") return "contest";
    if (page === "#/process") return "process";
    if (page === "#/about") return "about";
    if (page === "#/jury") return "jury";
    if (page === "#/cine-corner") return "cineCorner";
    if (page === "#/previous-years") return "previousYears";
    if (page === "#/terms") return "terms";
    return "menu";
  }

  function renderBottomNav() {
    var nav = qs("[data-bottom-nav]");
    if (!nav || !siteData.bottomNav) {
      return;
    }

    var currentRoute = getRoute();
    var currentPage = getCurrentPageValue(currentRoute);
    var stage = getStage();
    var isVotingPage = currentPage === "voting" || currentPage === "nominations";

    nav.innerHTML = siteData.bottomNav
      .map(function (item) {
        var classes = ["bottom-nav__link"];
        var href = getEffectiveHref(item);
        if (item.emphasis) {
          classes.push("is-emphasis");
        }
        if (
          (href === "#/" && currentPage === "home") ||
          (href === "#/voting" && isVotingPage) ||
          (href === "#/" + currentPage)
        ) {
          classes.push("is-active");
        }
        if (item.menuTrigger) {
          classes.push("js-menu-trigger");
        }
        return (
          '<a class="' + classes.join(" ") + '" href="' + href + '"' +
          (item.menuTrigger ? ' data-menu-trigger="true"' : "") + ">" +
          '<span class="bottom-nav__icon">' + createNavIcon(item.icon) + "</span>" +
          '<span class="bottom-nav__label">' + escapeHtml(item.label) + "</span>" +
          "</a>"
        );
      })
      .join("");
  }

  function renderHeaderNav() {
    var el = qs("[data-header-nav]");
    if (!el || !siteData.bottomNav) return;

    var currentRoute = getRoute();
    var currentPage = getCurrentPageValue(currentRoute);
    var isVotingPage = currentPage === "voting" || currentPage === "nominations";
    var items = siteData.bottomNav
      .filter(function (item) { return !item.menuTrigger; })
      .concat(siteData.menuLinks || [])
      .slice(0, 6);

    el.innerHTML = items
      .map(function (item) {
        var classes = ["header-nav__link"];
        var href = getEffectiveHref(item);
        if (item.emphasis) classes.push("is-emphasis");
        if (
          (href === "#/" && currentPage === "home") ||
          (href === "#/voting" && isVotingPage) ||
          (href === "#/" + currentPage)
        ) classes.push("is-active");
        return '<a class="' + classes.join(" ") + '" href="' + href + '">' + escapeHtml(item.label) + "</a>";
      })
      .join("");
  }

  function renderMenu() {
    var list = qs("[data-menu-links]");
    if (!list) {
      return;
    }

    var currentRoute = getRoute();
    var currentPage = getCurrentPageValue(currentRoute);
    var primaryLinks = (siteData.bottomNav || [])
      .filter(function (item) {
        return !item.menuTrigger;
      })
      .map(function (item) {
        return { label: item.label, pageUrl: getEffectiveHref(item) };
      });
    var secondaryLinks = siteData.menuLinks || [];

    function renderLink(item) {
      var classes = [];
      if (
        (item.pageUrl === "#/" && currentPage === "home") ||
        (item.pageUrl === "#/" + currentPage)
      ) {
        classes.push("is-active");
      }
      return (
        "<li><a" +
        (classes.length ? ' class="' + classes.join(" ") + '"' : "") +
        ' href="' + item.pageUrl + '">' +
        '<span class="side-menu__icon">' + createNavIcon(itemIconName(item)) + "</span>" +
        '<span class="side-menu__label">' + escapeHtml(item.label) + "</span>" +
        '<span class="side-menu__chevron" aria-hidden="true">›</span>' +
        "</a></li>"
      );
    }

    list.innerHTML =
      '<section class="side-menu__section">' +
        '<div class="side-menu__section-title">Primary</div>' +
        '<ul class="side-menu__list">' +
          primaryLinks.map(renderLink).join("") +
        "</ul>" +
      "</section>" +
      '<section class="side-menu__section">' +
        '<div class="side-menu__section-title">More</div>' +
        '<ul class="side-menu__list">' +
          secondaryLinks.map(renderLink).join("") +
        "</ul>" +
      "</section>";
  }

  function renderSponsors() {
    var track = qs("[data-sponsor-track]");
    if (!track || !siteData.sponsors) {
      return;
    }

    var repeated = siteData.sponsors.concat(siteData.sponsors);
    track.innerHTML = repeated
      .map(function (item) {
        return (
          '<a class="sponsor-chip" href="' + item.destination + '">' +
          '<span class="sponsor-chip__label">' + escapeHtml(item.label) + "</span>" +
          '<img src="' + item.imageUrl + '" alt="' + escapeHtml(item.label) + '" loading="lazy">' +
          "</a>"
        );
      })
      .join("");
  }

  function initPopup() {
    var popup = qs("[data-popup]");
    if (!popup || !siteData.popup) {
      return;
    }

    qs("[data-popup-title]", popup).textContent = siteData.popup.title;
    qs("[data-popup-description]", popup).textContent = siteData.popup.description;
    var cta = qs("[data-popup-cta]", popup);
    cta.textContent = siteData.popup.ctaLabel;
    cta.href = siteData.popup.ctaLink;

    var hasSeen = sessionStorage.getItem("cine-popup-seen") === "1";
    if (!hasSeen && getRoute() === "home") {
      requestAnimationFrame(function () {
        popup.classList.add("is-visible");
        document.body.classList.add("has-overlay");
        sessionStorage.setItem("cine-popup-seen", "1");
      });
    }

    qsa("[data-popup-close]", popup).forEach(function (button) {
      button.addEventListener("click", function () {
        popup.classList.remove("is-visible");
        document.body.classList.remove("has-overlay");
      });
    });
  }

  function closeMenu() {
    var menu = qs("[data-side-menu]");
    var overlay = qs("[data-menu-overlay]");
    if (menu) {
      menu.classList.remove("is-open");
    }
    if (overlay) {
      overlay.hidden = true;
    }
    document.body.classList.remove("has-overlay", "has-menu-open");
  }

  function openMenu() {
    var menu = qs("[data-side-menu]");
    var overlay = qs("[data-menu-overlay]");
    if (menu) {
      menu.classList.add("is-open");
      var firstLink = qs("a", menu);
      if (firstLink) {
        firstLink.focus();
      }
    }
    if (overlay) {
      overlay.hidden = false;
    }
    document.body.classList.add("has-overlay", "has-menu-open");
  }

  function initMenu() {
    document.addEventListener("click", function (event) {
      if (event.target.closest("[data-menu-trigger]")) {
        event.preventDefault();
        openMenu();
      }
    });

    qsa("[data-menu-close]").forEach(function (trigger) {
      trigger.addEventListener("click", closeMenu);
    });

    var menuLinksList = qs("[data-menu-links]");
    if (menuLinksList) {
      menuLinksList.addEventListener("click", function (event) {
        if (event.target.closest("a")) {
          closeMenu();
        }
      });
    }

    var overlay = qs("[data-menu-overlay]");
    if (overlay) {
      overlay.addEventListener("click", closeMenu);
    }

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") {
        closeMenu();
        var popup = qs("[data-popup]");
        if (popup) {
          popup.classList.remove("is-visible");
        }
        document.body.classList.remove("has-overlay");
      }
    });
  }

  function initYear() {
    qsa("[data-year]").forEach(function (node) {
      node.textContent = String(new Date().getFullYear());
    });
  }

  function getCountdownParts(targetDate) {
    var target = new Date(String(targetDate) + "T00:00:00");
    var diff = target.getTime() - Date.now();
    if (isNaN(target.getTime()) || diff <= 0) {
      return { days: 0, hours: 0, minutes: 0 };
    }
    var minutesTotal = Math.floor(diff / 60000);
    var days = Math.floor(minutesTotal / (60 * 24));
    var hours = Math.floor((minutesTotal % (60 * 24)) / 60);
    var minutes = minutesTotal % 60;
    return { days: days, hours: hours, minutes: minutes };
  }

  function getPublicCategories() {
    var ids = siteData.publicVoteCategoryIds || [];
    var categories = siteData.votingCategories || [];
    if (!ids.length) {
      return categories.slice(0, 4);
    }
    return ids
      .map(function (id) {
        return categories.filter(function (category) { return category.id === id; })[0];
      })
      .filter(Boolean);
  }

  function getTopNominees(category, count) {
    return (category.nominees || [])
      .slice()
      .sort(function (a, b) {
        return Number(b.votes || 0) - Number(a.votes || 0);
      })
      .slice(0, count || 3);
  }

  function getCategoryWinner(category) {
    var nominees = getTopNominees(category, 1);
    return nominees[0] || null;
  }

  function getStatsVisible() {
    var eventDate = siteData.eventDate;
    if (!eventDate) {
      return false;
    }
    var threshold = new Date(String(eventDate) + "T00:00:00").getTime() - (2 * 24 * 60 * 60 * 1000);
    return Date.now() >= threshold;
  }

  function renderHomeHero(stage) {
    var eventDate = siteData.eventDate || "";
    var eventLabel = formatDate(eventDate);
    var countdown = getCountdownParts(eventDate);
    var publicCategories = getPublicCategories();
    var stageLabel = stage === STAGES.during ? "During Vote" : stage === STAGES.post ? "Post Vote" : "Pre Vote";
    var stageTitle = "";
    var stageCopy = "";
    var primaryHref = "#/process";
    var primaryLabel = "View process";
    var secondaryHref = "#/contest";
    var secondaryLabel = "Contest";
    var panelTitle = "";
    var panelValue = "";
    var panelCopy = "";

    if (stage === STAGES.during) {
      stageTitle = "Voting is live";
      stageCopy = "Choose your favourites across the four public categories, then finish with the final submission screen.";
      primaryHref = "#/voting";
      primaryLabel = "Start voting";
      secondaryHref = "#/nominations";
      secondaryLabel = "Browse nominations";
      panelTitle = "Open categories";
      panelValue = String(publicCategories.length);
      panelCopy = "The stepper walks one category at a time with click-to-vote cards.";
    } else if (stage === STAGES.post) {
      stageTitle = "Winners are live";
      stageCopy = "The post-vote home now points visitors to the results surface, winner highlights, and the archive path.";
      primaryHref = "#/winners";
      primaryLabel = "View winners";
      secondaryHref = "#/winners";
      secondaryLabel = "Browse winners";
      panelTitle = "Winner cards";
      panelValue = String((siteData.winnerHighlights || []).length);
      panelCopy = "The winner surface is wider than the public ballot and can show additional recognitions.";
    } else {
      stageTitle = "Countdown to voting";
      stageCopy = "The pre-vote home focuses on the clock, sponsor visibility, and discovery content while the ballot is closed.";
      primaryHref = "#/process";
      primaryLabel = "View schedule";
      secondaryHref = "#/previous-years";
      secondaryLabel = "Previous editions";
      panelTitle = "Voting opens";
      panelValue = eventLabel;
      panelCopy = countdown.days > 0
        ? countdown.days + " days, " + countdown.hours + " hours and " + countdown.minutes + " minutes remain."
        : "The countdown has reached zero.";
    }

    return [
      '<section class="section-card stage-hero stage-hero--' + stage + '">',
        '<div class="stage-hero__media">',
          '<img class="stage-hero__trophy" src="https://images.assettype.com/deccanherald/2026-04-30/zrlojphv/PVCS-Trophy.png" alt="PVCS trophy">',
          '<div class="stage-hero__badge">' + escapeHtml(stageLabel) + "</div>",
        "</div>",
        '<div class="stage-hero__copy">',
          '<p class="eyebrow">Praja Vaani Cine Sammana</p>',
          '<h1>' + escapeHtml(stageTitle) + "</h1>",
          '<p>' + escapeHtml(stageCopy) + "</p>",
          '<div class="stage-hero__actions">' +
            '<a class="btn btn--primary" href="' + primaryHref + '">' + escapeHtml(primaryLabel) + "</a>" +
            '<a class="btn btn--ghost" href="' + secondaryHref + '">' + escapeHtml(secondaryLabel) + "</a>" +
          "</div>",
        "</div>",
        '<aside class="stage-hero__panel">',
          '<span class="stage-hero__panel-label">' + escapeHtml(panelTitle) + "</span>",
          '<strong class="stage-hero__panel-value">' + escapeHtml(panelValue) + "</strong>",
          '<p>' + escapeHtml(panelCopy) + "</p>",
        "</aside>",
      "</section>"
    ].join("");
  }

  function renderStageCards(stage) {
    var cards = [];

    if (stage === STAGES.during) {
      cards = [
        {
          eyebrow: "One flow",
          title: "Click to vote",
          copy: "The ballot keeps the interaction simple. No swipe logic, just clear card taps and a linear stepper."
        },
        {
          eyebrow: "Nomination browser",
          title: "Jump anywhere",
          copy: "The floating nomination widget takes you straight to any category without leaving the page."
        },
        {
          eyebrow: "Results control",
          title: "Stats stay gated",
          copy: "Vote-share charts stay hidden until two days before the event date and only show share, not counts."
        }
      ];
    } else if (stage === STAGES.post) {
      cards = [
        {
          eyebrow: "Winner surface",
          title: "Show all results",
          copy: "The post-vote view gives the winners room to breathe, including the extra recognition cards."
        },
        {
          eyebrow: "CTA shift",
          title: "Voting routes to winners",
          copy: "Once the event closes, the hero actions and the voting CTA land on the winners page."
        },
        {
          eyebrow: "Archive path",
          title: "Keep exploring",
          copy: "The archive, previous editions, and supporting pages remain available from the shared shell."
        }
      ];
    } else {
      cards = [
        {
          eyebrow: "Vote start",
          title: "Opening date " + formatDate(siteData.eventDate),
          copy: "The hero keeps the countdown in view so the start date is explicit and the next step stays obvious."
        },
        {
          eyebrow: "Sponsors",
          title: "Visible early",
          copy: "The sponsor band stays high in the stack so the first fold carries the commercial layer as well."
        },
        {
          eyebrow: "Discovery",
          title: "Galleries and clips",
          copy: "Photo and video cards keep the home page lively without pulling the user away from the event narrative."
        }
      ];
    }

    return [
      '<section class="stage-grid">',
        cards.map(function (card) {
          return [
            '<article class="section-card stage-grid__card">',
              '<p class="eyebrow">' + escapeHtml(card.eyebrow) + "</p>",
              '<h2>' + escapeHtml(card.title) + "</h2>",
              '<p>' + escapeHtml(card.copy) + "</p>",
            "</article>"
          ].join("");
        }).join(""),
      "</section>"
    ].join("");
  }

  function renderGallerySection() {
    var categories = siteData.votingCategories || [];
    var photoCards = categories.map(function (category) {
      var nominee = getCategoryWinner(category) || (category.nominees || [])[0];
      return nominee ? {
        title: nominee.title,
        subtitle: category.title,
        image: nominee.image
      } : null;
    }).filter(Boolean).slice(0, 4);

    var videoCards = [
      {
        title: "Festival reel",
        subtitle: "Highlights and arrivals",
        image: "https://images.assettype.com/deccanherald/2026-04-30/zrlojphv/PVCS-Trophy.png"
      },
      {
        title: "Winner recap",
        subtitle: "Post-vote summary",
        image: "https://picsum.photos/seed/winnerreel/560/420"
      },
      {
        title: "Sponsor wall",
        subtitle: "Commercial partners",
        image: "https://picsum.photos/seed/sponsorwall/560/420"
      }
    ];

    function cardMarkup(card, kind) {
      return [
        '<article class="media-card media-card--' + kind + '">',
          '<img src="' + card.image + '" alt="' + escapeHtml(card.title) + '">',
          '<div class="media-card__copy">',
            '<p class="eyebrow">' + escapeHtml(card.subtitle) + "</p>",
            '<h3>' + escapeHtml(card.title) + "</h3>",
          "</div>",
        "</article>"
      ].join("");
    }

    return [
      '<section class="content-block section-card">',
        '<div class="content-block__header">',
          '<div>',
            '<p class="eyebrow">Gallery</p>',
            '<h2>Photos and clips</h2>',
          "</div>",
        "</div>",
        '<div class="gallery-grid gallery-grid--photos">' + photoCards.map(function (card) {
          return cardMarkup(card, "photo");
        }).join("") + "</div>",
        '<div class="gallery-grid gallery-grid--videos">' + videoCards.map(function (card) {
          return cardMarkup(card, "video");
        }).join("") + "</div>",
      "</section>"
    ].join("");
  }

  function renderStatsSection() {
    var categories = getPublicCategories();
    if (!getStatsVisible()) {
      return "";
    }

    return [
      '<section class="content-block section-card stats-panel">',
        '<div class="content-block__header">',
          '<div>',
            '<p class="eyebrow">Voting stats</p>',
            '<h2>Vote share snapshot</h2>',
          "</div>",
        "</div>",
        '<div class="stats-grid">' + categories.map(function (category) {
          var nominees = getTopNominees(category, 3);
          var total = nominees.reduce(function (sum, nominee) {
            return sum + Number(nominee.votes || 0);
          }, 0) || 1;
          var running = 0;
          var segments = nominees.map(function (nominee, index) {
            var pct = Math.max(1, Math.round((Number(nominee.votes || 0) / total) * 100));
            var start = running;
            running += pct;
            return {
              nominee: nominee,
              pct: pct,
              start: start,
              end: index === nominees.length - 1 ? 100 : running
            };
          });
          var chart = "conic-gradient(" + segments.map(function (segment) {
            return segment.nominee.accent[0] + " " + segment.start + "% " + segment.end + "%";
          }).join(", ") + ")";
          return [
            '<article class="stats-card">',
              '<div class="stats-card__chart" style="--stats-chart: ' + chart + ';">',
                '<strong>' + escapeHtml(String(segments[0].pct)) + '%</strong>',
                '<span>share</span>',
              "</div>",
              '<div class="stats-card__copy">',
                '<p class="eyebrow">' + escapeHtml(category.title) + "</p>",
                '<h3>' + escapeHtml(segments[0].nominee.title) + "</h3>",
                '<ul>' + segments.map(function (segment) {
                  return '<li><span>' + escapeHtml(segment.nominee.title) + "</span><strong>" + escapeHtml(String(segment.pct)) + "%</strong></li>";
                }).join("") + "</ul>",
              "</div>",
            "</article>"
          ].join("");
        }).join("") + "</div>",
      "</section>"
    ].join("");
  }

  function renderWinnersPreview() {
    var winners = siteData.winnerHighlights || [];
    return [
      '<section class="content-block section-card winners-preview">',
        '<div class="content-block__header">',
          '<div>',
            '<p class="eyebrow">Winners</p>',
            '<h2>Post-vote highlight cards</h2>',
          "</div>",
          '<a class="btn btn--ghost" href="#/winners">Open full winners page</a>',
        "</div>",
        '<div class="winner-grid">' + winners.slice(0, 4).map(function (winner) {
          return [
            '<article class="winner-card">',
              '<img src="' + winner.image + '" alt="' + escapeHtml(winner.title) + '">',
              '<div class="winner-card__copy">',
                '<p class="eyebrow">' + escapeHtml(winner.category) + "</p>",
                '<h3>' + escapeHtml(winner.title) + "</h3>",
                '<p>' + escapeHtml(winner.subtitle) + "</p>",
              "</div>",
            "</article>"
          ].join("");
        }).join("") + "</div>",
      "</section>"
    ].join("");
  }

  function renderHome() {
    var root = qs("[data-home-shell]");
    if (!root) {
      return;
    }

    var stage = getStage();
    var sections = [];
    sections.push(renderHomeHero(stage));
    sections.push(
      '<section class="sponsor-band sponsor-band--bare home-sponsor-band" aria-labelledby="sponsors-title">' +
        '<h2 id="sponsors-title" class="sr-only">Sponsors</h2>' +
        '<div class="sponsor-band__track" data-sponsor-track></div>' +
      "</section>"
    );
    sections.push(renderStageCards(stage));
    if (stage === STAGES.post) {
      sections.push(renderWinnersPreview());
    }
    sections.push(renderGallerySection());
    sections.push(renderStatsSection());

    root.setAttribute("data-stage", stage);
    root.innerHTML = sections.join("");
    renderSponsors();
  }

  function renderStageController() {
    var existing = qs("[data-stage-controller]");
    if (!existing) {
      existing = document.createElement("aside");
      existing.setAttribute("data-stage-controller", "true");
      existing.className = "stage-controller";
      document.body.appendChild(existing);
    }

    var stage = getStage();
    existing.innerHTML = [
      '<div class="stage-controller__label">',
        '<span class="eyebrow">Stage</span>',
        '<strong>' + (stage === STAGES.post ? "Post Vote" : stage === STAGES.during ? "During Vote" : "Pre Vote") + "</strong>",
      "</div>",
      '<div class="stage-controller__group">',
        '<button type="button" data-stage-target="' + STAGES.pre + '"' + (stage === STAGES.pre ? ' class="is-active"' : "") + ">Pre Vote</button>",
        '<button type="button" data-stage-target="' + STAGES.during + '"' + (stage === STAGES.during ? ' class="is-active"' : "") + ">During Vote</button>",
        '<button type="button" data-stage-target="' + STAGES.post + '"' + (stage === STAGES.post ? ' class="is-active"' : "") + ">Post Vote</button>",
      "</div>"
    ].join("");

    existing.onclick = function (event) {
      var button = event.target.closest("[data-stage-target]");
      if (!button) {
        return;
      }
      setStage(button.getAttribute("data-stage-target"));
    };
  }

  function renderSharedChrome() {
    document.body.setAttribute("data-stage", getStage());
    renderBottomNav();
    renderHeaderNav();
    renderMenu();
    renderStageController();
    renderSponsors();
    if (getRoute() === "home") {
      renderHome();
    } else {
      var homeRoot = qs("[data-home-shell]");
      if (homeRoot) {
        homeRoot.innerHTML = "";
      }
    }
  }

  function navigate(route) {
    var map = getRoutePageMap();
    if (!map.hasOwnProperty(route)) {
      route = "home";
    }

    closeMenu();
    document.body.setAttribute("data-page", map[route]);

    qsa("[data-route]").forEach(function (el) {
      el.hidden = true;
    });

    var target = qs('[data-route="' + route + '"]');
    if (target) {
      target.hidden = false;
    }

    renderSharedChrome();
    window.scrollTo(0, 0);
    window.dispatchEvent(new Event("pvcs:render"));
  }

  window.addEventListener("hashchange", function () {
    navigate(getRoute());
  });

  function onReady() {
    if (!window.localStorage.getItem(STAGE_KEY)) {
      window.localStorage.setItem(STAGE_KEY, siteData.defaultStage || STAGES.pre);
    }
    renderSharedChrome();
    initMenu();
    initYear();
    navigate(getRoute());
    initPopup();

  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", onReady);
  } else {
    onReady();
  }
})();
