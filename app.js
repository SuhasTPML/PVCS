(function () {
  var siteData = window.CINE_SITE_DATA || {};

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
    var isVotingPage = currentPage === "voting" || currentPage === "voting-swiper";
    nav.innerHTML = siteData.bottomNav
      .map(function (item) {
        var classes = ["bottom-nav__link"];
        if (item.emphasis) {
          classes.push("is-emphasis");
        }
        if ((item.pageUrl === "index.html" && currentPage === "home") ||
            (item.pageUrl === "voting.html" && isVotingPage) ||
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

  function createVotingCard(nominee, slot, index, categoryId, voteCount, isActive) {
    var classes = ["vote-card", "vote-card--" + slot];
    if (isActive) {
      classes.push("is-active");
    }

    var button = isActive
      ? '<button class="btn btn--primary vote-card__cta" type="button" data-vote-now="true" data-category-id="' + escapeHtml(categoryId) + '">' +
          'Vote Now' +
        "</button>"
      : '<div class="vote-card__ghost">Swipe to bring this nominee forward</div>';

    return (
      '<article class="' + classes.join(" ") + '" data-slot="' + slot + '" data-nominee-id="' + escapeHtml(nominee.id) + '"' +
        ' style="--card-a: ' + nominee.accent[0] + '; --card-b: ' + nominee.accent[1] + ';">' +
        '<div class="vote-card__visual">' +
          '<span class="vote-card__rank">#' + String(index + 1).padStart(2, "0") + "</span>" +
          '<span class="vote-card__subtitle">' + escapeHtml(nominee.subtitle) + "</span>" +
          '<h3>' + escapeHtml(nominee.title) + "</h3>" +
        "</div>" +
        '<div class="vote-card__body">' +
          '<p class="vote-card__summary">' + escapeHtml(nominee.summary) + "</p>" +
          '<div class="vote-card__footer">' +
            '<div class="vote-card__votes">' +
              '<strong data-card-votes>' + formatNumber(voteCount) + "</strong>" +
              "<span>votes</span>" +
            "</div>" +
            button +
          "</div>" +
        "</div>" +
      "</article>"
    );
  }

  function renderVotingDeck(category, state) {
    var nominees = category.nominees || [];
    var total = nominees.length;
    if (!total) {
      return "";
    }

    var active = state.activeIndex || 0;
    var prevIndex = (active - 1 + total) % total;
    var nextIndex = (active + 1) % total;
    var slots = [
      { slot: "prev", index: prevIndex },
      { slot: "active", index: active },
      { slot: "next", index: nextIndex }
    ];

    return slots
      .map(function (item) {
        return createVotingCard(
          nominees[item.index],
          item.slot,
          item.index,
          category.id,
          state.votes[item.index],
          item.slot === "active"
        );
      })
      .join("");
  }

  function renderVotingPage() {
    var root = qs("[data-voting-root]");
    if (!root || !siteData.votingCategories || !siteData.votingCategories.length) {
      return null;
    }

    root.innerHTML = [
      '<section class="section-card voting-intro">',
        '<p class="eyebrow">Voting</p>',
        '<h1>Category-by-category nominee carousel</h1>',
        '<p>Swipe horizontally inside each category to move the active card. Tap Vote Now on the centered nominee, then scroll down for the next category.</p>',
      "</section>"
    ].join("") + siteData.votingCategories.map(function (category) {
      return (
        '<section class="section-card vote-category" data-category-id="' + escapeHtml(category.id) + '">' +
          '<div class="vote-category__header">' +
            '<div class="vote-category__heading">' +
              '<p class="eyebrow">' + escapeHtml(category.label) + "</p>" +
              '<h2>' + escapeHtml(category.title) + "</h2>" +
              '<p class="vote-category__description">' + escapeHtml(category.description) + "</p>" +
            "</div>" +
            '<div class="vote-category__status" aria-live="polite">' +
              '<span class="vote-category__status-count" data-category-vote-count>0 votes cast this session</span>' +
              '<span class="vote-category__status-note" data-category-vote-note>Swipe to explore nominees</span>' +
            "</div>" +
          "</div>" +
          '<div class="vote-carousel" data-carousel>' +
            '<button class="vote-carousel__control vote-carousel__control--prev" type="button" data-carousel-prev aria-label="Previous nominee">‹</button>' +
            '<div class="vote-carousel__stage" data-carousel-stage tabindex="0" aria-roledescription="carousel" aria-label="' + escapeHtml(category.title) + ' nominees">' +
              '<div class="vote-carousel__deck" data-carousel-deck>' +
                renderVotingDeck(category, {
                  activeIndex: 0,
                  votes: category.nominees.map(function (nominee) {
                    return nominee.votes;
                  }),
                  sessionVotes: 0,
                  lastChoice: ""
                }) +
              "</div>" +
            "</div>" +
            '<button class="vote-carousel__control vote-carousel__control--next" type="button" data-carousel-next aria-label="Next nominee">›</button>' +
          "</div>" +
          '<p class="vote-category__hint">' + escapeHtml(category.hint) + "</p>" +
        "</section>"
      );
    }).join("");

    return root;
  }

  function getVotingState() {
    if (!window.__cineVotingState) {
      window.__cineVotingState = {};
    }

    return window.__cineVotingState;
  }

  function refreshVotingCategory(categoryId) {
    var state = getVotingState()[categoryId];
    if (!state) {
      return;
    }

    var category = (siteData.votingCategories || []).filter(function (item) {
      return item.id === categoryId;
    })[0];
    if (!category) {
      return;
    }

    var section = qs('[data-category-id="' + categoryId + '"]');
    if (!section) {
      return;
    }

    var deck = qs("[data-carousel-deck]", section);
    var countNode = qs("[data-category-vote-count]", section);
    var noteNode = qs("[data-category-vote-note]", section);
    if (!deck || !countNode || !noteNode) {
      return;
    }

    deck.innerHTML = renderVotingDeck(category, state);
    countNode.textContent = formatNumber(state.sessionVotes) + " vote" + (state.sessionVotes === 1 ? "" : "s") + " cast this session";
    noteNode.textContent = state.lastChoice
      ? "Latest vote: " + state.lastChoice
      : "Swipe to explore nominees";
  }

  function moveVotingCategory(categoryId, delta) {
    var state = getVotingState()[categoryId];
    var category = (siteData.votingCategories || []).filter(function (item) {
      return item.id === categoryId;
    })[0];
    if (!state || !category || !category.nominees.length) {
      return;
    }

    state.activeIndex = (state.activeIndex + delta + category.nominees.length) % category.nominees.length;
    refreshVotingCategory(categoryId);
  }

  function settleVotingCategory(categoryId) {
    var section = qs('.vote-category[data-category-id="' + categoryId + '"]');
    if (!section) {
      return;
    }

    section.classList.remove("is-settling");
    var stage = qs("[data-carousel-stage]", section);
    if (stage) {
      stage.style.setProperty("--swipe-offset", "0px");
    }
  }

  function registerVote(categoryId) {
    var state = getVotingState()[categoryId];
    var category = (siteData.votingCategories || []).filter(function (item) {
      return item.id === categoryId;
    })[0];
    if (!state || !category) {
      return;
    }

    var nominee = category.nominees[state.activeIndex];
    if (!nominee) {
      return;
    }

    state.votes[state.activeIndex] += 1;
    state.sessionVotes += 1;
    state.lastChoice = nominee.title;
    refreshVotingCategory(categoryId);
  }

  function initVoting() {
    var root = renderVotingPage();
    if (!root || !siteData.votingCategories) {
      return;
    }

    var state = getVotingState();
    siteData.votingCategories.forEach(function (category) {
      if (!state[category.id]) {
        state[category.id] = {
          activeIndex: 0,
          votes: category.nominees.map(function (nominee) {
            return nominee.votes;
          }),
          sessionVotes: 0,
          lastChoice: ""
        };
      }
    });

    qsa(".vote-category", root).forEach(function (section) {
      var categoryId = section.getAttribute("data-category-id");
      var stage = qs("[data-carousel-stage]", section);
      var prevButton = qs("[data-carousel-prev]", section);
      var nextButton = qs("[data-carousel-next]", section);

      if (stage) {
        stage.addEventListener("keydown", function (event) {
          if (event.key === "ArrowLeft") {
            event.preventDefault();
            moveVotingCategory(categoryId, -1);
          }
          if (event.key === "ArrowRight") {
            event.preventDefault();
            moveVotingCategory(categoryId, 1);
          }
        });
      }

      if (prevButton) {
        prevButton.addEventListener("click", function () {
          moveVotingCategory(categoryId, -1);
        });
      }

      if (nextButton) {
        nextButton.addEventListener("click", function () {
          moveVotingCategory(categoryId, 1);
        });
      }
    });

    var dragState = null;
    var settleTimer = null;

    root.addEventListener("click", function (event) {
      var voteButton = event.target.closest("[data-vote-now]");
      if (voteButton) {
        registerVote(voteButton.getAttribute("data-category-id"));
        return;
      }
    });

    root.addEventListener("pointerdown", function (event) {
      var stage = event.target.closest("[data-carousel-stage]");
      if (!stage) {
        return;
      }

      if (stage.classList.contains("is-settling")) {
        return;
      }

      var section = stage.closest("[data-category-id]");
      if (!section) {
        return;
      }

      if (settleTimer) {
        window.clearTimeout(settleTimer);
        settleTimer = null;
      }

      dragState = {
        categoryId: section.getAttribute("data-category-id"),
        stage: stage,
        pointerId: event.pointerId,
        startX: event.clientX,
        startY: event.clientY,
        deltaX: 0,
        deltaY: 0,
        locked: false
      };

      stage.setPointerCapture(event.pointerId);
      stage.classList.add("is-dragging");
    });

    root.addEventListener("pointermove", function (event) {
      if (!dragState || event.pointerId !== dragState.pointerId) {
        return;
      }

      dragState.deltaX = event.clientX - dragState.startX;
      dragState.deltaY = event.clientY - dragState.startY;

      if (!dragState.locked) {
        var horizontal = Math.abs(dragState.deltaX);
        var vertical = Math.abs(dragState.deltaY);
        if (horizontal > 12 && horizontal > vertical) {
          dragState.locked = true;
        }
      }

      if (dragState.locked) {
        dragState.stage.style.setProperty("--swipe-offset", dragState.deltaX + "px");
      }
    });

    function settleDrag() {
      if (!dragState) {
        return;
      }

      var committed = dragState.locked && Math.abs(dragState.deltaX) > 56 && Math.abs(dragState.deltaX) > Math.abs(dragState.deltaY);
      var categoryId = dragState.categoryId;
      var stage = dragState.stage;
      var direction = dragState.deltaX < 0 ? 1 : -1;
      var releaseOffset = committed ? (direction > 0 ? 140 : -140) : 0;

      if (stage.hasPointerCapture && stage.hasPointerCapture(dragState.pointerId)) {
        stage.releasePointerCapture(dragState.pointerId);
      }

      if (committed) {
        stage.classList.remove("is-dragging");
        stage.classList.add("is-settling");
        stage.style.setProperty("--swipe-offset", releaseOffset + "px");
        settleTimer = window.setTimeout(function () {
          moveVotingCategory(categoryId, direction);
          requestAnimationFrame(function () {
            settleVotingCategory(categoryId);
          });
          settleTimer = null;
        }, 170);
      } else {
        stage.classList.remove("is-dragging");
        stage.style.setProperty("--swipe-offset", "0px");
      }

      dragState = null;
    }

    root.addEventListener("pointerup", settleDrag);
    root.addEventListener("pointercancel", settleDrag);
    root.addEventListener("lostpointercapture", settleDrag);

    qsa(".vote-category", root).forEach(function (section) {
      refreshVotingCategory(section.getAttribute("data-category-id"));
    });
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
    initVoting();
  });
})();
