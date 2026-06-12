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
import 'package:google_fonts/google_fonts.dart';
import 'package:permission_handler/permission_handler.dart';
import 'package:sign_in_with_apple/sign_in_with_apple.dart';
import 'package:share_plus/share_plus.dart';
import 'package:webview_flutter_android/webview_flutter_android.dart';

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

const String kLiveUrl = 'https://aramabul.com';
const String kDeepLinkHost = 'aramabul.com';
const String kDeepLinkHostWww = 'www.aramabul.com';

const String kAppVersion = '1.6.0';

const Color kAppBackgroundColor = Colors.white;
const Color kAppProgressColor = Color(0xFFE30A17);

const String _kNativeUsersKey = 'native_auth_users';

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
        textTheme: GoogleFonts.plusJakartaSansTextTheme(
          ThemeData.dark().textTheme,
        ),
      ),
      home: const HomeWebViewPage(),
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
  late final StreamSubscription<List<ConnectivityResult>> _connectivitySub;

  bool _isLoading = true;
  int _progress = 0;
  String? _lastError;
  bool _hasLoadedAtLeastOnce = false;
  bool _isPageTransitioning = false;
  bool _isOffline = false;
  bool _googleInitialized = false;

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
          },
          onPageFinished: (_) {
            if (!mounted) return;
            _injectAppBridge();
            _controller.currentUrl().then((currentUrl) {
              debugPrint('[HomeWebView] page finished: $currentUrl');
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
            setState(() => _progress = value);
          },
          onWebResourceError: (error) {
            if (error.isForMainFrame != true) return;
            if (!mounted) return;
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
    _loadInitialPage();
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
        final origin = Uri.tryParse(request.origin);
        final trustedOrigin =
            origin != null && origin.scheme == 'https' && _isDeepLink(origin);
        if (!trustedOrigin) {
          return const GeolocationPermissionsResponse(
            allow: false,
            retain: false,
          );
        }

        final status = await Permission.locationWhenInUse.request();
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
    setState(() {
      _isLoading = true;
      _isPageTransitioning = true;
      _lastError = null;
      _isOffline = false;
    });
    final requestedPath = path ?? widget.initialPath ?? '';
    final url = requestedPath.isNotEmpty ? '$kLiveUrl$requestedPath' : kLiveUrl;
    await _controller.loadRequest(Uri.parse(url));
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
    final parsed = Uri.tryParse(rawUrl);
    if (parsed == null) return NavigationDecision.navigate;

    if (_isDeepLink(parsed)) {
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

    if (!shouldOpenExternally) return NavigationDecision.navigate;

    Uri externalUri;
    try {
      externalUri = _resolveExternalUri(rawUrl);
    } catch (error) {
      return NavigationDecision.prevent;
    }
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
                prefs.setString('aramabul.auth.users.v1', normalizedUsers);
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
                    prefs.setString('auth_user_name', name);
                    prefs.setString('auth_user_email', email);
                  }
                }
              }
            } catch (e) {
              debugPrint('[AuthSync] session snapshot parse failed: $e');
            }
          });
          break;
        case 'getAppInfo':
          _controller.runJavaScript(
            'window.__ARAMABUL_APP__ = ${jsonEncode({'platform': 'android', 'version': kAppVersion, 'isApp': true})}',
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
            await prefs.setString('auth_user_name', loginName);
            await prefs.setString('auth_user_email', loginEmail);
          });
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
    await prefs.remove('auth_user_name');
    await prefs.remove('auth_user_email');
    try {
      await GoogleSignIn.instance.signOut();
    } catch (_) {}
    await WebViewCookieManager().clearCookies();
    if (!mounted) return;
    await _loadLivePage('/');
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

  Future<void> _syncSocialSessionToWeb({
    required String name,
    required String email,
  }) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('auth_user_name', name);
    await prefs.setString('auth_user_email', email);

    final sessionLiteral = jsonEncode(
      jsonEncode({'name': name, 'email': email}),
    );
    await _controller.runJavaScript('''
      try { localStorage.setItem('aramabul.auth.session.v1', $sessionLiteral); } catch(e) {}
      try { document.dispatchEvent(new CustomEvent('aramabul:authchange')); } catch(e) {}
      window.location.href = window.location.href.split('#')[0] + '?t=' + Date.now();
    ''');
  }

  Future<void> _handleGoogleSignInFromWebView() async {
    _controller.runJavaScript('''
      var btn = document.getElementById('appGoogleSignInBtn');
      if (btn) { btn.disabled = true; btn.style.opacity = '0.6'; }
      var msg = document.getElementById('appLoginMsg');
      if (msg) { msg.style.color = '#4a90d9'; msg.textContent = 'Google hesabınıza yönlendiriliyorsunuz...'; }
    ''');

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
      final errorText = jsonEncode('Google ile giriş başarısız: $e');
      _controller.runJavaScript('''
        var btn = document.getElementById('appGoogleSignInBtn');
        if (btn) { btn.disabled = false; btn.style.opacity = '1'; }
        var msg = document.getElementById('appLoginMsg');
        if (msg) { msg.style.color = '#e74c3c'; msg.textContent = $errorText; }
      ''');
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
      final authName = prefs.getString('auth_user_name') ?? '';
      final authEmail = prefs.getString('auth_user_email') ?? '';
      final authSessionJson = (authName.isNotEmpty && authEmail.isNotEmpty)
          ? jsonEncode({'name': authName, 'email': authEmail})
          : '';
      final nativeUsersRaw = prefs.getString('aramabul.auth.users.v1') ?? '[]';
      final appInfoLiteral = jsonEncode({
        'platform': 'android',
        'version': kAppVersion,
        'isApp': true,
      });
      final usersLiteral = jsonEncode(nativeUsersRaw);
      final sessionLiteral = jsonEncode(authSessionJson);

      await _controller.runJavaScript('''
        try {
          window.__ARAMABUL_APP__ = $appInfoLiteral;
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
            var isProfilePage = (window.location.pathname || '').toLowerCase().endsWith('/profile.html');
            if (isProfilePage) {
              var ferreroStyle = document.getElementById('aramabul-ferrero-profile-style');
              if (!ferreroStyle) {
                ferreroStyle = document.createElement('style');
                ferreroStyle.id = 'aramabul-ferrero-profile-style';
                (document.head || document.documentElement).appendChild(ferreroStyle);
              }
              ferreroStyle.textContent = [
                'html body.settings-page { background: #f8f2e8 !important; color: #3c2a20 !important; }',
                'html body.settings-page .settings-shell { padding-top: .25rem !important; background: transparent !important; }',
                '.ferrero-settings-heading { width: 100% !important; padding: .8rem .35rem .45rem !important; color: #3c2418 !important; box-sizing: border-box !important; }',
                '.ferrero-settings-heading h1 { margin: .08rem 0 0 !important; color: #3c2418 !important; font-family: Georgia, "Times New Roman", serif !important; font-size: clamp(1.8rem, 7vw, 2.35rem) !important; font-weight: 600 !important; letter-spacing: -.035em !important; line-height: 1 !important; }',
                '.ferrero-settings-kicker { display: block !important; color: #a77b43 !important; font-size: .68rem !important; font-weight: 700 !important; letter-spacing: .18em !important; text-transform: uppercase !important; }',
                'html body.settings-page .settings-sidebar-card { padding: .72rem !important; overflow: visible !important; border: 1px solid rgba(169,126,67,.28) !important; border-radius: 22px !important; background: linear-gradient(155deg, rgba(255,253,248,.98), rgba(247,237,222,.96)) !important; box-shadow: 0 18px 46px rgba(76,43,25,.12), inset 0 1px 0 rgba(255,255,255,.95) !important; }',
                'html body.settings-page .settings-sidebar-card .settings-row { min-height: 64px !important; margin: 0 0 .58rem !important; padding: 0 1rem !important; color: #3c2a20 !important; border: 1px solid rgba(162,119,62,.18) !important; border-radius: 16px !important; background: rgba(255,255,255,.72) !important; box-shadow: 0 5px 14px rgba(75,45,28,.055) !important; }',
                'html body.settings-page .settings-sidebar-card .settings-row:last-of-type { margin-bottom: 0 !important; }',
                'html body.settings-page .settings-sidebar-card .settings-row.is-active { color: #fff8eb !important; border-color: #8c633c !important; background: linear-gradient(135deg, #4b2d1f 0%, #6b422c 100%) !important; box-shadow: 0 10px 22px rgba(74,43,27,.23), inset 0 1px 0 rgba(255,255,255,.14) !important; }',
                'html body.settings-page .settings-sidebar-card .settings-row-icon { width: 28px !important; height: 28px !important; color: #6a432d !important; }',
                'html body.settings-page .settings-sidebar-card .settings-row-icon svg { width: 25px !important; height: 25px !important; stroke-width: 1.85 !important; }',
                'html body.settings-page .settings-sidebar-card .settings-row-label { color: #3c2a20 !important; font-size: 1rem !important; font-weight: 500 !important; letter-spacing: -.015em !important; }',
                'html body.settings-page .settings-sidebar-card .settings-row-chevron { color: #b08a57 !important; }',
                'html body.settings-page .settings-sidebar-card .settings-row.is-active .settings-row-icon, html body.settings-page .settings-sidebar-card .settings-row.is-active .settings-row-chevron, html body.settings-page .settings-sidebar-card .settings-row.is-active .settings-row-label { color: #fff8eb !important; stroke: #fff8eb !important; }',
                'html body.settings-page .settings-sidebar-card .settings-row:hover { border-color: rgba(162,119,62,.34) !important; background: #fffaf2 !important; }',
                'html body.settings-page .settings-sidebar-card .settings-row.is-active:hover { background: linear-gradient(135deg, #4b2d1f 0%, #6b422c 100%) !important; }'
              ].join('');

              var shell = document.querySelector('.settings-shell');
              var layout = shell && shell.querySelector('.settings-layout');
              var heading = shell && shell.querySelector('.ferrero-settings-heading');
              if (shell && layout && !heading) {
                heading = document.createElement('header');
                heading.className = 'ferrero-settings-heading';
                heading.innerHTML = '<span class="ferrero-settings-kicker">Profil</span><h1>Ayarlar</h1>';
                shell.insertBefore(heading, layout);
              }
            }
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
    } catch (error) {
      debugPrint('[HomeWebView] App bridge injection failed: $error');
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
                  if (_hasLoadedAtLeastOnce && !_isOffline)
                    WebViewWidget(controller: _controller),
                  if (_isOffline)
                    OfflineView(
                      details: kDebugMode ? _lastError : null,
                      onRetry: _reload,
                    ),
                  if (!_isOffline &&
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
      ),
    );
  }

  @override
  void dispose() {
    _connectivitySub.cancel();
    super.dispose();
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
