(() => {
  const runtime = window.ARAMABUL_RUNTIME;
  if (!runtime) return;

  const AUTH_SESSION_KEY = runtime.storageKeys.authSession;
  const THEME_STORAGE_KEY = runtime.storageKeys.theme;

  const feedbackTargets = Object.freeze({
    destek: { address: "destek@aramabul.com", subject: "Genel Konular" },
    ortaklik: { address: "ortaklik@aramabul.com", subject: "İş Birliği Talebi" },
    icerik: { address: "icerik@aramabul.com", subject: "İçerik Düzeltmeleri" }
  });

  const form = document.querySelector("#settingsFeedbackForm");
  const nameInput = document.querySelector("#settingsFeedbackName");
  const emailInput = document.querySelector("#settingsFeedbackEmail");
  const subjectSelect = document.querySelector("#settingsFeedbackSubject");
  const phoneAreaCode = document.querySelector("#settingsFeedbackPhoneAreaCode");
  const phoneNumber = document.querySelector("#settingsFeedbackPhoneNumber");
  const messageTextarea = document.querySelector("#settingsFeedbackMessage");
  const statusMessage = document.querySelector("#settingsFeedbackStatus");
  const formTitle = document.querySelector(".settings-feedback-form-card .language-card-head h2");
  const formSub = document.querySelector(".settings-feedback-form-card .language-card-head p");
  const submitBtn = document.querySelector(".settings-feedback-submit");

  function readStorageValue(key) {
    return runtime.readStorageValue(key);
  }

  function translateUi(key) {
    const headerI18n = window.ARAMABUL_HEADER_I18N;
    if (headerI18n && typeof headerI18n.getStaticUiTranslation === "function") {
      const lang = typeof window.ARAMABUL_GET_LANGUAGE === "function" ? window.ARAMABUL_GET_LANGUAGE() : "TR";
      return headerI18n.getStaticUiTranslation(String(key || ""), lang);
    }
    return key;
  }

  function setStatus(text, isError = false) {
    if (statusMessage) {
      statusMessage.textContent = text;
      statusMessage.classList.toggle("is-ok", !isError && Boolean(text));
    }
  }

  function applyTranslations() {
    if (formTitle) formTitle.textContent = translateUi("Geribildirim");
    if (formSub) formSub.textContent = translateUi("Mesajını konu seçerek hızlıca iletebilirsin.");
    if (submitBtn) submitBtn.textContent = translateUi("Gönder");
    
    const mobileTitleEl = document.querySelector("#profileMobileTitle");
    if (mobileTitleEl) {
      mobileTitleEl.textContent = translateUi("Geribildirim");
    }
  }

  // Mobile navigation setup
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
        // Remove existing listener if any, and add new one
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

  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const name = String(nameInput ? nameInput.value : "").trim();
      const email = String(emailInput ? emailInput.value : "").trim().toLowerCase();
      const subject = String(subjectSelect ? subjectSelect.value : "").trim();
      const area = String(phoneAreaCode ? phoneAreaCode.value : "").trim();
      const num = String(phoneNumber ? phoneNumber.value : "").trim();
      const msg = String(messageTextarea ? messageTextarea.value : "").trim();
      const target = feedbackTargets[subject];

      if (!(name && email && target && msg)) {
        if (typeof form.reportValidity === "function") {
          form.reportValidity();
        }
        setStatus(translateUi("Lütfen ad, e-posta, konu ve mesaj alanlarını doldur."), true);
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

      setStatus(translateUi("Mesajın seçilen konuya göre hazırlandı."));
      window.location.href = mailtoHref;
    });
  }

  // Theme support
  const currentTheme = (() => {
    try {
      return String(readStorageValue(THEME_STORAGE_KEY) || "").trim().toLowerCase() === "light" ? "light" : "dark";
    } catch (e) {
      return "dark";
    }
  })();
  if (typeof window.ARAMABUL_SET_THEME === "function") {
    window.ARAMABUL_SET_THEME(currentTheme);
  } else {
    document.body.classList.toggle("theme-dark", currentTheme === "dark");
    document.body.classList.toggle("theme-light", currentTheme === "light");
    document.documentElement.setAttribute("data-theme", currentTheme);
  }

  // Pre-fill logged-in session email/name if available
  (() => {
    try {
      const rawSession = readStorageValue(AUTH_SESSION_KEY);
      if (!rawSession) return;
      const session = JSON.parse(rawSession);
      if (session && typeof session === "object" && session.email) {
        if (nameInput && !nameInput.value.trim()) {
          nameInput.value = String(session.name || "").trim();
        }
        if (emailInput && !emailInput.value.trim()) {
          emailInput.value = String(session.email).trim().toLowerCase();
        }
      }
    } catch (e) {}
  })();

  applyTranslations();
  initMobileHeader();

  window.addEventListener("resize", initMobileHeader, { passive: true });
  window.addEventListener("orientationchange", initMobileHeader);
  document.addEventListener("aramabul:languagechange", applyTranslations);
})();