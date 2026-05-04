import 'dart:async';
import 'dart:io';

import 'package:connectivity_plus/connectivity_plus.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:permission_handler/permission_handler.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:webview_flutter/webview_flutter.dart';
import 'package:webview_flutter_android/webview_flutter_android.dart';

const String kBundledEntryAssetPath = 'assets/app_web/index.html';
const String kDeepLinkHost = 'aramabul.com';
const String kDeepLinkHostWww = 'www.aramabul.com';

void main() {
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
        scaffoldBackgroundColor: const Color(0xFFEAE7DC),
      ),
      home: const HomeWebViewPage(),
    );
  }
}

class HomeWebViewPage extends StatefulWidget {
  const HomeWebViewPage({super.key});

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

  /// Check if URL is an AramaBul deep link that should stay inside the app.
  bool _isDeepLink(Uri uri) {
    final host = uri.host.toLowerCase();
    return host == kDeepLinkHost || host == kDeepLinkHostWww;
  }

  Future<NavigationDecision> _onNavigationRequest(
    NavigationRequest request,
  ) async {
    final rawUrl = request.url.trim();
    final parsed = Uri.tryParse(rawUrl);

    if (parsed == null) {
      return NavigationDecision.navigate;
    }

    // Deep links from aramabul.com stay in WebView.
    if (_isDeepLink(parsed)) {
      return NavigationDecision.navigate;
    }

    final scheme = parsed.scheme.toLowerCase();
    final shouldOpenExternally = _isMapLikeUrl(parsed, rawUrl) ||
        (scheme != 'http' &&
            scheme != 'https' &&
            scheme != 'about' &&
            scheme != 'file' &&
            scheme != 'data' &&
            scheme != 'javascript');

    if (!shouldOpenExternally) {
      return NavigationDecision.navigate;
    }

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
  // Connectivity
  // ---------------------------------------------------------------------------

  late final StreamSubscription<List<ConnectivityResult>> _connectivitySub;

  void _startConnectivityWatch() {
    _connectivitySub = Connectivity().onConnectivityChanged.listen((results) {
      final offline = results.every((r) => r == ConnectivityResult.none);
      if (!mounted) return;
      if (offline != _isOffline) {
        setState(() => _isOffline = offline);
        // Auto-reload when back online after being offline.
        if (!offline && _lastError != null) {
          _reload();
        }
      }
    });
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
          },
          onProgress: (value) {
            if (!mounted) return;
            setState(() {
              _progress = value;
            });
          },
          onWebResourceError: (error) {
            if (error.isForMainFrame != true) {
              return;
            }

            if (_hasLoadedAtLeastOnce) {
              return;
            }

            if (!mounted) return;
            setState(() {
              _lastError = error.description;
              _isLoading = false;
            });
          },
        ),
      );

    final platformController = _controller.platform;
    if (!kIsWeb && defaultTargetPlatform == TargetPlatform.android) {
      _controller.setBackgroundColor(const Color(0xFFEAE7DC));
    }
    if (platformController is AndroidWebViewController) {
      AndroidWebViewController.enableDebugging(true);
      platformController.setMediaPlaybackRequiresUserGesture(false);

      // Grant geolocation permission automatically when the web page requests it.
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

      // Handle file downloads
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

  Future<void> _loadInitialPage() async {
    try {
      await _loadBundledPage();
    } catch (error) {
      if (!mounted) return;
      setState(() {
        _isLoading = false;
        _lastError = error.toString();
      });
    }
  }

  Future<void> _loadBundledPage() async {
    await _controller.clearCache();
    await _controller.loadFlutterAsset(kBundledEntryAssetPath);
  }

  Future<void> _reload() async {
    setState(() {
      _isLoading = true;
      _lastError = null;
    });
    try {
      if (_hasLoadedAtLeastOnce) {
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

  /// Handle Android back button: go back in WebView history if possible,
  /// otherwise let the system handle it (exit app).
  Future<bool> _onBackPressed() async {
    if (await _controller.canGoBack()) {
      await _controller.goBack();
      return false; // Don't pop the route / exit the app.
    }
    return true; // Nothing to go back to — let system handle it.
  }

  // ---------------------------------------------------------------------------
  // UI
  // ---------------------------------------------------------------------------

  @override
  Widget build(BuildContext context) {
    final showProgress = _isLoading && _progress < 100;

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
        backgroundColor: const Color(0xFFEAE7DC),
        body: SafeArea(
          top: true,
          bottom: false,
          child: Column(
            children: [
              // Offline banner
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

              // Loading progress
              if (showProgress)
                LinearProgressIndicator(
                  value: _progress / 100,
                  color: const Color(0xFF1F6F54),
                  backgroundColor: const Color(0xFFEAE7DC),
                ),

              // Main content
              Expanded(
                child: Stack(
                  children: [
                    // Pull-to-refresh wrapper
                    RefreshIndicator(
                      color: const Color(0xFF1F6F54),
                      backgroundColor: Colors.white,
                      onRefresh: _reload,
                      child: SingleChildScrollView(
                        physics: const AlwaysScrollableScrollPhysics(),
                        child: SizedBox(
                          height: MediaQuery.of(context).size.height -
                              MediaQuery.of(context).padding.top -
                              (_isOffline ? 34 : 0) -
                              (showProgress ? 4 : 0),
                          child: WebViewWidget(controller: _controller),
                        ),
                      ),
                    ),

                    // Error / offline fallback overlay
                    if (_lastError != null)
                      _buildErrorOverlay(),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildErrorOverlay() {
    return Container(
      color: const Color(0xFFEAE7DC),
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
                    _isOffline ? Icons.wifi_off_rounded : Icons.error_outline_rounded,
                    size: 56,
                    color: _isOffline ? Colors.orange.shade700 : Colors.red.shade400,
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
                        ? 'İnternet bağlantınızı kontrol edin.\nBağlantı sağlandığında otomatik olarak yeniden yüklenecektir.'
                        : _lastError ?? 'Bilinmeyen hata',
                    textAlign: TextAlign.center,
                    style: TextStyle(
                      fontSize: 14,
                      color: Colors.grey.shade700,
                    ),
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
                    style: TextStyle(
                      fontSize: 12,
                      color: Colors.grey.shade500,
                    ),
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
