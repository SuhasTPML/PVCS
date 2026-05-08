(function () {
  var siteData = window.CINE_SITE_DATA || {};
  var STAGE_KEY = "pvcs-stage";
  var VOTING_CLOSE_DATE = "2026-05-24";
  var MEDIA_FALLBACK_SRC = "PVCS_Trophy_with_bg.svg";
  var LOCAL_GALLERY_IMAGES = [
    "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1478720568477-152d9b164e26?auto=format&fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1513106580091-1d82408b8cd6?auto=format&fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1518998053901-5348d3961a04?auto=format&fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1524985069026-dd778a71c7b4?auto=format&fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1518929458119-e5bf444c30f4?auto=format&fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?auto=format&fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1505685296765-3a2736de412f?auto=format&fit=crop&w=900&q=80"
  ];
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

  function getYoutubeVideoId(url) {
    var match = String(url || "").match(/\/embed\/([^?&]+)/);
    return match ? match[1] : "";
  }

  function getYoutubeThumbnail(url) {
    var videoId = getYoutubeVideoId(url);
    return videoId ? "https://i.ytimg.com/vi/" + videoId + "/hqdefault.jpg" : MEDIA_FALLBACK_SRC;
  }

  function getYoutubeAutoplayUrl(url) {
    if (!url) {
      return "";
    }
    return url + (url.indexOf("?") === -1 ? "?" : "&") + "autoplay=1&playsinline=1&rel=0";
  }

  function getLocalGalleryImage(index) {
    return LOCAL_GALLERY_IMAGES[index % LOCAL_GALLERY_IMAGES.length] || MEDIA_FALLBACK_SRC;
  }

  function bindSwipeNavigation(node, onPrev, onNext) {
    if (!node) {
      return;
    }
    var startX = 0;
    var startY = 0;
    var tracking = false;

    node.addEventListener("touchstart", function (event) {
      var touch = event.changedTouches && event.changedTouches[0];
      if (!touch) {
        return;
      }
      startX = touch.clientX;
      startY = touch.clientY;
      tracking = true;
    }, { passive: true });

    node.addEventListener("touchend", function (event) {
      var touch = event.changedTouches && event.changedTouches[0];
      var deltaX;
      var deltaY;
      if (!tracking || !touch) {
        return;
      }
      tracking = false;
      deltaX = touch.clientX - startX;
      deltaY = touch.clientY - startY;

      if (Math.abs(deltaX) < 40 || Math.abs(deltaX) < Math.abs(deltaY)) {
        return;
      }
      if (deltaX > 0) {
        onPrev();
      } else {
        onNext();
      }
    }, { passive: true });

    node.addEventListener("touchcancel", function () {
      tracking = false;
    }, { passive: true });
  }

  function getStripScrollAmount(strip) {
    var firstItem;
    var gap;
    if (!strip) {
      return 0;
    }
    firstItem = strip.firstElementChild;
    gap = parseFloat(window.getComputedStyle(strip).columnGap || window.getComputedStyle(strip).gap || "0") || 0;
    if (firstItem) {
      return Math.round(firstItem.getBoundingClientRect().width + gap);
    }
    return Math.max(Math.round(strip.clientWidth * 0.82), 240);
  }

  function stepStrip(strip, direction) {
    if (!strip) {
      return;
    }
    strip.scrollBy({
      left: getStripScrollAmount(strip) * direction,
      behavior: "smooth"
    });
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
      photos: "photos",
      videos: "videos",
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
    var reelLightbox = qs("[data-reel-lightbox]");
    var hasOverlay = Boolean(
      (menu && menu.classList.contains("is-open")) ||
      (popup && popup.classList.contains("is-visible")) ||
      (lightbox && lightbox.classList.contains("is-visible")) ||
      (reelLightbox && reelLightbox.classList.contains("is-visible"))
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

  function getStageNavigation() {
    var navigation = siteData.navigation || {};
    var stageNavigation = navigation[getStage()];
    if (stageNavigation) {
      return stageNavigation;
    }
    return {
      desktop: (siteData.bottomNav || []).filter(function (item) {
        return !item.menuTrigger;
      }).concat(siteData.menuLinks || []).slice(0, 6),
      mobile: siteData.bottomNav || [],
      menu: (siteData.bottomNav || []).filter(function (item) {
        return !item.menuTrigger;
      }).concat(siteData.menuLinks || [])
    };
  }

  function isNavItemActive(item, currentPage) {
    var href = getEffectiveHref(item);
    if (href === "#/") {
      return currentPage === "home";
    }
    if (href === "#/voting") {
      return currentPage === "voting" || currentPage === "nominations";
    }
    return href === "#/" + currentPage;
  }

  function createNavIcon(name) {
    var pathMap = {
      home: "M12 3.5 3.5 10v10.5h5.5v-6h6v6h5.5V10z",
      vote: "M5 6.5h14v11H5zm2 2v7h10v-7zm2.5-4h5l1 2h-7z",
      contest: "M7 5h10v3h2v10H5V8h2zm2 5.5 2 2 4-4",
      process: "M6 6h12v3H6zm0 5h12v3H6zm0 5h8v3H6z",
      photo: "M5 6.5h14v11H5zm2 2v7h10v-7zm1.5 6 2.5-3 2 2 1.5-2 2 3z",
      video: "M6 6.5h12v11H6zm4 2.5 4 3-4 3z",
      winners: "M12 4.5l2.2 4.45 4.91.71-3.55 3.46.84 4.88L12 15.9 7.58 18l.84-4.88L4.87 9.66l4.91-.71z",
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
    if (page === "#/winners") return "winners";
    if (page === "#/contest") return "contest";
    if (page === "#/process") return "process";
    if (page === "#/photos") return "photo";
    if (page === "#/videos") return "video";
    if (page === "#/about") return "about";
    if (page === "#/jury") return "jury";
    if (page === "#/cine-corner") return "cineCorner";
    if (page === "#/previous-years") return "previousYears";
    if (page === "#/terms") return "terms";
    return "menu";
  }

  function renderBottomNav() {
    var nav = qs("[data-bottom-nav]");
    var stageNavigation = getStageNavigation();
    var items = stageNavigation.mobile || [];
    if (!nav || !items.length) {
      return;
    }

    var currentPage = getCurrentPageValue(getRoute());

    nav.innerHTML = items
      .map(function (item) {
        var classes = ["bottom-nav__link"];
        var href = getEffectiveHref(item);
        if (item.emphasis) {
          classes.push("is-emphasis");
        }
        if (isNavItemActive(item, currentPage)) {
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
    var stageNavigation = getStageNavigation();
    var items = stageNavigation.desktop || [];
    if (!el || !items.length) return;

    var currentPage = getCurrentPageValue(getRoute());

    el.innerHTML = items
      .map(function (item) {
        var classes = ["header-nav__link"];
        var href = getEffectiveHref(item);
        if (item.emphasis) classes.push("is-emphasis");
        if (isNavItemActive(item, currentPage)) classes.push("is-active");
        return '<a class="' + classes.join(" ") + '" href="' + href + '">' + escapeHtml(item.label) + "</a>";
      })
      .join("");
  }

  function renderMenu() {
    var list = qs("[data-menu-links]");
    if (!list) {
      return;
    }

    var currentPage = getCurrentPageValue(getRoute());
    var currentStage = getStage();
    var menuLinks = getStageNavigation().menu || [];

    function renderLink(item) {
      var classes = [];
      if (isNavItemActive(item, currentPage)) {
        classes.push("is-active");
      }
      return (
        "<li><a" +
        (classes.length ? ' class="' + classes.join(" ") + '"' : "") +
        ' href="' + getEffectiveHref(item) + '">' +
        '<span class="side-menu__icon">' + createNavIcon(itemIconName(item)) + "</span>" +
        '<span class="side-menu__label">' + escapeHtml(item.label) + "</span>" +
        '<span class="side-menu__chevron" aria-hidden="true">›</span>' +
        "</a></li>"
      );
    }

    function renderStageButton(stage, label) {
      return (
        '<button type="button"' +
        ' class="side-menu__stage-button' + (currentStage === stage ? " is-active" : "") + '"' +
        ' data-stage-target="' + stage + '">' +
        escapeHtml(label) +
        "</button>"
      );
    }

    list.innerHTML =
      '<section class="side-menu__section">' +
        '<div class="side-menu__section-title">All sections</div>' +
        '<ul class="side-menu__list">' +
          menuLinks.map(renderLink).join("") +
        "</ul>" +
      "</section>" +
      '<section class="side-menu__section side-menu__section--review">' +
        '<div class="side-menu__section-title">Review</div>' +
        '<div class="side-menu__stage-group">' +
          renderStageButton(STAGES.pre, "Pre Vote") +
          renderStageButton(STAGES.during, "During Vote") +
          renderStageButton(STAGES.post, "Post Vote") +
        "</div>" +
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
      var firstControl = qs("a, button", menu);
      if (firstControl) {
        firstControl.focus();
      }
    }
    if (overlay) {
      overlay.hidden = false;
    }
    document.body.classList.add("has-menu-open");
    syncOverlayState();
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

  function closeReelLightbox() {
    var lightbox = qs("[data-reel-lightbox]");
    var frame = qs("[data-reel-lightbox-frame]", lightbox);
    if (!lightbox) {
      return;
    }
    lightbox.classList.remove("is-visible");
    lightbox.hidden = true;
    if (frame) {
      frame.src = "";
      frame.title = "";
    }
    syncOverlayState();
  }

  function getReelItems() {
    return qsa("[data-reel-trigger]").map(function (node) {
      return {
        src: node.getAttribute("data-reel-src") || "",
        caption: node.getAttribute("data-reel-caption") || ""
      };
    }).filter(function (item) {
      return item.src;
    });
  }

  function renderReelLightboxFrame(lightbox) {
    var items = lightbox.__reelItems || [];
    if (!items.length) {
      closeReelLightbox();
      return;
    }

    var index = Math.max(0, Math.min(lightbox.__reelIndex || 0, items.length - 1));
    var item = items[index];
    var frame = qs("[data-reel-lightbox-frame]", lightbox);
    var caption = qs("[data-reel-lightbox-caption]", lightbox);
    var count = qs("[data-reel-lightbox-count]", lightbox);
    var prev = qs("[data-reel-lightbox-prev]", lightbox);
    var next = qs("[data-reel-lightbox-next]", lightbox);

    lightbox.__reelIndex = index;
    frame.src = getYoutubeAutoplayUrl(item.src);
    frame.title = item.caption;
    caption.textContent = item.caption;
    count.textContent = String(index + 1) + " / " + String(items.length);
    prev.disabled = items.length < 2;
    next.disabled = items.length < 2;
  }

  function stepReelLightbox(delta) {
    var lightbox = qs("[data-reel-lightbox]");
    if (!lightbox || !lightbox.classList.contains("is-visible")) {
      return;
    }

    var items = lightbox.__reelItems || [];
    if (!items.length) {
      return;
    }

    lightbox.__reelIndex = (lightbox.__reelIndex + delta + items.length) % items.length;
    renderReelLightboxFrame(lightbox);
  }

  function openReelLightbox(index) {
    var lightbox = qs("[data-reel-lightbox]");
    var items = getReelItems();
    if (!lightbox || !items.length) {
      return;
    }

    lightbox.__reelItems = items;
    lightbox.__reelIndex = Math.max(0, Math.min(index || 0, items.length - 1));
    renderReelLightboxFrame(lightbox);
    lightbox.hidden = false;
    lightbox.classList.add("is-visible");
    syncOverlayState();

    var closeButton = qs("[data-reel-lightbox-close]", lightbox);
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
      bindSwipeNavigation(panel, function () {
        stepGalleryLightbox(-1);
      }, function () {
        stepGalleryLightbox(1);
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
  }

  function initReelLightbox() {
    var lightbox = qs("[data-reel-lightbox]");
    if (!lightbox || lightbox.__pvcsReelLightboxBound) {
      return;
    }
    lightbox.__pvcsReelLightboxBound = true;
    var panel = qs(".reel-lightbox__panel", lightbox);
    var closeButton = qs("[data-reel-lightbox-close]", lightbox);
    var prevButton = qs("[data-reel-lightbox-prev]", lightbox);
    var nextButton = qs("[data-reel-lightbox-next]", lightbox);

    if (panel) {
      panel.addEventListener("click", function (event) {
        event.stopPropagation();
      });
      bindSwipeNavigation(panel, function () {
        stepReelLightbox(-1);
      }, function () {
        stepReelLightbox(1);
      });
    }
    if (closeButton) {
      closeButton.addEventListener("click", function (event) {
        event.preventDefault();
        event.stopPropagation();
        closeReelLightbox();
      });
    }
    if (prevButton) {
      prevButton.addEventListener("click", function (event) {
        event.preventDefault();
        event.stopPropagation();
        stepReelLightbox(-1);
      });
    }
    if (nextButton) {
      nextButton.addEventListener("click", function (event) {
        event.preventDefault();
        event.stopPropagation();
        stepReelLightbox(1);
      });
    }
    lightbox.addEventListener("click", function () {
      closeReelLightbox();
    });

    document.addEventListener("click", function (event) {
      var trigger = event.target.closest("[data-reel-trigger]");
      if (trigger) {
        event.preventDefault();
        openReelLightbox(Number(trigger.getAttribute("data-reel-index") || 0));
      }
    });

    document.addEventListener("keydown", function (event) {
      if (!lightbox.classList.contains("is-visible")) {
        return;
      }

      if (event.key === "ArrowLeft") {
        event.preventDefault();
        stepReelLightbox(-1);
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        stepReelLightbox(1);
      } else if (event.key === "Escape") {
        closeReelLightbox();
      }
    });
  }

  function initStripControls() {
    document.addEventListener("click", function (event) {
      var control = event.target.closest("[data-strip-control]");
      var stripId;
      var strip;
      var direction;
      if (!control) {
        return;
      }
      stripId = control.getAttribute("data-strip-target");
      strip = stripId ? document.getElementById(stripId) : null;
      direction = control.getAttribute("data-strip-control") === "prev" ? -1 : 1;
      if (!strip) {
        return;
      }
      event.preventDefault();
      stepStrip(strip, direction);
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
          return;
        }
        var stageButton = event.target.closest("[data-stage-target]");
        if (stageButton) {
          setStage(stageButton.getAttribute("data-stage-target"));
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
        closeReelLightbox();
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
          image: getLocalGalleryImage(cards.length)
        });
      });
      return cards;
    }, []).slice(0, 12);
  }

  function buildVideoReelCards(stage) {
    var reelEmbeds = [
      "https://www.youtube.com/embed/F_1ZFblYT_c",
      "https://www.youtube.com/embed/7ZCRBMlX9OY",
      "https://www.youtube.com/embed/tDeGkWrkOOo",
      "https://www.youtube.com/embed/F_1ZFblYT_c",
      "https://www.youtube.com/embed/7ZCRBMlX9OY",
      "https://www.youtube.com/embed/tDeGkWrkOOo",
      "https://www.youtube.com/embed/F_1ZFblYT_c",
      "https://www.youtube.com/embed/7ZCRBMlX9OY"
    ];

    return (siteData.votingCategories || []).reduce(function (cards, category) {
      var nominees = category.nominees || [];
      var featuredNominee = stage === STAGES.post ? (getCategoryWinner(category) || nominees[0]) : nominees[0];
      var alternateNominee = nominees.filter(function (nominee) {
        return !featuredNominee || nominee.id !== featuredNominee.id;
      })[0] || featuredNominee;
      var reelNominees = [featuredNominee, alternateNominee];

      reelNominees.forEach(function (nominee) {
        if (!nominee) {
          return;
        }
        cards.push({
          title: nominee.title,
          image: getYoutubeThumbnail(reelEmbeds[cards.length] || reelEmbeds[0]),
          embedUrl: reelEmbeds[cards.length] || reelEmbeds[0]
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
          '<div class="strip-controls" aria-label="Scroll photo gallery">',
            '<button class="strip-control" type="button" data-strip-control="prev" data-strip-target="home-photo-gallery" aria-label="Scroll photos left">',
              '<span aria-hidden="true">&larr;</span>',
            "</button>",
            '<button class="strip-control" type="button" data-strip-control="next" data-strip-target="home-photo-gallery" aria-label="Scroll photos right">',
              '<span aria-hidden="true">&rarr;</span>',
            "</button>",
          "</div>",
        "</div>",
        '<div class="photo-gallery" id="home-photo-gallery" aria-label="Photo gallery">' + cards.map(function (card, index) {
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
          '<div class="strip-controls" aria-label="Scroll video reels">',
            '<button class="strip-control" type="button" data-strip-control="prev" data-strip-target="home-reel-strip" aria-label="Scroll reels left">',
              '<span aria-hidden="true">&larr;</span>',
            "</button>",
            '<button class="strip-control" type="button" data-strip-control="next" data-strip-target="home-reel-strip" aria-label="Scroll reels right">',
              '<span aria-hidden="true">&rarr;</span>',
            "</button>",
          "</div>",
        "</div>",
        '<div class="reel-strip" id="home-reel-strip" aria-label="Video reels">' + cards.map(function (card, index) {
          return [
            '<button class="media-card reel-card reel-card--trigger" type="button" data-reel-trigger data-reel-index="' + index + '" data-reel-src="' + escapeHtml(card.embedUrl) + '" data-reel-caption="' + escapeHtml(card.title) + '" aria-label="Play ' + escapeHtml(card.title) + ' reel">',
              '<img src="' + card.image + '" alt="' + escapeHtml(card.title) + '" loading="lazy" data-fallback-src="' + MEDIA_FALLBACK_SRC + '">',
              '<span class="reel-card__play" aria-hidden="true"></span>',
              '<div class="media-card__copy">',
                '<h3 class="media-card__caption">' + escapeHtml(card.title) + "</h3>",
              "</div>",
            "</button>"
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

  function renderPhotosPage() {
    var root = qs("[data-photos-root]");
    if (!root) {
      return;
    }
    if (getRoute() !== "photos") {
      root.innerHTML = "";
      return;
    }
    root.innerHTML = renderPhotoGallerySection(getStage());
  }

  function renderVideosPage() {
    var root = qs("[data-videos-root]");
    if (!root) {
      return;
    }
    if (getRoute() !== "videos") {
      root.innerHTML = "";
      return;
    }
    root.innerHTML = renderVideoGallerySection(getStage());
  }

  function renderSharedChrome() {
    document.body.setAttribute("data-stage", getStage());
    renderBottomNav();
    renderHeaderNav();
    renderMenu();
    renderSponsors();
    renderPhotosPage();
    renderVideosPage();
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
    initReelLightbox();
    initStripControls();
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
