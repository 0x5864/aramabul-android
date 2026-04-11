const loanAmountInput = document.querySelector("[data-loan-amount]");
const loanRateInput = document.querySelector("[data-loan-rate]");
const loanRatePeriodInput = document.querySelector("[data-loan-rate-period]");
const loanEffectiveRateInput = document.querySelector("[data-loan-effective-rate]");
const loanMonthsInput = document.querySelector("[data-loan-months]");
const loanPaymentFrequencyInput = document.querySelector("[data-loan-payment-frequency]");
const loanCalculateButton = document.querySelector("[data-loan-calculate]");
const loanPaymentLabel = document.querySelector("[data-loan-payment-label]");
const loanPaymentValue = document.querySelector("[data-loan-payment]");
const loanInterestValue = document.querySelector("[data-loan-interest]");
const loanTotalValue = document.querySelector("[data-loan-total]");
const loanScheduleToggle = document.querySelector("[data-loan-schedule-toggle]");
const loanSchedulePanel = document.querySelector("[data-loan-schedule-panel]");
const loanScheduleBody = document.querySelector("[data-loan-schedule-body]");

const RATE_PERIOD_LABELS = {
  monthly: "aylık",
  quarterly: "3 aylık",
  yearly: "yıllık",
};

const PAYMENT_FREQUENCY_CONFIG = {
  monthly: { months: 1, label: "Aylık taksit" },
  quarterly: { months: 3, label: "3 aylık taksit" },
  yearly: { months: 12, label: "Yıllık taksit" },
};

function parseDecimal(value) {
  const raw = String(value).trim().replace(/\s+/g, "");
  const normalized = raw.includes(",") ? raw.replace(/\./g, "").replace(",", ".") : raw;
  const parsed = Number(normalized);
  if (!Number.isFinite(parsed)) {
    return null;
  }
  return parsed;
}

