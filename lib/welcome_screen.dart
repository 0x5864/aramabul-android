
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:google_fonts/google_fonts.dart';

/// Localized strings for the welcome screen.
const Map<String, Map<String, String>> _welcomeStrings = {
  'TR': {
    'hello': 'Merhaba',
    'subtitle': "AramaBul'a hoşgeldiniz!",
    'login': 'Giriş Yap',
    'or': 'veya',
    'signup_with': 'ile kaydol',
    'no_account': 'Hesabın yok mu? ',
    'create_account': 'Hesap Oluştur',
    'policy':
        'Devam ederek Gizlilik Politikası ve\nKullanım Koşullarını kabul etmiş olursunuz.',
    'privacy': 'Gizlilik Politikası',
    'terms': 'Kullanım Koşulları',
    'skip': 'Giriş yapmadan keşfet',
  },
  'EN': {
    'hello': 'Hello',
    'subtitle': 'Welcome to AramaBul!',
    'login': 'Sign In',
    'or': 'or',
    'signup_with': 'sign up with',
    'no_account': "Don't have an account? ",
    'create_account': 'Create Account',
    'policy':
        'By continuing, you agree to our Privacy Policy\nand Terms of Service.',
    'privacy': 'Privacy Policy',
    'terms': 'Terms of Service',
    'skip': 'Browse without signing in',
  },
  'DE': {
    'hello': 'Hallo',
    'subtitle': 'Willkommen bei AramaBul!',
    'login': 'Anmelden',
    'or': 'oder',
    'signup_with': 'registrieren mit',
    'no_account': 'Kein Konto? ',
    'create_account': 'Konto erstellen',
    'policy':
        'Durch Fortfahren akzeptieren Sie unsere\nDatenschutzrichtlinie und Nutzungsbedingungen.',
    'privacy': 'Datenschutzrichtlinie',
    'terms': 'Nutzungsbedingungen',
    'skip': 'Ohne Anmeldung erkunden',
  },
  'RU': {
    'hello': 'Привет',
    'subtitle': 'Добро пожаловать в AramaBul!',
    'login': 'Войти',
    'or': 'или',
    'signup_with': 'зарегистрироваться через',
    'no_account': 'Нет аккаунта? ',
    'create_account': 'Создать аккаунт',
    'policy':
        'Продолжая, вы принимаете Политику\nконфиденциальности и Условия использования.',
    'privacy': 'Политика конфиденциальности',
    'terms': 'Условия использования',
    'skip': 'Просмотр без входа',
  },
};

// ─── Color palette ─────────────────────────────────────────────────────
const _kPrimaryBlue = Color(0xFF1565C0);
const _kDeepBlue = Color(0xFF0D47A1);
const _kAccentBlue = Color(0xFF42A5F5);
const _kLightBlue = Color(0xFF90CAF9);
const _kDarkBg = Color(0xFF0A1A2E);
const _kCardBg = Color(0xFF0F2744);

/// AramaBul Welcome / Onboarding screen.
class WelcomeScreen extends StatefulWidget {
  final void Function(String? route) onContinue;

  const WelcomeScreen({super.key, required this.onContinue});

  @override
  State<WelcomeScreen> createState() => _WelcomeScreenState();
}

