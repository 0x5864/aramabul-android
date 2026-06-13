"use strict";
!(function() {
  const e = document.getElementById("resultsGrid");
  if (!e) return;
  (() => {
    const e2 = document.body;
    e2 && (e2.getAttribute("data-mvp-page") || "yeme-icme.html").trim();
  })();
  const t = (() => {
    const e2 = document.body;
    return e2 && (e2.getAttribute("data-mvp-main-category") || "yeme-icme").trim() || "yeme-icme";
  })(), n = (() => {
    const e2 = document.body;
    if (!e2) return "istanbulKesfetFavorites";
    const n2 = e2.getAttribute("data-mvp-favorites-key");
    return n2 && n2.trim() ? n2.trim() : "yeme-icme" === t ? "istanbulKesfetFavorites" : `mvpKesfet_${t.replace(/[^a-z0-9-]/gi, "_")}`;
  })(), r = (() => {
    const e2 = document.body;
    return e2 ? (e2.getAttribute("data-mvp-locked-category-slug") || "").trim() : "";
  })(), a = (() => {
    const e2 = document.body;
    return e2 ? (e2.getAttribute("data-mvp-locked-category-label") || "").trim() : "";
  })(), i = (() => {
    const e2 = document.body;
    return Boolean(e2 && "true" === e2.getAttribute("data-mvp-hizmet-category-picker"));
  })(), o = document.getElementById("mvpSubcategoryGrid"), s = Boolean(o), l = document.querySelector("[data-kesfet-category-switch]"), c = document.querySelector("[data-kesfet-category-trigger]"), d = document.querySelector("[data-kesfet-category-menu]"), u = document.querySelector("[data-kesfet-category-current]"), g = document.getElementById("districtOptions"), m = document.querySelector("[data-kesfet-district-switch]"), f = document.querySelector("[data-kesfet-district-trigger]"), y = document.querySelector("[data-kesfet-district-menu]"), b = document.querySelector("[data-kesfet-district-current]"), h = document.getElementById("neighborhoodOptions"), p = document.querySelector("[data-kesfet-neighborhood-switch]"), v = document.querySelector("[data-kesfet-neighborhood-trigger]"), k = document.querySelector("[data-kesfet-neighborhood-menu]"), S = document.querySelector("[data-kesfet-neighborhood-current]"), A = document.getElementById("kesfetBudgetOptions"), w = document.querySelector("[data-kesfet-budget-switch]"), E = document.querySelector("[data-kesfet-budget-trigger]"), L = document.querySelector("[data-kesfet-budget-menu]"), C = document.querySelector("[data-kesfet-budget-current]"), M = 180, B = "ontouchstart" in window || navigator.maxTouchPoints > 0 || window.matchMedia("(pointer: coarse)").matches, I = /* @__PURE__ */ new WeakMap(), x = /* @__PURE__ */ new WeakMap(), N = /* @__PURE__ */ new WeakMap(), T = /* @__PURE__ */ new WeakMap();
  function z(e2) {
    if (!e2) return;
    const t2 = I.get(e2);
    t2 && (window.clearTimeout(t2), I.delete(e2));
  }
  function P() {
    l && d && c && (z(l), d.hidden = true, c.setAttribute("aria-expanded", "false"), l.classList.remove("is-open"));
  }
  function D(e2) {
    if (!e2) return;
    const t2 = x.get(e2);
    t2 && (window.clearTimeout(t2), x.delete(e2));
  }
  function R() {
    m && y && f && (D(m), y.hidden = true, f.setAttribute("aria-expanded", "false"), m.classList.remove("is-open"));
  }
  function K() {
    m && y && f && (D(m), P(), $(), F(), y.hidden = false, f.setAttribute("aria-expanded", "true"), m.classList.add("is-open"));
  }
  function q() {
    l && d && c && (z(l), $(), F(), R(), d.hidden = false, c.setAttribute("aria-expanded", "true"), l.classList.add("is-open"));
  }
  function O(e2) {
    if (!e2) return;
    const t2 = N.get(e2);
    t2 && (window.clearTimeout(t2), N.delete(e2));
  }
  function $() {
    w && L && E && (O(w), L.hidden = true, E.setAttribute("aria-expanded", "false"), w.classList.remove("is-open"));
  }
  function U() {
    w && L && E && (O(w), P(), R(), F(), L.hidden = false, E.setAttribute("aria-expanded", "true"), w.classList.add("is-open"));
  }
  function j(e2) {
    if (!e2) return;
    const t2 = T.get(e2);
    t2 && (window.clearTimeout(t2), T.delete(e2));
  }
  function F() {
    p && k && v && (j(p), k.hidden = true, v.setAttribute("aria-expanded", "false"), p.classList.remove("is-open"));
  }
  function V() {
    p && k && v && (v.disabled || (j(p), P(), R(), $(), k.hidden = false, v.setAttribute("aria-expanded", "true"), p.classList.add("is-open")));
  }
  function H() {
    if (!S) return;
    if (!String(oe.selectedDistrict || "").trim()) return void (S.textContent = "\xD6nce il\xE7e se\xE7");
    const e2 = String(oe.selectedNeighborhood || "").trim();
    S.textContent = e2 || "T\xFCm mahalleler";
  }
  function W() {
    if (!h) return;
    const e2 = String(oe.selectedNeighborhood || "").trim();
    h.querySelectorAll(".istanbul-mvp-subcategory-box").forEach((t2) => {
      if (!t2.hasAttribute("data-neighborhood-value")) return;
      const n2 = t2.getAttribute("data-neighborhood-value"), r2 = e2 ? n2 === e2 : "" === (n2 || "");
      t2.classList.toggle("is-active", r2), t2.setAttribute("aria-checked", r2 ? "true" : "false");
    });
  }
  function _() {
    C && (String(oe.selectedBudget || "").trim() ? C.textContent = Be(oe.selectedBudget) : C.textContent = "T\xFCm b\xFCt\xE7eler");
  }
  function G() {
    if (!u) return;
    if (!s) return;
    if (String(oe.selectedSubcategoryId || "").trim()) {
      const e3 = oe.mvpSubcategoryEntries.find((e4) => String(e4.id) === String(oe.selectedSubcategoryId).trim());
      return void (u.textContent = e3 && e3.name ? e3.name : "T\xFCm kategoriler");
    }
    const e2 = Rt();
    u.textContent = e2 || "T\xFCm kategoriler";
  }
  function Y() {
    if (!b) return;
    const e2 = String(oe.selectedDistrict || "").trim();
    b.textContent = e2 || "T\xFCm il\xE7eler";
  }
  function J() {
    if (!g) return;
    const e2 = String(oe.selectedDistrict || "").trim();
    g.querySelectorAll(".istanbul-mvp-subcategory-box").forEach((t2) => {
      if (!t2.hasAttribute("data-district-value")) return;
      const n2 = t2.getAttribute("data-district-value"), r2 = e2 ? n2 === e2 : "" === (n2 || "");
      t2.classList.toggle("is-active", r2), t2.setAttribute("aria-checked", r2 ? "true" : "false");
    });
  }
  function Q() {
    if (Fe && (zt(Fe, oe.filters.districts || [], "T\xFCm il\xE7eler"), Fe.value = oe.selectedDistrict || ""), !g) return;
    const e2 = "T\xFCm il\xE7eler";
    g.innerHTML = "";
    const t2 = document.createElement("button");
    t2.type = "button", t2.className = "istanbul-mvp-subcategory-box", t2.setAttribute("data-district-value", ""), t2.setAttribute("role", "radio"), t2.setAttribute("aria-label", e2), t2.textContent = e2, g.appendChild(t2), (oe.filters.districts || []).forEach((e3) => {
      const t3 = document.createElement("button");
      t3.type = "button", t3.className = "istanbul-mvp-subcategory-box", t3.setAttribute("data-district-value", e3), t3.setAttribute("role", "radio"), t3.setAttribute("aria-label", e3), t3.textContent = e3, g.appendChild(t3);
    }), J(), Y();
  }
  let X = "kuafor";
  function Z(e2, n2 = {}) {
    const r2 = e2.toString(), a2 = Boolean(n2.nearby);
    if ("hizmetler" === t || "saglik" === t || "kultur" === t || "sanat" === t || "gezi" === t) {
      const e3 = a2 ? "/nearby" : "";
      return `/api/discovery/${encodeURIComponent(t)}/istanbul/venues${e3}?${r2}`;
    }
    return `/api/mvp/istanbul/venues${a2 ? "/nearby" : ""}?${r2}`;
  }
  function ee(e2, n2) {
    const r2 = String(e2 || "").trim();
    if (!r2) return "";
    const a2 = ke(r2), i2 = Array.isArray(n2) ? n2 : [], o2 = i2.find((e3) => ke(String(e3.slug || "")) === a2);
    if (o2 && null != o2.id && "" !== String(o2.id).trim()) return String(o2.id);
    const s2 = `${String(t).trim()}-${r2}`.toLowerCase(), l2 = i2.find((e3) => ke(String(e3.slug || "")) === ke(s2));
    if (l2 && null != l2.id && "" !== String(l2.id).trim()) return String(l2.id);
    const c2 = i2.find((e3) => {
      const t2 = ke(String(e3.slug || ""));
      return t2 === a2 || t2.endsWith(`-${a2}`) || t2.endsWith(a2);
    });
    if (c2 && null != c2.id && "" !== String(c2.id).trim()) return String(c2.id);
    if ("kuafor" === a2 || a2 === ke("kuaf\xF6r")) {
      const e3 = i2.find((e4) => /kuaf|kuafor|berber|kuaf/i.test(String(e4.name || "")));
      if (e3 && null != e3.id && "" !== String(e3.id).trim()) return String(e3.id);
    }
    if ("veteriner" === a2 || "vet" === a2) {
      const e3 = i2.find((e4) => /veteriner|vet|hayvan|klinik/i.test(String(e4.name || "")));
      if (e3 && null != e3.id && "" !== String(e3.id).trim()) return String(e3.id);
    }
    if ("akaryakit" === a2) {
      const e3 = i2.find((e4) => /akaryak|petrol|benzin|istasyon|fuel/i.test(String(e4.name || "")));
      if (e3 && null != e3.id && "" !== String(e3.id).trim()) return String(e3.id);
    }
    if ("berber" === a2) {
      const e3 = i2.find((e4) => /berber|barber/i.test(String(e4.name || "")));
      if (e3 && null != e3.id && "" !== String(e3.id).trim()) return String(e3.id);
    }
    return "";
  }
  function te() {
    if (!r) return;
    const e2 = Array.isArray(oe.filters.categoryOptions) ? oe.filters.categoryOptions : [], t2 = ee(r, e2);
    oe.selectedCategory = t2 || r;
  }
  function ne(e2) {
    const t2 = ke(String(e2 || "").trim());
    return "veteriner" === t2 || "vet" === t2 ? "veteriner" : "akaryakit" === t2 ? "akaryakit" : "berber" === t2 ? "berber" : "kuafor";
  }
  function re(e2) {
    const t2 = String(e2 || "kuafor").trim() || "kuafor";
    X = t2;
    const n2 = ee(t2, Array.isArray(oe.filters.categoryOptions) ? oe.filters.categoryOptions : []);
    oe.selectedCategory = n2 || t2;
  }
  function ae() {
    const e2 = document.getElementById("hizmetlerCategoryRow");
    if (!e2) return;
    const t2 = ke(X);
    e2.querySelectorAll("[data-hizmet-category-slug]").forEach((e3) => {
      const n3 = (e3.getAttribute("data-hizmet-category-slug") || "").trim(), r2 = t2 === ke(n3);
      e3.classList.toggle("is-active", r2), "tab" === e3.getAttribute("role") ? (e3.setAttribute("aria-selected", r2 ? "true" : "false"), e3.setAttribute("aria-pressed", r2 ? "true" : "false")) : e3.setAttribute("aria-checked", r2 ? "true" : "false");
    });
    const n2 = document.getElementById("hizmetBreadcrumbCurrent");
    if (n2) {
      const e3 = { kuafor: "Kuaf\xF6rler", veteriner: "Veterinerler", akaryakit: "Akaryak\u0131t", berber: "Berberler" };
      n2.textContent = e3[X] || "Hizmetler";
    }
  }
  let ie = false;
  const oe = { filters: { districts: [], neighborhoodsByDistrict: {}, categoryOptions: [], categories: [], tags: [], budgets: [] }, dataMode: "api", localData: [], localDataLoaded: false, localFavoritesKey: n, selectedDistrict: "", selectedNeighborhood: "", selectedCategory: "", selectedSubcategoryId: "", mvpSubcategoryEntries: [], selectedBudget: "", selectedTags: [], query: "", page: 1, limit: 24, nearbyMode: false, userLocation: null, loading: false, items: [], pagination: null, selectedVenueSlug: "", initialVenueSelectionHandled: false, favoriteVenueIds: /* @__PURE__ */ new Set(), discoveryShuffleFilterKey: "", discoveryRandomSeed: "", deepLinkedVenue: null };
  function se(e2) {
    for (let t2 = e2.length - 1; t2 > 0; t2 -= 1) {
      const n2 = Math.floor(Math.random() * (t2 + 1));
      [e2[t2], e2[n2]] = [e2[n2], e2[t2]];
    }
  }
  function le() {
    return !(oe.nearbyMode || oe.selectedDistrict || oe.selectedNeighborhood || oe.selectedBudget || oe.query.trim() || oe.selectedTags.length);
  }
  function ce() {
    oe.discoveryShuffleFilterKey = "", oe.discoveryRandomSeed = "";
  }
  const de = "bilinmiyor";
  function ue(e2) {
    const t2 = String(e2 || "").trim();
    return t2 ? ke(t2) === ke("Pasta-Tatl\u0131-Unlu mamuller") || ke(t2) === ke("Tatl\u0131-Pasta") ? "Tatl\u0131 & Pasta" : ke(t2) === ke("Kebap-Et") ? "Kebap & Et" : ke(t2) === ke("Asya Mutfa\u011F\u0131") ? "Asya" : t2 : "";
  }
  const ge = [{ slug: "restoran", name: "Restoran", sortOrder: 10 }, { slug: "kafe", name: "Kafe", sortOrder: 20 }, { slug: "kahvalti", name: "Kahvalt\u0131", sortOrder: 30 }, { slug: "bar", name: "Bar", sortOrder: 40 }, { slug: "tatli", name: "Tatl\u0131-Pasta", sortOrder: 50 }, { slug: "burger", name: "Burger", sortOrder: 60 }, { slug: "pizza", name: "Pizza", sortOrder: 70 }, { slug: "kokorec", name: "Kokore\xE7", sortOrder: 72 }, { slug: "kofte", name: "K\xF6fte", sortOrder: 74 }, { slug: "balik", name: "Bal\u0131k", sortOrder: 80 }, { slug: "kebap", name: "Kebap-Et", sortOrder: 90 }, { slug: "doner", name: "D\xF6ner", sortOrder: 100 }, { slug: "lahmacun", name: "Lahmacun", sortOrder: 105 }, { slug: "pide", name: "Pide", sortOrder: 106 }, { slug: "meyhane", name: "Meyhane", sortOrder: 108 }, { slug: "cigkofte", name: "\xC7i\u011F K\xF6fte", sortOrder: 109 }, { slug: "tantuni", name: "Tantuni", sortOrder: 110 }, { slug: "manti", name: "Mant\u0131", sortOrder: 111 }, { slug: "corba", name: "\xC7orba", sortOrder: 112 }, { slug: "borek", name: "B\xF6rek", sortOrder: 113 }, { slug: "sushi", name: "Sushi", sortOrder: 114 }, { slug: "asya-mutfagi", name: "Asya", sortOrder: 115 }, { slug: "vegan", name: "Vegan", sortOrder: 116 }], me = ["Restoran", "Kafe", "Kebap-Et", "Bal\u0131k", "Bar", "K\xF6fte", "D\xF6ner", "Lahmacun", "Kahvalt\u0131", "Pide", "Tatl\u0131-Pasta", "Burger", "Pizza", "Meyhane", "\xC7i\u011F K\xF6fte", "Kokore\xE7", "Tantuni", "Mant\u0131", "\xC7orba", "B\xF6rek", "Sushi", "Asya", "Vegan"], fe = [{ label: "Kafeler", file: "data/yeme-icme-kafe.json", category: "Kafe" }, { label: "Restoranlar", file: "data/yeme-icme-restoran.json", category: "Restoran" }, { label: "Kahvalt\u0131 Mekanlar\u0131", file: "data/yeme-icme-kahvalti.json", category: "Kahvalt\u0131" }, { label: "Kebap\xE7\u0131lar", file: "data/yeme-icme-kebap.json", category: "Kebap-Et" }, { label: "Pide ve Lahmacun", file: "data/yeme-icme-pide.json", category: "Pide & Lahmacun" }, { label: "D\xF6nerciler", file: "data/yeme-icme-doner.json", category: "D\xF6ner" }, { label: "\xC7i\u011F K\xF6fteciler", file: "data/yeme-icme-cigkofte.json", category: "\xC7i\u011F K\xF6fte" }, { label: "Meyhaneler", file: "data/yeme-icme-meyhane.json", category: "Meyhane" }, { label: "Lokantalar", file: "data/yeme-icme-lokantalar.json", category: "Lokanta" }, { label: "Pub & Bar", file: "data/yeme-icme-pub-bar.json", category: "Pub & Bar" }, { label: "Michelin Guide", file: "data/yeme-icme-michelin-guide.json", category: "Michelin Guide" }], ye = "\u0130stanbul", be = { current: null }, he = { current: null }, pe = /* @__PURE__ */ new Map(), ve = { trigger: null, menu: null };
  function ke(e2) {
    return e2 ? String(e2).trim().toLocaleLowerCase("tr-TR").normalize("NFKD").replace(/\p{Diacritic}/gu, "") : "";
  }
  async function reverseGeocodeDistrict(lat, lng) {
    function findDistrictMatch(name) {
      if (!name) return null;
      const cleanName = ke(name);
      const districts = oe.filters.districts || [];
      for (const d of districts) {
        const cleanD = ke(d);
        if (cleanD === cleanName || cleanName.includes(cleanD) || cleanD.includes(cleanName)) {
          return d;
        }
      }
      return null;
    }
    try {
      const response = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=tr`, {
        headers: { Accept: "application/json" }
      });
      if (response.ok) {
        const data = await response.json();
        if (data && data.localityInfo && Array.isArray(data.localityInfo.administrative)) {
          for (const admin of data.localityInfo.administrative) {
            const name = String(admin.name || "").replace(" İlçesi", "").trim();
            if (name) {
              const found = findDistrictMatch(name);
              if (found) return found;
            }
          }
        }
        const candidateFields = [data.locality, data.city, data.principalSubdivision];
        for (const field of candidateFields) {
          if (field) {
            const name = String(field).replace(" İlçesi", "").trim();
            const found = findDistrictMatch(name);
            if (found) return found;
          }
        }
      }
    } catch (e) {
      console.warn("BigDataCloud reverse geocode failed:", e);
    }
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&accept-language=tr`, {
        headers: {
          Accept: "application/json",
          "User-Agent": "AramaBul/1.0 (reverse-geocoding-district)"
        }
      });
      if (response.ok) {
        const data = await response.json();
        if (data && data.address) {
          const addr = data.address;
          const candidateFields = [
            addr.suburb,
            addr.town,
            addr.county,
            addr.city_district,
            addr.city,
            addr.municipality
          ];
          for (const field of candidateFields) {
            if (field) {
              const name = String(field).replace(" İlçesi", "").trim();
              const found = findDistrictMatch(name);
              if (found) return found;
            }
          }
        }
      }
    } catch (e) {
      console.warn("Nominatim reverse geocode failed:", e);
    }
    return null;
  }
  const Se = /* @__PURE__ */ new Set(["fastfood", "fast food", "fast-food", "hizligida", "hizli-gida", "hizli gida", "michelin-guide", "michelin guide"]);
  function Ae(e2) {
    if (!e2 || "object" != typeof e2) return false;
    const t2 = ke(String(e2.slug || "").trim()), n2 = ke(String(e2.name || "").trim());
    return !(!t2 || !Se.has(t2)) || !(!n2 || !Se.has(n2));
  }
  function we(e2) {
    const t2 = ke(String(e2 || "").trim());
    return Boolean(t2 && Se.has(t2));
  }
  function Ee(e2) {
    const t2 = String(e2 || "").trim();
    return t2 ? t2.replace(/\s+(mahallesi|mah\.?|mh\.?)$/i, "").trim() : "";
  }
  function Le(e2) {
    return ke(Ee(e2));
  }
  function Ce(e2) {
    return e2 ? ke(e2).replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "") : "";
  }
  function Me(e2, t2) {
    const n2 = Number(e2);
    if (!Number.isFinite(n2) || n2 <= 0) return "Puan yok";
    const r2 = Math.max(1, Math.min(5, Math.round(n2))), a2 = "\u2605".repeat(r2), i2 = n2.toFixed(1).replace(".", ","), o2 = Number(t2);
    return Number.isFinite(o2) && o2 > 0 ? `${a2} ${i2} Google Puan\u0131 (${new Intl.NumberFormat("tr-TR").format(o2)} yorum)` : `${a2} ${i2} Google Puan\u0131`;
  }
  function Be(e2) {
    const t2 = ke(e2);
    return t2 ? t2 === ke(de) ? "Bilinmiyor" : "budget" === t2 || "\u20BA" === t2 || "\u20BA\u20BA" === t2 ? "Uygun" : "mid" === t2 || "\u20BA\u20BA\u20BA" === t2 ? "Makul" : "high" === t2 || "\u20BA\u20BA\u20BA\u20BA" === t2 ? "Y\xFCksek" : String(e2) : "";
  }
  function Ie(e2) {
    const t2 = ke(String(e2 || ""));
    return "budget" === t2 || "\u20BA" === t2 || "\u20BA\u20BA" === t2 ? 1 : "mid" === t2 || "\u20BA\u20BA\u20BA" === t2 ? 2 : "high" === t2 || "\u20BA\u20BA\u20BA\u20BA" === t2 ? 3 : t2 === ke(de) ? 4 : 99;
  }
  function xe(e2, t2) {
    const n2 = e2.name || e2.title || e2.adi || "", r2 = e2.district || e2.ilce || "", a2 = e2.neighborhood || e2.mahalle || "", i2 = e2.address || e2.adres || "", o2 = e2.mapsUrl || e2.mapUrl || "", s2 = Ce([n2, r2, a2, t2.category].filter(Boolean).join(" ")) || Ce(n2), l2 = `${s2 || Ce(n2) || "venue"}-${t2.category}`;
    return { id: l2, slug: s2 || l2, name: n2, address: i2, district: r2, neighborhood: a2, cuisine: e2.cuisine || "", category: t2.category, sourceLabel: t2.label, source: e2.source || "", rating: e2.rating || e2.googleRating || "", budget: e2.budget || "", tags: Array.isArray(e2.tags) ? e2.tags : [], mapsUrl: o2, latitude: e2.latitude || e2.lat || null, longitude: e2.longitude || e2.lng || null, phone: e2.phone || "" };
  }
  async function Ne() {
    return oe.localDataLoaded ? oe.localData : (be.current || (be.current = (async () => {
      const e2 = [];
      for (const t3 of fe) try {
        const n2 = await fetch(t3.file, { headers: { Accept: "application/json" } });
        if (!n2.ok) continue;
        const r2 = await n2.json();
        (Array.isArray(r2) ? r2 : []).forEach((n3) => {
          var r3;
          n3 && (!n3.city || (r3 = n3.city) && "istanbul" === ke(r3)) && e2.push(xe(n3, t3));
        });
      } catch (e3) {
      }
      const t2 = /* @__PURE__ */ new Map();
      return e2.forEach((e3) => {
        const n2 = [ke(e3.name), ke(e3.district), ke(e3.address)].join("|");
        t2.has(n2) || t2.set(n2, e3);
      }), oe.localData = Array.from(t2.values()), oe.localDataLoaded = true, oe.localData;
    })()), be.current);
  }
  function Te(e2) {
    return e2.reduce((e3, t2) => (e3[ke(t2)] = t2, e3), {});
  }
  function ze(e2, t2) {
    if (!Array.isArray(t2) || !t2.length) return Array.isArray(e2) ? e2 : [];
    const n2 = Te(t2), r2 = /* @__PURE__ */ new Set();
    return Array.isArray(e2) && e2.length && e2.forEach((e3) => {
      const t3 = n2[ke(e3)];
      t3 && r2.add(t3);
    }), r2.size || t2.forEach((e3) => r2.add(e3)), Array.from(r2).sort((e3, t3) => e3.localeCompare(t3, "tr-TR"));
  }
  async function Pe(e2) {
    const n2 = String(e2 || "").trim();
    if (!n2) return [];
    const r2 = oe.filters.neighborhoodsByDistrict?.[n2];
    if (Array.isArray(r2) && r2.length) return r2;
    if ("local" === oe.dataMode) return Array.isArray(r2) ? r2 : [];
    const a2 = await (async function(e3) {
      const n3 = String(e3 || "").trim();
      if (!n3) return [];
      const r3 = /* @__PURE__ */ new Set();
      let a3 = 1, i2 = 1;
      for (; a3 <= i2; ) {
        const e4 = new URLSearchParams();
        e4.set("district", n3), e4.set("page", String(a3)), e4.set("limit", "50"), e4.set("mainCategoryKey", t);
        const o2 = await fetch(Z(e4), { headers: { Accept: "application/json" } });
        if (!o2.ok) throw new Error("Mahalle listesi al\u0131namad\u0131.");
        const s2 = await o2.json();
        (Array.isArray(s2.items) ? s2.items : []).forEach((e5) => {
          const t2 = Ee(e5?.neighborhood || "");
          t2 && r3.add(t2);
        }), i2 = Number(s2?.pagination?.totalPages || 1), a3 += 1;
      }
      return Array.from(r3).sort((e4, t2) => e4.localeCompare(t2, "tr-TR"));
    })(n2);
    return oe.filters.neighborhoodsByDistrict = { ...oe.filters.neighborhoodsByDistrict, [n2]: a2 }, a2;
  }
  function De() {
    return oe.userLocation ? [Number(oe.userLocation.lat || 0).toFixed(3), Number(oe.userLocation.lng || 0).toFixed(3), ke(oe.query), ke(oe.selectedDistrict), ke(oe.selectedNeighborhood), ke(oe.selectedCategory)].join("|") : "";
  }
  function Re(e2, t2) {
    if (!e2) return null;
    const n2 = Number(t2.latitude), r2 = Number(t2.longitude);
    if (!(t2.latitude && t2.longitude && Number.isFinite(n2) && Number.isFinite(r2))) return null;
    if (n2 < 35 || n2 > 43 || r2 < 25 || r2 > 45) return null;
    const a2 = (e3) => Number(e3) * Math.PI / 180, i2 = a2(e2.lat), o2 = a2(e2.lng), s2 = a2(n2), l2 = s2 - i2, c2 = a2(r2) - o2, d2 = Math.sin(l2 / 2) ** 2 + Math.cos(i2) * Math.cos(s2) * Math.sin(c2 / 2) ** 2, u2 = 2 * Math.atan2(Math.sqrt(d2), Math.sqrt(1 - d2)) * 6371e3;
    return u2 > 5e5 ? null : u2;
  }
  function Ke() {
    const e2 = new URLSearchParams(window.location.search).get("subcategoryId");
    if (null == e2 || "" === e2) return "";
    const t2 = Number.parseInt(String(e2), 10);
    return Number.isFinite(t2) ? String(t2) : "";
  }
  function qe() {
    const e2 = new URLSearchParams(window.location.search);
    return (e2.get("category") || e2.get("kategori") || e2.get("categoryName") || "").trim();
  }
  function Oe() {
    if (!o) return;
    const e2 = String(oe.selectedSubcategoryId || "").trim();
    o.querySelectorAll(".istanbul-mvp-subcategory-box").forEach((t2) => {
      const n2 = t2.getAttribute("data-subcategory-id"), r2 = null == n2 ? "" : String(n2).trim(), a2 = "" === r2 ? !e2 : Boolean(e2) && r2 === String(e2);
      t2.classList.toggle("is-active", a2);
    }), G();
  }
  function $e() {
    const e2 = document.getElementById("hizmetBreadcrumbCurrent");
    if (e2) {
      if (String(oe.selectedSubcategoryId || "").trim()) {
        const t2 = oe.mvpSubcategoryEntries.find((e3) => String(e3.id) === String(oe.selectedSubcategoryId).trim());
        return void (e2.textContent = t2 ? ue(t2.name) : "Hizmetler");
      }
      e2.textContent = "Hizmetler";
    }
  }
  function Ue(e2) {
    const t2 = new URL(window.location.href);
    e2 ? t2.searchParams.set("venue", e2) : t2.searchParams.delete("venue"), window.history.replaceState({}, "", t2.toString());
  }
  const je = document.getElementById("queryInput"), Fe = document.getElementById("districtSelect"), Ve = document.getElementById("neighborhoodSelect"), He = document.getElementById("categorySelect"), We = document.getElementById("categoryChipRow"), _e = document.getElementById("budgetChipRow"), Ge = document.getElementById("tagRow"), Ye = document.getElementById("resetFiltersButton"), Je = document.getElementById("nearbyButton"), Qe = document.getElementById("locationMessage"), Xe = document.getElementById("resultsTitle"), Ze = document.getElementById("resultsMeta"), et = document.getElementById("resultsState"), tt = document.getElementById("resultsLayout"), nt = document.getElementById("pagination"), rt = document.getElementById("activeFilterPills"), at = document.getElementById("istanbulVenueCardTemplate");
  at && (at.innerHTML = '\n      <article class="istanbul-venue-card" tabindex="0">\n        <div class="istanbul-venue-media">\n          <img class="istanbul-venue-image" src="" alt="" loading="lazy" />\n          <button class="istanbul-favorite-button" type="button" aria-label="Favorilere ekle"></button>\n        </div>\n        <div class="istanbul-venue-card-details">\n          <div class="istanbul-venue-card-head">\n            <p class="istanbul-venue-eyebrow" hidden></p>\n          </div>\n          <div class="istanbul-venue-title-row">\n            <h3 class="istanbul-venue-title">\n              <a class="istanbul-venue-title-link" href="#"></a>\n            </h3>\n            <span class="istanbul-venue-rating-badge"></span>\n          </div>\n          <div class="istanbul-venue-meta-row">\n            <span class="istanbul-venue-meta-icon"></span>\n            <span class="istanbul-venue-meta-text"></span>\n          </div>\n          <p class="istanbul-venue-address-text"></p>\n        </div>\n      </article>\n    ');
  const it = document.getElementById("mapPanelTitle"), ot = document.getElementById("mapPanelMeta"), st = document.getElementById("mapPanelFrame"), lt = document.getElementById("mapPanelAddress"), ct = document.getElementById("mapPanelRating"), dt = document.getElementById("mapPanelStatus"), ut = document.getElementById("mapPanelFavoriteButton"), gt = document.getElementById("mapPanelPhone"), mt = Boolean(it && ot && st && lt && ct && dt), ft = !mt;
  function yt() {
    if (!We) return;
    const e2 = String(oe.selectedCategory || "").trim();
    We.querySelectorAll(".istanbul-filter-chip").forEach((t2) => {
      t2.classList.remove("is-active");
      const n2 = "true" === t2.getAttribute("data-clear"), r2 = t2.getAttribute("data-category-id"), a2 = t2.getAttribute("data-category-value");
      let i2 = false;
      if (e2) if (n2) i2 = false;
      else {
        const t3 = null == r2 ? "" : String(r2).trim();
        if (t3) i2 = t3 === String(e2);
        else {
          const t4 = null == a2 ? "" : String(a2).trim();
          t4 && (i2 = ke(t4) === ke(String(e2)));
        }
      }
      else i2 = n2;
      i2 && t2.classList.add("is-active"), t2.setAttribute("aria-checked", i2 ? "true" : "false");
    });
  }
  function bt() {
    let e2 = (t2 = oe.filters.budgets, (Array.isArray(t2) ? t2 : []).map((e3) => String(e3 ?? "").trim()).filter(Boolean).sort((e3, t3) => {
      const n2 = Ie(e3) - Ie(t3);
      return 0 !== n2 ? n2 : e3.localeCompare(t3, "tr-TR");
    }));
    var t2;
    return e2.some((e3) => ke(String(e3)) === ke(de)) || (e2 = [...e2, de], e2.sort((e3, t3) => Ie(e3) - Ie(t3))), e2;
  }
  function ht() {
    if (_e) {
      const e2 = String(oe.selectedBudget || "").trim();
      return void _e.querySelectorAll(".istanbul-filter-chip").forEach((t2) => {
        t2.classList.remove("is-active");
        const n2 = "true" === t2.getAttribute("data-clear"), r2 = t2.getAttribute("data-budget-value");
        let a2 = false;
        e2 ? null !== r2 && String(r2) === e2 && (a2 = true) : a2 = n2, a2 && t2.classList.add("is-active"), t2.setAttribute("aria-checked", a2 ? "true" : "false");
      });
    }
    if (A) {
      const e2 = String(oe.selectedBudget || "").trim();
      A.querySelectorAll(".istanbul-mvp-subcategory-box").forEach((t2) => {
        if (!t2.hasAttribute("data-budget-value")) return;
        const n2 = t2.getAttribute("data-budget-value"), r2 = e2 ? n2 === e2 : "" === (n2 || "");
        t2.classList.toggle("is-active", r2), t2.setAttribute("aria-checked", r2 ? "true" : "false");
      }), _();
    }
  }
  function pt(e2, t2) {
    oe.loading = e2, et && (et.hidden = !t2, et.textContent = t2 || ""), Je && (Je.disabled = e2);
  }
  function vt() {
    if (!Je) return;
    const e2 = Boolean(oe.nearbyMode && oe.userLocation);
    Je.classList.toggle("is-active", e2), Je.setAttribute("aria-pressed", e2 ? "true" : "false"), Je.dataset.state = e2 ? "on" : "off";
  }
  function kt() {
    ve.trigger && ve.trigger.setAttribute("aria-expanded", "false"), ve.menu && (ve.menu.hidden = true), ve.trigger = null, ve.menu = null;
  }
  function St() {
    return oe.items.find((e2) => e2.slug === oe.selectedVenueSlug) || null;
  }
  function At() {
    oe.selectedVenueSlug && oe.deepLinkedVenue && oe.deepLinkedVenue.slug === oe.selectedVenueSlug && (oe.items.some((e2) => e2.slug === oe.selectedVenueSlug) || oe.items.unshift(oe.deepLinkedVenue));
  }
  function wt() {
    const e2 = St();
    if (e2) return Ue(e2.slug || ""), e2;
    if (!oe.items.length) return oe.selectedVenueSlug = "", Ue(""), null;
    if (!mt) return oe.selectedVenueSlug = "", Ue(""), null;
    oe.selectedVenueSlug = oe.items[0].slug || "";
    const t2 = St();
    return Ue(t2?.slug || ""), t2;
  }
  function Et(e2) {
    return oe.favoriteVenueIds.has(String(e2));
  }
  async function Lt() {
    if ("local" === oe.dataMode) return void (oe.favoriteVenueIds = (function() {
      try {
        const e3 = window.localStorage.getItem(oe.localFavoritesKey);
        if (!e3) return /* @__PURE__ */ new Set();
        const t3 = JSON.parse(e3);
        return Array.isArray(t3) ? new Set(t3.map((e4) => String(e4))) : /* @__PURE__ */ new Set();
      } catch (e3) {
        return /* @__PURE__ */ new Set();
      }
    })());
    const e2 = oe.items.map((e3) => Number(e3.id)).filter((e3) => Number.isFinite(e3) && e3 > 0);
    if (!e2.length) return void (oe.favoriteVenueIds = /* @__PURE__ */ new Set());
    const t2 = new URLSearchParams();
    t2.set("venueIds", e2.join(","));
    const n2 = await fetch(`/api/mvp/favorites/ids?${t2.toString()}`, { headers: { Accept: "application/json" } });
    if (!n2.ok) throw new Error("Favori durumlar\u0131 y\xFCklenemedi.");
    const r2 = await n2.json();
    oe.favoriteVenueIds = new Set(Array.isArray(r2.ids) ? r2.ids.map((e3) => String(e3)) : []);
  }
  async function Ct(e2) {
    if (!e2) return;
    if ("local" === oe.dataMode) {
      const t3 = String(e2);
      return Et(e2) ? (oe.favoriteVenueIds.delete(t3), It("Mekan favorilerden \xE7\u0131kar\u0131ld\u0131.", false)) : (oe.favoriteVenueIds.add(t3), It("Mekan favorilere kaydedildi.", false)), (function(e3) {
        try {
          const t4 = JSON.stringify(Array.from(e3));
          window.localStorage.setItem(oe.localFavoritesKey, t4);
        } catch (e4) {
        }
      })(oe.favoriteVenueIds), $t(), void Mt();
    }
    const t2 = Et(e2), n2 = `/api/mvp/favorites/${encodeURIComponent(e2)}`;
    if (!(await fetch(n2, { method: t2 ? "DELETE" : "POST", headers: { Accept: "application/json" } })).ok) throw new Error("Favori i\u015Flemi tamamlanamad\u0131.");
    t2 ? (oe.favoriteVenueIds.delete(String(e2)), It("Mekan favorilerden \xE7\u0131kar\u0131ld\u0131.", false)) : (oe.favoriteVenueIds.add(String(e2)), It("Mekan favorilere kaydedildi.", false)), $t(), Mt();
  }
  function Mt() {
    if (!mt) return void (tt && (tt.hidden = !oe.items.length));
    const e2 = wt();
    if (!e2) return void (tt && (tt.hidden = true));
    tt && (tt.hidden = false), it.textContent = e2.name || "\u0130simsiz mekan", ot.textContent = [e2.district, e2.neighborhood, e2.cuisine].filter(Boolean).join(" / ") || "\u0130stanbul", lt.textContent = e2.address || "Adres bilgisi bulunmuyor.", ct.textContent = Me(e2.rating, e2.userRatingCount), gt && (e2.phone ? (gt.innerHTML = `Tel: <a href="tel:${e2.phone}">${e2.phone}</a>`, gt.hidden = false) : gt.hidden = true);
    const n2 = (r2 = e2).temporarilyClosed ? "Ge\xE7ici olarak kapal\u0131" : true === r2.isOpenNow ? r2.openingStatusText || "\u015Eu an a\xE7\u0131k" : false === r2.isOpenNow ? r2.openingStatusText || "\u015Eu an kapal\u0131" : r2.openingStatusText || "";
    var r2;
    n2 ? (dt.textContent = n2, dt.style.display = "") : (dt.textContent = "", dt.style.display = "none"), st.src = (function(e3) {
      const t2 = (() => {
        try {
          if (!e3.mapsUrl) return "";
          const t3 = new URL(e3.mapsUrl), n4 = t3.searchParams.get("query") || t3.searchParams.get("q") || "";
          if (n4) return `https://maps.google.com/maps?hl=tr&q=${encodeURIComponent(n4)}&z=15&output=embed`;
          const r3 = t3.searchParams.get("cid") || "";
          return r3 ? `https://www.google.com/maps?cid=${encodeURIComponent(r3)}&hl=tr&output=embed` : "";
        } catch (e4) {
          return "";
        }
      })();
      if (t2) return t2;
      if (Number.isFinite(Number(e3.latitude)) && Number.isFinite(Number(e3.longitude))) {
        const t3 = Number(e3.latitude), n4 = Number(e3.longitude), r3 = e3.name || "Mekan";
        return `https://maps.google.com/maps?hl=tr&q=loc:${t3},${n4}(${encodeURIComponent(r3)})&z=15&output=embed`;
      }
      const n3 = e3.address || e3.name || "\u0130stanbul";
      return `https://maps.google.com/maps?hl=tr&q=${encodeURIComponent(n3)}&z=15&output=embed`;
    })(e2), (function(e3, t2) {
      if (!e3) return;
      const n3 = Et(t2);
      e3.textContent = n3 ? "Kaydedildi" : "Kaydet", e3.classList.toggle("is-active", n3), e3.setAttribute("aria-pressed", n3 ? "true" : "false");
    })(ut, e2.id);
    const a2 = it.closest(".map-panel-details");
    if (a2) {
      let n3 = document.getElementById("mapPanelAdminBox");
      ie ? (n3 || (n3 = document.createElement("a"), n3.id = "mapPanelAdminBox", n3.className = "map-panel-admin-box", n3.textContent = "x", n3.title = "Mekan\u0131 D\xFCzenle", n3.target = "_blank", a2.insertBefore(n3, a2.firstChild)), n3.href = (function(e3) {
        let n4 = "admin-venues.html";
        return "gezi" === t ? n4 = "admin-gezi.html" : "hizmetler" === t ? n4 = "admin-hizmetler.html" : "saglik" === t ? n4 = "admin-saglik.html" : "kultur" === t ? n4 = "admin-kultur.html" : "sanat" === t && (n4 = "admin-sanat.html"), `${n4}?venueId=${encodeURIComponent(e3)}`;
      })(e2.id), n3.style.display = "inline-flex", a2.classList.add("has-admin-box")) : (n3 && (n3.style.display = "none"), a2.classList.remove("has-admin-box"));
    }
    !(function(e3) {
      const t2 = document.querySelector(".map-panel-similar-grid"), n3 = document.querySelector(".map-panel-similar-section");
      if (!t2 || !n3) return;
      let r3 = oe.items.filter((t3) => t3.district === e3.district && t3.id !== e3.id);
      const a3 = (e4) => {
        if (!e4) return false;
        const t3 = e4.photoUri || e4.photoUrl || e4.imageUrl || e4.image;
        return "string" == typeof t3 && t3.trim().length > 0;
      };
      if (r3.sort((e4, t3) => {
        const n4 = a3(e4);
        return n4 !== a3(t3) ? n4 ? -1 : 1 : 0;
      }), r3 = r3.slice(0, 3), 0 === r3.length) return n3.style.display = "none", void (t2.innerHTML = "");
      n3.style.display = "block", t2.innerHTML = "", r3.forEach((e4) => {
        const n4 = document.createElement("div");
        n4.className = "similar-venue-card";
        const r4 = e4.photoUri || e4.photoUrl || e4.imageUrl || e4.image || "assets/no-image-icon.webp", a4 = document.createElement("img");
        a4.className = "similar-venue-photo", a4.src = r4, a4.alt = e4.name || "Mekan", a4.loading = "lazy";
        const i2 = document.createElement("div");
        i2.className = "similar-venue-details";
        const o2 = document.createElement("h5");
        o2.className = "similar-venue-name", o2.textContent = e4.name || "\u0130simsiz Mekan";
        const s2 = Me(e4.rating, e4.userRatingCount), l2 = document.createElement("span");
        l2.className = "similar-venue-rating", l2.textContent = s2, i2.appendChild(o2), i2.appendChild(l2), n4.appendChild(a4), n4.appendChild(i2), n4.addEventListener("click", () => {
          Bt(e4.slug);
        }), t2.appendChild(n4);
      });
    })(e2);
  }
  function Bt(e2) {
    e2 && (oe.selectedVenueSlug = e2, Ue(e2), $t(), Mt());
  }
  function It(e2, t2) {
    Qe && (Qe.textContent = e2, Qe.dataset.state = t2 ? "error" : "neutral");
  }
  function xt(e2) {
    if (!e2) return false;
    const t2 = String(e2).toLowerCase().trim();
    return ["kahvalt\u0131", "kahvalti", "restoran", "kafe", "cafe", "tatl\u0131", "tatli", "pasta", "kebap", "et", "d\xF6ner", "doner", "pizza", "sushi", "su\u015Fi", "bal\u0131k", "balik", "meyhane", "pide", "lahmacun", "mant\u0131", "manti", "burger", "\xE7orba", "corba", "tavuk", "b\xF6rek", "borek", "\xE7i\u011F k\xF6fte", "cig kofte", "k\xF6fte", "kofte", "yeme-i\xE7me", "yeme-icme"].some((e3) => t2.includes(e3));
  }
  function Nt() {
    if ((function() {
      const e3 = document.querySelector(".home-top-category-row"), t2 = document.querySelector(".province-head"), n3 = xt(Rt() || "") || xt(oe.selectedCategory) || xt(oe.query);
      e3 && (e3.style.display = n3 ? "none" : ""), t2 && (t2.style.display = n3 ? "none" : "");
    })(), !Xe) return;
    Xe.removeAttribute("data-i18n-key");
    const e2 = window.ARAMABUL_HEADER_I18N?.getStaticUiTranslation || ((e3) => e3);
    let n2 = oe.items.length;
    if (oe.pagination && null != oe.pagination.total && (n2 = oe.pagination.total), i) {
      const t2 = { kuafor: e2("Konumuna g\xF6re s\u0131ralanan kuaf\xF6rler"), veteriner: e2("Konumuna g\xF6re s\u0131ralanan veteriner klinikleri"), akaryakit: e2("Konumuna g\xF6re s\u0131ralanan akaryak\u0131t istasyonlar\u0131"), berber: e2("Konumuna g\xF6re s\u0131ralanan berberler") }, r2 = { kuafor: e2("\u0130stanbul'da ke\u015Ffedebilece\u011Fin kuaf\xF6rler"), veteriner: e2("\u0130stanbul'da ke\u015Ffedebilece\u011Fin veteriner klinikleri"), akaryakit: e2("\u0130stanbul'da ke\u015Ffedebilece\u011Fin akaryak\u0131t istasyonlar\u0131"), berber: e2("\u0130stanbul'da ke\u015Ffedebilece\u011Fin berberler") }, a3 = X;
      return oe.nearbyMode && oe.userLocation ? (Xe.textContent = `${t2[a3] || t2.kuafor} - ${n2} mekan listeleniyor`, void (Xe.style.fontWeight = "400")) : (Xe.textContent = `${r2[a3] || r2.kuafor} - ${n2} mekan listeleniyor`, void (Xe.style.fontWeight = "400"));
    }
    if (r && "kuafor" === ke(r)) return oe.nearbyMode && oe.userLocation ? (Xe.textContent = `${e2("Konumuna g\xF6re s\u0131ralanan kuaf\xF6rler")} - ${n2} mekan listeleniyor`, void (Xe.style.fontWeight = "400")) : (Xe.textContent = `${e2("\u0130stanbul'da ke\u015Ffedebilece\u011Fin kuaf\xF6rler")} - ${n2} mekan listeleniyor`, void (Xe.style.fontWeight = "400"));
    const a2 = "hizmetler" === t ? { nearby: e2("Konumuna g\xF6re s\u0131ralanan hizmet noktalar\u0131"), list: e2("\u0130stanbul'da ke\u015Ffedebilece\u011Fin hizmet noktalar\u0131") } : "saglik" === t ? { nearby: e2("Konumuna g\xF6re s\u0131ralanan sa\u011Fl\u0131k noktalar\u0131"), list: e2("\u0130stanbul'da ke\u015Ffedebilece\u011Fin sa\u011Fl\u0131k noktalar\u0131") } : "kultur" === t ? { nearby: e2("Konumuna g\xF6re s\u0131ralanan k\xFClt\xFCr noktalar\u0131"), list: e2("\u0130stanbul'da ke\u015Ffedebilece\u011Fin k\xFClt\xFCr noktalar\u0131") } : "sanat" === t ? { nearby: e2("Konumuna g\xF6re s\u0131ralanan sanat noktalar\u0131"), list: e2("\u0130stanbul'da ke\u015Ffedebilece\u011Fin sanat noktalar\u0131") } : "gezi" === t ? { nearby: e2("Konumuna g\xF6re s\u0131ralanan gezi noktalar\u0131"), list: e2("\u0130stanbul'da ke\u015Ffedebilece\u011Fin gezi yerleri") } : null;
    if (oe.nearbyMode && oe.userLocation) {
      let t2 = a2 ? a2.nearby : e2("Konumuna g\xF6re s\u0131ralanan \u0130stanbul mekanlar\u0131");
      const r2 = Rt() || "";
      if (r2) {
        const n3 = xt(r2);
        t2 = `${e2("Konumuna g\xF6re s\u0131ralanan")} ${r2}${n3 ? " mekanlar\u0131" : " Se\xE7enekleri"}`;
      }
      return Xe.textContent = `${t2} - ${n2} mekan listeleniyor`, void (Xe.style.fontWeight = "400");
    }
    let o2 = a2 ? a2.list : e2("\u0130stanbul'da ke\u015Ffedebilece\u011Fin yeme-i\xE7me mekanlar\u0131");
    const s2 = Rt() || "";
    s2 && (o2 = s2 + (xt(s2) ? " mekanlar\u0131" : " Se\xE7enekleri")), Xe.textContent = `${o2} - ${n2} mekan listeleniyor`, Xe.style.fontWeight = "400";
  }
  function Tt() {
    if (!rt) return;
    rt.innerHTML = "";
    const e2 = [];
    if (oe.selectedDistrict && e2.push({ label: `Konum: ${oe.selectedDistrict}`, type: "district" }), oe.selectedNeighborhood && e2.push({ label: `Mahalle: ${oe.selectedNeighborhood}`, type: "neighborhood" }), oe.selectedCategory || oe.selectedSubcategoryId) {
      const t2 = Rt();
      t2 && e2.push({ label: `Kategori: ${t2}`, type: "category" });
    }
    if (oe.selectedBudget && e2.push({ label: `B\xFCt\xE7e: ${Be(oe.selectedBudget)}`, type: "budget" }), oe.query) {
      let n3 = `Arama: ${oe.query}`;
      if ("hizmetler" === t) {
        const e3 = String(oe.query).trim().toLowerCase().replace(/ı/g, "i").replace(/ğ/g, "g").replace(/ü/g, "u").replace(/ş/g, "s").replace(/ö/g, "o").replace(/ç/g, "c");
        "berber" === e3 || "berberler" === e3 ? n3 = "Kategori: Berber" : "kuafor" === e3 || "kuaforler" === e3 || "kuaf\xF6r" === e3 || "kuaf\xF6rler" === e3 ? n3 = "Kategori: Kuaf\xF6r" : "veteriner" === e3 || "veterinerler" === e3 || "vet" === e3 ? n3 = "Kategori: Veteriner" : "akaryakit" !== e3 && "akaryakitler" !== e3 && "akaryak\u0131t" !== e3 && "akaryak\u0131tlar" !== e3 || (n3 = "Kategori: Akaryak\u0131t");
      }
      e2.push({ label: n3, type: "query" });
    }
    oe.selectedTags.forEach((t2) => {
      const n3 = oe.filters.tags.find((e3) => e3.key === t2);
      e2.push({ label: n3 ? n3.label : t2, type: "tag", value: t2 });
    });
    var n2 = oe.items.length;
    oe.pagination && null != oe.pagination.total && (n2 = oe.pagination.total), n2 > 0 && e2.unshift({ label: n2 + " mekan listeleniyor", type: "info" }), oe.nearbyMode && e2.push({ label: "Yak\u0131ndakiler", type: "nearby" }), 0 !== e2.length ? (rt.hidden = false, e2.forEach((e3) => {
      if ("info" === e3.type) {
        const t3 = document.createElement("span");
        return t3.className = "istanbul-active-pill istanbul-active-pill--info", t3.textContent = e3.label, void rt.appendChild(t3);
      }
      const t2 = document.createElement("button");
      t2.type = "button", t2.className = "istanbul-active-pill istanbul-active-pill--dismissible", t2.setAttribute("aria-label", `${e3.label} filtresini kald\u0131r`), t2.textContent = e3.label + " \xD7", t2.addEventListener("click", () => {
        !(function(e4) {
          switch (e4.type) {
            case "district":
              oe.selectedDistrict = "", oe.selectedNeighborhood = "", Dt();
              break;
            case "neighborhood":
              oe.selectedNeighborhood = "", Dt();
              break;
            case "category":
              oe.selectedCategory = "", oe.selectedSubcategoryId && (oe.selectedSubcategoryId = "");
              break;
            case "budget":
              oe.selectedBudget = "";
              break;
            case "query":
              oe.query = "", je && (je.value = "");
              break;
            case "tag":
              oe.selectedTags = oe.selectedTags.filter((t3) => t3 !== e4.value);
              break;
            case "nearby":
              oe.nearbyMode = false, oe.userLocation = null, vt();
              break;
            default:
              return;
          }
          oe.page = 1, Tt(), jt();
        })(e3);
      }), rt.appendChild(t2);
    })) : rt.hidden = true;
  }
  function zt(e2, t2, n2) {
    if (!e2) return;
    e2.innerHTML = "";
    const r2 = document.createElement("option");
    r2.value = "", r2.textContent = n2, e2.appendChild(r2), t2.forEach((t3) => {
      const n3 = document.createElement("option");
      n3.value = t3, n3.textContent = t3, e2.appendChild(n3);
    });
  }
  function Pt() {
    if (s) return void (We && (We.innerHTML = ""));
    if (We) {
      We.innerHTML = "";
      const e3 = document.createElement("button");
      e3.type = "button", e3.className = "istanbul-filter-chip", e3.setAttribute("data-clear", "true"), e3.setAttribute("role", "radio"), e3.setAttribute("aria-label", "T\xFCm kategoriler"), e3.textContent = "T\xFCm kategoriler", We.appendChild(e3);
      const t3 = Array.isArray(oe.filters.categoryOptions) ? oe.filters.categoryOptions : [];
      return t3.length ? [...t3].sort((e4, t4) => String(e4.name || "").localeCompare(String(t4.name || ""), "tr-TR")).forEach((e4) => {
        const t4 = document.createElement("button");
        t4.type = "button", t4.className = "istanbul-filter-chip", null != e4.id && "" !== String(e4.id).trim() ? t4.setAttribute("data-category-id", String(e4.id)) : t4.setAttribute("data-category-value", String(e4.name || "").trim() || String(e4.slug || "")), t4.setAttribute("role", "radio");
        const n2 = ue(e4.name);
        t4.setAttribute("aria-label", `Kategori: ${n2}`), t4.textContent = n2, We.appendChild(t4);
      }) : [...oe.filters.categories || []].sort((e4, t4) => String(e4).localeCompare(String(t4), "tr-TR")).forEach((e4) => {
        const t4 = document.createElement("button");
        t4.type = "button", t4.className = "istanbul-filter-chip", t4.setAttribute("data-category-value", String(e4)), t4.setAttribute("role", "radio");
        const n2 = ue(e4);
        t4.setAttribute("aria-label", `Kategori: ${n2}`), t4.textContent = n2, We.appendChild(t4);
      }), void yt();
    }
    if (!He) return;
    const e2 = Array.isArray(oe.filters.categoryOptions) ? oe.filters.categoryOptions : [];
    if (!e2.length) {
      const e3 = [...oe.filters.categories || []].sort((e4, t3) => String(e4).localeCompare(String(t3), "tr-TR"));
      return void zt(He, e3, "T\xFCm kategoriler");
    }
    He.innerHTML = "";
    const t2 = document.createElement("option");
    t2.value = "", t2.textContent = "T\xFCm kategoriler", He.appendChild(t2), [...e2].sort((e3, t3) => String(e3.name || "").localeCompare(String(t3.name || ""), "tr-TR")).forEach((e3) => {
      const t3 = document.createElement("option");
      t3.value = String(e3.id), t3.textContent = e3.name, He.appendChild(t3);
    });
  }
  function Dt() {
    const e2 = oe.selectedDistrict, t2 = e2 && oe.filters.neighborhoodsByDistrict && oe.filters.neighborhoodsByDistrict[e2] || [];
    if (Fe && (Fe.value = e2 || ""), h && v) {
      h.innerHTML = "";
      const n2 = e2 ? "T\xFCm mahalleler" : "\xD6nce il\xE7e se\xE7", r2 = document.createElement("button");
      return r2.type = "button", r2.className = "istanbul-mvp-subcategory-box", r2.setAttribute("data-neighborhood-value", ""), r2.setAttribute("role", "radio"), r2.setAttribute("aria-label", n2), r2.textContent = n2, h.appendChild(r2), e2 && t2.forEach((e3) => {
        const t3 = document.createElement("button");
        t3.type = "button", t3.className = "istanbul-mvp-subcategory-box", t3.setAttribute("data-neighborhood-value", e3), t3.setAttribute("role", "radio"), t3.setAttribute("aria-label", e3), t3.textContent = e3, h.appendChild(t3);
      }), v.disabled = !e2, e2 && oe.selectedNeighborhood && t2.includes(oe.selectedNeighborhood) ? (W(), void H()) : (oe.selectedNeighborhood = "", W(), void H());
    }
    Ve && (zt(Ve, t2, e2 ? "T\xFCm mahalleler" : "\xD6nce il\xE7e se\xE7"), Ve.disabled = !e2, e2 && oe.selectedNeighborhood && t2.includes(oe.selectedNeighborhood) ? Ve.value = oe.selectedNeighborhood : (oe.selectedNeighborhood = "", Ve.value = ""));
  }
  function Rt() {
    if (oe.selectedSubcategoryId) {
      const e3 = oe.mvpSubcategoryEntries.find((e4) => String(e4.id) === String(oe.selectedSubcategoryId));
      return e3 ? ue(e3.name) : "";
    }
    if (!oe.selectedCategory) return "";
    if (i) return { kuafor: "Kuaf\xF6rler", veteriner: "Veterinerler", akaryakit: "Akaryak\u0131t" }[X] || "Hizmetler";
    if (r && a) return a;
    const e2 = Array.isArray(oe.filters.categoryOptions) ? oe.filters.categoryOptions : [];
    if (!e2.length) return ue(oe.selectedCategory);
    const t2 = String(oe.selectedCategory).trim(), n2 = e2.find((e3) => String(e3.id) === t2);
    if (n2) return ue(n2.name);
    const o2 = e2.find((e3) => ke(String(e3.name || "")) === ke(t2));
    return ue(o2 ? o2.name : oe.selectedCategory);
  }
  function Kt() {
    Ge && (Ge.innerHTML = "", oe.filters.tags.forEach((e2) => {
      const t2 = document.createElement("button");
      t2.type = "button", t2.className = "istanbul-tag-button", t2.dataset.tag = e2.key, t2.textContent = e2.label, oe.selectedTags.includes(e2.key) && t2.classList.add("is-active"), t2.addEventListener("click", () => {
        oe.selectedTags.includes(e2.key) ? oe.selectedTags = oe.selectedTags.filter((t3) => t3 !== e2.key) : oe.selectedTags = [...oe.selectedTags, e2.key], oe.page = 1, Kt(), Tt(), jt();
      }), Ge.appendChild(t2);
    }));
  }
  function qt() {
    if (_e) {
      _e.innerHTML = "";
      const e2 = document.createElement("button");
      return e2.type = "button", e2.className = "istanbul-filter-chip", e2.setAttribute("data-clear", "true"), e2.setAttribute("role", "radio"), e2.setAttribute("aria-label", "T\xFCm b\xFCt\xE7eler"), e2.textContent = "T\xFCm\xFC", _e.appendChild(e2), bt().forEach((e3) => {
        const t2 = String(e3 ?? "").trim();
        if (!t2) return;
        const n2 = document.createElement("button");
        n2.type = "button", n2.className = "istanbul-filter-chip", n2.setAttribute("data-budget-value", t2), n2.setAttribute("role", "radio"), n2.setAttribute("aria-label", `B\xFCt\xE7e: ${Be(t2)}`), n2.textContent = Be(t2), _e.appendChild(n2);
      }), void ht();
    }
    if (A) {
      A.innerHTML = "";
      const e2 = document.createElement("button");
      e2.type = "button", e2.className = "istanbul-mvp-subcategory-box", e2.setAttribute("data-budget-value", ""), e2.setAttribute("role", "radio"), e2.setAttribute("aria-label", "T\xFCm b\xFCt\xE7eler"), e2.textContent = "T\xFCm b\xFCt\xE7eler", A.appendChild(e2), bt().forEach((e3) => {
        const t2 = String(e3 ?? "").trim();
        if (!t2) return;
        const n2 = document.createElement("button");
        n2.type = "button", n2.className = "istanbul-mvp-subcategory-box", n2.setAttribute("data-budget-value", t2), n2.setAttribute("role", "radio"), n2.setAttribute("aria-label", `B\xFCt\xE7e: ${Be(t2)}`), n2.textContent = Be(t2), A.appendChild(n2);
      }), ht();
    }
  }
  function Ot() {
    if (!nt) return;
    nt.innerHTML = "";
    const e2 = oe.pagination;
    if (!e2 || !e2.totalPages || e2.totalPages <= 1) return void (nt.hidden = true);
    nt.hidden = false;
    const t2 = document.createElement("button");
    t2.type = "button", t2.className = "istanbul-pagination-button", t2.textContent = "<", t2.disabled = e2.page <= 1, t2.addEventListener("click", () => {
      oe.page <= 1 || (oe.page -= 1, jt());
    }), nt.appendChild(t2);
    const n2 = document.createElement("span");
    n2.className = "istanbul-pagination-current", n2.textContent = `${e2.page} / ${e2.totalPages}`, nt.appendChild(n2);
    const r2 = document.createElement("button");
    r2.type = "button", r2.className = "istanbul-pagination-button", r2.textContent = ">", r2.disabled = e2.page >= e2.totalPages, r2.addEventListener("click", () => {
      oe.page >= e2.totalPages || (oe.page += 1, jt());
    }), nt.appendChild(r2);
  }
  function $t() {
    if (e.innerHTML = "", !oe.items.length) return e.hidden = true, tt && (tt.hidden = true), et.hidden = false, et.textContent = (window.ARAMABUL_HEADER_I18N?.getStaticUiTranslation || ((e2) => e2))("Bu filtrelerle mekan bulunamad\u0131."), void Ot();
    const t2 = (e2) => {
      if (!e2) return false;
      const t3 = e2.photoUri || e2.photoUrl || e2.imageUrl || e2.image || e2.coverImageUrl;
      if ("string" != typeof t3) return false;
      const n2 = t3.trim().toLowerCase();
      return !(!n2 || n2.includes("al8-snh-") || n2.includes("al8-snhylsmxv7pa75n") || n2.includes("staticmap") || n2.includes("maps.google") || n2.includes("assets/") || n2.includes("static-maps.yandex") || n2.includes("s100x100") || "null" === n2 || "undefined" === n2 || "none" === n2 || "placeholder" === n2 || "empty" === n2 || "false" === n2 || n2.includes("no-image") || n2.includes("noimage") || n2.includes("no_image") || n2.includes("no-photo") || n2.includes("nophoto") || n2.includes("placeholder") || n2.includes("upload-img") || n2.includes("upload_img") || n2.includes("<img") || n2.includes("default-") || n2.includes("default_") || n2.includes("/default.") || n2.includes("/defaultog") || n2.includes("og-image") || n2.includes("social-image") || n2.includes("stock/") || !(n2.startsWith("http://") || n2.startsWith("https://") || n2.startsWith("/")));
    };
    oe.items.sort((e2, n2) => {
      const r2 = t2(e2);
      return r2 !== t2(n2) ? r2 ? -1 : 1 : 0;
    }), mt ? wt() : oe.selectedVenueSlug = "", e.hidden = false, et.hidden = true, oe.items.forEach((t3) => {
      const n2 = at.content.cloneNode(true), r2 = n2.querySelector(".istanbul-venue-card"), a2 = n2.querySelector(".istanbul-venue-media"), i2 = n2.querySelector(".istanbul-venue-image"), o2 = n2.querySelector(".istanbul-venue-title-link"), s2 = n2.querySelector(".istanbul-venue-rating-badge"), l2 = n2.querySelector(".istanbul-venue-meta-text"), c2 = n2.querySelector(".istanbul-venue-address-text"), d2 = n2.querySelector(".istanbul-favorite-button"), u2 = n2.querySelector(".istanbul-venue-eyebrow");
      if (u2) {
        const e2 = (function(e3) {
          const t4 = String(e3 || "").trim();
          if (!t4) return "";
          const n3 = ke(t4).replace(/ı/g, "i").replace(/ğ/g, "g").replace(/ü/g, "u").replace(/ş/g, "s").replace(/ö/g, "o").replace(/ç/g, "c").replace(/\s+/g, " ");
          return "kuafor" === n3 ? "Kuaf\xF6r" : "berber" === n3 ? "Berber" : "veteriner" === n3 || "vet" === n3 ? "Veteriner" : "akaryakit" === n3 ? "Akaryak\u0131t" : "eczane" === n3 ? "Eczane" : "nobetci eczane" === n3 ? "N\xF6bet\xE7i Eczane" : "hastane" === n3 ? "Hastane" : "aile sagligi merkezi" === n3 ? "Aile Sa\u011Fl\u0131\u011F\u0131 Merkezi" : "guzellik salonu" === n3 || "guzellik" === n3 ? "G\xFCzellik Salonu" : "kafe" === n3 || "cafe" === n3 ? "Kafe" : "restoran" === n3 ? "Restoran" : "kahvalti" === n3 ? "Kahvalt\u0131" : "kebap" === n3 || "kebap-et" === n3 || "kebap_et" === n3 || "kebap et" === n3 ? "Kebap & Et" : "doner" === n3 ? "D\xF6ner" : "kofte" === n3 ? "K\xF6fte" : "balik" === n3 ? "Bal\u0131k" : "meyhane" === n3 ? "Meyhane" : "cigkofte" === n3 || "cig kofte" === n3 ? "\xC7i\u011F K\xF6fte" : "manti" === n3 ? "Mant\u0131" : "corba" === n3 ? "\xC7orba" : "borek" === n3 ? "B\xF6rek" : "sushi" === n3 || "susi" === n3 ? "Sushi" : "vegan" === n3 ? "Vegan" : "pasta-tatli-unlu-mamuller" === n3 || "tatli-pasta" === n3 || "tatli" === n3 || "pasta tatli unlu mamuller" === n3 || "tatli pasta" === n3 ? "Tatl\u0131 & Pasta" : "asya-mutfagi" === n3 || "asya" === n3 || "asya mutfagi" === n3 ? "Asya" : "otel" === n3 ? "Otel" : "pansiyon" === n3 ? "Pansiyon" : "camping" === n3 || "kamp alanlari" === n3 || "kamp alani" === n3 ? "Camp Alan\u0131" : "plaj" === n3 ? "Plaj" : "yat limani" === n3 ? "Yat Liman\u0131" : "butik oteller" === n3 || "butik otel" === n3 ? "Butik Otel" : "5 yildizli oteller" === n3 || "5 yildizli otel" === n3 ? "5 Y\u0131ld\u0131zl\u0131 Otel" : "4 yildizli oteller" === n3 || "4 yildizli otel" === n3 ? "4 Y\u0131ld\u0131zl\u0131 Otel" : "3 yildizli oteller" === n3 || "3 yildizli otel" === n3 ? "3 Y\u0131ld\u0131zl\u0131 Otel" : "2 yildizli oteller" === n3 || "2 yildizli otel" === n3 ? "2 Y\u0131ld\u0131zl\u0131 Otel" : "1 yildizli oteller" === n3 || "1 yildizli otel" === n3 ? "1 Y\u0131ld\u0131zl\u0131 Otel" : "muze" === n3 || "muzeler" === n3 ? "M\xFCze" : "tarihi camiler" === n3 || "tarihi cami" === n3 || "cami" === n3 ? "Cami" : "opera ve bale" === n3 || "opera" === n3 || "bale" === n3 ? "Opera ve Bale" : "devlet tiyatrolari" === n3 || "devlet tiyatrosu" === n3 ? "Devlet Tiyatrosu" : "sehir tiyatrolari" === n3 || "sehir tiyatrosu" === n3 ? "\u015Eehir Tiyatrosu" : "galeriler" === n3 || "galeri" === n3 ? "Galeri" : "ozel tiyatrolar" === n3 || "ozel tiyatro" === n3 ? "\xD6zel Tiyatro" : "sarj istasyonu" === n3 || "sarj" === n3 ? "\u015Earj \u0130stasyonu" : "otopark" === n3 ? "Otopark" : "kargo" === n3 ? "Kargo" : "oren yeri" === n3 || "oren yerleri" === n3 ? "\xD6ren Yeri" : "magara" === n3 || "magaralar" === n3 ? "Ma\u011Fara" : "selale" === n3 || "selaleler" === n3 ? "\u015Eelale" : t4.charAt(0).toLocaleUpperCase("tr-TR") + t4.slice(1);
        })(t3.cuisine || t3.categoryName || t3.category || "");
        u2.textContent = e2, u2.hidden = !e2;
      }
      if (r2) {
        r2.venue = t3;
        const e2 = t3.slug && t3.slug === oe.selectedVenueSlug;
        r2.classList.toggle("is-selected", e2);
      }
      if (i2 && a2) {
        const e2 = "string" == typeof t3.photoUri ? t3.photoUri.trim() : "";
        e2 ? (i2.src = e2, i2.alt = t3.name || "Mekan") : (i2.src = "assets/no-image-icon.webp", i2.alt = t3.name || "Mekan");
      }
      if (o2 && (o2.textContent = t3.name || "\u0130simsiz mekan", o2.href = "#", o2.addEventListener("click", (e2) => {
        e2.preventDefault(), window.innerWidth < 992 || ft ? window.openVenueInMaps(t3) : Bt(t3.slug);
      })), s2) {
        const e2 = Number(t3.rating || 0);
        s2.textContent = e2 > 0 ? e2.toFixed(1) : "\u2014";
      }
      if (l2) {
        const e2 = String(t3.district || "").trim(), n3 = [];
        e2 && n3.push(e2);
        const r3 = null != t3.distanceMeters && "" !== t3.distanceMeters ? Number(t3.distanceMeters) : NaN, a3 = (g2 = Number.isFinite(r3) ? r3 : Re(oe.userLocation, t3), Number.isFinite(g2) ? g2 < 1e3 ? `${Math.round(g2)} m` : `${(g2 / 1e3).toFixed(1).replace(".", ",")} km` : "");
        a3 && n3.push(a3), l2.textContent = n3.join(" \u2022 ");
      }
      var g2;
      if (c2 && (c2.style.display = "none"), d2) {
        const e2 = () => {
          const e3 = Et(t3.id);
          d2.classList.toggle("is-active", e3), d2.setAttribute("aria-pressed", e3 ? "true" : "false");
        };
        e2(), d2.addEventListener("click", async (n3) => {
          n3.preventDefault(), n3.stopPropagation();
          try {
            d2.disabled = true, await Ct(t3.id), e2();
          } catch (e3) {
            console.error(e3);
          } finally {
            d2.disabled = false;
          }
        });
      }
      r2.addEventListener("click", (e2) => {
        e2.target.closest("a, button") || (window.innerWidth < 992 || ft ? window.openVenueInMaps(t3) : Bt(t3.slug));
      }), r2.addEventListener("keydown", (e2) => {
        if ("Enter" === e2.key || " " === e2.key) {
          if (e2.preventDefault(), window.innerWidth < 992) return void window.openVenueInMaps(t3);
          if (ft) return void window.openVenueInMaps(t3);
          Bt(t3.slug);
        }
      }), e.appendChild(n2);
    }), Mt(), Ot();
  }
  function Ut(e2) {
    Nt(), Tt(), Ze && (Ze.style.display = "none");
  }
  async function jt() {
    pt(true, "Mekanlar getiriliyor.");
    try {
      if ("local" === oe.dataMode) {
        const e3 = (await Ne()).filter((e4) => {
          if (oe.selectedDistrict && ke(e4.district) !== ke(oe.selectedDistrict)) return false;
          if (oe.selectedNeighborhood && Le(e4.neighborhood) !== Le(oe.selectedNeighborhood)) return false;
          if (oe.selectedCategory) {
            const t2 = ke(Rt() || oe.selectedCategory), n4 = ke(e4.category || ""), r4 = ke(e4.cuisine || "");
            if (n4 !== t2 && r4 !== t2) return false;
          }
          if (oe.selectedBudget) {
            const t2 = ke(oe.selectedBudget), n4 = ke(de), r4 = String(e4.budget || "").trim();
            if (t2 === n4) {
              if (r4) return false;
            } else if (ke(r4) !== t2) return false;
          }
          return !(oe.query && !(function(e5, t2) {
            const n4 = ke(e5);
            return !n4 || [t2.name, t2.address, t2.district, t2.neighborhood, t2.cuisine].filter(Boolean).map((e6) => ke(e6)).join(" ").includes(n4);
          })(oe.query, e4));
        });
        if (oe.nearbyMode && oe.userLocation) {
          const e4 = (function() {
            const e5 = De();
            if (!e5) return null;
            const t2 = pe.get(e5);
            return t2 ? Date.now() - t2.timestamp > 12e4 ? (pe.delete(e5), null) : t2 : null;
          })();
          if (e4) return oe.items = e4.items, oe.pagination = e4.pagination, At(), await Lt(), Ut((oe.pagination, e4.total)), void $t();
        }
        const n3 = oe.nearbyMode && oe.userLocation ? oe.localDataLoaded ? oe.localData.filter((e4) => Number.isFinite(Number(e4.latitude)) && Number.isFinite(Number(e4.longitude))) : [] : e3, r3 = oe.nearbyMode && oe.userLocation ? (function(e4) {
          const t2 = Number(e4.lat), n4 = Number(e4.lng), r4 = 8e3 / 111320, a3 = 8e3 / (111320 * Math.cos(t2 * Math.PI / 180));
          return { minLat: t2 - r4, maxLat: t2 + r4, minLng: n4 - a3, maxLng: n4 + a3 };
        })(oe.userLocation) : null, a2 = (r3 ? n3.filter((e4) => (function(e5, t2) {
          const n4 = Number(e5.latitude), r4 = Number(e5.longitude);
          return !(!Number.isFinite(n4) || !Number.isFinite(r4)) && n4 >= t2.minLat && n4 <= t2.maxLat && r4 >= t2.minLng && r4 <= t2.maxLng;
        })(e4, r3)) : n3).map((e4) => {
          const t2 = Re(oe.userLocation, e4);
          return { ...e4, distanceMeters: t2 };
        }), i2 = oe.nearbyMode && oe.userLocation ? a2.filter((e4) => Number.isFinite(e4.distanceMeters) && e4.distanceMeters <= 8e3) : a2, o2 = (e4) => {
          if (!e4) return false;
          const t2 = e4.photoUri || e4.photoUrl || e4.imageUrl || e4.image || e4.coverImageUrl;
          if ("string" != typeof t2) return false;
          const n4 = t2.trim().toLowerCase();
          return !(!n4 || n4.includes("al8-snh-") || n4.includes("al8-snhylsmxv7pa75n") || n4.includes("staticmap") || n4.includes("maps.google") || n4.includes("assets/") || n4.includes("static-maps.yandex") || n4.includes("s100x100") || "null" === n4 || "undefined" === n4 || "none" === n4 || "placeholder" === n4 || "empty" === n4 || "false" === n4 || n4.includes("no-image") || n4.includes("noimage") || n4.includes("no_image") || n4.includes("no-photo") || n4.includes("nophoto") || n4.includes("placeholder") || n4.includes("upload-img") || n4.includes("upload_img") || n4.includes("<img") || n4.includes("default-") || n4.includes("default_") || n4.includes("/default.") || n4.includes("/defaultog") || n4.includes("og-image") || n4.includes("social-image") || n4.includes("stock/") || !(n4.startsWith("http://") || n4.startsWith("https://") || n4.startsWith("/")));
        };
        if (oe.nearbyMode && oe.userLocation) i2.sort((e4, t2) => {
          const n4 = o2(e4);
          if (n4 !== o2(t2)) return n4 ? -1 : 1;
          const r4 = "openstreetmap" === e4.source;
          return r4 !== ("openstreetmap" === t2.source) ? r4 ? -1 : 1 : Number.isFinite(e4.distanceMeters) ? Number.isFinite(t2.distanceMeters) ? e4.distanceMeters - t2.distanceMeters : -1 : 1;
        });
        else if ("local" === oe.dataMode && le()) {
          const e4 = i2.slice();
          se(e4), e4.sort((e5, t2) => {
            const n4 = o2(e5);
            return n4 !== o2(t2) ? n4 ? -1 : 1 : 0;
          }), i2.length = 0, i2.push(...e4);
        } else if ("yeme-icme" === t) {
          const e4 = i2.slice();
          se(e4), e4.sort((e5, t2) => {
            const n4 = o2(e5);
            return n4 !== o2(t2) ? n4 ? -1 : 1 : 0;
          }), i2.length = 0, i2.push(...e4);
        } else i2.sort((e4, t2) => {
          const n4 = o2(e4);
          return n4 !== o2(t2) ? n4 ? -1 : 1 : String(e4.name || "").localeCompare(String(t2.name || ""), "tr-TR");
        });
        const s2 = i2.length, l2 = s2 ? Math.ceil(s2 / oe.limit) : 0, c2 = l2 ? Math.min(oe.page, l2) : 1;
        oe.page = c2;
        const d2 = (c2 - 1) * oe.limit, u2 = i2.slice(d2, d2 + oe.limit);
        return oe.items = u2, oe.pagination = l2 ? { page: c2, totalPages: l2, total: s2 } : { page: 1, totalPages: 0, total: 0 }, At(), await Lt(), Ut(oe.pagination), $t(), void (oe.nearbyMode && oe.userLocation && (function(e4) {
          const t2 = De();
          t2 && pe.set(t2, { ...e4, timestamp: Date.now() });
        })({ items: oe.items, pagination: oe.pagination, total: s2 }));
      }
      if ("yeme-icme" === t || "api" === oe.dataMode && le()) {
        const e3 = "yeme-icme" === t ? "yeme-icme" : [t, oe.selectedDistrict, oe.selectedNeighborhood, String(oe.selectedCategory || ""), String(oe.selectedSubcategoryId || ""), oe.selectedBudget, oe.query.trim(), [...oe.selectedTags].slice().sort().join("|")].join("");
        oe.discoveryShuffleFilterKey !== e3 && (oe.discoveryShuffleFilterKey = e3, oe.discoveryRandomSeed = String(Math.floor(1e9 * Math.random()))), oe.discoveryRandomSeed || (oe.discoveryRandomSeed = String(Math.floor(1e9 * Math.random())));
      } else ce();
      const e2 = Z((function() {
        const e3 = new URLSearchParams();
        return e3.set("page", String(oe.page)), e3.set("limit", String(oe.limit)), e3.set("mainCategoryKey", t), s && (e3.delete("categoryId"), e3.delete("category")), oe.selectedDistrict && e3.set("district", oe.selectedDistrict), oe.selectedNeighborhood && e3.set("neighborhood", oe.selectedNeighborhood), (function(e4) {
          if (oe.selectedSubcategoryId) return void e4.set("subcategoryId", String(oe.selectedSubcategoryId).trim());
          if (!oe.selectedCategory) return;
          const n3 = String(oe.selectedCategory).trim(), r3 = Array.isArray(oe.filters.categoryOptions) ? oe.filters.categoryOptions : [];
          if (!r3.length) return void e4.set("category", n3);
          const a2 = r3.find((e5) => String(e5.id) === n3);
          if ("yeme-icme" === t && a2) return void e4.set("category", String(a2.name || "").trim() || n3);
          if (a2 && null != a2.id && "" !== String(a2.id).trim()) return void e4.set("categoryId", n3);
          const i2 = r3.find((e5) => null == e5.id && (ke(String(e5.name || "")) === ke(n3) || ke(String(e5.slug || "")) === ke(n3)));
          i2 ? e4.set("category", String(i2.name || "").trim() || n3) : e4.set("category", n3);
        })(e3), oe.selectedBudget && e3.set("budget", oe.selectedBudget), oe.query && e3.set("q", oe.query), oe.selectedTags.forEach((t2) => e3.append("tag", t2)), oe.userLocation && (e3.set("lat", String(oe.userLocation.lat)), e3.set("lng", String(oe.userLocation.lng))), oe.nearbyMode && oe.userLocation && e3.set("radius", "150000"), ("yeme-icme" === t || "api" === oe.dataMode && le()) && (e3.set("sort", "random"), oe.discoveryRandomSeed || (oe.discoveryRandomSeed = String(Math.floor(1e9 * Math.random()))), e3.set("randomSeed", oe.discoveryRandomSeed)), e3;
      })(), { nearby: oe.nearbyMode && oe.userLocation }), n2 = await fetch(e2, { headers: { Accept: "application/json" } });
      if (!n2.ok) throw new Error("\u0130stanbul mekanlar\u0131 y\xFCklenemedi. L\xFCtfen sunucuyu kontrol et.");
      const r2 = await n2.json();
      oe.items = Array.isArray(r2.items) ? r2.items : [], oe.pagination = r2.pagination || null, At(), await Lt(), Ut(), $t(), (function() {
        const e3 = new URL(window.location.href);
        oe.selectedSubcategoryId ? e3.searchParams.set("subcategoryId", String(oe.selectedSubcategoryId).trim()) : e3.searchParams.delete("subcategoryId"), "hizmetler" === t && (e3.searchParams.delete("tur"), e3.searchParams.delete("hizmet")), e3.searchParams.delete("categoryId"), "gezi" !== t && "yeme-icme" !== t || !oe.selectedCategory || oe.selectedSubcategoryId ? e3.searchParams.delete("category") : e3.searchParams.set("category", String(oe.selectedCategory).trim()), window.history.replaceState({}, "", e3.toString());
      })();
    } catch (t2) {
      e.hidden = true, et.hidden = false, et.textContent = t2 instanceof Error ? t2.message : "Mekanlar al\u0131namad\u0131.", nt.hidden = true;
    } finally {
      pt(false, et.hidden ? "" : et.textContent);
    }
  }
  function Ft() {
    const e2 = i ? X : null;
    oe.selectedDistrict = "", oe.selectedNeighborhood = "", oe.selectedCategory = "", oe.selectedSubcategoryId = "", oe.selectedBudget = "", oe.selectedTags = [], oe.query = "", oe.page = 1, oe.nearbyMode = false, oe.userLocation = null, ce(), vt(), Y(), J(), Fe && (Fe.value = ""), Ve && (Ve.value = ""), He && (He.value = ""), yt(), Oe(), $e(), ht(), je && (je.value = ""), e2 ? (re(e2), ae()) : r && te(), Dt(), Kt(), Tt(), It("", false), jt();
  }
  function Vt() {
    oe.nearbyMode ? (function(e2 = "") {
      oe.nearbyMode = false, oe.userLocation = null, oe.page = 1, ce(), vt(), It(e2, false), jt();
    })() : navigator.geolocation ? (It("Konumun al\u0131n\u0131yor.", false), navigator.geolocation.getCurrentPosition((e2) => {
      oe.userLocation = { lat: e2.coords.latitude, lng: e2.coords.longitude }, oe.nearbyMode = true, oe.page = 1, oe.selectedDistrict = "", oe.selectedNeighborhood = "", Y(), J(), Fe && (Fe.value = ""), Ve && (Ve.value = ""), Dt(), vt(), Tt(), It("", false), jt();
    }, () => {
      oe.nearbyMode = false, oe.userLocation = null, vt(), It("Konum izni verilmedi. \u0130stanbul genel listesi g\xF6steriliyor.", true), jt();
    }, { enableHighAccuracy: true, timeout: 8e3, maximumAge: 6e4 })) : It("Taray\u0131c\u0131 konum deste\u011Fi vermiyor.", true);
  }
  !(async function() {
    try {
      await (async function() {
        try {
          const e3 = await fetch("/api/admin/auth/session", { headers: { Accept: "application/json" } });
          if (e3.ok) {
            const t2 = await e3.json();
            ie = !!(t2 && t2.ok && t2.session);
          }
        } catch (e3) {
          console.warn("Admin oturum kontrol\xFC ba\u015Far\u0131s\u0131z:", e3);
        }
      })();
      const e2 = new URLSearchParams(window.location.search).get("venue") || "";
      if (oe.selectedVenueSlug = e2, await (async function() {
        const e3 = await (async function() {
          return he.current || (he.current = (async () => {
            try {
              const e4 = await fetch("data/districts.json", { headers: { Accept: "application/json" } });
              if (!e4.ok) return [];
              const t2 = await e4.json();
              return (Array.isArray(t2?.[ye]) ? t2[ye] : []).map((e5) => String(e5 || "").trim()).filter(Boolean).sort((e5, t3) => e5.localeCompare(t3, "tr-TR"));
            } catch (e4) {
              return [];
            }
          })()), he.current;
        })();
        if ("local" === oe.dataMode) {
          const t2 = await Ne();
          return oe.filters = (function(e4) {
            const t3 = /* @__PURE__ */ new Set(), n4 = {}, r3 = /* @__PURE__ */ new Set();
            return e4.forEach((e5) => {
              if (e5.district && (t3.add(e5.district), e5.neighborhood)) {
                const t4 = Ee(e5.neighborhood);
                if (!t4) return;
                Array.isArray(n4[e5.district]) || (n4[e5.district] = []), n4[e5.district].includes(t4) || n4[e5.district].push(t4);
              }
              e5.category && r3.add(e5.category);
            }), Object.keys(n4).forEach((e5) => {
              n4[e5].sort((e6, t4) => e6.localeCompare(t4, "tr-TR"));
            }), { districts: Array.from(t3).sort((e5, t4) => e5.localeCompare(t4, "tr-TR")), neighborhoodsByDistrict: n4, categoryOptions: [], categories: Array.from(r3).sort((e5, t4) => e5.localeCompare(t4, "tr-TR")), tags: [], budgets: [] };
          })(t2), oe.filters.districts = ze(oe.filters.districts, e3), Q(), Dt(), Pt(), qt(), void Kt();
        }
        const n3 = new URLSearchParams({ mainCategoryKey: t }), r2 = await fetch(`/api/mvp/istanbul/filters?${n3.toString()}`, { headers: { Accept: "application/json" } });
        if (!r2.ok) throw new Error("\u0130stanbul filtre verileri al\u0131namad\u0131. L\xFCtfen sunucuyu kontrol et.");
        const a2 = await r2.json(), i2 = a2 && "object" == typeof a2.neighborhoodsByDistrict && !Array.isArray(a2.neighborhoodsByDistrict) ? a2.neighborhoodsByDistrict : {}, l2 = Te(e3), c2 = Object.entries(i2).reduce((e4, t2) => {
          const [n4, r3] = t2, a3 = l2[ke(n4)];
          return a3 && Array.isArray(r3) ? (e4[a3] = r3.map((e5) => Ee(e5)).filter(Boolean).sort((e5, t3) => e5.localeCompare(t3, "tr-TR")), e4) : e4;
        }, {});
        let d2 = (function(e4) {
          if ("yeme-icme" !== t) return (Array.isArray(e4) ? e4.filter(Boolean) : []).slice().sort((e5, t2) => String(e5.name || "").localeCompare(String(t2.name || ""), "tr-TR"));
          const n4 = Array.isArray(e4) ? e4.filter(Boolean) : [];
          if (!n4.length) return [];
          const r3 = /* @__PURE__ */ new Map();
          n4.forEach((e5) => {
            const t2 = ke(String(e5.slug || "").trim());
            t2 && r3.set(t2, e5);
          });
          const a3 = n4.slice();
          return ge.forEach((e5) => {
            const t2 = ke(e5.slug);
            t2 && !r3.has(t2) && (a3.push({ id: null, slug: e5.slug, name: e5.name, sortOrder: e5.sortOrder }), r3.set(t2, true));
          }), a3.sort((e5, t2) => String(e5.name || "").localeCompare(String(t2.name || ""), "tr-TR")), a3.filter((e5) => !Ae(e5));
        })(Array.isArray(a2.categoryOptions) ? a2.categoryOptions : []), u2 = Array.isArray(a2.categories) ? a2.categories : [];
        d2.length || (u2 = (function(e4) {
          const t2 = /* @__PURE__ */ new Set(), n4 = [];
          function r3(e5) {
            let r4 = String(e5 || "").trim();
            if (!r4) return;
            if (we(r4)) return;
            ke(r4) === ke("Asya Mutfa\u011F\u0131") && (r4 = "Asya");
            const a3 = ke(r4);
            t2.has(a3) || (t2.add(a3), n4.push(r4));
          }
          return me.forEach(r3), (e4 || []).forEach(r3), n4.sort((e5, t3) => String(e5).localeCompare(String(t3), "tr-TR")), n4;
        })(u2)), oe.filters = { districts: ze(Array.isArray(a2.districts) ? a2.districts : [], e3), neighborhoodsByDistrict: c2, categoryOptions: d2, categories: u2, tags: Array.isArray(a2.tags) ? a2.tags : [], budgets: Array.isArray(a2.budgets) ? a2.budgets : [] }, await (async function() {
          oe.mvpSubcategoryEntries = [];
          try {
            const e4 = await fetch(`/api/public/content-model/subcategories?mainCategoryKey=${encodeURIComponent(t)}`, { headers: { Accept: "application/json" } });
            if (!e4.ok) throw new Error("subcategories");
            const n4 = await e4.json();
            oe.mvpSubcategoryEntries = Array.isArray(n4.items) ? n4.items : [];
          } catch (e4) {
            oe.mvpSubcategoryEntries = [];
          }
        })(), s && (function() {
          if (!o) return;
          o.innerHTML = "";
          const e4 = document.createElement("button");
          e4.type = "button", e4.className = "istanbul-mvp-subcategory-box", e4.setAttribute("data-subcategory-id", ""), e4.setAttribute("role", "radio"), e4.setAttribute("aria-label", "T\xFCm kategoriler"), e4.textContent = "T\xFCm kategoriler", o.appendChild(e4), oe.mvpSubcategoryEntries.forEach((e5) => {
            const t2 = document.createElement("button");
            t2.type = "button", t2.className = "istanbul-mvp-subcategory-box", t2.setAttribute("data-subcategory-id", String(e5.id)), t2.setAttribute("role", "radio"), t2.setAttribute("aria-label", e5.name), t2.textContent = e5.name, o.appendChild(t2);
          }), Oe(), $e();
        })(), Q(), Dt(), Pt(), qt(), Kt();
      })(), await (async function() {
        if (!g) return;
        const e3 = (function() {
          const e4 = new URLSearchParams(window.location.search), t3 = (e4.get("district") || e4.get("ilce") || "").trim();
          if (t3) return t3;
          const n4 = new URLSearchParams(window.location.hash.replace(/^#/, ""));
          return (n4.get("district") || n4.get("ilce") || "").trim();
        })(), t2 = (function() {
          const e4 = new URLSearchParams(window.location.search), t3 = (e4.get("neighborhood") || e4.get("mahalle") || "").trim();
          if (t3) return t3;
          const n4 = new URLSearchParams(window.location.hash.replace(/^#/, ""));
          return (n4.get("neighborhood") || n4.get("mahalle") || "").trim();
        })(), n3 = (function(e4) {
          if (!e4 || !Array.isArray(oe.filters.districts)) return "";
          const t3 = ke(e4);
          return oe.filters.districts.find((e5) => ke(e5) === t3) || "";
        })(e3);
        if (!n3) return;
        if (oe.selectedDistrict = n3, Y(), J(), await Pe(n3), Dt(), !t2) return;
        const r2 = Array.isArray(oe.filters.neighborhoodsByDistrict?.[n3]) ? oe.filters.neighborhoodsByDistrict[n3] : [], a2 = Le(t2), i2 = r2.find((e4) => Le(e4) === a2) || "";
        i2 && (oe.selectedNeighborhood = i2, Ve && (Ve.value = i2), W(), H());
      })(), s) !(function() {
        if (!s) return;
        const e3 = Ke();
        if (e3) {
          const t2 = oe.mvpSubcategoryEntries.find((t3) => String(t3.id) === e3);
          return oe.selectedSubcategoryId = t2 ? e3 : "", t2 && (oe.selectedCategory = ""), Oe(), void $e();
        }
        const n3 = qe();
        if (n3) {
          if ("gezi" === t || "yeme-icme" === t) return oe.selectedSubcategoryId = "", oe.selectedCategory = n3, Oe(), void $e();
          const e4 = ke(n3), r2 = oe.mvpSubcategoryEntries.find((t2) => ke(String(t2.name || "")) === e4 || ke(String(t2.slug || "")) === e4);
          if (r2) return oe.selectedSubcategoryId = String(r2.id), oe.selectedCategory = "", Oe(), void $e();
        }
        oe.selectedSubcategoryId = "", oe.selectedCategory = "", Oe(), $e();
      })(), "hizmetler" === t && ((function() {
        if ("hizmetler" !== t || !s) return;
        if (String(oe.selectedSubcategoryId || "").trim()) return;
        const e3 = new URLSearchParams(window.location.search), n3 = e3.get("tur") || e3.get("hizmet") || "";
        if (!n3) return;
        const r2 = ne(n3), a2 = oe.mvpSubcategoryEntries;
        if (!a2.length) return;
        const i2 = a2.find((e4) => ke(String(e4.slug || "")) === ke(r2) || ke(String(e4.key || "")) === ke(r2));
        i2 && (oe.selectedSubcategoryId = String(i2.id), oe.selectedCategory = "");
      })(), Oe()), $e();
      else {
        !(function() {
          if (s) return;
          if (i) {
            const e5 = new URLSearchParams(window.location.search);
            return re(ne(e5.get("tur") || e5.get("hizmet") || "")), ae(), void yt();
          }
          if (r) return te(), void yt();
          const e4 = (function() {
            const e5 = new URLSearchParams(window.location.search).get("categoryId");
            if (null == e5 || "" === e5) return "";
            const t3 = Number.parseInt(String(e5), 10);
            return Number.isFinite(t3) ? String(t3) : "";
          })(), t2 = qe(), n3 = Array.isArray(oe.filters.categoryOptions) ? oe.filters.categoryOptions : [];
          if (t2 && we(t2)) return oe.selectedCategory = "", void yt();
          if (n3.length) {
            if (e4) {
              const t3 = n3.find((t4) => String(t4.id) === e4);
              if (t3) return Ae(t3) ? oe.selectedCategory = "" : oe.selectedCategory = e4, void yt();
            }
            if (t2) {
              const e5 = n3.find((e6) => ke(String(e6.name || "")) === ke(t2));
              return e5 ? (Ae(e5) ? oe.selectedCategory = "" : null != e5.id && "" !== String(e5.id).trim() ? oe.selectedCategory = String(e5.id) : oe.selectedCategory = String(e5.name || "").trim() || t2, void yt()) : (oe.selectedCategory = t2, void yt());
            }
            return void yt();
          }
          const a2 = Array.isArray(oe.filters.categories) ? oe.filters.categories : [];
          if (t2) {
            const e5 = a2.find((e6) => ke(String(e6)) === ke(t2));
            e5 && !we(e5) && (oe.selectedCategory = e5);
          }
          yt();
        })();
        const e3 = Ke();
        e3 && (oe.selectedSubcategoryId = e3, oe.selectedCategory = "");
      }
      const n2 = (function() {
        const e3 = new URLSearchParams(window.location.search);
        return (e3.get("q") || e3.get("query") || "").trim();
      })();
      if (n2 && je) {
        oe.query = n2;
        let e3 = false;
        if ("hizmetler" === t) {
          const t2 = String(n2).trim().toLowerCase().replace(/ı/g, "i").replace(/ğ/g, "g").replace(/ü/g, "u").replace(/ş/g, "s").replace(/ö/g, "o").replace(/ç/g, "c");
          ["berber", "berberler", "kuafor", "kuaforler", "kuaf\xF6r", "kuaf\xF6rler", "veteriner", "veterinerler", "vet", "akaryakit", "akaryakitler", "akaryak\u0131t", "akaryak\u0131tlar"].includes(t2) && (e3 = true);
        }
        je.value = e3 ? "" : n2;
      }
      !(function() {
        je && je.addEventListener("keydown", (e4) => {
          "Enter" === e4.key && (e4.preventDefault(), oe.query = je.value.trim(), oe.page = 1, jt());
        }), g && g.addEventListener("click", async (e4) => {
          const t3 = e4.target.closest(".istanbul-mvp-subcategory-box");
          t3 && g.contains(t3) && t3.hasAttribute("data-district-value") && (oe.selectedDistrict = t3.getAttribute("data-district-value") || "", oe.selectedNeighborhood = "", await Pe(oe.selectedDistrict), Dt(), J(), Y(), R(), F(), oe.page = 1, jt());
        }), We ? We.addEventListener("click", (e4) => {
          const t3 = e4.target.closest(".istanbul-filter-chip");
          if (!t3 || !We.contains(t3)) return;
          let n3 = false;
          if ("true" === t3.getAttribute("data-clear")) oe.selectedCategory = "", oe.selectedSubcategoryId = "";
          else if (t3.hasAttribute("data-category-id")) oe.selectedCategory = t3.getAttribute("data-category-id") || "", oe.selectedSubcategoryId = "", n3 = true;
          else {
            if (!t3.hasAttribute("data-category-value")) return;
            oe.selectedCategory = t3.getAttribute("data-category-value") || "", oe.selectedSubcategoryId = "", n3 = true;
          }
          yt(), R(), F(), oe.page = 1, Tt(), jt();
        }) : He && He.addEventListener("change", () => {
          oe.selectedCategory = He.value, oe.selectedSubcategoryId = "", oe.page = 1, Tt(), jt();
        }), o && o.addEventListener("click", (e4) => {
          const t3 = e4.target.closest(".istanbul-mvp-subcategory-box");
          if (!t3 || !o.contains(t3) || !t3.hasAttribute("data-subcategory-id")) return;
          const n3 = (t3.getAttribute("data-subcategory-id") || "").trim();
          n3 && n3 === String(oe.selectedSubcategoryId || "").trim() ? oe.selectedSubcategoryId = "" : oe.selectedSubcategoryId = n3, oe.selectedCategory = "", Oe(), $e(), P(), R(), F(), oe.page = 1, Tt(), jt();
        }), _e && _e.addEventListener("click", (e4) => {
          const t3 = e4.target.closest(".istanbul-filter-chip");
          if (t3 && _e.contains(t3)) {
            if ("true" === t3.getAttribute("data-clear")) oe.selectedBudget = "";
            else {
              if (!t3.hasAttribute("data-budget-value")) return;
              oe.selectedBudget = t3.getAttribute("data-budget-value") || "";
            }
            ht(), oe.page = 1, jt();
          }
        }), je && je.addEventListener("blur", () => {
          oe.query = je.value.trim(), oe.page = 1, jt();
        });
        const e3 = document.getElementById("istanbulMvpSearchForm") || document.getElementById("istanbulYemeIcmeSearchForm") || document.getElementById("istanbulGeziSearchForm");
        e3 && je && e3.addEventListener("submit", (e4) => {
          e4.preventDefault(), oe.query = je.value.trim(), oe.page = 1, jt();
        });
        const t2 = document.getElementById("hizmetlerCategoryRow");
        t2 && t2.addEventListener("click", (e4) => {
          const n3 = e4.target.closest("[data-hizmet-category-slug]");
          if (!n3 || !t2.contains(n3)) return;
          const r2 = (n3.getAttribute("data-hizmet-category-slug") || "").trim();
          r2 && (re(r2), (function(e5) {
            try {
              const t3 = new URL(window.location.href);
              e5 && "kuafor" !== ke(e5) ? t3.searchParams.set("tur", e5) : t3.searchParams.delete("tur"), window.history.replaceState({}, "", t3.toString());
            } catch (e6) {
            }
          })(r2), oe.page = 1, ae(), Nt(), Tt(), jt());
        }), Ye && Ye.addEventListener("click", Ft), Fe && Fe.addEventListener("change", async () => {
          const e4 = Fe.value;
          oe.selectedDistrict = e4, oe.selectedNeighborhood = "", oe.page = 1, e4 && await Pe(e4), Dt(), jt();
        }), Ve && Ve.addEventListener("change", () => {
          oe.selectedNeighborhood = Ve.value, oe.page = 1, jt();
        }), Je && (Je.setAttribute("aria-pressed", "false"), Je.dataset.state = "off", vt(), Je.addEventListener("click", Vt)), document.addEventListener("click", (e4) => {
          e4.target instanceof HTMLElement && e4.target.closest(".card-share-wrap") || kt();
        }), document.addEventListener("keydown", (e4) => {
          "Escape" === e4.key && (P(), R(), F(), $(), kt());
        }), l && c && d && (c.addEventListener("click", (e4) => {
          e4.preventDefault(), d.hidden ? q() : P();
        }), B || (l.addEventListener("mouseenter", () => {
          z(l), q();
        }), l.addEventListener("mouseleave", () => {
          !(function() {
            if (!l) return;
            z(l);
            const e4 = window.setTimeout(() => {
              P(), I.delete(l);
            }, M);
            I.set(l, e4);
          })();
        })), d.addEventListener("mouseenter", () => {
          z(l);
        }), c.addEventListener("focus", () => {
          q();
        }), l.addEventListener("focusout", (e4) => {
          const t3 = e4.relatedTarget;
          t3 && l.contains(t3) || P();
        }), document.addEventListener("click", (e4) => {
          e4.target && e4.target.closest && e4.target.closest("[data-kesfet-category-switch]") || P();
        })), (function() {
          if (!m || !f || !y) return;
          f.addEventListener("click", (e5) => {
            e5.preventDefault(), y.hidden ? K() : R();
          });
          const e4 = m.classList.contains("home-rail-dropdown");
          B || e4 || (m.addEventListener("mouseenter", () => {
            D(m), K();
          }), m.addEventListener("mouseleave", () => {
            !(function() {
              if (!m) return;
              if (m.classList.contains("home-rail-dropdown")) return;
              D(m);
              const e5 = window.setTimeout(() => {
                R(), x.delete(m);
              }, M);
              x.set(m, e5);
            })();
          }), y.addEventListener("mouseenter", () => {
            D(m);
          })), f.addEventListener("focus", () => {
            e4 || K();
          }), m.addEventListener("focusout", (e5) => {
            const t3 = e5.relatedTarget;
            t3 && m.contains(t3) || R();
          }), document.addEventListener("click", (e5) => {
            e5.target && e5.target.closest && e5.target.closest("[data-kesfet-district-switch]") || R();
          });
        })(), w && E && L && A && (E.addEventListener("click", (e4) => {
          e4.preventDefault(), L.hidden ? U() : $();
        }), B || (w.addEventListener("mouseenter", () => {
          O(w), U();
        }), w.addEventListener("mouseleave", () => {
          !(function() {
            if (!w) return;
            O(w);
            const e4 = window.setTimeout(() => {
              $(), N.delete(w);
            }, M);
            N.set(w, e4);
          })();
        })), L.addEventListener("mouseenter", () => {
          O(w);
        }), E.addEventListener("focus", () => {
          U();
        }), w.addEventListener("focusout", (e4) => {
          const t3 = e4.relatedTarget;
          t3 && w.contains(t3) || $();
        }), document.addEventListener("click", (e4) => {
          e4.target && e4.target.closest && e4.target.closest("[data-kesfet-budget-switch]") || $();
        }), A.addEventListener("click", (e4) => {
          const t3 = e4.target.closest(".istanbul-mvp-subcategory-box");
          if (!t3 || !A.contains(t3) || !t3.hasAttribute("data-budget-value")) return;
          const n3 = t3.getAttribute("data-budget-value");
          oe.selectedBudget = null == n3 || "" === n3 ? "" : n3, ht(), $(), oe.page = 1, jt();
        })), (function() {
          if (!(p && v && k && h)) return;
          const e4 = p.classList.contains("home-rail-dropdown");
          v.addEventListener("click", (e5) => {
            e5.preventDefault(), v.disabled || (k.hidden ? V() : F());
          }), B || e4 || (p.addEventListener("mouseenter", () => {
            v.disabled || (j(p), V());
          }), p.addEventListener("mouseleave", () => {
            !(function() {
              if (!p) return;
              if (p.classList.contains("home-rail-dropdown")) return;
              j(p);
              const e5 = window.setTimeout(() => {
                F(), T.delete(p);
              }, M);
              T.set(p, e5);
            })();
          })), k.addEventListener("mouseenter", () => {
            j(p);
          }), v.addEventListener("focus", () => {
            e4 || v.disabled || V();
          }), p.addEventListener("focusout", (e5) => {
            const t3 = e5.relatedTarget;
            t3 && p.contains(t3) || F();
          }), document.addEventListener("click", (e5) => {
            e5.target && e5.target.closest && e5.target.closest("[data-kesfet-neighborhood-switch]") || F();
          }), h.addEventListener("click", (e5) => {
            const t3 = e5.target.closest(".istanbul-mvp-subcategory-box");
            if (!t3 || !h.contains(t3) || !t3.hasAttribute("data-neighborhood-value")) return;
            const n3 = t3.getAttribute("data-neighborhood-value");
            oe.selectedNeighborhood = null == n3 || "" === n3 ? "" : n3, W(), H(), F(), oe.page = 1, jt();
          });
        })(), (function() {
          const e4 = Boolean(m && m.classList.contains("home-rail-dropdown")), t3 = Boolean(p && p.classList.contains("home-rail-dropdown"));
          if (e4 || t3) {
            if (e4 && f && "true" !== f.dataset.railDropdownBound) {
              f.dataset.railDropdownBound = "true";
              const e5 = (e6) => {
                e6.preventDefault(), e6.stopPropagation(), e6.stopImmediatePropagation(), y.hidden ? K() : R();
              };
              f.addEventListener("click", e5, true), f.addEventListener("keydown", (t4) => {
                "Enter" !== t4.key && " " !== t4.key || e5(t4);
              }, true);
            }
            if (t3 && v && "true" !== v.dataset.railDropdownBound) {
              v.dataset.railDropdownBound = "true";
              const e5 = (e6) => {
                e6.preventDefault(), e6.stopPropagation(), e6.stopImmediatePropagation(), v.disabled || (k.hidden ? V() : F());
              };
              v.addEventListener("click", e5, true), v.addEventListener("keydown", (t4) => {
                "Enter" !== t4.key && " " !== t4.key || e5(t4);
              }, true);
            }
            document.body && "true" !== document.body.dataset.railLocationDropdownsBound && (document.body.dataset.railLocationDropdownsBound = "true", document.addEventListener("click", (e5) => {
              const t4 = e5.target;
              t4 && t4.closest && t4.closest(".home-rail-filter-group") || (R(), F());
            }));
          }
        })(), G(), _(), H(), ut && ut.addEventListener("click", async () => {
          const e4 = St();
          if (e4) try {
            ut.disabled = true, await Ct(e4.id);
          } catch (e5) {
            It(e5 instanceof Error ? e5.message : "Favori i\u015Flemi tamamlanamad\u0131.", true);
          } finally {
            ut.disabled = false;
          }
        });
      })(), Boolean(oe.selectedCategory || oe.selectedSubcategoryId || oe.query), "1" === new URLSearchParams(window.location.search).get("nearby") ? (Nt(), Tt(), (function() {
        if (oe.userLocation) oe.nearbyMode = true, oe.page = 1, oe.selectedDistrict = "", oe.selectedNeighborhood = "", Y(), J(), Fe && (Fe.value = ""), Ve && (Ve.value = ""), Dt(), vt(), Tt(), It("", false), jt();
        else {
          if (!navigator.geolocation) return It("Taray\u0131c\u0131 konum deste\u011Fi vermiyor.", true), void jt();
          It("Konumun al\u0131n\u0131yor.", false), navigator.geolocation.getCurrentPosition((e3) => {
            oe.userLocation = { lat: e3.coords.latitude, lng: e3.coords.longitude }, oe.nearbyMode = true, oe.page = 1, oe.selectedDistrict = "", oe.selectedNeighborhood = "", Y(), J(), Fe && (Fe.value = ""), Ve && (Ve.value = ""), Dt(), vt(), Tt(), It("", false), jt();
          }, () => {
            oe.nearbyMode = false, oe.userLocation = null, vt(), It("Konum izni verilmedi. \u0130stanbul genel listesi g\xF6steriliyor.", true), jt();
          }, { enableHighAccuracy: true, timeout: 8e3, maximumAge: 6e4 });
        }
      })()) : (async function() {
        const hasCategory = Boolean(oe.selectedCategory || oe.selectedSubcategoryId || qe() || Ke() || new URLSearchParams(window.location.search).get("categoryId") || new URLSearchParams(window.location.search).get("subcategoryId"));
        const hasDistrict = Boolean(oe.selectedDistrict || oe.selectedNeighborhood);
        if (hasCategory && !hasDistrict && navigator.geolocation) {
          try {
            const coords = await new Promise((resolve, reject) => {
              navigator.geolocation.getCurrentPosition(
                (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
                (err) => reject(err),
                { enableHighAccuracy: false, timeout: 4000, maximumAge: 600000 }
              );
            });
            const resolvedDistrict = await reverseGeocodeDistrict(coords.lat, coords.lng);
            if (resolvedDistrict) {
              const matchedDistrict = oe.filters.districts.find(d => ke(d) === ke(resolvedDistrict));
              if (matchedDistrict) {
                oe.selectedDistrict = matchedDistrict;
                Y();
                J();
                await Pe(matchedDistrict);
                Dt();
              }
            }
          } catch (e) {
            console.warn("Auto-district location/geocoding skipped:", e);
          }
        }
        Nt();
        Tt();
        await jt();
      })(), await (async function(e3) {
        const t2 = String(e3 || "").trim();
        if (!t2 || oe.initialVenueSelectionHandled) return;
        oe.initialVenueSelectionHandled = true;
        let n3 = oe.items.find((e4) => e4.slug === t2) || null;
        if (!n3) try {
          const e4 = await fetch(`/api/mvp/istanbul/venues/${encodeURIComponent(t2)}`, { headers: { Accept: "application/json" } });
          if (e4.ok) {
            const t3 = await e4.json();
            n3 = t3.venue || t3.item || t3;
          }
        } catch (e4) {
          console.warn("Derin link mekan yuklenemedi:", e4);
        }
        n3 && "object" == typeof n3 && n3.slug && (oe.deepLinkedVenue = n3, oe.items.some((e4) => e4.slug === n3.slug) || oe.items.unshift(n3), oe.selectedVenueSlug = n3.slug, Ue(n3.slug), $t(), Mt());
      })(e2);
    } catch (e2) {
      pt(false, e2 instanceof Error ? e2.message : "Sayfa ba\u015Flat\u0131lamad\u0131.");
    }
  })();
})();
