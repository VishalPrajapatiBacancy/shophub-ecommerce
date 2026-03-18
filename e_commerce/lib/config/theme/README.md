# E-Commerce App Theme System

## Overview

This e-commerce app uses **Material 3 Expressive Theming** with a modern, vibrant color palette designed specifically for shopping experiences. The theme is consistent throughout the app and follows the latest 2025 design trends with liquid/fluid animations.

## Color Palette

### Primary Colors (Vibrant Coral/Rose)
- **Primary**: `#FF5582` - Used for main CTAs, important buttons
- **Primary Light**: `#FF6B9D` - Hover states, highlights
- **Primary Dark**: `#E63E6D` - Pressed states
- **Primary Container**: `#FFE5ED` - Backgrounds, subtle highlights

### Secondary Colors (Modern Teal)
- **Secondary**: `#26C6DA` - Secondary actions, accents
- **Secondary Light**: `#4DD0E1` - Hover states
- **Secondary Dark**: `#00ACC1` - Pressed states
- **Secondary Container**: `#E0F7FA` - Backgrounds

### Tertiary Colors (Warm Amber)
- **Tertiary**: `#FFCA28` - Promotions, deals, highlights
- **Tertiary Light**: `#FFD54F` - Hover states
- **Tertiary Dark**: `#FFB300` - Pressed states
- **Tertiary Container**: `#FFF9E6` - Backgrounds

### E-Commerce Specific Colors
- **Discount**: `#FF3D00` - Discount badges
- **New Arrival**: `#00BFA5` - New product badges
- **Rating**: `#FFD700` - Star ratings
- **Sold Out**: `#9E9E9E` - Out of stock indicators
- **Success**: `#4CAF50` - Success messages, confirmations
- **Warning**: `#FF9800` - Warnings, alerts
- **Error**: `#FF5252` - Error messages

## Typography

The theme uses **Google Fonts** for modern, readable typography:

- **Headings**: Poppins (Bold, Semi-bold)
- **Body Text**: Inter (Regular)
- **Labels**: Poppins (Medium, Semi-bold)

## Usage

### Accessing Theme Colors

```dart
// Access Material 3 color scheme
final primaryColor = Theme.of(context).colorScheme.primary;
final surfaceColor = Theme.of(context).colorScheme.surface;

// Access custom e-commerce colors
import '../../config/theme/theme_extensions.dart';

final discountColor = context.customColors.discount;
final ratingColor = context.customColors.rating;
```

### Using Gradients

```dart
import '../../config/theme/app_colors.dart';

Container(
  decoration: BoxDecoration(
    gradient: AppColors.primaryGradient,
  ),
)
```

### Text Styles

```dart
Text(
  'Product Name',
  style: Theme.of(context).textTheme.titleLarge,
)

Text(
  'Description',
  style: Theme.of(context).textTheme.bodyMedium,
)
```

## Components

All Material components are themed consistently:

- **Buttons**: Rounded corners (12px), elevated with shadows
- **Cards**: Rounded corners (16px), subtle elevation
- **Input Fields**: Rounded corners (12px), filled style
- **Dialogs**: Rounded corners (20px)
- **Bottom Navigation**: Fixed type, 4 items max

## Dark Mode Support

The theme includes a dark mode variant that's ready to use. To enable:

```dart
MaterialApp(
  theme: AppTheme.lightTheme,
  darkTheme: AppTheme.darkTheme,
  themeMode: ThemeMode.system, // or ThemeMode.dark
)
```

## Customization

To customize the theme:

1. **Edit Colors**: Modify `/lib/config/theme/app_colors.dart`
2. **Edit Typography**: Modify the `_buildTextTheme()` method in `/lib/config/theme/app_theme.dart`
3. **Add Custom Colors**: Extend `CustomColors` in `/lib/config/theme/theme_extensions.dart`

## Best Practices

1. Always use theme colors instead of hardcoded colors
2. Use `Theme.of(context)` to access theme properties
3. Leverage `context.customColors` for e-commerce specific colors
4. Maintain consistency across all screens
5. Test on both light and dark themes

## Files Structure

```
lib/config/theme/
├── app_colors.dart          # Color definitions
├── app_theme.dart           # Main theme configuration
├── theme_extensions.dart    # Custom color extensions
└── README.md               # This file
```
