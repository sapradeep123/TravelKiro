# Community Module Theme System

This directory contains the theme configuration and responsive styling utilities for the community module.

## Overview

The theme system provides:
- **Design tokens** for consistent colors, spacing, typography, and more
- **Responsive utilities** for creating mobile-first, adaptive layouts
- **Platform-specific styling** for web, iOS, and Android
- **Accessibility helpers** for touch targets and keyboard navigation

## Files

### `communityTheme.ts`
Main theme configuration with design tokens:
- Colors (primary, secondary, semantic, text, borders)
- Spacing scale (4px grid system)
- Typography (font sizes, weights, line heights)
- Border radius values
- Shadow styles
- Animation durations
- Touch target sizes
- Layout constants
- Z-index scale
- Component-specific styles

### `responsiveStyles.ts`
Utility functions for responsive and interactive styling:
- Platform-specific styles
- Hover, focus, and active states (web)
- Touch-optimized button styles
- Responsive containers and grids
- Card styles with elevation
- Text truncation
- Accessibility helpers

### `index.ts`
Exports all theme utilities for easy importing

## Usage

### Basic Import

```typescript
import { communityTheme, responsiveUtils } from '../../src/theme';
```

### Using Design Tokens

```typescript
const styles = StyleSheet.create({
  container: {
    backgroundColor: communityTheme.colors.surface,
    padding: communityTheme.spacing.base,
    borderRadius: communityTheme.borderRadius.lg,
    ...communityTheme.shadows.sm,
  },
  title: {
    fontSize: communityTheme.typography.fontSize.xl,
    fontWeight: communityTheme.typography.fontWeight.bold,
    color: communityTheme.colors.text,
  },
});
```

### Responsive Values

```typescript
const styles = StyleSheet.create({
  container: {
    padding: communityTheme.responsive({
      mobile: communityTheme.spacing.base,
      tablet: communityTheme.spacing.xl,
      desktop: communityTheme.spacing.xxl,
    }),
  },
  title: {
    fontSize: communityTheme.responsive({
      mobile: 20,
      tablet: 24,
      desktop: 28,
    }),
  },
});
```

### Touch-Optimized Buttons

```typescript
const styles = StyleSheet.create({
  button: {
    minHeight: communityTheme.touchTarget.min, // 44px minimum
    paddingHorizontal: communityTheme.spacing.base,
    paddingVertical: communityTheme.spacing.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
```

### Web Hover States

```typescript
const styles = StyleSheet.create({
  button: {
    backgroundColor: communityTheme.colors.primary,
    ...Platform.select({
      web: {
        cursor: 'pointer',
        transition: 'background-color 0.2s ease',
        ':hover': {
          backgroundColor: communityTheme.colors.primaryDark,
        },
      },
    }),
  },
});
```

### Responsive Grid

```typescript
// Get number of columns based on screen size
const columns = communityTheme.getGridColumns(); // 1 mobile, 2 tablet, 3 desktop, 4 wide

// Get container padding
const padding = communityTheme.getContainerPadding(); // 16 mobile, 24 tablet, 32 desktop
```

### Component Styles

```typescript
const styles = StyleSheet.create({
  card: {
    ...communityTheme.components.postCard, // Pre-configured card style
  },
  primaryButton: {
    ...communityTheme.components.button.primary,
  },
  input: {
    ...communityTheme.components.input,
  },
});
```

## Breakpoints

The theme uses the following breakpoints:
- **Mobile**: 0-767px (default)
- **Tablet**: 768-1023px
- **Desktop**: 1024-1279px
- **Wide**: 1280px+

## Color Palette

### Primary Colors
- `primary`: #667eea (main brand color)
- `primaryDark`: #5568d3 (hover/active states)
- `primaryLight`: #8b9aef (disabled states)

### Semantic Colors
- `success`: #34C759
- `error`: #F44336
- `warning`: #FF9800
- `info`: #2196F3

### Social Colors
- `like`: #F44336 (heart icon)
- `save`: #667eea (bookmark icon)
- `comment`: #65676b (comment icon)

### Neutral Colors
- `background`: #f0f2f5 (page background)
- `surface`: #ffffff (cards, modals)
- `text`: #1c1e21 (primary text)
- `textSecondary`: #65676b (secondary text)
- `border`: #e5e7eb (borders, dividers)

## Spacing Scale

Based on 4px grid:
- `xs`: 4px
- `sm`: 8px
- `md`: 12px
- `base`: 16px (default)
- `lg`: 20px
- `xl`: 24px
- `xxl`: 32px
- `xxxl`: 40px
- `huge`: 48px
- `massive`: 64px

## Typography Scale

### Font Sizes
- `xs`: 11px
- `sm`: 12px
- `base`: 14px (default)
- `md`: 15px
- `lg`: 16px
- `xl`: 18px
- `xxl`: 20px
- `xxxl`: 24px
- `huge`: 28px
- `massive`: 32px

### Font Weights
- `regular`: 400
- `medium`: 500
- `semibold`: 600
- `bold`: 700

## Best Practices

1. **Always use theme tokens** instead of hardcoded values
2. **Use responsive helpers** for values that change across breakpoints
3. **Apply touch targets** (min 44px) for all interactive elements
4. **Add hover states** for web platform to improve UX
5. **Use semantic colors** (success, error, warning) for consistent meaning
6. **Follow spacing scale** for consistent rhythm and alignment
7. **Test on multiple screen sizes** (mobile, tablet, desktop)
8. **Consider accessibility** (color contrast, touch targets, keyboard navigation)

## Examples

### Responsive Card Component

```typescript
import { StyleSheet } from 'react-native';
import { communityTheme } from '../../src/theme';

const styles = StyleSheet.create({
  card: {
    backgroundColor: communityTheme.colors.surface,
    borderRadius: communityTheme.borderRadius.lg,
    padding: communityTheme.responsive({
      mobile: communityTheme.spacing.base,
      tablet: communityTheme.spacing.xl,
    }),
    marginBottom: communityTheme.spacing.base,
    ...communityTheme.shadows.sm,
    maxWidth: communityTheme.responsive({
      mobile: '100%' as any,
      tablet: 600 as any,
      desktop: 600 as any,
    }),
  },
});
```

### Interactive Button

```typescript
import { StyleSheet, Platform } from 'react-native';
import { communityTheme } from '../../src/theme';

const styles = StyleSheet.create({
  button: {
    backgroundColor: communityTheme.colors.primary,
    paddingHorizontal: communityTheme.spacing.xl,
    paddingVertical: communityTheme.spacing.md,
    borderRadius: communityTheme.borderRadius.full,
    minHeight: communityTheme.touchTarget.min,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      web: {
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        ':hover': {
          backgroundColor: communityTheme.colors.primaryDark,
          transform: 'scale(1.05)',
        },
        ':active': {
          transform: 'scale(0.98)',
        },
      },
    }),
  },
  buttonText: {
    color: communityTheme.colors.surface,
    fontSize: communityTheme.typography.fontSize.lg,
    fontWeight: communityTheme.typography.fontWeight.semibold,
  },
});
```

## Extending the Theme

To add new design tokens or utilities:

1. Add tokens to `communityTheme.ts`
2. Add utility functions to `responsiveStyles.ts` if needed
3. Export from `index.ts`
4. Update this README with usage examples

## Support

For questions or issues with the theme system, please refer to the design document or contact the development team.
