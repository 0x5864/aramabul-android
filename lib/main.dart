import 'dart:async';
import 'dart:convert';
import 'dart:io';

import 'package:connectivity_plus/connectivity_plus.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:webview_flutter/webview_flutter.dart';
import 'package:google_sign_in/google_sign_in.dart';
import 'package:permission_handler/permission_handler.dart';
import 'package:sign_in_with_apple/sign_in_with_apple.dart';
import 'package:share_plus/share_plus.dart';
import 'package:webview_flutter_android/webview_flutter_android.dart';

import 'welcome_screen.dart';

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

const String kLiveUrl = 'https://aramabul.com';
const String kDeepLinkHost = 'aramabul.com';
const String kDeepLinkHostWww = 'www.aramabul.com';

const String kAppVersion = '1.6.7';
const String kAppBuildNumber = '99';
const String kAppWebCacheVersion = '20260710-android-nearby-400-v1';
const String kNearbyPath = '/yeme-icme.html?nearby=1&limit=400';

const Color kAppBackgroundColor = Colors.white;
const Color kAppProgressColor = Color(0xFFE30A17);

const String _kNativeUsersKey = 'native_auth_users';
const String _kAuthSessionKey = 'aramabul.auth.session.v1';
const String _kAuthUsersKey = 'aramabul.auth.users.v1';
const String _kLegacyAuthNameKey = 'auth_user_name';
const String _kLegacyAuthEmailKey = 'auth_user_email';
const String _kWelcomeSeenKey = 'aramabul.welcome.seen.v1';
const String _kPendingWebLanguageKey = 'aramabul.welcome.pendingLanguage.v1';

bool _hasStoredAuthSession(SharedPreferences prefs) {
  final legacyName = (prefs.getString(_kLegacyAuthNameKey) ?? '').trim();
  final legacyEmail = (prefs.getString(_kLegacyAuthEmailKey) ?? '').trim();
  if (legacyName.isNotEmpty && legacyEmail.isNotEmpty) return true;

  final sessionRaw = (prefs.getString(_kAuthSessionKey) ?? '').trim();
  if (sessionRaw.isEmpty) return false;
  try {
    final session = jsonDecode(sessionRaw);
    if (session is! Map) return false;
    final name = (session['name'] as String? ?? '').trim();
    final email = (session['email'] as String? ?? '').trim();
    return name.isNotEmpty && email.isNotEmpty;
  } catch (_) {
    return false;
  }
}

void main() {
  WidgetsFlutterBinding.ensureInitialized();
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
        colorScheme: ColorScheme.fromSeed(seedColor: const Color(0xFF094174)),
        scaffoldBackgroundColor: const Color(0xFF094174),
        hoverColor: const Color(0xFFe8f4fd),
        splashColor: const Color(0xFFd0e8f9),
        highlightColor: const Color(0xFFe8f4fd),
        fontFamily: 'Plus Jakarta Sans',
      ),
      home: const AppLaunchGate(),
    );
  }
}

class AppLaunchGate extends StatefulWidget {
  const AppLaunchGate({super.key});

  @override
  State<AppLaunchGate> createState() => _AppLaunchGateState();
}

class _AppLaunchGateState extends State<AppLaunchGate> {
  bool? _showWelcome;
  bool _hasActiveSession = false;
  String? _initialPath;

  @override
  void initState() {
    super.initState();
    unawaited(_resolveInitialScreen());
  }

  Future<void> _resolveInitialScreen() async {
    final prefs = await SharedPreferences.getInstance();
    final hasSeenWelcome = prefs.getBool(_kWelcomeSeenKey) ?? false;
    final hasActiveSession = _hasStoredAuthSession(prefs);
    if (!mounted) return;
    setState(() {
      _hasActiveSession = hasActiveSession;
      _showWelcome = !hasSeenWelcome;
    });
  }

  Future<void> _completeWelcome({
    required String languageCode,
    required bool openSignIn,
  }) async {
    final normalizedLanguage = ['TR', 'EN', 'DE', 'RU'].contains(languageCode)
        ? languageCode
        : 'TR';
    final prefs = await SharedPreferences.getInstance();
    await prefs.setBool(_kWelcomeSeenKey, true);
    await prefs.setString(_kPendingWebLanguageKey, normalizedLanguage);
    final hasActiveSession = _hasStoredAuthSession(prefs);
    if (!mounted) return;
    setState(() {
      _hasActiveSession = hasActiveSession;
      _initialPath = openSignIn
          ? hasActiveSession
                ? '/profile.html?action=account'
                : '/profile.html?action=login'
          : null;
      _showWelcome = false;
    });
  }

