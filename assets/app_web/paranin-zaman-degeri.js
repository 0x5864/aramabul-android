const tvmModeInput = document.querySelector("[data-tvm-mode]");
const tvmTimingInput = document.querySelector("[data-tvm-timing]");
const tvmPvInput = document.querySelector("[data-tvm-pv]");
const tvmFvInput = document.querySelector("[data-tvm-fv-input]");
const tvmPmtInput = document.querySelector("[data-tvm-pmt]");
const tvmRateInput = document.querySelector("[data-tvm-rate]");
const tvmPeriodsInput = document.querySelector("[data-tvm-periods]");
const tvmCalculateButton = document.querySelector("[data-tvm-calculate]");

const tvmPrimaryLabel = document.querySelector("[data-tvm-primary-label]");
const tvmPrimaryValue = document.querySelector("[data-tvm-primary-value]");
const tvmGrowthValue = document.querySelector("[data-tvm-growth]");
const tvmContributionValue = document.querySelector("[data-tvm-contribution]");

function parseLocalizedDecimal(value) {
  const raw = String(value || "").trim().replace(/\s+/g, "");
  const normalized = raw.includes(",") ? raw.replace(/\./g, "").replace(",", ".") : raw;
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}

function formatLocalizedNumber(value) {
  return new Intl.NumberFormat("tr-TR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

function formatGrowthFactor(value) {
  return `${new Intl.NumberFormat("tr-TR", {
    minimumFractionDigits: 4,
    maximumFractionDigits: 4,
  }).format(value)}x`;
}

function getAnnuityFactor(rate, periods, timing) {
  if (periods <= 0) {
    return 0;
  }

  if (rate === 0) {
    return periods;
  }

  const baseFactor = (Math.pow(1 + rate, periods) - 1) / rate;
  return timing === "begin" ? baseFactor * (1 + rate) : baseFactor;
}

function calculateTimeValueMoney() {
  const mode = tvmModeInput?.value || "fv";
  const timing = tvmTimingInput?.value || "end";
  const pv = parseLocalizedDecimal(tvmPvInput?.value ?? "");
  const fv = parseLocalizedDecimal(tvmFvInput?.value ?? "");
  const pmt = parseLocalizedDecimal(tvmPmtInput?.value ?? "");
  const ratePercent = parseLocalizedDecimal(tvmRateInput?.value ?? "");
  const periods = Number(tvmPeriodsInput?.value ?? "0");

  if (
    pv === null ||
    fv === null ||
    pmt === null ||
    ratePercent === null ||
    !Number.isFinite(periods) ||
    periods <= 0
  ) {
    tvmPrimaryValue.textContent = "-";
    tvmGrowthValue.textContent = "-";
    tvmContributionValue.textContent = "-";
    return;
  }

  const rate = ratePercent / 100;
  const growthFactor = Math.pow(1 + rate, periods);
  const annuityFactor = getAnnuityFactor(rate, periods, timing);
  const contribution = pmt * periods;

  let primaryLabel = "Gelecek Değer (FV)";
  let primaryValue = pv * growthFactor + pmt * annuityFactor;

  if (mode === "pv") {
    primaryLabel = "Bugünkü Değer (PV)";
    primaryValue = growthFactor === 0 ? 0 : (fv - pmt * annuityFactor) / growthFactor;
  }

  if (mode === "pmt") {
    primaryLabel = "Dönemsel Ödeme (PMT)";
    primaryValue = annuityFactor === 0 ? 0 : (fv - pv * growthFactor) / annuityFactor;
  }

  tvmPrimaryLabel.textContent = primaryLabel;
  tvmPrimaryValue.textContent = formatLocalizedNumber(primaryValue);
  tvmGrowthValue.textContent = formatGrowthFactor(growthFactor);
  tvmContributionValue.textContent = formatLocalizedNumber(contribution);
}

[
  tvmModeInput,
  tvmTimingInput,
  tvmPvInput,
  tvmFvInput,
  tvmPmtInput,
  tvmRateInput,
  tvmPeriodsInput,
].forEach((input) => {
  input?.addEventListener("input", calculateTimeValueMoney);
  input?.addEventListener("change", calculateTimeValueMoney);
});

tvmCalculateButton?.addEventListener("click", calculateTimeValueMoney);

calculateTimeValueMoney();
