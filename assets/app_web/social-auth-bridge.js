(() => {
  const providers = {
    apple: "ARAMABUL_APPLE_SIGN_IN",
    google: "ARAMABUL_GOOGLE_SIGN_IN",
  };

  function isNativeApp() {
    return Boolean(window.__ARAMABUL_APP__?.isApp);
  }

  function updateButtons() {
    document.querySelectorAll("[data-native-social-provider]").forEach((button) => {
      const provider = button.getAttribute("data-native-social-provider");
      const bridgeName = providers[provider];
      const bridgeReady = bridgeName && typeof window[bridgeName] === "function";
      if (provider === "apple") {
        button.hidden = !(isNativeApp() && bridgeReady);
      }
    });
  }

  document.addEventListener(
    "click",
    (event) => {
      const button = event.target.closest("[data-native-social-provider]");
      if (!button) return;

      const provider = button.getAttribute("data-native-social-provider");
      const bridgeName = providers[provider];
      const bridge = bridgeName ? window[bridgeName] : null;
      if (!isNativeApp() || typeof bridge !== "function") return;

      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
      bridge();
    },
    true,
  );

  document.addEventListener("aramabul:appready", updateButtons);
  window.addEventListener("pageshow", updateButtons);
  updateButtons();

  let checksRemaining = 20;
  const bridgeTimer = window.setInterval(() => {
    updateButtons();
    checksRemaining -= 1;
    if (checksRemaining <= 0 || isNativeApp()) {
      window.clearInterval(bridgeTimer);
    }
  }, 250);
})();
