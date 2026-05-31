"use strict";

class FeaturedVenues {
  t(key) {
    const headerI18n = window.ARAMABUL_HEADER_I18N;
    if (headerI18n && typeof headerI18n.getStaticUiTranslation === "function") {
      return headerI18n.getStaticUiTranslation(key) || key;
    }
    return key;
  }

  constructor() {
    this.userLocation = null;
    this.geoStatus = null;
    this.favoriteIds = new Set();
    this.featuredVenues = {
      mostCommented: null,
      highestRated: null,
      nearestHighest: null,
    };
    this.init();
  }

  async init() {
    this.bindShareMenus();
    this.bindFeaturedCardOpenDetail();
    this.bindFavoriteButtons();
    await this.loadStaticFeaturedCards();
    await this.loadFavoriteIds();
    this.requestLocationForDistances();
  }

  bindFavoriteButtons() {
    const grid = document.querySelector(".featured-venues-grid");
    if (!grid) return;
    grid.addEventListener("click", async (event) => {
      const btn = event.target instanceof Element ? event.target.closest(".istanbul-favorite-button") : null;
      if (!btn) return;
      event.preventDefault();
      event.stopPropagation();
      const card = btn.closest(".istanbul-venue-card");
      if (!card || !card.venue || !card.venue.id) return;
      btn.disabled = true;
      try {
        await this.toggleFavorite(card.venue.id, btn);
      } catch (e) {
        console.warn("Favori hatası:", e);
      } finally {
        btn.disabled = false;
      }
    });
  }

  async toggleFavorite(venueId, btn) {
    const key = String(venueId);
    const isFav = this.favoriteIds.has(key);
    const response = await fetch(`/api/mvp/favorites/${encodeURIComponent(venueId)}`, {
      method: isFav ? "DELETE" : "POST",
      headers: { Accept: "application/json" },
    });
    if (!response.ok) throw new Error("Favori işlemi başarısız.");
    if (isFav) {
      this.favoriteIds.delete(key);
    } else {
      this.favoriteIds.add(key);
    }
    this.syncAllFavoriteButtons();
  }

  async loadFavoriteIds() {
    const allVenues = Object.values(this.featuredVenues).filter(Boolean);
    const ids = allVenues.map((v) => v.id).filter((id) => id != null);
    if (!ids.length) return;
    try {
      const params = new URLSearchParams();
      params.set("venueIds", ids.join(","));
      const response = await fetch(`/api/mvp/favorites/ids?${params.toString()}`, {
        headers: { Accept: "application/json" },
      });
      if (!response.ok) return;
      const payload = await response.json();
      this.favoriteIds = new Set(
        Array.isArray(payload.ids) ? payload.ids.map((id) => String(id)) : []
      );
      this.syncAllFavoriteButtons();
    } catch (_e) { /* ignore */ }
  }

  syncAllFavoriteButtons() {
    const grid = document.querySelector(".featured-venues-grid");
    if (!grid) return;
    grid.querySelectorAll(".istanbul-venue-card").forEach((card) => {
      if (!card.venue) return;
      
      const btn = card.querySelector(".istanbul-favorite-button");
      if (btn) {
        this.updateFavoriteButton(btn, String(card.venue.id));
      }
      
      const chip = card.querySelector(".istanbul-favorite-chip");
      if (chip) {
        this.updateFavoriteButton(chip, String(card.venue.id));
      }
    });
  }

  updateFavoriteButton(btn, venueId) {
    const isFav = this.favoriteIds.has(String(venueId));
    if (btn.classList.contains("istanbul-favorite-chip")) {
      btn.innerHTML = `<img src="assets/fav.png" class="venue-popup-chip-icon" alt="" />${isFav ? this.t("Favorilerde") : this.t("Favorilere Ekle")}`;
      btn.classList.toggle("is-favorited", isFav);
      btn.setAttribute("aria-pressed", isFav ? "true" : "false");
    } else {
      btn.textContent = isFav ? this.t("Kaydedildi") : this.t("Kaydet");
      btn.classList.toggle("is-active", isFav);
      btn.setAttribute("aria-pressed", isFav ? "true" : "false");
    }
  }

