"use strict";

(function initAdminContentModelPage() {
  const stateNode = document.getElementById("adminContentModelState");
  const layoutNode = document.getElementById("adminContentModelLayout");
  const mainCategoryListNode = document.getElementById("adminContentMainCategoryList");
  const subcategoryListNode = document.getElementById("adminContentSubcategoryList");
  const jumpToSubcategoriesButton = document.getElementById("adminContentJumpToSubcategoriesButton");
  const openCategoryAdminLink = document.getElementById("adminContentOpenCategoryAdminLink");
  const openRootPageLink = document.getElementById("adminContentOpenRootPageLink");
  const subcategoriesSection = document.getElementById("adminContentSubcategoriesSection");
  const mainCategoryTemplate = document.getElementById("adminContentMainCategoryTemplate");
  const istanbulGeoSection = document.getElementById("adminContentIstanbulGeoSection");
  const istanbulGeoRefresh = document.getElementById("adminContentIstanbulGeoRefresh");
  const istanbulGeoMessage = document.getElementById("adminContentIstanbulGeoMessage");
  const istanbulGeoDistrictTbody = document.getElementById("adminContentIstanbulGeoDistrictTbody");
  const istanbulGeoNeighborhoodTbody = document.getElementById("adminContentIstanbulGeoNeighborhoodTbody");
  const istanbulGeoDistrictCount = document.getElementById("adminContentIstanbulGeoDistrictCount");
  const istanbulGeoNeighborhoodCount = document.getElementById("adminContentIstanbulGeoNeighborhoodCount");
  const istanbulGeoSelectedDistrict = document.getElementById("adminContentIstanbulGeoSelectedDistrict");
  const istanbulGeoNeighborhoodNewInput = document.getElementById("adminContentIstanbulGeoNeighborhoodNew");
  const istanbulGeoNeighborhoodAddButton = document.getElementById("adminContentIstanbulGeoNeighborhoodAdd");
  const istanbulGeoNeighborhoodSaveButton = document.getElementById("adminContentIstanbulGeoNeighborhoodSave");
  const istanbulGeoNeighborhoodClearButton = document.getElementById("adminContentIstanbulGeoNeighborhoodClear");

  if (
    !stateNode
    || !layoutNode
    || !mainCategoryListNode
    || !subcategoryListNode
    || !jumpToSubcategoriesButton
    || !openCategoryAdminLink
    || !openRootPageLink
    || !subcategoriesSection
    || !mainCategoryTemplate
    || !window.AramaBulAdminAuth
  ) {
    return;
  }

  const summaryNodes = {
    mainCategories: document.getElementById("adminContentMainCategoryCount"),
    subcategories: document.getElementById("adminContentSubcategoryCount"),
  };

  const mainCategoryMessageNode = document.getElementById("adminContentMainCategoryMessage");
  const mainCategoryForm = document.getElementById("adminContentMainCategoryForm");
  const mainCategoryNewButton = document.getElementById("adminContentMainCategoryNewButton");
  const mainCategoryDeleteButton = document.getElementById("adminContentMainCategoryDeleteButton");
  const mainCategoryFields = {
    name: document.getElementById("adminContentMainCategoryName"),
    key: document.getElementById("adminContentMainCategoryKey"),
    slug: document.getElementById("adminContentMainCategorySlug"),
    iconAsset: document.getElementById("adminContentMainCategoryIconAsset"),
    heroImage: document.getElementById("adminContentMainCategoryHeroImage"),
    landingMode: document.getElementById("adminContentMainCategoryLandingMode"),
    sortOrder: document.getElementById("adminContentMainCategorySortOrder"),
    isActive: document.getElementById("adminContentMainCategoryIsActive"),
  };

  const subcategoryMessageNode = document.getElementById("adminContentSubcategoryMessage");
  const subcategoryForm = document.getElementById("adminContentSubcategoryForm");
  const subcategoryNewButton = document.getElementById("adminContentSubcategoryNewButton");
  const subcategoryDeleteButton = document.getElementById("adminContentSubcategoryDeleteButton");
  const subcategoryFields = {
    mainCategoryId: document.getElementById("adminContentSubcategoryMainCategoryId"),
    parentSubcategoryId: document.getElementById("adminContentSubcategoryParentId"),
    name: document.getElementById("adminContentSubcategoryName"),
    key: document.getElementById("adminContentSubcategoryKey"),
    slug: document.getElementById("adminContentSubcategorySlug"),
    titleUnit: document.getElementById("adminContentSubcategoryTitleUnit"),
    recordMode: document.getElementById("adminContentSubcategoryRecordMode"),
    sortOrder: document.getElementById("adminContentSubcategorySortOrder"),
    isActive: document.getElementById("adminContentSubcategoryIsActive"),
  };

  const state = {
    mainCategories: [],
    subcategories: [],
    selectedMainCategoryId: null,
    selectedSubcategoryId: null,
  };

  function setStateMessage(message, isError) {
    stateNode.hidden = false;
    stateNode.textContent = message || "";
    stateNode.dataset.state = isError ? "error" : "neutral";
  }

  function setMessage(node, message, isError) {
    if (!node) {
      return;
    }
    if (!message) {
      node.hidden = true;
      node.textContent = "";
      node.dataset.state = "neutral";
      return;
    }
    node.hidden = false;
    node.textContent = message;
    node.dataset.state = isError ? "error" : "success";
  }

  function normalizeNumber(value) {
    if (value === "" || value === null || value === undefined) {
      return 0;
    }
    const parsed = Number(value);
    return Number.isFinite(parsed) ? Math.max(0, Math.floor(parsed)) : 0;
  }

  function getSelectedMainCategory() {
    return state.mainCategories.find((item) => Number(item.id) === Number(state.selectedMainCategoryId)) || null;
  }

  function getSelectedSubcategory() {
    return state.subcategories.find((item) => Number(item.id) === Number(state.selectedSubcategoryId)) || null;
  }

  function getVisibleSubcategories() {
    if (!Number.isFinite(Number(state.selectedMainCategoryId))) {
      return [...state.subcategories];
    }
    return state.subcategories.filter((item) => Number(item.mainCategoryId) === Number(state.selectedMainCategoryId));
  }

  const istanbulGeoState = {
    districts: [],
    neighborhoodsByDistrict: {},
    selectedDistrict: "",
    selectedNeighborhood: "",
  };

  function setIstanbulGeoEmptyRow(tbody, message) {
    if (!tbody) {
      return;
    }
    tbody.innerHTML = "";
    const row = document.createElement("tr");
    const cell = document.createElement("td");
    cell.className = "admin-content-model-empty";
    cell.textContent = message;
    row.appendChild(cell);
    tbody.appendChild(row);
  }

  function updateIstanbulGeoNeighborhoodControls() {
    const district = istanbulGeoState.selectedDistrict;
    const hasSelection = Boolean(istanbulGeoState.selectedNeighborhood);
    const inputValue = istanbulGeoNeighborhoodNewInput ? istanbulGeoNeighborhoodNewInput.value.trim() : "";
    if (istanbulGeoNeighborhoodNewInput) {
      istanbulGeoNeighborhoodNewInput.disabled = !district;
    }
    if (istanbulGeoNeighborhoodAddButton) {
      istanbulGeoNeighborhoodAddButton.disabled = !district || !inputValue;
    }
    if (istanbulGeoNeighborhoodSaveButton) {
      istanbulGeoNeighborhoodSaveButton.disabled = !district || !hasSelection;
    }
    if (istanbulGeoNeighborhoodClearButton) {
      istanbulGeoNeighborhoodClearButton.disabled = !district || !hasSelection;
    }
  }

  function renderIstanbulGeoNeighborhoods() {
    if (!istanbulGeoNeighborhoodTbody || !istanbulGeoNeighborhoodCount || !istanbulGeoSelectedDistrict) {
      return;
    }
    const by =
      istanbulGeoState.neighborhoodsByDistrict && typeof istanbulGeoState.neighborhoodsByDistrict === "object"
        ? istanbulGeoState.neighborhoodsByDistrict
        : {};
    const district = istanbulGeoState.selectedDistrict;
    istanbulGeoSelectedDistrict.textContent = district || "—";
    const names = district && Array.isArray(by[district]) ? by[district] : [];
    istanbulGeoNeighborhoodCount.textContent = String(names.length);
    istanbulGeoNeighborhoodTbody.innerHTML = "";
    if (!district) {
      istanbulGeoState.selectedNeighborhood = "";
      if (istanbulGeoNeighborhoodNewInput) {
        istanbulGeoNeighborhoodNewInput.value = "";
        istanbulGeoNeighborhoodNewInput.placeholder = "Önce ilçe seçin";
      }
      updateIstanbulGeoNeighborhoodControls();
      setIstanbulGeoEmptyRow(istanbulGeoNeighborhoodTbody, "Bir ilçe seçin.");
      return;
    }
    if (!names.length) {
      istanbulGeoState.selectedNeighborhood = "";
      if (istanbulGeoNeighborhoodNewInput) {
        istanbulGeoNeighborhoodNewInput.value = "";
        istanbulGeoNeighborhoodNewInput.placeholder = "Mahalle adı yazıp Ekle (boş alanlara)";
      }
      updateIstanbulGeoNeighborhoodControls();
      setIstanbulGeoEmptyRow(
        istanbulGeoNeighborhoodTbody,
        "Bu ilçe için listede mahalle yok; aşağıdan boş alanlara eklenebilir veya eşleşmeyen kayıtlar dışta kaldı.",
      );
      return;
    }
    if (istanbulGeoState.selectedNeighborhood && !names.includes(istanbulGeoState.selectedNeighborhood)) {
      istanbulGeoState.selectedNeighborhood = "";
    }
    names.forEach((name) => {
      const row = document.createElement("tr");
      const cell = document.createElement("td");
      cell.className = "admin-content-model-cell-copy";
      const button = document.createElement("button");
      button.type = "button";
      button.className = "admin-content-model-geo-neighborhood";
      button.textContent = name;
      if (name === istanbulGeoState.selectedNeighborhood) {
        button.classList.add("is-active");
      }
      button.addEventListener("click", () => {
        istanbulGeoState.selectedNeighborhood = name;
        if (istanbulGeoNeighborhoodNewInput) {
          istanbulGeoNeighborhoodNewInput.value = name;
          istanbulGeoNeighborhoodNewInput.placeholder = "Yeni adı yazın";
        }
        updateIstanbulGeoNeighborhoodControls();
        renderIstanbulGeoNeighborhoods();
      });
      cell.appendChild(button);
      row.appendChild(cell);
      istanbulGeoNeighborhoodTbody.appendChild(row);
    });
    const hasSelection = Boolean(istanbulGeoState.selectedNeighborhood);
    if (istanbulGeoNeighborhoodNewInput) {
      istanbulGeoNeighborhoodNewInput.placeholder = hasSelection ? "Yeni ad (güncelle / ekle)" : "Mahalle adı (listeden seçin veya Ekle)";
    }
    updateIstanbulGeoNeighborhoodControls();
  }

  function renderIstanbulGeoDistricts() {
    if (!istanbulGeoDistrictTbody || !istanbulGeoDistrictCount) {
      return;
    }
    const list = Array.isArray(istanbulGeoState.districts) ? istanbulGeoState.districts : [];
    istanbulGeoDistrictCount.textContent = String(list.length);
    istanbulGeoDistrictTbody.innerHTML = "";
    if (!list.length) {
      setIstanbulGeoEmptyRow(istanbulGeoDistrictTbody, "İlçe yok.");
      renderIstanbulGeoNeighborhoods();
      return;
    }
    list.forEach((name) => {
      const row = document.createElement("tr");
      const cell = document.createElement("td");
      cell.className = "admin-content-model-cell-copy";
      const button = document.createElement("button");
      button.type = "button";
      button.className = "admin-content-model-geo-district";
      button.textContent = name;
      if (name === istanbulGeoState.selectedDistrict) {
        button.classList.add("is-active");
      }
      button.addEventListener("click", () => {
        istanbulGeoState.selectedDistrict = name;
        istanbulGeoState.selectedNeighborhood = "";
        if (istanbulGeoNeighborhoodNewInput) {
          istanbulGeoNeighborhoodNewInput.value = "";
        }
        renderIstanbulGeoDistricts();
        renderIstanbulGeoNeighborhoods();
      });
      cell.appendChild(button);
      row.appendChild(cell);
      istanbulGeoDistrictTbody.appendChild(row);
    });
  }

  async function loadIstanbulGeo() {
    if (!istanbulGeoSection) {
      return;
    }
    setMessage(istanbulGeoMessage, "Filtre verisi yükleniyor.", false);
    const { response, payload } = await window.AramaBulAdminAuth.fetchJson("/api/mvp/istanbul/filters");
    if (!response.ok) {
      throw new Error(payload?.error?.message || "İstanbul filtreleri alınamadı.");
    }
    istanbulGeoState.districts = Array.isArray(payload.districts) ? payload.districts : [];
    istanbulGeoState.neighborhoodsByDistrict =
      payload.neighborhoodsByDistrict && typeof payload.neighborhoodsByDistrict === "object"
        ? payload.neighborhoodsByDistrict
        : {};
    const first = istanbulGeoState.districts[0] || "";
    if (!first || !istanbulGeoState.districts.includes(istanbulGeoState.selectedDistrict)) {
      istanbulGeoState.selectedDistrict = first;
    }
    istanbulGeoState.selectedNeighborhood = "";
    if (istanbulGeoNeighborhoodNewInput) {
      istanbulGeoNeighborhoodNewInput.value = "";
    }
    setMessage(istanbulGeoMessage, "", false);
    renderIstanbulGeoDistricts();
    renderIstanbulGeoNeighborhoods();
  }

  async function saveIstanbulGeoNeighborhood() {
    if (!istanbulGeoSection) {
      return;
    }
    const district = istanbulGeoState.selectedDistrict;
    const fromN = istanbulGeoState.selectedNeighborhood;
    const toN = istanbulGeoNeighborhoodNewInput ? istanbulGeoNeighborhoodNewInput.value.trim() : "";
    if (!district || !fromN) {
      setMessage(istanbulGeoMessage, "Önce ilçe ve mahalle seçin.", true);
      return;
    }
    if (!toN) {
      setMessage(istanbulGeoMessage, "Yeni mahalle adı boş olamaz. Kaldırmak için «Kaldır» kullanın.", true);
      return;
    }
    setMessage(istanbulGeoMessage, "Güncelleniyor…", false);
    const { response, payload } = await window.AramaBulAdminAuth.fetchJson("/api/admin/istanbul-mvp/neighborhoods", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        district,
        fromNeighborhood: fromN,
        toNeighborhood: toN,
      }),
    });
    if (!response.ok) {
      throw new Error(payload?.error?.message || "Mahalle güncellenemedi.");
    }
    const n = Number(payload?.updated);
    setMessage(istanbulGeoMessage, `${Number.isFinite(n) ? n : 0} mekan güncellendi.`, false);
    await loadIstanbulGeo();
  }

  async function clearIstanbulGeoNeighborhood() {
    if (!istanbulGeoSection) {
      return;
    }
    const district = istanbulGeoState.selectedDistrict;
    const fromN = istanbulGeoState.selectedNeighborhood;
    if (!district || !fromN) {
      setMessage(istanbulGeoMessage, "Önce ilçe ve mahalle seçin.", true);
      return;
    }
    const ok = window.confirm(
      "Seçili mahalle adı, bu ilçe ve etiketle eşleşen tüm pilot mekanlardan kaldırılacak. Devam edilsin mi?",
    );
    if (!ok) {
      return;
    }
    setMessage(istanbulGeoMessage, "Kaldırılıyor…", false);
    const { response, payload } = await window.AramaBulAdminAuth.fetchJson("/api/admin/istanbul-mvp/neighborhoods", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        district,
        fromNeighborhood: fromN,
        clear: true,
      }),
    });
    if (!response.ok) {
      throw new Error(payload?.error?.message || "Mahalle kaldırılamadı.");
    }
    const n = Number(payload?.updated);
    setMessage(istanbulGeoMessage, `${Number.isFinite(n) ? n : 0} mekanda mahalle alanı kaldırıldı.`, false);
    await loadIstanbulGeo();
  }

  async function fillEmptyIstanbulGeoNeighborhoods() {
    if (!istanbulGeoSection) {
      return;
    }
    const district = istanbulGeoState.selectedDistrict;
    const newN = istanbulGeoNeighborhoodNewInput ? istanbulGeoNeighborhoodNewInput.value.trim() : "";
    if (!district || !newN) {
      setMessage(istanbulGeoMessage, "İlçe seçin ve mahalle adı yazın.", true);
      return;
    }
    const ok = window.confirm(
      `«${district}» ilçesinde mahalle alanı boş olan tüm pilot mekânlara «${newN}» yazılacak. Devam edilsin mi?`,
    );
    if (!ok) {
      return;
    }
    setMessage(istanbulGeoMessage, "Ekleniyor…", false);
    const { response, payload } = await window.AramaBulAdminAuth.fetchJson("/api/admin/istanbul-mvp/neighborhoods", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        district,
        fillEmpty: true,
        newNeighborhood: newN,
      }),
    });
    if (!response.ok) {
      throw new Error(payload?.error?.message || "Mahalle eklenemedi.");
    }
    const n = Number(payload?.updated);
    setMessage(istanbulGeoMessage, `${Number.isFinite(n) ? n : 0} mekana mahalle yazıldı.`, false);
    await loadIstanbulGeo();
  }

  function populateSubcategoryMainCategoryOptions() {
    const currentValue = subcategoryFields.mainCategoryId.value;
    subcategoryFields.mainCategoryId.innerHTML = "";

    state.mainCategories.forEach((item) => {
      const option = document.createElement("option");
      option.value = String(item.id);
      option.textContent = item.name || "Ana kategori";
      subcategoryFields.mainCategoryId.appendChild(option);
    });

    if (currentValue && state.mainCategories.some((item) => String(item.id) === currentValue)) {
      subcategoryFields.mainCategoryId.value = currentValue;
      return;
    }

    if (Number.isFinite(Number(state.selectedMainCategoryId))) {
      subcategoryFields.mainCategoryId.value = String(state.selectedMainCategoryId);
      return;
    }

    subcategoryFields.mainCategoryId.value = state.mainCategories[0] ? String(state.mainCategories[0].id) : "";
  }

  function populateParentSubcategoryOptions() {
    const selectedMainCategoryId = Number(subcategoryFields.mainCategoryId.value || 0);
    const selectedSubcategoryId = Number(state.selectedSubcategoryId || 0);
    const currentValue = subcategoryFields.parentSubcategoryId.value;

    subcategoryFields.parentSubcategoryId.innerHTML = "";
    const emptyOption = document.createElement("option");
    emptyOption.value = "";
    emptyOption.textContent = "Yok";
    subcategoryFields.parentSubcategoryId.appendChild(emptyOption);

    state.subcategories
      .filter((item) => Number(item.mainCategoryId) === selectedMainCategoryId)
      .filter((item) => Number(item.id) !== selectedSubcategoryId)
      .sort((left, right) => {
        const leftSort = Number(left.sortOrder || 0);
        const rightSort = Number(right.sortOrder || 0);
        if (leftSort !== rightSort) {
          return leftSort - rightSort;
        }
        return String(left.name || "").localeCompare(String(right.name || ""), "tr");
      })
      .forEach((item) => {
        const option = document.createElement("option");
        option.value = String(item.id);
        option.textContent = item.name || "Alt kategori";
        subcategoryFields.parentSubcategoryId.appendChild(option);
      });

    if (currentValue && Array.from(subcategoryFields.parentSubcategoryId.options).some((option) => option.value === currentValue)) {
      subcategoryFields.parentSubcategoryId.value = currentValue;
      return;
    }
    subcategoryFields.parentSubcategoryId.value = "";
  }

  function resetMainCategoryForm() {
    mainCategoryForm.reset();
    mainCategoryFields.landingMode.value = "tree";
    mainCategoryFields.sortOrder.value = "0";
    mainCategoryFields.isActive.value = "true";
    mainCategoryDeleteButton.hidden = true;
    setMessage(mainCategoryMessageNode, "", false);
  }

  function resetSubcategoryForm() {
    subcategoryForm.reset();
    populateSubcategoryMainCategoryOptions();
    subcategoryFields.recordMode.value = "dataset";
    subcategoryFields.sortOrder.value = "0";
    subcategoryFields.isActive.value = "true";
    state.selectedSubcategoryId = null;
    populateParentSubcategoryOptions();
    subcategoryDeleteButton.hidden = true;
    setMessage(subcategoryMessageNode, "", false);
  }

  function fillMainCategoryForm(item) {
    mainCategoryFields.name.value = item.name || "";
    mainCategoryFields.key.value = item.key || "";
    mainCategoryFields.slug.value = item.slug || "";
    mainCategoryFields.iconAsset.value = item.iconAsset || "";
    mainCategoryFields.heroImage.value = item.heroImage || "";
    mainCategoryFields.landingMode.value = item.landingMode || "tree";
    mainCategoryFields.sortOrder.value = item.sortOrder ?? 0;
    mainCategoryFields.isActive.value = String(Boolean(item.isActive));
    mainCategoryDeleteButton.hidden = false;
    setMessage(mainCategoryMessageNode, "", false);
  }

  function fillSubcategoryForm(item) {
    state.selectedSubcategoryId = Number(item.id);
    subcategoryFields.mainCategoryId.value = String(item.mainCategoryId || "");
    populateParentSubcategoryOptions();
    subcategoryFields.parentSubcategoryId.value = item.parentSubcategoryId ? String(item.parentSubcategoryId) : "";
    subcategoryFields.name.value = item.name || "";
    subcategoryFields.key.value = item.key || "";
    subcategoryFields.slug.value = item.slug || "";
    subcategoryFields.titleUnit.value = item.titleUnit || "";
    subcategoryFields.recordMode.value = item.recordMode || "dataset";
    subcategoryFields.sortOrder.value = item.sortOrder ?? 0;
    subcategoryFields.isActive.value = String(Boolean(item.isActive));
    subcategoryDeleteButton.hidden = false;
    setMessage(subcategoryMessageNode, "", false);
  }

  function renderSummary() {
    if (summaryNodes.mainCategories) {
      summaryNodes.mainCategories.textContent = String(state.mainCategories.length);
    }
    if (summaryNodes.subcategories) {
      summaryNodes.subcategories.textContent = String(state.subcategories.length);
    }
  }

  function updateSelectedCategoryActions() {
    const selectedMainCategory = getSelectedMainCategory();

    jumpToSubcategoriesButton.disabled = !selectedMainCategory;

    if (selectedMainCategory && selectedMainCategory.key === "yeme-icme") {
      openCategoryAdminLink.hidden = false;
      openCategoryAdminLink.href = "admin-venues.html";
      openCategoryAdminLink.textContent = "Yeme-İçme adminine git";
    } else {
      openCategoryAdminLink.hidden = true;
      openCategoryAdminLink.removeAttribute("href");
      openCategoryAdminLink.textContent = "Kategori adminine git";
    }

    openRootPageLink.hidden = true;
    openRootPageLink.removeAttribute("href");
    openRootPageLink.textContent = "Canlı sayfayı aç";
  }

  function renderMainCategories() {
    mainCategoryListNode.innerHTML = "";
    state.mainCategories.forEach((item) => {
      const fragment = mainCategoryTemplate.content.cloneNode(true);
      const button = fragment.querySelector("button");
      const titleNode = fragment.querySelector(".admin-venue-list-item-title");
      const metaNode = fragment.querySelector(".admin-venue-list-item-meta");

      titleNode.textContent = item.name || "Ana kategori";
      metaNode.textContent = `${item.slug || "-"} / ${item.landingMode || "-"} / ${item.isActive ? "aktif" : "pasif"}`;

      if (Number(item.id) === Number(state.selectedMainCategoryId)) {
        button.classList.add("is-active");
      }

      button.addEventListener("click", () => {
        state.selectedMainCategoryId = Number(item.id);
        fillMainCategoryForm(item);
        resetSubcategoryForm();
        renderAll();
      });

      mainCategoryListNode.appendChild(fragment);
    });
  }

  function renderSubcategories() {
    const items = getVisibleSubcategories();
    subcategoryListNode.innerHTML = "";

    if (!items.length) {
      const emptyNode = document.createElement("p");
      emptyNode.className = "admin-venues-scope-note";
      emptyNode.textContent = "Bu ana kategori için alt kategori yok.";
      subcategoryListNode.appendChild(emptyNode);
      return;
    }

    items.forEach((item) => {
      const fragment = mainCategoryTemplate.content.cloneNode(true);
      const button = fragment.querySelector("button");
      const titleNode = fragment.querySelector(".admin-venue-list-item-title");
      const metaNode = fragment.querySelector(".admin-venue-list-item-meta");
      const parentLabel = item.parentSubcategoryName || "üst bağ yok";

      titleNode.textContent = item.name || "Alt kategori";
      metaNode.textContent = `${item.recordMode || "-"} / ${parentLabel} / ${item.isActive ? "aktif" : "pasif"}`;

      if (Number(item.id) === Number(state.selectedSubcategoryId)) {
        button.classList.add("is-active");
      }

      button.addEventListener("click", () => {
        state.selectedMainCategoryId = Number(item.mainCategoryId);
        fillSubcategoryForm(item);
        renderAll();
      });

      subcategoryListNode.appendChild(fragment);
    });
  }

  function renderAll() {
    renderSummary();
    populateSubcategoryMainCategoryOptions();
    populateParentSubcategoryOptions();
    renderMainCategories();
    renderSubcategories();
    updateSelectedCategoryActions();

    setStateMessage("İçerik mimarisi yüklendi.", false);
    layoutNode.hidden = false;
  }

  async function loadOverview() {
    const { response, payload } = await window.AramaBulAdminAuth.fetchJson("/api/admin/content-model/overview");
    if (!response.ok) {
      throw new Error(payload?.error?.message || "İçerik mimarisi alınamadı.");
    }

    state.mainCategories = Array.isArray(payload.mainCategories) ? payload.mainCategories : [];
    state.subcategories = Array.isArray(payload.subcategories) ? payload.subcategories : [];

    if (!state.mainCategories.some((item) => Number(item.id) === Number(state.selectedMainCategoryId))) {
      const geziCategory = state.mainCategories.find((item) => item.key === "gezi");
      state.selectedMainCategoryId = geziCategory ? Number(geziCategory.id) : Number(state.mainCategories[0]?.id || 0);
    }

    if (!state.subcategories.some((item) => Number(item.id) === Number(state.selectedSubcategoryId))) {
      state.selectedSubcategoryId = null;
    }

    renderAll();
  }

  async function saveMainCategory(event) {
    event.preventDefault();
    setMessage(mainCategoryMessageNode, "Ana kategori kaydediliyor.", false);

    const selectedMainCategory = getSelectedMainCategory();
    const isUpdate = Boolean(selectedMainCategory && mainCategoryDeleteButton.hidden === false);
    const endpoint = isUpdate
      ? `/api/admin/content-model/main-categories/${encodeURIComponent(selectedMainCategory.id)}`
      : "/api/admin/content-model/main-categories";

    const { response, payload } = await window.AramaBulAdminAuth.fetchJson(endpoint, {
      method: isUpdate ? "PUT" : "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: mainCategoryFields.name.value.trim(),
        key: mainCategoryFields.key.value.trim() || null,
        slug: mainCategoryFields.slug.value.trim() || null,
        iconAsset: mainCategoryFields.iconAsset.value.trim() || null,
        heroImage: mainCategoryFields.heroImage.value.trim() || null,
        landingMode: mainCategoryFields.landingMode.value,
        sortOrder: normalizeNumber(mainCategoryFields.sortOrder.value),
        isActive: mainCategoryFields.isActive.value === "true",
      }),
    });

    if (!response.ok) {
      throw new Error(payload?.error?.message || "Ana kategori kaydedilemedi.");
    }

    state.selectedMainCategoryId = Number(payload.item.id);
    await loadOverview();
    fillMainCategoryForm(
      state.mainCategories.find((item) => Number(item.id) === Number(state.selectedMainCategoryId)) || payload.item,
    );
    resetSubcategoryForm();
    setMessage(mainCategoryMessageNode, "Ana kategori kaydedildi.", false);
  }

  async function deleteMainCategory() {
    const selectedMainCategory = getSelectedMainCategory();
    if (!selectedMainCategory) {
      return;
    }

    const confirmed = window.confirm(`${selectedMainCategory.name} silinsin mi? Buna bağlı alt kategoriler de silinir.`);
    if (!confirmed) {
      return;
    }

    setMessage(mainCategoryMessageNode, "Ana kategori siliniyor.", false);
    const { response, payload } = await window.AramaBulAdminAuth.fetchJson(
      `/api/admin/content-model/main-categories/${encodeURIComponent(selectedMainCategory.id)}`,
      { method: "DELETE" },
    );

    if (!response.ok) {
      throw new Error(payload?.error?.message || "Ana kategori silinemedi.");
    }

    state.selectedMainCategoryId = null;
    state.selectedSubcategoryId = null;
    resetMainCategoryForm();
    resetSubcategoryForm();
    await loadOverview();
    setMessage(mainCategoryMessageNode, "Ana kategori silindi.", false);
  }

  async function saveSubcategory(event) {
    event.preventDefault();
    setMessage(subcategoryMessageNode, "Alt kategori kaydediliyor.", false);

    const selectedSubcategory = getSelectedSubcategory();
    const isUpdate = Boolean(selectedSubcategory && subcategoryDeleteButton.hidden === false);
    const endpoint = isUpdate
      ? `/api/admin/content-model/subcategories/${encodeURIComponent(selectedSubcategory.id)}`
      : "/api/admin/content-model/subcategories";

    const { response, payload } = await window.AramaBulAdminAuth.fetchJson(endpoint, {
      method: isUpdate ? "PUT" : "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        mainCategoryId: Number(subcategoryFields.mainCategoryId.value || 0),
        parentSubcategoryId: subcategoryFields.parentSubcategoryId.value ? Number(subcategoryFields.parentSubcategoryId.value) : null,
        name: subcategoryFields.name.value.trim(),
        key: subcategoryFields.key.value.trim() || null,
        slug: subcategoryFields.slug.value.trim() || null,
        titleUnit: subcategoryFields.titleUnit.value.trim() || null,
        recordMode: subcategoryFields.recordMode.value,
        sortOrder: normalizeNumber(subcategoryFields.sortOrder.value),
        isActive: subcategoryFields.isActive.value === "true",
      }),
    });

    if (!response.ok) {
      throw new Error(payload?.error?.message || "Alt kategori kaydedilemedi.");
    }

    state.selectedMainCategoryId = Number(subcategoryFields.mainCategoryId.value || state.selectedMainCategoryId || 0);
    state.selectedSubcategoryId = Number(payload.item.id);
    await loadOverview();
    fillSubcategoryForm(
      state.subcategories.find((item) => Number(item.id) === Number(state.selectedSubcategoryId)) || payload.item,
    );
    setMessage(subcategoryMessageNode, "Alt kategori kaydedildi.", false);
  }

  async function deleteSubcategory() {
    const selectedSubcategory = getSelectedSubcategory();
    if (!selectedSubcategory) {
      return;
    }

    const confirmed = window.confirm(`${selectedSubcategory.name} silinsin mi? Bağlı kaynaklar da silinir.`);
    if (!confirmed) {
      return;
    }

    setMessage(subcategoryMessageNode, "Alt kategori siliniyor.", false);
    const { response, payload } = await window.AramaBulAdminAuth.fetchJson(
      `/api/admin/content-model/subcategories/${encodeURIComponent(selectedSubcategory.id)}`,
      { method: "DELETE" },
    );

    if (!response.ok) {
      throw new Error(payload?.error?.message || "Alt kategori silinemedi.");
    }

    state.selectedSubcategoryId = null;
    resetSubcategoryForm();
    await loadOverview();
    setMessage(subcategoryMessageNode, "Alt kategori silindi.", false);
  }

  function bindEvents() {
    mainCategoryNewButton.addEventListener("click", () => {
      resetMainCategoryForm();
    });

    subcategoryNewButton.addEventListener("click", () => {
      resetSubcategoryForm();
    });

    jumpToSubcategoriesButton.addEventListener("click", () => {
      subcategoriesSection.scrollIntoView({ behavior: "smooth", block: "start" });
    });

    mainCategoryForm.addEventListener("submit", (event) => {
      void saveMainCategory(event).catch((error) => {
        setMessage(mainCategoryMessageNode, error instanceof Error ? error.message : "Ana kategori kaydedilemedi.", true);
      });
    });

    subcategoryForm.addEventListener("submit", (event) => {
      void saveSubcategory(event).catch((error) => {
        setMessage(subcategoryMessageNode, error instanceof Error ? error.message : "Alt kategori kaydedilemedi.", true);
      });
    });

    mainCategoryDeleteButton.addEventListener("click", () => {
      void deleteMainCategory().catch((error) => {
        setMessage(mainCategoryMessageNode, error instanceof Error ? error.message : "Ana kategori silinemedi.", true);
      });
    });

    subcategoryDeleteButton.addEventListener("click", () => {
      void deleteSubcategory().catch((error) => {
        setMessage(subcategoryMessageNode, error instanceof Error ? error.message : "Alt kategori silinemedi.", true);
      });
    });

    subcategoryFields.mainCategoryId.addEventListener("change", () => {
      state.selectedMainCategoryId = Number(subcategoryFields.mainCategoryId.value || state.selectedMainCategoryId || 0);
      populateParentSubcategoryOptions();
    });

    if (istanbulGeoRefresh) {
      istanbulGeoRefresh.addEventListener("click", () => {
        void loadIstanbulGeo().catch((error) => {
          setMessage(
            istanbulGeoMessage,
            error instanceof Error ? error.message : "Filtre verisi yüklenemedi.",
            true,
          );
        });
      });
    }

    if (istanbulGeoNeighborhoodNewInput) {
      istanbulGeoNeighborhoodNewInput.addEventListener("input", () => {
        updateIstanbulGeoNeighborhoodControls();
      });
    }

    if (istanbulGeoNeighborhoodAddButton) {
      istanbulGeoNeighborhoodAddButton.addEventListener("click", () => {
        void fillEmptyIstanbulGeoNeighborhoods().catch((error) => {
          setMessage(
            istanbulGeoMessage,
            error instanceof Error ? error.message : "Mahalle eklenemedi.",
            true,
          );
        });
      });
    }

    if (istanbulGeoNeighborhoodSaveButton) {
      istanbulGeoNeighborhoodSaveButton.addEventListener("click", () => {
        void saveIstanbulGeoNeighborhood().catch((error) => {
          setMessage(
            istanbulGeoMessage,
            error instanceof Error ? error.message : "Mahalle güncellenemedi.",
            true,
          );
        });
      });
    }

    if (istanbulGeoNeighborhoodClearButton) {
      istanbulGeoNeighborhoodClearButton.addEventListener("click", () => {
        void clearIstanbulGeoNeighborhood().catch((error) => {
          setMessage(
            istanbulGeoMessage,
            error instanceof Error ? error.message : "Mahalle kaldırılamadı.",
            true,
          );
        });
      });
    }
  }

  async function init() {
    try {
      const session = await window.AramaBulAdminAuth.ensureSession();
      window.AramaBulAdminAuth.bindSessionUi(session);
      bindEvents();
      resetMainCategoryForm();
      resetSubcategoryForm();
      await loadOverview();
      if (istanbulGeoSection) {
        void loadIstanbulGeo().catch((error) => {
          setMessage(
            istanbulGeoMessage,
            error instanceof Error ? error.message : "Filtre verisi yüklenemedi.",
            true,
          );
        });
      }
    } catch (error) {
      layoutNode.hidden = true;
      setStateMessage(error instanceof Error ? error.message : "İçerik mimarisi yüklenemedi.", true);
    }
  }

  void init();
})();
