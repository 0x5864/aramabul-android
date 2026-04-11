"use strict";

(function initIstanbulDiscoveryPage() {
  const resultsGrid = document.getElementById("resultsGrid");
  if (!resultsGrid) {
    return;
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
    localFavoritesKey: "istanbulKesfetFavorites",
    selectedDistrict: "",
    selectedNeighborhood: "",
    selectedCategory: "",
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
  };

  const LOCAL_DATA_SOURCES = [
    { label: "Kafeler", file: "data/keyif-kafe.json", category: "Kafe" },
    { label: "Restoranlar", file: "data/keyif-restoran.json", category: "Restoran" },
    { label: "Kahvaltı Mekanları", file: "data/keyif-kahvalti.json", category: "Kahvaltı" },
    { label: "Kebapçılar", file: "data/keyif-kebap.json", category: "Kebap" },
    { label: "Pide ve Lahmacun", file: "data/keyif-pide.json", category: "Pide & Lahmacun" },
    { label: "Dönerciler", file: "data/keyif-doner.json", category: "Döner" },
    { label: "Çiğ Köfteciler", file: "data/keyif-cigkofte.json", category: "Çiğ Köfte" },
    { label: "Meyhaneler", file: "data/keyif-meyhane.json", category: "Meyhane" },
    { label: "Lokantalar", file: "data/keyif-lokantalar.json", category: "Lokanta" },
    { label: "Pub & Bar", file: "data/keyif-pub-bar.json", category: "Pub & Bar" },
    { label: "Michelin Guide", file: "data/keyif-michelin-guide.json", category: "Michelin Guide" },
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

    const count = Number(reviewCount);
    if (Number.isFinite(count) && count > 0) {
      return `★ ${String(rating).replace(".", ",")} (${new Intl.NumberFormat("tr-TR").format(count)} yorum)`;
    }

    return `★ ${String(rating).replace(".", ",")}`;
  }

  function formatBudgetLabel(value) {
    const normalized = normalizeText(value);
    if (!normalized) {
      return "";
    }
    if (normalized === "budget") {
      return "Uygun";
    }
    if (normalized === "mid") {
      return "Makul";
    }
    if (normalized === "high") {
      return "Yüksek";
    }
    return String(value);
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

      const response = await fetch(`/api/mvp/istanbul/venues?${params.toString()}`, {
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
    if (!userLocation || !Number.isFinite(Number(item.latitude)) || !Number.isFinite(Number(item.longitude))) {
      return null;
    }
    const toRad = (value) => (Number(value) * Math.PI) / 180;
    const lat1 = toRad(userLocation.lat);
    const lon1 = toRad(userLocation.lng);
    const lat2 = toRad(item.latitude);
    const lon2 = toRad(item.longitude);
    const dLat = lat2 - lat1;
    const dLon = lon2 - lon1;
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return 6371000 * c;
  }

  function getCategoryImage(category) {
    const normalized = normalizeText(category);
    if (normalized.includes("kafe") || normalized.includes("cafe")) {
      return "assets/kafe.png";
    }
    return "assets/yemek.png";
  }

  function readVenueSlugFromUrl() {
    const params = new URLSearchParams(window.location.search);
    return params.get("venue") || "";
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
  const districtSelect = document.getElementById("districtSelect");
  const neighborhoodSelect = document.getElementById("neighborhoodSelect");
  const categorySelect = document.getElementById("categorySelect");
  const budgetSelect = document.getElementById("budgetSelect");
  const tagRow = document.getElementById("tagRow");
  const resetFiltersButton = document.getElementById("resetFiltersButton");
  const nearbyButton = document.getElementById("nearbyButton");
  const locationMessage = document.getElementById("locationMessage");
  const resultsModeLabel = document.getElementById("resultsModeLabel");
  const resultsTitle = document.getElementById("resultsTitle");
  const resultsMeta = document.getElementById("resultsMeta");
  const resultsState = document.getElementById("resultsState");
  const resultsLayout = document.getElementById("resultsLayout");
  const pagination = document.getElementById("pagination");
  const activeFilterPills = document.getElementById("activeFilterPills");
  const template = document.getElementById("istanbulVenueCardTemplate");
  const mapPanelTitle = document.getElementById("mapPanelTitle");
  const mapPanelMeta = document.getElementById("mapPanelMeta");
  const mapPanelTags = document.getElementById("mapPanelTags");
  const mapPanelFrame = document.getElementById("mapPanelFrame");
  const mapPanelAddress = document.getElementById("mapPanelAddress");
  const mapPanelRating = document.getElementById("mapPanelRating");
  const mapPanelStatus = document.getElementById("mapPanelStatus");
  const mapPanelFavoriteButton = document.getElementById("mapPanelFavoriteButton");
  const mapPanelDetailLink = document.getElementById("mapPanelDetailLink");
  const mapPanelExternalLink = document.getElementById("mapPanelExternalLink");

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

  function buildDetailUrl(slug) {
    return `venue-detail.html?slug=${encodeURIComponent(slug)}`;
  }

  function buildAbsoluteUrl(path) {
    try {
      return new URL(path, window.location.href).href;
    } catch (error) {
      return String(path || window.location.href);
    }
  }

  function buildCardShareLinks(item) {
    const detailUrl = buildAbsoluteUrl(buildDetailUrl(item.slug || ""));
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
    mapPanelDetailLink.href = buildDetailUrl(item.slug);
    mapPanelExternalLink.href = item.mapsUrl || `https://www.google.com/maps?q=${encodeURIComponent(item.address || item.name || "İstanbul")}`;
    mapPanelFrame.src = buildMapEmbedUrl(item);
    updateFavoriteButtonLabel(mapPanelFavoriteButton, item.id);

    mapPanelTags.innerHTML = "";
    const tagValues = Array.isArray(item.tags) ? item.tags : [];
    if (!tagValues.length) {
      const emptyTag = document.createElement("span");
      emptyTag.className = "istanbul-active-pill";
      emptyTag.textContent = formatBudgetLabel(item.budget) || "Etiket yok";
      mapPanelTags.appendChild(emptyTag);
      return;
    }

    tagValues.forEach((tagValue) => {
      const tagNode = document.createElement("span");
      tagNode.className = "istanbul-active-pill";
      const match = state.filters.tags.find((itemTag) => itemTag.key === tagValue);
      tagNode.textContent = match ? match.label : tagValue;
      mapPanelTags.appendChild(tagNode);
    });
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
    if (!resultsModeLabel || !resultsTitle) {
      return;
    }

    if (state.nearbyMode && state.userLocation) {
      resultsModeLabel.textContent = "Yakınındaki mekanlar";
      resultsTitle.textContent = "Konumuna göre sıralanan İstanbul mekanları";
      return;
    }

    resultsModeLabel.textContent = "İstanbul listesi";
    resultsTitle.textContent = "İstanbul'da keşfedebileceğin mekanlar";
  }

  function syncActiveFilterPills() {
    if (!activeFilterPills) {
      return;
    }

    activeFilterPills.innerHTML = "";

    const activeItems = [];
    if (state.selectedDistrict) {
      activeItems.push(`İlçe: ${state.selectedDistrict}`);
    }
    if (state.selectedNeighborhood) {
      activeItems.push(`Mahalle: ${state.selectedNeighborhood}`);
    }
    if (state.selectedCategory) {
      activeItems.push(`Kategori: ${getSelectedCategoryLabel()}`);
    }
    if (state.selectedBudget) {
      activeItems.push(`Bütçe: ${formatBudgetLabel(state.selectedBudget)}`);
    }
    if (state.query) {
      activeItems.push(`Arama: ${state.query}`);
    }
    state.selectedTags.forEach((tag) => {
      const match = state.filters.tags.find((item) => item.key === tag);
      activeItems.push(match ? match.label : tag);
    });
    if (state.nearbyMode) {
      activeItems.push("Nearby açık");
    }

    if (activeItems.length === 0) {
      activeFilterPills.hidden = true;
      return;
    }

    activeFilterPills.hidden = false;
    activeItems.forEach((label) => {
      const pill = document.createElement("span");
      pill.className = "istanbul-active-pill";
      pill.textContent = label;
      activeFilterPills.appendChild(pill);
    });
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
      option.textContent = select === budgetSelect ? formatBudgetLabel(optionValue) : optionValue;
      select.appendChild(option);
    });
  }

  function populateCategorySelect() {
    if (!categorySelect) {
      return;
    }

    const categoryOptions = Array.isArray(state.filters.categoryOptions) ? state.filters.categoryOptions : [];
    if (!categoryOptions.length) {
      populateSelect(categorySelect, state.filters.categories, "Tüm kategoriler");
      return;
    }

    categorySelect.innerHTML = "";

    const emptyOption = document.createElement("option");
    emptyOption.value = "";
    emptyOption.textContent = "Tüm kategoriler";
    categorySelect.appendChild(emptyOption);

    categoryOptions.forEach((category) => {
      const option = document.createElement("option");
      option.value = String(category.id);
      option.textContent = category.name;
      categorySelect.appendChild(option);
    });
  }

  function populateNeighborhoodSelect() {
    if (!neighborhoodSelect) {
      return;
    }

    const districtKey = state.selectedDistrict;
    const options = districtKey && state.filters.neighborhoodsByDistrict
      ? state.filters.neighborhoodsByDistrict[districtKey] || []
      : [];
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
    if (!state.selectedCategory) {
      return "";
    }

    const categoryOptions = Array.isArray(state.filters.categoryOptions) ? state.filters.categoryOptions : [];
    if (!categoryOptions.length) {
      return state.selectedCategory;
    }

    const match = categoryOptions.find((category) => String(category.id) === String(state.selectedCategory));
    return match ? match.name : state.selectedCategory;
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
      populateSelect(districtSelect, state.filters.districts, "Tüm ilçeler");
      populateNeighborhoodSelect();
      populateCategorySelect();
      populateSelect(budgetSelect, state.filters.budgets, "Tüm bütçeler");
      renderTagButtons();
      return;
    }

    const response = await fetch("/api/mvp/istanbul/filters", {
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

    state.filters = {
      districts: sanitizeDistrictOptions(Array.isArray(payload.districts) ? payload.districts : [], officialDistricts),
      neighborhoodsByDistrict: sanitizedNeighborhoodsByDistrict,
      categoryOptions: Array.isArray(payload.categoryOptions) ? payload.categoryOptions : [],
      categories: Array.isArray(payload.categories) ? payload.categories : [],
      tags: Array.isArray(payload.tags) ? payload.tags : [],
      budgets: Array.isArray(payload.budgets) ? payload.budgets : [],
    };

    populateSelect(districtSelect, state.filters.districts, "Tüm ilçeler");
    populateNeighborhoodSelect();
    populateCategorySelect();
    populateSelect(budgetSelect, state.filters.budgets, "Tüm bütçeler");
    renderTagButtons();
  }

  function buildQueryParams() {
    const params = new URLSearchParams();
    params.set("page", String(state.page));
    params.set("limit", String(state.limit));

    if (state.selectedDistrict) {
      params.set("district", state.selectedDistrict);
    }
    if (state.selectedNeighborhood) {
      params.set("neighborhood", state.selectedNeighborhood);
    }
    if (state.selectedCategory) {
      if (Array.isArray(state.filters.categoryOptions) && state.filters.categoryOptions.length) {
        params.set("categoryId", state.selectedCategory);
      } else {
        params.set("category", state.selectedCategory);
      }
    }
    if (state.selectedBudget) {
      params.set("budget", state.selectedBudget);
    }
    if (state.query) {
      params.set("q", state.query);
    }
    state.selectedTags.forEach((tag) => params.append("tag", tag));

    if (state.nearbyMode && state.userLocation) {
      params.set("lat", String(state.userLocation.lat));
      params.set("lng", String(state.userLocation.lng));
      params.set("radius", "8000");
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
      resultsState.textContent = "Bu filtrelerle mekan bulunamadı.";
      renderPagination();
      return;
    }

    syncSelectedVenue();
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
      const detailLink = fragment.querySelector(".istanbul-venue-detail-link");
      const favoriteButton = fragment.querySelector(".istanbul-favorite-button");

      card.tabIndex = 0;
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
              image.src = getCategoryImage(item.category || item.cuisine || "");
              image.alt = item.name || "Mekan";
            },
            { once: true },
          );
        } else {
          image.src = getCategoryImage(item.category || item.cuisine || "");
          image.alt = item.name || "Mekan";
        }
      }

      eyebrow.textContent = [item.district, item.neighborhood].filter(Boolean).join(" / ");

      const formattedDistance = formatDistance(Number(item.distanceMeters));
      if (formattedDistance) {
        distance.hidden = false;
        distance.textContent = formattedDistance;
      }

      titleLink.textContent = item.name || "İsimsiz mekan";
      titleLink.href = buildDetailUrl(item.slug);
      address.textContent = item.address || "Adres bilgisi bulunmuyor.";
      rating.textContent = formatVenueRatingText(item.rating, item.userRatingCount);
      budget.textContent = formatBudgetLabel(item.budget) || "Bütçe yok";
      detailLink.href = buildDetailUrl(item.slug);
      updateFavoriteButtonLabel(favoriteButton, item.id);
      bindCardShare(fragment, item);

      if (Array.isArray(item.tags) && item.tags.length) {
        item.tags.forEach((tagValue) => {
          const tagNode = document.createElement("span");
          tagNode.className = "istanbul-venue-tag";
          const match = state.filters.tags.find((itemTag) => itemTag.key === tagValue);
          tagNode.textContent = match ? match.label : tagValue;
          tags.appendChild(tagNode);
        });
      } else {
        card.classList.add("is-tagless");
      }

      card.addEventListener("click", (event) => {
        if (event.target instanceof HTMLElement && event.target.closest("a, button")) {
          return;
        }
        selectVenue(item.slug);
      });
      card.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
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
      resultsMeta.textContent = `${formatCount(payload.meta?.count || state.items.length)} mekan yakında bulundu`;
      return;
    }

    const total = payload.pagination?.total || 0;
    resultsMeta.textContent = `${formatCount(total)} mekan listeleniyor`;
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
          if (state.selectedCategory && normalizeText(item.category) !== normalizeText(state.selectedCategory)) {
            return false;
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

      const params = buildQueryParams();
      const endpoint = state.nearbyMode && state.userLocation
        ? `/api/mvp/istanbul/venues/nearby?${params.toString()}`
        : `/api/mvp/istanbul/venues?${params.toString()}`;
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
    state.selectedDistrict = "";
    state.selectedNeighborhood = "";
    state.selectedCategory = "";
    state.selectedBudget = "";
    state.selectedTags = [];
    state.query = "";
    state.page = 1;
    state.nearbyMode = false;
    districtSelect.value = "";
    if (neighborhoodSelect) {
      neighborhoodSelect.value = "";
    }
    categorySelect.value = "";
    budgetSelect.value = "";
    if (queryInput) {
      queryInput.value = "";
    }
    populateNeighborhoodSelect();
    renderTagButtons();
    syncActiveFilterPills();
    setLocationMessage("Nearby modu kapatıldı. İstanbul genel listesine döndün.", false);
    loadVenues();
  }

  function requestNearbyMode() {
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
        setLocationMessage("Nearby modu aktif. Sonuçlar konumuna göre sıralanıyor.", false);
        loadVenues();
      },
      () => {
        state.nearbyMode = false;
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

    districtSelect.addEventListener("change", async () => {
      state.selectedDistrict = districtSelect.value;
      state.selectedNeighborhood = "";
      await ensureNeighborhoodsForDistrict(state.selectedDistrict);
      populateNeighborhoodSelect();
      state.page = 1;
      loadVenues();
    });

    if (neighborhoodSelect) {
      neighborhoodSelect.addEventListener("change", () => {
        state.selectedNeighborhood = neighborhoodSelect.value;
        state.page = 1;
        loadVenues();
      });
    }

    categorySelect.addEventListener("change", () => {
      state.selectedCategory = categorySelect.value;
      state.page = 1;
      loadVenues();
    });

    budgetSelect.addEventListener("change", () => {
      state.selectedBudget = budgetSelect.value;
      state.page = 1;
      loadVenues();
    });

    if (queryInput) {
      queryInput.addEventListener("blur", () => {
        state.query = queryInput.value.trim();
        state.page = 1;
        loadVenues();
      });
    }

    resetFiltersButton.addEventListener("click", resetFilters);
    nearbyButton.addEventListener("click", requestNearbyMode);
    document.addEventListener("click", (event) => {
      if (!(event.target instanceof HTMLElement) || !event.target.closest(".card-share-wrap")) {
        closeCardShareMenus();
      }
    });
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        closeCardShareMenus();
      }
    });
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
      bindEvents();
      updateModeHeading();
      syncActiveFilterPills();
      await loadVenues();
    } catch (error) {
      setLoading(false, error instanceof Error ? error.message : "Sayfa başlatılamadı.");
    }
  }

  main();
})();