  @override
  Widget build(BuildContext context) {
    if (_showWelcome == null) {
      return const ColoredBox(color: Colors.white);
    }
    if (_showWelcome == true) {
      return WelcomeScreen(
        hasActiveSession: _hasActiveSession,
        onContinue: _completeWelcome,
      );
    }
    return HomeWebViewPage(initialPath: _initialPath);
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
  late final StreamSubscription<List<ConnectivityResult>> _connectivitySub;

  bool _isLoading = true;
  int _progress = 0;
  String? _lastError;
  bool _hasLoadedAtLeastOnce = false;
  bool _isPageTransitioning = false;
  bool _isOffline = false;
  bool _googleInitialized = false;
  Timer? _loadingWatchdog;
  int _lastLoggedProgressBucket = -1;
  String _currentPath = '/';
  bool _showNativeFavorites = false;

  @override
  void initState() {
    super.initState();
    SystemChrome.setSystemUIOverlayStyle(
      const SystemUiOverlayStyle(
        statusBarColor: kAppBackgroundColor,
        statusBarIconBrightness: Brightness.dark,
        statusBarBrightness: Brightness.light,
      ),
    );
    _controller = WebViewController()
      ..setJavaScriptMode(JavaScriptMode.unrestricted)
      ..setUserAgent(
        'Mozilla/5.0 (Linux; Android 15; AramaBul) AppleWebKit/537.36 '
        '(KHTML, like Gecko) Chrome/126.0 Mobile Safari/537.36 AramaBulAndroid',
      )
      ..setNavigationDelegate(
        NavigationDelegate(
          onNavigationRequest: _onNavigationRequest,
          onPageStarted: (url) {
            debugPrint('[HomeWebView] page started: $url');
            final nextPath = _pathFromUrl(url);
            if (!mounted) return;
            setState(() {
              _isLoading = true;
              _lastError = null;
              _isPageTransitioning = true;
              _currentPath = nextPath;
              _showNativeFavorites = false;
            });
            _startLoadingWatchdog('page started');
          },
          onPageFinished: (_) {
            if (!mounted) return;
            _loadingWatchdog?.cancel();
            _injectAppBridge();
            _injectAppVisualOverrides();
            _controller.currentUrl().then((currentUrl) {
              debugPrint('[HomeWebView] page finished: $currentUrl');
              final nextPath = _pathFromUrl(currentUrl);
              if (mounted) {
                setState(() => _currentPath = nextPath);
              }
            });
            Future.delayed(const Duration(milliseconds: 150), () {
              if (!mounted) return;
              setState(() {
                _isLoading = false;
                _lastError = null;
                _hasLoadedAtLeastOnce = true;
                _isPageTransitioning = false;
                _isOffline = false;
              });
            });
          },
          onProgress: (value) {
            if (!mounted) return;
            final bucket = value ~/ 25;
            if (bucket != _lastLoggedProgressBucket || value == 100) {
              _lastLoggedProgressBucket = bucket;
              debugPrint('[HomeWebView] progress: $value');
            }
            setState(() => _progress = value);
          },
          onWebResourceError: (error) {
            if (error.isForMainFrame != true) return;
            debugPrint(
              '[HomeWebView] main frame error: '
              '${error.errorCode} ${error.errorType} ${error.description}',
            );
            if (!mounted) return;
            _loadingWatchdog?.cancel();
            setState(() {
              _lastError = error.description;
              _isLoading = false;
              _isPageTransitioning = false;
              _isOffline = true;
            });
          },
        ),
      );

    _configureAndroidWebView();
    _setupJsBridge();
    _startConnectivityWatch();
    unawaited(_initGoogleSignIn());
    unawaited(_bootstrapInitialPage());
    unawaited(_requestLocationPermissionOnStartup());
  }

  Future<void> _bootstrapInitialPage() async {
    await _prepareWebViewForFreshLiveAssets();
    await _loadInitialPage();
  }

  Future<void> _prepareWebViewForFreshLiveAssets() async {
    try {
      await _controller.clearCache();
    } catch (error) {
      debugPrint('[HomeWebView] cache clear skipped: $error');
    }
  }

  Future<void> _requestLocationPermissionOnStartup() async {
    try {
      final status = await Permission.location.status;
      if (status.isDenied) {
        debugPrint('[Permission] Location permission is denied, requesting...');
        final result = await Permission.location.request();
        debugPrint('[Permission] Location permission request result: $result');
      } else {
        debugPrint('[Permission] Location permission status: $status');
      }
    } catch (e) {
      debugPrint('[Permission] Startup location permission request failed: $e');
    }
  }

  Future<void> _initGoogleSignIn() async {
    if (_googleInitialized) return;
    try {
      await GoogleSignIn.instance.initialize(
        serverClientId:
            '849707147159-94nfppfamm7p9qs7ipef6v62hink6776.apps.googleusercontent.com',
      );
      _googleInitialized = true;
    } catch (error) {
      debugPrint('[GoogleSignIn] Init failed: $error');
    }
  }

  Future<void> _configureAndroidWebView() async {
    final platformController = _controller.platform;
    if (platformController is! AndroidWebViewController) return;

    await platformController.setGeolocationPermissionsPromptCallbacks(
      onShowPrompt: (request) async {
        debugPrint(
          'WebView Geolocation Prompt origin request: ${request.origin}',
        );
        bool trustedOrigin = false;
        final originLower = request.origin.toLowerCase();

        if (kDebugMode) {
          trustedOrigin = true;
        } else {
          trustedOrigin =
              originLower.contains('aramabul.com') ||
              originLower.contains('localhost') ||
              originLower.startsWith('file:');
        }

        if (!trustedOrigin) {
          debugPrint('WebView Geolocation Denied: origin not trusted');
          return const GeolocationPermissionsResponse(
            allow: false,
            retain: false,
          );
        }

        final status = await Permission.location.request();
        debugPrint('WebView Geolocation OS status: $status');
        return GeolocationPermissionsResponse(
          allow: status.isGranted,
          retain: status.isGranted,
        );
      },
    );
  }

  void _startConnectivityWatch() {
    _connectivitySub = Connectivity().onConnectivityChanged.listen((results) {
      final offline = results.every((r) => r == ConnectivityResult.none);
      if (!mounted) return;
      final shouldRecover = !offline && (_isOffline || _lastError != null);
      setState(() => _isOffline = offline);
      if (shouldRecover) {
        _loadLivePage();
      }
    });
  }

  Future<bool> _checkConnectivity() async {
    final results = await Connectivity().checkConnectivity();
    return results.any((r) => r != ConnectivityResult.none);
  }

  Future<void> _loadInitialPage() async {
    try {
      final online = await _checkConnectivity();
      if (online) {
        await _loadLivePage();
      } else {
        _showOfflineState();
      }
    } catch (error) {
      _showOfflineState(error.toString());
    }
  }

  Future<void> _loadLivePage([String? path]) async {
    if (!mounted) return;
    debugPrint(
      '[HomeWebView] load live page path: ${path ?? widget.initialPath ?? '/'}',
    );
    setState(() {
      _isLoading = true;
      _isPageTransitioning = true;
      _lastError = null;
      _isOffline = false;
      _showNativeFavorites = false;
    });
    final requestedPath = path ?? widget.initialPath ?? '';
    final rawUrl = requestedPath.isNotEmpty
        ? '$kLiveUrl$requestedPath'
        : kLiveUrl;
    final uri = Uri.parse(rawUrl);
    final url = uri.replace(
      queryParameters: {
        ...uri.queryParameters,
        'appCache': kAppWebCacheVersion,
      },
    );
    _startLoadingWatchdog('load live page');
    await _controller.loadRequest(url);
  }

  String _pathFromUrl(String? rawUrl) {
    final uri = Uri.tryParse(rawUrl ?? '');
    final path = uri?.path.trim();
    if (path == null || path.isEmpty || path == '/') return '/';
    return path;
  }

  int _selectedNativeNavIndex() {
    if (_showNativeFavorites) return 2;
    if (_currentPath.endsWith('/favorites.html')) return 2;
    if (_currentPath.endsWith('/profile.html') ||
        _currentPath.contains('-settings.html')) {
      return 3;
    }
    if (_currentPath.endsWith('/yeme-icme.html')) {
      return 1;
    }
    return 0;
  }

  Future<void> _openNativeNavIndex(int index) async {
    switch (index) {
      case 0:
        setState(() => _showNativeFavorites = false);
        await _loadLivePage('/');
        break;
      case 1:
        setState(() => _showNativeFavorites = false);
        await _loadLivePage(kNearbyPath);
        break;
      case 2:
        await _loadLivePage('/favorites.html');
        break;
      case 3:
        setState(() => _showNativeFavorites = false);
        await _loadLivePage('/profile.html?action=profile');
        break;
    }
  }

  void _startLoadingWatchdog(String reason) {
    _loadingWatchdog?.cancel();
    _loadingWatchdog = Timer(const Duration(seconds: 8), () async {
      if (!mounted || (!_isLoading && !_isPageTransitioning)) return;
      final currentUrl = await _controller.currentUrl();
      debugPrint(
        '[HomeWebView] loading watchdog released overlay '
        'reason=$reason progress=$_progress url=$currentUrl',
      );
      if (!mounted) return;
      setState(() {
        _isLoading = false;
        _isPageTransitioning = false;
        _hasLoadedAtLeastOnce = true;
      });
    });
  }

  void _showOfflineState([String? message]) {
    if (!mounted) return;
    setState(() {
      _isOffline = true;
      _isLoading = false;
      _isPageTransitioning = false;
      _lastError = message;
    });
  }

  Future<void> _reload() async {
    setState(() {
      _isLoading = true;
      _lastError = null;
    });
    try {
      final online = await _checkConnectivity();
      if (!online) {
        _showOfflineState();
        return;
      }
      if (_hasLoadedAtLeastOnce && !_isOffline) {
        await _controller.reload();
        return;
      }
      await _loadLivePage();
    } catch (e) {
      _showOfflineState(e.toString());
    }
  }

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
    debugPrint('[HomeWebView] navigation request: $rawUrl');
    final parsed = Uri.tryParse(rawUrl);
    if (parsed == null) return NavigationDecision.navigate;

    if (_isDeepLink(parsed)) {
      debugPrint('[HomeWebView] navigation decision: navigate internal');
      return NavigationDecision.navigate;
    }

    final scheme = parsed.scheme.toLowerCase();
    final shouldOpenExternally =
        _isMapLikeUrl(parsed, rawUrl) ||
        (scheme != 'http' &&
            scheme != 'https' &&
            scheme != 'about' &&
            scheme != 'file' &&
            scheme != 'data' &&
            scheme != 'javascript');

    if (!shouldOpenExternally) {
      debugPrint('[HomeWebView] navigation decision: navigate');
      return NavigationDecision.navigate;
    }

    Uri externalUri;
    try {
      externalUri = _resolveExternalUri(rawUrl);
    } catch (error) {
      debugPrint('[HomeWebView] external navigation parse failed: $error');
      return NavigationDecision.prevent;
    }
    debugPrint('[HomeWebView] navigation decision: open external $externalUri');
    await launchUrl(externalUri, mode: LaunchMode.externalApplication);
    return NavigationDecision.prevent;
  }

