import { View, type ViewProps } from 'react-native';
import { useThemeColor } from '@/hooks/useThemeColor';
import { useTheme } from '@/context/ThemeContext';

export type ThemedViewProps = ViewProps & {
  lightColor?: string;
  darkColor?: string;
};

export function ThemedView({
  style,
  lightColor,
  darkColor,
  pointerEvents,
  ...otherProps
}: ThemedViewProps) {
  const { theme } = useTheme();
  const backgroundColor = lightColor || darkColor
    ? useThemeColor({ light: lightColor, dark: darkColor }, 'background')
    : theme.background;

  // Create a new style object that includes backgroundColor and pointerEvents
  const combinedStyle = {
    ...(Array.isArray(style) ? Object.assign({}, ...style) : style),
    backgroundColor,
    ...(pointerEvents ? { pointerEvents } : {})
  };

  return <View style={combinedStyle} {...otherProps} />;
}
