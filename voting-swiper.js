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

  function prefersReducedMotion() {
    return window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  function getCategoryState() {
    if (!window.__cineVotingSwiperState) {
      window.__cineVotingSwiperState = {};
    }

    return window.__cineVotingSwiperState;
  }

  function getFlowState() {
    if (!window.__cineVotingSwiperFlowState) {
      window.__cineVotingSwiperFlowState = {
        phoneInput: "",
        phoneError: "",
        submissionStatus: "idle",
        submissionMode: "",
        submissionMessage: ""
      };
    }

    return window.__cineVotingSwiperFlowState;
  }

  function getCategory(categoryId) {
    return (siteData.votingCategories || []).filter(function (item) {
      return item.id === categoryId;
    })[0];
  }

  function getCategoryIndex(categoryId) {
    var categories = siteData.votingCategories || [];
    var index = 0;

    for (; index < categories.length; index += 1) {
      if (categories[index].id === categoryId) {
        return index;
      }
    }

    return -1;
  }

  function getCompletedCount() {
    return (siteData.votingCategories || []).reduce(function (count, category) {
      var state = getCategoryState()[category.id];
      return count + (state && state.selectedNomineeId ? 1 : 0);
    }, 0);
  }

  function getSelectionSummary() {
    return (siteData.votingCategories || []).map(function (category) {
      var state = getCategoryState()[category.id] || {};
      return {
        category: category,
        title: state.selectedNomineeTitle || "",
        nomineeId: state.selectedNomineeId || ""
      };
    });
  }

  function normalizePhoneInput(value) {
    var digits = String(value || "").replace(/\D/g, "");
    if (digits.indexOf("91") === 0 && digits.length === 12) {
      digits = digits.slice(2);
    } else if (digits.indexOf("0") === 0 && digits.length === 11) {
      digits = digits.slice(1);
    }

    return digits;
  }

  function isValidPhone(value) {
    return /^[6-9]\d{9}$/.test(value);
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

  function renderCard(category, nominee, index, isActive) {
    return (
      '<article class="vote-card vote-card--swiper" data-nominee-id="' + escapeHtml(nominee.id) + '" ' +
        'style="--card-a:' + nominee.accent[0] + '; --card-b:' + nominee.accent[1] + ';">' +
        (nominee.image ? '<img class="vote-card__photo" src="' + escapeHtml(nominee.image) + '" alt="' + escapeHtml(nominee.title) + '">' : '') +
        '<div class="vote-card__visual">' +
          '<span class="vote-card__rank">#' + String(index + 1).padStart(2, "0") + "</span>" +
          '<h3>' + escapeHtml(nominee.title) + "</h3>" +
        "</div>" +
        '<div class="vote-card__body">' +
          '<p class="vote-card__summary">' + escapeHtml(nominee.summary) + "</p>" +
          '<button class="vote-card__cta vote-card__cta--strip" type="button" data-vote-now="true" data-category-id="' + escapeHtml(category.id) + '"' +
            (isActive ? "" : ' tabindex="-1" aria-hidden="true"') + ">" +
            "Vote Now" +
          "</button>" +
        "</div>" +
      "</article>"
    );
  }

  function renderCategory(category) {
    return (
      '<section class="section-card vote-category vote-category--swiper" data-category-id="' + escapeHtml(category.id) + '">' +
        '<div class="vote-category__header">' +
        '<div class="vote-category__heading">' +
            '<h2>' + escapeHtml(category.title) + "</h2>" +
            '<p class="vote-category__description">' + escapeHtml(category.description) + "</p>" +
          "</div>" +
        "</div>" +
        '<div class="vote-carousel vote-carousel--swiper">' +
          '<button class="vote-carousel__control vote-carousel__control--prev" type="button" data-swiper-prev aria-label="Previous nominee">&lsaquo;</button>' +
          '<div class="swiper vote-swiper" data-swiper-id="' + escapeHtml(category.id) + '" aria-label="' + escapeHtml(category.title) + ' nominees">' +
            '<div class="swiper-wrapper">' +
              category.nominees.map(function (nominee, index) {
                return '<div class="swiper-slide" data-nominee-id="' + escapeHtml(nominee.id) + '">' + renderCard(category, nominee, index, index === 0) + "</div>";
              }).join("") +
            "</div>" +
          "</div>" +
          '<button class="vote-carousel__control vote-carousel__control--next" type="button" data-swiper-next aria-label="Next nominee">&rsaquo;</button>' +
        "</div>" +
        '<p class="vote-category__hint">' + escapeHtml(category.hint) + "</p>" +
      "</section>"
    );
  }

  function renderSelectionSummaryCard(category) {
    return (
      '<article class="vote-summary-card" data-summary-card data-category-id="' + escapeHtml(category.id) + '">' +
        '<h3>' + escapeHtml(category.title) + "</h3>" +
        '<p class="vote-summary-card__choice" data-summary-choice>Not selected yet</p>' +
        '<button class="vote-summary-card__link" type="button" data-summary-jump="' + escapeHtml(category.id) + '">' +
          "Vote now" +
        "</button>" +
      "</article>"
    );
  }

  function renderPhoneStep() {
    return (
      '<section class="section-card vote-phone-step" id="vote-phone-step" data-phone-step>' +
        '<div class="vote-phone-step__header">' +
          '<p class="eyebrow">Final step</p>' +
          '<h2>Confirm your vote with a phone number</h2>' +
          '<p class="vote-phone-step__copy">All four categories must be complete before submission unlocks. Your number is used to prevent duplicate votes.</p>' +
        "</div>" +
        '<div class="vote-phone-step__progress">' +
          '<div class="vote-phone-step__progress-meta">' +
            '<span data-progress-label>0 of 4 categories complete</span>' +
            '<span data-progress-hint>Finish all categories to unlock submission</span>' +
          "</div>" +
          '<div class="vote-phone-step__meter" aria-hidden="true"><span data-progress-fill></span></div>' +
        "</div>" +
        '<div class="vote-phone-step__summary" data-summary-grid>' +
          (siteData.votingCategories || []).map(renderSelectionSummaryCard).join("") +
        "</div>" +
        '<div class="vote-phone-step__success" data-success-panel hidden>' +
          '<p class="eyebrow">Thank you</p>' +
          '<h3>Your ballot is ready</h3>' +
          '<p data-success-copy>Your selections are locked in. This preview will be wired to the backend submission endpoint next.</p>' +
          '<div class="vote-phone-step__success-summary" data-success-summary></div>' +
        "</div>" +
        '<div class="vote-phone-step__form" data-phone-form>' +
          '<label class="vote-phone-step__field">' +
            '<span>Phone number</span>' +
            '<input type="tel" inputmode="numeric" autocomplete="tel" maxlength="14" placeholder="9876543210" data-phone-input disabled>' +
          "</label>" +
          '<p class="vote-phone-step__helper" data-phone-helper>Enter a 10-digit Indian mobile number. We strip +91 and 0 prefixes automatically.</p>' +
          '<button class="btn btn--primary vote-phone-step__submit" type="button" data-phone-submit disabled>Complete all categories</button>' +
          '<p class="vote-phone-step__status" data-phone-status aria-live="polite"></p>' +
        "</div>" +
      "</section>"
    );
  }

  function renderPage() {
    var root = qs("[data-voting-swiper-root]");
    if (!root || !siteData.votingCategories || !siteData.votingCategories.length) {
      return null;
    }

    root.innerHTML = [
      '<section class="section-card voting-intro">',
        '<p class="eyebrow">Voting</p>',
        '<h1>Category-by-category nominee carousel</h1>',
        '<p>Swipe horizontally inside each category to move the active card. Tap Vote Now on the centered nominee, then move through the flow until the phone step unlocks.</p>',
      "</section>"
    ].join("") +
      siteData.votingCategories.map(renderCategory).join("") +
      renderPhoneStep();

    return root;
  }

  function refreshActiveButtons(section, category) {
    var state = getCategoryState()[category.id];
    qsa(".swiper-slide", section).forEach(function (slide) {
      var button = qs("[data-vote-now]", slide);
      if (!button) {
        return;
      }

      var nomineeId = slide.getAttribute("data-nominee-id");
      if (!nomineeId) {
        var card = qs("[data-nominee-id]", slide);
        nomineeId = card ? card.getAttribute("data-nominee-id") : "";
      }
      var isActive = slide.classList.contains("swiper-slide-active");
      var isSelected = !!state.selectedNomineeId && state.selectedNomineeId === nomineeId;
      var isLocked = !!state.selectedNomineeId && !state.isEditing;

      slide.classList.toggle("is-selected", isSelected);
      button.textContent = isSelected ? (isLocked ? "Change vote" : "Vote Now") : "Vote Now";
      button.setAttribute("aria-pressed", isSelected ? "true" : "false");
      button.classList.toggle("is-selected", isSelected);

      if (isActive) {
        button.removeAttribute("tabindex");
        button.removeAttribute("aria-hidden");
      } else {
        button.setAttribute("tabindex", "-1");
        button.setAttribute("aria-hidden", "true");
      }
    });
  }

  function syncCategoryInteraction(section, category) {
    var state = getCategoryState()[category.id];
    var swiper = state.swiper;
    var isLocked = !!state.selectedNomineeId && !state.isEditing;

    section.classList.toggle("is-locked", isLocked);
    section.classList.toggle("is-editing", !!state.selectedNomineeId && state.isEditing);

    if (!swiper) {
      return;
    }

    swiper.allowTouchMove = !isLocked;

    if (swiper.mousewheel && typeof swiper.mousewheel.enable === "function" && typeof swiper.mousewheel.disable === "function") {
      if (isLocked) {
        swiper.mousewheel.disable();
      } else {
        swiper.mousewheel.enable();
      }
    }

    if (swiper.keyboard && typeof swiper.keyboard.enable === "function" && typeof swiper.keyboard.disable === "function") {
      if (isLocked) {
        swiper.keyboard.disable();
      } else {
        swiper.keyboard.enable();
      }
    }
  }

  function refreshVotingCategory(categoryId) {
    var state = getCategoryState()[categoryId];
    if (!state) {
      return;
    }

    var category = getCategory(categoryId);
    if (!category) {
      return;
    }

    var section = qs('.vote-category[data-category-id="' + categoryId + '"]');
    if (!section) {
      return;
    }

    section.classList.toggle("is-complete", !!state.selectedNomineeId);
    refreshActiveButtons(section, category);
    syncCategoryInteraction(section, category);
    refreshPhoneStep();
  }

  function refreshPhoneStep() {
    var flow = getFlowState();
    var section = qs("[data-phone-step]");
    if (!section) {
      return;
    }

    var categories = siteData.votingCategories || [];
    var total = categories.length || 1;
    var completed = getCompletedCount();
    var allComplete = completed === total;
    var progressLabel = qs("[data-progress-label]", section);
    var progressHint = qs("[data-progress-hint]", section);
    var progressFill = qs("[data-progress-fill]", section);
    var phoneInput = qs("[data-phone-input]", section);
    var phoneHelper = qs("[data-phone-helper]", section);
    var submitButton = qs("[data-phone-submit]", section);
    var statusNode = qs("[data-phone-status]", section);
    var formNode = qs("[data-phone-form]", section);
    var successPanel = qs("[data-success-panel]", section);
    var successCopy = qs("[data-success-copy]", section);
    var summaryGrid = qs("[data-summary-grid]", section);
    section.classList.toggle("is-locked", !allComplete);
    section.classList.toggle("is-unlocked", allComplete);
    section.classList.toggle("is-submitting", flow.submissionStatus === "submitting");
    section.classList.toggle("is-success", flow.submissionStatus === "success");

    if (progressLabel) {
      progressLabel.textContent = completed + " of " + total + " categories complete";
    }

    if (progressHint) {
      progressHint.textContent = allComplete
        ? "Phone capture is unlocked"
        : "Finish all categories to unlock submission";
    }

    if (progressFill) {
      progressFill.style.width = Math.round((completed / total) * 100) + "%";
    }

    var pendingCount = 0;
    qsa("[data-summary-card]", section).forEach(function (card, index) {
      var category = categories[index];
      if (!category) {
        return;
      }

      var state = getCategoryState()[category.id] || {};
      var choiceNode = qs("[data-summary-choice]", card);
      var jumpButton = qs("[data-summary-jump]", card);
      var isComplete = !!state.selectedNomineeTitle;

      card.classList.toggle("is-complete", isComplete);
      card.hidden = isComplete;
      if (!isComplete) {
        pendingCount += 1;
      }

      if (choiceNode) {
        choiceNode.textContent = state.selectedNomineeTitle || "Not selected yet";
      }

      if (jumpButton) {
        jumpButton.textContent = "Vote now";
        jumpButton.disabled = flow.submissionStatus === "submitting" || isComplete;
      }
    });

    if (summaryGrid) {
      summaryGrid.hidden = pendingCount === 0;
    }

    if (phoneInput) {
      phoneInput.value = flow.phoneInput;
      phoneInput.disabled = !allComplete || flow.submissionStatus === "submitting" || flow.submissionStatus === "success";
    }

    if (phoneHelper) {
      phoneHelper.textContent = allComplete
        ? "Enter a 10-digit Indian mobile number. We strip +91 and 0 prefixes automatically."
        : "Complete all four categories to unlock this field.";
    }

    if (submitButton) {
      if (flow.submissionStatus === "submitting") {
        submitButton.textContent = "Submitting...";
      } else if (!allComplete) {
        submitButton.textContent = "Complete all categories";
      } else if (flow.submissionStatus === "success") {
        submitButton.textContent = "Submitted";
      } else {
        submitButton.textContent = "Submit My Votes";
      }

      submitButton.disabled = !allComplete ||
        flow.submissionStatus === "submitting" ||
        flow.submissionStatus === "success" ||
        !isValidPhone(normalizePhoneInput(flow.phoneInput));
    }

    if (statusNode) {
      if (flow.submissionStatus === "submitting") {
        statusNode.textContent = "Submitting your ballot...";
      } else if (flow.submissionStatus === "duplicate") {
        statusNode.textContent = flow.submissionMessage || "This phone number already voted.";
      } else if (flow.submissionStatus === "error") {
        statusNode.textContent = flow.submissionMessage || "Submission failed. Please try again.";
      } else if (flow.submissionStatus === "success") {
        statusNode.textContent = flow.submissionMessage || "Your ballot was accepted.";
      } else if (!allComplete) {
        statusNode.textContent = "Finish the four categories to unlock submission.";
      } else if (!isValidPhone(normalizePhoneInput(flow.phoneInput)) && flow.phoneInput) {
        statusNode.textContent = "Enter a valid 10-digit mobile number.";
      } else {
        statusNode.textContent = "";
      }
    }

    if (formNode && successPanel) {
      var isSuccess = flow.submissionStatus === "success";
      formNode.hidden = isSuccess;
      successPanel.hidden = !isSuccess;
      if (isSuccess) {
        var summaryText = qs("[data-success-summary]", section);
        if (summaryText) {
          summaryText.innerHTML = getSelectionSummary()
            .map(function (item) {
              return (
                '<article class="vote-success-chip">' +
                  '<span>' + escapeHtml(item.category.title) + "</span>" +
                  '<strong>' + escapeHtml(item.title || "Not selected yet") + "</strong>" +
                "</article>"
              );
            })
            .join("");
        }

        if (successCopy) {
          successCopy.textContent = flow.submissionMode === "preview"
            ? "Your selections are locked in. This is a frontend preview until the backend endpoint is connected."
            : "Your selections are locked in.";
        }
      }
    }
  }

  function advanceAfterSelection(categoryId, shouldAutoAdvance) {
    if (!shouldAutoAdvance) {
      return;
    }

    var categories = siteData.votingCategories || [];
    var currentIndex = getCategoryIndex(categoryId);
    if (currentIndex < 0) {
      return;
    }

    var nextCategory = categories[currentIndex + 1];
    if (nextCategory) {
      window.setTimeout(function () {
        scrollToElement(qs('.vote-category[data-category-id="' + nextCategory.id + '"]'));
      }, 180);
      return;
    }

    window.setTimeout(function () {
      scrollToElement(qs("[data-phone-step]"));
    }, 220);
  }

  function openCategoryEditing(categoryId) {
    var state = getCategoryState()[categoryId];
    var category = getCategory(categoryId);
    var section = qs('.vote-category[data-category-id="' + categoryId + '"]');
    if (!state || !category || !section || !state.selectedNomineeId) {
      return;
    }

    state.isEditing = true;
    refreshVotingCategory(categoryId);

    if (state.swiper && typeof state.swiper.slideToLoop === "function") {
      state.swiper.slideToLoop(state.selectedNomineeIndex || 0, 0, false);
    }
  }

  function invalidateSubmissionIfNeeded() {
    var flow = getFlowState();
    if (flow.submissionStatus === "success" || flow.submissionStatus === "duplicate" || flow.submissionStatus === "error") {
      flow.submissionStatus = "idle";
      flow.submissionMode = "";
      flow.submissionMessage = "";
    }
  }

  function registerVote(categoryId) {
    var state = getCategoryState()[categoryId];
    var category = getCategory(categoryId);
    if (!state || !category) {
      return;
    }

    var nominee = category.nominees[state.activeIndex || 0];
    if (!nominee) {
      return;
    }

    var wasSelected = !!state.selectedNomineeId;
    state.selectedNomineeId = nominee.id;
    state.selectedNomineeTitle = nominee.title;
    state.selectedNomineeIndex = state.activeIndex || 0;
    state.isEditing = false;

    invalidateSubmissionIfNeeded();
    refreshVotingCategory(categoryId);
    refreshPhoneStep();
    advanceAfterSelection(categoryId, !wasSelected);
  }

  function buildSubmissionPayload() {
    var selections = {};
    (siteData.votingCategories || []).forEach(function (category) {
      var state = getCategoryState()[category.id] || {};
      selections[category.id] = state.selectedNomineeId || "";
    });

    return {
      phone: normalizePhoneInput(getFlowState().phoneInput),
      selections: selections,
      submittedAt: new Date().toISOString()
    };
  }

  function submitVotes() {
    var flow = getFlowState();
    var phone = normalizePhoneInput(flow.phoneInput);
    var categories = siteData.votingCategories || [];
    var allComplete = getCompletedCount() === categories.length;

    if (!allComplete) {
      flow.submissionStatus = "error";
      flow.submissionMessage = "Complete all four categories first.";
      refreshPhoneStep();
      return;
    }

    if (!isValidPhone(phone)) {
      flow.phoneError = "Enter a valid 10-digit Indian mobile number.";
      flow.submissionStatus = "error";
      flow.submissionMessage = flow.phoneError;
      refreshPhoneStep();
      return;
    }

    flow.phoneInput = phone;
    flow.phoneError = "";
    flow.submissionStatus = "submitting";
    flow.submissionMessage = "";
    refreshPhoneStep();

    var payload = buildSubmissionPayload();
    var submitUrl = window.CINE_VOTING_SUBMIT_URL || "";

    if (!submitUrl) {
      window.setTimeout(function () {
        flow.submissionStatus = "success";
        flow.submissionMode = "preview";
        flow.submissionMessage = "Frontend preview complete. Backend submission is not connected yet.";
        refreshPhoneStep();
      }, 550);
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
          flow.submissionStatus = "duplicate";
          flow.submissionMode = "";
          flow.submissionMessage = "This phone number already voted.";
          refreshPhoneStep();
          return;
        }

        if (!result.ok || (result.data && result.data.status && result.data.status !== "ok")) {
          throw new Error("Submission failed");
        }

        flow.submissionStatus = "success";
        flow.submissionMode = "";
        flow.submissionMessage = "Your ballot was accepted.";
        refreshPhoneStep();
      })
      .catch(function () {
        flow.submissionStatus = "error";
        flow.submissionMode = "";
        flow.submissionMessage = "Submission failed. Please try again.";
        refreshPhoneStep();
      });
  }

  function initCategory(category) {
    var section = qs('.vote-category[data-category-id="' + category.id + '"]');
    var swiperEl = qs('[data-swiper-id="' + category.id + '"]', section);
    var prev = qs("[data-swiper-prev]", section);
    var next = qs("[data-swiper-next]", section);
    var state = getCategoryState()[category.id];
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
      touchRatio: 1,
      touchAngle: 45,
      longSwipesRatio: 0.2,
      speed: 500,
      spaceBetween: 18,
      slideToClickedSlide: false,
      // Keep tap events available for in-card action buttons on touch devices.
      preventClicks: false,
      preventClicksPropagation: false,
      touchStartPreventDefault: false,
      passiveListeners: false,
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
          touchRatio: 1,
          touchAngle: 45
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
          opacity: 1
        },
        next: {
          translate: ["88%", 18, -220],
          rotate: [0, 0, 8],
          scale: 0.84,
          opacity: 1
        }
      },
      on: {
        init: function () {
          state.activeIndex = this.realIndex || 0;
          refreshActiveButtons(section, category);
          refreshVotingCategory(category.id);
        },
        slideChange: function () {
          state.activeIndex = this.realIndex || 0;
          refreshActiveButtons(section, category);
          refreshVotingCategory(category.id);
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

  function initPhoneStep(root) {
    root.addEventListener("click", function (event) {
      var jumpButton = event.target.closest("[data-summary-jump]");
      if (jumpButton) {
        event.preventDefault();
        var categoryId = jumpButton.getAttribute("data-summary-jump");
        openCategoryEditing(categoryId);
        scrollToElement(qs('.vote-category[data-category-id="' + categoryId + '"]'));
        return;
      }

      var submitButton = event.target.closest("[data-phone-submit]");
      if (submitButton) {
        event.preventDefault();
        submitVotes();
      }
    });

    root.addEventListener("input", function (event) {
      var input = event.target.closest("[data-phone-input]");
      if (!input) {
        return;
      }

      var flow = getFlowState();
      flow.phoneInput = input.value;
      if (flow.phoneError) {
        flow.phoneError = "";
      }
      refreshPhoneStep();
    });

    root.addEventListener("blur", function (event) {
      var input = event.target.closest("[data-phone-input]");
      if (!input) {
        return;
      }

      var flow = getFlowState();
      flow.phoneInput = normalizePhoneInput(input.value);
      input.value = flow.phoneInput;
      refreshPhoneStep();
    }, true);
  }

  function init() {
    var root = renderPage();
    if (!root || !siteData.votingCategories) {
      return;
    }

    var state = getCategoryState();
    siteData.votingCategories.forEach(function (category) {
      if (!state[category.id]) {
        state[category.id] = {
          activeIndex: 0,
          selectedNomineeId: "",
          selectedNomineeTitle: "",
          selectedNomineeIndex: 0,
          isEditing: false,
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

    var lastVoteActionKey = "";
    var lastVoteActionAt = 0;

    function handleVoteButton(voteButton) {
      if (!voteButton) {
        return;
      }

      var categoryId = voteButton.getAttribute("data-category-id");
      if (!categoryId) {
        return;
      }

      var actionKey = categoryId + ":" + (voteButton.textContent || "").trim();
      var now = Date.now();
      if (lastVoteActionKey === actionKey && now - lastVoteActionAt < 500) {
        return;
      }

      lastVoteActionKey = actionKey;
      lastVoteActionAt = now;

      var state = getCategoryState()[categoryId];
      if (state && state.selectedNomineeId && !state.isEditing) {
        openCategoryEditing(categoryId);
        return;
      }

      registerVote(categoryId);
    }

    root.addEventListener("touchend", function (event) {
      var voteButton = event.target.closest("[data-vote-now]");
      if (!voteButton) {
        return;
      }

      event.preventDefault();
      handleVoteButton(voteButton);
    }, { capture: true, passive: false });

    root.addEventListener("click", function (event) {
      var voteButton = event.target.closest("[data-vote-now]");
      if (!voteButton) {
        return;
      }

      event.preventDefault();
      handleVoteButton(voteButton);
    });

    initPhoneStep(root);

    qsa(".vote-category", root).forEach(function (section) {
      refreshVotingCategory(section.getAttribute("data-category-id"));
    });
    refreshPhoneStep();
  }

  document.addEventListener("DOMContentLoaded", init);
})();