function formatCurrency(value) {
  return new Intl.NumberFormat("tr-TR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

function formatPercent(value) {
  return new Intl.NumberFormat("tr-TR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

function formatAmount(value) {
  return new Intl.NumberFormat("tr-TR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

function getMonthlyRate(rate, period) {
  const decimalRate = rate / 100;

  if (period === "monthly") {
    return decimalRate;
  }

  if (period === "quarterly") {
    return Math.pow(1 + decimalRate, 1 / 3) - 1;
  }

  return Math.pow(1 + decimalRate, 1 / 12) - 1;
}

function getAnnualCompoundRate(rate, period) {
  const decimalRate = rate / 100;

  if (period === "monthly") {
    return (Math.pow(1 + decimalRate, 12) - 1) * 100;
  }

  if (period === "quarterly") {
    return (Math.pow(1 + decimalRate, 4) - 1) * 100;
  }

  return rate;
}

function buildPaymentPeriods(totalMonths, periodMonths) {
  const periods = [];
  let remainingMonths = totalMonths;
  let endMonth = 0;
  let index = 1;

  while (remainingMonths > 0) {
    const months = Math.min(periodMonths, remainingMonths);
    endMonth += months;
    periods.push({ index, months, endMonth });
    remainingMonths -= months;
    index += 1;
  }

  return periods;
}

function getEndingBalance(principal, monthlyRate, periods, payment) {
  let balance = principal;

  periods.forEach((period) => {
    balance = balance * Math.pow(1 + monthlyRate, period.months) - payment;
  });

  return balance;
}

function getPeriodPayment(principal, monthlyRate, periods) {
  if (!periods.length) {
    return 0;
  }

  if (monthlyRate === 0) {
    return principal / periods.length;
  }

  let low = 0;
  let high = principal;

  while (getEndingBalance(principal, monthlyRate, periods, high) > 0) {
    high *= 2;
  }

  for (let index = 0; index < 80; index += 1) {
    const mid = (low + high) / 2;
    const balance = getEndingBalance(principal, monthlyRate, periods, mid);

    if (balance > 0) {
      low = mid;
    } else {
      high = mid;
    }
  }

  return high;
}

function renderSchedule(principal, monthlyRate, periods, periodPayment) {
  if (!loanScheduleBody) {
    return { totalPayment: 0, totalInterest: 0 };
  }

  loanScheduleBody.innerHTML = "";

  let balance = principal;
  let totalPayment = 0;
  let totalInterest = 0;

  periods.forEach((period) => {
    const grownBalance = balance * Math.pow(1 + monthlyRate, period.months);
    const interest = grownBalance - balance;
    let payment = periodPayment;
    let principalPaid = payment - interest;
    let endingBalance = grownBalance - payment;

    if (endingBalance < 0.005) {
      payment = grownBalance;
      principalPaid = payment - interest;
      endingBalance = 0;
    }

    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${period.index}</td>
      <td>${period.endMonth}</td>
      <td>${formatCurrency(payment)}</td>
      <td>${formatCurrency(interest)}</td>
      <td>${formatCurrency(principalPaid)}</td>
      <td>${formatCurrency(Math.max(0, endingBalance))}</td>
    `;
    loanScheduleBody.appendChild(row);

    balance = Math.max(0, endingBalance);
    totalPayment += payment;
    totalInterest += interest;
  });

  return { totalPayment, totalInterest };
}

function updateEffectiveRate() {
  const rate = parseDecimal(loanRateInput?.value ?? "");
  const ratePeriod = loanRatePeriodInput?.value ?? "yearly";

  if (!loanEffectiveRateInput) {
    return;
  }

  if (rate === null || rate < 0) {
    loanEffectiveRateInput.value = "-";
    return;
  }

  loanEffectiveRateInput.value = `%${formatPercent(getAnnualCompoundRate(rate, ratePeriod))}`;
}

function calculateLoan() {
  const principal = parseDecimal(loanAmountInput?.value ?? "");
  const rate = parseDecimal(loanRateInput?.value ?? "");
  const ratePeriod = loanRatePeriodInput?.value ?? "yearly";
  const months = Number(loanMonthsInput?.value ?? "0");
  const paymentFrequency = loanPaymentFrequencyInput?.value ?? "monthly";
  const frequencyConfig = PAYMENT_FREQUENCY_CONFIG[paymentFrequency] ?? PAYMENT_FREQUENCY_CONFIG.monthly;
  const totalMonths = months;

  updateEffectiveRate();

  if (loanPaymentLabel) {
    loanPaymentLabel.textContent = frequencyConfig.label;
  }

  if (
    principal === null ||
    rate === null ||
    principal <= 0 ||
    rate < 0 ||
    !Number.isFinite(months) ||
    totalMonths <= 0
  ) {
    loanPaymentValue.textContent = "-";
    loanInterestValue.textContent = "-";
    loanTotalValue.textContent = "-";
    if (loanScheduleBody) {
      loanScheduleBody.innerHTML = "";
    }
    return;
  }

  const monthlyRate = getMonthlyRate(rate, ratePeriod);
  const periodMonths = frequencyConfig.months;
  const periods = buildPaymentPeriods(totalMonths, periodMonths);
  const periodPayment = getPeriodPayment(principal, monthlyRate, periods);
  const scheduleTotals = renderSchedule(principal, monthlyRate, periods, periodPayment);

  loanPaymentValue.textContent = formatCurrency(periodPayment);
  loanInterestValue.textContent = formatCurrency(scheduleTotals.totalInterest);
  loanTotalValue.textContent = formatCurrency(scheduleTotals.totalPayment);
}

if (loanCalculateButton) {
  loanCalculateButton.addEventListener("click", calculateLoan);
}

if (loanAmountInput) {
  loanAmountInput.addEventListener("blur", () => {
    const amount = parseDecimal(loanAmountInput.value);
    if (amount === null) {
      return;
    }

    loanAmountInput.value = formatAmount(amount);
  });
}

if (loanRateInput) {
  loanRateInput.addEventListener("input", updateEffectiveRate);
}

if (loanRatePeriodInput) {
  loanRatePeriodInput.addEventListener("change", updateEffectiveRate);
}

if (loanPaymentFrequencyInput) {
  loanPaymentFrequencyInput.addEventListener("change", calculateLoan);
}

if (loanScheduleToggle && loanSchedulePanel) {
  loanScheduleToggle.addEventListener("click", () => {
    const nextState = loanSchedulePanel.hidden;
    loanSchedulePanel.hidden = !nextState;
    loanScheduleToggle.textContent = nextState ? "Ödeme tablosunu gizle" : "Ödeme tablosunu göster";
  });
}

calculateLoan();
