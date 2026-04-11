const languageCatalog = [
  { code: "auto", name: "Otomatik Algıla" },
  { code: "tr", name: "Türkçe" },
  { code: "en", name: "İngilizce" },
  { code: "de", name: "Almanca" },
  { code: "fr", name: "Fransızca" },
  { code: "es", name: "İspanyolca" },
  { code: "it", name: "İtalyanca" },
  { code: "pt", name: "Portekizce" },
  { code: "ru", name: "Rusça" },
  { code: "ar", name: "Arapça" },
  { code: "fa", name: "Farsça" },
  { code: "uk", name: "Ukraynaca" },
  { code: "nl", name: "Hollandaca" },
  { code: "pl", name: "Lehçe" },
  { code: "el", name: "Yunanca" },
  { code: "bg", name: "Bulgarca" },
  { code: "ja", name: "Japonca" },
  { code: "ko", name: "Korece" },
  { code: "zh-CN", name: "Çince (Basitleştirilmiş)" },
];

const sourceSelect = document.querySelector("[data-translate-source]");
const targetSelect = document.querySelector("[data-translate-target]");
const inputTextarea = document.querySelector("[data-translate-input]");
const outputArea = document.querySelector("[data-translate-output]");
const statusOutput = document.querySelector("[data-translate-status]");
const detectedOutput = document.querySelector("[data-translate-detected]");
const transliterationOutput = document.querySelector("[data-translate-transliteration]");
const submitButton = document.querySelector("[data-translate-submit]");
const inputMicButton = document.querySelector("[data-translate-input-mic]");
const inputListenButton = document.querySelector("[data-translate-input-listen]");
const listenButton = document.querySelector("[data-translate-listen]");
const copyButton = document.querySelector("[data-translate-copy]");
const swapButton = document.querySelector("[data-translate-swap]");

let latestRequestId = 0;
let debounceTimer = null;
let lastDetectedSource = "tr";
let activeUtterance = null;
let activeListenButton = null;
let speechRecognition = null;
let isRecording = false;

const canSpeak = "speechSynthesis" in window && "SpeechSynthesisUtterance" in window;
const SpeechRecognitionApi = window.SpeechRecognition || window.webkitSpeechRecognition;
const canRecordSpeech = Boolean(SpeechRecognitionApi);

function fillLanguageSelect(selectElement, includeAuto) {
  const options = includeAuto ? languageCatalog : languageCatalog.filter((item) => item.code !== "auto");
  options.forEach((language) => {
    const option = document.createElement("option");
    option.value = language.code;
    option.textContent = language.name;
    selectElement.append(option);
  });
}

function getLanguageName(code) {
  const match = languageCatalog.find((language) => language.code === code);
  return match ? match.name : code;
}

function setStatus(message, isError = false) {
  statusOutput.textContent = message;
  statusOutput.classList.toggle("is-error", isError);
}

function setOutput(content, isPlaceholder = false) {
  outputArea.textContent = content;
  outputArea.classList.toggle("is-placeholder", isPlaceholder);
}

function setListenButtonVisual(button, isActive) {
  if (!button) {
    return;
  }

  button.classList.toggle("is-active", isActive);
  const label = isActive ? "Sesli okumayı durdur" : button.dataset.idleLabel;
  button.setAttribute("aria-label", label);
  button.dataset.tooltip = label;
}

function setMicButtonVisual(isActive) {
  if (!inputMicButton) {
    return;
  }

  inputMicButton.classList.toggle("is-active", isActive);
  const label = isActive ? "Sesli girişi durdur" : inputMicButton.dataset.idleLabel;
  inputMicButton.setAttribute("aria-label", label);
  inputMicButton.dataset.tooltip = label;
}

function updateListenButtonState() {
  const hasOutputContent = outputArea.textContent.trim() && !outputArea.classList.contains("is-placeholder");
  const hasInputContent = inputTextarea.value.trim().length > 0;

  if (listenButton) {
    listenButton.disabled = !canSpeak || !hasOutputContent;
  }

  if (inputListenButton) {
    inputListenButton.disabled = !canSpeak || !hasInputContent;
  }

  if (inputMicButton) {
    inputMicButton.disabled = !canRecordSpeech;
  }
}

function findVoiceByLanguage(languageCode) {
  if (!canSpeak) {
    return null;
  }

  const voices = window.speechSynthesis.getVoices();
  if (!voices.length) {
    return null;
  }

  const normalizedCode = languageCode.toLowerCase();
  return (
    voices.find((voice) => voice.lang.toLowerCase() === normalizedCode)
    || voices.find((voice) => voice.lang.toLowerCase().startsWith(normalizedCode.split("-")[0]))
    || null
  );
}

