/**
 * lezzet-duraklari-linker.js
 * Lezzet Durakları sayfasındaki mekan isimlerini veritabanıyla eşleştirip
 * tıklanabilir detay sayfası bağlantılarına dönüştürür.
 */
(function () {
  "use strict";

  const API_BASE =
    typeof window !== "undefined" && window.location.protocol === "file:"
      ? "https://aramabul.com"
      : "";

  /** Tüm mekan adlarını li elemanlarından çıkar */
  function extractVenueEntries() {
    const items = document.querySelectorAll(".content-guide li");
    const entries = [];

    items.forEach(function (li) {
      const strong = li.querySelector("strong");
      if (!strong) return;

      const district = strong.textContent.replace(/:$/, "").trim();
      // strong'dan sonraki metin kısmını al
      const fullText = li.textContent;
      const colonIndex = fullText.indexOf(":");
      if (colonIndex === -1) return;

      const venuesText = fullText.substring(colonIndex + 1).trim();
      // Virgülle ayır
      const names = venuesText.split(",").map(function (n) { return n.trim(); }).filter(Boolean);

      names.forEach(function (name) {
        entries.push({ name: name, district: district, li: li });
      });
    });

    return entries;
  }

  /** Tek bir mekanı API'de ara */
  async function searchVenue(name) {
    try {
      const url = API_BASE + "/api/venues/search?q=" + encodeURIComponent(name) + "&limit=5";
      const response = await fetch(url, { cache: "no-store" });
      if (!response.ok) return null;
      const data = await response.json();
      if (!Array.isArray(data) || data.length === 0) return null;

      // İsim eşleşmesini kontrol et (case-insensitive, Türkçe)
      const normalizedName = name.toLocaleLowerCase("tr").trim();
      for (var i = 0; i < data.length; i++) {
        var venue = data[i];
        var venueName = (venue.name || "").toLocaleLowerCase("tr").trim();
        // Tam eşleşme veya birisinin diğerini içermesi
        if (
          venueName === normalizedName ||
          venueName.includes(normalizedName) ||
          normalizedName.includes(venueName)
        ) {
          return venue;
        }
      }
      return null;
    } catch (e) {
      return null;
    }
  }

  /** Mekan için Google Maps URL'si oluştur */
  function buildDetailUrl(venue) {
    var rawMapsUrl = (venue.mapsUrl || "").trim();
    var isCoordsOnly = false;
    if (rawMapsUrl) {
      // 1) query= veya destination= enlem/boylam check
      var queryPart = rawMapsUrl.split("query=")[1] || rawMapsUrl.split("destination=")[1] || "";
      var decodedQuery = "";
      try {
        decodedQuery = decodeURIComponent(queryPart);
      } catch (e) {
        decodedQuery = queryPart;
      }
      isCoordsOnly = rawMapsUrl.includes("query=") && !/[a-zA-Z]/.test(decodedQuery.replace(/[NSEWnsew°'"\s,.\-+\d]/g, ""));
      
      // 2) /maps/place/ koordinat check (place name kısmı sadece koordinat ise)
      if (!isCoordsOnly) {
        var placeMatch = rawMapsUrl.match(/\/maps\/place\/([^/]+)/);
        if (placeMatch) {
          var decodedPlace = "";
          try {
            decodedPlace = decodeURIComponent(placeMatch[1]);
          } catch (e) {
            decodedPlace = placeMatch[1];
          }
          isCoordsOnly = !/[a-zA-Z]/.test(decodedPlace.replace(/[NSEWnsew°'"\s,.\-+\d]/g, ""));
        }
      }
      
      // 3) Genel adres çubuğu salt koordinat check (harf içermeyen URL)
      if (!isCoordsOnly && !/[a-zA-Z]/.test(rawMapsUrl.replace("https://", "").replace("http://", "").replace("www.google.com/maps", "").replace(/[NSEWnsew°'"\s,.\-+\d]/g, ""))) {
        isCoordsOnly = true;
      }
    }

    if (rawMapsUrl && !isCoordsOnly) {
      return rawMapsUrl;
    }
    var query = (venue.name || "") + " " + (venue.district || "") + " İstanbul";
    var placeId = venue.sourcePlaceId || venue.placeId || "";
    if (placeId) {
      return "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(query.trim()) + "&query_place_id=" + placeId;
    }
    return "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(query.trim());
  }

  /** li içindeki mekan adını link ile değiştir */
  function linkifyVenueInLi(li, venueName, detailUrl) {
    // li'nin innerHTML'inde mekan adını bul ve link yap
    var html = li.innerHTML;
    // Mekan adını güvenli regex'e çevir
    var escaped = venueName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    var regex = new RegExp("(>\\s*[^<]*?)(" + escaped + ")([^<]*)", "i");

    var newHtml = html.replace(regex, function (match, before, name, after) {
      return before + '<a href="' + detailUrl + '" class="lezzet-venue-link" target="_blank" rel="noopener">' + name + "</a>" + after;
    });

    if (newHtml !== html) {
      li.innerHTML = newHtml;
      return true;
    }

    // Fallback: düz metin arama
    var plainRegex = new RegExp("(" + escaped + ")", "i");
    newHtml = html.replace(plainRegex, '<a href="' + detailUrl + '" class="lezzet-venue-link" target="_blank" rel="noopener">$1</a>');
    if (newHtml !== html) {
      li.innerHTML = newHtml;
      return true;
    }
    return false;
  }

  /** Ana fonksiyon */
  async function init() {
    var entries = extractVenueEntries();
    if (entries.length === 0) return;

    // Batch olarak ara (fazla istek atmamak için sırayla, ama paralel gruplar halinde)
    var BATCH_SIZE = 5;
    var linked = 0;

    for (var i = 0; i < entries.length; i += BATCH_SIZE) {
      var batch = entries.slice(i, i + BATCH_SIZE);
      var results = await Promise.all(
        batch.map(function (entry) {
          return searchVenue(entry.name).then(function (venue) {
            return { entry: entry, venue: venue };
          });
        })
      );

      results.forEach(function (result) {
        if (result.venue) {
          var url = buildDetailUrl(result.venue);
          var success = linkifyVenueInLi(result.entry.li, result.entry.name, url);
          if (success) linked++;
        }
      });
    }

    if (linked > 0) {
      console.log("[lezzet-linker] " + linked + " mekan eşleştirildi ve bağlantı oluşturuldu.");
    }
  }

  // Sayfa yüklendikten sonra çalıştır
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
