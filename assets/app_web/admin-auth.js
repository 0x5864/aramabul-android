"use strict";

(function initAdminAuth(globalObject) {
  const LOGIN_PATH = "admin-login.html";

  function buildCurrentTargetPath() {
    const pathName = window.location.pathname.split("/").pop() || "admin-venues.html";
    return `${pathName}${window.location.search || ""}${window.location.hash || ""}`;
  }

  function redirectToLogin() {
    const nextTarget = buildCurrentTargetPath();
    window.location.href = `${LOGIN_PATH}?next=${encodeURIComponent(nextTarget)}`;
  }

  async function fetchAdminSession() {
    const response = await fetch("/api/admin/auth/session", {
      credentials: "include",
      headers: {
        Accept: "application/json",
      },
    });

    const payload = await response.json().catch(() => null);
    if (!response.ok) {
      throw new Error(payload?.error?.message || "Admin oturumu kontrol edilemedi.");
    }

    return payload?.session || null;
  }

  async function ensureSession(options = {}) {
    const { redirect = true } = options;
    const session = await fetchAdminSession();
    if (!session && redirect) {
      redirectToLogin();
    }
    return session;
  }

  async function fetchJson(url, options = {}) {
    const { redirectOn401 = true, ...requestOptions } = options || {};
    const response = await fetch(url, {
      ...requestOptions,
      credentials: "include",
      headers: {
        Accept: "application/json",
        ...(requestOptions.headers || {}),
      },
    });

    const payload = await response.json().catch(() => null);
    if (response.status === 401 && redirectOn401) {
      redirectToLogin();
      throw new Error(payload?.error?.message || "Yönetici oturumu gerekli.");
    }

    return { response, payload };
  }

  async function logout() {
    await fetch("/api/admin/auth/logout", {
      method: "POST",
      credentials: "include",
      headers: {
        Accept: "application/json",
      },
    }).catch(() => null);

    redirectToLogin();
  }

  function bindSessionUi(session) {
    const nameNodes = Array.from(document.querySelectorAll("[data-admin-session-name]"));
    nameNodes.forEach((node) => {
      node.textContent = session?.displayName || session?.email || "Admin";
    });

    const logoutNodes = Array.from(document.querySelectorAll("[data-admin-logout]"));
    logoutNodes.forEach((node) => {
      node.addEventListener("click", (event) => {
        event.preventDefault();
        void logout();
      });
    });
  }

  globalObject.AramaBulAdminAuth = {
    buildCurrentTargetPath,
    bindSessionUi,
    ensureSession,
    fetchAdminSession,
    fetchJson,
    logout,
    redirectToLogin,
  };
})(window);
