import 'package:flutter/material.dart';

/// App color palette for e-commerce app - Flipkart inspired
/// Uses Flipkart's iconic blue and yellow color scheme
class AppColors {
  AppColors._();

  // Primary Brand Colors - Flipkart Blue
  static const Color primaryLight = Color(0xFF5C9BF5);
  static const Color primary = Color(0xFF2874F0);
  static const Color primaryDark = Color(0xFF0C5FD6);
  static const Color primaryContainer = Color(0xFFE8F1FE);

  // Secondary Colors - Complementary Blue
  static const Color secondaryLight = Color(0xFF6FA8DC);
  static const Color secondary = Color(0xFF4285F4);
  static const Color secondaryDark = Color(0xFF1967D2);
  static const Color secondaryContainer = Color(0xFFE8F0FE);

  // Tertiary Colors - Flipkart Yellow for promotions & accents
  static const Color tertiaryLight = Color(0xFFFFED4E);
  static const Color tertiary = Color(0xFFFFE500);
  static const Color tertiaryDark = Color(0xFFFBD912);
  static const Color tertiaryContainer = Color(0xFFFFFDE7);

  // Neutral Colors
  static const Color background = Color(0xFFFAFAFA);
  static const Color surface = Color(0xFFFFFFFF);
  static const Color surfaceVariant = Color(0xFFF5F5F5);
  static const Color surfaceContainer = Color(0xFFF0F0F0);
  static const Color surfaceContainerHigh = Color(0xFFECECEC);

  // Text Colors
  static const Color onPrimary = Color(0xFFFFFFFF);
  static const Color onSecondary = Color(0xFFFFFFFF);
  static const Color onTertiary = Color(0xFF212121);
  static const Color onBackground = Color(0xFF212121);
  static const Color onSurface = Color(0xFF212121);
  static const Color onSurfaceVariant = Color(0xFF757575);

  // Semantic Colors
  static const Color success = Color(0xFF4CAF50);
  static const Color successContainer = Color(0xFFE8F5E9);
  static const Color error = Color(0xFFFF5252);
  static const Color errorContainer = Color(0xFFFFEBEE);
  static const Color warning = Color(0xFFFF9800);
  static const Color warningContainer = Color(0xFFFFF3E0);
  static const Color info = Color(0xFF2196F3);
  static const Color infoContainer = Color(0xFFE3F2FD);

  // Outline and Border Colors
  static const Color outline = Color(0xFFE0E0E0);
  static const Color outlineVariant = Color(0xFFF5F5F5);

  // Shadow and Overlay
  static const Color shadow = Color(0x1A000000);
  static const Color scrim = Color(0x99000000);
  static const Color overlay = Color(0x14000000);

  // Special E-commerce Colors - Flipkart Style
  static const Color discount = Color(0xFFFF5722);
  static const Color discountBackground = Color(0xFFFBE9E7);
  static const Color newArrival = Color(0xFF388E3C);
  static const Color newArrivalBackground = Color(0xFFE8F5E9);
  static const Color rating = Color(0xFFFFA726);
  static const Color soldOut = Color(0xFF9E9E9E);

  // Gradient Colors for liquid/expressive effects
  static const LinearGradient primaryGradient = LinearGradient(
    colors: [primaryLight, primary],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  static const LinearGradient secondaryGradient = LinearGradient(
    colors: [secondaryLight, secondary],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  static const LinearGradient tertiaryGradient = LinearGradient(
    colors: [tertiaryLight, tertiary],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  static const LinearGradient shimmerGradient = LinearGradient(
    colors: [
      Color(0xFFEBEBEB),
      Color(0xFFF4F4F4),
      Color(0xFFEBEBEB),
    ],
    stops: [0.1, 0.3, 0.4],
    begin: Alignment(-1.0, -0.3),
    end: Alignment(1.0, 0.3),
  );
}
