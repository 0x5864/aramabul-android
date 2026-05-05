(() => {
  "use strict";

  const ADSENSE_CLIENT = "ca-pub-3016888060216617";
  const lang = (document.documentElement.lang || "tr").toLowerCase();
  const labels = lang.startsWith("tr")
    ? {
        text: "Gizlilik ve çerez ayarları",
        fallbackHref: "cerez-politikasi.html",
      }
    : {
        text: "Privacy and cookie settings",
        fallbackHref: "cerez-politikasi.html",
      };

  window.googlefc = window.googlefc || {};
  window.googlefc.callbackQueue = window.googlefc.callbackQueue || [];

  function openPrivacySettings() {
    if (typeof window.googlefc.showRevocationMessage === "function") {
      window.googlefc.callbackQueue.push(window.googlefc.showRevocationMessage);
      return;
    }
    window.location.href = labels.fallbackHref;
  }

  function ensureAdsenseTag() {
    const existing = document.querySelector(
      `script[src*="pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"]`,
    );
    if (existing) {
      return;
    }

    const script = document.createElement("script");
    script.async = true;
    script.crossOrigin = "anonymous";
    script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`;
    document.head.appendChild(script);
  }

  function injectStyle() {
    if (document.getElementById("adsense-privacy-style")) {
      return;
    }
    const style = document.createElement("style");
    style.id = "adsense-privacy-style";
    style.textContent = `
      .privacy-settings-link {
        appearance: none;
        border: 0;
        background: transparent;
        color: rgba(22, 33, 35, 0.76);
        font: inherit;
        font-size: 0.92rem;
        line-height: 1.3;
        padding: 0;
        cursor: pointer;
        text-decoration: underline;
        text-underline-offset: 0.14em;
      }

      .privacy-settings-link:hover,
      .privacy-settings-link:focus-visible {
        color: var(--link-hover, #0281c2);
        outline: none;
      }
    `;
    document.head.appendChild(style);
  }

  function injectLink() {
    if (document.querySelector(".privacy-settings-link")) {
      return;
    }

    const footerBottom = document.querySelector(".yr-footer-bottom");
    if (!footerBottom) {
      return;
    }

    injectStyle();
    const button = document.createElement("button");
    button.type = "button";
    button.className = "privacy-settings-link";
    button.textContent = labels.text;
    button.addEventListener("click", openPrivacySettings);

    const footerCopyright = footerBottom.querySelector("p");
    if (footerCopyright) {
      footerCopyright.insertAdjacentElement("afterend", button);
      return;
    }

    footerBottom.appendChild(button);
  }

  if (document.readyState === "loading") {
    document.addEventListener(
      "DOMContentLoaded",
      () => {
        ensureAdsenseTag();
        injectLink();
      },
      { once: true },
    );
  } else {
    ensureAdsenseTag();
    injectLink();
  }
})();
