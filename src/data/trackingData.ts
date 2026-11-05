import { CHECKOUT_HEADER_IMAGE, CHECKOUT_FOOTER_IMAGE } from './checkoutData';

export const TRACKING_THEME = {
  headerBg: '#672A18',
  parchmentBg: '#FFF0D7',
  cardBg: '#FFF9EF',
  cardBorder: 'rgba(123, 50, 31, 0.22)',
  textDarkBrown: '#542719',
  textMutedBrown: '#8C6C58',
  primaryMaroon: '#861C24',
  primaryMaroonDark: '#6F1219',
  antiqueGold: '#D6A45B',
  successGreen: '#2E7D32',
};

export const TRACKING_HEADER_IMAGE = CHECKOUT_HEADER_IMAGE;
export const TRACKING_FOOTER_IMAGE = CHECKOUT_FOOTER_IMAGE;

export interface TrackingStep {
  id: string;
  titleHindi: string;
  titleEnglish: string;
  subtitle: string;
  time: string;
  status: 'completed' | 'active' | 'pending';
  icon: string;
}

export const ORDER_TRACKING_STEPS: TrackingStep[] = [
  {
    id: 's1',
    titleHindi: 'ऑर्डर कन्फर्म हुआ',
    titleEnglish: 'Order Confirmed',
    subtitle: 'घर का स्वाद ने आपका ऑर्डर स्वीकार किया',
    time: '01:45 PM',
    status: 'completed',
    icon: 'checkmark',
  },
  {
    id: 's2',
    titleHindi: 'रसोई में तैयारी चल रही है',
    titleEnglish: 'Kitchen Preparing Food',
    subtitle: 'ताजा पनीर बटर मसाला और नान तैयार हो रहे हैं',
    time: '01:48 PM',
    status: 'active',
    icon: 'restaurant',
  },
  {
    id: 's3',
    titleHindi: 'राजू भैया साइकिल से निकलेंगे',
    titleEnglish: 'Out for Delivery',
    subtitle: 'गरम-गरम खाना लेकर आपके घर की ओर',
    time: '02:05 PM',
    status: 'pending',
    icon: 'bicycle',
  },
  {
    id: 's4',
    titleHindi: 'दरवाजे पर डिलीवरी',
    titleEnglish: 'Delivered at Doorstep',
    subtitle: 'आनंद लें असली देसी स्वाद का!',
    time: '02:15 PM',
    status: 'pending',
    icon: 'home',
  },
];

