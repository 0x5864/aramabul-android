import 'dart:async';
import 'dart:convert';
import 'dart:io';

import 'package:connectivity_plus/connectivity_plus.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:permission_handler/permission_handler.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:webview_flutter/webview_flutter.dart';
import 'package:webview_flutter_android/webview_flutter_android.dart';

import 'package:google_sign_in/google_sign_in.dart';
import 'package:sign_in_with_apple/sign_in_with_apple.dart';

import 'welcome_screen.dart';

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

/// Live URL — the primary source when online.
const String kLiveUrl = 'https://aramabul.com';

/// Bundled fallback — used only when there is no internet connection.
const String kBundledEntryAssetPath = 'assets/app_web/index.html';

const String kDeepLinkHost = 'aramabul.com';
const String kDeepLinkHostWww = 'www.aramabul.com';

/// App version string injected into the WebView so the web code can detect it.
const String kAppVersion = '1.2.0';

const String _kWelcomeSeenKey = 'welcome_seen';

/// Global app language selected on welcome screen (e.g. 'TR', 'EN', 'DE', 'RU')
String _globalAppLanguage = 'TR';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  // Load saved language
  final prefs = await SharedPreferences.getInstance();
  final savedLang = prefs.getString('app_language');
  if (savedLang != null && savedLang.isNotEmpty) {
    _globalAppLanguage = savedLang.toUpperCase();
  }
  runApp(const AramaBulApp());
}

class AramaBulApp extends StatelessWidget {
  const AramaBulApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      debugShowCheckedModeBanner: false,
      title: 'AramaBul',
      theme: ThemeData(
        useMaterial3: true,
        colorScheme: ColorScheme.fromSeed(seedColor: const Color(0xFF1F6F54)),
        scaffoldBackgroundColor: const Color(0xFFFFFAED),
      ),
      home: const AppEntryPoint(),
    );
  }
}

/// Decides whether to show the welcome screen or go directly to WebView.
class AppEntryPoint extends StatefulWidget {
  const AppEntryPoint({super.key});

  @override
  State<AppEntryPoint> createState() => _AppEntryPointState();
}

class _AppEntryPointState extends State<AppEntryPoint> {
  bool? _showWelcome;

  @override
  void initState() {
    super.initState();
    _checkFirstLaunch();
  }

  Future<void> _checkFirstLaunch() async {
    final prefs = await SharedPreferences.getInstance();
    final seen = prefs.getBool(_kWelcomeSeenKey) ?? false;
    if (!mounted) return;
    setState(() => _showWelcome = !seen);
  }

  Future<void> _onWelcomeComplete(String? route) async {
    if (!mounted) return;

    switch (route) {
      case 'login':
        // Open standalone login page — can go back to welcome
        Navigator.of(context).push(
          MaterialPageRoute(
            builder: (_) => const _AuthPage(mode: 'login', title: 'Giriş Yap'),
          ),
        );
        break;

      case 'register':
        // Open standalone signup page — can go back to welcome
        Navigator.of(context).push(
          MaterialPageRoute(
            builder: (_) => const _AuthPage(mode: 'signup', title: 'Hesap Oluştur'),
          ),
        );
        break;

      case 'google_signin':
        await _handleGoogleSignIn();
        break;

      case 'apple_signin':
        await _handleAppleSignIn();
        break;

      case 'facebook_signin':
        if (!mounted) return;
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Facebook ile giriş yakında aktif olacak.'),
            backgroundColor: Color(0xFF093827),
          ),
        );
        break;

      case 'privacy':
        // Open lightweight policy viewer — can go back to welcome
        Navigator.of(context).push(
          MaterialPageRoute(
            builder: (_) => const _PolicyViewerPage(
              title: 'Gizlilik Politikası',
              url: 'https://aramabul.com/gizlilik-politikasi.html',
            ),
          ),
        );
        break;

      case 'terms':
        Navigator.of(context).push(
          MaterialPageRoute(
            builder: (_) => const _PolicyViewerPage(
              title: 'Kullanım Koşulları',
              url: 'https://aramabul.com/kullanim-kosullari.html',
            ),
          ),
        );
        break;

