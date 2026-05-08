(function () {
  var siteData = window.CINE_SITE_DATA || {};
  var STAGES = {
    pre: "pre-vote",
    during: "during-vote",
    post: "post-vote"
  };
  var MAX_PHONE = 10;
  var VOTE_PLACEHOLDER_IMAGE = "https://placehold.co/640x420/1d0100/f8c55f?text=PVCS";

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

  function prefersReducedMotion() {
    return window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  function getRoute() {
    return location.hash.replace(/^#\/?/, "").trim() || "home";
  }

  function getStage() {
    return document.body.getAttribute("data-stage") || siteData.defaultStage || STAGES.pre;
  }

  function getCategories() {
    var categories = siteData.votingCategories || [];
    var publicIds = siteData.publicVoteCategoryIds || [];
    return categories.filter(function (category) {
      return publicIds.indexOf(category.id) !== -1;
    });
  }

  function getNominationCategories() {
    return siteData.nominationCategories || [];
  }

  function isPublicNominationCategory(category) {
    if (!category) {
      return false;
    }
    if (category.isPublicVotingCategory) {
      return true;
    }
    return Boolean(category.linkedVotingCategoryId) &&
      (siteData.publicVoteCategoryIds || []).indexOf(category.linkedVotingCategoryId) !== -1;
  }

  function getCategory(categoryId) {
    return getCategories().filter(function (item) {
      return item.id === categoryId;
    })[0];
  }

  function getState() {
    if (!window.__pvcsVotingState) {
      window.__pvcsVotingState = {
        selections: {},
        currentStep: 0,
        phone: {
          name: "",
          district: "Others",
          mobile: "",
          status: "idle",
          message: ""
        },
        activeCategoryId: "",
        submissionStatus: "idle",
        submissionMessage: ""
      };
    }
    return window.__pvcsVotingState;
  }

  function ensureSelectionState() {
    var state = getState();
    getCategories().forEach(function (category) {
      if (!state.selections[category.id]) {
        state.selections[category.id] = {
          nomineeId: "",
          nomineeTitle: "",
          nomineeIndex: -1
        };
      }
    });
    return state;
  }

  function getSelectedNominee(category) {
    var state = getState().selections[category.id] || {};
    if (!state.nomineeId) {
      return null;
    }
    return (category.nominees || []).filter(function (nominee) {
      return nominee.id === state.nomineeId;
    })[0] || null;
  }

  function getCompletedCount() {
    return getCategories().reduce(function (count, category) {
      var selection = getState().selections[category.id];
      return count + (selection && selection.nomineeId ? 1 : 0);
    }, 0);
  }

  function getStatsVisible() {
    var eventDate = siteData.eventDate;
    if (!eventDate) {
      return false;
    }
    return Date.now() >= (new Date(String(eventDate) + "T00:00:00").getTime() - (2 * 24 * 60 * 60 * 1000));
  }

  function getTopNominees(category, count) {
    return (category.nominees || [])
      .slice()
      .sort(function (a, b) {
        return Number(b.votes || 0) - Number(a.votes || 0);
      })
      .slice(0, count || 3);
  }

  function isValidPhone(value) {
    return /^[6-9]\d{9}$/.test(value);
  }

  function normalizePhoneInput(value) {
    var digits = String(value || "").replace(/\D/g, "");
    if (digits.indexOf("91") === 0 && digits.length === 12) {
      digits = digits.slice(2);
    } else if (digits.indexOf("0") === 0 && digits.length === 11) {
      digits = digits.slice(1);
    }
    return digits.slice(0, MAX_PHONE);
  }

  function ensurePhoneValidationState() {
    var state = getState();
    if (!state.phone.validation) {
      state.phone.validation = {
        attempted: false,
        name: "",
        mobile: ""
      };
    }
    return state.phone.validation;
  }

  function getPhoneValidationErrors(state) {
    var phoneState = state || getState();
    var name = String(phoneState.phone.name || "").trim();
    var mobile = normalizePhoneInput(phoneState.phone.mobile);
    return {
      name: name.length >= 2 ? "" : "Enter at least 2 characters.",
      mobile: isValidPhone(mobile) ? "" : "Enter a valid 10-digit Indian mobile number."
    };
  }

  function syncPhoneValidation(root) {
    var form = qs("[data-vote-final-form]", root);
    if (!form) {
      return;
    }

    var state = getState();
    var validation = ensurePhoneValidationState();
    var errors = validation.attempted ? getPhoneValidationErrors(state) : {
      name: "",
      mobile: ""
    };

    [
      {
        field: qs('[name="name"]', form),
        wrap: qs("[data-name-field]", form),
        error: qs("[data-name-error]", form),
        value: errors.name
      },
      {
        field: qs('[name="mobile"]', form),
        wrap: qs("[data-mobile-field]", form),
        error: qs("[data-mobile-error]", form),
        value: errors.mobile
      }
    ].forEach(function (item) {
      if (!item.field || !item.wrap || !item.error) {
        return;
      }
      var hasError = Boolean(item.value);
      item.wrap.classList.toggle("is-invalid", hasError);
      item.field.setAttribute("aria-invalid", hasError ? "true" : "false");
      item.error.hidden = !hasError;
      item.error.textContent = item.value || "";
    });
  }

  function scrollToElement(element) {
    if (!element) {
      return;
    }
    element.scrollIntoView({
      behavior: prefersReducedMotion() ? "auto" : "smooth",
      block: "start"
    });
  }

  function renderNomineeCard(nominee, index, mode, selected) {
    var classes = ["vote-tile"];
    if (selected) {
      classes.push("is-selected");
    }
    if (mode === "browse") {
      classes.push("vote-tile--browse");
    } else if (mode === "pick") {
      classes.push("vote-tile--pick");
    }
    var tag = mode === "browse" ? "article" : "button";
    if (mode === "pick") {
      return [
        '<' + tag + ' class="' + classes.join(" ") + '"' + (mode === "browse" ? "" : ' type="button" data-nominee-id="' + escapeHtml(nominee.id) + '" data-nominee-index="' + index + '"') + '>',
          '<img class="vote-tile__image vote-tile__image--pick" src="' + escapeHtml(nominee.voteImage || nominee.image || VOTE_PLACEHOLDER_IMAGE) + '" alt="' + escapeHtml(nominee.title) + '" loading="lazy">',
          '<span class="vote-tile__body vote-tile__body--pick">',
            '<strong>' + escapeHtml(nominee.title) + "</strong>",
            '<span>' + escapeHtml(nominee.summary || "") + "</span>",
          "</span>",
        "</" + tag + ">"
      ].join("");
    }
    return [
      '<' + tag + ' class="' + classes.join(" ") + '"' + (mode === "browse" ? "" : ' type="button" data-nominee-id="' + escapeHtml(nominee.id) + '" data-nominee-index="' + index + '"') + '>',
        '<img class="vote-tile__image vote-tile__image--pick" src="' + escapeHtml(nominee.image || VOTE_PLACEHOLDER_IMAGE) + '" alt="' + escapeHtml(nominee.title) + '" loading="lazy">',
        '<span class="vote-tile__body vote-tile__body--pick">',
          '<strong>' + escapeHtml(nominee.title) + "</strong>",
          '<span>' + escapeHtml(nominee.summary || "") + "</span>",
        "</span>",
      "</" + tag + ">"
    ].join("");
  }

  function renderVotingLeadIn() {
    return [
      '<section class="section-card voting-intro voting-intro--lead">',
        '<div class="voting-intro__copy">',
          '<p class="eyebrow">Voting</p>',
          '<h1>Vote category by category</h1>',
          '<p>Pick one nominee per category. The flow advances automatically, and the final screen appears only after all four categories are complete.</p>',
          getStage() === STAGES.during ? '<a class="btn btn--primary live-vote-btn" href="#/live"><span class="live-dot" aria-hidden="true"></span>Check live voting results</a>' : "",
        "</div>",
        '<div class="voting-intro__media">',
          '<img class="stage-hero__ilu voting-intro__ilu" src="https://images.assettype.com/prajavani/2023-05/3c0c9a4d-1465-4205-b225-bcb20ae0d843/sponsors_banner_logo.png" alt="Sponsors banner logo" loading="eager">',
        "</div>",
      "</section>"
    ].join("");
  }

  var POSITION_LABELS = ["1st", "2nd", "3rd", "4th", "5th", "6th"];

  function renderLiveRoute(root) {
    if (!root) {
      return;
    }
    var categories = getCategories();
    root.innerHTML = [
      '<section class="section-card live-results">',
        '<a class="live-results__back" href="#/voting">← Back to voting</a>',
        '<div>',
          '<p class="eyebrow">Live</p>',
          '<h1>Vote share snapshot</h1>',
        "</div>",
        categories.map(function (category) {
          var nominees = (category.nominees || []).slice().sort(function (a, b) {
            return Number(b.votes || 0) - Number(a.votes || 0);
          });
          var total = nominees.reduce(function (sum, n) { return sum + Number(n.votes || 0); }, 0) || 1;
          return [
            '<div class="section-card live-category">',
              '<h2 class="live-category__heading">' + escapeHtml(category.title) + "</h2>",
              nominees.map(function (nominee, i) {
                var pct = Math.round((Number(nominee.votes || 0) / total) * 100);
                var pos = POSITION_LABELS[i] || (i + 1) + "th";
                var color = (nominee.accent && nominee.accent[0]) || "var(--accent-strong)";
                return [
                  '<div class="live-bar-item">',
                    '<div class="live-bar-item__meta">',
                      '<span class="live-bar-item__pos">' + escapeHtml(pos) + "</span>",
                      '<span class="live-bar-item__name">' + escapeHtml(nominee.title) + "</span>",
                      '<span class="live-bar-item__pct">' + pct + "%</span>",
                    "</div>",
                    '<div class="live-bar-track">',
                      '<div class="live-bar-fill" style="--bar-w:' + pct + '%;background:' + escapeHtml(color) + '"></div>',
                    "</div>",
                  "</div>"
                ].join("");
              }).join(""),
              '<a class="btn btn--primary live-category__cta" href="#/voting">Vote now →</a>',
            "</div>"
          ].join("");
        }).join(""),
      "</section>"
    ].join("");
  }

  function renderVotingSponsorBand() {
    var sponsors = siteData.sponsors || [];
    if (!sponsors.length) {
      return "";
    }
    var repeated = sponsors.concat(sponsors);
    return [
      '<section class="sponsor-band sponsor-band--bare voting-sponsor-band" aria-labelledby="voting-sponsors-title">',
        '<h2 id="voting-sponsors-title" class="sr-only">Sponsors</h2>',
        '<div class="sponsor-band__track">',
          repeated.map(function (item) {
            return (
              '<a class="sponsor-chip" href="' + escapeHtml(item.destination) + '">' +
              '<span class="sponsor-chip__label">' + escapeHtml(item.label) + "</span>" +
              '<img src="' + escapeHtml(item.imageUrl) + '" alt="' + escapeHtml(item.label) + '" loading="lazy">' +
              "</a>"
            );
          }).join(""),
        "</div>",
      "</section>"
    ].join("");
  }

  function renderVotingStatsSection() {
    var categories = getCategories();
    if (!getStatsVisible() || !categories.length) {
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

  function renderStepperCategory(category, stepIndex) {
    var state = getState().selections[category.id] || {};
    var nominees = (category.nominees || []).slice(0, 8);
    return [
      '<section class="vote-stepper__panel section-card" data-step-category="' + escapeHtml(category.id) + '" data-step-index="' + stepIndex + '">',
        '<div class="vote-stepper__sticky-title">',
          '<h2>' + escapeHtml(category.title) + "</h2>",
        "</div>",
        '<div class="vote-stepper__panel-head">',
          '<div>',
            '<p>' + escapeHtml(category.description) + "</p>",
          "</div>",
          '<div class="vote-stepper__panel-meta">',
            '<span>' + formatNumber(getCompletedCount()) + " of " + formatNumber(getCategories().length) + " complete</span>",
          "</div>",
        "</div>",
        '<div class="vote-stepper__grid">' + nominees.map(function (nominee, index) {
          return renderNomineeCard(nominee, index, "pick", state.nomineeId === nominee.id);
        }).join("") + "</div>",
        '<div class="vote-stepper__panel-foot">',
          '<button class="btn btn--ghost" type="button" data-step-back="' + stepIndex + '"' + (stepIndex === 0 ? " disabled" : "") + ">Previous</button>",
          '<button class="btn btn--primary" type="button" data-step-next="' + stepIndex + '"' + (state.nomineeId ? "" : " disabled") + ">Next</button>",
        "</div>",
      "</section>"
    ].join("");
  }

  function renderFinalStep() {
    var state = getState();
    ensurePhoneValidationState();
    var completed = getCompletedCount();
    var categories = getCategories();
    var districts = (siteData.districts || []).slice();
    return [
      '<section class="vote-final section-card" data-final-step>',
        '<div class="vote-final__header">',
          '<p class="eyebrow">Final submission</p>',
          '<h2>Confirm your ballot</h2>',
          '<p>All four categories are complete. Enter your details to submit the vote.</p>',
        "</div>",
        '<div class="vote-final__summary">',
          '<div class="vote-final__summary-meta">',
            '<span>' + formatNumber(completed) + " of " + formatNumber(categories.length) + " complete</span>",
          "</div>",
          '<div class="vote-final__summary-grid">' + categories.map(function (category) {
            var selected = getSelectedNominee(category);
            return [
              '<article class="vote-final__summary-card">',
                '<p class="eyebrow">' + escapeHtml(category.title) + "</p>",
                '<strong>' + escapeHtml(selected ? selected.title : "Not selected") + "</strong>",
              "</article>"
            ].join("");
          }).join("") + "</div>",
        "</div>",
        '<form class="vote-final__form" data-vote-final-form novalidate>',
          '<label class="vote-final__field" data-name-field>',
            '<span>Name</span>',
            '<input type="text" name="name" autocomplete="name" minlength="2" placeholder="Your name" value="' + escapeHtml(state.phone.name) + '">',
            '<p class="vote-final__field-error" data-name-error hidden aria-live="polite"></p>',
          "</label>",
          '<label class="vote-final__field">',
            '<span>District</span>',
            '<select name="district">',
              districts.map(function (district) {
                return '<option value="' + escapeHtml(district) + '"' + (state.phone.district === district ? " selected" : "") + ">" + escapeHtml(district) + "</option>";
              }).join(""),
            "</select>",
          "</label>",
          '<label class="vote-final__field" data-mobile-field>',
            '<span>Mobile</span>',
            '<div class="phone-input">',
              '<span class="phone-input__prefix" aria-hidden="true">+91</span>',
              '<input type="text" name="mobile" inputmode="numeric" autocomplete="tel-national" maxlength="10" pattern="[0-9]*" placeholder="9876543210" value="' + escapeHtml(state.phone.mobile) + '">',
            "</div>",
            '<p class="vote-final__field-error" data-mobile-error hidden aria-live="polite"></p>',
          "</label>",
          '<div class="vote-final__actions">',
            '<button class="btn btn--ghost" type="button" data-step-back="' + categories.length + '">Previous</button>',
            '<button class="btn btn--primary" type="submit" data-final-submit>Submit vote</button>',
          "</div>",
          '<p class="vote-final__status" data-final-status aria-live="polite"></p>',
        "</form>",
      "</section>"
    ].join("");
  }

  function formatCountdownUnit(value) {
    return String(value || 0).padStart(2, "0");
  }

  function getCountdownParts(targetDate) {
    var target = new Date(String(targetDate) + "T00:00:00");
    var diff = target.getTime() - Date.now();
    if (isNaN(target.getTime()) || diff <= 0) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    }
    var s = Math.floor(diff / 1000);
    var m = Math.floor(s / 60);
    return {
      days: Math.floor(m / (60 * 24)),
      hours: Math.floor((m % (60 * 24)) / 60),
      minutes: m % 60,
      seconds: s % 60
    };
  }

  function formatEventDate(value) {
    var d = new Date(String(value) + "T00:00:00");
    if (isNaN(d.getTime())) { return String(value || ""); }
    return new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric" }).format(d);
  }

  function renderVotingClosed(stage) {
    if (stage === STAGES.pre) {
      var eventDate = siteData.eventDate || "";
      var cd = getCountdownParts(eventDate);
      return [
        '<section class="section-card stage-hero stage-hero--pre-vote">',
          '<div class="stage-hero__media">',
            '<img class="stage-hero__trophy" src="https://images.assettype.com/deccanherald/2026-04-30/zrlojphv/PVCS-Trophy.png" alt="PVCS trophy">',
          "</div>",
          '<div class="stage-hero__copy">',
            '<p class="eyebrow">Voting</p>',
            '<h1>Voting opens soon</h1>',
            '<aside class="stage-hero__timeline" data-countdown-timer data-countdown-target="' + escapeHtml(eventDate) + '">',
              '<div class="stage-hero__timeline-head">',
                '<span class="stage-hero__panel-label">Voting opens</span>',
                eventDate ? '<span class="stage-hero__timeline-date">on ' + escapeHtml(formatEventDate(eventDate)) + "</span>" : "",
              "</div>",
              '<div class="stage-hero__timer-grid" aria-label="Time remaining until voting opens">',
                '<div class="stage-hero__timer-unit"><strong data-countdown-days>' + formatCountdownUnit(cd.days) + "</strong><span>Days</span></div>",
                '<div class="stage-hero__timer-unit"><strong data-countdown-hours>' + formatCountdownUnit(cd.hours) + "</strong><span>Hours</span></div>",
                '<div class="stage-hero__timer-unit"><strong data-countdown-minutes>' + formatCountdownUnit(cd.minutes) + "</strong><span>Minutes</span></div>",
                '<div class="stage-hero__timer-unit"><strong data-countdown-seconds>' + formatCountdownUnit(cd.seconds) + "</strong><span>Seconds</span></div>",
              "</div>",
            "</aside>",
            '<div class="stage-hero__actions">',
              '<a class="btn btn--ghost" href="#/nominations">Browse nominations</a>',
            "</div>",
            '<img class="stage-hero__ilu" src="https://images.assettype.com/prajavani/2023-05/3c0c9a4d-1465-4205-b225-bcb20ae0d843/sponsors_banner_logo.png" alt="Sponsors banner logo" loading="eager">',
          "</div>",
        "</section>",
        renderVotingSponsorBand()
      ].join("");
    }

    return [
      '<section class="section-card route-locked">',
        '<p class="eyebrow">Voting</p>',
        '<h1>Voting is closed</h1>',
        '<p>The winners page now carries the main event CTA.</p>',
        '<a class="btn btn--primary" href="#/winners">View winners</a>',
      "</section>"
    ].join("");
  }

  function renderVotingRoute(root) {
    if (!root) {
      return;
    }

    var stage = getStage();
    if (stage !== STAGES.during) {
      root.innerHTML = renderVotingClosed(stage);
      return;
    }

    var categories = getCategories();
    var state = ensureSelectionState();
    var currentStep = Math.max(0, Math.min(state.currentStep || 0, categories.length));
    if (currentStep > categories.length) {
      currentStep = categories.length;
    }

    var sections = [
      renderVotingLeadIn(),
      renderVotingSponsorBand()
    ];

    if (currentStep < categories.length) {
      sections.push(renderStepperCategory(categories[currentStep], currentStep));
    } else {
      sections.push(renderFinalStep());
    }

    root.innerHTML = sections.join("");
    syncVotingRoute(root);
    var statsHtml = renderVotingStatsSection();
    if (statsHtml) {
      root.insertAdjacentHTML("beforeend", statsHtml);
    }
  }

  function renderNominationWidgetIcon(kind) {
    if (kind === "close") {
      return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6.5 6.5l11 11m0-11l-11 11"/></svg>';
    }
    return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 6h8v2a4 4 0 0 1-1.35 3H13v2.5h2.25A4 4 0 0 1 12 15.5a4 4 0 0 1-3.25-2H11V11h-1.65A4 4 0 0 1 8 8V6zm-1 12h10v2H7z"/></svg>';
  }

  function renderNominationsRoute(root) {
    if (!root) {
      return;
    }

    var stage = getStage();
    var categories = getNominationCategories();
    var sections = [
      '<div class="nomination-widget-sentinel" data-nomination-widget-sentinel aria-hidden="true"></div>',
      '<section class="section-card nominations-hero">',
        '<p class="eyebrow">Nominations</p>',
        '<h1>' + (stage === STAGES.post ? "Archive and winners browser" : "Jump through the categories") + "</h1>",
        '<p>' + (stage === STAGES.post ? "Use the selector to jump through the full archive and winner surfaces." : "Use the selector to jump directly to any category.") + "</p>",
      "</section>",
      '<div class="nomination-list">' + categories.map(function (category) {
        var canVote = stage === STAGES.during && isPublicNominationCategory(category);
        return [
          '<section class="section-card nomination-section" data-nomination-section="' + escapeHtml(category.id) + '">',
            '<div class="nomination-section__header">',
              '<div>',
                '<h2>' + escapeHtml(category.title) + "</h2>",
                '<p>' + escapeHtml(category.description) + "</p>",
              "</div>",
              canVote ? '<div class="nomination-section__actions"><a class="btn btn--primary" href="#/voting">Vote in this category</a></div>' : "",
            "</div>",
            '<div class="nomination-section__grid">' + (category.nominees || []).slice(0, 6).map(function (nominee, index) {
              return renderNomineeCard(nominee, index, "browse", false);
            }).join("") + "</div>",
          "</section>"
        ].join("");
      }).join("") + "</div>"
    ];

    sections.push(
      '<aside class="nomination-widget section-card" data-nomination-widget>',
        '<button type="button" class="nomination-widget__toggle" data-nomination-widget-toggle aria-expanded="true" aria-controls="nomination-widget-panel">',
          '<span class="nomination-widget__toggle-icon" aria-hidden="true">⌄</span>',
          '<span class="nomination-widget__toggle-label">Choose category</span>',
        "</button>",
        '<div class="nomination-widget__panel" id="nomination-widget-panel" data-nomination-widget-panel>',
          '<label class="nomination-widget__label">',
            '<span class="sr-only">Jump to category</span>',
            '<select data-nomination-select>',
              '<option value="">Choose a category</option>',
              categories.map(function (category) {
                return '<option value="' + escapeHtml(category.id) + '">' + escapeHtml(category.title) + "</option>";
              }).join(""),
            "</select>",
          "</label>",
        "</div>",
      "</aside>"
    );

    root.innerHTML = sections.join("");
    initNominationWidget(root);
  }

  function renderNominationsRouteTop(root) {
    if (!root) {
      return;
    }

    var stage = getStage();
    var categories = getNominationCategories();
    var sections = [
      '<aside class="nomination-widget" data-nomination-widget>',
        '<button type="button" class="nomination-widget__toggle" data-nomination-widget-toggle>',
          '<span class="nomination-widget__toggle-icon" aria-hidden="true" data-nomination-widget-icon>' + renderNominationWidgetIcon("trophy") + "</span>",
          '<span class="nomination-widget__toggle-label">Choose category</span>',
        "</button>",
        '<select class="nomination-widget__select-hidden" data-nomination-select aria-label="Jump to category">',
          '<option value="">Choose a category</option>',
          categories.map(function (category) {
            return '<option value="' + escapeHtml(category.id) + '">' + escapeHtml(category.title) + "</option>";
          }).join(""),
        "</select>",
      "</aside>",
      '<div class="nomination-widget-sentinel" data-nomination-widget-sentinel aria-hidden="true"></div>',
      '<section class="section-card nominations-hero">',
        '<p class="eyebrow">Nominations</p>',
        '<h1>' + (stage === STAGES.post ? "Archive and winners browser" : "Jump through the categories") + "</h1>",
        '<p>' + (stage === STAGES.post ? "Use the selector to jump through the full archive and winner surfaces." : "Use the selector to jump directly to any category.") + "</p>",
      "</section>",
      '<div class="nomination-list">' + categories.map(function (category) {
        var canVote = stage === STAGES.during && isPublicNominationCategory(category);
        return [
          '<section class="section-card nomination-section" data-nomination-section="' + escapeHtml(category.id) + '">',
            '<div class="nomination-section__header">',
              '<div>',
                '<h2>' + escapeHtml(category.title) + "</h2>",
                '<p>' + escapeHtml(category.description) + "</p>",
              "</div>",
              canVote ? '<div class="nomination-section__actions"><a class="btn btn--primary" href="#/voting">Vote in this category</a></div>' : "",
            "</div>",
            '<div class="nomination-section__grid">' + (category.nominees || []).slice(0, 6).map(function (nominee, index) {
              return renderNomineeCard(nominee, index, "browse", false);
            }).join("") + "</div>",
          "</section>"
        ].join("");
      }).join("") + "</div>"
    ];

    root.innerHTML = sections.join("");
    initNominationWidget(root);
  }

  function renderWinnersRoute(root) {
    if (!root) {
      return;
    }

    var stage = getStage();
    var winners = (siteData.winnerHighlights || []).slice();
    var categories = getCategories();
    var publicWinners = categories.map(function (category) {
      var winner = getSelectedNominee(category) || (category.nominees || [])[0];
      return winner ? {
        category: category.title,
        title: winner.title,
        subtitle: winner.subtitle || "Public winner",
        summary: winner.summary || "",
        image: winner.image
      } : null;
    }).filter(Boolean);

    root.innerHTML = [
      '<section class="section-card winners-hero">',
        '<p class="eyebrow">Winners</p>',
        '<h1>' + (stage === STAGES.post ? "The winners are in" : "Winner preview") + "</h1>",
        '<p>The winners page shows the public category results and the additional recognition cards.</p>',
        '<div class="winners-hero__actions">',
          '<a class="btn btn--primary" href="#/nominations">Browse nominations</a>',
          '<a class="btn btn--ghost" href="#/">Back to home</a>',
        "</div>",
      "</section>",
      '<section class="content-block section-card">',
        '<div class="content-block__header">',
          '<div>',
            '<p class="eyebrow">Public winners</p>',
            '<h2>Category leaders</h2>',
          "</div>",
        "</div>",
        '<div class="winner-grid">' + publicWinners.map(function (winner) {
          return [
            '<article class="winner-card">',
              '<img src="' + escapeHtml(winner.image) + '" alt="' + escapeHtml(winner.title) + '">',
              '<div class="winner-card__copy">',
                '<p class="eyebrow">' + escapeHtml(winner.category) + "</p>",
                '<h3>' + escapeHtml(winner.title) + "</h3>",
                '<p>' + escapeHtml(winner.subtitle) + "</p>",
              "</div>",
            "</article>"
          ].join("");
        }).join("") + "</div>",
      "</section>",
      '<section class="content-block section-card">',
        '<div class="content-block__header">',
          '<div>',
            '<p class="eyebrow">Extended winners</p>',
            '<h2>Additional recognition cards</h2>',
          "</div>",
        "</div>",
        '<div class="winner-grid">' + winners.map(function (winner) {
          return [
            '<article class="winner-card">',
              '<img src="' + escapeHtml(winner.image) + '" alt="' + escapeHtml(winner.title) + '">',
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

  function initNominationWidget(root) {
    var select = qs("[data-nomination-select]", root);
    var widget = qs("[data-nomination-widget]", root);
    var toggle = qs("[data-nomination-widget-toggle]", root);
    if (!select || !widget || !toggle) {
      return;
    }

    select.addEventListener("change", function () {
      var categoryId = select.value;
      if (!categoryId) {
        return;
      }
      var section = qs('[data-nomination-section="' + categoryId + '"]', root);
      scrollToElement(section);
      select.value = "";
    });

    toggle.addEventListener("click", function () {
      try {
        select.showPicker();
      } catch (e) {
        try { select.click(); } catch (e2) {}
      }
    });

    var headerH = parseInt(getComputedStyle(document.documentElement).getPropertyValue("--header-h")) || 76;
    qsa(".nomination-section__header", root).forEach(function (header) {
      var sentinel = document.createElement("div");
      sentinel.style.cssText = "position:absolute;top:0;height:1px;width:1px;pointer-events:none";
      header.parentElement.style.position = "relative";
      header.parentElement.insertBefore(sentinel, header);
      var observer = new IntersectionObserver(function (entries) {
        header.classList.toggle("is-stuck", !entries[0].isIntersecting);
      }, { rootMargin: "-" + headerH + "px 0px 0px 0px", threshold: 0 });
      observer.observe(sentinel);
    });
  }

  function refreshFinalStatus(root) {
    var status = qs("[data-final-status]", root);
    if (!status) {
      return;
    }
    var state = getState();
    if (state.submissionStatus === "success") {
      status.textContent = state.submissionMessage || "Submission complete.";
    } else if (state.submissionStatus === "error") {
      status.textContent = state.submissionMessage || "Please check the form and try again.";
    } else {
      status.textContent = "";
    }
  }

  function syncVotingRoute(root) {
    var state = getState();
    var categories = getCategories();
    ensureSelectionState();

    if (root.__pvcsVotingBound) {
      refreshFinalState(root);
      return;
    }
    root.__pvcsVotingBound = true;

    root.addEventListener("click", function (event) {
      var backButton = event.target.closest("[data-step-back]");
      if (backButton) {
        event.preventDefault();
        var backIndex = Number(backButton.getAttribute("data-step-back"));
        state.currentStep = Math.max(0, backIndex - 1);
        renderRouteContent();
        return;
      }

      var nextButton = event.target.closest("[data-step-next]");
      if (nextButton) {
        event.preventDefault();
        var stepIndex = Number(nextButton.getAttribute("data-step-next"));
        var category = categories[stepIndex];
        if (!category || !state.selections[category.id] || !state.selections[category.id].nomineeId) {
          return;
        }
        state.currentStep = Math.min(categories.length, stepIndex + 1);
        renderRouteContent();
        return;
      }

      var nomineeButton = event.target.closest("[data-nominee-id]");
      if (nomineeButton) {
        event.preventDefault();
        var categoryIndex = Math.max(0, Math.min(state.currentStep || 0, categories.length - 1));
        var category = categories[categoryIndex];
        if (!category) {
          return;
        }
        var nomineeId = nomineeButton.getAttribute("data-nominee-id");
        var nomineeIndex = Number(nomineeButton.getAttribute("data-nominee-index") || 0);
        var nominee = (category.nominees || []).filter(function (item) {
          return item.id === nomineeId;
        })[0];
        if (!nominee) {
          return;
        }
        state.selections[category.id] = {
          nomineeId: nominee.id,
          nomineeTitle: nominee.title,
          nomineeIndex: nomineeIndex
        };
        if (state.submissionStatus !== "idle") {
          state.submissionStatus = "idle";
          state.submissionMessage = "";
        }
        var grid = nomineeButton.closest(".vote-stepper__grid");
        if (grid) {
          qsa("[data-nominee-id]", grid).forEach(function (t) { t.classList.remove("is-selected"); });
        }
        nomineeButton.classList.add("is-selected");
        window.setTimeout(function () {
          state.currentStep = Math.min(categories.length, categoryIndex + 1);
          renderRouteContent();
          window.setTimeout(function () {
            if (state.currentStep < categories.length) {
              scrollToElement(qs('[data-step-category="' + categories[state.currentStep].id + '"]'));
            } else {
              scrollToElement(qs("[data-final-step]", root));
            }
          }, 120);
        }, 380);
      }
    });

    root.addEventListener("beforeinput", function (event) {
      var input = event.target.closest('[name="mobile"]');
      if (!input || !input.closest("[data-vote-final-form]")) {
        return;
      }
      if (event.inputType && event.inputType.indexOf("delete") === 0) {
        return;
      }
      if (typeof event.data === "string" && /[^0-9]/.test(event.data)) {
        event.preventDefault();
      }
    });

    root.addEventListener("paste", function (event) {
      var input = event.target.closest('[name="mobile"]');
      if (!input || !input.closest("[data-vote-final-form]")) {
        return;
      }
      event.preventDefault();
      var pasted = (event.clipboardData || window.clipboardData).getData("text");
      var normalized = normalizePhoneInput(pasted);
      input.value = normalized;
      state.phone.mobile = normalized;
      if (state.submissionStatus !== "idle") {
        state.submissionStatus = "idle";
        state.submissionMessage = "";
      }
      syncPhoneValidation(root);
      refreshFinalStatus(root);
      refreshSubmitButton(root);
    });

    root.addEventListener("input", function (event) {
      var input = event.target.closest("[name]");
      if (!input) {
        return;
      }
      if (input.closest("[data-vote-final-form]")) {
        if (input.name === "mobile") {
          var normalized = normalizePhoneInput(input.value);
          if (input.value !== normalized) {
            input.value = normalized;
          }
          state.phone.mobile = normalized;
        } else {
          state.phone[input.name] = input.value;
        }
        if (state.submissionStatus !== "idle") {
          state.submissionStatus = "idle";
          state.submissionMessage = "";
        }
        syncPhoneValidation(root);
        refreshFinalStatus(root);
        refreshSubmitButton(root);
      }
    });

    var form = qs("[data-vote-final-form]", root);
    if (form) {
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        submitBallot(root);
      });

      form.addEventListener("change", function (event) {
        var field = event.target.closest("[name]");
        if (!field) {
          return;
        }
        if (field.name === "mobile") {
          field.value = normalizePhoneInput(field.value);
          state.phone.mobile = field.value;
        } else {
          state.phone[field.name] = field.value;
        }
        if (state.submissionStatus !== "idle") {
          state.submissionStatus = "idle";
          state.submissionMessage = "";
        }
        syncPhoneValidation(root);
        refreshFinalStatus(root);
        refreshSubmitButton(root);
      });
    }

    refreshFinalState(root);
  }

  function refreshFinalState(root) {
    var state = getState();
    var form = qs("[data-vote-final-form]", root);
    if (!form) {
      return;
    }

    qsa("[name]", form).forEach(function (field) {
      if (field.name === "district") {
        field.value = state.phone.district || "Others";
      } else {
        field.value = state.phone[field.name] || "";
      }
    });
    syncPhoneValidation(root);
    refreshFinalStatus(root);
    refreshSubmitButton(root);
  }

  function refreshSubmitButton(root) {
    var state = getState();
    var form = qs("[data-vote-final-form]", root);
    if (!form) {
      return;
    }
    var submit = qs("[data-final-submit]", form);
    if (!submit) {
      return;
    }

    var nameOk = String(state.phone.name || "").trim().length >= 2;
    var mobileOk = isValidPhone(normalizePhoneInput(state.phone.mobile));
    var allComplete = getCompletedCount() === getCategories().length;

    submit.disabled = !(nameOk && mobileOk && allComplete);
    if (state.submissionStatus === "submitting") {
      submit.textContent = "Submitting...";
    } else if (state.submissionStatus === "success") {
      submit.textContent = "Submitted";
    } else {
      submit.textContent = "Submit vote";
    }
  }

  function buildPayload() {
    var state = getState();
    var selections = {};
    getCategories().forEach(function (category) {
      var selection = state.selections[category.id] || {};
      selections[category.id] = selection.nomineeId || "";
    });

    return {
      name: String(state.phone.name || "").trim(),
      district: state.phone.district || "Others",
      mobile: normalizePhoneInput(state.phone.mobile),
      selections: selections,
      submittedAt: new Date().toISOString()
    };
  }

  function submitBallot(root) {
    var state = getState();
    var validation = ensurePhoneValidationState();
    var name = String(state.phone.name || "").trim();
    var mobile = normalizePhoneInput(state.phone.mobile);
    var allComplete = getCompletedCount() === getCategories().length;
    var formStatus = qs("[data-final-status]", root);
    var errors = getPhoneValidationErrors(state);

    if (!allComplete) {
      state.submissionStatus = "error";
      state.submissionMessage = "Complete all four categories first.";
      validation.attempted = true;
      validation.name = "";
      validation.mobile = "";
      syncPhoneValidation(root);
      refreshFinalStatus(root);
      refreshSubmitButton(root);
      return;
    }

    if (name.length < 2) {
      state.submissionStatus = "error";
      state.submissionMessage = "Enter a name with at least 2 characters.";
      validation.attempted = true;
      validation.name = errors.name;
      validation.mobile = "";
      syncPhoneValidation(root);
      refreshFinalStatus(root);
      refreshSubmitButton(root);
      return;
    }

    if (!isValidPhone(mobile)) {
      state.submissionStatus = "error";
      state.submissionMessage = "Enter a valid 10-digit Indian mobile number.";
      validation.attempted = true;
      validation.name = "";
      validation.mobile = errors.mobile;
      syncPhoneValidation(root);
      refreshFinalStatus(root);
      refreshSubmitButton(root);
      return;
    }

    state.phone.name = name;
    state.phone.mobile = mobile;
    validation.attempted = false;
    validation.name = "";
    validation.mobile = "";
    syncPhoneValidation(root);
    state.submissionStatus = "submitting";
    state.submissionMessage = "Submitting your ballot...";
    refreshFinalStatus(root);
    refreshSubmitButton(root);

    var submitUrl = window.CINE_VOTING_SUBMIT_URL || "";
    var payload = buildPayload();

    if (!submitUrl) {
      window.setTimeout(function () {
        state.submissionStatus = "success";
        state.submissionMessage = "Your ballot was accepted.";
        validation.attempted = false;
        validation.name = "";
        validation.mobile = "";
        syncPhoneValidation(root);
        refreshFinalStatus(root);
        refreshSubmitButton(root);
        if (formStatus) {
          formStatus.textContent = state.submissionMessage;
        }
      }, 500);
      return;
    }

    fetch(submitUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    })
      .then(function (response) {
        return response.json().then(function (data) {
          return {
            ok: response.ok,
            data: data
          };
        });
      })
      .then(function (result) {
        if (result.data && result.data.status === "duplicate") {
          state.submissionStatus = "error";
          state.submissionMessage = "This phone number already voted.";
          validation.attempted = true;
          validation.name = "";
          validation.mobile = errors.mobile;
          syncPhoneValidation(root);
          refreshFinalStatus(root);
          refreshSubmitButton(root);
          return;
        }

        if (!result.ok || (result.data && result.data.status && result.data.status !== "ok")) {
          throw new Error("Submission failed");
        }

        state.submissionStatus = "success";
        state.submissionMessage = "Your ballot was accepted.";
        validation.attempted = false;
        validation.name = "";
        validation.mobile = "";
        syncPhoneValidation(root);
        refreshFinalStatus(root);
        refreshSubmitButton(root);
      })
      .catch(function () {
        state.submissionStatus = "error";
        state.submissionMessage = "Submission failed. Please try again.";
        validation.attempted = true;
        validation.name = "";
        validation.mobile = errors.mobile;
        syncPhoneValidation(root);
        refreshFinalStatus(root);
        refreshSubmitButton(root);
      });
  }

  function renderRouteContent() {
    var route = getRoute();
    var stage = getStage();
    var votingRoot = qs("[data-voting-root]");
    var nominationsRoot = qs("[data-nominations-root]");
    var winnersRoot = qs("[data-winners-root]");
    var liveRoot = qs("[data-live-root]");

    if (route === "voting") {
      renderVotingRoute(votingRoot, stage);
    } else if (route === "nominations") {
      renderNominationsRouteTop(nominationsRoot, stage);
    } else if (route === "winners") {
      renderWinnersRoute(winnersRoot, stage);
    } else if (route === "live") {
      renderLiveRoute(liveRoot);
    }
  }

  window.__initVotingSwiper = renderRouteContent;
  window.__pvcsRenderRoute = renderRouteContent;

  window.addEventListener("pvcs:render", function () {
    renderRouteContent();
  });

  function init() {
    ensureSelectionState();
    renderRouteContent();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