async function translateText() {
  const text = inputTextarea.value.trim();
  const source = sourceSelect.value;
  const target = targetSelect.value;

  if (!text) {
    setOutput("Çeviri burada görünecek.", true);
    detectedOutput.textContent = "Algılanan dil: -";
    transliterationOutput.textContent = "Latin okunuş: -";
    transliterationOutput.hidden = true;
    setStatus("Çevrilecek metin bekleniyor.");
    updateListenButtonState();
    return;
  }

  if (source !== "auto" && source === target) {
    setStatus("Kaynak ve hedef dil aynı olamaz.", true);
    return;
  }

  const requestId = ++latestRequestId;
  submitButton.disabled = true;
  setStatus("Çevriliyor...");

  try {
    const response = await fetch("/api/translate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text,
        source,
        target,
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data?.error || "Çeviri alınamadı.");
    }

    if (requestId !== latestRequestId) {
      return;
    }

    lastDetectedSource = data.detectedSource || source;
    setOutput(data.translation || "Sonuç alınamadı.", false);
    detectedOutput.textContent = `Algılanan dil: ${getLanguageName(lastDetectedSource)}`;
    if (data.transliteration) {
      transliterationOutput.textContent = `Latin okunuş: ${data.transliteration}`;
      transliterationOutput.hidden = false;
    } else {
      transliterationOutput.textContent = "Latin okunuş: -";
      transliterationOutput.hidden = true;
    }
    setStatus("");
    updateListenButtonState();
  } catch (error) {
    setOutput("Çeviri alınamadı.", true);
    detectedOutput.textContent = "Algılanan dil: -";
    transliterationOutput.textContent = "Latin okunuş: -";
    transliterationOutput.hidden = true;
    setStatus(error instanceof Error ? error.message : "Çeviri alınamadı.", true);
    updateListenButtonState();
  } finally {
    submitButton.disabled = false;
  }
}

function queueTranslate() {
  window.clearTimeout(debounceTimer);
  debounceTimer = window.setTimeout(() => {
    translateText();
  }, 450);
}

async function copyTranslation() {
  const content = outputArea.textContent.trim();
  if (!content || outputArea.classList.contains("is-placeholder")) {
    setStatus("Kopyalanacak çeviri henüz yok.", true);
    return;
  }

  try {
    await navigator.clipboard.writeText(content);
    setStatus("Çeviri panoya kopyalandı.");
  } catch {
    setStatus("Kopyalama başarısız oldu.", true);
  }
}

function resetListenButtons() {
  setListenButtonVisual(listenButton, false);
  setListenButtonVisual(inputListenButton, false);
  activeListenButton = null;
}

function buildRecognitionLanguage(languageCode) {
  const map = {
    tr: "tr-TR",
    en: "en-US",
    de: "de-DE",
    fr: "fr-FR",
    es: "es-ES",
    it: "it-IT",
    pt: "pt-PT",
    ru: "ru-RU",
    ar: "ar-SA",
    fa: "fa-IR",
    uk: "uk-UA",
    nl: "nl-NL",
    pl: "pl-PL",
    el: "el-GR",
    bg: "bg-BG",
    ja: "ja-JP",
    ko: "ko-KR",
    "zh-CN": "zh-CN",
  };

  if (languageCode === "auto") {
    return "tr-TR";
  }

  return map[languageCode] || languageCode;
}

function ensureSpeechRecognition() {
  if (!canRecordSpeech) {
    return null;
  }

  if (!speechRecognition) {
    speechRecognition = new SpeechRecognitionApi();
    speechRecognition.interimResults = true;
    speechRecognition.continuous = false;
    speechRecognition.maxAlternatives = 1;

    speechRecognition.addEventListener("start", () => {
      isRecording = true;
      setMicButtonVisual(true);
      setStatus("Sesli giriş başladı. Konuşabilirsin.");
    });

    speechRecognition.addEventListener("result", (event) => {
      const transcript = Array.from(event.results)
        .map((result) => result[0]?.transcript || "")
        .join(" ")
        .trim();

      if (transcript) {
        inputTextarea.value = transcript;
        updateListenButtonState();
      }
    });

    speechRecognition.addEventListener("end", () => {
      isRecording = false;
      setMicButtonVisual(false);
      setStatus("Sesli giriş tamamlandı.");
      queueTranslate();
    });

    speechRecognition.addEventListener("error", (event) => {
      isRecording = false;
      setMicButtonVisual(false);
      if (event.error === "not-allowed") {
        setStatus("Mikrofon izni verilmedi.", true);
        return;
      }
      if (event.error === "no-speech") {
        setStatus("Ses algılanmadı.", true);
        return;
      }
      setStatus("Sesli giriş başlatılamadı.", true);
    });
  }

  speechRecognition.lang = buildRecognitionLanguage(sourceSelect.value);
  return speechRecognition;
}

