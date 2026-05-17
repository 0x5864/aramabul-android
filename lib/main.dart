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
import 'package:google_mobile_ads/google_mobile_ads.dart';

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
  // Initialize AdMob SDK
  await MobileAds.instance.initialize();
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
        colorScheme: ColorScheme.fromSeed(seedColor: const Color(0xFF425921)),
        scaffoldBackgroundColor: const Color(0xFF729875),
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
            backgroundColor: Color(0xFF729875),
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
        webAuthenticationOptions: WebAuthenticationOptions(
          clientId: 'com.aramabul.app.signin',
          redirectUri: Uri.parse('https://aramabul.com/api/auth/apple-callback'),
        ),
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
        backgroundColor: Color(0xFF729875),
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
        backgroundColor: const Color(0xFF729875),
        foregroundColor: Colors.white,
        elevation: 0,
      ),
      body: Stack(
        children: [
          WebViewWidget(controller: _controller),
          if (_isLoading)
            const Center(
              child: CircularProgressIndicator(color: Color(0xFF425921)),
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
        backgroundColor: const Color(0xFF729875),
        foregroundColor: Colors.white,
        elevation: 0,
      ),
      body: Stack(
        children: [
          WebViewWidget(controller: _controller),
          if (_isLoading)
            const Center(
              child: CircularProgressIndicator(color: Color(0xFF425921)),
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
  bool _isPageTransitioning = false;
  bool _isOffline = false;

  // ---------------------------------------------------------------------------
  // AdMob
  // ---------------------------------------------------------------------------
  static const String _bannerAdUnitId = 'ca-app-pub-3016888060216617/1160159725';
  static const String _interstitialAdUnitId = 'ca-app-pub-3016888060216617/4706248955';
  BannerAd? _bannerAd;
  bool _isBannerReady = false;
  InterstitialAd? _interstitialAd;
  int _pageNavigationCount = 0;
  static const int _interstitialInterval = 10; // Show interstitial every N pages

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
    // Read auth from SharedPreferences to sync with WebView
    final prefs = await SharedPreferences.getInstance();
    final authName = prefs.getString('auth_user_name') ?? '';
    final authEmail = prefs.getString('auth_user_email') ?? '';
    final authSessionJson = (authName.isNotEmpty && authEmail.isNotEmpty)
        ? '{"name":"${authName.replaceAll('"', '\\"')}","email":"${authEmail.replaceAll('"', '\\"')}"}'
        : '';

    await _controller.runJavaScript('''
      window.__ARAMABUL_APP__ = {
        platform: 'android',
        version: '$kAppVersion',
        isApp: true
      };

      // Sync auth session from native app to WebView localStorage
      ${authSessionJson.isNotEmpty ? "try { localStorage.setItem('aramabul.auth.session.v1', '$authSessionJson'); document.dispatchEvent(new CustomEvent('aramabul:authchange')); } catch(e) {}" : ""}

      // Inject app-specific CSS fixes
      if (!document.getElementById('aramabul-app-css')) {
        var style = document.createElement('style');
        style.id = 'aramabul-app-css';
        style.textContent = 
          '@import url("https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap");' +
          'body, * { font-family: "Plus Jakarta Sans", sans-serif !important; }' +
          'body { background: #729875 !important; }' +
          '.global-header-band { display: none !important; height: 0 !important; overflow: hidden !important; font-size: 0 !important; line-height: 0 !important; }' +
          '.global-topline { display: none !important; }' +
          '.home-hero-search { display: none !important; }' +
          '.texture { font-size: 0 !important; line-height: 0 !important; }' +
          '.hero { padding-top: 0 !important; }' +
          '.hero-content { background: transparent !important; border: none !important; box-shadow: none !important; border-radius: 0 !important; padding: 0 !important; }' +
          '.istanbul-discovery-shell { background: transparent !important; }' +
          '.istanbul-discovery-copy, .istanbul-discovery-hero-card { border: none !important; background: transparent !important; box-shadow: none !important; border-radius: 0 !important; }' +
          '.istanbul-results-shell { background: transparent !important; border: none !important; box-shadow: none !important; border-radius: 0 !important; padding: 0 8px !important; }' +
          '.istanbul-filter-card { background: transparent !important; border: none !important; box-shadow: none !important; border-radius: 0 !important; padding: 0 !important; overflow: visible !important; }' +
          '.istanbul-filter-body, .istanbul-filter-yeme-icme-sidebar, .istanbul-filter-yeme-icme-sidebar--gezi-two-up { overflow: visible !important; }' +
          '.istanbul-filter-location-box, .istanbul-filter-section-box { background: #d5e8d3 !important; border: 1px solid #c2d8c0 !important; border-radius: 4px !important; padding: 12px !important; margin-bottom: 8px !important; overflow: visible !important; position: relative !important; }' +
          '.istanbul-filter-location-box { z-index: 200 !important; }' +
          '.istanbul-filter-section-box { z-index: 100 !important; }' +
          '.kesfet-category-dropdown-btn, .lang-switch-btn { display: flex !important; align-items: center !important; justify-content: space-between !important; width: 100% !important; background: #ffffff !important; color: #011d36 !important; border: 1px solid rgba(164,179,181,0.82) !important; border-radius: 6px !important; padding: 0.5rem 0.65rem !important; font-size: 0.84rem !important; cursor: pointer !important; box-sizing: border-box !important; }' +
          '.istanbul-filter-field { display: block !important; margin-bottom: 6px !important; }' +
          '.istanbul-filter-field > span { display: block !important; margin-bottom: 4px !important; font-size: 0.82rem !important; color: #011d36 !important; }' +
          '.istanbul-filter-location-box .kesfet-category-dropdown, .istanbul-filter-section-box .kesfet-category-dropdown { position: relative !important; z-index: 1200 !important; }' +
          '.kesfet-category-dropdown-menu { position: absolute !important; left: 0 !important; top: calc(100% + 4px) !important; width: max-content !important; min-width: 100% !important; max-width: calc(100vw - 24px) !important; background: #ffffff !important; border: 1px solid #c2d8c0 !important; border-radius: 6px !important; box-shadow: 0 4px 16px rgba(0,0,0,0.12) !important; z-index: 1200 !important; overflow-y: auto !important; max-height: 50vh !important; display: flex !important; flex-direction: column !important; padding: 0 !important; }' +
          '.kesfet-category-dropdown-menu[hidden] { display: none !important; }' +
          '.kesfet-category-dropdown.is-open .kesfet-category-dropdown-menu { display: flex !important; }' +
          '.lang-switch-menu { position: absolute !important; background: #ffffff !important; border: 1px solid #c2d8c0 !important; border-radius: 6px !important; box-shadow: 0 4px 16px rgba(0,0,0,0.12) !important; z-index: 1200 !important; overflow-y: auto !important; max-height: 50vh !important; }' +
          '.lang-switch-menu[hidden] { display: none !important; }' +
          '.featured-venues-section { background: transparent !important; border: none !important; box-shadow: none !important; border-radius: 0 !important; padding-left: 0 !important; padding-right: 0 !important; padding-bottom: 0 !important; }' +
          '.featured-venues-panel { background: transparent !important; border: none !important; box-shadow: none !important; border-radius: 0 !important; padding: 0 !important; margin: 0 !important; }' +
          '.featured-venues-grid { background: transparent !important; border: none !important; box-shadow: none !important; border-radius: 0 !important; padding: 0 !important; margin: 0 !important; }' +
          '.content-guide { background: #d5e8d3 !important; border: none !important; box-shadow: none !important; border-radius: 4px !important; padding: 16px !important; margin-top: 12px !important; }' +
          '.home-empty-box { background: transparent !important; border: none !important; box-shadow: none !important; border-radius: 0 !important; padding: 0 !important; }' +
          '.home-subcategory-list { background: transparent !important; border: none !important; box-shadow: none !important; border-radius: 0 !important; display: grid !important; grid-template-columns: repeat(3, 1fr) !important; gap: 0.5rem !important; }' +
          '.home-subcat-chip { border-radius: 8px !important; padding: 0.5rem 0.25rem !important; font-size: 0.8rem !important; }' +
          '.content-guide h2, .content-guide h3, .content-guide p, .content-guide li, .content-guide strong { color: #000 !important; }' +
          '.home-top-category-row { background: transparent !important; display: grid !important; grid-template-columns: repeat(3, 1fr) !important; gap: 0.5rem !important; }' +
          '.istanbul-venue-card { background: #d5e8d3 !important; border-color: #d5e8d3 !important; }' +
          '.istanbul-results-grid { padding: 0 !important; }' +
          '.home-subcat-chip { background: #d5e8d3 !important; border-color: #c2d8c0 !important; }' +
          '.category-home-card .top-city-thumb { display: none !important; }' +
          '.top-city-card, .category-home-card { background: #2b4249 !important; border-radius: 8px !important; padding: 0.5rem 0.25rem !important; min-height: auto !important; aspect-ratio: auto !important; color: #f5e6d0 !important; }' +
          '.category-home-card .top-city-content { position: static !important; padding: 0 !important; text-align: center !important; }' +
          '.top-city-name { font-size: 0.8rem !important; font-weight: 400 !important; color: #f5e6d0 !important; }' +
          '.istanbul-discovery-hero-label { background: #d5e8d3 !important; }' +
          '.istanbul-venue-tag { background: #d5e8d3 !important; border-color: #c2d8c0 !important; }' +
          '.istanbul-filter-nearby-panel-button, .istanbul-discovery-primary-button { background: #425921 !important; border-color: #425921 !important; color: #fff !important; }' +
          '.venue-detail-main-card, .venue-detail-side-card { background: #d5e8d3 !important; border-color: #c2d8c0 !important; border-radius: 4px !important; }' +
          '.venue-detail-media, .venue-detail-info, .venue-detail-reviews, .venue-detail-review-form { background: #d5e8d3 !important; border-color: #d5e8d3 !important; }' +
          '.section-head h1, .section-head h2, .section-head h3, .province-head h1, .province-head h2, .province-head h3, .istanbul-discovery-copy h1, .istanbul-discovery-copy h2 { color: #093826 !important; font-weight: 700 !important; margin-bottom: 0.75rem !important; }' +
          '.istanbul-discovery-kicker, .istanbul-breadcrumb, .istanbul-breadcrumb a, .istanbul-breadcrumb a:visited, .istanbul-breadcrumb span, .istanbul-discovery-subline, .istanbul-discovery-location-note { color: #ffffff !important; }' +
          '.istanbul-results-meta, .istanbul-results-state { color: #ffffff !important; }' +
          '.mobile-bottom-nav { background: #729875 !important; }' +
          '.mobile-bottom-nav-btn .mobile-bottom-nav-chip { filter: brightness(10) !important; }' +
          '.mobile-bottom-nav-btn .mobile-bottom-nav-label { color: #ffffff !important; }' +
          '.mobile-bottom-nav-btn.active .mobile-bottom-nav-chip { filter: brightness(0.3) !important; }' +
          '.mobile-bottom-nav-btn.active .mobile-bottom-nav-label { color: #3c4b49 !important; }' +
          '.global-footer, .global-footer-band, .footer-band, .yr-footer { background: transparent !important; border: none !important; color: #ffffff !important; }' +
          '.global-footer a, .global-footer-band a, .footer-band a, .yr-footer a { color: #ffffff !important; }' +
          '.yr-footer h4 { color: #ffffff !important; }' +
          '.settings-shell, .settings-layout { background: transparent !important; border: none !important; box-shadow: none !important; }' +
          '.settings-page .hero, .settings-page .settings-shell { padding-top: 2rem !important; }' +
          '.settings-card, .settings-panel-card, .settings-sidebar-card { background: #d5e8d3 !important; border-color: #c2d8c0 !important; border-radius: 4px !important; }' +
          '.settings-feedback-field input, .settings-feedback-field textarea, .settings-feedback-field select, .settings-signup-field input, .settings-feedback-phone-group input { background: #fff !important; color: #000 !important; }' +
          '.search-page-shell { background: transparent !important; border: none !important; box-shadow: none !important; }' +
          '.search-page-note { display: none !important; }' +
          '.search-page .hero { padding-top: 3rem !important; }' +
          '.header-search-btn, .istanbul-discovery-primary-button, .istanbul-filter-nearby-panel-button, .settings-feedback-submit, .settings-signout { background: #425921 !important; border-color: #425921 !important; color: #fff !important; }' +
          '.store-badge { background: #0f2d1f !important; border-color: #0f2d1f !important; color: #fff !important; }' +
          '.header-search-btn:hover, .istanbul-discovery-primary-button:hover { background: #354a1a !important; }' +
          '.istanbul-pagination-button { background: #425921 !important; border-color: #425921 !important; color: #fff !important; }' +
          '.istanbul-pagination-current { background: #729875 !important; border-color: #729875 !important; color: #fff !important; }' +
          '.istanbul-results-mode { display: none !important; }' +
          '.istanbul-venue-distance { background: transparent !important; }' +
          '.istanbul-venue-distance::before { background-color: transparent !important; }' +
          '.istanbul-favorite-button { background: #f4f5f5 !important; border: 1px solid #dcdede !important; color: #011d36 !important; border-radius: 4px !important; }' +
          '#favoritesTitle { color: #093826 !important; }' +
          '.istanbul-results-head h2 { color: #093826 !important; }' +
          '.kesfet-category-dropdown-options { gap: 0 !important; padding: 0 !important; margin: 0 !important; }' +
          '.kesfet-category-dropdown-options .istanbul-filter-chip, .kesfet-category-dropdown-options .istanbul-mvp-subcategory-box { border-radius: 0 !important; border: none !important; border-bottom: 1px solid rgba(164,179,181,0.35) !important; background: transparent !important; padding: 0.56rem 0.65rem !important; transition: background 0.15s ease !important; }' +
          '.kesfet-category-dropdown-options .istanbul-filter-chip:last-child, .kesfet-category-dropdown-options .istanbul-mvp-subcategory-box:last-child { border-bottom: none !important; }' +
          '.kesfet-category-dropdown-options .istanbul-mvp-subcategory-box.is-active { background: rgba(9,56,38,0.08) !important; color: #093826 !important; font-weight: 500 !important; }';
        document.head.appendChild(style);
      }

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
        // Also use MutationObserver for dynamic elements
        if (window.MutationObserver) {
          var obs = new MutationObserver(function() { applyFix(); });
          obs.observe(document.body || document.documentElement, { childList: true, subtree: true });
          setTimeout(function() { obs.disconnect(); }, 8000);
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

        // Force active nav icon color to #3c4b49, non-active white
        mobileNav.querySelectorAll('.mobile-bottom-nav-btn').forEach(function(btn) {
          var isActive = btn.classList.contains('active');
          if (isActive) {
            btn.style.filter = 'brightness(0.25)';
            var label = btn.querySelector('.mobile-bottom-nav-label');
            if (label) { label.style.color = '#3c4b49'; }
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
    _loadBannerAd();
    _loadInterstitialAd();
    // Request location permission early so WebView geolocation works immediately
    _requestLocationPermission();

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
              _isPageTransitioning = true;
            });
            // Early CSS injection to minimize flash of unstyled content
            _injectAppFlag();
          },
          onPageFinished: (_) {
            if (!mounted) return;
            // Re-inject to ensure all styles are applied
            _injectAppFlag();
            // Track page navigations for interstitial ads
            _pageNavigationCount++;
            if (_pageNavigationCount > 1 && _pageNavigationCount % _interstitialInterval == 0) {
              _showInterstitialAd();
            }
            // Small delay to let CSS paint before revealing
            Future.delayed(const Duration(milliseconds: 150), () {
              if (!mounted) return;
              setState(() {
                _isLoading = false;
                _lastError = null;
                _hasLoadedAtLeastOnce = true;
                _isPageTransitioning = false;
              });
            });
            // Trigger geolocation early so distance hints appear on category pages
            Future.delayed(const Duration(milliseconds: 500), () {
              _controller.runJavaScript('''
                if (navigator.geolocation && typeof requestDistanceHints === 'function') {
                  requestDistanceHints();
                } else if (navigator.geolocation) {
                  navigator.geolocation.getCurrentPosition(function(){}, function(){}, {timeout:5000, maximumAge:120000});
                }
              ''');
            });
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
      _controller.setBackgroundColor(const Color(0xFF729875));
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

  // ---------------------------------------------------------------------------
  // AdMob: Banner
  // ---------------------------------------------------------------------------
  void _loadBannerAd() {
    _bannerAd = BannerAd(
      adUnitId: _bannerAdUnitId,
      size: AdSize.banner,
      request: const AdRequest(),
      listener: BannerAdListener(
        onAdLoaded: (ad) {
          if (!mounted) return;
          setState(() => _isBannerReady = true);
          debugPrint('[AdMob] Banner loaded');
        },
        onAdFailedToLoad: (ad, error) {
          debugPrint('[AdMob] Banner failed: ${error.message}');
          ad.dispose();
          _bannerAd = null;
          _isBannerReady = false;
          // Retry after 60 seconds
          Future.delayed(const Duration(seconds: 60), () {
            if (mounted) _loadBannerAd();
          });
        },
      ),
    )..load();
  }

  // ---------------------------------------------------------------------------
  // AdMob: Interstitial
  // ---------------------------------------------------------------------------
  void _loadInterstitialAd() {
    InterstitialAd.load(
      adUnitId: _interstitialAdUnitId,
      request: const AdRequest(),
      adLoadCallback: InterstitialAdLoadCallback(
        onAdLoaded: (ad) {
          _interstitialAd = ad;
          debugPrint('[AdMob] Interstitial loaded');
        },
        onAdFailedToLoad: (error) {
          debugPrint('[AdMob] Interstitial failed: ${error.message}');
          _interstitialAd = null;
          // Retry after 60 seconds
          Future.delayed(const Duration(seconds: 60), () {
            if (mounted) _loadInterstitialAd();
          });
        },
      ),
    );
  }

  void _showInterstitialAd() {
    if (_interstitialAd == null) return;
    _interstitialAd!.fullScreenContentCallback = FullScreenContentCallback(
      onAdDismissedFullScreenContent: (ad) {
        ad.dispose();
        _loadInterstitialAd(); // Pre-load next one
      },
      onAdFailedToShowFullScreenContent: (ad, error) {
        debugPrint('[AdMob] Interstitial show failed: ${error.message}');
        ad.dispose();
        _loadInterstitialAd();
      },
    );
    _interstitialAd!.show();
    _interstitialAd = null;
  }

  @override
  void dispose() {
    _connectivitySub.cancel();
    _bannerAd?.dispose();
    _interstitialAd?.dispose();
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
      statusBarColor: Color(0xFF729875),
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
        backgroundColor: const Color(0xFF729875),
        body: Column(
          children: [
            // Status bar safe padding with matching color
            Container(
              color: const Color(0xFF729875),
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
                color: const Color(0xFF425921),
                backgroundColor: const Color(0xFF729875),
              ),
            Expanded(
              child: Stack(
                children: [
                  WebViewWidget(controller: _controller),
                  if (_lastError != null) _buildErrorOverlay(),
                  // Theme overlay to prevent flash of unstyled content
                  if (_isPageTransitioning && _hasLoadedAtLeastOnce)
                    Positioned.fill(
                      child: AnimatedOpacity(
                        opacity: _isPageTransitioning ? 1.0 : 0.0,
                        duration: const Duration(milliseconds: 200),
                        child: Container(color: const Color(0xFF729875)),
                      ),
                    ),
                ],
              ),
            ),
            // AdMob Banner Ad
            if (_isBannerReady && _bannerAd != null)
              Container(
                color: const Color(0xFF729875),
                width: double.infinity,
                height: _bannerAd!.size.height.toDouble(),
                child: AdWidget(ad: _bannerAd!),
              ),
          ],
        ),
      ),
    );
  }

  Widget _buildErrorOverlay() {
    return Container(
      color: const Color(0xFF729875),
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
                      backgroundColor: const Color(0xFF425921),
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
