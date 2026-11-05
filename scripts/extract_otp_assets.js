const fs = require('fs');
const path = require('path');

const cleanBgBuf = fs.readFileSync(path.join(__dirname, '..', 'assets', 'images', 'otp_clean_bg.jpg'));
const cleanBgB64 = 'data:image/jpeg;base64,' + cleanBgBuf.toString('base64');

const headerBuf = fs.readFileSync(path.join(__dirname, '..', 'assets', 'images', 'otp_header.jpg'));
const headerB64 = 'data:image/jpeg;base64,' + headerBuf.toString('base64');

const bottomBuf = fs.readFileSync(path.join(__dirname, '..', 'assets', 'images', 'otp_bottom.jpg'));
const bottomB64 = 'data:image/jpeg;base64,' + bottomBuf.toString('base64');

const code = `// OTP Screen Visual Identity Assets and Palette
export const OTP_THEME = {
  deepCrimson: '#A50916',
  darkMaroon: '#790B16',
  primaryMaroon: '#9C1020',
  warmParchment: '#FFE0A5',
  lightCream: '#FFF0CE',
  antiqueGold: '#D99A42',
  decorativeGold: '#F2BD62',
  darkBrown: '#71351E',
  boxBorder: '#790B16',
  boxBg: 'rgba(255, 240, 206, 0.55)',
  boxBgFocus: 'rgba(255, 245, 230, 0.95)',
  buttonMaroon: '#880A17',
  buttonMaroonDark: '#6F0712',
  buttonGoldBorder: '#D99A42',
  buttonInnerGold: '#F2BD62',
};

export const OTP_CLEAN_BG = '${cleanBgB64}';
export const OTP_HEADER_IMAGE = '${headerB64}';
export const OTP_BOTTOM_IMAGE = '${bottomB64}';
`;

fs.writeFileSync(path.join(__dirname, '..', 'src', 'data', 'otpData.ts'), code, 'utf8');
console.log('Saved src/data/otpData.ts successfully! Size:', code.length);
