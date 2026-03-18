import 'package:animated_text_kit/animated_text_kit.dart';
import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';

import '../../config/theme/app_colors.dart';

/// Animated Splash Screen with liquid/expressive animations
/// Features modern Material 3 design with catchy animations
class SplashScreen extends StatefulWidget {
  const SplashScreen({super.key});

  @override
  State<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen> with TickerProviderStateMixin {
  late AnimationController _liquidController;
  late AnimationController _iconController;
  late Animation<double> _liquidAnimation;
  late Animation<double> _scaleAnimation;

  @override
  void initState() {
    super.initState();

    // Liquid background animation controller
    _liquidController = AnimationController(vsync: this, duration: const Duration(seconds: 3));

    // Icon animation controller
    _iconController = AnimationController(vsync: this, duration: const Duration(milliseconds: 1500));

    // Liquid wave animation
    _liquidAnimation = Tween<double>(
      begin: 0,
      end: 1,
    ).animate(CurvedAnimation(parent: _liquidController, curve: Curves.easeInOutCubic));

    // Icon scale animation
    _scaleAnimation = Tween<double>(begin: 0, end: 1).animate(CurvedAnimation(parent: _iconController, curve: Curves.elasticOut));

    // Start animations
    _liquidController.repeat(reverse: true);
    _iconController.forward();

    // Navigate to home after splash duration
    Future.delayed(const Duration(seconds: 4), () {
      if (mounted) {
        // TODO: Navigate to home screen
        // Navigator.pushReplacement(context, MaterialPageRoute(builder: (_) => HomeScreen()));
      }
    });
  }

  @override
  void dispose() {
    _liquidController.dispose();
    _iconController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final size = MediaQuery.of(context).size;

    return Scaffold(
      body: Stack(
        children: [
          // Animated Gradient Background
          AnimatedBuilder(
            animation: _liquidAnimation,
            builder: (context, child) {
              return Container(
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                    colors: [
                      Color.lerp(AppColors.primary, AppColors.primaryLight, _liquidAnimation.value)!,
                      Color.lerp(AppColors.secondary, AppColors.secondaryLight, _liquidAnimation.value)!,
                      Color.lerp(AppColors.tertiary, AppColors.tertiaryLight, _liquidAnimation.value)!,
                    ],
                  ),
                ),
              );
            },
          ),

          // Liquid Blob Animations
          Positioned(
            top: size.height * 0.1,
            right: -50,
            child: _buildLiquidBlob(size: 200, delay: 0, color: Colors.white.withValues(alpha: 0.1)),
          ),
          Positioned(
            bottom: size.height * 0.2,
            left: -30,
            child: _buildLiquidBlob(size: 150, delay: 500, color: Colors.white.withValues(alpha: 0.08)),
          ),
          Positioned(
            top: size.height * 0.4,
            left: size.width * 0.7,
            child: _buildLiquidBlob(size: 120, delay: 1000, color: Colors.white.withValues(alpha: 0.12)),
          ),

          // Main Content
          Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                // Animated Shopping Bag Icon
                AnimatedBuilder(
                      animation: _scaleAnimation,
                      builder: (context, child) {
                        return Transform.scale(
                          scale: _scaleAnimation.value,
                          child: Container(
                            width: 120,
                            height: 120,
                            decoration: BoxDecoration(
                              color: Colors.white,
                              borderRadius: BorderRadius.circular(30),
                              boxShadow: [
                                BoxShadow(color: Colors.black.withValues(alpha: 0.2), blurRadius: 30, offset: const Offset(0, 10)),
                              ],
                            ),
                            child: const Icon(Icons.shopping_bag_rounded, size: 60, color: AppColors.primary),
                          ),
                        );
                      },
                    )
                    .animate(delay: 300.ms)
                    .shimmer(duration: 1500.ms, color: Colors.white.withValues(alpha: 0.5))
                    .shake(duration: 500.ms, delay: 800.ms),

                const SizedBox(height: 40),

                // App Name with Animated Text
                DefaultTextStyle(
                  style: const TextStyle(fontSize: 36, fontWeight: FontWeight.bold, color: Colors.white, letterSpacing: 2),
                  child: AnimatedTextKit(
                    animatedTexts: [TypewriterAnimatedText('Shopzy', speed: const Duration(milliseconds: 150))],
                    totalRepeatCount: 1,
                  ),
                ).animate(delay: 1000.ms).fadeIn(duration: 600.ms).slideY(begin: 0.3, end: 0),

                const SizedBox(height: 16),

                // Tagline
                const Text(
                  'Your Shopping Companion',
                  style: TextStyle(fontSize: 16, color: Colors.white, letterSpacing: 1.5, fontWeight: FontWeight.w300),
                ).animate(delay: 1500.ms).fadeIn(duration: 600.ms).slideY(begin: 0.3, end: 0),

                const SizedBox(height: 60),

                // Loading Indicator
                SizedBox(
                  width: 200,
                  child: TweenAnimationBuilder<double>(
                    tween: Tween(begin: 0.0, end: 1.0),
                    duration: const Duration(seconds: 3),
                    builder: (context, value, child) {
                      return Column(
                        children: [
                          LinearProgressIndicator(
                            value: value,
                            backgroundColor: Colors.white.withValues(alpha: 0.3),
                            valueColor: const AlwaysStoppedAnimation<Color>(Colors.white),
                            borderRadius: BorderRadius.circular(10),
                            minHeight: 4,
                          ),
                          const SizedBox(height: 12),
                          Text(
                            '${(value * 100).toInt()}%',
                            style: const TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.w500),
                          ),
                        ],
                      );
                    },
                  ),
                ).animate(delay: 2000.ms).fadeIn(duration: 400.ms),
              ],
            ),
          ),

          // Bottom Branding
          Positioned(
            bottom: 40,
            left: 0,
            right: 0,
            child: const Text(
              'Made with Flutter',
              textAlign: TextAlign.center,
              style: TextStyle(color: Colors.white70, fontSize: 12, letterSpacing: 1),
            ).animate(delay: 2500.ms).fadeIn(duration: 600.ms),
          ),
        ],
      ),
    );
  }

  /// Build liquid blob animation widget
  Widget _buildLiquidBlob({required double size, required int delay, required Color color}) {
    return Container(
          width: size,
          height: size,
          decoration: BoxDecoration(color: color, shape: BoxShape.circle),
        )
        .animate(onPlay: (controller) => controller.repeat(reverse: true))
        .scale(
          duration: 3000.ms,
          delay: delay.ms,
          begin: const Offset(0.8, 0.8),
          end: const Offset(1.2, 1.2),
          curve: Curves.easeInOut,
        )
        .then()
        .shimmer(duration: 2000.ms, color: Colors.white.withValues(alpha: 0.1));
  }
}
