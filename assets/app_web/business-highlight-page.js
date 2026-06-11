"use strict";

(function initBusinessHighlightPage() {
  const form = document.getElementById("bhForm");
  if (!form) {
    return;
  }

  const submitBtn = document.getElementById("bhSubmitBtn");
  const submitLabel = submitBtn ? submitBtn.querySelector(".bh-submit-label") : null;
  const submitSpinner = submitBtn ? submitBtn.querySelector(".bh-submit-spinner") : null;
  const formMessage = document.getElementById("bhFormMessage");

  function showMessage(text, isError) {
    if (!formMessage) {
      return;
    }
    formMessage.hidden = false;
    formMessage.textContent = text;
    formMessage.className = "bh-form-message " + (isError ? "bh-form-message--error" : "bh-form-message--success");
  }

  function setSubmitting(isSubmitting) {
    if (submitBtn) {
      submitBtn.disabled = isSubmitting;
    }
    if (submitLabel) {
      submitLabel.textContent = isSubmitting ? "Gönderiliyor..." : "Gönder";
    }
    if (submitSpinner) {
      submitSpinner.hidden = !isSubmitting;
    }
    if (formMessage && isSubmitting) {
      formMessage.hidden = true;
    }
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const fields = form.elements;
    const businessName = fields.businessName.value.trim();
    const ownerName = fields.ownerName.value.trim();
    const phone = fields.phone.value.trim();
    const address = fields.address.value.trim();
    const email = fields.email.value.trim();

    if (!businessName || !ownerName || !phone) {
      showMessage("Lütfen zorunlu alanları doldurunuz.", true);
      return;
    }

    const phoneClean = phone.replace(/[\s\-()]/g, "");
    if (phoneClean.length < 10 || !/^\+?[0-9]+$/.test(phoneClean)) {
      showMessage("Lütfen geçerli bir telefon numarası giriniz.", true);
      return;
    }

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      showMessage("Lütfen geçerli bir e-posta adresi giriniz.", true);
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch("/api/public/business-highlight-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessName,
          ownerName,
          phone: phoneClean,
          address,
          email,
          category: document.body.getAttribute("data-business-category") || "isbirligi",
          pageUrl: window.location.href,
          timestamp: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        showMessage("Bir hata oluştu. Lütfen daha sonra tekrar deneyiniz.", true);
        return;
      }

      showMessage("Başvurunuz başarıyla alındı. En kısa sürede sizinle iletişime geçeceğiz.", false);
      form.reset();
    } catch (_error) {
      showMessage("Bağlantı hatası. Lütfen internet bağlantınızı kontrol edip tekrar deneyiniz.", true);
    } finally {
      setSubmitting(false);
    }
  });
})();
