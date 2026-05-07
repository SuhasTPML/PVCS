(function () {
  var siteData = window.CINE_SITE_DATA || {};
  var STAGE_KEY = "pvcs-stage";
  var STAGE_CONTROLLER_KEY = "pvcs-stage-controller-collapsed";
  var VOTING_CLOSE_DATE = "2026-05-24";
  var MEDIA_FALLBACK_SRC = "PVCS_Trophy_with_bg.svg";
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

  function isStageControllerCollapsed() {
    return window.localStorage.getItem(STAGE_CONTROLLER_KEY) === "true";
  }

  function setStageControllerCollapsed(collapsed) {
    window.localStorage.setItem(STAGE_CONTROLLER_KEY, collapsed ? "true" : "false");
    renderStageController();
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

  function initImageFallbacks() {
    if (document.body.__pvcsImageFallbacksBound) {
      return;
    }
    document.body.__pvcsImageFallbacksBound = true;
    document.addEventListener("error", function (event) {
      var img = event.target;
      if (!img || img.tagName !== "IMG") {
        return;
      }
      var fallbackSrc = img.getAttribute("data-fallback-src");
      if (!fallbackSrc || img.getAttribute("data-fallback-applied") === "true") {
        return;
      }
      img.setAttribute("data-fallback-applied", "true");
      img.src = fallbackSrc;
    }, true);
  }

  function syncOverlayState() {
    var menu = qs("[data-side-menu]");
    var popup = qs("[data-popup]");
    var lightbox = qs("[data-gallery-lightbox]");
    var hasOverlay = Boolean(
      (menu && menu.classList.contains("is-open")) ||
      (popup && popup.classList.contains("is-visible")) ||
      (lightbox && lightbox.classList.contains("is-visible"))
    );
    document.body.classList.toggle("has-overlay", hasOverlay);
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
        syncOverlayState();
        sessionStorage.setItem("cine-popup-seen", "1");
      });
    }

    qsa("[data-popup-close]", popup).forEach(function (button) {
      button.addEventListener("click", function () {
        popup.classList.remove("is-visible");
        syncOverlayState();
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
    document.body.classList.remove("has-menu-open");
    syncOverlayState();
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
    document.body.classList.add("has-menu-open");
    syncOverlayState();
  }

  function isDesktopGalleryLightbox() {
    return window.matchMedia("(min-width: 1024px)").matches;
  }

  function closeGalleryLightbox() {
    var lightbox = qs("[data-gallery-lightbox]");
    if (!lightbox) {
      return;
    }
    lightbox.classList.remove("is-visible");
    lightbox.hidden = true;
    syncOverlayState();
  }

  function getPhotoGalleryItems() {
    return qsa("[data-gallery-trigger]").map(function (node) {
      return {
        src: node.getAttribute("data-gallery-src") || "",
        alt: node.getAttribute("data-gallery-alt") || "",
        caption: node.getAttribute("data-gallery-caption") || ""
      };
    }).filter(function (item) {
      return item.src;
    });
  }

  function renderGalleryLightboxFrame(lightbox) {
    var items = lightbox.__galleryItems || [];
    if (!items.length) {
      closeGalleryLightbox();
      return;
    }

    var index = Math.max(0, Math.min(lightbox.__galleryIndex || 0, items.length - 1));
    var item = items[index];
    var image = qs("[data-gallery-lightbox-image]", lightbox);
    var caption = qs("[data-gallery-lightbox-caption]", lightbox);
    var count = qs("[data-gallery-lightbox-count]", lightbox);
    var prev = qs("[data-gallery-lightbox-prev]", lightbox);
    var next = qs("[data-gallery-lightbox-next]", lightbox);

    lightbox.__galleryIndex = index;
    image.removeAttribute("data-fallback-applied");
    image.src = item.src;
    image.alt = item.alt;
    caption.textContent = item.caption;
    count.textContent = String(index + 1) + " / " + String(items.length);
    prev.disabled = items.length < 2;
    next.disabled = items.length < 2;
  }

  function stepGalleryLightbox(delta) {
    var lightbox = qs("[data-gallery-lightbox]");
    if (!lightbox || !lightbox.classList.contains("is-visible")) {
      return;
    }

    var items = lightbox.__galleryItems || [];
    if (!items.length) {
      return;
    }

    lightbox.__galleryIndex = (lightbox.__galleryIndex + delta + items.length) % items.length;
    renderGalleryLightboxFrame(lightbox);
  }

  function openGalleryLightbox(index) {
    if (!isDesktopGalleryLightbox()) {
      return;
    }

    var lightbox = qs("[data-gallery-lightbox]");
    var items = getPhotoGalleryItems();
    if (!lightbox || !items.length) {
      return;
    }

    lightbox.__galleryItems = items;
    lightbox.__galleryIndex = Math.max(0, Math.min(index || 0, items.length - 1));
    renderGalleryLightboxFrame(lightbox);
    lightbox.hidden = false;
    lightbox.classList.add("is-visible");
    syncOverlayState();

    var closeButton = qs("[data-gallery-lightbox-close]", lightbox);
    if (closeButton) {
      closeButton.focus();
    }
  }

  function initGalleryLightbox() {
    var lightbox = qs("[data-gallery-lightbox]");
    if (!lightbox || lightbox.__pvcsGalleryLightboxBound) {
      return;
    }
    lightbox.__pvcsGalleryLightboxBound = true;
    var panel = qs(".gallery-lightbox__panel", lightbox);
    var closeButton = qs("[data-gallery-lightbox-close]", lightbox);
    var prevButton = qs("[data-gallery-lightbox-prev]", lightbox);
    var nextButton = qs("[data-gallery-lightbox-next]", lightbox);

    if (panel) {
      panel.addEventListener("click", function (event) {
        event.stopPropagation();
      });
    }
    if (closeButton) {
      closeButton.addEventListener("click", function (event) {
        event.preventDefault();
        event.stopPropagation();
        closeGalleryLightbox();
      });
    }
    if (prevButton) {
      prevButton.addEventListener("click", function (event) {
        event.preventDefault();
        event.stopPropagation();
        stepGalleryLightbox(-1);
      });
    }
    if (nextButton) {
      nextButton.addEventListener("click", function (event) {
        event.preventDefault();
        event.stopPropagation();
        stepGalleryLightbox(1);
      });
    }
    lightbox.addEventListener("click", function () {
      closeGalleryLightbox();
    });

    document.addEventListener("click", function (event) {
      var trigger = event.target.closest("[data-gallery-trigger]");
      if (trigger) {
        event.preventDefault();
        openGalleryLightbox(Number(trigger.getAttribute("data-gallery-index") || 0));
        return;
      }

    });

    document.addEventListener("keydown", function (event) {
      if (!lightbox.classList.contains("is-visible")) {
        return;
      }

      if (event.key === "ArrowLeft") {
        event.preventDefault();
        stepGalleryLightbox(-1);
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        stepGalleryLightbox(1);
      } else if (event.key === "Escape") {
        closeGalleryLightbox();
      }
    });

    window.addEventListener("resize", function () {
      if (!isDesktopGalleryLightbox()) {
        closeGalleryLightbox();
      }
    });
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
        closeGalleryLightbox();
        syncOverlayState();
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
      return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    }
    var secondsTotal = Math.floor(diff / 1000);
    var minutesTotal = Math.floor(secondsTotal / 60);
    var days = Math.floor(minutesTotal / (60 * 24));
    var hours = Math.floor((minutesTotal % (60 * 24)) / 60);
    var minutes = minutesTotal % 60;
    var seconds = secondsTotal % 60;
    return { days: days, hours: hours, minutes: minutes, seconds: seconds };
  }

  function formatCountdownUnit(value) {
    return String(value || 0).padStart(2, "0");
  }

  function renderStageIntro() {
    return [
      '<div class="stage-hero__intro">',
        '<h2>ಕನ್ನಡ ಚಿತ್ರರಂಗದ ಅತಿದೊಡ್ಡ ಪ್ರಶಸ್ತಿ ಸಂಭ್ರಮಕ್ಕೆ ಸುಸ್ವಾಗತ</h2>',
        '<p>ಚಂದನವನದ ಶ್ರೇಷ್ಠ ಪ್ರತಿಭೆಗಳನ್ನು ಗೌರವಿಸುವ, ಕನ್ನಡ ಚಿತ್ರರಂಗದ ಅತ್ಯಂತ ಪ್ರತಿಷ್ಠಿತ ಸಿನಿ ಸಮ್ಮಾನದ ವೇದಿಕೆ.</p>',
      "</div>"
    ].join("");
  }

  function renderHeroTimeline(label, targetDate, ariaLabel) {
    var countdown = getCountdownParts(targetDate);
    return [
      '<aside class="stage-hero__timeline" data-countdown-timer data-countdown-target="' + escapeHtml(targetDate) + '">',
        '<div class="stage-hero__timeline-head">',
          '<span class="stage-hero__panel-label">' + escapeHtml(label) + "</span>",
          '<span class="stage-hero__timeline-date">on ' + escapeHtml(formatDate(targetDate)) + "</span>",
        "</div>",
        '<div class="stage-hero__timer-grid" aria-label="' + escapeHtml(ariaLabel) + '">',
          '<div class="stage-hero__timer-unit">',
            '<strong data-countdown-days>' + formatCountdownUnit(countdown.days) + "</strong>",
            '<span>Days</span>',
          "</div>",
          '<div class="stage-hero__timer-unit">',
            '<strong data-countdown-hours>' + formatCountdownUnit(countdown.hours) + "</strong>",
            '<span>Hours</span>',
          "</div>",
          '<div class="stage-hero__timer-unit">',
            '<strong data-countdown-minutes>' + formatCountdownUnit(countdown.minutes) + "</strong>",
            '<span>Minutes</span>',
          "</div>",
          '<div class="stage-hero__timer-unit">',
            '<strong data-countdown-seconds>' + formatCountdownUnit(countdown.seconds) + "</strong>",
            '<span>Seconds</span>',
          "</div>",
        "</div>",
      "</aside>"
    ].join("");
  }

  function updateCountdownTimers() {
    qsa("[data-countdown-timer]").forEach(function (node) {
      var countdown = getCountdownParts(node.getAttribute("data-countdown-target") || "");
      var days = qs("[data-countdown-days]", node);
      var hours = qs("[data-countdown-hours]", node);
      var minutes = qs("[data-countdown-minutes]", node);
      var seconds = qs("[data-countdown-seconds]", node);
      if (days) days.textContent = formatCountdownUnit(countdown.days);
      if (hours) hours.textContent = formatCountdownUnit(countdown.hours);
      if (minutes) minutes.textContent = formatCountdownUnit(countdown.minutes);
      if (seconds) seconds.textContent = formatCountdownUnit(countdown.seconds);
    });
  }

  var countdownTickerStarted = false;
  function startCountdownTicker() {
    if (countdownTickerStarted) {
      return;
    }
    countdownTickerStarted = true;
    updateCountdownTimers();
    window.setInterval(updateCountdownTimers, 1000);
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
    var copyParts = [renderStageIntro()];
    var actionsHtml = "";

    if (stage === STAGES.during) {
      actionsHtml = [
        '<div class="stage-hero__actions">',
          '<a class="btn btn--primary" href="#/voting">Start voting</a>',
          '<a class="btn btn--ghost" href="#/nominations">Browse nominations</a>',
        "</div>"
      ].join("");
      copyParts.push(actionsHtml);
      copyParts.push(renderHeroTimeline("Voting closes", VOTING_CLOSE_DATE, "Time remaining until voting closes"));
    } else if (stage === STAGES.post) {
      actionsHtml = [
        '<div class="stage-hero__actions">',
          '<a class="btn btn--primary" href="#/winners">View winners</a>',
        "</div>"
      ].join("");
    } else {
      copyParts.push(renderHeroTimeline("Voting opens", eventDate, "Time remaining until voting opens"));
    }

    if (actionsHtml && stage !== STAGES.during) {
      copyParts.push(actionsHtml);
    }

    copyParts.push('<img class="stage-hero__ilu" src="https://images.assettype.com/prajavani/2023-05/3c0c9a4d-1465-4205-b225-bcb20ae0d843/sponsors_banner_logo.png" alt="Sponsors banner logo" loading="eager">');

    return [
      '<section class="section-card stage-hero stage-hero--' + stage + '">',
        '<div class="stage-hero__media">',
          '<img class="stage-hero__trophy" src="https://images.assettype.com/deccanherald/2026-04-30/zrlojphv/PVCS-Trophy.png" alt="PVCS trophy">',
        "</div>",
        '<div class="stage-hero__copy">',
          copyParts.join(""),
        "</div>",
      "</section>"
    ].join("");
  }

  function buildPhotoGalleryCards(stage) {
    return (siteData.votingCategories || []).reduce(function (cards, category) {
      var nominees = (category.nominees || []).slice();
      var featuredNominee = stage === STAGES.post ? (getCategoryWinner(category) || nominees[0]) : nominees[0];
      var orderedNominees = [];
      if (featuredNominee) {
        orderedNominees.push(featuredNominee);
      }
      nominees.forEach(function (nominee) {
        if (!featuredNominee || nominee.id !== featuredNominee.id) {
          orderedNominees.push(nominee);
        }
      });
      orderedNominees.forEach(function (nominee) {
        cards.push({
          title: nominee.title,
          subtitle: category.title,
          meta: nominee.subtitle || "",
          image: nominee.image
        });
      });
      return cards;
    }, []).slice(0, 12);
  }

  function buildVideoReelCards(stage) {
    var placeholderShorts = [
      "https://www.youtube.com/embed/F_1ZFblYT_c",
      "https://www.youtube.com/embed/7ZCRBMlX9OY",
      "https://www.youtube.com/embed/tDeGkWrkOOo",
      "https://www.youtube.com/embed/F_1ZFblYT_c",
      "https://www.youtube.com/embed/7ZCRBMlX9OY",
      "https://www.youtube.com/embed/tDeGkWrkOOo",
      "https://www.youtube.com/embed/F_1ZFblYT_c",
      "https://www.youtube.com/embed/7ZCRBMlX9OY"
    ];
    var labels = {
      "pre-vote": {
        title: "Countdown reel",
        subtitle: "What to watch before voting opens"
      },
      "during-vote": {
        title: "Vote spotlight",
        subtitle: "Short picks from each public category"
      },
      "post-vote": {
        title: "Winner reel",
        subtitle: "Quick recap from the final results"
      }
    };
    var durations = ["00:42", "01:08", "00:56", "01:14", "00:37", "01:02", "00:49", "01:11"];
    var copy = labels[stage] || labels[STAGES.pre];
    var reelVariants = [
      {
        subtitle: copy.title,
        meta: copy.subtitle
      },
      {
        subtitle: "Behind the frame",
        meta: stage === STAGES.post ? "Second look at the winners and standout moments" : "Quick backstage-style cut from the same category"
      }
    ];

    return (siteData.votingCategories || []).reduce(function (cards, category) {
      var nominees = category.nominees || [];
      var featuredNominee = stage === STAGES.post ? (getCategoryWinner(category) || nominees[0]) : nominees[0];
      var alternateNominee = nominees.filter(function (nominee) {
        return !featuredNominee || nominee.id !== featuredNominee.id;
      })[0] || featuredNominee;
      var reelNominees = [featuredNominee, alternateNominee];

      reelNominees.forEach(function (nominee, index) {
        var variant = reelVariants[index];
        if (!nominee || !variant) {
          return;
        }
        cards.push({
          title: category.title,
          subtitle: variant.subtitle,
          meta: variant.meta,
          duration: durations[cards.length] || "00:45",
          image: nominee.image,
          embedUrl: placeholderShorts[cards.length] || placeholderShorts[0]
        });
      });
      return cards;
    }, []).filter(Boolean).slice(0, 8);
  }

  function renderPhotoGallerySection(stage) {
    var cards = buildPhotoGalleryCards(stage);
    return [
      '<section class="content-block section-card media-section media-section--photos">',
        '<div class="content-block__header">',
          '<div>',
            '<p class="eyebrow">Gallery</p>',
            '<h2>Photo gallery</h2>',
          "</div>",
        "</div>",
        '<div class="photo-gallery" aria-label="Photo gallery">' + cards.map(function (card, index) {
          return [
            '<button class="media-card media-card--photo media-card--trigger" type="button" data-gallery-trigger data-gallery-index="' + index + '" data-gallery-src="' + escapeHtml(card.image) + '" data-gallery-alt="' + escapeHtml(card.title) + '" data-gallery-caption="' + escapeHtml(card.title) + '" aria-label="Open ' + escapeHtml(card.title) + ' in gallery viewer">',
              '<img src="' + card.image + '" alt="' + escapeHtml(card.title) + '" loading="lazy" data-fallback-src="' + MEDIA_FALLBACK_SRC + '">',
              '<div class="media-card__copy">',
                '<h3 class="media-card__caption">' + escapeHtml(card.title) + "</h3>",
              "</div>",
            "</button>"
          ].join("");
        }).join("") + "</div>",
      "</section>"
    ].join("");
  }

  function renderVideoGallerySection(stage) {
    var cards = buildVideoReelCards(stage);
    return [
      '<section class="content-block section-card media-section media-section--videos">',
        '<div class="content-block__header">',
          '<div>',
            '<p class="eyebrow">Videos</p>',
            '<h2>Video reels</h2>',
          "</div>",
        "</div>",
        '<div class="reel-strip" aria-label="Video reels">' + cards.map(function (card) {
          return [
            '<article class="media-card reel-card">',
              '<iframe class="reel-card__frame" src="' + escapeHtml(card.embedUrl) + '" title="' + escapeHtml(card.title) + '" loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>',
              '<div class="media-card__copy">',
                '<h3 class="media-card__caption">' + escapeHtml(card.title) + "</h3>",
              "</div>",
            "</article>"
          ].join("");
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
              '<img src="' + winner.image + '" alt="' + escapeHtml(winner.title) + '" data-fallback-src="' + MEDIA_FALLBACK_SRC + '">',
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
    if (stage === STAGES.post) {
      sections.push(renderWinnersPreview());
    }
    sections.push(renderPhotoGallerySection(stage));
    sections.push(renderVideoGallerySection(stage));
    sections.push(renderStatsSection());

    root.setAttribute("data-stage", stage);
    root.innerHTML = sections.join("");
    renderSponsors();
    if (stage === STAGES.pre || stage === STAGES.during) {
      updateCountdownTimers();
    }
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
    var collapsed = isStageControllerCollapsed();
    existing.classList.toggle("is-collapsed", collapsed);
    existing.innerHTML = [
      '<div class="stage-controller__head">',
        '<div class="stage-controller__label">',
          '<span class="eyebrow">Stage</span>',
          '<strong>' + (stage === STAGES.post ? "Post Vote" : stage === STAGES.during ? "During Vote" : "Pre Vote") + "</strong>",
        "</div>",
        '<button type="button" class="stage-controller__toggle" data-stage-controller-toggle aria-expanded="' + (!collapsed) + '">' + (collapsed ? "Show" : "Hide") + "</button>",
      "</div>",
      collapsed
        ? ""
        : [
            '<div class="stage-controller__group">',
              '<button type="button" data-stage-target="' + STAGES.pre + '"' + (stage === STAGES.pre ? ' class="is-active"' : "") + ">Pre Vote</button>",
              '<button type="button" data-stage-target="' + STAGES.during + '"' + (stage === STAGES.during ? ' class="is-active"' : "") + ">During Vote</button>",
              '<button type="button" data-stage-target="' + STAGES.post + '"' + (stage === STAGES.post ? ' class="is-active"' : "") + ">Post Vote</button>",
            "</div>"
          ].join("")
    ].join("");

    existing.onclick = function (event) {
      var toggle = event.target.closest("[data-stage-controller-toggle]");
      if (toggle) {
        setStageControllerCollapsed(!isStageControllerCollapsed());
        return;
      }

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
    initImageFallbacks();
    initGalleryLightbox();
    startCountdownTicker();
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