  void _setupJsBridge() {
    for (final channel in ['AramaBulIOS', 'AramaBulAndroid']) {
      _controller.addJavaScriptChannel(
        channel,
        onMessageReceived: (message) => _handleJsMessage(message.message),
      );
    }
  }

  void _handleJsMessage(String raw) {
    try {
      final data = jsonDecode(raw) as Map<String, dynamic>;
      final action = data['action'] as String? ?? '';

      switch (action) {
        case 'console_log':
          final type = data['type'] as String? ?? 'log';
          final message = data['message'] as String? ?? '';
          debugPrint('[WebViewConsole-$type] $message');
          break;
        case 'auth_snapshot':
          final usersRaw = data['usersRaw'] as String? ?? '[]';
          final sessionRaw = data['sessionRaw'] as String? ?? '';
          SharedPreferences.getInstance().then((prefs) {
            try {
              final decodedUsers = jsonDecode(usersRaw);
              if (decodedUsers is List) {
                final normalizedUsers = jsonEncode(decodedUsers);
                prefs.setString(_kNativeUsersKey, normalizedUsers);
                prefs.setString(_kAuthUsersKey, normalizedUsers);
              }
            } catch (e) {
              debugPrint('[AuthSync] users snapshot parse failed: $e');
            }

            try {
              if (sessionRaw.trim().isNotEmpty) {
                final decodedSession = jsonDecode(sessionRaw);
                if (decodedSession is Map) {
                  final name = decodedSession['name'] as String? ?? '';
                  final email = decodedSession['email'] as String? ?? '';
                  if (name.isNotEmpty && email.isNotEmpty) {
                    prefs.setString(_kLegacyAuthNameKey, name);
                    prefs.setString(_kLegacyAuthEmailKey, email);
                    prefs.setString(_kAuthSessionKey, sessionRaw);
                  }
                }
              } else {
                prefs.remove(_kLegacyAuthNameKey);
                prefs.remove(_kLegacyAuthEmailKey);
                prefs.remove(_kAuthSessionKey);
              }
            } catch (e) {
              debugPrint('[AuthSync] session snapshot parse failed: $e');
            }
          });
          break;
        case 'getAppInfo':
          _controller.runJavaScript(
            'window.__ARAMABUL_APP__ = ${jsonEncode({'platform': 'android', 'version': kAppVersion, 'build': kAppBuildNumber, 'isApp': true})}',
          );
          break;
        case 'shareVenue':
          final title = data['title'] as String? ?? 'AramaBul';
          final url = data['url'] as String? ?? kLiveUrl;
          Share.share('$title $url');
          break;
        case 'google_signin':
          _handleGoogleSignInFromWebView();
          break;
        case 'apple_signin':
          _handleAppleSignInFromWebView();
          break;
        case 'login_success':
          final loginName = data['name'] as String? ?? '';
          final loginEmail = data['email'] as String? ?? '';
          SharedPreferences.getInstance().then((prefs) async {
            await prefs.setString(_kLegacyAuthNameKey, loginName);
            await prefs.setString(_kLegacyAuthEmailKey, loginEmail);
            await prefs.setString(
              _kAuthSessionKey,
              jsonEncode({'name': loginName, 'email': loginEmail}),
            );
          });
          break;
        case 'requestLocationPermission':
          Permission.location.request().then((status) {
            _controller.runJavaScript(
              'window.dispatchEvent(new CustomEvent("aramabul:locationPermissionResult", { detail: { granted: ${status.isGranted} } }))',
            );
          });
          break;
        case 'openFavorites':
          _loadLivePage('/favorites.html');
          break;
        case 'openNearbyNeighborhood':
          _loadLivePage(kNearbyPath);
          break;
        case 'logout':
        case 'accountDeleted':
          _resetSession();
          break;
      }
    } catch (e) {
      debugPrint('JS bridge parse error: $e');
    }
  }

