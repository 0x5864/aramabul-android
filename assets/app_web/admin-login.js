"use strict";

(function initAdminLoginPage() {
  const loginForm = document.getElementById("adminLoginForm");
  if (!loginForm || !window.AramaBulAdminAuth) {
    return;
  }

  const forgotForm = document.getElementById("adminForgotForm");
  const resetForm = document.getElementById("adminResetForm");
  const messageNode = document.getElementById("adminLoginMessage");
  const assistLinkNode = document.getElementById("adminLoginAssistLink");
  const emailInput = document.getElementById("adminLoginEmail");
  const passwordInput = document.getElementById("adminLoginPassword");
  const passwordToggleButton = document.getElementById("adminLoginPasswordToggle");
  const forgotEmailInput = document.getElementById("adminForgotEmail");
  const resetPasswordInput = document.getElementById("adminResetPassword");
  const resetPasswordRepeatInput = document.getElementById("adminResetPasswordRepeat");
  const showForgotButton = document.getElementById("adminShowForgotButton");
  const backToLoginButton = document.getElementById("adminBackToLoginButton");

  const params = new URLSearchParams(window.location.search);
  const nextTarget = params.get("next") || "admin-venues.html";

  const state = {
    mode: "login",
    resetToken: "",
    resetEmail: "",
  };

  function readResetToken() {
    const searchParams = new URLSearchParams(window.location.search);
    const directToken = String(searchParams.get("token") || "").trim();
    if (directToken) {
      return directToken;
    }

    const rawHash = String(window.location.hash || "");
    const hashSource = rawHash.startsWith("#") ? rawHash.slice(1) : rawHash;
    const hashParams = new URLSearchParams(hashSource);
    return String(hashParams.get("token") || "").trim();
  }

  function clearResetTokenFromLocation() {
    const nextUrl = new URL(window.location.href);
    nextUrl.searchParams.delete("token");
    nextUrl.hash = "";
    window.history.replaceState({}, "", nextUrl.toString());
  }

  function setMessage(message, isError) {
    if (!message) {
      messageNode.hidden = true;
      messageNode.textContent = "";
      messageNode.dataset.state = "neutral";
      return;
    }

    messageNode.hidden = false;
    messageNode.textContent = message;
    messageNode.dataset.state = isError ? "error" : "success";
  }

  function setAssistLink(href, label) {
    if (!href || !label) {
      assistLinkNode.hidden = true;
      assistLinkNode.removeAttribute("href");
      assistLinkNode.textContent = "";
      return;
    }

    assistLinkNode.hidden = false;
    assistLinkNode.href = href;
    assistLinkNode.textContent = label;
  }

  function syncPasswordVisibility() {
    if (!(passwordToggleButton instanceof HTMLButtonElement) || !(passwordInput instanceof HTMLInputElement)) {
      return;
    }

    const isVisible = passwordInput.type === "text";
    passwordToggleButton.textContent = isVisible ? "Gizle" : "Göster";
    passwordToggleButton.setAttribute("aria-label", isVisible ? "Şifreyi gizle" : "Şifreyi göster");
    passwordToggleButton.setAttribute("aria-pressed", isVisible ? "true" : "false");
  }

  function togglePasswordVisibility() {
    if (!(passwordInput instanceof HTMLInputElement)) {
      return;
    }

    passwordInput.type = passwordInput.type === "password" ? "text" : "password";
    syncPasswordVisibility();
    passwordInput.focus({ preventScroll: true });
    const cursorIndex = passwordInput.value.length;
    passwordInput.setSelectionRange(cursorIndex, cursorIndex);
  }

  function redirectAfterLogin() {
    window.location.href = nextTarget;
  }

  function applyMode() {
    const isLogin = state.mode === "login";
    const isForgot = state.mode === "forgot";
    const isReset = state.mode === "reset";

    loginForm.hidden = !isLogin;
    forgotForm.hidden = !isForgot;
    resetForm.hidden = !isReset;
    showForgotButton.hidden = !isLogin;
    backToLoginButton.hidden = isLogin;

    if (isForgot && !forgotEmailInput.value.trim()) {
      forgotEmailInput.value = emailInput.value.trim();
    }
  }

  function switchMode(nextMode) {
    state.mode = nextMode;
    if (nextMode !== "reset") {
      state.resetToken = "";
      state.resetEmail = "";
    }
    setAssistLink("", "");
    setMessage("", false);
    applyMode();
  }

  async function submitLogin(event) {
    event.preventDefault();
    setMessage("Giriş yapılıyor.", false);

    let response = null;
    let payload = null;
    try {
      response = await fetch("/api/admin/auth/login", {
        method: "POST",
        credentials: "include",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: emailInput.value.trim(),
          password: passwordInput.value,
        }),
      });
      payload = await response.json().catch(() => null);
    } catch (_error) {
      throw new Error("Sunucuya baglanilamadi. Backend acik mi kontrol et.");
    }

    if (!response.ok) {
      throw new Error(payload?.error?.message || "Giriş başarısız oldu.");
    }

    setMessage("Giriş başarılı. Yönlendiriliyorsun.", false);
    redirectAfterLogin();
  }

  async function submitForgotPassword(event) {
    event.preventDefault();
    setMessage("Sıfırlama bağlantısı hazırlanıyor.", false);
    setAssistLink("", "");

    const { response, payload } = await window.AramaBulAdminAuth.fetchJson("/api/admin/auth/password-reset/request", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: forgotEmailInput.value.trim(),
      }),
      redirectOn401: false,
    });

    if (!response.ok) {
      throw new Error(payload?.error?.message || "Sıfırlama isteği oluşturulamadı.");
    }

    if (payload?.resetUrl) {
      setAssistLink(payload.resetUrl, "Şifre yenileme sayfasını aç");
      setMessage("Yerel ortamda e-posta yerine doğrudan şifre yenileme bağlantısı hazırlandı.", false);
      return;
    }

    setMessage("Sıfırlama bağlantısı e-posta adresine gönderildi.", false);
  }

  async function verifyResetToken() {
    if (!state.resetToken) {
      return;
    }

    setMessage("Bağlantı doğrulanıyor.", false);
    const { response, payload } = await window.AramaBulAdminAuth.fetchJson("/api/admin/auth/password-reset/verify", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        token: state.resetToken,
      }),
      redirectOn401: false,
    });

    if (!response.ok) {
      throw new Error(payload?.error?.message || "Sıfırlama bağlantısı doğrulanamadı.");
    }

    state.resetEmail = String(payload?.email || "").trim();
    setMessage(
      state.resetEmail
        ? `Bağlantı doğrulandı. ${state.resetEmail} için yeni şifre belirleyebilirsin.`
        : "Bağlantı doğrulandı. Yeni şifre belirleyebilirsin.",
      false,
    );
  }

  async function submitResetPassword(event) {
    event.preventDefault();

    const nextPassword = resetPasswordInput.value;
    const nextPasswordRepeat = resetPasswordRepeatInput.value;
    if (nextPassword.length < 6) {
      throw new Error("Yeni şifre en az 6 karakter olmalı.");
    }
    if (nextPassword !== nextPasswordRepeat) {
      throw new Error("Yeni şifreler eşleşmiyor.");
    }

    setMessage("Şifre yenileniyor.", false);
    const { response, payload } = await window.AramaBulAdminAuth.fetchJson("/api/admin/auth/password-reset/confirm", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        token: state.resetToken,
        password: nextPassword,
      }),
      redirectOn401: false,
    });

    if (!response.ok) {
      throw new Error(payload?.error?.message || "Şifre yenilenemedi.");
    }

    clearResetTokenFromLocation();
    emailInput.value = String(payload?.email || state.resetEmail || "").trim();
    passwordInput.value = "";
    forgotEmailInput.value = "";
    if (resetForm instanceof HTMLFormElement) {
      resetForm.reset();
    }
    switchMode("login");
    setMessage("Şifre yenilendi. Yeni şifrenle giriş yapabilirsin.", false);
  }

  async function main() {
    try {
      const session = await window.AramaBulAdminAuth.ensureSession({ redirect: false });
      if (session) {
        redirectAfterLogin();
        return;
      }
    } catch (_error) {
      setMessage("Oturum kontrolu yapilamadi. Yine de giris deneyebilirsin.", true);
    }

    state.resetToken = readResetToken();
    if (state.resetToken) {
      state.mode = "reset";
      applyMode();
      await verifyResetToken();
    } else if (params.get("mode") === "forgot") {
      state.mode = "forgot";
      applyMode();
    } else {
      applyMode();
    }

    syncPasswordVisibility();

    loginForm.addEventListener("submit", (event) => {
      submitLogin(event).catch((error) => {
        setMessage(error instanceof Error ? error.message : "Giriş başarısız oldu.", true);
      });
    });

    forgotForm.addEventListener("submit", (event) => {
      submitForgotPassword(event).catch((error) => {
        setMessage(error instanceof Error ? error.message : "Sıfırlama isteği oluşturulamadı.", true);
      });
    });

    resetForm.addEventListener("submit", (event) => {
      submitResetPassword(event).catch((error) => {
        setMessage(error instanceof Error ? error.message : "Şifre yenilenemedi.", true);
      });
    });

    showForgotButton.addEventListener("click", () => {
      forgotEmailInput.value = emailInput.value.trim();
      switchMode("forgot");
    });

    backToLoginButton.addEventListener("click", () => {
      clearResetTokenFromLocation();
      switchMode("login");
    });

    passwordToggleButton?.addEventListener("click", togglePasswordVisibility);
  }

  main().catch((error) => {
    setMessage(error instanceof Error ? error.message : "Admin girişi başlatılamadı.", true);
  });
})();