function speakText(content, languageCode, triggerButton, emptyMessage) {
  if (!canSpeak) {
    setStatus("Bu tarayıcı sesli okuma desteklemiyor.", true);
    updateListenButtonState();
    return;
  }

  if (!content) {
    setStatus(emptyMessage, true);
    return;
  }

  if (window.speechSynthesis.speaking) {
    window.speechSynthesis.cancel();
    activeUtterance = null;
    resetListenButtons();
    setStatus("Sesli okuma yeniden başlatılıyor.");
  }

  const utterance = new SpeechSynthesisUtterance(content);
  utterance.lang = languageCode;

  const matchedVoice = findVoiceByLanguage(languageCode);
  if (matchedVoice) {
    utterance.voice = matchedVoice;
  }

  utterance.addEventListener("start", () => {
    activeUtterance = utterance;
    activeListenButton = triggerButton;
    setListenButtonVisual(triggerButton, true);
    setStatus("Çeviri sesli okunuyor.");
  });

  utterance.addEventListener("end", () => {
    if (activeUtterance === utterance) {
      activeUtterance = null;
      resetListenButtons();
      setStatus("Sesli okuma tamamlandı.");
    }
  });

  utterance.addEventListener("error", () => {
    if (activeUtterance === utterance) {
      activeUtterance = null;
      resetListenButtons();
    }
    setStatus("Sesli okuma başlatılamadı.", true);
  });

  window.speechSynthesis.speak(utterance);
}

function speakTranslation() {
  const content = outputArea.textContent.trim();
  speakText(
    outputArea.classList.contains("is-placeholder") ? "" : content,
    targetSelect.value,
    listenButton,
    "Dinlenecek çeviri henüz yok.",
  );
}

function speakInputText() {
  speakText(
    inputTextarea.value.trim(),
    sourceSelect.value === "auto" ? lastDetectedSource : sourceSelect.value,
    inputListenButton,
    "Dinlenecek giriş metni henüz yok.",
  );
}

function toggleSpeechInput() {
  if (!canRecordSpeech) {
    setStatus("Bu tarayıcı sesli girişi desteklemiyor.", true);
    updateListenButtonState();
    return;
  }

  const recognition = ensureSpeechRecognition();
  if (!recognition) {
    setStatus("Sesli giriş başlatılamadı.", true);
    return;
  }

  if (isRecording) {
    recognition.stop();
    return;
  }

  recognition.lang = buildRecognitionLanguage(sourceSelect.value);
  recognition.start();
}

function swapLanguages() {
  const currentSource = sourceSelect.value === "auto" ? lastDetectedSource : sourceSelect.value;
  const currentTarget = targetSelect.value;
  const currentInput = inputTextarea.value;
  const currentOutput = outputArea.classList.contains("is-placeholder") ? "" : outputArea.textContent;

  if (!currentSource || currentSource === currentTarget) {
    return;
  }

  sourceSelect.value = currentTarget;
  targetSelect.value = currentSource;
  inputTextarea.value = currentOutput || currentInput;
  setOutput(currentInput || "Çeviri burada görünecek.", !currentInput);
  detectedOutput.textContent = "Algılanan dil: -";
  transliterationOutput.textContent = "Latin okunuş: -";
  transliterationOutput.hidden = true;
  updateListenButtonState();
  queueTranslate();
}

fillLanguageSelect(sourceSelect, true);
fillLanguageSelect(targetSelect, false);

sourceSelect.value = "auto";
targetSelect.value = "en";

if (inputListenButton) {
  inputListenButton.dataset.idleLabel = "Giriş metnini dinle";
}

if (inputMicButton) {
  inputMicButton.dataset.idleLabel = "Sesli giriş başlat";
}

if (listenButton) {
  listenButton.dataset.idleLabel = "Çeviriyi dinle";
}

if (!canSpeak) {
  inputListenButton.disabled = true;
  listenButton.disabled = true;
}

if (!canRecordSpeech && inputMicButton) {
  inputMicButton.disabled = true;
}

inputTextarea.addEventListener("input", queueTranslate);
inputTextarea.addEventListener("keydown", (event) => {
  if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
    translateText();
  }
});
sourceSelect.addEventListener("change", queueTranslate);
targetSelect.addEventListener("change", queueTranslate);
submitButton.addEventListener("click", translateText);
inputMicButton.addEventListener("click", toggleSpeechInput);
inputListenButton.addEventListener("click", speakInputText);
listenButton.addEventListener("click", speakTranslation);
copyButton.addEventListener("click", copyTranslation);
swapButton.addEventListener("click", swapLanguages);

if (canSpeak) {
  window.speechSynthesis.addEventListener?.("voiceschanged", updateListenButtonState);
}

updateListenButtonState();
translateText();
