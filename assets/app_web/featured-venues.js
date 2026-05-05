"use strict";

class FeaturedVenues {
  constructor() {
    this.userLocation = null;
    this.geoStatus = null;
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
    await this.loadStaticFeaturedCards();
    this.requestLocationForDistances();
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
      window.location.assign(this.generateVenueUrl(venue));
    };

    grid.addEventListener("click", (event) => {
      const target = event.target;
      if (!(target instanceof Element)) {
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

  pickRandomUnique(venues, count) {
    const list = (Array.isArray(venues) ? venues : []).filter(Boolean);
    for (let i = list.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [list[i], list[j]] = [list[j], list[i]];
    }
    const out = [];
    const seen = new Set();
    for (const v of list) {
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
    const randomSeed = Math.floor(Date.now() / 60000);
    const items = await this.fetchMvpVenues("random", 100, { photoState: "has_photo", randomSeed });
    const picks = this.pickDiverseByCategory(items, 3);
    const cardIds = ["featured-most-comments", "featured-highest-rated", "featured-nearest-highest"];
    const keys = ["mostCommented", "highestRated", "nearestHighest"];
    this.featuredVenues.mostCommented = null;
    this.featuredVenues.highestRated = null;
    this.featuredVenues.nearestHighest = null;
    for (let i = 0; i < 3; i += 1) {
      const venue = picks[i] || null;
      this.featuredVenues[keys[i]] = venue;
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
    if (title) title.textContent = "Mekan alınamadı";
    if (address) address.textContent = "Lütfen daha sonra tekrar dene.";
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

    const eyebrowEl = card.querySelector(".istanbul-venue-eyebrow");
    if (eyebrowEl) {
      const mainCat = venue.mainCategoryName || "";
      const subCat = venue.categoryName || venue.cuisine || "";
      const eyebrowText = [mainCat, subCat].filter(Boolean).join(" › ");
      eyebrowEl.textContent = eyebrowText || "";
      eyebrowEl.hidden = !eyebrowText;
    }

    const titleLinkEl = card.querySelector(".istanbul-venue-title-link");
    if (titleLinkEl) {
      titleLinkEl.textContent = venue.name || "Bilinmeyen mekan";
      titleLinkEl.href = options.placeholder ? "yeme-icme.html" : venueUrl;
    }

    const addressEl = card.querySelector(".istanbul-venue-address");
    if (addressEl) {
      addressEl.textContent = venue.address || "Adres bilgisi yok";
    }

    const ratingEl = card.querySelector(".istanbul-venue-rating");
    if (ratingEl) {
      ratingEl.textContent = options.placeholder ? "" : this.formatRating(venue);
    }

    const budgetEl = card.querySelector(".istanbul-venue-budget");
    if (budgetEl) {
      budgetEl.textContent = options.placeholder ? "" : this.formatBudgetLabel(venue.budget) || "Fiyat bilinmiyor";
    }

    this.updateDistance(cardId, venue, Boolean(options.showDistance) && !options.placeholder);
    this.updateTags(card, venue, Boolean(options.placeholder));

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

  updateDistance(cardId, venue, shouldShow) {
    const card = document.getElementById(cardId);
    const distanceEl = card ? card.querySelector(".istanbul-venue-distance") : null;
    const actionsEl = card ? card.querySelector(".istanbul-venue-actions") : null;
    const actionGroupEl = actionsEl ? actionsEl.querySelector(".istanbul-venue-action-group") : null;
    if (!distanceEl) {
      return;
    }
    if (!shouldShow) {
      distanceEl.hidden = true;
      return;
    }

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
    if (!text || !Number.isFinite(computedMeters) || computedMeters <= 0) {
      distanceEl.hidden = true;
      return;
    }
    distanceEl.textContent = text;
    distanceEl.hidden = false;

    if (actionsEl && distanceEl.parentElement !== actionsEl) {
      actionsEl.insertBefore(distanceEl, actionGroupEl || actionsEl.firstChild);
      actionsEl.classList.add("has-distance-chip");
    }
  }

  applyVenueImage(imageEl, venue, isPlaceholder) {
    const fallback = "/assets/yemek.png";
    imageEl.onerror = () => {
      imageEl.onerror = null;
      imageEl.src = fallback;
    };
    const raw = isPlaceholder ? fallback : this.normalizeVenueImageUrl(venue.photoUri || venue.photoUrl || venue.imageUrl || venue.image);
    imageEl.src = raw || fallback;
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
    const tags = [];
    if (venue.district) {
      tags.push(`<a class="istanbul-venue-tag" href="${this.generateDistrictUrl(venue.district)}">${venue.district}</a>`);
    }
    if (venue.neighborhood) {
      tags.push(`<a class="istanbul-venue-tag" href="${this.generateNeighborhoodUrl(venue.district, venue.neighborhood)}">${venue.neighborhood}</a>`);
    }
    if (venue.cuisine) {
      tags.push(`<span class="istanbul-venue-tag">${venue.cuisine}</span>`);
    }
    tagsEl.innerHTML = tags.join("");
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
    const countText = count > 0 ? ` (${new Intl.NumberFormat("tr-TR").format(count)} yorum)` : "";
    return `${stars} ${score} Google Puanı${countText}`;
  }

  formatBudgetLabel(value) {
    const normalized = this.normalizeLookup(value);
    if (!normalized) return "";
    if (normalized === "budget" || normalized === "₺" || normalized === "₺₺") return "Uygun";
    if (normalized === "mid" || normalized === "₺₺₺") return "Makul";
    if (normalized === "high" || normalized === "₺₺₺₺") return "Yüksek";
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
    return `venue-detail.html?slug=${encodeURIComponent(slug)}&venue=${encodeURIComponent(venue.name || "")}&district=${encodeURIComponent(venue.district || "")}`;
  }

  generateDistrictUrl(district) {
    return `yeme-icme.html?district=${encodeURIComponent(district || "")}`;
  }

  generateNeighborhoodUrl(district, neighborhood) {
    return `yeme-icme.html?district=${encodeURIComponent(district || "")}&neighborhood=${encodeURIComponent(neighborhood || "")}`;
  }
}

document.addEventListener("DOMContentLoaded", () => {
  if (document.body.classList.contains("home-page")) {
    new FeaturedVenues();
  }
});
