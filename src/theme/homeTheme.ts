import { Platform } from 'react-native';
import { LOGIN_THEME } from '../data/loginData';

// Reuse Login's color tokens so Home and search stay in sync with it.
export const homeTheme = {
  background: LOGIN_THEME.parchmentBg,
  header: LOGIN_THEME.warmCream,
  card: LOGIN_THEME.inputBg,
  primary: LOGIN_THEME.deepMaroon,
  primaryDark: LOGIN_THEME.buttonMaroonDark,
  text: LOGIN_THEME.darkBrownText,
  muted: LOGIN_THEME.darkTerracotta,
  border: LOGIN_THEME.inputDivider,
  gold: LOGIN_THEME.decorativeGold,
  olive: '#4D5138',
  headingFont: Platform.OS === 'android' ? 'sans-serif' : 'Arial',
};
