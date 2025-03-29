/**
 * Below are the colors that are used in the app. These colors are used by legacy components.
 * New components should use the Theme context directly.
 */

import { LightTheme, DarkTheme } from '@/context/ThemeContext';

const tintColorLight = LightTheme.primary;
const tintColorDark = DarkTheme.primary;

export const Colors = {
  light: {
    text: LightTheme.text,
    background: LightTheme.background,
    tint: tintColorLight,
    icon: LightTheme.textLight,
    tabIconDefault: LightTheme.textLight,
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: DarkTheme.text,
    background: DarkTheme.background,
    tint: tintColorDark,
    icon: DarkTheme.textLight,
    tabIconDefault: DarkTheme.textLight,
    tabIconSelected: tintColorDark,
  },
};
