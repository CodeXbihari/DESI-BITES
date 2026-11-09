import { Platform } from 'react-native';
import { LOGIN_THEME } from '../data/loginData';

// Home uses the Login palette without changing the shared theme of other tabs.
export const homeTheme = {
  background: LOGIN_THEME.parchmentBg,
  header: LOGIN_THEME.warmCream,
  card: LOGIN_THEME.inputBg,
  primary: LOGIN_THEME.deepMaroon,
  primaryDark: LOGIN_THEME.buttonMaroonDark,
  text: LOGIN_THEME.darkBrownText,
  muted: '#8C6C58',
  border: LOGIN_THEME.inputDivider,
  gold: LOGIN_THEME.decorativeGold,
  olive: '#4D5138',
  headingFont: Platform.OS === 'ios' || Platform.OS === 'web' ? 'Georgia' : 'serif',
};
