(() => {
  const input = document.querySelector("#imageCropInput");
  const fileName = document.querySelector("#imageCropFileName");
  const canvas = document.querySelector("#imageCropCanvas");
  const overlay = document.querySelector("#imageCropOverlay");
  const resultCanvas = document.querySelector("#imageCropResult");
  const cropX = document.querySelector("#cropX");
  const cropY = document.querySelector("#cropY");
  const cropW = document.querySelector("#cropW");
  const cropH = document.querySelector("#cropH");
  const lock = document.querySelector("#cropLock");
  const applyBtn = document.querySelector("#cropApply");
  const downloadBtn = document.querySelector("#cropDownload");
  const note = document.querySelector("#cropNote");

  if (!input || !canvas || !resultCanvas) {
    return;
  }

  const ctx = canvas.getContext("2d");
  const resultCtx = resultCanvas.getContext("2d");
  let img = null;
  let scale = 1;
  let drag = false;
  let dragMode = "move";
  let dragOffset = { x: 0, y: 0 };
  let dragStart = { x: 0, y: 0, crop: { x: 0, y: 0, w: 0, h: 0 }, ratio: 1 };
  let crop = { x: 40, y: 40, w: 200, h: 200 };
  let outputBlob = null;
  let outputUrl = "";

  const setNote = (text) => {
    if (note) note.textContent = text;
  };

  const updateDownloadState = (enabled) => {
    if (downloadBtn) downloadBtn.disabled = !enabled;
  };

  const draw = () => {
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (!img) return;
    ctx.drawImage(img, 0, 0, img.width * scale, img.height * scale);
  };

  const updateOverlay = () => {
    if (!overlay) return;
    overlay.style.left = `${crop.x}px`;
    overlay.style.top = `${crop.y}px`;
    overlay.style.width = `${crop.w}px`;
    overlay.style.height = `${crop.h}px`;
  };

  const syncInputs = () => {
    if (cropX) cropX.value = String(Math.round(crop.x));
    if (cropY) cropY.value = String(Math.round(crop.y));
    if (cropW) cropW.value = String(Math.round(crop.w));
    if (cropH) cropH.value = String(Math.round(crop.h));
  };

  const clampCrop = () => {
    if (!img) return;
    const maxW = img.width * scale;
    const maxH = img.height * scale;
    crop.w = Math.max(20, Math.min(crop.w, maxW));
    crop.h = Math.max(20, Math.min(crop.h, maxH));
    crop.x = Math.max(0, Math.min(crop.x, maxW - crop.w));
    crop.y = Math.max(0, Math.min(crop.y, maxH - crop.h));
  };

  const setCropFromInputs = () => {
    crop.x = Number(cropX.value) || 0;
    crop.y = Number(cropY.value) || 0;
    crop.w = Number(cropW.value) || 0;
    crop.h = Number(cropH.value) || 0;
    clampCrop();
    updateOverlay();
  };

  const loadImage = (file) => {
    const reader = new FileReader();
    reader.onload = () => {
      const image = new Image();
      image.onload = () => {
        img = image;
        const maxWidth = canvas.width;
        const maxHeight = canvas.height;
        const ratio = Math.min(maxWidth / img.width, maxHeight / img.height, 1);
        scale = ratio;
        crop = { x: 40, y: 40, w: Math.min(220, img.width * scale), h: Math.min(220, img.height * scale) };
        clampCrop();
        draw();
        updateOverlay();
        syncInputs();
        setNote("Kırpma alanını sürükleyip ayarla.");
        updateDownloadState(false);
      };
      image.src = String(reader.result || "");
    };
    reader.readAsDataURL(file);
  };

  const applyCrop = () => {
    if (!img || !resultCtx) {
      setNote("Önce görsel seç.");
      return;
    }

    const sx = crop.x / scale;
    const sy = crop.y / scale;
    const sw = crop.w / scale;
    const sh = crop.h / scale;

    resultCanvas.width = Math.round(sw);
    resultCanvas.height = Math.round(sh);
    resultCtx.clearRect(0, 0, resultCanvas.width, resultCanvas.height);
    resultCtx.drawImage(img, sx, sy, sw, sh, 0, 0, resultCanvas.width, resultCanvas.height);

    resultCanvas.toBlob((blob) => {
      if (!blob) return;
      outputBlob = blob;
      if (outputUrl) URL.revokeObjectURL(outputUrl);
      outputUrl = URL.createObjectURL(blob);
      updateDownloadState(true);
      setNote("Kırpma hazır. İndir ile kaydet.");
    });
  };

  const download = () => {
    if (!outputBlob || !outputUrl) {
      setNote("Önce kırp.");
      return;
    }
    const link = document.createElement("a");
    link.href = outputUrl;
    link.download = "aramabul-crop.png";
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  input.addEventListener("change", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLInputElement)) return;
    const file = target.files && target.files[0];
    if (!file) {
      setNote("Lütfen bir görsel seç.");
      if (fileName) fileName.textContent = "Seçili dosya yok";
      return;
    }
    if (fileName) fileName.textContent = file.name;
    loadImage(file);
  });

  [cropX, cropY, cropW, cropH].forEach((inputEl) => {
    if (!inputEl) return;
    inputEl.addEventListener("input", () => {
      if (lock && lock.checked && (inputEl === cropW || inputEl === cropH)) {
        const ratio = crop.w / crop.h || 1;
        if (inputEl === cropW) {
          crop.h = Number(cropW.value) / ratio;
        } else {
          crop.w = Number(cropH.value) * ratio;
        }
      }
      setCropFromInputs();
    });
  });

  if (applyBtn) applyBtn.addEventListener("click", applyCrop);
  if (downloadBtn) downloadBtn.addEventListener("click", download);

  const startDrag = (event) => {
    if (!overlay) return;
    const handle = event.target.closest("[data-handle]");
    dragMode = handle ? handle.getAttribute("data-handle") : "move";
    drag = true;
    const rect = overlay.getBoundingClientRect();
    dragOffset = { x: event.clientX - rect.left, y: event.clientY - rect.top };
    dragStart = {
      x: event.clientX,
      y: event.clientY,
      crop: { ...crop },
      ratio: crop.w / crop.h || 1,
    };
  };

  const moveDrag = (event) => {
    if (!drag || !overlay) return;
    const wrapRect = canvas.getBoundingClientRect();
    if (dragMode === "move") {
      crop.x = event.clientX - wrapRect.left - dragOffset.x;
      crop.y = event.clientY - wrapRect.top - dragOffset.y;
    } else {
      const dx = event.clientX - dragStart.x;
      const dy = event.clientY - dragStart.y;
      const next = { ...dragStart.crop };

      if (dragMode === "se") {
        next.w = dragStart.crop.w + dx;
        next.h = dragStart.crop.h + dy;
      } else if (dragMode === "sw") {
        next.w = dragStart.crop.w - dx;
        next.h = dragStart.crop.h + dy;
        next.x = dragStart.crop.x + dx;
      } else if (dragMode === "ne") {
        next.w = dragStart.crop.w + dx;
        next.h = dragStart.crop.h - dy;
        next.y = dragStart.crop.y + dy;
      } else if (dragMode === "nw") {
        next.w = dragStart.crop.w - dx;
        next.h = dragStart.crop.h - dy;
        next.x = dragStart.crop.x + dx;
        next.y = dragStart.crop.y + dy;
      } else if (dragMode === "e") {
        next.w = dragStart.crop.w + dx;
      } else if (dragMode === "w") {
        next.w = dragStart.crop.w - dx;
        next.x = dragStart.crop.x + dx;
      } else if (dragMode === "s") {
        next.h = dragStart.crop.h + dy;
      } else if (dragMode === "n") {
        next.h = dragStart.crop.h - dy;
        next.y = dragStart.crop.y + dy;
      }

      if (lock && lock.checked) {
        const ratio = dragStart.ratio;
        if (dragMode === "n" || dragMode === "s") {
          next.w = next.h * ratio;
          next.x = dragStart.crop.x + (dragStart.crop.w - next.w) / 2;
        } else if (dragMode === "e" || dragMode === "w") {
          next.h = next.w / ratio;
          next.y = dragStart.crop.y + (dragStart.crop.h - next.h) / 2;
        } else if (dragMode === "nw" || dragMode === "ne") {
          next.h = next.w / ratio;
          if (dragMode === "nw") {
            next.y = dragStart.crop.y + (dragStart.crop.h - next.h);
          }
        } else {
          next.w = next.h * ratio;
          if (dragMode === "sw") {
            next.x = dragStart.crop.x + (dragStart.crop.w - next.w);
          }
        }
      }

      crop = next;
    }
    clampCrop();
    updateOverlay();
    syncInputs();
  };

  const endDrag = () => {
    drag = false;
    dragMode = "move";
  };

  if (overlay) {
    overlay.addEventListener("mousedown", startDrag);
  }
  window.addEventListener("mousemove", moveDrag);
  window.addEventListener("mouseup", endDrag);
  window.addEventListener("beforeunload", () => {
    if (outputUrl) URL.revokeObjectURL(outputUrl);
  });
})();
