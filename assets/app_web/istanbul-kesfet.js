"use strict";

(function initIstanbulDiscoveryPage() {
  const resultsGrid = document.getElementById("resultsGrid");
  if (!resultsGrid) {
    return;
  }

  const mvpPageFile = (() => {
    const body = document.body;
    if (!body) {
      return "yeme-icme.html";
    }
    return (body.getAttribute("data-mvp-page") || "yeme-icme.html").trim() || "yeme-icme.html";
  })();

  const mvpMainCategoryKey = (() => {
    const body = document.body;
    if (!body) {
      return "yeme-icme";
    }
    return (body.getAttribute("data-mvp-main-category") || "yeme-icme").trim() || "yeme-icme";
  })();

  const mvpFavoritesKey = (() => {
    const body = document.body;
    if (!body) {
      return "istanbulKesfetFavorites";
    }
    const explicit = body.getAttribute("data-mvp-favorites-key");
    if (explicit && explicit.trim()) {
      return explicit.trim();
    }
    if (mvpMainCategoryKey === "yeme-icme") {
      return "istanbulKesfetFavorites";
    }
    return `mvpKesfet_${mvpMainCategoryKey.replace(/[^a-z0-9-]/gi, "_")}`;
  })();

  const mvpLockedCategorySlug = (() => {
    const body = document.body;
    if (!body) {
      return "";
    }
    return (body.getAttribute("data-mvp-locked-category-slug") || "").trim();
  })();

  const mvpLockedCategoryLabel = (() => {
    const body = document.body;
    if (!body) {
      return "";
    }
    return (body.getAttribute("data-mvp-locked-category-label") || "").trim();
  })();

  const mvpHizmetCategoryPicker = (() => {
    const body = document.body;
    return Boolean(body && body.getAttribute("data-mvp-hizmet-category-picker") === "true");
  })();

  const mvpSubcategoryGrid = document.getElementById("mvpSubcategoryGrid");
  const mvpSubcategoryBoxGrid = Boolean(mvpSubcategoryGrid);
  const kesfetCategorySwitch = document.querySelector("[data-kesfet-category-switch]");
  const kesfetCategoryTrigger = document.querySelector("[data-kesfet-category-trigger]");
  const kesfetCategoryMenu = document.querySelector("[data-kesfet-category-menu]");
  const kesfetCategoryCurrent = document.querySelector("[data-kesfet-category-current]");

  const districtOptionsContainer = document.getElementById("districtOptions");
  const kesfetDistrictSwitch = document.querySelector("[data-kesfet-district-switch]");
  const kesfetDistrictTrigger = document.querySelector("[data-kesfet-district-trigger]");
  const kesfetDistrictMenu = document.querySelector("[data-kesfet-district-menu]");
  const kesfetDistrictCurrent = document.querySelector("[data-kesfet-district-current]");

  const neighborhoodOptionsContainer = document.getElementById("neighborhoodOptions");
  const kesfetNeighborhoodSwitch = document.querySelector("[data-kesfet-neighborhood-switch]");
  const kesfetNeighborhoodTrigger = document.querySelector("[data-kesfet-neighborhood-trigger]");
  const kesfetNeighborhoodMenu = document.querySelector("[data-kesfet-neighborhood-menu]");
  const kesfetNeighborhoodCurrent = document.querySelector("[data-kesfet-neighborhood-current]");

  const kesfetBudgetOptionsContainer = document.getElementById("kesfetBudgetOptions");
  const kesfetBudgetSwitch = document.querySelector("[data-kesfet-budget-switch]");
  const kesfetBudgetTrigger = document.querySelector("[data-kesfet-budget-trigger]");
  const kesfetBudgetMenu = document.querySelector("[data-kesfet-budget-menu]");
  const kesfetBudgetCurrent = document.querySelector("[data-kesfet-budget-current]");

  const KESFET_CATEGORY_MENU_HOVER_DELAY_MS = 180;
  const kesfetCategoryHoverCloseTimers = new WeakMap();
  const kesfetDistrictHoverCloseTimers = new WeakMap();
  const kesfetBudgetHoverCloseTimers = new WeakMap();
  const kesfetNeighborhoodHoverCloseTimers = new WeakMap();

  function clearKesfetCategoryHoverTimerIstanbul(container) {
    if (!container) {
      return;
    }
    const activeTimer = kesfetCategoryHoverCloseTimers.get(container);
    if (activeTimer) {
      window.clearTimeout(activeTimer);
      kesfetCategoryHoverCloseTimers.delete(container);
    }
  }

  function closeKesfetCategoryMenuIstanbul() {
    if (!kesfetCategorySwitch || !kesfetCategoryMenu || !kesfetCategoryTrigger) {
      return;
    }
    clearKesfetCategoryHoverTimerIstanbul(kesfetCategorySwitch);
    kesfetCategoryMenu.hidden = true;
    kesfetCategoryTrigger.setAttribute("aria-expanded", "false");
    kesfetCategorySwitch.classList.remove("is-open");
  }

  function clearKesfetDistrictHoverTimerIstanbul(container) {
    if (!container) {
      return;
    }
    const activeTimer = kesfetDistrictHoverCloseTimers.get(container);
    if (activeTimer) {
      window.clearTimeout(activeTimer);
      kesfetDistrictHoverCloseTimers.delete(container);
    }
  }

  function closeKesfetDistrictMenuIstanbul() {
    if (!kesfetDistrictSwitch || !kesfetDistrictMenu || !kesfetDistrictTrigger) {
      return;
    }
    clearKesfetDistrictHoverTimerIstanbul(kesfetDistrictSwitch);
    kesfetDistrictMenu.hidden = true;
    kesfetDistrictTrigger.setAttribute("aria-expanded", "false");
    kesfetDistrictSwitch.classList.remove("is-open");
  }

  function openKesfetDistrictMenuIstanbul() {
    if (!kesfetDistrictSwitch || !kesfetDistrictMenu || !kesfetDistrictTrigger) {
      return;
    }
    clearKesfetDistrictHoverTimerIstanbul(kesfetDistrictSwitch);
    closeKesfetCategoryMenuIstanbul();
    closeKesfetBudgetMenuIstanbul();
    closeKesfetNeighborhoodMenuIstanbul();
    kesfetDistrictMenu.hidden = false;
    kesfetDistrictTrigger.setAttribute("aria-expanded", "true");
    kesfetDistrictSwitch.classList.add("is-open");
  }

  function scheduleKesfetDistrictMenuCloseIstanbul() {
    if (!kesfetDistrictSwitch) {
      return;
    }
    clearKesfetDistrictHoverTimerIstanbul(kesfetDistrictSwitch);
    const timerId = window.setTimeout(() => {
      closeKesfetDistrictMenuIstanbul();
      kesfetDistrictHoverCloseTimers.delete(kesfetDistrictSwitch);
    }, KESFET_CATEGORY_MENU_HOVER_DELAY_MS);
    kesfetDistrictHoverCloseTimers.set(kesfetDistrictSwitch, timerId);
  }

  function openKesfetCategoryMenuIstanbul() {
    if (!kesfetCategorySwitch || !kesfetCategoryMenu || !kesfetCategoryTrigger) {
      return;
    }
    clearKesfetCategoryHoverTimerIstanbul(kesfetCategorySwitch);
    closeKesfetBudgetMenuIstanbul();
    closeKesfetNeighborhoodMenuIstanbul();
    closeKesfetDistrictMenuIstanbul();
    kesfetCategoryMenu.hidden = false;
    kesfetCategoryTrigger.setAttribute("aria-expanded", "true");
    kesfetCategorySwitch.classList.add("is-open");
  }

  function scheduleKesfetCategoryMenuCloseIstanbul() {
    if (!kesfetCategorySwitch) {
      return;
    }
    clearKesfetCategoryHoverTimerIstanbul(kesfetCategorySwitch);
    const timerId = window.setTimeout(() => {
      closeKesfetCategoryMenuIstanbul();
      kesfetCategoryHoverCloseTimers.delete(kesfetCategorySwitch);
    }, KESFET_CATEGORY_MENU_HOVER_DELAY_MS);
    kesfetCategoryHoverCloseTimers.set(kesfetCategorySwitch, timerId);
  }

  function clearKesfetBudgetHoverTimerIstanbul(container) {
    if (!container) {
      return;
    }
    const activeTimer = kesfetBudgetHoverCloseTimers.get(container);
    if (activeTimer) {
      window.clearTimeout(activeTimer);
      kesfetBudgetHoverCloseTimers.delete(container);
    }
  }

  function closeKesfetBudgetMenuIstanbul() {
    if (!kesfetBudgetSwitch || !kesfetBudgetMenu || !kesfetBudgetTrigger) {
      return;
    }
    clearKesfetBudgetHoverTimerIstanbul(kesfetBudgetSwitch);
    kesfetBudgetMenu.hidden = true;
    kesfetBudgetTrigger.setAttribute("aria-expanded", "false");
    kesfetBudgetSwitch.classList.remove("is-open");
  }

  function scheduleKesfetBudgetMenuCloseIstanbul() {
    if (!kesfetBudgetSwitch) {
      return;
    }
    clearKesfetBudgetHoverTimerIstanbul(kesfetBudgetSwitch);
    const timerId = window.setTimeout(() => {
      closeKesfetBudgetMenuIstanbul();
      kesfetBudgetHoverCloseTimers.delete(kesfetBudgetSwitch);
    }, KESFET_CATEGORY_MENU_HOVER_DELAY_MS);
    kesfetBudgetHoverCloseTimers.set(kesfetBudgetSwitch, timerId);
  }

  function openKesfetBudgetMenuIstanbul() {
    if (!kesfetBudgetSwitch || !kesfetBudgetMenu || !kesfetBudgetTrigger) {
      return;
    }
    clearKesfetBudgetHoverTimerIstanbul(kesfetBudgetSwitch);
    closeKesfetCategoryMenuIstanbul();
    closeKesfetDistrictMenuIstanbul();
    closeKesfetNeighborhoodMenuIstanbul();
    kesfetBudgetMenu.hidden = false;
    kesfetBudgetTrigger.setAttribute("aria-expanded", "true");
    kesfetBudgetSwitch.classList.add("is-open");
  }

  function clearKesfetNeighborhoodHoverTimerIstanbul(container) {
    if (!container) {
      return;
    }
    const activeTimer = kesfetNeighborhoodHoverCloseTimers.get(container);
    if (activeTimer) {
      window.clearTimeout(activeTimer);
      kesfetNeighborhoodHoverCloseTimers.delete(container);
    }
  }

  function closeKesfetNeighborhoodMenuIstanbul() {
    if (!kesfetNeighborhoodSwitch || !kesfetNeighborhoodMenu || !kesfetNeighborhoodTrigger) {
      return;
    }
    clearKesfetNeighborhoodHoverTimerIstanbul(kesfetNeighborhoodSwitch);
    kesfetNeighborhoodMenu.hidden = true;
    kesfetNeighborhoodTrigger.setAttribute("aria-expanded", "false");
    kesfetNeighborhoodSwitch.classList.remove("is-open");
  }

  function scheduleKesfetNeighborhoodMenuCloseIstanbul() {
    if (!kesfetNeighborhoodSwitch) {
      return;
    }
    clearKesfetNeighborhoodHoverTimerIstanbul(kesfetNeighborhoodSwitch);
    const timerId = window.setTimeout(() => {
      closeKesfetNeighborhoodMenuIstanbul();
      kesfetNeighborhoodHoverCloseTimers.delete(kesfetNeighborhoodSwitch);
    }, KESFET_CATEGORY_MENU_HOVER_DELAY_MS);
    kesfetNeighborhoodHoverCloseTimers.set(kesfetNeighborhoodSwitch, timerId);
  }

  function openKesfetNeighborhoodMenuIstanbul() {
    if (!kesfetNeighborhoodSwitch || !kesfetNeighborhoodMenu || !kesfetNeighborhoodTrigger) {
      return;
    }
    if (kesfetNeighborhoodTrigger.disabled) {
      return;
    }
    clearKesfetNeighborhoodHoverTimerIstanbul(kesfetNeighborhoodSwitch);
    closeKesfetCategoryMenuIstanbul();
    closeKesfetDistrictMenuIstanbul();
    closeKesfetBudgetMenuIstanbul();
    kesfetNeighborhoodMenu.hidden = false;
    kesfetNeighborhoodTrigger.setAttribute("aria-expanded", "true");
    kesfetNeighborhoodSwitch.classList.add("is-open");
  }

  function syncNeighborhoodTriggerLabelIstanbul() {
    if (!kesfetNeighborhoodCurrent) {
      return;
    }
    if (!String(state.selectedDistrict || "").trim()) {
      kesfetNeighborhoodCurrent.textContent = "Önce ilçe seç";
      return;
    }
    const n = String(state.selectedNeighborhood || "").trim();
    kesfetNeighborhoodCurrent.textContent = n || "Tüm mahalleler";
  }

  function syncNeighborhoodBoxVisualsIstanbul() {
    if (!neighborhoodOptionsContainer) {
      return;
    }
    const raw = String(state.selectedNeighborhood || "").trim();
    neighborhoodOptionsContainer.querySelectorAll(".istanbul-mvp-subcategory-box").forEach((btn) => {
      if (!btn.hasAttribute("data-neighborhood-value")) {
        return;
      }
      const v = btn.getAttribute("data-neighborhood-value");
      const isAll = (v || "") === "";
      const active = !raw ? isAll : v === raw;
      btn.classList.toggle("is-active", active);
      btn.setAttribute("aria-checked", active ? "true" : "false");
    });
  }

  function syncKesfetBudgetTriggerIstanbul() {
    if (!kesfetBudgetCurrent) {
      return;
    }
    if (!String(state.selectedBudget || "").trim()) {
      kesfetBudgetCurrent.textContent = "Tüm bütçeler";
      return;
    }
    kesfetBudgetCurrent.textContent = formatBudgetLabel(state.selectedBudget);
  }

  function syncKesfetCategoryTriggerIstanbul() {
    if (!kesfetCategoryCurrent) {
      return;
    }
    if (!mvpSubcategoryBoxGrid) {
      return;
    }
    if (!String(state.selectedSubcategoryId || "").trim()) {
      kesfetCategoryCurrent.textContent = "Tüm kategoriler";
      return;
    }
    const ent = state.mvpSubcategoryEntries.find(
      (e) => String(e.id) === String(state.selectedSubcategoryId).trim(),
    );
    kesfetCategoryCurrent.textContent = ent && ent.name ? ent.name : "Tüm kategoriler";
  }

  function initKesfetCategoryDropdownIstanbul() {
    if (!kesfetCategorySwitch || !kesfetCategoryTrigger || !kesfetCategoryMenu) {
      return;
    }

    kesfetCategoryTrigger.addEventListener("click", (event) => {
      event.preventDefault();
      if (kesfetCategoryMenu.hidden) {
        openKesfetCategoryMenuIstanbul();
        return;
      }
      closeKesfetCategoryMenuIstanbul();
    });

    kesfetCategorySwitch.addEventListener("mouseenter", () => {
      clearKesfetCategoryHoverTimerIstanbul(kesfetCategorySwitch);
      openKesfetCategoryMenuIstanbul();
    });

    kesfetCategorySwitch.addEventListener("mouseleave", () => {
      scheduleKesfetCategoryMenuCloseIstanbul();
    });

    kesfetCategoryMenu.addEventListener("mouseenter", () => {
      clearKesfetCategoryHoverTimerIstanbul(kesfetCategorySwitch);
    });

    kesfetCategoryTrigger.addEventListener("focus", () => {
      openKesfetCategoryMenuIstanbul();
    });

    kesfetCategorySwitch.addEventListener("focusout", (event) => {
      const nextFocus = event.relatedTarget;
      if (nextFocus && kesfetCategorySwitch.contains(nextFocus)) {
        return;
      }
      closeKesfetCategoryMenuIstanbul();
    });

    document.addEventListener("click", (event) => {
      if (event.target && event.target.closest && event.target.closest("[data-kesfet-category-switch]")) {
        return;
      }
      closeKesfetCategoryMenuIstanbul();
    });
  }

  function initKesfetBudgetDropdownIstanbul() {
    if (!kesfetBudgetSwitch || !kesfetBudgetTrigger || !kesfetBudgetMenu || !kesfetBudgetOptionsContainer) {
      return;
    }

    kesfetBudgetTrigger.addEventListener("click", (event) => {
      event.preventDefault();
      if (kesfetBudgetMenu.hidden) {
        openKesfetBudgetMenuIstanbul();
        return;
      }
      closeKesfetBudgetMenuIstanbul();
    });

    kesfetBudgetSwitch.addEventListener("mouseenter", () => {
      clearKesfetBudgetHoverTimerIstanbul(kesfetBudgetSwitch);
      openKesfetBudgetMenuIstanbul();
    });

    kesfetBudgetSwitch.addEventListener("mouseleave", () => {
      scheduleKesfetBudgetMenuCloseIstanbul();
    });

    kesfetBudgetMenu.addEventListener("mouseenter", () => {
      clearKesfetBudgetHoverTimerIstanbul(kesfetBudgetSwitch);
    });

    kesfetBudgetTrigger.addEventListener("focus", () => {
      openKesfetBudgetMenuIstanbul();
    });

    kesfetBudgetSwitch.addEventListener("focusout", (event) => {
      const nextFocus = event.relatedTarget;
      if (nextFocus && kesfetBudgetSwitch.contains(nextFocus)) {
        return;
      }
      closeKesfetBudgetMenuIstanbul();
    });

    document.addEventListener("click", (event) => {
      if (event.target && event.target.closest && event.target.closest("[data-kesfet-budget-switch]")) {
        return;
      }
      closeKesfetBudgetMenuIstanbul();
    });

    kesfetBudgetOptionsContainer.addEventListener("click", (event) => {
      const btn = event.target.closest(".istanbul-mvp-subcategory-box");
      if (!btn || !kesfetBudgetOptionsContainer.contains(btn) || !btn.hasAttribute("data-budget-value")) {
        return;
      }
      const v = btn.getAttribute("data-budget-value");
      state.selectedBudget = v == null || v === "" ? "" : v;
      syncBudgetChipVisuals();
      closeKesfetBudgetMenuIstanbul();
      state.page = 1;
      loadVenues();
    });
  }

  function initKesfetNeighborhoodDropdownIstanbul() {
    if (!kesfetNeighborhoodSwitch || !kesfetNeighborhoodTrigger || !kesfetNeighborhoodMenu || !neighborhoodOptionsContainer) {
      return;
    }

    kesfetNeighborhoodTrigger.addEventListener("click", (event) => {
      event.preventDefault();
      if (kesfetNeighborhoodTrigger.disabled) {
        return;
      }
      if (kesfetNeighborhoodMenu.hidden) {
        openKesfetNeighborhoodMenuIstanbul();
        return;
      }
      closeKesfetNeighborhoodMenuIstanbul();
    });

    kesfetNeighborhoodSwitch.addEventListener("mouseenter", () => {
      if (kesfetNeighborhoodTrigger.disabled) {
        return;
      }
      clearKesfetNeighborhoodHoverTimerIstanbul(kesfetNeighborhoodSwitch);
      openKesfetNeighborhoodMenuIstanbul();
    });

    kesfetNeighborhoodSwitch.addEventListener("mouseleave", () => {
      scheduleKesfetNeighborhoodMenuCloseIstanbul();
    });

    kesfetNeighborhoodMenu.addEventListener("mouseenter", () => {
      clearKesfetNeighborhoodHoverTimerIstanbul(kesfetNeighborhoodSwitch);
    });

    kesfetNeighborhoodTrigger.addEventListener("focus", () => {
      if (kesfetNeighborhoodTrigger.disabled) {
        return;
      }
      openKesfetNeighborhoodMenuIstanbul();
    });

    kesfetNeighborhoodSwitch.addEventListener("focusout", (event) => {
      const nextFocus = event.relatedTarget;
      if (nextFocus && kesfetNeighborhoodSwitch.contains(nextFocus)) {
        return;
      }
      closeKesfetNeighborhoodMenuIstanbul();
    });

    document.addEventListener("click", (event) => {
      if (event.target && event.target.closest && event.target.closest("[data-kesfet-neighborhood-switch]")) {
        return;
      }
      closeKesfetNeighborhoodMenuIstanbul();
    });

    neighborhoodOptionsContainer.addEventListener("click", (event) => {
      const btn = event.target.closest(".istanbul-mvp-subcategory-box");
      if (!btn || !neighborhoodOptionsContainer.contains(btn) || !btn.hasAttribute("data-neighborhood-value")) {
        return;
      }
      const v = btn.getAttribute("data-neighborhood-value");
      state.selectedNeighborhood = v == null || v === "" ? "" : v;
      syncNeighborhoodBoxVisualsIstanbul();
      syncNeighborhoodTriggerLabelIstanbul();
      closeKesfetNeighborhoodMenuIstanbul();
      state.page = 1;
      loadVenues();
    });
  }

  function syncDistrictTriggerLabelIstanbul() {
    if (!kesfetDistrictCurrent) {
      return;
    }
    const raw = String(state.selectedDistrict || "").trim();
    kesfetDistrictCurrent.textContent = raw || "Tüm ilçeler";
  }

  function syncDistrictBoxVisualsIstanbul() {
    if (!districtOptionsContainer) {
      return;
    }
    const raw = String(state.selectedDistrict || "").trim();
    districtOptionsContainer.querySelectorAll(".istanbul-mvp-subcategory-box").forEach((btn) => {
      if (!btn.hasAttribute("data-district-value")) {
        return;
      }
      const v = btn.getAttribute("data-district-value");
      const isAll = (v || "") === "";
      const active = !raw ? isAll : v === raw;
      btn.classList.toggle("is-active", active);
      btn.setAttribute("aria-checked", active ? "true" : "false");
    });
  }

  function renderDistrictOptionsIstanbul() {
    if (!districtOptionsContainer) {
      return;
    }
    const placeholder = "Tüm ilçeler";
    districtOptionsContainer.innerHTML = "";
    const clearBtn = document.createElement("button");
    clearBtn.type = "button";
    clearBtn.className = "istanbul-mvp-subcategory-box";
    clearBtn.setAttribute("data-district-value", "");
    clearBtn.setAttribute("role", "radio");
    clearBtn.setAttribute("aria-label", placeholder);
    clearBtn.textContent = placeholder;
    districtOptionsContainer.appendChild(clearBtn);
    (state.filters.districts || []).forEach((d) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "istanbul-mvp-subcategory-box";
      b.setAttribute("data-district-value", d);
      b.setAttribute("role", "radio");
      b.setAttribute("aria-label", d);
      b.textContent = d;
      districtOptionsContainer.appendChild(b);
    });
    syncDistrictBoxVisualsIstanbul();
    syncDistrictTriggerLabelIstanbul();
  }

  function initKesfetDistrictDropdownIstanbul() {
    if (!kesfetDistrictSwitch || !kesfetDistrictTrigger || !kesfetDistrictMenu) {
      return;
    }

    kesfetDistrictTrigger.addEventListener("click", (event) => {
      event.preventDefault();
      if (kesfetDistrictMenu.hidden) {
        openKesfetDistrictMenuIstanbul();
        return;
      }
      closeKesfetDistrictMenuIstanbul();
    });

    kesfetDistrictSwitch.addEventListener("mouseenter", () => {
      clearKesfetDistrictHoverTimerIstanbul(kesfetDistrictSwitch);
      openKesfetDistrictMenuIstanbul();
    });

    kesfetDistrictSwitch.addEventListener("mouseleave", () => {
      scheduleKesfetDistrictMenuCloseIstanbul();
    });

    kesfetDistrictMenu.addEventListener("mouseenter", () => {
      clearKesfetDistrictHoverTimerIstanbul(kesfetDistrictSwitch);
    });

    kesfetDistrictTrigger.addEventListener("focus", () => {
      openKesfetDistrictMenuIstanbul();
    });

    kesfetDistrictSwitch.addEventListener("focusout", (event) => {
      const nextFocus = event.relatedTarget;
      if (nextFocus && kesfetDistrictSwitch.contains(nextFocus)) {
        return;
      }
      closeKesfetDistrictMenuIstanbul();
    });

    document.addEventListener("click", (event) => {
      if (event.target && event.target.closest && event.target.closest("[data-kesfet-district-switch]")) {
        return;
      }
      closeKesfetDistrictMenuIstanbul();
    });
  }

  let hizmetPickerActiveSlug = "kuafor";

  function usesDiscoveryDomainApi() {
    return (
      mvpMainCategoryKey === "hizmetler" ||
      mvpMainCategoryKey === "saglik" ||
      mvpMainCategoryKey === "kultur" ||
      mvpMainCategoryKey === "sanat"
    );
  }

  function buildVenueListEndpoint(params, options = {}) {
    const query = params.toString();
    const isNearby = Boolean(options.nearby);
    if (usesDiscoveryDomainApi()) {
      const suffix = isNearby ? "/nearby" : "";
      return `/api/discovery/${encodeURIComponent(mvpMainCategoryKey)}/istanbul/venues${suffix}?${query}`;
    }
    const suffix = isNearby ? "/nearby" : "";
    return `/api/mvp/istanbul/venues${suffix}?${query}`;
  }

  function matchLockedCategoryIdFromOptions(lockedSlug, categoryOptions) {
    const raw = String(lockedSlug || "").trim();
    if (!raw) {
      return "";
    }
    const slugNorm = normalizeText(raw);
    const list = Array.isArray(categoryOptions) ? categoryOptions : [];
    const byExactSlug = list.find((o) => normalizeText(String(o.slug || "")) === slugNorm);
    if (byExactSlug && byExactSlug.id != null && String(byExactSlug.id).trim() !== "") {
      return String(byExactSlug.id);
    }
    const composite = `${String(mvpMainCategoryKey).trim()}-${raw}`.toLowerCase();
    const byComposite = list.find((o) => normalizeText(String(o.slug || "")) === normalizeText(composite));
    if (byComposite && byComposite.id != null && String(byComposite.id).trim() !== "") {
      return String(byComposite.id);
    }
    const bySuffix = list.find((o) => {
      const s = normalizeText(String(o.slug || ""));
      return s === slugNorm || s.endsWith(`-${slugNorm}`) || s.endsWith(slugNorm);
    });
    if (bySuffix && bySuffix.id != null && String(bySuffix.id).trim() !== "") {
      return String(bySuffix.id);
    }
    if (slugNorm === "kuafor" || slugNorm === normalizeText("kuaför")) {
      const byName = list.find((o) => /kuaf|kuafor|berber|kuaf/i.test(String(o.name || "")));
      if (byName && byName.id != null && String(byName.id).trim() !== "") {
        return String(byName.id);
      }
    }
    if (slugNorm === "veteriner" || slugNorm === "vet") {
      const byName = list.find((o) => /veteriner|vet|hayvan|klinik/i.test(String(o.name || "")));
      if (byName && byName.id != null && String(byName.id).trim() !== "") {
        return String(byName.id);
      }
    }
    if (slugNorm === "akaryakit") {
      const byName = list.find((o) => /akaryak|petrol|benzin|istasyon|fuel/i.test(String(o.name || "")));
      if (byName && byName.id != null && String(byName.id).trim() !== "") {
        return String(byName.id);
      }
    }
    if (slugNorm === "berber") {
      const byName = list.find((o) => /berber|barber/i.test(String(o.name || "")));
      if (byName && byName.id != null && String(byName.id).trim() !== "") {
        return String(byName.id);
      }
    }
    return "";
  }

  function applyMvpLockedCategory() {
    if (!mvpLockedCategorySlug) {
      return;
    }
    const options = Array.isArray(state.filters.categoryOptions) ? state.filters.categoryOptions : [];
    const idResolved = matchLockedCategoryIdFromOptions(mvpLockedCategorySlug, options);
    state.selectedCategory = idResolved || mvpLockedCategorySlug;
  }

  function parseHizmetTurParam(raw) {
    const t = normalizeText(String(raw || "").trim());
    if (t === "veteriner" || t === "vet") {
      return "veteriner";
    }
    if (t === "akaryakit") {
      return "akaryakit";
    }
    if (t === "berber") {
      return "berber";
    }
    if (t === "kuafor") {
      return "kuafor";
    }
    if (!t) {
      return "kuafor";
    }
    return "kuafor";
  }

  function applyHizmetCategoryFromSlug(slug) {
    const next = String(slug || "kuafor").trim() || "kuafor";
    hizmetPickerActiveSlug = next;
    const options = Array.isArray(state.filters.categoryOptions) ? state.filters.categoryOptions : [];
    const idResolved = matchLockedCategoryIdFromOptions(next, options);
    state.selectedCategory = idResolved || next;
  }

  function setHizmetTurInUrl(slug) {
    try {
      const url = new URL(window.location.href);
      if (slug && normalizeText(slug) !== "kuafor") {
        url.searchParams.set("tur", slug);
      } else {
        url.searchParams.delete("tur");
      }
      window.history.replaceState({}, "", url.toString());
    } catch (_error) {
      // ignore invalid URL
    }
  }

  function syncHizmetCategoryPickerVisuals() {
    const row = document.getElementById("hizmetlerCategoryRow");
    if (!row) {
      return;
    }
    const current = normalizeText(hizmetPickerActiveSlug);
    row.querySelectorAll("[data-hizmet-category-slug]").forEach((element) => {
      const elementSlug = (element.getAttribute("data-hizmet-category-slug") || "").trim();
      const active = current === normalizeText(elementSlug);
      element.classList.toggle("is-active", active);
      if (element.getAttribute("role") === "tab") {
        element.setAttribute("aria-selected", active ? "true" : "false");
        element.setAttribute("aria-pressed", active ? "true" : "false");
      } else {
        element.setAttribute("aria-checked", active ? "true" : "false");
      }
    });
    const leaf = document.getElementById("hizmetBreadcrumbCurrent");
    if (leaf) {
      const map = {
        kuafor: "Kuaförler",
        veteriner: "Veterinerler",
        akaryakit: "Akaryakıt",
        berber: "Berberler",
      };
      leaf.textContent = map[hizmetPickerActiveSlug] || "Hizmetler";
    }
  }

  const state = {
    filters: {
      districts: [],
      neighborhoodsByDistrict: {},
      categoryOptions: [],
      categories: [],
      tags: [],
      budgets: [],
    },
    dataMode: "api",
    localData: [],
    localDataLoaded: false,
    localFavoritesKey: mvpFavoritesKey,
    selectedDistrict: "",
    selectedNeighborhood: "",
    selectedCategory: "",
    selectedSubcategoryId: "",
    mvpSubcategoryEntries: [],
    selectedBudget: "",
    selectedTags: [],
    query: "",
    page: 1,
    limit: 24,
    nearbyMode: false,
    userLocation: null,
    loading: false,
    items: [],
    pagination: null,
    selectedVenueSlug: "",
    favoriteVenueIds: new Set(),
    discoveryShuffleFilterKey: "",
    discoveryRandomSeed: "",
  };

  function shuffleDiscoveryVenuesInPlace(list) {
    for (let i = list.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [list[i], list[j]] = [list[j], list[i]];
    }
  }

  function highRatedDiscoveryShuffleKey() {
    return [
      mvpMainCategoryKey,
      state.selectedDistrict,
      state.selectedNeighborhood,
      String(state.selectedCategory || ""),
      String(state.selectedSubcategoryId || ""),
      state.selectedBudget,
      state.query.trim(),
      [...state.selectedTags].slice().sort().join("|"),
    ].join("\u0001");
  }

  function discoveryFiltersAllowHighRatedShuffle() {
    if (state.nearbyMode) {
      return false;
    }
    if (state.selectedDistrict || state.selectedNeighborhood || state.selectedBudget) {
      return false;
    }
    if (state.query.trim() || state.selectedTags.length) {
      return false;
    }
    return true;
  }

  function shouldHighRatedRandomDiscoveryApi() {
    return state.dataMode === "api" && discoveryFiltersAllowHighRatedShuffle();
  }

  function shouldHighRatedRandomDiscoveryLocal() {
    return state.dataMode === "local" && discoveryFiltersAllowHighRatedShuffle();
  }

  function clearHighRatedDiscoveryPool() {
    state.discoveryShuffleFilterKey = "";
    state.discoveryRandomSeed = "";
  }

  /** API `budget` filtresi: bütçesi boş/null kayıtlar */
  const BUDGET_UNKNOWN_VALUE = "bilinmiyor";

  /** Verideki uzun mutfak etiketleri → kısa kutu adı (filtre değeri değişmez). */
  function formatCategoryChipDisplayName(rawName) {
    const name = String(rawName || "").trim();
    if (!name) {
      return "";
    }
    if (normalizeText(name) === normalizeText("Pasta-Tatlı-Unlu mamuller")) {
      return "Tatlı";
    }
    if (normalizeText(name) === normalizeText("Asya Mutfağı")) {
      return "Asya";
    }
    return name;
  }

  /**
   * `backend/server.js` ISTANBUL_MVP_CATEGORY_SEEDS ile aynı (API boş / eksik slug için id’siz chip).
   * Slug’lar normalizeText ile eşleşir (Türkçe karakter yok).
   */
  const MVP_CATEGORY_SEED_FALLBACK = [
    { slug: "restoran", name: "Restoran", sortOrder: 10 },
    { slug: "kafe", name: "Kafe", sortOrder: 20 },
    { slug: "kahvalti", name: "Kahvaltı", sortOrder: 30 },
    { slug: "bar", name: "Bar", sortOrder: 40 },
    { slug: "tatli", name: "Tatlı", sortOrder: 50 },
    { slug: "burger", name: "Burger", sortOrder: 60 },
    { slug: "pizza", name: "Pizza", sortOrder: 70 },
    { slug: "kokorec", name: "Kokoreç", sortOrder: 72 },
    { slug: "kofte", name: "Köfte", sortOrder: 74 },
    { slug: "balik", name: "Balık", sortOrder: 80 },
    { slug: "kebap", name: "Kebap", sortOrder: 90 },
    { slug: "doner", name: "Döner", sortOrder: 100 },
    { slug: "lahmacun", name: "Lahmacun", sortOrder: 105 },
    { slug: "pide", name: "Pide", sortOrder: 106 },
    { slug: "firin", name: "Fırın", sortOrder: 107 },
    { slug: "meyhane", name: "Meyhane", sortOrder: 108 },
    { slug: "cigkofte", name: "Çiğ Köfte", sortOrder: 109 },
    { slug: "tantuni", name: "Tantuni", sortOrder: 110 },
    { slug: "manti", name: "Mantı", sortOrder: 111 },
    { slug: "corba", name: "Çorba", sortOrder: 112 },
    { slug: "borek", name: "Börek", sortOrder: 113 },
    { slug: "sushi", name: "Sushi", sortOrder: 114 },
    { slug: "asya-mutfagi", name: "Asya", sortOrder: 115 },
    { slug: "vegan", name: "Vegan", sortOrder: 116 },
  ];

  /** import-venues ISTANBUL_MVP_CUISINES sırası — venue-only liste ile birleştirilirken önce bunlar. */
  const MVP_IMPORT_CUISINES_LABEL_ORDER = [
    "Restoran",
    "Kafe",
    "Kebap",
    "Balık",
    "Bar",
    "Köfte",
    "Döner",
    "Lahmacun",
    "Kahvaltı",
    "Pide",
    "Tatlı",
    "Burger",
    "Pizza",
    "Fırın",
    "Meyhane",
    "Çiğ Köfte",
    "Kokoreç",
    "Tantuni",
    "Mantı",
    "Çorba",
    "Börek",
    "Sushi",
    "Asya",
    "Vegan",
  ];

  function augmentCategoryOptionsFromApi(options) {
    if (mvpMainCategoryKey !== "yeme-icme") {
      const list = Array.isArray(options) ? options.filter(Boolean) : [];
      return list
        .slice()
        .sort((a, b) => String(a.name || "").localeCompare(String(b.name || ""), "tr-TR"));
    }
    const list = Array.isArray(options) ? options.filter(Boolean) : [];
    if (!list.length) {
      return [];
    }
    const bySlug = new Map();
    list.forEach((row) => {
      const slugKey = normalizeText(String(row.slug || "").trim());
      if (slugKey) {
        bySlug.set(slugKey, row);
      }
    });
    const merged = list.slice();
    MVP_CATEGORY_SEED_FALLBACK.forEach((extra) => {
      const key = normalizeText(extra.slug);
      if (key && !bySlug.has(key)) {
        merged.push({
          id: null,
          slug: extra.slug,
          name: extra.name,
          sortOrder: extra.sortOrder,
        });
        bySlug.set(key, true);
      }
    });
    merged.sort((a, b) => String(a.name || "").localeCompare(String(b.name || ""), "tr-TR"));
    return merged.filter((row) => !isExcludedCuisineCategoryOption(row));
  }

  function mergeVenueCuisineLabelsWithPriority(venueLabels) {
    const seen = new Set();
    const out = [];
    function pushLabel(label) {
      let text = String(label || "").trim();
      if (!text) {
        return;
      }
      if (isExcludedCuisineLabelString(text)) {
        return;
      }
      if (normalizeText(text) === normalizeText("Asya Mutfağı")) {
        text = "Asya";
      }
      const key = normalizeText(text);
      if (seen.has(key)) {
        return;
      }
      seen.add(key);
      out.push(text);
    }
    MVP_IMPORT_CUISINES_LABEL_ORDER.forEach(pushLabel);
    (venueLabels || []).forEach(pushLabel);
    out.sort((a, b) => String(a).localeCompare(String(b), "tr-TR"));
    return out;
  }

  const LOCAL_DATA_SOURCES = [
    { label: "Kafeler", file: "data/yeme-icme-kafe.json", category: "Kafe" },
    { label: "Restoranlar", file: "data/yeme-icme-restoran.json", category: "Restoran" },
    { label: "Kahvaltı Mekanları", file: "data/yeme-icme-kahvalti.json", category: "Kahvaltı" },
    { label: "Kebapçılar", file: "data/yeme-icme-kebap.json", category: "Kebap" },
    { label: "Pide ve Lahmacun", file: "data/yeme-icme-pide.json", category: "Pide & Lahmacun" },
    { label: "Dönerciler", file: "data/yeme-icme-doner.json", category: "Döner" },
    { label: "Çiğ Köfteciler", file: "data/yeme-icme-cigkofte.json", category: "Çiğ Köfte" },
    { label: "Meyhaneler", file: "data/yeme-icme-meyhane.json", category: "Meyhane" },
    { label: "Lokantalar", file: "data/yeme-icme-lokantalar.json", category: "Lokanta" },
    { label: "Pub & Bar", file: "data/yeme-icme-pub-bar.json", category: "Pub & Bar" },
    { label: "Michelin Guide", file: "data/yeme-icme-michelin-guide.json", category: "Michelin Guide" },
  ];
  const ISTANBUL_MVP_CITY = "İstanbul";

  const localDataPromise = {
    current: null,
  };
  const officialDistrictsPromise = {
    current: null,
  };
  const nearbyCache = new Map();
  const NEARBY_CACHE_TTL_MS = 2 * 60 * 1000;
  const shareMenuState = {
    trigger: null,
    menu: null,
  };

  function normalizeText(value) {
    if (!value) {
      return "";
    }
    return String(value)
      .trim()
      .toLocaleLowerCase("tr-TR")
      .normalize("NFKD")
      .replace(/\p{Diacritic}/gu, "");
  }

  /** Filtre chip listesinden çıkarılan mutfaklar (DB `slug` / görünen ad ile eşleşir). */
  const EXCLUDED_CUISINE_CATEGORY_KEYS = new Set([
    "fastfood",
    "fast food",
    "fast-food",
    "hizligida",
    "hizli-gida",
    "hizli gida",
    "michelin-guide",
    "michelin guide",
  ]);

  function isExcludedCuisineCategoryOption(row) {
    if (!row || typeof row !== "object") {
      return false;
    }
    const sk = normalizeText(String(row.slug || "").trim());
    const nk = normalizeText(String(row.name || "").trim());
    if (sk && EXCLUDED_CUISINE_CATEGORY_KEYS.has(sk)) {
      return true;
    }
    if (nk && EXCLUDED_CUISINE_CATEGORY_KEYS.has(nk)) {
      return true;
    }
    return false;
  }

  function isExcludedCuisineLabelString(label) {
    const nk = normalizeText(String(label || "").trim());
    return Boolean(nk && EXCLUDED_CUISINE_CATEGORY_KEYS.has(nk));
  }

  function canonicalizeNeighborhoodLabel(value) {
    const safeValue = String(value || "").trim();
    if (!safeValue) {
      return "";
    }

    return safeValue
      .replace(/\s+(mahallesi|mah\.?|mh\.?)$/i, "")
      .trim();
  }

  function normalizeNeighborhood(value) {
    return normalizeText(canonicalizeNeighborhoodLabel(value));
  }

  function isIstanbulCity(value) {
    if (!value) {
      return false;
    }
    return normalizeText(value) === "istanbul";
  }

  function slugify(value) {
    if (!value) {
      return "";
    }
    return normalizeText(value)
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");
  }

  function getLocalFavoriteSet() {
    try {
      const raw = window.localStorage.getItem(state.localFavoritesKey);
      if (!raw) {
        return new Set();
      }
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) {
        return new Set();
      }
      return new Set(parsed.map((item) => String(item)));
    } catch (error) {
      return new Set();
    }
  }

  function saveLocalFavoriteSet(favorites) {
    try {
      const serialized = JSON.stringify(Array.from(favorites));
      window.localStorage.setItem(state.localFavoritesKey, serialized);
    } catch (error) {
      // ignore local storage errors
    }
  }

  function formatVenueRatingText(ratingValue, reviewCount) {
    const rating = Number(ratingValue);
    if (!Number.isFinite(rating) || rating <= 0) {
      return "Puan yok";
    }
    const roundedStars = Math.max(1, Math.min(5, Math.round(rating)));
    const stars = "★".repeat(roundedStars);
    const formattedRating = rating.toFixed(1).replace(".", ",");
    const count = Number(reviewCount);
    if (Number.isFinite(count) && count > 0) {
      return `${stars} ${formattedRating} Google Puanı (${new Intl.NumberFormat("tr-TR").format(count)} yorum)`;
    }
    return `${stars} ${formattedRating} Google Puanı`;
  }

  function formatBudgetLabel(value) {
    const normalized = normalizeText(value);
    if (!normalized) {
      return "";
    }
    if (normalized === normalizeText(BUDGET_UNKNOWN_VALUE)) {
      return "Bilinmiyor";
    }
    if (normalized === "budget" || normalized === "₺" || normalized === "₺₺") {
      return "Uygun";
    }
    if (normalized === "mid" || normalized === "₺₺₺") {
      return "Makul";
    }
    if (normalized === "high" || normalized === "₺₺₺₺") {
      return "Yüksek";
    }
    return String(value);
  }

  /** Chip sırası: Uygun → Makul → Yüksek → Bilinmiyor */
  function budgetDisplayOrderKey(value) {
    const n = normalizeText(String(value || ""));
    if (n === "budget" || n === "₺" || n === "₺₺") {
      return 1;
    }
    if (n === "mid" || n === "₺₺₺") {
      return 2;
    }
    if (n === "high" || n === "₺₺₺₺") {
      return 3;
    }
    if (n === normalizeText(BUDGET_UNKNOWN_VALUE)) {
      return 4;
    }
    return 99;
  }

  function sortBudgetValuesForDisplay(budgets) {
    const arr = (Array.isArray(budgets) ? budgets : [])
      .map((raw) => String(raw ?? "").trim())
      .filter(Boolean);
    return arr.sort((a, b) => {
      const diff = budgetDisplayOrderKey(a) - budgetDisplayOrderKey(b);
      if (diff !== 0) {
        return diff;
      }
      return a.localeCompare(b, "tr-TR");
    });
  }

  function buildLocalVenue(item, source) {
    const name = item.name || item.title || item.adi || "";
    const district = item.district || item.ilce || "";
    const neighborhood = item.neighborhood || item.mahalle || "";
    const address = item.address || item.adres || "";
    const mapsUrl = item.mapsUrl || item.mapUrl || "";
    const slugBase = [name, district, neighborhood, source.category].filter(Boolean).join(" ");
    const slug = slugify(slugBase) || slugify(name);
    const id = `${slug || slugify(name) || "venue"}-${source.category}`;

    return {
      id,
      slug: slug || id,
      name,
      address,
      district,
      neighborhood,
      cuisine: item.cuisine || "",
      category: source.category,
      sourceLabel: source.label,
      source: item.source || "",
      rating: item.rating || item.googleRating || "",
      budget: item.budget || "",
      tags: Array.isArray(item.tags) ? item.tags : [],
      mapsUrl,
      latitude: item.latitude || item.lat || null,
      longitude: item.longitude || item.lng || null,
    };
  }

  async function loadLocalData() {
    if (state.localDataLoaded) {
      return state.localData;
    }
    if (localDataPromise.current) {
      return localDataPromise.current;
    }

    localDataPromise.current = (async () => {
      const results = [];
      for (const source of LOCAL_DATA_SOURCES) {
        try {
          const response = await fetch(source.file, { headers: { Accept: "application/json" } });
          if (!response.ok) {
            continue;
          }
          const payload = await response.json();
          const list = Array.isArray(payload) ? payload : [];
          list.forEach((item) => {
            if (!item || (item.city && !isIstanbulCity(item.city))) {
              return;
            }
            results.push(buildLocalVenue(item, source));
          });
        } catch (error) {
          // ignore failed source
        }
      }

      const deduped = new Map();
      results.forEach((item) => {
        const key = [normalizeText(item.name), normalizeText(item.district), normalizeText(item.address)].join("|");
        if (!deduped.has(key)) {
          deduped.set(key, item);
        }
      });

      state.localData = Array.from(deduped.values());
      state.localDataLoaded = true;
      return state.localData;
    })();

    return localDataPromise.current;
  }

  function buildLocalFilters(items) {
    const districts = new Set();
    const neighborhoodsByDistrict = {};
    const categories = new Set();
    items.forEach((item) => {
      if (item.district) {
        districts.add(item.district);
        if (item.neighborhood) {
          const neighborhoodLabel = canonicalizeNeighborhoodLabel(item.neighborhood);
          if (!neighborhoodLabel) {
            return;
          }
          if (!Array.isArray(neighborhoodsByDistrict[item.district])) {
            neighborhoodsByDistrict[item.district] = [];
          }
          if (!neighborhoodsByDistrict[item.district].includes(neighborhoodLabel)) {
            neighborhoodsByDistrict[item.district].push(neighborhoodLabel);
          }
        }
      }
      if (item.category) {
        categories.add(item.category);
      }
    });

    Object.keys(neighborhoodsByDistrict).forEach((district) => {
      neighborhoodsByDistrict[district].sort((a, b) => a.localeCompare(b, "tr-TR"));
    });

    return {
      districts: Array.from(districts).sort((a, b) => a.localeCompare(b, "tr-TR")),
      neighborhoodsByDistrict,
      categoryOptions: [],
      categories: Array.from(categories).sort((a, b) => a.localeCompare(b, "tr-TR")),
      tags: [],
      budgets: [],
    };
  }

  function buildTextMatch(query, item) {
    const needle = normalizeText(query);
    if (!needle) {
      return true;
    }
    const haystack = [item.name, item.address, item.district, item.neighborhood, item.cuisine]
      .filter(Boolean)
      .map((value) => normalizeText(value))
      .join(" ");
    return haystack.includes(needle);
  }

  function getLocalGeoItems() {
    if (!state.localDataLoaded) {
      return [];
    }
    return state.localData.filter((item) => Number.isFinite(Number(item.latitude)) && Number.isFinite(Number(item.longitude)));
  }

  async function loadOfficialDistricts() {
    if (officialDistrictsPromise.current) {
      return officialDistrictsPromise.current;
    }

    officialDistrictsPromise.current = (async () => {
      try {
        const response = await fetch("data/districts.json", {
          headers: {
            Accept: "application/json",
          },
        });
        if (!response.ok) {
          return [];
        }
        const payload = await response.json();
        const districts = Array.isArray(payload?.[ISTANBUL_MVP_CITY]) ? payload[ISTANBUL_MVP_CITY] : [];
        return districts
          .map((item) => String(item || "").trim())
          .filter(Boolean)
          .sort((a, b) => a.localeCompare(b, "tr-TR"));
      } catch (_error) {
        return [];
      }
    })();

    return officialDistrictsPromise.current;
  }

  function buildDistrictCanonicalMap(districts) {
    return districts.reduce((accumulator, district) => {
      accumulator[normalizeText(district)] = district;
      return accumulator;
    }, {});
  }

  function sanitizeDistrictOptions(rawDistricts, officialDistricts) {
    if (!Array.isArray(officialDistricts) || !officialDistricts.length) {
      return Array.isArray(rawDistricts) ? rawDistricts : [];
    }

    const canonicalMap = buildDistrictCanonicalMap(officialDistricts);
    const resolved = new Set();

    if (Array.isArray(rawDistricts) && rawDistricts.length) {
      rawDistricts.forEach((district) => {
        const canonical = canonicalMap[normalizeText(district)];
        if (canonical) {
          resolved.add(canonical);
        }
      });
    }

    if (!resolved.size) {
      officialDistricts.forEach((district) => resolved.add(district));
    }

    return Array.from(resolved).sort((a, b) => a.localeCompare(b, "tr-TR"));
  }

  async function fetchNeighborhoodOptionsForDistrict(district) {
    const districtName = String(district || "").trim();
    if (!districtName) {
      return [];
    }

    const collected = new Set();
    let page = 1;
    let totalPages = 1;

    while (page <= totalPages) {
      const params = new URLSearchParams();
      params.set("district", districtName);
      params.set("page", String(page));
      params.set("limit", "50");
      params.set("mainCategoryKey", mvpMainCategoryKey);

      const response = await fetch(buildVenueListEndpoint(params), {
        headers: {
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Mahalle listesi alınamadı.");
      }

      const payload = await response.json();
      const items = Array.isArray(payload.items) ? payload.items : [];
      items.forEach((item) => {
        const neighborhood = canonicalizeNeighborhoodLabel(item?.neighborhood || "");
        if (neighborhood) {
          collected.add(neighborhood);
        }
      });

      totalPages = Number(payload?.pagination?.totalPages || 1);
      page += 1;
    }

    return Array.from(collected).sort((a, b) => a.localeCompare(b, "tr-TR"));
  }

  async function ensureNeighborhoodsForDistrict(district) {
    const districtName = String(district || "").trim();
    if (!districtName) {
      return [];
    }

    const cached = state.filters.neighborhoodsByDistrict?.[districtName];
    if (Array.isArray(cached) && cached.length) {
      return cached;
    }

    if (state.dataMode === "local") {
      return Array.isArray(cached) ? cached : [];
    }

    const options = await fetchNeighborhoodOptionsForDistrict(districtName);
    state.filters.neighborhoodsByDistrict = {
      ...state.filters.neighborhoodsByDistrict,
      [districtName]: options,
    };
    return options;
  }

  function buildNearbyCacheKey() {
    if (!state.userLocation) {
      return "";
    }
    const lat = Number(state.userLocation.lat || 0).toFixed(3);
    const lng = Number(state.userLocation.lng || 0).toFixed(3);
    const query = normalizeText(state.query);
    const district = normalizeText(state.selectedDistrict);
    const neighborhood = normalizeText(state.selectedNeighborhood);
    const category = normalizeText(state.selectedCategory);
    return [lat, lng, query, district, neighborhood, category].join("|");
  }

  function getNearbyCache() {
    const key = buildNearbyCacheKey();
    if (!key) {
      return null;
    }
    const cached = nearbyCache.get(key);
    if (!cached) {
      return null;
    }
    if (Date.now() - cached.timestamp > NEARBY_CACHE_TTL_MS) {
      nearbyCache.delete(key);
      return null;
    }
    return cached;
  }

  function setNearbyCache(payload) {
    const key = buildNearbyCacheKey();
    if (!key) {
      return;
    }
    nearbyCache.set(key, { ...payload, timestamp: Date.now() });
  }

  function buildBoundingBox(userLocation, radiusMeters) {
    const lat = Number(userLocation.lat);
    const lng = Number(userLocation.lng);
    const latDelta = radiusMeters / 111320;
    const lngDelta = radiusMeters / (111320 * Math.cos((lat * Math.PI) / 180));
    return {
      minLat: lat - latDelta,
      maxLat: lat + latDelta,
      minLng: lng - lngDelta,
      maxLng: lng + lngDelta,
    };
  }

  function isInsideBox(item, box) {
    const lat = Number(item.latitude);
    const lng = Number(item.longitude);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      return false;
    }
    return lat >= box.minLat && lat <= box.maxLat && lng >= box.minLng && lng <= box.maxLng;
  }

  function computeDistanceMeters(userLocation, item) {
    if (!userLocation) return null;
    const lat = Number(item.latitude);
    const lng = Number(item.longitude);
    // Koordinat geçerlilik kontrolü: null, boş, 0 veya Türkiye dışı → geçersiz
    if (!item.latitude || !item.longitude || !Number.isFinite(lat) || !Number.isFinite(lng)) return null;
    if (lat < 35 || lat > 43 || lng < 25 || lng > 45) return null;
    const toRad = (value) => (Number(value) * Math.PI) / 180;
    const lat1 = toRad(userLocation.lat);
    const lon1 = toRad(userLocation.lng);
    const lat2 = toRad(lat);
    const lon2 = toRad(lng);
    const dLat = lat2 - lat1;
    const dLon = lon2 - lon1;
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const meters = 6371000 * c;
    // 500 km üzeri mesafe İstanbul için mantıksız
    if (meters > 500000) return null;
    return meters;
  }

  function getCategoryImage(category, name) {
    const normalized = normalizeText(category) + " " + normalizeText(name || "");
    if (normalized.includes("akaryakıt") || normalized.includes("akaryakit") || normalized.includes("benzin") || normalized.includes("petrol ofisi") || normalized.includes("opet") || normalized.includes("shell") || normalized.includes("bp ") || normalized.includes("total") || normalized.includes("lukoil")) {
      return "assets/pompa.png";
    }
    if (normalized.includes("veteriner") || normalized.includes("vet mua")) {
      return "assets/veteriner.png";
    }
    if (normalized.includes("berber") || normalized.includes("barber")) {
      return "assets/berber.jpeg";
    }
    if (normalized.includes("kuafor") || normalized.includes("kuaför") || normalized.includes("güzellik") || normalized.includes("guzellik") || normalized.includes("saç") || normalized.includes("sac")) {
      return "assets/sac.png";
    }
    if (normalized.includes("eczane")) {
      return "assets/eczane.png";
    }
    if (normalized.includes("hastane") || normalized.includes("asm") || normalized.includes("toplum saglıgı") || normalized.includes("saglık merkezi") || normalized.includes("aile saglıgı")) {
      return "assets/hasta.png";
    }
    if (normalized.includes("kafe") || normalized.includes("cafe")) {
      return "assets/kafe.png";
    }
    if (normalized.includes("kultur") || normalized.includes("kültür") || normalized.includes("muze") || normalized.includes("müze") || normalized.includes("cami") || normalized.includes("kilise") || normalized.includes("sinagog") || mvpMainCategoryKey === "kultur") {
      return "assets/kultur.png";
    }
    return "assets/yemek.png";
  }

  function isPlaceholderImage(src) {
    return src.includes("assets/eczane.png") || src.includes("assets/hasta.png") || src.includes("assets/kafe.png") || src.includes("assets/yemek.png") || src.includes("assets/pompa.png") || src.includes("assets/veteriner.png") || src.includes("assets/sac.png") || src.includes("assets/kultur.png") || src.includes("assets/berber.jpeg");
  }

  function readVenueSlugFromUrl() {
    const params = new URLSearchParams(window.location.search);
    return params.get("venue") || "";
  }

  function readInitialDistrictFromUrl() {
    const params = new URLSearchParams(window.location.search);
    return (params.get("district") || params.get("ilce") || "").trim();
  }

  function readInitialNeighborhoodFromUrl() {
    const params = new URLSearchParams(window.location.search);
    return (params.get("neighborhood") || params.get("mahalle") || "").trim();
  }

  function readInitialSubcategoryIdFromUrl() {
    const params = new URLSearchParams(window.location.search);
    const raw = params.get("subcategoryId");
    if (raw == null || raw === "") {
      return "";
    }
    const parsed = Number.parseInt(String(raw), 10);
    return Number.isFinite(parsed) ? String(parsed) : "";
  }

  function readInitialCategoryIdFromUrl() {
    const params = new URLSearchParams(window.location.search);
    const raw = params.get("categoryId");
    if (raw == null || raw === "") {
      return "";
    }
    const parsed = Number.parseInt(String(raw), 10);
    return Number.isFinite(parsed) ? String(parsed) : "";
  }

  function readInitialCategoryNameFromUrl() {
    const params = new URLSearchParams(window.location.search);
    return (
      params.get("category") ||
      params.get("kategori") ||
      params.get("categoryName") ||
      ""
    ).trim();
  }

  function readInitialQueryFromUrl() {
    const params = new URLSearchParams(window.location.search);
    return (params.get("q") || params.get("query") || "").trim();
  }

  function syncMvpSubcategoryBoxVisuals() {
    if (!mvpSubcategoryGrid) {
      return;
    }
    const sel = String(state.selectedSubcategoryId || "").trim();
    mvpSubcategoryGrid.querySelectorAll(".istanbul-mvp-subcategory-box").forEach((btn) => {
      const idRaw = btn.getAttribute("data-subcategory-id");
      const id = idRaw == null ? "" : String(idRaw).trim();
      const isAll = id === "";
      const active = isAll ? !sel : Boolean(sel) && id === String(sel);
      btn.classList.toggle("is-active", active);
    });
    syncKesfetCategoryTriggerIstanbul();
  }

  function applySubcategoryFromUrl() {
    if (!mvpSubcategoryBoxGrid) {
      return;
    }
    const idFromUrl = readInitialSubcategoryIdFromUrl();
    if (idFromUrl) {
      const match = state.mvpSubcategoryEntries.find((e) => String(e.id) === idFromUrl);
      state.selectedSubcategoryId = match ? idFromUrl : "";
      if (match) {
        state.selectedCategory = "";
      }
      syncMvpSubcategoryBoxVisuals();
      syncHizmetBreadcrumbFromSubcategory();
      return;
    }

    // İsim bazlı eşleşme: ?kategori=Kafeler gibi
    const nameFromUrl = readInitialCategoryNameFromUrl();
    if (nameFromUrl) {
      const normalizedName = normalizeText(nameFromUrl);
      const match = state.mvpSubcategoryEntries.find(
        (e) => normalizeText(String(e.name || "")) === normalizedName
          || normalizeText(String(e.slug || "")) === normalizedName
      );
      if (match) {
        state.selectedSubcategoryId = String(match.id);
        state.selectedCategory = "";
        syncMvpSubcategoryBoxVisuals();
        syncHizmetBreadcrumbFromSubcategory();
        return;
      }
    }

    state.selectedSubcategoryId = "";
    syncMvpSubcategoryBoxVisuals();
    syncHizmetBreadcrumbFromSubcategory();
  }

  function applyHizmetLegacyTurParamToSubcategory() {
    if (mvpMainCategoryKey !== "hizmetler" || !mvpSubcategoryBoxGrid) {
      return;
    }
    if (String(state.selectedSubcategoryId || "").trim()) {
      return;
    }
    const params = new URLSearchParams(window.location.search);
    const raw = params.get("tur") || params.get("hizmet") || "";
    if (!raw) {
      return;
    }
    const tur = parseHizmetTurParam(raw);
    const list = state.mvpSubcategoryEntries;
    if (!list.length) {
      return;
    }
    const match = list.find(
      (e) =>
        normalizeText(String(e.slug || "")) === normalizeText(tur) ||
        normalizeText(String(e.key || "")) === normalizeText(tur),
    );
    if (match) {
      state.selectedSubcategoryId = String(match.id);
      state.selectedCategory = "";
    }
  }

  function syncHizmetBreadcrumbFromSubcategory() {
    const leaf = document.getElementById("hizmetBreadcrumbCurrent");
    if (!leaf) {
      return;
    }
    if (String(state.selectedSubcategoryId || "").trim()) {
      const ent = state.mvpSubcategoryEntries.find(
        (e) => String(e.id) === String(state.selectedSubcategoryId).trim(),
      );
      leaf.textContent = ent ? formatCategoryChipDisplayName(ent.name) : "Hizmetler";
      return;
    }
    leaf.textContent = "Hizmetler";
  }

  function applyCategoryFromUrl() {
    if (mvpSubcategoryBoxGrid) {
      return;
    }
    if (mvpHizmetCategoryPicker) {
      const params = new URLSearchParams(window.location.search);
      const tur = parseHizmetTurParam(params.get("tur") || params.get("hizmet") || "");
      applyHizmetCategoryFromSlug(tur);
      syncHizmetCategoryPickerVisuals();
      syncCategoryChipVisuals();
      return;
    }
    if (mvpLockedCategorySlug) {
      applyMvpLockedCategory();
      syncCategoryChipVisuals();
      return;
    }
    const idFromUrl = readInitialCategoryIdFromUrl();
    const nameFromUrl = readInitialCategoryNameFromUrl();
    const options = Array.isArray(state.filters.categoryOptions) ? state.filters.categoryOptions : [];

    if (nameFromUrl && isExcludedCuisineLabelString(nameFromUrl)) {
      state.selectedCategory = "";
      syncCategoryChipVisuals();
      return;
    }

    if (options.length) {
      if (idFromUrl) {
        const byId = options.find((opt) => String(opt.id) === idFromUrl);
        if (byId) {
          if (isExcludedCuisineCategoryOption(byId)) {
            state.selectedCategory = "";
          } else {
            state.selectedCategory = idFromUrl;
          }
          syncCategoryChipVisuals();
          return;
        }
      }
      if (nameFromUrl) {
        const byName = options.find((opt) => normalizeText(String(opt.name || "")) === normalizeText(nameFromUrl));
        if (byName) {
          if (isExcludedCuisineCategoryOption(byName)) {
            state.selectedCategory = "";
          } else if (byName.id != null && String(byName.id).trim() !== "") {
            state.selectedCategory = String(byName.id);
          } else {
            state.selectedCategory = String(byName.name || "").trim() || nameFromUrl;
          }
          syncCategoryChipVisuals();
          return;
        }
        // Serbest mutfak/metin: API `category` ile filtreler (tam kategori adı değilse de çalışsın)
        state.selectedCategory = nameFromUrl;
        syncCategoryChipVisuals();
        return;
      }
      syncCategoryChipVisuals();
      return;
    }

    const categories = Array.isArray(state.filters.categories) ? state.filters.categories : [];
    if (nameFromUrl) {
      const resolved = categories.find((entry) => normalizeText(String(entry)) === normalizeText(nameFromUrl));
      if (resolved && !isExcludedCuisineLabelString(resolved)) {
        state.selectedCategory = resolved;
      }
    }
    syncCategoryChipVisuals();
  }

  function resolveDistrictFromFilters(rawDistrict) {
    if (!rawDistrict || !Array.isArray(state.filters.districts)) {
      return "";
    }
    const normalizedRaw = normalizeText(rawDistrict);
    return state.filters.districts.find((districtLabel) => normalizeText(districtLabel) === normalizedRaw) || "";
  }

  async function applyInitialFiltersFromUrl() {
    if (!districtOptionsContainer) {
      return;
    }
    const rawDistrict = readInitialDistrictFromUrl();
    const rawNeighborhood = readInitialNeighborhoodFromUrl();
    const resolvedDistrict = resolveDistrictFromFilters(rawDistrict);
    if (!resolvedDistrict) {
      return;
    }
    state.selectedDistrict = resolvedDistrict;
    syncDistrictTriggerLabelIstanbul();
    syncDistrictBoxVisualsIstanbul();
    await ensureNeighborhoodsForDistrict(resolvedDistrict);
    populateNeighborhoodSelect();

    if (!rawNeighborhood) {
      return;
    }
    const options = Array.isArray(state.filters.neighborhoodsByDistrict?.[resolvedDistrict])
      ? state.filters.neighborhoodsByDistrict[resolvedDistrict]
      : [];
    const normalizedNeighborhood = normalizeNeighborhood(rawNeighborhood);
    const resolvedNeighborhood =
      options.find((item) => normalizeNeighborhood(item) === normalizedNeighborhood) || "";
    if (!resolvedNeighborhood) {
      return;
    }
    state.selectedNeighborhood = resolvedNeighborhood;
    if (neighborhoodSelect) {
      neighborhoodSelect.value = resolvedNeighborhood;
    }
    syncNeighborhoodBoxVisualsIstanbul();
    syncNeighborhoodTriggerLabelIstanbul();
  }

  function syncVenueSlugToUrl(slug) {
    const url = new URL(window.location.href);
    if (slug) {
      url.searchParams.set("venue", slug);
    } else {
      url.searchParams.delete("venue");
    }
    window.history.replaceState({}, "", url.toString());
  }

  const queryInput = document.getElementById("queryInput");
  const neighborhoodSelect = document.getElementById("neighborhoodSelect");
  const categorySelect = document.getElementById("categorySelect");
  const categoryChipRow = document.getElementById("categoryChipRow");
  const budgetChipRow = document.getElementById("budgetChipRow");
  const tagRow = document.getElementById("tagRow");
  const resetFiltersButton = document.getElementById("resetFiltersButton");
  const nearbyButton = document.getElementById("nearbyButton");
  const locationMessage = document.getElementById("locationMessage");
  const resultsTitle = document.getElementById("resultsTitle");
  const resultsMeta = document.getElementById("resultsMeta");
  const resultsState = document.getElementById("resultsState");
  const resultsLayout = document.getElementById("resultsLayout");
  const pagination = document.getElementById("pagination");
  const activeFilterPills = document.getElementById("activeFilterPills");
  const template = document.getElementById("istanbulVenueCardTemplate");
  const mapPanelTitle = document.getElementById("mapPanelTitle");
  const mapPanelMeta = document.getElementById("mapPanelMeta");
  const mapPanelFrame = document.getElementById("mapPanelFrame");
  const mapPanelAddress = document.getElementById("mapPanelAddress");
  const mapPanelRating = document.getElementById("mapPanelRating");
  const mapPanelStatus = document.getElementById("mapPanelStatus");
  const mapPanelFavoriteButton = document.getElementById("mapPanelFavoriteButton");
  const hasMapPanel = Boolean(
    mapPanelTitle && mapPanelMeta && mapPanelFrame && mapPanelAddress && mapPanelRating && mapPanelStatus,
  );
  const opensVenueDetailFromCard = !hasMapPanel;

  function syncCategoryChipVisuals() {
    if (!categoryChipRow) {
      return;
    }
    const raw = String(state.selectedCategory || "").trim();

    categoryChipRow.querySelectorAll(".istanbul-filter-chip").forEach((btn) => {
      btn.classList.remove("is-active");
      const isClear = btn.getAttribute("data-clear") === "true";
      const catId = btn.getAttribute("data-category-id");
      const catVal = btn.getAttribute("data-category-value");
      let active = false;
      if (!raw) {
        active = isClear;
      } else if (isClear) {
        active = false;
      } else {
        const idStr = catId == null ? "" : String(catId).trim();
        if (idStr) {
          active = idStr === String(raw);
        } else {
          const valStr = catVal == null ? "" : String(catVal).trim();
          if (valStr) {
            active = normalizeText(valStr) === normalizeText(String(raw));
          }
        }
      }
      if (active) {
        btn.classList.add("is-active");
      }
      btn.setAttribute("aria-checked", active ? "true" : "false");
    });
  }

  function buildBudgetOptionsForFilter() {
    let budgetRows = sortBudgetValuesForDisplay(state.filters.budgets);
    const hasUnknown = budgetRows.some(
      (v) => normalizeText(String(v)) === normalizeText(BUDGET_UNKNOWN_VALUE),
    );
    if (!hasUnknown) {
      budgetRows = [...budgetRows, BUDGET_UNKNOWN_VALUE];
      budgetRows.sort((a, b) => budgetDisplayOrderKey(a) - budgetDisplayOrderKey(b));
    }
    return budgetRows;
  }

  function syncBudgetChipVisuals() {
    if (budgetChipRow) {
      const raw = String(state.selectedBudget || "").trim();
      budgetChipRow.querySelectorAll(".istanbul-filter-chip").forEach((btn) => {
        btn.classList.remove("is-active");
        const isClear = btn.getAttribute("data-clear") === "true";
        const val = btn.getAttribute("data-budget-value");
        let active = false;
        if (!raw) {
          active = isClear;
        } else if (val !== null && String(val) === raw) {
          active = true;
        }
        if (active) {
          btn.classList.add("is-active");
        }
        btn.setAttribute("aria-checked", active ? "true" : "false");
      });
      return;
    }
    if (kesfetBudgetOptionsContainer) {
      const raw = String(state.selectedBudget || "").trim();
      kesfetBudgetOptionsContainer.querySelectorAll(".istanbul-mvp-subcategory-box").forEach((btn) => {
        if (!btn.hasAttribute("data-budget-value")) {
          return;
        }
        const v = btn.getAttribute("data-budget-value");
        const isAll = (v || "") === "";
        const active = !raw ? isAll : v === raw;
        btn.classList.toggle("is-active", active);
        btn.setAttribute("aria-checked", active ? "true" : "false");
      });
      syncKesfetBudgetTriggerIstanbul();
    }
  }

  function setLoading(isLoading, message) {
    state.loading = isLoading;
    if (resultsState) {
      resultsState.hidden = !message;
      resultsState.textContent = message || "";
    }
    if (nearbyButton) {
      nearbyButton.disabled = isLoading;
    }
  }

  function syncNearbyToggle() {
    if (!nearbyButton) {
      return;
    }
    const isActive = Boolean(state.nearbyMode && state.userLocation);
    nearbyButton.classList.toggle("is-active", isActive);
    nearbyButton.setAttribute("aria-pressed", isActive ? "true" : "false");
    nearbyButton.dataset.state = isActive ? "on" : "off";
  }

  function formatCount(count) {
    return new Intl.NumberFormat("tr-TR").format(Number(count || 0));
  }

  function formatDistance(distanceMeters) {
    if (!Number.isFinite(distanceMeters)) {
      return "";
    }
    if (distanceMeters < 1000) {
      return `${Math.round(distanceMeters)} m`;
    }
    return `${(distanceMeters / 1000).toFixed(1).replace(".", ",")} km`;
  }

  function saveReturnUrl() {
    try {
      const currentUrl = window.location.pathname.replace(/^\//, "") + window.location.search;
      sessionStorage.setItem("aramabul:venue-list-return-url", currentUrl);
    } catch (_e) {
      // sessionStorage may be unavailable.
    }
  }

  function buildDetailUrl(item) {
    saveReturnUrl();
    const slug = String(item?.slug || "").trim();
    if (slug) {
      return `venue-detail.html?slug=${encodeURIComponent(slug)}`;
    }
    return `venue-detail.html?venue=${encodeURIComponent(item.name)}&district=${encodeURIComponent(item.district || "")}`;
  }

  /** Same filter URLs as homepage featured cards (featured-venues.js). */
  function buildYemeIcmeDistrictFilterUrl(district) {
    return `${mvpPageFile}?district=${encodeURIComponent(String(district || "").trim())}`;
  }

  function buildYemeIcmeNeighborhoodFilterUrl(district, neighborhood) {
    const params = new URLSearchParams();
    params.set("district", String(district || "").trim());
    params.set("neighborhood", String(neighborhood || "").trim());
    return `${mvpPageFile}?${params.toString()}`;
  }

  function resolveCategoryOptionForVenue(item) {
    const cuisine = String(item.cuisine || "").trim();
    const category = String(item.category || "").trim();
    const options = Array.isArray(state.filters.categoryOptions) ? state.filters.categoryOptions : [];
    if (!options.length) {
      return null;
    }
    for (const opt of options) {
      const name = String(opt.name || "").trim();
      const slug = String(opt.slug || "").trim();
      if (name && (normalizeText(name) === normalizeText(cuisine) || normalizeText(name) === normalizeText(category))) {
        return opt;
      }
      if (slug && (normalizeText(slug) === normalizeText(cuisine) || normalizeText(slug) === normalizeText(category))) {
        return opt;
      }
    }
    return null;
  }

  function buildYemeIcmeCategoryFilterUrl(item) {
    const cuisine = String(item.cuisine || "").trim();
    const category = String(item.category || "").trim();
    const displayLabel = cuisine || category;
    if (!displayLabel) {
      return "";
    }
    const matched = resolveCategoryOptionForVenue(item);
    if (matched && matched.id != null && matched.id !== "") {
      return `${mvpPageFile}?categoryId=${encodeURIComponent(String(matched.id))}`;
    }
    return `${mvpPageFile}?category=${encodeURIComponent(displayLabel)}`;
  }

  function buildAbsoluteUrl(path) {
    try {
      return new URL(path, window.location.href).href;
    } catch (error) {
      return String(path || window.location.href);
    }
  }

  function buildCardShareLinks(item) {
    const detailUrl = buildAbsoluteUrl(buildDetailUrl(item));
    const venueName = item.name || "AramaBul";
    const shareTitle = `${venueName} | aramabul`;
    const shareText = `${shareTitle}\n${detailUrl}`;

    return {
      detailUrl,
      shareTitle,
      whatsappUrl: `https://wa.me/?text=${encodeURIComponent(shareText)}`,
      facebookUrl: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(detailUrl)}`,
      telegramUrl: `https://t.me/share/url?url=${encodeURIComponent(detailUrl)}&text=${encodeURIComponent(shareTitle)}`,
      xUrl: `https://twitter.com/intent/tweet?text=${encodeURIComponent(`${shareTitle} ${detailUrl}`)}`,
    };
  }

  function closeCardShareMenus() {
    if (shareMenuState.trigger) {
      shareMenuState.trigger.setAttribute("aria-expanded", "false");
    }
    if (shareMenuState.menu) {
      shareMenuState.menu.hidden = true;
    }
    shareMenuState.trigger = null;
    shareMenuState.menu = null;
  }

  function toggleCardShareMenu(trigger, menu) {
    const isOpen = shareMenuState.trigger === trigger && shareMenuState.menu === menu && !menu.hidden;
    closeCardShareMenus();
    if (isOpen) {
      return;
    }
    trigger.setAttribute("aria-expanded", "true");
    menu.hidden = false;
    shareMenuState.trigger = trigger;
    shareMenuState.menu = menu;
  }

  function copyTextToClipboard(text) {
    if (navigator.clipboard && typeof navigator.clipboard.writeText === "function") {
      return navigator.clipboard.writeText(text);
    }

    return new Promise((resolve, reject) => {
      const textArea = document.createElement("textarea");
      textArea.value = text;
      textArea.setAttribute("readonly", "readonly");
      textArea.style.position = "fixed";
      textArea.style.opacity = "0";
      document.body.appendChild(textArea);
      textArea.select();

      try {
        document.execCommand("copy");
        resolve();
      } catch (error) {
        reject(error);
      } finally {
        document.body.removeChild(textArea);
      }
    });
  }

  function bindCardShare(fragment, item) {
    const shareWrap = fragment.querySelector(".card-share-wrap");
    const shareTrigger = fragment.querySelector(".card-share-trigger");
    const shareMenu = fragment.querySelector(".card-share-menu");
    const nativeShareButton = fragment.querySelector(".card-native-share-button");
    const whatsappShareLink = fragment.querySelector(".card-whatsapp-share-link");
    const facebookShareLink = fragment.querySelector(".card-facebook-share-link");
    const telegramShareLink = fragment.querySelector(".card-telegram-share-link");
    const xShareLink = fragment.querySelector(".card-x-share-link");
    const copyShareButton = fragment.querySelector(".card-copy-share-button");

    if (!shareWrap || !shareTrigger || !shareMenu || !whatsappShareLink || !facebookShareLink || !telegramShareLink || !xShareLink || !copyShareButton) {
      return;
    }

    const shareLinks = buildCardShareLinks(item);
    whatsappShareLink.href = shareLinks.whatsappUrl;
    facebookShareLink.href = shareLinks.facebookUrl;
    telegramShareLink.href = shareLinks.telegramUrl;
    xShareLink.href = shareLinks.xUrl;

    shareTrigger.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      toggleCardShareMenu(shareTrigger, shareMenu);
    });

    shareMenu.addEventListener("click", (event) => {
      event.stopPropagation();
    });

    [whatsappShareLink, facebookShareLink, telegramShareLink, xShareLink].forEach((node) => {
      node.addEventListener("click", (event) => {
        event.stopPropagation();
        closeCardShareMenus();
      });
    });

    if (nativeShareButton) {
      if (typeof navigator.share === "function") {
        nativeShareButton.hidden = false;
        nativeShareButton.addEventListener("click", async (event) => {
          event.preventDefault();
          event.stopPropagation();
          try {
            await navigator.share({
              title: shareLinks.shareTitle,
              text: item.name || "AramaBul",
              url: shareLinks.detailUrl,
            });
            closeCardShareMenus();
          } catch (error) {
            if (error && error.name === "AbortError") {
              return;
            }
            setLocationMessage("Paylaşım açılamadı.", true);
          }
        });
      } else {
        nativeShareButton.hidden = true;
      }
    }

    copyShareButton.addEventListener("click", async (event) => {
      event.preventDefault();
      event.stopPropagation();
      try {
        await copyTextToClipboard(shareLinks.detailUrl);
        closeCardShareMenus();
        setLocationMessage("Bağlantı kopyalandı.", false);
      } catch (error) {
        setLocationMessage("Bağlantı kopyalanamadı.", true);
      }
    });
  }

  function buildMapEmbedUrl(item) {
    const embedFromMapsUrl = (() => {
      try {
        if (!item.mapsUrl) {
          return "";
        }

        const parsedUrl = new URL(item.mapsUrl);
        const directQuery = parsedUrl.searchParams.get("query") || parsedUrl.searchParams.get("q") || "";
        if (directQuery) {
          return `https://maps.google.com/maps?hl=tr&q=${encodeURIComponent(directQuery)}&z=15&output=embed`;
        }

        const cid = parsedUrl.searchParams.get("cid") || "";
        if (cid) {
          return `https://www.google.com/maps?cid=${encodeURIComponent(cid)}&hl=tr&output=embed`;
        }

        return "";
      } catch (error) {
        return "";
      }
    })();

    if (embedFromMapsUrl) {
      return embedFromMapsUrl;
    }

    if (Number.isFinite(Number(item.latitude)) && Number.isFinite(Number(item.longitude))) {
      const latitude = Number(item.latitude);
      const longitude = Number(item.longitude);
      return `https://maps.google.com/maps?hl=tr&q=${encodeURIComponent(`${latitude},${longitude}`)}&z=15&output=embed`;
    }

    const fallbackQuery = item.address || item.name || "İstanbul";
    return `https://maps.google.com/maps?hl=tr&q=${encodeURIComponent(fallbackQuery)}&z=15&output=embed`;
  }

  function getSelectedVenue() {
    return state.items.find((item) => item.slug === state.selectedVenueSlug) || null;
  }

  function syncSelectedVenue() {
    const selectedVenue = getSelectedVenue();
    if (selectedVenue) {
      syncVenueSlugToUrl(selectedVenue.slug || "");
      return selectedVenue;
    }
    if (!state.items.length) {
      state.selectedVenueSlug = "";
      syncVenueSlugToUrl("");
      return null;
    }
    if (!hasMapPanel) {
      state.selectedVenueSlug = "";
      syncVenueSlugToUrl("");
      return null;
    }
    state.selectedVenueSlug = state.items[0].slug || "";
    const nextSelectedVenue = getSelectedVenue();
    syncVenueSlugToUrl(nextSelectedVenue?.slug || "");
    return nextSelectedVenue;
  }

  function formatStatus(item) {
    if (item.temporarilyClosed) {
      return "Geçici olarak kapalı";
    }
    if (item.isOpenNow === true) {
      return item.openingStatusText || "Şu an açık";
    }
    if (item.isOpenNow === false) {
      return item.openingStatusText || "Şu an kapalı";
    }
    return item.openingStatusText || "Durum bilgisi yok";
  }

  function isFavoriteVenue(venueId) {
    return state.favoriteVenueIds.has(String(venueId));
  }

  function updateFavoriteButtonLabel(button, venueId) {
    if (!button) {
      return;
    }
    const isFavorite = isFavoriteVenue(venueId);
    button.textContent = isFavorite ? "Kaydedildi" : "Kaydet";
    button.classList.toggle("is-active", isFavorite);
    button.setAttribute("aria-pressed", isFavorite ? "true" : "false");
  }

  async function loadFavoriteIds() {
    if (state.dataMode === "local") {
      state.favoriteVenueIds = getLocalFavoriteSet();
      return;
    }

    const venueIds = state.items
      .map((item) => Number(item.id))
      .filter((item) => Number.isFinite(item) && item > 0);

    if (!venueIds.length) {
      state.favoriteVenueIds = new Set();
      return;
    }

    const params = new URLSearchParams();
    params.set("venueIds", venueIds.join(","));

    const response = await fetch(`/api/mvp/favorites/ids?${params.toString()}`, {
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Favori durumları yüklenemedi.");
    }

    const payload = await response.json();
    state.favoriteVenueIds = new Set(Array.isArray(payload.ids) ? payload.ids.map((item) => String(item)) : []);
  }

  async function toggleFavorite(venueId) {
    if (!venueId) {
      return;
    }

    if (state.dataMode === "local") {
      const key = String(venueId);
      const isFavorite = isFavoriteVenue(venueId);
      if (isFavorite) {
        state.favoriteVenueIds.delete(key);
        setLocationMessage("Mekan favorilerden çıkarıldı.", false);
      } else {
        state.favoriteVenueIds.add(key);
        setLocationMessage("Mekan favorilere kaydedildi.", false);
      }
      saveLocalFavoriteSet(state.favoriteVenueIds);
      renderVenueCards();
      renderMapPanel();
      return;
    }

    const isFavorite = isFavoriteVenue(venueId);
    const endpoint = `/api/mvp/favorites/${encodeURIComponent(venueId)}`;
    const response = await fetch(endpoint, {
      method: isFavorite ? "DELETE" : "POST",
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Favori işlemi tamamlanamadı.");
    }

    if (isFavorite) {
      state.favoriteVenueIds.delete(String(venueId));
      setLocationMessage("Mekan favorilerden çıkarıldı.", false);
    } else {
      state.favoriteVenueIds.add(String(venueId));
      setLocationMessage("Mekan favorilere kaydedildi.", false);
    }

    renderVenueCards();
    renderMapPanel();
  }

  function renderMapPanel() {
    if (!hasMapPanel) {
      if (resultsLayout) {
        resultsLayout.hidden = !state.items.length;
      }
      return;
    }

    const item = syncSelectedVenue();
    if (!item) {
      if (resultsLayout) {
        resultsLayout.hidden = true;
      }
      return;
    }

    if (resultsLayout) {
      resultsLayout.hidden = false;
    }

    mapPanelTitle.textContent = item.name || "İsimsiz mekan";
    mapPanelMeta.textContent = [item.district, item.neighborhood, item.cuisine].filter(Boolean).join(" / ") || "İstanbul";
    mapPanelAddress.textContent = item.address || "Adres bilgisi bulunmuyor.";
    mapPanelRating.textContent = formatVenueRatingText(item.rating, item.userRatingCount);
    mapPanelStatus.textContent = formatStatus(item);
    mapPanelFrame.src = buildMapEmbedUrl(item);
    updateFavoriteButtonLabel(mapPanelFavoriteButton, item.id);
  }

  function selectVenue(slug) {
    if (!slug) {
      return;
    }
    state.selectedVenueSlug = slug;
    syncVenueSlugToUrl(slug);
    renderVenueCards();
    renderMapPanel();
  }

  function setLocationMessage(message, isError) {
    if (!locationMessage) {
      return;
    }
    locationMessage.textContent = message;
    locationMessage.dataset.state = isError ? "error" : "neutral";
  }

  function updateModeHeading() {
    if (!resultsTitle) {
      return;
    }

    const _t = window.ARAMABUL_HEADER_I18N?.getStaticUiTranslation || ((t) => t);

    if (mvpHizmetCategoryPicker) {
      const near = {
        kuafor: _t("Konumuna göre sıralanan kuaförler"),
        veteriner: _t("Konumuna göre sıralanan veteriner klinikleri"),
        akaryakit: _t("Konumuna göre sıralanan akaryakıt istasyonları"),
        berber: _t("Konumuna göre sıralanan berberler"),
      };
      const list = {
        kuafor: _t("İstanbul'da keşfedebileceğin kuaförler"),
        veteriner: _t("İstanbul'da keşfedebileceğin veteriner klinikleri"),
        akaryakit: _t("İstanbul'da keşfedebileceğin akaryakıt istasyonları"),
        berber: _t("İstanbul'da keşfedebileceğin berberler"),
      };
      const slug = hizmetPickerActiveSlug;
      if (state.nearbyMode && state.userLocation) {
        resultsTitle.textContent = near[slug] || near.kuafor;
        return;
      }
      resultsTitle.textContent = list[slug] || list.kuafor;
      return;
    }

    if (mvpLockedCategorySlug && normalizeText(mvpLockedCategorySlug) === "kuafor") {
      if (state.nearbyMode && state.userLocation) {
        resultsTitle.textContent = _t("Konumuna göre sıralanan kuaförler");
        return;
      }
      resultsTitle.textContent = _t("İstanbul'da keşfedebileceğin kuaförler");
      return;
    }

    const hizmetlerTitles =
      mvpMainCategoryKey === "hizmetler"
        ? { nearby: _t("Konumuna göre sıralanan hizmet noktaları"), list: _t("İstanbul'da keşfedebileceğin hizmet noktaları") }
        : mvpMainCategoryKey === "saglik"
          ? { nearby: _t("Konumuna göre sıralanan sağlık noktaları"), list: _t("İstanbul'da keşfedebileceğin sağlık noktaları") }
          : mvpMainCategoryKey === "kultur"
            ? { nearby: _t("Konumuna göre sıralanan kültür noktaları"), list: _t("İstanbul'da keşfedebileceğin kültür noktaları") }
            : mvpMainCategoryKey === "sanat"
              ? { nearby: _t("Konumuna göre sıralanan sanat noktaları"), list: _t("İstanbul'da keşfedebileceğin sanat noktaları") }
              : null;
    if (state.nearbyMode && state.userLocation) {
      resultsTitle.textContent = hizmetlerTitles
        ? hizmetlerTitles.nearby
        : _t("Konumuna göre sıralanan İstanbul mekanları");
      return;
    }

    resultsTitle.textContent = hizmetlerTitles
      ? hizmetlerTitles.list
      : _t("İstanbul'da keşfedebileceğin yeme-içme mekanları");
  }

  function syncActiveFilterPills() {
    if (!activeFilterPills) {
      return;
    }

    activeFilterPills.innerHTML = "";

    const activeItems = [];
    if (state.selectedDistrict) {
      activeItems.push({ label: `Konum: ${state.selectedDistrict}`, type: "district" });
    }
    if (state.selectedNeighborhood) {
      activeItems.push({ label: `Mahalle: ${state.selectedNeighborhood}`, type: "neighborhood" });
    }
    if (state.selectedCategory || (mvpSubcategoryBoxGrid && state.selectedSubcategoryId)) {
      const catLabel = getSelectedCategoryLabel();
      if (catLabel) {
        activeItems.push({ label: `Kategori: ${catLabel}`, type: "category" });
      }
    }
    if (state.selectedBudget) {
      activeItems.push({ label: `Bütçe: ${formatBudgetLabel(state.selectedBudget)}`, type: "budget" });
    }
    if (state.query) {
      activeItems.push({ label: `Arama: ${state.query}`, type: "query" });
    }
    state.selectedTags.forEach((tag) => {
      const match = state.filters.tags.find((item) => item.key === tag);
      activeItems.push({ label: match ? match.label : tag, type: "tag", value: tag });
    });
    if (state.nearbyMode) {
      activeItems.push({ label: "Yakındaki mekanlar açık", type: "nearby" });
    }

    if (activeItems.length === 0) {
      activeFilterPills.hidden = true;
      return;
    }

    activeFilterPills.hidden = false;
    activeItems.forEach((item) => {
      const pill = document.createElement("button");
      pill.type = "button";
      pill.className = "istanbul-active-pill istanbul-active-pill--dismissible";
      pill.setAttribute("aria-label", `${item.label} filtresini kaldır`);
      pill.textContent = item.label + " ×";
      pill.addEventListener("click", () => {
        removePillFilter(item);
      });
      activeFilterPills.appendChild(pill);
    });
  }

  function removePillFilter(item) {
    switch (item.type) {
      case "district":
        state.selectedDistrict = "";
        state.selectedNeighborhood = "";
        break;
      case "neighborhood":
        state.selectedNeighborhood = "";
        break;
      case "category":
        state.selectedCategory = "";
        if (state.selectedSubcategoryId) {
          state.selectedSubcategoryId = "";
        }
        break;
      case "budget":
        state.selectedBudget = "";
        break;
      case "query":
        state.query = "";
        if (queryInput) {
          queryInput.value = "";
        }
        break;
      case "tag":
        state.selectedTags = state.selectedTags.filter((t) => t !== item.value);
        break;
      case "nearby":
        state.nearbyMode = false;
        state.userLocation = null;
        syncNearbyToggle();
        break;
      default:
        return;
    }
    state.page = 1;
    syncActiveFilterPills();
    loadVenues();
  }

  function populateSelect(select, options, placeholder) {
    if (!select) {
      return;
    }

    select.innerHTML = "";

    const emptyOption = document.createElement("option");
    emptyOption.value = "";
    emptyOption.textContent = placeholder;
    select.appendChild(emptyOption);

    options.forEach((optionValue) => {
      const option = document.createElement("option");
      option.value = optionValue;
      option.textContent = optionValue;
      select.appendChild(option);
    });
  }

  function populateCategorySelect() {
    if (mvpSubcategoryBoxGrid) {
      if (categoryChipRow) {
        categoryChipRow.innerHTML = "";
      }
      return;
    }
    if (categoryChipRow) {
      categoryChipRow.innerHTML = "";

      const clearBtn = document.createElement("button");
      clearBtn.type = "button";
      clearBtn.className = "istanbul-filter-chip";
      clearBtn.setAttribute("data-clear", "true");
      clearBtn.setAttribute("role", "radio");
      clearBtn.setAttribute("aria-label", "Tüm kategoriler");
      clearBtn.textContent = "Tüm kategoriler";
      categoryChipRow.appendChild(clearBtn);

      const categoryOptions = Array.isArray(state.filters.categoryOptions) ? state.filters.categoryOptions : [];
      if (categoryOptions.length) {
        [...categoryOptions]
          .sort((a, b) => String(a.name || "").localeCompare(String(b.name || ""), "tr-TR"))
          .forEach((category) => {
          const chip = document.createElement("button");
          chip.type = "button";
          chip.className = "istanbul-filter-chip";
          const hasNumericId = category.id != null && String(category.id).trim() !== "";
          if (hasNumericId) {
            chip.setAttribute("data-category-id", String(category.id));
          } else {
            chip.setAttribute("data-category-value", String(category.name || "").trim() || String(category.slug || ""));
          }
          chip.setAttribute("role", "radio");
          const displayName = formatCategoryChipDisplayName(category.name);
          chip.setAttribute("aria-label", `Kategori: ${displayName}`);
          chip.textContent = displayName;
          categoryChipRow.appendChild(chip);
        });
      } else {
        [...(state.filters.categories || [])]
          .sort((a, b) => String(a).localeCompare(String(b), "tr-TR"))
          .forEach((label) => {
          const chip = document.createElement("button");
          chip.type = "button";
          chip.className = "istanbul-filter-chip";
          chip.setAttribute("data-category-value", String(label));
          chip.setAttribute("role", "radio");
          const displayLabel = formatCategoryChipDisplayName(label);
          chip.setAttribute("aria-label", `Kategori: ${displayLabel}`);
          chip.textContent = displayLabel;
          categoryChipRow.appendChild(chip);
        });
      }
      syncCategoryChipVisuals();
      return;
    }

    if (!categorySelect) {
      return;
    }

    const categoryOptionsFallback = Array.isArray(state.filters.categoryOptions) ? state.filters.categoryOptions : [];
    if (!categoryOptionsFallback.length) {
      const sortedVenueCats = [...(state.filters.categories || [])].sort((a, b) =>
        String(a).localeCompare(String(b), "tr-TR"),
      );
      populateSelect(categorySelect, sortedVenueCats, "Tüm kategoriler");
      return;
    }

    categorySelect.innerHTML = "";

    const emptyOption = document.createElement("option");
    emptyOption.value = "";
    emptyOption.textContent = "Tüm kategoriler";
    categorySelect.appendChild(emptyOption);

    [...categoryOptionsFallback]
      .sort((a, b) => String(a.name || "").localeCompare(String(b.name || ""), "tr-TR"))
      .forEach((category) => {
      const option = document.createElement("option");
      option.value = String(category.id);
      option.textContent = category.name;
      categorySelect.appendChild(option);
    });
  }

  function populateNeighborhoodSelect() {
    const districtKey = state.selectedDistrict;
    const options = districtKey && state.filters.neighborhoodsByDistrict
      ? state.filters.neighborhoodsByDistrict[districtKey] || []
      : [];

    if (neighborhoodOptionsContainer && kesfetNeighborhoodTrigger) {
      neighborhoodOptionsContainer.innerHTML = "";
      const topLabel = districtKey ? "Tüm mahalleler" : "Önce ilçe seç";
      const allBtn = document.createElement("button");
      allBtn.type = "button";
      allBtn.className = "istanbul-mvp-subcategory-box";
      allBtn.setAttribute("data-neighborhood-value", "");
      allBtn.setAttribute("role", "radio");
      allBtn.setAttribute("aria-label", topLabel);
      allBtn.textContent = topLabel;
      neighborhoodOptionsContainer.appendChild(allBtn);
      if (districtKey) {
        options.forEach((n) => {
          const b = document.createElement("button");
          b.type = "button";
          b.className = "istanbul-mvp-subcategory-box";
          b.setAttribute("data-neighborhood-value", n);
          b.setAttribute("role", "radio");
          b.setAttribute("aria-label", n);
          b.textContent = n;
          neighborhoodOptionsContainer.appendChild(b);
        });
      }
      kesfetNeighborhoodTrigger.disabled = !districtKey;

      if (districtKey && state.selectedNeighborhood && options.includes(state.selectedNeighborhood)) {
        syncNeighborhoodBoxVisualsIstanbul();
        syncNeighborhoodTriggerLabelIstanbul();
        return;
      }

      state.selectedNeighborhood = "";
      syncNeighborhoodBoxVisualsIstanbul();
      syncNeighborhoodTriggerLabelIstanbul();
      return;
    }

    if (!neighborhoodSelect) {
      return;
    }

    const placeholder = districtKey ? "Tüm mahalleler" : "Önce ilçe seç";
    populateSelect(neighborhoodSelect, options, placeholder);
    neighborhoodSelect.disabled = !districtKey;

    if (districtKey && state.selectedNeighborhood && options.includes(state.selectedNeighborhood)) {
      neighborhoodSelect.value = state.selectedNeighborhood;
      return;
    }

    state.selectedNeighborhood = "";
    neighborhoodSelect.value = "";
  }

  function getSelectedCategoryLabel() {
    if (mvpSubcategoryBoxGrid && state.selectedSubcategoryId) {
      const ent = state.mvpSubcategoryEntries.find((e) => String(e.id) === String(state.selectedSubcategoryId));
      return ent ? formatCategoryChipDisplayName(ent.name) : "";
    }
    if (!state.selectedCategory) {
      return "";
    }
    if (mvpHizmetCategoryPicker) {
      const map = {
        kuafor: "Kuaförler",
        veteriner: "Veterinerler",
        akaryakit: "Akaryakıt",
      };
      return map[hizmetPickerActiveSlug] || "Hizmetler";
    }
    if (mvpLockedCategorySlug && mvpLockedCategoryLabel) {
      return mvpLockedCategoryLabel;
    }

    const categoryOptions = Array.isArray(state.filters.categoryOptions) ? state.filters.categoryOptions : [];
    if (!categoryOptions.length) {
      return formatCategoryChipDisplayName(state.selectedCategory);
    }

    const raw = String(state.selectedCategory).trim();
    const byId = categoryOptions.find((category) => String(category.id) === raw);
    if (byId) {
      return formatCategoryChipDisplayName(byId.name);
    }
    const byName = categoryOptions.find(
      (category) => normalizeText(String(category.name || "")) === normalizeText(raw),
    );
    return formatCategoryChipDisplayName(byName ? byName.name : state.selectedCategory);
  }

  async function fetchAndRenderMvpSubcategoryGrid() {
    if (!mvpSubcategoryGrid) {
      return;
    }
    state.mvpSubcategoryEntries = [];
    try {
      const response = await fetch(
        `/api/public/content-model/subcategories?mainCategoryKey=${encodeURIComponent(mvpMainCategoryKey)}`,
        { headers: { Accept: "application/json" } },
      );
      if (!response.ok) {
        throw new Error("subcategories");
      }
      const payload = await response.json();
      state.mvpSubcategoryEntries = Array.isArray(payload.items) ? payload.items : [];
    } catch (_error) {
      state.mvpSubcategoryEntries = [];
    }
    mvpSubcategoryGrid.innerHTML = "";
    const allSubcategoryBtn = document.createElement("button");
    allSubcategoryBtn.type = "button";
    allSubcategoryBtn.className = "istanbul-mvp-subcategory-box";
    allSubcategoryBtn.setAttribute("data-subcategory-id", "");
    allSubcategoryBtn.setAttribute("role", "radio");
    allSubcategoryBtn.setAttribute("aria-label", "Tüm kategoriler");
    allSubcategoryBtn.textContent = "Tüm kategoriler";
    mvpSubcategoryGrid.appendChild(allSubcategoryBtn);
    state.mvpSubcategoryEntries.forEach((ent) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "istanbul-mvp-subcategory-box";
      b.setAttribute("data-subcategory-id", String(ent.id));
      b.setAttribute("role", "radio");
      b.setAttribute("aria-label", ent.name);
      b.textContent = ent.name;
      mvpSubcategoryGrid.appendChild(b);
    });
    syncMvpSubcategoryBoxVisuals();
    syncHizmetBreadcrumbFromSubcategory();
  }

  function renderTagButtons() {
    if (!tagRow) {
      return;
    }

    tagRow.innerHTML = "";
    state.filters.tags.forEach((tag) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "istanbul-tag-button";
      button.dataset.tag = tag.key;
      button.textContent = tag.label;
      if (state.selectedTags.includes(tag.key)) {
        button.classList.add("is-active");
      }
      button.addEventListener("click", () => {
        if (state.selectedTags.includes(tag.key)) {
          state.selectedTags = state.selectedTags.filter((item) => item !== tag.key);
        } else {
          state.selectedTags = [...state.selectedTags, tag.key];
        }
        state.page = 1;
        renderTagButtons();
        syncActiveFilterPills();
        loadVenues();
      });
      tagRow.appendChild(button);
    });
  }

  async function loadFilters() {
    const officialDistricts = await loadOfficialDistricts();

    if (state.dataMode === "local") {
      const items = await loadLocalData();
      state.filters = buildLocalFilters(items);
      state.filters.districts = sanitizeDistrictOptions(state.filters.districts, officialDistricts);
      renderDistrictOptionsIstanbul();
      populateNeighborhoodSelect();
      populateCategorySelect();
      populateBudgetFilter();
      renderTagButtons();
      return;
    }

    const filterParams = new URLSearchParams({ mainCategoryKey: mvpMainCategoryKey });
    const response = await fetch(`/api/mvp/istanbul/filters?${filterParams.toString()}`, {
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("İstanbul filtre verileri alınamadı. Lütfen sunucuyu kontrol et.");
    }

    const payload = await response.json();
    const rawNeighborhoodsByDistrict =
      payload && typeof payload.neighborhoodsByDistrict === "object" && !Array.isArray(payload.neighborhoodsByDistrict)
        ? payload.neighborhoodsByDistrict
        : {};
    const canonicalDistrictMap = buildDistrictCanonicalMap(officialDistricts);
    const sanitizedNeighborhoodsByDistrict = Object.entries(rawNeighborhoodsByDistrict).reduce((accumulator, entry) => {
      const [district, neighborhoods] = entry;
      const canonicalDistrict = canonicalDistrictMap[normalizeText(district)];
      if (!canonicalDistrict || !Array.isArray(neighborhoods)) {
        return accumulator;
      }
      accumulator[canonicalDistrict] = neighborhoods
        .map((item) => canonicalizeNeighborhoodLabel(item))
        .filter(Boolean)
        .sort((a, b) => a.localeCompare(b, "tr-TR"));
      return accumulator;
    }, {});

    const rawCategoryOptions = Array.isArray(payload.categoryOptions) ? payload.categoryOptions : [];
    let categoryOptions = augmentCategoryOptionsFromApi(rawCategoryOptions);
    let venueCuisineLabels = Array.isArray(payload.categories) ? payload.categories : [];
    if (!categoryOptions.length) {
      venueCuisineLabels = mergeVenueCuisineLabelsWithPriority(venueCuisineLabels);
    }

    state.filters = {
      districts: sanitizeDistrictOptions(Array.isArray(payload.districts) ? payload.districts : [], officialDistricts),
      neighborhoodsByDistrict: sanitizedNeighborhoodsByDistrict,
      categoryOptions,
      categories: venueCuisineLabels,
      tags: Array.isArray(payload.tags) ? payload.tags : [],
      budgets: Array.isArray(payload.budgets) ? payload.budgets : [],
    };

    if (mvpSubcategoryBoxGrid) {
      await fetchAndRenderMvpSubcategoryGrid();
    }

    renderDistrictOptionsIstanbul();
    populateNeighborhoodSelect();
    populateCategorySelect();
    populateBudgetFilter();
    renderTagButtons();
  }

  function populateBudgetFilter() {
    if (budgetChipRow) {
      budgetChipRow.innerHTML = "";

      const clearBtn = document.createElement("button");
      clearBtn.type = "button";
      clearBtn.className = "istanbul-filter-chip";
      clearBtn.setAttribute("data-clear", "true");
      clearBtn.setAttribute("role", "radio");
      clearBtn.setAttribute("aria-label", "Tüm bütçeler");
      clearBtn.textContent = "Tümü";
      budgetChipRow.appendChild(clearBtn);

      const budgetRows = buildBudgetOptionsForFilter();

      budgetRows.forEach((raw) => {
        const value = String(raw ?? "").trim();
        if (!value) {
          return;
        }
        const chip = document.createElement("button");
        chip.type = "button";
        chip.className = "istanbul-filter-chip";
        chip.setAttribute("data-budget-value", value);
        chip.setAttribute("role", "radio");
        chip.setAttribute("aria-label", `Bütçe: ${formatBudgetLabel(value)}`);
        chip.textContent = formatBudgetLabel(value);
        budgetChipRow.appendChild(chip);
      });
      syncBudgetChipVisuals();
      return;
    }

    if (kesfetBudgetOptionsContainer) {
      kesfetBudgetOptionsContainer.innerHTML = "";
      const allBtn = document.createElement("button");
      allBtn.type = "button";
      allBtn.className = "istanbul-mvp-subcategory-box";
      allBtn.setAttribute("data-budget-value", "");
      allBtn.setAttribute("role", "radio");
      allBtn.setAttribute("aria-label", "Tüm bütçeler");
      allBtn.textContent = "Tüm bütçeler";
      kesfetBudgetOptionsContainer.appendChild(allBtn);
      buildBudgetOptionsForFilter().forEach((raw) => {
        const value = String(raw ?? "").trim();
        if (!value) {
          return;
        }
        const b = document.createElement("button");
        b.type = "button";
        b.className = "istanbul-mvp-subcategory-box";
        b.setAttribute("data-budget-value", value);
        b.setAttribute("role", "radio");
        b.setAttribute("aria-label", `Bütçe: ${formatBudgetLabel(value)}`);
        b.textContent = formatBudgetLabel(value);
        kesfetBudgetOptionsContainer.appendChild(b);
      });
      syncBudgetChipVisuals();
    }
  }

  function appendCategoryFilterParams(params) {
    if (state.selectedSubcategoryId) {
      params.set("subcategoryId", String(state.selectedSubcategoryId).trim());
      return;
    }
    if (!state.selectedCategory) {
      return;
    }
    const raw = String(state.selectedCategory).trim();
    const options = Array.isArray(state.filters.categoryOptions) ? state.filters.categoryOptions : [];
    if (!options.length) {
      params.set("category", raw);
      return;
    }
    const byId = options.find((opt) => String(opt.id) === raw);
    if (byId && byId.id != null && String(byId.id).trim() !== "") {
      params.set("categoryId", raw);
      return;
    }
    const byName = options.find(
      (opt) =>
        opt.id == null &&
        (normalizeText(String(opt.name || "")) === normalizeText(raw) ||
          normalizeText(String(opt.slug || "")) === normalizeText(raw)),
    );
    if (byName) {
      params.set("category", String(byName.name || "").trim() || raw);
      return;
    }
    params.set("category", raw);
  }

  function buildQueryParams() {
    const params = new URLSearchParams();
    params.set("page", String(state.page));
    params.set("limit", String(state.limit));
    params.set("mainCategoryKey", mvpMainCategoryKey);

    if (mvpSubcategoryBoxGrid) {
      params.delete("categoryId");
      params.delete("category");
    }

    if (state.selectedDistrict) {
      params.set("district", state.selectedDistrict);
    }
    if (state.selectedNeighborhood) {
      params.set("neighborhood", state.selectedNeighborhood);
    }
    appendCategoryFilterParams(params);
    if (state.selectedBudget) {
      params.set("budget", state.selectedBudget);
    }
    if (state.query) {
      params.set("q", state.query);
    }
    state.selectedTags.forEach((tag) => params.append("tag", tag));

    if (state.userLocation) {
      params.set("lat", String(state.userLocation.lat));
      params.set("lng", String(state.userLocation.lng));
    }

    if (state.nearbyMode && state.userLocation) {
      params.set("radius", "8000");
    }

    if (mvpMainCategoryKey === "yeme-icme") {
      params.set("sort", "popular");
    }

    if (state.dataMode === "api" && discoveryFiltersAllowHighRatedShuffle()) {
      params.set("sort", "random");
      if (!state.discoveryRandomSeed) {
        state.discoveryRandomSeed = String(Math.floor(Math.random() * 1_000_000_000));
      }
      params.set("randomSeed", state.discoveryRandomSeed);
    }

    return params;
  }

  function renderPagination() {
    if (!pagination) {
      return;
    }

    pagination.innerHTML = "";
    const paginationState = state.pagination;
    if (!paginationState || !paginationState.totalPages || paginationState.totalPages <= 1) {
      pagination.hidden = true;
      return;
    }

    pagination.hidden = false;

    const previousButton = document.createElement("button");
    previousButton.type = "button";
    previousButton.className = "istanbul-pagination-button";
    previousButton.textContent = "Geri";
    previousButton.disabled = paginationState.page <= 1;
    previousButton.addEventListener("click", () => {
      if (state.page <= 1) {
        return;
      }
      state.page -= 1;
      loadVenues();
    });
    pagination.appendChild(previousButton);

    const currentLabel = document.createElement("span");
    currentLabel.className = "istanbul-pagination-current";
    currentLabel.textContent = `${paginationState.page} / ${paginationState.totalPages}`;
    pagination.appendChild(currentLabel);

    const nextButton = document.createElement("button");
    nextButton.type = "button";
    nextButton.className = "istanbul-pagination-button";
    nextButton.textContent = "İleri";
    nextButton.disabled = paginationState.page >= paginationState.totalPages;
    nextButton.addEventListener("click", () => {
      if (state.page >= paginationState.totalPages) {
        return;
      }
      state.page += 1;
      loadVenues();
    });
    pagination.appendChild(nextButton);
  }

  function renderVenueCards() {
    resultsGrid.innerHTML = "";

    if (!state.items.length) {
      resultsGrid.hidden = true;
      if (resultsLayout) {
        resultsLayout.hidden = true;
      }
      resultsState.hidden = false;
      resultsState.textContent = (window.ARAMABUL_HEADER_I18N?.getStaticUiTranslation || ((t) => t))("Bu filtrelerle mekan bulunamadı.");
      renderPagination();
      return;
    }

    if (hasMapPanel) {
      syncSelectedVenue();
    } else {
      state.selectedVenueSlug = "";
    }
    resultsGrid.hidden = false;
    resultsState.hidden = true;

    state.items.forEach((item) => {
      const fragment = template.content.cloneNode(true);
      const card = fragment.querySelector(".istanbul-venue-card");
      const media = fragment.querySelector(".istanbul-venue-media");
      const image = fragment.querySelector(".istanbul-venue-image");
      const eyebrow = fragment.querySelector(".istanbul-venue-eyebrow");
      const distance = fragment.querySelector(".istanbul-venue-distance");
      const titleLink = fragment.querySelector(".istanbul-venue-title-link");
      const address = fragment.querySelector(".istanbul-venue-address");
      const rating = fragment.querySelector(".istanbul-venue-rating");
      const budget = fragment.querySelector(".istanbul-venue-budget");
      const tags = fragment.querySelector(".istanbul-venue-tags");
      const favoriteButton = fragment.querySelector(".istanbul-favorite-button");
      const actions = fragment.querySelector(".istanbul-venue-actions");
      const actionGroup = fragment.querySelector(".istanbul-venue-action-group");

      card.tabIndex = 0;
      card.venue = item;
      if (item.slug === state.selectedVenueSlug) {
        card.classList.add("is-selected");
      }

      if (image && media) {
        const photoUri = typeof item.photoUri === "string" ? item.photoUri.trim() : "";
        if (photoUri) {
          image.src = photoUri;
          image.alt = `${item.name || "Mekan"} fotoğrafı`;
          image.addEventListener(
            "error",
            () => {
              const fallback = getCategoryImage(item.category || item.cuisine || "", item.name);
              image.src = fallback;
              image.alt = item.name || "Mekan";
              if (isPlaceholderImage(fallback)) {
                image.classList.add("is-placeholder");
              }
            },
            { once: true },
          );
        } else {
          const fallback = getCategoryImage(item.category || item.cuisine || "", item.name);
          image.src = fallback;
          image.alt = item.name || "Mekan";
          if (isPlaceholderImage(fallback)) {
            image.classList.add("is-placeholder");
          }
        }
      }

      // District/neighborhood is shown in tag chips, not above title.
      eyebrow.textContent = "";
      eyebrow.hidden = true;

      const rawDistanceMeters = (item.distanceMeters != null && item.distanceMeters !== "") ? Number(item.distanceMeters) : NaN;
      const computedDistanceMeters = Number.isFinite(rawDistanceMeters)
        ? rawDistanceMeters
        : computeDistanceMeters(state.userLocation, item);
      const formattedDistance = formatDistance(computedDistanceMeters);
      if (formattedDistance) {
        distance.hidden = false;
        distance.textContent = formattedDistance;
      } else if (state.nearbyMode) {
        distance.hidden = false;
        distance.textContent = "Yakın ilçe";
      } else {
        distance.hidden = true;
      }

      if (distance && actions) {
        if (distance.parentElement !== actions) {
          actions.insertBefore(distance, actionGroup || actions.firstChild);
        }
        actions.classList.add("has-distance-chip");
      }

      titleLink.textContent = item.name || "İsimsiz mekan";
      titleLink.href = buildDetailUrl(item);

      // Sadeleştirilmiş kart: adres, rating, bütçe, favori, paylaş gizleniyor
      address.hidden = true;
      rating.hidden = true;
      budget.hidden = true;
      const pillRow = fragment.querySelector(".istanbul-venue-pill-row");
      if (pillRow) pillRow.hidden = true;
      if (actions) actions.hidden = true;

      // Tag satırına sadece ilçe, altkategori ve mesafe ekleniyor
      const seenTagKeys = new Set();

      function consumeTagLabel(label) {
        const trimmed = String(label || "").trim();
        if (!trimmed) return false;
        const key = normalizeText(trimmed);
        if (!key || seenTagKeys.has(key)) return false;
        seenTagKeys.add(key);
        return true;
      }

      const districtLabel = String(item.district || "").trim();
      if (districtLabel) {
        const link = document.createElement("a");
        link.className = "istanbul-venue-tag";
        link.href = buildYemeIcmeDistrictFilterUrl(districtLabel);
        link.setAttribute("aria-label", `${districtLabel} ilçesindeki mekanları aç`);
        link.textContent = districtLabel;
        tags.appendChild(link);
        consumeTagLabel(districtLabel);
      }

      const cuisineLabel = String(item.cuisine || item.category || "").trim();
      if (cuisineLabel && normalizeText(cuisineLabel) !== normalizeText(districtLabel)) {
        if (consumeTagLabel(cuisineLabel)) {
          const href = buildYemeIcmeCategoryFilterUrl(item);
          if (href) {
            const link = document.createElement("a");
            link.className = "istanbul-venue-tag";
            link.href = href;
            link.setAttribute("aria-label", `${cuisineLabel} türündeki mekanları filtrele`);
            link.textContent = cuisineLabel;
            tags.appendChild(link);
          } else {
            const span = document.createElement("span");
            span.className = "istanbul-venue-tag";
            span.textContent = cuisineLabel;
            tags.appendChild(span);
          }
        }
      }

      // Mesafe chip'ini tag satırına ekle
      if (!distance.hidden) {
        distance.classList.add("istanbul-venue-tag");
        tags.appendChild(distance);
      }

      if (!tags.childElementCount) {
        card.classList.add("is-tagless");
      }

      card.addEventListener("click", (event) => {
        if (event.target instanceof HTMLElement && event.target.closest("a, button")) {
          return;
        }
        if (opensVenueDetailFromCard) {
          window.location.href = buildDetailUrl(item);
          return;
        }
        selectVenue(item.slug);
      });
      card.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          if (opensVenueDetailFromCard) {
            window.location.href = buildDetailUrl(item);
            return;
          }
          selectVenue(item.slug);
        }
      });
      favoriteButton.addEventListener("click", async (event) => {
        event.preventDefault();
        event.stopPropagation();
        try {
          favoriteButton.disabled = true;
          await toggleFavorite(item.id);
        } catch (error) {
          setLocationMessage(error instanceof Error ? error.message : "Favori işlemi tamamlanamadı.", true);
        } finally {
          favoriteButton.disabled = false;
        }
      });

      resultsGrid.appendChild(fragment);
    });

    renderMapPanel();
    renderPagination();
  }

  function renderMeta(payload) {
    updateModeHeading();
    syncActiveFilterPills();

    if (state.nearbyMode) {
      const _t = window.ARAMABUL_HEADER_I18N?.getStaticUiTranslation || ((t) => t);
      resultsMeta.textContent = `${formatCount(payload.meta?.count || state.items.length)} ${_t("mekan yakında bulundu")}`;
      return;
    }

    const total = payload.pagination?.total || 0;
    const _t2 = window.ARAMABUL_HEADER_I18N?.getStaticUiTranslation || ((t) => t);
    resultsMeta.textContent = `${formatCount(total)} ${_t2("mekan listeleniyor")}`;
  }

  function syncMvpDiscoveryUrl() {
    if (!mvpSubcategoryBoxGrid) {
      return;
    }
    const url = new URL(window.location.href);
    if (state.selectedSubcategoryId) {
      url.searchParams.set("subcategoryId", String(state.selectedSubcategoryId).trim());
    } else {
      url.searchParams.delete("subcategoryId");
    }
    if (mvpMainCategoryKey === "hizmetler") {
      url.searchParams.delete("tur");
      url.searchParams.delete("hizmet");
    }
    url.searchParams.delete("categoryId");
    url.searchParams.delete("category");
    window.history.replaceState({}, "", url.toString());
  }

  async function loadVenues() {
    setLoading(true, "Mekanlar getiriliyor.");

    try {
      if (state.dataMode === "local") {
        const items = await loadLocalData();
        const filtered = items.filter((item) => {
          if (state.selectedDistrict && normalizeText(item.district) !== normalizeText(state.selectedDistrict)) {
            return false;
          }
          if (state.selectedNeighborhood && normalizeNeighborhood(item.neighborhood) !== normalizeNeighborhood(state.selectedNeighborhood)) {
            return false;
          }
          if (state.selectedCategory) {
            const label = getSelectedCategoryLabel() || state.selectedCategory;
            const target = normalizeText(label);
            const cat = normalizeText(item.category || "");
            const cuisine = normalizeText(item.cuisine || "");
            if (cat !== target && cuisine !== target) {
              return false;
            }
          }
          if (state.selectedBudget) {
            const sel = normalizeText(state.selectedBudget);
            const unk = normalizeText(BUDGET_UNKNOWN_VALUE);
            const itemBudget = String(item.budget || "").trim();
            if (sel === unk) {
              if (itemBudget) {
                return false;
              }
            } else if (normalizeText(itemBudget) !== sel) {
              return false;
            }
          }
          if (state.query && !buildTextMatch(state.query, item)) {
            return false;
          }
          return true;
        });

        if (state.nearbyMode && state.userLocation) {
          const cached = getNearbyCache();
          if (cached) {
            state.items = cached.items;
            state.pagination = cached.pagination;
            await loadFavoriteIds();
            renderMeta({
              pagination: state.pagination,
              meta: { count: cached.total },
            });
            renderVenueCards();
            return;
          }
        }

        const candidateItems = state.nearbyMode && state.userLocation ? getLocalGeoItems() : filtered;
        const box = state.nearbyMode && state.userLocation ? buildBoundingBox(state.userLocation, 8000) : null;
        const preFiltered = box
          ? candidateItems.filter((item) => isInsideBox(item, box))
          : candidateItems;

        const withDistance = preFiltered.map((item) => {
          const distanceMeters = computeDistanceMeters(state.userLocation, item);
          return {
            ...item,
            distanceMeters,
          };
        });

        const finalItems = state.nearbyMode && state.userLocation
          ? withDistance.filter((item) => Number.isFinite(item.distanceMeters) && item.distanceMeters <= 8000)
          : withDistance;

        if (state.nearbyMode && state.userLocation) {
          finalItems.sort((a, b) => {
            const aIsOsm = a.source === "openstreetmap";
            const bIsOsm = b.source === "openstreetmap";
            if (aIsOsm !== bIsOsm) {
              return aIsOsm ? -1 : 1;
            }
            if (!Number.isFinite(a.distanceMeters)) {
              return 1;
            }
            if (!Number.isFinite(b.distanceMeters)) {
              return -1;
            }
            return a.distanceMeters - b.distanceMeters;
          });
        } else if (shouldHighRatedRandomDiscoveryLocal()) {
          const pool = finalItems.slice();
          shuffleDiscoveryVenuesInPlace(pool);
          finalItems.length = 0;
          finalItems.push(...pool);
        } else if (mvpMainCategoryKey === "yeme-icme") {
          const reviewCount = (v) => Number(v.userRatingCount ?? v.user_rating_count ?? v.reviewCount ?? 0) || 0;
          const ratingVal = (v) => {
            const r = Number(v.rating ?? v.googleRating);
            return Number.isFinite(r) ? r : 0;
          };
          finalItems.sort((a, b) => {
            const dc = reviewCount(b) - reviewCount(a);
            if (dc !== 0) {
              return dc;
            }
            const dr = ratingVal(b) - ratingVal(a);
            if (dr !== 0) {
              return dr;
            }
            return String(a.name || "").localeCompare(String(b.name || ""), "tr-TR");
          });
        } else {
          finalItems.sort((a, b) => String(a.name || "").localeCompare(String(b.name || ""), "tr-TR"));
        }

        const total = finalItems.length;
        const totalPages = total ? Math.ceil(total / state.limit) : 0;
        const safePage = totalPages ? Math.min(state.page, totalPages) : 1;
        state.page = safePage;

        const startIndex = (safePage - 1) * state.limit;
        const pageItems = finalItems.slice(startIndex, startIndex + state.limit);

        state.items = pageItems;
        state.pagination = totalPages
          ? { page: safePage, totalPages, total }
          : { page: 1, totalPages: 0, total: 0 };

        await loadFavoriteIds();
        renderMeta({
          pagination: state.pagination,
          meta: { count: total },
        });
        renderVenueCards();

        if (state.nearbyMode && state.userLocation) {
          setNearbyCache({ items: state.items, pagination: state.pagination, total });
        }
        return;
      }

      if (shouldHighRatedRandomDiscoveryApi()) {
        const filterKey = highRatedDiscoveryShuffleKey();
        if (state.discoveryShuffleFilterKey !== filterKey) {
          state.discoveryShuffleFilterKey = filterKey;
          state.discoveryRandomSeed = String(Math.floor(Math.random() * 1_000_000_000));
        }
        if (!state.discoveryRandomSeed) {
          state.discoveryRandomSeed = String(Math.floor(Math.random() * 1_000_000_000));
        }
      } else {
        clearHighRatedDiscoveryPool();
      }

      const params = buildQueryParams();
      const endpoint = buildVenueListEndpoint(params, {
        nearby: state.nearbyMode && state.userLocation,
      });
      const response = await fetch(endpoint, {
        headers: {
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("İstanbul mekanları yüklenemedi. Lütfen sunucuyu kontrol et.");
      }

      const payload = await response.json();

      state.items = Array.isArray(payload.items) ? payload.items : [];
      state.pagination = payload.pagination || null;
      await loadFavoriteIds();
      renderMeta(payload);
      renderVenueCards();
      syncMvpDiscoveryUrl();
    } catch (error) {
      resultsGrid.hidden = true;
      resultsState.hidden = false;
      resultsState.textContent = error instanceof Error ? error.message : "Mekanlar alınamadı.";
      pagination.hidden = true;
    } finally {
      setLoading(false, resultsState.hidden ? "" : resultsState.textContent);
    }
  }

  function resetFilters() {
    const savedHizmetSlug = mvpHizmetCategoryPicker ? hizmetPickerActiveSlug : null;
    state.selectedDistrict = "";
    state.selectedNeighborhood = "";
    state.selectedCategory = "";
    state.selectedSubcategoryId = "";
    state.selectedBudget = "";
    state.selectedTags = [];
    state.query = "";
    state.page = 1;
    state.nearbyMode = false;
    state.userLocation = null;
    clearHighRatedDiscoveryPool();
    syncNearbyToggle();
    syncDistrictTriggerLabelIstanbul();
    syncDistrictBoxVisualsIstanbul();
    if (neighborhoodSelect) {
      neighborhoodSelect.value = "";
    }
    if (categorySelect) {
      categorySelect.value = "";
    }
    syncCategoryChipVisuals();
    syncMvpSubcategoryBoxVisuals();
    syncHizmetBreadcrumbFromSubcategory();
    syncBudgetChipVisuals();
    if (queryInput) {
      queryInput.value = "";
    }
    if (savedHizmetSlug) {
      applyHizmetCategoryFromSlug(savedHizmetSlug);
      syncHizmetCategoryPickerVisuals();
    } else if (mvpLockedCategorySlug) {
      applyMvpLockedCategory();
    }
    populateNeighborhoodSelect();
    renderTagButtons();
    syncActiveFilterPills();
    setLocationMessage("", false);
    loadVenues();
  }

  function clearNearbyMode(message = "") {
    state.nearbyMode = false;
    state.userLocation = null;
    state.page = 1;
    clearHighRatedDiscoveryPool();
    syncNearbyToggle();
    setLocationMessage(message, false);
    loadVenues();
  }

  function requestNearbyMode() {
    if (state.nearbyMode) {
      clearNearbyMode();
      return;
    }
    if (!navigator.geolocation) {
      setLocationMessage("Tarayıcı konum desteği vermiyor.", true);
      return;
    }

    setLocationMessage("Konumun alınıyor.", false);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        state.userLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        state.nearbyMode = true;
        state.page = 1;
        // Yakındakiler açıldığında konum filtreleri temizlenmeli
        state.selectedDistrict = "";
        state.selectedNeighborhood = "";
        syncDistrictTriggerLabelIstanbul();
        syncDistrictBoxVisualsIstanbul();
        if (neighborhoodSelect) {
          neighborhoodSelect.value = "";
        }
        populateNeighborhoodSelect();
        syncNearbyToggle();
        syncActiveFilterPills();
        setLocationMessage("", false);
        loadVenues();
      },
      () => {
        state.nearbyMode = false;
        state.userLocation = null;
        syncNearbyToggle();
        setLocationMessage("Konum izni verilmedi. İstanbul genel listesi gösteriliyor.", true);
        loadVenues();
      },
      {
        enableHighAccuracy: true,
        timeout: 8000,
        maximumAge: 60_000,
      },
    );
  }

  function requestDistanceHints() {
    if (state.userLocation || !navigator.geolocation) {
      return;
    }

    function onSuccess(position) {
      state.userLocation = {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      };
      loadVenues();
    }

    // Try fast network location first
    navigator.geolocation.getCurrentPosition(
      onSuccess,
      () => {
        // Fallback: try with high accuracy (GPS)
        navigator.geolocation.getCurrentPosition(onSuccess, () => {}, {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 300000,
        });
      },
      {
        enableHighAccuracy: false,
        timeout: 10000,
        maximumAge: 300000,
      },
    );
  }

  function bindEvents() {
    if (queryInput) {
      queryInput.addEventListener("keydown", (event) => {
        if (event.key !== "Enter") {
          return;
        }
        event.preventDefault();
        state.query = queryInput.value.trim();
        state.page = 1;
        loadVenues();
      });
    }

    if (districtOptionsContainer) {
      districtOptionsContainer.addEventListener("click", async (event) => {
        const btn = event.target.closest(".istanbul-mvp-subcategory-box");
        if (!btn || !districtOptionsContainer.contains(btn) || !btn.hasAttribute("data-district-value")) {
          return;
        }
        state.selectedDistrict = btn.getAttribute("data-district-value") || "";
        state.selectedNeighborhood = "";
        await ensureNeighborhoodsForDistrict(state.selectedDistrict);
        populateNeighborhoodSelect();
        syncDistrictBoxVisualsIstanbul();
        syncDistrictTriggerLabelIstanbul();
        closeKesfetDistrictMenuIstanbul();
        closeKesfetNeighborhoodMenuIstanbul();
        state.page = 1;
        loadVenues();
      });
    }

    if (categoryChipRow) {
      categoryChipRow.addEventListener("click", (event) => {
        const btn = event.target.closest(".istanbul-filter-chip");
        if (!btn || !categoryChipRow.contains(btn)) {
          return;
        }
        if (btn.getAttribute("data-clear") === "true") {
          state.selectedCategory = "";
          state.selectedSubcategoryId = "";
        } else if (btn.hasAttribute("data-category-id")) {
          state.selectedCategory = btn.getAttribute("data-category-id") || "";
          state.selectedSubcategoryId = "";
        } else if (btn.hasAttribute("data-category-value")) {
          state.selectedCategory = btn.getAttribute("data-category-value") || "";
          state.selectedSubcategoryId = "";
        } else {
          return;
        }
        syncCategoryChipVisuals();
        closeKesfetDistrictMenuIstanbul();
        closeKesfetNeighborhoodMenuIstanbul();
        state.page = 1;
        loadVenues();
      });
    } else if (categorySelect) {
      categorySelect.addEventListener("change", () => {
        state.selectedCategory = categorySelect.value;
        state.selectedSubcategoryId = "";
        state.page = 1;
        loadVenues();
      });
    }

    if (mvpSubcategoryGrid) {
      mvpSubcategoryGrid.addEventListener("click", (event) => {
        const btn = event.target.closest(".istanbul-mvp-subcategory-box");
        if (!btn || !mvpSubcategoryGrid.contains(btn) || !btn.hasAttribute("data-subcategory-id")) {
          return;
        }
        const id = (btn.getAttribute("data-subcategory-id") || "").trim();
        if (id && id === String(state.selectedSubcategoryId || "").trim()) {
          state.selectedSubcategoryId = "";
        } else {
          state.selectedSubcategoryId = id;
        }
        state.selectedCategory = "";
        syncMvpSubcategoryBoxVisuals();
        syncHizmetBreadcrumbFromSubcategory();
        closeKesfetCategoryMenuIstanbul();
        closeKesfetDistrictMenuIstanbul();
        closeKesfetNeighborhoodMenuIstanbul();
        state.page = 1;
        syncActiveFilterPills();
        loadVenues();
      });
    }

    if (budgetChipRow) {
      budgetChipRow.addEventListener("click", (event) => {
        const btn = event.target.closest(".istanbul-filter-chip");
        if (!btn || !budgetChipRow.contains(btn)) {
          return;
        }
        if (btn.getAttribute("data-clear") === "true") {
          state.selectedBudget = "";
        } else if (btn.hasAttribute("data-budget-value")) {
          state.selectedBudget = btn.getAttribute("data-budget-value") || "";
        } else {
          return;
        }
        syncBudgetChipVisuals();
        state.page = 1;
        loadVenues();
      });
    }

    if (queryInput) {
      queryInput.addEventListener("blur", () => {
        state.query = queryInput.value.trim();
        state.page = 1;
        loadVenues();
      });
    }

    const mvpSearchForm =
      document.getElementById("istanbulMvpSearchForm") ||
      document.getElementById("istanbulYemeIcmeSearchForm") ||
      document.getElementById("istanbulGeziSearchForm");
    if (mvpSearchForm && queryInput) {
      mvpSearchForm.addEventListener("submit", (event) => {
        event.preventDefault();
        state.query = queryInput.value.trim();
        state.page = 1;
        loadVenues();
      });
    }

    const hizmetlerCategoryRow = document.getElementById("hizmetlerCategoryRow");
    if (hizmetlerCategoryRow) {
      hizmetlerCategoryRow.addEventListener("click", (event) => {
        const btn = event.target.closest("[data-hizmet-category-slug]");
        if (!btn || !hizmetlerCategoryRow.contains(btn)) {
          return;
        }
        const slug = (btn.getAttribute("data-hizmet-category-slug") || "").trim();
        if (!slug) {
          return;
        }
        applyHizmetCategoryFromSlug(slug);
        setHizmetTurInUrl(slug);
        state.page = 1;
        syncHizmetCategoryPickerVisuals();
        updateModeHeading();
        syncActiveFilterPills();
        loadVenues();
      });
    }

    if (resetFiltersButton) {
      resetFiltersButton.addEventListener("click", resetFilters);
    }
    if (nearbyButton) {
      nearbyButton.setAttribute("aria-pressed", "false");
      nearbyButton.dataset.state = "off";
      syncNearbyToggle();
      nearbyButton.addEventListener("click", requestNearbyMode);
    }
    document.addEventListener("click", (event) => {
      if (!(event.target instanceof HTMLElement) || !event.target.closest(".card-share-wrap")) {
        closeCardShareMenus();
      }
    });
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        closeKesfetCategoryMenuIstanbul();
        closeKesfetDistrictMenuIstanbul();
        closeKesfetNeighborhoodMenuIstanbul();
        closeKesfetBudgetMenuIstanbul();
        closeCardShareMenus();
      }
    });

    initKesfetCategoryDropdownIstanbul();
    initKesfetDistrictDropdownIstanbul();
    initKesfetBudgetDropdownIstanbul();
    initKesfetNeighborhoodDropdownIstanbul();
    syncKesfetCategoryTriggerIstanbul();
    syncKesfetBudgetTriggerIstanbul();
    syncNeighborhoodTriggerLabelIstanbul();

    if (mapPanelFavoriteButton) {
      mapPanelFavoriteButton.addEventListener("click", async () => {
        const item = getSelectedVenue();
        if (!item) {
          return;
        }
        try {
          mapPanelFavoriteButton.disabled = true;
          await toggleFavorite(item.id);
        } catch (error) {
          setLocationMessage(error instanceof Error ? error.message : "Favori işlemi tamamlanamadı.", true);
        } finally {
          mapPanelFavoriteButton.disabled = false;
        }
      });
    }
  }

  async function main() {
    try {
      state.selectedVenueSlug = readVenueSlugFromUrl();
      await loadFilters();
      await applyInitialFiltersFromUrl();
      if (mvpSubcategoryBoxGrid) {
        applySubcategoryFromUrl();
        if (mvpMainCategoryKey === "hizmetler") {
          applyHizmetLegacyTurParamToSubcategory();
          syncMvpSubcategoryBoxVisuals();
        }
        syncHizmetBreadcrumbFromSubcategory();
      } else {
        applyCategoryFromUrl();
      }
      const initialQuery = readInitialQueryFromUrl();
      if (initialQuery && queryInput) {
        state.query = initialQuery;
        queryInput.value = initialQuery;
      }
      bindEvents();
      updateModeHeading();
      syncActiveFilterPills();
      await loadVenues();
      requestDistanceHints();
    } catch (error) {
      setLoading(false, error instanceof Error ? error.message : "Sayfa başlatılamadı.");
    }
  }

  main();
})();
