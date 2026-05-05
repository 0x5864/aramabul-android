import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

/// AramaBul Welcome / Onboarding screen.
///
/// Inspired by modern app login screens with a colored hero header
/// and a white/cream card section below.
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
            decoration: const BoxDecoration(
              gradient: LinearGradient(
                begin: Alignment.topCenter,
                end: Alignment.bottomCenter,
                colors: [Color(0xFF1A4A3A), Color(0xFF1F6F54)],
              ),
            ),
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
                color: Colors.white.withValues(alpha: 0.06),
              ),
            ),
          ),
          Positioned(
            top: 80,
            right: 40,
            child: Container(
              width: 100,
              height: 100,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: Colors.white.withValues(alpha: 0.04),
              ),
            ),
          ),
          Positioned(
            top: 30,
            left: -50,
            child: Container(
              width: 140,
              height: 140,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: Colors.white.withValues(alpha: 0.03),
              ),
            ),
          ),

          // --- Content ---
          Column(
            children: [
              // --- Hero header ---
              SizedBox(
                height: screenHeight * 0.38,
                child: Padding(
                  padding: EdgeInsets.only(
                    top: topPadding + 32,
                    left: 32,
                    right: 32,
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Logo icon
                      Container(
                        width: 64,
                        height: 64,
                        decoration: BoxDecoration(
                          color: Colors.white.withValues(alpha: 0.15),
                          borderRadius: BorderRadius.circular(18),
                        ),
                        child: const Center(
                          child: Icon(
                            Icons.location_on_rounded,
                            size: 36,
                            color: Color(0xFFFF6B56),
                          ),
                        ),
                      ),
                      const SizedBox(height: 24),
                      const Text(
                        'Merhaba!',
                        style: TextStyle(
                          fontFamily: 'Inter',
                          fontSize: 36,
                          fontWeight: FontWeight.w800,
                          color: Colors.white,
                          letterSpacing: -0.5,
                          height: 1.1,
                        ),
                      ),
                      const SizedBox(height: 8),
                      Text(
                        'AramaBul ile yakınındaki mekanları\nkeşfet, favorilerini kaydet.',
                        style: TextStyle(
                          fontSize: 15,
                          fontWeight: FontWeight.w400,
                          color: Colors.white.withValues(alpha: 0.75),
                          height: 1.5,
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
                        const Text(
                          'Başlamak için bir yöntem seçin',
                          style: TextStyle(
                            fontSize: 18,
                            fontWeight: FontWeight.w700,
                            color: Color(0xFF162123),
                          ),
                        ),
                        const SizedBox(height: 24),

                        // --- Login button ---
                        _ActionButton(
                          label: 'Giriş Yap',
                          icon: Icons.login_rounded,
                          gradient: const [
                            Color(0xFF1F6F54),
                            Color(0xFF2A9070),
                          ],
                          onTap: () => onContinue('login'),
                        ),
                        const SizedBox(height: 14),

                        // --- Register button ---
                        _ActionButton(
                          label: 'Hesap Oluştur',
                          icon: Icons.person_add_alt_1_rounded,
                          gradient: const [
                            Color(0xFF20364D),
                            Color(0xFF2C4E6E),
                          ],
                          onTap: () => onContinue('register'),
                        ),
                        const SizedBox(height: 14),

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
                        const SizedBox(height: 14),

                        // --- Guest button ---
                        OutlinedButton.icon(
                          onPressed: () => onContinue(null),
                          icon: const Icon(Icons.explore_rounded, size: 20),
                          label: const Text(
                            'Misafir olarak devam et',
                            style: TextStyle(
                              fontSize: 15,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                          style: OutlinedButton.styleFrom(
                            foregroundColor: const Color(0xFF162123),
                            minimumSize: const Size(double.infinity, 52),
                            side: const BorderSide(color: Color(0xFFB8C8DC)),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(14),
                            ),
                          ),
                        ),

                        const SizedBox(height: 32),

                        // --- Policy text ---
                        Text(
                          'Devam ederek Gizlilik Politikası ve\nKullanım Koşullarını kabul etmiş olursunuz.',
                          textAlign: TextAlign.center,
                          style: TextStyle(
                            fontSize: 12,
                            color: const Color(0xFF162123).withValues(alpha: 0.45),
                            height: 1.5,
                          ),
                        ),
                        const SizedBox(height: 10),
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
                                  color: const Color(0xFF162123).withValues(alpha: 0.25),
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
                color: gradient.first.withValues(alpha: 0.3),
                blurRadius: 12,
                offset: const Offset(0, 4),
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
                  fontSize: 15,
                  fontWeight: FontWeight.w600,
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
          color: Color(0xFF1EA7FF),
          fontWeight: FontWeight.w500,
        ),
      ),
    );
  }
}
