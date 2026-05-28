(() => {
  "use strict";

  const CONSENT_KEY = "aramabul_cookie_consent";
  const ADSENSE_CLIENT = "ca-pub-3016888060216617";
  const lang = (document.documentElement.lang || "tr").toLowerCase();

  const labels = lang.startsWith("tr")
    ? {
        title: "Çerez Kullanımı",
        text: "Aramabul, size daha iyi bir deneyim sunmak, içerikleri kişiselleştirmek ve reklam hizmetleri sağlamak için çerezleri kullanır.",
        accept: "Kabul Et",
        reject: "Sadece Zorunlu",
        learnMore: "Çerez Politikası",
        learnMoreHref: "cerez-politikasi.html",
        settingsText: "Gizlilik ve çerez ayarları",
      }
    : {
        title: "Cookie Usage",
        text: "Aramabul uses cookies to provide a better experience, personalize content, and deliver advertising services.",
        accept: "Accept All",
        reject: "Essential Only",
        learnMore: "Cookie Policy",
        learnMoreHref: "cerez-politikasi.html",
        settingsText: "Privacy and cookie settings",
      };

  /* ── Google Funding Choices ── */
  window.googlefc = window.googlefc || {};
  window.googlefc.callbackQueue = window.googlefc.callbackQueue || [];

  function openPrivacySettings() {
    if (typeof window.googlefc.showRevocationMessage === "function") {
      window.googlefc.callbackQueue.push(window.googlefc.showRevocationMessage);
      return;
    }
    window.location.href = labels.learnMoreHref;
  }

  /* ── AdSense script ── */
  function ensureAdsenseTag() {
    const existing = document.querySelector(
      `script[src*="pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"]`,
    );
    if (existing) return;
    const script = document.createElement("script");
    script.async = true;
    script.crossOrigin = "anonymous";
    script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`;
    document.head.appendChild(script);
  }

  /* ── Banner Style ── */
  function injectBannerStyle() {
    if (document.getElementById("cookie-consent-style")) return;
    const style = document.createElement("style");
    style.id = "cookie-consent-style";
    style.textContent = `
      .cookie-consent-banner {
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        z-index: 99999;
        background: linear-gradient(135deg, #0d2032 0%, #163a28 100%);
        color: #e8ece9;
        padding: 20px 24px;
        font-family: "Plus Jakarta Sans", system-ui, -apple-system, sans-serif;
        box-shadow: 0 -4px 24px rgba(0,0,0,0.25);
        animation: cookieSlideUp 0.4s ease-out;
      }
      @keyframes cookieSlideUp {
        from { transform: translateY(100%); opacity: 0; }
        to { transform: translateY(0); opacity: 1; }
      }
      .cookie-consent-inner {
        max-width: 1200px;
        margin: 0 auto;
        display: flex;
        align-items: center;
        gap: 20px;
        flex-wrap: wrap;
      }
      .cookie-consent-text {
        flex: 1;
        min-width: 260px;
        font-size: 0.92rem;
        line-height: 1.5;
        color: rgba(232,236,233,0.88);
      }
      .cookie-consent-text strong {
        display: block;
        font-size: 1rem;
        margin-bottom: 4px;
        color: #fff;
      }
      .cookie-consent-text a {
        color: #7ecfb0;
        text-decoration: underline;
        text-underline-offset: 0.14em;
      }
      .cookie-consent-text a:hover {
        color: #a3e8cd;
      }
      .cookie-consent-actions {
        display: flex;
        gap: 10px;
        flex-shrink: 0;
      }
      .cookie-consent-btn {
        appearance: none;
        border: none;
        border-radius: 8px;
        padding: 10px 22px;
        font: 600 0.92rem/1.2 "Plus Jakarta Sans", system-ui, sans-serif;
        cursor: pointer;
        transition: background 0.2s, transform 0.15s;
        white-space: nowrap;
      }
      .cookie-consent-btn:active { transform: scale(0.97); }
      .cookie-consent-accept {
        background: #1f8a5e;
        color: #fff;
      }
      .cookie-consent-accept:hover { background: #26a772; }
      .cookie-consent-reject {
        background: rgba(255,255,255,0.12);
        color: #d0d6d2;
        border: 1px solid rgba(255,255,255,0.18);
      }
      .cookie-consent-reject:hover {
        background: rgba(255,255,255,0.18);
        color: #fff;
      }
      @media (max-width: 600px) {
        .cookie-consent-banner { padding: 16px; }
        .cookie-consent-inner { flex-direction: column; align-items: stretch; gap: 14px; }
        .cookie-consent-actions { justify-content: stretch; }
        .cookie-consent-btn { flex: 1; text-align: center; padding: 12px 16px; }
      }

      /* Footer privacy settings link */
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

  /* ── Consent state ── */
  function getConsent() {
    try {
      return localStorage.getItem(CONSENT_KEY);
    } catch (_e) {
      return null;
    }
  }

  function setConsent(value) {
    try {
      localStorage.setItem(CONSENT_KEY, value);
    } catch (_e) {
      /* noop */
    }
  }

  /* ── Banner ── */
  function showBanner() {
    if (document.getElementById("cookieConsentBanner")) return;
    injectBannerStyle();

    const banner = document.createElement("div");
    banner.id = "cookieConsentBanner";
    banner.className = "cookie-consent-banner";
    banner.setAttribute("role", "dialog");
    banner.setAttribute("aria-label", labels.title);

    banner.innerHTML = `
      <div class="cookie-consent-inner">
        <div class="cookie-consent-text">
          <strong>${labels.title}</strong>
          ${labels.text}
          <a href="${labels.learnMoreHref}">${labels.learnMore}</a>
        </div>
        <div class="cookie-consent-actions">
          <button id="cookieRejectBtn" class="cookie-consent-btn cookie-consent-reject">${labels.reject}</button>
          <button id="cookieAcceptBtn" class="cookie-consent-btn cookie-consent-accept">${labels.accept}</button>
        </div>
      </div>
    `;

    document.body.appendChild(banner);

    document.getElementById("cookieAcceptBtn").addEventListener("click", () => {
      setConsent("all");
      banner.remove();
      if (typeof gtag === "function") {
        gtag("consent", "update", {
          "ad_storage": "granted",
          "ad_user_data": "granted",
          "ad_personalization": "granted",
          "analytics_storage": "granted"
        });
      }
      ensureAdsenseTag();
    });

    document.getElementById("cookieRejectBtn").addEventListener("click", () => {
      setConsent("essential");
      banner.remove();
      if (typeof gtag === "function") {
        gtag("consent", "update", {
          "ad_storage": "denied",
          "ad_user_data": "denied",
          "ad_personalization": "denied",
          "analytics_storage": "denied"
        });
      }
    });
  }

  /* ── Footer link ── */
  function injectFooterLink() {
    if (document.querySelector(".privacy-settings-link")) return;
    const footerBottom = document.querySelector(".yr-footer-bottom");
    if (!footerBottom) return;

    const button = document.createElement("button");
    button.type = "button";
    button.className = "privacy-settings-link";
    button.textContent = labels.settingsText;
    button.addEventListener("click", openPrivacySettings);

    const footerCopyright = footerBottom.querySelector("p");
    if (footerCopyright) {
      footerCopyright.insertAdjacentElement("afterend", button);
    } else {
      footerBottom.appendChild(button);
    }
  }

  /* ── Init ── */
  function init() {
    const consent = getConsent();
    if (!consent) {
      showBanner();
    } else if (consent === "all") {
      ensureAdsenseTag();
    }
    // Footer privacy link removed per design decision
    // injectFooterLink();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
