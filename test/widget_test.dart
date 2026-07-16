import 'package:aramabul_android/main.dart';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
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

  test('Apple subject and email can be read from an Android identity token', () {
    const token =
        'eyJhbGciOiJSUzI1NiJ9.'
        'eyJzdWIiOiJhcHBsZS11c2VyLTEyMyIsImVtYWlsIjoia2lzaUBleGFtcGxlLmNvbSJ9.'
        'signature';

    expect(jwtStringClaim(token, 'sub'), 'apple-user-123');
    expect(jwtStringClaim(token, 'email'), 'kisi@example.com');
    expect(jwtStringClaim('invalid-token', 'sub'), isNull);
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