      case 'lang_tr':
      case 'lang_en':
      case 'lang_de':
      case 'lang_ru':
        final langCode = route!.replaceFirst('lang_', '');
        final prefsL = await SharedPreferences.getInstance();
        await prefsL.setString('app_language', langCode);
        if (!mounted) return;
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(langCode == 'tr' ? 'Dil: Türkçe' : langCode == 'en' ? 'Language: English' : langCode == 'de' ? 'Sprache: Deutsch' : 'Язык: Русский'),
            backgroundColor: const Color(0xFF093827),
            duration: const Duration(seconds: 1),
          ),
        );
        // Store globally so HomeWebViewPage can use it
        _globalAppLanguage = langCode.toUpperCase();
        break;

      default:
        // Guest — just go to home
        final prefsG = await SharedPreferences.getInstance();
        await prefsG.setBool(_kWelcomeSeenKey, true);
        if (!mounted) return;
        Navigator.of(context).pushReplacement(
          MaterialPageRoute(
            builder: (_) => const HomeWebViewPage(),
          ),
        );
    }
  }

  /// Register social login user with backend
  Future<void> _registerSocialLogin({
    required String provider,
    required String email,
    required String name,
    String? providerId,
  }) async {
    try {
      final client = HttpClient();
      final request = await client.postUrl(
        Uri.parse('https://aramabul.com/api/auth/social-login'),
      );
      request.headers.set('Content-Type', 'application/json');
      request.write(jsonEncode({
        'provider': provider,
        'email': email,
        'name': name,
        'providerId': providerId ?? '',
      }));
      final response = await request.close();
      final body = await response.transform(utf8.decoder).join();
      debugPrint('[SocialLogin] $provider -> ${response.statusCode}: $body');
      client.close();
    } catch (e) {
      debugPrint('[SocialLogin] Backend registration failed: $e');
      // Don't block login — just log the error
    }
  }

  Future<void> _handleGoogleSignIn() async {
    try {
      await GoogleSignIn.instance.initialize(
        serverClientId: '481244794487-v5at2f43oeth0cqef3bhr6u5rc7lo7ef.apps.googleusercontent.com',
      );
      final account = await GoogleSignIn.instance.authenticate();
      if (account == null) return; // User cancelled

      final name = account.displayName ?? '';
      final email = account.email;

      // Save session locally
      final prefs = await SharedPreferences.getInstance();
      await prefs.setBool(_kWelcomeSeenKey, true);
      await prefs.setString('auth_user_name', name);
      await prefs.setString('auth_user_email', email);

      // Register with backend (fire-and-forget)
      _registerSocialLogin(
        provider: 'google',
        email: email,
        name: name,
        providerId: account.id,
      );

      if (!mounted) return;
      Navigator.of(context).pushAndRemoveUntil(
        MaterialPageRoute(builder: (_) => const HomeWebViewPage()),
        (route) => false,
      );
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Google ile giriş başarısız: $e'),
          backgroundColor: Colors.red.shade700,
        ),
      );
    }
  }

  Future<void> _handleAppleSignIn() async {
    try {
      debugPrint('[AppleSignIn] Starting...');
      final isAvailable = await SignInWithApple.isAvailable();
      debugPrint('[AppleSignIn] isAvailable: $isAvailable');
      if (!isAvailable) {
        if (!mounted) return;
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Apple ile giriş bu cihazda desteklenmiyor.'),
            backgroundColor: Color(0xFF093827),
          ),
        );
        return;
      }

      final credential = await SignInWithApple.getAppleIDCredential(
        scopes: [
          AppleIDAuthorizationScopes.email,
          AppleIDAuthorizationScopes.fullName,
        ],
      );

      debugPrint('[AppleSignIn] Got credential!');
      debugPrint('[AppleSignIn] givenName: ${credential.givenName}');
      debugPrint('[AppleSignIn] familyName: ${credential.familyName}');
      debugPrint('[AppleSignIn] email: ${credential.email}');
      debugPrint('[AppleSignIn] userIdentifier: ${credential.userIdentifier}');

      final name = [
        credential.givenName ?? '',
        credential.familyName ?? '',
      ].where((s) => s.isNotEmpty).join(' ');
      final email = credential.email ?? '';

      // Save session locally
      final prefs = await SharedPreferences.getInstance();
      await prefs.setBool(_kWelcomeSeenKey, true);
      if (name.isNotEmpty) await prefs.setString('auth_user_name', name);
      if (email.isNotEmpty) await prefs.setString('auth_user_email', email);
      // Always save the Apple user identifier
      if (credential.userIdentifier != null) {
        await prefs.setString('auth_apple_id', credential.userIdentifier!);
      }

      // Register with backend (fire-and-forget)
      _registerSocialLogin(
        provider: 'apple',
        email: email,
        name: name,
        providerId: credential.userIdentifier,
      );

      debugPrint('[AppleSignIn] Prefs saved, navigating to home...');
      debugPrint('[AppleSignIn] mounted: $mounted');

      if (!mounted) return;
      Navigator.of(context).pushAndRemoveUntil(
        MaterialPageRoute(builder: (_) => const HomeWebViewPage()),
        (route) => false,
      );
      debugPrint('[AppleSignIn] Navigation done!');
    } catch (e, stack) {
      debugPrint('[AppleSignIn] ERROR: $e');
      debugPrint('[AppleSignIn] Stack: $stack');
      if (!mounted) return;
      if (e is SignInWithAppleAuthorizationException &&
          e.code == AuthorizationErrorCode.canceled) {
        debugPrint('[AppleSignIn] User cancelled');
        return;
      }
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Apple ile giriş başarısız: $e'),
          backgroundColor: Colors.red.shade700,
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_showWelcome == null) {
      // Loading state
      return const Scaffold(
        backgroundColor: Color(0xFF1A4A3A),
        body: Center(
          child: CircularProgressIndicator(color: Colors.white),
        ),
      );
    }

    if (_showWelcome!) {
      return WelcomeScreen(onContinue: _onWelcomeComplete);
    }

    return const HomeWebViewPage();
  }
}

