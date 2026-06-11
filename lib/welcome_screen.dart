
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:google_fonts/google_fonts.dart';

/// Localized strings for the welcome screen.
const Map<String, Map<String, String>> _welcomeStrings = {
  'TR': {
    'hello': 'Merhaba',
    'subtitle': "AramaBul'a hoşgeldiniz!",
    'login': 'Giriş Yap',
    'policy':
        'Devam ederek Gizlilik Politikası ve\nKullanım Koşullarını kabul etmiş olursunuz.',
    'privacy': 'Gizlilik Politikası',
    'terms': 'Kullanım Koşulları',
  },
  'EN': {
    'hello': 'Hello',
    'subtitle': 'Welcome to AramaBul!',
    'login': 'Sign In',
    'policy':
        'By continuing, you agree to our Privacy Policy\nand Terms of Service.',
    'privacy': 'Privacy Policy',
    'terms': 'Terms of Service',
  },
  'DE': {
    'hello': 'Hallo',
    'subtitle': 'Willkommen bei AramaBul!',
    'login': 'Anmelden',
    'policy':
        'Durch Fortfahren akzeptieren Sie unsere\nDatenschutzrichtlinie und Nutzungsbedingungen.',
    'privacy': 'Datenschutzrichtlinie',
    'terms': 'Nutzungsbedingungen',
  },
  'RU': {
    'hello': 'Привет',
    'subtitle': 'Добро пожаловать в AramaBul!',
    'login': 'Войти',
    'policy':
        'Продолжая, вы принимаете Политику\nконфиденциальности и Условия использования.',
    'privacy': 'Политика конфиденциальности',
    'terms': 'Условия использования',
  },
};

// ─── Warm color palette ────────────────────────────────────────────────
const _kPrimaryBlue = Color(0xFF8A5C3B);
const _kDeepBlue = Color(0xFF4B3528);
const _kAccentBlue = Color(0xFFB08968);
const _kLightBlue = Color(0xFFF4E8D8);

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
              'assets/welcome/coffee.jpeg',
              fit: BoxFit.cover,
              color: const Color(0xFF5A3C2B).withValues(alpha: 0.18),
              colorBlendMode: BlendMode.darken,
            ),
          ),

          // ── Warm overlay ──
          Positioned.fill(
            child: DecoratedBox(
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  begin: Alignment.topCenter,
                  end: Alignment.bottomCenter,
                  stops: const [0.0, 0.25, 0.5, 1.0],
                  colors: [
                    const Color(0xFF3B281F).withValues(alpha: 0.10),
                    const Color(0xFF3B281F).withValues(alpha: 0.18),
                    const Color(0xFF2F241E).withValues(alpha: 0.42),
                    const Color(0xFF2F241E).withValues(alpha: 0.84),
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
                    SizedBox(height: MediaQuery.of(context).size.height * 0.20),
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
                                color: const Color(0xFFF7F1E6),
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
                                color: _kLightBlue.withValues(alpha: 0.92),
                                height: 1.4,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),

                    const Spacer(),

                    // ── Main action only ──
                    Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 28),
                      child: Center(
                        child: _ActionButton(
                          label: _t['login']!,
                          icon: Icons.login_rounded,
                          gradient: const [_kPrimaryBlue, _kDeepBlue],
                          onTap: () => widget.onContinue('login'),
                        ),
                      ),
                    ),
                    const SizedBox(height: 22),

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

  const _ActionButton({
    required this.label,
    required this.icon,
    required this.gradient,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final radius = BorderRadius.circular(999);

    return ClipRRect(
      borderRadius: radius,
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          onTap: onTap,
          borderRadius: radius,
          child: Ink(
            height: 56,
            padding: const EdgeInsets.symmetric(horizontal: 18),
            decoration: BoxDecoration(
              gradient: LinearGradient(
                begin: Alignment.topCenter,
                end: Alignment.bottomCenter,
                colors: gradient,
              ),
              borderRadius: radius,
              boxShadow: [
                BoxShadow(
                  color: Colors.white.withValues(alpha: 0.12),
                  blurRadius: 12,
                  offset: const Offset(-1, -2),
                ),
                BoxShadow(
                  color: _kPrimaryBlue.withValues(alpha: 0.44),
                  blurRadius: 24,
                  offset: const Offset(0, 12),
                ),
                BoxShadow(
                  color: _kDeepBlue.withValues(alpha: 0.26),
                  blurRadius: 12,
                  offset: const Offset(0, 4),
                ),
              ],
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(icon, color: Colors.white, size: 20),
                const SizedBox(width: 8),
                Text(
                  label,
                  style: const TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.w600,
                    color: Colors.white,
                    letterSpacing: 0.3,
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
