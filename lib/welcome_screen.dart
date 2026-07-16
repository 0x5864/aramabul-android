import 'dart:async';
import 'dart:math' as math;

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

typedef WelcomeContinue =
    Future<void> Function({
      required String languageCode,
      required bool openSignIn,
    });

class WelcomeScreen extends StatefulWidget {
  const WelcomeScreen({super.key, required this.onContinue});

  final WelcomeContinue onContinue;

  @override
  State<WelcomeScreen> createState() => _WelcomeScreenState();
}

class _WelcomeScreenState extends State<WelcomeScreen>
    with SingleTickerProviderStateMixin {
  static const Color _ink = Color(0xFF0B2944);
  static const Color _muted = Color(0xFF687887);
  static const Color _line = Color(0xFFDCE3E8);
  static const Color _soft = Color(0xFFF5F7F8);
  static const Color _red = Color(0xFFE30A17);

  static const List<List<String>> _photoSets = [
    [
      'assets/welcome/venues/venue-1-a.jpg',
      'assets/welcome/venues/venue-1-b.jpg',
      'assets/welcome/venues/venue-1-c.jpg',
    ],
    [
      'assets/welcome/venues/venue-2-a.jpg',
      'assets/welcome/venues/venue-2-b.jpg',
      'assets/welcome/venues/venue-2-c.jpg',
    ],
    [
      'assets/welcome/venues/venue-3-a.jpg',
      'assets/welcome/venues/venue-3-b.jpg',
      'assets/welcome/venues/venue-3-c.jpg',
    ],
  ];

  late final AnimationController _floatController;
  Timer? _photoTimer;
  final List<int> _photoIndexes = [0, 0, 0];
  int _nextPhotoCard = 0;
  String _languageCode = 'TR';
  bool _isSubmitting = false;
  bool? _reduceMotion;

  _WelcomeStrings get _copy => _welcomeStrings[_languageCode]!;

  @override
  void initState() {
    super.initState();
    _floatController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 7000),
    );
  }

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    final reduceMotion = MediaQuery.disableAnimationsOf(context);
    if (_reduceMotion == reduceMotion) return;
    _reduceMotion = reduceMotion;
    if (reduceMotion) {
      _photoTimer?.cancel();
      _photoTimer = null;
      _floatController.stop();
      _floatController.value = 0;
      return;
    }
    _floatController.repeat();
    _photoTimer ??= Timer.periodic(const Duration(milliseconds: 3100), (_) {
      if (!mounted) return;
      setState(() {
        final card = _nextPhotoCard;
        _photoIndexes[card] =
            (_photoIndexes[card] + 1) % _photoSets[card].length;
        _nextPhotoCard = (_nextPhotoCard + 1) % _photoSets.length;
      });
    });
  }

  @override
  void dispose() {
    _photoTimer?.cancel();
    _floatController.dispose();
    super.dispose();
  }

  Future<void> _continue({required bool openSignIn}) async {
    if (_isSubmitting) return;
    setState(() => _isSubmitting = true);
    try {
      await widget.onContinue(
        languageCode: _languageCode,
        openSignIn: openSignIn,
      );
    } catch (_) {
      if (!mounted) return;
      setState(() => _isSubmitting = false);
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(SnackBar(content: Text(_copy.actionError)));
    }
  }

  @override
  Widget build(BuildContext context) {
    return AnnotatedRegion<SystemUiOverlayStyle>(
      value: SystemUiOverlayStyle.dark.copyWith(
        statusBarColor: Colors.white,
        systemNavigationBarColor: Colors.white,
        systemNavigationBarIconBrightness: Brightness.dark,
      ),
      child: Scaffold(
        backgroundColor: Colors.white,
        body: SafeArea(
          child: LayoutBuilder(
            builder: (context, constraints) {
              final compact = constraints.maxHeight < 760;
              final heroScale = constraints.maxHeight < 660
                  ? 0.70
                  : compact
                  ? 0.84
                  : 1.0;
              return SingleChildScrollView(
                physics: const ClampingScrollPhysics(),
                child: ConstrainedBox(
                  constraints: BoxConstraints(minHeight: constraints.maxHeight),
                  child: IntrinsicHeight(
                    child: Padding(
                      padding: const EdgeInsets.fromLTRB(24, 4, 24, 14),
                      child: Column(
                        children: [
                          _TopBar(
                            skipLabel: _copy.skip,
                            isBusy: _isSubmitting,
                            onSkip: () => _continue(openSignIn: false),
                          ),
                          SizedBox(height: compact ? 2 : 8),
                          _buildHero(scale: heroScale),
                          SizedBox(height: compact ? 3 : 7),
                          Text(
                            _copy.title,
                            maxLines: 3,
                            overflow: TextOverflow.ellipsis,
                            textAlign: TextAlign.center,
                            style: TextStyle(
                              color: _ink,
                              fontSize: compact ? 25 : 29,
                              height: 1.1,
                              letterSpacing: -1.1,
                              fontWeight: FontWeight.w800,
                            ),
                          ),
                          SizedBox(height: compact ? 7 : 10),
                          Text(
                            _copy.intro,
                            maxLines: compact ? 2 : 3,
                            overflow: TextOverflow.ellipsis,
                            textAlign: TextAlign.center,
                            style: const TextStyle(
                              color: _muted,
                              fontSize: 12.5,
                              height: 1.48,
                              fontWeight: FontWeight.w500,
                            ),
                          ),
                          SizedBox(height: compact ? 10 : 17),
                          _AccountCard(copy: _copy, compact: compact),
                          SizedBox(height: compact ? 10 : 14),
                          _ActionButton(
                            label: _copy.signIn,
                            isPrimary: true,
                            isBusy: _isSubmitting,
                            onPressed: () => _continue(openSignIn: true),
                          ),
                          const SizedBox(height: 9),
                          _ActionButton(
                            label: _copy.continueAsGuest,
                            isPrimary: false,
                            isBusy: _isSubmitting,
                            onPressed: () => _continue(openSignIn: false),
                          ),
                          SizedBox(height: compact ? 7 : 9),
                          Text(
                            _copy.optional,
                            maxLines: 2,
                            textAlign: TextAlign.center,
                            style: const TextStyle(
                              color: Color(0xFF7B8995),
                              fontSize: 9.2,
                              height: 1.35,
                              fontWeight: FontWeight.w500,
                            ),
                          ),
                          const Spacer(),
                          _LanguageOptions(
                            selectedCode: _languageCode,
                            onSelected: (code) {
                              setState(() => _languageCode = code);
                            },
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
              );
            },
          ),
        ),
      ),
    );
  }

  Widget _buildHero({required double scale}) {
    final height = 220 * scale;
    return SizedBox(
      height: height,
      child: LayoutBuilder(
        builder: (context, constraints) {
          return AnimatedBuilder(
            animation: _floatController,
            builder: (context, _) {
              final radians = _floatController.value * math.pi * 2;
              return Stack(
                clipBehavior: Clip.none,
                children: [
                  Positioned(
                    left: -15 * scale,
                    top: 38 * scale,
                    child: _floatingCard(
                      cardIndex: 0,
                      width: 124 * scale,
                      height: 154 * scale,
                      baseRotation: -5.5,
                      floatY: math.sin(radians) * 4,
                      floatRotation: math.sin(radians) * 0.55,
                      showHeart: false,
                    ),
                  ),
                  Positioned(
                    right: -17 * scale,
                    top: 36 * scale,
                    child: _floatingCard(
                      cardIndex: 2,
                      width: 124 * scale,
                      height: 156 * scale,
                      baseRotation: 5.5,
                      floatY: math.sin(radians + 4.1) * 4,
                      floatRotation: math.sin(radians + 4.1) * 0.55,
                      showHeart: false,
                    ),
                  ),
                  Positioned(
                    left: (constraints.maxWidth - (180 * scale)) / 2,
                    top: 3 * scale,
                    child: _floatingCard(
                      cardIndex: 1,
                      width: 180 * scale,
                      height: 210 * scale,
                      baseRotation: 0,
                      floatY: math.sin(radians + 2.0) * 6,
                      floatRotation: 0,
                      showHeart: true,
                    ),
                  ),
                ],
              );
            },
          );
        },
      ),
    );
  }

  Widget _floatingCard({
    required int cardIndex,
    required double width,
    required double height,
    required double baseRotation,
    required double floatY,
    required double floatRotation,
    required bool showHeart,
  }) {
    return Transform.translate(
      offset: Offset(0, floatY),
      child: Transform.rotate(
        angle: (baseRotation + floatRotation) * math.pi / 180,
        child: _VenuePhotoCard(
          imageUrl: _photoSets[cardIndex][_photoIndexes[cardIndex]],
          width: width,
          height: height,
          showHeart: showHeart,
        ),
      ),
    );
  }
}

class _TopBar extends StatelessWidget {
  const _TopBar({
    required this.skipLabel,
    required this.isBusy,
    required this.onSkip,
  });

  final String skipLabel;
  final bool isBusy;
  final VoidCallback onSkip;

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: 50,
      child: Row(
        children: [
          const Expanded(
            child: Align(
              alignment: Alignment.centerLeft,
              child: FittedBox(
                fit: BoxFit.scaleDown,
                alignment: Alignment.centerLeft,
                child: Text.rich(
                  TextSpan(
                    children: [
                      TextSpan(text: 'arama'),
                      TextSpan(
                        text: 'bul',
                        style: TextStyle(color: Color(0xFFE30A17)),
                      ),
                    ],
                  ),
                  semanticsLabel: 'AramaBul',
                  style: TextStyle(
                    color: Color(0xFF111111),
                    fontSize: 25,
                    height: 1,
                    letterSpacing: -1.1,
                    fontWeight: FontWeight.w700,
                  ),
                ),
              ),
            ),
          ),
          const SizedBox(width: 12),
          ConstrainedBox(
            constraints: const BoxConstraints(maxWidth: 120),
            child: TextButton(
              onPressed: isBusy ? null : onSkip,
              style: TextButton.styleFrom(
                foregroundColor: const Color(0xFF526575),
                padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 9),
              ),
              child: Text(
                skipLabel,
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
                style: const TextStyle(
                  fontSize: 12.5,
                  fontWeight: FontWeight.w700,
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _VenuePhotoCard extends StatelessWidget {
  const _VenuePhotoCard({
    required this.imageUrl,
    required this.width,
    required this.height,
    required this.showHeart,
  });

  final String imageUrl;
  final double width;
  final double height;
  final bool showHeart;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: width,
      height: height,
      decoration: BoxDecoration(
        color: const Color(0xFFDCE5EA),
        border: Border.all(color: Colors.white, width: 5),
        borderRadius: BorderRadius.circular(24),
        boxShadow: const [
          BoxShadow(
            color: Color(0x290B2944),
            blurRadius: 40,
            offset: Offset(0, 17),
          ),
        ],
      ),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(19),
        child: Stack(
          fit: StackFit.expand,
          children: [
            AnimatedSwitcher(
              duration: const Duration(milliseconds: 430),
              switchInCurve: Curves.easeOut,
              switchOutCurve: Curves.easeIn,
              layoutBuilder: (currentChild, previousChildren) {
                return Stack(
                  fit: StackFit.expand,
                  children: [...previousChildren, ?currentChild],
                );
              },
              transitionBuilder: (child, animation) {
                return FadeTransition(
                  opacity: animation,
                  child: ScaleTransition(
                    scale: Tween<double>(
                      begin: 1.035,
                      end: 1,
                    ).animate(animation),
                    child: child,
                  ),
                );
              },
              child: Image.asset(
                imageUrl,
                key: ValueKey(imageUrl),
                fit: BoxFit.cover,
                filterQuality: FilterQuality.medium,
                errorBuilder: (_, _, _) => const ColoredBox(
                  color: Color(0xFFEAF0F3),
                  child: Icon(
                    Icons.storefront_outlined,
                    color: Color(0xFF687887),
                  ),
                ),
              ),
            ),
            if (showHeart)
              Positioned(
                right: 10,
                top: 10,
                child: Container(
                  width: 36,
                  height: 36,
                  decoration: const BoxDecoration(
                    color: Color(0xF7FFFFFF),
                    shape: BoxShape.circle,
                    boxShadow: [
                      BoxShadow(
                        color: Color(0x210B2944),
                        blurRadius: 18,
                        offset: Offset(0, 7),
                      ),
                    ],
                  ),
                  child: const Icon(
                    Icons.favorite_border_rounded,
                    color: Color(0xFFE30A17),
                    size: 19,
                  ),
                ),
              ),
          ],
        ),
      ),
    );
  }
}

class _AccountCard extends StatelessWidget {
  const _AccountCard({required this.copy, required this.compact});

  final _WelcomeStrings copy;
  final bool compact;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: EdgeInsets.fromLTRB(
        14,
        compact ? 10 : 13,
        14,
        compact ? 10 : 12,
      ),
      decoration: BoxDecoration(
        color: _WelcomeScreenState._soft,
        border: Border.all(color: _WelcomeScreenState._line),
        borderRadius: BorderRadius.circular(18),
      ),
      child: Column(
        children: [
          Row(
            children: [
              Container(
                width: 32,
                height: 32,
                decoration: const BoxDecoration(
                  color: Colors.white,
                  shape: BoxShape.circle,
                  boxShadow: [
                    BoxShadow(
                      color: Color(0x120B2944),
                      blurRadius: 10,
                      offset: Offset(0, 3),
                    ),
                  ],
                ),
                child: const Icon(
                  Icons.person_outline_rounded,
                  color: _WelcomeScreenState._ink,
                  size: 18,
                ),
              ),
              const SizedBox(width: 9),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      copy.accountTitle,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: const TextStyle(
                        color: _WelcomeScreenState._ink,
                        fontSize: 12.5,
                        height: 1.25,
                        fontWeight: FontWeight.w800,
                      ),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      copy.accountSubtitle,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: const TextStyle(
                        color: _WelcomeScreenState._muted,
                        fontSize: 9.4,
                        height: 1.3,
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 10),
          Row(
            children: [
              _Benefit(icon: Icons.favorite_border, label: copy.favorites),
              const SizedBox(width: 6),
              _Benefit(icon: Icons.history_rounded, label: copy.recentlyViewed),
              const SizedBox(width: 6),
              _Benefit(icon: Icons.auto_awesome_outlined, label: copy.forYou),
            ],
          ),
        ],
      ),
    );
  }
}

class _Benefit extends StatelessWidget {
  const _Benefit({required this.icon, required this.label});

  final IconData icon;
  final String label;

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: Container(
        height: 31,
        padding: const EdgeInsets.symmetric(horizontal: 4),
        decoration: BoxDecoration(
          color: Colors.white,
          border: Border.all(color: const Color(0xFFE3E8EB)),
          borderRadius: BorderRadius.circular(10),
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(icon, color: _WelcomeScreenState._red, size: 12),
            const SizedBox(width: 4),
            Flexible(
              child: Text(
                label,
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
                style: const TextStyle(
                  color: Color(0xFF30485B),
                  fontSize: 8.2,
                  fontWeight: FontWeight.w800,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _ActionButton extends StatelessWidget {
  const _ActionButton({
    required this.label,
    required this.isPrimary,
    required this.isBusy,
    required this.onPressed,
  });

  final String label;
  final bool isPrimary;
  final bool isBusy;
  final VoidCallback onPressed;

  @override
  Widget build(BuildContext context) {
    final border = isPrimary
        ? _WelcomeScreenState._ink
        : const Color(0xFFBAC7D1);
    return SizedBox(
      width: double.infinity,
      height: 49,
      child: FilledButton(
        onPressed: isBusy ? null : onPressed,
        style: FilledButton.styleFrom(
          backgroundColor: isPrimary ? _WelcomeScreenState._ink : Colors.white,
          foregroundColor: isPrimary ? Colors.white : _WelcomeScreenState._ink,
          disabledBackgroundColor: isPrimary
              ? _WelcomeScreenState._ink.withValues(alpha: 0.7)
              : Colors.white,
          disabledForegroundColor: isPrimary
              ? Colors.white70
              : _WelcomeScreenState._muted,
          elevation: isPrimary ? 1 : 0,
          shadowColor: const Color(0x290B2944),
          side: BorderSide(color: border),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(14),
          ),
        ),
        child: isBusy && isPrimary
            ? const SizedBox(
                width: 18,
                height: 18,
                child: CircularProgressIndicator(
                  strokeWidth: 2,
                  color: Colors.white,
                ),
              )
            : Text(
                label,
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
                style: const TextStyle(
                  fontSize: 12.5,
                  fontWeight: FontWeight.w800,
                ),
              ),
      ),
    );
  }
}

class _LanguageOptions extends StatelessWidget {
  const _LanguageOptions({
    required this.selectedCode,
    required this.onSelected,
  });

  final String selectedCode;
  final ValueChanged<String> onSelected;

  @override
  Widget build(BuildContext context) {
    return Semantics(
      container: true,
      label: 'Language selection',
      child: Row(
        mainAxisAlignment: MainAxisAlignment.center,
        children: ['TR', 'EN', 'DE', 'RU'].map((code) {
          final selected = code == selectedCode;
          return Padding(
            padding: const EdgeInsets.symmetric(horizontal: 3),
            child: Semantics(
              selected: selected,
              button: true,
              child: InkWell(
                onTap: () => onSelected(code),
                borderRadius: BorderRadius.circular(9),
                child: AnimatedContainer(
                  duration: const Duration(milliseconds: 160),
                  width: 34,
                  height: 29,
                  alignment: Alignment.center,
                  decoration: BoxDecoration(
                    color: selected
                        ? _WelcomeScreenState._soft
                        : Colors.transparent,
                    border: Border.all(
                      color: selected
                          ? const Color(0xFFD7DFE5)
                          : Colors.transparent,
                    ),
                    borderRadius: BorderRadius.circular(9),
                  ),
                  child: Text(
                    code,
                    style: TextStyle(
                      color: selected
                          ? _WelcomeScreenState._ink
                          : const Color(0xFF71808D),
                      fontSize: 9,
                      fontWeight: FontWeight.w800,
                    ),
                  ),
                ),
              ),
            ),
          );
        }).toList(),
      ),
    );
  }
}

class _WelcomeStrings {
  const _WelcomeStrings({
    required this.skip,
    required this.title,
    required this.intro,
    required this.accountTitle,
    required this.accountSubtitle,
    required this.favorites,
    required this.recentlyViewed,
    required this.forYou,
    required this.signIn,
    required this.continueAsGuest,
    required this.optional,
    required this.actionError,
  });

  final String skip;
  final String title;
  final String intro;
  final String accountTitle;
  final String accountSubtitle;
  final String favorites;
  final String recentlyViewed;
  final String forYou;
  final String signIn;
  final String continueAsGuest;
  final String optional;
  final String actionError;
}

const Map<String, _WelcomeStrings> _welcomeStrings = {
  'TR': _WelcomeStrings(
    skip: 'Geç',
    title: 'İstanbul’u sana göre keşfet.',
    intro:
        'Yakınındaki mekanları bul. Hesabınla giriş yaparsan keşiflerin tüm cihazlarında seninle kalsın.',
    accountTitle: 'Hesabınla daha fazlasını yap',
    accountSubtitle: 'Google, Apple veya e-posta ile ücretsiz giriş yap.',
    favorites: 'Favoriler',
    recentlyViewed: 'Son baktıkların',
    forYou: 'Sana göre',
    signIn: 'Giriş yap / Hesap oluştur',
    continueAsGuest: 'Giriş yapmadan keşfet',
    optional:
        'Giriş isteğe bağlıdır. AramaBul’u hesap oluşturmadan kullanabilirsin.',
    actionError: 'Uygulama açılamadı. Lütfen tekrar dene.',
  ),
  'EN': _WelcomeStrings(
    skip: 'Skip',
    title: 'Discover Istanbul your way.',
    intro:
        'Find places nearby. Sign in to keep your discoveries with you on every device.',
    accountTitle: 'Do more with your account',
    accountSubtitle: 'Sign in free with Google, Apple, or email.',
    favorites: 'Favorites',
    recentlyViewed: 'Recently viewed',
    forYou: 'For you',
    signIn: 'Sign in / Create account',
    continueAsGuest: 'Explore without signing in',
    optional: 'Sign-in is optional. You can use AramaBul without an account.',
    actionError: 'The app could not be opened. Please try again.',
  ),
  'DE': _WelcomeStrings(
    skip: 'Überspringen',
    title: 'Entdecke Istanbul auf deine Art.',
    intro:
        'Finde Orte in deiner Nähe. Angemeldet bleiben deine Entdeckungen auf allen Geräten erhalten.',
    accountTitle: 'Mehr mit deinem Konto',
    accountSubtitle: 'Kostenlos mit Google, Apple oder E-Mail anmelden.',
    favorites: 'Favoriten',
    recentlyViewed: 'Zuletzt angesehen',
    forYou: 'Für dich',
    signIn: 'Anmelden / Konto erstellen',
    continueAsGuest: 'Ohne Anmeldung entdecken',
    optional:
        'Die Anmeldung ist optional. AramaBul funktioniert auch ohne Konto.',
    actionError:
        'Die App konnte nicht geöffnet werden. Bitte erneut versuchen.',
  ),
  'RU': _WelcomeStrings(
    skip: 'Пропустить',
    title: 'Откройте Стамбул по-своему.',
    intro:
        'Находите места рядом. После входа ваши находки сохранятся на всех устройствах.',
    accountTitle: 'Больше возможностей с аккаунтом',
    accountSubtitle: 'Бесплатный вход через Google, Apple или почту.',
    favorites: 'Избранное',
    recentlyViewed: 'Недавние',
    forYou: 'Для вас',
    signIn: 'Войти / Создать аккаунт',
    continueAsGuest: 'Продолжить без входа',
    optional: 'Вход необязателен. AramaBul можно использовать без аккаунта.',
    actionError: 'Не удалось открыть приложение. Попробуйте ещё раз.',
  ),
};