class _WelcomeScreenState extends State<WelcomeScreen>
    with SingleTickerProviderStateMixin {
  String _selectedLang = 'TR';
  late final AnimationController _animCtrl;
  late final Animation<double> _fadeIn;
  late final Animation<Offset> _slideUp;

  Map<String, String> get _t =>
      _welcomeStrings[_selectedLang] ?? _welcomeStrings['TR']!;

  void _selectLang(String lang) {
    setState(() => _selectedLang = lang);
    widget.onContinue('lang_${lang.toLowerCase()}');
  }

  @override
  void initState() {
    super.initState();
    _animCtrl = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 900),
    );
    _fadeIn = CurvedAnimation(parent: _animCtrl, curve: Curves.easeOut);
    _slideUp = Tween<Offset>(
      begin: const Offset(0, 0.15),
      end: Offset.zero,
    ).animate(CurvedAnimation(parent: _animCtrl, curve: Curves.easeOutCubic));
    _animCtrl.forward();
  }

  @override
  void dispose() {
    _animCtrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    SystemChrome.setSystemUIOverlayStyle(const SystemUiOverlayStyle(
      statusBarColor: Colors.transparent,
      statusBarIconBrightness: Brightness.light,
    ));

    final bottomPadding = MediaQuery.of(context).padding.bottom;

    return Scaffold(
      body: Stack(
        children: [
          // ── Full-screen background image ──
          Positioned.fill(
            child: Image.asset(
              'assets/welcome/wellcome.jpg',
              fit: BoxFit.cover,
            ),
          ),

          // ── Blue gradient overlay ──
          Positioned.fill(
            child: DecoratedBox(
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  begin: Alignment.topCenter,
                  end: Alignment.bottomCenter,
                  stops: const [0.0, 0.25, 0.5, 1.0],
                  colors: [
                    _kDarkBg.withValues(alpha: 0.3),
                    _kDarkBg.withValues(alpha: 0.45),
                    _kDarkBg.withValues(alpha: 0.7),
                    _kDarkBg.withValues(alpha: 0.95),
                  ],
                ),
              ),
            ),
          ),

          // ── Content ──
          SafeArea(
            child: FadeTransition(
              opacity: _fadeIn,
              child: SlideTransition(
                position: _slideUp,
                child: Column(
                  children: [
                    // ── Greeting text (upper area, left-aligned) ──
                    const SizedBox(height: 60),
                    Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 28),
                      child: Align(
                        alignment: Alignment.centerLeft,
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              _t['hello']!,
                              style: GoogleFonts.plusJakartaSans(
                                fontSize: 42,
                                fontWeight: FontWeight.w300,
                                color: Colors.white,
                                letterSpacing: -0.5,
                                height: 1.1,
                              ),
                            ),
                            const SizedBox(height: 6),
                            Text(
                              _t['subtitle']!,
                              style: GoogleFonts.plusJakartaSans(
                                fontSize: 16,
                                fontWeight: FontWeight.w300,
                                color: _kLightBlue.withValues(alpha: 0.9),
                                height: 1.4,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),

                    const Spacer(),

                    // ── Login button ──
                    Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 28),
                      child: Center(
                        child: _ActionButton(
                          label: _t['login']!,
                          icon: Icons.login_rounded,
                          gradient: const [_kPrimaryBlue, _kDeepBlue],
                          onTap: () => widget.onContinue('login'),
                          shrinkWrap: true,
                        ),
                      ),
                    ),
                    const SizedBox(height: 20),

                    // ── Divider ──
                    Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 28),
                      child: Row(
                        children: [
                          Expanded(
                            child: Container(
                              height: 0.5,
                              color: _kLightBlue.withValues(alpha: 0.25),
                            ),
                          ),
                          Padding(
                            padding:
                                const EdgeInsets.symmetric(horizontal: 14),
                            child: Text(
                              _t['or']!,
                              style: TextStyle(
                                fontSize: 13,
                                color: _kLightBlue.withValues(alpha: 0.5),
                              ),
                            ),
                          ),
                          Expanded(
                            child: Container(
                              height: 0.5,
                              color: _kLightBlue.withValues(alpha: 0.25),
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 18),

                    // ── Social login ──
                    Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        _SocialButtonImage(
                          assetPath: 'assets/welcome/google_g.png',
                          size: 26,
                          onTap: () => widget.onContinue('google_signin'),
                        ),
                        const SizedBox(width: 16),
                        _SocialButton(
                          icon: Icons.apple,
                          iconSize: 30,
                          color: Colors.white,
                          onTap: () => widget.onContinue('apple_signin'),
                        ),
                      ],
                    ),
                    const SizedBox(height: 6),
                    Text(
                      _t['signup_with']!,
                      textAlign: TextAlign.center,
                      style: TextStyle(
                        fontSize: 12,
                        color: _kLightBlue.withValues(alpha: 0.45),
                      ),
                    ),

                    const SizedBox(height: 18),

                    // ── Skip / Guest button ──
                    GestureDetector(
                      onTap: () => widget.onContinue(null),
                      child: Text(
                        _t['skip']!,
                        style: TextStyle(
                          fontSize: 15,
                          fontWeight: FontWeight.w600,
                          color: _kAccentBlue,
                        ),
                      ),
                    ),

                    const SizedBox(height: 16),

                    // ── Register link ──
                    Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Text(
                          _t['no_account']!,
                          style: TextStyle(
                            fontSize: 14,
                            color: Colors.white.withValues(alpha: 0.5),
                          ),
                        ),
                        GestureDetector(
                          onTap: () => widget.onContinue('register'),
                          child: Text(
                            _t['create_account']!,
                            style: const TextStyle(
                              fontSize: 14,
                              fontWeight: FontWeight.w600,
                              color: _kAccentBlue,
                            ),
                          ),
                        ),
                      ],
                    ),

                    const SizedBox(height: 20),

                    // ── Policy text ──
                    Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 32),
                      child: Column(
                        children: [
                          Text(
                            _t['policy']!,
                            textAlign: TextAlign.center,
                            style: TextStyle(
                              fontSize: 11,
                              color: Colors.white.withValues(alpha: 0.35),
                              height: 1.5,
                            ),
                          ),
                          const SizedBox(height: 6),
                          Row(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              _PolicyLink(
                                label: _t['privacy']!,
                                onTap: () => widget.onContinue('privacy'),
                              ),
                              Padding(
                                padding:
                                    const EdgeInsets.symmetric(horizontal: 10),
                                child: Text(
                                  '\u00b7',
                                  style: TextStyle(
                                    fontSize: 14,
                                    color:
                                        Colors.white.withValues(alpha: 0.2),
                                  ),
                                ),
                              ),
                              _PolicyLink(
                                label: _t['terms']!,
                                onTap: () => widget.onContinue('terms'),
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),

                    const SizedBox(height: 20),

                    // ── Language selector (bottom center) ──
                    Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        _LangChip(
                            label: 'TR',
                            isSelected: _selectedLang == 'TR',
                            onTap: () => _selectLang('TR')),
                        const SizedBox(width: 6),
                        _LangChip(
                            label: 'EN',
                            isSelected: _selectedLang == 'EN',
                            onTap: () => _selectLang('EN')),
                        const SizedBox(width: 6),
                        _LangChip(
                            label: 'DE',
                            isSelected: _selectedLang == 'DE',
                            onTap: () => _selectLang('DE')),
                        const SizedBox(width: 6),
                        _LangChip(
                            label: 'RU',
                            isSelected: _selectedLang == 'RU',
                            onTap: () => _selectLang('RU')),
                      ],
                    ),

                    SizedBox(height: bottomPadding + 16),
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

// ─── Action Button ─────────────────────────────────────────────────────
class _ActionButton extends StatelessWidget {
  final String label;
  final IconData icon;
  final List<Color> gradient;
  final VoidCallback onTap;
  final bool shrinkWrap;

  const _ActionButton({
    required this.label,
    required this.icon,
    required this.gradient,
    required this.onTap,
    this.shrinkWrap = false,
  });

  @override
  Widget build(BuildContext context) {
    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(14),
        child: Ink(
          height: 54,
          padding: shrinkWrap ? const EdgeInsets.symmetric(horizontal: 28) : null,
          decoration: BoxDecoration(
            gradient: LinearGradient(
              begin: Alignment.centerLeft,
              end: Alignment.centerRight,
              colors: gradient,
            ),
            borderRadius: BorderRadius.circular(14),
            boxShadow: [
              BoxShadow(
                color: _kPrimaryBlue.withValues(alpha: 0.4),
                blurRadius: 18,
                offset: const Offset(0, 6),
              ),
            ],
          ),
          child: Row(
            mainAxisSize: shrinkWrap ? MainAxisSize.min : MainAxisSize.max,
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(icon, color: Colors.white, size: 20),
              const SizedBox(width: 10),
              Text(
                label,
                style: const TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.w600,
                  color: Colors.white,
                  letterSpacing: 0.3,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

// ─── Social button with a Material icon ────────────────────────────────
class _SocialButton extends StatelessWidget {
  final IconData icon;
  final double iconSize;
  final Color color;
  final VoidCallback onTap;

  const _SocialButton({
    required this.icon,
    required this.iconSize,
    required this.color,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        width: 48,
        height: 48,
        decoration: BoxDecoration(
          color: _kCardBg.withValues(alpha: 0.8),
          shape: BoxShape.circle,
          border: Border.all(
            color: _kAccentBlue.withValues(alpha: 0.2),
          ),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.15),
              blurRadius: 10,
              offset: const Offset(0, 3),
            ),
          ],
        ),
        child: Center(
          child: Icon(icon, color: color, size: iconSize * 0.8),
        ),
      ),
    );
  }
}

// ─── Social button with a PNG image asset ──────────────────────────────
class _SocialButtonImage extends StatelessWidget {
  final String assetPath;
  final double size;
  final VoidCallback onTap;

  const _SocialButtonImage({
    required this.assetPath,
    required this.size,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        width: 48,
        height: 48,
        decoration: BoxDecoration(
          color: _kCardBg.withValues(alpha: 0.8),
          shape: BoxShape.circle,
          border: Border.all(
            color: _kAccentBlue.withValues(alpha: 0.2),
          ),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.15),
              blurRadius: 10,
              offset: const Offset(0, 3),
            ),
          ],
        ),
        child: Center(
          child: Image.asset(
            assetPath,
            width: size * 0.96,
            height: size * 0.96,
            fit: BoxFit.contain,
          ),
        ),
      ),
    );
  }
}

