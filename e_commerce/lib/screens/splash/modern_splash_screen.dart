import 'dart:math';
import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:confetti/confetti.dart';
import 'package:auto_route/auto_route.dart';
import 'package:provider/provider.dart';
import '../../config/theme/app_colors.dart';
import '../../config/routes/app_router.dart';
import '../../providers/auth_provider.dart';

/// Ultra Modern Splash Screen with Advanced Animations
/// Features particle effects, 3D transforms, and stunning visuals
@RoutePage()
class ModernSplashScreen extends StatefulWidget {
  const ModernSplashScreen({super.key});

  @override
  State<ModernSplashScreen> createState() => _ModernSplashScreenState();
}

class _ModernSplashScreenState extends State<ModernSplashScreen>
    with TickerProviderStateMixin {
  late AnimationController _mainController;
  late AnimationController _rotationController;
  late AnimationController _pulseController;
  late AnimationController _particleController;
  late ConfettiController _confettiController;

  late Animation<double> _scaleAnimation;
  late Animation<double> _rotationAnimation;
  late Animation<double> _pulseAnimation;

  final List<Particle> _particles = [];
  bool _showContent = false;

  @override
  void initState() {
    super.initState();

    // Main animation controller
    _mainController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 2000),
    );

    // Rotation controller
    _rotationController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 3000),
    );

    // Pulse controller
    _pulseController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1500),
    );

    // Particle controller
    _particleController = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 4),
    );

    // Confetti controller
    _confettiController = ConfettiController(
      duration: const Duration(seconds: 2),
    );

    // Scale animation with elastic effect
    _scaleAnimation = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(
        parent: _mainController,
        curve: Curves.elasticOut,
      ),
    );

    // Rotation animation
    _rotationAnimation = Tween<double>(begin: 0.0, end: 2 * pi).animate(
      CurvedAnimation(
        parent: _rotationController,
        curve: Curves.linear,
      ),
    );

    // Pulse animation
    _pulseAnimation = Tween<double>(begin: 1.0, end: 1.2).animate(
      CurvedAnimation(
        parent: _pulseController,
        curve: Curves.easeInOut,
      ),
    );

    // Initialize particles
    _initializeParticles();

    // Start animations and navigate
    _startAnimations();
    _navigateAfterSplash();
  }

  void _navigateAfterSplash() async {
    // Wait for splash animation to complete
    await Future.delayed(const Duration(seconds: 4));

    if (!mounted) return;

    final auth = context.read<AuthProvider>();

    // Wait for auth initialization if not yet done
    if (!auth.initialized) {
      await Future.doWhile(() async {
        await Future.delayed(const Duration(milliseconds: 100));
        return !auth.initialized && mounted;
      });
    }

    if (!mounted) return;

    if (auth.isLoggedIn) {
      context.router.replace(const HomeRoute());
    } else {
      context.router.replace(const SignInRoute());
    }
  }

  void _initializeParticles() {
    final random = Random();
    for (int i = 0; i < 30; i++) {
      _particles.add(
        Particle(
          x: random.nextDouble(),
          y: random.nextDouble(),
          size: random.nextDouble() * 4 + 2,
          speed: random.nextDouble() * 0.5 + 0.2,
          color: [
            AppColors.primary,
            AppColors.secondary,
            AppColors.tertiary,
            Colors.white,
          ][random.nextInt(4)].withValues(alpha: 0.6),
        ),
      );
    }
  }

  void _startAnimations() async {
    // Start main animation
    await Future.delayed(const Duration(milliseconds: 300));
    _mainController.forward();

    // Show content after initial animation
    await Future.delayed(const Duration(milliseconds: 800));
    setState(() => _showContent = true);

    // Start rotation
    _rotationController.repeat();

    // Start pulse
    _pulseController.repeat(reverse: true);

    // Start particles
    _particleController.repeat();

    // Start confetti after a delay
    await Future.delayed(const Duration(milliseconds: 1500));
    _confettiController.play();
  }

  @override
  void dispose() {
    _mainController.dispose();
    _rotationController.dispose();
    _pulseController.dispose();
    _particleController.dispose();
    _confettiController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final size = MediaQuery.of(context).size;

    return Scaffold(
      body: Stack(
        children: [
          // Animated Gradient Background - Flipkart Style
          AnimatedContainer(
            duration: const Duration(seconds: 3),
            decoration: BoxDecoration(
              gradient: LinearGradient(
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
                colors: [
                  AppColors.primary,
                  AppColors.primaryLight,
                  AppColors.secondary,
                  AppColors.primaryDark,
                ],
                stops: const [0.0, 0.3, 0.7, 1.0],
              ),
            ),
          )
              .animate(onPlay: (controller) => controller.repeat(reverse: true))
              .shimmer(
                duration: 3000.ms,
                color: Colors.white.withValues(alpha: 0.3),
              ),

          // Particle System
          AnimatedBuilder(
            animation: _particleController,
            builder: (context, child) {
              return CustomPaint(
                size: size,
                painter: ParticlePainter(
                  particles: _particles,
                  animation: _particleController.value,
                ),
              );
            },
          ),

          // Rotating Rings
          Center(
            child: AnimatedBuilder(
              animation: _rotationAnimation,
              builder: (context, child) {
                return Stack(
                  alignment: Alignment.center,
                  children: [
                    // Outer ring
                    Transform.rotate(
                      angle: _rotationAnimation.value,
                      child: Container(
                        width: 200,
                        height: 200,
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          border: Border.all(
                            color: Colors.white.withValues(alpha: 0.2),
                            width: 2,
                          ),
                        ),
                      ),
                    ),
                    // Middle ring
                    Transform.rotate(
                      angle: -_rotationAnimation.value * 1.5,
                      child: Container(
                        width: 150,
                        height: 150,
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          border: Border.all(
                            color: Colors.white.withValues(alpha: 0.3),
                            width: 2,
                          ),
                        ),
                      ),
                    ),
                    // Inner ring
                    Transform.rotate(
                      angle: _rotationAnimation.value * 2,
                      child: Container(
                        width: 100,
                        height: 100,
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          border: Border.all(
                            color: Colors.white.withValues(alpha: 0.4),
                            width: 2,
                          ),
                        ),
                      ),
                    ),
                  ],
                );
              },
            ),
          ),

          // Main Content
          Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                // 3D Shopping Icon
                AnimatedBuilder(
                  animation: Listenable.merge([_scaleAnimation, _pulseAnimation]),
                  builder: (context, child) {
                    return Transform.scale(
                      scale: _scaleAnimation.value * _pulseAnimation.value,
                      child: Transform(
                        transform: Matrix4.identity()
                          ..setEntry(3, 2, 0.001)
                          ..rotateX(_pulseAnimation.value * 0.1)
                          ..rotateY(_pulseAnimation.value * 0.1),
                        alignment: Alignment.center,
                        child: Container(
                          width: 140,
                          height: 140,
                          decoration: BoxDecoration(
                            gradient: LinearGradient(
                              begin: Alignment.topLeft,
                              end: Alignment.bottomRight,
                              colors: [
                                Colors.white,
                                Colors.white.withValues(alpha: 0.9),
                              ],
                            ),
                            borderRadius: BorderRadius.circular(35),
                            boxShadow: [
                              BoxShadow(
                                color: Colors.black.withValues(alpha: 0.3),
                                blurRadius: 40,
                                offset: const Offset(0, 20),
                              ),
                              BoxShadow(
                                color: AppColors.primary.withValues(alpha: 0.5),
                                blurRadius: 60,
                                offset: const Offset(0, 10),
                              ),
                            ],
                          ),
                          child: Stack(
                            alignment: Alignment.center,
                            children: [
                              // Icon with gradient
                              ShaderMask(
                                shaderCallback: (bounds) {
                                  return AppColors.primaryGradient.createShader(bounds);
                                },
                                child: const Icon(
                                  Icons.shopping_bag_rounded,
                                  size: 70,
                                  color: Colors.white,
                                ),
                              ),
                              // Shine effect
                              Positioned(
                                top: 20,
                                right: 20,
                                child: Container(
                                  width: 30,
                                  height: 30,
                                  decoration: BoxDecoration(
                                    shape: BoxShape.circle,
                                    color: Colors.white.withValues(alpha: 0.5),
                                  ),
                                )
                                    .animate(onPlay: (c) => c.repeat())
                                    .fade(duration: 2000.ms)
                                    .scale(duration: 2000.ms),
                              ),
                            ],
                          ),
                        ),
                      ),
                    );
                  },
                ),

                const SizedBox(height: 50),

                // App Name with Glitch Effect
                if (_showContent)
                  const Text(
                    'ShopHub',
                    style: TextStyle(
                      fontSize: 48,
                      fontWeight: FontWeight.bold,
                      color: Colors.white,
                      letterSpacing: 4,
                      shadows: [
                        Shadow(
                          color: Colors.black26,
                          offset: Offset(0, 4),
                          blurRadius: 8,
                        ),
                      ],
                    ),
                  )
                      .animate(delay: 200.ms)
                      .fadeIn(duration: 600.ms)
                      .slideY(begin: 0.3, end: 0)
                      .then()
                      .shimmer(
                        duration: 2000.ms,
                        color: Colors.white.withValues(alpha: 0.6),
                      ),

                const SizedBox(height: 12),

                // Tagline
                if (_showContent)
                  const Text(
                    'Premium Shopping Experience',
                    style: TextStyle(
                      fontSize: 16,
                      color: Colors.white,
                      letterSpacing: 2,
                      fontWeight: FontWeight.w300,
                    ),
                  )
                      .animate(delay: 400.ms)
                      .fadeIn(duration: 600.ms)
                      .slideY(begin: 0.3, end: 0),

                const SizedBox(height: 60),

                // Modern Loading Indicator
                if (_showContent)
                  SizedBox(
                    width: 60,
                    height: 60,
                    child: Stack(
                      alignment: Alignment.center,
                      children: [
                        // Spinning circles
                        ...List.generate(3, (index) {
                          return Transform.scale(
                            scale: 1.0 - (index * 0.3),
                            child: CircularProgressIndicator(
                              strokeWidth: 3,
                              valueColor: AlwaysStoppedAnimation<Color>(
                                Colors.white.withValues(alpha: 0.3 - index * 0.1),
                              ),
                            ),
                          )
                              .animate(
                                onPlay: (controller) => controller.repeat(),
                              )
                              .rotate(
                                duration: Duration(milliseconds: 2000 + index * 500),
                              );
                        }),
                      ],
                    ),
                  )
                      .animate(delay: 600.ms)
                      .fadeIn(duration: 400.ms),
              ],
            ),
          ),

          // Confetti Effect
          Align(
            alignment: Alignment.topCenter,
            child: ConfettiWidget(
              confettiController: _confettiController,
              blastDirection: pi / 2,
              maxBlastForce: 5,
              minBlastForce: 2,
              emissionFrequency: 0.05,
              numberOfParticles: 20,
              gravity: 0.3,
              colors: const [
                AppColors.primary,
                AppColors.secondary,
                AppColors.tertiary,
                Colors.white,
              ],
            ),
          ),

          // Bottom Gradient Overlay
          Positioned(
            bottom: 0,
            left: 0,
            right: 0,
            child: Container(
              height: 150,
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  begin: Alignment.bottomCenter,
                  end: Alignment.topCenter,
                  colors: [
                    Colors.black.withValues(alpha: 0.3),
                    Colors.transparent,
                  ],
                ),
              ),
            ),
          ),

          // Version Info
          if (_showContent)
            Positioned(
              bottom: 40,
              left: 0,
              right: 0,
              child: const Column(
                children: [
                  Text(
                    'v1.0.0',
                    style: TextStyle(
                      color: Colors.white70,
                      fontSize: 12,
                      letterSpacing: 1,
                    ),
                  ),
                  SizedBox(height: 8),
                  Text(
                    'Powered by Flutter',
                    style: TextStyle(
                      color: Colors.white60,
                      fontSize: 11,
                      letterSpacing: 1.2,
                    ),
                  ),
                ],
              ),
            )
                .animate(delay: 800.ms)
                .fadeIn(duration: 600.ms),
        ],
      ),
    );
  }
}

