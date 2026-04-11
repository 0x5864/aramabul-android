"use strict";

(function initAdminVenuesPage() {
  const listNode = document.getElementById("adminVenueList");
  const tableWrapNode = document.getElementById("adminVenueTableWrap");
  if (!listNode || !window.AramaBulAdminAuth) {
    return;
  }

  const DEFAULT_ADMIN_CITY = "İstanbul";

  const state = {
    items: [],
    categories: [],
    tags: [],
    photos: [],
    pagination: null,
    selectedVenueId: null,
    selectedVenueSource: "",
    selectedTagKeys: new Set(),
    tableSort: {
      key: "",
      direction: "none",
    },
  };

  const listStateNode = document.getElementById("adminVenueListState");
  const formMessageNode = document.getElementById("adminVenueFormMessage");
  const formDetailsNode = document.getElementById("adminVenueFormDetails");
  const formTitleNode = document.getElementById("adminVenueFormTitle");
  const searchInput = document.getElementById("adminVenueSearchInput");
  const districtInput = document.getElementById("adminVenueDistrictInput");
  const categoryFilterSelect = document.getElementById("adminVenueCategoryFilter");
  const activeFilterSelect = document.getElementById("adminVenueActiveFilter");
  const photoFilterSelect = document.getElementById("adminVenuePhotoFilter");
  const sortFilterSelect = document.getElementById("adminVenueSortFilter");
  const searchButton = document.getElementById("adminVenueSearchButton");
  const newButton = document.getElementById("adminVenueNewButton");
  const deleteButton = document.getElementById("adminVenueDeleteButton");
  const permanentCloseButton = document.getElementById("adminVenuePermanentCloseButton");
  const syncGoogleButton = document.getElementById("adminVenueSyncGoogleButton");
  const saveAndNewButton = document.getElementById("adminVenueSaveAndNewButton");
  const paginationNode = document.getElementById("adminVenuePagination");
  const paginationCurrentNode = document.getElementById("adminVenuePaginationCurrent");
  const prevPageButton = document.getElementById("adminVenuePrevPageButton");
  const nextPageButton = document.getElementById("adminVenueNextPageButton");
  const generateMapsButton = document.getElementById("adminVenueGenerateMapsButton");
  const form = document.getElementById("adminVenueForm");
  const categorySelect = document.getElementById("adminVenueCategory");
  const tagList = document.getElementById("adminTagList");
  const photoList = document.getElementById("adminVenuePhotoList");
  const sortButtons = Array.from(document.querySelectorAll("[data-sort-key]"));
  const addPhotoButton = document.getElementById("adminVenueAddPhotoButton");
  const uploadPhotoButton = document.getElementById("adminVenueUploadPhotoButton");
  const uploadPhotoInput = document.getElementById("adminVenuePhotoUploadInput");
  const findPhotoButton = document.getElementById("adminVenueFindPhotoButton");
  const photoTemplate = document.getElementById("adminVenuePhotoItemTemplate");
  const mapsQuickLink = document.getElementById("adminVenueMapsQuickLink");
  const detailQuickLink = document.getElementById("adminVenueDetailQuickLink");
  const openDetailButton = document.getElementById("adminVenueOpenDetailButton");
  const mainPhotoPreviewWrap = document.getElementById("adminVenuePhotoUriPreviewWrap");
  const mainPhotoPreviewNode = document.getElementById("adminVenuePhotoUriPreview");

  const fields = {
    name: document.getElementById("adminVenueName"),
    slug: document.getElementById("adminVenueSlug"),
    city: document.getElementById("adminVenueCity"),
    district: document.getElementById("adminVenueDistrict"),
    neighborhood: document.getElementById("adminVenueNeighborhood"),
    categoryId: document.getElementById("adminVenueCategory"),
    cuisine: document.getElementById("adminVenueCuisine"),
    budget: document.getElementById("adminVenueBudget"),
    rating: document.getElementById("adminVenueRating"),
    userRatingCount: document.getElementById("adminVenueRatingCount"),
    latitude: document.getElementById("adminVenueLatitude"),
    longitude: document.getElementById("adminVenueLongitude"),
    address: document.getElementById("adminVenueAddress"),
    phone: document.getElementById("adminVenuePhone"),
    website: document.getElementById("adminVenueWebsite"),
    menuUrl: document.getElementById("adminVenueMenuUrl"),
    instagram: document.getElementById("adminVenueInstagram"),
    mapsUrl: document.getElementById("adminVenueMapsUrl"),
    photoUri: document.getElementById("adminVenuePhotoUri"),
    isOpenNow: document.getElementById("adminVenueIsOpenNow"),
    openingStatusText: document.getElementById("adminVenueOpeningStatusText"),
    temporarilyClosed: document.getElementById("adminVenueTemporarilyClosed"),
    isActive: document.getElementById("adminVenueIsActive"),
    isIstanbulMvp: document.getElementById("adminVenueIsIstanbulMvp"),
    editorialSummary: document.getElementById("adminVenueSummary"),
  };

  const fieldErrorTargets = {
    name: fields.name,
    slug: fields.slug,
    city: fields.city,
    district: fields.district,
    neighborhood: fields.neighborhood,
    categoryId: fields.categoryId,
    cuisine: fields.cuisine,
    budget: fields.budget,
    rating: fields.rating,
    userRatingCount: fields.userRatingCount,
    latitude: fields.latitude,
    longitude: fields.longitude,
    address: fields.address,
    phone: fields.phone,
    website: fields.website,
    menuUrl: fields.menuUrl,
    instagram: fields.instagram,
    mapsUrl: fields.mapsUrl,
    photoUri: fields.photoUri,
    isOpenNow: fields.isOpenNow,
    openingStatusText: fields.openingStatusText,
    temporarilyClosed: fields.temporarilyClosed,
    isActive: fields.isActive,
    isIstanbulMvp: fields.isIstanbulMvp,
    editorialSummary: fields.editorialSummary,
    tagKeys: tagList,
    photos: photoList,
  };

  function setFormMessage(message, isError, details = []) {
    if (!message) {
      formMessageNode.hidden = true;
      formMessageNode.textContent = "";
      formMessageNode.dataset.state = "neutral";
      if (formDetailsNode) {
        formDetailsNode.hidden = true;
        formDetailsNode.innerHTML = "";
      }
      return;
    }
    formMessageNode.hidden = false;
    formMessageNode.textContent = message;
    formMessageNode.dataset.state = isError ? "error" : "success";
    if (!formDetailsNode) {
      return;
    }
    formDetailsNode.innerHTML = "";
    const detailItems = Array.isArray(details) ? details.filter(Boolean) : [];
    if (!detailItems.length) {
      formDetailsNode.hidden = true;
      return;
    }
    detailItems.forEach((item) => {
      const detailNode = document.createElement("li");
      detailNode.textContent = item;
      formDetailsNode.appendChild(detailNode);
    });
    formDetailsNode.hidden = false;
  }

  function clearFieldErrors() {
    Object.values(fieldErrorTargets).forEach((node) => {
      if (!(node instanceof HTMLElement)) {
        return;
      }
      node.classList.remove("is-invalid");
      node.removeAttribute("aria-invalid");
    });
    form.querySelectorAll(".admin-field-error").forEach((node) => node.remove());
  }

  function markFieldError(fieldName, message = "") {
    const targetNode = fieldErrorTargets[fieldName];
    if (!(targetNode instanceof HTMLElement)) {
      return;
    }
    targetNode.classList.add("is-invalid");
    targetNode.setAttribute("aria-invalid", "true");

    const fieldWrap = targetNode.closest(".istanbul-filter-field, .admin-tag-field");
    if (!(fieldWrap instanceof HTMLElement) || !message) {
      return;
    }

    const detailNode = document.createElement("span");
    detailNode.className = "admin-field-error";
    detailNode.textContent = message;
    fieldWrap.appendChild(detailNode);
  }

  function applyFieldErrors(details) {
    clearFieldErrors();
    const detailItems = Array.isArray(details) ? details : [];
    detailItems.forEach((detail) => {
      const normalizedDetail = String(detail || "").toLowerCase();
      if (!normalizedDetail) {
        return;
      }

      [
        "name",
        "slug",
        "city",
        "district",
        "neighborhood",
        "categoryid",
        "cuisine",
        "budget",
        "rating",
        "userratingcount",
        "latitude",
        "longitude",
        "address",
        "phone",
        "website",
        "menuurl",
        "instagram",
        "mapsurl",
        "photouri",
        "isopennow",
        "openingstatustext",
        "temporarilyclosed",
        "isactive",
        "isistanbulmvp",
        "editorialsummary",
        "tagkeys",
        "photos",
      ].forEach((key) => {
        if (normalizedDetail.includes(key)) {
          const fieldName = key === "categoryid" ? "categoryId"
            : key === "userratingcount" ? "userRatingCount"
            : key === "mapsurl" ? "mapsUrl"
            : key === "menuurl" ? "menuUrl"
            : key === "photouri" ? "photoUri"
            : key === "isopennow" ? "isOpenNow"
            : key === "openingstatustext" ? "openingStatusText"
            : key === "temporarilyclosed" ? "temporarilyClosed"
            : key === "isactive" ? "isActive"
            : key === "isistanbulmvp" ? "isIstanbulMvp"
            : key === "editorialsummary" ? "editorialSummary"
            : key === "tagkeys" ? "tagKeys"
            : key;
          markFieldError(fieldName, String(detail));
        }
      });
    });
  }

  function updateTableSortButtons() {
    sortButtons.forEach((button) => {
      const isActive = button.dataset.sortKey === state.tableSort.key;
      const direction = isActive ? state.tableSort.direction : "none";
      button.dataset.direction = direction;
      button.setAttribute(
        "aria-sort",
        direction === "asc" ? "ascending" : direction === "desc" ? "descending" : "none",
      );
    });
  }

  function buildListQuery() {
    const params = new URLSearchParams();
    params.set("limit", "50");
    params.set("city", DEFAULT_ADMIN_CITY);
    params.set("page", String(state.pagination?.page || 1));
    if (searchInput.value.trim()) {
      params.set("q", searchInput.value.trim());
    }
    if (districtInput.value.trim()) {
      params.set("district", districtInput.value.trim());
    }
    if (categoryFilterSelect.value) {
      params.set("categoryId", categoryFilterSelect.value);
    }
    if (activeFilterSelect.value) {
      params.set("isActive", activeFilterSelect.value);
    }
    if (photoFilterSelect.value) {
      params.set("photoState", photoFilterSelect.value);
    }
    if (sortFilterSelect.value) {
      params.set("sort", sortFilterSelect.value);
    }
    return params.toString();
  }

  function normalizeNumber(value) {
    if (value === "" || value === null || value === undefined) {
      return null;
    }
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  function parseBooleanSelectValue(value, fallback = null) {
    if (value === "true") {
      return true;
    }
    if (value === "false") {
      return false;
    }
    return fallback;
  }

  function sortAdminItems(items) {
    const backendSortKey = sortFilterSelect.value || "stale";
    const nextItems = Array.isArray(items) ? [...items] : [];

    if (backendSortKey === "rating") {
      nextItems.sort((left, right) => {
        const leftRating = Number.isFinite(Number(left?.rating)) ? Number(left.rating) : -1;
        const rightRating = Number.isFinite(Number(right?.rating)) ? Number(right.rating) : -1;
        if (rightRating !== leftRating) {
          return rightRating - leftRating;
        }

        const leftCount = Number.isFinite(Number(left?.userRatingCount)) ? Number(left.userRatingCount) : -1;
        const rightCount = Number.isFinite(Number(right?.userRatingCount)) ? Number(right.userRatingCount) : -1;
        if (rightCount !== leftCount) {
          return rightCount - leftCount;
        }

        return String(left?.name || "").localeCompare(String(right?.name || ""), "tr");
      });
    } else if (backendSortKey === "name") {
      nextItems.sort((left, right) =>
        String(left?.name || "").localeCompare(String(right?.name || ""), "tr"),
      );
    } else if (backendSortKey === "updated") {
      nextItems.sort((left, right) => {
        const leftUpdated = Date.parse(left?.updatedAt || "") || 0;
        const rightUpdated = Date.parse(right?.updatedAt || "") || 0;
        if (rightUpdated !== leftUpdated) {
          return rightUpdated - leftUpdated;
        }
        return Number(right?.id || 0) - Number(left?.id || 0);
      });
    } else {
      nextItems.sort((left, right) => {
        const leftUpdated = Date.parse(left?.updatedAt || "") || 0;
        const rightUpdated = Date.parse(right?.updatedAt || "") || 0;
        if (leftUpdated !== rightUpdated) {
          return leftUpdated - rightUpdated;
        }
        return Number(left?.id || 0) - Number(right?.id || 0);
      });
    }

    if (!state.tableSort.key || state.tableSort.direction === "none") {
      return nextItems;
    }

    const multiplier = state.tableSort.direction === "asc" ? 1 : -1;
    nextItems.sort((left, right) => {
      let comparison = 0;
      if (state.tableSort.key === "name") {
        comparison = String(left?.name || "").localeCompare(String(right?.name || ""), "tr");
      } else if (state.tableSort.key === "category") {
        comparison = String(left?.category?.name || left?.cuisine || "").localeCompare(
          String(right?.category?.name || right?.cuisine || ""),
          "tr",
        );
      } else if (state.tableSort.key === "location") {
        comparison = String([left?.district, left?.neighborhood].filter(Boolean).join(" / ") || "").localeCompare(
          String([right?.district, right?.neighborhood].filter(Boolean).join(" / ") || ""),
          "tr",
        );
      } else if (state.tableSort.key === "rating") {
        comparison = (Number(left?.rating) || -1) - (Number(right?.rating) || -1);
      }

      if (comparison !== 0) {
        return comparison * multiplier;
      }

      return String(left?.name || "").localeCompare(String(right?.name || ""), "tr");
    });

    return nextItems;
  }

  function resetListPage() {
    state.pagination = {
      page: 1,
      limit: state.pagination?.limit || 50,
      total: state.pagination?.total || 0,
      totalPages: state.pagination?.totalPages || 1,
    };
  }

  function getQueryAddressValue() {
    return [
      fields.address.value.trim(),
      fields.neighborhood.value.trim(),
      fields.district.value.trim(),
      fields.city.value.trim(),
    ]
      .filter(Boolean)
      .join(", ");
  }

  function buildMapsQuickLink() {
    const rawMapsUrl = fields.mapsUrl.value.trim();
    if (rawMapsUrl) {
      return rawMapsUrl;
    }

    const latitude = fields.latitude.value.trim();
    const longitude = fields.longitude.value.trim();
    if (latitude && longitude) {
      return `https://www.google.com/maps?q=${encodeURIComponent(`${latitude},${longitude}`)}`;
    }

    const queryAddress = getQueryAddressValue();
    if (queryAddress) {
      return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(queryAddress)}`;
    }

    return "";
  }

  function buildMapsUrlValueFromFields() {
    const latitude = fields.latitude.value.trim();
    const longitude = fields.longitude.value.trim();
    if (latitude && longitude) {
      return `https://www.google.com/maps?q=${encodeURIComponent(`${latitude},${longitude}`)}`;
    }

    const queryAddress = getQueryAddressValue();
    if (queryAddress) {
      return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(queryAddress)}`;
    }

    return "";
  }

  function buildDetailQuickLink() {
    const slug = fields.slug.value.trim();
    if (!slug) {
      return "";
    }

    return `venue-detail.html?slug=${encodeURIComponent(slug)}`;
  }

  function syncMapsQuickLink() {
    const href = buildMapsQuickLink();
    if (!href) {
      mapsQuickLink.href = "#";
      mapsQuickLink.setAttribute("aria-disabled", "true");
      mapsQuickLink.classList.add("is-disabled");
      mapsQuickLink.tabIndex = -1;
      return;
    }

    mapsQuickLink.href = href;
    mapsQuickLink.removeAttribute("aria-disabled");
    mapsQuickLink.classList.remove("is-disabled");
    mapsQuickLink.removeAttribute("tabindex");
  }

  function syncDetailQuickLink() {
    if (!(detailQuickLink instanceof HTMLAnchorElement)) {
      return;
    }

    const href = buildDetailQuickLink();
    if (!href) {
      detailQuickLink.href = "#";
      detailQuickLink.setAttribute("aria-disabled", "true");
      detailQuickLink.classList.add("is-disabled");
      detailQuickLink.tabIndex = -1;
      if (openDetailButton instanceof HTMLButtonElement) {
        openDetailButton.disabled = true;
      }
      return;
    }

    detailQuickLink.href = href;
    detailQuickLink.removeAttribute("aria-disabled");
    detailQuickLink.classList.remove("is-disabled");
    detailQuickLink.removeAttribute("tabindex");
    if (openDetailButton instanceof HTMLButtonElement) {
      openDetailButton.disabled = false;
    }
  }

  function focusManualPhotoEditor() {
    window.setTimeout(() => {
      const firstPhotoUrlInput = photoList.querySelector(".admin-photo-url");
      if (firstPhotoUrlInput instanceof HTMLInputElement) {
        firstPhotoUrlInput.focus();
        firstPhotoUrlInput.scrollIntoView({ behavior: "smooth", block: "center" });
        return;
      }

      if (fields.photoUri instanceof HTMLInputElement) {
        fields.photoUri.focus();
        fields.photoUri.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }, 0);
  }

  function updateMainPhotoPreview() {
    if (!(mainPhotoPreviewWrap instanceof HTMLElement) || !(mainPhotoPreviewNode instanceof HTMLImageElement)) {
      return;
    }

    const photoUrl = fields.photoUri.value.trim();
    mainPhotoPreviewNode.src = photoUrl || "";
    mainPhotoPreviewNode.hidden = !photoUrl;
    mainPhotoPreviewWrap.hidden = !photoUrl;
  }

  function hideBrokenMainPhotoPreview() {
    if (!(mainPhotoPreviewWrap instanceof HTMLElement) || !(mainPhotoPreviewNode instanceof HTMLImageElement)) {
      return;
    }

    if (!fields.photoUri.value.trim()) {
      return;
    }

    mainPhotoPreviewNode.hidden = true;
  }

  function isDirectImageUrl(value) {
    const safeValue = String(value || "").trim().toLowerCase();
    return Boolean(safeValue && /\.(jpg|jpeg|png|webp|gif|avif)(?:$|\?)/.test(safeValue));
  }

  function isGoogleMapsUrl(value) {
    const safeValue = String(value || "").trim().toLowerCase();
    return safeValue.includes("google.com/maps") || safeValue.includes("maps.google.com");
  }

  function toPhotoDraft(photo = {}, index = 0) {
    const width = Number(photo.width);
    const height = Number(photo.height);

    return {
      photoUrl: typeof photo.photoUrl === "string" ? photo.photoUrl : "",
      source: typeof photo.source === "string" ? photo.source : "",
      sourcePhotoRef: typeof photo.sourcePhotoRef === "string" ? photo.sourcePhotoRef : "",
      width: Number.isFinite(width) && width > 0 ? width : null,
      height: Number.isFinite(height) && height > 0 ? height : null,
      sortOrder: Number.isFinite(Number(photo.sortOrder)) ? Number(photo.sortOrder) : index,
      isPrimary: Boolean(photo.isPrimary),
    };
  }

  function ensureMainPhotoDraft() {
    const photoUrl = fields.photoUri.value.trim();
    if (!photoUrl || state.photos.length > 0) {
      return false;
    }

    state.photos.push(
      toPhotoDraft(
        {
          photoUrl,
          source: "admin",
          sortOrder: 0,
          isPrimary: true,
        },
        0,
      ),
    );
    return true;
  }

  function setSelectedVenueId(venueId) {
    state.selectedVenueId = Number.isFinite(Number(venueId)) ? Number(venueId) : null;
    renderVenueList();
    deleteButton.hidden = state.selectedVenueId === null;
    syncPermanentClosureAction();
    syncGoogleSyncAction();
  }

  function normalizeSignalText(value) {
    return String(value || "")
      .trim()
      .toLocaleLowerCase("tr")
      .replaceAll("ı", "i")
      .replaceAll("ğ", "g")
      .replaceAll("ü", "u")
      .replaceAll("ş", "s")
      .replaceAll("ö", "o")
      .replaceAll("ç", "c")
      .replace(/[^a-z0-9]/g, "");
  }

  function hasPermanentClosureSignal() {
    const normalizedStatus = normalizeSignalText(fields.openingStatusText.value);
    if (!normalizedStatus) {
      return false;
    }

    return [
      "kaliciolarakkapali",
      "isletmekaliciolarakkapali",
      "closedpermanently",
      "permanentlyclosed",
      "permanentlyshut",
    ].some((token) => normalizedStatus.includes(token));
  }

  function syncPermanentClosureAction() {
    if (!(permanentCloseButton instanceof HTMLButtonElement)) {
      return;
    }

    const shouldShow = Number.isFinite(state.selectedVenueId) && hasPermanentClosureSignal() && fields.isActive.value === "true";
    permanentCloseButton.hidden = !shouldShow;
  }

  function syncGoogleSyncAction() {
    if (!(syncGoogleButton instanceof HTMLButtonElement)) {
      return;
    }

    const shouldShow = Number.isFinite(state.selectedVenueId) && fields.name.value.trim().length >= 2;
    syncGoogleButton.hidden = !shouldShow;
    syncGoogleButton.disabled = !shouldShow;
  }

  function populateCategorySelect() {
    categorySelect.innerHTML = '<option value="">Kategori seç</option>';
    categoryFilterSelect.innerHTML = '<option value="">Tüm kategoriler</option>';
    state.categories.forEach((item) => {
      const option = document.createElement("option");
      option.value = String(item.id);
      option.textContent = item.name;
      categorySelect.appendChild(option);

      const filterOption = document.createElement("option");
      filterOption.value = String(item.id);
      filterOption.textContent = item.name;
      categoryFilterSelect.appendChild(filterOption);
    });
  }

  function renderTagList() {
    tagList.innerHTML = "";
    state.tags.forEach((tag) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "istanbul-tag-button";
      button.textContent = tag.label;
      if (state.selectedTagKeys.has(tag.key)) {
        button.classList.add("is-active");
      }
      button.addEventListener("click", () => {
        if (state.selectedTagKeys.has(tag.key)) {
          state.selectedTagKeys.delete(tag.key);
        } else {
          state.selectedTagKeys.add(tag.key);
        }
        tagList.classList.remove("is-invalid");
        tagList.removeAttribute("aria-invalid");
        renderTagList();
      });
      tagList.appendChild(button);
    });
  }

  function renderPhotoList() {
    photoList.innerHTML = "";

    if (!state.photos.length) {
      const emptyState = document.createElement("div");
      emptyState.className = "istanbul-results-state";
      emptyState.textContent = "Henüz ek foto yok.";
      photoList.appendChild(emptyState);
      return;
    }

    state.photos.forEach((photo, index) => {
      const fragment = photoTemplate.content.cloneNode(true);
      const root = fragment.querySelector(".admin-photo-item");
      const urlInput = fragment.querySelector(".admin-photo-url");
      const sourceInput = fragment.querySelector(".admin-photo-source");
      const sourceRefInput = fragment.querySelector(".admin-photo-source-ref");
      const widthInput = fragment.querySelector(".admin-photo-width");
      const heightInput = fragment.querySelector(".admin-photo-height");
      const sortOrderInput = fragment.querySelector(".admin-photo-sort-order");
      const primaryInput = fragment.querySelector(".admin-photo-primary");
      const removeButton = fragment.querySelector(".admin-photo-remove-button");
      const previewNode = fragment.querySelector(".admin-photo-preview");
      const previewWrap = fragment.querySelector(".admin-photo-preview-wrap");

      root.dataset.index = String(index);
      urlInput.value = photo.photoUrl || "";
      sourceInput.value = photo.source || "";
      sourceRefInput.value = photo.sourcePhotoRef || "";
      widthInput.value = photo.width ?? "";
      heightInput.value = photo.height ?? "";
      sortOrderInput.value = photo.sortOrder ?? index;
      primaryInput.checked = Boolean(photo.isPrimary);
      previewNode.src = photo.photoUrl || "";
      previewNode.hidden = !photo.photoUrl;
      previewWrap.hidden = !photo.photoUrl;

      const syncPreviewDimensions = () => {
        if (!urlInput.value.trim()) {
          return;
        }
        if (!widthInput.value && Number.isFinite(previewNode.naturalWidth) && previewNode.naturalWidth > 0) {
          widthInput.value = String(previewNode.naturalWidth);
        }
        if (!heightInput.value && Number.isFinite(previewNode.naturalHeight) && previewNode.naturalHeight > 0) {
          heightInput.value = String(previewNode.naturalHeight);
        }
      };

      previewNode.addEventListener("load", syncPreviewDimensions);
      previewNode.addEventListener("error", () => {
        previewNode.hidden = true;
      });

      removeButton.addEventListener("click", () => {
        state.photos.splice(index, 1);
        if (state.photos.length > 0 && !state.photos.some((item) => item.isPrimary)) {
          state.photos[0].isPrimary = true;
        }
        renderPhotoList();
      });

      primaryInput.addEventListener("change", () => {
        state.photos = state.photos.map((item, itemIndex) => ({
          ...item,
          isPrimary: itemIndex === index,
        }));
        renderPhotoList();
      });

      urlInput.addEventListener("input", () => {
        previewNode.src = urlInput.value.trim();
        const shouldShow = Boolean(urlInput.value.trim());
        previewNode.hidden = !shouldShow;
        previewWrap.hidden = !shouldShow;
      });

      if (previewNode.complete && previewNode.naturalWidth > 0) {
        syncPreviewDimensions();
      }

      photoList.appendChild(fragment);
    });
  }

  function syncPhotosFromInputs() {
    const nextPhotos = Array.from(photoList.querySelectorAll(".admin-photo-item")).map((node, index) => ({
      photoUrl: node.querySelector(".admin-photo-url")?.value.trim() || "",
      source: node.querySelector(".admin-photo-source")?.value.trim() || "",
      sourcePhotoRef: node.querySelector(".admin-photo-source-ref")?.value.trim() || "",
      width: normalizeNumber(node.querySelector(".admin-photo-width")?.value),
      height: normalizeNumber(node.querySelector(".admin-photo-height")?.value),
      sortOrder: normalizeNumber(node.querySelector(".admin-photo-sort-order")?.value),
      isPrimary: Boolean(node.querySelector(".admin-photo-primary")?.checked),
      index,
    }));

    state.photos = nextPhotos
      .filter((photo) => photo.photoUrl)
      .map((photo) => ({
        photoUrl: photo.photoUrl,
        source: photo.source || null,
        sourcePhotoRef: photo.sourcePhotoRef || null,
        width: photo.width,
        height: photo.height,
        sortOrder: photo.sortOrder === null ? photo.index : photo.sortOrder,
        isPrimary: photo.isPrimary,
      }));

    if (state.photos.length > 0 && !state.photos.some((photo) => photo.isPrimary)) {
      state.photos[0].isPrimary = true;
    }
  }

  function ensureManualPhotoDraft() {
    syncPhotosFromInputs();

    if (ensureMainPhotoDraft()) {
      renderPhotoList();
      focusManualPhotoEditor();
      return;
    }

    if (state.photos.length > 0) {
      focusManualPhotoEditor();
      return;
    }

    state.photos.push(
      toPhotoDraft(
        {
          source: "admin",
          sortOrder: 0,
          isPrimary: true,
        },
        0,
      ),
    );
    renderPhotoList();
    focusManualPhotoEditor();
  }

  function resetForm() {
    form.reset();
    fields.city.value = DEFAULT_ADMIN_CITY;
    fields.temporarilyClosed.value = "false";
    fields.isActive.value = "true";
    fields.isIstanbulMvp.value = "true";
    fields.isOpenNow.value = "";
    state.selectedTagKeys = new Set();
    state.photos = [];
    state.selectedVenueSource = "";
    setSelectedVenueId(null);
    formTitleNode.textContent = "Yeni mekan";
    renderTagList();
    renderPhotoList();
    syncMapsQuickLink();
    syncDetailQuickLink();
    updateMainPhotoPreview();
    syncPermanentClosureAction();
    clearFieldErrors();
    setFormMessage("", false);
    fields.name.focus();
  }

  function fillForm(item) {
    fields.name.value = item.name || "";
    fields.slug.value = item.slug || "";
    fields.city.value = item.city || DEFAULT_ADMIN_CITY;
    fields.district.value = item.district || "";
    fields.neighborhood.value = item.neighborhood || "";
    fields.categoryId.value = item.category?.id ? String(item.category.id) : "";
    fields.cuisine.value = item.cuisine || "";
    fields.budget.value = item.budget || "";
    fields.rating.value = item.rating ?? "";
    fields.userRatingCount.value = item.userRatingCount ?? "";
    fields.latitude.value = item.latitude ?? "";
    fields.longitude.value = item.longitude ?? "";
    fields.address.value = item.address || "";
    fields.phone.value = item.phone || "";
    fields.website.value = item.website || "";
    fields.menuUrl.value = item.menuUrl || "";
    fields.instagram.value = item.instagram || "";
    fields.mapsUrl.value = item.mapsUrl || "";
    fields.photoUri.value = item.photoUri || "";
    fields.isOpenNow.value = item.isOpenNow === null ? "" : String(Boolean(item.isOpenNow));
    fields.openingStatusText.value = item.openingStatusText || "";
    fields.temporarilyClosed.value = String(Boolean(item.temporarilyClosed));
    fields.isActive.value = String(Boolean(item.isActive));
    fields.isIstanbulMvp.value = String(Boolean(item.isIstanbulMvp));
    fields.editorialSummary.value = item.editorialSummary || "";
    state.selectedVenueSource = item.source || "";
    state.selectedTagKeys = new Set(Array.isArray(item.tagKeys) ? item.tagKeys : []);
    state.photos = Array.isArray(item.photos) ? item.photos.map((photo, index) => toPhotoDraft(photo, index)) : [];
    ensureMainPhotoDraft();
    setSelectedVenueId(item.id);
    formTitleNode.textContent = item.name || "Mekan";
    renderTagList();
    renderPhotoList();
    syncMapsQuickLink();
    syncDetailQuickLink();
    updateMainPhotoPreview();
    syncPermanentClosureAction();
    clearFieldErrors();
    setFormMessage("", false);
  }

  function renderPagination() {
    const totalPages = Number(state.pagination?.totalPages || 1);
    const page = Number(state.pagination?.page || 1);

    if (totalPages <= 1 || !state.items.length) {
      paginationNode.hidden = true;
      paginationCurrentNode.textContent = "1 / 1";
      prevPageButton.disabled = true;
      nextPageButton.disabled = true;
      return;
    }

    paginationNode.hidden = false;
    paginationCurrentNode.textContent = `${page} / ${totalPages}`;
    prevPageButton.disabled = page <= 1;
    nextPageButton.disabled = page >= totalPages;
  }

  function renderVenueList() {
    listNode.innerHTML = "";

    if (!state.items.length) {
      tableWrapNode.hidden = true;
      listStateNode.hidden = false;
      listStateNode.textContent = "Bu filtrelerle mekan bulunamadı.";
      renderPagination();
      return;
    }

    tableWrapNode.hidden = false;
    listStateNode.hidden = true;

    state.items.forEach((item) => {
      const row = document.createElement("tr");
      row.className = "admin-venue-row";
      row.tabIndex = 0;

      const titleCell = document.createElement("td");
      const title = document.createElement("strong");
      title.className = "admin-venue-list-item-title";
      title.textContent = item.name || "İsimsiz mekan";
      const meta = document.createElement("div");
      meta.className = "admin-venue-list-item-meta";
      meta.textContent = [item.budget, item.phone].filter(Boolean).join(" / ") || "Bilgi yok";
      titleCell.appendChild(title);
      titleCell.appendChild(meta);

      const categoryCell = document.createElement("td");
      categoryCell.textContent = item.category?.name || item.cuisine || "-";

      const locationCell = document.createElement("td");
      locationCell.textContent = [item.district, item.neighborhood].filter(Boolean).join(" / ") || item.city || "-";

      const ratingCell = document.createElement("td");
      ratingCell.textContent = item.rating ? `${String(item.rating).replace(".", ",")} / 5` : "Henüz yok";

      const statusCell = document.createElement("td");
      const badges = document.createElement("div");
      badges.className = "admin-venue-list-badges";
      [
        item.isActive ? { label: "Aktif", className: "is-active" } : { label: "Pasif", className: "is-passive" },
        item.isIstanbulMvp ? { label: "MVP", className: "is-mvp" } : null,
        item.hasResolvedPhoto ? { label: "Foto var", className: "is-open" } : null,
        !item.hasResolvedPhoto && item.hasPhotoReferences ? { label: "Foto eksik", className: "is-passive" } : null,
        item.temporarilyClosed ? { label: "Geçici kapalı", className: "is-closed" } : null,
        item.isOpenNow === true ? { label: "Açık", className: "is-open" } : null,
        item.isOpenNow === false ? { label: "Kapalı", className: "is-closed" } : null,
      ]
        .filter(Boolean)
        .forEach((badge) => {
          const badgeNode = document.createElement("span");
          badgeNode.className = `admin-venue-badge ${badge.className}`;
          badgeNode.textContent = badge.label;
          badges.appendChild(badgeNode);
        });
      statusCell.appendChild(badges);

      const actionCell = document.createElement("td");
      const actionWrap = document.createElement("div");
      actionWrap.className = "admin-table-action-group";
      const editButton = document.createElement("button");
      editButton.type = "button";
      editButton.className = "istanbul-filter-reset admin-table-action";
      editButton.textContent = "Düzenle";
      editButton.addEventListener("click", async (event) => {
        event.stopPropagation();
        await loadVenueDetail(item.id);
      });
      actionWrap.appendChild(editButton);

      const toggleButton = document.createElement("button");
      toggleButton.type = "button";
      toggleButton.className = "istanbul-filter-reset admin-table-action";
      toggleButton.textContent = item.isActive ? "Pasifleştir" : "Aktifleştir";
      toggleButton.addEventListener("click", async (event) => {
        event.stopPropagation();
        await toggleVenueActive(item);
      });
      actionWrap.appendChild(toggleButton);

      if (!item.hasResolvedPhoto) {
        const photoButton = document.createElement("button");
        photoButton.type = "button";
        photoButton.className = "istanbul-filter-reset admin-table-action";
        photoButton.textContent = "Foto ekle";
        photoButton.addEventListener("click", async (event) => {
          event.stopPropagation();
          await openManualPhotoEditor(item);
        });
        actionWrap.appendChild(photoButton);
      }
      actionCell.appendChild(actionWrap);

      if (Number(item.id) === state.selectedVenueId) {
        row.classList.add("is-active");
      }
      row.addEventListener("click", async () => {
        await loadVenueDetail(item.id);
      });
      row.addEventListener("keydown", async (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          await loadVenueDetail(item.id);
        }
      });

      row.appendChild(titleCell);
      row.appendChild(categoryCell);
      row.appendChild(locationCell);
      row.appendChild(ratingCell);
      row.appendChild(statusCell);
      row.appendChild(actionCell);
      listNode.appendChild(row);
    });

    updateTableSortButtons();
    renderPagination();
  }

  async function loadReferenceData() {
    const [{ response: categoryResponse, payload: categoryPayload }, { response: tagResponse, payload: tagPayload }] = await Promise.all([
      window.AramaBulAdminAuth.fetchJson("/api/admin/categories"),
      window.AramaBulAdminAuth.fetchJson("/api/admin/tags"),
    ]);

    if (!categoryResponse.ok || !tagResponse.ok) {
      throw new Error("Kategori veya tag verileri alınamadı.");
    }

    state.categories = Array.isArray(categoryPayload.items) ? categoryPayload.items : [];
    state.tags = Array.isArray(tagPayload.items) ? tagPayload.items : [];
    populateCategorySelect();
    renderTagList();
  }

  async function loadVenueList() {
    listStateNode.hidden = false;
    listStateNode.textContent = "Mekanlar getiriliyor.";
    tableWrapNode.hidden = true;

    const { response, payload } = await window.AramaBulAdminAuth.fetchJson(`/api/admin/venues?${buildListQuery()}`);

    if (!response.ok) {
      throw new Error("Mekan listesi alınamadı.");
    }

    state.items = sortAdminItems(Array.isArray(payload.items) ? payload.items : []);
    state.pagination = payload?.pagination || {
      page: 1,
      limit: state.pagination?.limit || 50,
      total: state.items.length,
      totalPages: 1,
    };
    renderVenueList();
  }

  async function loadVenueDetail(venueId) {
    const { response, payload } = await window.AramaBulAdminAuth.fetchJson(`/api/admin/venues/${encodeURIComponent(venueId)}`);

    if (!response.ok) {
      throw new Error("Mekan detayı alınamadı.");
    }

    fillForm(payload.item);
  }

  function buildPayload() {
    syncPhotosFromInputs();
    return {
      name: fields.name.value.trim(),
      slug: fields.slug.value.trim() || null,
      city: fields.city.value.trim(),
      district: fields.district.value.trim(),
      neighborhood: fields.neighborhood.value.trim() || null,
      categoryId: normalizeNumber(fields.categoryId.value),
      cuisine: fields.cuisine.value.trim() || null,
      budget: fields.budget.value || null,
      rating: normalizeNumber(fields.rating.value),
      userRatingCount: normalizeNumber(fields.userRatingCount.value),
      latitude: normalizeNumber(fields.latitude.value),
      longitude: normalizeNumber(fields.longitude.value),
      address: fields.address.value.trim() || null,
      phone: fields.phone.value.trim() || null,
      website: fields.website.value.trim() || null,
      menuUrl: fields.menuUrl.value.trim() || null,
      instagram: fields.instagram.value.trim() || null,
      mapsUrl: fields.mapsUrl.value.trim() || null,
      photoUri: fields.photoUri.value.trim() || null,
      isOpenNow: parseBooleanSelectValue(fields.isOpenNow.value),
      openingStatusText: fields.openingStatusText.value.trim() || null,
      temporarilyClosed: parseBooleanSelectValue(fields.temporarilyClosed.value, false),
      isActive: parseBooleanSelectValue(fields.isActive.value, true),
      isIstanbulMvp: parseBooleanSelectValue(fields.isIstanbulMvp.value, true),
      editorialSummary: fields.editorialSummary.value.trim() || null,
      tagKeys: Array.from(state.selectedTagKeys),
      photos: state.photos,
    };
  }

  async function saveVenue(event) {
    event.preventDefault();
    return submitVenueSave({ resetAfterSave: false });
  }

  async function submitVenueSave({ resetAfterSave = false } = {}) {
    setFormMessage("Kaydediliyor.", false);

    const isUpdate = Number.isFinite(state.selectedVenueId);
    const { response, payload } = await window.AramaBulAdminAuth.fetchJson(
      isUpdate ? `/api/admin/venues/${encodeURIComponent(state.selectedVenueId)}` : "/api/admin/venues",
      {
        method: isUpdate ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(buildPayload()),
      },
    );

    if (!response.ok) {
      const message = payload?.error?.message || "Kaydetme işlemi başarısız oldu.";
      const details = Array.isArray(payload?.error?.details) ? payload.error.details : [];
      applyFieldErrors(details);
      const error = new Error(message);
      error.details = details;
      throw error;
    }

    clearFieldErrors();
    setFormMessage("Mekan kaydedildi.", false);
    await loadVenueList();
    if (resetAfterSave) {
      resetForm();
      setFormMessage("Mekan kaydedildi. Yeni kayıt açıldı.", false);
      return;
    }

    if (payload?.item?.id) {
      await loadVenueDetail(payload.item.id);
    }
  }

  async function deleteVenue() {
    if (!Number.isFinite(state.selectedVenueId)) {
      return;
    }

    const venueName = fields.name.value.trim() || "Bu mekan";
    if (!window.confirm(`${venueName} kaydını silmek istediğine emin misin? Bu işlem geri alınamaz.`)) {
      return;
    }

    setFormMessage("Mekan siliniyor.", false);
    const { response, payload } = await window.AramaBulAdminAuth.fetchJson(`/api/admin/venues/${encodeURIComponent(state.selectedVenueId)}`, {
      method: "DELETE",
    });
    if (!response.ok) {
      throw new Error(payload?.error?.message || "Silme işlemi başarısız oldu.");
    }

    resetForm();
    await loadVenueList();
    setFormMessage("Mekan silindi.", false);
  }

  async function toggleVenueActive(item) {
    const nextIsActive = !Boolean(item?.isActive);
    setFormMessage(nextIsActive ? "Mekan aktifleştiriliyor." : "Mekan pasifleştiriliyor.", false);

    const { response, payload } = await window.AramaBulAdminAuth.fetchJson(
      `/api/admin/venues/${encodeURIComponent(item.id)}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          isActive: nextIsActive,
        }),
      },
    );

    if (!response.ok) {
      throw new Error(payload?.error?.message || "Durum güncellenemedi.");
    }

    await loadVenueList();
    if (Number(state.selectedVenueId) === Number(item.id)) {
      await loadVenueDetail(item.id);
    }
    setFormMessage(nextIsActive ? "Mekan aktifleştirildi." : "Mekan pasifleştirildi.", false);
  }

  async function markVenuePermanentlyClosedInactive() {
    if (!Number.isFinite(state.selectedVenueId)) {
      return;
    }

    const venueName = fields.name.value.trim() || "Bu mekan";
    if (!window.confirm(`${venueName} kaydını pasife almak istiyor musun? Bu kayıt public tarafta görünmez.`)) {
      return;
    }

    setFormMessage("Kalıcı kapalı kayıt pasife alınıyor.", false);
    const { response, payload } = await window.AramaBulAdminAuth.fetchJson(
      `/api/admin/venues/${encodeURIComponent(state.selectedVenueId)}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          isActive: false,
          temporarilyClosed: false,
          isOpenNow: false,
        }),
      },
    );

    if (!response.ok) {
      throw new Error(payload?.error?.message || "Kayıt pasife alınamadı.");
    }

    await loadVenueList();
    await loadVenueDetail(state.selectedVenueId);
    setFormMessage("Kayıt pasife alındı.", false);
  }

  async function syncVenueFromGoogle() {
    if (!Number.isFinite(state.selectedVenueId)) {
      return;
    }

    if (!(syncGoogleButton instanceof HTMLButtonElement)) {
      return;
    }

    syncGoogleButton.disabled = true;
    setFormMessage("Google puan ve yorumları çekiliyor.", false);

    try {
      const { response, payload } = await window.AramaBulAdminAuth.fetchJson(
        `/api/admin/venues/${encodeURIComponent(state.selectedVenueId)}/sync-google`,
        {
          method: "POST",
        },
      );

      if (!response.ok) {
        const details = Array.isArray(payload?.error?.details) ? payload.error.details : [];
        const error = new Error(payload?.error?.message || "Google verisi alınamadı.");
        error.details = details;
        throw error;
      }

      await loadVenueList();
      await loadVenueDetail(state.selectedVenueId);
      const matchName = String(payload?.match?.name || "").trim() || fields.name.value.trim();
      const rating = payload?.item?.rating ?? payload?.match?.rating;
      const userRatingCount = payload?.item?.userRatingCount ?? payload?.match?.userRatingCount;
      const ratingText = Number.isFinite(Number(rating)) ? String(Number(rating)).replace(".", ",") : "puan yok";
      const reviewCountText = Number.isFinite(Number(userRatingCount)) ? String(Number(userRatingCount)) : "0";
      setFormMessage(`${matchName} icin Google puanı çekildi: ${ratingText} / 5, ${reviewCountText} yorum.`, false);
    } finally {
      syncGoogleSyncAction();
    }
  }

  async function openManualPhotoEditor(item) {
    await loadVenueDetail(item.id);
    ensureManualPhotoDraft();
    const helpText = item.hasPhotoReferences
      ? "Bu kayıtta foto referansı var ama gerçek foto URL'si eksik. Manuel foto bağlantısı ekleyebilirsin."
      : "Bu kayıtta henüz foto yok. Manuel foto bağlantısı ekleyebilirsin.";
    setFormMessage(helpText, false);
  }

  async function uploadPhotoFile(file) {
    if (!(file instanceof File)) {
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    setFormMessage("Foto yükleniyor.", false);

    const response = await fetch("/api/admin/venue-images", {
      method: "POST",
      credentials: "include",
      headers: {
        Accept: "application/json",
      },
      body: formData,
    });

    const payload = await response.json().catch(() => null);
    if (response.status === 401) {
      window.AramaBulAdminAuth.redirectToLogin();
      throw new Error(payload?.error?.message || "Yönetici oturumu gerekli.");
    }

    if (!response.ok) {
      throw new Error(payload?.error?.message || "Foto yükleme başarısız oldu.");
    }

    const uploadedUrl = String(payload?.item?.url || "").trim();
    if (!uploadedUrl) {
      throw new Error("Yüklenen foto için URL üretilemedi.");
    }

    syncPhotosFromInputs();
    const nextIndex = state.photos.length;
    state.photos.push(
      toPhotoDraft(
        {
          photoUrl: uploadedUrl,
          source: "admin_upload",
          sortOrder: nextIndex,
          isPrimary: nextIndex === 0,
        },
        nextIndex,
      ),
    );

    if (!fields.photoUri.value.trim()) {
      fields.photoUri.value = uploadedUrl;
      updateMainPhotoPreview();
    }

    renderPhotoList();
    focusManualPhotoEditor();
    setFormMessage("Foto yüklendi.", false);
  }

  async function findPreviewImage() {
    const photoUriValue = fields.photoUri.value.trim();
    const pageUrl = fields.website.value.trim()
      || (photoUriValue && !isDirectImageUrl(photoUriValue) && !isGoogleMapsUrl(photoUriValue) ? photoUriValue : "");
    setFormMessage("Gorsel aranıyor.", false);

    const params = new URLSearchParams();
    if (pageUrl) {
      params.set("website", pageUrl);
    }
    if (!params.get("website") && fields.mapsUrl.value.trim()) {
      params.set("mapsUrl", fields.mapsUrl.value.trim());
    }
    if (fields.name.value.trim()) {
      params.set("name", fields.name.value.trim());
    }
    if (fields.district.value.trim()) {
      params.set("district", fields.district.value.trim());
    }
    if (fields.city.value.trim()) {
      params.set("city", fields.city.value.trim());
    }
    params.set("preferVenuePhoto", "true");

    const query = params.toString();
    if (!query) {
      throw new Error("Gorsel aramak için sayfa veya website linki gerekli.");
    }

    const { response, payload } = await window.AramaBulAdminAuth.fetchJson(`/api/places/preview-image?${query}`);
    if (!response.ok) {
      throw new Error(payload?.error?.message || "Gorsel bulunamadı.");
    }

    const imageUrl = String(payload?.imageUrl || "").trim();
    if (!imageUrl) {
      throw new Error(payload?.reason || "Bu sayfada kullanilabilir bir gorsel bulunamadı.");
    }

    fields.photoUri.value = imageUrl;
    updateMainPhotoPreview();
    syncPhotosFromInputs();
    if (!state.photos.length) {
      ensureMainPhotoDraft();
      renderPhotoList();
    }
    setFormMessage("Gorsel bulundu ve ana foto alanına eklendi.", false);
  }

  function bindEvents() {
    searchButton.addEventListener("click", () => {
      resetListPage();
      loadVenueList().catch((error) => {
        listStateNode.hidden = false;
        listStateNode.textContent = error instanceof Error ? error.message : "Liste alınamadı.";
      });
    });

    categoryFilterSelect.addEventListener("change", () => {
      resetListPage();
      loadVenueList().catch((error) => {
        listStateNode.hidden = false;
        listStateNode.textContent = error instanceof Error ? error.message : "Liste alınamadı.";
      });
    });

    activeFilterSelect.addEventListener("change", () => {
      resetListPage();
      loadVenueList().catch((error) => {
        listStateNode.hidden = false;
        listStateNode.textContent = error instanceof Error ? error.message : "Liste alınamadı.";
      });
    });

    photoFilterSelect.addEventListener("change", () => {
      resetListPage();
      loadVenueList().catch((error) => {
        listStateNode.hidden = false;
        listStateNode.textContent = error instanceof Error ? error.message : "Liste alınamadı.";
      });
    });

    sortFilterSelect.addEventListener("change", () => {
      resetListPage();
      loadVenueList().catch((error) => {
        listStateNode.hidden = false;
        listStateNode.textContent = error instanceof Error ? error.message : "Liste alınamadı.";
      });
    });

    sortButtons.forEach((button) => {
      button.addEventListener("click", () => {
        const nextKey = button.dataset.sortKey || "rating";
        if (state.tableSort.key === nextKey) {
          state.tableSort.direction =
            state.tableSort.direction === "desc"
              ? "asc"
              : state.tableSort.direction === "asc"
                ? "none"
                : "desc";
          if (state.tableSort.direction === "none") {
            state.tableSort.key = "";
          }
        } else {
          state.tableSort.key = nextKey;
          state.tableSort.direction = nextKey === "rating" ? "desc" : "asc";
        }
        state.items = sortAdminItems(state.items);
        renderVenueList();
      });
    });

    districtInput.addEventListener("keydown", (event) => {
      if (event.key !== "Enter") {
        return;
      }
      event.preventDefault();
      resetListPage();
      loadVenueList().catch((error) => {
        listStateNode.hidden = false;
        listStateNode.textContent = error instanceof Error ? error.message : "Liste alınamadı.";
      });
    });

    searchInput.addEventListener("keydown", (event) => {
      if (event.key !== "Enter") {
        return;
      }
      event.preventDefault();
      resetListPage();
      loadVenueList().catch((error) => {
        listStateNode.hidden = false;
        listStateNode.textContent = error instanceof Error ? error.message : "Liste alınamadı.";
      });
    });

    prevPageButton.addEventListener("click", () => {
      const currentPage = Number(state.pagination?.page || 1);
      if (currentPage <= 1) {
        return;
      }
      state.pagination = {
        ...(state.pagination || {}),
        page: currentPage - 1,
      };
      loadVenueList().catch((error) => {
        listStateNode.hidden = false;
        listStateNode.textContent = error instanceof Error ? error.message : "Liste alınamadı.";
      });
    });

    nextPageButton.addEventListener("click", () => {
      const currentPage = Number(state.pagination?.page || 1);
      const totalPages = Number(state.pagination?.totalPages || 1);
      if (currentPage >= totalPages) {
        return;
      }
      state.pagination = {
        ...(state.pagination || {}),
        page: currentPage + 1,
      };
      loadVenueList().catch((error) => {
        listStateNode.hidden = false;
        listStateNode.textContent = error instanceof Error ? error.message : "Liste alınamadı.";
      });
    });

    [fields.mapsUrl, fields.latitude, fields.longitude, fields.address, fields.neighborhood, fields.district, fields.city, fields.slug].forEach(
      (inputNode) => {
        inputNode.addEventListener("input", () => {
          if (inputNode instanceof HTMLElement) {
            inputNode.classList.remove("is-invalid");
            inputNode.removeAttribute("aria-invalid");
          }
          syncMapsQuickLink();
          syncDetailQuickLink();
        });
      },
    );

    Object.values(fields).forEach((inputNode) => {
      inputNode.addEventListener("input", () => {
        inputNode.classList.remove("is-invalid");
        inputNode.removeAttribute("aria-invalid");
      });
      inputNode.addEventListener("change", () => {
        inputNode.classList.remove("is-invalid");
        inputNode.removeAttribute("aria-invalid");
      });
    });

    fields.openingStatusText.addEventListener("input", syncPermanentClosureAction);
    fields.openingStatusText.addEventListener("change", syncPermanentClosureAction);
    fields.isActive.addEventListener("change", syncPermanentClosureAction);

    fields.photoUri.addEventListener("input", updateMainPhotoPreview);
    fields.photoUri.addEventListener("change", updateMainPhotoPreview);
    if (mainPhotoPreviewNode instanceof HTMLImageElement) {
      mainPhotoPreviewNode.addEventListener("error", hideBrokenMainPhotoPreview);
    }

    generateMapsButton.addEventListener("click", () => {
      const generatedUrl = buildMapsUrlValueFromFields();
      if (!generatedUrl) {
        setFormMessage("Harita linki üretmek için adres veya koordinat gerekli.", true);
        syncMapsQuickLink();
        return;
      }

      fields.mapsUrl.value = generatedUrl;
      syncMapsQuickLink();
      setFormMessage("Harita linki otomatik üretildi.", false);
    });
    if (openDetailButton instanceof HTMLButtonElement) {
      openDetailButton.addEventListener("click", () => {
        const href = buildDetailQuickLink();
        if (!href) {
          setFormMessage("Detail sayfasını açmak için önce geçerli bir slug gerekli.", true);
          syncDetailQuickLink();
          return;
        }
        window.open(href, "_blank", "noopener,noreferrer");
      });
    }

    newButton.addEventListener("click", resetForm);
    saveAndNewButton.addEventListener("click", () => {
      submitVenueSave({ resetAfterSave: true }).catch((error) => {
        const details = Array.isArray(error?.details) ? error.details : [];
        setFormMessage(error instanceof Error ? error.message : "Kaydetme işlemi başarısız oldu.", true, details);
      });
    });
    addPhotoButton.addEventListener("click", () => {
      photoList.classList.remove("is-invalid");
      photoList.removeAttribute("aria-invalid");
      syncPhotosFromInputs();
      ensureMainPhotoDraft();
      state.photos.push(
        toPhotoDraft(
          {
            source: "admin",
            sortOrder: state.photos.length,
            isPrimary: state.photos.length === 0,
          },
          state.photos.length,
        ),
      );
      renderPhotoList();
    });
    if (uploadPhotoButton instanceof HTMLButtonElement && uploadPhotoInput instanceof HTMLInputElement) {
      uploadPhotoButton.addEventListener("click", () => {
        uploadPhotoInput.click();
      });
      uploadPhotoInput.addEventListener("change", () => {
        const selectedFile = uploadPhotoInput.files?.[0];
        uploadPhotoInput.value = "";
        uploadPhotoFile(selectedFile).catch((error) => {
          setFormMessage(error instanceof Error ? error.message : "Foto yükleme başarısız oldu.", true);
        });
      });
    }
    if (findPhotoButton instanceof HTMLButtonElement) {
      findPhotoButton.addEventListener("click", () => {
        findPreviewImage().catch((error) => {
          setFormMessage(error instanceof Error ? error.message : "Gorsel bulunamadı.", true);
        });
      });
    }
    if (permanentCloseButton instanceof HTMLButtonElement) {
      permanentCloseButton.addEventListener("click", () => {
        markVenuePermanentlyClosedInactive().catch((error) => {
          setFormMessage(error instanceof Error ? error.message : "Kayıt pasife alınamadı.", true);
        });
      });
    }
    if (syncGoogleButton instanceof HTMLButtonElement) {
      syncGoogleButton.addEventListener("click", () => {
        syncVenueFromGoogle().catch((error) => {
          const details = Array.isArray(error?.details) ? error.details : [];
          setFormMessage(error instanceof Error ? error.message : "Google verisi alınamadı.", true, details);
          syncGoogleSyncAction();
        });
      });
    }
    deleteButton.addEventListener("click", () => {
      deleteVenue().catch((error) => {
        setFormMessage(error instanceof Error ? error.message : "Silme işlemi başarısız oldu.", true);
      });
    });

    form.addEventListener("submit", (event) => {
      saveVenue(event).catch((error) => {
        const details = Array.isArray(error?.details) ? error.details : [];
        setFormMessage(error instanceof Error ? error.message : "Kaydetme işlemi başarısız oldu.", true, details);
      });
    });
  }

  async function main() {
    const session = await window.AramaBulAdminAuth.ensureSession();
    if (!session) {
      return;
    }

    window.AramaBulAdminAuth.bindSessionUi(session);
    resetListPage();
    resetForm();
    await loadReferenceData();
    bindEvents();
    await loadVenueList();
  }

  main().catch((error) => {
    listStateNode.hidden = false;
    listStateNode.textContent = error instanceof Error ? error.message : "Admin ekranı başlatılamadı.";
  });
})();
