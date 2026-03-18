# Lottie Animations

This directory is for Lottie animation files (.json).

## How to Add Lottie Animations

### 1. Download Lottie Animations

You can get free Lottie animations from:
- **LottieFiles**: https://lottiefiles.com/
- **IconScout**: https://iconscout.com/lottie-animations
- **Rive**: https://rive.app/community

### 2. Popular Animation Types for E-Commerce

- Shopping cart animations
- Shopping bag animations
- Loading animations
- Success/checkmark animations
- Delivery truck animations
- Gift box animations
- Celebration/confetti animations
- Product showcase animations

### 3. Add to Project

1. Download the `.json` file
2. Place it in this `assets/lottie/` directory
3. Make sure the file is referenced in `pubspec.yaml` (already configured)

### 4. Use in Code

```dart
import 'package:lottie/lottie.dart';

// Basic usage
Lottie.asset(
  'assets/lottie/shopping_cart.json',
  width: 200,
  height: 200,
  fit: BoxFit.cover,
)

// With controller for advanced control
AnimationController controller;

Lottie.asset(
  'assets/lottie/shopping_cart.json',
  controller: controller,
  onLoaded: (composition) {
    controller.duration = composition.duration;
    controller.forward();
  },
)
```

### 5. Example: Replace Icon in Splash Screen

To use a Lottie animation instead of the shopping bag icon:

```dart
// In modern_splash_screen.dart, replace the Container with icon:
Lottie.asset(
  'assets/lottie/shopping_animation.json',
  width: 140,
  height: 140,
  fit: BoxFit.contain,
)
```

## Recommended Lottie Files

For the splash screen, search for:
- "shopping bag" animation
- "e-commerce" animation
- "shopping cart" animation
- "gift box" animation

Make sure to choose animations that:
- Are optimized (small file size)
- Loop smoothly
- Match your brand colors
- Have a transparent background

## Tips

1. Keep Lottie files under 100KB for fast loading
2. Test animations on multiple devices
3. Consider using Lottie for key moments like:
   - Splash screen
   - Loading states
   - Success confirmations
   - Empty states
   - Celebrations (purchases, rewards)

## Current Implementation

The current splash screen uses **code-based animations** which work great without external files. You can enhance it by adding Lottie animations when ready!
