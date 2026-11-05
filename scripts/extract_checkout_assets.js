const fs = require('fs');
const path = require('path');

function getB64(filename) {
  const filePath = path.join(__dirname, '..', 'assets', 'images', filename);
  if (fs.existsSync(filePath)) {
    return 'data:image/jpeg;base64,' + fs.readFileSync(filePath).toString('base64');
  }
  return '';
}

const headerB64 = getB64('checkout_header.jpg');
const footerB64 = getB64('checkout_footer.jpg');
const item1B64 = getB64('checkout_item1.jpg');
const item2B64 = getB64('checkout_item2.jpg');
const item3B64 = getB64('checkout_item3.jpg');
const restIconB64 = getB64('checkout_restaurant_icon.jpg');

const content = `// Checkout Screen assets and theme
export const CHECKOUT_THEME = {
  headerBg: '#672A18',
  parchmentBg: '#FFF0D7',
  cardBg: '#FFF9EF',
  cardBorder: 'rgba(123, 50, 31, 0.22)',
  textDarkBrown: '#542719',
  textMutedBrown: '#8C6C58',
  primaryMaroon: '#861C24',
  primaryMaroonDark: '#6F1219',
  antiqueGold: '#D6A45B',
  discountGreen: '#2E7D32',
  inputBorder: '#C4A882',
  inputBg: '#FFF8EC',
};

export const CHECKOUT_HEADER_IMAGE = '${headerB64}';
export const CHECKOUT_FOOTER_IMAGE = '${footerB64}';
export const CHECKOUT_RESTAURANT_ICON = '${restIconB64}';

export interface CheckoutItem {
  id: string;
  name: string;
  variant: string;
  price: number;
  quantity: number;
  image: string;
}

export const CHECKOUT_ITEMS: CheckoutItem[] = [
  {
    id: 'ci_1',
    name: 'Paneer Butter Masala',
    variant: 'Regular',
    price: 249,
    quantity: 1,
    image: '${item1B64}',
  },
  {
    id: 'ci_2',
    name: 'Butter Naan',
    variant: '2 Pieces',
    price: 99,
    quantity: 1,
    image: '${item2B64}',
  },
  {
    id: 'ci_3',
    name: 'Masala Chaas',
    variant: 'Regular',
    price: 149,
    quantity: 1,
    image: '${item3B64}',
  },
];
`;

fs.writeFileSync(path.join(__dirname, '..', 'src', 'data', 'checkoutData.ts'), content, 'utf8');
console.log('Saved src/data/checkoutData.ts! Size:', content.length);

