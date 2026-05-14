(() => {
  const runtime = window.ARAMABUL_RUNTIME;
  const CATEGORY_SEARCH_ROUTES = [
    { href: "yeme-icme.html", keywords: ["yemek", "food", "restoran", "restaurant", "lokanta"] },
    { href: "hizmetler-ulkeler.html", keywords: ["hizmetler türkiye", "hizmet il", "hizmet ilçe"] },
    { href: "hizmetler.html", keywords: ["hizmetler", "hizmet keşfet", "hizmetler keşfet", "hizmetler istanbul", "hizmet noktası", "hizmet mekan", "hizmet keşif", "service", "services", "akaryakit", "akaryakıt", "benzin", "petrol", "fuel", "kuafor", "kuaför"] },
    { href: "kuafor.html", keywords: ["kuafor", "kuaför", "berber", "sac", "saç", "guzellik", "güzellik"] },
    { href: "veteriner.html", keywords: ["veteriner", "vet", "hayvan"] },
    { href: "saglik.html", keywords: ["eczane", "pharmacy", "saglik", "sağlık", "health", "klinik", "clinic"] },
    { href: "market.html", keywords: ["market", "supermarket", "süpermarket", "bakkal"] },
    { href: "yeme-icme.html", keywords: ["keyif", "meyhane", "meyhaneler", "rakı", "raki", "kafe", "cafe", "kahve", "kahvaltı", "kahvalti", "kebap", "doner", "döner", "pide", "lahmacun", "cigkofte", "çiğ köfte"] },
    { href: "hastane.html", keywords: ["hastane", "hospital"] },
    { href: "banka.html", keywords: ["banka", "bank"] },
    { href: "gezi-city.html?tur=dynamic&tt=Otel", keywords: ["otel", "hotel", "konaklama"] },
    { href: "gezi.html", keywords: ["gezi", "seyahat", "travel", "transport", "kamp", "kamp alani", "kamp alanı", "camping", "kamping", "karavan", "bungalov", "pansiyon", "konaklama", "otel"] },
    { href: "atm.html", keywords: ["atm"] },
    { href: "kargo.html", keywords: ["kargo", "cargo"] },
    { href: "noter.html", keywords: ["noter", "notary"] },
    { href: "asm.html", keywords: ["asm", "aile sagligi", "aile sağlığı", "aile hekimi"] },
    { href: "dis-klinikleri.html", keywords: ["dis", "diş", "dis klinigi", "diş kliniği", "dentist"] },
    { href: "duraklar.html", keywords: ["durak", "duraklar", "otobus", "otobüs", "metro", "tramvay"] },
    { href: "otopark.html", keywords: ["otopark", "park"] },
    { href: "kultur.html", keywords: ["kültür", "kultur", "müze", "muze", "tiyatro", "opera", "bale", "cami", "camiler"] },
    { href: "sanat.html", keywords: ["sanat", "galeri", "galeriler", "sergi", "art"] },
  ];
  const FALLBACK_SCRIPTS = Object.freeze({
    ARAMABUL_FALLBACK_DATA: "data/fallback-data.js?v=20260302-01",
    ARAMABUL_FALLBACK_CATEGORY_DATA: "data/fallback-category-data.js?v=20260302-01",
  });
  const FOOD_JSON_PATH = "data/yeme-icme-food.json";
  const DISTRICTS_JSON_PATH = "data/districts.json";
  const CATEGORY_DATASET_SOURCES = [
    {
      pageBase: "kuafor",
      dataPath: "data/kuafor.json",
      fallbacks: [{ globalKey: "ARAMABUL_FALLBACK_DATA", property: "kuafor" }],
    },
    {
      pageBase: "veteriner",
      dataPath: "data/veteriner.json",
      fallbacks: [{ globalKey: "ARAMABUL_FALLBACK_CATEGORY_DATA", property: "veteriner" }],
    },
    {
      pageBase: "eczane",
      dataPath: "data/eczane.json",
      fallbacks: [{ globalKey: "ARAMABUL_FALLBACK_CATEGORY_DATA", property: "eczane" }],
    },
    { pageBase: "eczane", dataPath: "data/nobetci-eczane.json", fallbacks: [] },
    {
      pageBase: "yeme-icme",
      dataPath: "data/yeme-icme.json",
      fallbacks: [],
    },
    { pageBase: "yeme-icme", dataPath: "data/yeme-icme-restoran.json", fallbacks: [] },
    { pageBase: "atm", dataPath: "data/atm.json", fallbacks: [] },
    { pageBase: "kargo", dataPath: "data/kargo.json", fallbacks: [] },
    { pageBase: "noter", dataPath: "data/noter.json", fallbacks: [] },
    { pageBase: "asm", dataPath: "data/asm.json", fallbacks: [] },
    { pageBase: "dis-klinikleri", dataPath: "data/dis-klinikleri.json", fallbacks: [] },
    { pageBase: "duraklar", dataPath: "data/duraklar.json", fallbacks: [] },
    { pageBase: "otopark", dataPath: "data/otopark.json", fallbacks: [] },
    { pageBase: "gezi", dataPath: "data/ktb-tesis-kayitlari-gezi.json", fallbacks: [], dynamicTypeEnabled: true },
    { pageBase: "kultur", dataPath: "data/kultur-camiler.json", fallbacks: [] },
    { pageBase: "kultur", dataPath: "data/kultur-devlet-tiyatrolari.json", fallbacks: [] },
    { pageBase: "kultur", dataPath: "data/kultur-muzeler.json", fallbacks: [] },
    { pageBase: "kultur", dataPath: "data/kultur-opera-bale.json", fallbacks: [] },
    { pageBase: "kultur", dataPath: "data/kultur-ozel-tiyatrolar.json", fallbacks: [] },
    { pageBase: "kultur", dataPath: "data/kultur-sehir-tiyatrolari.json", fallbacks: [] },
    { pageBase: "sanat", dataPath: "data/sanat-galeriler.json", fallbacks: [] },
  ];
  const DISTRICT_ROUTE_PAGE_BASES = new Set([
    "yemek",
    "hizmetler",
    "kuafor",
    "veteriner",
    "eczane",
    "yeme-icme",
    "otel",
    "atm",
    "kargo",
    "noter",
    "asm",
    "dis-klinikleri",
    "duraklar",
    "gezi",
    "otopark",
    "kultur",
    "sanat",
  ]);
  const CITY_ROUTE_PAGE_BASES = new Set([
    "yemek",
    "hizmetler",
    "kuafor",
    "veteriner",
    "eczane",
    "yeme-icme",
    "otel",
    "atm",
    "kargo",
    "noter",
    "asm",
    "dis-klinikleri",
    "duraklar",
    "gezi",
    "otopark",
    "kultur",
    "sanat",
  ]);
  const API_BASE_URL = (() => {
    if (typeof window.ARAMABUL_API_BASE === "string" && window.ARAMABUL_API_BASE.trim()) {
      return window.ARAMABUL_API_BASE.trim().replace(/\/+$/u, "");
    }

    if (window.location.hostname === "127.0.0.1" || window.location.hostname === "localhost") {
      return `${window.location.protocol}//${window.location.hostname}:8787`;
    }

    return window.location.origin;
  })();
  const DEFAULT_VENUES_CITY =
    typeof window.ARAMABUL_VENUES_CITY === "string" && window.ARAMABUL_VENUES_CITY.trim()
      ? window.ARAMABUL_VENUES_CITY.trim()
      : "İstanbul";
  const DEFAULT_VENUES_QUERY = new URLSearchParams({
    city: DEFAULT_VENUES_CITY,
    limit: "15000",
  }).toString();
  const VENUES_API_ENDPOINT =
    typeof window.ARAMABUL_VENUES_API === "string" && window.ARAMABUL_VENUES_API.trim()
      ? window.ARAMABUL_VENUES_API.trim()
      : API_BASE_URL
        ? `${API_BASE_URL}/api/venues?${DEFAULT_VENUES_QUERY}`
        : "";
  const turkishCharMap = {
    ç: "c",
    ğ: "g",
    ı: "i",
    i: "i",
    ö: "o",
    ş: "s",
    ü: "u",
  };

  let venuesPromise = null;
  let searchRecordsPromise = null;
  let cityNamesPromise = null;

  async function ensureFallbackGlobal(globalKey) {
    if (window[globalKey]) {
      return true;
    }

    const scriptSrc = FALLBACK_SCRIPTS[globalKey];
    if (!scriptSrc || !runtime || typeof runtime.loadScriptOnce !== "function") {
      return false;
    }

    try {
      await runtime.loadScriptOnce(scriptSrc);
    } catch (_error) {
      return false;
    }

    return Boolean(window[globalKey]);
  }
  function normalizeForSearch(value) {
    return String(value || "")
      .toLocaleLowerCase("tr")
      .replace(/[çğıöşü]/gu, (char) => turkishCharMap[char] || char)
      .normalize("NFC");
  }

  function canonicalize(value) {
    return normalizeForSearch(value)
      .replace(/[^a-z0-9\s]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  function toSlug(value) {
    return normalizeForSearch(value)
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  function buildDerivedVenueSlug(record) {
    if (!record || typeof record !== "object") {
      return "";
    }

    const name = sanitizeText(record.name);
    const district = sanitizeText(record.district) || "Merkez";
    const sourcePlaceId = sanitizeText(record.sourcePlaceId || record.placeId);
    const dedupeKey = sanitizeText(record.dedupeKey || record.dedupe_key);
    const nameSlug = toSlug(name);
    const districtSlug = toSlug(district);
    const baseSlug = [nameSlug, districtSlug].filter(Boolean).join("-");
    if (!baseSlug) {
      return "";
    }

    const uniqueSeed = toSlug(sourcePlaceId || dedupeKey || "");
    if (!uniqueSeed) {
      return baseSlug;
    }

    const suffix = uniqueSeed.slice(-6);
    return suffix ? `${baseSlug}-${suffix}` : baseSlug;
  }

  function sanitizeText(value) {
    if (typeof value !== "string") {
      return "";
    }

    return value.trim();
  }

  function normalizeVenueRecord(record, options = {}) {
    if (!record || typeof record !== "object") {
      return null;
    }

    const name = sanitizeText(record.name);
    const city = sanitizeText(record.city);
    const district = sanitizeText(record.district);
    const neighborhood = sanitizeText(record.neighborhood || record.mahalle);
    const slug = sanitizeText(record.slug);
    const postalCode = sanitizeText(record.postalCode || record.postcode);
    const address = sanitizeText(record.address);
    const sourcePlaceId = sanitizeText(record.sourcePlaceId || record.placeId);
    const dynamicType = options.dynamicTypeEnabled
      ? sanitizeText(record.sourceTesisTuru || record.type || record.cuisine)
      : "";
    const pageBase = sanitizeText(options.pageBase || "yemek");

    if (!name) {
      return null;
    }

    return {
      name,
      city,
      district,
      neighborhood,
      slug,
      postalCode,
      address,
      sourcePlaceId,
      dynamicType,
      pageBase,
      openAsRestaurant: Boolean(options.openAsRestaurant),
      canonicalName: canonicalize(name),
      canonicalSearchBlob: canonicalize(
        [name, city, district, neighborhood, postalCode, address, pageBase, dynamicType].join(" "),
      ),
    };
  }

  function normalizeVenueCollection(payload, options = {}) {
    if (Array.isArray(payload)) {
      return payload.map((record) => normalizeVenueRecord(record, options)).filter((venue) => venue !== null);
    }

    if (payload && typeof payload === "object") {
      const collection = Array.isArray(payload.venues)
        ? payload.venues
        : Array.isArray(payload.data)
          ? payload.data
          : Array.isArray(payload.items)
            ? payload.items
            : null;

      if (collection) {
        return collection.map((record) => normalizeVenueRecord(record, options)).filter((venue) => venue !== null);
      }
    }

    return [];
  }

  function dedupeVenueRecords(records) {
    const buckets = new Map();

    records.forEach((venue) => {
      if (!venue || typeof venue !== "object") {
        return;
      }

      const pageBase = sanitizeText(venue.pageBase);
      const locationKey = `${pageBase}|${canonicalize(venue.city)}|${canonicalize(venue.district)}|${venue.canonicalName}`;
      const bucket = buckets.get(locationKey) || [];
      bucket.push(venue);
      buckets.set(locationKey, bucket);
    });

    return Array.from(buckets.values()).flatMap((bucket) => {
      const withPlaceId = new Map();
      const withoutPlaceId = [];

      bucket.forEach((venue) => {
        const placeKey = sanitizeText(venue.sourcePlaceId);
        if (!placeKey) {
          withoutPlaceId.push(venue);
          return;
        }

        if (!withPlaceId.has(placeKey)) {
          withPlaceId.set(placeKey, venue);
          return;
        }

        const existing = withPlaceId.get(placeKey);
        if (recordQualityScore(venue) > recordQualityScore(existing)) {
          withPlaceId.set(placeKey, venue);
        }
      });

      if (withPlaceId.size > 0) {
        return Array.from(withPlaceId.values());
      }

      const bestWeakRecord = withoutPlaceId.reduce((best, venue) => {
        if (!best) {
          return venue;
        }

        return recordQualityScore(venue) > recordQualityScore(best) ? venue : best;
      }, null);

      return bestWeakRecord ? [bestWeakRecord] : [];
    });
  }

  function recordQualityScore(record) {
    if (!record || typeof record !== "object") {
      return 0;
    }

    let score = 0;
    if (sanitizeText(record.sourcePlaceId)) {
      score += 1000;
    }

    score += Math.min(sanitizeText(record.address).length, 240);
    score += Math.min(sanitizeText(record.city).length, 40);
    score += Math.min(sanitizeText(record.district).length, 40);
    return score;
  }

  async function readFallbackCollection(globalKey, property) {
    await ensureFallbackGlobal(globalKey);
    const payload = window[globalKey];
    if (!payload || typeof payload !== "object") {
      return [];
    }

    const collection = payload[property];
    return Array.isArray(collection) ? collection : [];
  }

  async function fetchVenuePayload(path) {
    try {
      const response = await fetch(path, {
        method: "GET",
        headers: { Accept: "application/json" },
        credentials: "omit",
      });

      if (!response.ok) {
        return null;
      }

      return await response.json();
    } catch (_error) {
      return null;
    }
  }

  async function loadVenues() {
    if (venuesPromise) {
      return venuesPromise;
    }

    venuesPromise = (async () => {
      if (!VENUES_API_ENDPOINT) {
        return [];
      }

      const apiPayload = await fetchVenuePayload(VENUES_API_ENDPOINT);
      return normalizeVenueCollection(apiPayload, {
        pageBase: "yeme-icme",
        openAsRestaurant: true,
      });
    })();

    return venuesPromise;
  }

  async function loadCategoryDataset(source) {
    const payload = await fetchVenuePayload(source.dataPath);
    const openAsRestaurant = source.pageBase === "yeme-icme";
    const records = normalizeVenueCollection(payload, {
      pageBase: source.pageBase,
      dynamicTypeEnabled: Boolean(source.dynamicTypeEnabled),
      openAsRestaurant,
    });
    if (records.length > 0) {
      return records;
    }

    const fallbackCollections = await Promise.all(
      source.fallbacks.map(async (fallback) => {
        const fallbackRecords = await readFallbackCollection(fallback.globalKey, fallback.property);
        return normalizeVenueCollection(fallbackRecords, {
          pageBase: source.pageBase,
          dynamicTypeEnabled: Boolean(source.dynamicTypeEnabled),
        });
      }),
    );

    return dedupeVenueRecords(fallbackCollections.flat());
  }

  async function loadSearchRecords() {
    if (searchRecordsPromise) {
      return searchRecordsPromise;
    }

    searchRecordsPromise = (async () => {
      const [foodRecords, categoryCollections] = await Promise.all([
        loadVenues(),
        Promise.all(CATEGORY_DATASET_SOURCES.map((source) => loadCategoryDataset(source))),
      ]);

      return dedupeVenueRecords([...foodRecords, ...categoryCollections.flat()]);
    })();

    return searchRecordsPromise;
  }

  async function fallbackDistrictMap() {
    await ensureFallbackGlobal("ARAMABUL_FALLBACK_DATA");
    const payload = window.ARAMABUL_FALLBACK_DATA;
    if (!payload || typeof payload !== "object") {
      return null;
    }

    const districts = payload.districts;
    if (!districts || typeof districts !== "object" || Array.isArray(districts)) {
      return null;
    }

    return districts;
  }

  async function loadCityNames() {
    if (cityNamesPromise) {
      return cityNamesPromise;
    }

    cityNamesPromise = (async () => {
      const fallbackMap = await fallbackDistrictMap();
      if (fallbackMap) {
        return Object.keys(fallbackMap);
      }

      const payload = await fetchVenuePayload(DISTRICTS_JSON_PATH);
      if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
        return [];
      }

      return Object.keys(payload);
    })();

    return cityNamesPromise;
  }

  async function findMatchingCityName(rawQuery, options = {}) {
    const { exactOnly = false } = options;
    const canonicalQuery = canonicalize(rawQuery);
    if (!canonicalQuery) {
      return "";
    }

    const cityNames = await loadCityNames();
    if (cityNames.length === 0) {
      return "";
    }

    const exact = cityNames.find((city) => canonicalize(city) === canonicalQuery);
    if (exact) {
      return exact;
    }

    if (exactOnly) {
      return "";
    }

    if (canonicalQuery.length < 3) {
      return "";
    }

    return cityNames.find((city) => {
      const canonicalCity = canonicalize(city);
      return canonicalCity.startsWith(canonicalQuery) || canonicalQuery.startsWith(canonicalCity);
    }) || "";
  }

  function dedupeMatchRecords(matches) {
    const seen = new Set();
    const out = [];
    matches.forEach((record) => {
      if (!record || typeof record !== "object") {
        return;
      }
      const placeKey = sanitizeText(record.sourcePlaceId);
      const key = placeKey || `${record.pageBase}|${record.canonicalName}`;
      if (seen.has(key)) {
        return;
      }
      seen.add(key);
      out.push(record);
    });
    return out;
  }

  function collectVenueSearchMatches(records, query) {
    const canonicalQuery = canonicalize(query);
    if (!canonicalQuery || canonicalQuery.length < 2) {
      return [];
    }

    const allowAmbiguousSet = (matches) =>
      canonicalQuery.length >= 4 || matches.length <= 8;

    const exactMatches = records.filter((record) => record.canonicalName === canonicalQuery);
    if (exactMatches.length) {
      return dedupeMatchRecords(exactMatches);
    }

    const prefixMatches = records.filter((record) => record.canonicalName.startsWith(canonicalQuery));
    if (prefixMatches.length === 1) {
      return dedupeMatchRecords(prefixMatches);
    }
    if (prefixMatches.length > 1 && allowAmbiguousSet(prefixMatches)) {
      return dedupeMatchRecords(prefixMatches);
    }

    if (canonicalQuery.length >= 3) {
      const containsMatches = records.filter((record) => record.canonicalName.includes(canonicalQuery));
      if (containsMatches.length === 1) {
        return dedupeMatchRecords(containsMatches);
      }
      if (containsMatches.length > 1 && allowAmbiguousSet(containsMatches)) {
        return dedupeMatchRecords(containsMatches);
      }

      const queryTokens = canonicalQuery.split(" ").filter((token) => token.length >= 2);
      if (queryTokens.length >= 2) {
        const tokenMatches = records.filter((record) =>
          queryTokens.every((token) => record.canonicalSearchBlob.includes(token)),
        );
        if (tokenMatches.length === 1) {
          return dedupeMatchRecords(tokenMatches);
        }
        if (tokenMatches.length > 1 && allowAmbiguousSet(tokenMatches)) {
          return dedupeMatchRecords(tokenMatches);
        }
      }

      if (canonicalQuery.length >= 5) {
        const blobMatches = records.filter((record) =>
          record.canonicalSearchBlob.includes(canonicalQuery),
        );
        const blobDeduped = dedupeMatchRecords(blobMatches);
        if (blobDeduped.length === 1) {
          return blobDeduped;
        }
        if (blobDeduped.length > 1 && allowAmbiguousSet(blobDeduped)) {
          return blobDeduped;
        }
      }
    }

    return [];
  }

  function findExactMatchingRecords(records, query) {
    const canonicalQuery = canonicalize(query);
    if (!canonicalQuery) {
      return [];
    }

    return records.filter((record) => record.canonicalName === canonicalQuery);
  }

  function findMatchingCategoryPage(rawQuery, options = {}) {
    const { exactOnly = false } = options;
    const canonicalQuery = canonicalize(rawQuery);
    if (!canonicalQuery) {
      return null;
    }

    for (const route of CATEGORY_SEARCH_ROUTES) {
      for (const keyword of route.keywords) {
        if (canonicalize(keyword) === canonicalQuery) {
          return route.href;
        }
      }
    }

    if (exactOnly) {
      return null;
    }

    if (canonicalQuery.length < 2) {
      return null;
    }

    for (const route of CATEGORY_SEARCH_ROUTES) {
      for (const keyword of route.keywords) {
        const canonicalKeyword = canonicalize(keyword);
        if (canonicalQuery.includes(canonicalKeyword) || canonicalKeyword.includes(canonicalQuery)) {
          return route.href;
        }
      }
    }

    return null;
  }

  function routeResult(href) {
    return {
      type: "navigate",
      href: String(href || "").trim(),
    };
  }

  function notFoundResult(message = "Kayıt bulunamamıştır.") {
    return {
      type: "not_found",
      message: String(message || "").trim() || "Kayıt bulunamamıştır.",
    };
  }

  function choiceLabelFor(record) {
    const city = sanitizeText(record.city);
    const district = sanitizeText(record.district);
    const neighborhood = sanitizeText(record.neighborhood);
    const address = sanitizeText(record.address);
    const location = [city, district, neighborhood].filter(Boolean).join(" / ");
    if (location && address) {
      return `${location} - ${address}`;
    }
    return location || address;
  }

  function choiceResult(records) {
    const orderedRecords = [...records].sort((left, right) => {
      return choiceLabelFor(left).localeCompare(choiceLabelFor(right), "tr");
    });

    return {
      type: "choices",
      choices: orderedRecords.map((record) => ({
        title: record.name,
        subtitle: choiceLabelFor(record),
        href: categoryUrlFor(record),
      })),
    };
  }

  function applyVenueParams(targetUrl, record) {
    if (!(targetUrl instanceof URL) || !record || typeof record !== "object") {
      return;
    }

    if (record.name) {
      targetUrl.searchParams.set("mekan", String(record.name).trim());
    }

    if (record.sourcePlaceId) {
      targetUrl.searchParams.set("pid", String(record.sourcePlaceId).trim());
    }
  }

  function categoryUrlFor(record) {
    const pageBase = sanitizeText(record.pageBase);
    if (!pageBase) {
      return cityUrlFor(record.city || record.name || "");
    }

    if (record.openAsRestaurant) {
      const targetUrl = new URL("venue-detail.html", window.location.href);
      const slugValue = sanitizeText(record.slug) || buildDerivedVenueSlug(record);
      if (slugValue) {
        targetUrl.searchParams.set("slug", slugValue);
        return `${targetUrl.pathname}${targetUrl.search}`;
      }
      const venueName = sanitizeText(record.name);
      if (venueName) {
        targetUrl.searchParams.set("venue", venueName);
        targetUrl.searchParams.set("district", sanitizeText(record.district || ""));
        return `${targetUrl.pathname}${targetUrl.search}`;
      }
    }

    const dynamicType = sanitizeText(record.dynamicType);
    if (pageBase === "gezi" && dynamicType) {
      if (record.city && record.district) {
        const targetUrl = new URL("gezi-mekanlar.html", window.location.href);
        targetUrl.searchParams.set("tur", "dynamic");
        targetUrl.searchParams.set("tt", dynamicType);
        targetUrl.searchParams.set("sehir", toSlug(record.city));
        targetUrl.searchParams.set("ilce", toSlug(record.district));
        applyVenueParams(targetUrl, record);
        return `${targetUrl.pathname}${targetUrl.search}`;
      }

      if (record.city) {
        const targetUrl = new URL("gezi-district.html", window.location.href);
        targetUrl.searchParams.set("tur", "dynamic");
        targetUrl.searchParams.set("tt", dynamicType);
        targetUrl.searchParams.set("sehir", toSlug(record.city));
        applyVenueParams(targetUrl, record);
        return `${targetUrl.pathname}${targetUrl.search}`;
      }

      const targetUrl = new URL("gezi-city.html", window.location.href);
      targetUrl.searchParams.set("tur", "dynamic");
      targetUrl.searchParams.set("tt", dynamicType);
      applyVenueParams(targetUrl, record);
      return `${targetUrl.pathname}${targetUrl.search}`;
    }

    if (record.city && record.district && DISTRICT_ROUTE_PAGE_BASES.has(pageBase)) {
      const targetUrl = new URL(`${pageBase}-district.html`, window.location.href);
      targetUrl.searchParams.set("sehir", toSlug(record.city));
      targetUrl.searchParams.set("ilce", toSlug(record.district));
      applyVenueParams(targetUrl, record);
      return `${targetUrl.pathname}${targetUrl.search}`;
    }

    if (record.city && CITY_ROUTE_PAGE_BASES.has(pageBase)) {
      const targetUrl = new URL(`${pageBase}-city.html`, window.location.href);
      targetUrl.searchParams.set("sehir", toSlug(record.city));
      applyVenueParams(targetUrl, record);
      return `${targetUrl.pathname}${targetUrl.search}`;
    }

    return `${pageBase}.html`;
  }

  function cityUrlFor(rawQuery) {
    const targetUrl = new URL("city.html", window.location.href);
    targetUrl.searchParams.set("il", toSlug(rawQuery));
    return `${targetUrl.pathname}${targetUrl.search}`;
  }

  async function fetchVenuesByApiTextSearch(rawQuery) {
    const query = String(rawQuery || "").trim();
    if (query.length < 2 || !API_BASE_URL) {
      return [];
    }

    const normalizeOpts = {
      pageBase: "yeme-icme",
      openAsRestaurant: true,
    };

    const mvpParams = new URLSearchParams();
    mvpParams.set("q", query);
    mvpParams.set("limit", "50");
    const mvpUrl = `${API_BASE_URL}/api/mvp/istanbul/venues?${mvpParams.toString()}`;

    const legacyParams = new URLSearchParams();
    legacyParams.set("city", DEFAULT_VENUES_CITY);
    legacyParams.set("limit", "50");
    legacyParams.set("q", query);
    const legacyUrl = `${API_BASE_URL}/api/venues?${legacyParams.toString()}`;

    const [mvpPayload, legacyPayload] = await Promise.all([
      fetchVenuePayload(mvpUrl),
      fetchVenuePayload(legacyUrl),
    ]);

    const merged = [
      ...normalizeVenueCollection(mvpPayload, normalizeOpts),
      ...normalizeVenueCollection(legacyPayload, normalizeOpts),
    ];
    return dedupeVenueRecords(merged);
  }

  async function resolveQuery(rawQuery) {
    const query = String(rawQuery || "").trim();
    if (!query) {
      return "";
    }

    const exactCategoryPage = findMatchingCategoryPage(query, { exactOnly: true });
    if (exactCategoryPage) {
      return routeResult(exactCategoryPage);
    }

    const exactCity = await findMatchingCityName(query, { exactOnly: true });
    if (exactCity) {
      return routeResult(cityUrlFor(exactCity));
    }

    const [records, apiTextMatches] = await Promise.all([
      loadSearchRecords(),
      fetchVenuesByApiTextSearch(query),
    ]);

    const exactRecords = findExactMatchingRecords(records, query);
    if (exactRecords.length > 1) {
      return choiceResult(exactRecords);
    }

    if (exactRecords.length === 1) {
      return routeResult(categoryUrlFor(exactRecords[0]));
    }

    const venueMatches = collectVenueSearchMatches(records, query);
    if (venueMatches.length > 1) {
      return choiceResult(venueMatches);
    }
    if (venueMatches.length === 1) {
      return routeResult(categoryUrlFor(venueMatches[0]));
    }

    if (venueMatches.length === 0 && apiTextMatches.length > 1) {
      return choiceResult(apiTextMatches);
    }
    if (venueMatches.length === 0 && apiTextMatches.length === 1) {
      return routeResult(categoryUrlFor(apiTextMatches[0]));
    }

    const queryTokenCount = canonicalize(query).split(" ").filter(Boolean).length;
    const matchedCategoryPage = queryTokenCount === 1
      ? findMatchingCategoryPage(query)
      : null;
    if (matchedCategoryPage) {
      return routeResult(matchedCategoryPage);
    }

    const matchedCity = await findMatchingCityName(query);
    if (matchedCity) {
      return routeResult(cityUrlFor(matchedCity));
    }

    return notFoundResult();
  }

  window.ARAMABUL_HEADER_SEARCH_DATA = {
    resolveQuery,
  };
})();
