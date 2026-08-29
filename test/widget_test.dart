import 'package:aramabul_android/main.dart';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  test('food picks route recognizes canonical and html paths', () {
    expect(isSelectionsPath('/yeme-icme-seckileri'), isTrue);
    expect(isSelectionsPath('/yeme-icme-seckileri.html'), isTrue);
    expect(isSelectionsPath('/rehber.html'), isFalse);
  });

  test('welcome is only shown before first use without a session', () {
    expect(
      shouldShowWelcomeScreen(hasSeenWelcome: false, hasActiveSession: false),
      isTrue,
    );
    expect(
      shouldShowWelcomeScreen(hasSeenWelcome: true, hasActiveSession: false),
      isFalse,
    );
    expect(
      shouldShowWelcomeScreen(hasSeenWelcome: false, hasActiveSession: true),
      isFalse,
    );
  });

  test('welcome account action always opens login', () {
    expect(welcomeInitialPath(openSignIn: true), '/profile.html?action=login');
    expect(welcomeInitialPath(openSignIn: false), isNull);
  });

  test('social login completion opens the home page', () {
    expect(socialLoginSuccessPath(), '/');
  });

  test('social login conflict preserves the server guidance', () {
    final error = readSocialLoginException(
      409,
      '{"ok":false,"error":{"code":"account_conflict",'
      '"message":"Farklı bir Google hesabı seçin."}}',
    );

    expect(error.statusCode, 409);
    expect(error.code, 'account_conflict');
    expect(error.message, 'Farklı bir Google hesabı seçin.');
  });

  test('social login error uses a safe fallback for invalid responses', () {
    final error = readSocialLoginException(502, '<html>bad gateway</html>');

    expect(error.statusCode, 502);
    expect(error.code, 'social_login_failed');
    expect(error.message, 'Google ile giriş tamamlanamadı.');
  });

  test('Apple subject and email can be read from an Android identity token', () {
    const token =
        'eyJhbGciOiJSUzI1NiJ9.'
        'eyJzdWIiOiJhcHBsZS11c2VyLTEyMyIsImVtYWlsIjoia2lzaUBleGFtcGxlLmNvbSJ9.'
        'signature';

    expect(jwtStringClaim(token, 'sub'), 'apple-user-123');
    expect(jwtStringClaim(token, 'email'), 'kisi@example.com');
    expect(jwtStringClaim('invalid-token', 'sub'), isNull);
  });

  test('Android Apple flow uses the native callback and preserves state', () {
    const state = 'aramabul_android_v2_test-state';
    final authorization = appleAuthorizationUri(state);
    expect(authorization.host, 'aramabul.com');
    expect(authorization.path, '/api/auth/apple-start');
    expect(authorization.queryParameters['platform'], 'android');
    expect(authorization.queryParameters['state'], state);

    final callback = Uri.parse(
      'aramabul://apple-auth?code=test&id_token=a.b.c&state=$state',
    );
    expect(isMatchingAppleCallback(callback, state), isTrue);
    expect(isMatchingAppleCallback(callback, 'different-state'), isFalse);
  });

  test('completed Apple callback is ignored when a session already exists', () {
    const state = 'aramabul_android_v2_completed-state';
    final callback = Uri.parse(
      'aramabul://apple-auth?code=test&id_token=a.b.c&state=$state',
    );

    expect(
      isCompletedAppleCallback(
        callback: callback,
        completedState: state,
        hasActiveSession: true,
      ),
      isTrue,
    );
    expect(
      isCompletedAppleCallback(
        callback: callback,
        completedState: state,
        hasActiveSession: false,
      ),
      isFalse,
    );
  });

  test('Apple handoff response creates the native callback URI', () {
    const state = 'aramabul_android_v2_poll-state';
    const idToken = 'header.payload.signature';
    final callback = appleCallbackFromHandoff(state: state, idToken: idToken);

    expect(callback.scheme, 'aramabul');
    expect(callback.host, 'apple-auth');
    expect(callback.queryParameters['code'], 'apple-mobile-handoff');
    expect(callback.queryParameters['id_token'], idToken);
    expect(callback.queryParameters['state'], state);
  });

  test('stale Apple pending state is not resumed on app startup', () {
    const state = 'aramabul_android_v2_pending-state';
    final now = DateTime(2026, 7, 17, 12).millisecondsSinceEpoch;

    expect(
      isFreshApplePendingState(
        state: state,
        startedAtMillis: now - const Duration(minutes: 2).inMilliseconds,
        nowMillis: now,
      ),
      isTrue,
    );
    expect(
      isFreshApplePendingState(
        state: state,
        startedAtMillis: now - const Duration(minutes: 9).inMilliseconds,
        nowMillis: now,
      ),
      isFalse,
    );
    expect(
      isFreshApplePendingState(
        state: 'invalid-state',
        startedAtMillis: now,
        nowMillis: now,
      ),
      isFalse,
    );
  });

  testWidgets('offline state offers retry', (tester) async {
    var retryCount = 0;

    await tester.pumpWidget(
      MaterialApp(
        home: Scaffold(
          body: OfflineView(details: null, onRetry: () => retryCount++),
        ),
      ),
    );

    expect(find.text('İnternet bağlantısı yok'), findsOneWidget);
    expect(find.text('Tekrar dene'), findsOneWidget);

    await tester.tap(find.text('Tekrar dene'));
    expect(retryCount, 1);
  });
}
