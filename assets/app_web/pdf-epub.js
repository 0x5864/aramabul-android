(() => {
  const form = document.querySelector("#pdfEpubForm");
  const fileInput = document.querySelector("#pdfEpubFile");
  const status = document.querySelector("#pdfEpubStatus");
  const fileName = document.querySelector("#pdfEpubFilename");

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
      setStatus("Lütfen bir PDF dosyası seç.", true);
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
      const response = await fetch("/api/convert/pdf-epub", {
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
      link.download = "donusmus.epub";
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(downloadUrl);
      setStatus("Dönüştürme tamamlandı. EPUB indirildi.", false);
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
