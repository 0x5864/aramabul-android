(() => {
  // Hard refresh → her zaman sayfa başına dön
  if ('scrollRestoration' in history) { history.scrollRestoration = 'manual'; }
  window.scrollTo(0, 0);

  const storageKeys = Object.freeze({
    language: "aramabul.selectedLanguage.v1",
    theme: "aramabul.theme.v1",
    authUsers: "aramabul.auth.users.v1",
    authSession: "aramabul.auth.session.v1",
    userCityCache: "aramabul.user.city.cache.v1",
  });
  const supportedLanguages = new Set(["TR", "EN", "RU", "DE", "ZH"]);
  const scriptLoadPromises = new Map();
  const languageHtmlMap = Object.freeze({
    TR: "tr",
    EN: "en",
    RU: "ru",
    DE: "de",
    ZH: "zh",
  });
  const seoNoindexPaths = new Set([
    "/search.html",
    "/profile.html",
    "/account-settings.html",
    "/language-settings.html",
    "/feedback-settings.html",
    "/help-settings.html",
    "/about-settings.html",
    "/footer-page.html",
    "/restaurant.html",
    "/verify-email.html",
  ]);
  const footerPageKeyToPath = Object.freeze({
    hakkimizda: "/hakkimizda.html",
    iletisim: "/iletisim.html",
    sss: "/sss.html",
    kvkk: "/kvkk.html",
    gizlilik: "/gizlilik-politikasi.html",
    kosullar: "/kullanim-kosullari.html",
    cerez: "/cerez-politikasi.html",
    "yer-ekle": "/yer-ekle.html",
  });
  const canonicalParamSources = Object.freeze({
    sayfa: ["sayfa", "page", "key"],
    tur: ["tur", "type"],
    sehir: ["sehir", "city"],
    ilce: ["ilce", "district"],
    tt: ["tt", "tesis", "facilityType"],
    il: ["il"],
    kategori: ["kategori"],
    slug: ["slug"],
  });

  function normalizePathname(pathname) {
    const value = String(pathname || "/").trim() || "/";
    if (value === "/index.html") {
      return "/";
    }
    return value;
  }

  function canonicalOrigin() {
    const host = String(window.location.hostname || "").toLowerCase();
    if (host === "aramabul.com" || host === "www.aramabul.com") {
      return "https://aramabul.com";
    }
    return window.location.origin;
  }

  function canonicalParamKeysForPath(pathname) {
    const fileName = pathname.split("/").pop() || "";
    if (fileName === "footer-page.html") {
      return ["sayfa"];
    }
    if (fileName === "city.html") {
      return ["il", "ilce", "kategori"];
    }
    if (fileName === "venue-detail.html") {
      return ["slug"];
    }
    if (fileName.endsWith("-city.html")) {
      return ["tur", "sehir"];
    }
    if (fileName.endsWith("-district.html")) {
      return ["tur", "sehir", "ilce"];
    }
    if (fileName.endsWith("-mekanlar.html")) {
      return ["tur", "sehir", "ilce", "tt"];
    }
    return [];
  }

  function pickQueryValue(searchParams, canonicalKey) {
    const aliases = canonicalParamSources[canonicalKey] || [canonicalKey];
    for (const key of aliases) {
      const value = String(searchParams.get(key) || "").trim();
      if (value) {
        return value;
      }
    }
    return "";
  }

  function upsertMetaByName(name, content) {
    if (!name) {
      return;
    }
    let node = document.head.querySelector(`meta[name="${name}"]`);
    if (!(node instanceof HTMLMetaElement)) {
      node = document.createElement("meta");
      node.setAttribute("name", name);
      document.head.appendChild(node);
    }
    node.setAttribute("content", content);
  }

  function upsertCanonicalLink(href) {
    if (!href) {
      return;
    }
    let node = document.head.querySelector('link[rel="canonical"]');
    if (!(node instanceof HTMLLinkElement)) {
      node = document.createElement("link");
      node.setAttribute("rel", "canonical");
      document.head.appendChild(node);
    }
    node.setAttribute("href", href);
  }

  function buildCanonicalHref() {
    const pathname = normalizePathname(window.location.pathname);
    const searchParams = new URLSearchParams(window.location.search);
    if (pathname === "/footer-page.html") {
      const footerKey = pickQueryValue(searchParams, "sayfa");
      const mappedPath = footerPageKeyToPath[footerKey];
      if (mappedPath) {
        return `${canonicalOrigin()}${mappedPath}`;
      }
    }
    const canonicalParams = new URLSearchParams();
    const allowedKeys = canonicalParamKeysForPath(pathname);

    allowedKeys.forEach((key) => {
      let value = pickQueryValue(searchParams, key);
      if (!value && pathname.endsWith("/footer-page.html") && key === "sayfa") {
        value = "hakkimizda";
      }
      if (value) {
        canonicalParams.set(key, value);
      }
    });

    const query = canonicalParams.toString();
    return `${canonicalOrigin()}${pathname}${query ? `?${query}` : ""}`;
  }

  function applySeoDefaults() {
    if (!document.head) {
      return;
    }

    const pathname = normalizePathname(window.location.pathname);
    upsertCanonicalLink(buildCanonicalHref());

    const robotsValue = seoNoindexPaths.has(pathname) ? "noindex,nofollow" : "index,follow";
    upsertMetaByName("robots", robotsValue);
  }

  function readStorageValue(key) {
    try {
      return window.localStorage.getItem(key);
    } catch (_error) {
      return null;
    }
  }

  function writeStorageValue(key, value) {
    try {
      window.localStorage.setItem(key, value);
    } catch (_error) {
      // Ignore storage errors.
    }
  }

  function removeStorageValue(key) {
    try {
      window.localStorage.removeItem(key);
    } catch (_error) {
      // Ignore storage errors.
    }
  }

  function readJson(key, fallback = null) {
    try {
      const raw = readStorageValue(key);
      if (!raw) {
        return fallback;
      }
      return JSON.parse(raw);
    } catch (_error) {
      return fallback;
    }
  }

  function writeJson(key, value) {
    writeStorageValue(key, JSON.stringify(value));
  }

  function loadScriptOnce(src) {
    const normalizedSrc = String(src || "").trim();
    if (!normalizedSrc) {
      return Promise.reject(new Error("Script source is required."));
    }

    if (scriptLoadPromises.has(normalizedSrc)) {
      return scriptLoadPromises.get(normalizedSrc);
    }

    const existingScript = [...document.scripts].find((script) => {
      return script.getAttribute("src") === normalizedSrc;
    });

    if (existingScript) {
      const existingPromise = Promise.resolve(existingScript);
      scriptLoadPromises.set(normalizedSrc, existingPromise);
      return existingPromise;
    }

    const promise = new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = normalizedSrc;
      script.async = true;
      script.onload = () => resolve(script);
      script.onerror = () => {
        scriptLoadPromises.delete(normalizedSrc);
        reject(new Error("Failed to load script: " + normalizedSrc));
      };
      document.head.appendChild(script);
    });

    scriptLoadPromises.set(normalizedSrc, promise);
    return promise;
  }
  function dispatch(name, detail = {}) {
    document.dispatchEvent(new CustomEvent(name, { detail }));
  }

  function normalizeTheme(value) {
    const lowered = String(value || "").trim().toLowerCase();
    return lowered === "light" ? "light" : "dark";
  }

  function normalizeLanguage(value) {
    const code = String(value || "").trim().toUpperCase();
    return supportedLanguages.has(code) ? code : "TR";
  }

  function getStoredTheme() {
    return normalizeTheme(readStorageValue(storageKeys.theme));
  }

  function applyTheme(theme, persist = true) {
    const normalized = normalizeTheme(theme);
    if (document.body) {
      document.body.classList.toggle("theme-dark", normalized === "dark");
      document.body.classList.toggle("theme-light", normalized === "light");
    }
    document.documentElement.setAttribute("data-theme", normalized);
    window.ARAMABUL_CURRENT_THEME = normalized;
    if (persist) {
      writeStorageValue(storageKeys.theme, normalized);
    }
    return normalized;
  }

  function getStoredLanguage() {
    return normalizeLanguage(readStorageValue(storageKeys.language));
  }

  function setStoredLanguage(code, persist = true) {
    const selected = normalizeLanguage(code);
    document.documentElement.lang = languageHtmlMap[selected] || "tr";
    window.ARAMABUL_CURRENT_LANGUAGE = selected;
    if (persist) {
      writeStorageValue(storageKeys.language, selected);
    }
    return selected;
  }

  function readAuthSession() {
    const payload = readJson(storageKeys.authSession, null);
    if (!payload || typeof payload !== "object") {
      return null;
    }
    const name = typeof payload.name === "string" ? payload.name.trim() : "";
    const email = typeof payload.email === "string" ? payload.email.trim() : "";
    if (!name || !email) {
      return null;
    }
    return { name, email };
  }

  function writeAuthSession(session, emitEvent = true) {
    if (!session || typeof session !== "object") {
      return;
    }
    writeJson(storageKeys.authSession, {
      name: String(session.name || "").trim(),
      email: String(session.email || "").trim(),
    });
    if (emitEvent) {
      dispatch("aramabul:authchange");
    }
  }

  function clearAuthSession(emitEvent = true) {
    removeStorageValue(storageKeys.authSession);
    if (emitEvent) {
      dispatch("aramabul:authchange");
    }
  }

  function readAuthUsers() {
    const payload = readJson(storageKeys.authUsers, []);
    return Array.isArray(payload) ? payload : [];
  }

  function writeAuthUsers(users) {
    writeJson(storageKeys.authUsers, Array.isArray(users) ? users : []);
  }

  window.ARAMABUL_RUNTIME = {
    storageKeys,
    readStorageValue,
    writeStorageValue,
    removeStorageValue,
    readJson,
    writeJson,
    loadScriptOnce,
    dispatch,
    normalizeTheme,
    normalizeLanguage,
    getStoredTheme,
    applyTheme,
    getStoredLanguage,
    setStoredLanguage,
    readAuthSession,
    writeAuthSession,
    clearAuthSession,
    readAuthUsers,
    writeAuthUsers,
    applySeoDefaults,
  };

  window.openVenuePopup = function (venue) {
    if (!venue || typeof venue !== "object") return;

    // Create modal element
    const modal = document.createElement("div");
    modal.className = "venue-popup-modal";

    modal.innerHTML = `
      <div class="venue-popup-overlay"></div>
      <div class="venue-popup-content">
        <button class="venue-popup-close-btn" aria-label="Kapat">&times;</button>
        <div class="venue-popup-header" style="display: flex; flex-direction: column; gap: 0.35rem; padding-right: 3rem;">
          <div style="display: flex; align-items: center; justify-content: space-between; gap: 1.5rem; width: 100%;">
            <h2 class="venue-popup-title" style="margin: 0; padding-right: 0; font-size: 1.35rem; font-weight: 800; color: #000!important;">${venue.name || "Mekan"}</h2>
            <button class="venue-popup-info-chip-btn venue-popup-main-detail-btn" type="button" style="flex-shrink: 0;"><img src="assets/detail.png" class="venue-popup-chip-icon" alt="" />Ayrıntılı Bilgi</button>
          </div>
          ${venue.address ? `<p class="venue-popup-address" style="margin: 0; font-size: 0.85rem; color: #5d6a75; line-height: 1.3; font-weight: 500;">${venue.address}</p>` : ""}
        </div>
        
        <div class="venue-popup-body">
          <!-- Similar Venues Section -->
          <section class="venue-popup-similar-section">
            <div class="venue-popup-section-header">
              <h3 class="venue-popup-section-title">İlçedeki Benzer Mekanlar</h3>
              <div class="venue-popup-admin-container"></div>
            </div>
            <div class="venue-popup-similar-list">
              <p class="venue-popup-loading">Benzer mekanlar yükleniyor...</p>
            </div>
          </section>
          
          <!-- Review Form Section -->
          <section class="venue-popup-review-section">
            <h3 class="venue-popup-section-title">Yorum Yaz</h3>
            <form class="venue-popup-review-form">
              <div class="venue-popup-form-row">
                <input type="text" class="venue-popup-input-name" placeholder="Adınız" maxlength="80" />
              </div>
              <div class="venue-popup-form-row">
                <textarea class="venue-popup-textarea-text" placeholder="Yorumunuz" rows="3" maxlength="800" required></textarea>
              </div>
              <div class="venue-popup-form-actions">
                <button type="submit" class="venue-popup-submit-btn">Yorumu Gönder</button>
                <span class="venue-popup-form-status"></span>
              </div>
            </form>
          </section>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    // Prevent body scroll when popup is open
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    // Close function
    const closePopup = () => {
      modal.remove();
      document.body.style.overflow = originalOverflow;
    };

    modal.querySelector(".venue-popup-close-btn").onclick = closePopup;
    modal.querySelector(".venue-popup-overlay").onclick = closePopup;

    const mainDetailBtn = modal.querySelector(".venue-popup-main-detail-btn");
    if (mainDetailBtn) {
      let rawMapsUrl = (venue.mapsUrl || venue.mapUrl || "").trim();
      let isCoordsOnly = false;
      if (rawMapsUrl) {
        let queryPart = rawMapsUrl.split("query=")[1] || rawMapsUrl.split("destination=")[1] || "";
        let decodedQuery = "";
        try {
          decodedQuery = decodeURIComponent(queryPart);
        } catch (e) {
          decodedQuery = queryPart;
        }
        isCoordsOnly = rawMapsUrl.includes("query=") && !/[a-zA-Z]/.test(decodedQuery.replace(/[NSEWnsew°'"\s,.\-+\d]/g, ""));
        
        if (!isCoordsOnly) {
          let placeMatch = rawMapsUrl.match(/\/maps\/place\/([^/]+)/);
          if (placeMatch) {
            let decodedPlace = "";
            try {
              decodedPlace = decodeURIComponent(placeMatch[1]);
            } catch (e) {
              decodedPlace = placeMatch[1];
            }
            isCoordsOnly = !/[a-zA-Z]/.test(decodedPlace.replace(/[NSEWnsew°'"\s,.\-+\d]/g, ""));
          }
        }
        
        if (!isCoordsOnly && !/[a-zA-Z]/.test(rawMapsUrl.replace("https://", "").replace("http://", "").replace("www.google.com/maps", "").replace(/[NSEWnsew°'"\s,.\-+\d]/g, ""))) {
          isCoordsOnly = true;
        }
      }

      let primaryMapsUrl = "";
      if (rawMapsUrl && !isCoordsOnly) {
        primaryMapsUrl = rawMapsUrl;
      } else if (venue.sourcePlaceId || venue.placeId) {
        primaryMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent((venue.name || "") + " " + (venue.district || "") + " İstanbul")}&query_place_id=${venue.sourcePlaceId || venue.placeId}`;
      } else if (venue.name && venue.district) {
        primaryMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent((venue.name || "") + " " + (venue.district || "") + " İstanbul")}`;
      } else if (venue.latitude && venue.longitude) {
        primaryMapsUrl = `https://maps.google.com/maps?q=loc:${venue.latitude},${venue.longitude}(${encodeURIComponent(venue.name || "Mekan")})&hl=tr`;
      } else {
        const urlObj = new URL("https://www.google.com/maps/search/");
        urlObj.searchParams.set("api", "1");
        const query = [venue.name, venue.address, venue.district, "İstanbul"].filter(Boolean).join(" ");
        urlObj.searchParams.set("query", query);
        primaryMapsUrl = urlObj.toString();
      }

      mainDetailBtn.onclick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        window.open(primaryMapsUrl, "_blank", "noopener,noreferrer");
      };
    }

    // Fetch and render similar venues
    const similarList = modal.querySelector(".venue-popup-similar-list");
    const district = (venue.district || "").trim();
    const cuisine = (venue.cuisine || venue.categoryName || "").trim();

    // Helper to get Turkish locative suffix for Istanbul districts
    function getDistrictLocativeSuffix(dist) {
      if (!dist) return "";
      const d = dist.trim().toLowerCase();
      const suffixes = {
        'adalar': "Adalar'daki",
        'arnavutköy': "Arnavutköy'deki",
        'ataşehir': "Ataşehir'deki",
        'avcılar': "Avcılar'daki",
        'bağcılar': "Bağcılar'daki",
        'bahçelievler': "Bahçelievler'deki",
        'bakırköy': "Bakırköy'deki",
        'başakşehir': "Başakşehir'deki",
        'bayrampaşa': "Bayrampaşa'daki",
        'beşiktaş': "Beşiktaş'taki",
        'beykoz': "Beykoz'daki",
        'beylikdüzü': "Beylikdüzü'ndeki",
        'beyoğlu': "Beyoğlu'ndaki",
        'büyükçekmece': "Büyükçekmece'deki",
        'çatalca': "Çatalca'daki",
        'çekmeköy': "Çekmeköy'deki",
        'esenler': "Esenler'deki",
        'esenyurt': "Esenyurt'taki",
        'eyüpsultan': "Eyüpsultan'daki",
        'fatih': "Fatih'teki",
        'gaziosmanpaşa': "Gaziosmanpaşa'daki",
        'güngören': "Güngören'deki",
        'kadıköy': "Kadıköy'deki",
        'kağıthane': "Kağıthane'deki",
        'kartal': "Kartal'daki",
        'küçükçekmece': "Küçükçekmece'deki",
        'maltepe': "Maltepe'deki",
        'pendik': "Pendik'teki",
        'sancaktepe': "Sancaktepe'deki",
        'sarıyer': "Sarıyer'deki",
        'silivri': "Silivri'deki",
        'sultanbeyli': "Sultanbeyli'deki",
        'sultangazi': "Sultangazi'deki",
        'şile': "Şile'deki",
        'şişli': "Şişli'deki",
        'tuzla': "Tuzla'daki",
        'ümraniye': "Ümraniye'deki",
        'üsküdar': "Üsküdar'daki",
        'zeytinburnu': "Zeytinburnu'ndaki"
      };
      const normalized = d.replace(/i̇/g, "i");
      if (suffixes[normalized]) return suffixes[normalized];
      if (d.endsWith("oğlu") || d.endsWith("burnu")) return dist + "'ndaki";
      const vowels = dist.match(/[aıoueiöüAEIOUEIÖÜ]/g) || [];
      const lastVowel = vowels.length ? vowels[vowels.length - 1].toLowerCase() : 'e';
      const isBack = ['a', 'ı', 'o', 'u'].includes(lastVowel);
      const lastChar = d.charAt(d.length - 1);
      const isUnvoiced = ['f', 's', 't', 'k', 'ç', 'ş', 'h', 'p'].includes(lastChar);
      return dist + (isUnvoiced ? (isBack ? "'taki" : "'teki") : (isBack ? "'daki" : "'deki"));
    }

    // Helper to get Turkish plural form for category/cuisine
    function getTurkishPlural(word) {
      if (!word) return "Benzer Mekanlar";
      const w = word.trim();
      const lower = w.toLowerCase();
      if (lower === "akaryakıt" || lower === "akaryakit" || lower.includes("akaryakıt") || lower.includes("istasyon")) return "Akaryakıt İstasyonları";
      if (lower === "gezi" || lower.includes("gezi")) return "Gezi Noktaları";
      if (lower === "hizmet" || lower.includes("hizmet")) return "Hizmet Noktaları";
      if (lower === "sağlık" || lower === "saglik" || lower.includes("sağlık")) return "Sağlık Noktaları";
      if (lower === "kültür" || lower === "kultur" || lower.includes("kültür")) return "Kültür Noktaları";
      if (lower === "sanat" || lower.includes("sanat")) return "Sanat Noktaları";
      if (lower === "berber") return "Berberler";
      if (lower === "kuaför" || lower === "kuafor") return "Kuaförler";
      if (lower === "veteriner") return "Veterinerler";
      if (lower === "kafe" || lower === "cafe") return "Kafeler";
      if (lower === "restoran" || lower === "restaurant") return "Restoranlar";
      if (lower === "meyhane") return "Meyhaneler";
      if (lower === "doner" || lower === "döner") return "Dönerciler";
      if (lower === "kebap-et" || lower === "kebapet" || lower === "kebap") return "Kebap-Et Mekanları";
      if (lower === "tatlı-pasta" || lower === "tatli-pasta" || lower === "tatlı" || lower === "tatli") return "Tatlı-Pasta Mekanları";
      if (lower === "çiğköfte" || lower === "cigkofte") return "Çiğköfteciler";
      if (lower === "pide") return "Pideciler";
      if (lower === "kahvaltı" || lower === "kahvalti") return "Kahvaltı Mekanları";
      const vowels = w.match(/[aıoueiöüAEIOUEIÖÜ]/g) || [];
      const lastVowel = vowels.length ? vowels[vowels.length - 1].toLowerCase() : 'e';
      const isBack = ['a', 'ı', 'o', 'u'].includes(lastVowel);
      return w.charAt(0).toUpperCase() + w.slice(1) + (isBack ? "lar" : "ler");
    }

    // Set dynamic section title
    const sectionTitle = modal.querySelector(".venue-popup-similar-section .venue-popup-section-title");
    if (sectionTitle && district) {
      const locativeDistrict = getDistrictLocativeSuffix(district);
      const pluralCategory = getTurkishPlural(cuisine || venue.category || "Mekan");
      sectionTitle.textContent = `${locativeDistrict} ${pluralCategory}`;
    }

    // Helper to get coordinates
    const getCoordinates = (callback) => {
      try {
        const stored = sessionStorage.getItem("aramabul:userLocation");
        if (stored) {
          const loc = JSON.parse(stored);
          if (loc && loc.lat && loc.lng) {
            callback(loc);
            return;
          }
        }
      } catch (e) {}

      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
            try {
              sessionStorage.setItem("aramabul:userLocation", JSON.stringify(loc));
            } catch (e) {}
            callback(loc);
          },
          () => {
            callback(null);
          },
          { timeout: 2000, maximumAge: 60000 }
        );
      } else {
        callback(null);
      }
    };

    if (district || cuisine) {
      getCoordinates((loc) => {
        const params = new URLSearchParams();
        if (district) params.set("district", district);
        if (cuisine) params.set("category", cuisine);
        params.set("limit", "8");
        params.set("sort", "rating");
        if (loc && loc.lat && loc.lng) {
          params.set("lat", String(loc.lat));
          params.set("lng", String(loc.lng));
        }

        fetch("/api/mvp/istanbul/venues?" + params.toString())
          .then((r) => r.json())
          .then((data) => {
            const items = (data.items || []).filter((v) => v.id !== venue.id && v.slug !== venue.slug);
            similarList.innerHTML = "";
            
            if (!items.length) {
              similarList.innerHTML = '<p class="venue-popup-loading">Benzer mekan bulunamadı.</p>';
              return;
            }

            // Helper to calculate distance in meters using Haversine formula
            function computeDistanceMeters(loc1, loc2) {
              if (!loc1 || !loc2 || !loc2.latitude || !loc2.longitude) return null;
              const toRad = (x) => (x * Math.PI) / 180;
              const R = 6371000; // Earth radius in meters
              const lat1 = toRad(loc1.lat);
              const lon1 = toRad(loc1.lng);
              const lat2 = toRad(loc2.latitude);
              const lon2 = toRad(loc2.longitude);
              const dLat = lat2 - lat1;
              const dLon = lon2 - lon1;
              const a =
                Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
              const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
              return Math.round(R * c);
            }

            items.slice(0, 6).forEach((v) => {
              let rawMapsUrl = (v.mapsUrl || v.mapUrl || "").trim();
              let isCoordsOnly = false;
              if (rawMapsUrl) {
                let queryPart = rawMapsUrl.split("query=")[1] || rawMapsUrl.split("destination=")[1] || "";
                let decodedQuery = "";
                try {
                  decodedQuery = decodeURIComponent(queryPart);
                } catch (e) {
                  decodedQuery = queryPart;
                }
                isCoordsOnly = rawMapsUrl.includes("query=") && !/[a-zA-Z]/.test(decodedQuery.replace(/[NSEWnsew°'"\s,.\-+\d]/g, ""));
                
                if (!isCoordsOnly) {
                  let placeMatch = rawMapsUrl.match(/\/maps\/place\/([^/]+)/);
                  if (placeMatch) {
                    let decodedPlace = "";
                    try {
                      decodedPlace = decodeURIComponent(placeMatch[1]);
                    } catch (e) {
                      decodedPlace = placeMatch[1];
                    }
                    isCoordsOnly = !/[a-zA-Z]/.test(decodedPlace.replace(/[NSEWnsew°'"\s,.\-+\d]/g, ""));
                  }
                }
                
                if (!isCoordsOnly && !/[a-zA-Z]/.test(rawMapsUrl.replace("https://", "").replace("http://", "").replace("www.google.com/maps", "").replace(/[NSEWnsew°'"\s,.\-+\d]/g, ""))) {
                  isCoordsOnly = true;
                }
              }

              let mapsUrl = "";
              if (rawMapsUrl && !isCoordsOnly) {
                mapsUrl = rawMapsUrl;
              } else if (v.sourcePlaceId || v.placeId) {
                mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent((v.name || "") + " " + (v.district || "") + " İstanbul")}&query_place_id=${v.sourcePlaceId || v.placeId}`;
              } else if (v.name && v.district) {
                mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent((v.name || "") + " " + (v.district || "") + " İstanbul")}`;
              } else if (v.latitude && v.longitude) {
                mapsUrl = `https://maps.google.com/maps?q=loc:${v.latitude},${v.longitude}(${encodeURIComponent(v.name || "Mekan")})&hl=tr`;
              } else {
                const urlObj = new URL("https://www.google.com/maps/search/");
                urlObj.searchParams.set("api", "1");
                const query = [v.name, v.address, v.district, "İstanbul"].filter(Boolean).join(" ");
                urlObj.searchParams.set("query", query);
                mapsUrl = urlObj.toString();
              }

              const card = document.createElement("div");
              card.className = "venue-popup-similar-card";
              card.style.cursor = "pointer";
              card.onclick = () => {
                closePopup();
                window.openVenuePopup(v);
              };

              const metaText = [v.district, v.neighborhood].filter(Boolean).join(" - ");
              
              let distanceText = "";
              if (v.distanceMeters !== undefined && v.distanceMeters !== null) {
                const meters = Number(v.distanceMeters);
                if (meters < 1000) {
                  distanceText = `${meters} m`;
                } else {
                  distanceText = `${Number(meters / 1000).toFixed(1).replace(".", ",")} km`;
                }
              } else if (v.latitude && v.longitude && loc) {
                const dist = computeDistanceMeters(loc, v);
                if (dist !== null) {
                  if (dist < 1000) {
                    distanceText = `${dist} m`;
                  } else {
                    distanceText = `${Number(dist / 1000).toFixed(1).replace(".", ",")} km`;
                  }
                }
              }

              card.innerHTML = `
                <p class="venue-popup-similar-card-name">${v.name || ""}</p>
                ${metaText ? `<p class="venue-popup-similar-card-meta">${metaText}</p>` : ""}
                ${distanceText ? `<div class="venue-popup-distance-chip"><img src="assets/uzak.png" class="venue-popup-chip-icon" alt="" />${distanceText}</div>` : ""}
                <button class="venue-popup-info-chip-btn" type="button"><img src="assets/detail.png" class="venue-popup-chip-icon" alt="" />Ayrıntılı Bilgi</button>
              `;

              const infoBtn = card.querySelector(".venue-popup-info-chip-btn");
              if (infoBtn) {
                infoBtn.onclick = (e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  const finalMapsUrl = mapsUrl || v.mapsUrl || v.maps_url || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent((v.name || "") + " " + (v.district || "") + " İstanbul")}`;
                  window.open(finalMapsUrl, "_blank", "noopener,noreferrer");
                };
              }

              similarList.appendChild(card);
            });
          })
          .catch(() => {
            similarList.innerHTML = '<p class="venue-popup-loading">Benzer mekanlar yüklenirken bir hata oluştu.</p>';
          });
      });
    } else {
      similarList.innerHTML = '<p class="venue-popup-loading">Benzer mekan bulunamadı.</p>';
    }

    // Load admin edit icon if user is admin (local session + server session)
    const adminContainer = modal.querySelector(".venue-popup-admin-container");
    function renderAdminEditLink() {
      if (!venue.id) return;
      adminContainer.innerHTML = `
        <a href="admin-venues.html?venueId=${encodeURIComponent(venue.id)}" target="_blank" rel="noopener" class="venue-popup-admin-link" title="Admin'de düzenle">
          <img src="/assets/edit.png" alt="Düzenle" class="venue-popup-admin-icon" />
        </a>
      `;
    }
    // Require local user session — if not logged in, never show admin icon
    const localSession = readAuthSession();
    if (!localSession) {
      // Not logged in — skip admin checks entirely
    } else {
      const localEmail = (localSession.email || "").trim().toLowerCase();
      const isLocalAdmin = localEmail && (
        localEmail === 'admin@aramabul.com' ||
        localEmail === 'metin.tuncgenc@gmail.com' ||
        localEmail === 'aramabul.com@gmail.com' ||
        localEmail.startsWith('admin@') ||
        localEmail.endsWith('.admin')
      );
      if (isLocalAdmin) {
        renderAdminEditLink();
      } else {
        // Fallback: check server-side admin session
        fetch("/api/admin/auth/session", { credentials: "include" })
          .then((res) => (res.ok ? res.json() : null))
          .then((data) => {
            if (data && data.session) {
              renderAdminEditLink();
            }
          })
          .catch(() => {});
      }
    }

    // Review form submission
    const form = modal.querySelector(".venue-popup-review-form");
    const nameInput = modal.querySelector(".venue-popup-input-name");
    const textTextarea = modal.querySelector(".venue-popup-textarea-text");
    const statusNode = modal.querySelector(".venue-popup-form-status");

    form.onsubmit = async (e) => {
      e.preventDefault();
      const text = String(textTextarea.value || "").trim();
      const author = String(nameInput.value || "").trim();

      if (text.length < 3) {
        statusNode.textContent = "Lütfen kısa da olsa bir yorum yaz.";
        statusNode.className = "venue-popup-form-status is-error";
        textTextarea.focus();
        return;
      }

      statusNode.textContent = "Gönderiliyor...";
      statusNode.className = "venue-popup-form-status";

      try {
        const slug = String(venue.slug || "").trim();
        const fallback = [venue.name, venue.district].filter(Boolean).join("|");
        const venueKey = slug || fallback.toLowerCase().replace(/[^a-z0-9]+/g, "-");

        const response = await fetch("/api/venue-reviews", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            venueKey,
            venueName: venue.name || "",
            district: venue.district || "",
            author: author,
            text: text,
          }),
        });

        if (!response.ok) {
          throw new Error();
        }

        textTextarea.value = "";
        statusNode.textContent = "Yorumunuz onaya gönderildi.";
        statusNode.className = "venue-popup-form-status";
      } catch (err) {
        statusNode.textContent = "Yorum gönderilemedi.";
        statusNode.className = "venue-popup-form-status is-error";
      }
    };
  };

  applySeoDefaults();
})();