  Future<void> _resetSession() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(_kLegacyAuthNameKey);
    await prefs.remove(_kLegacyAuthEmailKey);
    await prefs.remove(_kAuthSessionKey);
    try {
      await GoogleSignIn.instance.signOut();
    } catch (_) {}
    final client = HttpClient();
    try {
      final request = await client.postUrl(
        Uri.parse('$kLiveUrl/api/auth/logout'),
      );
      request.headers.set('Accept', 'application/json');
      final response = await request.close();
      await response.drain<void>();
    } catch (error) {
      debugPrint('[AuthSync] Server logout skipped: $error');
    } finally {
      client.close();
    }
    try {
      await _controller.runJavaScript('''
        window.__ARAMABUL_NATIVE_AUTH_LOGGED_OUT__ = true;
        try { localStorage.removeItem('aramabul.auth.session.v1'); } catch(e) {}
        try { localStorage.removeItem('auth_user_name'); } catch(e) {}
        try { localStorage.removeItem('auth_user_email'); } catch(e) {}
        try { sessionStorage.removeItem('aramabul.auth.session.v1'); } catch(e) {}
        try { sessionStorage.removeItem('auth_user_name'); } catch(e) {}
        try { sessionStorage.removeItem('auth_user_email'); } catch(e) {}
        try { window.ARAMABUL_RUNTIME && window.ARAMABUL_RUNTIME.removeStorageValue && window.ARAMABUL_RUNTIME.removeStorageValue('aramabul.auth.session.v1'); } catch(e) {}
        try { document.dispatchEvent(new CustomEvent('aramabul:authchange')); } catch(e) {}
      ''');
    } catch (error) {
      debugPrint('[AuthSync] Web session reset skipped: $error');
    }
    await WebViewCookieManager().clearCookies();
    if (!mounted) return;
    await _loadLivePage('/profile.html?action=login&appLogout=1');
  }

  Future<Map<String, String>> _registerSocialLogin({
    required String provider,
    required String email,
    required String name,
    required String providerId,
    required String idToken,
  }) async {
    final client = HttpClient();
    try {
      final request = await client.postUrl(
        Uri.parse('$kLiveUrl/api/auth/social-login'),
      );
      request.headers.set('Content-Type', 'application/json');
      request.headers.set('Accept', 'application/json');
      request.write(
        jsonEncode({
          'provider': provider,
          'email': email,
          'name': name,
          'providerId': providerId,
          'idToken': idToken,
        }),
      );
      final response = await request.close();
      await _syncSetCookieHeadersToWebView(
        response.headers[HttpHeaders.setCookieHeader],
      );
      final body = await response.transform(utf8.decoder).join();
      if (response.statusCode < 200 || response.statusCode >= 300) {
        throw HttpException('Social login failed: ${response.statusCode}');
      }

      final payload = jsonDecode(body) as Map<String, dynamic>;
      final user = payload['user'] as Map<String, dynamic>? ?? const {};
      return {
        'name': (user['displayName'] as String? ?? name).trim(),
        'email': (user['email'] as String? ?? email).trim(),
      };
    } finally {
      client.close();
    }
  }

  Future<void> _syncSetCookieHeadersToWebView(
    List<String>? setCookieHeaders,
  ) async {
    if (setCookieHeaders == null || setCookieHeaders.isEmpty) return;

    final cookieManager = WebViewCookieManager();
    for (final header in setCookieHeaders) {
      try {
        final cookie = Cookie.fromSetCookieValue(header);
        if (cookie.name.isEmpty || cookie.value.isEmpty) continue;

        await cookieManager.setCookie(
          WebViewCookie(
            name: cookie.name,
            value: cookie.value,
            domain: 'aramabul.com',
            path: cookie.path?.isNotEmpty == true ? cookie.path! : '/',
          ),
        );
      } catch (error) {
        debugPrint('[AuthSync] Cookie sync failed: $error');
      }
    }
  }

  Future<void> _syncSocialSessionToWeb({
    required String name,
    required String email,
  }) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_kLegacyAuthNameKey, name);
    await prefs.setString(_kLegacyAuthEmailKey, email);

    final sessionLiteral = jsonEncode(
      jsonEncode({'name': name, 'email': email}),
    );
    await prefs.setString(
      _kAuthSessionKey,
      jsonEncode({'name': name, 'email': email}),
    );
    await _controller.runJavaScript('''
      try { localStorage.setItem('aramabul.auth.session.v1', $sessionLiteral); } catch(e) {}
      try { document.dispatchEvent(new CustomEvent('aramabul:authchange')); } catch(e) {}
      try {
        var nextUrl = new URL(window.location.href);
        nextUrl.searchParams.set('appAuthRefresh', Date.now().toString());
        window.location.replace(nextUrl.pathname + nextUrl.search + nextUrl.hash);
      } catch (error) {
        window.location.href = window.location.href.split('#')[0] + '?appAuthRefresh=' + Date.now();
      }
    ''');
  }

  Future<void> _handleGoogleSignInFromWebView() async {
    await _setSocialButtonState(
      provider: 'google',
      loading: true,
      message: 'Google hesabınıza yönlendiriliyorsunuz...',
    );

    try {
      await _initGoogleSignIn();
      final account = await GoogleSignIn.instance.authenticate();
      final idToken = account.authentication.idToken ?? '';
      if (idToken.isEmpty) {
        throw const FormatException('Google kimlik belirteci alınamadı.');
      }

      final name = account.displayName ?? '';
      final email = account.email;

      final session = await _registerSocialLogin(
        provider: 'google',
        email: email,
        name: name,
        providerId: account.id,
        idToken: idToken,
      );
      await _syncSocialSessionToWeb(
        name: session['name'] ?? name,
        email: session['email'] ?? email,
      );
    } catch (e) {
      debugPrint('[GoogleSignIn] Error: $e');
      await _setSocialButtonState(
        provider: 'google',
        loading: false,
        error: 'Google ile giriş başarısız.',
      );
    }
  }

  Future<void> _handleAppleSignInFromWebView() async {
    await _setSocialButtonState(
      provider: 'apple',
      loading: true,
      message: 'Apple hesabınıza yönlendiriliyorsunuz...',
    );

    try {
      final credential = await SignInWithApple.getAppleIDCredential(
        scopes: const [
          AppleIDAuthorizationScopes.email,
          AppleIDAuthorizationScopes.fullName,
        ],
        webAuthenticationOptions: WebAuthenticationOptions(
          clientId: 'com.aramabul.app.signin',
          redirectUri: Uri.parse(
            'https://aramabul.com/api/auth/apple-callback',
          ),
        ),
      );
      final providerId = credential.userIdentifier?.trim() ?? '';
      final idToken = credential.identityToken?.trim() ?? '';
      if (providerId.isEmpty) {
        throw const FormatException('Apple kullanıcı kimliği alınamadı.');
      }
      if (idToken.isEmpty) {
        throw const FormatException('Apple kimlik belirteci alınamadı.');
      }

      final prefs = await SharedPreferences.getInstance();
      final accountKey = 'apple_account_$providerId';
      final stored = prefs.getString(accountKey);
      final storedAccount = stored == null
          ? <String, dynamic>{}
          : jsonDecode(stored) as Map<String, dynamic>;
      final receivedName = [
        credential.givenName?.trim() ?? '',
        credential.familyName?.trim() ?? '',
      ].where((part) => part.isNotEmpty).join(' ');
      final name = receivedName.isNotEmpty
          ? receivedName
          : (storedAccount['name'] as String? ?? 'Apple kullanıcısı');
      final email =
          credential.email?.trim() ?? (storedAccount['email'] as String? ?? '');

      final session = await _registerSocialLogin(
        provider: 'apple',
        email: email,
        name: name,
        providerId: providerId,
        idToken: idToken,
      );
      final sessionName = session['name'] ?? name;
      final sessionEmail = session['email'] ?? email;
      await prefs.setString(
        accountKey,
        jsonEncode({'name': sessionName, 'email': sessionEmail}),
      );
      await _syncSocialSessionToWeb(name: sessionName, email: sessionEmail);
    } on SignInWithAppleAuthorizationException catch (error) {
      if (error.code == AuthorizationErrorCode.canceled) {
        await _setSocialButtonState(provider: 'apple', loading: false);
        return;
      }
      await _setSocialButtonState(
        provider: 'apple',
        loading: false,
        error: 'Apple ile giriş başarısız.',
      );
    } catch (error) {
      debugPrint('[AppleSignIn] Error: $error');
      await _setSocialButtonState(
        provider: 'apple',
        loading: false,
        error: 'Apple ile giriş başarısız.',
      );
    }
  }

  Future<void> _setSocialButtonState({
    required String provider,
    required bool loading,
    String? message,
    String? error,
  }) {
    final providerLiteral = jsonEncode(provider);
    final messageLiteral = jsonEncode(error ?? message ?? '');
    final color = error == null ? '#4a90d9' : '#e74c3c';
    return _controller.runJavaScript('''
      document.querySelectorAll('[data-native-social-provider="' + $providerLiteral + '"]').forEach(function(btn) {
        btn.disabled = ${loading ? 'true' : 'false'};
        btn.style.opacity = ${loading ? "'0.6'" : "'1'"};
      });
      var msg = document.getElementById('appLoginMsg') ||
        document.getElementById('settingsLoginMessage') ||
        document.getElementById('accountLoginMessage');
      if (msg) {
        msg.style.color = '$color';
        msg.textContent = $messageLiteral;
      }
    ''');
  }

  Future<void> _injectAppBridge() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final authName = prefs.getString(_kLegacyAuthNameKey) ?? '';
      final authEmail = prefs.getString(_kLegacyAuthEmailKey) ?? '';
      final authSessionJson = (authName.isNotEmpty && authEmail.isNotEmpty)
          ? jsonEncode({'name': authName, 'email': authEmail})
          : '';
      final nativeUsersRaw = prefs.getString(_kAuthUsersKey) ?? '[]';
      final pendingLanguage = (prefs.getString(_kPendingWebLanguageKey) ?? '')
          .trim()
          .toUpperCase();
      final appInfoLiteral = jsonEncode({
        'platform': 'android',
        'version': kAppVersion,
        'build': kAppBuildNumber,
        'isApp': true,
      });
      final usersLiteral = jsonEncode(nativeUsersRaw);
      final sessionLiteral = jsonEncode(authSessionJson);
      final webCacheLiteral = jsonEncode(kAppWebCacheVersion);
      final pendingLanguageLiteral = jsonEncode(pendingLanguage);

      await _controller.runJavaScript('''
        try {
          window.__ARAMABUL_APP__ = $appInfoLiteral;
          var nativeWelcomeLanguage = $pendingLanguageLiteral;
          if (nativeWelcomeLanguage) {
            try {
              localStorage.setItem(
                'aramabul.selectedLanguage.v1',
                nativeWelcomeLanguage
              );
            } catch(e) {}
            try {
              if (window.ARAMABUL_RUNTIME &&
                  window.ARAMABUL_RUNTIME.setStoredLanguage) {
                window.ARAMABUL_RUNTIME.setStoredLanguage(
                  nativeWelcomeLanguage,
                  true
                );
              }
            } catch(e) {}
            window.ARAMABUL_CURRENT_LANGUAGE = nativeWelcomeLanguage;
            try {
              document.dispatchEvent(new CustomEvent(
                'aramabul:languagechange',
                { detail: { language: nativeWelcomeLanguage } }
              ));
            } catch(e) {}
          }
          try {
            localStorage.setItem('aramabul.auth.users.v1', $usersLiteral);
          } catch(e) {}
          if ($sessionLiteral) {
            try { localStorage.setItem('aramabul.auth.session.v1', $sessionLiteral); } catch(e) {}
          } else {
            try { localStorage.removeItem('aramabul.auth.session.v1'); } catch(e) {}
          }
          window.ARAMABUL_GOOGLE_SIGN_IN = function() {
            var bridge = window.AramaBulIOS || window.AramaBulAndroid;
            if (bridge) {
              bridge.postMessage(JSON.stringify({ action: 'google_signin' }));
            }
          };
          window.ARAMABUL_APPLE_SIGN_IN = function() {
            var bridge = window.AramaBulIOS || window.AramaBulAndroid;
            if (bridge) {
              bridge.postMessage(JSON.stringify({ action: 'apple_signin' }));
            }
          };
          try {
            (function installNativeAuthBridge() {
              if (window.__ARAMABUL_NATIVE_AUTH_BRIDGE__) return;
              window.__ARAMABUL_NATIVE_AUTH_BRIDGE__ = true;

              function bridge() {
                return window.AramaBulIOS || window.AramaBulAndroid;
              }

              function post(action) {
                var targetBridge = bridge();
                if (!targetBridge || !targetBridge.postMessage) return false;
                targetBridge.postMessage(JSON.stringify({ action: action }));
                return true;
              }

              function stop(event) {
                event.preventDefault();
                event.stopPropagation();
                event.stopImmediatePropagation();
              }

              function handleSocial(event) {
                var target = event.target && event.target.closest
                  ? event.target.closest('[data-native-social-provider], #customGoogleSignInBtn, #customAppleSignInBtn, #accountGoogleSignInBtn, #appGoogleSignInBtn, #appAppleSignInBtn')
                  : null;
                if (!target) return;
                var provider = String(target.getAttribute('data-native-social-provider') || '').toLowerCase();
                if (!provider && /google/i.test(target.id || '')) provider = 'google';
                if (!provider && /apple/i.test(target.id || '')) provider = 'apple';
                if (provider !== 'google' && provider !== 'apple') return;
                stop(event);
                post(provider + '_signin');
              }

              function clearWebSession() {
                ['aramabul.auth.session.v1', 'auth_user_name', 'auth_user_email'].forEach(function(key) {
                  try { localStorage.removeItem(key); } catch (error) {}
                  try { sessionStorage.removeItem(key); } catch (error) {}
                });
                try {
                  if (window.ARAMABUL_RUNTIME && window.ARAMABUL_RUNTIME.removeStorageValue) {
                    window.ARAMABUL_RUNTIME.removeStorageValue('aramabul.auth.session.v1');
                  }
                } catch (error) {}
              }

              function handleLogout(event) {
                var target = event.target && event.target.closest
                  ? event.target.closest('[data-settings-logout-trigger], #settingsSignOutBtn, #accountLogoutBtn, [data-native-logout]')
                  : null;
                if (!target) return;
                stop(event);
                clearWebSession();
                try { document.dispatchEvent(new CustomEvent('aramabul:authchange')); } catch (error) {}
                post('logout');
              }

              ['pointerdown', 'touchstart', 'click'].forEach(function(type) {
                window.addEventListener(type, handleSocial, true);
                document.addEventListener(type, handleLogout, true);
              });

              function revealNativeButtons() {
                document.querySelectorAll('[data-native-social-provider="apple"], #customAppleSignInBtn, #appAppleSignInBtn').forEach(function(button) {
                  button.hidden = false;
                  button.style.display = '';
                });
              }

              revealNativeButtons();
              window.setTimeout(revealNativeButtons, 250);
              window.setTimeout(revealNativeButtons, 1000);
              try {
                new MutationObserver(revealNativeButtons).observe(document.documentElement, {
                  childList: true,
                  subtree: true
                });
              } catch (error) {}
            })();
          } catch(e) {}
          try {
            (function renderNativeAppVersion() {
              function render() {
                var app = window.__ARAMABUL_APP__ || {};
                if (!app.isApp) return;
                var version = String(app.version || '').trim();
                var build = String(app.build || '').trim();
                if (!version && !build) return;
                var row = document.querySelector('[data-app-version-row]');
                var text = document.querySelector('[data-app-version-text]');
                var sidebar = document.querySelector('.settings-sidebar-card');
                if (!row && sidebar) {
                  row = document.createElement('div');
                  row.className = 'settings-app-version';
                  row.setAttribute('data-app-version-row', '');
                  row.innerHTML = '<span class="settings-app-version-label">Uygulama sürümü</span><span class="settings-app-version-value" data-app-version-text></span>';
                  sidebar.appendChild(row);
                  text = row.querySelector('[data-app-version-text]');
                }
                if (!row || !text) return;
                text.textContent = build ? 'AB ' + (version || 'app') + '+' + build : 'AB ' + version;
                row.hidden = false;
                row.style.display = 'grid';
              }
              render();
              window.setTimeout(render, 250);
              window.setTimeout(render, 1000);
              document.addEventListener('DOMContentLoaded', render);
              document.addEventListener('aramabul:appready', render);
              document.addEventListener('aramabul:authchange', render);
            })();
          } catch(e) {}
          try {
            (function removeWebBottomNavForAndroid() {
              function removeNav() {
                try {
                  document.querySelectorAll('.mobile-bottom-nav').forEach(function (node) {
                    node.remove();
                  });
                  if (document.body) {
                    document.body.classList.remove('mobile-bottom-nav-visible');
                    document.body.style.paddingBottom = '0px';
                  }
                } catch (error) {}
              }
              removeNav();
              window.setTimeout(removeNav, 100);
              window.setTimeout(removeNav, 350);
              window.setTimeout(removeNav, 1000);
              window.setTimeout(removeNav, 2500);
              try {
                new MutationObserver(removeNav).observe(document.documentElement, {
                  childList: true,
                  subtree: true
                });
              } catch (error) {}
            })();
          } catch(e) {}
          try {
            (function installAndroidDirectAppNav() {
              if (window.__ARAMABUL_ANDROID_DIRECT_APP_NAV__) {
                return;
              }
              window.__ARAMABUL_ANDROID_DIRECT_APP_NAV__ = true;

              function postOpenFavorites() {
                try {
                  var bridge = window.AramaBulAndroid || window.AramaBulIOS;
                  if (bridge && bridge.postMessage) {
                    bridge.postMessage(JSON.stringify({ action: 'openFavorites' }));
                    return true;
                  }
                } catch (error) {
                  return false;
                }
                return false;
              }

              function handleDirectNav(event) {
                var target = event.target && event.target.closest
                  ? event.target.closest('[data-mobile-nav="favorites"], a[href="favorites.html"], a[href="/favorites.html"]')
                  : null;
                if (!target) {
                  return;
                }
                event.preventDefault();
                event.stopPropagation();
                event.stopImmediatePropagation();
                if (window.ARAMABUL_HIDE_NAV_TOAST) {
                  try { window.ARAMABUL_HIDE_NAV_TOAST(); } catch (error) {}
                }
                if (!postOpenFavorites()) {
                  window.location.assign('/favorites.html?appCache=' + encodeURIComponent($webCacheLiteral));
                }
              }

              function bindExistingButtons() {
                document.querySelectorAll('[data-mobile-nav="favorites"], a[href="favorites.html"], a[href="/favorites.html"]').forEach(function (target) {
                  if (target.__aramabulAndroidFavoritesBound) {
                    return;
                  }
                  target.__aramabulAndroidFavoritesBound = true;
                  target.addEventListener('click', handleDirectNav, true);
                });
              }

              window.addEventListener('pointerdown', handleDirectNav, true);
              window.addEventListener('touchstart', handleDirectNav, true);
              window.addEventListener('click', handleDirectNav, true);
              document.addEventListener('click', handleDirectNav, true);
              bindExistingButtons();
              window.setTimeout(bindExistingButtons, 250);
              window.setTimeout(bindExistingButtons, 1000);
              window.setTimeout(bindExistingButtons, 2500);
              try {
                new MutationObserver(bindExistingButtons).observe(document.documentElement, {
                  childList: true,
                  subtree: true
                });
              } catch (error) {}
            })();
          } catch(e) {}
          try {
            (function installDirectCategoryNavigation() {
              if (window.__ARAMABUL_DIRECT_CATEGORY_NAV_BOUND__) {
                return;
              }
              window.__ARAMABUL_DIRECT_CATEGORY_NAV_BOUND__ = true;
              document.addEventListener('click', function (event) {
                var target = event.target && event.target.closest
                  ? event.target.closest('.home-subcategory-card, .home-subcat-chip, .home-food-card')
                  : null;
                if (!target) {
                  return;
                }
                if (target.getAttribute('data-mobile-nav') === 'nearby') {
                  return;
                }
                var href = target.getAttribute('href') || '';
                if (!href) {
                  return;
                }
                event.preventDefault();
                event.stopImmediatePropagation();
                window.location.assign(href);
              }, true);
            })();
          } catch(e) {}
          try {
            (function installLocationFailsafe() {
              function wrapLocationDetector() {
                if (typeof window.ARAMABUL_GET_OR_DETECT_LOCATION !== 'function') {
                  return;
                }
                if (window.ARAMABUL_GET_OR_DETECT_LOCATION.__appFailsafe) {
                  return;
                }
                var originalDetector = window.ARAMABUL_GET_OR_DETECT_LOCATION;
                var wrappedDetector = function () {
                  return Promise.race([
                    Promise.resolve().then(function () {
                      return originalDetector.apply(window, arguments);
                    }),
                    new Promise(function (resolve) {
                      window.setTimeout(function () { resolve(null); }, 3000);
                    })
                  ]);
                };
                wrappedDetector.__appFailsafe = true;
                window.ARAMABUL_GET_OR_DETECT_LOCATION = wrappedDetector;
              }
              wrapLocationDetector();
              window.setTimeout(wrapLocationDetector, 250);
              window.setTimeout(wrapLocationDetector, 1000);
              window.setTimeout(wrapLocationDetector, 2500);
              window.setTimeout(wrapLocationDetector, 5000);
              document.addEventListener('DOMContentLoaded', wrapLocationDetector);
              window.addEventListener('load', wrapLocationDetector);
              document.addEventListener('aramabul:appready', wrapLocationDetector);
            })();
          } catch(e) {}
          try {
            document.dispatchEvent(new CustomEvent('aramabul:appready'));
          } catch(e) {}
          try {
            var snapshotUsers = localStorage.getItem('aramabul.auth.users.v1') || '[]';
            var snapshotSession = localStorage.getItem('aramabul.auth.session.v1') || '';
            var bridge = window.AramaBulIOS || window.AramaBulAndroid;
            if (bridge) {
              bridge.postMessage(JSON.stringify({
                action: 'auth_snapshot',
                usersRaw: snapshotUsers,
                sessionRaw: snapshotSession
              }));
            }
          } catch(e) {}

          try {
            document.dispatchEvent(new CustomEvent('aramabul:authchange'));
          } catch(e) {}
        } catch (e) {}
      ''');
      if (pendingLanguage.isNotEmpty) {
        await prefs.remove(_kPendingWebLanguageKey);
      }
    } catch (error) {
      debugPrint('[HomeWebView] App bridge injection failed: $error');
    }
  }

  Future<void> _injectAppVisualOverrides() async {
    try {
      await _controller.runJavaScript(r'''
        (function () {
          var styleId = 'aramabul-android-visual-overrides';
          var style = document.getElementById(styleId);
          if (!style) {
            style = document.createElement('style');
            style.id = styleId;
            document.head.appendChild(style);
          }

          style.textContent = `
            .mobile-bottom-nav {
              display: none !important;
              visibility: hidden !important;
              opacity: 0 !important;
              pointer-events: none !important;
            }

            body.mobile-bottom-nav-visible {
              padding-bottom: 0 !important;
            }

            .favorites-page-shell {
              width: min(1220px, calc(100% - 4.8rem)) !important;
            }

            .favorites-page-shell .favorites-page-title {
              font-size: clamp(1.2rem, 1.8vw, 1.8rem) !important;
              font-weight: 650 !important;
              line-height: 1 !important;
              letter-spacing: 0 !important;
            }

            .favorites-page-shell .favorites-grid .istanbul-venue-card {
              border: 1px solid #c9ced4 !important;
              border-radius: 8px !important;
            }

            @media (max-width: 699px) {
              body.profile-page.settings-page,
              body.profile-page.settings-page .settings-shell,
              body.profile-page.settings-page .settings-layout,
              body.profile-page.settings-page .settings-sidebar-card {
                background: #ffffff !important;
              }

              body.profile-page.settings-page .settings-sidebar-card {
                border: 1px solid #ffffff !important;
                box-shadow: none !important;
              }

              body.profile-page.settings-page
                .settings-sidebar-card
                .settings-row {
                min-height: 48px !important;
              }

              body.profile-page.settings-page
                .settings-sidebar-card
                .settings-row-chevron {
                flex-basis: 28px !important;
                width: 28px !important;
                height: 28px !important;
              }

              body.profile-page.settings-page
                .settings-sidebar-card
                .settings-row-chevron
                svg {
                width: 15px !important;
                height: 15px !important;
              }
            }
          `;

          function dedupeCorporateProfileRows() {
            var sidebar = document.querySelector('.settings-sidebar-card');
            if (!sidebar) {
              return;
            }

            var selectorRows = Array.from(sidebar.querySelectorAll([
              '[data-settings-panel-trigger="corporate"]',
              'a[href="kurumsal-settings.html"]',
              'a[href*="action=corporate"]'
            ].join(',')));
            var labelRows = Array.from(sidebar.querySelectorAll('.settings-row')).filter(function (row) {
              var label = row.querySelector('.settings-row-label');
              return label && label.textContent && label.textContent.trim().toLocaleLowerCase('tr') === 'kurumsal';
            });
            var corporateRows = Array.from(new Set(selectorRows.concat(labelRows)));

            if (corporateRows.length < 2) {
              return;
            }

            var preferred = corporateRows.find(function (row) {
              return row.getAttribute('data-settings-panel-trigger') === 'corporate';
            }) || corporateRows.find(function (row) {
              return (row.getAttribute('href') || '').indexOf('action=corporate') !== -1;
            }) || corporateRows[0];

            corporateRows.forEach(function (row) {
              if (row !== preferred) {
                row.remove();
              }
            });
          }

          function installCorporateProfileDedupe() {
            dedupeCorporateProfileRows();
            window.setTimeout(dedupeCorporateProfileRows, 100);
            window.setTimeout(dedupeCorporateProfileRows, 350);
            window.setTimeout(dedupeCorporateProfileRows, 1000);
            window.setTimeout(dedupeCorporateProfileRows, 2500);
            if (window.__ARAMABUL_ANDROID_CORPORATE_DEDUPE__) {
              return;
            }
            window.__ARAMABUL_ANDROID_CORPORATE_DEDUPE__ = true;
            try {
              new MutationObserver(dedupeCorporateProfileRows).observe(document.documentElement, {
                childList: true,
                subtree: true
              });
            } catch (error) {}
          }

          function updateTurkishProfileHandle() {
            var handle = document.getElementById('settingsHandle') ||
              document.getElementById('accountDisplayHandle');
            if (!handle) return;

            try {
              var session = JSON.parse(localStorage.getItem('aramabul.auth.session.v1') || 'null');
              if (!session || !session.email) {
                handle.textContent = '@giris-yapilmadi';
                return;
              }
              var localPart = String(session.email).split('@')[0] || session.email;
              var normalized = localPart
                .toLocaleLowerCase('tr')
                .replace(/[^\p{Letter}\p{Number}._-]/gu, '-')
                .replace(/-+/g, '-')
                .replace(/^-|-$/g, '') || 'kullanici';
              handle.textContent = '@' + normalized + '.aramabul';
            } catch (error) {}
          }

          function renderAppVersionRow() {
            var app = window.__ARAMABUL_APP__ || {};
            if (!app.isApp) return;
            var version = String(app.version || '').trim();
            var build = String(app.build || '').trim();
            if (!version && !build) return;

            var sidebar = document.querySelector('.settings-sidebar-card');
            var row = document.querySelector('[data-app-version-row]');
            var text = document.querySelector('[data-app-version-text]');
            if (!row && sidebar) {
              row = document.createElement('div');
              row.className = 'settings-app-version';
              row.setAttribute('data-app-version-row', '');
              row.innerHTML = '<span class="settings-app-version-label">Uygulama sürümü</span><span class="settings-app-version-value" data-app-version-text></span>';
              sidebar.appendChild(row);
              text = row.querySelector('[data-app-version-text]');
            }
            if (!row || !text) return;
            text.textContent = build ? 'AB ' + (version || 'app') + '+' + build : 'AB ' + version;
            row.hidden = false;
            row.style.display = 'grid';
          }

          installCorporateProfileDedupe();
          updateTurkishProfileHandle();
          renderAppVersionRow();
          document.addEventListener('aramabul:authchange', function () {
            window.setTimeout(updateTurkishProfileHandle, 0);
            window.setTimeout(renderAppVersionRow, 0);
          });
          document.addEventListener('aramabul:languagechange', function () {
            window.setTimeout(updateTurkishProfileHandle, 0);
            window.setTimeout(renderAppVersionRow, 0);
          });
          window.setTimeout(function () {
            installCorporateProfileDedupe();
            updateTurkishProfileHandle();
            renderAppVersionRow();
          }, 350);
        })();
      ''');
    } catch (error) {
      debugPrint('[HomeWebView] Visual override injection failed: $error');
    }
  }

  @override
  Widget build(BuildContext context) {
    final showProgress = _isLoading && _progress < 100;

    return PopScope(
      canPop: false,
      onPopInvokedWithResult: (didPop, result) async {
        if (didPop) return;
        if (await _controller.canGoBack()) {
          await _controller.goBack();
        }
      },
      child: Scaffold(
        backgroundColor: kAppBackgroundColor,
        body: Column(
          children: [
            Container(
              color: kAppBackgroundColor,
              height: MediaQuery.of(context).padding.top,
            ),
            if (showProgress)
              LinearProgressIndicator(
                value: _progress / 100,
                color: kAppProgressColor,
                backgroundColor: const Color(0xFFF1F3F5),
              ),
            Expanded(
              child: Stack(
                children: [
                  if (_showNativeFavorites)
                    NativeFavoritesView(
                      onOpenVenue: (venue) {
                        final domainKey =
                            (venue['domainKey'] as String? ?? 'yeme-icme')
                                .trim();
                        final slug = (venue['slug'] as String? ?? '').trim();
                        final path = slug.isEmpty
                            ? '/${domainKey.isEmpty ? 'yeme-icme' : domainKey}.html'
                            : '/${domainKey.isEmpty ? 'yeme-icme' : domainKey}.html?venue=${Uri.encodeQueryComponent(slug)}';
                        setState(() => _showNativeFavorites = false);
                        unawaited(_loadLivePage(path));
                      },
                    )
                  else if (_hasLoadedAtLeastOnce && !_isOffline)
                    WebViewWidget(controller: _controller),
                  if (_isOffline)
                    OfflineView(
                      details: kDebugMode ? _lastError : null,
                      onRetry: _reload,
                    ),
                  if (!_showNativeFavorites &&
                      !_isOffline &&
                      (_isPageTransitioning || !_hasLoadedAtLeastOnce))
                    Positioned.fill(
                      child: Container(
                        color: kAppBackgroundColor,
                        child: const Center(
                          child: CircularProgressIndicator(
                            color: kAppProgressColor,
                          ),
                        ),
                      ),
                    ),
                ],
              ),
            ),
          ],
        ),
        bottomNavigationBar: NavigationBar(
          selectedIndex: _selectedNativeNavIndex(),
          backgroundColor: Colors.white,
          indicatorColor: const Color(0xFFE8F1F8),
          surfaceTintColor: Colors.white,
          height: 64,
          onDestinationSelected: (index) {
            unawaited(_openNativeNavIndex(index));
          },
          destinations: const [
            NavigationDestination(
              icon: Icon(Icons.home_outlined),
              selectedIcon: Icon(Icons.home),
              label: 'Ana',
            ),
            NavigationDestination(
              icon: Icon(Icons.my_location_outlined),
              selectedIcon: Icon(Icons.my_location),
              label: 'Yakın',
            ),
            NavigationDestination(
              icon: Icon(Icons.favorite_border),
              selectedIcon: Icon(Icons.favorite),
              label: 'Favori',
            ),
            NavigationDestination(
              icon: Icon(Icons.person_outline),
              selectedIcon: Icon(Icons.person),
              label: 'Hesap',
            ),
          ],
        ),
      ),
    );
  }

  @override
  void dispose() {
    _loadingWatchdog?.cancel();
    _connectivitySub.cancel();
    super.dispose();
  }
}

