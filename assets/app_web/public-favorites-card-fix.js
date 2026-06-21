"use strict";

(function () {
  if (window.__ARAMABUL_FAVORITES_CARD_FIX__) {
    return;
  }

  function showFavoriteMessage(message, isError) {
    let toast = document.getElementById("aramabulFavoriteToast");
    if (!toast) {
      toast = document.createElement("div");
      toast.id = "aramabulFavoriteToast";
      toast.style.cssText = [
        "position: fixed",
        "left: 50%",
        "bottom: 92px",
        "transform: translateX(-50%)",
        "z-index: 999999",
        "max-width: min(420px, calc(100vw - 32px))",
        "padding: 12px 16px",
        "border-radius: 10px",
        "border: 1px solid rgba(9, 65, 116, 0.16)",
        "box-shadow: 0 12px 32px rgba(9, 65, 116, 0.18)",
        "font: 600 14px/1.35 'Plus Jakarta Sans', system-ui, sans-serif",
        "text-align: center",
        "opacity: 0",
        "pointer-events: none",
        "transition: opacity 160ms ease, transform 160ms ease",
      ].join(";");
      document.body.appendChild(toast);
    }

    window.clearTimeout(toast.__aramabulHideTimer);
    toast.textContent = message;
    toast.style.background = isError ? "#fff6f6" : "#f6fff8";
    toast.style.color = isError ? "#9f1d1d" : "#14532d";
    toast.style.borderColor = isError ? "rgba(159, 29, 29, 0.22)" : "rgba(20, 83, 45, 0.22)";
    toast.style.opacity = "1";
    toast.style.transform = "translateX(-50%) translateY(0)";
    toast.__aramabulHideTimer = window.setTimeout(() => {
      toast.style.opacity = "0";
      toast.style.transform = "translateX(-50%) translateY(8px)";
    }, 2200);
  }

  function setButtonState(button, isFavorite) {
    button.classList.toggle("is-active", isFavorite);
    button.classList.toggle("is-favorited", isFavorite);
    button.setAttribute("aria-pressed", isFavorite ? "true" : "false");

    if (button.classList.contains("istanbul-favorite-chip")) {
      button.innerHTML = `<img src="assets/fav.png" class="venue-chip-icon" alt="" />${isFavorite ? "Favorilerde" : "Favorilere Ekle"}`;
    }
  }

  function syncVenueButtons(venueId, isFavorite) {
    document.querySelectorAll(".istanbul-venue-card").forEach((card) => {
      if (String(readVenueIdFromCard(card) || "") !== String(venueId)) {
        return;
      }
      card.querySelectorAll(".istanbul-favorite-button, .istanbul-favorite-chip").forEach((button) => {
        setButtonState(button, isFavorite);
      });
    });
  }

  function readVenueIdFromCard(card) {
    if (!card) {
      return "";
    }

    const venue = card.venue || {};
    return venue.id || venue.venueId || card.dataset.venueId || card.dataset.id || "";
  }

  function readVenueIdFromTarget(target) {
    const directId = target.dataset.venueId || target.dataset.id || "";
    if (directId) {
      return directId;
    }

    const card = target.closest(".istanbul-venue-card");
    return readVenueIdFromCard(card);
  }

  async function toggleFavorite(button, venueId) {
    const isFavorite = button.getAttribute("aria-pressed") === "true" || button.classList.contains("is-active") || button.classList.contains("is-favorited");
    const response = await fetch(`/api/mvp/favorites/${encodeURIComponent(venueId)}`, {
      method: isFavorite ? "DELETE" : "POST",
      credentials: "same-origin",
      headers: { Accept: "application/json" },
    });

    if (!response.ok) {
      if (response.status === 401) {
        showFavoriteMessage("Favori kaydetmek için giriş yapmalısın.", true);
      } else {
        showFavoriteMessage("Favori işlemi tamamlanamadı.", true);
      }
      return;
    }

    const nextState = !isFavorite;
    syncVenueButtons(venueId, nextState);
    showFavoriteMessage(nextState ? "Mekan favorilere kaydedildi." : "Mekan favorilerden çıkarıldı.", false);
  }

  document.addEventListener("click", (event) => {
    const target = event.target instanceof Element ? event.target.closest(".istanbul-favorite-button, .istanbul-favorite-chip") : null;
    if (!target) {
      return;
    }

    const venueId = readVenueIdFromTarget(target);
    if (!venueId) {
      console.warn("Favori butonu için mekan ID bulunamadı.", target);
      showFavoriteMessage("Favori işlemi tamamlanamadı.", true);
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();

    if (target.disabled) {
      return;
    }

    target.disabled = true;
    toggleFavorite(target, venueId).catch((error) => {
      console.error("Favori işlemi hatası:", error);
      showFavoriteMessage("Favori işlemi tamamlanamadı.", true);
    }).finally(() => {
      target.disabled = false;
    });
  }, true);

  window.__ARAMABUL_FAVORITES_CARD_FIX__ = true;
})();
