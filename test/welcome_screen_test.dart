import 'package:aramabul_android/welcome_screen.dart';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

Widget _buildWelcome({
  required WelcomeContinue onContinue,
  bool hasActiveSession = false,
}) {
  return MaterialApp(
    home: MediaQuery(
      data: const MediaQueryData(disableAnimations: true),
      child: WelcomeScreen(
        hasActiveSession: hasActiveSession,
        onContinue: onContinue,
      ),
    ),
  );
}

void _setTestView(WidgetTester tester, Size size) {
  tester.view.physicalSize = size;
  tester.view.devicePixelRatio = 1;
  addTearDown(tester.view.resetPhysicalSize);
  addTearDown(tester.view.resetDevicePixelRatio);
}

void main() {
  testWidgets('welcome screen fits compact phones', (tester) async {
    _setTestView(tester, const Size(360, 640));

    await tester.pumpWidget(
      _buildWelcome(
        onContinue: ({required languageCode, required openSignIn}) async {},
      ),
    );
    await tester.pump();

    expect(tester.takeException(), isNull);
    expect(find.text('Giriş yap / Hesap oluştur'), findsOneWidget);
    expect(find.text('Giriş yapmadan keşfet'), findsOneWidget);
    expect(find.text('TR'), findsOneWidget);
    expect(find.text('EN'), findsOneWidget);
    expect(find.text('DE'), findsOneWidget);
    expect(find.text('RU'), findsOneWidget);

    for (final language in ['EN', 'DE', 'RU', 'TR']) {
      await tester.tap(find.text(language));
      await tester.pump();
      final layoutError = tester.takeException();
      expect(layoutError, isNull, reason: 'language: $language');
    }
  });

  testWidgets('selected language is returned for guest discovery', (
    tester,
  ) async {
    _setTestView(tester, const Size(390, 844));
    String? selectedLanguage;
    bool? selectedSignIn;

    await tester.pumpWidget(
      _buildWelcome(
        onContinue: ({required languageCode, required openSignIn}) async {
          selectedLanguage = languageCode;
          selectedSignIn = openSignIn;
        },
      ),
    );

    await tester.tap(find.text('EN'));
    await tester.pump();
    expect(find.text('Discover Istanbul your way.'), findsOneWidget);

    await tester.tap(find.text('Explore without signing in'));
    await tester.pump();

    expect(selectedLanguage, 'EN');
    expect(selectedSignIn, isFalse);
  });

  testWidgets('sign-in action requests the account route', (tester) async {
    _setTestView(tester, const Size(390, 844));
    String? selectedLanguage;
    bool? selectedSignIn;

    await tester.pumpWidget(
      _buildWelcome(
        onContinue: ({required languageCode, required openSignIn}) async {
          selectedLanguage = languageCode;
          selectedSignIn = openSignIn;
        },
      ),
    );

    await tester.tap(find.text('Giriş yap / Hesap oluştur'));
    await tester.pump();

    expect(selectedLanguage, 'TR');
    expect(selectedSignIn, isTrue);
  });

  testWidgets('active session offers account continuation', (tester) async {
    _setTestView(tester, const Size(390, 844));
    bool? selectedSignIn;

    await tester.pumpWidget(
      _buildWelcome(
        hasActiveSession: true,
        onContinue: ({required languageCode, required openSignIn}) async {
          selectedSignIn = openSignIn;
        },
      ),
    );

    expect(find.text('Hesabına devam et'), findsOneWidget);
    expect(find.text('Keşfetmeye devam et'), findsOneWidget);
    expect(find.text('Giriş yapmadan keşfet'), findsNothing);

    await tester.tap(find.text('Hesabına devam et'));
    await tester.pump();

    expect(selectedSignIn, isTrue);
  });
}
