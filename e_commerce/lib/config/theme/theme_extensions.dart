import 'package:flutter/material.dart';

import 'app_colors.dart';

/// Custom theme extension for e-commerce specific colors
/// Provides additional colors not covered by Material 3 color scheme
class CustomColors extends ThemeExtension<CustomColors> {
  final Color? discount;
  final Color? discountBackground;
  final Color? newArrival;
  final Color? newArrivalBackground;
  final Color? rating;
  final Color? soldOut;
  final Color? success;
  final Color? successContainer;
  final Color? warning;
  final Color? warningContainer;
  final Color? info;
  final Color? infoContainer;

  const CustomColors({
    this.discount,
    this.discountBackground,
    this.newArrival,
    this.newArrivalBackground,
    this.rating,
    this.soldOut,
    this.success,
    this.successContainer,
    this.warning,
    this.warningContainer,
    this.info,
    this.infoContainer,
  });

  @override
  ThemeExtension<CustomColors> copyWith({
    Color? discount,
    Color? discountBackground,
    Color? newArrival,
    Color? newArrivalBackground,
    Color? rating,
    Color? soldOut,
    Color? success,
    Color? successContainer,
    Color? warning,
    Color? warningContainer,
    Color? info,
    Color? infoContainer,
  }) {
    return CustomColors(
      discount: discount ?? this.discount,
      discountBackground: discountBackground ?? this.discountBackground,
      newArrival: newArrival ?? this.newArrival,
      newArrivalBackground: newArrivalBackground ?? this.newArrivalBackground,
      rating: rating ?? this.rating,
      soldOut: soldOut ?? this.soldOut,
      success: success ?? this.success,
      successContainer: successContainer ?? this.successContainer,
      warning: warning ?? this.warning,
      warningContainer: warningContainer ?? this.warningContainer,
      info: info ?? this.info,
      infoContainer: infoContainer ?? this.infoContainer,
    );
  }

  @override
  ThemeExtension<CustomColors> lerp(ThemeExtension<CustomColors>? other, double t) {
    if (other is! CustomColors) {
      return this;
    }

    return CustomColors(
      discount: Color.lerp(discount, other.discount, t),
      discountBackground: Color.lerp(discountBackground, other.discountBackground, t),
      newArrival: Color.lerp(newArrival, other.newArrival, t),
      newArrivalBackground: Color.lerp(newArrivalBackground, other.newArrivalBackground, t),
      rating: Color.lerp(rating, other.rating, t),
      soldOut: Color.lerp(soldOut, other.soldOut, t),
      success: Color.lerp(success, other.success, t),
      successContainer: Color.lerp(successContainer, other.successContainer, t),
      warning: Color.lerp(warning, other.warning, t),
      warningContainer: Color.lerp(warningContainer, other.warningContainer, t),
      info: Color.lerp(info, other.info, t),
      infoContainer: Color.lerp(infoContainer, other.infoContainer, t),
    );
  }

  // Light theme custom colors
  static const CustomColors light = CustomColors(
    discount: AppColors.discount,
    discountBackground: AppColors.discountBackground,
    newArrival: AppColors.newArrival,
    newArrivalBackground: AppColors.newArrivalBackground,
    rating: AppColors.rating,
    soldOut: AppColors.soldOut,
    success: AppColors.success,
    successContainer: AppColors.successContainer,
    warning: AppColors.warning,
    warningContainer: AppColors.warningContainer,
    info: AppColors.info,
    infoContainer: AppColors.infoContainer,
  );

  // Dark theme custom colors
  static const CustomColors dark = CustomColors(
    discount: AppColors.discount,
    discountBackground: Color(0xFF4A2B00),
    newArrival: AppColors.newArrival,
    newArrivalBackground: Color(0xFF003D35),
    rating: AppColors.rating,
    soldOut: AppColors.soldOut,
    success: AppColors.success,
    successContainer: Color(0xFF1B4D1E),
    warning: AppColors.warning,
    warningContainer: Color(0xFF4A3300),
    info: AppColors.info,
    infoContainer: Color(0xFF1A3D5C),
  );
}

/// Extension to easily access custom colors from BuildContext
extension CustomColorsExtension on BuildContext {
  CustomColors get customColors => Theme.of(this).extension<CustomColors>() ?? CustomColors.light;
}
