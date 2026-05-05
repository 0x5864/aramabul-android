const textInput = document.querySelector("[data-text-tools-input]");
const statusOutput = document.querySelector("[data-text-tools-status]");
const clearButton = document.querySelector("[data-text-tools-clear]");

const statOutputs = {
  words: document.querySelector("[data-text-stat-words]"),
  characters: document.querySelector("[data-text-stat-characters]"),
  charactersNoSpace: document.querySelector("[data-text-stat-characters-no-space]"),
  sentences: document.querySelector("[data-text-stat-sentences]"),
  paragraphs: document.querySelector("[data-text-stat-paragraphs]"),
  reading: document.querySelector("[data-text-stat-reading]"),
};

const transformOutputs = {
  uppercase: document.querySelector('[data-text-output="uppercase"]'),
  lowercase: document.querySelector('[data-text-output="lowercase"]'),
  titlecase: document.querySelector('[data-text-output="titlecase"]'),
  turkishified: document.querySelector('[data-text-output="turkishified"]'),
  trimmed: document.querySelector('[data-text-output="trimmed"]'),
  proofread: document.querySelector('[data-text-output="proofread"]'),
};

const copyButtons = Array.from(document.querySelectorAll("[data-copy-target]"));

function formatNumber(value) {
  return new Intl.NumberFormat("tr-TR").format(value);
}

function toTitleCase(value) {
  return value.replace(/\p{L}[\p{L}\p{M}'’\-]*/gu, (word) => {
    const normalizedWord = word.toLocaleLowerCase("tr-TR");
    return normalizedWord.charAt(0).toLocaleUpperCase("tr-TR") + normalizedWord.slice(1);
  });
}

function toTurkishCharacters(value) {
  return value
    .replace(/&ccedil;|&#231;/gi, "ç")
    .replace(/&Ccedil;|&#199;/g, "Ç")
    .replace(/&gbreve;|&#287;/gi, "ğ")
    .replace(/&Gbreve;|&#286;/g, "Ğ")
    .replace(/&ouml;|&#246;/gi, "ö")
    .replace(/&Ouml;|&#214;/g, "Ö")
    .replace(/&uuml;|&#252;/gi, "ü")
    .replace(/&Uuml;|&#220;/g, "Ü")
    .replace(/&scedil;|&#351;/gi, "ş")
    .replace(/&Scedil;|&#350;/g, "Ş")
    .replace(/&imath;|&#305;/gi, "ı")
    .replace(/&Idot;|&#304;/g, "İ")
    .normalize("NFC");
}

function toProofreadTurkish(value) {
  const normalizedParagraphs = value
    .split(/\n\s*\n/)
    .map((paragraph) =>
      paragraph
        .split("\n")
        .map((line) => line.trim().replace(/\s+/g, " "))
        .filter(Boolean)
        .join(" "),
    )
    .filter(Boolean);

  return normalizedParagraphs
    .map((paragraph) => {
      const spaced = paragraph
        .replace(/\s+([,.!?;:])/g, "$1")
        .replace(/([,.!?;:])(?=\S)/g, "$1 ")
        .replace(/\s+/g, " ")
        .trim();

      let shouldUppercase = true;

      return Array.from(spaced)
        .map((character) => {
          if (shouldUppercase && /\p{L}/u.test(character)) {
            shouldUppercase = false;
            return character.toLocaleUpperCase("tr-TR");
          }

          if (/[.!?]/.test(character)) {
            shouldUppercase = true;
          }

          return character;
        })
        .join("");
    })
    .join("\n\n");
}

function normalizeWhitespace(value) {
  return value
    .split("\n")
    .map((line) => line.trim().replace(/\s+/g, " "))
    .join("\n")
    .trim();
}

function updateTextTools() {
  const value = textInput.value;
  const trimmedValue = normalizeWhitespace(value);
  const words = value.trim() ? value.trim().split(/\s+/).filter(Boolean).length : 0;
  const characters = value.length;
  const charactersNoSpace = value.replace(/\s/g, "").length;
  const sentenceMatches = value.match(/[^.!?]+[.!?]+|[^.!?]+$/g) || [];
  const paragraphMatches = value.trim() ? value.trim().split(/\n\s*\n/).filter(Boolean) : [];
  const readingMinutes = words === 0 ? 0 : Math.max(1, Math.ceil(words / 200));

  statOutputs.words.textContent = formatNumber(words);
  statOutputs.characters.textContent = formatNumber(characters);
  statOutputs.charactersNoSpace.textContent = formatNumber(charactersNoSpace);
  statOutputs.sentences.textContent = formatNumber(sentenceMatches.filter((item) => item.trim()).length);
  statOutputs.paragraphs.textContent = formatNumber(paragraphMatches.length);
  statOutputs.reading.textContent = `${formatNumber(readingMinutes)} dk`;

  transformOutputs.uppercase.textContent = value.toLocaleUpperCase("tr-TR");
  transformOutputs.lowercase.textContent = value.toLocaleLowerCase("tr-TR");
  transformOutputs.titlecase.textContent = toTitleCase(value);
  transformOutputs.turkishified.textContent = toTurkishCharacters(value);
  transformOutputs.trimmed.textContent = trimmedValue;
  transformOutputs.proofread.textContent = toProofreadTurkish(value);

  statusOutput.textContent = value.trim() ? "Metin araçları hazır." : "Metin bekleniyor.";
}

async function copyOutput(target) {
  const output = transformOutputs[target];
  const value = output?.textContent ?? "";

  if (!value) {
    statusOutput.textContent = "Kopyalanacak çıktı yok.";
    return;
  }

  try {
    await navigator.clipboard.writeText(value);
    statusOutput.textContent = "Çıktı panoya kopyalandı.";
  } catch {
    statusOutput.textContent = "Kopyalama başarısız oldu.";
  }
}

function clearText() {
  textInput.value = "";
  updateTextTools();
}

textInput.addEventListener("input", updateTextTools);
clearButton.addEventListener("click", clearText);
copyButtons.forEach((button) => {
  button.addEventListener("click", () => {
    copyOutput(button.dataset.copyTarget);
  });
});

updateTextTools();
