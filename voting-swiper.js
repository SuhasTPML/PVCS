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

  function getState() {
    if (!window.__cineVotingSwiperState) {
      window.__cineVotingSwiperState = {};
    }

    return window.__cineVotingSwiperState;
  }

  function getCategory(categoryId) {
    return (siteData.votingCategories || []).filter(function (item) {
      return item.id === categoryId;
    })[0];
  }

  function renderCard(category, nominee, index, isActive) {
    return (
      '<article class="vote-card vote-card--swiper" data-nominee-id="' + escapeHtml(nominee.id) + '" ' +
        'style="--card-a:' + nominee.accent[0] + '; --card-b:' + nominee.accent[1] + ';">' +
        '<div class="vote-card__visual">' +
          '<span class="vote-card__rank">#' + String(index + 1).padStart(2, "0") + "</span>" +
          '<span class="vote-card__subtitle">' + escapeHtml(nominee.subtitle) + "</span>" +
          '<h3>' + escapeHtml(nominee.title) + "</h3>" +
        "</div>" +
        '<div class="vote-card__body">' +
          '<p class="vote-card__summary">' + escapeHtml(nominee.summary) + "</p>" +
          '<div class="vote-card__footer">' +
            '<div class="vote-card__votes">' +
              '<strong data-vote-count-nominee="' + escapeHtml(nominee.id) + '">' + formatNumber(nominee.votes) + "</strong>" +
              "<span>votes</span>" +
            "</div>" +
            '<button class="btn btn--primary vote-card__cta" type="button" data-vote-now="true" data-category-id="' + escapeHtml(category.id) + '"' +
              (isActive ? "" : ' tabindex="-1" aria-hidden="true"') + ">" +
              "Vote Now" +
            "</button>" +
          "</div>" +
        "</div>" +
      "</article>"
    );
  }

  function renderCategory(category) {
    return (
      '<section class="section-card vote-category vote-category--swiper" data-category-id="' + escapeHtml(category.id) + '">' +
        '<div class="vote-category__header">' +
          '<div class="vote-category__heading">' +
            '<p class="eyebrow">' + escapeHtml(category.label) + "</p>" +
            '<h2>' + escapeHtml(category.title) + "</h2>" +
            '<p class="vote-category__description">' + escapeHtml(category.description) + "</p>" +
          "</div>" +
          '<div class="vote-category__status" aria-live="polite">' +
            '<span class="vote-category__status-count" data-category-vote-count>0 votes cast this session</span>' +
            '<span class="vote-category__status-note" data-category-vote-note>Swipe left or right to change nominee focus</span>' +
          "</div>" +
        "</div>" +
        '<div class="vote-carousel vote-carousel--swiper">' +
          '<button class="vote-carousel__control vote-carousel__control--prev" type="button" data-swiper-prev aria-label="Previous nominee">‹</button>' +
          '<div class="swiper vote-swiper" data-swiper-id="' + escapeHtml(category.id) + '" aria-label="' + escapeHtml(category.title) + ' nominees">' +
            '<div class="swiper-wrapper">' +
              category.nominees.map(function (nominee, index) {
                return '<div class="swiper-slide">' + renderCard(category, nominee, index, index === 0) + "</div>";
              }).join("") +
            "</div>" +
          "</div>" +
          '<button class="vote-carousel__control vote-carousel__control--next" type="button" data-swiper-next aria-label="Next nominee">›</button>' +
        "</div>" +
        '<p class="vote-category__hint">' + escapeHtml(category.hint) + "</p>" +
      "</section>"
    );
  }

  function renderPage() {
    var root = qs("[data-voting-swiper-root]");
    if (!root || !siteData.votingCategories || !siteData.votingCategories.length) {
      return null;
    }

    root.innerHTML = [
      '<section class="section-card voting-intro voting-intro--swiper">',
        '<p class="eyebrow">Voting Swiper Copy</p>',
        '<h1>Category carousels powered by Swiper</h1>',
        '<p>This version keeps the same voting data, but uses Swiper for the swipe interaction and slide motion.</p>',
        '<a class="btn btn--ghost" href="voting.html">Open custom version</a>',
      "</section>"
    ].join("") + siteData.votingCategories.map(renderCategory).join("");

    return root;
  }

  function updateStatus(categoryId) {
    var state = getState()[categoryId];
    var category = getCategory(categoryId);
    if (!state || !category) {
      return;
    }

    var section = qs('.vote-category[data-category-id="' + categoryId + '"]');
    if (!section) {
      return;
    }

    var countNode = qs("[data-category-vote-count]", section);
    var noteNode = qs("[data-category-vote-note]", section);
    if (countNode) {
      countNode.textContent = formatNumber(state.sessionVotes) + " vote" + (state.sessionVotes === 1 ? "" : "s") + " cast this session";
    }
    if (noteNode) {
      noteNode.textContent = state.lastChoice
        ? "Latest vote: " + state.lastChoice
        : "Swipe left or right to change nominee focus";
    }
  }

  function updateNomineeCount(section, nomineeId, votes) {
    qsa('[data-vote-count-nominee="' + nomineeId + '"]', section).forEach(function (node) {
      node.textContent = formatNumber(votes);
    });
  }

  function refreshActiveButtons(section) {
    qsa(".swiper-slide", section).forEach(function (slide) {
      var button = qs("[data-vote-now]", slide);
      if (!button) {
        return;
      }
      if (slide.classList.contains("swiper-slide-active")) {
        button.removeAttribute("tabindex");
        button.removeAttribute("aria-hidden");
      } else {
        button.setAttribute("tabindex", "-1");
        button.setAttribute("aria-hidden", "true");
      }
    });
  }

  function initCategory(category) {
    var section = qs('.vote-category[data-category-id="' + category.id + '"]');
    var swiperEl = qs('[data-swiper-id="' + category.id + '"]', section);
    var prev = qs("[data-swiper-prev]", section);
    var next = qs("[data-swiper-next]", section);
    var state = getState()[category.id];
    if (!section || !swiperEl || typeof Swiper === "undefined") {
      return;
    }

    function go(delta) {
      var total = category.nominees.length;
      if (!total) {
        return;
      }

      var nextIndex = (swiper.realIndex + delta + total) % total;
      swiper.slideToLoop(nextIndex);
    }

    var swiper = new Swiper(swiperEl, {
      slidesPerView: "auto",
      centeredSlides: true,
      loop: true,
      grabCursor: true,
      watchSlidesProgress: true,
      followFinger: true,
      threshold: 0,
      touchRatio: 0.85,
      touchAngle: 30,
      speed: 500,
      spaceBetween: 18,
      slideToClickedSlide: true,
      mousewheel: {
        enabled: true,
        forceToAxis: true,
        releaseOnEdges: true,
        sensitivity: 0.8
      },
      keyboard: {
        enabled: true,
        onlyInViewport: true
      },
      breakpoints: {
        760: {
          threshold: 8,
          touchRatio: 1
        }
      },
      effect: "creative",
      creativeEffect: {
        limitProgress: 2,
        perspective: true,
        progressMultiplier: 1,
        prev: {
          translate: ["-88%", 18, -220],
          rotate: [0, 0, -8],
          scale: 0.84,
          opacity: 0.78
        },
        next: {
          translate: ["88%", 18, -220],
          rotate: [0, 0, 8],
          scale: 0.84,
          opacity: 0.78
        }
      },
      on: {
        init: function () {
          state.activeIndex = this.realIndex || 0;
          refreshActiveButtons(section);
          updateStatus(category.id);
        },
        slideChange: function () {
          state.activeIndex = this.realIndex || 0;
          refreshActiveButtons(section);
          updateStatus(category.id);
        }
      }
    });

    state.swiper = swiper;

    if (prev) {
      prev.addEventListener("click", function () {
        go(-1);
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        go(1);
      });
    }
  }

  function registerVote(categoryId) {
    var state = getState()[categoryId];
    var category = getCategory(categoryId);
    if (!state || !category) {
      return;
    }

    var nominee = category.nominees[state.activeIndex || 0];
    if (!nominee) {
      return;
    }

    state.votes[state.activeIndex] += 1;
    state.sessionVotes += 1;
    state.lastChoice = nominee.title;

    var section = qs('.vote-category[data-category-id="' + categoryId + '"]');
    if (section) {
      updateNomineeCount(section, nominee.id, state.votes[state.activeIndex]);
    }

    updateStatus(categoryId);
  }

  function init() {
    var root = renderPage();
    if (!root) {
      return;
    }

    (siteData.votingCategories || []).forEach(function (category) {
      if (!getState()[category.id]) {
        getState()[category.id] = {
          activeIndex: 0,
          votes: category.nominees.map(function (nominee) {
            return nominee.votes;
          }),
          sessionVotes: 0,
          lastChoice: "",
          swiper: null
        };
      }
    });

    qsa(".vote-category", root).forEach(function (section) {
      var category = getCategory(section.getAttribute("data-category-id"));
      if (category) {
        initCategory(category);
      }
    });

    root.addEventListener("click", function (event) {
      var voteButton = event.target.closest("[data-vote-now]");
      if (!voteButton) {
        return;
      }
      registerVote(voteButton.getAttribute("data-category-id"));
    });
  }

  document.addEventListener("DOMContentLoaded", init);
})();
