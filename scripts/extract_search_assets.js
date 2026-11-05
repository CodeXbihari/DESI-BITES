const fs = require('fs');
const path = require('path');

function getB64(filename) {
  const filePath = path.join(__dirname, '..', 'assets', 'images', filename);
  if (fs.existsSync(filePath)) {
    return 'data:image/jpeg;base64,' + fs.readFileSync(filePath).toString('base64');
  }
  return '';
}

const headerB64 = getB64('search_header.jpg');
const footerB64 = getB64('search_footer_landscape.jpg');
const thumbLitti = getB64('menu_thumb_litti.jpg');
const thumbParatha = getB64('menu_thumb_paratha.jpg');
const thumbChai = getB64('menu_thumb_chai.jpg');
const thumbThekua = getB64('menu_thumb_thekua.jpg');
const thumbDahichura = getB64('menu_thumb_dahichura.jpg');
const thumbPaneerMasala = getB64('checkout_item1.jpg');
const thumbButterNaan = getB64('checkout_item2.jpg');
const thumbBiryani = getB64('card_biryani.jpg');
const thumbDalTadka = getB64('menu_thumb_dal_tadka.jpg');
const thumbChanaGhugni = getB64('menu_thumb_chana_masala.jpg');
const thumbAlooPoori = getB64('menu_thumb_aloo_poori.jpg');
const thumbChaas = getB64('checkout_item3.jpg');
const thumbGulabJamun = getB64('cat_desserts.jpg');
const thumbKheer = getB64('menu_thumb_kheer.jpg');
const thumbLassi = getB64('menu_thumb_lassi.jpg');

const content = `// Assets and menu items for Search / Menu Screen
export const SEARCH_THEME = {
  headerBg: '#672A18',
  parchmentBg: '#FFF0D7',
  cardBg: '#FFF9EF',
  cardBorder: 'rgba(123, 50, 31, 0.22)',
  textDarkBrown: '#542719',
  textMutedBrown: '#8C6C58',
  primaryMaroon: '#861C24',
  primaryMaroonDark: '#6F1219',
  antiqueGold: '#D6A45B',
  inputBorder: '#7B321F',
  inputBg: '#FFF8EC',
  vegGreen: '#2E7D32',
};

export const SEARCH_HEADER_IMAGE = '${headerB64}';
export const SEARCH_FOOTER_LANDSCAPE = '${footerB64}';

export interface SearchMenuItem {
  id: string;
  name: string;
  hindiName?: string;
  category: 'All' | 'Nashta' | 'Thali' | 'Mithai' | 'Chai';
  description: string;
  price: number;
  isVeg: boolean;
  image: string;
}

export const SEARCH_MENU_ITEMS: SearchMenuItem[] = [
  {
    id: 'sm_1',
    name: 'Litti Chokha',
    hindiName: 'लिट्टी चोखा',
    category: 'Nashta',
    description: 'Sattu-stuffed, smoky chokha',
    price: 120,
    isVeg: true,
    image: '${thumbLitti}',
  },
  {
    id: 'sm_2',
    name: 'Sattu Paratha',
    hindiName: 'सत्तू पराठा',
    category: 'Nashta',
    description: 'Crisp paratha, spiced sattu',
    price: 90,
    isVeg: true,
    image: '${thumbParatha}',
  },
  {
    id: 'sm_3',
    name: 'Masala Chai',
    hindiName: 'मसाला चाय',
    category: 'Chai',
    description: 'Kulhad chai, ginger, elaichi',
    price: 30,
    isVeg: true,
    image: '${thumbChai}',
  },
  {
    id: 'sm_4',
    name: 'Thekua',
    hindiName: 'ठेकुआ',
    category: 'Mithai',
    description: 'Wheat-jaggery crunch cookie',
    price: 40,
    isVeg: true,
    image: '${thumbThekua}',
  },
  {
    id: 'sm_5',
    name: 'Dahi Chura',
    hindiName: 'दही चूड़ा',
    category: 'Nashta',
    description: 'Curd, chura and organic jaggery',
    price: 60,
    isVeg: true,
    image: '${thumbDahichura}',
  },
  {
    id: 'sm_6',
    name: 'Paneer Butter Masala',
    hindiName: 'पनीर बटर मसाला',
    category: 'Thali',
    description: 'Rich cottage cheese in makhani gravy',
    price: 249,
    isVeg: true,
    image: '${thumbPaneerMasala}',
  },
  {
    id: 'sm_7',
    name: 'Butter Naan',
    hindiName: 'बटर नान',
    category: 'Thali',
    description: 'Clay-oven baked layered bread (2 Pcs)',
    price: 45,
    isVeg: true,
    image: '${thumbButterNaan}',
  },
  {
    id: 'sm_8',
    name: 'Bihari Dum Biryani',
    hindiName: 'बिहारी दम बिरयानी',
    category: 'Thali',
    description: 'Fragrant basmati rice, paneer & herbs',
    price: 279,
    isVeg: true,
    image: '${thumbBiryani}',
  },
  {
    id: 'sm_9',
    name: 'Dal Tadka',
    hindiName: 'दाल तड़का',
    category: 'Thali',
    description: 'Yellow lentils tempered with desi ghee',
    price: 110,
    isVeg: true,
    image: '${thumbDalTadka}',
  },
  {
    id: 'sm_10',
    name: 'Chana Ghugni',
    hindiName: 'चना घुघनी',
    category: 'Nashta',
    description: 'Spiced black chickpeas with sev',
    price: 70,
    isVeg: true,
    image: '${thumbChanaGhugni}',
  },
  {
    id: 'sm_11',
    name: 'Aloo Poori',
    hindiName: 'आलू पूरी',
    category: 'Nashta',
    description: 'Golden crisp pooris (4 pcs) with rasedaar aloo',
    price: 80,
    isVeg: true,
    image: '${thumbAlooPoori}',
  },
  {
    id: 'sm_12',
    name: 'Masala Chaas',
    hindiName: 'मसाला छाछ',
    category: 'Chai',
    description: 'Refreshing spiced buttermilk with mint',
    price: 40,
    isVeg: true,
    image: '${thumbChaas}',
  },
  {
    id: 'sm_13',
    name: 'Gulab Jamun',
    hindiName: 'गुलाब जामुन',
    category: 'Mithai',
    description: 'Soft khoya dumplings in rose syrup (2 Pcs)',
    price: 50,
    isVeg: true,
    image: '${thumbGulabJamun}',
  },
  {
    id: 'sm_14',
    name: 'Kesar Kheer',
    hindiName: 'केसर खीर',
    category: 'Mithai',
    description: 'Rice pudding with saffron & pistachios',
    price: 65,
    isVeg: true,
    image: '${thumbKheer}',
  },
  {
    id: 'sm_15',
    name: 'Malai Lassi',
    hindiName: 'मलाई लस्सी',
    category: 'Chai',
    description: 'Thick churned sweet curd with rabdi malai',
    price: 50,
    isVeg: true,
    image: '${thumbLassi}',
  },
];
`;

fs.writeFileSync(path.join(__dirname, '..', 'src', 'data', 'searchMenuData.ts'), content, 'utf8');
console.log('Saved src/data/searchMenuData.ts successfully! Size:', content.length);
