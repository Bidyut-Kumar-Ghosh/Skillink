export const Fonts = {
  primary: {
    regular: 'Inter-Regular',
    medium: 'Inter-Medium',
    semiBold: 'Inter-SemiBold',
    bold: 'Inter-Bold',
  },
  sizes: {
    small: 12,
    medium: 16,
    large: 18,
    xl: 20,
    xxl: 24,
    title: 32,
  },
  weights: {
    light: '300',
    regular: '400',
    medium: '500',
    semiBold: '600',
    bold: '700',
  },
};

// Font for different device sizes
export const getResponsiveFontSize = (size: number, isSmallDevice: boolean, isTablet: boolean): number => {
  if (isTablet) {
    return size * 1.1; // 10% larger for tablets
  } else if (isSmallDevice) {
    return size * 0.9; // 10% smaller for small devices
  }
  return size;
}; 