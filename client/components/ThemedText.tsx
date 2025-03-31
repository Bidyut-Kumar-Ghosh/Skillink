import { Text, type TextProps, StyleSheet } from 'react-native';
import { useThemeColor } from '@/hooks/useThemeColor';
import { useTheme } from '@/context/ThemeContext';
import { Fonts } from '@/constants/Fonts';

export type ThemedTextProps = TextProps & {
  lightColor?: string;
  darkColor?: string;
  type?: 'default' | 'title' | 'defaultSemiBold' | 'subtitle' | 'link' | 'caption';
};

export function ThemedText({
  style,
  lightColor,
  darkColor,
  type = 'default',
  ...rest
}: ThemedTextProps) {
  const { theme } = useTheme();
  const color = lightColor || darkColor ? useThemeColor({ light: lightColor, dark: darkColor }, 'text') : theme.text;

  return (
    <Text
      style={[
        { color },
        type === 'default' ? styles.default : undefined,
        type === 'title' ? styles.title : undefined,
        type === 'defaultSemiBold' ? styles.defaultSemiBold : undefined,
        type === 'subtitle' ? styles.subtitle : undefined,
        type === 'link' ? styles.link : undefined,
        type === 'caption' ? styles.caption : undefined,
        style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  default: {
    fontSize: Fonts.sizes.medium,
    lineHeight: 24,
    fontFamily: Fonts.primary.regular,
  },
  defaultSemiBold: {
    fontSize: Fonts.sizes.medium,
    lineHeight: 24,
    fontFamily: Fonts.primary.semiBold,
  },
  title: {
    fontSize: Fonts.sizes.title,
    fontFamily: Fonts.primary.bold,
    lineHeight: 38,
  },
  subtitle: {
    fontSize: Fonts.sizes.xl,
    fontFamily: Fonts.primary.semiBold,
    lineHeight: 28,
  },
  link: {
    lineHeight: 30,
    fontSize: Fonts.sizes.medium,
    fontFamily: Fonts.primary.medium,
    textDecorationLine: 'underline',
  },
  caption: {
    fontSize: Fonts.sizes.small,
    fontFamily: Fonts.primary.regular,
    lineHeight: 18,
    opacity: 0.8,
  },
});