// ─── Policy link ───────────────────────────────────────────────────────
class _PolicyLink extends StatelessWidget {
  final String label;
  final VoidCallback onTap;

  const _PolicyLink({required this.label, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Text(
        label,
        style: TextStyle(
          fontSize: 13,
          color: _kAccentBlue.withValues(alpha: 0.8),
          fontWeight: FontWeight.w500,
        ),
      ),
    );
  }
}

// ─── Language chip ─────────────────────────────────────────────────────
class _LangChip extends StatelessWidget {
  final String label;
  final bool isSelected;
  final VoidCallback onTap;

  const _LangChip({
    required this.label,
    required this.isSelected,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 250),
        curve: Curves.easeInOut,
        width: 40,
        height: 36,
        decoration: BoxDecoration(
          color: isSelected
              ? _kPrimaryBlue
              : Colors.white.withValues(alpha: 0.1),
          borderRadius: BorderRadius.circular(8),
          border: Border.all(
            color: isSelected
                ? _kAccentBlue
                : Colors.white.withValues(alpha: 0.2),
            width: isSelected ? 1.5 : 1,
          ),
        ),
        child: Center(
          child: Text(
            label,
            style: TextStyle(
              fontSize: 12,
              fontWeight: isSelected ? FontWeight.w600 : FontWeight.w400,
              color: isSelected
                  ? Colors.white
                  : Colors.white.withValues(alpha: 0.7),
            ),
          ),
        ),
      ),
    );
  }
}
