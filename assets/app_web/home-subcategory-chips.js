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

  function getSubcategoryImage(name, category) {
    var n = (name || "").toLowerCase();
    
    // Mapping keywords to image filenames under assets/
    if (n.indexOf("kafe") !== -1 || n.indexOf("cafe") !== -1) return "assets/kafe.png";
    if (n.indexOf("restoran") !== -1 || n.indexOf("lokanta") !== -1) return "assets/restoran.png";
    if (n.indexOf("kebap") !== -1 || n.indexOf("et") !== -1) return "assets/kebap-et.png";
    if (n.indexOf("döner") !== -1 || n.indexOf("doner") !== -1) return "assets/doner.png";
    if (n.indexOf("köfte") !== -1 || n.indexOf("kofte") !== -1) return "assets/kofte.png";
    if (n.indexOf("çorba") !== -1 || n.indexOf("corba") !== -1) return "assets/corba.png";
    if (n.indexOf("pide") !== -1) return "assets/pide.png";
    if (n.indexOf("lahmacun") !== -1) return "assets/lahmacun.png";
    if (n.indexOf("balık") !== -1 || n.indexOf("balik") !== -1) return "assets/balik.png";
    if (n.indexOf("çiğ köfte") !== -1 || n.indexOf("cigkofte") !== -1) return "assets/cigkofte.png";
    if (n.indexOf("burger") !== -1) return "assets/burger.png";
    if (n.indexOf("pizza") !== -1) return "assets/pizza.png";
    if (n.indexOf("tatlı") !== -1 || n.indexOf("pasta") !== -1 || n.indexOf("tatli") !== -1) return "assets/tatli-pasta.png";
    if (n.indexOf("kahvaltı") !== -1 || n.indexOf("kahvalti") !== -1) return "assets/kahvalti.jpeg";
    if (n.indexOf("börek") !== -1 || n.indexOf("borek") !== -1) return "assets/borek.png";
    if (n.indexOf("kokoreç") !== -1 || n.indexOf("kokorec") !== -1) return "assets/kokorec.png";
    if (n.indexOf("sushi") !== -1) return "assets/sushi.png";
    if (n.indexOf("meyhane") !== -1) return "assets/meyhane.png";
    if (n.indexOf("bar") !== -1 || n.indexOf("pub") !== -1) return "assets/bar.png";
    
    if (n.indexOf("otel") !== -1 || n.indexOf("pansiyon") !== -1 || n.indexOf("konaklama") !== -1) return "assets/otel.png";
    
    if (n.indexOf("kuaför") !== -1 || n.indexOf("berber") !== -1 || n.indexOf("kuafor") !== -1 || n.indexOf("güzellik") !== -1) return "assets/berber.webp";
    if (n.indexOf("veteriner") !== -1 || n.indexOf("vet") !== -1) return "assets/veteriner.webp";
    
    if (n.indexOf("eczane") !== -1) return "assets/eczane.webp";
    if (n.indexOf("hastane") !== -1 || n.indexOf("klinik") !== -1 || n.indexOf("sağlık") !== -1) return "assets/hasta.webp";
    if (n.indexOf("diş") !== -1 || n.indexOf("dis") !== -1) return "assets/dis.png";
    if (n.indexOf("akaryakıt") !== -1 || n.indexOf("pompa") !== -1 || n.indexOf("istasyon") !== -1) return "assets/pompa.webp";
    if (n.indexOf("atm") !== -1) return "assets/atm.png";
    if (n.indexOf("banka") !== -1) return "assets/banka.webp";
    if (n.indexOf("kargo") !== -1) return "assets/kargo.png";
    
    if (n.indexOf("müze") !== -1 || n.indexOf("muze") !== -1 || n.indexOf("saray") !== -1 || n.indexOf("tarih") !== -1) return "assets/kultur.webp";
    if (n.indexOf("tiyatro") !== -1 || n.indexOf("sinema") !== -1 || n.indexOf("sanat") !== -1 || n.indexOf("konser") !== -1) return "assets/sanat.png";
    
    // Category fallbacks
    if (category === "yeme-icme") return "assets/yemek.webp";
    if (category === "gezi") return "assets/gezi.webp";
    if (category === "hizmetler") return "assets/sac.webp";
    if (category === "saglik") return "assets/saglik.png";
    if (category === "kultur") return "assets/kultur.webp";
    if (category === "sanat") return "assets/sanat.png";
    
    return "assets/no-image-icon.webp";
  }

  function renderChips(allSubcategories) {
    container.innerHTML = "";
    var fragment = document.createDocumentFragment();
    // Do not use reorderForGrid because we want a single horizontally scrollable row
    var itemsToRender = allSubcategories;

    itemsToRender.forEach(function (entry) {
      var link = document.createElement("a");
      link.className = "home-subcategory-card";
      link.href = entry.href;
      if (entry.category) {
        link.dataset.category = entry.category;
      }

      // Add background image/thumbnail
      var img = document.createElement("img");
      img.src = getSubcategoryImage(entry.name, entry.category);
      img.alt = entry.name;
      img.loading = "lazy";
      link.appendChild(img);

      // Add text label
      var nameSpan = document.createElement("span");
      nameSpan.className = "home-subcategory-card-name";
      nameSpan.textContent = translateName(entry.name);
      link.appendChild(nameSpan);

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
          category: mainCat.key,
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
