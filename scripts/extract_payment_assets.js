const fs = require('fs');
const path = require('path');
const jpeg = require('jpeg-js');

const raw = fs.readFileSync(path.join(__dirname, '..', 'assets', 'images', 'payment_reference.jpg'));
const d = jpeg.decode(raw, { useTArray: true });
const w = d.width, h = d.height;

function cropAndCleanHeader() {
  const height = 295;
  const sliceData = Buffer.alloc(w * height * 4);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < w; x++) {
      const si = (y * w + x) * 4;
      const di = (y * w + x) * 4;
      sliceData[di] = d.data[si];
      sliceData[di+1] = d.data[si+1];
      sliceData[di+2] = d.data[si+2];
      sliceData[di+3] = d.data[si+3];
    }
  }

  function getSkyColor(x, y) {
    const sampleX = 300;
    const idx = (y * w + sampleX) * 4;
    const grain = Math.floor((Math.random() - 0.5) * 4);
    return [
      Math.min(255, Math.max(0, sliceData[idx] + grain)),
      Math.min(255, Math.max(0, sliceData[idx+1] + grain)),
      Math.min(255, Math.max(0, sliceData[idx+2] + grain))
    ];
  }

  // 1. Inpaint APNA RASOI (x: 20 to 180, y: 15 to 58) - REMOVE APP NAME
  for (let y = 15; y <= 58; y++) {
    for (let x = 20; x <= 180; x++) {
      const idx = (y * w + x) * 4;
      const [r, g, b] = getSkyColor(x, y);
      sliceData[idx] = r;
      sliceData[idx+1] = g;
      sliceData[idx+2] = b;
    }
  }

  // 2. Inpaint Help button (x: 475 to 565, y: 12 to 46) - so overlay renders single button
  for (let y = 12; y <= 46; y++) {
    for (let x = 475; x <= 565; x++) {
      const idx = (y * w + x) * 4;
      const [r, g, b] = getSkyColor(x, y);
      sliceData[idx] = r;
      sliceData[idx+1] = g;
      sliceData[idx+2] = b;
    }
  }

  const enc = jpeg.encode({ data: sliceData, width: w, height }, 92);
  fs.writeFileSync(path.join(__dirname, '..', 'assets', 'images', 'payment_header.jpg'), enc.data);
  console.log('Saved clean payment_header.jpg (height:', height, ')');
}

function cropFooter() {
  const yStart = 810;
  const height = h - yStart;
  const sliceData = Buffer.alloc(w * height * 4);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < w; x++) {
      const si = ((yStart + y) * w + x) * 4;
      const di = (y * w + x) * 4;
      sliceData[di] = d.data[si];
      sliceData[di+1] = d.data[si+1];
      sliceData[di+2] = d.data[si+2];
      sliceData[di+3] = d.data[si+3];
    }
  }
  const enc = jpeg.encode({ data: sliceData, width: w, height }, 92);
  fs.writeFileSync(path.join(__dirname, '..', 'assets', 'images', 'payment_footer.jpg'), enc.data);
  console.log('Saved payment_footer.jpg (height:', height, ')');
}

cropAndCleanHeader();
cropFooter();

function getB64(filename) {
  const filePath = path.join(__dirname, '..', 'assets', 'images', filename);
  if (fs.existsSync(filePath)) {
    return 'data:image/jpeg;base64,' + fs.readFileSync(filePath).toString('base64');
  }
  return '';
}

const headerB64 = getB64('payment_header.jpg');
const footerB64 = getB64('payment_footer.jpg');

const content = `// Payment Screen visual assets and configuration
export const PAYMENT_THEME = {
  headerBg: '#672A18',
  parchmentBg: '#FFF0D7',
  cardBg: '#FFF9EF',
  cardBorder: 'rgba(123, 50, 31, 0.22)',
  cardBorderActive: '#7B321F',
  textDarkBrown: '#542719',
  textMutedBrown: '#8C6C58',
  primaryMaroon: '#861C24',
  primaryMaroonDark: '#6F1219',
  antiqueGold: '#D6A45B',
};

export const PAYMENT_HEADER_IMAGE = '${headerB64}';
export const PAYMENT_FOOTER_IMAGE = '${footerB64}';

export type PaymentMethodId = 'upi' | 'card' | 'netbanking' | 'cod';

export interface PaymentOption {
  id: PaymentMethodId;
  name: string;
  subtitle: string;
  iconType: 'upi' | 'card' | 'bank' | 'cash';
}

export const PAYMENT_OPTIONS: PaymentOption[] = [
  {
    id: 'upi',
    name: 'UPI',
    subtitle: 'Google Pay, PhonePe, Paytm',
    iconType: 'upi',
  },
  {
    id: 'card',
    name: 'Credit / Debit Card',
    subtitle: 'Visa, Mastercard & more',
    iconType: 'card',
  },
  {
    id: 'netbanking',
    name: 'Net Banking',
    subtitle: 'All major banks',
    iconType: 'bank',
  },
  {
    id: 'cod',
    name: 'Cash on Delivery',
    subtitle: 'Pay when your order arrives',
    iconType: 'cash',
  },
];
`;

fs.writeFileSync(path.join(__dirname, '..', 'src', 'data', 'paymentData.ts'), content, 'utf8');
console.log('Saved src/data/paymentData.ts successfully! Size:', content.length);
