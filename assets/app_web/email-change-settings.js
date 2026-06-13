(() => {
  const runtime = window.ARAMABUL_RUNTIME;
  const AUTH_SESSION_KEY = runtime.storageKeys.authSession;
  const AUTH_USERS_KEY = runtime.storageKeys.authUsers;

  function readValue(key) {
    return runtime.readStorageValue(key);
  }

  function writeValue(key, val) {
    runtime.writeStorageValue(key, val);
  }

  function removeValue(key) {
    runtime.removeStorageValue(key);
  }

  function translate(key) {
    const headerI18n = window.ARAMABUL_HEADER_I18N;
    const getLang = window.ARAMABUL_GET_LANGUAGE;
    if (headerI18n && typeof headerI18n.getStaticUiTranslation === "function") {
      const lang = typeof getLang === "function" ? getLang() : "TR";
      return headerI18n.getStaticUiTranslation(String(key || ""), lang);
    }
    return key;
  }

  function getSessionUser() {
    try {
      const val = readValue(AUTH_SESSION_KEY);
      if (!val) return null;
      const user = JSON.parse(val);
      if (user && typeof user === 'object' && user.email) {
        return user;
      }
    } catch (e) {}
    return null;
  }

  function getAllUsers() {
    try {
      const val = readValue(AUTH_USERS_KEY);
      const list = JSON.parse(val || "[]");
      return Array.isArray(list) ? list : [];
    } catch (e) {
      return [];
    }
  }

  function saveUsers(users) {
    writeValue(AUTH_USERS_KEY, JSON.stringify(users));
  }

  function checkHash() {
    const isEmailChange = window.location.hash === "#email-change";
    const emailChangeSection = document.getElementById("emailChangeSection");
    const accountLoginSection = document.getElementById("accountLoginSection");
    const accountLoggedInSection = document.getElementById("accountLoggedInSection");

    if (!isEmailChange) {
      if (emailChangeSection) emailChangeSection.style.display = "none";
      return;
    }

    const user = getSessionUser();
    if (!user) {
      window.location.hash = "";
      return;
    }

    if (emailChangeSection) emailChangeSection.style.display = "block";
    if (accountLoginSection) accountLoginSection.style.display = "none";
    if (accountLoggedInSection) accountLoggedInSection.style.display = "none";

    const currentEmailInput = document.getElementById("mobileCurrentEmail");
    if (currentEmailInput) {
      currentEmailInput.value = user.email;
    }

    const newEmailInput = document.getElementById("mobileNewEmail");
    const repeatNewEmailInput = document.getElementById("mobileRepeatNewEmail");
    const messageEl = document.getElementById("mobileEmailChangeMessage");

    if (newEmailInput) newEmailInput.value = "";
    if (repeatNewEmailInput) repeatNewEmailInput.value = "";
    if (messageEl) {
      messageEl.textContent = "";
      messageEl.className = "settings-signup-message";
    }

    if (newEmailInput instanceof HTMLInputElement) {
      window.requestAnimationFrame(() => newEmailInput.focus());
    }
  }

  window.addEventListener("hashchange", checkHash);
  checkHash();

  const form = document.getElementById("mobileEmailChangeForm");
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const user = getSessionUser();
      if (!user) return;

      const currentEmail = user.email.trim().toLowerCase();
      const newEmailInput = document.getElementById("mobileNewEmail");
      const repeatNewEmailInput = document.getElementById("mobileRepeatNewEmail");
      const messageEl = document.getElementById("mobileEmailChangeMessage");

      const newEmail = (newEmailInput ? newEmailInput.value : "").trim().toLowerCase();
      const repeatNewEmail = (repeatNewEmailInput ? repeatNewEmailInput.value : "").trim().toLowerCase();

      if (!messageEl) return;

      messageEl.textContent = "";
      messageEl.className = "settings-signup-message";

      if (!newEmail || !newEmail.includes("@") || newEmail.length < 6) {
        messageEl.textContent = translate("Geçerli bir e-posta gir.");
        messageEl.classList.add("auth-message-error");
        return;
      }

      if (newEmail === currentEmail) {
        messageEl.textContent = translate("Yeni e-posta adresi mevcut e-posta adresi ile aynı olamaz.");
        messageEl.classList.add("auth-message-error");
        return;
      }

      if (newEmail !== repeatNewEmail) {
        messageEl.textContent = translate("Yeni e-postalar eşleşmiyor.");
        messageEl.classList.add("auth-message-error");
        return;
      }

      const allUsers = getAllUsers();
      const isDuplicate = allUsers.some(u => u.email.trim().toLowerCase() === newEmail && u.email.trim().toLowerCase() !== currentEmail);

      if (isDuplicate) {
        messageEl.textContent = translate("Bu e-posta başka bir hesapta kayıtlı.");
        messageEl.classList.add("auth-message-error");
        return;
      }

      const updatedUsers = allUsers.map(u => {
        if (u.email.trim().toLowerCase() === currentEmail) {
          return { ...u, email: newEmail };
        }
        return u;
      });
      saveUsers(updatedUsers);

      removeValue(AUTH_SESSION_KEY);
      runtime.dispatch("aramabul:authchange");

      window.location.href = "account-settings.html";
    });
  }
})();