/// Lightweight policy/terms viewer — AppBar with back button, no footer/breadcrumb.
class _PolicyViewerPage extends StatefulWidget {
  final String title;
  final String url;

  const _PolicyViewerPage({required this.title, required this.url});

  @override
  State<_PolicyViewerPage> createState() => _PolicyViewerPageState();
}

class _PolicyViewerPageState extends State<_PolicyViewerPage> {
  late final WebViewController _controller;
  bool _isLoading = true;

  static const String _injectJs =
      'var _s=document.createElement("style");'
      '_s.textContent=".mobile-bottom-nav{display:none!important}'
      '.global-topbar{display:none!important}'
      '.global-topline{display:none!important}'
      '.yr-footer{display:none!important}'
      '.auth-modal{display:none!important}'
      '.global-header-band{padding-top:1rem!important}";'
      'document.head.appendChild(_s);'
      'function _h(){document.querySelectorAll(".mobile-bottom-nav,.global-topbar,.global-topline,.yr-footer,.auth-modal").forEach(function(e){e.remove()})}'
      '_h();'
      'if(document.body){new MutationObserver(_h).observe(document.body,{childList:true,subtree:true});'
      'document.body.classList.remove("mobile-bottom-nav-visible")}';

  @override
  void initState() {
    super.initState();
    _controller = WebViewController()
      ..setJavaScriptMode(JavaScriptMode.unrestricted)
      ..setNavigationDelegate(
        NavigationDelegate(
          onPageStarted: (_) {
            _controller.runJavaScript(_injectJs);
          },
          onPageFinished: (_) {
            _controller.runJavaScript(_injectJs);
            if (mounted) setState(() => _isLoading = false);
          },
        ),
      )
      ..loadRequest(Uri.parse(widget.url));
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(
          widget.title,
          style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w500),
        ),
        backgroundColor: const Color(0xFF093827),
        foregroundColor: Colors.white,
        elevation: 0,
      ),
      body: Stack(
        children: [
          WebViewWidget(controller: _controller),
          if (_isLoading)
            const Center(
              child: CircularProgressIndicator(color: Color(0xFF13690C)),
            ),
        ],
      ),
    );
  }
}

/// Unified auth page — full-screen form for login or signup (no tabs).
class _AuthPage extends StatefulWidget {
  final String mode;
  final String title;

  const _AuthPage({required this.mode, required this.title});

  @override
  State<_AuthPage> createState() => _AuthPageState();
}

class _AuthPageState extends State<_AuthPage> {
  late final WebViewController _controller;
  bool _isLoading = true;

  String get _hideLoginForm => widget.mode == 'signup'
      ? '#globalLoginForm{display:none!important}'
      : '#globalSignupForm{display:none!important}#globalLoginSignupHint{display:none!important}';

