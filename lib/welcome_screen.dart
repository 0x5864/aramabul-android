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
    'policy': 'Devam ederek Gizlilik Politikası ve\nKullanım Koşullarını kabul etmiş olursunuz.',
    'privacy': 'Gizlilik Politikası',
    'terms': 'Kullanım Koşulları',
  },
  'EN': {
    'hello': 'Hello',
    'subtitle': 'Welcome to AramaBul!',
    'login': 'Sign In',
    'or': 'or',
    'signup_with': 'sign up with',
    'no_account': "Don't have an account? ",
    'create_account': 'Create Account',
    'policy': 'By continuing, you agree to our Privacy Policy\nand Terms of Service.',
    'privacy': 'Privacy Policy',
    'terms': 'Terms of Service',
  },
  'DE': {
    'hello': 'Hallo',
    'subtitle': 'Willkommen bei AramaBul!',
    'login': 'Anmelden',
    'or': 'oder',
    'signup_with': 'registrieren mit',
    'no_account': 'Kein Konto? ',
    'create_account': 'Konto erstellen',
    'policy': 'Durch Fortfahren akzeptieren Sie unsere\nDatenschutzrichtlinie und Nutzungsbedingungen.',
    'privacy': 'Datenschutzrichtlinie',
    'terms': 'Nutzungsbedingungen',
  },
  'RU': {
    'hello': 'Привет',
    'subtitle': 'Добро пожаловать в AramaBul!',
    'login': 'Войти',
    'or': 'или',
    'signup_with': 'зарегистрироваться через',
    'no_account': 'Нет аккаунта? ',
    'create_account': 'Создать аккаунт',
    'policy': 'Продолжая, вы принимаете Политику\nконфиденциальности и Условия использования.',
    'privacy': 'Политика конфиденциальности',
    'terms': 'Условия использования',
  },
};

/// AramaBul Welcome / Onboarding screen.
class WelcomeScreen extends StatefulWidget {
  final void Function(String? route) onContinue;

  const WelcomeScreen({super.key, required this.onContinue});

  @override
  State<WelcomeScreen> createState() => _WelcomeScreenState();
}

class _WelcomeScreenState extends State<WelcomeScreen> {
  String _selectedLang = 'TR';

  Map<String, String> get _t => _welcomeStrings[_selectedLang] ?? _welcomeStrings['TR']!;

  void _selectLang(String lang) {
    setState(() => _selectedLang = lang);
    widget.onContinue('lang_${lang.toLowerCase()}');
  }

