"use strict";

(function initVenueDetailPage() {
  const content = document.getElementById("venueDetailContent");
  if (!content) {
    return;
  }

  const stateNode = document.getElementById("venueDetailState");
  const stateMessageNode = document.getElementById("venueDetailStateMessage");
  const stateActionsNode = document.getElementById("venueDetailStateActions");
  const stateSearchLinkNode = document.getElementById("venueDetailStateSearchLink");
  const breadcrumbCurrent = document.getElementById("venueDetailBreadcrumbCurrent");
  const titleNode = document.getElementById("venueDetailTitle");
  const mediaNode = document.getElementById("venueDetailMedia");
  const imageNode = document.getElementById("venueDetailImage");
  const mediaPlaceholderNode = document.getElementById("venueDetailMediaPlaceholder");
  const eyebrowNode = document.getElementById("venueDetailEyebrow");
  const summaryNode = document.getElementById("venueDetailSummary");
  const menuSectionNode = document.getElementById("venueDetailMenuSection");
  const menuLinkNode = document.getElementById("venueDetailMenuLink");
  const menuListNode = document.getElementById("venueDetailMenuList");
  const ratingNode = document.getElementById("venueDetailRating");
  const budgetNode = document.getElementById("venueDetailBudget");
  const statusNode = document.getElementById("venueDetailStatus");
  const tagsNode = document.getElementById("venueDetailTags");
  const servicesSectionNode = document.getElementById("venueDetailServicesSection");
  const servicesListNode = document.getElementById("venueDetailServicesList");
  const atmosphereSectionNode = document.getElementById("venueDetailAtmosphereSection");
  const atmosphereListNode = document.getElementById("venueDetailAtmosphereList");
  const reviewsSectionNode = document.getElementById("venueDetailReviewsSection");
  const reviewsListNode = document.getElementById("venueDetailReviewsList");
  const addressNode = document.getElementById("venueDetailAddress");
  const phoneNode = document.getElementById("venueDetailPhone");
  const websiteNode = document.getElementById("venueDetailWebsite");
  const instagramNode = document.getElementById("venueDetailInstagram");
  const mapFrame = document.getElementById("venueDetailMapFrame");
  const websiteLink = document.getElementById("venueDetailWebsiteLink");
  const instagramLink = document.getElementById("venueDetailInstagramLink");
  const favoriteButton = document.getElementById("venueDetailFavoriteButton");
  const shareWrap = document.getElementById("venueDetailShareWrap");
  const shareButton = document.getElementById("venueDetailShareButton");
  const shareMenu = document.getElementById("venueDetailShareMenu");
  const nativeShareButton = document.getElementById("venueDetailNativeShareButton");
  const whatsappShareLink = document.getElementById("venueDetailWhatsappShareLink");
  const facebookShareLink = document.getElementById("venueDetailFacebookShareLink");
  const telegramShareLink = document.getElementById("venueDetailTelegramShareLink");
  const xShareLink = document.getElementById("venueDetailXShareLink");
  const copyShareButton = document.getElementById("venueDetailCopyShareButton");
  let venueId = null;
  let isFavorite = false;
  let sharePayload = null;

  function setElementVisibility(node, visible, displayValue) {
    if (!node) {
      return;
    }
    node.hidden = !visible;
    node.style.display = visible ? displayValue || "" : "none";
  }

  function slugToSearchText(slug) {
    return String(slug || "")
      .replace(/-[a-z0-9]{6,}$/i, "")
      .replace(/-/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  function setState(message, showContent, options) {
    const config = options && typeof options === "object" ? options : {};
    if (stateMessageNode) {
      stateMessageNode.textContent = message;
    } else {
      stateNode.textContent = message;
    }
    setElementVisibility(stateNode, !showContent);
    setElementVisibility(content, showContent);

    if (stateActionsNode) {
      const showActions = !showContent && Boolean(config.showActions);
      setElementVisibility(stateActionsNode, showActions, "flex");
      if (stateSearchLinkNode && config.searchSlug) {
        const searchText = slugToSearchText(config.searchSlug);
        const searchParams = new URLSearchParams();
        if (searchText) {
          searchParams.set("q", searchText);
        }
        stateSearchLinkNode.href = searchParams.toString() ? `yeme-icme.html?${searchParams.toString()}` : "yeme-icme.html";
      }
    }
  }

  function createExternalLink(url, label) {
    const link = document.createElement("a");
    link.href = url;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.textContent = label;
    return link;
  }

  function buildExternalLinkLabel(url, fallbackLabel) {
    try {
      const parsed = new URL(url);
      const hostname = parsed.hostname.replace(/^www\./i, "");

      if (hostname.includes("instagram.com")) {
        const handle = parsed.pathname
          .split("/")
          .map((item) => item.trim())
          .filter(Boolean)[0];
        if (handle) {
          return `@${handle}`;
        }
      }

      if (hostname) {
        return hostname;
      }
    } catch (_error) {
      // Keep fallback label.
    }

    return fallbackLabel;
  }

  function getUsefulInstagramUrl(url) {
    try {
      const parsed = new URL(url);
      const hostname = parsed.hostname.replace(/^www\./i, "").toLowerCase();
      if (!hostname.includes("instagram.com")) {
        return url;
      }

      const firstPathPart = parsed.pathname
        .split("/")
        .map((item) => item.trim())
        .filter(Boolean)[0] || "";

      if (!firstPathPart) {
        return "";
      }

      if (["accounts", "explore", "direct", "reels", "stories", "p"].includes(firstPathPart.toLowerCase())) {
        return "";
      }

      return parsed.toString();
    } catch (_error) {
      return url;
    }
  }

  function fillTextOrFallback(node, value, fallback) {
    node.innerHTML = "";
    if (!value) {
      node.textContent = fallback;
      return;
    }
    node.textContent = value;
  }

  function fillLinkOrFallback(node, value, fallbackLabel) {
    node.innerHTML = "";
    if (!value) {
      node.textContent = "-";
      return;
    }
    node.appendChild(createExternalLink(value, buildExternalLinkLabel(value, fallbackLabel)));
  }

  function formatBudgetLabel(value) {
    const normalized = String(value || "").trim().toLocaleLowerCase("tr-TR");
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

  function buildSharePayload(venue) {
    const shareUrl = new URL(window.location.href);
    if (venue?.slug) {
      shareUrl.searchParams.set("slug", venue.slug);
    }

    const venueTitle = String(venue?.name || "AramaBul mekan");
    const districtText = String(venue?.district || "").trim();
    const shareTitle = districtText ? `${venueTitle} | ${districtText}` : venueTitle;
    const shareText = districtText
      ? `${venueTitle} - ${districtText} icin AramaBul sayfasi`
      : `${venueTitle} icin AramaBul sayfasi`;

    return {
      title: shareTitle,
      text: shareText,
      url: shareUrl.toString(),
    };
  }

  async function copyTextToClipboard(value) {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(value);
      return;
    }

    const helperInput = document.createElement("textarea");
    helperInput.value = value;
    helperInput.setAttribute("readonly", "readonly");
    helperInput.style.position = "absolute";
    helperInput.style.left = "-9999px";
    document.body.appendChild(helperInput);
    helperInput.select();
    document.execCommand("copy");
    helperInput.remove();
  }

  function setShareButtonFeedback(node, nextLabel) {
    if (!(node instanceof HTMLElement)) {
      return;
    }

    const previousLabel = node.dataset.defaultLabel || node.textContent || "";
    node.textContent = nextLabel;
    window.setTimeout(() => {
      node.textContent = previousLabel;
    }, 1600);
  }

  function closeShareMenu() {
    if (!shareMenu || !shareButton) {
      return;
    }

    shareMenu.hidden = true;
    shareButton.setAttribute("aria-expanded", "false");
  }

  function openShareMenu() {
    if (!shareMenu || !shareButton) {
      return;
    }

    shareMenu.hidden = false;
    shareButton.setAttribute("aria-expanded", "true");
  }

  function toggleShareMenu() {
    if (!shareMenu || !shareButton) {
      return;
    }

    if (shareMenu.hidden) {
      openShareMenu();
      return;
    }

    closeShareMenu();
  }

  function syncShareActions(venue) {
    if (!shareWrap || !shareMenu) {
      return;
    }

    sharePayload = buildSharePayload(venue);
    const encodedUrl = encodeURIComponent(sharePayload.url);
    const encodedText = encodeURIComponent(`${sharePayload.title} ${sharePayload.url}`);
    const encodedMessage = encodeURIComponent(`${sharePayload.title} - ${sharePayload.url}`);

    if (whatsappShareLink) {
      whatsappShareLink.href = `https://wa.me/?text=${encodedMessage}`;
    }
    if (facebookShareLink) {
      facebookShareLink.href = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
    }
    if (telegramShareLink) {
      telegramShareLink.href = `https://t.me/share/url?url=${encodedUrl}&text=${encodeURIComponent(sharePayload.title)}`;
    }
    if (xShareLink) {
      xShareLink.href = `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodeURIComponent(sharePayload.title)}`;
    }
    if (nativeShareButton) {
      setElementVisibility(nativeShareButton, typeof navigator.share === "function", "inline-flex");
    }

    setElementVisibility(shareWrap, true, "inline-flex");
  }

  async function triggerNativeShare(triggerNode) {
    if (!sharePayload) {
      return;
    }

    if (typeof navigator.share === "function") {
      await navigator.share({
        title: sharePayload.title,
        text: sharePayload.text,
        url: sharePayload.url,
      });
      return;
    }

    await copyTextToClipboard(sharePayload.url);
    setShareButtonFeedback(triggerNode, "Baglanti kopyalandi");
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

  function buildMapEmbedUrl(venue) {
    const embedFromMapsUrl = (() => {
      try {
        if (!venue.mapsUrl) {
          return "";
        }

        const parsedUrl = new URL(venue.mapsUrl);
        const directQuery = parsedUrl.searchParams.get("query") || parsedUrl.searchParams.get("q") || "";
        if (directQuery) {
          return `https://maps.google.com/maps?hl=tr&q=${encodeURIComponent(directQuery)}&z=15&output=embed`;
        }

        const cid = parsedUrl.searchParams.get("cid") || "";
        if (cid) {
          return `https://www.google.com/maps?cid=${encodeURIComponent(cid)}&hl=tr&output=embed`;
        }

        return "";
      } catch (_error) {
        return "";
      }
    })();

    if (embedFromMapsUrl) {
      return embedFromMapsUrl;
    }

    if (Number.isFinite(Number(venue.latitude)) && Number.isFinite(Number(venue.longitude))) {
      return `https://maps.google.com/maps?hl=tr&q=${encodeURIComponent(`${venue.latitude},${venue.longitude}`)}&z=15&output=embed`;
    }

    const fallbackQuery = venue.address || venue.name || "İstanbul";
    return `https://maps.google.com/maps?hl=tr&q=${encodeURIComponent(fallbackQuery)}&z=15&output=embed`;
  }

  function fillChipList(sectionNode, listNode, values) {
    if (!sectionNode || !listNode) {
      return;
    }

    listNode.innerHTML = "";
    if (!Array.isArray(values) || !values.length) {
      sectionNode.hidden = true;
      return;
    }

    values.forEach((item) => {
      const chip = document.createElement("span");
      chip.className = "venue-detail-chip";
      chip.textContent = item;
      listNode.appendChild(chip);
    });
    sectionNode.hidden = false;
  }

  function fillReviewList(values) {
    if (!reviewsSectionNode || !reviewsListNode) {
      return;
    }

    reviewsListNode.innerHTML = "";
    if (!Array.isArray(values) || !values.length) {
      reviewsSectionNode.hidden = true;
      return;
    }

    const filtered = values
      .filter((item) => isLikelyTurkishReview(item))
      .sort((left, right) => scoreReviewTone(right) - scoreReviewTone(left));
    if (!filtered.length) {
      reviewsSectionNode.hidden = true;
      return;
    }

    filtered.slice(0, 3).forEach((item) => {
      const quote = document.createElement("blockquote");
      quote.className = "venue-detail-review";
      quote.textContent = item;
      reviewsListNode.appendChild(quote);
    });

    reviewsSectionNode.hidden = false;
  }

  function isLikelyTurkishReview(value) {
    if (typeof value !== "string") {
      return false;
    }
    const text = value.toLocaleLowerCase("tr");
    const hasTurkishChars = /[çğıöşü]/.test(text);
    const turkishWords = /( ve | bir | çok | güzel | lezzetli | mekan | servis | fiyat | tavsiye | harika | iyi )/;
    return hasTurkishChars || turkishWords.test(` ${text} `);
  }

  function scoreReviewTone(value) {
    const text = String(value || "").toLocaleLowerCase("tr");
    let score = 0;

    [
      "harika",
      "mukemmel",
      "mükemmel",
      "lezzet",
      "lezzetli",
      "guler yuz",
      "güler yüz",
      "ilgili",
      "tavsiye",
      "huzurlu",
      "temiz",
      "iyi",
      "guzel",
      "güzel",
    ].forEach((token) => {
      if (text.includes(token)) {
        score += 2;
      }
    });

    [
      "pisman",
      "pişman",
      "kotu",
      "kötü",
      "rezalet",
      "berbat",
      "icemedim",
      "içemedim",
      "tavsiye etmem",
      "gitmeyin",
      "soğuk",
      "soguk",
      "yetersiz",
      "pahali",
      "pahalı",
      "kaba",
      "bozuk",
    ].forEach((token) => {
      if (text.includes(token)) {
        score -= 3;
      }
    });

    return score;
  }

  function buildStatusLabel(venue) {
    if (venue.temporarilyClosed) {
      return "Geçici kapalı";
    }

    if (typeof venue.openingStatusText === "string" && venue.openingStatusText.trim()) {
      return venue.openingStatusText.trim();
    }

    if (venue.isOpenNow === true) {
      return "Şu an açık";
    }

    if (venue.isOpenNow === false) {
      return "Şu an kapalı";
    }

    return "";
  }

  function syncFavoriteButton() {
    if (!favoriteButton) {
      return;
    }
    favoriteButton.textContent = isFavorite ? "Kaydedildi" : "Kaydet";
    favoriteButton.classList.toggle("is-active", isFavorite);
    favoriteButton.setAttribute("aria-pressed", isFavorite ? "true" : "false");
  }

  async function loadFavoriteStatus() {
    if (!Number.isFinite(Number(venueId))) {
      return;
    }

    const response = await fetch(`/api/mvp/favorites/ids?venueIds=${encodeURIComponent(venueId)}`, {
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Favori durumu alınamadı.");
    }

    const payload = await response.json();
    const favoriteIds = Array.isArray(payload.ids) ? payload.ids.map((item) => Number(item)) : [];
    isFavorite = favoriteIds.includes(Number(venueId));
    syncFavoriteButton();
  }

  async function toggleFavorite() {
    if (!Number.isFinite(Number(venueId))) {
      return;
    }

    const response = await fetch(`/api/mvp/favorites/${encodeURIComponent(venueId)}`, {
      method: isFavorite ? "DELETE" : "POST",
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Favori işlemi tamamlanamadı.");
    }

    isFavorite = !isFavorite;
    syncFavoriteButton();
  }

  async function main() {
    const params = new URLSearchParams(window.location.search);
    const slug = (params.get("slug") || "").trim();

    if (!slug) {
      breadcrumbCurrent.textContent = "Mekan bulunamadı";
      setState("Geçerli bir mekan bağlantısı bulunamadı.", false, {
        showActions: true,
      });
      return;
    }

    try {
      const response = await fetch(`/api/mvp/istanbul/venues/${encodeURIComponent(slug)}`, {
        headers: {
          Accept: "application/json",
        },
      });

      if (response.status === 404) {
        breadcrumbCurrent.textContent = "Mekan bulunamadı";
        document.title = "Mekan bulunamadı | AramaBul";
        setState("Bu mekan bulunamadı.", false, {
          showActions: true,
          searchSlug: slug,
        });
        return;
      }

      if (!response.ok) {
        throw new Error("Mekan bilgisi yüklenemedi.");
      }

      const venue = await response.json();
      venueId = Number(venue.id);

      document.title = `${venue.name} | AramaBul`;
      breadcrumbCurrent.textContent = venue.name || "Mekan";
      titleNode.textContent = venue.name || "Mekan";
      eyebrowNode.textContent = [venue.district, venue.neighborhood, venue.cuisine].filter(Boolean).join(" / ");

      if (mediaNode && imageNode) {
        const photoUri = typeof venue.photoUri === "string" ? venue.photoUri.trim() : "";
        const galleryPhotoUri =
          Array.isArray(venue.galleryPhotoUris) && venue.galleryPhotoUris.length
            ? String(venue.galleryPhotoUris[0] || "").trim()
            : "";
        const resolvedPhotoUri = photoUri || galleryPhotoUri;
        if (resolvedPhotoUri) {
          mediaNode.hidden = false;
          if (mediaPlaceholderNode) {
            mediaPlaceholderNode.hidden = true;
          }
          imageNode.src = resolvedPhotoUri;
          imageNode.alt = `${venue.name || "Mekan"} fotoğrafı`;
          imageNode.addEventListener(
            "error",
            () => {
              mediaNode.hidden = true;
              if (mediaPlaceholderNode) {
                mediaPlaceholderNode.hidden = false;
              }
            },
            { once: true },
          );
        } else {
          mediaNode.hidden = true;
          if (mediaPlaceholderNode) {
            mediaPlaceholderNode.hidden = false;
          }
        }
      }

      if (venue.editorialSummary) {
        summaryNode.hidden = false;
        summaryNode.textContent = venue.editorialSummary;
      } else {
        summaryNode.hidden = true;
      }

      if (menuSectionNode && menuListNode) {
        menuListNode.innerHTML = "";
        const hasMenuItems = Array.isArray(venue.menuCapabilities) && venue.menuCapabilities.length;
        const menuUrl = typeof venue.menuUrl === "string" ? venue.menuUrl.trim() : "";

        if (menuLinkNode) {
          if (menuUrl) {
            menuLinkNode.href = menuUrl;
            setElementVisibility(menuLinkNode, true, "inline-flex");
          } else {
            setElementVisibility(menuLinkNode, false);
          }
        }

        if (hasMenuItems) {
          venue.menuCapabilities.forEach((item) => {
            const chip = document.createElement("span");
            chip.className = "venue-detail-chip";
            chip.textContent = item;
            menuListNode.appendChild(chip);
          });
        }

        if (hasMenuItems || menuUrl) {
          setElementVisibility(menuSectionNode, true);
        } else {
          setElementVisibility(menuSectionNode, false);
        }
      }

      if (Number.isFinite(Number(venue.rating))) {
        ratingNode.hidden = false;
        ratingNode.textContent = formatVenueRatingText(venue.rating, venue.userRatingCount);
      } else if (ratingNode) {
        ratingNode.hidden = true;
      }

      if (venue.budget) {
        budgetNode.hidden = false;
        budgetNode.textContent = formatBudgetLabel(venue.budget);
      }

      const statusLabel = buildStatusLabel(venue);
      if (statusNode) {
        if (statusLabel) {
          statusNode.hidden = false;
          statusNode.textContent = statusLabel;
        } else {
          statusNode.hidden = true;
        }
      }

      tagsNode.innerHTML = "";
      if (Array.isArray(venue.tags) && venue.tags.length) {
        venue.tags.forEach((tag) => {
          const badge = document.createElement("span");
          badge.className = "venue-detail-tag";
          badge.textContent = tag;
          tagsNode.appendChild(badge);
        });
      }

      fillTextOrFallback(addressNode, venue.address, "Adres bilgisi yok.");
      fillTextOrFallback(phoneNode, venue.phone, "Telefon bilgisi yok.");
      fillLinkOrFallback(websiteNode, venue.website, "Web sitesini aç");
      const instagramUrl = getUsefulInstagramUrl(venue.instagram);
      fillLinkOrFallback(instagramNode, instagramUrl, "Instagram'ı aç");
      fillChipList(servicesSectionNode, servicesListNode, venue.serviceCapabilities);
      fillChipList(atmosphereSectionNode, atmosphereListNode, venue.atmosphereCapabilities);
      fillReviewList(venue.reviewSnippets);
      syncShareActions(venue);

      if (mapFrame) {
        mapFrame.src = buildMapEmbedUrl(venue);
      }

      if (venue.website) {
        websiteLink.href = venue.website;
        setElementVisibility(websiteLink, true, "inline-flex");
      } else {
        setElementVisibility(websiteLink, false);
      }

      if (instagramUrl) {
        instagramLink.href = instagramUrl;
        setElementVisibility(instagramLink, true, "inline-flex");
      } else {
        setElementVisibility(instagramLink, false);
      }

      setState("", true, {
        showActions: false,
      });
      await loadFavoriteStatus();
    } catch (error) {
      breadcrumbCurrent.textContent = "Mekan yüklenemedi";
      setState(error instanceof Error ? error.message : "Mekan bilgisi yüklenemedi.", false, {
        showActions: true,
        searchSlug: slug,
      });
    }
  }

  if (favoriteButton) {
    favoriteButton.addEventListener("click", async () => {
      try {
        favoriteButton.disabled = true;
        await toggleFavorite();
      } catch (error) {
        setState(error instanceof Error ? error.message : "Favori işlemi tamamlanamadı.", true);
      } finally {
        favoriteButton.disabled = false;
      }
    });
  }

  if (shareButton) {
    shareButton.dataset.defaultLabel = shareButton.textContent || "Paylaş";
    shareButton.addEventListener("click", () => {
      toggleShareMenu();
    });
  }

  if (nativeShareButton) {
    nativeShareButton.dataset.defaultLabel = nativeShareButton.textContent || "Instagram / cihazda paylaş";
    nativeShareButton.addEventListener("click", async () => {
      try {
        await triggerNativeShare(nativeShareButton);
      } catch (_error) {
        await copyTextToClipboard(sharePayload?.url || window.location.href);
        setShareButtonFeedback(nativeShareButton, "Baglanti kopyalandi");
      } finally {
        closeShareMenu();
      }
    });
  }

  if (copyShareButton) {
    copyShareButton.dataset.defaultLabel = copyShareButton.textContent || "Bağlantıyı kopyala";
    copyShareButton.addEventListener("click", async () => {
      try {
        await copyTextToClipboard(sharePayload?.url || window.location.href);
        setShareButtonFeedback(copyShareButton, "Kopyalandi");
      } catch (_error) {
        setShareButtonFeedback(copyShareButton, "Kopyalanamadi");
      } finally {
        closeShareMenu();
      }
    });
  }

  [whatsappShareLink, facebookShareLink, telegramShareLink, xShareLink].forEach((node) => {
    node?.addEventListener("click", () => {
      closeShareMenu();
    });
  });

  document.addEventListener("click", (event) => {
    if (!shareWrap || !(event.target instanceof Node) || shareWrap.contains(event.target)) {
      return;
    }
    closeShareMenu();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeShareMenu();
    }
  });

  setElementVisibility(menuLinkNode, false);
  setElementVisibility(websiteLink, false);
  setElementVisibility(instagramLink, false);
  setElementVisibility(shareWrap, false);

  main();
})();
