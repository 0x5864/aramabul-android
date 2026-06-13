(() => {
  const runtime = window.ARAMABUL_RUNTIME;
  if (!runtime) return;

  const AUTH_USERS_KEY = runtime.storageKeys.authUsers;
  const AUTH_SESSION_KEY = runtime.storageKeys.authSession;
  const THEME_STORAGE_KEY = runtime.storageKeys.theme;
  const REMEMBERED_EMAIL_KEY = "aramabul_login_remembered_email";

  // Account form elements
  const accountAvatar = document.querySelector("#accountAvatar");
  const accountDisplayName = document.querySelector("#accountDisplayName");
  const accountDisplayHandle = document.querySelector("#accountDisplayHandle");
  const accountNameInput = document.querySelector("#accountNameInput");
  const accountEmailInput = document.querySelector("#accountEmailInput");
  const accountEmailVerificationStatus = document.querySelector("#accountEmailVerificationStatus");
  const accountEmailVerifyBtn = document.querySelector("#accountEmailVerifyBtn");
  const accountSettingsForm = document.querySelector("#accountSettingsForm");
  const accountSettingsMessage = document.querySelector("#accountSettingsMessage");
  const accountSaveBtn = document.querySelector("#accountSaveBtn");
  const accountSignupBtn = document.querySelector("#accountSignupBtn");
  const accountBackBtn = document.querySelector("#accountBackBtn");
  const homeLink = document.querySelector(".settings-home-link");

  // Login form elements
  const loginSection = document.querySelector("#accountLoginSection");
  const loggedInSection = document.querySelector("#accountLoggedInSection");
  const loginForm = document.querySelector("#accountLoginForm");
  const loginEmail = document.querySelector("#accountLoginEmail");
  const loginPassword = document.querySelector("#accountLoginPassword");
  const loginPasswordToggle = document.querySelector("#accountLoginPasswordToggle");
  const loginRememberEmail = document.querySelector("#accountLoginRememberEmail");
  const loginMessage = document.querySelector("#accountLoginMessage");
  const googleSignInBtn = document.querySelector("#accountGoogleSignInBtn");
  const toggleToSignupBtn = document.querySelector("#accountToggleToSignupBtn");
  const logoutBtn = document.querySelector("#accountLogoutBtn");

  // Deletion modal elements
  const deleteBtn = document.querySelector("#accountDeleteBtn");
  const deleteModal = document.querySelector("#accountDeleteModal");
  const deleteCancel = document.querySelector("#accountDeleteCancel");
  const deleteConfirm = document.querySelector("#accountDeleteConfirm");
  const deleteConfirmEmail = document.querySelector("#accountDeleteConfirmEmail");
  const deleteMessage = document.querySelector("#accountDeleteMessage");

  let adminSession = null;

  const verificationState = {
    email: "",
    verified: false,
    loading: false,
    sending: false,
    messageText: "",
    messageIsError: false
  };

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

  function readAllUsers() {
    try {
      const val = readStorageValue(AUTH_USERS_KEY);
      const list = JSON.parse(val || "[]");
      return Array.isArray(list) ? list.filter(u => u && typeof u === "object" && typeof u.name === "string" && typeof u.email === "string" && typeof u.passwordHash === "string") : [];
    } catch (e) {
      return [];
    }
  }

  function writeAllUsers(users) {
    writeStorageValue(AUTH_USERS_KEY, JSON.stringify(users));
  }

  function showLoginView() {
    if (loginSection) loginSection.style.display = "";
    if (loggedInSection) loggedInSection.style.display = "none";
  }

  function showLoggedInView() {
    if (loginSection) loginSection.style.display = "none";
    if (loggedInSection) loggedInSection.style.display = "";
  }

  function setLoginMessage(text, isError = false) {
    if (loginMessage) {
      loginMessage.textContent = text;
      loginMessage.classList.toggle("auth-message-error", isError);
      loginMessage.classList.toggle("is-ok", !isError && Boolean(text));
    }
  }

  function setAccountMessage(text, isError = false) {
    if (accountSettingsMessage) {
      accountSettingsMessage.textContent = text;
      accountSettingsMessage.classList.toggle("is-ok", !isError);
    }
  }

  function setVerificationMessage(text, isError = false) {
    if (accountEmailVerificationStatus) {
      accountEmailVerificationStatus.textContent = text;
      accountEmailVerificationStatus.classList.toggle("is-ok", !isError && Boolean(text));
    }
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

  function updateVerificationControls(session) {
    if (!(accountEmailVerifyBtn instanceof HTMLButtonElement)) return;
    if (!session?.email) {
      accountEmailVerifyBtn.disabled = true;
      accountEmailVerifyBtn.hidden = true;
      setVerificationMessage("");
      return;
    }

    accountEmailVerifyBtn.hidden = false;
    const inputVal = String(accountEmailInput ? accountEmailInput.value : "").trim().toLowerCase();
    const sessionEmail = String(session.email).trim().toLowerCase();

    if (inputVal && inputVal !== sessionEmail) {
      accountEmailVerifyBtn.disabled = true;
      accountEmailVerifyBtn.textContent = translateUi("Önce kaydet");
      setVerificationMessage(translateUi("E-posta değişikliği için önce Kaydet'e bas."), false);
      return;
    }

    if (verificationState.sending) {
      accountEmailVerifyBtn.disabled = true;
      accountEmailVerifyBtn.textContent = translateUi("Gönderiliyor...");
      setVerificationMessage(translateUi("Doğrulama e-postası gönderiliyor..."), false);
      return;
    }

    if (verificationState.loading) {
      accountEmailVerifyBtn.disabled = true;
      accountEmailVerifyBtn.textContent = translateUi("Kontrol ediliyor...");
      setVerificationMessage(translateUi("Doğrulama durumu kontrol ediliyor..."), false);
      return;
    }

    if (verificationState.verified && verificationState.email === sessionEmail) {
      accountEmailVerifyBtn.disabled = true;
      accountEmailVerifyBtn.hidden = true;
      setVerificationMessage(translateUi("E-posta adresin doğrulandı."), false);
      return;
    }

    accountEmailVerifyBtn.disabled = false;
    accountEmailVerifyBtn.textContent = translateUi("Doğrulama e-postası gönder");
    if (verificationState.messageText) {
      setVerificationMessage(verificationState.messageText, verificationState.messageIsError);
    } else {
      setVerificationMessage(translateUi("E-posta adresin henüz doğrulanmadı."), false);
    }
  }

  async function checkEmailVerificationStatus(email, forceUpdate = false) {
    const cleanEmail = String(email || "").trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes("@")) {
      verificationState.email = "";
      verificationState.verified = false;
      verificationState.loading = false;
      verificationState.sending = false;
      verificationState.messageText = "";
      verificationState.messageIsError = false;
      updateVerificationControls(readSession());
      return;
    }

    if (forceUpdate || verificationState.email !== cleanEmail || verificationState.loading || verificationState.sending) {
      verificationState.email = cleanEmail;
      verificationState.loading = true;
      verificationState.messageText = "";
      verificationState.messageIsError = false;
      updateVerificationControls(readSession());

      try {
        const res = await fetch(`/api/auth/email-verification/status?email=${encodeURIComponent(cleanEmail)}`, {
          method: "GET",
          headers: { Accept: "application/json" }
        });
        if (!res.ok) throw new Error("status_failed");
        const status = await res.json();
        verificationState.verified = Boolean(status?.ok && status.verified);
        verificationState.messageText = "";
        verificationState.messageIsError = false;
      } catch (err) {
        verificationState.verified = false;
        verificationState.messageText = translateUi("Doğrulama durumu alınamadı. Tekrar dene.");
        verificationState.messageIsError = true;
      } finally {
        verificationState.loading = false;
        updateVerificationControls(readSession());
      }
    } else {
      updateVerificationControls(readSession());
    }
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
    const mobileTitleEl = document.querySelector("#profileMobileTitle");
    const session = readSession();

    if (isMobile) {
      document.body.classList.add("mobile-panel-active");
      
      const isEmailChange = window.location.hash === "#email-change";
      
      if (mobileTitleEl) {
        if (isEmailChange) {
          mobileTitleEl.textContent = translateUi("E-posta Değişikliği");
        } else {
          mobileTitleEl.textContent = translateUi(session ? "Hesap Bilgileri" : "Giriş Yap");
        }
      }

      if (backBtn) {
        backBtn.style.setProperty("display", "flex", "important");
        // Rebind listener to avoid duplication
        const newBackBtn = backBtn.cloneNode(true);
        backBtn.parentNode.replaceChild(newBackBtn, backBtn);
        
        newBackBtn.addEventListener("click", () => {
          if (isEmailChange) {
            window.location.hash = "";
          } else {
            window.location.href = "profile.html";
          }
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

  function renderAccount() {
    const session = readSession();
    const displayName = session?.name || "Misafir";
    const email = session?.email || "";
    const initial = displayName.charAt(0).toLocaleUpperCase("tr") || "M";

    if (accountAvatar) accountAvatar.textContent = initial;
    if (accountDisplayName) accountDisplayName.textContent = displayName;
    if (accountDisplayHandle) {
      accountDisplayHandle.textContent = email
        ? `@${(email.split("@")[0] || email).toLowerCase().replace(/[^a-z0-9._-]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "") || "kullanici"}.aramabul`
        : "@giris-yapilmadi";
    }

    if (accountNameInput) {
      accountNameInput.value = displayName === "Misafir" ? "" : displayName;
      accountNameInput.disabled = !session;
    }
    if (accountEmailInput) {
      accountEmailInput.value = email;
      accountEmailInput.disabled = !session;
    }
    if (accountSaveBtn instanceof HTMLButtonElement) {
      accountSaveBtn.disabled = !session;
    }
    if (accountSignupBtn instanceof HTMLButtonElement) {
      accountSignupBtn.hidden = Boolean(session);
    }

    if (!session) {
      setAccountMessage(translateUi("Kayıtlı oturum yok. Önce kayıt ol."));
      updateVerificationControls(null);
    } else {
      setAccountMessage("");
      updateVerificationControls(session);
      checkEmailVerificationStatus(session.email);
    }
    
    updateAdminLinkState(adminSession);
    initMobileHeader();
  }

  // Event Listeners
  if (accountBackBtn) {
    accountBackBtn.addEventListener("click", () => {
      window.location.assign("profile.html?action=profile");
    });
  }

  if (homeLink) {
    homeLink.addEventListener("click", (e) => {
      e.preventDefault();
      window.location.assign("profile.html?action=profile");
    });
  }

  if (accountSignupBtn) {
    accountSignupBtn.addEventListener("click", () => {
      window.location.assign("profile.html?action=signup");
    });
  }

  if (accountEmailInput) {
    accountEmailInput.addEventListener("input", () => {
      updateVerificationControls(readSession());
    });
  }

  if (accountEmailVerifyBtn) {
    accountEmailVerifyBtn.addEventListener("click", async () => {
      const session = readSession();
      if (!session?.email) {
        window.location.assign("profile.html?action=signup");
        return;
      }

      const inputVal = String(accountEmailInput ? accountEmailInput.value : "").trim().toLowerCase();
      const sessionEmail = String(session.email).trim().toLowerCase();

      if (inputVal && inputVal !== sessionEmail) {
        setVerificationMessage(translateUi("Önce e-posta değişikliğini kaydet."), true);
        return;
      }

      verificationState.sending = true;
      verificationState.messageText = "";
      verificationState.messageIsError = false;
      updateVerificationControls(session);

      try {
        const res = await fetch("/api/auth/email-verification/request", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json"
          },
          body: JSON.stringify({ email: sessionEmail })
        });
        const data = await res.json().catch(() => ({}));

        if (!res.ok || !data?.ok) {
          if (res.status === 429) {
            throw new Error("Doğrulama e-postası sınırına ulaşıldı. Biraz sonra tekrar dene.");
          }
          if (res.status === 503) {
            throw new Error(data?.hint ? `E-posta servisi şu an kullanılamıyor. ${data.hint}` : "E-posta servisi şu an kullanılamıyor.");
          }
          throw new Error("Doğrulama e-postası gönderilemedi.");
        }

        if (data.alreadyVerified) {
          verificationState.verified = true;
          verificationState.messageText = "";
          verificationState.messageIsError = false;
        } else {
          verificationState.messageText = translateUi("Doğrulama bağlantısı e-posta adresine gönderildi.");
          verificationState.messageIsError = false;
        }
      } catch (err) {
        verificationState.messageText = translateUi(String(err?.message || "Doğrulama e-postası gönderilemedi."));
        verificationState.messageIsError = true;
      } finally {
        verificationState.sending = false;
        updateVerificationControls(readSession());
      }
    });
  }

  if (accountSettingsForm) {
    accountSettingsForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const session = readSession();
      if (!session) {
        window.location.assign("profile.html?action=signup");
        return;
      }

      const nameVal = String(accountNameInput ? accountNameInput.value : "").trim().slice(0, 40);
      const emailVal = String(accountEmailInput ? accountEmailInput.value : "").trim().toLowerCase();

      if (nameVal.length < 2) {
        setAccountMessage(translateUi("Ad soyad en az 2 karakter olmalı."), true);
        return;
      }
      if (!emailVal.includes("@") || emailVal.length < 6) {
        setAccountMessage(translateUi("Geçerli bir e-posta gir."), true);
        return;
      }

      const allUsers = readAllUsers();
      const sessionEmail = String(session.email).trim().toLowerCase();
      const sessionName = String(session.name || "").trim();

      const userMatch = allUsers.find(u => String(u.email).trim().toLowerCase() === sessionEmail);
      const nameMatches = allUsers.filter(u => String(u.name || "").trim() === sessionName);
      const activeUser = userMatch || (nameMatches.length === 1 ? nameMatches[0] : null);

      if (!activeUser) {
        setAccountMessage(translateUi("Hesap güvenliği doğrulanamadı. Lütfen çıkış yapıp yeniden giriş yap."), true);
        return;
      }

      const isEmailDuplicate = allUsers.some(u => {
        const uEmail = String(u.email).trim().toLowerCase();
        return uEmail === emailVal && uEmail !== String(activeUser.email).trim().toLowerCase();
      });

      if (isEmailDuplicate) {
        setAccountMessage(translateUi("Bu e-posta başka bir hesapta kayıtlı."), true);
        return;
      }

      const updatedUsers = allUsers.map(u => {
        if (String(u.email).trim().toLowerCase() !== String(activeUser.email).trim().toLowerCase()) return u;
        return { ...u, name: nameVal, email: emailVal };
      });

      if (!updatedUsers.some(u => String(u.email).trim().toLowerCase() === emailVal)) {
        updatedUsers.push({ name: nameVal, email: emailVal, passwordHash: activeUser.passwordHash });
      }

      writeAllUsers(updatedUsers);
      writeStorageValue(AUTH_SESSION_KEY, JSON.stringify({ name: nameVal, email: emailVal }));
      dispatchCompatEvent("aramabul:authchange");

      verificationState.email = "";
      verificationState.verified = false;
      verificationState.messageText = "";
      verificationState.messageIsError = false;

      renderAccount();
      setAccountMessage(translateUi("Hesap bilgileri kaydedildi."));
    });
  }

  // Login Actions
  if (loginPasswordToggle && loginPassword instanceof HTMLInputElement) {
    loginPasswordToggle.addEventListener("click", () => {
      const isPassword = loginPassword.type === "password";
      loginPassword.type = isPassword ? "text" : "password";
      loginPasswordToggle.setAttribute("aria-pressed", isPassword ? "true" : "false");
    });
  }

  if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const emailVal = String(loginEmail ? loginEmail.value : "").trim().toLowerCase();
      const passVal = loginPassword instanceof HTMLInputElement ? loginPassword.value : "";

      if (!emailVal || !emailVal.includes("@")) {
        setLoginMessage(translateUi("Geçerli bir e-posta gir."), true);
        return;
      }
      if (!passVal) {
        setLoginMessage(translateUi("Şifre gir."), true);
        return;
      }

      if (loginRememberEmail instanceof HTMLInputElement && loginRememberEmail.checked) {
        writeStorageValue(REMEMBERED_EMAIL_KEY, emailVal);
      } else {
        runtime.removeStorageValue(REMEMBERED_EMAIL_KEY);
      }

      const matchUser = readAllUsers().find(u => String(u.email).trim().toLowerCase() === emailVal);
      if (matchUser) {
        try {
          const hashBuffer = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(passVal));
          const calculatedHash = Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, "0")).join("");
          if (calculatedHash !== matchUser.passwordHash) {
            setLoginMessage(translateUi("Şifre hatalı."), true);
            return;
          }
        } catch (err) {
          setLoginMessage(translateUi("Giriş doğrulanamadı."), true);
          return;
        }

        writeStorageValue(AUTH_SESSION_KEY, JSON.stringify({ name: matchUser.name, email: matchUser.email }));
        dispatchCompatEvent("aramabul:authchange");
        setLoginMessage("");
        showLoggedInView();
        renderAccount();
      } else {
        setLoginMessage(translateUi("Bu e-posta ile kayıtlı hesap bulunamadı."), true);
      }
    });
  }

  if (googleSignInBtn) {
    googleSignInBtn.addEventListener("click", () => {
      if (typeof window.ARAMABUL_GOOGLE_SIGN_IN === "function") {
        window.ARAMABUL_GOOGLE_SIGN_IN();
      }
    });
  }

  if (toggleToSignupBtn) {
    toggleToSignupBtn.addEventListener("click", () => {
      window.location.href = "profile.html?action=signup";
    });
  }

  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      runtime.removeStorageValue(AUTH_SESSION_KEY);
      dispatchCompatEvent("aramabul:authchange");
      showLoginView();
    });
  }

  // Deletion actions
  function closeDeleteModal() {
    if (deleteModal) {
      deleteModal.classList.add("is-hidden");
    }
    if (deleteConfirmEmail) deleteConfirmEmail.value = "";
    if (deleteMessage) deleteMessage.textContent = "";
  }

  if (deleteBtn) {
    deleteBtn.addEventListener("click", () => {
      if (readSession()) {
        if (deleteModal) {
          deleteModal.classList.remove("is-hidden");
        }
        if (deleteConfirmEmail) deleteConfirmEmail.value = "";
        if (deleteMessage) deleteMessage.textContent = "";
      } else {
        setAccountMessage(translateUi("Hesap silmek için önce giriş yapmalısın."), true);
      }
    });
  }

  if (deleteCancel) {
    deleteCancel.addEventListener("click", closeDeleteModal);
  }

  if (deleteModal) {
    deleteModal.addEventListener("click", (e) => {
      if (e.target === deleteModal) {
        closeDeleteModal();
      }
    });
  }

  if (deleteConfirm) {
    deleteConfirm.addEventListener("click", async () => {
      const session = readSession();
      if (!session) {
        closeDeleteModal();
        return;
      }

      const inputVal = String(deleteConfirmEmail ? deleteConfirmEmail.value : "").trim().toLowerCase();
      const sessionEmail = String(session.email).trim().toLowerCase();

      if (inputVal && inputVal === sessionEmail) {
        deleteConfirm.disabled = true;
        deleteConfirm.textContent = translateUi("Siliniyor...");

        try {
          const res = await fetch("/api/auth/delete-account", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json"
            },
            body: JSON.stringify({ email: sessionEmail, confirmDelete: true })
          });
          const data = await res.json().catch(() => ({}));

          if (!res.ok || !data?.ok) {
            const errStr = data?.message === "user_not_found" ? "Kullanıcı bulunamadı." : "Hesap silinemedi. Lütfen daha sonra tekrar deneyin.";
            if (deleteMessage) deleteMessage.textContent = translateUi(errStr);
            deleteConfirm.disabled = false;
            deleteConfirm.textContent = translateUi("Kalıcı Olarak Sil");
            return;
          }

          runtime.removeStorageValue(AUTH_SESSION_KEY);
          writeAllUsers([]);
          dispatchCompatEvent("aramabul:authchange");
          closeDeleteModal();

          try {
            if (window.AramaBulIOS) window.AramaBulIOS.postMessage(JSON.stringify({ action: "accountDeleted" }));
            if (window.AramaBulAndroid) window.AramaBulAndroid.postMessage(JSON.stringify({ action: "accountDeleted" }));
          } catch (e) {}

          setAccountMessage(translateUi("Hesabınız başarıyla silindi. Ana sayfaya yönlendiriliyorsunuz..."));
          setTimeout(() => {
            window.location.assign("index.html");
          }, 2000);

        } catch (err) {
          if (deleteMessage) deleteMessage.textContent = translateUi("Bağlantı hatası. Lütfen tekrar deneyin.");
          deleteConfirm.disabled = false;
          deleteConfirm.textContent = translateUi("Kalıcı Olarak Sil");
        }
      } else {
        if (deleteMessage) deleteMessage.textContent = translateUi("E-posta adresi eşleşmiyor. Lütfen doğru e-postayı girin.");
      }
    });
  }

  // Theme support initialization
  const initialTheme = (() => {
    try {
      return String(readStorageValue(THEME_STORAGE_KEY) || "").trim().toLowerCase() === "light" ? "light" : "dark";
    } catch (e) {
      return "dark";
    }
  })();
  if (typeof window.ARAMABUL_SET_THEME === "function") {
    window.ARAMABUL_SET_THEME(initialTheme);
  } else {
    document.body.classList.toggle("theme-dark", initialTheme === "dark");
    document.body.classList.toggle("theme-light", initialTheme === "light");
    document.documentElement.setAttribute("data-theme", initialTheme);
  }

  // Session state initialization
  if (readSession()) {
    showLoggedInView();
    renderAccount();
  } else {
    showLoginView();
    try {
      const remembered = readStorageValue(REMEMBERED_EMAIL_KEY) || "";
      if (remembered && loginEmail instanceof HTMLInputElement) {
        loginEmail.value = remembered;
        if (loginRememberEmail instanceof HTMLInputElement) {
          loginRememberEmail.checked = true;
        }
      }
    } catch (e) {}
    initMobileHeader();
  }

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

  window.addEventListener("hashchange", initMobileHeader);
  window.addEventListener("resize", initMobileHeader, { passive: true });
  window.addEventListener("orientationchange", initMobileHeader);
  document.addEventListener("aramabul:authchange", () => {
    if (readSession()) {
      showLoggedInView();
      renderAccount();
    } else {
      showLoginView();
      initMobileHeader();
    }
  });
  window.addEventListener("focus", () => {
    const session = readSession();
    if (session?.email) {
      checkEmailVerificationStatus(session.email, true);
    }
  });
})();