const fs = require('fs');
const path = require('path');

const imgBuffer = fs.readFileSync(path.join(__dirname, '..', 'assets', 'images', 'login_hero.jpg'));
const base64 = 'data:image/jpeg;base64,' + imgBuffer.toString('base64');

const lines = [
  "// Login Screen assets and theme configuration",
  "export const LOGIN_HERO_IMAGE = '" + base64 + "';",
  "",
  "export const LOGIN_THEME = {",
  "  bgTop: '#582E1E',",
  "  bgParchment: '#FBF5EA',",
  "  ink: '#2E160D',",
  "  inkLight: '#59301F',",
  "  inkMuted: '#8C7060',",
  "  maroon: '#762C32',",
  "  maroonDark: '#601D22',",
  "  maroonLight: '#8D363D',",
  "  gold: '#C69A5B',",
  "  goldBorder: '#D8B88E',",
  "  inputBorder: '#C9B59F',",
  "  inputBg: '#FDFBF7',",
  "  chalk: '#FFF1D8',",
  "};",
  ""
];

const dest = path.join(__dirname, '..', 'src', 'data', 'loginData.ts');
fs.writeFileSync(dest, lines.join('\n'), 'utf8');
console.log('Saved src/data/loginData.ts successfully!');

