"use strict";

(function initVenueDetailPage() {
  const VENUES_LIST_CITY = "İstanbul";

  const content = document.getElementById("venueDetailContent");
  if (!content) {
    return;
  }

  const stateNode = document.getElementById("venueDetailState");
  const stateMessageNode = document.getElementById("venueDetailStateMessage");
  const stateActionsNode = document.getElementById("venueDetailStateActions");
  const breadcrumbCurrent = document.getElementById("venueDetailBreadcrumbCurrent");
  const breadcrumbDomain = document.getElementById("venueDetailBreadcrumbDomain");
  const titleNode = document.getElementById("venueDetailTitle");
  const mediaNode = document.getElementById("venueDetailMedia");
  const imageNode = document.getElementById("venueDetailImage");
  const mediaPlaceholderNode = document.getElementById("venueDetailMediaPlaceholder");
  const summaryNode = document.getElementById("venueDetailSummary");
  const ratingNode = document.getElementById("venueDetailRating");
  const budgetNode = document.getElementById("venueDetailBudget");
  const addressNode = document.getElementById("venueDetailAddress");
  const phoneNode = document.getElementById("venueDetailPhone");
  const websiteNode = document.getElementById("venueDetailWebsite");
  const instagramNode = document.getElementById("venueDetailInstagram");
  const mapFrame = document.getElementById("venueDetailMapFrame");
  const mapWrapNode = document.getElementById("venueDetailMapWrap");
  const tagsNode = document.getElementById("venueDetailTags");
  const statusNode = document.getElementById("venueDetailStatus");
  const menuSectionNode = document.getElementById("venueDetailMenuSection");
  const menuLinkNode = document.getElementById("venueDetailMenuLink");
  const menuListNode = document.getElementById("venueDetailMenuList");
  const servicesSectionNode = document.getElementById("venueDetailServicesSection");
  const servicesListNode = document.getElementById("venueDetailServicesList");
  const atmosphereSectionNode = document.getElementById("venueDetailAtmosphereSection");
  const atmosphereListNode = document.getElementById("venueDetailAtmosphereList");
  const reviewsSectionNode = document.getElementById("venueDetailReviewsSection");
  const reviewsListNode = document.getElementById("venueDetailReviewsList");
  const reviewFormNode = document.getElementById("venueDetailReviewForm");
  const reviewNameNode = document.getElementById("venueDetailReviewName");
  const reviewTextNode = document.getElementById("venueDetailReviewText");
  const reviewFormStatusNode = document.getElementById("venueDetailReviewFormStatus");
  const sideInstagramLinkNode = document.getElementById("venueDetailInstagramLink");
  const shareWrapNode = document.getElementById("venueDetailShareWrap");
  const shareButtonNode = document.getElementById("venueDetailShareButton");
  const shareMenuNode = document.getElementById("venueDetailShareMenu");
  const nativeShareButtonNode = document.getElementById("venueDetailNativeShareButton");
  const whatsappShareLinkNode = document.getElementById("venueDetailWhatsappShareLink");
  const facebookShareLinkNode = document.getElementById("venueDetailFacebookShareLink");
  const telegramShareLinkNode = document.getElementById("venueDetailTelegramShareLink");
  const xShareLinkNode = document.getElementById("venueDetailXShareLink");
  const copyShareButtonNode = document.getElementById("venueDetailCopyShareButton");
  const favoriteButtons = [document.getElementById("venueDetailFavoriteButton")].filter(Boolean);
  let activeShareData = null;
  let activeVenue = null;
  let activeVenueBaseReviews = [];
  let activeVenueRemoteReviews = [];

  // ── "Listeye dön" URL'ini belirle ──────────────────────────────
  const BACK_STORAGE_KEY = "aramabul:venue-list-return-url";
  const DEFAULT_BACK_URL = "yeme-icme.html";

  function resolveBackUrl() {
    try {
      const stored = sessionStorage.getItem(BACK_STORAGE_KEY);
      if (stored && typeof stored === "string" && stored.length > 0) {
        return stored;
      }
    } catch (_e) {
      // sessionStorage may be unavailable.
    }
    // document.referrer ile de dene
    const ref = document.referrer || "";
    const ownOrigin = window.location.origin;
    if (ref && ref.startsWith(ownOrigin)) {
      const refPath = ref.replace(ownOrigin, "").replace(/^\//, "");
      const listPages = [
        "yeme-icme.html", "gezi.html", "hizmetler.html",
        "saglik.html", "kultur.html", "sanat.html", "index.html",
      ];
      if (listPages.some((p) => refPath.startsWith(p))) {
        return ref.replace(ownOrigin + "/", "");
      }
    }
    return DEFAULT_BACK_URL;
  }

  const DOMAIN_MAP = {
    "yeme-icme.html": "Yeme-İçme",
    "gezi.html": "Gezi",
    "hizmetler.html": "Hizmetler",
    "saglik.html": "Sağlık",
    "kultur.html": "Kültür",
    "sanat.html": "Sanat",
  };

  function updateBreadcrumbDomain(venue) {
    if (!breadcrumbDomain) {
      return;
    }
    // 1) venue domain membership — en güvenilir kaynak
    if (venue && Array.isArray(venue.domainKeys) && venue.domainKeys.length > 0) {
      const domainFile = venue.domainKeys[0] + ".html";
      if (DOMAIN_MAP[domainFile]) {
        breadcrumbDomain.textContent = DOMAIN_MAP[domainFile];
        breadcrumbDomain.href = domainFile;
        return;
      }
    }
    if (venue && venue.domainKey) {
      const domainFile = venue.domainKey + ".html";
      if (DOMAIN_MAP[domainFile]) {
        breadcrumbDomain.textContent = DOMAIN_MAP[domainFile];
        breadcrumbDomain.href = domainFile;
        return;
      }
    }
    // 2) referrer'dan domain belirle
    const ref = document.referrer || "";
    const ownOrigin = window.location.origin;
    if (ref && ref.startsWith(ownOrigin)) {
      const refPath = ref.replace(ownOrigin + "/", "").split("?")[0];
      if (DOMAIN_MAP[refPath]) {
        breadcrumbDomain.textContent = DOMAIN_MAP[refPath];
        breadcrumbDomain.href = refPath;
        return;
      }
    }
    // 3) sessionStorage back URL'den
    const stored = backUrl.split("?")[0];
    if (DOMAIN_MAP[stored]) {
      breadcrumbDomain.textContent = DOMAIN_MAP[stored];
      breadcrumbDomain.href = stored;
      return;
    }
    // 4) venue source'tan tahmin et
    if (venue) {
      const src = String(venue.source || "").toLowerCase();
      if (src === "ktb" || src === "turob") {
        breadcrumbDomain.textContent = "Gezi";
        breadcrumbDomain.href = "gezi.html";
        return;
      }
      if (src === "osm") {
        const cuisine = String(venue.cuisine || "").toLowerCase();
        if (cuisine.includes("kuaför") || cuisine.includes("veteriner") || cuisine.includes("eczane")) {
          breadcrumbDomain.textContent = "Hizmetler";
          breadcrumbDomain.href = "hizmetler.html";
          return;
        }
      }
    }
  }

  const backUrl = resolveBackUrl();

  // HTML'deki tüm "Listeye dön" ve ilgili linkleri güncelle
  const backLinkSelectors = [
    "#venueDetailStateBackLink",
    "#venueDetailStateSearchLink",
    "#venueDetailBackLink",
    ".venue-detail-link-grid .venue-detail-action-secondary",
  ];
  backLinkSelectors.forEach((selector) => {
    const el = document.querySelector(selector);
    if (el instanceof HTMLAnchorElement) {
      el.href = backUrl;
    }
  });

  function setElementVisibility(node, visible, displayValue) {
    if (!node) {
      return;
    }
    node.hidden = !visible;
    node.style.display = visible ? displayValue || "" : "none";
  }

  function setState(message, showContent, showActions) {
    if (stateMessageNode) {
      stateMessageNode.textContent = message;
    } else {
      stateNode.textContent = message;
    }
    if (stateActionsNode) {
      setElementVisibility(stateActionsNode, Boolean(showActions), "flex");
    }
    setElementVisibility(stateNode, !showContent);
    setElementVisibility(content, showContent);
  }

  function generateStars(rating) {
    const roundedStars = Math.max(1, Math.min(5, Math.round(Number(rating) || 0)));
    return "★".repeat(roundedStars);
  }

  function formatBudgetLabel(value) {
    const normalized = String(value || "").trim().toLocaleLowerCase("tr-TR");
    if (!normalized) {
      return "";
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
    return String(value || "");
  }

  function cleanList(values) {
    if (!Array.isArray(values)) {
      return [];
    }
    const seen = new Set();
    return values
      .map((value) => String(value || "").trim())
      .filter((value) => {
        if (!value) {
          return false;
        }
        const key = value.toLocaleLowerCase("tr-TR");
        if (seen.has(key)) {
          return false;
        }
        seen.add(key);
        return true;
      });
  }

  function formatReviewDate(value) {
    const rawValue = String(value || "").trim();
    if (!rawValue) {
      return "";
    }

    const parsedDate = parseReviewDateValue(rawValue);
    if (!Number.isNaN(parsedDate.getTime())) {
      return new Intl.DateTimeFormat("tr-TR", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }).format(parsedDate);
    }

    return rawValue;
  }

  function parseReviewRelativeCount(value) {
    const normalized = String(value || "")
      .trim()
      .toLocaleLowerCase("tr-TR");
    if (!normalized) {
      return null;
    }

    const wordMap = {
      a: 1,
      an: 1,
      one: 1,
      bir: 1,
      two: 2,
      iki: 2,
      three: 3,
      uc: 3,
      üç: 3,
      four: 4,
      dort: 4,
      dört: 4,
      five: 5,
      bes: 5,
      beş: 5,
      six: 6,
      alti: 6,
      altı: 6,
      seven: 7,
      yedi: 7,
      eight: 8,
      sekiz: 8,
      nine: 9,
      dokuz: 9,
      ten: 10,
      on: 10,
    };

    if (/^\d+$/.test(normalized)) {
      return Number(normalized);
    }
    return wordMap[normalized] || null;
  }

  function parseReviewDateValue(value) {
    const rawValue = String(value || "").trim();
    if (!rawValue) {
      return new Date(NaN);
    }

    const directDate = new Date(rawValue);
    if (!Number.isNaN(directDate.getTime())) {
      return directDate;
    }

    const normalized = rawValue
      .toLocaleLowerCase("tr-TR")
      .replace(/\s+/g, " ")
      .trim();

    const now = new Date();
    if (normalized === "bugun" || normalized === "bugün" || normalized === "today") {
      return now;
    }
    if (normalized === "dun" || normalized === "dün" || normalized === "yesterday") {
      return new Date(now.getTime() - 24 * 60 * 60 * 1000);
    }

    const relativeMatch = normalized.match(
      /^(?<count>[\p{L}\d]+)\s+(?<unit>saniye|dakika|saat|gun|gün|hafta|ay|yil|yıl|second|seconds|minute|minutes|hour|hours|day|days|week|weeks|month|months|year|years)\s+(once|önce|ago)$/u,
    );
    if (!relativeMatch || !relativeMatch.groups) {
      return new Date(NaN);
    }

    const count = parseReviewRelativeCount(relativeMatch.groups.count);
    if (!count) {
      return new Date(NaN);
    }

    const unit = relativeMatch.groups.unit;
    const date = new Date(now.getTime());
    if (/(saniye|second)/u.test(unit)) {
      date.setSeconds(date.getSeconds() - count);
      return date;
    }
    if (/(dakika|minute)/u.test(unit)) {
      date.setMinutes(date.getMinutes() - count);
      return date;
    }
    if (/(saat|hour)/u.test(unit)) {
      date.setHours(date.getHours() - count);
      return date;
    }
    if (/(gun|gün|day)/u.test(unit)) {
      date.setDate(date.getDate() - count);
      return date;
    }
    if (/(hafta|week)/u.test(unit)) {
      date.setDate(date.getDate() - count * 7);
      return date;
    }
    if (/(ay|month)/u.test(unit)) {
      date.setMonth(date.getMonth() - count);
      return date;
    }
    if (/(yil|yıl|year)/u.test(unit)) {
      date.setFullYear(date.getFullYear() - count);
      return date;
    }

    return new Date(NaN);
  }

  function pickReviewDateRaw(value) {
    if (!value || typeof value !== "object") {
      return "";
    }
    const direct = String(
      value.publishedAt ||
        value.publishTime ||
        value.date ||
        value.reviewDate ||
        value.publishedTime ||
        "",
    ).trim();
    if (direct) {
      return direct;
    }
    return String(
      value.relativePublishTimeDescription || value.relative_time_description || value.relativePublishTime || "",
    ).trim();
  }

  function normalizeReviews(values) {
    if (!Array.isArray(values)) {
      return [];
    }

    const seen = new Set();
    return values
      .map((value) => {
        if (value && typeof value === "object") {
          const text = String(value.text || value.review || value.comment || value.snippet || "").trim();
          const dateRaw = pickReviewDateRaw(value);
          const date = dateRaw
            ? formatReviewDate(dateRaw)
            : formatReviewDate(
                value.date ||
                  value.reviewDate ||
                  value.publishedAt ||
                  value.publishTime ||
                  value.relativePublishTimeDescription ||
                  "",
              );
          const author = String(value.author || "").trim();
          return { text, date, dateRaw, author };
        }

        return {
          text: String(value || "").trim(),
          date: "",
          dateRaw: "",
          author: "",
        };
      })
      .filter((review) => {
        if (!review.text) {
          return false;
        }
        const key = review.text.toLocaleLowerCase("tr-TR");
        if (seen.has(key)) {
          return false;
        }
        seen.add(key);
        return true;
      });
  }

  function getReviewSortTime(review) {
    const raw = String(review?.dateRaw || "").trim();
    if (raw) {
      const parsedRaw = parseReviewDateValue(raw);
      if (!Number.isNaN(parsedRaw.getTime())) {
        return parsedRaw.getTime();
      }
    }
    const parsedDisplay = parseReviewDateValue(review?.date || "");
    return Number.isNaN(parsedDisplay.getTime()) ? null : parsedDisplay.getTime();
  }

  function buildVenueReviewKey(venue) {
    const slug = String(venue?.slug || buildDerivedVenueSlug(venue) || "").trim();
    const fallback = [venue?.name, venue?.district].filter(Boolean).join("|");
    return slug || normalizeForMatch(fallback);
  }

  function buildVenueReviewStorageKey(venue) {
    return `aramabul:venue-reviews:${buildVenueReviewKey(venue)}`;
  }

  function readStoredVenueReviews(venue) {
    try {
      const rawValue = localStorage.getItem(buildVenueReviewStorageKey(venue));
      const parsedValue = JSON.parse(rawValue || "[]");
      return normalizeReviews(Array.isArray(parsedValue) ? parsedValue : []);
    } catch (_error) {
      return [];
    }
  }

  function writeStoredVenueReviews(venue, reviews) {
    try {
      localStorage.setItem(
        buildVenueReviewStorageKey(venue),
        JSON.stringify(normalizeReviews(reviews).slice(0, 30)),
      );
    } catch (_error) {
      // Local storage can be unavailable in restricted browser modes.
    }
  }

  function renderVenueReviews() {
    if (!activeVenue) {
      renderReviews(activeVenueBaseReviews);
      return;
    }
    const localReviews = readStoredVenueReviews(activeVenue);
    renderReviews([
      ...localReviews,
      ...normalizeReviews(activeVenueRemoteReviews),
      ...normalizeReviews(activeVenueBaseReviews),
    ]);
  }

  async function fetchRemoteVenueReviews(venue) {
    const venueKey = buildVenueReviewKey(venue);
    if (!venueKey) {
      return [];
    }
    const response = await fetch(`/api/venue-reviews?venueKey=${encodeURIComponent(venueKey)}`, {
      cache: "no-store",
    });
    if (!response.ok) {
      throw new Error("Yorumlar alınamadı");
    }
    const payload = await response.json();
    return normalizeReviews(payload?.reviews);
  }

  async function submitRemoteVenueReview(venue, review) {
    const venueKey = buildVenueReviewKey(venue);
    if (!venueKey) {
      throw new Error("Mekan anahtarı yok");
    }
    const response = await fetch("/api/venue-reviews", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        venueKey,
        venueName: venue?.name || "",
        district: venue?.district || "",
        author: review.author || "",
        text: review.text || "",
      }),
    });
    if (!response.ok) {
      throw new Error("Yorum gönderilemedi");
    }
    const payload = await response.json();
    return normalizeReviews(payload?.reviews);
  }

  function setReviewFormStatus(message, isError = false) {
    if (!reviewFormStatusNode) {
      return;
    }
    reviewFormStatusNode.textContent = message || "";
    reviewFormStatusNode.classList.toggle("is-error", Boolean(isError));
  }

  function bindReviewForm() {
    if (!reviewFormNode || !reviewTextNode) {
      return;
    }

    reviewFormNode.addEventListener("submit", async (event) => {
      event.preventDefault();
      if (!activeVenue) {
        setReviewFormStatus("Mekan bilgisi yüklenmeden yorum gönderilemez.", true);
        return;
      }

      const text = String(reviewTextNode.value || "").trim();
      const author = String(reviewNameNode?.value || "").trim();
      if (text.length < 3) {
        setReviewFormStatus("Lütfen kısa da olsa bir yorum yaz.", true);
        reviewTextNode.focus();
        return;
      }

      const nextReview = {
        text,
        author,
        date: new Date().toISOString(),
      };
      try {
        activeVenueRemoteReviews = await submitRemoteVenueReview(activeVenue, nextReview);
        reviewTextNode.value = "";
        setReviewFormStatus("Yorumun onaya gönderildi.", false);
        renderVenueReviews();
      } catch (_error) {
        const storedReviews = readStoredVenueReviews(activeVenue);
        writeStoredVenueReviews(activeVenue, [nextReview, ...storedReviews]);
        reviewTextNode.value = "";
        setReviewFormStatus("Yorumun eklendi. Bağlantı yoksa bu cihazda saklanır.", false);
        renderVenueReviews();
      }
    });
  }

  const venueSlugCharMap = {
    ç: "c",
    ğ: "g",
    ı: "i",
    i: "i",
    ö: "o",
    ş: "s",
    ü: "u",
  };

  function normalizeForVenueSlugKey(value) {
    return String(value || "")
      .toLocaleLowerCase("tr")
      .replace(/[çğıöşü]/gu, (char) => venueSlugCharMap[char] || char)
      .replace(/[^a-z0-9]+/gu, "-")
      .replace(/^-+|-+$/gu, "");
  }

  function slugifyVenuePart(value) {
    return normalizeForVenueSlugKey(value);
  }

  function buildDerivedVenueSlug(item) {
    if (!item || typeof item !== "object") {
      return "";
    }
    const name = String(item.name || "").trim();
    const district = String(item.district || "").trim() || "Merkez";
    const sourcePlaceId = String(
      item.sourcePlaceId || item.placeId || item.source_place_id || "",
    ).trim();
    const dedupeKey = String(item.dedupeKey || item.dedupe_key || "").trim();
    const nameSlug = slugifyVenuePart(name);
    const districtSlug = slugifyVenuePart(district);
    const baseSlug = [nameSlug, districtSlug].filter(Boolean).join("-");
    if (!baseSlug) {
      return "";
    }
    const uniqueSeed = slugifyVenuePart(sourcePlaceId || dedupeKey || "");
    if (!uniqueSeed) {
      return baseSlug;
    }
    const suffix = uniqueSeed.slice(-6);
    return suffix ? `${baseSlug}-${suffix}` : baseSlug;
  }

  function normalizeForMatch(value) {
    return String(value || "")
      .trim()
      .toLocaleLowerCase("tr-TR")
      .replace(/ı/g, "i")
      .replace(/ğ/g, "g")
      .replace(/ü/g, "u")
      .replace(/ş/g, "s")
      .replace(/ö/g, "o")
      .replace(/ç/g, "c")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/�/g, "")
      .replace(/[^a-z0-9\s]/g, " ")
      .replace(/\s+/g, " ");
  }

  function namesRoughlyMatch(leftValue, rightValue) {
    const left = normalizeForMatch(leftValue);
    const right = normalizeForMatch(rightValue);
    if (!left || !right) {
      return false;
    }
    if (left === right) {
      return true;
    }

    const leftCompact = left.replace(/\s+/g, "");
    const rightCompact = right.replace(/\s+/g, "");
    if (leftCompact === rightCompact) {
      return true;
    }
    if (leftCompact.includes(rightCompact) || rightCompact.includes(leftCompact)) {
      return true;
    }

    const leftNoDigits = leftCompact.replace(/\d+/g, "");
    const rightNoDigits = rightCompact.replace(/\d+/g, "");
    if (!leftNoDigits || !rightNoDigits) {
      return false;
    }
    return leftNoDigits.includes(rightNoDigits) || rightNoDigits.includes(leftNoDigits);
  }

  function normalizeUrl(rawValue) {
    const value = String(rawValue || "").trim();
    if (!value) {
      return "";
    }
    try {
      const parsed = new URL(value);
      if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
        return "";
      }
      return parsed.href;
    } catch (_error) {
      return "";
    }
  }

  function buildMapEmbedUrl(venue) {
    const mapsUrl = String(venue.mapsUrl || "").trim();
    if (!mapsUrl) {
      return "";
    }

    try {
      const parsed = new URL(mapsUrl);
      const query = parsed.searchParams.get("query") || parsed.searchParams.get("q") || "";
      if (query) {
        return `https://maps.google.com/maps?hl=tr&q=${encodeURIComponent(query)}&z=15&output=embed`;
      }
      const cid = parsed.searchParams.get("cid") || "";
      if (cid) {
        return `https://www.google.com/maps?cid=${encodeURIComponent(cid)}&hl=tr&output=embed`;
      }
    } catch (_error) {
      // Fallback below.
    }

    const fallbackQuery = venue.address || venue.name || "Istanbul";
    return `https://maps.google.com/maps?hl=tr&q=${encodeURIComponent(fallbackQuery)}&z=15&output=embed`;
  }

  function resolvePlacePhotoProxyUrl(reference) {
    const trimmed = String(reference || "").trim();
    if (!trimmed) {
      return "";
    }
    if (trimmed.startsWith("places/")) {
      return `/api/places/photo?name=${encodeURIComponent(trimmed)}`;
    }
    return `/api/places/photo?ref=${encodeURIComponent(trimmed)}`;
  }

  function resolveVenueHeroPhotoUrl(venue) {
    if (!venue || typeof venue !== "object") {
      return "";
    }
    const direct = String(
      venue.photoUri ||
        venue.photoUrl ||
        venue.imageUrl ||
        (Array.isArray(venue.galleryPhotoUris) ? venue.galleryPhotoUris[0] : "") ||
        "",
    ).trim();
    if (direct) {
      return direct;
    }
    const refs = venue.photoReferences || venue.photo_references;
    if (Array.isArray(refs) && refs.length) {
      return resolvePlacePhotoProxyUrl(refs[0]);
    }
    return "";
  }

  function setImageSource(imageEl, src, alt) {
    imageEl.src = src;
    imageEl.alt = alt;
    imageEl.onerror = () => {
      imageEl.onerror = null;
      imageEl.src = "assets/yemek.png";
      imageEl.alt = alt;
    };
  }

  function setTextValue(node, value) {
    if (!node) {
      return;
    }
    node.textContent = value || "-";
    node.hidden = !value;
  }

  function setAnchorValue(node, value, prefix) {
    if (!node) {
      return;
    }
    if (!value) {
      node.textContent = "-";
      node.hidden = true;
      return;
    }
    const href = prefix ? `${prefix}${value}` : value;
    node.innerHTML = "";
    const anchor = document.createElement("a");
    anchor.href = href;
    if (!prefix) {
      anchor.target = "_blank";
      anchor.rel = "noopener noreferrer";
    }
    anchor.textContent = value;
    node.appendChild(anchor);
    node.hidden = false;
  }

  function upsertMetaTag(attributeName, attributeValue, content) {
    if (!attributeName || !attributeValue) {
      return null;
    }
    let node = document.head.querySelector(`meta[${attributeName}="${attributeValue}"]`);
    if (!node) {
      node = document.createElement("meta");
      node.setAttribute(attributeName, attributeValue);
      document.head.appendChild(node);
    }
    node.setAttribute("content", content);
    return node;
  }

  function upsertCanonicalLink(href) {
    let node = document.head.querySelector('link[rel="canonical"]');
    if (!node) {
      node = document.createElement("link");
      node.setAttribute("rel", "canonical");
      document.head.appendChild(node);
    }
    node.setAttribute("href", href);
    return node;
  }

  function upsertJsonLdScript(scriptId, payload) {
    if (!scriptId || !payload) {
      return null;
    }
    let node = document.getElementById(scriptId);
    if (!node) {
      node = document.createElement("script");
      node.type = "application/ld+json";
      node.id = scriptId;
      document.head.appendChild(node);
    }
    node.textContent = JSON.stringify(payload);
    return node;
  }

  function updateVenueSeo(venue) {
    if (!venue || typeof venue !== "object") {
      return;
    }
    const venueName = String(venue.name || "Mekan").trim() || "Mekan";
    const district = String(venue.district || "").trim();
    const neighborhood = String(venue.neighborhood || "").trim();
    const cuisine = String(venue.cuisine || "").trim();
    const title = district ? `${venueName} ${district} | AramaBul` : `${venueName} | AramaBul`;
    const description =
      [
        venueName,
        district,
        neighborhood,
        cuisine,
        String(venue.address || "").trim(),
      ]
        .filter(Boolean)
        .join(" • ")
        .slice(0, 155) || "İstanbul mekan detay sayfası.";
    const slug = String(venue.slug || "").trim();
    const canonicalUrl = slug
      ? `https://aramabul.com/venue-detail.html?slug=${encodeURIComponent(slug)}`
      : window.location.href;
    const imageUrl =
      String(resolveVenueHeroPhotoUrl(venue) || "https://aramabul.com/assets/yemek.png").trim() ||
      "https://aramabul.com/assets/yemek.png";

    document.title = title;
    upsertCanonicalLink(canonicalUrl);
    upsertMetaTag("name", "description", description);
    upsertMetaTag("property", "og:type", "article");
    upsertMetaTag("property", "og:title", title);
    upsertMetaTag("property", "og:description", description);
    upsertMetaTag("property", "og:url", canonicalUrl);
    upsertMetaTag("property", "og:image", imageUrl);
    upsertMetaTag("property", "og:site_name", "AramaBul");
    upsertMetaTag("name", "twitter:card", "summary_large_image");
    upsertMetaTag("name", "twitter:title", title);
    upsertMetaTag("name", "twitter:description", description);
    upsertMetaTag("name", "twitter:image", imageUrl);

    const rating = Number(venue.rating || venue.averageRating || 0);
    const ratingCount = Number(venue.userRatingCount || venue.ratingCount || venue.reviewCount || 0);
    const websiteUrl = String(venue.website || "").trim() || undefined;

    const schemaPayload = {
      "@context": "https://schema.org",
      "@type": "LocalBusiness",
      name: venueName,
      description,
      url: canonicalUrl,
      image: imageUrl,
      telephone: String(venue.phone || "").trim() || undefined,
      address: String(venue.address || "").trim()
        ? {
            "@type": "PostalAddress",
            streetAddress: String(venue.address || "").trim(),
            addressLocality: district || undefined,
            addressRegion: "İstanbul",
            addressCountry: "TR",
          }
        : undefined,
      geo:
        Number.isFinite(Number(venue.latitude)) && Number.isFinite(Number(venue.longitude))
          ? {
              "@type": "GeoCoordinates",
              latitude: Number(venue.latitude),
              longitude: Number(venue.longitude),
            }
          : undefined,
    };

    if (rating > 0 && ratingCount > 0) {
      schemaPayload.aggregateRating = {
        "@type": "AggregateRating",
        ratingValue: rating.toFixed(1),
        bestRating: "5",
        worstRating: "1",
        ratingCount: String(ratingCount),
      };
    }

    if (websiteUrl) {
      schemaPayload.sameAs = websiteUrl;
    }

    upsertJsonLdScript("venue-detail-jsonld", schemaPayload);
  }

  function setWebsiteInfoCell(node, url) {
    if (!node) {
      return;
    }
    node.innerHTML = "";
    if (url) {
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.target = "_blank";
      anchor.rel = "noopener noreferrer";
      anchor.className = "venue-detail-action venue-detail-info-cell-action";
      anchor.textContent = "Siteye git";
      node.appendChild(anchor);
    } else {
      const p = document.createElement("p");
      p.className = "venue-detail-missing";
      p.textContent = "web sitesi bulunmamaktadır";
      node.appendChild(p);
    }
  }

  function setInstagramInfoCell(node, url) {
    if (!node) {
      return;
    }
    node.innerHTML = "";
    if (url) {
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.target = "_blank";
      anchor.rel = "noopener noreferrer";
      anchor.className = "venue-detail-action venue-detail-info-cell-action";
      anchor.textContent = "Instagram’da aç";
      node.appendChild(anchor);
    } else {
      const p = document.createElement("p");
      p.className = "venue-detail-missing";
      p.textContent = "instagram bulunmamaktadır";
      node.appendChild(p);
    }
  }

  function renderChipSection(sectionNode, listNode, values) {
    if (!sectionNode || !listNode) {
      return;
    }
    const chips = cleanList(values);
    listNode.innerHTML = "";
    chips.forEach((chipText) => {
      const chip = document.createElement("span");
      chip.className = "venue-detail-chip";
      chip.textContent = chipText;
      listNode.appendChild(chip);
    });
    sectionNode.hidden = chips.length === 0;
  }

  function renderReviews(values) {
    if (!reviewsSectionNode || !reviewsListNode) {
      return;
    }
    const reviews = normalizeReviews(values)
      .map((review, index) => ({ ...review, index }))
      .sort((left, right) => {
        const leftTime = getReviewSortTime(left);
        const rightTime = getReviewSortTime(right);
        if (leftTime !== null && rightTime !== null && leftTime !== rightTime) {
          return rightTime - leftTime;
        }
        if (leftTime !== null && rightTime === null) {
          return -1;
        }
        if (leftTime === null && rightTime !== null) {
          return 1;
        }
        return left.index - right.index;
      })
      .slice(0, 8);
    reviewsListNode.innerHTML = "";
    reviews.forEach((review) => {
      const reviewNode = document.createElement("div");
      reviewNode.className = "venue-detail-review";
      const metaParts = [review.author, review.date].map((p) => String(p || "").trim()).filter(Boolean);
      if (metaParts.length) {
        const reviewMetaNode = document.createElement("p");
        reviewMetaNode.className = "venue-detail-review-meta";
        reviewMetaNode.textContent = metaParts.join(" · ");
        reviewNode.appendChild(reviewMetaNode);
      }
      const reviewTextNode = document.createElement("p");
      reviewTextNode.className = "venue-detail-review-text";
      reviewTextNode.textContent = review.text;
      reviewNode.appendChild(reviewTextNode);
      reviewsListNode.appendChild(reviewNode);
    });
    reviewsSectionNode.hidden = reviews.length === 0;
  }

  function bindShareMenu() {
    if (!shareWrapNode || !shareButtonNode || !shareMenuNode) {
      return;
    }
    shareButtonNode.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      const isOpen = !shareMenuNode.hidden;
      shareMenuNode.hidden = isOpen;
      shareButtonNode.setAttribute("aria-expanded", isOpen ? "false" : "true");
    });
    document.addEventListener("click", (event) => {
      if (!(event.target instanceof HTMLElement)) {
        return;
      }
      if (!event.target.closest("#venueDetailShareWrap")) {
        shareMenuNode.hidden = true;
        shareButtonNode.setAttribute("aria-expanded", "false");
      }
    });
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        shareMenuNode.hidden = true;
        shareButtonNode.setAttribute("aria-expanded", "false");
      }
    });
  }

  function setupShare(venue) {
    if (!shareWrapNode) {
      return;
    }
    const detailUrl = (() => {
      if (venue.slug) {
        return new URL(`venue-detail.html?slug=${encodeURIComponent(venue.slug)}`, window.location.href).href;
      }
      return new URL(
        `venue-detail.html?venue=${encodeURIComponent(venue.name || "")}&district=${encodeURIComponent(venue.district || "")}`,
        window.location.href
      ).href;
    })();
    const shareTitle = `${venue.name || "Mekan"} | aramabul`;
    const shareText = `${shareTitle}\n${detailUrl}`;

    activeShareData = {
      title: shareTitle,
      text: shareText,
      url: detailUrl,
    };

    if (whatsappShareLinkNode) {
      whatsappShareLinkNode.href = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
    }
    if (facebookShareLinkNode) {
      facebookShareLinkNode.href = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(detailUrl)}`;
    }
    if (telegramShareLinkNode) {
      telegramShareLinkNode.href = `https://t.me/share/url?url=${encodeURIComponent(detailUrl)}&text=${encodeURIComponent(shareTitle)}`;
    }
    if (xShareLinkNode) {
      xShareLinkNode.href = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareTitle)}&url=${encodeURIComponent(detailUrl)}`;
    }
    if (nativeShareButtonNode) {
      const canNativeShare = Boolean(navigator.share);
      nativeShareButtonNode.hidden = !canNativeShare;
      if (canNativeShare) {
        nativeShareButtonNode.onclick = async (event) => {
          event.preventDefault();
          if (!activeShareData) {
            return;
          }
          try {
            await navigator.share(activeShareData);
          } catch (_error) {
            // User cancelled or share not available.
          }
        };
      }
    }
    if (copyShareButtonNode) {
      copyShareButtonNode.onclick = async (event) => {
        event.preventDefault();
        if (!activeShareData) {
          return;
        }
        try {
          await navigator.clipboard.writeText(activeShareData.url);
        } catch (_error) {
          // Clipboard API is unavailable; silently skip.
        }
      };
    }
    shareWrapNode.hidden = false;
  }

  async function fetchVenueBySlugFromApi(rawSlug) {
    const trimmed = String(rawSlug || "").trim();
    if (!trimmed) {
      return null;
    }
    try {
      const response = await fetch(`/api/mvp/istanbul/venues/${encodeURIComponent(trimmed)}`, { cache: "no-store" });
      if (response.ok) {
        return await response.json();
      }
      if (response.status === 404) {
        return null;
      }
    } catch (_error) {
      // Fallback to the legacy list endpoint below.
    }

    const listParams = new URLSearchParams({
      slug: trimmed,
      city: VENUES_LIST_CITY,
      limit: "1",
    });
    const url = `/api/venues?${listParams.toString()}`;
    const requestInit = { cache: "no-store" };
    try {
      let response = await fetch(url, requestInit);
      if (!response.ok && response.status >= 500) {
        await new Promise((resolve) => setTimeout(resolve, 200));
        response = await fetch(url, requestInit);
      }
      if (!response.ok) {
        return null;
      }
      const rows = await response.json();
      if (!Array.isArray(rows) || !rows.length) {
        return null;
      }
      const row = rows[0];
      if (String(row.slug || "").trim() !== trimmed) {
        return null;
      }
      return row;
    } catch (_error) {
      return null;
    }
  }

  async function loadVenueList() {
    try {
      const listParams = new URLSearchParams({
        city: VENUES_LIST_CITY,
        limit: "5000",
      });
      const apiResponse = await fetch(`/api/venues?${listParams.toString()}`, { cache: "no-store" });
      if (apiResponse.ok) {
        const apiVenues = await apiResponse.json();
        if (Array.isArray(apiVenues) && apiVenues.length) {
          return apiVenues;
        }
      }
    } catch (_error) {
      // Fallback to static data below.
    }

    const response = await fetch("/data/yeme-icme.json", { cache: "no-store" });
    if (!response.ok) {
      throw new Error("Mekan bilgisi yüklenemedi.");
    }
    const venues = await response.json();
    return Array.isArray(venues) ? venues : [];
  }

  async function fetchVenueCandidatesByName(query) {
    const trimmed = String(query || "").trim();
    if (!trimmed || trimmed.length < 2) {
      return [];
    }
    try {
      const params = new URLSearchParams({
        q: trimmed,
        limit: "20",
      });
      const response = await fetch(`/api/venues/search?${params.toString()}`, { cache: "no-store" });
      if (!response.ok) {
        return [];
      }
      const rows = await response.json();
      return Array.isArray(rows) ? rows : [];
    } catch (_error) {
      return [];
    }
  }

  function findVenue(venues, params) {
    const rawSlug = String(params.slug || "").trim();
    const slug = normalizeForMatch(params.slug || "");
    const venueName = normalizeForMatch(params.venueName || "");
    const district = normalizeForMatch(params.district || "");

    if (rawSlug || slug) {
      if (rawSlug) {
        const exactSlug = venues.find((item) => String(item.slug || "").trim() === rawSlug);
        if (exactSlug) {
          return exactSlug;
        }
        const exactDerived = venues.find((item) => buildDerivedVenueSlug(item) === rawSlug);
        if (exactDerived) {
          return exactDerived;
        }
      }
      if (slug) {
        const slugMatch = venues.find((item) => normalizeForMatch(item.slug) === slug);
        if (slugMatch) {
          return slugMatch;
        }
        const derivedMatch = venues.find(
          (item) => normalizeForMatch(buildDerivedVenueSlug(item)) === slug,
        );
        if (derivedMatch) {
          return derivedMatch;
        }
      }
    }

    if (!venueName) {
      return null;
    }

    return (
      venues.find((item) => {
        const nameMatches = namesRoughlyMatch(item.name, venueName);
        if (!nameMatches) {
          return false;
        }
        if (!district) {
          return true;
        }
        return normalizeForMatch(item.district) === district;
      }) || venues.find((item) => namesRoughlyMatch(item.name, venueName))
    );
  }

  function applySideLinks(venue) {
    const instagramUrl = normalizeUrl(venue.instagram);
    const menuUrl = normalizeUrl(venue.menuUrl);

    if (sideInstagramLinkNode) {
      sideInstagramLinkNode.href = instagramUrl || "#";
      sideInstagramLinkNode.hidden = !instagramUrl;
    }
    if (menuLinkNode) {
      menuLinkNode.href = menuUrl || "#";
      menuLinkNode.hidden = !menuUrl;
    }
  }

  function applyFavoriteButtons() {
    favoriteButtons.forEach((button) => {
      button.addEventListener("click", () => {
        const nextFavoriteState = !button.classList.contains("is-favorite");
        favoriteButtons.forEach((target) => {
          target.classList.toggle("is-favorite", nextFavoriteState);
          target.textContent = nextFavoriteState ? "Kaydedildi" : "Kaydet";
        });
      });
    });
  }

  async function main() {
    const params = new URLSearchParams(window.location.search);
    const slug = (params.get("slug") || "").trim();
    const venueName = (params.get("venue") || "").trim();
    const district = (params.get("district") || "").trim();

    if (!slug && !venueName) {
      breadcrumbCurrent.textContent = "Mekan bulunamadı";
      setState("Geçerli bir mekan bağlantısı bulunamadı.", false, true);
      return;
    }

    try {
      let venue = null;
      if (slug) {
        venue = await fetchVenueBySlugFromApi(slug);
      }
      if (!venue && venueName) {
        const candidateVenues = await fetchVenueCandidatesByName(venueName);
        venue = findVenue(candidateVenues, { slug, venueName, district });
      }
      if (!venue) {
        const venues = await loadVenueList();
        venue = findVenue(venues, { slug, venueName, district });
      }

      if (!venue) {
        breadcrumbCurrent.textContent = "Mekan bulunamadı";
        document.title = "Mekan bulunamadı | AramaBul";
        setState("Bu mekan bulunamadı.", false, true);
        return;
      }

      updateVenueSeo(venue);
      updateBreadcrumbDomain(venue);
      breadcrumbCurrent.textContent = venue.name || "Mekan";
      titleNode.textContent = venue.name || "Mekan";
      const rawSummary = venue.editorialSummary || "";
      const showSummary = rawSummary && !rawSummary.startsWith("Kaynak:");
      summaryNode.textContent = showSummary ? rawSummary : "";
      summaryNode.hidden = !showSummary;

      const tags = [];
      if (venue.district) {
        tags.push(venue.district);
      }
      if (venue.neighborhood) {
        tags.push(venue.neighborhood);
      }
      if (venue.cuisine && String(venue.cuisine).trim() !== String(venue.district || "").trim()) {
        tags.push(venue.cuisine);
      }
      tagsNode.innerHTML = tags.map((tag) => `<span class="venue-detail-tag">${tag}</span>`).join("");
      const tagsRow = tagsNode.closest(".venue-detail-tags-above-meta");
      if (tagsRow) {
        tagsRow.hidden = tags.length === 0;
      } else {
        tagsNode.hidden = tags.length === 0;
      }

      if (mediaNode && imageNode) {
        const photoUri = resolveVenueHeroPhotoUrl(venue);
        const alt = `${venue.name || "Mekan"} fotoğrafı`;
        setImageSource(imageNode, photoUri || "assets/yemek.png", alt);
        setElementVisibility(mediaNode, true);
        setElementVisibility(mediaPlaceholderNode, false);
      }

      if (ratingNode && venue.rating) {
        const numericRating = Number(venue.rating);
        const stars = generateStars(numericRating);
        const score = numericRating.toFixed(1).replace(".", ",");
        const countText = Number(venue.userRatingCount) > 0 ? ` (${Number(venue.userRatingCount)} yorum)` : "";
        ratingNode.textContent = `${stars} ${score} Google Puanı${countText}`;
        ratingNode.hidden = false;
      } else {
        ratingNode.hidden = true;
      }
      if (ratingNode) {
        const ratingBlock = ratingNode.closest(".venue-detail-rating-block");
        if (ratingBlock) {
          ratingBlock.hidden = Boolean(ratingNode.hidden);
        }
      }

      if (budgetNode && venue.budget) {
        budgetNode.textContent = formatBudgetLabel(venue.budget) || venue.budget;
        budgetNode.hidden = false;
      } else {
        budgetNode.hidden = true;
      }

      setTextValue(addressNode, venue.address || "");
      setAnchorValue(phoneNode, venue.phone || "", "tel:");
      setWebsiteInfoCell(websiteNode, normalizeUrl(venue.website));
      setInstagramInfoCell(instagramNode, normalizeUrl(venue.instagram));

      if (statusNode) {
        const statusText = String(venue.openingStatusText || "").trim();
        const fallbackStatus = venue.isOpenNow === true ? "Açık" : venue.isOpenNow === false ? "Kapalı" : "";
        const nextStatus = statusText || fallbackStatus;
        statusNode.textContent = nextStatus;
        statusNode.hidden = !nextStatus;
      }

      const mapUrl = buildMapEmbedUrl(venue);
      if (mapFrame && mapUrl) {
        mapFrame.src = mapUrl;
        mapFrame.hidden = false;
        if (mapWrapNode) {
          mapWrapNode.hidden = false;
        }
      } else if (mapFrame) {
        mapFrame.hidden = true;
        if (mapWrapNode) {
          mapWrapNode.hidden = true;
        }
      }

      const menuCapabilities = cleanList(venue.menuCapabilities);
      const serviceCapabilities = cleanList(venue.serviceCapabilities);
      const atmosphereCapabilities = cleanList(venue.atmosphereCapabilities);
      activeVenue = venue;
      activeVenueBaseReviews = venue.reviewSnippets;
      activeVenueRemoteReviews = [];

      renderChipSection(menuSectionNode, menuListNode, menuCapabilities);
      if (menuSectionNode && menuLinkNode && !menuLinkNode.hidden) {
        menuSectionNode.hidden = false;
      }
      renderChipSection(servicesSectionNode, servicesListNode, serviceCapabilities);
      renderChipSection(atmosphereSectionNode, atmosphereListNode, atmosphereCapabilities);
      renderVenueReviews();
      fetchRemoteVenueReviews(venue)
        .then((reviews) => {
          activeVenueRemoteReviews = reviews;
          renderVenueReviews();
        })
        .catch(() => {
          activeVenueRemoteReviews = [];
        });

      applySideLinks(venue);
      setupShare(venue);
      applyFavoriteButtons();

      setState("", true, false);
      return;

    } catch (error) {
      console.error("Venue detail load error:", error);
      breadcrumbCurrent.textContent = "Hata";
      document.title = "Hata | AramaBul";
      setState(error instanceof Error ? error.message : "Mekan bilgisi yüklenemedi.", false, true);
    }
  }

  bindShareMenu();
  bindReviewForm();
  main();
})();
