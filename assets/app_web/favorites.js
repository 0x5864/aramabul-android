"use strict";

(function () {
  const favoritesGrid = document.getElementById("favoritesGrid");
  if (!favoritesGrid) return;

  const favoritesTitle = document.getElementById("favoritesTitle");
  const favoritesMeta = document.getElementById("favoritesMeta");
  const favoritesState = document.getElementById("favoritesState");
  const favoriteVenueCardTemplate = document.getElementById("favoriteVenueCardTemplate");

  async function loadFavorites() {
    favoritesState.hidden = false;
    favoritesState.textContent = "Favoriler getiriliyor.";
    
    const response = await fetch("/api/mvp/favorites", {
      headers: { Accept: "application/json" }
    });
    if (!response.ok) {
      throw new Error("Favoriler yüklenemedi.");
    }
    const data = await response.json();
    renderFavorites(Array.isArray(data.items) ? data.items : []);
  }

  function renderFavorites(items) {
    favoritesGrid.innerHTML = "";
    if (!items.length) {
      favoritesGrid.hidden = true;
      favoritesState.hidden = false;
      favoritesState.textContent = "Henüz kayıtlı mekanın yok.";
      favoritesTitle.textContent = "Favori mekanların burada görünecek";
      favoritesMeta.textContent = "Yeme-İçme ekranından mekan kaydetmeye başlayabilirsin.";
      return;
    }

    favoritesGrid.hidden = false;
    favoritesState.hidden = true;
    favoritesTitle.textContent = "Favorilerim";
    favoritesMeta.textContent = `${new Intl.NumberFormat("tr-TR").format(items.length)} mekan kayıtlı`;

    items.forEach(venue => {
      const clone = favoriteVenueCardTemplate.content.cloneNode(true);
      const eyebrow = clone.querySelector(".istanbul-venue-eyebrow");
      const titleLink = clone.querySelector(".istanbul-venue-title-link");
      const address = clone.querySelector(".istanbul-venue-address");
      const rating = clone.querySelector(".istanbul-venue-rating");
      const budget = clone.querySelector(".istanbul-venue-budget");
      const tagsContainer = clone.querySelector(".istanbul-venue-tags");
      const favoriteButton = clone.querySelector(".istanbul-favorite-button");
      const mapLink = clone.querySelector(".istanbul-venue-map-link");

      const distVal = Number(venue.distanceMeters);
      const distText = Number.isFinite(distVal)
        ? (distVal < 1000 ? `${Math.round(distVal)} m` : `${(distVal / 1000).toFixed(1).replace(".", ",")} km`)
        : "";

      eyebrow.textContent = [venue.district, venue.neighborhood, distText].filter(Boolean).join(" / ");
      
      titleLink.textContent = venue.name || "İsimsiz mekan";
      const targetUrl = `${venue.domainKey || "yeme-icme"}.html?venue=${venue.slug}`;
      titleLink.href = targetUrl;

      const cardElement = clone.querySelector(".istanbul-venue-card");
      if (cardElement) {
        cardElement.addEventListener("click", e => {
          if (!e.target.closest("a, button")) {
            window.location.href = targetUrl;
          }
        });
      }

      address.textContent = venue.address || "Adres bilgisi bulunmuyor.";
      rating.textContent = "";
      rating.hidden = true;

      budget.textContent = (function (b) {
        const cleaned = String(b || "").trim().toLowerCase();
        if (!cleaned) return "";
        if (cleaned === "budget" || cleaned === "₺" || cleaned === "₺₺") return "Uygun";
        if (cleaned === "mid" || cleaned === "₺₺₺") return "Makul";
        if (cleaned === "high" || cleaned === "₺₺₺₺") return "Yüksek";
        return String(b);
      })(venue.budget) || "Bütçe yok";

      if (venue.mapsUrl) {
        mapLink.href = venue.mapsUrl;
      } else {
        mapLink.hidden = true;
      }

      if (Array.isArray(venue.tags) && venue.tags.length) {
        venue.tags.forEach(tag => {
          const span = document.createElement("span");
          span.className = "istanbul-venue-tag";
          span.textContent = tag;
          tagsContainer.appendChild(span);
        });
      }

      favoriteButton.addEventListener("click", async () => {
        try {
          favoriteButton.disabled = true;
          await deleteFavorite(venue.id);
          await loadFavorites();
        } catch (err) {
          favoritesState.hidden = false;
          favoritesState.textContent = err instanceof Error ? err.message : "Favori kaldırılamadı.";
        } finally {
          favoriteButton.disabled = false;
        }
      });

      favoritesGrid.appendChild(clone);
    });
  }

  async function deleteFavorite(venueId) {
    const res = await fetch(`/api/mvp/favorites/${encodeURIComponent(venueId)}`, {
      method: "DELETE",
      headers: { Accept: "application/json" }
    });
    if (!res.ok) {
      throw new Error("Favori kaldırılamadı.");
    }
  }

  loadFavorites().catch(err => {
    favoritesState.hidden = false;
    favoritesState.textContent = err instanceof Error ? err.message : "Favoriler yüklenemedi.";
    favoritesGrid.hidden = true;
  });
})();