(function () {
  var siteData = window.CINE_SITE_DATA || {};
  var STAGES = {
    pre: "pre-vote",
    during: "during-vote",
    post: "post-vote"
  };
  var MAX_PHONE = 10;

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
    return siteData.votingCategories || [];
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
    }
    var tag = mode === "browse" ? "article" : "button";
    return [
      '<' + tag + ' class="' + classes.join(" ") + '"' + (mode === "browse" ? "" : ' type="button" data-nominee-id="' + escapeHtml(nominee.id) + '" data-nominee-index="' + index + '"') + '>',
        '<img class="vote-tile__image" src="' + escapeHtml(nominee.image) + '" alt="' + escapeHtml(nominee.title) + '">',
        '<span class="vote-tile__rank">#' + String(index + 1).padStart(2, "0") + "</span>",
        '<span class="vote-tile__body">',
          '<strong>' + escapeHtml(nominee.title) + "</strong>",
          '<small>' + escapeHtml(nominee.subtitle || "") + "</small>",
          '<span>' + escapeHtml(nominee.summary || "") + "</span>",
        "</span>",
      "</" + tag + ">"
    ].join("");
  }

  function renderStepperCategory(category, stepIndex) {
    var state = getState().selections[category.id] || {};
    var nominees = (category.nominees || []).slice(0, 8);
    return [
      '<section class="vote-stepper__panel section-card" data-step-category="' + escapeHtml(category.id) + '" data-step-index="' + stepIndex + '">',
        '<div class="vote-stepper__panel-head">',
          '<div>',
            '<p class="eyebrow">Category ' + String(stepIndex + 1).padStart(2, "0") + "</p>",
            '<h2>' + escapeHtml(category.title) + "</h2>",
            '<p>' + escapeHtml(category.description) + "</p>",
          "</div>",
          '<div class="vote-stepper__panel-meta">',
            '<span>' + formatNumber(nominees.length) + " nominees</span>",
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
            '<span>District list starts with Others</span>',
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
          '<label class="vote-final__field">',
            '<span>Name</span>',
            '<input type="text" name="name" autocomplete="name" minlength="2" placeholder="Your name" value="' + escapeHtml(state.phone.name) + '">',
          "</label>",
          '<label class="vote-final__field">',
            '<span>District</span>',
            '<select name="district">',
              districts.map(function (district) {
                return '<option value="' + escapeHtml(district) + '"' + (state.phone.district === district ? " selected" : "") + ">" + escapeHtml(district) + "</option>";
              }).join(""),
            "</select>",
          "</label>",
          '<label class="vote-final__field">',
            '<span>Mobile</span>',
            '<input type="tel" name="mobile" inputmode="numeric" autocomplete="tel" maxlength="14" placeholder="9876543210" value="' + escapeHtml(state.phone.mobile) + '">',
          "</label>",
          '<p class="vote-final__helper">Name must be at least 2 characters. Mobile must be a valid Indian number starting 6 to 9.</p>',
          '<div class="vote-final__actions">',
            '<button class="btn btn--ghost" type="button" data-step-back="' + categories.length + '">Previous</button>',
            '<button class="btn btn--primary" type="submit" data-final-submit>Submit vote</button>',
          "</div>",
          '<p class="vote-final__status" data-final-status aria-live="polite"></p>',
        "</form>",
      "</section>"
    ].join("");
  }

  function renderVotingClosed(stage) {
    var title = stage === STAGES.post ? "Voting is closed" : "Voting opens soon";
    var copy = stage === STAGES.post
      ? "The winners page now carries the main event CTA."
      : "Use the home page to follow the countdown until the ballot opens.";
    var href = stage === STAGES.post ? "#/winners" : "#/";
    var label = stage === STAGES.post ? "View winners" : "Back to home";
    return [
      '<section class="section-card route-locked">',
        '<p class="eyebrow">Voting</p>',
        '<h1>' + escapeHtml(title) + "</h1>",
        '<p>' + escapeHtml(copy) + "</p>",
        '<a class="btn btn--primary" href="' + href + '">' + escapeHtml(label) + "</a>",
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
      '<section class="section-card vote-stepper__intro">',
        '<p class="eyebrow">Voting</p>',
        '<h1>Vote category by category</h1>',
        '<p>Pick one nominee per category. The flow advances automatically, and the final screen appears only after all four categories are complete.</p>',
      "</section>",
      '<section class="vote-stepper section-card" data-vote-stepper>',
        '<header class="vote-stepper__header">',
          '<div>',
            '<p class="eyebrow">Progress</p>',
            '<h2>' + formatNumber(getCompletedCount()) + " of " + formatNumber(categories.length) + " complete</h2>",
          "</div>",
          '<div class="vote-stepper__header-actions">',
            '<a class="btn btn--ghost" href="#/nominations">Open nominations</a>',
          "</div>",
        "</header>",
        '<div class="vote-stepper__status" data-step-status></div>',
      "</section>"
    ];

    if (currentStep < categories.length) {
      sections[1] = sections[1].replace("</section>", renderStepperCategory(categories[currentStep], currentStep) + "</section>");
    } else {
      sections[1] = sections[1].replace("</section>", renderFinalStep() + "</section>");
    }

    root.innerHTML = sections.join("");
    syncVotingRoute(root);
  }

  function renderNominationsRoute(root) {
    if (!root) {
      return;
    }

    var stage = getStage();
    var categories = getCategories();
    var sections = [
      '<section class="section-card nominations-hero">',
        '<p class="eyebrow">Nominations</p>',
        '<h1>' + (stage === STAGES.post ? "Archive and winners browser" : "Jump through the categories") + "</h1>",
        '<p>' + (stage === STAGES.post ? "Use the floating selector to jump through the full archive and winner surfaces." : "Use the floating selector to jump directly to any category.") + "</p>",
        '<a class="btn btn--primary" href="#/voting">' + (stage === STAGES.post ? "Go to winners" : "Start voting") + "</a>",
      "</section>",
      '<aside class="nomination-widget section-card" data-nomination-widget>',
        '<label>',
          '<span class="eyebrow">Jump to category</span>',
          '<select data-nomination-select>',
            '<option value="">Choose a category</option>',
            categories.map(function (category) {
              return '<option value="' + escapeHtml(category.id) + '">' + escapeHtml(category.title) + "</option>";
            }).join(""),
          "</select>",
        "</label>",
        '<p class="nomination-widget__note">The widget auto-scrolls to the selected section.</p>',
      "</aside>",
      '<div class="nomination-list">' + categories.map(function (category) {
        return [
          '<section class="section-card nomination-section" data-nomination-section="' + escapeHtml(category.id) + '">',
            '<div class="nomination-section__header">',
              '<div>',
                '<p class="eyebrow">' + escapeHtml(category.title) + "</p>",
                '<h2>' + escapeHtml(category.description) + "</h2>",
              "</div>",
            "</div>",
            '<div class="nomination-section__grid">' + (category.nominees || []).slice(0, 8).map(function (nominee, index) {
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
    if (!select) {
      return;
    }

    select.addEventListener("change", function () {
      var categoryId = select.value;
      if (!categoryId) {
        return;
      }
      var section = qs('[data-nomination-section="' + categoryId + '"]', root);
      scrollToElement(section);
    });
  }

  function getCategoryProgressMessage(stepIndex) {
    var categories = getCategories();
    var completed = getCompletedCount();
    if (stepIndex >= categories.length) {
      return completed === categories.length
        ? "All categories are complete. Review your ballot and submit."
        : "Finish all categories to unlock submission.";
    }
    var selection = getState().selections[categories[stepIndex].id];
    return selection && selection.nomineeId
      ? "Selection saved. Continue to the next category."
      : "Choose one nominee to unlock the next step.";
  }

  function refreshStepStatus(root) {
    var status = qs("[data-step-status]", root);
    if (!status) {
      return;
    }
    var state = getState();
    var categories = getCategories();
    status.textContent = getCategoryProgressMessage(Math.min(state.currentStep || 0, categories.length));
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
    refreshStepStatus(root);

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
          refreshStepStatus(root);
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
        state.currentStep = Math.min(categories.length, categoryIndex + 1);
        renderRouteContent();
        if (state.currentStep < categories.length) {
          window.setTimeout(function () {
            scrollToElement(qs('[data-step-category="' + categories[state.currentStep].id + '"]'));
          }, 120);
        } else {
          window.setTimeout(function () {
            scrollToElement(qs("[data-final-step]", root));
          }, 120);
        }
      }
    });

    root.addEventListener("input", function (event) {
      var input = event.target.closest("[name]");
      if (!input) {
        return;
      }
      if (input.closest("[data-vote-final-form]")) {
        state.phone[input.name] = input.value;
        if (state.submissionStatus !== "idle") {
          state.submissionStatus = "idle";
          state.submissionMessage = "";
        }
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
        state.phone[field.name] = field.value;
        if (state.submissionStatus !== "idle") {
          state.submissionStatus = "idle";
          state.submissionMessage = "";
        }
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
    var name = String(state.phone.name || "").trim();
    var mobile = normalizePhoneInput(state.phone.mobile);
    var allComplete = getCompletedCount() === getCategories().length;
    var formStatus = qs("[data-final-status]", root);

    if (!allComplete) {
      state.submissionStatus = "error";
      state.submissionMessage = "Complete all four categories first.";
      refreshFinalStatus(root);
      refreshSubmitButton(root);
      return;
    }

    if (name.length < 2) {
      state.submissionStatus = "error";
      state.submissionMessage = "Enter a name with at least 2 characters.";
      refreshFinalStatus(root);
      refreshSubmitButton(root);
      return;
    }

    if (!isValidPhone(mobile)) {
      state.submissionStatus = "error";
      state.submissionMessage = "Enter a valid 10-digit Indian mobile number.";
      refreshFinalStatus(root);
      refreshSubmitButton(root);
      return;
    }

    state.phone.name = name;
    state.phone.mobile = mobile;
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
          refreshFinalStatus(root);
          refreshSubmitButton(root);
          return;
        }

        if (!result.ok || (result.data && result.data.status && result.data.status !== "ok")) {
          throw new Error("Submission failed");
        }

        state.submissionStatus = "success";
        state.submissionMessage = "Your ballot was accepted.";
        refreshFinalStatus(root);
        refreshSubmitButton(root);
      })
      .catch(function () {
        state.submissionStatus = "error";
        state.submissionMessage = "Submission failed. Please try again.";
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

    if (route === "voting") {
      renderVotingRoute(votingRoot, stage);
    } else if (route === "nominations") {
      renderNominationsRoute(nominationsRoot, stage);
    } else if (route === "winners") {
      renderWinnersRoute(winnersRoot, stage);
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
