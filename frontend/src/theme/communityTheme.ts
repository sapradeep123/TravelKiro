/**
 * Community Module Theme Configuration
 * 
 * Provides design tokens for consistent styling across all community components.
 * Follows mobile-first responsive design principles.
 */

import { Platform, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

// Breakpoints for responsive design
export const breakpoints = {
  mobile: 0,
  tablet: 768,
  desktop: 1024,
  wide: 1280,
};

// Helper to determine current breakpoint
export const getBreakpoint = () => {
  if (width >= breakpoints.wide) return 'wide';
  if (width >= breakpoints.desktop) return 'desktop';
  if (width >= breakpoints.tablet) return 'tablet';
  return 'mobile';
};

// Helper for responsive values
export const responsive = <T,>(values: {
  mobile: T;
  tablet?: T;
  desktop?: T;
  wide?: T;
}): T => {
  const breakpoint = getBreakpoint();
  return (
    values[breakpoint as keyof typeof values] ||
    values.desktop ||
    values.tablet ||
    values.mobile
  );
};

// Color palette
export const colors = {
  // Primary colors
  primary: '#667eea',
  primaryDark: '#5568d3',
  primaryLight: '#8b9aef',
  
  // Secondary colors
  secondary: '#764ba2',
  secondaryDark: '#5e3c82',
  secondaryLight: '#9168b8',
  
  // Semantic colors
  success: '#34C759',
  error: '#F44336',
  warning: '#FF9800',
  info: '#2196F3',
  
  // Social interaction colors
  like: '#F44336',
  save: '#667eea',
  comment: '#65676b',
  
  // Neutral colors
  background: '#f0f2f5',
  surface: '#ffffff',
  surfaceVariant: '#f9fafb',
  
  // Text colors
  text: '#1c1e21',
  textSecondary: '#65676b',
  textTertiary: '#8e8e93',
  textDisabled: '#c6c6c8',
  
  // Border colors
  border: '#e5e7eb',
  borderLight: '#f3f4f6',
  borderDark: '#d1d5db',
  
  // Overlay colors
  overlay: 'rgba(0, 0, 0, 0.5)',
  overlayLight: 'rgba(0, 0, 0, 0.3)',
  
  // Status colors
  online: '#34C759',
  offline: '#8e8e93',
  
  // Transparent
  transparent: 'transparent',
};

// Spacing scale (based on 4px grid)
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  xxxl: 40,
  huge: 48,
  massive: 64,
};

// Typography scale
export const typography = {
  // Font families
  fontFamily: {
    regular: Platform.select({
      ios: 'System',
      android: 'Roboto',
      default: 'System',
    }),
    medium: Platform.select({
      ios: 'System',
      android: 'Roboto-Medium',
      default: 'System',
    }),
    bold: Platform.select({
      ios: 'System',
      android: 'Roboto-Bold',
      default: 'System',
    }),
  },
  
  // Font sizes
  fontSize: {
    xs: 11,
    sm: 12,
    base: 14,
    md: 15,
    lg: 16,
    xl: 18,
    xxl: 20,
    xxxl: 24,
    huge: 28,
    massive: 32,
  },
  
  // Line heights
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },
  
  // Font weights
  fontWeight: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },
};

// Border radius scale
export const borderRadius = {
  none: 0,
  xs: 4,
  sm: 6,
  base: 8,
  md: 10,
  lg: 12,
  xl: 16,
  xxl: 20,
  full: 9999,
};

// Shadow styles
export const shadows = {
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  base: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.25,
    shadowRadius: 24,
    elevation: 12,
  },
};

// Animation durations
export const animation = {
  fast: 150,
  normal: 250,
  slow: 350,
};

// Touch target sizes (accessibility)
export const touchTarget = {
  min: 44, // Minimum touch target size (iOS HIG)
  comfortable: 48, // Comfortable touch target
  large: 56, // Large touch target
};

// Layout constants
export const layout = {
  // Container widths
  containerWidth: {
    mobile: '100%',
    tablet: 600,
    desktop: 800,
    wide: 1000,
  },
  
  // Grid columns
  gridColumns: {
    mobile: 1,
    tablet: 2,
    desktop: 3,
    wide: 4,
  },
  
  // Post card widths
  postCardWidth: {
    mobile: width - spacing.base * 2,
    tablet: 600,
    desktop: 600,
    wide: 600,
  },
  
  // Media heights
  mediaHeight: {
    mobile: 400,
    tablet: 500,
    desktop: 500,
    wide: 500,
  },
  
  // Header heights
  headerHeight: {
    mobile: 56,
    tablet: 64,
    desktop: 72,
  },
  
  // Tab bar heights
  tabBarHeight: {
    mobile: Platform.OS === 'ios' ? 83 : 56,
    tablet: 64,
    desktop: 0, // No tab bar on desktop
  },
};

// Z-index scale
export const zIndex = {
  base: 0,
  dropdown: 1000,
  sticky: 1100,
  fixed: 1200,
  modalBackdrop: 1300,
  modal: 1400,
  popover: 1500,
  tooltip: 1600,
};

// Component-specific styles
export const components = {
  // Post card
  postCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.base,
    ...shadows.sm,
  },
  
  // Button
  button: {
    primary: {
      backgroundColor: colors.primary,
      borderRadius: borderRadius.xl,
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.xl,
      minHeight: touchTarget.min,
    },
    secondary: {
      backgroundColor: colors.transparent,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: borderRadius.xl,
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.xl,
      minHeight: touchTarget.min,
    },
  },
  
  // Input
  input: {
    backgroundColor: colors.surfaceVariant,
    borderRadius: borderRadius.base,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.base,
    fontSize: typography.fontSize.md,
    color: colors.text,
    minHeight: touchTarget.min,
  },
  
  // Avatar
  avatar: {
    small: 32,
    medium: 48,
    large: 64,
    xlarge: 100,
  },
  
  // FAB (Floating Action Button)
  fab: {
    size: touchTarget.large,
    backgroundColor: colors.primary,
    borderRadius: touchTarget.large / 2,
    ...shadows.lg,
    position: 'absolute' as const,
    bottom: responsive({
      mobile: Platform.OS === 'ios' ? 90 : 80,
      tablet: spacing.xl,
      desktop: spacing.xl,
    }),
    right: spacing.lg,
  },
};

// Responsive grid helper
export const getGridColumns = () => {
  return responsive({
    mobile: 1,
    tablet: 2,
    desktop: 3,
    wide: 4,
  });
};

// Responsive padding helper
export const getContainerPadding = () => {
  return responsive({
    mobile: spacing.base,
    tablet: spacing.xl,
    desktop: spacing.xxl,
  });
};

// Export default theme object
export const communityTheme = {
  colors,
  spacing,
  typography,
  borderRadius,
  shadows,
  animation,
  touchTarget,
  layout,
  zIndex,
  components,
  breakpoints,
  responsive,
  getBreakpoint,
  getGridColumns,
  getContainerPadding,
};

export default communityTheme;