class NativeFavoritesView extends StatefulWidget {
  final ValueChanged<Map<String, dynamic>> onOpenVenue;

  const NativeFavoritesView({super.key, required this.onOpenVenue});

  @override
  State<NativeFavoritesView> createState() => _NativeFavoritesViewState();
}

class _NativeFavoritesViewState extends State<NativeFavoritesView> {
  late Future<List<Map<String, dynamic>>> _favoritesFuture;

  @override
  void initState() {
    super.initState();
    _favoritesFuture = _loadFavorites();
  }

  Future<List<Map<String, dynamic>>> _loadFavorites() async {
    final prefs = await SharedPreferences.getInstance();
    final email = (prefs.getString(_kLegacyAuthEmailKey) ?? '').trim();
    final client = HttpClient();
    try {
      final request = await client.getUrl(
        Uri.parse('$kLiveUrl/api/mvp/favorites'),
      );
      request.headers.set(HttpHeaders.acceptHeader, 'application/json');
      if (email.isNotEmpty) {
        request.headers.set('X-Aramabul-Auth-Email', email);
      }
      final response = await request.close().timeout(
        const Duration(seconds: 8),
      );
      final body = await response.transform(utf8.decoder).join();
      if (response.statusCode < 200 || response.statusCode >= 300) {
        throw HttpException('Favoriler yüklenemedi: ${response.statusCode}');
      }
      final payload = jsonDecode(body) as Map<String, dynamic>;
      final items = payload['items'];
      if (items is! List) return const [];
      return items
          .whereType<Map>()
          .map((item) => Map<String, dynamic>.from(item))
          .toList();
    } finally {
      client.close();
    }
  }

