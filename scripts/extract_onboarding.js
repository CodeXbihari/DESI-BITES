const fs = require('fs');
const path = require('path');

const htmlPath = 'C:/Users/legen/.gemini/antigravity/brain/975a047c-8df1-4a3d-9b83-48a93c0533c9/.user_uploaded/media_1793699562973_52b731e1.html';
const html = fs.readFileSync(htmlPath, 'utf8');
const match = html.match(/const characterImages = \[\s*'([^']+)',\s*'([^']+)',\s*'([^']+)'\s*\];/);

if (!match) {
  console.error('Could not match characterImages');
  process.exit(1);
}

const lines = [
  "export interface OnboardingSlide {",
  "  id: string;",
  "  title: string;",
  "  description: string;",
  "  alt: string;",
  "  image: string;",
  "}",
  "",
  "export const ONBOARDING_THEME = {",
  "  ink: '#321B13',",
  "  bgMid: '#59301F',",
  "  bgTop: '#805039',",
  "  chalk: '#FFF1D8',",
  "  cream: '#F5E5C8',",
  "  gold: '#C69A5B',",
  "  goldBright: '#F3D49D',",
  "  goldDim: '#D9B477',",
  "  maroon: '#762C32',",
  "  olive: '#48513A',",
  "  btnBase: '#8B6036',",
  "  btnText: '#432417',",
  "  borderGold: 'rgba(225,190,132,0.22)',",
  "  skipBg: 'rgba(255,241,216,0.08)',",
  "  skipBorder: 'rgba(255,225,178,0.35)',",
  "};",
  "",
  "export const FOLK_MOTIF_SVG = `<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"40\" height=\"22\"><g fill=\"none\" stroke=\"#D8B477\" stroke-width=\"1.8\" stroke-linejoin=\"round\"><path d=\"M3 11Q13 1 25 11Q13 21 3 11zM25 11L37 3V19z\"/><path d=\"M8 11h12\" stroke-width=\"1\"/></g><circle cx=\"9\" cy=\"9.5\" r=\"1.4\" fill=\"#D8B477\"/></svg>`;",
  "",
  "export const USER_CHARACTER_IMAGES = [",
  "  '" + match[1] + "',",
  "  '" + match[2] + "',",
  "  '" + match[3] + "'",
  "];",
  "",
  "export const ONBOARDING_SLIDES: OnboardingSlide[] = [",
  "  {",
  "    id: 'slide-1',",
  "    title: 'चाय तैयार है!',",
  "    description: 'Garam chai, samosa aur litti — seedha aapke phone se order karo.',",
  "    alt: 'Bihari character pointing to a phone while ordering food',",
  "    image: USER_CHARACTER_IMAGES[0],",
  "  },",
  "  {",
  "    id: 'slide-2',",
  "    title: 'मन पसंद, ऑर्डर बंद',",
  "    description: 'Menu dekho, kulhad chai se lekar meetha tak, ek tap mein order pakka.',",
  "    alt: 'Bihari character enjoying a plate of snacks',",
  "    image: USER_CHARACTER_IMAGES[1],",
  "  },",
  "  {",
  "    id: 'slide-3',",
  "    title: 'सीधा आपके दरवाज़े',",
  "    description: 'Hamare bhaiya cycle se garam-garam pahunchayenge, bilkul time par.',",
  "    alt: 'Bihari character wearing a delivery bag and giving a thumbs up',",
  "    image: USER_CHARACTER_IMAGES[2],",
  "  },",
  "];",
  ""
];

const dest = path.join(__dirname, '..', 'src', 'data', 'onboardingData.ts');
fs.writeFileSync(dest, lines.join('\n'), 'utf8');
console.log('Successfully written onboardingData.ts with all 3 character images.');

