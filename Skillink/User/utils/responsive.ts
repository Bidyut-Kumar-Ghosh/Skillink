import { Dimensions, Platform, PixelRatio, ScaledSize } from 'react-native';

// Device dimensions
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Base dimensions
const baseWidth = 375;
const baseHeight = 812;

// Device type detection
export const isSmallDevice = SCREEN_WIDTH < 375;
export const isTablet = SCREEN_WIDTH >= 768;
export const isLargeDevice = SCREEN_WIDTH >= 428;

/**
 * Scale a size based on the device width
 * @param size - The size to scale
 * @returns The scaled size
 */
export const scaleWidth = (size: number): number => {
  const scale = SCREEN_WIDTH / baseWidth;
  const newSize = size * scale;
  
  if (Platform.OS === 'ios') {
    return Math.round(PixelRatio.roundToNearestPixel(newSize));
  }
  return Math.round(PixelRatio.roundToNearestPixel(newSize)) - 2;
};

/**
 * Scale a size based on the device height
 * @param size - The size to scale
 * @returns The scaled size
 */
export const scaleHeight = (size: number): number => {
  const scale = SCREEN_HEIGHT / baseHeight;
  const newSize = size * scale;
  
  if (Platform.OS === 'ios') {
    return Math.round(PixelRatio.roundToNearestPixel(newSize));
  }
  return Math.round(PixelRatio.roundToNearestPixel(newSize)) - 2;
};

/**
 * Scale size for different device dimensions
 * @param size - The size to scale
 * @returns The scaled size
 */
export const scale = (size: number): number => {
  return scaleWidth(size);
};

/**
 * Helper for vertical spacing
 * @param size - The size to scale
 * @returns The scaled vertical spacing
 */
export const verticalScale = (size: number): number => {
  return scaleHeight(size);
};

/**
 * Helper for horizontal spacing
 * @param size - The size to scale
 * @returns The scaled horizontal spacing
 */
export const horizontalScale = (size: number): number => {
  return scaleWidth(size);
};

/**
 * Moderate scaling for font sizes and margins
 * @param size - The size to scale
 * @param factor - How much of the scale factor to use (default 0.5)
 * @returns The moderately scaled size
 */
export const moderateScale = (size: number, factor: number = 0.5): number => {
  return size + (scale(size) - size) * factor;
};

/**
 * Responsive sizing for padding
 * @param size - Base size
 * @returns Sized padding appropriate for device
 */
export const responsivePadding = (size: number): number => {
  if (isTablet) {
    return moderateScale(size, 0.7);
  } else if (isSmallDevice) {
    return moderateScale(size, 0.3);
  }
  return moderateScale(size, 0.5);
};

/**
 * Responsive sizing for fonts
 * @param size - Base font size
 * @returns Sized font appropriate for device
 */
export const responsiveFontSize = (size: number): number => {
  if (isTablet) {
    return moderateScale(size, 0.3);
  } else if (isSmallDevice) {
    return moderateScale(size, 0.3);
  }
  return moderateScale(size, 0.5);
};

// Setup dimensions listener for orientation changes
export const listenOrientationChange = (callback: (dimensions: ScaledSize) => void): (() => void) => {
  const listener = Dimensions.addEventListener('change', ({ window }) => {
    callback(window);
  });
  
  return () => listener.remove();
};

/**
 * Get responsive styles based on screen size
 * @param smallStyles - Styles for small devices
 * @param defaultStyles - Styles for regular devices
 * @param tabletStyles - Styles for tablets
 * @returns The appropriate styles object based on screen size
 */
export const getResponsiveStyles = (
  smallStyles: any, 
  defaultStyles: any, 
  tabletStyles: any
): any => {
  if (isTablet) {
    return { ...defaultStyles, ...tabletStyles };
  } else if (isSmallDevice) {
    return { ...defaultStyles, ...smallStyles };
  }
  return defaultStyles;
}; 