  Future<void> _refresh() async {
    setState(() {
      _favoritesFuture = _loadFavorites();
    });
    await _favoritesFuture;
  }

  @override
  Widget build(BuildContext context) {
    return ColoredBox(
      color: Colors.white,
      child: SafeArea(
        top: false,
        child: RefreshIndicator(
          onRefresh: _refresh,
          color: kAppProgressColor,
          child: FutureBuilder<List<Map<String, dynamic>>>(
            future: _favoritesFuture,
            builder: (context, snapshot) {
              final items = snapshot.data ?? const <Map<String, dynamic>>[];
              return ListView(
                physics: const AlwaysScrollableScrollPhysics(),
                padding: const EdgeInsets.fromLTRB(20, 20, 20, 28),
                children: [
                  const Text(
                    'Favorilerim',
                    style: TextStyle(
                      color: Color(0xFF011E3A),
                      fontSize: 26,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                  const SizedBox(height: 6),
                  Text(
                    snapshot.connectionState == ConnectionState.waiting
                        ? 'Favoriler getiriliyor.'
                        : '${items.length} mekan kayıtlı',
                    style: const TextStyle(
                      color: Color(0xFF627284),
                      fontSize: 14,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                  const SizedBox(height: 18),
                  if (snapshot.connectionState == ConnectionState.waiting)
                    const Padding(
                      padding: EdgeInsets.only(top: 80),
                      child: Center(
                        child: CircularProgressIndicator(
                          color: kAppProgressColor,
                        ),
                      ),
                    )
                  else if (snapshot.hasError)
                    _NativeFavoritesMessage(
                      title: 'Favoriler yüklenemedi',
                      message: '${snapshot.error}',
                    )
                  else if (items.isEmpty)
                    const _NativeFavoritesMessage(
                      title: 'Henüz kayıtlı mekanın yok',
                      message:
                          'Yeme-İçme ekranından mekan kaydetmeye başlayabilirsin.',
                    )
                  else
                    ...items.map(
                      (venue) => _NativeFavoriteCard(
                        venue: venue,
                        onTap: () => widget.onOpenVenue(venue),
                      ),
                    ),
                ],
              );
            },
          ),
        ),
      ),
    );
  }
}

class _NativeFavoritesMessage extends StatelessWidget {
  final String title;
  final String message;

  const _NativeFavoritesMessage({required this.title, required this.message});

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(top: 48),
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: const Color(0xFFF7FAFC),
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: const Color(0xFFE1E8EF)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            title,
            style: const TextStyle(
              color: Color(0xFF011E3A),
              fontSize: 17,
              fontWeight: FontWeight.w700,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            message,
            style: const TextStyle(
              color: Color(0xFF627284),
              fontSize: 14,
              height: 1.35,
            ),
          ),
        ],
      ),
    );
  }
}

