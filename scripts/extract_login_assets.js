const fs = require('fs');
const path = require('path');

function getB64(filename) {
  const filePath = path.join(__dirname, '..', 'assets', 'images', filename);
  if (fs.existsSync(filePath)) {
    return 'data:image/jpeg;base64,' + fs.readFileSync(filePath).toString('base64');
  }
  return '';
}

const heroB64 = getB64('login_hero.jpg');
const footerB64 = getB64('login_footer_landscape.jpg');
const fullB64 = getB64('login_reference.jpg');

const code = `// Login Screen visual assets and exact color palette
export const LOGIN_THEME = {
  heroBg: '#672A18',
  darkTerracotta: '#7B321F',
  parchmentBg: '#FFF0D7',
  warmCream: '#FCE5C1',
  deepMaroon: '#861C24',
  darkBrownText: '#542719',
  decorativeGold: '#D6A45B',
  inputBorder: '#7B321F',
  inputBg: '#FFF9EF',
  inputDivider: '#D4B8A5',
  buttonMaroon: '#861C24',
  buttonMaroonDark: '#6F1219',
};

export const LOGIN_HERO_IMAGE = '${heroB64}';
export const LOGIN_FOOTER_LANDSCAPE = '${footerB64}';
export const LOGIN_FULL_REFERENCE = '${fullB64}';
`;

fs.writeFileSync(path.join(__dirname, '..', 'src', 'data', 'loginData.ts'), code, 'utf8');
console.log('Saved src/data/loginData.ts successfully! Size:', code.length);

