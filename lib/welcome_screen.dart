import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:google_fonts/google_fonts.dart';

/// AramaBul Welcome / Onboarding screen.
class WelcomeScreen extends StatelessWidget {
  final void Function(String? route) onContinue;

  const WelcomeScreen({super.key, required this.onContinue});

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
            color: const Color(0xFF093827),
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
                            const Color(0xFF093827).withValues(alpha: 0.5),
                            const Color(0xFF093827).withValues(alpha: 0.85),
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
                            'Merhaba',
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
                            "AramaBul'a ho\u015fgeldiniz!",
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
                    color: Color(0xFFFFFAED),
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
                          label: 'Giriş Yap',
                          icon: Icons.login_rounded,
                          gradient: const [
                            Color(0xFF093827),
                            Color(0xFF13690C),
                          ],
                          onTap: () => onContinue('login'),
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
                                'veya',
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
                              onTap: () => onContinue('google_signin'),
                            ),
                            const SizedBox(width: 20),
                            // Apple
                            _SocialButton(
                              icon: Icons.apple_rounded,
                              iconSize: 30,
                              color: const Color(0xFF000000),
                              onTap: () => onContinue('apple_signin'),
                            ),
                          ],
                        ),
                        const SizedBox(height: 8),
                        Text(
                          'ile kaydol',
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
                              'Hesabın yok mu? ',
                              style: TextStyle(
                                fontSize: 14,
                                color: const Color(0xFF162123).withValues(alpha: 0.5),
                              ),
                            ),
                            GestureDetector(
                              onTap: () => onContinue('register'),
                              child: const Text(
                                'Hesap Oluştur',
                                style: TextStyle(
                                  fontSize: 14,
                                  fontWeight: FontWeight.w500,
                                  color: Color(0xFF13690C),
                                ),
                              ),
                            ),
                          ],
                        ),

                        const SizedBox(height: 24),

                        // --- Policy text ---
                        Text(
                          'Devam ederek Gizlilik Politikası ve\nKullan\u0131m Ko\u015fullar\u0131n\u0131 kabul etmi\u015f olursunuz.',
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
                              label: 'Gizlilik Politikas\u0131',
                              onTap: () => onContinue('privacy'),
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
                              label: 'Kullan\u0131m Ko\u015fullar\u0131',
                              onTap: () => onContinue('terms'),
                            ),
                          ],
                        ),

                        const SizedBox(height: 20),

                        // --- Language selector (bottom) ---
                        Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            _LangChip(label: 'TR', isSelected: true, onTap: () => onContinue('lang_tr')),
                            const SizedBox(width: 4),
                            _LangChip(label: 'EN', isSelected: false, onTap: () => onContinue('lang_en')),
                            const SizedBox(width: 4),
                            _LangChip(label: 'DE', isSelected: false, onTap: () => onContinue('lang_de')),
                            const SizedBox(width: 4),
                            _LangChip(label: 'RU', isSelected: false, onTap: () => onContinue('lang_ru')),
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
          color: Color(0xFF13690C),
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
          color: isSelected ? const Color(0xFF093827) : Colors.white,
          borderRadius: BorderRadius.circular(6),
          border: Border.all(
            color: isSelected
                ? const Color(0xFF093827)
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
