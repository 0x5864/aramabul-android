const KITCHEN_UNITS = {
  tsp: { label: "Çay kaşığı", toBase: 5 },
  dsp: { label: "Tatlı kaşığı", toBase: 10 },
  tbsp: { label: "Yemek kaşığı", toBase: 15 },
  tea_glass: { label: "Çay bardağı", toBase: 100 },
  water_glass: { label: "Su bardağı", toBase: 200 },
  cup: { label: "Cup", toBase: 240 },
  coffee_cup: { label: "Kahve fincanı", toBase: 60 },
  ml: { label: "Mililitre (ml)", toBase: 1 },
  cl: { label: "Santilitre (cl)", toBase: 10 },
  dl: { label: "Desilitre (dl)", toBase: 100 },
  l: { label: "Litre (L)", toBase: 1000 },
};

const amountInput = document.querySelector("[data-kitchen-amount]");
const fromSelect = document.querySelector("[data-kitchen-from]");
const toSelect = document.querySelector("[data-kitchen-to]");
const swapButton = document.querySelector("[data-kitchen-swap]");
const resultValue = document.querySelector("[data-kitchen-result-value]");
const resultUnit = document.querySelector("[data-kitchen-result-unit]");
const summary = document.querySelector("[data-kitchen-summary]");

function formatNumber(value) {
  return new Intl.NumberFormat("tr-TR", {
    maximumFractionDigits: 6,
  }).format(value);
}

function parseAmount(value) {
  const parsed = Number(value.trim().replace(",", "."));
  if (!Number.isFinite(parsed)) {
    return null;
  }
  return parsed;
}

function populateSelect(select, selectedKey) {
  select.innerHTML = "";

  Object.entries(KITCHEN_UNITS).forEach(([key, unit]) => {
    const option = document.createElement("option");
    option.value = key;
    option.textContent = unit.label;
    option.selected = key === selectedKey;
    select.appendChild(option);
  });
}

function updateKitchenResult() {
  const amount = parseAmount(amountInput.value);

  if (amount === null) {
    resultValue.textContent = "-";
    resultUnit.textContent = KITCHEN_UNITS[toSelect.value].label;
    summary.textContent = "Geçerli bir miktar girdiğinde sonuç burada görünecek.";
    return;
  }

  const amountInMillilitres = amount * KITCHEN_UNITS[fromSelect.value].toBase;
  const converted = amountInMillilitres / KITCHEN_UNITS[toSelect.value].toBase;

  resultValue.textContent = formatNumber(converted);
  resultUnit.textContent = KITCHEN_UNITS[toSelect.value].label;
  summary.textContent =
    `${formatNumber(amount)} ${KITCHEN_UNITS[fromSelect.value].label} = ` +
    `${formatNumber(converted)} ${KITCHEN_UNITS[toSelect.value].label}`;
}

amountInput.addEventListener("input", updateKitchenResult);
fromSelect.addEventListener("change", updateKitchenResult);
toSelect.addEventListener("change", updateKitchenResult);

swapButton.addEventListener("click", () => {
  const currentFrom = fromSelect.value;
  fromSelect.value = toSelect.value;
  toSelect.value = currentFrom;
  updateKitchenResult();
});

populateSelect(fromSelect, "water_glass");
populateSelect(toSelect, "ml");
updateKitchenResult();