  bindFeaturedCardOpenDetail() {
    const grid = document.querySelector(".featured-venues-grid");
    if (!grid) {
      return;
    }

    const go = (card) => {
      const venue = card.venue;
      if (!venue) {
        return;
      }
      if (typeof window.openVenuePopup === "function") {
        window.openVenuePopup(venue);
      }
    };

    grid.addEventListener("click", (event) => {
      const target = event.target;
      if (!(target instanceof Element)) {
        return;
      }

      const titleLink = target.closest(".istanbul-venue-title-link");
      if (titleLink) {
        event.preventDefault();
        event.stopPropagation();
        const card = titleLink.closest(".istanbul-venue-card");
        if (card && grid.contains(card)) {
          go(card);
        }
        return;
      }

      if (target.closest("a, button")) {
        return;
      }
      const card = target.closest(".istanbul-venue-card");
      if (!card || !grid.contains(card)) {
        return;
      }
      go(card);
    });

    grid.addEventListener("keydown", (event) => {
      if (event.key !== "Enter" && event.key !== " ") {
        return;
      }
      const target = event.target;
      if (!(target instanceof Element)) {
        return;
      }

      const titleLink = target.closest(".istanbul-venue-title-link");
      if (titleLink) {
        event.preventDefault();
        event.stopPropagation();
        const card = titleLink.closest(".istanbul-venue-card");
        if (card && grid.contains(card)) {
          go(card);
        }
        return;
      }

      if (target.closest("a, button")) {
        return;
      }
      const card = target.closest(".istanbul-venue-card");
      if (!card || !grid.contains(card) || !card.venue) {
        return;
      }
      event.preventDefault();
      go(card);
    });
  }

  async loadStaticFeaturedCards() {
    try {
      await this.loadRandomFeaturedCards();
    } catch (error) {
      console.warn("Featured cards failed:", error);
      this.renderCardError("featured-highest-rated");
      this.renderCardError("featured-most-comments");
      this.renderCardError("featured-nearest-highest");
    }
  }

  hasValidPhoto(item) {
    if (!item) return false;
    const photo = item.photoUri || item.photoUrl || item.imageUrl || item.image || item.coverImageUrl;
    if (typeof photo !== "string") return false;
    const val = photo.trim().toLowerCase();
    if (!val) return false;
    if (val.includes("al8-snh-") || val.includes("al8-snhylsmxv7pa75n") || val.includes("staticmap") || val.includes("maps.google") || val.includes("static-maps.yandex") || val.includes("s100x100")) return false;
    if (val === "null" || val === "undefined" || val === "none" || val === "placeholder" || val === "empty" || val === "false") return false;
    if (val.includes("no-image") || val.includes("noimage") || val.includes("no_image") || val.includes("no-photo") || val.includes("nophoto")) return false;
    if (val.includes("placeholder") || val.includes("upload-img") || val.includes("upload_img") || val.includes("<img")) return false;
    if (val.includes("default-") || val.includes("default_") || val.includes("/default.") || val.includes("/defaultog") || val.includes("og-image") || val.includes("social-image") || val.includes("stock/")) return false;
    if (!val.startsWith("http://") && !val.startsWith("https://")) return false;
    return true;
  }

  pickRandomUnique(venues, count) {
    const list = (Array.isArray(venues) ? venues : []).filter(Boolean);
    const withPhotos = list.filter((v) => this.hasValidPhoto(v));
    const withoutPhotos = list.filter((v) => !this.hasValidPhoto(v));

    // Shuffle both separately
    for (let i = withPhotos.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [withPhotos[i], withPhotos[j]] = [withPhotos[j], withPhotos[i]];
    }
    for (let i = withoutPhotos.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [withoutPhotos[i], withoutPhotos[j]] = [withoutPhotos[j], withoutPhotos[i]];
    }

    const combined = [...withPhotos, ...withoutPhotos];
    const out = [];
    const seen = new Set();
    for (const v of combined) {
      const k = this.getVenueKey(v);
      if (!k || seen.has(k)) {
        continue;
      }
      seen.add(k);
      out.push(v);
      if (out.length >= count) {
        break;
      }
    }
    return out;
  }

