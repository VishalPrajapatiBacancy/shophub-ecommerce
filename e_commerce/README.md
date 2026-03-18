# ShopHub - E-Commerce Flutter App

A modern e-commerce Flutter application with Material 3 expressive theming and stunning animations.

## Features

- **Material 3 Expressive Theming**: Modern, vibrant color palette optimized for e-commerce
- **Ultra-Modern Splash Screen**:
  - 3D animated shopping icon with perspective transforms
  - Particle system with 30 floating particles
  - Rotating concentric rings
  - Confetti celebration effects
  - Gradient morphing backgrounds
  - Shimmer and glow effects
- **Consistent Design**: Theme applied consistently throughout the entire app
- **Google Fonts**: Beautiful typography using Poppins and Inter fonts
- **Dark Mode Ready**: Complete dark theme support (easily switchable)
- **Responsive UI**: Optimized for different screen sizes
- **Lottie Ready**: Infrastructure in place for premium Lottie animations

## Theme System

This app uses a custom Material 3 theme with:

- **Primary Colors**: Vibrant Coral/Rose (#FF5582)
- **Secondary Colors**: Modern Teal (#26C6DA)
- **Tertiary Colors**: Warm Amber (#FFCA28)
- **E-Commerce Specific Colors**: Discount badges, ratings, new arrivals, etc.

For detailed theme documentation, see [Theme README](lib/config/theme/README.md).

## Screens

- **Modern Splash Screen**: Ultra-trendy splash with 3D animations, particles, rotating rings, and confetti
  - See [SPLASH_SCREEN.md](SPLASH_SCREEN.md) for technical details
- **Home Screen**: Product listings, categories, promotional banners
- *(More screens to be added)*

## Getting Started

### Prerequisites

- Flutter SDK (3.10.1 or higher)
- Dart SDK
- Android Studio / VS Code with Flutter extensions

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd e_commerce
```

2. Install dependencies:
```bash
flutter pub get
```

3. Run the app:
```bash
flutter run
```

## Project Structure

```
lib/
├── config/
│   └── theme/              # Theme configuration
│       ├── app_colors.dart
│       ├── app_theme.dart
│       ├── theme_extensions.dart
│       └── README.md
├── screens/
│   ├── splash/            # Splash screen
│   │   └── splash_screen.dart
│   └── home/              # Home screen
│       └── home_screen.dart
└── main.dart              # App entry point
```

## Dependencies

- **flutter_animate**: Advanced animations and effects
- **animated_text_kit**: Animated text effects
- **lottie**: Lottie animation support (ready to use)
- **confetti**: Celebration confetti effects
- **google_fonts**: Custom typography (Poppins + Inter)

## Customization

### Changing Theme Colors

Edit `lib/config/theme/app_colors.dart` to customize the color palette.

### Modifying Splash Screen

Edit `lib/screens/splash/modern_splash_screen.dart` to change animations and branding.

### Adding Lottie Animations

1. Download free Lottie files from [LottieFiles.com](https://lottiefiles.com)
2. Place `.json` files in `assets/lottie/` directory
3. See `assets/lottie/README.md` for usage instructions
4. Perfect for: splash screen icon, loading states, success animations

## Resources

- [Flutter Documentation](https://docs.flutter.dev/)
- [Material 3 Design](https://m3.material.io/)
- [Flutter Animate Package](https://pub.dev/packages/flutter_animate)
