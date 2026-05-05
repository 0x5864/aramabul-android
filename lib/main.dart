import 'dart:async';
import 'dart:convert';

import 'package:connectivity_plus/connectivity_plus.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:permission_handler/permission_handler.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:webview_flutter/webview_flutter.dart';
import 'package:webview_flutter_android/webview_flutter_android.dart';

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
    final prefs = await SharedPreferences.getInstance();
    await prefs.setBool(_kWelcomeSeenKey, true);

    if (!mounted) return;

    // Map route to initial URL
    String? initialPath;
    switch (route) {
      case 'login':
        initialPath = '#login';
        break;
      case 'register':
        initialPath = '#register';
        break;
      case 'privacy':
        initialPath = '/gizlilik-politikasi.html';
        break;
      case 'terms':
        initialPath = '/kullanim-kosullari.html';
        break;
      default:
        initialPath = null; // guest → home page
    }

    Navigator.of(context).pushReplacement(
      MaterialPageRoute(
        builder: (_) => HomeWebViewPage(initialPath: initialPath),
      ),
    );
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
        style.textContent = `
          body {
            background: #fffaed !important;
          }
          .hero-content {
            background: transparent !important;
            border: none !important;
            box-shadow: none !important;
            border-radius: 0 !important;
            padding-left: 0 !important;
            padding-right: 0 !important;
          }
        `;
        document.head.appendChild(style);
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
      statusBarColor: Color(0xFFFDEFD6),
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