  String get _injectJs =>
      'var _s=document.createElement("style");'
      '_s.textContent=".mobile-bottom-nav{display:none!important}'
      '.global-topbar{display:none!important}'
      '.global-topline{display:none!important}'
      '.global-header-band{display:none!important}'
      '.yr-footer{display:none!important}'
      'body>.texture{display:none!important}'
      'body>main,body>.content,body>section{display:none!important}'
      '.auth-modal{position:fixed!important;top:0!important;left:0!important;right:0!important;bottom:0!important;background:#fffaed!important;display:flex!important;align-items:flex-start!important;justify-content:center!important;z-index:99999!important}'
      '.auth-modal.is-hidden{display:flex!important}'
      '.auth-modal-panel{position:relative!important;width:100%!important;max-width:100%!important;margin:0!important;border-radius:0!important;box-shadow:none!important;min-height:100vh!important;padding-top:1rem!important}'
      '.auth-modal-close{display:none!important}'
      '.auth-mode-tabs{display:none!important}'
      '$_hideLoginForm'
      'body{background:#fffaed!important;overflow:auto!important}";'
      'document.head.appendChild(_s);'
      'function _h(){document.querySelectorAll(".mobile-bottom-nav,.global-topbar,.global-topline,.yr-footer,.global-header-band").forEach(function(e){e.remove()})}'
      '_h();'
      'if(document.body){new MutationObserver(_h).observe(document.body,{childList:true,subtree:true});'
      'document.body.classList.remove("mobile-bottom-nav-visible")}';

  Future<void> _onAuthSuccess() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setBool('welcome_seen', true);
    if (!mounted) return;
    Navigator.of(context).pushAndRemoveUntil(
      MaterialPageRoute(builder: (_) => const HomeWebViewPage()),
      (route) => false,
    );
  }

  @override
  void initState() {
    super.initState();
    _controller = WebViewController()
      ..setJavaScriptMode(JavaScriptMode.unrestricted)
      ..addJavaScriptChannel(
        'FlutterAuth',
        onMessageReceived: (message) {
          if (message.message == 'success') {
            _onAuthSuccess();
          }
        },
      )
      ..setNavigationDelegate(
        NavigationDelegate(
          onPageStarted: (_) {
            _controller.runJavaScript(_injectJs);
          },
          onPageFinished: (_) {
            _controller.runJavaScript(_injectJs);
            // Open modal + listen for auth success
            _controller.runJavaScript(
              'setTimeout(function(){'
              'if(window.ARAMABUL_AUTH_MODAL&&window.ARAMABUL_AUTH_MODAL.open){window.ARAMABUL_AUTH_MODAL.open("${widget.mode}");}'
              'document.addEventListener("aramabul:authchange",function(){FlutterAuth.postMessage("success");});'
              'var _m=document.querySelector("#globalAuthModal");'
              'if(_m){var _ob=new MutationObserver(function(){if(_m.classList.contains("is-hidden")){FlutterAuth.postMessage("success");}});'
              '_ob.observe(_m,{attributes:true,attributeFilter:["class"]});}'
              '},300);'
            );
            if (mounted) setState(() => _isLoading = false);
          },
        ),
      )
      ..loadRequest(Uri.parse('https://aramabul.com/'));
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(
          widget.title,
          style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w500),
        ),
        backgroundColor: const Color(0xFF093827),
        foregroundColor: Colors.white,
        elevation: 0,
      ),
      body: Stack(
        children: [
          WebViewWidget(controller: _controller),
          if (_isLoading)
            const Center(
              child: CircularProgressIndicator(color: Color(0xFF13690C)),
            ),
        ],
      ),
    );
  }
}

class HomeWebViewPage extends StatefulWidget {
  final String? initialPath;

  const HomeWebViewPage({super.key, this.initialPath});

  @override
  State<HomeWebViewPage> createState() => _HomeWebViewPageState();
}

class _HomeWebViewPageState extends State<HomeWebViewPage> {
  late final WebViewController _controller;
  bool _isLoading = true;
  int _progress = 0;
  String? _lastError;
  bool _hasLoadedAtLeastOnce = false;
  bool _isOffline = false;

  // ---------------------------------------------------------------------------
  // URL helpers
  // ---------------------------------------------------------------------------

  bool _isMapLikeUrl(Uri uri, String rawUrl) {
    final scheme = uri.scheme.toLowerCase();
    final host = uri.host.toLowerCase();
    final path = uri.path.toLowerCase();
    final raw = rawUrl.toLowerCase();

    if (scheme == 'intent' || scheme == 'geo' || scheme == 'comgooglemaps') {
      return true;
    }
    if (host.contains('maps.google.') || host == 'maps.app.goo.gl') {
      return true;
    }
    if (host.contains('google.com') && path.startsWith('/maps')) {
      return true;
    }
    return raw.contains('google.com/maps') || raw.contains('maps.app.goo.gl');
  }