  async loadRandomFeaturedCards() {
    const grid = document.querySelector(".featured-venues-grid");
    if (!grid) return;
    
    // Clear the grid first to remove placeholders/static nodes
    grid.innerHTML = "";
    
    const template = document.getElementById("istanbulVenueCardTemplate");
    if (!template) {
      console.warn("Template istanbulVenueCardTemplate bulunamadı.");
      return;
    }

    const seed = Math.floor(Math.random() * 2000000000);
    // Fetch random active food & drink (yeme-icme) venues from API.
    // Note: Do NOT use photoState: "has_photo" here because the database's PRIMARY_VENUE_PHOTO_SQL
    // filters out anything with "assets/" (our fallback generic category photos).
    const items = await this.fetchMvpVenues("random", 100, {
      domainKey: "yeme-icme",
      randomSeed: seed
    });

    // Group by cuisine to ensure cuisine-diverse featured cards
    const groups = new Map();
    for (const v of items) {
      const key = String(v.cuisine || v.categoryName || "_unknown").trim();
      if (!groups.has(key)) {
        groups.set(key, []);
      }
      groups.get(key).push(v);
    }

    // Shuffle each cuisine group
    for (const [, arr] of groups) {
      for (let i = arr.length - 1; i > 0; i -= 1) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
    }

    // Shuffle cuisine keys (excluding unknown) to ensure random category distribution
    const groupKeys = Array.from(groups.keys()).filter((k) => k !== "_unknown" && k !== "");
    for (let i = groupKeys.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [groupKeys[i], groupKeys[j]] = [groupKeys[j], groupKeys[i]];
    }

    const picks = [];
    const seen = new Set();

    // Pick 1 venue per different cuisine.
    // We prefer venues with real external photos (starts with http/https) but fallback to generic photos.
    for (const gk of groupKeys) {
      if (picks.length >= 3) break;
      const arr = groups.get(gk);
      
      const withExternal = arr.filter((v) => v.photoUri && (v.photoUri.startsWith("http://") || v.photoUri.startsWith("https://")));
      const withoutExternal = arr.filter((v) => !withExternal.includes(v));
      const combinedArr = [...withExternal, ...withoutExternal];

      for (const v of combinedArr) {
        const k = this.getVenueKey(v);
        if (k && !seen.has(k)) {
          seen.add(k);
          picks.push(v);
          break;
        }
      }
    }

    const cardIds = ["featured-most-comments", "featured-highest-rated", "featured-nearest-highest"];
    const keys = ["mostCommented", "highestRated", "nearestHighest"];
    this.featuredVenues.mostCommented = null;
    this.featuredVenues.highestRated = null;
    this.featuredVenues.nearestHighest = null;

    for (let i = 0; i < 3; i += 1) {
      const venue = picks[i] || null;
      this.featuredVenues[keys[i]] = venue;

      // Clone the template
      const fragment = template.content.cloneNode(true);
      const card = fragment.querySelector(".istanbul-venue-card");
      if (card) {
        card.id = cardIds[i]; // Assign the ID matching existing methods
      }
      grid.appendChild(fragment);

      if (venue) {
        this.updateVenueCard(cardIds[i], venue, { showDistance: true });
      } else {
        this.renderCardError(cardIds[i]);
      }
    }
  }

  pickDiverseByCategory(venues, count) {
    const list = (Array.isArray(venues) ? venues : []).filter(Boolean);
    // Group by mainCategoryName
    const groups = new Map();
    for (const v of list) {
      const key = v.mainCategoryName || v.categoryName || v.cuisine || "_unknown";
      if (!groups.has(key)) {
        groups.set(key, []);
      }
      groups.get(key).push(v);
    }
    // Shuffle each group
    for (const [, arr] of groups) {
      for (let i = arr.length - 1; i > 0; i -= 1) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
    }
    // Shuffle group keys
    const groupKeys = Array.from(groups.keys());
    for (let i = groupKeys.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [groupKeys[i], groupKeys[j]] = [groupKeys[j], groupKeys[i]];
    }
    // Pick one from each different group
    const out = [];
    const usedKeys = new Set();
    const usedVenueKeys = new Set();
    for (const gk of groupKeys) {
      if (out.length >= count) break;
      const arr = groups.get(gk);
      for (const v of arr) {
        const vk = this.getVenueKey(v);
        if (vk && usedVenueKeys.has(vk)) continue;
        out.push(v);
        usedKeys.add(gk);
        if (vk) usedVenueKeys.add(vk);
        break;
      }
    }
    // If not enough groups, fill from remaining
    if (out.length < count) {
      for (const gk of groupKeys) {
        if (out.length >= count) break;
        const arr = groups.get(gk);
        for (const v of arr) {
          const vk = this.getVenueKey(v);
          if (vk && usedVenueKeys.has(vk)) continue;
          out.push(v);
          if (vk) usedVenueKeys.add(vk);
          break;
        }
      }
    }
    return out;
  }

