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
import 'package:crypto/crypto.dart';
import 'dart:ui' show ImageFilter;

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
const String kGoogleChooserFallbackPath = '/profile.html?action=login&app_google_chooser=1';

/// App version string injected into the WebView so the web code can detect it.
const String kAppVersion = '1.2.0';

const Color kAppBackgroundColor = Color(0xFFFFFFFF);
const Color kAppSurfaceColor = Color(0xFFFCF8F2);
const Color kAppInkColor = Color(0xFF2F241E);
const Color kAppAccentColor = Color(0xFFB08968);
const Color kAppSuccessColor = Color(0xFF8A5C3B);

const String _kWelcomeSeenKey = 'welcome_seen';
const String _kNativeUsersKey = 'native_auth_users';

class NativeUser {
  final String name;
  final String email;
  final String passwordHash;

  NativeUser({
    required this.name,
    required this.email,
    required this.passwordHash,
  });

  Map<String, dynamic> toJson() => {
        'name': name,
        'email': email,
        'passwordHash': passwordHash,
      };

  factory NativeUser.fromJson(Map<String, dynamic> json) {
    return NativeUser(
      name: json['name'] as String? ?? '',
      email: json['email'] as String? ?? '',
      passwordHash: json['passwordHash'] as String? ?? '',
    );
  }
}

/// Hash password using SHA-256
String hashPassword(String password) {
  final bytes = utf8.encode(password);
  final digest = sha256.convert(bytes);
  return digest.toString();
}

/// Load list of native users from SharedPreferences
Future<List<NativeUser>> loadNativeUsers() async {
  try {
    final prefs = await SharedPreferences.getInstance();
    final webUsersRaw = prefs.getString('aramabul.auth.users.v1') ?? '[]';
    final nativeUsersRaw = prefs.getString(_kNativeUsersKey) ?? '[]';
    
    final List<dynamic> parsedNative = jsonDecode(nativeUsersRaw) as List<dynamic>;
    final List<dynamic> parsedWeb = jsonDecode(webUsersRaw) as List<dynamic>;
    
    final Map<String, NativeUser> usersMap = {};
    for (final item in parsedWeb) {
      if (item is Map<String, dynamic>) {
        final u = NativeUser.fromJson(item);
        if (u.email.isNotEmpty) usersMap[u.email.toLowerCase()] = u;
      }
    }
    for (final item in parsedNative) {
      if (item is Map<String, dynamic>) {
        final u = NativeUser.fromJson(item);
        if (u.email.isNotEmpty) usersMap[u.email.toLowerCase()] = u;
      }
    }
    return usersMap.values.toList();
  } catch (e) {
    debugPrint('[NativeAuth] Error loading users: $e');
    return [];
  }
}

/// Save native users list to SharedPreferences and keep in sync with web key
Future<void> saveNativeUsers(List<NativeUser> users) async {
  try {
    final prefs = await SharedPreferences.getInstance();
    final jsonStr = jsonEncode(users.map((u) => u.toJson()).toList());
    await prefs.setString(_kNativeUsersKey, jsonStr);
    await prefs.setString('aramabul.auth.users.v1', jsonStr);
  } catch (e) {
    debugPrint('[NativeAuth] Error saving users: $e');
  }
}

/// Register a social login account in the shared backend session store.
Future<void> registerSocialLoginBackend({
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
    request.headers.set('Accept', 'application/json');
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
  }
}

/// Remove the demo account from local auth storage if it exists.
Future<void> purgeDemoAuthUserIfNeeded() async {
  try {
    final prefs = await SharedPreferences.getInstance();
    final nativeRaw = prefs.getString(_kNativeUsersKey) ?? '[]';
    final webRaw = prefs.getString('aramabul.auth.users.v1') ?? '[]';
    final storedName = prefs.getString('auth_user_name') ?? '';
    final storedEmail = prefs.getString('auth_user_email') ?? '';
    final rememberedEmail = prefs.getString('aramabul.auth.login.rememberedEmail.v1') ?? '';

    final filteredUsers = <Map<String, dynamic>>[];
    for (final raw in [nativeRaw, webRaw]) {
      try {
        final decoded = jsonDecode(raw);
        if (decoded is List) {
          for (final item in decoded) {
            if (item is Map) {
              final email = (item['email'] ?? '').toString().trim().toLowerCase();
              if (email.isNotEmpty && email == 'demo@aramabul.com') {
                continue;
              }
              filteredUsers.add(Map<String, dynamic>.from(item));
            }
          }
        }
      } catch (_) {}
    }

    final nativeJson = jsonEncode(filteredUsers);
    await prefs.setString(_kNativeUsersKey, nativeJson);
    await prefs.setString('aramabul.auth.users.v1', nativeJson);

    if (storedEmail.trim().toLowerCase() == 'demo@aramabul.com') {
      await prefs.remove('auth_user_name');
      await prefs.remove('auth_user_email');
    } else if (storedName.trim().toLowerCase() == 'demo kullanıcı') {
      await prefs.remove('auth_user_name');
      await prefs.remove('auth_user_email');
    }

    if (rememberedEmail.trim().toLowerCase() == 'demo@aramabul.com') {
      await prefs.remove('aramabul.auth.login.rememberedEmail.v1');
    }

    debugPrint('[NativeAuth] Demo auth user purged if present');
  } catch (e) {
    debugPrint('[NativeAuth] Demo purge failed: $e');
  }
}

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

  await purgeDemoAuthUserIfNeeded();

  // Initialize Google Sign-In once at startup to prevent double account chooser popup
  try {
    await GoogleSignIn.instance.initialize(
      clientId: '849707147159-r27vvc6qoqsu66r8gh6mkc2d56b4ls1u.apps.googleusercontent.com',
      serverClientId: '849707147159-94nfppfamm7p9qs7ipef6v62hink6776.apps.googleusercontent.com',
    );
  } catch (e) {
    debugPrint('[GoogleSignIn] Initialization error: $e');
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
        colorScheme: ColorScheme.fromSeed(seedColor: kAppSuccessColor),
        scaffoldBackgroundColor: kAppBackgroundColor,
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
  String? _homeInitialPath;

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

    debugPrint('[Welcome] continue tapped: $route');

    switch (route) {
      case 'login':
        final prefsLogin = await SharedPreferences.getInstance();
        await prefsLogin.setBool(_kWelcomeSeenKey, true);
        if (!mounted) return;
        Navigator.of(context).pushReplacement(
          MaterialPageRoute(
            builder: (_) => const _AuthPage(
              mode: 'login',
              title: 'Giriş Yap',
            ),
          ),
        );
        break;

      case 'register':
        final prefsRegister = await SharedPreferences.getInstance();
        await prefsRegister.setBool(_kWelcomeSeenKey, true);
        if (!mounted) return;
        Navigator.of(context).pushReplacement(
          MaterialPageRoute(
            builder: (_) => const _AuthPage(
              mode: 'signup',
              title: 'Hesap Oluştur',
            ),
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
            backgroundColor: kAppSuccessColor,
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
        setState(() {
          _showWelcome = false;
          _homeInitialPath = null;
        });
    }
  }

  Future<void> _handleGoogleSignIn() async {
    try {
      final account = await GoogleSignIn.instance.authenticate();
      final name = account.displayName ?? '';
      final email = account.email;

      // Save session locally
      final prefs = await SharedPreferences.getInstance();
      await prefs.setBool(_kWelcomeSeenKey, true);
      await prefs.setString('auth_user_name', name);
      await prefs.setString('auth_user_email', email);

      // Register with backend (fire-and-forget)
      registerSocialLoginBackend(
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
      final errStr = e.toString().toLowerCase();
      if (errStr.contains('canceled') || errStr.contains('cancelled') || errStr.contains('cancellation')) {
        final prefs = await SharedPreferences.getInstance();
        await prefs.setBool(_kWelcomeSeenKey, true);
        if (!mounted) return;
        Navigator.of(context).pushAndRemoveUntil(
          MaterialPageRoute(
            builder: (_) => const HomeWebViewPage(initialPath: kGoogleChooserFallbackPath),
          ),
          (route) => false,
        );
        return;
      }
      if (errStr.contains('no credential available') ||
          errStr.contains('nocredentialexception') ||
          errStr.contains('credential unavailable') ||
          errStr.contains('no credentials available')) {
        final prefs = await SharedPreferences.getInstance();
        await prefs.setBool(_kWelcomeSeenKey, true);
        if (!mounted) return;
        Navigator.of(context).pushAndRemoveUntil(
          MaterialPageRoute(
            builder: (_) => const HomeWebViewPage(initialPath: kGoogleChooserFallbackPath),
          ),
          (route) => false,
        );
        return;
      }
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
      registerSocialLoginBackend(
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
        backgroundColor: kAppBackgroundColor,
        body: Center(
          child: CircularProgressIndicator(color: kAppSuccessColor),
        ),
      );
    }

    if (_showWelcome!) {
      return WelcomeScreen(onContinue: _onWelcomeComplete);
    }

    return HomeWebViewPage(initialPath: _homeInitialPath);
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
      '_s.textContent="html body .mobile-bottom-nav, html body.mobile-bottom-nav-visible .mobile-bottom-nav, html body.home-page .mobile-bottom-nav, body.mobile-chrome-browser.mobile-force-layout.home-page .mobile-bottom-nav, body.mobile-chrome-browser.mobile-force-layout.home-page .mobile-bottom-nav-actions, html body.mobile-chrome-browser.mobile-force-layout.home-page .mobile-bottom-nav, html body.mobile-chrome-browser.mobile-force-layout.home-page .mobile-bottom-nav-actions, .mobile-bottom-nav.mobile-bottom-nav.mobile-bottom-nav, .mobile-bottom-nav-actions.mobile-bottom-nav-actions.mobile-bottom-nav-actions {display:none!important;height:0!important;max-height:0!important;overflow:hidden!important;opacity:0!important;pointer-events:none!important;visibility:hidden!important;}'
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
        backgroundColor: kAppSuccessColor,
        foregroundColor: const Color(0xFFF7F1E6),
        elevation: 0,
      ),
      body: Stack(
        children: [
          WebViewWidget(controller: _controller),
          if (_isLoading)
            const Center(
              child: CircularProgressIndicator(color: Color(0xFF8A5C3B)),
            ),
        ],
      ),
    );
  }
}

/// Unified auth page — full-screen form for login or signup (no tabs).
enum _AuthState { login, signup, forgot }

class _AuthPage extends StatefulWidget {
  final String mode;
  final String title;

  const _AuthPage({required this.mode, required this.title});

  @override
  State<_AuthPage> createState() => _AuthPageState();
}

class _AuthPageState extends State<_AuthPage> {
  late _AuthState _state;
  
  // Controllers
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  
  final _signupFirstNameController = TextEditingController();
  final _signupLastNameController = TextEditingController();
  final _signupEmailController = TextEditingController();
  final _signupPasswordController = TextEditingController();
  final _signupConfirmPasswordController = TextEditingController();
  
  final _forgotEmailController = TextEditingController();
  
  bool _passwordVisible = false;
  bool _signupPasswordVisible = false;
  bool _signupConfirmPasswordVisible = false;
  
  bool _rememberEmail = true;
  bool _isLoading = false;
  String _errorMessage = '';
  String _successMessage = '';