  Uri _resolveExternalUri(String rawUrl) {
    final raw = rawUrl.trim();
    if (raw.toLowerCase().startsWith('intent://')) {
      final intentPrefix = 'intent://';
      final intentIndex = raw.indexOf('#Intent;');
      final body = intentIndex >= 0 ? raw.substring(0, intentIndex) : raw;
      final meta = intentIndex >= 0 ? raw.substring(intentIndex) : '';
      final defaultHostPath = body.substring(intentPrefix.length);
      var scheme = 'https';
      final schemeMatch = RegExp(r';scheme=([^;]+);').firstMatch(meta);
      if (schemeMatch != null) {
        scheme = (schemeMatch.group(1) ?? 'https').trim();
      }
      return Uri.parse('$scheme://$defaultHostPath');
    }
    return Uri.parse(raw);
  }

  bool _isDeepLink(Uri uri) {
    final host = uri.host.toLowerCase();
    return host == kDeepLinkHost || host == kDeepLinkHostWww;
  }

  Future<NavigationDecision> _onNavigationRequest(
    NavigationRequest request,
  ) async {
    final rawUrl = request.url.trim();
    final parsed = Uri.tryParse(rawUrl);
    if (parsed == null) return NavigationDecision.navigate;

    // Deep links from aramabul.com stay in WebView.
    if (_isDeepLink(parsed)) return NavigationDecision.navigate;

    final scheme = parsed.scheme.toLowerCase();
    final shouldOpenExternally = _isMapLikeUrl(parsed, rawUrl) ||
        (scheme != 'http' &&
            scheme != 'https' &&
            scheme != 'about' &&
            scheme != 'file' &&
            scheme != 'data' &&
            scheme != 'javascript');

    if (!shouldOpenExternally) return NavigationDecision.navigate;

    Uri externalUri;
    try {
      externalUri = _resolveExternalUri(rawUrl);
    } catch (error) {
      debugPrint('Dis URL cozumleme hatasi: $error');
      return NavigationDecision.prevent;
    }
    await launchUrl(externalUri, mode: LaunchMode.externalApplication);
    return NavigationDecision.prevent;
  }

  // ---------------------------------------------------------------------------
  // Geolocation permission
  // ---------------------------------------------------------------------------

  Future<void> _requestLocationPermission() async {
    final status = await Permission.locationWhenInUse.request();
    debugPrint('Location permission: $status');
  }

  // ---------------------------------------------------------------------------
  // JS ↔ Dart bridge
  // ---------------------------------------------------------------------------

  /// Inject a JavaScript channel so the web code can call into Dart.
  ///
  /// From JS:  AramaBulAndroid.postMessage(JSON.stringify({action:'...'}))
  void _setupJsBridge() {
    _controller.addJavaScriptChannel(
      'AramaBulAndroid',
      onMessageReceived: (JavaScriptMessage message) {
        _handleJsMessage(message.message);
      },
    );
  }

