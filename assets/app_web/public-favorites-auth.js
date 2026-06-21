"use strict";

(function () {
  if (window.__ARAMABUL_FAVORITES_AUTH_FETCH__ || typeof window.fetch !== "function") {
    return;
  }

  const runtime = window.ARAMABUL_RUNTIME || {};
  const originalFetch = window.fetch.bind(window);

  function readLocalSession() {
    if (typeof runtime.readAuthSession === "function") {
      const session = runtime.readAuthSession();
      if (session && session.email) {
        return session;
      }
    }

    try {
      const storageKeys = runtime.storageKeys || {};
      const raw = window.localStorage.getItem(storageKeys.authSession || "aramabul.auth.session.v1");
      const parsed = raw ? JSON.parse(raw) : null;
      if (parsed && parsed.email) {
        const name = parsed.name || parsed.displayName || parsed.fullName || [parsed.firstName, parsed.lastName].filter(Boolean).join(" ");
        return {
          email: parsed.email,
          name,
        };
      }
    } catch (error) {
      return null;
    }

    return null;
  }

  function isSameOriginFavoritesRequest(input) {
    const rawUrl = typeof input === "string" ? input : input && input.url;
    if (!rawUrl) {
      return false;
    }

    try {
      const url = new URL(rawUrl, window.location.origin);
      return url.origin === window.location.origin && url.pathname.startsWith("/api/mvp/favorites");
    } catch (error) {
      return String(rawUrl).startsWith("/api/mvp/favorites");
    }
  }

  function buildHeaders(input, init) {
    const headers = new Headers(input instanceof Request ? input.headers : undefined);
    if (init && init.headers) {
      new Headers(init.headers).forEach((value, key) => {
        headers.set(key, value);
      });
    }
    return headers;
  }

  window.fetch = function fetchWithPublicFavoritesAuth(input, init) {
    if (!isSameOriginFavoritesRequest(input)) {
      return originalFetch(input, init);
    }

    const nextInit = Object.assign({}, init || {});
    if (!nextInit.credentials) {
      nextInit.credentials = "same-origin";
    }

    const session = readLocalSession();
    const email = session && typeof session.email === "string" ? session.email.trim() : "";
    if (!email) {
      return originalFetch(input, nextInit);
    }

    const headers = buildHeaders(input, nextInit);
    headers.set("X-Aramabul-Auth-Email", email);

    const name = session && typeof session.name === "string" ? session.name.trim() : "";
    if (name) {
      headers.set("X-Aramabul-Auth-Name", name);
    }

    nextInit.headers = headers;

    return originalFetch(input, nextInit);
  };

  window.__ARAMABUL_FAVORITES_AUTH_FETCH__ = true;
})();