  async fetchMvpVenues(sort, limit, extraParams = {}) {
    const params = new URLSearchParams({
      sort,
      limit: String(limit),
    });
    if (this.userLocation) {
      params.set("lat", String(this.userLocation.lat));
      params.set("lng", String(this.userLocation.lng));
    }
    Object.entries(extraParams).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== "") {
        params.set(key, String(value));
      }
    });
    const response = await fetch(`/api/mvp/istanbul/venues?${params.toString()}`, {
      headers: { Accept: "application/json" },
    });
    if (!response.ok) {
      throw new Error("Öne çıkan mekanlar alınamadı.");
    }
    const payload = await response.json();
    return Array.isArray(payload.items) ? payload.items : [];
  }

  getVenueKey(venue) {
    if (!venue) {
      return "";
    }
    const slug = String(venue.slug || "").trim();
    if (slug) {
      return `slug:${slug}`;
    }
    return `name:${this.normalizeLookup(venue.name)}|${this.normalizeLookup(venue.district)}`;
  }

  requestLocationForDistances() {
    if (!navigator.geolocation) {
      this.geoStatus = "unavailable";
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        this.userLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        this.geoStatus = "granted";
        this.refreshVisibleDistances();
      },
      (error) => {
        this.geoStatus = error && error.code === 3 ? "timeout" : "denied";
      },
      {
        enableHighAccuracy: true,
        timeout: 4500,
        maximumAge: 120000,
      },
    );
  }

  refreshVisibleDistances() {
    [
      ["featured-most-comments", this.featuredVenues.mostCommented],
      ["featured-highest-rated", this.featuredVenues.highestRated],
      ["featured-nearest-highest", this.featuredVenues.nearestHighest],
    ].forEach(([cardId, venue]) => {
      if (venue) {
        this.updateDistance(cardId, venue, true);
      }
    });
  }

  renderCardError(cardId) {
    const card = document.getElementById(cardId);
    if (!card) {
      return;
    }
    card.venue = null;
    card.tabIndex = -1;
    const title = card.querySelector(".istanbul-venue-title-link");
    const address = card.querySelector(".istanbul-venue-address");
    const rating = card.querySelector(".istanbul-venue-rating");
    const budget = card.querySelector(".istanbul-venue-budget");
    if (title) title.textContent = this.t("Mekan alınamadı");
    if (address) address.textContent = this.t("Lütfen daha sonra tekrar dene.");
    if (rating) rating.textContent = "";
    if (budget) budget.textContent = "";
  }

  updateVenueCard(cardId, venue, options = {}) {
    const card = document.getElementById(cardId);
    if (!card || !venue) {
      this.renderCardError(cardId);
      return;
    }
    card.venue = options.placeholder ? null : venue;

    const venueUrl = this.generateVenueUrl(venue);
    const imageEl = card.querySelector(".istanbul-venue-image");
    if (imageEl) {
      this.applyVenueImage(imageEl, venue, options.placeholder);
    }

    // Eyebrow: Kategori & İlçe (Gizliyoruz - iç kartlarda tags içinde gösterilecek)
    const eyebrowEl = card.querySelector(".istanbul-venue-eyebrow");
    if (eyebrowEl) {
      eyebrowEl.textContent = "";
      eyebrowEl.hidden = true;
    }

    // Mesafe bilgisi header (Gizliyoruz)
    const headerDistanceEl = card.querySelector(".istanbul-venue-distance");
    if (headerDistanceEl) {
      headerDistanceEl.hidden = true;
    }

    const titleLinkEl = card.querySelector(".istanbul-venue-title-link");
    if (titleLinkEl) {
      titleLinkEl.textContent = venue.name || this.t("Bilinmeyen mekan");
      titleLinkEl.href = options.placeholder ? "yeme-icme.html" : "#";
    }

    // Adres
    const addressEl = card.querySelector(".istanbul-venue-address");
    if (addressEl) {
      if (options.placeholder) {
        addressEl.textContent = "";
        addressEl.hidden = true;
      } else {
        addressEl.textContent = venue.address || this.t("Adres bilgisi bulunmuyor.");
        addressEl.hidden = false;
      }
    }

    // Telefon
    const existingPhone = card.querySelector(".istanbul-venue-phone");
    if (existingPhone) {
      existingPhone.remove();
    }
    const phone = String(venue.phone || "").trim();
    if (!options.placeholder && phone) {
      const phonePara = document.createElement("p");
      phonePara.className = "istanbul-venue-phone";
      phonePara.innerHTML = `Tel: <a href="tel:${phone}">${phone}</a>`;
      if (addressEl) {
        addressEl.parentNode.insertBefore(phonePara, addressEl.nextSibling);
      }
    }

    // Değerlendirme, Bütçe, Favori, Paylaş (Gizliyoruz - iç kartlarla aynı görsel dil)
    const ratingEl = card.querySelector(".istanbul-venue-rating");
    if (ratingEl) ratingEl.hidden = true;

    const budgetEl = card.querySelector(".istanbul-venue-budget");
    if (budgetEl) budgetEl.hidden = true;

    const pillRow = card.querySelector(".istanbul-venue-pill-row");
    if (pillRow) pillRow.hidden = true;

    const actionsEl = card.querySelector(".istanbul-venue-actions");
    if (actionsEl) actionsEl.hidden = true;

    // Tags & Bilgi Kutucukları (2 satır)
    const tagsEl = card.querySelector(".istanbul-venue-tags");
    if (tagsEl) {
      tagsEl.innerHTML = "";
      if (!options.placeholder) {
        const infoBoxes = document.createElement("div");
        infoBoxes.className = "venue-card-info-boxes";

        // Satır 1: İlçe, Mahalle, Alt Kategori
        const row1 = document.createElement("div");
        row1.className = "venue-card-info-row";

        const districtLabel = String(venue.district || "").trim();
        if (districtLabel) {
          const el = document.createElement("a");
          el.className = "istanbul-venue-tag";
          el.href = this.generateDistrictUrl(districtLabel);
          el.setAttribute("aria-label", `${districtLabel} ilçesindeki mekanları aç`);
          el.textContent = districtLabel;
          row1.appendChild(el);
        }

        const neighborhoodLabel = String(venue.neighborhood || venue.mahalle || "").trim();
        if (neighborhoodLabel) {
          const el = document.createElement("span");
          el.className = "istanbul-venue-tag";
          el.textContent = neighborhoodLabel;
          row1.appendChild(el);
        }

        const cuisineLabel = String(venue.cuisine || venue.category || "").trim();
        if (cuisineLabel && this.normalizeLookup(cuisineLabel) !== this.normalizeLookup(districtLabel)) {
          const el = document.createElement("span");
          el.className = "istanbul-venue-tag";
          el.textContent = cuisineLabel;
          row1.appendChild(el);
        }

        if (row1.childElementCount) {
          infoBoxes.appendChild(row1);
        }

        // Satır 2: Bütçe, Mesafe, Ayrıntılı Bilgi Butonu
        const row2 = document.createElement("div");
        row2.className = "venue-card-info-row";

        // 1. Favorilere Ekle / Favorilerde Chip'i (fav.png ile) - En Sola Konur
        const favChip = document.createElement("button");
        favChip.type = "button";
        favChip.className = "venue-popup-info-chip-btn istanbul-favorite-chip";
        this.updateFavoriteButton(favChip, venue.id);
        
        favChip.addEventListener("click", async (e) => {
          e.stopPropagation();
          try {
            favChip.disabled = true;
            await this.toggleFavorite(venue.id, favChip);
          } catch (error) {
            console.error("Favori işlemi hatası:", error);
          } finally {
            favChip.disabled = false;
          }
        });
        row2.appendChild(favChip);

        // 2. Ayrıntılı Bilgi Button
        const detailLink = document.createElement("button");
        detailLink.type = "button";
        detailLink.className = "venue-popup-info-chip-btn";
        detailLink.innerHTML = `<img src="assets/detail.png" class="venue-popup-chip-icon" alt="" />Ayrıntılı Bilgi`;
        detailLink.addEventListener("click", (e) => {
          e.stopPropagation();
          const mapsUrl = venue.mapsUrl || venue.maps_url || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent((venue.name || "") + " " + (venue.district || "") + " İstanbul")}`;
          window.open(mapsUrl, "_blank", "noopener,noreferrer");
        });
        row2.appendChild(detailLink);

        if (row2.childElementCount) {
          infoBoxes.appendChild(row2);
        }

        tagsEl.appendChild(infoBoxes);
      }
    }

    // Mesafeyi güncelle
    this.updateDistance(cardId, venue, Boolean(options.showDistance) && !options.placeholder);

    this.updateShareLinks(card, venue, venueUrl, Boolean(options.placeholder));

    if (!options.placeholder && venue) {
      card.tabIndex = 0;
      const name = String(venue.name || "Mekan").trim();
      card.setAttribute("aria-label", `${name} — ayrıntıyı aç`);
    } else {
      card.tabIndex = -1;
      card.removeAttribute("aria-label");
    }
  }

  updateDistanceAsTag(card, venue, shouldShow) {
    // Deprecated
  }

  updateDistance(cardId, venue, shouldShow) {
    const card = document.getElementById(cardId);
    if (!card) return;

    // Header distance hidden
    const distanceEl = card.querySelector(".istanbul-venue-distance");
    if (distanceEl) {
      distanceEl.hidden = true;
    }

    const tagsEl = card.querySelector(".istanbul-venue-tags");
    if (!tagsEl || !venue) return;

    let computedMeters = null;
    if (this.userLocation) {
      computedMeters = this.computeDistanceMeters(venue);
    }
    if (computedMeters == null || !Number.isFinite(computedMeters)) {
      const apiMeters = Number(venue.distanceMeters);
      if (Number.isFinite(apiMeters) && apiMeters > 0) {
        computedMeters = apiMeters;
      }
    }
    const text = this.formatDistance(computedMeters);

    let distanceChip = tagsEl.querySelector(".venue-popup-distance-chip");
    if (shouldShow && text && computedMeters > 0) {
      if (!distanceChip) {
        const rows = tagsEl.querySelectorAll(".venue-card-info-row");
        const row2 = rows[1] || rows[0];
        if (row2) {
          distanceChip = document.createElement("span");
          distanceChip.className = "venue-popup-distance-chip";
          const detailBtn = row2.querySelector(".venue-popup-info-chip-btn:not(.istanbul-favorite-chip)");
          if (detailBtn) {
            row2.insertBefore(distanceChip, detailBtn);
          } else {
            row2.appendChild(distanceChip);
          }
        }
      }
      if (distanceChip) {
        distanceChip.innerHTML = `<img src="assets/uzak.png" class="venue-popup-chip-icon" alt="" />${text}`;
        distanceChip.hidden = false;
      }
    } else {
      if (distanceChip) {
        distanceChip.remove();
      }
    }
  }

  getCategoryFallbackImage(venue) {
    if (!venue) return "assets/no-image-icon.webp";
    const cuisine = String(venue.cuisine || venue.categoryName || "").trim().toLowerCase();
    
    if (cuisine.includes("balik") || cuisine.includes("balık")) return "assets/balik.png";
    if (cuisine.includes("bar") || cuisine.includes("pub")) return "assets/bar.png";
    if (cuisine.includes("borek") || cuisine.includes("börek")) return "assets/borek.png";
    if (cuisine.includes("burger")) return "assets/burger.png";
    if (cuisine.includes("cig kofte") || cuisine.includes("çiğ köfte")) return "assets/cigkofte.png";
    if (cuisine.includes("corba") || cuisine.includes("çorba")) return "assets/corba.png";
    if (cuisine.includes("doner") || cuisine.includes("döner")) return "assets/doner.png";
    if (cuisine.includes("kahvalti") || cuisine.includes("kahvaltı")) return "assets/kahvalti.jpeg";
    if (cuisine.includes("kebap") || cuisine.includes("et") || cuisine.includes("mangal")) return "assets/kebap-et.png";
    if (cuisine.includes("kofte") || cuisine.includes("köfte")) return "assets/kofte.png";
    if (cuisine.includes("kokorec") || cuisine.includes("kokoreç")) return "assets/kokorec.png";
    if (cuisine.includes("lahmacun")) return "assets/lahmacun.png";
    if (cuisine.includes("manti") || cuisine.includes("mantı")) return "assets/manti.jpeg";
    if (cuisine.includes("meyhane")) return "assets/meyhane.png";
    if (cuisine.includes("pide")) return "assets/pide.png";
    if (cuisine.includes("pizza")) return "assets/pizza.png";
    if (cuisine.includes("sushi") || cuisine.includes("asya") || cuisine.includes("asian")) return "assets/sushi.png";
    if (cuisine.includes("tatli") || cuisine.includes("tatlı") || cuisine.includes("pasta") || cuisine.includes("pastane") || cuisine.includes("firin") || cuisine.includes("fırın")) return "assets/tatli-pasta.png";
    if (cuisine.includes("tavuk") || cuisine.includes("tantuni")) return "assets/tavuk.png";
    if (cuisine.includes("restoran") || cuisine.includes("lokanta")) return "assets/restoran.png";
    if (cuisine.includes("kafe") || cuisine.includes("cafe")) return "assets/kafe.png";
    
    return "assets/no-image-icon.webp";
  }

  applyVenueImage(imageEl, venue, isPlaceholder) {
    const fallback = this.getCategoryFallbackImage(venue);
    imageEl.onerror = () => {
      imageEl.onerror = null;
      imageEl.src = fallback;
      if (fallback === "assets/no-image-icon.webp") {
        imageEl.classList.add("is-placeholder");
      } else {
        imageEl.classList.remove("is-placeholder");
      }
    };
    const raw = isPlaceholder ? fallback : this.normalizeVenueImageUrl(venue.photoUri || venue.photoUrl || venue.imageUrl || venue.image);
    const src = raw || fallback;
    if (isPlaceholder || src === "assets/no-image-icon.webp") {
      imageEl.classList.add("is-placeholder");
    } else {
      imageEl.classList.remove("is-placeholder");
    }
    imageEl.src = src;
    imageEl.alt = isPlaceholder ? "" : `${venue.name || "Mekan"} fotoğrafı`;
  }

  updateTags(card, venue, isPlaceholder) {
    const tagsEl = card.querySelector(".istanbul-venue-tags");
    if (!tagsEl) {
      return;
    }
    if (isPlaceholder) {
      tagsEl.innerHTML = "";
      return;
    }
    tagsEl.innerHTML = "";
    const infoBoxes = document.createElement("div");
    infoBoxes.className = "venue-card-info-boxes";

    // Satır 1: İlçe, Mahalle, Alt Kategori
    const row1 = document.createElement("div");
    row1.className = "venue-card-info-row";

    if (venue.district) {
      const el = document.createElement("a");
      el.className = "istanbul-venue-tag";
      el.href = this.generateDistrictUrl(venue.district);
      el.textContent = venue.district;
      row1.appendChild(el);
    }
    if (venue.neighborhood) {
      const el = document.createElement("a");
      el.className = "istanbul-venue-tag";
      el.href = this.generateNeighborhoodUrl(venue.district, venue.neighborhood);
      el.textContent = venue.neighborhood;
      row1.appendChild(el);
    }
    if (venue.cuisine) {
      const el = document.createElement("span");
      el.className = "istanbul-venue-tag";
      el.textContent = venue.cuisine;
      row1.appendChild(el);
    }
    if (row1.childElementCount) {
      infoBoxes.appendChild(row1);
    }

    // Satır 2: Bütçe, Mesafe, Değerlendirme
    const row2 = document.createElement("div");
    row2.className = "venue-card-info-row";

    const budgetLabel = this.formatBudgetLabel(venue.budget);
    if (budgetLabel && this.normalizeLookup(budgetLabel) !== "bilinmiyor") {
      const el = document.createElement("span");
      el.className = "istanbul-venue-budget";
      el.textContent = budgetLabel;
      row2.appendChild(el);
    }

    // Mesafe bilgisi updateDistanceAsTag tarafından eklenecek



    if (row2.childElementCount) {
      infoBoxes.appendChild(row2);
    }

    tagsEl.appendChild(infoBoxes);
  }

  updateShareLinks(card, venue, venueUrl, disabled) {
    const absoluteUrl = `${window.location.origin}/${disabled ? "yeme-icme.html" : venueUrl}`;
    const shareText = disabled ? "AramaBul yeme-içme mekanları" : `${venue.name} - ${venue.district || "İstanbul"}`;
    const whatsappLink = card.querySelector(".card-whatsapp-share-link");
    const facebookLink = card.querySelector(".card-facebook-share-link");
    const telegramLink = card.querySelector(".card-telegram-share-link");
    const xLink = card.querySelector(".card-x-share-link");
    const copyButton = card.querySelector(".card-copy-share-button");

    if (whatsappLink) whatsappLink.href = `https://wa.me/?text=${encodeURIComponent(`${shareText} ${absoluteUrl}`)}`;
    if (facebookLink) facebookLink.href = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(absoluteUrl)}`;
    if (telegramLink) telegramLink.href = `https://t.me/share/url?url=${encodeURIComponent(absoluteUrl)}&text=${encodeURIComponent(shareText)}`;
    if (xLink) xLink.href = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(absoluteUrl)}`;
    if (copyButton) {
      copyButton.onclick = () => {
        navigator.clipboard.writeText(absoluteUrl);
      };
    }
  }

  bindShareMenus() {
    document.addEventListener("click", (event) => {
      const trigger = event.target instanceof HTMLElement ? event.target.closest(".card-share-trigger") : null;
      document.querySelectorAll(".card-share-menu").forEach((menu) => {
        if (!trigger || menu !== trigger.parentElement?.querySelector(".card-share-menu")) {
          menu.hidden = true;
        }
      });
      if (!trigger) {
        return;
      }
      const menu = trigger.parentElement.querySelector(".card-share-menu");
      if (menu) {
        menu.hidden = !menu.hidden;
      }
    });
  }

  computeDistanceMeters(venue) {
    if (!this.userLocation) {
      return null;
    }
    const lat = Number(venue.latitude ?? venue.lat);
    const lng = Number(venue.longitude ?? venue.lng);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      return null;
    }
    const earthRadiusMeters = 6371000;
    const dLat = this.toRad(lat - this.userLocation.lat);
    const dLng = this.toRad(lng - this.userLocation.lng);
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(this.toRad(this.userLocation.lat)) * Math.cos(this.toRad(lat)) * Math.sin(dLng / 2) ** 2;
    return earthRadiusMeters * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }

  toRad(degrees) {
    return (degrees * Math.PI) / 180;
  }

  formatDistance(meters) {
    if (!Number.isFinite(meters)) {
      return "";
    }
    if (meters < 1000) {
      return `${Math.round(meters)} m`;
    }
    return `${(meters / 1000).toFixed(1).replace(".", ",")} km`;
  }

  formatRating(venue) {
    const rating = Number(venue.rating) || 0;
    const count = Number(venue.userRatingCount) || 0;
    const stars = "★".repeat(Math.max(1, Math.min(5, Math.round(rating || 1))));
    const score = rating ? rating.toFixed(1).replace(".", ",") : "-";
    const yorumLabel = this.t("yorum");
    const puanLabel = this.t("Google Puanı");
    const countText = count > 0 ? ` (${new Intl.NumberFormat("tr-TR").format(count)} ${yorumLabel})` : "";
    return `${stars} ${score} ${puanLabel}${countText}`;
  }

  formatBudgetLabel(value) {
    const normalized = this.normalizeLookup(value);
    if (!normalized) return "";
    if (normalized === "budget" || normalized === "₺" || normalized === "₺₺") return this.t("Uygun");
    if (normalized === "mid" || normalized === "₺₺₺") return this.t("Makul");
    if (normalized === "high" || normalized === "₺₺₺₺") return this.t("Yüksek");
    return String(value || "");
  }

  normalizeLookup(value) {
    return String(value || "")
      .trim()
      .toLocaleLowerCase("tr-TR")
      .replace(/ı/g, "i")
      .replace(/ğ/g, "g")
      .replace(/ü/g, "u")
      .replace(/ş/g, "s")
      .replace(/ö/g, "o")
      .replace(/ç/g, "c")
      .replace(/\s+/g, " ");
  }

  normalizeVenueImageUrl(url) {
    const raw = String(url || "").trim();
    if (!raw) return "";
    return raw.startsWith("http://") ? `https://${raw.slice("http://".length)}` : raw;
  }

  generateVenueUrl(venue) {
    const slug = String(venue.slug || "").trim();
    if (slug) {
      return `venue-detail.html?slug=${encodeURIComponent(slug)}`;
    }
    return `venue-detail.html?slug=${encodeURIComponent(venue.name || "")}`;
  }

  generateDistrictUrl(district) {
    return `yeme-icme.html#district=${encodeURIComponent(district || "")}`;
  }

  generateNeighborhoodUrl(district, neighborhood) {
    return `yeme-icme.html#district=${encodeURIComponent(district || "")}&neighborhood=${encodeURIComponent(neighborhood || "")}`;
  }
}

document.addEventListener("DOMContentLoaded", () => {
  if (document.body.classList.contains("home-page")) {
    const fv = new FeaturedVenues();
    document.addEventListener("aramabul:languagechange", () => {
      fv.syncAllFavoriteButtons();
      fv.loadStaticFeaturedCards();
    });
  }
});
