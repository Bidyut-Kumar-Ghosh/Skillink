import { Platform } from 'react-native';

/**
 * Creates shadow styles that work across platforms
 * Uses boxShadow for web and iOS, and elevation for Android
 */
export const createShadow = (
  elevation: number,
  color: string = '#000',
  opacity: number = 0.15,
  offsetX: number = 0,
  offsetY: number = 2,
  radius: number = 3
) => {
  // Convert the shadow properties to a boxShadow string for web
  const boxShadow = `${offsetX}px ${offsetY}px ${radius}px rgba(${hexToRgb(color)}, ${opacity})`;
  
  if (Platform.OS === 'android') {
    return { elevation };
  } else {
    // iOS and Web use boxShadow
    return { boxShadow };
  }
};

/**
 * Convert hex color to RGB
 */
const hexToRgb = (hex: string): string => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`
    : '0, 0, 0';
};

/**
 * Apply proper pointer events as style prop instead of component prop
 */
export const applyPointerEvents = (events: 'auto' | 'none' | 'box-none' | 'box-only' | undefined) => {
  return { pointerEvents: events };
};

/**
 * Apply proper resize mode as prop instead of style
 */
export const getResizeMode = (
  style: any
): { resizeMode?: 'cover' | 'contain' | 'stretch' | 'repeat' | 'center'; style: any } => {
  const { resizeMode, ...restStyle } = style || {};
  return {
    resizeMode,
    style: restStyle,
  };
};

/**
 * Create responsive style by toggling between different styles based on device size
 */
export const createResponsiveStyle = (
  defaultStyle: any,
  smallDeviceStyle: any = {},
  tabletStyle: any = {},
  isSmallDevice: boolean,
  isTablet: boolean
) => {
  if (isTablet) {
    return { ...defaultStyle, ...tabletStyle };
  } else if (isSmallDevice) {
    return { ...defaultStyle, ...smallDeviceStyle };
  }
  return defaultStyle;
}; 