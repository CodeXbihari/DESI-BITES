import { Platform } from 'react-native';
import { LOGIN_THEME } from '../data/loginData';

// Home and restaurant search share the approved cream and maroon palette.
export const homeTheme = {
  background: '#FFF8F0',
  header: '#FFF3E5',
  card: '#FFFDFC',
  primary: '#8B0912',
  primaryDark: LOGIN_THEME.buttonMaroonDark,
  text: '#231A17',
  muted: '#785746',
  border: '#F0D9CB',
  gold: LOGIN_THEME.decorativeGold,
  olive: '#4D5138',
  headingFont: Platform.OS === 'android' ? 'sans-serif' : 'Arial',
};
