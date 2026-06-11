
        try {
          // Intercept and bridge console logs and unhandled errors
          (function() {
            var originalLog = window.console.log;
            var originalError = window.console.error;
            window.console.log = function() {
              var msg = Array.prototype.slice.call(arguments).join(' ');
              if (originalLog) originalLog.apply(window.console, arguments);
              try { if (window.AramaBulAndroid) { window.AramaBulAndroid.postMessage(JSON.stringify({action:'console_log', type:'log', message:msg})); } } catch(err) {}
            };
            window.console.error = function() {
              var msg = Array.prototype.slice.call(arguments).join(' ');
              if (originalError) originalError.apply(window.console, arguments);
              try { if (window.AramaBulAndroid) { window.AramaBulAndroid.postMessage(JSON.stringify({action:'console_log', type:'error', message:msg})); } } catch(err) {}
            };
            window.onerror = function(message, source, lineno, colno, error) {
              var msg = message + ' at ' + source + ':' + lineno + ':' + colno;
              try { if (window.AramaBulAndroid) { window.AramaBulAndroid.postMessage(JSON.stringify({action:'console_log', type:'error', message:msg})); } } catch(err) {}
            };
          })();

          console.log('[_injectAppFlag] JavaScript session block starting...');
          window.__ARAMABUL_APP__ = {
            platform: 'android',
            version: '$kAppVersion',
            isApp: true
          };

          // Override openVenuePopup to open Google Maps directly and skip web details modal popup
          window.openVenuePopup = function (venue) {
            if (!venue || typeof venue !== "object") return;
            var rawMapsUrl = (venue.mapsUrl || venue.mapUrl || "").trim();
            var isCoordsOnly = false;
            if (rawMapsUrl) {
              var queryPart = rawMapsUrl.split("query=")[1] || rawMapsUrl.split("destination=")[1] || "";
              var decodedQuery = "";
              try { decodedQuery = decodeURIComponent(queryPart); } catch (e) { decodedQuery = queryPart; }
              isCoordsOnly = rawMapsUrl.includes("query=") && !/[a-zA-Z]/.test(decodedQuery.replace(/[-NSEWnsew°'"\\s,.+0-9]/g, ""));
              if (!isCoordsOnly) {
                var placeIndex = rawMapsUrl.indexOf("/maps/place/");
                if (placeIndex !== -1) {
                  var remaining = rawMapsUrl.substring(placeIndex + 12);
                  var placePart = remaining.split("/")[0] || "";
                  var decodedPlace = "";
                  try { decodedPlace = decodeURIComponent(placePart); } catch (e) { decodedPlace = placePart; }
                  isCoordsOnly = !/[a-zA-Z]/.test(decodedPlace.replace(/[-NSEWnsew°'"\\s,.+0-9]/g, ""));
                }
              }
              if (!isCoordsOnly && !/[a-zA-Z]/.test(rawMapsUrl.replace("https://", "").replace("http://", "").replace("www.google.com/maps", "").replace(/[-NSEWnsew°'"\\s,.+0-9]/g, ""))) {
                isCoordsOnly = true;
              }
            }
            var primaryMapsUrl = "";
            if (rawMapsUrl && !isCoordsOnly) {
              primaryMapsUrl = rawMapsUrl;
            } else if (venue.sourcePlaceId || venue.placeId) {
              primaryMapsUrl = "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent((venue.name || "") + " " + (venue.district || "") + " İstanbul") + "&query_place_id=" + (venue.sourcePlaceId || venue.placeId);
            } else if (venue.name && venue.district) {
              primaryMapsUrl = "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent((venue.name || "") + " " + (venue.district || "") + " İstanbul");
            } else if (venue.latitude && venue.longitude) {
              primaryMapsUrl = "https://maps.google.com/maps?q=loc:" + venue.latitude + "," + venue.longitude + "(" + encodeURIComponent(venue.name || "Mekan") + ")&hl=tr";
            } else {
              var query = [venue.name, venue.address, venue.district, "İstanbul"].filter(Boolean).join(" ");
              primaryMapsUrl = "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(query);
            }
            window.open(primaryMapsUrl, "_blank", "noopener,noreferrer");
          };

          // Sync auth session and user list from native app to WebView localStorage
          try {
            localStorage.setItem('aramabul.auth.users.v1', '$escapedUsersRaw');
          } catch(e) {}
          
          ${authSessionJson.isNotEmpty ? "try { localStorage.setItem('aramabul.auth.session.v1', '$authSessionJson'); } catch(e) {}" : "try { localStorage.removeItem('aramabul.auth.session.v1'); } catch(e) {}"}

          try {
            var snapshotUsers = localStorage.getItem('aramabul.auth.users.v1') || '[]';
            var snapshotSession = localStorage.getItem('aramabul.auth.session.v1') || '';
            if (window.AramaBulAndroid) {
              window.AramaBulAndroid.postMessage(JSON.stringify({
                action: 'auth_snapshot',
                usersRaw: snapshotUsers,
                sessionRaw: snapshotSession
              }));
            }
          } catch(e) {}
          
          try {
            document.dispatchEvent(new CustomEvent('aramabul:authchange'));
          } catch(e) {}

          // applyAppTheme removed to let CSS stylesheet control borders and thumbnails
          // Inject app-specific CSS fixes
          var style = document.getElementById('aramabul-app-css');
          if (!style) {
            style = document.createElement('style');
            style.id = 'aramabul-app-css';
            var targetHeader = document.head || document.documentElement;
            if (targetHeader) {
              targetHeader.appendChild(style);
            }
          }
          style.textContent = 
            '@import url("https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap");' +
            'body, * { font-family: "Plus Jakarta Sans", sans-serif !important; }' +
            'html body, html body.home-page, body.home-page, body { background: #ffffff !important; min-height: 100vh !important; position: relative !important; padding-top: 0 !important; }' +
            'html body.mobile-bottom-nav-visible { padding-bottom: 0 !important; box-sizing: border-box !important; }' +
            'html body::before, body.home-page::before { content: "" !important; display: none !important; }' +
            'html body::after, body.home-page::after { content: "" !important; display: none !important; }' +
            '.global-topline, .desktop-auth-links, .desktop-lang-switch, .mobile-bottom-nav, .mobile-bottom-nav-actions, .yr-footer, .global-footer, .global-footer-band, .footer-band, footer[aria-label*="Alt" i] { display: none !important; height: 0 !important; max-height: 0 !important; overflow: hidden !important; opacity: 0 !important; pointer-events: none !important; }' +
            '.home-hero-search { display: none !important; }' +
            '.texture { display: none !important; font-size: 0 !important; line-height: 0 !important; }' +
            '.hero { padding-top: 0 !important; }' +
            '.hero-content { background: transparent !important; border: none !important; box-shadow: none !important; border-radius: 0 !important; padding: 0 !important; }' +
            '.istanbul-discovery-shell { background: transparent !important; }' +
            '.istanbul-discovery-copy, .istanbul-discovery-hero-card { border: none !important; background: transparent !important; box-shadow: none !important; border-radius: 0 !important; }' +
            '.istanbul-results-shell { background: transparent !important; border: none !important; box-shadow: none !important; border-radius: 0 !important; padding: 0 8px !important; }' +
            '.istanbul-filter-card { background: transparent !important; border: none !important; box-shadow: none !important; border-radius: 0 !important; padding: 0 !important; overflow: visible !important; }' +
            '.istanbul-filter-body, .istanbul-filter-yeme-icme-sidebar, .istanbul-filter-yeme-icme-sidebar--gezi-two-up { overflow: visible !important; }' +
            '.istanbul-filter-yeme-icme-sidebar { background: transparent !important; border: none !important; box-shadow: none !important; padding: 0 !important; display: flex !important; flex-direction: column !important; gap: 0 !important; width: 100% !important; box-sizing: border-box !important; }' +
            '.istanbul-filter-location-box { background: rgba(255,255,255,0.08) !important; border: 1px solid rgba(255,255,255,0.15) !important; border-radius: 18px !important; padding: 16px !important; margin-bottom: 12px !important; display: grid !important; grid-template-columns: 1fr 1fr !important; gap: 10px !important; width: 100% !important; box-sizing: border-box !important; overflow: visible !important; position: relative !important; z-index: 200 !important; backdrop-filter: blur(16px) !important; box-shadow: 0 8px 32px rgba(0,0,0,0.2) !important; }' +
            '.istanbul-filter-section-box { display: none !important; }' +
            '.istanbul-filter-location-box-title, .istanbul-filter-section-box-title, .istanbul-filter-gezi-category-box .istanbul-filter-section-box-title { display: none !important; }' +
            '.istanbul-filter-location-box .istanbul-filter-field:nth-child(1), .istanbul-filter-location-box .istanbul-filter-field:nth-child(2) { grid-column: span 1 !important; }' +
            '.istanbul-filter-location-box .istanbul-filter-field:nth-child(3), .istanbul-filter-location-box .istanbul-filter-field:last-child { grid-column: span 2 !important; }' +
            '.kesfet-category-dropdown-btn, .lang-switch-btn { display: flex !important; align-items: center !important; justify-content: space-between !important; width: 100% !important; background: #ffffff !important; color: #011d36 !important; border: 1px solid rgba(164,179,181,0.82) !important; border-radius: 6px !important; padding: 0.5rem 0.65rem !important; font-size: 0.84rem !important; cursor: pointer !important; box-sizing: border-box !important; }' +
            '.istanbul-filter-field { display: block !important; margin: 0 !important; padding: 0 !important; }' +
            '.istanbul-filter-field > span { display: none !important; }' +
            '.istanbul-filter-location-box .kesfet-category-dropdown, .istanbul-filter-section-box .kesfet-category-dropdown { position: relative !important; z-index: 1200 !important; }' +
            '.kesfet-category-dropdown-menu { position: absolute !important; left: 0 !important; top: calc(100% + 4px) !important; width: max-content !important; min-width: 100% !important; max-width: calc(100vw - 24px) !important; background: #ffffff !important; border: 1px solid #7bbce8 !important; border-radius: 6px !important; box-shadow: 0 4px 16px rgba(0,0,0,0.12) !important; z-index: 1200 !important; overflow-y: auto !important; max-height: 50vh !important; display: flex !important; flex-direction: column !important; padding: 0 !important; }' +
            '.kesfet-category-dropdown-menu[hidden] { display: none !important; }' +
            '.kesfet-category-dropdown.is-open .kesfet-category-dropdown-menu { display: flex !important; }' +
            '.lang-switch-menu { position: absolute !important; background: #ffffff !important; border: 1px solid #7bbce8 !important; border-radius: 6px !important; box-shadow: 0 4px 16px rgba(0,0,0,0.12) !important; z-index: 1200 !important; overflow-y: auto !important; max-height: 50vh !important; }' +
            '.lang-switch-menu[hidden] { display: none !important; }' +
            '.featured-venues-section { background: transparent !important; border: none !important; box-shadow: none !important; border-radius: 0 !important; padding-left: 0 !important; padding-right: 0 !important; padding-bottom: 0 !important; }' +
            '.featured-venues-panel { background: transparent !important; border: none !important; box-shadow: none !important; border-radius: 0 !important; padding: 0 !important; margin: 0 !important; }' +
            '.featured-venues-grid { background: transparent !important; border: none !important; box-shadow: none !important; border-radius: 0 !important; padding: 0 !important; margin: 0 !important; }' +
            '.content-guide { background: #d7d7d7 !important; border: none !important; box-shadow: none !important; border-radius: 14px !important; padding: 16px !important; margin-top: 12px !important; }' +
            '.content-guide.home-ustalara-saygi { background: #7bbce8 !important; border-radius: 14px !important; }' +
            '.home-empty-box { background: transparent !important; border: none !important; box-shadow: none !important; border-radius: 0 !important; padding: 0 !important; }' +
            '.home-subcategory-list { background: transparent !important; border: none !important; box-shadow: none !important; border-radius: 0 !important; display: flex !important; flex-direction: row !important; flex-wrap: nowrap !important; overflow-x: auto !important; -webkit-overflow-scrolling: touch !important; gap: 0.5rem !important; padding: 0.5rem 0.25rem !important; width: 100% !important; scrollbar-width: none !important; }' +
            '.home-subcategory-list::-webkit-scrollbar { display: none !important; }' +
            '.home-subcat-chip { background: rgba(255,255,255,0.08) !important; border: 1px solid rgba(255,255,255,0.12) !important; border-radius: 0 !important; display: flex !important; align-items: center !important; justify-content: center !important; text-align: center !important; flex: 0 0 100px !important; height: 100px !important; font-size: 0.72rem !important; font-weight: 700 !important; color: #ffffff !important; text-transform: uppercase !important; }' +
            '.content-guide h2, .content-guide h3, .content-guide p, .content-guide li, .content-guide strong { color: #000 !important; }' +
            '.home-top-category-row { background: transparent !important; display: grid !important; grid-template-columns: repeat(3, 1fr) !important; gap: 0.5rem !important; }' +
            '.istanbul-venue-card { background: #bdd8e9 !important; border-color: #bdd8e9 !important; }' +
            '.istanbul-results-grid { padding: 0 !important; }' +
            '.home-subcategory-grid { display: flex !important; flex-direction: row !important; flex-wrap: nowrap !important; overflow-x: auto !important; -webkit-overflow-scrolling: touch !important; gap: 0.5rem !important; padding: 0.5rem 0.25rem !important; width: 100% !important; scrollbar-width: none !important; }' +
            '.home-subcategory-grid::-webkit-scrollbar { display: none !important; }' +
            '.home-subcategory-card { display: flex !important; flex-direction: column !important; align-items: center !important; justify-content: center !important; text-align: center !important; position: relative !important; flex: 0 0 100px !important; height: 100px !important; overflow: hidden !important; border-radius: 0 !important; border: 1px solid rgba(255,255,255,0.12) !important; background: transparent !important; text-decoration: none !important; padding: 0 !important; }' +
            '.home-subcategory-card::before { content: "" !important; position: absolute !important; inset: 0 !important; background: rgba(0,0,0,0.45) !important; z-index: 2 !important; }' +
            '.home-subcategory-card img { position: absolute !important; inset: 0 !important; width: 100% !important; height: 100% !important; object-fit: cover !important; border-radius: 0 !important; z-index: 1 !important; display: block !important; }' +
            '.home-subcategory-card-name { position: relative !important; z-index: 3 !important; padding: 6px !important; font-size: 0.72rem !important; font-weight: 700 !important; color: #ffffff !important; text-transform: uppercase !important; letter-spacing: 0.2px !important; text-shadow: 0 1px 2px rgba(0,0,0,0.8) !important; text-align: center !important; overflow: hidden !important; text-overflow: ellipsis !important; display: -webkit-box !important; -webkit-line-clamp: 2 !important; -webkit-box-orient: vertical !important; }' +
            '.home-subcategory-card-action { display: none !important; }' +
            '.category-home-card .top-city-thumb, .top-city-card .top-city-thumb { display: block !important; position: absolute !important; inset: 0 !important; width: 100% !important; height: 100% !important; background-size: cover !important; background-position: center !important; border-radius: 0 !important; z-index: 1 !important; }' +
            'html body.home-page .home-top-category-row .top-city-card, html body.home-page .home-top-category-row .category-home-card, html body .home-top-category-row .top-city-card, html body .home-top-category-row .category-home-card, .top-city-card, .category-home-card { display: flex !important; flex-direction: column !important; align-items: center !important; justify-content: center !important; text-align: center !important; position: relative !important; aspect-ratio: 1 / 1 !important; width: 100% !important; height: auto !important; overflow: hidden !important; border-radius: 0 !important; border: 1px solid rgba(255,255,255,0.12) !important; background: transparent !important; padding: 0 !important; box-shadow: 0 4px 20px rgba(0,0,0,0.2) !important; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important; }' +
            'html body.home-page .home-top-category-row .top-city-card:active, html body.home-page .home-top-category-row .category-home-card:active, .top-city-card:active, .category-home-card:active { transform: scale(0.95) !important; }' +
            'html body.home-page .top-city-card::before, html body.home-page .category-home-card::before, .top-city-card::before, .category-home-card::before { content: "" !important; position: absolute !important; inset: 0 !important; background: rgba(0,0,0,0.45) !important; z-index: 2 !important; }' +
            'html body .category-home-card .top-city-content, html body .top-city-card .top-city-content, .category-home-card .top-city-content, .top-city-card .top-city-content { position: relative !important; z-index: 3 !important; padding: 8px !important; display: flex !important; align-items: center !important; justify-content: center !important; width: 100% !important; height: 100% !important; box-sizing: border-box !important; }' +
            'html body .top-city-name, .top-city-name { font-size: 0.85rem !important; font-weight: 700 !important; color: #ffffff !important; text-transform: uppercase !important; letter-spacing: 0.5px !important; text-shadow: 0 1px 3px rgba(0,0,0,0.6) !important; text-align: center !important; }' +
            '.istanbul-discovery-hero-label { background: #fdf8f0 !important; border: none !important; border-radius: 8px !important; color: #093826 !important; font-size: 0.76rem !important; font-weight: 600 !important; padding: 0.25rem 0.55rem !important; }' +
            '.istanbul-venue-tag, .istanbul-venue-distance, .istanbul-venue-budget { background: #fdf8f0 !important; border: 1px solid #58c9f3 !important; border-radius: 8px !important; color: #093826 !important; font-size: 0.76rem !important; font-weight: 600 !important; padding: 0 0.72rem !important; min-height: 42px !important; display: inline-flex !important; align-items: center !important; justify-content: center !important; white-space: nowrap !important; line-height: 1.1 !important; box-sizing: border-box !important; }' +
            '.istanbul-filter-nearby-panel-button, .istanbul-discovery-primary-button { background: #011e3a !important; border: none !important; border-radius: 14px !important; color: #fff !important; }' +
            '.venue-detail-main-card { background: #bdd8e9 !important; border: none !important; border-radius: 14px !important; width: 100% !important; max-width: 100% !important; box-sizing: border-box !important; padding: 0.75rem !important; overflow: hidden !important; }' +
            '.venue-detail-side-card { background: #bdd8e9 !important; border: none !important; border-radius: 14px !important; }' +
            '.venue-detail-media, .venue-detail-info, .venue-detail-reviews, .venue-detail-review-form { background: #bdd8e9 !important; border-color: #bdd8e9 !important; }' +
            '.venue-detail-top-grid { display: flex !important; flex-direction: column !important; gap: 0.75rem !important; width: 100% !important; max-width: 100% !important; box-sizing: border-box !important; }' +
            '.venue-detail-side-info, .venue-detail-right-col { width: 100% !important; max-width: 100% !important; display: block !important; box-sizing: border-box !important; }' +
            '.venue-detail-right-col { display: flex !important; flex-direction: column !important; gap: 0.75rem !important; }' +
            '.venue-detail-media, .venue-detail-media-placeholder, .venue-detail-map-inline { width: 100% !important; max-width: 100% !important; box-sizing: border-box !important; aspect-ratio: 4 / 3 !important; overflow: hidden !important; border-radius: 10px !important; }' +
            '.venue-detail-image, .venue-detail-map-inline-frame { width: 100% !important; height: 100% !important; max-width: 100% !important; box-sizing: border-box !important; object-fit: cover !important; }' +
            '.section-head h1, .section-head h2, .section-head h3, .province-head h1, .province-head h2, .province-head h3, .istanbul-discovery-copy h1, .istanbul-discovery-copy h2 { color: #ffffff !important; font-weight: 700 !important; margin-bottom: 0.75rem !important; }' +
            '.istanbul-discovery-kicker, .istanbul-breadcrumb, .istanbul-breadcrumb a, .istanbul-breadcrumb a:visited, .istanbul-breadcrumb span, .istanbul-discovery-subline, .istanbul-discovery-location-note { color: #ffffff !important; }' +
            '.istanbul-results-meta, .istanbul-results-state { color: #ffffff !important; text-align: left !important; }' +
            '.istanbul-results-head { text-align: left !important; }' +
            'ins.adsbygoogle, .adsbygoogle, [id*="google_ads"], [id*="aswift"], iframe[src*="googleads"], iframe[src*="doubleclick"], .ad-container, .ad-wrapper, .ad-banner, [data-ad-slot], .google-auto-placed { display: none !important; height: 0 !important; max-height: 0 !important; overflow: hidden !important; }' +
            '.mobile-bottom-nav, .mobile-bottom-nav-actions { display: none !important; height: 0 !important; max-height: 0 !important; opacity: 0 !important; pointer-events: none !important; overflow: hidden !important; }' +
            '.global-footer, .global-footer-band, .footer-band, .yr-footer { background: transparent !important; border: none !important; color: #ffffff !important; }' +
            '.global-footer a, .global-footer-band a, .footer-band a, .yr-footer a { color: #ffffff !important; }' +
            '.yr-footer h4 { color: #ffffff !important; }' +
            '.settings-shell, .settings-layout { background: transparent !important; border: none !important; box-shadow: none !important; }' +
            'html body.settings-page { padding-top: 0 !important; }' +
            '.settings-page .hero, .settings-page .settings-shell { padding-top: 0.35rem !important; }' +
            '.aramabul-app-settings-breadcrumb { width: min(1220px, calc(100% - 2.4rem)) !important; margin: 0.15rem auto 0.55rem !important; padding: 0 0.2rem !important; display: flex !important; align-items: center !important; gap: 0.38rem !important; color: #6b5a4b !important; font-size: 0.82rem !important; line-height: 1.25 !important; box-sizing: border-box !important; }' +
            '.aramabul-app-settings-breadcrumb a, .aramabul-app-settings-breadcrumb a:visited { color: #8a5c3b !important; text-decoration: none !important; font-size: inherit !important; font-weight: 500 !important; }' +
            '.aramabul-app-settings-breadcrumb span { color: #6b5a4b !important; font-size: inherit !important; font-weight: 400 !important; }' +
            '.aramabul-app-settings-breadcrumb[hidden] { display: none !important; }' +
            '.settings-feedback-field input, .settings-feedback-field textarea, .settings-feedback-field select, .settings-signup-field input, .settings-feedback-phone-group input { background: #fff !important; color: #000 !important; }' +
            '.settings-feedback-phone-group, .settings-feedback-field:has(.settings-feedback-phone-group) { display: none !important; }' +
            '.search-page-shell { background: transparent !important; border: none !important; box-shadow: none !important; }' +
            '.search-page-note { display: none !important; }' +
            '.search-page .hero { padding-top: 3rem !important; }' +
            '.header-search-btn, .settings-feedback-submit, .settings-signout { background: linear-gradient(135deg, #01b4ed 0%, #0d47a1 100%) !important; border: none !important; border-radius: 14px !important; color: #fff !important; font-weight: 600 !important; box-shadow: 0 4px 14px rgba(13, 71, 161, 0.4) !important; }' +
            '.store-badge { background: #011e3a !important; border-color: #011e3a !important; color: #fff !important; }' +
            '.header-search-btn:hover, .istanbul-discovery-primary-button:hover { background: #0a2e52 !important; }' +
            '.istanbul-pagination-button { background: #011e3a !important; border: none !important; border-radius: 14px !important; color: #fff !important; }' +
            '.istanbul-pagination-current { background: #011f39 !important; border-color: #011f39 !important; color: #fff !important; }' +
            '.istanbul-results-mode { display: none !important; }' +
            '.istanbul-favorite-button, .card-share-trigger, .venue-popup-info-chip-btn, .istanbul-detail-trigger-btn { background: #fdf8f0 !important; border: 1px solid #58c9f3 !important; color: #093826 !important; border-radius: 8px !important; font-size: 0.76rem !important; font-weight: 600 !important; padding: 0 0.72rem !important; min-height: 42px !important; display: inline-flex !important; align-items: center !important; justify-content: center !important; gap: 0.42rem !important; line-height: 1.1 !important; box-sizing: border-box !important; }' +
            '.venue-detail-action, .venue-detail-action-secondary, .venue-detail-action-inline { background: #fdf8f0 !important; border: none !important; color: #093826 !important; border-radius: 8px !important; font-size: 0.76rem !important; font-weight: 600 !important; padding: 0.25rem 0.55rem !important; }' +
            '.venue-detail-chip { background: #fdf8f0 !important; border: none !important; border-radius: 8px !important; color: #093826 !important; font-size: 0.76rem !important; font-weight: 600 !important; padding: 0.25rem 0.55rem !important; }' +
            '#favoritesTitle { color: #ffffff !important; }' +
            '.istanbul-results-head h2 { color: #ffffff !important; }' +
            '.kesfet-category-dropdown-options { gap: 0 !important; padding: 0 !important; margin: 0 !important; }' +
            '.kesfet-category-dropdown-options .istanbul-filter-chip, .kesfet-category-dropdown-options .istanbul-mvp-subcategory-box { border-radius: 0 !important; border: none !important; border-bottom: 1px solid rgba(164,179,181,0.35) !important; background: transparent !important; padding: 0.56rem 0.65rem !important; transition: background 0.15s ease !important; }' +
            '.kesfet-category-dropdown-options .istanbul-filter-chip:last-child, .kesfet-category-dropdown-options .istanbul-mvp-subcategory-box:last-child { border-bottom: none !important; }' +
            '.kesfet-category-dropdown-options .istanbul-mvp-subcategory-box.is-active { background: rgba(9,56,38,0.08) !important; color: #093826 !important; font-weight: 500 !important; }' +
            '.istanbul-filter-location-box, .istanbul-filter-section-box { background: #48769f !important; box-shadow: 0 3px 8px rgba(72,118,159,0.3) !important; color: #fff !important; }' +
            '.istanbul-filter-location-box-title, .istanbul-filter-section-box-title, .istanbul-filter-field > span:first-child, .istanbul-filter-yeme-icme-budget-nest-label { color: #fff !important; }' +
            '.istanbul-venue-card, .istanbul-venue-card-inner, .istanbul-filter-card, .istanbul-filter-section-box, .istanbul-filter-location-box, .content-guide, .venue-detail-main-card, .venue-detail-side-card, .venue-detail-media, .venue-detail-info, .venue-detail-reviews, .venue-detail-review-form, .top-city-card, .category-home-card, .settings-card, .settings-panel-card, .settings-sidebar-card, .istanbul-map-card, .istanbul-map-frame-wrap, .featured-venues-section, .featured-venues-panel, .featured-venues-grid, .home-lezzet-banner-inner { border: none !important; }' +
            'html body.settings-page .settings-card, html body.settings-page .settings-panel-card, html body.settings-page .settings-sidebar-card, html body.settings-page.settings-force-mobile .settings-card, html body.settings-page.settings-force-mobile .settings-sidebar-card, html body.settings-page.settings-force-mobile .settings-panel-stack .settings-card, html body.theme-dark .settings-card, html body.theme-dark.settings-page .settings-card, html body.theme-dark.settings-page .settings-panel-stack .settings-card { background: rgba(10, 24, 46, 0.6) !important; border: 1px solid rgba(88, 201, 243, 0.25) !important; border-radius: 16px !important; backdrop-filter: blur(16px) !important; box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4) !important; color: #ffffff !important; padding: 1.25rem !important; }' +
            'html body.settings-page .settings-row, html body.settings-page .settings-row-button, html body.settings-page.settings-force-mobile .settings-row, html body.settings-page.settings-force-mobile .settings-row-button, html body.theme-dark .settings-row, html body.theme-dark.settings-page .settings-row { background: rgba(255, 255, 255, 0.04) !important; border-bottom: 1px solid rgba(255, 255, 255, 0.08) !important; color: #ffffff !important; }' +
            'html body.settings-page .settings-row:active, html body.settings-page .settings-row.is-active, html body.settings-page.settings-force-mobile .settings-row:active, html body.settings-page.settings-force-mobile .settings-row.is-active, html body.theme-dark .settings-row:active, html body.theme-dark .settings-row.is-active { background: rgba(88, 201, 243, 0.15) !important; }' +
            'html body.settings-page .settings-panel-card h2, html body.settings-page .settings-panel-card h3, html body.settings-page .settings-panel-card p, html body.settings-page .settings-panel-card span, html body.settings-page .settings-panel-card label, html body.settings-page .settings-panel-card strong, html body.settings-page .settings-panel-card li, html body.settings-page .settings-sidebar-card .settings-row-label, html body.settings-page .settings-sidebar-card .settings-row-chevron svg, html body.settings-page .settings-sidebar-card .settings-row-icon svg, html body.theme-dark.settings-page .settings-row-label, html body.theme-dark.settings-page .settings-row-icon svg, html body.theme-dark.settings-page .settings-panel-card h2, html body.theme-dark.settings-page .settings-panel-card h3, html body.theme-dark.settings-page .settings-panel-card label, html body.theme-dark.settings-page .settings-panel-card span { color: #ffffff !important; stroke: #ffffff !important; }' +
            'html body.settings-page .settings-sidebar-card .settings-row-icon svg, html body.theme-dark.settings-page .settings-row-icon svg { stroke: #ffffff !important; fill: none !important; }' +
            'html body.settings-page .settings-sidebar-card .settings-row-chevron svg, html body.theme-dark.settings-page .settings-row-chevron svg { stroke: #ffffff !important; fill: none !important; }' +
            'html body.settings-page .settings-signup-field input, html body.settings-page .settings-feedback-field input, html body.settings-page .settings-feedback-field textarea, html body.settings-page .settings-feedback-field select, html body.settings-page .settings-feedback-phone-group input, html body.theme-dark.settings-page .settings-signup-field input, html body.theme-dark.settings-page .settings-feedback-field input, html body.theme-dark.settings-page .settings-feedback-field textarea, html body.theme-dark.settings-page .settings-feedback-field select, html body.theme-dark.settings-page .settings-feedback-phone-group input, .settings-signup-field input, .settings-feedback-field input, .settings-feedback-field textarea, .settings-feedback-field select { background: rgba(255, 255, 255, 0.08) !important; border: 1px solid rgba(255, 255, 255, 0.15) !important; border-radius: 10px !important; color: #ffffff !important; padding: 0.7rem 0.85rem !important; font-family: inherit !important; outline: none !important; box-sizing: border-box !important; width: 100% !important; transition: all 0.2s ease !important; }' +
            'html body.settings-page .settings-signup-field input:focus, html body.settings-page .settings-feedback-field input:focus, html body.settings-page .settings-feedback-field textarea:focus, html body.settings-page .settings-feedback-field select:focus, html body.theme-dark.settings-page .settings-signup-field input:focus, html body.theme-dark.settings-page .settings-feedback-field input:focus, html body.theme-dark.settings-page .settings-feedback-field textarea:focus, html body.theme-dark.settings-page .settings-feedback-field select:focus { border-color: #58c9f3 !important; box-shadow: 0 0 0 3px rgba(88, 201, 243, 0.25) !important; background: rgba(255, 255, 255, 0.12) !important; }' +
            '.settings-signup-submit, .settings-feedback-submit, .account-secondary-btn, .account-verify-btn, .settings-signout { background: linear-gradient(135deg, #01b4ed 0%, #0d47a1 100%) !important; border: none !important; border-radius: 12px !important; color: #ffffff !important; font-weight: 400 !important; padding: 0.75rem 1.25rem !important; box-shadow: 0 4px 15px rgba(13, 71, 161, 0.4) !important; transition: all 0.2s ease !important; cursor: pointer !important; }' +
            '.account-secondary-btn { background: rgba(255, 255, 255, 0.08) !important; border: 1px solid rgba(255, 255, 255, 0.15) !important; color: #ffffff !important; box-shadow: none !important; }' +
            '.settings-signup-submit:active, .settings-feedback-submit:active, .account-secondary-btn:active, .settings-signout:active { transform: scale(0.97) !important; opacity: 0.9 !important; }' +
            '.auth-inline-link, .auth-toggle-hint button, #toggleToSignupBtn, #toggleToLoginBtn, #settingsForgotPasswordBtn, .auth-form-inline-row button { color: #58c9f3 !important; text-decoration: none !important; font-weight: 400 !important; background: none !important; border: none !important; cursor: pointer !important; padding: 0 !important; font-size: 0.85rem !important; }' +
            '.auth-inline-link:hover, .auth-toggle-hint button:hover, #toggleToSignupBtn:hover, #toggleToLoginBtn:hover, #settingsForgotPasswordBtn:hover { text-decoration: underline !important; }' +
            '.auth-checkbox-label, .auth-checkbox-label span { color: rgba(255, 255, 255, 0.7) !important; }' +
            '.auth-divider span:first-child, .auth-divider span:last-child { background: rgba(255, 255, 255, 0.15) !important; }' +
            '.auth-divider span:nth-child(2) { color: rgba(255, 255, 255, 0.5) !important; }' +
            '#customGoogleSignInBtn { background: #ffffff !important; color: #1a202c !important; border: 1px solid rgba(255, 255, 255, 0.8) !important; border-radius: 10px !important; font-weight: 400 !important; }' +
            '#customGoogleSignInBtn span { color: #1a202c !important; }' +
            '#customGoogleSignInBtn:active { background: #f7fafc !important; transform: scale(0.97) !important; }' +
            '.settings-help-item strong { color: #58c9f3 !important; font-size: 1rem !important; font-weight: 400 !important; }' +
            '.settings-help-item p { color: rgba(255, 255, 255, 0.8) !important; }' +
            'html body.settings-page [data-settings-panel="login"] h2, html body [data-settings-panel="login"] h2 { font-size: 1.35rem !important; font-weight: 700 !important; text-align: center !important; margin-top: 0.5rem !important; margin-bottom: 0.5rem !important; }' +
            'html body.settings-page #toggleToSignupBtn span, html body.settings-page #toggleToLoginBtn span, html body.settings-page #settingsForgotPasswordBtn span, html body #toggleToSignupBtn span, html body #toggleToLoginBtn span, html body #settingsForgotPasswordBtn span { color: #58c9f3 !important; }' +
            'html body.settings-page *, html body.settings-page button, html body.settings-page input, html body.settings-page a, html body.settings-page span { font-weight: 400 !important; }' +
            'html body.settings-page [data-settings-panel="login"] h2, html body.settings-page [data-settings-panel="login"] h2 *, html body.settings-page [data-settings-panel="signup"] h2, html body.settings-page [data-settings-panel="signup"] h2 * { font-weight: 700 !important; }' +
            '#googleChooserModal, [id*="googleChooserModal"], #credential_picker_container, [id*="credential_picker_container"], iframe[src*="accounts.google.com/gsi"] { display: none !important; visibility: hidden !important; opacity: 0 !important; pointer-events: none !important; }';

          // Force district dropdown button visibility via inline styles
          // Use retry + MutationObserver because buttons may not exist yet when onPageFinished fires
          (function fixDropdownButtons() {
            function applyFix() {
              var btns = document.querySelectorAll('.kesfet-category-dropdown-btn');
              if (!btns.length) return false;
              for (var i = 0; i < btns.length; i++) {
                var b = btns[i];
                if (b.dataset.appFixed) continue;
                b.dataset.appFixed = '1';
                b.style.setProperty('display', 'flex', 'important');
                b.style.setProperty('background', '#ffffff', 'important');
                b.style.setProperty('color', '#011d36', 'important');
                b.style.setProperty('border', '1px solid rgba(164,179,181,0.82)', 'important');
                b.style.setProperty('border-radius', '6px', 'important');
                b.style.setProperty('padding', '0.5rem 0.65rem', 'important');
                b.style.setProperty('width', '100%', 'important');
                b.style.setProperty('justify-content', 'space-between', 'important');
                b.style.setProperty('align-items', 'center', 'important');
                b.style.setProperty('font-size', '0.84rem', 'important');
                b.style.setProperty('box-sizing', 'border-box', 'important');
                b.style.setProperty('cursor', 'pointer', 'important');
                b.style.setProperty('min-height', '2.1rem', 'important');
              }
              return true;
            }
            // Try immediately
            applyFix();
            // Retry every 300ms for up to 5 seconds
            var attempts = 0;
            var timer = setInterval(function() {
              attempts++;
              applyFix();
              if (attempts >= 16) clearInterval(timer);
            }, 300);
            if (window.MutationObserver) {
              var targetNode = document.body || document.documentElement || document;
              if (targetNode) {
                var obs = new MutationObserver(function() { applyFix(); });
                obs.observe(targetNode, { childList: true, subtree: true });
                setTimeout(function() { obs.disconnect(); }, 8000);
              }
            }
          })();

          // Pagination: scroll to first card when page changes
          var paginationNav = document.getElementById('pagination');
          if (paginationNav && !paginationNav.dataset.scrollBound) {
            paginationNav.dataset.scrollBound = '1';
            paginationNav.addEventListener('click', function() {
              setTimeout(function() {
                var firstCard = document.querySelector('.istanbul-venue-card');
                if (firstCard) { firstCard.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
              }, 300);
            });
          }

          // Hide signin icon + 4-column grid
          if (!document.getElementById('aramabul-app-nav-css')) {
            var navStyle = document.createElement('style');
            navStyle.id = 'aramabul-app-nav-css';
            navStyle.textContent = 
              '.mobile-bottom-nav, .mobile-bottom-nav-actions { display: none !important; height: 0 !important; max-height: 0 !important; overflow: hidden !important; opacity: 0 !important; pointer-events: none !important; }' +
              'html body.mobile-bottom-nav-visible { padding-bottom: 0 !important; }';
            var targetHeader = document.head || document.documentElement;
            if (targetHeader) {
              targetHeader.appendChild(navStyle);
            }
          }

          // Keep Android footer order as: home, search, favorites, profile.
          var mobileNav = document.querySelector('.mobile-bottom-nav-actions');
          if (mobileNav) {
            var searchBtn = mobileNav.querySelector('[data-mobile-nav="search"]');
            var favoritesBtn = mobileNav.querySelector('[data-mobile-nav="favorites"]');
            if (searchBtn && favoritesBtn && (searchBtn.compareDocumentPosition(favoritesBtn) & Node.DOCUMENT_POSITION_PRECEDING)) {
              mobileNav.insertBefore(searchBtn, favoritesBtn);
            }
            // Replace footer nav PNG icons with custom SVGs
            mobileNav.querySelectorAll('.mobile-bottom-nav-btn').forEach(function(btn) {
              var type = btn.getAttribute('data-mobile-nav') || btn.dataset.mobileNav;
              var img = btn.querySelector('.mobile-bottom-nav-icon-img');
              var chip = btn.querySelector('.mobile-bottom-nav-chip');
              if (img) {
                if (type === 'home') { img.src = 'assets/ev.svg'; }
                else if (type === 'favorites') { img.src = 'assets/fav.svg'; }
                else if (type === 'profile') { img.src = 'assets/ayar.svg'; }
                img.style.display = 'block';
                img.style.width = '22px';
                img.style.height = '22px';
              }
              if (type === 'home' || type === 'favorites' || type === 'profile') {
                if (chip) { chip.classList.remove('icon-load-failed'); }
                var svg = btn.querySelector('.mobile-bottom-nav-icon-svg');
                if (svg) { svg.style.display = 'none'; }
              }
              // Active icon styling
              if (btn.classList.contains('active')) {
                if (chip) { chip.style.filter = 'none'; }
                if (img) { img.style.filter = 'brightness(0) saturate(100%) invert(73%) sepia(30%) saturate(600%) hue-rotate(170deg) brightness(95%) contrast(90%)'; }
                var label = btn.querySelector('.mobile-bottom-nav-label');
                if (label) { label.style.color = '#7bbce8'; }
              }
            });
          }

          // Favorites page: rename title with observer for dynamic content
          var favTitle = document.getElementById('favoritesTitle');
          if (favTitle) {
            function fixFavTitle() {
              if (favTitle.textContent.indexOf('Kaydet') !== -1) {
                favTitle.textContent = 'Favorilerim';
              }
            }
            fixFavTitle();
            var favObs = new MutationObserver(fixFavTitle);
            favObs.observe(favTitle, { childList: true, characterData: true, subtree: true });
          }

          // Hide header language switch (not the filter dropdowns which also use lang-switch class)
          var langSwitch = document.querySelector('.global-topbar .lang-switch, .desktop-auth-links .lang-switch, [data-lang-switch]');
          if (langSwitch) { langSwitch.style.display = 'none'; }

          // Android app shell: keep the website content, remove browser-like web chrome.
          (function setupAndroidChromeCleanup() {
            if (window.__ARAMABUL_ANDROID_CHROME_CLEANUP__) return;
            window.__ARAMABUL_ANDROID_CHROME_CLEANUP__ = true;
            function syncSettingsBreadcrumb() {
              try {
                var path = (window.location.pathname || '').toLowerCase();
                var settingsPaths = ['/profile.html', '/account-settings.html', '/language-settings.html', '/feedback-settings.html', '/help-settings.html', '/about-settings.html', '/verify-email.html', '/gizlilik-politikasi.html', '/kullanim-kosullari.html', '/kvkk.html', '/cerez-politikasi.html', '/hakkimizda.html', '/iletisim.html', '/sss.html', '/yer-ekle.html'];
                var isSettingsUrl = settingsPaths.some(function(item) { return path === item || path.endsWith(item); });
                var isSettingsPage = !!(
                  (document.body && document.body.classList.contains('settings-page')) ||
                  isSettingsUrl ||
                  document.querySelector('.settings-shell, .settings-card, .settings-panel-card')
                );
                var crumb = document.getElementById('aramabulAppSettingsBreadcrumb');
                if (!isSettingsPage) {
                  if (crumb) crumb.remove();
                  return;
                }
                var shell = document.querySelector('.settings-shell');
                var firstCard = document.querySelector('.settings-card, .settings-panel-card');
                var anchor = shell || firstCard;
                if (!anchor || !anchor.parentNode) return;
                if (!crumb) {
                  crumb = document.createElement('nav');
                  crumb.id = 'aramabulAppSettingsBreadcrumb';
                  crumb.className = 'aramabul-app-settings-breadcrumb';
                  crumb.setAttribute('aria-label', 'Sayfa yolu');
                  anchor.parentNode.insertBefore(crumb, anchor);
                } else if (crumb.nextElementSibling !== anchor) {
                  anchor.parentNode.insertBefore(crumb, anchor);
                }
                crumb.removeAttribute('hidden');
                var source = document.querySelector('.global-topline-inner');
                if (source && source.textContent && source.textContent.trim()) {
                  crumb.innerHTML = source.innerHTML;
                } else {
                  crumb.innerHTML = '<a href="/">Anasayfa</a><span>/</span><span>Ayarlar</span>';
                }
                crumb.querySelectorAll('a').forEach(function(anchor) {
                  var href = anchor.getAttribute('href') || '';
                  if (href === 'index.html' || href === './index.html') {
                    anchor.setAttribute('href', '/');
                  }
                });
              } catch (e) {}
            }
            function cleanupAndroidChrome() {
              try {
                document.querySelectorAll(
                  '.global-header-band, .global-topbar, .global-topline, .topbar, .topbar-search-form, .header-search, .desktop-auth-links, .desktop-lang-switch, .home-hero-search, .mobile-bottom-nav, .mobile-bottom-nav-actions, .yr-footer, .yr-footer-inner, .yr-footer-grid, .yr-footer-bottom, .global-footer, .global-footer-band, .footer-band, footer[aria-label*="Alt" i]'
                ).forEach(function(el) {
                  el.style.setProperty('display', 'none', 'important');
                  el.style.setProperty('height', '0', 'important');
                  el.style.setProperty('max-height', '0', 'important');
                  el.style.setProperty('overflow', 'hidden', 'important');
                  el.style.setProperty('opacity', '0', 'important');
                  el.style.setProperty('pointer-events', 'none', 'important');
                });
                document.querySelectorAll(
                  'ins.adsbygoogle, .adsbygoogle, [id*="google_ads"], [id*="aswift"], iframe[src*="googleads"], iframe[src*="doubleclick"], .ad-container, .ad-wrapper, .ad-banner, [data-ad-slot], .google-auto-placed'
                ).forEach(function(el) {
                  el.style.setProperty('display', 'none', 'important');
                  el.style.setProperty('height', '0', 'important');
                  el.style.setProperty('max-height', '0', 'important');
                  el.style.setProperty('overflow', 'hidden', 'important');
                });
                document.querySelectorAll('img').forEach(function(img) {
                  if (!img.__aramabulBrokenImageHooked) {
                    img.__aramabulBrokenImageHooked = true;
                    img.addEventListener('error', function() {
                      img.style.setProperty('display', 'none', 'important');
                    });
                  }
                  if (img.complete && img.naturalWidth === 0) {
                    img.style.setProperty('display', 'none', 'important');
                  }
                });
                syncSettingsBreadcrumb();
              } catch (e) {}
            }
            cleanupAndroidChrome();
            setInterval(cleanupAndroidChrome, 900);
            if (window.MutationObserver) {
              new MutationObserver(cleanupAndroidChrome).observe(document.documentElement, {
                childList: true,
                subtree: true
              });
            }
          })();

          // Apply app language to website
          var appLang = '$_globalAppLanguage';
          if (appLang && appLang !== 'TR') {
            window.ARAMABUL_CURRENT_LANGUAGE = appLang;
            // Click the matching lang option to trigger native site translation
            var langBtn = document.querySelector('[data-lang-option="' + appLang + '"]');
            if (langBtn && !document.body.dataset.appLangApplied) {
              document.body.dataset.appLangApplied = '1';
              langBtn.click();
            }
          }

          // Color the "arama" part of brand wordmark
          var wm = document.querySelector('.brand-wordmark');
          if (wm && !wm.dataset.colored) {
            wm.dataset.colored = '1';
            wm.innerHTML = '<span style="color:#000000">arama</span><span style="color:#d32f2f">bul</span>';
          }

          // Simplify hero: change h1 + remove description paragraphs
          var heroH1 = document.querySelector('.section-head h1, .province-head h1');
          if (heroH1 && !heroH1.dataset.appModified) {
            heroH1.dataset.appModified = '1';
            heroH1.textContent = "İstanbul'u keşfet!";
            // Hide all <p> siblings in the same container
            var container = heroH1.parentElement;
            if (container) {
              container.querySelectorAll('p').forEach(function(p) { p.style.display = 'none'; });
            }
          }
          // Settings: fix mobile panel visibility for sub-panels (password, feedback, etc.)
          var params = new URLSearchParams(window.location.search);
          var action = (params.get('action') || '').trim().toLowerCase();
          if (action === 'password' || action === 'feedback' || action === 'help' || action === 'about') {
            var panelStack = document.querySelector('.settings-panel-stack');
            var sidebar = document.querySelector('.settings-sidebar-card');
            if (panelStack) { panelStack.style.display = 'block'; }
            if (sidebar) { sidebar.style.display = 'none'; }
          }


          // Synchronize auth session changes from WebView to Flutter
          (function setupSessionSync() {
            if (window.datasetAuthSyncHooked) return;
            window.datasetAuthSyncHooked = true;
            document.addEventListener('aramabul:authchange', function() {
              try {
                var sessionRaw = localStorage.getItem('aramabul.auth.session.v1');
                if (sessionRaw) {
                  var session = JSON.parse(sessionRaw);
                  if (session && session.email) {
                    if (window.AramaBulAndroid) {
                      window.AramaBulAndroid.postMessage(JSON.stringify({
                        action: 'login_success',
                        name: session.name || '',
                        email: session.email
                      }));
                    }
                  }
                } else {
                  if (window.AramaBulAndroid) {
                    window.AramaBulAndroid.postMessage(JSON.stringify({
                      action: 'logout'
                    }));
                  }
              }
            } catch(e) {}
            });
          })();

          // Bridge the web app's Google button to the native Google sign-in flow.
          // Some fallback auth pages intentionally use the web chooser modal instead of native Google.
          var __disableGoogleBridge = ${((widget.initialPath ?? '').contains('app_google_chooser=1')) ? 'true' : 'false'};
          if (__disableGoogleBridge) {
            try { delete window.ARAMABUL_GOOGLE_SIGN_IN; } catch (e) { window.ARAMABUL_GOOGLE_SIGN_IN = undefined; }
          } else {
            window.ARAMABUL_GOOGLE_SIGN_IN = function() {
              try {
                if (window.AramaBulAndroid) {
                  window.AramaBulAndroid.postMessage(JSON.stringify({ action: 'google_signin' }));
                }
              } catch (e) {}
            };
          }

          // Ensure bottom nav buttons work on ALL profile/settings pages
          setTimeout(function() {
            document.querySelectorAll('.mobile-bottom-nav-btn').forEach(function(btn) {
              btn.addEventListener('click', function(e) {
                e.preventDefault();
                var type = btn.getAttribute('data-mobile-nav') || btn.dataset.mobileNav;
                if (type === 'home') { window.location.href = '/'; }
                else if (type === 'search') { window.location.href = '/search.html'; }
                else if (type === 'favorites') { window.location.href = '/favorites.html'; }
                else if (type === 'profile') { window.location.href = '/profile.html'; }
              });
            });
          }, 300);

          // Warm cream-brown palette override for the updated app direction.
          (function applyWarmPalette() {
            var warmStyle = document.getElementById('aramabul-warm-app-css');
            if (!warmStyle) {
              warmStyle = document.createElement('style');
              warmStyle.id = 'aramabul-warm-app-css';
              (document.head || document.documentElement).appendChild(warmStyle);
            }
            warmStyle.textContent =
              'html, body { background: #ffffff !important; color: #2f241e !important; }' +
              'body::before { content: "" !important; display: none !important; }' +
              '.global-header-band, .global-topbar, .global-topline, .topbar, .topbar-search-form, .header-search, .desktop-auth-links, .desktop-lang-switch, .home-hero-search, .mobile-bottom-nav, .mobile-bottom-nav-actions, .yr-footer, .yr-footer-inner, .yr-footer-grid, .yr-footer-bottom, .global-footer, .global-footer-band, .footer-band, footer[aria-label*="Alt" i] { display: none !important; height: 0 !important; max-height: 0 !important; overflow: hidden !important; opacity: 0 !important; pointer-events: none !important; background: #ffffff !important; }' +
              '.brand-wordmark .brand-wordmark-rest { color: #000000 !important; }' +
              '.brand-wordmark .brand-wordmark-search { color: #d32f2f !important; }' +
              'html body.mobile-bottom-nav-visible { padding-bottom: 0 !important; }' +
              'html body.settings-page { padding-top: 0 !important; }' +
              '.settings-page .hero, .settings-page .settings-shell { padding-top: 0.35rem !important; }' +
              '.aramabul-app-settings-breadcrumb { width: min(1220px, calc(100% - 2.4rem)) !important; margin: 0.15rem auto 0.55rem !important; padding: 0 0.2rem !important; display: flex !important; align-items: center !important; gap: 0.38rem !important; color: #6b5a4b !important; font-size: 0.82rem !important; line-height: 1.25 !important; box-sizing: border-box !important; }' +
              '.aramabul-app-settings-breadcrumb a, .aramabul-app-settings-breadcrumb a:visited { color: #8a5c3b !important; text-decoration: none !important; font-size: inherit !important; font-weight: 500 !important; }' +
              '.aramabul-app-settings-breadcrumb span { color: #6b5a4b !important; font-size: inherit !important; font-weight: 400 !important; }' +
              '.aramabul-app-settings-breadcrumb[hidden] { display: none !important; }' +
              '.content-guide, .istanbul-venue-card, .istanbul-venue-card-inner, .venue-detail-main-card, .venue-detail-side-card, .settings-card, .settings-panel-card, .settings-sidebar-card { background: rgba(255,249,242,0.92) !important; border-color: rgba(138,92,59,0.12) !important; color: #2f241e !important; }' +
              '.istanbul-venue-title-link, .content-guide h2, .content-guide h3, .section-head h1, .province-head h1, .province-head h2, .province-head h3 { color: #2f241e !important; }' +
              '.istanbul-venue-tag, .istanbul-venue-distance, .istanbul-venue-budget, .istanbul-discovery-hero-label, .home-subcat-chip, .istanbul-favorite-button, .card-share-trigger, .venue-popup-info-chip-btn, .istanbul-detail-trigger-btn { background: #f3eadf !important; border-color: rgba(138,92,59,0.14) !important; color: #5f432f !important; min-height: 42px !important; display: inline-flex !important; align-items: center !important; justify-content: center !important; padding-top: 0 !important; padding-bottom: 0 !important; line-height: 1.1 !important; box-sizing: border-box !important; }' +
              '.istanbul-filter-nearby-panel-button, .istanbul-discovery-primary-button, .settings-signup-submit, .settings-feedback-submit, .account-secondary-btn, .account-verify-btn, .settings-signout, .auth-submit { background: linear-gradient(135deg, #8a5c3b 0%, #b08968 100%) !important; color: #ffffff !important; }' +
              '.auth-inline-link, .auth-toggle-hint button, #toggleToSignupBtn, #toggleToLoginBtn, #settingsForgotPasswordBtn, .auth-form-inline-row button { color: #8a5c3b !important; }' +
              '.settings-signup-field input, .settings-feedback-field input, .settings-feedback-field textarea, .settings-feedback-field select, .settings-feedback-phone-group input, .auth-form input { background: rgba(255,249,242,0.88) !important; border: 1px solid rgba(138,92,59,0.16) !important; color: #2f241e !important; }' +
              '.settings-signup-field input:focus, .settings-feedback-field input:focus, .settings-feedback-field textarea:focus, .settings-feedback-field select:focus, .settings-feedback-phone-group input:focus, .auth-form input:focus { border-color: #8a5c3b !important; box-shadow: 0 0 0 3px rgba(138,92,59,0.12) !important; }';
          })();

        } catch (e) {
          console.error('[__injectAppFlag] RUNTIME ERROR:', e);
        }
      