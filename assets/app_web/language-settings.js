(() => {
  const runtime = window.ARAMABUL_RUNTIME;
  if (!runtime) return;

  const AUTH_SESSION_KEY = runtime.storageKeys.authSession;
  const LANGUAGE_KEY = runtime.storageKeys.language;
  const THEME_STORAGE_KEY = runtime.storageKeys.theme;

  const langConfig = {
    TR: { htmlLang: "tr" },
    EN: { htmlLang: "en" },
    DE: { htmlLang: "de" },
    RU: { htmlLang: "ru" },
    ZH: { htmlLang: "zh" }
  };

  const selectMessages = {
    TR: "{code} seçildi.",
    EN: "{code} selected.",
    DE: "{code} ausgewählt.",
    RU: "Выбран язык {code}.",
    ZH: "已选择 {code}。"
  };

  const settingsAvatar = document.querySelector("#settingsAvatar");
  const settingsName = document.querySelector("#settingsName");
  const settingsHandle = document.querySelector("#settingsHandle");
  const langChoices = [...document.querySelectorAll("[data-language-choice]")];
  const homeLink = document.querySelector(".settings-home-link");
  const saveMessageEl = document.querySelector("#languageSaveMessage");
  const feedbackForm = document.querySelector("#settingsFeedbackForm");
  const feedbackName = document.querySelector("#settingsFeedbackName");
  const feedbackEmail = document.querySelector("#settingsFeedbackEmail");
  const feedbackSubject = document.querySelector("#settingsFeedbackSubject");
  const feedbackAreaCode = document.querySelector("#settingsFeedbackPhoneAreaCode");
  const feedbackPhone = document.querySelector("#settingsFeedbackPhoneNumber");
  const feedbackMsg = document.querySelector("#settingsFeedbackMessage");
  const feedbackStatus = document.querySelector("#settingsFeedbackStatus");

  const panelTriggers = [...document.querySelectorAll("[data-settings-panel-trigger]")];
  const panels = [...document.querySelectorAll("[data-settings-panel]")];
  const sidebarCard = document.querySelector(".settings-sidebar-card");
  const panelStack = document.querySelector(".settings-panel-stack");

  let adminSession = null;

  const feedbackTargets = Object.freeze({
    destek: { address: "destek@aramabul.com", subject: "Genel Konular" },
    ortaklik: { address: "ortaklik@aramabul.com", subject: "İş Birliği Talebi" },
    icerik: { address: "icerik@aramabul.com", subject: "İçerik Düzeltmeleri" }
  });

  function readStorageValue(key) {
    return runtime.readStorageValue(key);
  }

  function writeStorageValue(key, val) {
    runtime.writeStorageValue(key, val);
  }

  function dispatchCompatEvent(name, detail = {}) {
    runtime.dispatch(name, detail);
  }

  function translateUi(key) {
    const headerI18n = window.ARAMABUL_HEADER_I18N;
    if (headerI18n && typeof headerI18n.getStaticUiTranslation === "function") {
      const lang = typeof window.ARAMABUL_GET_LANGUAGE === "function" ? window.ARAMABUL_GET_LANGUAGE() : "TR";
      return headerI18n.getStaticUiTranslation(String(key || ""), lang);
    }
    return key;
  }

  function updateAdminLinkState(session) {
    const adminLink = document.querySelector("[data-admin-settings-link]");
    const adminLabel = document.querySelector("[data-admin-settings-link-label]");
    if (!(adminLink instanceof HTMLAnchorElement && adminLabel instanceof HTMLElement)) return;

    const currentSession = readSession();
    const email = currentSession && currentSession.email ? String(currentSession.email).toLowerCase() : "";
    const isHardcodedAdmin = email && (
      "admin@aramabul.com" === email ||
      "metin.tuncgenc@gmail.com" === email ||
      "aramabul.com@gmail.com" === email ||
      email.startsWith("admin@") ||
      email.endsWith(".admin")
    );
    const hasSession = Boolean(session?.email);

    if (isHardcodedAdmin || hasSession) {
      adminLink.style.setProperty("display", "flex", "important");
      const labelText = hasSession ? "Admin Paneli" : "Admin Girişi";
      adminLink.href = hasSession ? "admin-venues.html" : "admin-login.html";
      adminLink.setAttribute("aria-label", labelText);
      adminLabel.textContent = labelText;
    } else {
      adminLink.style.setProperty("display", "none", "important");
    }
  }

  function readTheme() {
    try {
      return String(readStorageValue(THEME_STORAGE_KEY) || "").trim().toLowerCase() === "light" ? "light" : "dark";
    } catch (e) {
      return "dark";
    }
  }

  function readSession() {
    try {
      const val = readStorageValue(AUTH_SESSION_KEY);
      if (!val) return null;
      const parsed = JSON.parse(val);
      if (!parsed || typeof parsed !== "object") return null;
      const name = String(parsed.name || "").trim();
      const email = String(parsed.email || "").trim().toLowerCase();
      return name && email ? { name, email } : null;
    } catch (e) {
      return null;
    }
  }

  function renderAccount() {
    const session = readSession();
    const displayName = session?.name || "Misafir";
    const email = session?.email || "";
    const initial = displayName.charAt(0).toLocaleUpperCase("tr") || "M";

    if (settingsAvatar) settingsAvatar.textContent = initial;
    if (settingsName) settingsName.textContent = displayName;
    if (settingsHandle) {
      settingsHandle.textContent = email
        ? `@${(email.split("@")[0] || email).toLowerCase().replace(/[^a-z0-9._-]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "") || "kullanici"}.aramabul`
        : "@giris-yapilmadi";
    }

    const loginLabel = document.querySelector('[data-settings-panel-trigger="login"] .settings-row-label');
    if (loginLabel) {
      loginLabel.textContent = translateUi(session ? "Çıkış Yap" : "Giriş Yap");
    }

    const loginRow = document.querySelector('[data-settings-panel-trigger="login"]');
    if (loginRow) {
      loginRow.style.setProperty("display", "flex", "important");
      loginRow.setAttribute("aria-label", translateUi(session ? "Çıkış Yap" : "Giriş Yap"));
      const iconContainer = loginRow.querySelector(".settings-row-icon");
      if (iconContainer) {
        iconContainer.innerHTML = session
          ? '<svg viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>'
          : '<svg viewBox="0 0 24 24"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path><polyline points="10 17 15 12 10 7"></polyline><line x1="15" y1="12" x2="3" y2="12"></line></svg>';
      }
    }

    if (feedbackName && !feedbackName.value.trim()) {
      feedbackName.value = session ? displayName : "";
    }
    if (feedbackEmail && !feedbackEmail.value.trim()) {
      feedbackEmail.value = email;
    }

    updateAdminLinkState(adminSession);
  }

  function setFeedbackStatus(text, isError = false) {
    if (feedbackStatus) {
      feedbackStatus.textContent = text;
      feedbackStatus.classList.toggle("is-ok", !isError && Boolean(text));
    }
  }

  function activatePanel(panelKey) {
    const activeKey = ["feedback", "help", "about"].includes(panelKey) ? panelKey : "language";
    
    panelTriggers.forEach((btn) => {
      const match = String(btn.dataset.settingsPanelTrigger || "") === activeKey;
      btn.classList.toggle("is-active", match);
      btn.setAttribute("aria-pressed", match ? "true" : "false");
      if (match) {
        btn.setAttribute("aria-current", "page");
      } else {
        btn.removeAttribute("aria-current");
      }
    });

    panels.forEach((panel) => {
      panel.hidden = String(panel.dataset.settingsPanel || "") !== activeKey;
    });
  }

  function shouldForceMobileLayout() {
    if (window.__ARAMABUL_APP__ && window.__ARAMABUL_APP__.isApp) {
      return true;
    }
    const screenWidth = Number(window.screen?.width || 0);
    const screenHeight = Number(window.screen?.height || 0);
    const screenMin = Math.min(screenWidth, screenHeight);
    const viewportWidth = Number(window.innerWidth || document.documentElement.clientWidth || 0);
    const isLikelyPhone = screenMin > 0 && screenMin <= 540;
    const isDesktopScaledViewport = viewportWidth >= 700;
    return isLikelyPhone && isDesktopScaledViewport;
  }

  function initMobileHeader() {
    const isMobile = window.innerWidth < 700 || shouldForceMobileLayout();
    const backBtn = document.querySelector("#profileMobileBackBtn");
    
    if (isMobile) {
      document.body.classList.add("mobile-panel-active");
      if (backBtn) {
        backBtn.style.setProperty("display", "flex", "important");
        // Clear old listener
        const newBackBtn = backBtn.cloneNode(true);
        backBtn.parentNode.replaceChild(newBackBtn, backBtn);
        newBackBtn.addEventListener("click", () => {
          window.location.href = "profile.html";
        });
      }
    } else {
      document.body.classList.remove("mobile-panel-active");
      if (backBtn) {
        backBtn.style.display = "none";
      }
    }
    
    document.body.classList.toggle("settings-force-mobile", shouldForceMobileLayout());
  }

  function setLanguage(langCode, writeToStorage = true) {
    const normalized = langConfig[langCode] ? langCode : "TR";
    document.documentElement.lang = langConfig[normalized].htmlLang;
    window.ARAMABUL_CURRENT_LANGUAGE = normalized;

    if (writeToStorage) {
      writeStorageValue(LANGUAGE_KEY, normalized);
    }

    langChoices.forEach((btn) => {
      const match = String(btn.dataset.languageChoice || "").toUpperCase() === normalized;
      btn.classList.toggle("active", match);
      btn.setAttribute("aria-pressed", match ? "true" : "false");
    });

    dispatchCompatEvent("aramabul:languagechange", { language: normalized });
    
    const mobileTitleEl = document.querySelector("#profileMobileTitle");
    if (mobileTitleEl) {
      mobileTitleEl.textContent = translateUi("Dil Ayarları");
    }
  }

  if (homeLink) {
    homeLink.addEventListener("click", (e) => {
      e.preventDefault();
      window.location.assign("index.html");
    });
  }

  const loginRow = document.querySelector('[data-settings-panel-trigger="login"]');
  if (loginRow) {
    loginRow.addEventListener("click", (e) => {
      if (readSession()) {
        e.preventDefault();
        runtime.removeStorageValue(AUTH_SESSION_KEY);
        dispatchCompatEvent("aramabul:authchange");
        renderAccount();
      }
    });
  }

  langChoices.forEach((btn) => {
    btn.addEventListener("click", () => {
      const choice = String(btn.dataset.languageChoice || "").toUpperCase();
      setLanguage(choice, true);
      const msg = (selectMessages[choice] || selectMessages.TR).replace("{code}", choice);
      if (saveMessageEl) {
        saveMessageEl.textContent = msg;
      }
    });
  });

  if (feedbackForm) {
    feedbackForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const name = String(feedbackName ? feedbackName.value : "").trim();
      const email = String(feedbackEmail ? feedbackEmail.value : "").trim().toLowerCase();
      const subject = String(feedbackSubject ? feedbackSubject.value : "").trim();
      const area = String(feedbackAreaCode ? feedbackAreaCode.value : "").trim();
      const num = String(feedbackPhone ? feedbackPhone.value : "").trim();
      const msg = String(feedbackMsg ? feedbackMsg.value : "").trim();
      const target = feedbackTargets[subject];

      if (!(name && email && target && msg)) {
        if (typeof feedbackForm.reportValidity === "function") {
          feedbackForm.reportValidity();
        }
        setFeedbackStatus(translateUi("Lütfen ad, e-posta, konu ve mesaj alanlarını doldur."), true);
        return;
      }

      const bodyLines = [
        `Ad Soyad: ${name}`,
        `E-posta: ${email}`
      ];
      if (area || num) {
        bodyLines.push(`Telefon: +90 ${area} ${num}`.trim());
      }
      bodyLines.push("", msg);

      const mailtoHref = `mailto:${target.address}`
        + `?subject=${encodeURIComponent(translateUi(target.subject))}`
        + `&body=${encodeURIComponent(bodyLines.join("\n"))}`;

      setFeedbackStatus(translateUi("Mesajın seçilen konuya göre hazırlandı."));
      window.location.href = mailtoHref;
    });
  }

  panelTriggers.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const triggerKey = String(btn.dataset.settingsPanelTrigger || "");
      if (["feedback", "help", "about"].includes(triggerKey)) {
        if (btn instanceof HTMLAnchorElement) {
          e.preventDefault();
        }
        activatePanel(triggerKey);
      }
    });
  });

  // Theme Setup
  const theme = readTheme();
  if (typeof window.ARAMABUL_SET_THEME === "function") {
    window.ARAMABUL_SET_THEME(theme);
  } else {
    document.body.classList.toggle("theme-dark", theme === "dark");
    document.body.classList.toggle("theme-light", theme === "light");
    document.documentElement.setAttribute("data-theme", theme);
  }

  // Language Setup
  const initialLang = (() => {
    try {
      const stored = String(readStorageValue(LANGUAGE_KEY) || "").trim().toUpperCase();
      return langConfig[stored] ? stored : "TR";
    } catch (e) {
      return "TR";
    }
  })();
  setLanguage(initialLang, false);

  initMobileHeader();
  renderAccount();

  // Fetch admin session state
  (async () => {
    try {
      const res = await fetch("/api/admin/auth/session", {
        credentials: "include",
        headers: { Accept: "application/json" }
      });
      const data = await res.json().catch(() => null);
      return res.ok && data?.session ? data.session : null;
    } catch (e) {
      return null;
    }
  })().then((session) => {
    adminSession = session;
    updateAdminLinkState(session);
  });

  activatePanel("language");

  window.addEventListener("resize", initMobileHeader, { passive: true });
  window.addEventListener("orientationchange", initMobileHeader);
  document.addEventListener("aramabul:authchange", () => {
    renderAccount();
  });
})();