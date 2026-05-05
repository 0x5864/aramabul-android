"use strict";

(function initFavoritesPage() {
  const grid = document.getElementById("favoritesGrid");
  if (!grid) {
    return;
  }

  const titleNode = document.getElementById("favoritesTitle");
  const metaNode = document.getElementById("favoritesMeta");
  const stateNode = document.getElementById("favoritesState");
  const template = document.getElementById("favoriteVenueCardTemplate");

  function buildDetailUrl(slug) {
    return `venue-detail.html?slug=${encodeURIComponent(slug)}`;
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
    return String(value);
  }

  async function removeFavorite(venueId) {
    const response = await fetch(`/api/mvp/favorites/${encodeURIComponent(venueId)}`, {
      method: "DELETE",
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Favori kaldırılamadı.");
    }
  }

  function renderItems(items) {
    grid.innerHTML = "";

    if (!items.length) {
      grid.hidden = true;
      stateNode.hidden = false;
      stateNode.textContent = "Henüz kayıtlı mekanın yok.";
      titleNode.textContent = "Favori mekanların burada görünecek";
      metaNode.textContent = "Yeme-İçme ekranından mekan kaydetmeye başlayabilirsin.";
      return;
    }

    grid.hidden = false;
    stateNode.hidden = true;
    titleNode.textContent = "Kaydettiğin mekanlar";
    metaNode.textContent = `${formatCount(items.length)} mekan kayıtlı`;

    items.forEach((item) => {
      const fragment = template.content.cloneNode(true);
      const eyebrow = fragment.querySelector(".istanbul-venue-eyebrow");
      const titleLink = fragment.querySelector(".istanbul-venue-title-link");
      const address = fragment.querySelector(".istanbul-venue-address");
      const rating = fragment.querySelector(".istanbul-venue-rating");
      const budget = fragment.querySelector(".istanbul-venue-budget");
      const tags = fragment.querySelector(".istanbul-venue-tags");
      const favoriteButton = fragment.querySelector(".istanbul-favorite-button");
      const mapLink = fragment.querySelector(".istanbul-venue-map-link");

      const distanceText = formatDistance(Number(item.distanceMeters));
      eyebrow.textContent = [item.district, item.neighborhood, distanceText].filter(Boolean).join(" / ");
      titleLink.textContent = item.name || "İsimsiz mekan";
      titleLink.href = buildDetailUrl(item.slug);
      address.textContent = item.address || "Adres bilgisi bulunmuyor.";
      rating.textContent = formatVenueRatingText(item.rating, item.userRatingCount);
      budget.textContent = formatBudgetLabel(item.budget) || "Bütçe yok";

      if (item.mapsUrl) {
        mapLink.href = item.mapsUrl;
      } else {
        mapLink.hidden = true;
      }

      if (Array.isArray(item.tags) && item.tags.length) {
        item.tags.forEach((tagValue) => {
          const badge = document.createElement("span");
          badge.className = "istanbul-venue-tag";
          badge.textContent = tagValue;
          tags.appendChild(badge);
        });
      }

      favoriteButton.addEventListener("click", async () => {
        try {
          favoriteButton.disabled = true;
          await removeFavorite(item.id);
          await loadFavorites();
        } catch (error) {
          stateNode.hidden = false;
          stateNode.textContent = error instanceof Error ? error.message : "Favori kaldırılamadı.";
        } finally {
          favoriteButton.disabled = false;
        }
      });

      grid.appendChild(fragment);
    });
  }

  async function loadFavorites() {
    stateNode.hidden = false;
    stateNode.textContent = "Favoriler getiriliyor.";

    const response = await fetch("/api/mvp/favorites", {
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Favoriler yüklenemedi.");
    }

    const payload = await response.json();
    renderItems(Array.isArray(payload.items) ? payload.items : []);
  }

  loadFavorites().catch((error) => {
    stateNode.hidden = false;
    stateNode.textContent = error instanceof Error ? error.message : "Favoriler yüklenemedi.";
    grid.hidden = true;
  });
})();
