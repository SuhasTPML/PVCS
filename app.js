(function () {
  var siteData = window.CINE_SITE_DATA || {};

  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
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
    if (item.menuTrigger) {
      return "menu";
    }
    if (page === "index.html") return "home";
    if (page === "voting.html") return "vote";
    if (page === "contest.html") return "contest";
    if (page === "process.html") return "process";
    if (page === "about.html") return "about";
    if (page === "jury.html") return "jury";
    if (page === "cine-corner.html") return "cineCorner";
    if (page === "previous-years.html") return "previousYears";
    if (page === "terms.html") return "terms";
    return "menu";
  }

  function renderBottomNav() {
    var nav = qs("[data-bottom-nav]");
    if (!nav || !siteData.bottomNav) {
      return;
    }

    var currentPage = document.body.getAttribute("data-page") || "home";
    nav.innerHTML = siteData.bottomNav
      .map(function (item) {
        var classes = ["bottom-nav__link"];
        if (item.emphasis) {
          classes.push("is-emphasis");
        }
        if ((item.pageUrl === "index.html" && currentPage === "home") ||
            (item.pageUrl === currentPage + ".html")) {
          classes.push("is-active");
        }
        if (item.menuTrigger) {
          classes.push("js-menu-trigger");
        }
        return (
          '<a class="' + classes.join(" ") + '" href="' + item.pageUrl + '"' +
          (item.menuTrigger ? ' data-menu-trigger="true"' : "") + ">" +
          '<span class="bottom-nav__icon">' + createNavIcon(item.icon) + "</span>" +
          '<span class="bottom-nav__label">' + item.label + "</span>" +
          "</a>"
        );
      })
      .join("");
  }

  function renderMenu() {
    var list = qs("[data-menu-links]");
    if (!list) {
      return;
    }

    var currentPage = document.body.getAttribute("data-page") || "home";
    var primaryLinks = (siteData.bottomNav || [])
      .filter(function (item) {
        return !item.menuTrigger;
      })
      .map(function (item) {
        return {
          label: item.label,
          pageUrl: item.pageUrl
        };
      });
    var secondaryLinks = siteData.menuLinks || [];
    function renderLink(item) {
      var classes = [];
      if ((item.pageUrl === "index.html" && currentPage === "home") ||
          (item.pageUrl === currentPage + ".html")) {
        classes.push("is-active");
      }
      return '<li><a' +
        (classes.length ? ' class="' + classes.join(" ") + '"' : "") +
        ' href="' + item.pageUrl + '">' +
        '<span class="side-menu__icon">' + createNavIcon(itemIconName(item)) + '</span>' +
        '<span class="side-menu__label">' + item.label + '</span>' +
        '<span class="side-menu__chevron" aria-hidden="true">›</span>' +
        "</a></li>";
    }

    list.innerHTML =
      '<section class="side-menu__section">' +
        '<div class="side-menu__section-title">ಮುಖ್ಯ ವಿಭಾಗಗಳು</div>' +
        '<ul class="side-menu__list">' +
          primaryLinks.map(renderLink).join("") +
        "</ul>" +
      "</section>" +
      '<section class="side-menu__section">' +
        '<div class="side-menu__section-title">ಇತರೆ</div>' +
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
          '<span class="sponsor-chip__label">' + item.label + "</span>" +
          '<img src="' + item.imageUrl + '" alt="' + item.label + '" loading="lazy">' +
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
    if (!hasSeen && document.body.getAttribute("data-page") === "home") {
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

  function initMenu() {
    var menu = qs("[data-side-menu]");
    var overlay = qs("[data-menu-overlay]");
    if (!menu || !overlay) {
      return;
    }

    function openMenu() {
      menu.classList.add("is-open");
      overlay.hidden = false;
      document.body.classList.add("has-overlay", "has-menu-open");
      var firstLink = qs("a", menu);
      if (firstLink) {
        firstLink.focus();
      }
    }

    function closeMenu() {
      menu.classList.remove("is-open");
      overlay.hidden = true;
      document.body.classList.remove("has-overlay", "has-menu-open");
    }

    qsa("[data-menu-trigger]").forEach(function (trigger) {
      trigger.addEventListener("click", function (event) {
        event.preventDefault();
        openMenu();
      });
    });

    qsa("[data-menu-close]").forEach(function (trigger) {
      trigger.addEventListener("click", closeMenu);
    });

    qsa("a", menu).forEach(function (link) {
      link.addEventListener("click", closeMenu);
    });

    overlay.addEventListener("click", closeMenu);
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

  document.addEventListener("DOMContentLoaded", function () {
    renderBottomNav();
    renderMenu();
    renderSponsors();
    initPopup();
    initMenu();
    initYear();
  });
})();
