"use strict";

(function initIstanbulDiscoveryPage() {
  const resultsGrid = document.getElementById("resultsGrid");
  if (!resultsGrid) {
    return;
  }

  const state = {
    filters: {
      districts: [],
      categoryOptions: [],
      categories: [],
      tags: [],
    },
    dataMode: "api",
    localData: [],
    localDataLoaded: false,
    localFavoritesKey: "geziKesfetFavorites",
    selectedDistrict: "",
    selectedCategory: "",
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
    return ["gezi", state.selectedDistrict, String(state.selectedCategory || ""), state.query.trim()].join("\u0001");
  }

  function discoveryFiltersAllowHighRatedShuffle() {
    if (state.nearbyMode) {
      return false;
    }
    if (state.selectedDistrict) {
      return false;
    }
    if (state.query.trim()) {
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

  /** İstanbul gezi veri tabanı (KTB + yerel JSON) ile uyumlu sabit kategori listesi — kategori kutusu sırası */
  const GEZI_CATEGORY_OPTIONS = [
    "Kamp Alanları",
    "Gezi Tesis Tipleri",
    "Apart Otel",
    "Butik Otel",
    "Camping",
    "Gastronomi Tesisi",
    "Günübirlik Tesis",
    "Kırsal Turizm Tesisi",
    "Konaklama Amaçlı Mesire Yeri",
    "Kongre Ve Sergi Merkezi",
    "Motel",
    "Otel",
    "Özel Konaklama Tesisi",
    "Özel Tesis",
    "Pansiyon",
    "Plaj",
    "Yat Limanı",
    "Yat Yanaşma Yeri",
    "Deniz Turizmi Araçları",
  ];

  const GEZI_TESIS_TIPLERI_LABEL = "Gezi Tesis Tipleri";

  const LOCAL_DATA_SOURCES = [
    { label: "Kamp Alanları", file: "data/gezi-kamp-alanlari.json", category: "Kamp Alanları" },
    { label: "Butik Oteller", file: "data/gezi-butik-oteller.json", category: "Butik Otel" },
    { label: "5 Yıldızlı Oteller", file: "data/gezi-oteller-5-yildiz.json", category: "Otel" },
    { label: "4 Yıldızlı Oteller", file: "data/gezi-oteller-4-yildiz.json", category: "Otel" },
    { label: "3 Yıldızlı Oteller", file: "data/gezi-oteller-3-yildiz.json", category: "Otel" },
    { label: "2 Yıldızlı Oteller", file: "data/gezi-oteller-2-yildiz.json", category: "Otel" },
    { label: "1 Yıldızlı Oteller", file: "data/gezi-oteller-1-yildiz.json", category: "Otel" },
    { label: "Diğer Oteller", file: "data/gezi-oteller-diger.json", category: "Otel" },
    {
      label: "KTB tesis kayıtları (İstanbul)",
      file: "data/ktb-tesis-kayitlari-gezi.json",
      categoryFromField: "sourceTesisTuru",
    },
  ];

  const localDataPromise = {
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
    if (normalized === normalizeText("bilinmiyor")) {
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

  function formatCategoryChipDisplayName(rawName) {
    return String(rawName || "").trim();
  }

  function truncateText(value, max) {
    const t = String(value || "").trim();
    if (!t) {
      return "";
    }
    if (t.length <= max) {
      return t;
    }
    return `${t.slice(0, Math.max(0, max - 1)).trim()}…`;
  }

  function resolveCardPhotoUri(item) {
    const direct = typeof item.photoUri === "string" ? item.photoUri.trim() : "";
    if (direct) {
      return direct;
    }
    const g = item.galleryPhotoUris;
    if (Array.isArray(g) && g.length) {
      const u = String(g[0] || "").trim();
      if (u) {
        return u;
      }
    }
    return "";
  }

  function formatVenueContactLine(item) {
    const parts = [];
    const phone = String(item.phone || "").trim();
    const email = String(item.email || "").trim();
    const website = String(item.website || "").trim();
    const instagram = String(item.instagram || "").trim();
    if (phone) {
      parts.push(`Tel: ${phone}`);
    }
    if (email) {
      parts.push(email);
    }
    if (website) {
      parts.push(website);
    }
    if (instagram) {
      parts.push(instagram.includes("http") ? instagram : `Instagram: ${instagram}`);
    }
    return parts.join(" · ");
  }

  function buildLocalVenue(item, source) {
    const name = item.name || item.title || item.adi || "";
    const district = item.district || item.ilce || "";
    const neighborhood = item.neighborhood || item.mahalle || "";
    const address = item.address || item.adres || "";
    const mapsUrl = item.mapsUrl || item.mapUrl || "";

    let category = source.category;
    let fromKtbRegistry = false;
    if (source.categoryFromField) {
      fromKtbRegistry = true;
      const raw = item[source.categoryFromField] || item.cuisine || "";
      category = String(raw).trim() || "Otel";
    }

    const slugBase = [name, district, neighborhood, category].filter(Boolean).join(" ");
    const slug = slugify(slugBase) || slugify(name);
    const id = `${slug || slugify(name) || "venue"}-${category}`;

    const phone = typeof item.phone === "string" ? item.phone.trim() : "";
    const website = typeof item.website === "string" ? item.website.trim() : "";
    const editorialSummary =
      typeof item.editorialSummary === "string" ? item.editorialSummary.trim() : "";

    return {
      id,
      slug: slug || id,
      name,
      address,
      district,
      neighborhood,
      cuisine: item.cuisine || "",
      category,
      fromKtbRegistry,
      sourceLabel: source.label,
      source: item.source || "",
      rating: item.rating || item.googleRating || "",
      budget: item.budget || "",
      tags: Array.isArray(item.tags) ? item.tags : [],
      mapsUrl,
      photoUri: (typeof item.photoUri === "string" ? item.photoUri : typeof item.photoUrl === "string" ? item.photoUrl : "").trim(),
      latitude: item.latitude || item.lat || null,
      longitude: item.longitude || item.lng || null,
      sourceBelgeNo: typeof item.sourceBelgeNo === "string" ? item.sourceBelgeNo.trim() : "",
      sourceTesisTuru: typeof item.sourceTesisTuru === "string" ? item.sourceTesisTuru.trim() : "",
      sourcePlaceId: typeof item.sourcePlaceId === "string" ? item.sourcePlaceId.trim() : "",
      phone,
      website,
      editorialSummary,
    };
  }

  /** İlçe/İstanbul sırası farklı olsa da aynı sayılan adres anahtarı (KTB + TUROB çiftleri için). */
  function normalizeAddressCanonical(addr) {
    let t = normalizeText(addr).replace(/[^a-z0-9]+/g, " ").trim();
    const drop = new Set(["istanbul", "turkiye", "turkey"]);
    const tokens = t.split(/\s+/).filter((w) => w.length > 1 && !drop.has(w));
    return tokens.sort().join(" ");
  }

  function haversineMeters(lat1, lng1, lat2, lng2) {
    const R = 6371000;
    const toRad = (deg) => (deg * Math.PI) / 180;
    const dLat = toRad(lat2 - lat1);
    const dLng = toRad(lng2 - lng1);
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
    return 2 * R * Math.asin(Math.min(1, Math.sqrt(a)));
  }

  /** Aynı kayıt için daha zengin kartı (foto, koordinat, harita) tercih etmek için. */
  function scoreVenueForDedupe(item) {
    let s = 0;
    if (item.photoUri) {
      s += 4;
    }
    const lat = Number(item.latitude);
    const lng = Number(item.longitude);
    if (Number.isFinite(lat) && Number.isFinite(lng)) {
      s += 3;
    }
    if (item.mapsUrl) {
      s += 2;
    }
    if (item.phone) {
      s += 1;
    }
    if (item.website) {
      s += 1;
    }
    if (String(item.address || "").length > 55) {
      s += 2;
    }
    if (item.editorialSummary) {
      s += 1;
    }
    if (item.fromKtbRegistry && item.sourceBelgeNo) {
      s += 2;
    }
    return s;
  }

  function enrichVenueFromDonor(keeper, donor) {
    if (!donor || keeper === donor) {
      return;
    }
    if (!keeper.photoUri && donor.photoUri) {
      keeper.photoUri = donor.photoUri;
    }
    if (!keeper.mapsUrl && donor.mapsUrl) {
      keeper.mapsUrl = donor.mapsUrl;
    }
    if (!keeper.phone && donor.phone) {
      keeper.phone = donor.phone;
    }
    if (!keeper.website && donor.website) {
      keeper.website = donor.website;
    }
    const kLat = Number(keeper.latitude);
    const kLng = Number(keeper.longitude);
    const dLat = Number(donor.latitude);
    const dLng = Number(donor.longitude);
    if (!(Number.isFinite(kLat) && Number.isFinite(kLng)) && Number.isFinite(dLat) && Number.isFinite(dLng)) {
      keeper.latitude = donor.latitude;
      keeper.longitude = donor.longitude;
    }
    if (String(keeper.address || "").length < String(donor.address || "").length) {
      keeper.address = donor.address;
    }
    if (!keeper.rating && donor.rating) {
      keeper.rating = donor.rating;
    }
  }

  /**
   * Aynı tesisin KTB + TUROB + aynı belge no tekrarları gibi mükerrerlerini ayıklar.
   * 1) KTB belge no, 2) Google place id, 3) ad|ilçe|kanonik adres, 4) tek belge + aynı ad+ilçe birleştirme, 5) yakın koordinat.
   */
  function dedupeGeziVenueList(results) {
    const byBelge = new Map();
    const rest = [];

    for (const item of results) {
      const belge = String(item.sourceBelgeNo || "").trim();
      if (belge) {
        const existing = byBelge.get(belge);
        if (!existing || scoreVenueForDedupe(item) > scoreVenueForDedupe(existing)) {
          byBelge.set(belge, item);
        }
      } else {
        rest.push(item);
      }
    }

    const keyed = new Map();
    for (const item of rest) {
      const pid = String(item.sourcePlaceId || "").trim();
      if (pid) {
        const key = `pid:${pid}`;
        const existing = keyed.get(key);
        if (!existing || scoreVenueForDedupe(item) > scoreVenueForDedupe(existing)) {
          keyed.set(key, item);
        }
        continue;
      }
      const key = [
        normalizeText(item.name),
        normalizeText(item.district),
        normalizeAddressCanonical(item.address),
      ].join("|");
      const existing = keyed.get(key);
      if (!existing || scoreVenueForDedupe(item) > scoreVenueForDedupe(existing)) {
        keyed.set(key, item);
      }
    }

    const merged = [...byBelge.values(), ...keyed.values()];

    const byNameDistrict = new Map();
    const ndKey = (item) => `${normalizeText(item.name)}|${normalizeText(item.district)}`;
    for (const item of merged) {
      const k = ndKey(item);
      if (!byNameDistrict.has(k)) {
        byNameDistrict.set(k, []);
      }
      byNameDistrict.get(k).push(item);
    }

    const afterBelgeMerge = [];
    for (const [, group] of byNameDistrict) {
      if (group.length === 1) {
        afterBelgeMerge.push(group[0]);
        continue;
      }
      const withBelge = group.filter((g) => String(g.sourceBelgeNo || "").trim());
      if (withBelge.length === 1) {
        const keeper = withBelge[0];
        const others = group
          .filter((g) => !String(g.sourceBelgeNo || "").trim())
          .sort((a, b) => scoreVenueForDedupe(b) - scoreVenueForDedupe(a));
        const donor = others[0];
        if (donor) {
          enrichVenueFromDonor(keeper, donor);
        }
        afterBelgeMerge.push(keeper);
        continue;
      }
      if (withBelge.length > 1) {
        afterBelgeMerge.push(...group);
        continue;
      }
      afterBelgeMerge.push(...group);
    }

    const sorted = [...afterBelgeMerge].sort((a, b) => scoreVenueForDedupe(b) - scoreVenueForDedupe(a));
    const kept = [];
    const keptByNameDistrict = new Map();
    for (const item of sorted) {
      const lat = Number(item.latitude);
      const lng = Number(item.longitude);
      const hasGeo = Number.isFinite(lat) && Number.isFinite(lng);
      let dup = false;
      if (hasGeo) {
        const key = `${normalizeText(item.name)}|${normalizeText(item.district)}`;
        const candidates = keptByNameDistrict.get(key) || [];
        for (const k of candidates) {
          const kLat = Number(k.latitude);
          const kLng = Number(k.longitude);
          if (Number.isFinite(kLat) && Number.isFinite(kLng) && haversineMeters(lat, lng, kLat, kLng) < 220) {
            dup = true;
            break;
          }
        }
      }
      if (!dup) {
        kept.push(item);
        const key = `${normalizeText(item.name)}|${normalizeText(item.district)}`;
        const group = keptByNameDistrict.get(key) || [];
        group.push(item);
        keptByNameDistrict.set(key, group);
      }
    }

    return kept;
  }

  function categoryMatchesSelection(item, selectedCategory) {
    if (!selectedCategory) {
      return true;
    }
    if (normalizeText(selectedCategory) === normalizeText(GEZI_TESIS_TIPLERI_LABEL)) {
      return item.fromKtbRegistry === true;
    }
    return normalizeText(item.category) === normalizeText(selectedCategory);
  }

  async function loadLocalData() {
    if (state.localDataLoaded) {
      return state.localData;
    }
    if (localDataPromise.current) {
      return localDataPromise.current;
    }

    localDataPromise.current = (async () => {
      const sourceResults = await Promise.all(LOCAL_DATA_SOURCES.map(async (source) => {
        try {
          const response = await fetch(source.file, { headers: { Accept: "application/json" } });
          if (!response.ok) {
            return [];
          }
          const payload = await response.json();
          const list = Array.isArray(payload) ? payload : [];
          return list
            .filter((item) => item && (!item.city || isIstanbulCity(item.city)))
            .map((item) => buildLocalVenue(item, source));
        } catch (error) {
          return [];
        }
      }));

      const results = sourceResults.flat();
      state.localData = dedupeGeziVenueList(results);
      state.localDataLoaded = true;
      return state.localData;
    })();

    return localDataPromise.current;
  }

  function buildLocalFilters(items) {
    const districts = new Set();
    items.forEach((item) => {
      if (item.district) {
        districts.add(item.district);
      }
    });

    return {
      districts: Array.from(districts).sort((a, b) => a.localeCompare(b, "tr-TR")),
      categoryOptions: [],
      categories: GEZI_CATEGORY_OPTIONS.slice(),
      tags: [],
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

  function buildNearbyCacheKey() {
    if (!state.userLocation) {
      return "";
    }
    const lat = Number(state.userLocation.lat || 0).toFixed(3);
    const lng = Number(state.userLocation.lng || 0).toFixed(3);
    const query = normalizeText(state.query);
    const district = normalizeText(state.selectedDistrict);
    const category = normalizeText(state.selectedCategory);
    return [lat, lng, query, district, category].join("|");
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
    if (!item.latitude || !item.longitude || !Number.isFinite(lat) || !Number.isFinite(lng)) return null;
    if (lat < 35 || lat > 43 || lng < 25 || lng > 45) return null;
    const toRad = (value) => (Number(value) * Math.PI) / 180;
    const lat1 = toRad(userLocation.lat);
    const lon1 = toRad(userLocation.lng);
    const lat2 = toRad(item.latitude);
    const lon2 = toRad(item.longitude);
    const dLat = lat2 - lat1;
    const dLon = lon2 - lon1;
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const meters = 6371000 * c;
    return meters > 500000 ? null : meters;
  }

  function getCategoryImage(category) {
    const normalized = normalizeText(category);
    if (normalized.includes("otel")) {
      return "assets/otel.png";
    }
    return "assets/gezi.png";
  }

  function readVenueSlugFromUrl() {
    const params = new URLSearchParams(window.location.search);
    return params.get("venue") || "";
  }

  function readInitialQueryFromUrl() {
    const params = new URLSearchParams(window.location.search);
    return (params.get("q") || params.get("query") || "").trim();
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
  const districtOptionsContainer = document.getElementById("districtOptions");
  const kesfetDistrictSwitch = document.querySelector("[data-kesfet-district-switch]");
  const kesfetDistrictTrigger = document.querySelector("[data-kesfet-district-trigger]");
  const kesfetDistrictMenu = document.querySelector("[data-kesfet-district-menu]");
  const kesfetDistrictCurrent = document.querySelector("[data-kesfet-district-current]");
  const categoryChipRow = document.getElementById("categoryChipRow");
  const kesfetCategorySwitch = document.querySelector("[data-kesfet-category-switch]");
  const kesfetCategoryTrigger = document.querySelector("[data-kesfet-category-trigger]");
  const kesfetCategoryMenu = document.querySelector("[data-kesfet-category-menu]");
  const kesfetCategoryCurrent = document.querySelector("[data-kesfet-category-current]");
  const categorySelect = document.getElementById("categorySelect");
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
  const mapPanelTags = document.getElementById("mapPanelTags");
  const mapPanelFrame = document.getElementById("mapPanelFrame");
  const mapPanelAddress = document.getElementById("mapPanelAddress");
  const mapPanelRating = document.getElementById("mapPanelRating");
  const mapPanelStatus = document.getElementById("mapPanelStatus");
  const mapPanelFavoriteButton = document.getElementById("mapPanelFavoriteButton");
  const mapPanelDetailLink = document.getElementById("mapPanelDetailLink");
  const mapPanelExternalLink = document.getElementById("mapPanelExternalLink");
  const mapPanelContact = document.getElementById("mapPanelContact");
  const mapPanelVenueTypeWrap = document.getElementById("mapPanelVenueTypeWrap");
  const mapPanelVenueTypeChip = document.getElementById("mapPanelVenueTypeChip");
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
    syncKesfetCategoryTrigger();
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

  function clearNearbyMode(message = "") {
    state.nearbyMode = false;
    state.userLocation = null;
    state.page = 1;
    clearHighRatedDiscoveryPool();
    syncNearbyToggle();
    setLocationMessage(message, false);
    loadVenues();
  }

  function formatCount(count) {
    return new Intl.NumberFormat("tr-TR").format(Number(count || 0));
  }

  function resolveCategoryFilterValueForVenueType(item) {
    const typeLabel = String(item.cuisine || item.category || "").trim();
    if (!typeLabel) {
      return "";
    }
    const options = Array.isArray(state.filters.categoryOptions) ? state.filters.categoryOptions : [];
    if (options.length) {
      const byName = options.find((opt) => normalizeText(String(opt.name || "")) === normalizeText(typeLabel));
      if (byName) {
        if (byName.id != null && String(byName.id).trim() !== "") {
          return String(byName.id);
        }
        return String(byName.name || "").trim() || typeLabel;
      }
    }
    const cats = Array.isArray(state.filters.categories) ? state.filters.categories : GEZI_CATEGORY_OPTIONS.slice();
    const match = cats.find((c) => normalizeText(String(c)) === normalizeText(typeLabel));
    if (match) {
      return match;
    }
    return typeLabel;
  }

  function applyVenueTypeFilterFromItem(item) {
    const value = resolveCategoryFilterValueForVenueType(item);
    if (!value) {
      return;
    }
    state.selectedCategory = value;
    state.page = 1;
    syncCategoryChipVisuals();
    syncActiveFilterPills();
    loadVenues();
    const filterCard = document.querySelector(".istanbul-filter-card");
    if (filterCard instanceof HTMLElement) {
      filterCard.scrollIntoView({ behavior: "smooth", block: "start" });
    }
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

  function buildDetailUrl(slug) {
    saveReturnUrl();
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
      if (mapPanelVenueTypeWrap instanceof HTMLElement) {
        mapPanelVenueTypeWrap.hidden = true;
      }
      if (resultsLayout) {
        resultsLayout.hidden = true;
      }
      return;
    }

    if (resultsLayout) {
      resultsLayout.hidden = false;
    }

    mapPanelTitle.textContent = item.name || "İsimsiz mekan";
    mapPanelMeta.textContent =
      [item.district, item.neighborhood].filter(Boolean).join(" / ") || "İstanbul";
    mapPanelAddress.textContent = item.address || "Adres bilgisi bulunmuyor.";
    if (mapPanelContact) {
      const c = formatVenueContactLine(item);
      if (c) {
        mapPanelContact.hidden = false;
        mapPanelContact.textContent = c;
      } else {
        mapPanelContact.hidden = true;
        mapPanelContact.textContent = "";
      }
    }
    if (mapPanelVenueTypeWrap && mapPanelVenueTypeChip) {
      const typeLabel = String(item.cuisine || item.category || "").trim();
      if (typeLabel) {
        mapPanelVenueTypeWrap.hidden = false;
        mapPanelVenueTypeChip.textContent = formatCategoryChipDisplayName(typeLabel);
        mapPanelVenueTypeChip.setAttribute("aria-label", `${typeLabel} türündeki mekanları göster`);
        mapPanelVenueTypeChip.onclick = (event) => {
          event.preventDefault();
          event.stopPropagation();
          applyVenueTypeFilterFromItem(item);
        };
      } else {
        mapPanelVenueTypeWrap.hidden = true;
        mapPanelVenueTypeChip.textContent = "";
        mapPanelVenueTypeChip.onclick = null;
      }
    }
    mapPanelRating.textContent = formatVenueRatingText(item.rating, item.userRatingCount);
    mapPanelStatus.textContent = formatStatus(item);
    mapPanelDetailLink.href = buildDetailUrl(item.slug);
    mapPanelExternalLink.href =
      item.mapsUrl || `https://www.google.com/maps?q=${encodeURIComponent(item.address || item.name || "İstanbul")}`;
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
    if (!resultsTitle) {
      return;
    }

    if (state.nearbyMode && state.userLocation) {
      resultsTitle.textContent = "Konumuna göre sıralanan İstanbul gezi noktaları";
      return;
    }

    resultsTitle.textContent = "İstanbul'da keşfedebileceğin gezi noktaları";
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
    if (state.selectedCategory) {
      activeItems.push({ label: `Kategori: ${getSelectedCategoryLabel()}`, type: "category" });
    }
    if (state.query) {
      activeItems.push({ label: `Arama: ${state.query}`, type: "query" });
    }
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
        removeGeziPillFilter(item);
      });
      activeFilterPills.appendChild(pill);
    });
  }

  function removeGeziPillFilter(item) {
    switch (item.type) {
      case "district":
        state.selectedDistrict = "";
        break;
      case "category":
        state.selectedCategory = "";
        break;
      case "query":
        state.query = "";
        if (queryInput) {
          queryInput.value = "";
        }
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

  function getSelectedCategoryLabel() {
    if (!state.selectedCategory) {
      return "";
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

  const KESFET_CATEGORY_MENU_HOVER_DELAY_MS = 180;
  const kesfetCategoryHoverCloseTimers = new WeakMap();
  const kesfetDistrictHoverCloseTimers = new WeakMap();

  function clearKesfetCategoryHoverTimer(container) {
    if (!container) {
      return;
    }
    const activeTimer = kesfetCategoryHoverCloseTimers.get(container);
    if (activeTimer) {
      window.clearTimeout(activeTimer);
      kesfetCategoryHoverCloseTimers.delete(container);
    }
  }

  function closeKesfetCategoryMenu() {
    if (!kesfetCategorySwitch || !kesfetCategoryMenu || !kesfetCategoryTrigger) {
      return;
    }
    clearKesfetCategoryHoverTimer(kesfetCategorySwitch);
    kesfetCategoryMenu.hidden = true;
    kesfetCategoryTrigger.setAttribute("aria-expanded", "false");
    kesfetCategorySwitch.classList.remove("is-open");
  }

  function clearKesfetDistrictHoverTimer(container) {
    if (!container) {
      return;
    }
    const activeTimer = kesfetDistrictHoverCloseTimers.get(container);
    if (activeTimer) {
      window.clearTimeout(activeTimer);
      kesfetDistrictHoverCloseTimers.delete(container);
    }
  }

  function closeKesfetDistrictMenu() {
    if (!kesfetDistrictSwitch || !kesfetDistrictMenu || !kesfetDistrictTrigger) {
      return;
    }
    clearKesfetDistrictHoverTimer(kesfetDistrictSwitch);
    kesfetDistrictMenu.hidden = true;
    kesfetDistrictTrigger.setAttribute("aria-expanded", "false");
    kesfetDistrictSwitch.classList.remove("is-open");
  }

  function openKesfetDistrictMenu() {
    if (!kesfetDistrictSwitch || !kesfetDistrictMenu || !kesfetDistrictTrigger) {
      return;
    }
    clearKesfetDistrictHoverTimer(kesfetDistrictSwitch);
    closeKesfetCategoryMenu();
    kesfetDistrictMenu.hidden = false;
    kesfetDistrictTrigger.setAttribute("aria-expanded", "true");
    kesfetDistrictSwitch.classList.add("is-open");
  }

  function scheduleKesfetDistrictMenuClose() {
    if (!kesfetDistrictSwitch) {
      return;
    }
    clearKesfetDistrictHoverTimer(kesfetDistrictSwitch);
    const timerId = window.setTimeout(() => {
      closeKesfetDistrictMenu();
      kesfetDistrictHoverCloseTimers.delete(kesfetDistrictSwitch);
    }, KESFET_CATEGORY_MENU_HOVER_DELAY_MS);
    kesfetDistrictHoverCloseTimers.set(kesfetDistrictSwitch, timerId);
  }

  function openKesfetCategoryMenu() {
    if (!kesfetCategorySwitch || !kesfetCategoryMenu || !kesfetCategoryTrigger) {
      return;
    }
    clearKesfetCategoryHoverTimer(kesfetCategorySwitch);
    closeKesfetDistrictMenu();
    kesfetCategoryMenu.hidden = false;
    kesfetCategoryTrigger.setAttribute("aria-expanded", "true");
    kesfetCategorySwitch.classList.add("is-open");
  }

  function scheduleKesfetCategoryMenuClose() {
    if (!kesfetCategorySwitch) {
      return;
    }
    clearKesfetCategoryHoverTimer(kesfetCategorySwitch);
    const timerId = window.setTimeout(() => {
      closeKesfetCategoryMenu();
      kesfetCategoryHoverCloseTimers.delete(kesfetCategorySwitch);
    }, KESFET_CATEGORY_MENU_HOVER_DELAY_MS);
    kesfetCategoryHoverCloseTimers.set(kesfetCategorySwitch, timerId);
  }

  function syncKesfetCategoryTrigger() {
    if (!kesfetCategoryCurrent) {
      return;
    }
    if (!String(state.selectedCategory || "").trim()) {
      kesfetCategoryCurrent.textContent = "Tüm kategoriler";
      return;
    }
    const label = getSelectedCategoryLabel();
    kesfetCategoryCurrent.textContent = label && String(label).trim() ? label : "Tüm kategoriler";
  }

  function initKesfetCategoryDropdown() {
    if (!kesfetCategorySwitch || !kesfetCategoryTrigger || !kesfetCategoryMenu) {
      return;
    }

    kesfetCategoryTrigger.addEventListener("click", (event) => {
      event.preventDefault();
      if (kesfetCategoryMenu.hidden) {
        openKesfetCategoryMenu();
        return;
      }
      closeKesfetCategoryMenu();
    });

    kesfetCategorySwitch.addEventListener("mouseenter", () => {
      clearKesfetCategoryHoverTimer(kesfetCategorySwitch);
      openKesfetCategoryMenu();
    });

    kesfetCategorySwitch.addEventListener("mouseleave", () => {
      scheduleKesfetCategoryMenuClose();
    });

    kesfetCategoryMenu.addEventListener("mouseenter", () => {
      clearKesfetCategoryHoverTimer(kesfetCategorySwitch);
    });

    kesfetCategoryTrigger.addEventListener("focus", () => {
      openKesfetCategoryMenu();
    });

    kesfetCategorySwitch.addEventListener("focusout", (event) => {
      const nextFocus = event.relatedTarget;
      if (nextFocus && kesfetCategorySwitch.contains(nextFocus)) {
        return;
      }
      closeKesfetCategoryMenu();
    });

    document.addEventListener("click", (event) => {
      if (event.target && event.target.closest && event.target.closest("[data-kesfet-category-switch]")) {
        return;
      }
      closeKesfetCategoryMenu();
    });
  }

  function syncDistrictTriggerLabel() {
    if (!kesfetDistrictCurrent) {
      return;
    }
    const raw = String(state.selectedDistrict || "").trim();
    kesfetDistrictCurrent.textContent = raw || "Tüm ilçeler";
  }

  function syncDistrictBoxVisuals() {
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

  function renderDistrictOptions() {
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
    syncDistrictBoxVisuals();
    syncDistrictTriggerLabel();
  }

  function initKesfetDistrictDropdown() {
    if (!kesfetDistrictSwitch || !kesfetDistrictTrigger || !kesfetDistrictMenu) {
      return;
    }

    kesfetDistrictTrigger.addEventListener("click", (event) => {
      event.preventDefault();
      if (kesfetDistrictMenu.hidden) {
        openKesfetDistrictMenu();
        return;
      }
      closeKesfetDistrictMenu();
    });

    kesfetDistrictSwitch.addEventListener("mouseenter", () => {
      clearKesfetDistrictHoverTimer(kesfetDistrictSwitch);
      openKesfetDistrictMenu();
    });

    kesfetDistrictSwitch.addEventListener("mouseleave", () => {
      scheduleKesfetDistrictMenuClose();
    });

    kesfetDistrictMenu.addEventListener("mouseenter", () => {
      clearKesfetDistrictHoverTimer(kesfetDistrictSwitch);
    });

    kesfetDistrictTrigger.addEventListener("focus", () => {
      openKesfetDistrictMenu();
    });

    kesfetDistrictSwitch.addEventListener("focusout", (event) => {
      const nextFocus = event.relatedTarget;
      if (nextFocus && kesfetDistrictSwitch.contains(nextFocus)) {
        return;
      }
      closeKesfetDistrictMenu();
    });

    document.addEventListener("click", (event) => {
      if (event.target && event.target.closest && event.target.closest("[data-kesfet-district-switch]")) {
        return;
      }
      closeKesfetDistrictMenu();
    });
  }

  async function loadFilters() {
    if (state.dataMode === "local") {
      const items = await loadLocalData();
      state.filters = buildLocalFilters(items);
      renderDistrictOptions();
      populateCategorySelect();
      return;
    }

    const filterParams = new URLSearchParams({ mainCategoryKey: "gezi" });
    const response = await fetch(`/api/mvp/istanbul/filters?${filterParams.toString()}`, {
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Gezi filtre verileri alınamadı. Lütfen sunucuyu kontrol et.");
    }

    const payload = await response.json();
    state.filters = {
      districts: Array.isArray(payload.districts) ? payload.districts : [],
      categoryOptions: [],
      categories: GEZI_CATEGORY_OPTIONS.slice(),
      tags: Array.isArray(payload.tags) ? payload.tags : [],
    };

    renderDistrictOptions();
    populateCategorySelect();
  }

  function buildQueryParams() {
    const params = new URLSearchParams();
    params.set("page", String(state.page));
    params.set("limit", String(state.limit));
    if (state.selectedDistrict) {
      params.set("district", state.selectedDistrict);
    }
    if (state.selectedCategory) {
      const cat = String(state.selectedCategory).trim();
      if (normalizeText(cat) === normalizeText(GEZI_TESIS_TIPLERI_LABEL)) {
        params.set("source", "ktb");
      } else if (Array.isArray(state.filters.categoryOptions) && state.filters.categoryOptions.length) {
        params.set("categoryId", state.selectedCategory);
      } else {
        params.set("category", state.selectedCategory);
      }
    }
    if (state.query) {
      params.set("q", state.query);
    }

    if (state.nearbyMode && state.userLocation) {
      params.set("lat", String(state.userLocation.lat));
      params.set("lng", String(state.userLocation.lng));
      params.set("radius", "8000");
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
      resultsState.textContent = "Bu filtrelerle mekan bulunamadı.";
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
      const contactLine = fragment.querySelector(".istanbul-venue-contact");
      const summaryLine = fragment.querySelector(".istanbul-venue-summary");
      const galleryRow = fragment.querySelector(".istanbul-venue-gallery");
      const rating = fragment.querySelector(".istanbul-venue-rating");
      const budget = fragment.querySelector(".istanbul-venue-budget");
      const tags = fragment.querySelector(".istanbul-venue-tags");
      const favoriteButton = fragment.querySelector(".istanbul-favorite-button");
      const actions = fragment.querySelector(".istanbul-venue-actions");
      const actionGroup = fragment.querySelector(".istanbul-venue-action-group");

      card.tabIndex = 0;
      if (item.slug === state.selectedVenueSlug) {
        card.classList.add("is-selected");
      }

      if (image && media) {
        const photoUri = resolveCardPhotoUri(item);
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

      // Eski alanları gizle (kültür/hizmetler tarzı sadeleştirilmiş kart)
      if (contactLine) { contactLine.hidden = true; contactLine.textContent = ""; }
      if (summaryLine) { summaryLine.hidden = true; summaryLine.textContent = ""; }
      const venueTypeRow = fragment.querySelector(".istanbul-venue-venue-type-row");
      if (venueTypeRow) { venueTypeRow.hidden = true; }
      if (galleryRow) { galleryRow.hidden = true; galleryRow.innerHTML = ""; }

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

      titleLink.textContent = item.name || "İsimsiz mekan";
      titleLink.href = buildDetailUrl(item.slug);

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
        link.href = `gezi.html?district=${encodeURIComponent(districtLabel)}`;
        link.setAttribute("aria-label", `${districtLabel} ilçesindeki mekanları aç`);
        link.textContent = districtLabel;
        tags.appendChild(link);
        consumeTagLabel(districtLabel);
      }

      const cuisineLabel = String(item.cuisine || item.category || "").trim();
      if (cuisineLabel && normalizeText(cuisineLabel) !== normalizeText(districtLabel)) {
        if (consumeTagLabel(cuisineLabel)) {
          const span = document.createElement("span");
          span.className = "istanbul-venue-tag";
          span.textContent = cuisineLabel;
          tags.appendChild(span);
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
          window.location.href = buildDetailUrl(item.slug);
          return;
        }
        selectVenue(item.slug);
      });
      card.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          if (opensVenueDetailFromCard) {
            window.location.href = buildDetailUrl(item.slug);
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
          if (state.selectedCategory && !categoryMatchesSelection(item, state.selectedCategory)) {
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
        } else if (shouldHighRatedRandomDiscoveryLocal()) {
          const pool = finalItems.slice();
          shuffleDiscoveryVenuesInPlace(pool);
          finalItems.length = 0;
          finalItems.push(...pool);
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
      const endpoint = state.nearbyMode && state.userLocation
        ? `/api/discovery/gezi/istanbul/venues/nearby?${params.toString()}`
        : `/api/discovery/gezi/istanbul/venues?${params.toString()}`;
      const response = await fetch(endpoint, {
        headers: {
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Gezi noktaları yüklenemedi. Lütfen sunucuyu kontrol et.");
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
      syncNearbyToggle();
    }
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
        syncNearbyToggle();
        setLocationMessage("Yakındaki mod aktif. Sonuçlar konumuna göre sıralanıyor.", false);
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

      queryInput.addEventListener("blur", () => {
        state.query = queryInput.value.trim();
        state.page = 1;
        loadVenues();
      });
    }

    const geziSearchForm = document.getElementById("istanbulGeziSearchForm");
    if (geziSearchForm && queryInput) {
      geziSearchForm.addEventListener("submit", (event) => {
        event.preventDefault();
        state.query = queryInput.value.trim();
        state.page = 1;
        loadVenues();
      });
    }

    if (districtOptionsContainer) {
      districtOptionsContainer.addEventListener("click", (event) => {
        const btn = event.target.closest(".istanbul-mvp-subcategory-box");
        if (!btn || !districtOptionsContainer.contains(btn) || !btn.hasAttribute("data-district-value")) {
          return;
        }
        state.selectedDistrict = btn.getAttribute("data-district-value") || "";
        syncDistrictBoxVisuals();
        syncDistrictTriggerLabel();
        closeKesfetDistrictMenu();
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
        } else if (btn.hasAttribute("data-category-id")) {
          state.selectedCategory = btn.getAttribute("data-category-id") || "";
        } else if (btn.hasAttribute("data-category-value")) {
          state.selectedCategory = btn.getAttribute("data-category-value") || "";
        } else {
          return;
        }
        syncCategoryChipVisuals();
        closeKesfetCategoryMenu();
        closeKesfetDistrictMenu();
        state.page = 1;
        loadVenues();
      });
    } else if (categorySelect) {
      categorySelect.addEventListener("change", () => {
        state.selectedCategory = categorySelect.value;
        state.page = 1;
        loadVenues();
      });
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
        closeKesfetCategoryMenu();
        closeKesfetDistrictMenu();
        closeCardShareMenus();
      }
    });

    initKesfetCategoryDropdown();
    initKesfetDistrictDropdown();
    syncKesfetCategoryTrigger();

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

      // Anasayfa chip'lerinden gelen subcategoryId parametresini oku
      const urlParams = new URLSearchParams(window.location.search);
      const subcatId = urlParams.get("subcategoryId");
      if (subcatId) {
        // Önce categoryOptions'tan (numeric id) eşleşme dene
        const categoryOptions = Array.isArray(state.filters.categoryOptions) ? state.filters.categoryOptions : [];
        const matchById = categoryOptions.find((c) => String(c.id) === String(subcatId));
        if (matchById) {
          state.selectedCategory = String(matchById.id);
        } else {
          // categoryOptions boşsa, API'den subcategory adını al ve string kategorilerle eşleştir
          try {
            const res = await fetch(
              "/api/public/content-model/subcategories?mainCategoryKey=gezi",
              { headers: { Accept: "application/json" } }
            );
            if (res.ok) {
              const data = await res.json();
              const items = Array.isArray(data.items) ? data.items : [];
              const found = items.find((s) => String(s.id) === String(subcatId));
              if (found && found.name) {
                const cats = Array.isArray(state.filters.categories) ? state.filters.categories : [];
                const catMatch = cats.find((c) => normalizeText(c) === normalizeText(found.name));
                if (catMatch) {
                  state.selectedCategory = catMatch;
                } else {
                  state.selectedCategory = found.name;
                }
              }
            }
          } catch (_e) { /* sustur */ }
        }
        syncCategoryChipVisuals();
        syncKesfetCategoryTrigger();
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
