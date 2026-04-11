(() => {
  const form = document.querySelector("#epubPdfForm");
  const fileInput = document.querySelector("#epubPdfFile");
  const status = document.querySelector("#epubPdfStatus");
  const fileName = document.querySelector("#epubPdfFilename");

  if (!form || !fileInput || !status) {
    return;
  }

  const setStatus = (message, isError = false) => {
    status.textContent = message;
    status.classList.toggle("is-error", isError);
  };

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const file = fileInput.files && fileInput.files[0];
    if (!file) {
      setStatus("Lütfen bir EPUB dosyası seç.", true);
      return;
    }
    if (file.size > 25 * 1024 * 1024) {
      setStatus("Dosya boyutu 25 MB sınırını aşıyor.", true);
      return;
    }

    setStatus("Dönüştürme başlatıldı. Lütfen bekle…", false);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/convert/epub-pdf", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        const message = payload && payload.message ? payload.message : "Dönüştürme başarısız oldu.";
        setStatus(message, true);
        return;
      }

      const blob = await response.blob();
      const downloadUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = "donusmus.pdf";
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(downloadUrl);
      setStatus("Dönüştürme tamamlandı. PDF indirildi.", false);
    } catch (error) {
      setStatus("Dönüştürme sırasında hata oluştu.", true);
    }
  });
})();
  const updateFileName = () => {
    if (!fileName) {
      return;
    }
    const file = fileInput.files && fileInput.files[0];
    fileName.textContent = file ? file.name : "Seçili dosya yok";
  };

  fileInput.addEventListener("change", updateFileName);
