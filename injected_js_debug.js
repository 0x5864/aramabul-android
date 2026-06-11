
          try {
            window.__ARAMABUL_APP__ = {
              platform: 'android',
              version: '$kAppVersion',
              isApp: true
            };
            (function applyFallbackAppShell() {
              var style = document.getElementById('aramabul-fallback-app-css');
              if (!style) {
                style = document.createElement('style');
                style.id = 'aramabul-fallback-app-css';
                (document.head || document.documentElement).appendChild(style);
              }
              style.textContent =
                'html, body { background: #f7f1e6 !important; color: #2f241e !important; }' +
                '.mobile-bottom-nav, .mobile-bottom-nav-actions, .yr-footer, .global-footer, .global-footer-band, .footer-band, footer[aria-label*="Alt" i] { display: none !important; height: 0 !important; max-height: 0 !important; overflow: hidden !important; background: #f7f1e6 !important; border: 0 !important; opacity: 0 !important; pointer-events: none !important; }' +
                '.brand-wordmark .brand-wordmark-search { color: #8a5c3b !important; }' +
                '.brand-wordmark .brand-wordmark-rest { color: #4d4c4a !important; }' +
                'body.mobile-bottom-nav-visible { padding-bottom: 0 !important; }' +
                'ins.adsbygoogle, .adsbygoogle, [id*="google_ads"], [id*="aswift"], iframe[src*="googleads"], iframe[src*="doubleclick"], .google-auto-placed { display: none !important; height: 0 !important; max-height: 0 !important; overflow: hidden !important; }' +
                '.auth-message-error, .settings-signup-message { color: #fffdf8 !important; text-shadow: 0 1px 2px rgba(22,33,35,.12) !important; }';
            })();
            document.dispatchEvent(new CustomEvent('aramabul:authchange'));
          } catch(e) {
            console.log('[__injectAppFlag] chooser fallback minimal bridge error: ' + e);
          }
        