  @override
  Widget build(BuildContext context) {
    SystemChrome.setSystemUIOverlayStyle(const SystemUiOverlayStyle(
      statusBarColor: Colors.transparent,
      statusBarIconBrightness: Brightness.light,
    ));

    final screenHeight = MediaQuery.of(context).size.height;
    final topPadding = MediaQuery.of(context).padding.top;

    return Scaffold(
      body: Stack(
        children: [
          // --- Background ---
          Container(
            color: const Color(0xFF729875),
          ),

          // --- Content ---
          Column(
            children: [
              // --- Hero header with forest background ---
              SizedBox(
                height: screenHeight * 0.32,
                child: Stack(
                  fit: StackFit.expand,
                  children: [
                    // Forest background image
                    ClipRRect(
                      child: Image.asset(
                        'assets/welcome/forest.jpg',
                        fit: BoxFit.cover,
                      ),
                    ),
                    // Dark overlay for text readability
                    Container(
                      decoration: BoxDecoration(
                        gradient: LinearGradient(
                          begin: Alignment.topCenter,
                          end: Alignment.bottomCenter,
                          colors: [
                            const Color(0xFF729875).withValues(alpha: 0.5),
                            const Color(0xFF729875).withValues(alpha: 0.85),
                          ],
                        ),
                      ),
                    ),
                    // Text content
                    Padding(
                      padding: EdgeInsets.only(
                        top: topPadding + 24,
                        left: 24,
                        right: 32,
                        bottom: 24,
                      ),
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.end,
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            _t['hello']!,
                            style: GoogleFonts.plusJakartaSans(
                              fontSize: 34,
                              fontWeight: FontWeight.w300,
                              color: Colors.white,
                              letterSpacing: -0.3,
                              height: 1.1,
                            ),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            _t['subtitle']!,
                            style: GoogleFonts.plusJakartaSans(
                              fontSize: 14,
                              fontWeight: FontWeight.w300,
                              color: Colors.white70,
                              height: 1.4,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),

              // --- Cream card ---
              Expanded(
                child: Container(
                  width: double.infinity,
                  decoration: const BoxDecoration(
                    color: Color(0xFF729875),
                    borderRadius: BorderRadius.only(
                      topLeft: Radius.circular(32),
                      topRight: Radius.circular(32),
                    ),
                  ),
                  child: SingleChildScrollView(
                    padding: const EdgeInsets.fromLTRB(28, 36, 28, 24),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.stretch,
                      children: [
                        // --- Login button ---
                        _ActionButton(
                          label: _t['login']!,
                          icon: Icons.login_rounded,
                          gradient: const [
                            Color(0xFF729875),
                            Color(0xFF425921),
                          ],
                          onTap: () => widget.onContinue('login'),
                        ),
                        const SizedBox(height: 24),

                        // --- Divider ---
                        Row(
                          children: [
                            Expanded(
                              child: Container(
                                height: 1,
                                color: const Color(0xFFB8C8DC).withValues(alpha: 0.5),
                              ),
                            ),
                            Padding(
                              padding: const EdgeInsets.symmetric(horizontal: 16),
                              child: Text(
                                _t['or']!,
                                style: TextStyle(
                                  fontSize: 13,
                                  color: const Color(0xFF162123).withValues(alpha: 0.4),
                                ),
                              ),
                            ),
                            Expanded(
                              child: Container(
                                height: 1,
                                color: const Color(0xFFB8C8DC).withValues(alpha: 0.5),
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 20),

                        // --- Social login icons ---
                        Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            // Google — using G.png
                            _SocialButtonImage(
                              assetPath: 'assets/welcome/google_g.png',
                              size: 26,
                              onTap: () => widget.onContinue('google_signin'),
                            ),
                          ],
                        ),
                        const SizedBox(height: 8),
                        Text(
                          _t['signup_with']!,
                          textAlign: TextAlign.center,
                          style: TextStyle(
                            fontSize: 13,
                            color: const Color(0xFF162123).withValues(alpha: 0.4),
                          ),
                        ),

                        const SizedBox(height: 24),

                        // --- Register link ---
                        Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Text(
                              _t['no_account']!,
                              style: TextStyle(
                                fontSize: 14,
                                color: const Color(0xFF162123).withValues(alpha: 0.5),
                              ),
                            ),
                            GestureDetector(
                              onTap: () => widget.onContinue('register'),
                              child: Text(
                                _t['create_account']!,
                                style: const TextStyle(
                                  fontSize: 14,
                                  fontWeight: FontWeight.w500,
                                  color: Color(0xFF425921),
                                ),
                              ),
                            ),
                          ],
                        ),

                        const SizedBox(height: 24),

                        // --- Policy text ---
                        Text(
                          _t['policy']!,
                          textAlign: TextAlign.center,
                          style: TextStyle(
                            fontSize: 12,
                            color: const Color(0xFF162123).withValues(alpha: 0.4),
                            height: 1.5,
                          ),
                        ),
                        const SizedBox(height: 8),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            _PolicyLink(
                              label: _t['privacy']!,
                              onTap: () => widget.onContinue('privacy'),
                            ),
                            Padding(
                              padding: const EdgeInsets.symmetric(horizontal: 12),
                              child: Text(
                                '\u00b7',
                                style: TextStyle(
                                  fontSize: 14,
                                  color: const Color(0xFF162123).withValues(alpha: 0.2),
                                ),
                              ),
                            ),
                            _PolicyLink(
                              label: _t['terms']!,
                              onTap: () => widget.onContinue('terms'),
                            ),
                          ],
                        ),

                        const SizedBox(height: 20),

                        // --- Language selector (bottom) ---
                        Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            _LangChip(label: 'TR', isSelected: _selectedLang == 'TR', onTap: () => _selectLang('TR')),
                            const SizedBox(width: 4),
                            _LangChip(label: 'EN', isSelected: _selectedLang == 'EN', onTap: () => _selectLang('EN')),
                            const SizedBox(width: 4),
                            _LangChip(label: 'DE', isSelected: _selectedLang == 'DE', onTap: () => _selectLang('DE')),
                            const SizedBox(width: 4),
                            _LangChip(label: 'RU', isSelected: _selectedLang == 'RU', onTap: () => _selectLang('RU')),
                          ],
                        ),
                      ],
                    ),
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

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
    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(14),
        child: Ink(
          height: 54,
          decoration: BoxDecoration(
            gradient: LinearGradient(
              begin: Alignment.centerLeft,
              end: Alignment.centerRight,
              colors: gradient,
            ),
            borderRadius: BorderRadius.circular(14),
            boxShadow: [
              BoxShadow(
                color: gradient.first.withValues(alpha: 0.35),
                blurRadius: 14,
                offset: const Offset(0, 5),
              ),
            ],
          ),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(icon, color: Colors.white, size: 20),
              const SizedBox(width: 10),
              Text(
                label,
                style: const TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.w400,
                  color: Colors.white,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

/// Social button with a Material icon.
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
        width: 60,
        height: 60,
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(
            color: const Color(0xFFB8C8DC).withValues(alpha: 0.5),
          ),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.05),
              blurRadius: 8,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: Center(
          child: Icon(icon, color: color, size: iconSize),
        ),
      ),
    );
  }
}

/// Social button with a PNG image asset.
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
        width: 60,
        height: 60,
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(
            color: const Color(0xFFB8C8DC).withValues(alpha: 0.5),
          ),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.05),
              blurRadius: 8,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: Center(
          child: Image.asset(
            assetPath,
            width: size,
            height: size,
            fit: BoxFit.contain,
          ),
        ),
      ),
    );
  }
}

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
        style: const TextStyle(
          fontSize: 13,
          color: Color(0xFF425921),
          fontWeight: FontWeight.w500,
        ),
      ),
    );
  }
}

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
      child: Container(
        width: 40,
        height: 40,
        decoration: BoxDecoration(
          color: isSelected ? const Color(0xFF425921) : Colors.white,
          borderRadius: BorderRadius.circular(6),
          border: Border.all(
            color: isSelected
                ? const Color(0xFF425921)
                : const Color(0xFFB8C8DC).withValues(alpha: 0.6),
          ),
        ),
        child: Center(
          child: Text(
            label,
            style: TextStyle(
              fontSize: 13,
              fontWeight: FontWeight.w400,
              color: isSelected ? Colors.white : const Color(0xFF162123),
            ),
          ),
        ),
      ),
    );
  }
}