/// Particle class for particle system
class Particle {
  double x;
  double y;
  final double size;
  final double speed;
  final Color color;

  Particle({
    required this.x,
    required this.y,
    required this.size,
    required this.speed,
    required this.color,
  });
}

/// Custom painter for particle effects
class ParticlePainter extends CustomPainter {
  final List<Particle> particles;
  final double animation;

  ParticlePainter({
    required this.particles,
    required this.animation,
  });

  @override
  void paint(Canvas canvas, Size size) {
    for (var particle in particles) {
      // Update particle position
      particle.y = (particle.y + particle.speed * 0.005) % 1.0;

      // Create floating effect
      final offsetX = sin(animation * 2 * pi + particle.x * 10) * 20;

      final paint = Paint()
        ..color = particle.color
        ..style = PaintingStyle.fill;

      canvas.drawCircle(
        Offset(
          particle.x * size.width + offsetX,
          particle.y * size.height,
        ),
        particle.size,
        paint,
      );

      // Add glow effect
      final glowPaint = Paint()
        ..color = particle.color.withValues(alpha: 0.2)
        ..maskFilter = const MaskFilter.blur(BlurStyle.normal, 10);

      canvas.drawCircle(
        Offset(
          particle.x * size.width + offsetX,
          particle.y * size.height,
        ),
        particle.size * 2,
        glowPaint,
      );
    }
  }

  @override
  bool shouldRepaint(ParticlePainter oldDelegate) => true;
}