class _NativeFavoriteCard extends StatelessWidget {
  final Map<String, dynamic> venue;
  final VoidCallback onTap;

  const _NativeFavoriteCard({required this.venue, required this.onTap});

  @override
  Widget build(BuildContext context) {
    final name = (venue['name'] as String? ?? 'İsimsiz mekan').trim();
    final district = (venue['district'] as String? ?? '').trim();
    final neighborhood = (venue['neighborhood'] as String? ?? '').trim();
    final address = (venue['address'] as String? ?? 'Adres bilgisi bulunmuyor.')
        .trim();
    final rating = venue['rating'];
    final ratingText = rating == null
        ? ''
        : rating.toString().replaceAll('.', ',');

    return Card(
      color: Colors.white,
      elevation: 0,
      margin: const EdgeInsets.only(bottom: 12),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
        side: const BorderSide(color: Color(0xFFE1E8EF)),
      ),
      child: InkWell(
        borderRadius: BorderRadius.circular(12),
        onTap: onTap,
        child: Padding(
          padding: const EdgeInsets.all(14),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Expanded(
                    child: Text(
                      name,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: const TextStyle(
                        color: Color(0xFF011E3A),
                        fontSize: 16,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                  ),
                  if (ratingText.isNotEmpty)
                    Text(
                      ratingText,
                      style: const TextStyle(
                        color: Color(0xFF094174),
                        fontSize: 14,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                ],
              ),
              const SizedBox(height: 6),
              Text(
                [
                  district,
                  neighborhood,
                ].where((part) => part.isNotEmpty).join(' / '),
                style: const TextStyle(
                  color: Color(0xFF627284),
                  fontSize: 13,
                  fontWeight: FontWeight.w600,
                ),
              ),
              const SizedBox(height: 8),
              Text(
                address,
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
                style: const TextStyle(
                  color: Color(0xFF2D3A45),
                  fontSize: 13,
                  height: 1.35,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class OfflineView extends StatelessWidget {
  final String? details;
  final VoidCallback onRetry;

  const OfflineView({super.key, required this.details, required this.onRetry});

  @override
  Widget build(BuildContext context) {
    return ColoredBox(
      color: Colors.white,
      child: SafeArea(
        child: Center(
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 32),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                const Icon(
                  Icons.wifi_off_rounded,
                  size: 42,
                  color: Color(0xFF011E3A),
                ),
                const SizedBox(height: 18),
                const Text(
                  'İnternet bağlantısı yok',
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.w600,
                    color: Color(0xFF011E3A),
                  ),
                ),
                const SizedBox(height: 8),
                const Text(
                  'Bağlantını kontrol edip yeniden deneyebilirsin.',
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    fontSize: 14,
                    height: 1.45,
                    color: Color(0xFF52606D),
                  ),
                ),
                if (details != null && details!.isNotEmpty) ...[
                  const SizedBox(height: 8),
                  Text(
                    details!,
                    textAlign: TextAlign.center,
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                    style: const TextStyle(
                      fontSize: 12,
                      color: Color(0xFF7B8794),
                    ),
                  ),
                ],
                const SizedBox(height: 22),
                FilledButton.icon(
                  onPressed: onRetry,
                  icon: const Icon(Icons.refresh_rounded, size: 18),
                  label: const Text('Tekrar dene'),
                  style: FilledButton.styleFrom(
                    minimumSize: const Size(152, 44),
                    backgroundColor: const Color(0xFF011E3A),
                    foregroundColor: Colors.white,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(6),
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
