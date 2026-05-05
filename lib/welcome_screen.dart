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
          // --- Background gradient ---
          Container(
            color: const Color(0xFF093827),
          ),

          // --- Decorative circles ---
          Positioned(
            top: -40,
            right: -30,
            child: Container(
              width: 180,
              height: 180,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: Colors.white.withValues(alpha: 0.04),
              ),
            ),
          ),
          Positioned(
            top: 100,
            right: 50,
            child: Container(
              width: 90,
              height: 90,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: Colors.white.withValues(alpha: 0.03),
              ),
            ),
          ),
          Positioned(
            top: 40,
            left: -50,
            child: Container(
              width: 140,
              height: 140,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: Colors.white.withValues(alpha: 0.025),
              ),
            ),
          ),

          // --- Content ---
          Column(
            children: [
              // --- Hero header ---
              SizedBox(
                height: screenHeight * 0.40,
                child: Padding(
                  padding: EdgeInsets.only(
                    top: topPadding + 40,
                    left: 20,
                    right: 32,
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // App logo — pin with magnifying glass
                      Image.asset(
                        'assets/welcome/app_logo.png',
                        width: 128,
                        height: 128,
                      ),
                      const SizedBox(height: 16),
                      Text(
                        'Merhaba',
                        style: GoogleFonts.plusJakartaSans(
                          fontSize: 38,
                          fontWeight: FontWeight.w300,
                          color: Colors.white,
                          letterSpacing: -0.3,
                          height: 1.1,
                        ),
                      ),
                      const SizedBox(height: 6),
                      Text(
                        "AramaBul'a hoşgeldiniz!",
                        style: GoogleFonts.plusJakartaSans(
                          fontSize: 15,
                          fontWeight: FontWeight.w300,
                          color: Colors.white70,
                          height: 1.4,
                        ),
                      ),
                    ],
                  ),
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
                              onTap: () => onContinue('register'),
                            ),
                            const SizedBox(width: 20),
                            // Facebook
                            _SocialButton(
                              icon: Icons.facebook_rounded,
                              iconSize: 28,
                              color: const Color(0xFF1877F2),
                              onTap: () => onContinue('register'),
                            ),
                            const SizedBox(width: 20),
                            // Apple
                            _SocialButton(
                              icon: Icons.apple_rounded,
                              iconSize: 30,
                              color: const Color(0xFF000000),
                              onTap: () => onContinue('register'),
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

                        const SizedBox(height: 32),

                        // --- Policy text ---
                        Text(
                          'Devam ederek Gizlilik Politikası ve\nKullanım Koşullarını kabul etmiş olursunuz.',
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
                              label: 'Gizlilik Politikası',
                              onTap: () => onContinue('privacy'),
                            ),
                            Padding(
                              padding: const EdgeInsets.symmetric(horizontal: 12),
                              child: Text(
                                '·',
                                style: TextStyle(
                                  fontSize: 14,
                                  color: const Color(0xFF162123).withValues(alpha: 0.2),
                                ),
                              ),
                            ),
                            _PolicyLink(
                              label: 'Kullanım Koşulları',
                              onTap: () => onContinue('terms'),
                            ),
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
