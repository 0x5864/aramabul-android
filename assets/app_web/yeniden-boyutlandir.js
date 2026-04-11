(() => {
  const input = document.querySelector("#imageResizeInput");
  const fileName = document.querySelector("#imageResizeFileName");
  const preview = document.querySelector("#imageResizePreview");
  const widthInput = document.querySelector("#imageResizeWidth");
  const heightInput = document.querySelector("#imageResizeHeight");
  const lockInput = document.querySelector("#imageResizeLock");
  const formatSelect = document.querySelector("#imageResizeFormat");
  const qualityInput = document.querySelector("#imageResizeQuality");
  const qualityValue = document.querySelector("#imageResizeQualityValue");
  const applyBtn = document.querySelector("#imageResizeApply");
  const downloadBtn = document.querySelector("#imageResizeDownload");
  const note = document.querySelector("#imageResizeNote");

  if (!input || !preview || !widthInput || !heightInput) {
    return;
  }

  let originalImage = null;
  let aspectRatio = 1;
  let outputBlob = null;
  let outputUrl = "";

  const clearPreview = () => {
    preview.innerHTML = "<span>Önizleme</span>";
  };

  const setNote = (text) => {
    if (note) {
      note.textContent = text;
    }
  };

  const setQualityText = () => {
    if (qualityValue && qualityInput) {
      qualityValue.textContent = Number(qualityInput.value).toFixed(2);
    }
  };

  const updateDownloadState = (enabled) => {
    if (downloadBtn) {
      downloadBtn.disabled = !enabled;
    }
  };

  const loadImage = (file) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        originalImage = img;
        aspectRatio = img.width / img.height;
        widthInput.value = String(img.width);
        heightInput.value = String(img.height);
        preview.innerHTML = "";
        preview.appendChild(img);
        setNote("Boyutları güncelleyip yeniden boyutlandırmayı seç.");
        updateDownloadState(false);
      };
      img.src = String(reader.result || "");
      img.alt = "Yüklenen görsel";
      img.classList.add("image-resize-preview-img");
    };
    reader.readAsDataURL(file);
  };

  const syncHeight = () => {
    if (!lockInput || !lockInput.checked) {
      return;
    }
    const width = Number(widthInput.value);
    if (!Number.isFinite(width) || width <= 0) {
      return;
    }
    heightInput.value = String(Math.round(width / aspectRatio));
  };

  const syncWidth = () => {
    if (!lockInput || !lockInput.checked) {
      return;
    }
    const height = Number(heightInput.value);
    if (!Number.isFinite(height) || height <= 0) {
      return;
    }
    widthInput.value = String(Math.round(height * aspectRatio));
  };

  const resizeImage = () => {
    if (!originalImage) {
      setNote("Önce bir görsel seçmelisin.");
      return;
    }

    const width = Number(widthInput.value);
    const height = Number(heightInput.value);

    if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) {
      setNote("Geçerli bir genişlik ve yükseklik gir.");
      return;
    }

    const canvas = document.createElement("canvas");
    canvas.width = Math.round(width);
    canvas.height = Math.round(height);
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      setNote("Tarayıcı bu işlemi desteklemiyor.");
      return;
    }
    ctx.drawImage(originalImage, 0, 0, canvas.width, canvas.height);

    const format = formatSelect ? formatSelect.value : "image/png";
    const quality = qualityInput ? Number(qualityInput.value) : 0.92;

    canvas.toBlob(
      (blob) => {
        if (!blob) {
          setNote("Dosya oluşturulamadı.");
          return;
        }
        outputBlob = blob;
        if (outputUrl) {
          URL.revokeObjectURL(outputUrl);
        }
        outputUrl = URL.createObjectURL(blob);
        updateDownloadState(true);
        setNote("Dosya hazır. İndir butonunu kullan.");
      },
      format,
      quality,
    );
  };

  const downloadImage = () => {
    if (!outputBlob || !outputUrl) {
      setNote("Önce yeniden boyutlandır.");
      return;
    }
    const ext = outputBlob.type.split("/")[1] || "png";
    const link = document.createElement("a");
    link.href = outputUrl;
    link.download = `aramabul-resize.${ext}`;
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  input.addEventListener("change", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLInputElement)) {
      return;
    }
    const file = target.files && target.files[0];
    if (!file) {
      clearPreview();
      if (fileName) {
        fileName.textContent = "Seçili dosya yok";
      }
      setNote("Lütfen bir görsel seç.");
      updateDownloadState(false);
      return;
    }
    if (fileName) {
      fileName.textContent = file.name;
    }
    loadImage(file);
  });

  widthInput.addEventListener("input", syncHeight);
  heightInput.addEventListener("input", syncWidth);

  if (qualityInput) {
    qualityInput.addEventListener("input", setQualityText);
    setQualityText();
  }

  if (applyBtn) {
    applyBtn.addEventListener("click", resizeImage);
  }

  if (downloadBtn) {
    downloadBtn.addEventListener("click", downloadImage);
  }

  window.addEventListener("beforeunload", () => {
    if (outputUrl) {
      URL.revokeObjectURL(outputUrl);
    }
  });
})();