  void _handleJsMessage(String raw) {
    try {
      final data = jsonDecode(raw) as Map<String, dynamic>;
      final action = data['action'] as String? ?? '';

      switch (action) {
        case 'getAppInfo':
          // Reply with app info so web can adapt its UI.
          _controller.runJavaScript(
            'window.__ARAMABUL_APP__ = ${jsonEncode({
                  'platform': 'android',
                  'version': kAppVersion,
                  'isApp': true,
                })}',
          );
          break;
        case 'shareVenue':
          // Native share sheet
          final title = data['title'] as String? ?? 'AramaBul';
          final url = data['url'] as String? ?? kLiveUrl;
          // Use platform channel or url_launcher for basic share
          launchUrl(Uri.parse('https://wa.me/?text=${Uri.encodeComponent('$title $url')}'),
              mode: LaunchMode.externalApplication);
          break;
        default:
          debugPrint('Unknown JS action: $action');
      }
    } catch (e) {
      debugPrint('JS bridge parse error: $e');
    }
  }

  /// After every page load, inject a global flag so the web code knows
  /// it is running inside the Android app.
  /// Also inject CSS overrides for app-specific visual fixes.
  Future<void> _injectAppFlag() async {
    await _controller.runJavaScript('''
      window.__ARAMABUL_APP__ = {
        platform: 'android',
        version: '$kAppVersion',
        isApp: true
      };

      // Inject app-specific CSS fixes
      if (!document.getElementById('aramabul-app-css')) {
        var style = document.createElement('style');
        style.id = 'aramabul-app-css';
        style.textContent = 
          'body { background: #497676 !important; }' +
          '.global-header-band { display: none !important; }' +
          '.hero { padding-top: 0 !important; }' +
          '.hero-content { background: transparent !important; border: none !important; box-shadow: none !important; border-radius: 0 !important; padding: 0 !important; }' +
          '.istanbul-discovery-copy, .istanbul-discovery-hero-card, .istanbul-filter-card { border: none !important; background: transparent !important; box-shadow: none !important; border-radius: 0 !important; }' +
          '.home-category-band, .home-featured-band, .home-category-shell, .home-subcat-grid-wrap, .istanbul-results-shell { border: none !important; background: transparent !important; box-shadow: none !important; border-radius: 0 !important; }' +
          '.istanbul-venue-card { background: #f4dfc8 !important; border-color: #f4dfc8 !important; }' +
          '.home-subcat-chip { background: #f4dfc8 !important; border-color: #d4c4a8 !important; }' +
          '.top-city-card, .category-home-card { background: #f4dfc8 !important; }' +
          '.istanbul-discovery-hero-label { background: #f4dfc8 !important; }' +
          '.venue-detail-main-card, .venue-detail-side-card { background: #f4dfc8 !important; border-color: #e8d4b8 !important; border-radius: 8px !important; }' +
          '.venue-detail-media, .venue-detail-info, .venue-detail-reviews, .venue-detail-review-form { background: #f4dfc8 !important; border-color: #f4dfc8 !important; }' +
          '.section-head h1, .section-head h2, .section-head h3, .province-head h1, .province-head h2, .province-head h3, .istanbul-discovery-copy h1, .istanbul-discovery-copy h2 { color: #cccccc !important; font-weight: 700 !important; }' +
          '.istanbul-discovery-kicker, .istanbul-breadcrumb, .istanbul-breadcrumb a, .istanbul-breadcrumb a:visited, .istanbul-breadcrumb span, .istanbul-discovery-subline, .istanbul-discovery-location-note { color: #cccccc !important; }' +
          '.mobile-bottom-nav { background: #497676 !important; }' +
          '.mobile-bottom-nav-btn.is-active .mobile-bottom-nav-icon-svg { color: #3c4b49 !important; }' +
          '.mobile-bottom-nav-btn.is-active .mobile-bottom-nav-label { color: #3c4b49 !important; }' +
          '.mobile-bottom-nav-btn.is-active svg path { fill: #3c4b49 !important; }' +
          '.mobile-bottom-nav-btn[aria-current] .mobile-bottom-nav-icon-svg { color: #3c4b49 !important; }' +
          '.mobile-bottom-nav-btn[aria-current] .mobile-bottom-nav-label { color: #3c4b49 !important; }' +
          '.mobile-bottom-nav-btn[aria-current] svg path { fill: #3c4b49 !important; }' +
          '.global-footer, .global-footer-band, .footer-band { background: transparent !important; border: none !important; color: #cccccc !important; }' +
          '.global-footer a, .global-footer-band a, .footer-band a { color: #cccccc !important; }';
        document.head.appendChild(style);
      }

      // Hide signin icon + 4-column grid
      if (!document.getElementById('aramabul-app-nav-css')) {
        var navStyle = document.createElement('style');
        navStyle.id = 'aramabul-app-nav-css';
        navStyle.textContent = 
          '.mobile-bottom-nav-btn[data-mobile-nav="signin"] { display: none !important; }' +
          '.mobile-bottom-nav-actions { grid-template-columns: repeat(4, minmax(0, 1fr)) !important; }';
        document.head.appendChild(navStyle);
      }

      // Keep Android footer order as: home, search, favorites, profile.
      var mobileNav = document.querySelector('.mobile-bottom-nav-actions');
      if (mobileNav) {
        var searchBtn = mobileNav.querySelector('[data-mobile-nav="search"]');
        var favoritesBtn = mobileNav.querySelector('[data-mobile-nav="favorites"]');
        if (searchBtn && favoritesBtn && (searchBtn.compareDocumentPosition(favoritesBtn) & Node.DOCUMENT_POSITION_PRECEDING)) {
          mobileNav.insertBefore(searchBtn, favoritesBtn);
        }
        // Replace favorites star icon with fav.png heart
        if (favoritesBtn && !favoritesBtn.dataset.iconSwapped) {
          favoritesBtn.dataset.iconSwapped = '1';
          var chip = favoritesBtn.querySelector('.mobile-bottom-nav-chip');
          if (chip) { chip.classList.remove('icon-load-failed'); }
          var iconImg = favoritesBtn.querySelector('.mobile-bottom-nav-icon-img');
          if (iconImg) {
            iconImg.src = 'https://aramabul.com/assets/fav.png';
            iconImg.style.display = 'block';
            iconImg.style.width = '22px';
            iconImg.style.height = '22px';
          }
          var iconSvg = favoritesBtn.querySelector('.mobile-bottom-nav-icon-svg');
          if (iconSvg) { iconSvg.style.display = 'none'; }
        }

        // Force active nav icon color to #3c4b49
        mobileNav.querySelectorAll('.mobile-bottom-nav-btn').forEach(function(btn) {
          var isActive = btn.classList.contains('is-active') || btn.hasAttribute('aria-current') || btn.dataset.mobileNav === 'home';
          if (isActive) {
            var svgPaths = btn.querySelectorAll('svg path');
            svgPaths.forEach(function(p) { p.setAttribute('fill', '#3c4b49'); p.setAttribute('stroke', '#3c4b49'); });
            var label = btn.querySelector('.mobile-bottom-nav-label');
            if (label) { label.style.color = '#3c4b49'; }
            var svgEl = btn.querySelector('.mobile-bottom-nav-icon-svg');
            if (svgEl) { svgEl.style.color = '#3c4b49'; }
          }
        });
      }

      // Hide header language switch and apply selected language
      var langSwitch = document.querySelector('.lang-switch');
      if (langSwitch) { langSwitch.style.display = 'none'; }

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
        wm.innerHTML = '<span style="color:#093827">arama</span>bul';
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
    ''');
  }

  // ---------------------------------------------------------------------------
  // Connectivity
  // ---------------------------------------------------------------------------

  late final StreamSubscription<List<ConnectivityResult>> _connectivitySub;

  void _startConnectivityWatch() {
    _connectivitySub = Connectivity().onConnectivityChanged.listen((results) {
      final offline = results.every((r) => r == ConnectivityResult.none);
      if (!mounted) return;
      if (offline != _isOffline) {
        setState(() => _isOffline = offline);
        if (!offline && _lastError != null) {
          _reload();
        }
      }
    });
  }

  Future<bool> _checkConnectivity() async {
    final results = await Connectivity().checkConnectivity();
    return results.any((r) => r != ConnectivityResult.none);
  }

  // ---------------------------------------------------------------------------
  // Lifecycle
  // ---------------------------------------------------------------------------

  @override
  void initState() {
    super.initState();

    _startConnectivityWatch();

    _controller = WebViewController()
      ..setJavaScriptMode(JavaScriptMode.unrestricted)
      ..setNavigationDelegate(
        NavigationDelegate(
          onNavigationRequest: _onNavigationRequest,
          onPageStarted: (_) {
            if (!mounted) return;
            setState(() {
              _isLoading = true;
              _lastError = null;
            });
          },
          onPageFinished: (_) {
            if (!mounted) return;
            setState(() {
              _isLoading = false;
              _lastError = null;
              _hasLoadedAtLeastOnce = true;
            });
            // Inject the app flag every time a page finishes loading.
            _injectAppFlag();
          },
          onProgress: (value) {
            if (!mounted) return;
            setState(() => _progress = value);
          },
          onWebResourceError: (error) {
            if (error.isForMainFrame != true) return;
            if (_hasLoadedAtLeastOnce) return;
            if (!mounted) return;
            setState(() {
              _lastError = error.description;
              _isLoading = false;
            });
          },
        ),
      );

    // JS bridge
    _setupJsBridge();

    final platformController = _controller.platform;
    if (!kIsWeb && defaultTargetPlatform == TargetPlatform.android) {
      _controller.setBackgroundColor(const Color(0xFFFFFAED));
    }
    if (platformController is AndroidWebViewController) {
      AndroidWebViewController.enableDebugging(true);
      platformController.setMediaPlaybackRequiresUserGesture(false);

      platformController.setGeolocationPermissionsPromptCallbacks(
        onShowPrompt: (request) async {
          await _requestLocationPermission();
          final status = await Permission.locationWhenInUse.status;
          return GeolocationPermissionsResponse(
            allow: status.isGranted,
            retain: true,
          );
        },
        onHidePrompt: () {},
      );

      platformController.setOnShowFileSelector((params) async {
        return [];
      });
    }

    _loadInitialPage();
  }

  @override
  void dispose() {
    _connectivitySub.cancel();
    super.dispose();
  }

  /// Smart loading: try live URL first, fall back to bundled assets if offline.
  Future<void> _loadInitialPage() async {
    try {
      final online = await _checkConnectivity();
      if (online) {
        final path = widget.initialPath ?? '';
        final url = path.isNotEmpty ? '$kLiveUrl$path' : kLiveUrl;
        await _controller.loadRequest(Uri.parse(url));
      } else {
        await _loadBundledPage();
      }
    } catch (error) {
      if (!mounted) return;
      // If live URL fails, try bundled fallback.
      try {
        await _loadBundledPage();
      } catch (e2) {
        if (!mounted) return;
        setState(() {
          _isLoading = false;
          _lastError = e2.toString();
        });
      }
    }
  }

  Future<void> _loadBundledPage() async {
    await _controller.loadFlutterAsset(kBundledEntryAssetPath);
  }

  Future<void> _reload() async {
    setState(() {
      _isLoading = true;
      _lastError = null;
    });
    try {
      final online = await _checkConnectivity();
      if (online && !_hasLoadedAtLeastOnce) {
        await _controller.loadRequest(Uri.parse(kLiveUrl));
      } else if (_hasLoadedAtLeastOnce) {
        await _controller.reload();
      } else {
        await _loadBundledPage();
      }
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _isLoading = false;
        _lastError = e.toString();
      });
    }
  }

  Future<bool> _onBackPressed() async {
    if (await _controller.canGoBack()) {
      await _controller.goBack();
      return false;
    }
    return true;
  }

  // ---------------------------------------------------------------------------
  // UI
  // ---------------------------------------------------------------------------

  @override
  Widget build(BuildContext context) {
    final showProgress = _isLoading && _progress < 100;

    // Match status bar to the web header color
    SystemChrome.setSystemUIOverlayStyle(const SystemUiOverlayStyle(
      statusBarColor: Color(0xFF497676),
      statusBarIconBrightness: Brightness.dark,
    ));

    return PopScope(
      canPop: false,
      onPopInvokedWithResult: (didPop, result) async {
        if (didPop) return;
        final shouldPop = await _onBackPressed();
        if (shouldPop && context.mounted) {
          SystemNavigator.pop();
        }
      },
      child: Scaffold(
        backgroundColor: const Color(0xFFFDEFD6),
        body: Column(
          children: [
            // Status bar safe padding with matching color
            Container(
              color: const Color(0xFFFDEFD6),
              height: MediaQuery.of(context).padding.top,
            ),
            if (_isOffline)
              Container(
                width: double.infinity,
                color: Colors.orange.shade800,
                padding: const EdgeInsets.symmetric(vertical: 6),
                child: const Text(
                  'İnternet bağlantısı yok',
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 13,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ),
            if (showProgress)
              LinearProgressIndicator(
                value: _progress / 100,
                color: const Color(0xFF1F6F54),
                backgroundColor: const Color(0xFFFDEFD6),
              ),
            Expanded(
              child: Stack(
                children: [
                  WebViewWidget(controller: _controller),
                  if (_lastError != null) _buildErrorOverlay(),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildErrorOverlay() {
    return Container(
      color: const Color(0xFFFFFAED),
      child: Center(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Card(
            elevation: 4,
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(16),
            ),
            child: Padding(
              padding: const EdgeInsets.all(24),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Icon(
                    _isOffline
                        ? Icons.wifi_off_rounded
                        : Icons.error_outline_rounded,
                    size: 56,
                    color: _isOffline
                        ? Colors.orange.shade700
                        : Colors.red.shade400,
                  ),
                  const SizedBox(height: 16),
                  Text(
                    _isOffline ? 'Bağlantı Kesildi' : 'Sayfa Yüklenemedi',
                    style: const TextStyle(
                      fontSize: 20,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    _isOffline
                        ? 'İnternet bağlantınızı kontrol edin.\nBağlantı sağlandığında otomatik yüklenecektir.'
                        : _lastError ?? 'Bilinmeyen hata',
                    textAlign: TextAlign.center,
                    style: TextStyle(fontSize: 14, color: Colors.grey.shade700),
                  ),
                  const SizedBox(height: 20),
                  FilledButton.icon(
                    onPressed: _reload,
                    icon: const Icon(Icons.refresh_rounded),
                    label: const Text('Tekrar Dene'),
                    style: FilledButton.styleFrom(
                      backgroundColor: const Color(0xFF1F6F54),
                      minimumSize: const Size(180, 48),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12),
                      ),
                    ),
                  ),
                  const SizedBox(height: 12),
                  Text(
                    'AramaBul — Mekan Keşfet',
                    textAlign: TextAlign.center,
                    style: TextStyle(fontSize: 12, color: Colors.grey.shade500),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}
