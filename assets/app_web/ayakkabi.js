const SHOE_SYSTEMS = [
  { key: "eu", label: "Avrupa" },
  { key: "uk_men", label: "Birleşik Krallık, erkek" },
  { key: "uk_women", label: "Birleşik Krallık, kadın" },
  { key: "us_men", label: "ABD & Kanada, erkek" },
  { key: "us_women", label: "ABD & Kanada, kadın" },
  { key: "jp_men", label: "Japon, erkek" },
  { key: "jp_women", label: "Japon, kadın" },
  { key: "cm", label: "Santimetre" },
  { key: "mondo", label: "Mondopoint" },
  { key: "inch", label: "İnç" },
];

const SHOE_ROWS = [
  ["35", "3", "2.5", "3.5", "5", "21.5", "21", "22.8", "228", "9"],
  ["35.5", "3.5", "3", "4", "5.5", "22", "21.5", "23.1", "231", "9.1"],
  ["36", "4", "3.5", "4.5", "6", "22.5", "22", "23.5", "235", "9.4"],
  ["37", "4.5", "4", "5", "6.5", "23", "22.5", "23.8", "238", "9.4"],
  ["37.5", "5", "4.5", "5.5", "7", "23.5", "23", "24.1", "241", "9.5"],
  ["38", "5.5", "5", "6", "7.5", "24", "23.5", "24.5", "245", "9.6"],
  ["38.5", "6", "5.5", "6.5", "8", "24.5", "24", "24.8", "248", "9.8"],
  ["39", "6.5", "6", "7", "8.5", "25", "24.5", "25.1", "251", "9.9"],
  ["40", "7", "6.5", "7.5", "9", "25.5", "25", "25.4", "254", "10"],
  ["41", "7.5", "7", "8", "9.5", "26", "25.5", "25.7", "257", "10.1"],
  ["42", "8", "7.5", "8.5", "10", "26.5", "26", "26", "260", "10.3"],
  ["43", "8.5", "8", "9", "10.5", "27.5", "27", "26.7", "267", "10.5"],
  ["44", "10", "9.5", "10.5", "12", "28.5", "28", "27.3", "273", "10.8"],
  ["45", "11", "10.5", "11.5", "13", "29.5", "29", "27.9", "279", "11"],
  ["46.5", "12", "11.5", "12.5", "14", "30.5", "30", "28.6", "286", "11.8"],
  ["48.5", "13.5", "13", "14", "15.5", "31.5", "31", "29.2", "292", "11.5"],
].map((values) => Object.fromEntries(SHOE_SYSTEMS.map((system, index) => [system.key, values[index]])));

const systemSelect = document.querySelector("[data-shoe-system]");
const sizeSelect = document.querySelector("[data-shoe-size]");
const resultsContainer = document.querySelector("[data-shoe-results]");

function populateSystems() {
  systemSelect.innerHTML = "";
  SHOE_SYSTEMS.forEach((system) => {
    const option = document.createElement("option");
    option.value = system.key;
    option.textContent = system.label;
    systemSelect.appendChild(option);
  });
  systemSelect.value = "eu";
}

function populateSizes(systemKey) {
  sizeSelect.innerHTML = "";
  SHOE_ROWS.forEach((row, index) => {
    const option = document.createElement("option");
    option.value = String(index);
    option.textContent = row[systemKey];
    sizeSelect.appendChild(option);
  });
  sizeSelect.value = "0";
}

function renderResults() {
  const activeRow = SHOE_ROWS[Number(sizeSelect.value)];
  resultsContainer.innerHTML = "";
  const jpKeys = new Set(["jp_men", "jp_women"]);
  const firstPass = SHOE_SYSTEMS.filter((system) => !jpKeys.has(system.key));
  const secondPass = SHOE_SYSTEMS.filter((system) => jpKeys.has(system.key));

  [...firstPass, ...secondPass].forEach((system) => {
    const card = document.createElement("article");
    card.className = "apparel-result-card";
    card.innerHTML = `<p class="apparel-result-label">${system.label}</p><p class="apparel-result-value">${activeRow[system.key]}</p>`;
    resultsContainer.appendChild(card);
  });
}

systemSelect.addEventListener("change", () => {
  populateSizes(systemSelect.value);
  renderResults();
});
sizeSelect.addEventListener("change", renderResults);

populateSystems();
populateSizes(systemSelect.value);
renderResults();
