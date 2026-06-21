"use strict";

(function initAppWebViewNavOverride() {
  function isNativeAppWebView() {
    return Boolean(
      window.AramaBulAndroid ||
        window.AramaBulIOS ||
        (window.__ARAMABUL_APP__ && window.__ARAMABUL_APP__.isApp)
    );
  }

  function stripLocationParams(rawHref) {
    var href = String(rawHref || "").trim();
    if (!href) return "";
    try {
      var url = new URL(href, window.location.href);
      url.searchParams.delete("nearby");
      url.searchParams.delete("neighborhood");
      return url.pathname + url.search + url.hash;
    } catch (_error) {
      return href
        .replace(/[?&]nearby=1\b/g, "")
        .replace(/[?&]neighborhood=[^&]*/g, "");
    }
  }

  document.addEventListener(
    "click",
    function handleAppWebViewNavigation(event) {
      if (!isNativeAppWebView()) return;
      var target =
        event.target && event.target.closest
          ? event.target.closest(
              '[data-mobile-nav="nearby"], .home-food-card, .home-subcategory-card, .home-subcat-chip'
            )
          : null;
      if (!target) return;

      if (target.hasAttribute("data-home-subcategory-trigger")) {
        return;
      }

      var href = target.getAttribute("href") || window.location.pathname;
      var nextHref = stripLocationParams(href);
      if (!nextHref) return;

      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();

      if (window.ARAMABUL_HIDE_NAV_TOAST) {
        try {
          window.ARAMABUL_HIDE_NAV_TOAST();
        } catch (_error) {}
      }

      window.location.assign(nextHref);
    },
    true
  );
})();
