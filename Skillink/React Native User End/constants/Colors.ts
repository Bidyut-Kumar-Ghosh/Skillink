/**
 * Below are the colors that are used in the app. These colors are used by legacy components.
 * New components should use the Theme context directly.
 */

import { LightTheme } from "@/context/ThemeContext";

const tintColorLight = LightTheme.primary;

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
    text: LightTheme.text,
    background: LightTheme.background,
    tint: tintColorLight,
    icon: LightTheme.textLight,
    tabIconDefault: LightTheme.textLight,
    tabIconSelected: tintColorLight,
  },
};
