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
      menu: "M4.5 7h15M4.5 12h15M4.5 17h15"
    };
    return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="' + (pathMap[name] || pathMap.menu) + '"/></svg>';
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
    if (!list || !siteData.menuLinks) {
      return;
    }

    list.innerHTML = siteData.menuLinks
      .map(function (item) {
        return '<li><a href="' + item.pageUrl + '">' + item.label + "</a></li>";
      })
      .join("");
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
