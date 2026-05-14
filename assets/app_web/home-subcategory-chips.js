"use strict";

/**
 * Anasayfa alt kategori chip'leri — içerik mimarisinden dinamik yükleme.
 *
 * Tek kaynak: /api/public/content-model/subcategories
 * İçerik mimarisinde isim değiştiğinde, anasayfa chip'leri de otomatik güncellenir.
 */
(function initHomeSubcategoryChips() {
  var container = document.getElementById("homeSubcategoryChipList");
  if (!container) {
    return;
  }

  /** Ana kategoriler ve hedef sayfaları */
  var MAIN_CATEGORIES = [
    { key: "yeme-icme", page: "yeme-icme.html" },
    { key: "gezi", page: "gezi.html" },
    { key: "hizmetler", page: "hizmetler.html" },
    { key: "saglik", page: "saglik.html" },
    { key: "kultur", page: "kultur.html" },
    { key: "sanat", page: "sanat.html" },
  ];

  function buildChipHref(mainCat, subcategory) {
    // Tüm kategoriler: subcategoryId parametresiyle
    return mainCat.page + "?subcategoryId=" + subcategory.id;
  }

  function translateName(name) {
    var headerI18n = window.ARAMABUL_HEADER_I18N;
    if (headerI18n && typeof headerI18n.getStaticUiTranslation === "function") {
      return headerI18n.getStaticUiTranslation(name) || name;
    }
    return name;
  }

  /**
   * 3-sütunlu grid'de uzun isimlerin sağ sütunda (3,6,9...) taşmasını
   * önlemek için chip'leri yeniden sırala: her satırda en kısa isimli
   * chip sağ sütuna (pozisyon 3), en uzunu sola (pozisyon 1) yerleşir.
   */
  function reorderForGrid(chips) {
    if (chips.length < 3) return chips;
    var sorted = chips.slice().sort(function (a, b) {
      return a.name.length - b.name.length;
    });
    var result = [];
    var cols = 3;
    var rows = Math.ceil(sorted.length / cols);
    // Bucket: short → right (col3), medium → center (col2), long → left (col1)
    var shortBucket = []; // pozisyon 3,6,9 — en kısa
    var midBucket = [];   // pozisyon 2,5,8
    var longBucket = [];  // pozisyon 1,4,7 — en uzun
    var third = Math.ceil(sorted.length / 3);
    for (var i = 0; i < sorted.length; i++) {
      if (i < third) shortBucket.push(sorted[i]);
      else if (i < third * 2) midBucket.push(sorted[i]);
      else longBucket.push(sorted[i]);
    }
    // Her satır: long, mid, short
    for (var r = 0; r < rows; r++) {
      if (r < longBucket.length) result.push(longBucket[r]);
      if (r < midBucket.length) result.push(midBucket[r]);
      if (r < shortBucket.length) result.push(shortBucket[r]);
    }
    return result;
  }

  function renderChips(allSubcategories) {
    container.innerHTML = "";
    var fragment = document.createDocumentFragment();
    var ordered = reorderForGrid(allSubcategories);

    ordered.forEach(function (entry) {
      var link = document.createElement("a");
      link.className = "home-subcat-chip";
      link.href = entry.href;
      link.textContent = translateName(entry.name);
      fragment.appendChild(link);
    });

    container.appendChild(fragment);
  }

  async function fetchSubcategories(mainCategoryKey) {
    try {
      var response = await fetch(
        "/api/public/content-model/subcategories?mainCategoryKey=" +
          encodeURIComponent(mainCategoryKey),
        { headers: { Accept: "application/json" } }
      );
      if (!response.ok) {
        return [];
      }
      var payload = await response.json();
      return Array.isArray(payload.items) ? payload.items : [];
    } catch (_error) {
      return [];
    }
  }
  var cachedChips = [];

  async function loadAll() {
    var allChips = [];

    for (var i = 0; i < MAIN_CATEGORIES.length; i++) {
      var mainCat = MAIN_CATEGORIES[i];
      var items = await fetchSubcategories(mainCat.key);
      items.forEach(function (item) {
        allChips.push({
          name: item.name || "",
          href: buildChipHref(mainCat, item),
        });
      });
    }

    cachedChips = allChips;
    if (allChips.length > 0) {
      renderChips(allChips);
    }
  }

  loadAll();

  document.addEventListener("aramabul:languagechange", function () {
    if (cachedChips.length > 0) {
      renderChips(cachedChips);
    }
  });
})();