  @override
  void initState() {
    super.initState();
    _state = widget.mode == 'signup' ? _AuthState.signup : _AuthState.login;
    _loadRememberedEmail();
  }

  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
    _signupFirstNameController.dispose();
    _signupLastNameController.dispose();
    _signupEmailController.dispose();
    _signupPasswordController.dispose();
    _signupConfirmPasswordController.dispose();
    _forgotEmailController.dispose();
    super.dispose();
  }

  Future<void> _loadRememberedEmail() async {
    final prefs = await SharedPreferences.getInstance();
    final email = prefs.getString('aramabul.auth.login.rememberedEmail.v1') ?? '';
    if (email.isNotEmpty) {
      setState(() {
        _emailController.text = email;
        _rememberEmail = true;
      });
    }
  }

  void _showError(String message) {
    if (!mounted) return;
    setState(() {
      _errorMessage = message;
      _successMessage = '';
    });
  }

  Future<Map<String, dynamic>?> _postJson(String path, Map<String, dynamic> body) async {
    try {
      final client = HttpClient();
      final request = await client.postUrl(Uri.parse('https://aramabul.com$path'));
      request.headers.set('Content-Type', 'application/json');
      request.headers.set('Accept', 'application/json');
      request.write(jsonEncode(body));
      final response = await request.close();
      final responseBody = await response.transform(utf8.decoder).join();
      client.close();

      Map<String, dynamic> payload = {};
      try {
        final decoded = jsonDecode(responseBody);
        if (decoded is Map<String, dynamic>) {
          payload = decoded;
        }
      } catch (_) {
        payload = {};
      }

      return {
        'statusCode': response.statusCode,
        'payload': payload,
      };
    } catch (e) {
      debugPrint('[Auth] POST $path failed: $e');
      return null;
    }
  }

  // ---------------------------------------------------------------------------
  // Social Logins (Google & Apple)
  // ---------------------------------------------------------------------------
  Future<void> _handleGoogleSignIn() async {
    setState(() => _isLoading = true);
    try {
      final account = await GoogleSignIn.instance.authenticate();

      final name = account.displayName ?? '';
      final email = account.email;

      // Save session locally
      final prefs = await SharedPreferences.getInstance();
      await prefs.setBool('welcome_seen', true);
      await prefs.setString('auth_user_name', name);
      await prefs.setString('auth_user_email', email);

      // Register with backend (fire-and-forget)
      registerSocialLoginBackend(
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
      setState(() => _isLoading = false);
      final errStr = e.toString().toLowerCase();
      if (errStr.contains('canceled') || errStr.contains('cancelled') || errStr.contains('cancellation')) {
        final prefs = await SharedPreferences.getInstance();
        await prefs.setBool('welcome_seen', true);
        if (!mounted) return;
        Navigator.of(context).pushAndRemoveUntil(
          MaterialPageRoute(
            builder: (_) => const HomeWebViewPage(initialPath: kGoogleChooserFallbackPath),
          ),
          (route) => false,
        );
        return;
      }
      if (errStr.contains('no credential available') ||
          errStr.contains('nocredentialexception') ||
          errStr.contains('credential unavailable') ||
          errStr.contains('no credentials available')) {
        final prefs = await SharedPreferences.getInstance();
        await prefs.setBool('welcome_seen', true);
        if (!mounted) return;
        Navigator.of(context).pushAndRemoveUntil(
          MaterialPageRoute(
            builder: (_) => const HomeWebViewPage(initialPath: kGoogleChooserFallbackPath),
          ),
          (route) => false,
        );
        return;
      }
      _showError('Google ile giriş başarısız: $e');
    }
  }

  Future<void> _handleAppleSignIn() async {
    setState(() => _isLoading = true);
    try {
      final isAvailable = await SignInWithApple.isAvailable();
      if (!isAvailable) {
        setState(() => _isLoading = false);
        _showError('Apple ile giriş bu cihazda desteklenmiyor.');
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

      final name = [
        credential.givenName ?? '',
        credential.familyName ?? '',
      ].where((s) => s.isNotEmpty).join(' ');
      final email = credential.email ?? '';

      // Save session locally
      final prefs = await SharedPreferences.getInstance();
      await prefs.setBool('welcome_seen', true);
      if (name.isNotEmpty) await prefs.setString('auth_user_name', name);
      if (email.isNotEmpty) await prefs.setString('auth_user_email', email);
      if (credential.userIdentifier != null) {
        await prefs.setString('auth_apple_id', credential.userIdentifier!);
      }

      // Register with backend
      registerSocialLoginBackend(
        provider: 'apple',
        email: email,
        name: name,
        providerId: credential.userIdentifier,
      );

      if (!mounted) return;
      Navigator.of(context).pushAndRemoveUntil(
        MaterialPageRoute(builder: (_) => const HomeWebViewPage()),
        (route) => false,
      );
    } catch (e) {
      setState(() => _isLoading = false);
      if (e is SignInWithAppleAuthorizationException &&
          e.code == AuthorizationErrorCode.canceled) {
        return;
      }
      _showError('Apple ile giriş başarısız: $e');
    }
  }

  // ---------------------------------------------------------------------------
  // Native Flow Submission Handlers
  // ---------------------------------------------------------------------------
  void _handleLogin() async {
    final email = _emailController.text.trim().toLowerCase();
    final password = _passwordController.text;
    
    if (email.isEmpty || !email.contains('@')) {
      _showError('Geçerli bir e-posta gir.');
      return;
    }
    if (password.isEmpty) {
      _showError('Şifre gir.');
      return;
    }

    setState(() => _isLoading = true);
    
    try {
      final result = await _postJson('/api/auth/login', {
        'email': email,
        'password': password,
      });

      final statusCode = result?['statusCode'] as int? ?? 0;
      final payload = result?['payload'] as Map<String, dynamic>? ?? {};
      if (statusCode < 200 || statusCode >= 300 || payload['ok'] != true) {
        setState(() => _isLoading = false);
        final backendError = payload['error'];
        final message = backendError is Map<String, dynamic>
            ? (backendError['message'] as String? ?? 'E-posta veya şifre hatalı.')
            : (payload['message'] as String? ?? 'E-posta veya şifre hatalı.');
        _showError(message);
        return;
      }

      final session = (payload['session'] is Map<String, dynamic>)
          ? payload['session'] as Map<String, dynamic>
          : (payload['user'] is Map<String, dynamic>)
              ? payload['user'] as Map<String, dynamic>
              : <String, dynamic>{};
      final sessionName = (session['displayName'] as String? ?? session['name'] as String? ?? '').trim();
      final sessionEmail = (session['email'] as String? ?? email).trim().toLowerCase();

      final prefs = await SharedPreferences.getInstance();
      if (_rememberEmail) {
        await prefs.setString('aramabul.auth.login.rememberedEmail.v1', email);
      } else {
        await prefs.remove('aramabul.auth.login.rememberedEmail.v1');
      }

      await prefs.setString('auth_user_name', sessionName.isNotEmpty ? sessionName : email.split('@')[0]);
      await prefs.setString('auth_user_email', sessionEmail);
      await prefs.setBool('welcome_seen', true);

      if (!mounted) return;
      Navigator.of(context).pushAndRemoveUntil(
        MaterialPageRoute(builder: (_) => const HomeWebViewPage()),
        (route) => false,
      );
    } catch (e) {
      setState(() => _isLoading = false);
      _showError('Giriş yapılırken hata oluştu: $e');
    }
  }

  void _handleSignup() async {
    final firstName = _signupFirstNameController.text.trim();
    final lastName = _signupLastNameController.text.trim();
    final email = _signupEmailController.text.trim().toLowerCase();
    final password = _signupPasswordController.text;
    final confirm = _signupConfirmPasswordController.text;

    if (firstName.length < 2 || lastName.length < 2) {
      _showError('Ad ve soyad en az 2 karakter olmalıdır.');
      return;
    }
    if (email.isEmpty || !email.contains('@')) {
      _showError('Geçerli bir e-posta gir.');
      return;
    }
    if (password.length < 6) {
      _showError('Şifre en az 6 karakter olmalıdır.');
      return;
    }
    if (password != confirm) {
      _showError('Şifreler eşleşmiyor.');
      return;
    }

    setState(() => _isLoading = true);

    try {
      final fullName = '$firstName $lastName';
      final result = await _postJson('/api/auth/signup', {
        'firstName': firstName,
        'lastName': lastName,
        'displayName': fullName,
        'email': email,
        'password': password,
      });

      final statusCode = result?['statusCode'] as int? ?? 0;
      final payload = result?['payload'] as Map<String, dynamic>? ?? {};
      if (statusCode < 200 || statusCode >= 300 || payload['ok'] != true) {
        setState(() => _isLoading = false);
        final backendError = payload['error'];
        final message = backendError is Map<String, dynamic>
            ? (backendError['message'] as String? ?? 'Hesap oluşturulamadı.')
            : (payload['message'] as String? ?? 'Hesap oluşturulamadı.');
        _showError(message);
        return;
      }

      final session = (payload['session'] is Map<String, dynamic>)
          ? payload['session'] as Map<String, dynamic>
          : (payload['user'] is Map<String, dynamic>)
              ? payload['user'] as Map<String, dynamic>
              : <String, dynamic>{};
      final sessionName = (session['displayName'] as String? ?? session['name'] as String? ?? fullName).trim();
      final sessionEmail = (session['email'] as String? ?? email).trim().toLowerCase();

      // Automatically log in
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString('auth_user_name', sessionName.isNotEmpty ? sessionName : fullName);
      await prefs.setString('auth_user_email', sessionEmail);
      await prefs.setBool('welcome_seen', true);

      if (!mounted) return;
      Navigator.of(context).pushAndRemoveUntil(
        MaterialPageRoute(builder: (_) => const HomeWebViewPage()),
        (route) => false,
      );
    } catch (e) {
      setState(() => _isLoading = false);
      _showError('Hesap oluşturulurken hata oluştu: $e');
    }
  }

  void _handleForgotPassword() async {
    final email = _forgotEmailController.text.trim().toLowerCase();
    if (email.isEmpty || !email.contains('@')) {
      _showError('Geçerli bir e-posta gir.');
      return;
    }

    setState(() => _isLoading = true);

    try {
      final client = HttpClient();
      final request = await client.postUrl(
        Uri.parse('https://aramabul.com/api/auth/password-change/request'),
      );
      request.headers.set('Content-Type', 'application/json');
      request.headers.set('Accept', 'application/json');
      request.write(jsonEncode({'email': email}));

      final response = await request.close();
      final body = await response.transform(utf8.decoder).join();
      client.close();

      Map<String, dynamic> payload = const {};
      try {
        final decoded = jsonDecode(body);
        if (decoded is Map<String, dynamic>) payload = decoded;
      } catch (_) {
        payload = const {};
      }

      if (response.statusCode == 429) {
        _showError('Çok fazla istek gönderildi. Biraz sonra tekrar dene.');
        return;
      }
      if (response.statusCode == 503) {
        _showError('Şu anda e-posta ile şifre sıfırlama gönderilemiyor. Lütfen biraz sonra tekrar dene.');
        return;
      }
      if (response.statusCode < 200 || response.statusCode >= 300 || payload['ok'] != true) {
        _showError('Şifre sıfırlama bağlantısı gönderilemedi.');
        return;
      }

      if (!mounted) return;
      setState(() {
        _errorMessage = '';
        _successMessage = 'Şifre sıfırlama bağlantısı e-posta adresine gönderildi.';
      });
    } catch (e) {
      _showError('Şifre sıfırlama bağlantısı gönderilemedi: $e');
    } finally {
      if (mounted) {
        setState(() => _isLoading = false);
      }
    }
  }

  // ---------------------------------------------------------------------------
  // Helper Builders
  // ---------------------------------------------------------------------------
  Widget _buildTextField({
    required TextEditingController controller,
    required String labelText,
    required String hintText,
    bool isPassword = false,
    bool? passwordVisible,
    VoidCallback? onToggleVisibility,
    TextInputType keyboardType = TextInputType.text,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          labelText,
          style: const TextStyle(
            color: Color(0xFF5F432F),
            fontSize: 14,
            fontWeight: FontWeight.w400,
          ),
        ),
        const SizedBox(height: 6),
        Container(
          decoration: BoxDecoration(
            color: const Color(0xFFF7F1E6).withValues(alpha: 0.72),
            borderRadius: BorderRadius.circular(10),
            border: Border.all(color: const Color(0xFFB08968).withValues(alpha: 0.20)),
          ),
          child: TextField(
            controller: controller,
            obscureText: isPassword && (passwordVisible == false),
            keyboardType: keyboardType,
            style: const TextStyle(color: Color(0xFF2F241E), fontSize: 15),
            decoration: InputDecoration(
              hintText: hintText,
              hintStyle: const TextStyle(color: Color(0xFF8F7965), fontSize: 14),
              contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
              border: InputBorder.none,
              suffixIcon: isPassword
                  ? IconButton(
                      icon: Icon(
                        passwordVisible == true
                            ? Icons.visibility_rounded
                            : Icons.visibility_off_rounded,
                        color: const Color(0xFF8A5C3B),
                        size: 20,
                      ),
                      onPressed: onToggleVisibility,
                    )
                  : null,
            ),
          ),
        ),
        const SizedBox(height: 14),
      ],
    );
  }

  Widget _buildGradientButton({required String label, required VoidCallback onTap}) {
    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(999),
        child: Ink(
          width: double.infinity,
          height: 50,
          decoration: BoxDecoration(
            gradient: const LinearGradient(
              begin: Alignment.topCenter,
              end: Alignment.bottomCenter,
              colors: [Color(0xFF8A5C3B), Color(0xFFB08968)],
            ),
            borderRadius: BorderRadius.circular(999),
            boxShadow: [
              BoxShadow(
                color: Colors.white.withValues(alpha: 0.10),
                blurRadius: 10,
                offset: const Offset(-1, -1),
              ),
              BoxShadow(
                color: const Color(0xFF8A5C3B).withValues(alpha: 0.34),
                blurRadius: 16,
                offset: const Offset(0, 7),
              ),
              BoxShadow(
                color: const Color(0xFF4B3528).withValues(alpha: 0.18),
                blurRadius: 10,
                offset: const Offset(0, 3),
              ),
            ],
          ),
          child: Center(
            child: Text(
              label,
              style: const TextStyle(
                color: Color(0xFFF7F1E6),
                fontSize: 15,
                fontWeight: FontWeight.w500,
              ),
            ),
          ),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    String appBarTitle = 'Giriş Yap';
    switch (_state) {
      case _AuthState.login:
        appBarTitle = 'Giriş Yap';
        break;
      case _AuthState.signup:
        appBarTitle = 'Hesap Oluştur';
        break;
      case _AuthState.forgot:
        appBarTitle = 'Şifremi Unuttum';
        break;
    }

    return Scaffold(
      appBar: AppBar(
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_rounded),
          tooltip: 'Geri',
          onPressed: () {
            if (Navigator.of(context).canPop()) {
              Navigator.of(context).pop();
            } else {
              SystemNavigator.pop();
            }
          },
        ),
        title: Text(
          appBarTitle,
          style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w400),
        ),
        backgroundColor: kAppSuccessColor,
        foregroundColor: const Color(0xFFF7F1E6),
        elevation: 0,
      ),
      body: GestureDetector(
        onTap: () => FocusScope.of(context).unfocus(),
        behavior: HitTestBehavior.translucent,
        child: Stack(
          children: [
            // Background Image with dark blend
            Positioned.fill(
              child: Image.asset(
                'assets/welcome/coffee.jpeg',
                fit: BoxFit.cover,
                color: const Color(0xFF5A3C2B).withValues(alpha: 0.28),
                colorBlendMode: BlendMode.darken,
              ),
            ),
            // Scrollable content
            SafeArea(
              child: Center(
                child: SingleChildScrollView(
                  padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
                  child: ClipRRect(
                    borderRadius: BorderRadius.circular(18),
                    child: BackdropFilter(
                      filter: ImageFilter.blur(sigmaX: 14, sigmaY: 14),
                      child: Container(
                        decoration: BoxDecoration(
                          color: const Color(0xFFF7F1E6).withValues(alpha: 0.14),
                          border: Border.all(color: const Color(0xFFF4E8D8).withValues(alpha: 0.16), width: 1),
                          borderRadius: BorderRadius.circular(18),
                        ),
                        child: Padding(
                          padding: const EdgeInsets.all(24),
                          child: Column(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              if (_state == _AuthState.login) _buildLoginView(),
                              if (_state == _AuthState.signup) _buildSignupView(),
                              if (_state == _AuthState.forgot) _buildForgotView(),
                              
                              // Loader overlay inside card
                              if (_isLoading) ...[
                                const SizedBox(height: 20),
                                const SizedBox(
                                  width: 24,
                                  height: 24,
                                  child: CircularProgressIndicator(
                                    strokeWidth: 2.5,
                                    color: Color(0xFF8A5C3B),
                                  ),
                                ),
                              ],

                              // Global success & error messages
                              if (_errorMessage.isNotEmpty) ...[
                                const SizedBox(height: 16),
                                Text(
                                  _errorMessage,
                                  textAlign: TextAlign.center,
                                  style: const TextStyle(
                                    color: Color(0xFFFFFDF8),
                                    fontSize: 13,
                                    fontWeight: FontWeight.w400,
                                    shadows: [
                                      Shadow(color: Color(0x1F162123), blurRadius: 2, offset: Offset(0, 1)),
                                    ],
                                  ),
                                ),
                              ],
                              if (_successMessage.isNotEmpty) ...[
                                const SizedBox(height: 16),
                                Text(
                                  _successMessage,
                                  textAlign: TextAlign.center,
                                  style: const TextStyle(color: Color(0xFF5F432F), fontSize: 13, fontWeight: FontWeight.w400),
                                ),
                              ],
                            ],
                          ),
                        ),
                      ),
                    ),
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  // ---------------------------------------------------------------------------
  // Individual State Views
  // ---------------------------------------------------------------------------
  Widget _buildLoginView() {
    return Column(
      children: [
        // Title: Centered, Bold
        const Text(
          'Giriş Yap',
          style: TextStyle(
            color: Color(0xFFF7F1E6),
            fontSize: 20,
            fontWeight: FontWeight.w700,
          ),
        ),
        const SizedBox(height: 12),
        
        // Google button
        _buildGoogleSignInButton(),
        if (!kIsWeb && Platform.isIOS) ...[
          const SizedBox(height: 14),
          _buildAppleSignInButton(),
        ],
        const SizedBox(height: 14),
        
        // veya divider
        Row(
          children: [
            Expanded(child: Divider(color: const Color(0xFFF4E8D8).withValues(alpha: 0.28), thickness: 0.5)),
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 10),
              child: Text(
                'veya',
                style: TextStyle(color: const Color(0xFFF4E8D8).withValues(alpha: 0.7), fontSize: 12, fontWeight: FontWeight.w400),
              ),
            ),
            Expanded(child: Divider(color: const Color(0xFFF4E8D8).withValues(alpha: 0.28), thickness: 0.5)),
          ],
        ),
        const SizedBox(height: 14),

        // Subtitle below the veya divider
        const Text(
          'E-posta adresin ve şifrenle giriş yapabilirsin.',
          textAlign: TextAlign.center,
          style: TextStyle(
            color: Color(0xFFF4E8D8),
            fontSize: 13,
            fontWeight: FontWeight.w400,
          ),
        ),
        const SizedBox(height: 16),

        _buildTextField(
          controller: _emailController,
          labelText: 'E-posta',
          hintText: 'e-posta@adresiniz.com',
          keyboardType: TextInputType.emailAddress,
        ),
        _buildTextField(
          controller: _passwordController,
          labelText: 'Şifre',
          hintText: '••••••',
          isPassword: true,
          passwordVisible: _passwordVisible,
          onToggleVisibility: () => setState(() => _passwordVisible = !_passwordVisible),
        ),
        
        // Remember Email Checkbox & Forgot Password Link
        Wrap(
          alignment: WrapAlignment.spaceBetween,
          crossAxisAlignment: WrapCrossAlignment.center,
          spacing: 12,
          runSpacing: 8,
          children: [
            Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                SizedBox(
                  width: 24,
                  height: 24,
                  child: Checkbox(
                    value: _rememberEmail,
                    onChanged: (val) => setState(() => _rememberEmail = val ?? true),
                    activeColor: const Color(0xFF8A5C3B),
                    side: BorderSide(color: const Color(0xFFF4E8D8).withValues(alpha: 0.4)),
                  ),
                ),
                const SizedBox(width: 8),
                const Text(
                  'E-postamı hatırla',
                  style: TextStyle(color: Color(0xFFF4E8D8), fontSize: 13, fontWeight: FontWeight.w400),
                ),
              ],
            ),
            GestureDetector(
              onTap: () => setState(() {
                _state = _AuthState.forgot;
                _errorMessage = '';
                _successMessage = '';
              }),
              child: const Text(
                'Şifremi unuttum',
                style: TextStyle(
                  color: Color(0xFFB08968),
                  fontSize: 13,
                  fontWeight: FontWeight.w400,
                ),
              ),
            ),
          ],
        ),
        const SizedBox(height: 24),
        
        _buildGradientButton(
          label: 'Giriş yap',
          onTap: _handleLogin,
        ),
        const SizedBox(height: 20),
        
        // Sign up link
        Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Text(
              'Hesabın yok mu? ',
              style: TextStyle(color: Color(0xFFF4E8D8), fontSize: 13, fontWeight: FontWeight.w400),
            ),
            GestureDetector(
              onTap: () => setState(() {
                _state = _AuthState.signup;
                _errorMessage = '';
                _successMessage = '';
              }),
              child: const Text(
                'Kayıt ol',
                style: TextStyle(
                  color: Color(0xFFB08968),
                  fontSize: 13,
                  fontWeight: FontWeight.w400,
                ),
              ),
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildSignupView() {
    return Column(
      children: [
        const Text(
          'Hesap Oluştur',
          style: TextStyle(
            color: Color(0xFFF7F1E6),
            fontSize: 20,
            fontWeight: FontWeight.w700,
          ),
        ),
        const SizedBox(height: 6),
        const Text(
          'Hemen kayıt olup favori mekanlarını kaydetmeye başla.',
          textAlign: TextAlign.center,
          style: TextStyle(
            color: Color(0xFFF4E8D8),
            fontSize: 13,
            fontWeight: FontWeight.w400,
          ),
        ),
        const SizedBox(height: 20),
        
        _buildTextField(
          controller: _signupFirstNameController,
          labelText: 'Ad',
          hintText: 'Adınız',
        ),
        _buildTextField(
          controller: _signupLastNameController,
          labelText: 'Soyad',
          hintText: 'Soyadınız',
        ),
        _buildTextField(
          controller: _signupEmailController,
          labelText: 'E-posta',
          hintText: 'e-posta@adresiniz.com',
          keyboardType: TextInputType.emailAddress,
        ),
        _buildTextField(
          controller: _signupPasswordController,
          labelText: 'Şifre',
          hintText: '••••••',
          isPassword: true,
          passwordVisible: _signupPasswordVisible,
          onToggleVisibility: () => setState(() => _signupPasswordVisible = !_signupPasswordVisible),
        ),
        _buildTextField(
          controller: _signupConfirmPasswordController,
          labelText: 'Şifre tekrar',
          hintText: '••••••',
          isPassword: true,
          passwordVisible: _signupConfirmPasswordVisible,
          onToggleVisibility: () => setState(() => _signupConfirmPasswordVisible = !_signupConfirmPasswordVisible),
        ),
        const SizedBox(height: 10),
        
        Text(
          'Kayıt olarak Kullanım Koşulları ve Gizlilik Politikası hükümlerini kabul etmiş olursunuz.',
          textAlign: TextAlign.center,
          style: TextStyle(color: const Color(0xFFF4E8D8).withValues(alpha: 0.55), fontSize: 11, fontWeight: FontWeight.w400),
        ),
        const SizedBox(height: 20),
        
        _buildGradientButton(
          label: 'Kayıt ol',
          onTap: _handleSignup,
        ),
        const SizedBox(height: 20),
        
        Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Text(
              'Zaten üye misiniz? ',
              style: TextStyle(color: Color(0xFFF4E8D8), fontSize: 13, fontWeight: FontWeight.w400),
            ),
            GestureDetector(
              onTap: () => setState(() {
                _state = _AuthState.login;
                _errorMessage = '';
                _successMessage = '';
              }),
              child: const Text(
                'Giriş yap',
                style: TextStyle(
                  color: Color(0xFFB08968),
                  fontSize: 13,
                  fontWeight: FontWeight.w400,
                ),
              ),
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildForgotView() {
    return Column(
      children: [
        const Text(
          'Şifremi Unuttum',
          style: TextStyle(
            color: Color(0xFFF7F1E6),
            fontSize: 20,
            fontWeight: FontWeight.w700,
          ),
        ),
        const SizedBox(height: 6),
        const Text(
          'Şifrenizi sıfırlamak için e-posta adresinizi girin.',
          textAlign: TextAlign.center,
          style: TextStyle(
            color: Color(0xFFF4E8D8),
            fontSize: 13,
            fontWeight: FontWeight.w400,
          ),
        ),
        const SizedBox(height: 20),
        
        _buildTextField(
          controller: _forgotEmailController,
          labelText: 'E-posta',
          hintText: 'e-posta@adresiniz.com',
          keyboardType: TextInputType.emailAddress,
        ),
        const SizedBox(height: 16),

        _buildGradientButton(
          label: 'Bağlantı Gönder',
          onTap: _handleForgotPassword,
        ),
        const SizedBox(height: 20),

        GestureDetector(
          onTap: () => setState(() {
            _state = _AuthState.login;
            _errorMessage = '';
            _successMessage = '';
            _forgotEmailController.clear();
          }),
          child: const Text(
            'Giriş sayfasına dön',
            style: TextStyle(
              color: Color(0xFFB08968),
              fontSize: 13,
              fontWeight: FontWeight.w400,
            ),
          ),
        ),
      ],
    );
  }

  // ---------------------------------------------------------------------------
  // Social Login Button Builders
  // ---------------------------------------------------------------------------
  Widget _buildGoogleSignInButton() {
    return Container(
      width: double.infinity,
      height: 46,
      decoration: BoxDecoration(
        color: const Color(0xFFF7F1E6),
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: const Color(0xFFB08968).withValues(alpha: 0.45)),
      ),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          onTap: _handleGoogleSignIn,
          borderRadius: BorderRadius.circular(10),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Image.asset('assets/welcome/google_g.png', width: 22, height: 22),
              const SizedBox(width: 10),
              const Text(
                'Google ile Giriş Yap',
                style: TextStyle(
                  color: Color(0xFF2F241E),
                  fontSize: 14,
                  fontWeight: FontWeight.w400,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildAppleSignInButton() {
    return Container(
      width: double.infinity,
      height: 46,
      decoration: BoxDecoration(
        color: const Color(0xFF4B3528),
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: const Color(0xFFF4E8D8).withValues(alpha: 0.18)),
      ),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          onTap: _handleAppleSignIn,
          borderRadius: BorderRadius.circular(10),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(Icons.apple, color: Color(0xFFF7F1E6), size: 24),
              const SizedBox(width: 10),
              const Text(
                'Apple ile Giriş Yap',
                style: TextStyle(
                  color: Color(0xFFF7F1E6),
                  fontSize: 14,
                  fontWeight: FontWeight.w400,
                ),
              ),
            ],
          ),
        ),
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
  bool _bundledGoogleChooserRedirected = false;
  int _nativeNavIndex = 0;

  bool get _isBundledGoogleChooserFallback =>
      (widget.initialPath ?? '').contains('app_google_chooser=1');

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
                    prefs.setBool(_kWelcomeSeenKey, true);
                    if (_isBundledGoogleChooserFallback && mounted) {
                      Future.microtask(() => _controller.loadRequest(Uri.parse(kLiveUrl)));
                    }
                  }
                }
              }
            } catch (e) {
              debugPrint('[AuthSync] session snapshot parse failed: $e');
            }
          });
          break;
        case 'getAppInfo':
          // Reply with app info so web can adapt its UI.
          _controller.runJavaScript(
            'window.__ARAMABUL_APP__ = ${jsonEncode({
                  'platform': Platform.isIOS ? 'ios' : 'android',
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
        case 'google_signin':
          _handleGoogleSignInFromWebView();
          break;
        case 'login_success':
          // Save auth from email/password login
          final loginName = data['name'] as String? ?? '';
          final loginEmail = data['email'] as String? ?? '';
          SharedPreferences.getInstance().then((prefs) async {
            await prefs.setBool(_kWelcomeSeenKey, true);
            await prefs.setString('auth_user_name', loginName);
            await prefs.setString('auth_user_email', loginEmail);
            if (_isBundledGoogleChooserFallback && mounted) {
              await _controller.loadRequest(Uri.parse(kLiveUrl));
            }
          });
          break;
        case 'logout':
          // Clear auth and reset welcome from SharedPreferences
          SharedPreferences.getInstance().then((prefs) {
            prefs.remove('auth_user_name');
            prefs.remove('auth_user_email');
            prefs.setBool('welcome_seen', false);
          });
          // Sign out from Google to prevent showing previous user's accounts
          try {
            GoogleSignIn.instance.signOut();
          } catch (e) {
            debugPrint('Google sign-out error: $e');
          }
          // Clear WebView cookies so Google OAuth doesn't remember the session
          WebViewCookieManager().clearCookies();
          
          if (mounted) {
            Navigator.of(context).pushAndRemoveUntil(
              MaterialPageRoute(builder: (_) => const AppEntryPoint()),
              (route) => false,
            );
          }
          break;
        default:
          debugPrint('Unknown JS action: $action');
      }
    } catch (e) {
      debugPrint('JS bridge parse error: $e');
    }
  }

  /// Handle Google Sign-In triggered from WebView (account-settings login form)
  Future<void> _handleGoogleSignInFromWebView() async {
    debugPrint('[GoogleSignIn-WebView] Starting...');
    // Show loading state in the button
    _controller.runJavaScript('''
      var btn = document.getElementById('appGoogleSignInBtn');
      if (btn) { btn.disabled = true; btn.style.opacity = '0.6'; }
      var msg = document.getElementById('appLoginMsg');
      if (msg) { msg.style.color = '#4a90d9'; msg.textContent = 'Google hesabınıza yönlendiriliyorsunuz...'; }
    ''');

    try {
      debugPrint('[GoogleSignIn-WebView] Calling authenticate...');
      final account = await GoogleSignIn.instance.authenticate();

      final name = account.displayName ?? '';
      final email = account.email;
      debugPrint('[GoogleSignIn-WebView] Success: $name / $email');

      // Save session locally and mirror it to the shared backend session.
      final prefs = await SharedPreferences.getInstance();
      await prefs.setBool('welcome_seen', true);
      await prefs.setString('auth_user_name', name);
      await prefs.setString('auth_user_email', email);
      await registerSocialLoginBackend(
        provider: 'google',
        email: email,
        name: name,
        providerId: account.id,
      );

      // Sync session to WebView localStorage and reload.
      final sessionJson = '{"name":"${name.replaceAll('"', '\\"')}","email":"${email.replaceAll('"', '\\"')}"}';
      await _controller.runJavaScript('''
        try { localStorage.setItem('aramabul.auth.session.v1', '$sessionJson'); } catch(e) {}
        try { document.dispatchEvent(new CustomEvent('aramabul:authchange')); } catch(e) {}
        window.location.href = window.location.href.split('#')[0] + '?t=' + Date.now();
      ''');
    } catch (e) {
      debugPrint('[GoogleSignIn-WebView] Error: $e');
      final errorText = e.toString();
      final normalized = errorText.toLowerCase();
      final isConfigError =
          normalized.contains('clientconfigurationerror') ||
          normalized.contains('serverclientid must be provided') ||
          normalized.contains('missing or incorrect signing sha') ||
          normalized.contains('incorrect android package name');
      final isCancelled = normalized.contains('canceled') || normalized.contains('cancelled');
      final isNoCredential =
          normalized.contains('no credential available') ||
          normalized.contains('nocredentialexception') ||
          normalized.contains('credential unavailable') ||
          normalized.contains('no credentials available');
      if (isCancelled) {
        // User just pressed back or dismissed the picker — not an error
        _controller.runJavaScript('''
          var btn = document.getElementById('appGoogleSignInBtn');
          if (btn) { btn.disabled = false; btn.style.opacity = '1'; }
          var msg = document.getElementById('appLoginMsg');
          if (msg) { msg.textContent = ''; }
        ''');
      } else if (isNoCredential) {
        debugPrint('[GoogleSignIn-WebView] No credential available, opening web chooser fallback...');
        if (mounted) {
          Navigator.of(context).pushAndRemoveUntil(
            MaterialPageRoute(
              builder: (_) => const HomeWebViewPage(initialPath: kGoogleChooserFallbackPath),
            ),
            (route) => false,
          );
        }
      } else {
        final errorMsg = (isConfigError
                ? 'Google ile giriş yapılandırması eksik veya debug SHA eşleşmiyor. Lütfen Google Cloud tarafını kontrol et.'
                : isNoCredential
                    ? 'Cihazda Google hesabı bulunamadı. Lütfen cihaz ayarlarından bir Google hesabı ekleyip tekrar dene.'
                : errorText)
            .replaceAll("'", "\\'");
        _controller.runJavaScript('''
          var btn = document.getElementById('appGoogleSignInBtn');
          if (btn) { btn.disabled = false; btn.style.opacity = '1'; }
          var msg = document.getElementById('appLoginMsg');
          if (msg) { msg.style.color = '#e74c3c'; msg.textContent = 'Google ile giriş başarısız: $errorMsg'; }
        ''');
      }
    }
  }

  Future<void> _injectNavHideCss() async {
    try {
      await _controller.runJavaScript('''
        (function() {
          var id = 'aramabul-simple-nav-hide';
          var style = document.getElementById(id);
          if (!style) {
            style = document.createElement('style');
            style.id = id;
            (document.head || document.documentElement).appendChild(style);
          }
          style.textContent = '.mobile-bottom-nav, .mobile-bottom-nav-actions, .mobile-bottom-nav-btn, .mobile-bottom-nav-chip, .mobile-bottom-nav-icon-img, .mobile-bottom-nav-icon-svg, .mobile-bottom-nav-label, .yr-footer, .global-footer, .global-footer-band, .footer-band, footer[aria-label*="Alt" i], .desktop-auth-links, .desktop-lang-switch, .home-hero-search { display: none !important; height: 0 !important; max-height: 0 !important; overflow: hidden !important; opacity: 0 !important; visibility: hidden !important; pointer-events: none !important; } body { padding-bottom: 0 !important; margin-bottom: 0 !important; }';
          
          // Also physically remove them if they exist
          var els = document.querySelectorAll('.mobile-bottom-nav, .mobile-bottom-nav-actions');
          for (var i = 0; i < els.length; i++) {
            els[i].remove();
          }
        })();
      ''');
    } catch (e) {
      debugPrint('[NavHide] Error: $e');
    }
  }

  Future<void> _injectEmailChangePanel() async {
    try {
      await _controller.runJavaScript('''
        (function() {
          var sidebar = document.querySelector('.settings-sidebar-card');
          var panelStack = document.querySelector('.settings-panel-stack');
          if (!sidebar || !panelStack) return;

          // 1) Sidebar menu item: insert before password row if not present
          if (!sidebar.querySelector('[data-settings-panel-trigger="email"]')) {
            var pwRow = sidebar.querySelector('[data-settings-panel-trigger="password"]');
            var emailRow = document.createElement('a');
            emailRow.className = 'settings-row settings-row-button';
            emailRow.href = 'profile.html?action=email';
            emailRow.setAttribute('data-settings-panel-trigger', 'email');
            emailRow.setAttribute('aria-label', 'E-posta Değişikliği');
            emailRow.innerHTML = '<span class="settings-row-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg></span><span class="settings-row-label">E-posta Değişikliği</span><span class="settings-row-chevron" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="m9 5 7 7-7 7"></path></svg></span>';
            
            if (pwRow) {
              pwRow.parentNode.insertBefore(emailRow, pwRow);
            } else {
              var fbRow = sidebar.querySelector('[data-settings-panel-trigger="feedback"]');
              if (fbRow) {
                fbRow.parentNode.insertBefore(emailRow, fbRow);
              } else {
                sidebar.appendChild(emailRow);
              }
            }
          }

          // 2) Panel section: create if not present
          if (!panelStack.querySelector('[data-settings-panel="email"]')) {
            var emailPanel = document.createElement('section');
            emailPanel.className = 'settings-card settings-panel-card account-editor-card';
            emailPanel.setAttribute('data-settings-panel', 'email');
            emailPanel.setAttribute('aria-label', 'E-posta değişikliği');
            emailPanel.hidden = true;
            emailPanel.innerHTML = '<div class="language-card-head" style="display:none;"><h2>E-posta değişikliği</h2></div><form id="accountEmailChangeForm" class="settings-signup-form email-change-form" novalidate><div class="email-change-warning-banner" style="display:flex;align-items:flex-start;gap:10px;background:#fef7e6;border:1px solid #f0d68c;border-radius:10px;padding:14px 16px;margin-bottom:20px;"><span style="flex-shrink:0;margin-top:2px;"><svg viewBox="0 0 24 24" width="20" height="20"><circle cx="12" cy="12" r="10" fill="#d08b1a"/><line x1="12" y1="16" x2="12" y2="12" stroke="#fff" stroke-width="2.5" stroke-linecap="round"/><circle cx="12" cy="8" r="1.25" fill="#fff"/></svg></span><p style="margin:0;font-size:0.85rem;line-height:1.45;color:#333;">E-posta değişikliği sonrası hesabınızdan otomatik olarak çıkış yapılacaktır. Mevcut hesabınıza ait şifre ve yeni e-posta adresinizle yeniden giriş yapmalısınız.</p></div><div class="outlined-input-group" style="position:relative;margin-bottom:18px;"><input id="accountCurrentEmailInput" type="email" readonly class="outlined-input disabled-input" style="width:100%;padding:16px 14px 6px;border:1px solid #ccc;border-radius:8px;font-size:0.95rem;background:#f5f5f5;color:#666;outline:none;box-sizing:border-box;" /><label for="accountCurrentEmailInput" class="outlined-label" style="position:absolute;top:-8px;left:12px;background:#fff;padding:0 4px;font-size:0.75rem;color:#666;">Mevcut E-Posta</label></div><div class="outlined-input-group" style="position:relative;margin-bottom:18px;"><input id="accountNewEmailInput" type="email" autocomplete="email" required class="outlined-input" placeholder=" " style="width:100%;padding:16px 14px 6px;border:1px solid #ccc;border-radius:8px;font-size:0.95rem;background:#fff;outline:none;box-sizing:border-box;" /><label for="accountNewEmailInput" class="outlined-label" style="position:absolute;top:-8px;left:12px;background:#fff;padding:0 4px;font-size:0.75rem;color:#666;">Yeni E-Posta</label></div><div class="outlined-input-group" style="position:relative;margin-bottom:18px;"><input id="accountNewEmailRepeatInput" type="email" autocomplete="email" required class="outlined-input" placeholder=" " style="width:100%;padding:16px 14px 6px;border:1px solid #ccc;border-radius:8px;font-size:0.95rem;background:#fff;outline:none;box-sizing:border-box;" /><label for="accountNewEmailRepeatInput" class="outlined-label" style="position:absolute;top:-8px;left:12px;background:#fff;padding:0 4px;font-size:0.75rem;color:#666;">Tekrar Yeni E-Posta</label></div><p id="accountEmailChangeMessage" class="settings-signup-message" aria-live="polite" style="margin:4px 0 12px 0;"></p><div class="email-change-actions" style="margin-top:8px;"><button id="accountEmailSaveBtn" class="black-pill-btn" type="submit" style="display:block;width:100%;padding:14px;border:none;border-radius:999px;background:#111;color:#fff;font-size:1rem;font-weight:700;cursor:pointer;font-family:inherit;">Güncelle</button></div></form>';

            var pwPanel = panelStack.querySelector('[data-settings-panel="password"]');
            if (pwPanel) {
              panelStack.insertBefore(emailPanel, pwPanel);
            } else {
              panelStack.appendChild(emailPanel);
            }
          }

          // 3) Sync current email value
          var acctEmail = document.getElementById('accountEmailInput');
          var curEmail = document.getElementById('accountCurrentEmailInput');
          if (acctEmail && curEmail && acctEmail.value) {
            curEmail.value = acctEmail.value;
          }

          // 4) Form submit handler (Update localStorage dynamically and logout)
          var form = document.getElementById('accountEmailChangeForm');
          if (form && !form.__aramabulHandled) {
            form.__aramabulHandled = true;
            form.addEventListener('submit', function(e) {
              e.preventDefault();
              var newE = document.getElementById('accountNewEmailInput');
              var repE = document.getElementById('accountNewEmailRepeatInput');
              var msg = document.getElementById('accountEmailChangeMessage');
              if (!newE || !repE || !msg) return;

              var newEmailVal = (newE.value || '').trim().toLowerCase();
              var repEmailVal = (repE.value || '').trim().toLowerCase();

              if (!newEmailVal || !newEmailVal.includes('@') || newEmailVal.length < 6) {
                msg.textContent = 'Geçerli bir e-posta adresi girin.';
                msg.style.color = '#e74c3c';
                return;
              }
              if (newEmailVal !== repEmailVal) {
                msg.textContent = 'E-posta adresleri eşleşmiyor.';
                msg.style.color = '#e74c3c';
                return;
              }

              // Read users and current session
              var usersRaw = localStorage.getItem('aramabul.auth.users.v1') || '[]';
              var sessionRaw = localStorage.getItem('aramabul.auth.session.v1') || '';
              var users = [];
              var session = null;
              try { users = JSON.parse(usersRaw); } catch(err) {}
              try { session = JSON.parse(sessionRaw); } catch(err) {}

              if (!session || !session.email) {
                msg.textContent = 'Kayıtlı oturum bulunamadı. Lütfen giriş yapın.';
                msg.style.color = '#e74c3c';
                return;
              }

              var sourceEmail = session.email.trim().toLowerCase();
              if (sourceEmail === newEmailVal) {
                msg.textContent = 'Yeni e-posta adresi mevcut e-posta ile aynı olamaz.';
                msg.style.color = '#e74c3c';
                return;
              }

              // Check duplicates
              var isDuplicate = false;
              for (var i = 0; i < users.length; i++) {
                var uEmail = (users[i].email || '').trim().toLowerCase();
                if (uEmail === newEmailVal && uEmail !== sourceEmail) {
                  isDuplicate = true;
                  break;
                }
              }
              if (isDuplicate) {
                msg.textContent = 'Bu e-posta başka bir hesapta kayıtlı.';
                msg.style.color = '#e74c3c';
                return;
              }

              // Perform the email update in localStorage users list
              var userFound = false;
              for (var i = 0; i < users.length; i++) {
                if ((users[i].email || '').trim().toLowerCase() === sourceEmail) {
                  users[i].email = newEmailVal;
                  userFound = true;
                  break;
                }
              }
              if (!userFound) {
                users.push({ name: session.name || '', email: newEmailVal, passwordHash: '' });
              }

              localStorage.setItem('aramabul.auth.users.v1', JSON.stringify(users));
              
              msg.textContent = 'E-posta güncellendi! Hesaptan çıkış yapılıyor...';
              msg.style.color = '#2ecc71';

              // Perform automatic logout after email change
              setTimeout(function() {
                localStorage.removeItem('aramabul.auth.session.v1');
                // Notify native app of logout
                try {
                  if (window.AramaBulAndroid) {
                    window.AramaBulAndroid.postMessage(JSON.stringify({ action: 'logout' }));
                  }
                } catch(err) {}
                // Redirect to login page
                window.location.href = 'profile.html?action=login';
              }, 1200);
            });
          }

          // 5) Wire sidebar click event
          var emailTrigger = sidebar.querySelector('[data-settings-panel-trigger="email"]');
          if (emailTrigger && !emailTrigger.__aramabulWired) {
            emailTrigger.__aramabulWired = true;
            emailTrigger.addEventListener('click', function(ev) {
              ev.preventDefault();
              window.history.pushState({}, '', 'profile.html?action=email');
              panelStack.querySelectorAll('[data-settings-panel]').forEach(function(p) { p.hidden = true; });
              var ep = panelStack.querySelector('[data-settings-panel="email"]');
              if (ep) ep.hidden = false;
              sidebar.querySelectorAll('.settings-row-button').forEach(function(r) { r.classList.remove('is-active'); });
              emailTrigger.classList.add('is-active');
              
              // In mobile mode, switch view
              var sidebarCard = document.querySelector('.settings-sidebar-card');
              var panelStackCard = document.querySelector('.settings-panel-stack');
              if (sidebarCard) sidebarCard.style.setProperty('display', 'none', 'important');
              if (panelStackCard) panelStackCard.style.setProperty('display', 'block', 'important');
              
              // Custom title header update
              var titleEl = document.getElementById('aramabul-custom-settings-title');
              if (titleEl) titleEl.textContent = 'E-Posta Değişikliği';
              var backBtn = document.getElementById('aramabul-custom-settings-back-btn');
              if (backBtn) backBtn.style.setProperty('display', 'flex', 'important');
            });
          }

          // 6) Auto-activate panel if action=email is in query params
          var params = new URLSearchParams(window.location.search);
          var action = (params.get('action') || '').trim().toLowerCase();
          if (action === 'email') {
            panelStack.querySelectorAll('[data-settings-panel]').forEach(function(p) {
              p.hidden = (p.getAttribute('data-settings-panel') !== 'email');
            });
            var ep = panelStack.querySelector('[data-settings-panel="email"]');
            if (ep) ep.hidden = false;
            
            sidebar.querySelectorAll('.settings-row-button').forEach(function(r) { r.classList.remove('is-active'); });
            if (emailTrigger) emailTrigger.classList.add('is-active');
            
            // In mobile mode, switch view
            var sidebarCard = document.querySelector('.settings-sidebar-card');
            var panelStackCard = document.querySelector('.settings-panel-stack');
            if (sidebarCard) sidebarCard.style.setProperty('display', 'none', 'important');
            if (panelStackCard) panelStackCard.style.setProperty('display', 'block', 'important');
            
            // Custom title header update
            var titleEl = document.getElementById('aramabul-custom-settings-title');
            if (titleEl) titleEl.textContent = 'E-Posta Değişikliği';
            var backBtn = document.getElementById('aramabul-custom-settings-back-btn');
            if (backBtn) backBtn.style.setProperty('display', 'flex', 'important');
          }
        })();
      ''');
    } catch (e) {
      debugPrint('[EmailPanel] Error: $e');
    }
  }

  /// After every page load, inject a global flag so the web code knows
  /// it is running inside the Android app.
  /// Also inject CSS overrides for app-specific visual fixes.
  Future<void> _injectAppFlag() async {
    debugPrint('[_injectAppFlag] Starting CSS and session injection...');
    _injectNavHideCss(); // Early simple css injection
    // Email change components are dynamically and periodically injected in setupEmailChangePanel() inside cleanupAndroidChrome()
    try {
      final isBundledGoogleChooserFallback = _isBundledGoogleChooserFallback;
      const String bulletproofHideFooterCss = 
          '.mobile-bottom-nav.mobile-bottom-nav.mobile-bottom-nav.mobile-bottom-nav.mobile-bottom-nav.mobile-bottom-nav.mobile-bottom-nav.mobile-bottom-nav.mobile-bottom-nav.mobile-bottom-nav, '
          '.mobile-bottom-nav-actions.mobile-bottom-nav-actions.mobile-bottom-nav-actions.mobile-bottom-nav-actions.mobile-bottom-nav-actions.mobile-bottom-nav-actions.mobile-bottom-nav-actions.mobile-bottom-nav-actions.mobile-bottom-nav-actions.mobile-bottom-nav-actions, '
          '.mobile-bottom-nav-btn.mobile-bottom-nav-btn.mobile-bottom-nav-btn.mobile-bottom-nav-btn.mobile-bottom-nav-btn.mobile-bottom-nav-btn.mobile-bottom-nav-btn.mobile-bottom-nav-btn.mobile-bottom-nav-btn.mobile-bottom-nav-btn, '
          '.mobile-bottom-nav-chip.mobile-bottom-nav-chip.mobile-bottom-nav-chip.mobile-bottom-nav-chip.mobile-bottom-nav-chip.mobile-bottom-nav-chip.mobile-bottom-nav-chip.mobile-bottom-nav-chip.mobile-bottom-nav-chip.mobile-bottom-nav-chip, '
          '.mobile-bottom-nav-icon-img.mobile-bottom-nav-icon-img.mobile-bottom-nav-icon-img.mobile-bottom-nav-icon-img.mobile-bottom-nav-icon-img.mobile-bottom-nav-icon-img.mobile-bottom-nav-icon-img.mobile-bottom-nav-icon-img.mobile-bottom-nav-icon-img.mobile-bottom-nav-icon-img, '
          '.mobile-bottom-nav-icon-svg.mobile-bottom-nav-icon-svg.mobile-bottom-nav-icon-svg.mobile-bottom-nav-icon-svg.mobile-bottom-nav-icon-svg.mobile-bottom-nav-icon-svg.mobile-bottom-nav-icon-svg.mobile-bottom-nav-icon-svg.mobile-bottom-nav-icon-svg.mobile-bottom-nav-icon-svg, '
          '.mobile-bottom-nav-label.mobile-bottom-nav-label.mobile-bottom-nav-label.mobile-bottom-nav-label.mobile-bottom-nav-label.mobile-bottom-nav-label.mobile-bottom-nav-label.mobile-bottom-nav-label.mobile-bottom-nav-label.mobile-bottom-nav-label '
          '{ display: none !important; height: 0 !important; max-height: 0 !important; overflow: hidden !important; opacity: 0 !important; pointer-events: none !important; visibility: hidden !important; width: 0 !important; max-width: 0 !important; padding: 0 !important; margin: 0 !important; border: 0 !important; }';

      // Read auth and user list from SharedPreferences to sync with WebView
      final prefs = await SharedPreferences.getInstance();
      final authName = prefs.getString('auth_user_name') ?? '';
      final authEmail = prefs.getString('auth_user_email') ?? '';
      final authSessionJson = (authName.isNotEmpty && authEmail.isNotEmpty)
          ? '{"name":"${authName.replaceAll('"', '\\"')}","email":"${authEmail.replaceAll('"', '\\"')}"}'
          : '';
      
      final nativeUsersRaw = prefs.getString('aramabul.auth.users.v1') ?? '[]';
      final escapedUsersRaw = nativeUsersRaw.replaceAll('\\', '\\\\').replaceAll("'", "\\'");

      debugPrint('[_injectAppFlag] Evaluating runJavaScript...');
      if (isBundledGoogleChooserFallback) {
        await _controller.runJavaScript('''
          try {
            window.__ARAMABUL_APP__ = {
              platform: '${Platform.isIOS ? 'ios' : 'android'}',
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
                'html body .mobile-bottom-nav, html body .mobile-bottom-nav-actions, html body.mobile-bottom-nav-visible .mobile-bottom-nav, html body.home-page .mobile-bottom-nav, body.mobile-chrome-browser.mobile-force-layout.home-page .mobile-bottom-nav, body.mobile-chrome-browser.mobile-force-layout.home-page .mobile-bottom-nav-actions, html body.mobile-chrome-browser.mobile-force-layout.home-page .mobile-bottom-nav, html body.mobile-chrome-browser.mobile-force-layout.home-page .mobile-bottom-nav-actions, .mobile-bottom-nav.mobile-bottom-nav.mobile-bottom-nav, .mobile-bottom-nav-actions.mobile-bottom-nav-actions.mobile-bottom-nav-actions, .yr-footer, .global-footer, .global-footer-band, .footer-band, footer[aria-label*="Alt" i] { display: none !important; height: 0 !important; max-height: 0 !important; overflow: hidden !important; background: #f7f1e6 !important; border: 0 !important; opacity: 0 !important; pointer-events: none !important; visibility: hidden !important; }' +
                '.brand-wordmark .brand-wordmark-search { color: #8a5c3b !important; }' +
                '.brand-wordmark .brand-wordmark-rest { color: #4d4c4a !important; }' +
                'body.mobile-bottom-nav-visible { padding-bottom: 0 !important; }' +
                'ins.adsbygoogle, .adsbygoogle, [id*="google_ads"], [id*="aswift"], iframe[src*="googleads"], iframe[src*="doubleclick"], .google-auto-placed { display: none !important; height: 0 !important; max-height: 0 !important; overflow: hidden !important; }' +
                '.auth-message-error, .settings-signup-message { color: #fffdf8 !important; text-shadow: 0 1px 2px rgba(22,33,35,.12) !important; }' +
                '$bulletproofHideFooterCss';
            })();
            document.dispatchEvent(new CustomEvent('aramabul:authchange'));
          } catch(e) {
            console.log('[__injectAppFlag] chooser fallback minimal bridge error: ' + e);
          }
        ''');
        return;
      }

      await _controller.runJavaScript('''
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
            platform: '${Platform.isIOS ? 'ios' : 'android'}',
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
        } catch(e) {
          console.error('[__injectAppFlag] Base bridge init error:', e);
        }
      ''');

      // 2. Sync auth session and user list from native app to WebView localStorage (isolated)
      await _controller.runJavaScript('''
        try {
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
        } catch(e) {
          console.error('[__injectAppFlag] Auth session sync data error:', e);
        }
      ''');

      // 3. Inject styling, cleanups, observers, and helpers (independent of session data)
      await _controller.runJavaScript('''
        try {
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
            '$bulletproofHideFooterCss' +
            'body, * { font-family: "Plus Jakarta Sans", sans-serif !important; }' +
            'html body, html body.home-page, body.home-page, body { background: #ffffff !important; min-height: 100vh !important; position: relative !important; padding-top: 0 !important; }' +
            'html body.mobile-bottom-nav-visible { padding-bottom: 0 !important; box-sizing: border-box !important; }' +
            'html body::before, body.home-page::before { content: "" !important; display: none !important; }' +
            'html body::after, body.home-page::after { content: "" !important; display: none !important; }' +
            '.global-topline, .desktop-auth-links, .desktop-lang-switch, html body .mobile-bottom-nav, html body .mobile-bottom-nav-actions, html body.mobile-bottom-nav-visible .mobile-bottom-nav, html body.home-page .mobile-bottom-nav, body.mobile-chrome-browser.mobile-force-layout.home-page .mobile-bottom-nav, body.mobile-chrome-browser.mobile-force-layout.home-page .mobile-bottom-nav-actions, html body.mobile-chrome-browser.mobile-force-layout.home-page .mobile-bottom-nav, html body.mobile-chrome-browser.mobile-force-layout.home-page .mobile-bottom-nav-actions, .mobile-bottom-nav.mobile-bottom-nav.mobile-bottom-nav, .mobile-bottom-nav-actions.mobile-bottom-nav-actions.mobile-bottom-nav-actions, .yr-footer, .global-footer, .global-footer-band, .footer-band, footer[aria-label*="Alt" i] { display: none !important; height: 0 !important; max-height: 0 !important; overflow: hidden !important; opacity: 0 !important; pointer-events: none !important; visibility: hidden !important; }' +
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
            '.home-subcat-chip { background: rgba(255,255,255,0.08) !important; border: 1px solid rgba(255,255,255,0.12) !important; border-radius: 0 !important; display: flex !important; align-items: center !important; justify-content: center !important; text-align: center !important; flex: 0 0 100px !important; height: 100px !important; font-size: 0.72rem !important; font-weight: 700 !important; color: #ffffff !important; text-transform: none !important; }' +
            '.content-guide h2, .content-guide h3, .content-guide p, .content-guide li, .content-guide strong { color: #000 !important; }' +
            '.home-top-category-row { background: transparent !important; display: grid !important; grid-template-columns: repeat(2, 1fr) !important; gap: 0.5rem !important; }' +
            '.istanbul-venue-card { background: #bdd8e9 !important; border-color: #bdd8e9 !important; }' +
            '.istanbul-results-grid { padding: 0 !important; }' +
            '.home-subcategory-grid { display: flex !important; flex-direction: row !important; flex-wrap: nowrap !important; overflow-x: auto !important; -webkit-overflow-scrolling: touch !important; gap: 0.5rem !important; padding: 0.5rem 0.25rem !important; width: 100% !important; scrollbar-width: none !important; }' +
            '.home-subcategory-grid::-webkit-scrollbar { display: none !important; }' +
            '.home-subcategory-card { display: flex !important; flex-direction: column !important; align-items: center !important; justify-content: center !important; text-align: center !important; position: relative !important; flex: 0 0 100px !important; height: 100px !important; overflow: hidden !important; border-radius: 0 !important; border: 1px solid rgba(255,255,255,0.12) !important; background: transparent !important; text-decoration: none !important; padding: 0 !important; }' +
            '.home-subcategory-card::before { content: "" !important; position: absolute !important; inset: 0 !important; background: rgba(0,0,0,0.45) !important; z-index: 2 !important; }' +
            '.home-subcategory-card img { position: absolute !important; inset: 0 !important; width: 100% !important; height: 100% !important; object-fit: cover !important; border-radius: 0 !important; z-index: 1 !important; display: block !important; }' +
            '.home-subcategory-card-name { position: relative !important; z-index: 3 !important; padding: 6px !important; font-size: 0.72rem !important; font-weight: 700 !important; color: #ffffff !important; text-transform: none !important; letter-spacing: 0.2px !important; text-shadow: 0 1px 2px rgba(0,0,0,0.8) !important; text-align: center !important; overflow: hidden !important; text-overflow: ellipsis !important; display: -webkit-box !important; -webkit-line-clamp: 2 !important; -webkit-box-orient: vertical !important; }' +
            '.home-subcategory-card-action { display: none !important; }' +
            '.category-home-card .top-city-thumb, .top-city-card .top-city-thumb { display: block !important; position: absolute !important; inset: 0 !important; width: 100% !important; height: 100% !important; background-size: cover !important; background-position: center !important; border-radius: 0 !important; z-index: 1 !important; }' +
            'html body.home-page .home-top-category-row .top-city-card, html body.home-page .home-top-category-row .category-home-card, html body .home-top-category-row .top-city-card, html body .home-top-category-row .category-home-card, .top-city-card, .category-home-card { display: flex !important; flex-direction: column !important; align-items: center !important; justify-content: center !important; text-align: center !important; position: relative !important; aspect-ratio: 2 / 1 !important; width: 100% !important; height: auto !important; min-height: 0 !important; overflow: hidden !important; border-radius: 0 !important; border: 1px solid rgba(255,255,255,0.12) !important; background: transparent !important; padding: 0 !important; box-shadow: 0 4px 20px rgba(0,0,0,0.2) !important; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important; }' +
            'html body.home-page .home-top-category-row .top-city-card:active, html body.home-page .home-top-category-row .category-home-card:active, .top-city-card:active, .category-home-card:active { transform: scale(0.95) !important; }' +
            'html body.home-page .top-city-card::before, html body.home-page .category-home-card::before, .top-city-card::before, .category-home-card::before { content: "" !important; position: absolute !important; inset: 0 !important; background: rgba(0,0,0,0.45) !important; z-index: 2 !important; }' +
            'html body .category-home-card .top-city-content, html body .top-city-card .top-city-content, .category-home-card .top-city-content, .top-city-card .top-city-content { position: relative !important; z-index: 3 !important; padding: 8px !important; display: flex !important; align-items: flex-end !important; justify-content: center !important; width: 100% !important; height: 100% !important; box-sizing: border-box !important; }' +
            'html body .top-city-name, .top-city-name { font-size: 0.85rem !important; font-weight: 700 !important; color: #ffffff !important; text-transform: none !important; letter-spacing: 0.5px !important; text-shadow: 0 1px 3px rgba(0,0,0,0.6) !important; text-align: center !important; }' +
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
            'html body .mobile-bottom-nav, html body .mobile-bottom-nav-actions, html body.mobile-bottom-nav-visible .mobile-bottom-nav, html body.home-page .mobile-bottom-nav, body.mobile-chrome-browser.mobile-force-layout.home-page .mobile-bottom-nav, body.mobile-chrome-browser.mobile-force-layout.home-page .mobile-bottom-nav-actions, html body.mobile-chrome-browser.mobile-force-layout.home-page .mobile-bottom-nav, html body.mobile-chrome-browser.mobile-force-layout.home-page .mobile-bottom-nav-actions, .mobile-bottom-nav.mobile-bottom-nav.mobile-bottom-nav, .mobile-bottom-nav-actions.mobile-bottom-nav-actions.mobile-bottom-nav-actions { display: none !important; height: 0 !important; max-height: 0 !important; opacity: 0 !important; pointer-events: none !important; overflow: hidden !important; visibility: hidden !important; }' +
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
            'html body.settings-page .settings-card, html body.settings-page .settings-panel-card, html body.settings-page .settings-sidebar-card, html body.settings-page.settings-force-mobile .settings-card, html body.settings-page.settings-force-mobile .settings-sidebar-card, html body.settings-page.settings-force-mobile .settings-panel-stack .settings-card { background: #ffffff !important; border: none !important; border-radius: 0 !important; color: #000000 !important; padding: 0 !important; box-shadow: none !important; }' +
            'html body.settings-page .settings-panel-card form, html body.settings-page .settings-panel-card .settings-signup-form, html body.settings-page .settings-panel-card .language-card-head { padding: 16px 16px !important; box-sizing: border-box !important; }' +
            'html body.settings-page .settings-row, html body.settings-page .settings-row-button, html body.settings-page.settings-force-mobile .settings-row, html body.settings-page.settings-force-mobile .settings-row-button { background: #ffffff !important; border-bottom: 1px solid #f2f2f5 !important; border-radius: 0 !important; color: #000000 !important; padding: 1.1rem 1.25rem !important; margin: 0 !important; box-shadow: none !important; display: flex !important; align-items: center !important; }' +
            'html body.settings-page .settings-row:active, html body.settings-page .settings-row.is-active, html body.settings-page.settings-force-mobile .settings-row:active, html body.settings-page.settings-force-mobile .settings-row.is-active { background: #ffffff !important; }' +
            'html body.settings-page .settings-panel-card h2, html body.settings-page .settings-panel-card h3, html body.settings-page .settings-panel-card p, html body.settings-page .settings-panel-card span, html body.settings-page .settings-panel-card label, html body.settings-page .settings-panel-card strong, html body.settings-page .settings-panel-card li, html body.settings-page .settings-sidebar-card .settings-row-label, html body.settings-page .settings-sidebar-card .settings-row-chevron svg, html body.settings-page .settings-sidebar-card .settings-row-icon svg { color: #000000 !important; stroke: #000000 !important; }' +
            'html body.settings-page .settings-sidebar-card .settings-row-label { font-weight: 700 !important; font-size: 1rem !important; color: #000000 !important; }' +
            'html body.settings-page .settings-sidebar-card .settings-row-icon svg { stroke: #000000 !important; fill: none !important; stroke-width: 2.3 !important; }' +
            'html body.settings-page .settings-sidebar-card .settings-row-chevron { display: none !important; }' +
            '#aramabulAppSettingsBreadcrumb, .aramabul-app-settings-breadcrumb { display: none !important; }' +
            '#aramabul-custom-settings-header-container { display: flex !important; align-items: center !important; justify-content: flex-start !important; position: relative !important; width: 100% !important; height: 56px !important; border-bottom: 1px solid #e2e2e5 !important; background: #ffffff !important; box-shadow: none !important; box-sizing: border-box !important; padding-left: 16px !important; }' +
            '#aramabul-custom-settings-title { font-family: "Plus Jakarta Sans", sans-serif !important; font-size: 1.25rem !important; font-weight: 700 !important; color: #000000 !important; text-align: left !important; }' +
            '#aramabul-custom-settings-back-btn { position: static !important; transform: none !important; background: transparent !important; border: none !important; padding: 8px 12px 8px 0 !important; cursor: pointer !important; display: flex !important; align-items: center !important; justify-content: center !important; box-shadow: none !important; outline: none !important; -webkit-tap-highlight-color: transparent !important; }' +
            '#aramabul-custom-settings-back-btn svg { width: 24px !important; height: 24px !important; stroke: #000000 !important; stroke-width: 2.5 !important; stroke-linecap: round !important; stroke-linejoin: round !important; fill: none !important; }' +
            '.settings-shell, .settings-layout, .settings-sidebar-card, .settings-card { padding-left: 0 !important; padding-right: 0 !important; margin-left: 0 !important; margin-right: 0 !important; width: 100% !important; max-width: 100% !important; box-sizing: border-box !important; }' +
            'html body.settings-page .settings-signup-field input, html body.settings-page .settings-feedback-field input, html body.settings-page .settings-feedback-field textarea, html body.settings-page .settings-feedback-field select, html body.settings-page .settings-feedback-phone-group input, .settings-signup-field input, .settings-feedback-field input, .settings-feedback-field textarea, .settings-feedback-field select { background: #ffffff !important; border: 1px solid rgba(138,92,59,0.2) !important; border-radius: 8px !important; color: #2f241e !important; padding: 0.7rem 0.85rem !important; font-family: inherit !important; outline: none !important; box-sizing: border-box !important; width: 100% !important; transition: all 0.2s ease !important; }' +
            'html body.settings-page .settings-signup-field input:focus, html body.settings-page .settings-feedback-field input:focus, html body.settings-page .settings-feedback-field textarea:focus, html body.settings-page .settings-feedback-field select:focus { border-color: #8a5c3b !important; box-shadow: 0 0 0 3px rgba(138,92,59,0.12) !important; }' +
            '.settings-signup-submit, .settings-feedback-submit, .account-secondary-btn, .account-verify-btn, .settings-signout { background: linear-gradient(135deg, #8a5c3b 0%, #b08968 100%) !important; border: none !important; border-radius: 12px !important; color: #ffffff !important; font-weight: 400 !important; padding: 0.75rem 1.25rem !important; box-shadow: 0 4px 15px rgba(138, 92, 59, 0.25) !important; transition: all 0.2s ease !important; cursor: pointer !important; }' +
            '.account-secondary-btn { background: #ffffff !important; border: 1px solid rgba(138,92,59,0.2) !important; color: #2f241e !important; box-shadow: none !important; }' +
            '.settings-signup-submit:active, .settings-feedback-submit:active, .account-secondary-btn:active, .settings-signout:active { transform: scale(0.97) !important; opacity: 0.9 !important; }' +
            '.auth-inline-link, .auth-toggle-hint button, #toggleToSignupBtn, #toggleToLoginBtn, #settingsForgotPasswordBtn, .auth-form-inline-row button { color: #8a5c3b !important; text-decoration: none !important; font-weight: 400 !important; background: none !important; border: none !important; cursor: pointer !important; padding: 0 !important; font-size: 0.85rem !important; }' +
            '.auth-inline-link:hover, .auth-toggle-hint button:hover, #toggleToSignupBtn:hover, #toggleToLoginBtn:hover, #settingsForgotPasswordBtn:hover { text-decoration: underline !important; }' +
            '.auth-checkbox-label, .auth-checkbox-label span { color: #2f241e !important; }' +
            '.auth-divider span:first-child, .auth-divider span:last-child { background: rgba(138,92,59,0.15) !important; }' +
            '.auth-divider span:nth-child(2) { color: rgba(138,92,59,0.5) !important; }' +
            '#customGoogleSignInBtn { background: #ffffff !important; color: #2f241e !important; border: 1px solid rgba(138,92,59,0.2) !important; border-radius: 10px !important; font-weight: 400 !important; }' +
            '#customGoogleSignInBtn span { color: #2f241e !important; }' +
            '#customGoogleSignInBtn:active { background: #fdf8f0 !important; transform: scale(0.97) !important; }' +
            '.settings-help-item strong { color: #8a5c3b !important; font-size: 1rem !important; font-weight: 600 !important; }' +
            '.settings-help-item p { color: rgba(47,36,30,0.8) !important; }' +
            'html body.settings-page [data-settings-panel="login"] h2, html body [data-settings-panel="login"] h2 { font-size: 1.35rem !important; font-weight: 700 !important; text-align: center !important; margin-top: 0.5rem !important; margin-bottom: 0.5rem !important; }' +
            'html body.settings-page #toggleToSignupBtn span, html body.settings-page #toggleToLoginBtn span, html body.settings-page #settingsForgotPasswordBtn span, html body #toggleToSignupBtn span, html body #toggleToLoginBtn span, html body #settingsForgotPasswordBtn span { color: #8a5c3b !important; }' +
            'html body.settings-page *:not(.settings-row-label):not(.black-pill-btn):not(.outlined-label), html body.settings-page button:not(.black-pill-btn), html body.settings-page input, html body.settings-page a:not(.settings-row), html body.settings-page span:not(.settings-row-label) { font-weight: 400 !important; }' +
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
              '$bulletproofHideFooterCss' +
              'html body .mobile-bottom-nav, html body .mobile-bottom-nav-actions, html body.mobile-bottom-nav-visible .mobile-bottom-nav, html body.home-page .mobile-bottom-nav, body.mobile-chrome-browser.mobile-force-layout.home-page .mobile-bottom-nav, body.mobile-chrome-browser.mobile-force-layout.home-page .mobile-bottom-nav-actions, html body.mobile-chrome-browser.mobile-force-layout.home-page .mobile-bottom-nav, html body.mobile-chrome-browser.mobile-force-layout.home-page .mobile-bottom-nav-actions, .mobile-bottom-nav.mobile-bottom-nav.mobile-bottom-nav, .mobile-bottom-nav-actions.mobile-bottom-nav-actions.mobile-bottom-nav-actions { display: none !important; height: 0 !important; max-height: 0 !important; overflow: hidden !important; opacity: 0 !important; pointer-events: none !important; visibility: hidden !important; }' +
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
                if (type === 'home') { img.src = 'assets/ev.png'; }
                else if (type === 'favorites') { img.src = 'assets/fav.png'; }
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
                var targetHtml = '';
                if (source && source.textContent && source.textContent.trim()) {
                  targetHtml = source.innerHTML;
                } else {
                  targetHtml = '<a href="/">Anasayfa</a><span>/</span><span>Ayarlar</span>';
                }
                if (crumb.innerHTML !== targetHtml) {
                  crumb.innerHTML = targetHtml;
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
                var body = document.body;
                if (!body) return;
                var isSettings = body.classList.contains('settings-page') || window.location.pathname.indexOf('settings') !== -1 || window.location.pathname.indexOf('profile') !== -1;
                var isSearch = window.location.pathname.indexOf('search') !== -1 || body.classList.contains('search-page');

                // --- Nuclear CSS ---
                try {
                  var nuclearCSS = '.mobile-bottom-nav,.mobile-bottom-nav-actions,.mobile-bottom-nav-btn,.mobile-bottom-nav-chip,.mobile-bottom-nav-icon-img,.mobile-bottom-nav-icon-svg,.mobile-bottom-nav-label,.mobile-bottom-nav *{display:none!important;height:0!important;max-height:0!important;width:0!important;overflow:hidden!important;opacity:0!important;visibility:hidden!important;pointer-events:none!important;position:fixed!important;top:-9999px!important;left:-9999px!important;padding:0!important;margin:0!important;border:0!important;z-index:-1!important;}'
                    + 'html body.mobile-bottom-nav-visible .mobile-bottom-nav,html body .mobile-bottom-nav,body.mobile-chrome-browser .mobile-bottom-nav,body.home-page .mobile-bottom-nav{display:none!important;height:0!important;visibility:hidden!important;position:fixed!important;top:-9999px!important;}'
                    + 'body{padding-bottom:0!important;margin-bottom:0!important;}'
                    + '.yr-footer,.yr-footer-inner,.yr-footer-grid,.yr-footer-bottom,.global-footer,.global-footer-band,.footer-band{display:none!important;height:0!important;visibility:hidden!important;}'
                    + '.desktop-auth-links,.desktop-lang-switch,.home-hero-search{display:none!important;}';
                  var nuclearStyleId = 'aramabul-nuclear-css';
                  var nuclearTag = document.getElementById(nuclearStyleId);
                  if (!nuclearTag) {
                    nuclearTag = document.createElement('style');
                    nuclearTag.id = nuclearStyleId;
                    nuclearTag.setAttribute('type', 'text/css');
                    (document.head || document.documentElement).appendChild(nuclearTag);
                  }
                  if (nuclearTag.textContent !== nuclearCSS) {
                    nuclearTag.textContent = nuclearCSS;
                  }
                } catch (e) {
                  console.error('[cleanupAndroidChrome] Nuclear CSS error:', e);
                }

                // --- Self-healing style tags ---
                try {
                  var styleIds = ['aramabul-app-css', 'aramabul-app-nav-css', 'aramabul-warm-app-css'];
                  styleIds.forEach(function(id) {
                    if (!document.getElementById(id)) {
                      var s = document.createElement('style');
                      s.id = id;
                      (document.head || document.documentElement).appendChild(s);
                    }
                  });
                } catch (e) {
                  console.error('[cleanupAndroidChrome] Self-healing styles error:', e);
                }

                // --- REMOVE bottom nav elements from DOM ---
                try {
                  var removeSelectors = ['.mobile-bottom-nav', '.mobile-bottom-nav-actions'];
                  document.querySelectorAll(removeSelectors.join(', ')).forEach(function(el) {
                    el.remove();
                  });
                } catch (e) {
                  console.error('[cleanupAndroidChrome] Remove bottom nav error:', e);
                }

                // --- Hide footer elements ---
                try {
                  var footerSelectors = [
                    '.yr-footer', '.yr-footer-inner', '.yr-footer-grid', '.yr-footer-bottom',
                    '.global-footer', '.global-footer-band', '.footer-band',
                    'footer[aria-label*="Alt" i]',
                    '.desktop-auth-links', '.desktop-lang-switch', '.home-hero-search'
                  ];
                  document.querySelectorAll(footerSelectors.join(', ')).forEach(function(el) {
                    el.style.setProperty('display', 'none', 'important');
                    el.style.setProperty('height', '0', 'important');
                    el.style.setProperty('visibility', 'hidden', 'important');
                  });
                } catch (e) {
                  console.error('[cleanupAndroidChrome] Hide footer error:', e);
                }

                // --- Block createMobileBottomNav ---
                try {
                  if (typeof window.createMobileBottomNav === 'function' && !window.__aramabulNavBlocked) {
                    window.__aramabulNavBlocked = true;
                    window.createMobileBottomNav = function() { return null; };
                    window.autoCreateMobileBottomNav = function() { return null; };
                  }
                } catch (e) {
                  console.error('[cleanupAndroidChrome] Block nav functions error:', e);
                }

                // --- Reset body spacing ---
                try {
                  body.classList.remove('mobile-bottom-nav-visible');
                  body.style.setProperty('padding-bottom', '0', 'important');
                  body.style.setProperty('margin-bottom', '0', 'important');
                } catch (e) {
                  console.error('[cleanupAndroidChrome] Reset body spacing error:', e);
                }

                // --- Hide header elements ---
                try {
                  var headerSelectors = ['.global-header-band', '.global-topbar', '.topbar'];
                  if (isSettings || isSearch) {
                    document.querySelectorAll(headerSelectors.join(', ')).forEach(function(el) {
                      el.style.setProperty('display', 'none', 'important');
                      el.style.setProperty('height', '0', 'important');
                      el.style.setProperty('max-height', '0', 'important');
                      el.style.setProperty('overflow', 'hidden', 'important');
                      el.style.setProperty('opacity', '0', 'important');
                      el.style.setProperty('pointer-events', 'none', 'important');
                    });
                  } else {
                    document.querySelectorAll(headerSelectors.join(', ')).forEach(function(el) {
                      el.style.removeProperty('display');
                      el.style.removeProperty('height');
                      el.style.removeProperty('max-height');
                      el.style.removeProperty('overflow');
                      el.style.removeProperty('opacity');
                      el.style.removeProperty('pointer-events');
                    });
                    document.querySelectorAll('.global-topbar .brand, .topbar .brand').forEach(function(el) {
                      el.style.setProperty('display', 'none', 'important');
                    });
                    document.querySelectorAll('.topbar-search-form, .header-search').forEach(function(el) {
                      el.style.removeProperty('display');
                      el.style.removeProperty('height');
                      el.style.removeProperty('max-height');
                      el.style.removeProperty('overflow');
                      el.style.removeProperty('opacity');
                      el.style.removeProperty('pointer-events');
                    });
                  }
                } catch (e) {
                  console.error('[cleanupAndroidChrome] Hide header error:', e);
                }

                // --- Hide ads ---
                try {
                  document.querySelectorAll(
                    'ins.adsbygoogle, .adsbygoogle, [id*="google_ads"], [id*="aswift"], iframe[src*="googleads"], iframe[src*="doubleclick"], .ad-container, .ad-wrapper, .ad-banner, [data-ad-slot], .google-auto-placed'
                  ).forEach(function(el) {
                    el.style.setProperty('display', 'none', 'important');
                    el.style.setProperty('height', '0', 'important');
                    el.style.setProperty('max-height', '0', 'important');
                    el.style.setProperty('overflow', 'hidden', 'important');
                  });
                } catch (e) {
                  console.error('[cleanupAndroidChrome] Hide ads error:', e);
                }

                // --- Hide broken images ---
                try {
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
                } catch (e) {
                  console.error('[cleanupAndroidChrome] Hide broken images error:', e);
                }

                function setupHesabimLayout() {
                  try {
                    var shell = document.querySelector('.settings-shell');
                    if (shell) {
                      var existingHeader = document.getElementById('aramabul-custom-settings-header-container');
                      var titleEl;
                      if (!existingHeader) {
                        var headerContainer = document.createElement('div');
                        headerContainer.id = 'aramabul-custom-settings-header-container';
                        
                        var backBtn = document.createElement('button');
                        backBtn.id = 'aramabul-custom-settings-back-btn';
                        backBtn.innerHTML = '<svg viewBox="0 0 24 24"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>';
                        
                        titleEl = document.createElement('span');
                        titleEl.id = 'aramabul-custom-settings-title';
                        
                        headerContainer.appendChild(backBtn);
                        headerContainer.appendChild(titleEl);
                        
                        shell.parentNode.insertBefore(headerContainer, shell);
                      } else {
                        titleEl = document.getElementById('aramabul-custom-settings-title');
                      }
                      
                      if (titleEl) {
                        var params = new URLSearchParams(window.location.search);
                        var action = (params.get('action') || '').trim().toLowerCase();
                        var titleText = 'Ayarlar';
                        if (action === 'password') {
                          titleText = 'Şifre Değişikliği';
                        } else if (action === 'email') {
                          titleText = 'E-Posta Değişikliği';
                        } else if (action === 'feedback') {
                          titleText = 'Geri Bildirim';
                        } else if (action === 'help') {
                          titleText = 'Yardım';
                        } else if (action === 'about') {
                          titleText = 'Hakkında';
                        } else if (action === 'delete-account') {
                          titleText = 'Hesabımı Sil';
                        } else if (action === 'kurumsal') {
                          titleText = 'Kurumsal';
                        }
                        titleEl.textContent = titleText;
                      }
                      
                      var backBtn = document.getElementById('aramabul-custom-settings-back-btn');
                      if (backBtn) {
                        var params = new URLSearchParams(window.location.search);
                        var action = (params.get('action') || '').trim().toLowerCase();
                        var isSubPanel = (action === 'password' || action === 'email' || action === 'feedback' || action === 'help' || action === 'about' || action === 'delete-account' || action === 'kurumsal');
                        
                        if (isSubPanel) {
                          backBtn.style.setProperty('display', 'flex', 'important');
                        } else {
                          backBtn.style.setProperty('display', 'none', 'important');
                        }
                        
                        backBtn.onclick = function() {
                          if (isSubPanel) {
                            if (window.history.length > 1) {
                              window.history.back();
                            } else {
                              window.location.href = '/profile.html?action=profile';
                            }
                          }
                        };
                      }
                    }
                  } catch(e) {
                    console.error('[setupHesabimLayout] Error:', e);
                  }
                }
                // --- Inject E-posta Değişikliği sidebar item + panel ---
                function setupEmailChangePanel() {
                  try {
                    var sidebar = document.querySelector('.settings-sidebar-card');
                    var panelStack = document.querySelector('.settings-panel-stack');
                    
                    if (sidebar && !sidebar.querySelector('[data-settings-panel-trigger="email"]')) {
                      console.log('[setupEmailChangePanel] Injecting sidebar menu row...');
                      var pwRow = sidebar.querySelector('[data-settings-panel-trigger="password"]');
                      var emailRow = document.createElement('a');
                      emailRow.className = 'settings-row settings-row-button';
                      emailRow.href = 'profile.html?action=email';
                      emailRow.setAttribute('data-settings-panel-trigger', 'email');
                      emailRow.setAttribute('aria-label', 'E-posta Değişikliği');
                      emailRow.innerHTML = '<span class="settings-row-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg></span><span class="settings-row-label">E-posta Değişikliği</span><span class="settings-row-chevron" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="m9 5 7 7-7 7"></path></svg></span>';
                      
                      if (pwRow) {
                        pwRow.parentNode.insertBefore(emailRow, pwRow);
                      } else {
                        var fbRow = sidebar.querySelector('[data-settings-panel-trigger="feedback"]');
                        if (fbRow) {
                          fbRow.parentNode.insertBefore(emailRow, fbRow);
                        } else {
                          sidebar.appendChild(emailRow);
                        }
                      }
                      console.log('[setupEmailChangePanel] Sidebar menu row injected.');
                    }

                    if (panelStack && !panelStack.querySelector('[data-settings-panel="email"]')) {
                      console.log('[setupEmailChangePanel] Injecting panel section...');
                      var emailPanel = document.createElement('section');
                      emailPanel.className = 'settings-card settings-panel-card account-editor-card';
                      emailPanel.setAttribute('data-settings-panel', 'email');
                      emailPanel.setAttribute('aria-label', 'E-posta değişikliği');
                      emailPanel.hidden = true;
                      emailPanel.innerHTML = '<div class="language-card-head" style="display:none;"><h2>E-posta değişikliği</h2></div>' +
                        '<form id="accountEmailChangeForm" class="settings-signup-form email-change-form" novalidate>' +
                        '<div class="email-change-warning-banner" style="display:flex;align-items:flex-start;gap:10px;background:#fef7e6;border:1px solid #f0d68c;border-radius:10px;padding:14px 16px;margin-bottom:20px;">' +
                        '<span style="flex-shrink:0;margin-top:2px;"><svg viewBox="0 0 24 24" width="20" height="20"><circle cx="12" cy="12" r="10" fill="#d08b1a"/><line x1="12" y1="16" x2="12" y2="12" stroke="#fff" stroke-width="2.5" stroke-linecap="round"/><circle cx="12" cy="8" r="1.25" fill="#fff"/></svg></span>' +
                        '<p style="margin:0;font-size:0.85rem;line-height:1.45;color:#333;">E-posta değişikliği sonrası hesabınızdan otomatik olarak çıkış yapılacaktır. Mevcut hesabınıza ait şifre ve yeni e-posta adresinizle yeniden giriş yapmalısınız.</p>' +
                        '</div>' +
                        '<div class="outlined-input-group" style="position:relative;margin-bottom:18px;">' +
                        '<input id="accountCurrentEmailInput" type="email" readonly class="outlined-input disabled-input" style="width:100%;padding:16px 14px 6px;border:1px solid #ccc;border-radius:8px;font-size:0.95rem;background:#f5f5f5;color:#666;outline:none;box-sizing:border-box;" />' +
                        '<label for="accountCurrentEmailInput" class="outlined-label" style="position:absolute;top:-8px;left:12px;background:#fff;padding:0 4px;font-size:0.75rem;color:#666;">Mevcut E-Posta</label>' +
                        '</div>' +
                        '<div class="outlined-input-group" style="position:relative;margin-bottom:18px;">' +
                        '<input id="accountNewEmailInput" type="email" autocomplete="email" required class="outlined-input" placeholder=" " style="width:100%;padding:16px 14px 6px;border:1px solid #ccc;border-radius:8px;font-size:0.95rem;background:#fff;outline:none;box-sizing:border-box;" />' +
                        '<label for="accountNewEmailInput" class="outlined-label" style="position:absolute;top:-8px;left:12px;background:#fff;padding:0 4px;font-size:0.75rem;color:#666;">Yeni E-Posta</label>' +
                        '</div>' +
                        '<div class="outlined-input-group" style="position:relative;margin-bottom:18px;">' +
                        '<input id="accountNewEmailRepeatInput" type="email" autocomplete="email" required class="outlined-input" placeholder=" " style="width:100%;padding:16px 14px 6px;border:1px solid #ccc;border-radius:8px;font-size:0.95rem;background:#fff;outline:none;box-sizing:border-box;" />' +
                        '<label for="accountNewEmailRepeatInput" class="outlined-label" style="position:absolute;top:-8px;left:12px;background:#fff;padding:0 4px;font-size:0.75rem;color:#666;">Tekrar Yeni E-Posta</label>' +
                        '</div>' +
                        '<p id="accountEmailChangeMessage" class="settings-signup-message" aria-live="polite" style="margin:4px 0 12px 0;"></p>' +
                        '<div class="email-change-actions" style="margin-top:8px;">' +
                        '<button id="accountEmailSaveBtn" class="black-pill-btn" type="submit" style="display:block;width:100%;padding:14px;border:none;border-radius:999px;background:#111;color:#fff;font-size:1rem;font-weight:700;cursor:pointer;font-family:inherit;">Güncelle</button>' +
                        '</div>' +
                        '</form>';

                      var pwPanel = panelStack.querySelector('[data-settings-panel="password"]');
                      if (pwPanel) {
                        panelStack.insertBefore(emailPanel, pwPanel);
                      } else {
                        panelStack.appendChild(emailPanel);
                      }
                      console.log('[setupEmailChangePanel] Panel section injected.');
                    }

                    // Sync current email value
                    var acctEmail = document.getElementById('accountEmailInput');
                    var curEmail = document.getElementById('accountCurrentEmailInput');
                    if (acctEmail && curEmail && acctEmail.value) {
                      curEmail.value = acctEmail.value;
                    }

                    // Form submit handler
                    var form = document.getElementById('accountEmailChangeForm');
                    if (form && !form.__aramabulHandled) {
                      form.__aramabulHandled = true;
                      form.addEventListener('submit', function(e) {
                        e.preventDefault();
                        var newE = document.getElementById('accountNewEmailInput');
                        var repE = document.getElementById('accountNewEmailRepeatInput');
                        var msg = document.getElementById('accountEmailChangeMessage');
                        if (!newE || !repE || !msg) return;

                        var newEmailVal = (newE.value || '').trim().toLowerCase();
                        var repEmailVal = (repE.value || '').trim().toLowerCase();

                        if (!newEmailVal || !newEmailVal.includes('@') || newEmailVal.length < 6) {
                          msg.textContent = 'Geçerli bir e-posta adresi girin.';
                          msg.style.color = '#e74c3c';
                          return;
                        }
                        if (newEmailVal !== repEmailVal) {
                          msg.textContent = 'E-posta adresleri eşleşmiyor.';
                          msg.style.color = '#e74c3c';
                          return;
                        }

                        // Read users and current session
                        var usersRaw = localStorage.getItem('aramabul.auth.users.v1') || '[]';
                        var sessionRaw = localStorage.getItem('aramabul.auth.session.v1') || '';
                        var users = [];
                        var session = null;
                        try { users = JSON.parse(usersRaw); } catch(err) {}
                        try { session = JSON.parse(sessionRaw); } catch(err) {}

                        if (!session || !session.email) {
                          msg.textContent = 'Kayıtlı oturum bulunamadı. Lütfen giriş yapın.';
                          msg.style.color = '#e74c3c';
                          return;
                        }

                        var sourceEmail = session.email.trim().toLowerCase();
                        if (sourceEmail === newEmailVal) {
                          msg.textContent = 'Yeni e-posta adresi mevcut e-posta ile aynı olamaz.';
                          msg.style.color = '#e74c3c';
                          return;
                        }

                        // Check duplicates
                        var isDuplicate = false;
                        for (var i = 0; i < users.length; i++) {
                          var uEmail = (users[i].email || '').trim().toLowerCase();
                          if (uEmail === newEmailVal && uEmail !== sourceEmail) {
                            isDuplicate = true;
                            break;
                          }
                        }
                        if (isDuplicate) {
                          msg.textContent = 'Bu e-posta başka bir hesapta kayıtlı.';
                          msg.style.color = '#e74c3c';
                          return;
                        }

                        // Perform the email update in localStorage users list
                        var userFound = false;
                        for (var i = 0; i < users.length; i++) {
                          if ((users[i].email || '').trim().toLowerCase() === sourceEmail) {
                            users[i].email = newEmailVal;
                            userFound = true;
                            break;
                          }
                        }
                        if (!userFound) {
                          users.push({ name: session.name || '', email: newEmailVal, passwordHash: '' });
                        }

                        localStorage.setItem('aramabul.auth.users.v1', JSON.stringify(users));
                        
                        msg.textContent = 'E-posta güncellendi! Hesaptan çıkış yapılıyor...';
                        msg.style.color = '#2ecc71';

                        // Perform automatic logout after email change
                        setTimeout(function() {
                          localStorage.removeItem('aramabul.auth.session.v1');
                          // Notify native app of logout
                          try {
                            if (window.AramaBulAndroid) {
                              window.AramaBulAndroid.postMessage(JSON.stringify({ action: 'logout' }));
                            }
                          } catch(err) {}
                          // Redirect to login page
                          window.location.href = 'profile.html?action=login';
                        }, 1200);
                      });
                    }

                    // Wire sidebar clicks for email row (SPA-style panel switching)
                    var emailTrigger = sidebar ? sidebar.querySelector('[data-settings-panel-trigger="email"]') : null;
                    if (emailTrigger && !emailTrigger.__aramabulWired) {
                      emailTrigger.__aramabulWired = true;
                      emailTrigger.addEventListener('click', function(ev) {
                        ev.preventDefault();
                        window.history.pushState({}, '', 'profile.html?action=email');
                        if (panelStack) {
                          panelStack.querySelectorAll('[data-settings-panel]').forEach(function(p) { p.hidden = true; });
                          var ep = panelStack.querySelector('[data-settings-panel="email"]');
                          if (ep) ep.hidden = false;
                        }
                        if (sidebar) {
                          sidebar.querySelectorAll('.settings-row-button').forEach(function(r) { r.classList.remove('is-active'); });
                        }
                        emailTrigger.classList.add('is-active');
                        
                        // In mobile mode, switch view
                        var sidebarCard = document.querySelector('.settings-sidebar-card');
                        var panelStackCard = document.querySelector('.settings-panel-stack');
                        if (sidebarCard) sidebarCard.style.setProperty('display', 'none', 'important');
                        if (panelStackCard) panelStackCard.style.setProperty('display', 'block', 'important');
                        
                        // Custom title header update
                        var titleEl = document.getElementById('aramabul-custom-settings-title');
                        if (titleEl) titleEl.textContent = 'E-Posta Değişikliği';
                        var backBtn = document.getElementById('aramabul-custom-settings-back-btn');
                        if (backBtn) backBtn.style.setProperty('display', 'flex', 'important');
                        cleanupAndroidChrome();
                      });
                    }

                    // Auto-activate panel if action=email is in query params
                    var params = new URLSearchParams(window.location.search);
                    var action = (params.get('action') || '').trim().toLowerCase();
                    if (action === 'email') {
                      if (panelStack) {
                        panelStack.querySelectorAll('[data-settings-panel]').forEach(function(p) {
                          p.hidden = (p.getAttribute('data-settings-panel') !== 'email');
                        });
                        var ep = panelStack.querySelector('[data-settings-panel="email"]');
                        if (ep) ep.hidden = false;
                      }
                      
                      if (sidebar) {
                        sidebar.querySelectorAll('.settings-row-button').forEach(function(r) { r.classList.remove('is-active'); });
                        if (emailTrigger) emailTrigger.classList.add('is-active');
                        
                        // In mobile mode, switch view
                        var sidebarCard = document.querySelector('.settings-sidebar-card');
                        var panelStackCard = document.querySelector('.settings-panel-stack');
                        if (sidebarCard) sidebarCard.style.setProperty('display', 'none', 'important');
                        if (panelStackCard) panelStackCard.style.setProperty('display', 'block', 'important');
                      }
                      
                      // Custom title header update
                      var titleEl = document.getElementById('aramabul-custom-settings-title');
                      if (titleEl) titleEl.textContent = 'E-Posta Değişikliği';
                      var backBtn = document.getElementById('aramabul-custom-settings-back-btn');
                      if (backBtn) backBtn.style.setProperty('display', 'flex', 'important');
                    }
                  } catch(e) {
                    console.error('[setupEmailChangePanel] Error:', e);
                  }
                }
                syncSettingsBreadcrumb();
                setupHesabimLayout();
                setupEmailChangePanel();
              } catch (e) {}
            }
            cleanupAndroidChrome();
            if (window.__aramabulCleanupInterval) {
              clearInterval(window.__aramabulCleanupInterval);
            }
            window.__aramabulCleanupInterval = setInterval(cleanupAndroidChrome, 300);

            if (window.__aramabulObserver) {
              window.__aramabulObserver.disconnect();
            }
            if (window.MutationObserver) {
              var observer = new MutationObserver(function() {
                observer.disconnect();
                cleanupAndroidChrome();
                observer.observe(document.documentElement, {
                  childList: true,
                  subtree: true
                });
              });
              observer.observe(document.documentElement, {
                childList: true,
                subtree: true
              });
              window.__aramabulObserver = observer;
            }

            // --- Hook into SPA navigation (pushState/replaceState/popstate) ---
            if (!window.__ARAMABUL_SPA_HOOKED__) {
              window.__ARAMABUL_SPA_HOOKED__ = true;
              window.addEventListener('popstate', function() { setTimeout(cleanupAndroidChrome, 50); });
              (function(history) {
                var origPush = history.pushState;
                history.pushState = function() {
                  var ret = origPush.apply(history, arguments);
                  setTimeout(cleanupAndroidChrome, 50);
                  return ret;
                };
                var origReplace = history.replaceState;
                history.replaceState = function() {
                  var ret = origReplace.apply(history, arguments);
                  setTimeout(cleanupAndroidChrome, 50);
                  return ret;
                };
              })(window.history);
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
          // Settings: fix mobile panel visibility for sub-panels (password, email, feedback, etc.)
          var params = new URLSearchParams(window.location.search);
          var action = (params.get('action') || '').trim().toLowerCase();
          if (action === 'password' || action === 'email' || action === 'feedback' || action === 'help' || action === 'about' || action === 'delete-account' || action === 'kurumsal') {
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
              '$bulletproofHideFooterCss' +
              'html, body { background: #ffffff !important; color: #2f241e !important; }' +
              'body::before { content: "" !important; display: none !important; }' +
              '.global-topline, .desktop-auth-links, .desktop-lang-switch, .home-hero-search, html body .mobile-bottom-nav, html body .mobile-bottom-nav-actions, html body.mobile-bottom-nav-visible .mobile-bottom-nav, html body.home-page .mobile-bottom-nav, body.mobile-chrome-browser.mobile-force-layout.home-page .mobile-bottom-nav, body.mobile-chrome-browser.mobile-force-layout.home-page .mobile-bottom-nav-actions, html body.mobile-chrome-browser.mobile-force-layout.home-page .mobile-bottom-nav, html body.mobile-chrome-browser.mobile-force-layout.home-page .mobile-bottom-nav-actions, .mobile-bottom-nav.mobile-bottom-nav.mobile-bottom-nav, .mobile-bottom-nav-actions.mobile-bottom-nav-actions.mobile-bottom-nav-actions, .yr-footer, .yr-footer-inner, .yr-footer-grid, .yr-footer-bottom, .global-footer, .global-footer-band, .footer-band, footer[aria-label*="Alt" i] { display: none !important; height: 0 !important; max-height: 0 !important; overflow: hidden !important; opacity: 0 !important; pointer-events: none !important; background: #ffffff !important; visibility: hidden !important; }' +
              'body.settings-page .global-header-band, body.settings-page .global-topbar, body.settings-page .topbar, body.search-page .global-header-band, body.search-page .global-topbar, body.search-page .topbar { display: none !important; height: 0 !important; max-height: 0 !important; overflow: hidden !important; opacity: 0 !important; pointer-events: none !important; }' +
              'body:not(.settings-page):not(.search-page) .global-header-band { display: block !important; height: auto !important; max-height: none !important; overflow: visible !important; opacity: 1 !important; pointer-events: auto !important; padding-top: 56px !important; margin: 0 !important; }' +
              'body:not(.settings-page):not(.search-page) .global-topbar, body:not(.settings-page):not(.search-page) .topbar { display: flex !important; height: 56px !important; max-height: none !important; overflow: visible !important; opacity: 1 !important; pointer-events: auto !important; position: fixed !important; top: 0 !important; left: 0 !important; right: 0 !important; z-index: 1200 !important; padding: 8px 12px !important; min-height: 56px !important; background: #ffffff !important; border-bottom: 1px solid rgba(0,0,0,0.06) !important; box-sizing: border-box !important; justify-content: center !important; align-items: center !important; }' +
              'body:not(.settings-page):not(.search-page) .global-topbar .brand, body:not(.settings-page):not(.search-page) .topbar .brand { display: none !important; }' +
              'body:not(.settings-page):not(.search-page) .header-search, body:not(.settings-page):not(.search-page) .topbar-search-form { display: flex !important; height: auto !important; max-height: none !important; overflow: visible !important; opacity: 1 !important; pointer-events: auto !important; width: 100% !important; max-width: 100% !important; margin: 0 !important; padding: 0 !important; flex: 1 1 100% !important; }' +
              'body:not(.settings-page):not(.search-page) .header-search-input { width: 100% !important; height: 40px !important; min-height: 40px !important; background: #f5f5f7 !important; border: 1px solid rgba(138,92,59,0.12) !important; border-radius: 12px !important; padding: 0 12px 0 38px !important; font-size: 0.9rem !important; color: #2f241e !important; box-sizing: border-box !important; background-image: url("data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%2216%22 height=%2216%22 viewBox=%220 0 24 24%22 fill=%22none%22 stroke=%22%238a5c3b%22 stroke-width=%222.5%22 stroke-linecap=%22round%22 stroke-linejoin=%22round%22%3E%3Ccircle cx=%2211%22 cy=%2211%22 r=%228%22%3E%3C/circle%3E%3Cline x1=%2221%22 y1=%2221%22 x2=%2216.65%22 y2=%2216.65%22%3E%3C/line%3E%3C/svg%3E") !important; background-repeat: no-repeat !important; background-position: 12px center !important; background-size: 16px !important; }' +
              'body:not(.settings-page):not(.search-page) .header-search-btn { display: none !important; }' +
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
              '.settings-signup-field input:focus, .settings-feedback-field input:focus, .settings-feedback-field textarea:focus, .settings-feedback-field select:focus, .settings-feedback-phone-group input:focus, .auth-form input:focus { border-color: #8a5c3b !important; box-shadow: 0 0 0 3px rgba(138,92,59,0.12) !important; }' +
              '.email-change-warning-banner { display: flex !important; gap: 10px !important; align-items: flex-start !important; background: transparent !important; margin-bottom: 24px !important; padding: 0 !important; }' +
              '.email-change-warning-icon { flex-shrink: 0 !important; display: inline-flex !important; margin-top: 2px !important; }' +
              '.email-change-warning-banner p { margin: 0 !important; font-size: 13.5px !important; line-height: 1.45 !important; color: #333333 !important; font-weight: 500 !important; text-shadow: none !important; }' +
              '.outlined-input-group { position: relative !important; margin-bottom: 20px !important; width: 100% !important; }' +
              '.outlined-input { width: 100% !important; height: 56px !important; min-height: 56px !important; border: 1px solid #c4c4c4 !important; border-radius: 8px !important; background: #ffffff !important; color: #000000 !important; padding: 0 16px !important; font-size: 15px !important; font-weight: 400 !important; outline: none !important; box-sizing: border-box !important; transition: border-color 0.2s ease !important; }' +
              '.outlined-input:focus { border-color: #000000 !important; border-width: 1.5px !important; }' +
              '.disabled-input { background: #ffffff !important; border-color: #c4c4c4 !important; color: #555555 !important; cursor: not-allowed !important; }' +
              '.outlined-input-group label { position: absolute !important; left: 12px !important; top: 0 !important; transform: translateY(-50%) !important; background: #ffffff !important; padding: 0 6px !important; font-size: 11.5px !important; color: #757575 !important; font-weight: 500 !important; pointer-events: none !important; transition: all 0.2s ease !important; }' +
              '.outlined-input:placeholder-shown:not(:focus) ~ label { top: 50% !important; transform: translateY(-50%) !important; font-size: 15px !important; color: #757575 !important; font-weight: 400 !important; background: transparent !important; padding: 0 !important; left: 16px !important; }' +
              '.outlined-input:focus ~ label { top: 0 !important; transform: translateY(-50%) !important; font-size: 11.5px !important; color: #000000 !important; font-weight: 600 !important; background: #ffffff !important; padding: 0 6px !important; left: 12px !important; }' +
              '.black-pill-btn { width: 100% !important; height: 48px !important; min-height: 48px !important; background: #000000 !important; color: #ffffff !important; border: none !important; border-radius: 24px !important; font-size: 16px !important; font-weight: 700 !important; cursor: pointer !important; display: flex !important; align-items: center !important; justify-content: center !important; transition: background-color 0.2s ease !important; box-shadow: none !important; padding: 0 !important; }' +
              '.black-pill-btn:active { background: #333333 !important; }' +
              '.email-change-actions { margin-top: 8px !important; width: 100% !important; }';
          })();

        } catch (e) {
          console.error('[__injectAppFlag] Visual layouts and style overrides error:', e);
        }
      ''');

      // 4. Synchronize auth session changes back to native (isolated)
      await _controller.runJavaScript('''
        try {
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
        } catch(e) {
          console.error('[__injectAppFlag] Auth callback session sync error:', e);
        }
      ''');
    } catch (e) {
      debugPrint('[_injectAppFlag] Error: $e');
    }
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
    try {
      final results = await Connectivity().checkConnectivity().timeout(const Duration(seconds: 2));
      return results.any((r) => r != ConnectivityResult.none);
    } catch (e) {
      debugPrint('[Connectivity] checkConnectivity timed out or failed: $e');
      return true; // Default to true so we try loading the live URL
    }
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
            _injectNavHideCss();
            _injectAppFlag();
          },
          onPageFinished: (_) {
            if (!mounted) return;
            // Re-inject to ensure all styles are applied
            _injectAppFlag();
            _controller.currentUrl().then((currentUrl) {
              debugPrint('[HomeWebView] page finished: $currentUrl');
              if (mounted) {
                final nextNavIndex = _nativeNavIndexForUrl(currentUrl);
                if (nextNavIndex != _nativeNavIndex) {
                  setState(() => _nativeNavIndex = nextNavIndex);
                }
              }
            });
            final initialPath = widget.initialPath ?? '';
            if (initialPath.contains('app_google_chooser=1') && !_bundledGoogleChooserRedirected) {
              _bundledGoogleChooserRedirected = true;
              Future.microtask(() async {
                try {
                  await _controller.runJavaScript('''
                    window.location.href = 'profile.html?action=login&app_google_chooser=1';
                  ''');
                } catch (e) {
                  debugPrint('[HomeWebView] Bundled chooser redirect failed: $e');
                }
              });
            }
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
            if (value > 20) {
              _injectNavHideCss();
            }
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
      _controller.setBackgroundColor(kAppBackgroundColor);
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
      final initialPath = widget.initialPath ?? '';
      final useBundledChooserFallback = initialPath.contains('app_google_chooser=1');
      if (useBundledChooserFallback) {
        debugPrint('[HomeWebView] Bundled Google chooser fallback requested, loading local asset shell');
        await _loadBundledPage();
        return;
      }
      if (online) {
        final path = initialPath;
        final isAuthPath = path == '/profile.html?action=login' ||
            path == '/profile.html?action=signup' ||
            path == '/account-settings.html?action=login' ||
            path == '/account-settings.html?action=signup';
        final url = path.isNotEmpty ? '$kLiveUrl$path' : kLiveUrl;
        if (isAuthPath) {
          debugPrint('[HomeWebView] Loading live auth URL: $url');
        } else {
          debugPrint('[HomeWebView] Loading online url: $url');
        }
        await _controller.loadRequest(Uri.parse(url));
      } else {
        debugPrint('[HomeWebView] Offline, loading bundled fallback');
        await _loadBundledPage();
      }
    } catch (error) {
      debugPrint('[HomeWebView] Load failed, falling back: $error');
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

  String _nativeNavUrlForIndex(int index) {
    switch (index) {
      case 1:
        return '$kLiveUrl/search.html';
      case 2:
        return '$kLiveUrl/favorites.html';
      case 3:
        return '$kLiveUrl/profile.html?action=profile';
      case 0:
      default:
        return kLiveUrl;
    }
  }

  int _nativeNavIndexForUrl(String? rawUrl) {
    if (rawUrl == null || rawUrl.isEmpty) return _nativeNavIndex;
    final uri = Uri.tryParse(rawUrl);
    final path = (uri?.path.isEmpty ?? true) ? '/' : uri!.path;
    if (path.contains('search')) return 1;
    if (path.contains('favorites')) return 2;
    if (path.contains('profile') ||
        path.contains('account-settings') ||
        path.contains('settings')) {
      return 3;
    }
    return 0;
  }

  Future<void> _goNativeNav(int index) async {
    if (index == _nativeNavIndex) {
      if (index == 3) {
        try {
          await _controller.runJavaScript('''
            (function() {
              var path = window.location.pathname || '';
              if (path.indexOf('profile.html') !== -1) {
                var sidebar = document.querySelector('.settings-sidebar-card');
                var panelStack = document.querySelector('.settings-panel-stack');
                if (sidebar && panelStack) {
                  sidebar.style.removeProperty('display');
                  panelStack.style.removeProperty('display');
                  return;
                }
              }
              window.location.href = 'profile.html?action=profile';
            })();
          ''');
        } catch (e) {
          debugPrint('[NavHesapReset] Error: $e');
        }
        return;
      }
      final url = await _controller.currentUrl();
      final currentIndex = _nativeNavIndexForUrl(url);
      if (currentIndex == index) return;
    }
    if (!mounted) return;
    setState(() {
      _nativeNavIndex = index;
      _isPageTransitioning = true;
    });
    await _controller.loadRequest(Uri.parse(_nativeNavUrlForIndex(index)));
  }

  Widget _buildNativeBottomNav() {
    const items = [
      (asset: '', fallbackIcon: Icons.home_rounded, label: 'Anasayfa'),
      (asset: '', fallbackIcon: Icons.search_rounded, label: 'Ara'),
      (asset: '', fallbackIcon: Icons.favorite_rounded, label: 'Favoriler'),
      (asset: '', fallbackIcon: Icons.person_rounded, label: 'Hesap'),
    ];

    return Container(
      decoration: const BoxDecoration(
        color: Colors.white,
        border: Border(
          top: BorderSide(
            color: Color(0xFFF2F2F5),
            width: 1,
          ),
        ),
      ),
      child: SafeArea(
        top: false,
        bottom: false,
        child: SizedBox(
          height: 74,
          child: Row(
            children: List.generate(items.length, (index) {
              final item = items[index];
              final isActive = _nativeNavIndex == index;
              final color = isActive ? const Color(0xFF000000) : const Color(0xFF8E8E93);
              return Expanded(
                child: Semantics(
                  button: true,
                  selected: isActive,
                  label: item.label,
                  child: InkWell(
                    onTap: () => _goNativeNav(index),
                    splashColor: const Color(0x11000000),
                    highlightColor: const Color(0x08000000),
                    child: Center(
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          SizedBox(
                            height: 28,
                            child: Center(
                              child: item.asset.isEmpty
                                  ? Icon(
                                      item.fallbackIcon,
                                      size: isActive ? 28 : 26,
                                      color: color,
                                    )
                                  : Image.asset(
                                      item.asset,
                                      width: isActive ? 26 : 24,
                                      height: isActive ? 26 : 24,
                                      fit: BoxFit.contain,
                                      color: color,
                                      colorBlendMode: BlendMode.srcIn,
                                      errorBuilder: (context, error, stackTrace) => Icon(
                                        item.fallbackIcon,
                                        size: isActive ? 28 : 26,
                                        color: color,
                                      ),
                                    ),
                            ),
                          ),
                          const SizedBox(height: 3),
                          Text(
                            item.label,
                            style: TextStyle(
                              fontSize: 10.5,
                              fontWeight: isActive ? FontWeight.w700 : FontWeight.w500,
                              color: color,
                              fontFamily: 'Plus Jakarta Sans',
                            ),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
              );
            }),
          ),
        ),
      ),
    );
  }

  Widget? _buildBottomChrome() {
    final children = <Widget>[
      _buildNativeBottomNav(),
    ];

    if (_isBannerReady && _bannerAd != null) {
      children.add(
        Container(
          color: kAppBackgroundColor,
          width: double.infinity,
          height: _bannerAd!.size.height.toDouble(),
          child: AdWidget(ad: _bannerAd!),
        ),
      );
    }

    return Column(
      mainAxisSize: MainAxisSize.min,
      children: children,
    );
  }

  // ---------------------------------------------------------------------------
  // UI
  // ---------------------------------------------------------------------------

  @override
  Widget build(BuildContext context) {
    final showProgress = _isLoading && _progress < 100;

    // Match status bar to the web header color
    SystemChrome.setSystemUIOverlayStyle(const SystemUiOverlayStyle(
      statusBarColor: kAppBackgroundColor,
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
        backgroundColor: kAppBackgroundColor,
        bottomNavigationBar: _buildBottomChrome(),
        body: Column(
          children: [
            // Status bar safe padding with matching color
            Container(
              color: kAppBackgroundColor,
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
                    color: Color(0xFFF7F1E6),
                    fontSize: 13,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ),
            if (showProgress)
              LinearProgressIndicator(
                value: _progress / 100,
                color: kAppSuccessColor,
                backgroundColor: kAppSurfaceColor,
              ),
            Expanded(
              child: Stack(
                children: [
                  Opacity(
                    opacity: _hasLoadedAtLeastOnce ? 1.0 : 0.0,
                    child: WebViewWidget(controller: _controller),
                  ),
                  if (_lastError != null) _buildErrorOverlay(),
                  // Theme overlay to prevent flash of unstyled content
                  if (_isPageTransitioning || !_hasLoadedAtLeastOnce)
                    Positioned.fill(
                      child: AnimatedOpacity(
                        opacity: (_isPageTransitioning || !_hasLoadedAtLeastOnce) ? 1.0 : 0.0,
                        duration: const Duration(milliseconds: 250),
                        child: Container(
                          color: kAppBackgroundColor,
                          child: !_hasLoadedAtLeastOnce
                            ? Center(
                                child: Image.asset(
                                  'assets/logoNew.png',
                                  width: MediaQuery.of(context).size.width * 0.5,
                                  fit: BoxFit.contain,
                                ),
                              )
                            : null,
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

  Widget _buildErrorOverlay() {
    return Container(
      color: kAppBackgroundColor,
      child: Center(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Card(
            color: kAppSurfaceColor,
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
                        : const Color(0xFF8A3A2A),
                  ),
                  const SizedBox(height: 16),
                  Text(
                    _isOffline ? 'Bağlantı Kesildi' : 'Sayfa Yüklenemedi',
                    style: const TextStyle(
                      fontSize: 20,
                      fontWeight: FontWeight.w700,
                      color: kAppInkColor,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    _isOffline
                        ? 'İnternet bağlantınızı kontrol edin.\nBağlantı sağlandığında otomatik yüklenecektir.'
                        : _lastError ?? 'Bilinmeyen hata',
                    textAlign: TextAlign.center,
                    style: const TextStyle(fontSize: 14, color: kAppInkColor),
                  ),
                  const SizedBox(height: 20),
                  FilledButton.icon(
                    onPressed: _reload,
                    icon: const Icon(Icons.refresh_rounded),
                    label: const Text('Tekrar Dene'),
                    style: FilledButton.styleFrom(
                      backgroundColor: kAppSuccessColor,
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
