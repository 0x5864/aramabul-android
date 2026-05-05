const MS_PER_DAY = 24 * 60 * 60 * 1000;
const STANDARD_GESTATION_DAYS = 280;

const lmpInput = document.querySelector("[data-pregnancy-lmp]");
const cycleInput = document.querySelector("[data-pregnancy-cycle]");
const referenceInput = document.querySelector("[data-pregnancy-reference]");

const weekOutput = document.querySelector("[data-pregnancy-week]");
const dueOutput = document.querySelector("[data-pregnancy-due]");
const trimesterOutput = document.querySelector("[data-pregnancy-trimester]");
const fetalAgeOutput = document.querySelector("[data-pregnancy-fetal-age]");
const conceptionOutput = document.querySelector("[data-pregnancy-conception]");
const firstTrimesterOutput = document.querySelector("[data-pregnancy-first-trimester]");
const secondTrimesterOutput = document.querySelector("[data-pregnancy-second-trimester]");
const fullTermOutput = document.querySelector("[data-pregnancy-full-term]");

function formatDate(date) {
  return new Intl.DateTimeFormat("tr-TR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date);
}

function parseDate(value) {
  if (!value) {
    return null;
  }

  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date;
}

function addDays(date, days) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

function setDefaultDates() {
  const today = new Date();
  const referenceValue = today.toISOString().slice(0, 10);
  const lmpValue = addDays(today, -84).toISOString().slice(0, 10);

  referenceInput.value = referenceValue;
  lmpInput.value = lmpValue;
}

function updatePregnancyCalendar() {
  const lmpDate = parseDate(lmpInput.value);
  const referenceDate = parseDate(referenceInput.value);
  const cycleLength = Number(cycleInput.value);

  if (!lmpDate || !referenceDate || !Number.isFinite(cycleLength)) {
    return;
  }

  const ovulationOffset = cycleLength - 14;
  const dueDate = addDays(lmpDate, STANDARD_GESTATION_DAYS + (cycleLength - 28));
  const conceptionDate = addDays(lmpDate, ovulationOffset);
  const pregnancyDays = Math.max(0, Math.floor((referenceDate - lmpDate) / MS_PER_DAY));
  const weeks = Math.floor(pregnancyDays / 7);
  const extraDays = pregnancyDays % 7;
  const fetalDays = Math.max(0, pregnancyDays - 14);
  const fetalWeeks = Math.floor(fetalDays / 7);
  const fetalExtraDays = fetalDays % 7;

  let trimester = "1. trimester";
  if (pregnancyDays >= 189) {
    trimester = "3. trimester";
  } else if (pregnancyDays >= 91) {
    trimester = "2. trimester";
  }

  weekOutput.textContent = `${weeks} hafta ${extraDays} gün`;
  dueOutput.textContent = formatDate(dueDate);
  trimesterOutput.textContent = trimester;
  fetalAgeOutput.textContent = `${fetalWeeks} hafta ${fetalExtraDays} gün`;
  conceptionOutput.textContent = formatDate(conceptionDate);
  firstTrimesterOutput.textContent = formatDate(addDays(lmpDate, 90));
  secondTrimesterOutput.textContent = formatDate(addDays(lmpDate, 188));
  fullTermOutput.textContent = formatDate(addDays(lmpDate, 259));
}

[lmpInput, cycleInput, referenceInput].forEach((element) => {
  element.addEventListener("input", updatePregnancyCalendar);
  element.addEventListener("change", updatePregnancyCalendar);
});

setDefaultDates();
updatePregnancyCalendar();
