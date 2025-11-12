/**
 * Responsive Styles Utilities
 * 
 * Helper functions for creating responsive styles and handling
 * platform-specific styling needs.
 */

import { Platform, StyleSheet } from 'react-native';
import { communityTheme } from './communityTheme';

/**
 * Create platform-specific styles
 */
export const platformSelect = <T,>(styles: {
  ios?: T;
  android?: T;
  web?: T;
  default: T;
}): T => {
  return Platform.select(styles) || styles.default;
};

/**
 * Create hover styles for web platform
 */
export const createHoverStyle = (baseStyle: any, hoverStyle: any) => {
  if (Platform.OS === 'web') {
    return {
      ...baseStyle,
      ':hover': hoverStyle,
    };
  }
  return baseStyle;
};

/**
 * Create focus styles for keyboard navigation (web)
 */
export const createFocusStyle = (baseStyle: any, focusStyle: any) => {
  if (Platform.OS === 'web') {
    return {
      ...baseStyle,
      ':focus': focusStyle,
      ':focus-visible': {
        ...focusStyle,
        outline: `2px solid ${communityTheme.colors.primary}`,
        outlineOffset: 2,
      },
    };
  }
  return baseStyle;
};

/**
 * Create active/pressed styles
 */
export const createActiveStyle = (baseStyle: any, activeStyle: any) => {
  if (Platform.OS === 'web') {
    return {
      ...baseStyle,
      ':active': activeStyle,
    };
  }
  return baseStyle;
};

/**
 * Combine hover, focus, and active styles
 */
export const createInteractiveStyle = (
  baseStyle: any,
  interactiveStyles: {
    hover?: any;
    focus?: any;
    active?: any;
  }
) => {
  let style = baseStyle;
  
  if (interactiveStyles.hover) {
    style = createHoverStyle(style, interactiveStyles.hover);
  }
  
  if (interactiveStyles.focus) {
    style = createFocusStyle(style, interactiveStyles.focus);
  }
  
  if (interactiveStyles.active) {
    style = createActiveStyle(style, interactiveStyles.active);
  }
  
  return style;
};

/**
 * Create touch-optimized button styles
 */
export const createTouchableStyle = (minSize: number = communityTheme.touchTarget.min) => {
  return {
    minWidth: minSize,
    minHeight: minSize,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  };
};

/**
 * Create responsive container styles
 */
export const createResponsiveContainer = () => {
  const breakpoint = communityTheme.getBreakpoint();
  const maxWidth = communityTheme.layout.containerWidth[breakpoint];
  
  return {
    width: '100%',
    maxWidth: typeof maxWidth === 'number' ? maxWidth : undefined,
    marginHorizontal: 'auto' as const,
    paddingHorizontal: communityTheme.getContainerPadding(),
  };
};

/**
 * Create responsive grid styles
 */
export const createResponsiveGrid = (gap: number = communityTheme.spacing.base) => {
  const columns = communityTheme.getGridColumns();
  
  return {
    flexDirection: 'row' as const,
    flexWrap: 'wrap' as const,
    marginHorizontal: -gap / 2,
    columnGap: gap,
    rowGap: gap,
  };
};

/**
 * Create responsive grid item styles
 */
export const createResponsiveGridItem = (gap: number = communityTheme.spacing.base) => {
  const columns = communityTheme.getGridColumns();
  const itemWidth = `${(100 / columns) - (gap / columns)}%`;
  
  return {
    width: itemWidth,
    paddingHorizontal: gap / 2,
  };
};

/**
 * Create card styles with elevation/shadow
 */
export const createCardStyle = (elevation: 'sm' | 'base' | 'md' | 'lg' = 'base') => {
  return {
    backgroundColor: communityTheme.colors.surface,
    borderRadius: communityTheme.borderRadius.lg,
    ...communityTheme.shadows[elevation],
  };
};

/**
 * Create text truncation styles
 */
export const createTruncateStyle = (lines: number = 1) => {
  return Platform.select({
    web: {
      overflow: 'hidden' as const,
      textOverflow: 'ellipsis',
      display: '-webkit-box',
      WebkitLineClamp: lines,
      WebkitBoxOrient: 'vertical' as const,
    },
    default: {
      numberOfLines: lines,
    },
  });
};

/**
 * Create accessible label styles (screen reader only)
 */
export const createAccessibleLabelStyle = () => {
  return Platform.select({
    web: {
      position: 'absolute' as const,
      width: 1,
      height: 1,
      padding: 0,
      margin: -1,
      overflow: 'hidden' as const,
      clip: 'rect(0, 0, 0, 0)',
      whiteSpace: 'nowrap' as const,
      borderWidth: 0,
    },
    default: {
      position: 'absolute' as const,
      width: 0,
      height: 0,
      opacity: 0,
    },
  });
};

/**
 * Create safe area padding for mobile devices
 */
export const createSafeAreaPadding = (sides: {
  top?: boolean;
  bottom?: boolean;
  left?: boolean;
  right?: boolean;
} = {}) => {
  const padding: any = {};
  
  if (Platform.OS === 'ios') {
    if (sides.top) padding.paddingTop = 44;
    if (sides.bottom) padding.paddingBottom = 34;
  }
  
  return padding;
};

/**
 * Create responsive font size
 */
export const createResponsiveFontSize = (
  baseSizes: {
    mobile: number;
    tablet?: number;
    desktop?: number;
  }
) => {
  return communityTheme.responsive({
    mobile: baseSizes.mobile,
    tablet: baseSizes.tablet || baseSizes.mobile,
    desktop: baseSizes.desktop || baseSizes.tablet || baseSizes.mobile,
  });
};

/**
 * Create responsive spacing
 */
export const createResponsiveSpacing = (
  baseSpacing: {
    mobile: number;
    tablet?: number;
    desktop?: number;
  }
) => {
  return communityTheme.responsive({
    mobile: baseSpacing.mobile,
    tablet: baseSpacing.tablet || baseSpacing.mobile,
    desktop: baseSpacing.desktop || baseSpacing.tablet || baseSpacing.mobile,
  });
};

/**
 * Merge styles safely
 */
export const mergeStyles = (...styles: any[]) => {
  return StyleSheet.flatten(styles.filter(Boolean));
};

/**
 * Create conditional styles
 */
export const conditionalStyle = (condition: boolean, trueStyle: any, falseStyle?: any) => {
  return condition ? trueStyle : (falseStyle || {});
};

/**
 * Export all utilities
 */
export const responsiveUtils = {
  platformSelect,
  createHoverStyle,
  createFocusStyle,
  createActiveStyle,
  createInteractiveStyle,
  createTouchableStyle,
  createResponsiveContainer,
  createResponsiveGrid,
  createResponsiveGridItem,
  createCardStyle,
  createTruncateStyle,
  createAccessibleLabelStyle,
  createSafeAreaPadding,
  createResponsiveFontSize,
  createResponsiveSpacing,
  mergeStyles,
  conditionalStyle,
};

export default responsiveUtils;
