"use strict";

/**
 * business-highlight.js
 * "İşletmenizi öne çıkarmak ister misiniz?" buton + modal form.
 * Yeme-İçme, Gezi ve Hizmetler sayfalarında çalışır.
 */
(function initBusinessHighlight() {
  /* ------------------------------------------------------------------ */
  /* Mevcut CTA butonunu bul                                            */
  /* ------------------------------------------------------------------ */
  const ctaBtn = document.getElementById("bhCtaButton");
  if (!ctaBtn) return;

  /* ------------------------------------------------------------------ */
  /* Modal oluştur                                                      */
  /* ------------------------------------------------------------------ */
  const overlay = document.createElement("div");
  overlay.className = "bh-modal-overlay";
  overlay.hidden = true;

  overlay.innerHTML = `
    <div class="bh-modal" role="dialog" aria-modal="true" aria-labelledby="bhModalTitle">
      <div class="bh-modal-header">
        <h2 id="bhModalTitle" class="bh-modal-title">İşletme Başvuru Formu</h2>
        <button type="button" class="bh-modal-close" aria-label="Kapat">✕</button>
      </div>
      <form id="bhForm" class="bh-form" novalidate>
        <p class="bh-form-intro">İşletmenizi platformumuzda öne çıkarmak için aşağıdaki formu doldurun. En kısa sürede sizinle iletişime geçeceğiz.</p>

        <label class="bh-field bh-field--required">
          <span class="bh-field-label">İşletme Adı <abbr title="zorunlu">*</abbr></span>
          <input type="text" name="businessName" class="bh-input" required placeholder="ör. Lezzet Durağı" autocomplete="organization" />
        </label>

        <label class="bh-field bh-field--required">
          <span class="bh-field-label">İşletmeci Adı Soyadı <abbr title="zorunlu">*</abbr></span>
          <input type="text" name="ownerName" class="bh-input" required placeholder="ör. Ahmet Yılmaz" autocomplete="name" />
        </label>

        <label class="bh-field bh-field--required">
          <span class="bh-field-label">Telefon <abbr title="zorunlu">*</abbr></span>
          <input type="tel" name="phone" class="bh-input" required placeholder="05XX XXX XX XX" autocomplete="tel" />
        </label>

        <label class="bh-field">
          <span class="bh-field-label">Adres <span class="bh-field-optional">(isteğe bağlı)</span></span>
          <input type="text" name="address" class="bh-input" placeholder="İstanbul, ilçe, mahalle, sokak..." autocomplete="street-address" />
        </label>

        <label class="bh-field">
          <span class="bh-field-label">E-posta <span class="bh-field-optional">(isteğe bağlı)</span></span>
          <input type="email" name="email" class="bh-input" placeholder="info@isletme.com" autocomplete="email" />
        </label>

        <div class="bh-form-actions">
          <button type="submit" class="bh-submit-btn" id="bhSubmitBtn">
            <span class="bh-submit-label">Gönder</span>
            <span class="bh-submit-spinner" hidden></span>
          </button>
        </div>

        <div id="bhFormMessage" class="bh-form-message" hidden></div>
      </form>
    </div>
  `;
  document.body.appendChild(overlay);

  /* ------------------------------------------------------------------ */
  /* DOM referansları                                                    */
  /* ------------------------------------------------------------------ */
  const modal = overlay.querySelector(".bh-modal");
  const closeBtn = overlay.querySelector(".bh-modal-close");
  const form = document.getElementById("bhForm");
  const submitBtn = document.getElementById("bhSubmitBtn");
  const submitLabel = submitBtn.querySelector(".bh-submit-label");
  const submitSpinner = submitBtn.querySelector(".bh-submit-spinner");
  const formMessage = document.getElementById("bhFormMessage");

  /* ------------------------------------------------------------------ */
  /* Aç / kapat                                                         */
  /* ------------------------------------------------------------------ */
  function openModal() {
    overlay.hidden = false;
    requestAnimationFrame(() => overlay.classList.add("is-visible"));
    document.body.style.overflow = "hidden";
    closeBtn.focus();
  }

  function closeModal() {
    overlay.classList.remove("is-visible");
    document.body.style.overflow = "";
    setTimeout(() => {
      overlay.hidden = true;
    }, 280);
  }

  ctaBtn.addEventListener("click", openModal);
  closeBtn.addEventListener("click", closeModal);
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) closeModal();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !overlay.hidden) closeModal();
  });

  /* ------------------------------------------------------------------ */
  /* Form gönderimi                                                     */
  /* ------------------------------------------------------------------ */
  function showMessage(text, isError) {
    formMessage.hidden = false;
    formMessage.textContent = text;
    formMessage.className = "bh-form-message " + (isError ? "bh-form-message--error" : "bh-form-message--success");
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    // Doğrulama
    const businessName = form.businessName.value.trim();
    const ownerName = form.ownerName.value.trim();
    const phone = form.phone.value.trim();
    const address = form.address.value.trim();
    const email = form.email.value.trim();

    if (!businessName || !ownerName || !phone) {
      showMessage("Lütfen zorunlu alanları doldurunuz.", true);
      return;
    }

    // Telefon formatı kontrolü
    const phoneClean = phone.replace(/[\s\-\(\)]/g, "");
    if (phoneClean.length < 10 || !/^\+?[0-9]+$/.test(phoneClean)) {
      showMessage("Lütfen geçerli bir telefon numarası giriniz.", true);
      return;
    }

    // E-posta kontrolü (doldurulduysa)
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      showMessage("Lütfen geçerli bir e-posta adresi giriniz.", true);
      return;
    }

    // Gönderme durumunu göster
    submitBtn.disabled = true;
    submitLabel.textContent = "Gönderiliyor...";
    submitSpinner.hidden = false;
    formMessage.hidden = true;

    // Sayfadaki kategori bilgisi
    const pageCategory = document.body.getAttribute("data-mvp-main-category") || "bilinmiyor";

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
          category: pageCategory,
          pageUrl: window.location.href,
          timestamp: new Date().toISOString(),
        }),
      });

      if (response.ok) {
        showMessage("Başvurunuz başarıyla alındı! En kısa sürede sizinle iletişime geçeceğiz.", false);
        form.reset();
        // 3 saniye sonra modal'ı kapat
        setTimeout(closeModal, 3000);
      } else {
        showMessage("Bir hata oluştu. Lütfen daha sonra tekrar deneyiniz.", true);
      }
    } catch (_err) {
      showMessage("Bağlantı hatası. Lütfen internet bağlantınızı kontrol edip tekrar deneyiniz.", true);
    } finally {
      submitBtn.disabled = false;
      submitLabel.textContent = "Gönder";
      submitSpinner.hidden = true;
    }
  });
})();
