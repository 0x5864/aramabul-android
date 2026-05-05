const MASS_UNITS = {
  kg: {
    label: "Kilogram (kg)",
    toKilogram: 1,
  },
  kps2m: {
    label: "kp.s²/m",
    toKilogram: 9.80665,
  },
  oz: {
    label: "Ons (oz)",
    toKilogram: 0.028349523125,
  },
  lbs: {
    label: "Pound (lbs)",
    toKilogram: 0.45359237,
  },
  short_ton: {
    label: "Ton (short)",
    toKilogram: 907.18474,
  },
  long_ton: {
    label: "Ton (long)",
    toKilogram: 1016.0469088,
  },
  metric_ton: {
    label: "Ton (metrik)",
    toKilogram: 1000,
  },
};

const form = document.querySelector("[converter-form]");
const amountInput = document.querySelector("[converter-amount]");
const fromSelect = document.querySelector("[converter-from]");
const toSelect = document.querySelector("[converter-to]");
const swapButton = document.querySelector("[converter-swap]");
const resultValue = document.querySelector("[converter-result]");
const resultUnit = document.querySelector("[converter-result-unit]");
const resultSummary = document.querySelector("[converter-summary]");

function normalizeAmount(value) {
  const normalized = value.trim().replace(",", ".");
  const parsed = Number(normalized);

  if (!Number.isFinite(parsed)) {
    return null;
  }

  return parsed;
}

function formatResult(value) {
  return new Intl.NumberFormat("tr-TR", {
    maximumFractionDigits: 8,
  }).format(value);
}

function convertMass(amount, fromUnit, toUnit) {
  const amountInKilogram = amount * MASS_UNITS[fromUnit].toKilogram;
  return amountInKilogram / MASS_UNITS[toUnit].toKilogram;
}

function updateConversion() {
  const amount = normalizeAmount(amountInput.value);
  const fromUnit = fromSelect.value;
  const toUnit = toSelect.value;

  if (amount === null) {
    resultValue.textContent = "-";
    resultUnit.textContent = MASS_UNITS[toUnit].label;
    resultSummary.textContent = "Geçerli bir miktar girince sonuç burada görünecek.";
    return;
  }

  const converted = convertMass(amount, fromUnit, toUnit);
  resultValue.textContent = formatResult(converted);
  resultUnit.textContent = MASS_UNITS[toUnit].label;
  resultSummary.textContent = `${formatResult(amount)} ${MASS_UNITS[fromUnit].label} = ${formatResult(converted)} ${MASS_UNITS[toUnit].label}`;
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  updateConversion();
});

swapButton.addEventListener("click", () => {
  const currentFrom = fromSelect.value;
  fromSelect.value = toSelect.value;
  toSelect.value = currentFrom;
  updateConversion();
});

amountInput.addEventListener("input", updateConversion);
fromSelect.addEventListener("change", updateConversion);
toSelect.addEventListener("change", updateConversion);

updateConversion();
