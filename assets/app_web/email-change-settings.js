(() => {
  const isEmailChange = window.location.hash === "#email-change";
  if (!isEmailChange) return;

  document.body.classList.add("email-change-mode");

  document.querySelectorAll("[data-email-change-secondary]").forEach((element) => {
    element.hidden = true;
  });

  const heading = document.querySelector("#accountLoggedInSection .language-card-head h2");
  const description = document.querySelector("#accountLoggedInSection .language-card-head p");
  const emailInput = document.querySelector("#accountEmailInput");

  if (heading) heading.textContent = "E-posta Değişikliği";
  if (description) {
    description.textContent =
      "Yeni e-posta adresini yaz, kaydet ve doğrulama bağlantısını kullan.";
  }

  if (emailInput instanceof HTMLInputElement) {
    window.requestAnimationFrame(() => emailInput.focus());
  }
})();
