const fs = require('fs');
const path = require('path');

const userHtmlPath = 'C:/Users/legen/.gemini/antigravity/brain/975a047c-8df1-4a3d-9b83-48a93c0533c9/.user_uploaded/media_1793699562973_52b731e1.html';
const userHtml = fs.readFileSync(userHtmlPath, 'utf8');

const match = userHtml.match(/const characterImages = \[\s*'([^']+)',\s*'([^']+)',\s*'([^']+)'\s*\];/);
if (!match) {
  console.error('Images not matched');
  process.exit(1);
}

const img1 = match[1];
const img2 = match[2];
const img3 = match[3];

function getB64(filename) {
  const filePath = path.join(__dirname, '..', 'assets', 'images', filename);
  if (fs.existsSync(filePath)) {
    return 'data:image/jpeg;base64,' + fs.readFileSync(filePath).toString('base64');
  }
  return '';
}

const loginHeroBase64 = getB64('login_hero.jpg');
const loginFooterBase64 = getB64('login_footer_landscape.jpg');
const otpHeaderBase64 = getB64('otp_header.jpg');
const otpBottomBase64 = getB64('otp_bottom.jpg');
const cardBiryaniBase64 = getB64('home_dish_biryani.jpg');
const catDessertsBase64 = getB64('home_cat_dessert.jpg');
const homeHeroBannerBase64 = getB64('home_hero_banner.jpg');



const searchHeaderBase64 = getB64('search_header.jpg');
const searchFooterBase64 = getB64('search_footer_landscape.jpg');
const thumbLittiBase64 = getB64('menu_thumb_litti.jpg');
const thumbParathaBase64 = getB64('menu_thumb_paratha.jpg');
const thumbChaiBase64 = getB64('menu_thumb_chai.jpg');
const thumbThekuaBase64 = getB64('menu_thumb_thekua.jpg');
const thumbDahichuraBase64 = getB64('menu_thumb_dahichura.jpg');
const thumbPaneerMasalaBase64 = getB64('menu_thumb_paneer_masala.jpg');
const thumbChanaMasalaBase64 = getB64('menu_thumb_chana_masala.jpg');
const thumbDalTadkaBase64 = getB64('menu_thumb_dal_tadka.jpg');
const thumbAlooPooiBase64 = getB64('menu_thumb_aloo_poori.jpg');
const thumbKheerBase64 = getB64('menu_thumb_kheer.jpg');
const thumbLassiBase64 = getB64('menu_thumb_lassi.jpg');

const checkoutHeaderBase64 = getB64('checkout_header.jpg');
const checkoutFooterBase64 = getB64('checkout_footer.jpg');
const checkoutItem1Base64 = getB64('checkout_item1.jpg');
const checkoutItem2Base64 = getB64('checkout_item2.jpg');
const checkoutItem3Base64 = getB64('checkout_item3.jpg');

const paymentHeaderBase64 = getB64('payment_header.jpg');
const paymentFooterBase64 = getB64('payment_footer.jpg');

const previewHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
  <title>DESI BITES - Pixel-Accurate Login & Flow Preview</title>
  <script src="https://www.gstatic.com/antigravity/web/dev/tailwindcss.min.js"></script>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
  <link href="https://fonts.googleapis.com/css2?family=Mukta:wght@500;600;700;800&family=Yatra+One&family=Playfair+Display:ital,wght@0,600;0,700;0,800;1,600;1,700&family=Cinzel:wght@600;700&family=Cormorant+Garamond:wght@600;700&display=swap" rel="stylesheet">
  <style>
    :root {
      --heroBg: #672A18;
      --darkTerracotta: #7B321F;
      --parchmentBg: #FFF0D7;
      --warmCream: #FCE5C1;
      --deepMaroon: #861C24;
      --darkBrownText: #542719;
      --decorativeGold: #D6A45B;
    }
    
    .no-scrollbar::-webkit-scrollbar { display: none; }
    .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }

    /* STRICT SCREEN ISOLATION */
    .app-screen {
      display: none !important;
      width: 100%;
      height: 100%;
    }
    .app-screen.active-screen {
      display: flex !important;
      flex-direction: column;
    }

    /* ── 1. ONBOARDING SCREEN STYLES ── */
    .onboarding-screen {
      font-family: 'Mukta', 'Noto Sans Devanagari', sans-serif;
      color: #FFF1D8;
      background: #59301F;
      position: relative;
      overflow: hidden;
      isolation: isolate;
    }

    .skip-btn {
      align-self: flex-end;
      margin: 10px 18px 0;
      background: rgba(255, 241, 216, .08);
      border: 1px solid rgba(255, 225, 178, .35);
      font: 700 14px 'Mukta', sans-serif;
      color: #FFF1D8;
      padding: 6px 14px;
      border-radius: 999px;
      cursor: pointer;
      backdrop-filter: blur(8px);
      z-index: 20;
    }

    .ob-pager {
      flex: 1;
      display: flex;
      overflow-x: auto;
      scroll-snap-type: x mandatory;
      scrollbar-width: none;
      z-index: 10;
    }
    .ob-pager::-webkit-scrollbar { display: none; }

    .ob-slide {
      flex: 0 0 100%;
      scroll-snap-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 0 20px;
      position: relative;
      justify-content: center;
    }

    .ob-slide-arch {
      position: relative;
      width: min(100%, 300px);
      height: 330px;
      border: 1px solid rgba(225, 190, 132, .22);
      border-radius: 48% 48% 22px 22px;
      box-shadow: inset 0 0 45px rgba(255, 220, 165, .06), 0 18px 45px rgba(0, 0, 0, .18);
      display: flex;
      align-items: flex-end;
      justify-content: center;
      overflow: hidden;
      background: rgba(45, 22, 15, 0.35);
    }

    .ob-art {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: flex-end;
      justify-content: center;
      filter: drop-shadow(0 22px 24px rgba(15, 7, 3, .35));
    }

    .ob-character-img {
      display: block;
      width: 90%;
      height: 90%;
      object-fit: contain;
      object-position: center bottom;
    }

    .ob-motif {
      width: 100%;
      height: 20px;
      margin: 14px 0 10px;
      background-repeat: repeat-x;
      background-size: auto 20px;
      background-position: center;
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='22'%3E%3Cg fill='none' stroke='%23D8B477' stroke-width='1.8' stroke-linejoin='round'%3E%3Cpath d='M3 11Q13 1 25 11Q13 21 3 11zM25 11L37 3V19z'/%3E%3Cpath d='M8 11h12' stroke-width='1'/%3E%3C/g%3E%3Ccircle cx='9' cy='9.5' r='1.4' fill='%23D8B477'/%3E%3C/svg%3E");
    }

    .ob-title {
      font-family: 'Yatra One', 'Mukta', serif;
      font-size: 30px;
      color: #FFF0D5;
      text-align: center;
      margin-bottom: 6px;
    }

    .ob-desc {
      font-size: 15px;
      line-height: 1.45;
      text-align: center;
      color: #F5E5C8;
      max-width: 28ch;
    }

    .ob-foot {
      padding: 14px 22px 20px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      z-index: 20;
    }

    .ob-dots { display: flex; align-items: center; gap: 7px; }
    .ob-dots i {
      width: 7px; height: 7px; border-radius: 999px; background: rgba(255, 241, 216, .35);
      transition: width .3s, background .3s; display: inline-block;
    }
    .ob-dots i.on { width: 26px; background: #F9E2BE; }

    .ob-next {
      background: #FFF1D8;
      color: #341C14;
      font-family: 'Mukta', sans-serif;
      font-weight: 800;
      font-size: 17px;
      padding: 11px 26px;
      border-radius: 14px;
      border: 1px solid rgba(255, 235, 195, .85);
      box-shadow: 0 10px 0 #D4AE7A, 0 15px 22px rgba(0, 0, 0, .32);
      cursor: pointer;
    }

    /* ── 2. PIXEL-ACCURATE LOGIN SCREEN (AUTHENTIC BIHARI HERITAGE) ── */
    .login-screen {
      background-color: #672A18;
      position: relative;
      overflow-y: auto;
      height: 100%;
      display: flex;
      flex-direction: column;
      font-family: 'Playfair Display', 'Cormorant Garamond', Georgia, serif;
    }

    .login-hero-container {
      width: 100%;
      height: 385px;
      position: relative;
      overflow: hidden;
      background-color: #672A18;
      flex-shrink: 0;
    }

    .login-hero-artwork {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    }

    .login-top-bar {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      padding: 10px 18px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      z-index: 10;
    }

    .login-brand-logo {
      font-family: 'Playfair Display', serif;
      font-size: 19px;
      font-weight: 700;
      color: #FFF0D7;
      letter-spacing: 1.2px;
    }

    .login-help-pill {
      display: flex;
      align-items: center;
      gap: 4px;
      color: #FFF0D7;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      padding: 2px 6px;
    }

    .login-help-circle {
      width: 17px;
      height: 17px;
      border-radius: 50%;
      border: 1.2px solid #FFF0D7;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 11px;
      font-weight: 800;
      margin-left: 2px;
    }

    .login-content-card {
      background-color: #FFF0D7;
      flex: 1;
      padding: 8px 24px 18px;
      display: flex;
      flex-direction: column;
      position: relative;
      z-index: 6;
    }

    .login-devanagari-heading {
      font-family: 'Playfair Display', 'Mukta', serif;
      font-size: 30px;
      font-weight: 800;
      color: #542719;
      text-align: center;
      margin-bottom: 4px;
      letter-spacing: 0.3px;
    }

    .login-brush-underline {
      width: 88px;
      height: 3px;
      background-color: #861C24;
      margin: 0 auto 18px;
      border-radius: 2px;
      opacity: 0.9;
    }

    .login-field-label {
      font-size: 11px;
      font-weight: 800;
      letter-spacing: 1.2px;
      color: #542719;
      margin-bottom: 7px;
    }

    .login-input-container {
      display: flex;
      align-items: center;
      background-color: #FFF9EF;
      border: 1px solid #7B321F;
      border-radius: 12px;
      padding: 0 14px;
      height: 50px;
      margin-bottom: 16px;
      box-shadow: 0 1px 2px rgba(84, 39, 25, 0.05);
    }

    .login-country-code {
      display: flex;
      align-items: center;
      gap: 4px;
      font-weight: 700;
      font-size: 15px;
      color: #542719;
      padding-right: 10px;
      cursor: pointer;
    }

    .login-input-divider-v {
      width: 1px;
      height: 22px;
      background-color: #D4B8A5;
      margin-right: 12px;
    }

    .login-phone-field {
      flex: 1;
      border: none;
      background: transparent;
      font-size: 16px;
      font-weight: 600;
      color: #542719;
      outline: none;
      font-family: inherit;
    }
    .login-phone-field::placeholder { color: #A48978; }

    .login-primary-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      background-color: #861C24;
      color: #FFF0D7;
      border: none;
      border-radius: 12px;
      height: 50px;
      font-size: 16px;
      font-weight: 700;
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(134, 28, 36, 0.35);
      width: 100%;
      margin-top: 2px;
      transition: background 0.15s, transform 0.1s;
    }
    .login-primary-btn:hover { background-color: #72161D; }
    .login-primary-btn:active { transform: translateY(2px); }

    .login-paper-plane {
      transform: rotate(-20deg);
      font-size: 14px;
    }

    .login-divider-ornament {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      margin: 18px 0;
    }
    .login-divider-line {
      flex: 1;
      height: 1px;
      background-color: rgba(123, 50, 31, 0.25);
    }
    .login-lotus-mini {
      display: flex;
      align-items: flex-end;
      gap: 2px;
    }
    .lotus-petal {
      background-color: #861C24;
    }
    .petal-l {
      width: 4px; height: 8px; border-radius: 8px 0 8px 0; transform: rotate(-25deg);
    }
    .petal-c {
      width: 6px; height: 11px; border-radius: 6px 6px 0 0;
    }
    .petal-r {
      width: 4px; height: 8px; border-radius: 0 8px 0 8px; transform: rotate(25deg);
    }

    .login-new-question {
      font-family: 'Playfair Display', serif;
      font-size: 15px;
      font-weight: 800;
      color: #542719;
      text-align: center;
      margin-bottom: 10px;
    }

    .login-outline-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      border: 1px solid #7B321F;
      border-radius: 12px;
      height: 48px;
      color: #542719;
      font-size: 15px;
      font-weight: 700;
      background: transparent;
      cursor: pointer;
      width: 100%;
      transition: background 0.15s;
      margin-bottom: 16px;
    }
    .login-outline-btn:hover { background-color: rgba(123, 50, 31, 0.05); }

    .login-terms-text {
      font-size: 11.5px;
      color: #6F4B3C;
      text-align: center;
      line-height: 1.45;
      padding: 0 6px;
    }
    .login-terms-link {
      color: #861C24;
      font-weight: 700;
      text-decoration: underline;
      cursor: pointer;
    }

    .login-footer-landscape-wrap {
      width: 100%;
      height: 120px;
      overflow: hidden;
      background-color: #FFF0D7;
      flex-shrink: 0;
    }
    .login-footer-landscape-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    }

    /* ── 3. OTP SCREEN STYLES ── */
    .otp-screen {
      background: #FDE0A8;
      position: relative;
      overflow-y: auto;
      height: 100%;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }

    .otp-header-wrap {
      width: 100%; height: 195px; position: relative; overflow: hidden; background: #A50916; flex-shrink: 0;
    }
    .otp-header-img { width: 100%; height: 100%; object-fit: cover; }

    .otp-nav-overlay {
      position: absolute; top: 0; left: 0; right: 0; display: flex; justify-content: space-between; align-items: center; padding: 10px 16px; z-index: 10;
    }
    .otp-back-btn { width: 36px; height: 36px; background: transparent; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; color: #FFF0CE; font-size: 16px; }

    .otp-body {
      flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 14px 24px; position: relative; z-index: 5;
    }
    .otp-inputs-row { display: flex; justify-content: center; align-items: center; gap: 12px; margin-bottom: 20px; width: 100%; }
    .otp-digit-box {
      width: 58px; height: 58px; border-radius: 14px; border: 1.5px solid #790B16; background: rgba(255, 240, 206, 0.7); box-shadow: 0 2px 4px rgba(113, 53, 30, 0.12); text-align: center; font-size: 26px; font-weight: 700; color: #790B16; outline: none; font-family: 'Playfair Display', serif;
    }
    .otp-digit-box:focus { border: 2px solid #D99A42; background: #FFF8EC; box-shadow: 0 0 12px rgba(217, 154, 66, 0.45); }

    .otp-resend-bar { display: flex; align-items: center; justify-content: center; gap: 8px; margin-bottom: 22px; font-size: 14px; font-weight: 600; color: #790B16; font-family: 'Playfair Display', serif; }
    .otp-resend-divider { width: 1px; height: 14px; background: #790B16; opacity: 0.6; }
    .otp-resend-link { font-weight: 700; color: #790B16; text-decoration: underline; cursor: pointer; background: none; border: none; font-family: inherit; }

    .otp-verify-btn-wrap {
      width: 100%; max-width: 320px; margin: 0 auto; cursor: pointer; filter: drop-shadow(0 4px 8px rgba(109, 11, 19, 0.35));
    }
    .otp-verify-outer-gold { border-radius: 9999px; padding: 2.5px; background: #D99A42; border: 1px solid #F2BD62; }
    .otp-verify-inner-maroon {
      background: #880A17; border-radius: 9999px; height: 50px; display: flex; align-items: center; justify-content: center; gap: 10px; border: 1px solid #6D0B13; padding: 0 24px;
    }
    .otp-verify-label { color: #FFF0CE; font-size: 18px; font-weight: 700; font-family: 'Playfair Display', serif; }

    .otp-bottom-wrap { width: 100%; height: 215px; flex-shrink: 0; background: #FDE0A8; overflow: hidden; }
    .otp-bottom-img { width: 100%; height: 100%; object-fit: cover; }

    /* ── 4. SWIGGY-STYLE DESI BITES HOME SCREEN STYLES ── */
    .swiggy-home-screen {
      background: #FFF7EB;
      color: #542719;
      height: 100%;
      display: flex;
      flex-direction: column;
      position: relative;
      overflow: hidden;
      font-family: 'Mukta', sans-serif;
    }

    /* Swiggy Sticky Top Header */
    .sw-header-container {
      background: #FFF8EE;
      border-bottom: 1px solid rgba(214, 164, 91, 0.3);
      padding: 10px 16px 10px;
      flex-shrink: 0;
      box-shadow: 0 2px 8px rgba(84, 39, 25, 0.05);
      z-index: 30;
    }
    .sw-header-top {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 9px;
    }
    .sw-location-col {
      display: flex;
      flex-direction: column;
      cursor: pointer;
    }
    .sw-loc-label-row {
      display: flex;
      align-items: center;
      gap: 5px;
    }
    .sw-loc-label-row i {
      color: #861C24;
      font-size: 14px;
    }
    .sw-loc-title {
      font-size: 14px;
      font-weight: 800;
      color: #3B1B11;
      display: flex;
      align-items: center;
      gap: 4px;
    }
    .sw-loc-sub {
      font-size: 11px;
      color: #8C6C58;
      max-width: 210px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      margin-left: 19px;
    }
    .sw-header-actions {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .sw-header-cart-btn {
      position: relative;
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: #FFF0D7;
      border: 1px solid #D6A45B;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #861C24;
      font-size: 15px;
      cursor: pointer;
    }
    .sw-header-cart-badge {
      position: absolute;
      top: -3px;
      right: -3px;
      background: #861C24;
      color: #FFF0D7;
      min-width: 16px;
      height: 16px;
      border-radius: 50%;
      font-size: 9px;
      font-weight: 900;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 1px solid #FFF8EE;
    }
    .sw-profile-pill {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: #861C24;
      color: #FFF0D7;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 14px;
      font-weight: 700;
      border: 1.5px solid #D6A45B;
      cursor: pointer;
      box-shadow: 0 2px 5px rgba(134, 28, 36, 0.25);
    }

    /* Swiggy Search Input */
    .sw-search-box {
      display: flex;
      align-items: center;
      background: #FFFFFF;
      border: 1px solid rgba(214, 164, 91, 0.45);
      border-radius: 12px;
      height: 42px;
      padding: 0 12px;
      box-shadow: 0 2px 6px rgba(84, 39, 25, 0.05);
      cursor: pointer;
      transition: all 0.15s;
    }
    .sw-search-box:hover {
      border-color: #861C24;
    }
    .sw-search-placeholder {
      flex: 1;
      font-size: 12.5px;
      font-weight: 500;
      color: #9C7E6A;
      margin-left: 10px;
    }

    /* Swiggy Scroll Content */
    .sw-scroll-content {
      flex: 1;
      overflow-y: auto;
      overflow-x: hidden;
      padding-bottom: 110px;
    }

    /* Hero Carousel Banners (Swiggy Promo Cards) */
    .sw-banners-row {
      display: flex;
      gap: 12px;
      overflow-x: auto;
      padding: 14px 16px 6px;
      scroll-snap-type: x mandatory;
      scrollbar-width: none;
    }
    .sw-banners-row::-webkit-scrollbar { display: none; }
    .sw-banner-card {
      min-width: 275px;
      max-width: 275px;
      height: 135px;
      border-radius: 18px;
      padding: 14px 15px;
      position: relative;
      overflow: hidden;
      display: flex;
      justify-content: space-between;
      align-items: center;
      scroll-snap-align: start;
      box-shadow: 0 6px 14px rgba(84, 39, 25, 0.12);
      cursor: pointer;
      flex-shrink: 0;
    }
    .sw-banner-bg-1 {
      background: linear-gradient(135deg, #7B241C 0%, #A52B1E 60%, #601811 100%);
      color: #FFF2D6;
      border: 1px solid #D6A45B;
    }
    .sw-banner-bg-2 {
      background: linear-gradient(135deg, #873600 0%, #B95319 60%, #6E2C00 100%);
      color: #FFF2D6;
      border: 1px solid #E59866;
    }
    .sw-banner-bg-3 {
      background: linear-gradient(135deg, #196F3D 0%, #27AE60 60%, #145A32 100%);
      color: #EAFAF1;
      border: 1px solid #A9DFBF;
    }
    .sw-banner-left {
      flex: 1;
      z-index: 2;
    }
    .sw-banner-pill {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      background: rgba(255, 255, 255, 0.22);
      backdrop-filter: blur(4px);
      padding: 2px 8px;
      border-radius: 999px;
      font-size: 9.5px;
      font-weight: 800;
      letter-spacing: 0.5px;
      margin-bottom: 5px;
      text-transform: uppercase;
    }
    .sw-banner-title {
      font-family: 'Playfair Display', serif;
      font-size: 16px;
      font-weight: 800;
      line-height: 1.2;
      margin-bottom: 3px;
    }
    .sw-banner-sub {
      font-size: 10.5px;
      opacity: 0.9;
      margin-bottom: 8px;
      line-height: 1.25;
    }
    .sw-banner-btn {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      background: #FFF0D7;
      color: #7B241C;
      font-size: 10.5px;
      font-weight: 800;
      padding: 3px 10px;
      border-radius: 10px;
      border: none;
      box-shadow: 0 2px 4px rgba(0,0,0,0.2);
    }
    .sw-banner-art {
      width: 88px;
      height: 88px;
      border-radius: 50%;
      overflow: hidden;
      border: 2px solid rgba(255,255,255,0.45);
      box-shadow: 0 4px 10px rgba(0,0,0,0.3);
      flex-shrink: 0;
      margin-left: 8px;
      z-index: 2;
    }
    .sw-banner-art img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    /* "WHAT'S ON YOUR MIND?" (Swiggy Categories) */
    .sw-section-head {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      padding: 14px 16px 8px;
    }
    .sw-section-title {
      font-family: 'Playfair Display', serif;
      font-size: 16px;
      font-weight: 800;
      color: #3B1B11;
      letter-spacing: -0.2px;
    }
    .sw-section-sub {
      font-size: 10.5px;
      color: #8C6C58;
      margin-top: 1px;
    }
    .sw-view-all {
      font-size: 11.5px;
      font-weight: 800;
      color: #861C24;
      cursor: pointer;
    }

    .sw-cats-strip {
      display: flex;
      gap: 13px;
      overflow-x: auto;
      padding: 2px 16px 12px;
      scrollbar-width: none;
    }
    .sw-cats-strip::-webkit-scrollbar { display: none; }
    .sw-cat-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      width: 62px;
      flex-shrink: 0;
      cursor: pointer;
      transition: transform 0.15s;
    }
    .sw-cat-item:active { transform: scale(0.93); }
    .sw-cat-bubble {
      width: 58px;
      height: 58px;
      border-radius: 50%;
      background: #FFF8EC;
      border: 1.5px solid #D6A45B;
      padding: 2px;
      box-shadow: 0 3px 8px rgba(84, 39, 25, 0.08);
      overflow: hidden;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 5px;
    }
    .sw-cat-bubble img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      border-radius: 50%;
    }
    .sw-cat-name {
      font-size: 10.5px;
      font-weight: 700;
      color: #542719;
      text-align: center;
      line-height: 1.2;
    }

    /* Swiggy Restaurant Spotlight Card */
    .sw-resto-card {
      margin: 2px 16px 14px;
      background: #FFFFFF;
      border: 1px solid rgba(214, 164, 91, 0.35);
      border-radius: 16px;
      padding: 12px 14px;
      box-shadow: 0 3px 10px rgba(84, 39, 25, 0.05);
    }
    .sw-resto-top {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 7px;
    }
    .sw-resto-icon {
      width: 42px;
      height: 42px;
      border-radius: 12px;
      background: #861C24;
      color: #FFF0D7;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 18px;
      border: 1px solid #D6A45B;
      flex-shrink: 0;
    }
    .sw-resto-info { flex: 1; }
    .sw-resto-name {
      font-family: 'Playfair Display', serif;
      font-size: 15px;
      font-weight: 800;
      color: #3B1B11;
    }
    .sw-resto-meta {
      display: flex;
      align-items: center;
      gap: 5px;
      font-size: 11px;
      color: #8C6C58;
      margin-top: 1px;
    }
    .sw-rating-pill {
      background: #1B5E20;
      color: #FFFFFF;
      font-size: 9.5px;
      font-weight: 800;
      padding: 1px 5px;
      border-radius: 5px;
      display: inline-flex;
      align-items: center;
      gap: 2px;
    }
    .sw-resto-offer {
      border-top: 1px dashed rgba(214, 164, 91, 0.4);
      padding-top: 7px;
      margin-top: 7px;
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 11px;
      font-weight: 700;
      color: #861C24;
    }

    /* Swiggy Dishes List (Recommended / Popular Dishes) */
    .sw-dishes-wrap {
      padding: 0 16px;
    }
    .sw-dish-card {
      display: flex;
      justify-content: space-between;
      background: #FFFFFF;
      border: 1px solid rgba(214, 164, 91, 0.3);
      border-radius: 16px;
      padding: 12px;
      margin-bottom: 12px;
      box-shadow: 0 2px 6px rgba(84, 39, 25, 0.05);
      position: relative;
    }
    .sw-dish-left {
      flex: 1;
      padding-right: 12px;
    }
    .sw-veg-indicator {
      width: 14px;
      height: 14px;
      border: 1.5px solid #2E7D32;
      border-radius: 3px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      margin-right: 6px;
    }
    .sw-veg-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: #2E7D32;
    }
    .sw-bestseller-tag {
      display: inline-block;
      font-size: 9px;
      font-weight: 800;
      color: #B71C1C;
      background: #FFEBEE;
      padding: 1px 6px;
      border-radius: 4px;
      border: 1px solid #FFCDD2;
      text-transform: uppercase;
    }
    .sw-dish-name {
      font-size: 14px;
      font-weight: 800;
      color: #3B1B11;
      margin-top: 4px;
      line-height: 1.25;
    }
    .sw-dish-price {
      font-size: 13.5px;
      font-weight: 800;
      color: #861C24;
      margin: 2px 0 4px;
    }
    .sw-dish-desc {
      font-size: 11px;
      color: #8C6C58;
      line-height: 1.35;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
    .sw-dish-right {
      position: relative;
      width: 96px;
      height: 96px;
      flex-shrink: 0;
    }
    .sw-dish-img {
      width: 100%;
      height: 100%;
      border-radius: 12px;
      object-fit: cover;
      box-shadow: 0 2px 5px rgba(0,0,0,0.1);
    }
    .sw-add-container {
      position: absolute;
      bottom: -8px;
      left: 50%;
      transform: translateX(-50%);
      z-index: 5;
    }
    .sw-add-btn {
      background: #FFFFFF;
      border: 1.5px solid #861C24;
      color: #861C24;
      font-size: 11.5px;
      font-weight: 900;
      padding: 3px 16px;
      border-radius: 8px;
      box-shadow: 0 3px 8px rgba(0,0,0,0.15);
      cursor: pointer;
      letter-spacing: 0.5px;
      transition: all 0.15s;
      white-space: nowrap;
    }
    .sw-add-btn:active {
      transform: scale(0.95);
      background: #861C24;
      color: #FFFFFF;
    }
    .sw-stepper-btn {
      display: none;
      align-items: center;
      background: #861C24;
      color: #FFF0D7;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 3px 8px rgba(134, 28, 36, 0.3);
    }
    .sw-step-minus, .sw-step-plus {
      width: 24px;
      height: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 13px;
      font-weight: 900;
      cursor: pointer;
      border: none;
      background: transparent;
      color: #FFF0D7;
    }
    .sw-step-qty {
      min-width: 18px;
      text-align: center;
      font-size: 11.5px;
      font-weight: 900;
      color: #FFF0D7;
    }

    /* Swiggy Floating View Cart Pill */
    .sw-floating-cart-bar {
      position: absolute;
      bottom: 64px;
      left: 14px;
      right: 14px;
      background: linear-gradient(135deg, #1B5E20 0%, #2E7D32 100%);
      color: #FFFFFF;
      border-radius: 14px;
      padding: 9px 14px;
      display: none;
      justify-content: space-between;
      align-items: center;
      box-shadow: 0 6px 18px rgba(27, 94, 32, 0.35);
      z-index: 45;
      cursor: pointer;
      animation: popIn 0.25s ease-out;
      border: 1px solid rgba(255, 255, 255, 0.2);
    }
    @keyframes popIn {
      from { transform: translateY(20px); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }
    .sw-cart-info-left {
      display: flex;
      flex-direction: column;
    }
    .sw-cart-count-title {
      font-size: 11.5px;
      font-weight: 800;
      letter-spacing: 0.5px;
      text-transform: uppercase;
    }
    .sw-cart-view-right {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 12.5px;
      font-weight: 800;
    }

    /* Swiggy Fixed Bottom Navigation Bar */
    .sw-bottom-nav {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      background: #FFFDF9;
      border-top: 1px solid rgba(214, 164, 91, 0.3);
      display: flex;
      justify-content: space-around;
      align-items: center;
      padding: 7px 10px calc(7px + env(safe-area-inset-bottom, 6px));
      z-index: 50;
      box-shadow: 0 -3px 12px rgba(84, 39, 25, 0.06);
    }
    .sw-nav-tab {
      display: flex;
      flex-direction: column;
      align-items: center;
      color: #8C6C58;
      cursor: pointer;
      padding: 3px 8px;
      transition: color 0.15s;
      position: relative;
    }
    .sw-nav-tab.active {
      color: #861C24;
    }
    .sw-nav-tab i {
      font-size: 18px;
    }
    .sw-nav-label {
      font-size: 10px;
      font-weight: 700;
      margin-top: 2px;
    }
    .sw-cart-badge-dot {
      position: absolute;
      top: 0px;
      right: 4px;
      background: #861C24;
      color: #FFF0D7;
      min-width: 15px;
      height: 15px;
      border-radius: 50%;
      font-size: 9px;
      font-weight: 900;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 1px solid #FFFDF9;
      padding: 0 2px;
    }


    /* ── 5. SEARCH / MENU SCREEN STYLES ── */
    .search-screen {
      background: #FFF0D7; height: 100%; display: flex; flex-direction: column; position: relative; overflow: hidden;
    }
    .search-header-wrap {
      width: 100%; height: 175px; position: relative; overflow: hidden; flex-shrink: 0;
    }
    .search-header-img {
      width: 100%; height: 100%; object-fit: cover;
    }
    .search-top-bar {
      position: absolute; top: 8px; left: 14px; right: 14px; display: flex; justify-content: space-between; align-items: center; z-index: 10;
    }
    .search-back-btn {
      width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; color: #FFF0D7; font-size: 15px; cursor: pointer; background: none; border: none;
    }
    .search-cart-btn {
      position: relative; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; color: #FFF0D7; font-size: 18px; cursor: pointer; background: none; border: none;
    }
    .search-cart-badge {
      position: absolute; top: -2px; right: -4px; background: #861C24; color: #FFF0D7; min-width: 16px; height: 16px; border-radius: 50%; font-size: 9px; font-weight: 900; display: flex; align-items: center; justify-content: center; border: 1.5px solid #FFF0D7;
    }
    .search-hero-title {
      position: absolute; bottom: 18px; left: 18px; font-family: 'Mukta', sans-serif; font-size: 24px; font-weight: 900; color: #FFF0D7; text-shadow: 0 2px 6px rgba(40, 15, 5, 0.6);
    }
    .search-body {
      flex: 1; display: flex; flex-direction: column; overflow-y: auto; padding-top: 0;
    }
    .search-lotus-ornament {
      display: flex; align-items: flex-end; justify-content: center; gap: 2px; padding-top: 8px; padding-bottom: 4px;
    }
    .search-lotus-l { width: 5px; height: 9px; background: #861C24; border-radius: 8px 0 8px 0; transform: rotate(-25deg); }
    .search-lotus-c { width: 7px; height: 13px; background: #861C24; border-radius: 6px 6px 0 0; }
    .search-lotus-r { width: 5px; height: 9px; background: #861C24; border-radius: 0 8px 0 8px; transform: rotate(25deg); }

    .search-bar-container {
      display: flex; align-items: center; background: #FFF8EC; border: 1px solid rgba(123, 50, 31, 0.3); border-radius: 12px; height: 44px; margin: 4px 18px 10px; box-shadow: 0 2px 4px rgba(113, 53, 30, 0.08);
    }
    .search-bar-icon { margin-left: 14px; color: #8C6C58; font-size: 15px; }
    .search-bar-input {
      flex: 1; height: 100%; border: none; outline: none; background: transparent; padding: 0 10px; font-size: 14px; font-weight: 500; color: #542719; font-family: inherit;
    }
    .search-bar-input::placeholder { color: #A48978; }

    .search-pills-row {
      display: flex; gap: 8px; padding: 0 18px 10px; overflow-x: auto; flex-shrink: 0;
    }
    .search-pill {
      padding: 7px 16px; border-radius: 20px; border: 1px solid rgba(123, 50, 31, 0.35); background: transparent; font-size: 13px; font-weight: 700; color: #542719; cursor: pointer; white-space: nowrap; font-family: inherit; transition: all 0.15s;
    }
    .search-pill.active {
      background: #861C24; border-color: #861C24; color: #FFF0D7;
    }

    .search-section-label-row {
      display: flex; align-items: center; gap: 8px; padding: 0 18px 8px;
    }
    .search-section-label {
      font-size: 11px; font-weight: 800; color: #542719; letter-spacing: 1.2px;
    }
    .search-section-lotus { display: flex; align-items: flex-end; gap: 1px; }
    .search-sec-l { width: 4px; height: 7px; background: #861C24; border-radius: 6px 0 6px 0; transform: rotate(-25deg); }
    .search-sec-c { width: 5px; height: 10px; background: #861C24; border-radius: 5px 5px 0 0; }
    .search-sec-r { width: 4px; height: 7px; background: #861C24; border-radius: 0 6px 0 6px; transform: rotate(25deg); }

    .search-menu-list {
      flex: 1; overflow-y: auto; padding: 0 18px;
    }
    .search-menu-item {
      display: flex; align-items: center; background: #FFF9EF; border-radius: 14px; border: 1px solid rgba(123, 50, 31, 0.22); padding: 10px; margin-bottom: 10px; box-shadow: 0 2px 4px rgba(113, 53, 30, 0.06);
    }
    .search-item-thumb {
      width: 68px; height: 68px; border-radius: 10px; overflow: hidden; flex-shrink: 0; margin-right: 12px; background: #F0D8BB;
    }
    .search-item-thumb img { width: 100%; height: 100%; object-fit: cover; }
    .search-item-info { flex: 1; }
    .search-item-name-row { display: flex; align-items: center; gap: 5px; margin-bottom: 2px; }
    .search-veg-indicator {
      width: 14px; height: 14px; border: 1.5px solid #2E7D32; border-radius: 3px; display: flex; align-items: center; justify-content: center; flex-shrink: 0;
    }
    .search-veg-dot { width: 7px; height: 7px; border-radius: 50%; background: #2E7D32; }
    .search-item-name { font-size: 14px; font-weight: 800; color: #542719; }
    .search-item-desc { font-size: 11.5px; color: #8C6C58; font-weight: 500; }
    .search-item-price { font-size: 14px; font-weight: 800; color: #861C24; margin-top: 2px; }

    .search-add-col { margin-left: 8px; display: flex; align-items: center; justify-content: center; }
    .search-add-btn {
      background: #861C24; color: #FFF0D7; padding: 7px 16px; border-radius: 8px; border: none; font-size: 12px; font-weight: 800; cursor: pointer; letter-spacing: 0.5px; box-shadow: 0 2px 4px rgba(134, 28, 36, 0.3); transition: background 0.15s;
    }
    .search-add-btn:hover { background: #6F1219; }
    .search-stepper {
      display: flex; align-items: center; border: 1.5px solid #861C24; border-radius: 8px; overflow: hidden;
    }
    .search-stepper-btn {
      width: 28px; height: 30px; display: flex; align-items: center; justify-content: center; background: none; border: none; font-size: 16px; font-weight: 700; color: #861C24; cursor: pointer;
    }
    .search-stepper-qty { width: 22px; text-align: center; font-size: 14px; font-weight: 800; color: #542719; }

    .search-footer-landscape {
      width: 100%; height: 70px; overflow: hidden; opacity: 0.5; flex-shrink: 0; margin-top: 6px;
    }
    .search-footer-landscape img { width: 100%; height: 100%; object-fit: cover; }

    .search-floating-cart {
      position: absolute; bottom: 0; left: 0; right: 0; display: flex; align-items: center; justify-content: space-between; background: #3A1810; padding: 12px 18px 16px; z-index: 30;
    }
    .search-cart-left-info {}
    .search-cart-count { font-size: 11px; font-weight: 600; color: #C4A882; }
    .search-cart-total { font-size: 18px; font-weight: 900; color: #FFF0D7; }
    .search-cart-view-btn {
      display: flex; align-items: center; gap: 6px; background: #861C24; padding: 9px 18px; border-radius: 10px; color: #FFF0D7; font-size: 13px; font-weight: 800; cursor: pointer; border: none; box-shadow: 0 2px 4px rgba(134, 28, 36, 0.4);
    }

    /* ── 6. CHECKOUT SCREEN STYLES (PIXEL-ACCURATE RECREATION, NO APP NAME) ── */
    .checkout-screen {
      background: #FFF0D7; height: 100%; display: flex; flex-direction: column; position: relative; overflow-y: auto;
    }
    .checkout-header-wrap {
      width: 100%; height: 175px; position: relative; overflow: hidden; flex-shrink: 0; background: #672A18;
    }
    .checkout-header-img {
      width: 100%; height: 100%; object-fit: cover;
    }
    .checkout-top-bar {
      position: absolute; top: 8px; left: 14px; right: 14px; display: flex; justify-content: space-between; align-items: center; z-index: 10;
    }
    .checkout-back-btn {
      width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; color: #FFF0D7; font-size: 15px; cursor: pointer; background: none; border: none;
    }
    .checkout-help-pill {
      display: flex; align-items: center; gap: 4px; color: #FFF0D7; font-size: 13px; font-weight: 700; cursor: pointer;
    }
    .checkout-help-circle {
      width: 17px; height: 17px; border-radius: 50%; border: 1.2px solid #FFF0D7; display: flex; align-items: center; justify-content: center; font-size: 10px; font-weight: 800;
    }
    .checkout-title-wrap {
      position: absolute; bottom: 18px; left: 0; right: 0; display: flex; flex-direction: column; align-items: center; z-index: 5;
    }
    .checkout-hindi-title {
      font-family: 'Mukta', sans-serif; font-size: 26px; font-weight: 900; color: #FFF0D7; text-shadow: 0 2px 6px rgba(30, 10, 5, 0.6); line-height: 1.1;
    }
    .checkout-english-sub {
      font-size: 12.5px; color: #FFE2AD; font-weight: 500; margin-top: 2px;
    }

    .checkout-body {
      flex: 1; padding: 0 16px 24px;
    }
    .checkout-lotus-apex {
      display: flex; align-items: flex-end; justify-content: center; gap: 2px; padding: 8px 0 10px;
    }
    .checkout-lotus-l { width: 5px; height: 9px; background: #861C24; border-radius: 8px 0 8px 0; transform: rotate(-25deg); }
    .checkout-lotus-c { width: 7px; height: 13px; background: #861C24; border-radius: 6px 6px 0 0; }
    .checkout-lotus-r { width: 5px; height: 9px; background: #861C24; border-radius: 0 8px 0 8px; transform: rotate(25deg); }

    .checkout-rest-card {
      display: flex; align-items: center; background: #FFF9EF; border-radius: 14px; border: 1px solid rgba(123, 50, 31, 0.22); padding: 12px; margin-bottom: 12px; box-shadow: 0 2px 4px rgba(113, 53, 30, 0.08);
    }
    .checkout-cloche-badge {
      width: 44px; height: 44px; border-radius: 50%; background: #861C24; display: flex; align-items: center; justify-content: center; color: #FFF0D7; margin-right: 12px; border: 1.5px solid #D6A45B; font-size: 18px; flex-shrink: 0;
    }
    .checkout-rest-name { font-size: 16px; font-weight: 800; color: #542719; }
    .checkout-rest-meta { display: flex; align-items: center; gap: 4px; font-size: 12px; color: #8C6C58; margin-top: 2px; }

    .checkout-items-card {
      background: #FFF9EF; border-radius: 14px; border: 1px solid rgba(123, 50, 31, 0.22); padding: 6px 12px; margin-bottom: 12px;
    }
    .checkout-item-row {
      display: flex; align-items: center; padding: 10px 0; border-bottom: 1px solid rgba(123, 50, 31, 0.12);
    }
    .checkout-item-row:last-child { border-bottom: none; }
    .checkout-item-thumb {
      width: 52px; height: 52px; border-radius: 8px; overflow: hidden; margin-right: 10px; flex-shrink: 0; background: #F0D8BB;
    }
    .checkout-item-thumb img { width: 100%; height: 100%; object-fit: cover; }
    .checkout-item-details { flex: 1; }
    .checkout-item-title { font-size: 14px; font-weight: 800; color: #542719; }
    .checkout-item-sub { font-size: 11.5px; color: #8C6C58; margin-top: 1px; }
    .checkout-item-price { font-size: 15px; font-weight: 800; color: #542719; min-width: 44px; text-align: right; }

    .checkout-promo-bar {
      display: flex; gap: 8px; margin-bottom: 12px;
    }
    .checkout-promo-box {
      flex: 1; display: flex; align-items: center; background: #FFF8EC; border: 1px solid rgba(123, 50, 31, 0.35); border-radius: 12px; height: 42px; padding: 0 10px;
    }
    .checkout-promo-input {
      flex: 1; border: none; outline: none; background: transparent; font-size: 13.5px; font-weight: 600; color: #542719; font-family: inherit; margin-left: 6px;
    }
    .checkout-apply-btn {
      background: #861C24; color: #FFF0D7; border: none; border-radius: 12px; height: 42px; padding: 0 20px; font-size: 13px; font-weight: 800; cursor: pointer; transition: background 0.15s;
    }

    .checkout-bill-card {
      background: #FFF9EF; border-radius: 14px; border: 1px solid rgba(123, 50, 31, 0.22); padding: 14px; margin-bottom: 12px;
    }
    .checkout-bill-row {
      display: flex; justify-content: space-between; align-items: center; font-size: 13px; color: #542719; margin-bottom: 6px;
    }
    .checkout-bill-divider {
      height: 1px; background: rgba(123, 50, 31, 0.2); margin: 8px 0;
    }
    .checkout-total-row {
      display: flex; justify-content: space-between; align-items: center; font-size: 16px; font-weight: 900; color: #542719;
    }
    .checkout-total-val { font-size: 20px; font-weight: 900; }

    .checkout-address-bar {
      display: flex; align-items: center; background: #FFF9EF; border-radius: 14px; border: 1px solid rgba(123, 50, 31, 0.22); padding: 12px; margin-bottom: 14px;
    }
    .checkout-addr-icon { font-size: 18px; color: #861C24; margin-right: 8px; }
    .checkout-addr-info { flex: 1; }
    .checkout-addr-title { font-size: 11px; color: #8C6C58; font-weight: 600; }
    .checkout-addr-text { font-size: 12px; font-weight: 700; color: #542719; }
    .checkout-addr-btn {
      border: 1px solid rgba(123, 50, 31, 0.4); border-radius: 16px; padding: 4px 10px; font-size: 11px; font-weight: 700; color: #542719; background: transparent; cursor: pointer;
    }

    .checkout-pay-btn {
      width: 100%; height: 48px; border-radius: 24px; background: #861C24; color: #FFF0D7; border: none; display: flex; align-items: center; justify-content: center; gap: 8px; font-size: 15px; font-weight: 800; cursor: pointer; box-shadow: 0 4px 12px rgba(134, 28, 36, 0.35); transition: background 0.15s, transform 0.1s; margin-bottom: 12px;
    }
    .checkout-pay-btn:hover { background: #72161D; }
    .checkout-pay-btn:active { transform: translateY(2px); }

    .checkout-bottom-divider {
      display: flex; align-items: center; justify-content: center; gap: 8px; margin: 8px 0;
    }
    .checkout-div-line { flex: 1; height: 1px; background: rgba(123, 50, 31, 0.25); }
    .checkout-footer-landscape {
      width: 100%; height: 65px; overflow: hidden; border-radius: 8px; opacity: 0.7;
    }
    .checkout-footer-landscape img { width: 100%; height: 100%; object-fit: cover; }

    /* ── 7. PAYMENT SCREEN STYLES (PIXEL-ACCURATE RECREATION, NO APP NAME) ── */
    .payment-screen {
      background: #FFF0D7; height: 100%; display: flex; flex-direction: column; position: relative; overflow-y: auto;
    }
    .payment-header-wrap {
      width: 100%; height: 260px; position: relative; overflow: hidden; flex-shrink: 0; background: #672A18;
    }
    .payment-header-img {
      width: 100%; height: 100%; object-fit: cover;
    }
    .payment-top-bar {
      position: absolute; top: 8px; left: 14px; right: 14px; display: flex; justify-content: space-between; align-items: center; z-index: 10;
    }
    .payment-back-btn {
      width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; color: #FFF0D7; font-size: 15px; cursor: pointer; background: none; border: none;
    }
    .payment-help-pill {
      display: flex; align-items: center; gap: 4px; color: #FFF0D7; font-size: 13px; font-weight: 700; cursor: pointer;
    }
    .payment-help-circle {
      width: 17px; height: 17px; border-radius: 50%; border: 1.2px solid #FFF0D7; display: flex; align-items: center; justify-content: center; font-size: 10px; font-weight: 800;
    }
    .payment-body {
      flex: 1; padding: 0 16px 24px; margin-top: -24px; position: relative; z-index: 20; background: #FFF0D7; border-top-left-radius: 26px; border-top-right-radius: 26px;
    }
    .payment-lotus-apex {
      display: flex; align-items: flex-end; justify-content: center; gap: 2px; padding: 8px 0 6px;
    }
    .payment-title-wrap {
      text-align: center; margin-bottom: 12px;
    }
    .payment-hindi-title {
      font-family: 'Mukta', sans-serif; font-size: 27px; font-weight: 900; color: #542719; line-height: 1.1;
    }
    .payment-sub-row {
      display: flex; align-items: center; justify-content: center; gap: 8px; margin-top: 2px;
    }
    .payment-sub-line { width: 28px; height: 1px; background: rgba(123, 50, 31, 0.35); }
    .payment-sub-text { font-size: 12.5px; font-weight: 600; color: #542719; }

    .payment-payable-card {
      display: flex; justify-content: space-between; align-items: center; background: #FFF9EF; border-radius: 14px; border: 1px solid rgba(123, 50, 31, 0.28); padding: 12px 16px; margin-bottom: 12px; box-shadow: 0 2px 4px rgba(113, 53, 30, 0.08);
    }
    .payment-pouch-box {
      width: 32px; height: 32px; border-radius: 8px; background: #861C24; display: flex; align-items: center; justify-content: center; color: #FFF0D7; margin-right: 10px; font-size: 15px;
    }
    .payment-payable-label { font-size: 15px; font-weight: 700; color: #542719; }
    .payment-payable-val { font-size: 24px; font-weight: 900; color: #542719; }

    .payment-methods-list { display: flex; flex-direction: column; gap: 10px; margin-bottom: 12px; }
    .payment-method-item {
      display: flex; align-items: center; background: #FFF9EF; border-radius: 14px; border: 1.2px solid rgba(123, 50, 31, 0.25); padding: 12px 14px; cursor: pointer; transition: all 0.15s;
    }
    .payment-method-item.active {
      border: 1.5px solid #7B321F; background: #FFFDF9; box-shadow: 0 2px 6px rgba(123, 50, 31, 0.12);
    }
    .pm-radio {
      width: 18px; height: 18px; border-radius: 50%; border: 1.8px solid #8C6C58; display: flex; align-items: center; justify-content: center; margin-right: 12px; flex-shrink: 0;
    }
    .payment-method-item.active .pm-radio { border-color: #861C24; }
    .pm-radio-dot { width: 8px; height: 8px; border-radius: 50%; background: #861C24; }
    .pm-icon-wrap { width: 54px; display: flex; align-items: center; justify-content: center; margin-right: 10px; flex-shrink: 0; }
    .pm-divider-v { width: 1px; height: 26px; background: rgba(123, 50, 31, 0.2); margin-right: 12px; }
    .pm-text-col { flex: 1; }
    .pm-name { font-size: 14px; font-weight: 800; color: #542719; }
    .pm-sub { font-size: 11px; color: #8C6C58; margin-top: 1px; }
    .pm-check-badge {
      width: 22px; height: 22px; border-radius: 50%; background: #861C24; color: #FFF0D7; display: flex; align-items: center; justify-content: center; font-size: 12px; margin-left: 8px; flex-shrink: 0;
    }

    .payment-upi-logo { font-size: 15px; font-weight: 900; font-style: italic; color: #4B5563; display: flex; align-items: center; gap: 2px; }
    .payment-upi-tri { width: 3.5px; height: 13px; transform: skewX(-20deg); border-radius: 1px; }
    .payment-card-badge { width: 36px; height: 22px; border-radius: 4px; background: #3B82F6; padding: 2px; display: flex; flex-direction: column; justify-content: space-between; }
    .payment-card-chip { width: 6px; height: 4px; border-radius: 1px; background: #FDE047; }
    .payment-card-stripe { width: 100%; height: 3px; background: #1E3A8A; }
    .payment-bank-icon { font-size: 20px; color: #1D4ED8; }
    .payment-cash-badge { width: 36px; height: 20px; border-radius: 3px; background: #15803D; border: 1px solid #86EFAC; color: #FFF; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 900; }

    .payment-sec-notice { display: flex; align-items: center; justify-content: center; gap: 6px; font-size: 11px; font-weight: 600; color: #542719; margin: 8px 0; }
    .payment-btn-main {
      width: 100%; height: 48px; border-radius: 24px; background: #861C24; color: #FFF0D7; border: none; display: flex; align-items: center; justify-content: center; gap: 8px; font-size: 16px; font-weight: 800; cursor: pointer; box-shadow: 0 4px 12px rgba(134, 28, 36, 0.35); transition: background 0.15s, transform 0.1s; margin: 8px 0;
    }
    .payment-btn-main:hover { background: #72161D; }
    .payment-btn-main:active { transform: translateY(2px); }
    .payment-prot-footer { display: flex; align-items: center; justify-content: center; gap: 5px; font-size: 11px; font-weight: 600; color: #542719; margin-bottom: 8px; }
    .payment-landscape-wrap { width: 100%; height: 60px; overflow: hidden; border-radius: 8px; opacity: 0.75; }
    .payment-landscape-wrap img { width: 100%; height: 100%; object-fit: cover; }

    /* ── 8. ORDER TRACKING SCREEN STYLES (HERITAGE BIHARI FOLK AESTHETIC) ── */
    .tracking-screen {
      background: #FFF0D7;
      height: 100%;
      display: flex;
      flex-direction: column;
      position: relative;
      overflow: hidden;
    }
    .tracking-header-wrap {
      width: 100%;
      height: 165px;
      position: relative;
      overflow: hidden;
      flex-shrink: 0;
      background: #672A18;
    }
    .tracking-header-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    .tracking-top-bar {
      position: absolute;
      top: 10px;
      left: 14px;
      right: 14px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      z-index: 10;
    }
    .tracking-back-btn {
      width: 34px;
      height: 34px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #FFF0D7;
      font-size: 16px;
      cursor: pointer;
      background: rgba(45, 15, 8, 0.45);
      border-radius: 50%;
      border: 1px solid rgba(255, 240, 215, 0.3);
      backdrop-filter: blur(4px);
    }
    .tracking-title-wrap {
      position: absolute;
      bottom: 14px;
      left: 0;
      right: 0;
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      z-index: 5;
    }
    .tracking-hindi-title {
      font-family: 'Mukta', sans-serif;
      font-size: 24px;
      font-weight: 900;
      color: #FFF0D7;
      text-shadow: 0 2px 6px rgba(30, 10, 5, 0.6);
      line-height: 1.1;
    }
    .tracking-english-sub {
      font-size: 12px;
      color: #FFE2AD;
      font-weight: 600;
      margin-top: 2px;
      letter-spacing: 0.4px;
    }

    .tracking-body {
      flex: 1;
      overflow-y: auto;
      overflow-x: hidden;
      padding: 0 16px 36px;
      scroll-behavior: smooth;
    }

    /* Live Status Card */
    .tracking-status-card {
      background: #FFF9EF;
      border-radius: 16px;
      border: 1px solid rgba(123, 50, 31, 0.22);
      padding: 14px;
      margin-bottom: 12px;
      box-shadow: 0 3px 8px rgba(113, 53, 30, 0.08);
    }
    .tracking-status-top {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
      gap: 8px;
    }
    .tracking-status-badge-row {
      display: flex;
      align-items: center;
      gap: 8px;
      min-width: 0;
    }
    .tracking-status-main-text {
      font-size: 13.5px;
      font-weight: 800;
      color: #542719;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .tracking-pulse-dot {
      width: 9px;
      height: 9px;
      border-radius: 50%;
      background: #2E7D32;
      flex-shrink: 0;
      box-shadow: 0 0 0 3px rgba(46, 125, 50, 0.2);
    }
    .tracking-status-pill {
      font-size: 10px;
      font-weight: 800;
      color: #1B5E20;
      background: #E8F5E9;
      border: 1px solid #A5D6A7;
      padding: 2px 7px;
      border-radius: 999px;
      flex-shrink: 0;
    }
    .tracking-status-middle {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      margin-bottom: 10px;
      gap: 8px;
    }
    .tracking-eta-col {
      display: flex;
      flex-direction: column;
    }
    .tracking-eta-label {
      font-size: 9.5px;
      font-weight: 800;
      color: #8C6C58;
      letter-spacing: 0.6px;
    }
    .tracking-eta-val {
      font-size: 19px;
      font-weight: 900;
      color: #861C24;
      line-height: 1.15;
      margin-top: 2px;
    }
    .tracking-eta-time {
      font-size: 11.5px;
      font-weight: 700;
      color: #542719;
      white-space: nowrap;
      flex-shrink: 0;
    }
    .tracking-progress-track {
      width: 100%;
      height: 6px;
      background: #EBD2B8;
      border-radius: 999px;
      overflow: hidden;
    }
    .tracking-progress-bar {
      width: 45%;
      height: 100%;
      background: linear-gradient(90deg, #861C24 0%, #D6A45B 100%);
      border-radius: 999px;
    }

    /* Rider Card */
    .tracking-rider-card {
      display: flex;
      align-items: center;
      background: #FFF9EF;
      border-radius: 16px;
      border: 1px solid rgba(123, 50, 31, 0.22);
      padding: 12px 14px;
      margin-bottom: 12px;
      box-shadow: 0 2px 6px rgba(113, 53, 30, 0.06);
      gap: 10px;
    }
    .tracking-rider-avatar {
      width: 42px;
      height: 42px;
      border-radius: 50%;
      background: #861C24;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #FFF0D7;
      border: 1.5px solid #D6A45B;
      font-size: 17px;
      flex-shrink: 0;
      box-shadow: 0 2px 6px rgba(134, 28, 36, 0.25);
    }
    .tracking-rider-info {
      flex: 1;
      min-width: 0;
    }
    .tracking-rider-name {
      font-size: 13.5px;
      font-weight: 800;
      color: #542719;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .tracking-rider-meta {
      display: flex;
      align-items: center;
      gap: 5px;
      font-size: 11px;
      color: #8C6C58;
      margin-top: 2px;
      white-space: nowrap;
    }
    .tracking-rider-rating {
      background: #FFF0D7;
      border: 1px solid #D6A45B;
      color: #7B321F;
      font-size: 10px;
      font-weight: 800;
      padding: 1px 5px;
      border-radius: 4px;
      display: inline-flex;
      align-items: center;
      gap: 2px;
    }
    .tracking-rider-rating i {
      color: #F59E0B;
      font-size: 9px;
    }
    .tracking-rider-actions {
      display: flex;
      gap: 8px;
      flex-shrink: 0;
    }
    .tracking-action-circle {
      width: 34px;
      height: 34px;
      border-radius: 50%;
      border: 1px solid rgba(134, 28, 36, 0.35);
      background: #FFF8EC;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #861C24;
      font-size: 13px;
      cursor: pointer;
      transition: all 0.15s;
    }
    .tracking-action-circle:active {
      background: #861C24;
      color: #FFF0D7;
      transform: scale(0.92);
    }

    /* Timeline Stepper Card */
    .tracking-timeline-card {
      background: #FFF9EF;
      border-radius: 16px;
      border: 1px solid rgba(123, 50, 31, 0.22);
      padding: 14px;
      margin-bottom: 12px;
      box-shadow: 0 2px 6px rgba(113, 53, 30, 0.06);
    }
    .tracking-timeline-title {
      font-size: 11px;
      font-weight: 900;
      color: #542719;
      letter-spacing: 0.8px;
      margin-bottom: 14px;
      text-transform: uppercase;
    }
    .tracking-step-row {
      display: flex;
      position: relative;
      padding-bottom: 16px;
    }
    .tracking-step-row:last-child {
      padding-bottom: 0;
    }
    .tracking-step-indicator {
      width: 24px;
      display: flex;
      flex-direction: column;
      align-items: center;
      margin-right: 12px;
      flex-shrink: 0;
      position: relative;
    }
    .tracking-step-circle {
      width: 22px;
      height: 22px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 10px;
      font-weight: 800;
      flex-shrink: 0;
      z-index: 2;
    }
    .tracking-step-circle.done {
      background: #861C24;
      color: #FFF0D7;
      box-shadow: 0 2px 4px rgba(134, 28, 36, 0.25);
    }
    .tracking-step-circle.active {
      background: #FFF9EF;
      border: 2px solid #861C24;
      box-shadow: 0 0 0 3px rgba(134, 28, 36, 0.15);
    }
    .tracking-step-circle.active .active-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #861C24;
    }
    .tracking-step-circle.pending {
      background: #EBD2B8;
      border: 1px solid #C4A882;
    }
    .tracking-step-circle.pending .pending-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: #A48978;
    }
    .tracking-step-line {
      position: absolute;
      top: 22px;
      bottom: 0;
      left: 50%;
      width: 2px;
      transform: translateX(-50%);
    }
    .tracking-step-line.done {
      background: #861C24;
    }
    .tracking-step-line.pending {
      background: #E5CCA7;
    }
    .tracking-step-content {
      flex: 1;
      min-width: 0;
    }
    .tracking-step-header {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      gap: 8px;
      margin-bottom: 2px;
    }
    .tracking-step-title {
      font-size: 13px;
      font-weight: 800;
      color: #542719;
      line-height: 1.25;
    }
    .tracking-step-time {
      font-size: 10.5px;
      font-weight: 700;
      color: #8C6C58;
      flex-shrink: 0;
    }
    .tracking-step-desc {
      font-size: 11px;
      color: #8C6C58;
      line-height: 1.35;
      word-break: break-word;
    }

    /* Summary Card */
    .tracking-summary-card {
      background: #FFF9EF;
      border-radius: 16px;
      border: 1px solid rgba(123, 50, 31, 0.22);
      padding: 14px;
      margin-bottom: 16px;
      box-shadow: 0 2px 6px rgba(113, 53, 30, 0.06);
    }
    .tracking-summary-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 8px;
    }
    .tracking-order-id {
      font-size: 13px;
      font-weight: 800;
      color: #542719;
    }
    .tracking-restaurant-title {
      font-size: 11px;
      color: #8C6C58;
    }
    .tracking-paid-badge {
      font-size: 10.5px;
      font-weight: 800;
      color: #1B5E20;
      background: #E8F5E9;
      border: 1px solid #A5D6A7;
      padding: 2px 8px;
      border-radius: 999px;
      flex-shrink: 0;
    }
    .tracking-summary-divider {
      height: 1px;
      background: rgba(123, 50, 31, 0.15);
      margin: 8px 0;
    }
    .tracking-items-list {
      display: flex;
      flex-direction: column;
      gap: 6px;
      font-size: 12px;
      color: #542719;
    }
    .tracking-item-line {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 8px;
    }
    .tracking-item-name {
      font-weight: 500;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .tracking-item-price {
      font-weight: 800;
      color: #542719;
      flex-shrink: 0;
    }
    .tracking-address-row {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 11.5px;
      color: #542719;
      font-weight: 500;
      min-width: 0;
    }
    .tracking-address-row i {
      color: #861C24;
      font-size: 13px;
      flex-shrink: 0;
    }
    .tracking-address-text {
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .tracking-home-btn {
      width: 100%;
      height: 48px;
      border-radius: 24px;
      background: #861C24;
      color: #FFF0D7;
      border: none;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      font-size: 14.5px;
      font-weight: 800;
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(134, 28, 36, 0.3);
      transition: background 0.15s, transform 0.1s;
      margin-bottom: 14px;
    }
    .tracking-home-btn:hover { background: #72161D; }
    .tracking-home-btn:active { transform: translateY(2px); }


  </style>
</head>
<body class="bg-slate-950 text-slate-100 min-h-screen flex flex-col items-center justify-center p-3 select-none">

  <!-- Top Controller Bar with Screen Navigation -->
  <div class="max-w-[420px] w-full mb-3 flex items-center justify-between text-xs text-slate-400">
    <div class="flex items-center gap-2">
      <span class="inline-block w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
      <span class="font-bold text-slate-200 uppercase tracking-wider">DESI BITES App Flow</span>
    </div>
    
    <!-- 8-Way Screen Switcher -->
    <div class="flex items-center bg-slate-900 border border-slate-800 rounded-full p-1 gap-1 flex-wrap justify-center">
      <button onclick="showScreen('onboarding')" id="btn-tab-ob" class="px-2 py-1 rounded-full text-[10.5px] font-medium text-slate-400 hover:text-white transition-all">
        1. Onboard
      </button>
      <button onclick="showScreen('login')" id="btn-tab-login" class="px-2 py-1 rounded-full text-[10.5px] font-bold bg-amber-600 text-white transition-all">
        2. Login
      </button>
      <button onclick="showScreen('otp')" id="btn-tab-otp" class="px-2 py-1 rounded-full text-[10.5px] font-medium text-slate-400 hover:text-white transition-all">
        3. OTP
      </button>
      <button onclick="showScreen('home')" id="btn-tab-home" class="px-2 py-1 rounded-full text-[10.5px] font-medium text-slate-400 hover:text-white transition-all">
        4. Home
      </button>
      <button onclick="showScreen('search')" id="btn-tab-search" class="px-2 py-1 rounded-full text-[10.5px] font-medium text-slate-400 hover:text-white transition-all">
        5. Menu
      </button>
      <button onclick="showScreen('checkout')" id="btn-tab-checkout" class="px-2 py-1 rounded-full text-[10.5px] font-medium text-slate-400 hover:text-white transition-all">
        6. Checkout
      </button>
      <button onclick="showScreen('payment')" id="btn-tab-payment" class="px-2 py-1 rounded-full text-[10.5px] font-medium text-slate-400 hover:text-white transition-all">
        7. Pay
      </button>
      <button onclick="showScreen('tracking')" id="btn-tab-tracking" class="px-2 py-1 rounded-full text-[10.5px] font-medium text-slate-400 hover:text-white transition-all">
        8. Track
      </button>
    </div>
  </div>

  <!-- Mobile Frame -->
  <div class="w-full max-w-[390px] h-[780px] bg-slate-900 text-slate-900 rounded-[44px] shadow-2xl border-[10px] border-slate-800 relative flex flex-col overflow-hidden">
    
    <!-- Phone Notch / Status Bar -->
    <div id="status-bar" class="h-8 bg-[#672A18] text-[#FFF0D7] flex items-center justify-between px-7 shrink-0 z-40 transition-colors duration-500">
      <span class="text-xs font-bold">9:41</span>
      <div class="w-24 h-4 bg-black/60 rounded-full flex items-center justify-center">
        <div class="w-2.5 h-2.5 rounded-full bg-slate-800 mr-2"></div>
      </div>
      <div class="flex items-center gap-1.5 text-xs">
        <i class="fa-solid fa-signal text-[10px]"></i>
        <i class="fa-solid fa-wifi text-[10px]"></i>
        <i class="fa-solid fa-battery-full text-xs"></i>
      </div>
    </div>

    <!-- ── SCREEN 1: ONBOARDING SCREEN ONLY ── -->
    <div id="screen-onboarding" class="app-screen onboarding-screen">
      <button class="skip-btn" id="ob-skip" onclick="showScreen('login')">छोड़ें · Skip</button>

      <div class="ob-pager" id="ob-pager">
        <section class="ob-slide">
          <div class="ob-slide-arch">
            <div class="ob-art">
              <img src="${img1}" class="ob-character-img" alt="Bihari character">
            </div>
          </div>
          <div class="ob-motif"></div>
          <h1 class="ob-title">चाय तैयार है!</h1>
          <p class="ob-desc">Garam chai, samosa aur litti — seedha aapke phone se order karo.</p>
        </section>

        <section class="ob-slide">
          <div class="ob-slide-arch">
            <div class="ob-art">
              <img src="${img2}" class="ob-character-img" alt="Bihari character">
            </div>
          </div>
          <div class="ob-motif"></div>
          <h1 class="ob-title">मन पसंद, ऑर्डर बंद</h1>
          <p class="ob-desc">Menu dekho, kulhad chai se lekar meetha tak, ek tap mein order pakka.</p>
        </section>

        <section class="ob-slide">
          <div class="ob-slide-arch">
            <div class="ob-art">
              <img src="${img3}" class="ob-character-img" alt="Bihari character">
            </div>
          </div>
          <div class="ob-motif"></div>
          <h1 class="ob-title">सीधा आपके दरवाज़े</h1>
          <p class="ob-desc">Hamare bhaiya cycle se garam-garam pahunchayenge, bilkul time par.</p>
        </section>
      </div>

      <div class="ob-foot">
        <div class="ob-dots" id="ob-dots">
          <i class="on"></i>
          <i></i>
          <i></i>
        </div>
        <button class="ob-next" id="ob-next">आगे बढ़ें</button>
      </div>
    </div>

    <!-- ── SCREEN 2: PIXEL-ACCURATE LOGIN SCREEN (AUTHENTIC BIHARI HERITAGE) ── -->
    <div id="screen-login" class="app-screen login-screen active-screen no-scrollbar">
      
      <!-- Top Hero Section with Bihari Character, Gamcha, Temple, Sun & Curved Wave -->
      <div class="login-hero-container">
        <img src="${loginHeroBase64}" class="login-hero-artwork" alt="Bihari Folk Hero Illustration">
        
        <!-- Top App Bar Overlay (Clean, no app name, single Help button) -->
        <div class="login-top-bar">
          <div class="w-8 h-8 flex items-center justify-center cursor-pointer text-[#FFF0D7] hover:opacity-80 transition-opacity" onclick="showScreen('onboarding')" title="Back to Onboarding">
            <i class="fa-solid fa-arrow-left"></i>
          </div>
          <div class="login-help-pill" onclick="alert('Help & Support\n\nToll Free: 1800-DESI-EXP\nWhatsApp: +91 98765 43210\nEmail: help@desiexpress.in')">
            <span>Help</span>
            <div class="login-help-circle">?</div>
          </div>
        </div>
      </div>

      <!-- Login Content Section (Warm Parchment #FFF0D7) -->
      <div class="login-content-card">
        <!-- Devanagari Heading -->
        <h2 class="login-devanagari-heading">फिर से स्वागत है</h2>
        <div class="login-brush-underline"></div>

        <!-- Mobile Number Section -->
        <label class="login-field-label">MOBILE NUMBER</label>
        <div class="login-input-container">
          <div class="login-country-code" onclick="alert('Supported country: India (+91)')">
            <span>+91</span>
            <i class="fa-solid fa-chevron-down text-[10px]"></i>
          </div>
          <div class="login-input-divider-v"></div>
          <input type="tel" id="input-phone" maxlength="10" placeholder="98765 43210" class="login-phone-field" value="9876543210">
        </div>

        <!-- Send OTP Primary Button -->
        <button class="login-primary-btn" onclick="handleLoginSubmit()">
          <i class="fa-solid fa-paper-plane login-paper-plane"></i>
          <span>Send OTP</span>
        </button>

        <!-- Lotus Divider with Leaf in Middle -->
        <div class="login-divider-ornament">
          <div class="login-divider-line"></div>
          <div class="login-lotus-mini">
            <div class="lotus-petal petal-l"></div>
            <div class="lotus-petal petal-c"></div>
            <div class="lotus-petal petal-r"></div>
          </div>
          <div class="login-divider-line"></div>
        </div>

        <!-- Sub-question -->
        <div class="login-new-question">नए हैं?</div>

        <!-- Create Account Outlined Button -->
        <button class="login-outline-btn" onclick="showScreen('otp')">
          <i class="fa-solid fa-user-plus text-sm"></i>
          <span>Create an account</span>
        </button>

        <!-- Terms and Privacy Footer -->
        <div class="login-terms-text">
          By continuing you agree to the <span class="login-terms-link" onclick="alert('Terms of Service: Fresh food guaranteed delivery.')">Terms</span> and <span class="login-terms-link" onclick="alert('Privacy Policy: Customer data is never shared.')">Privacy Policy</span>.
        </div>
      </div>

      <!-- Bottom Bihar Village Landscape with Trees & Temple Silhouettes -->
      <div class="login-footer-landscape-wrap">
        <img src="${loginFooterBase64}" class="login-footer-landscape-img" alt="Bihar Village Silhouette Landscape">
      </div>
    </div>

    <!-- ── SCREEN 3: OTP VERIFICATION SCREEN ── -->
    <div id="screen-otp" class="app-screen otp-screen no-scrollbar">
      <div class="otp-header-wrap">
        <img src="${otpHeaderBase64}" class="otp-header-img" alt="Verify Code Header">
        
        <div class="otp-nav-overlay">
          <button class="otp-back-btn" onclick="showScreen('login')">
            <i class="fa-solid fa-chevron-left"></i>
          </button>
          <div class="w-8"></div>
        </div>
      </div>

      <div class="otp-body">
        <div class="otp-inputs-row">
          <input type="text" inputmode="numeric" pattern="[0-9]*" maxlength="1" class="otp-digit-box" value="" id="otp-0"
            oninput="otpAdvance(this,0)" onkeydown="otpBackspace(event,0)" onfocus="this.select()">
          <input type="text" inputmode="numeric" pattern="[0-9]*" maxlength="1" class="otp-digit-box" value="" id="otp-1"
            oninput="otpAdvance(this,1)" onkeydown="otpBackspace(event,1)" onfocus="this.select()">
          <input type="text" inputmode="numeric" pattern="[0-9]*" maxlength="1" class="otp-digit-box" value="" id="otp-2"
            oninput="otpAdvance(this,2)" onkeydown="otpBackspace(event,2)" onfocus="this.select()">
          <input type="text" inputmode="numeric" pattern="[0-9]*" maxlength="1" class="otp-digit-box" value="" id="otp-3"
            oninput="otpAdvance(this,3)" onkeydown="otpBackspace(event,3)" onfocus="this.select()">
        </div>

        <div class="otp-resend-bar">
          <i class="fa-regular fa-clock clock-icon"></i>
          <span id="otp-timer-text">Resend in 00:30</span>
          <div class="otp-resend-divider"></div>
          <button class="otp-resend-link" id="otp-resend-btn" disabled style="opacity:0.4;cursor:not-allowed;" onclick="otpResend()">Resend</button>
        </div>

        <div class="otp-verify-btn-wrap" onclick="showScreen('home')">
          <div class="otp-verify-outer-gold">
            <div class="otp-verify-inner-maroon">
              <span class="otp-verify-label">Verify</span>
              <span class="text-[#F2BD62] font-bold text-xl">→</span>
            </div>
          </div>
        </div>

        <div class="text-[11px] text-[#71351E]/70 font-serif mt-3 text-center">
          Code sent to +91 98765 43210
        </div>
      </div>

      <div class="otp-bottom-wrap">
        <img src="${otpBottomBase64}" class="otp-bottom-img" alt="Heritage Artwork">
      </div>
    </div>


    <!-- ── SCREEN 4: SWIGGY-STYLE DESI BITES HOME SCREEN ── -->
    <div id="screen-home" class="app-screen swiggy-home-screen no-scrollbar">
      
      <!-- Swiggy Sticky Top Header with Location & Profile -->
      <div class="sw-header-container">
        <div class="sw-header-top">
          <div class="sw-location-col" onclick="showScreen('search')" title="Change Delivery Address">
            <div class="sw-loc-label-row">
              <i class="fa-solid fa-location-dot"></i>
              <span class="sw-loc-title">221B Baker Street, London <i class="fa-solid fa-chevron-down text-[10px]"></i></span>
            </div>
            <span class="sw-loc-sub">Marylebone, Central London • 15 Mins</span>
          </div>

          <div class="sw-header-actions">
            <div class="sw-header-cart-btn" onclick="showScreen('checkout')" title="Open Cart">
              <i class="fa-solid fa-basket-shopping"></i>
              <div class="sw-header-cart-badge" id="sw-top-cart-badge">0</div>
            </div>
            <div class="sw-profile-pill" onclick="alert('Desi Bites Club Member: +91 98765 43210')" title="Account Profile">
              <i class="fa-regular fa-user"></i>
            </div>
          </div>
        </div>

        <!-- Swiggy Rounded Search Box -->
        <div class="sw-search-box" onclick="showScreen('search')" title="Search in Menu">
          <i class="fa-solid fa-magnifying-glass text-[#861C24] text-sm"></i>
          <span class="sw-search-placeholder">Search "Litti Chokha", "Dum Biryani", "Paneer"...</span>
          <i class="fa-solid fa-microphone text-[#861C24] text-sm"></i>
        </div>
      </div>

      <!-- Swiggy Scrollable Body -->
      <div class="sw-scroll-content no-scrollbar">

        <!-- 1. Hero Promo Banners (Swiggy Horizontal Carousel) -->
        <div class="sw-banners-row no-scrollbar">
          <!-- Banner 1: Flat 20% OFF -->
          <div class="sw-banner-card sw-banner-bg-1" onclick="showScreen('search')">
            <div class="sw-banner-left">
              <span class="sw-banner-pill"><i class="fa-solid fa-tag"></i> Code: DESI20</span>
              <div class="sw-banner-title">Flat 20% OFF</div>
              <div class="sw-banner-sub">Authentic Bihari Rasoi<br>Delivered in 15 Mins</div>
              <button class="sw-banner-btn"><span>Order Now</span> <i class="fa-solid fa-arrow-right text-[9px]"></i></button>
            </div>
            <div class="sw-banner-art">
              <img src="${cardBiryaniBase64}" alt="Dum Biryani">
            </div>
          </div>

          <!-- Banner 2: Express Delivery -->
          <div class="sw-banner-card sw-banner-bg-2" onclick="showScreen('search')">
            <div class="sw-banner-left">
              <span class="sw-banner-pill"><i class="fa-solid fa-bolt"></i> 12-15 Mins</span>
              <div class="sw-banner-title">Express Delivery</div>
              <div class="sw-banner-sub">Clay oven baked fresh<br>100% Desi Ghee</div>
              <button class="sw-banner-btn"><span>Explore</span> <i class="fa-solid fa-arrow-right text-[9px]"></i></button>
            </div>
            <div class="sw-banner-art">
              <img src="${thumbLittiBase64}" alt="Litti Chokha">
            </div>
          </div>

          <!-- Banner 3: Free Dessert -->
          <div class="sw-banner-card sw-banner-bg-3" onclick="showScreen('search')">
            <div class="sw-banner-left">
              <span class="sw-banner-pill"><i class="fa-solid fa-gift"></i> Special Offer</span>
              <div class="sw-banner-title">Free Gulab Jamun</div>
              <div class="sw-banner-sub">On orders above ₹299<br>Melt-in-mouth soft</div>
              <button class="sw-banner-btn"><span>Claim</span> <i class="fa-solid fa-arrow-right text-[9px]"></i></button>
            </div>
            <div class="sw-banner-art">
              <img src="${catDessertsBase64}" alt="Gulab Jamun">
            </div>
          </div>
        </div>

        <!-- 2. "WHAT'S ON YOUR MIND?" (Swiggy Circular Food Categories) -->
        <div class="sw-section-head">
          <div>
            <div class="sw-section-title">What's on your mind?</div>
            <div class="sw-section-sub">Handcrafted Bihari & North Indian Delicacies</div>
          </div>
          <span class="sw-view-all" onclick="showScreen('search')">See All →</span>
        </div>

        <div class="sw-cats-strip no-scrollbar">
          <div class="sw-cat-item" onclick="openMenuWithCat('Litti')">
            <div class="sw-cat-bubble"><img src="${thumbLittiBase64}" alt="Litti"></div>
            <span class="sw-cat-name">Litti Chokha</span>
          </div>
          <div class="sw-cat-item" onclick="openMenuWithCat('Thali')">
            <div class="sw-cat-bubble"><img src="${cardBiryaniBase64}" alt="Biryani"></div>
            <span class="sw-cat-name">Dum Biryani</span>
          </div>
          <div class="sw-cat-item" onclick="openMenuWithCat('Thali')">
            <div class="sw-cat-bubble"><img src="${checkoutItem1Base64}" alt="Paneer"></div>
            <span class="sw-cat-name">Paneer Gravy</span>
          </div>
          <div class="sw-cat-item" onclick="openMenuWithCat('Thali')">
            <div class="sw-cat-bubble"><img src="${thumbDalTadkaBase64}" alt="Dal Tadka"></div>
            <span class="sw-cat-name">Dal Tadka</span>
          </div>
          <div class="sw-cat-item" onclick="openMenuWithCat('Breakfast')">
            <div class="sw-cat-bubble"><img src="${thumbDahichuraBase64}" alt="Dahi Chura"></div>
            <span class="sw-cat-name">Dahi Chura</span>
          </div>
          <div class="sw-cat-item" onclick="openMenuWithCat('Breakfast')">
            <div class="sw-cat-bubble"><img src="${thumbParathaBase64}" alt="Paratha"></div>
            <span class="sw-cat-name">Sattu Paratha</span>
          </div>
          <div class="sw-cat-item" onclick="openMenuWithCat('Sweets')">
            <div class="sw-cat-bubble"><img src="${thumbKheerBase64}" alt="Kheer"></div>
            <span class="sw-cat-name">Kesar Kheer</span>
          </div>
          <div class="sw-cat-item" onclick="openMenuWithCat('Drinks')">
            <div class="sw-cat-bubble"><img src="${thumbLassiBase64}" alt="Lassi"></div>
            <span class="sw-cat-name">Kulhad Lassi</span>
          </div>
        </div>

        <!-- 3. Swiggy Restaurant Spotlight Card -->
        <div class="sw-resto-card">
          <div class="sw-resto-top">
            <div class="sw-resto-icon">
              <i class="fa-solid fa-utensils"></i>
            </div>
            <div class="sw-resto-info">
              <div class="sw-resto-name">DESI BITES • Heritage Rasoi</div>
              <div class="sw-resto-meta">
                <span class="sw-rating-pill">⭐ 4.8</span>
                <span>(1,450+ ratings)</span>
                <span>• 15-20 Mins</span>
              </div>
            </div>
          </div>
          <div class="text-[11px] text-[#8C6C58]">Authentic Bihari, Mithila & North Indian • ₹150 for one</div>
          <div class="sw-resto-offer">
            <i class="fa-solid fa-tags"></i>
            <span>FLAT 20% OFF up to ₹100 | Use Code DESI20</span>
          </div>
        </div>

        <!-- 4. Swiggy Dishes Section (Recommended Dishes with ADD Button) -->
        <div class="sw-section-head">
          <div>
            <div class="sw-section-title">Recommended For You</div>
            <div class="sw-section-sub">Most ordered dishes from our kitchen</div>
          </div>
          <span class="sw-view-all" onclick="showScreen('search')">Full Menu →</span>
        </div>

        <div class="sw-dishes-wrap">

          <!-- Dish 1: Litti Chokha (sm_1) -->
          <div class="sw-dish-card">
            <div class="sw-dish-left">
              <div>
                <span class="sw-veg-indicator"><span class="sw-veg-dot"></span></span>
                <span class="sw-bestseller-tag">⭐ Bestseller</span>
              </div>
              <div class="sw-dish-name">Litti Chokha (2 Pcs)</div>
              <div class="sw-dish-price">₹120</div>
              <div class="sw-dish-desc">Traditional roasted wheat balls stuffed with spiced sattu, served with baingan chokha, aloo chokha & pure desi ghee.</div>
            </div>
            <div class="sw-dish-right">
              <img src="${thumbLittiBase64}" class="sw-dish-img" alt="Litti Chokha">
              <div class="sw-add-container">
                <button class="sw-add-btn" id="home-add-sm_1" onclick="updateQty('sm_1', 1)">ADD</button>
                <div class="sw-stepper-btn" id="home-stepper-sm_1">
                  <button class="sw-step-minus" onclick="updateQty('sm_1', -1)">−</button>
                  <span class="sw-step-qty" id="home-qty-sm_1">0</span>
                  <button class="sw-step-plus" onclick="updateQty('sm_1', 1)">+</button>
                </div>
              </div>
            </div>
          </div>

          <!-- Dish 2: Paneer Butter Masala (sm_6) -->
          <div class="sw-dish-card">
            <div class="sw-dish-left">
              <div>
                <span class="sw-veg-indicator"><span class="sw-veg-dot"></span></span>
                <span class="sw-bestseller-tag">🔥 Chef Special</span>
              </div>
              <div class="sw-dish-name">Paneer Butter Masala</div>
              <div class="sw-dish-price">₹249</div>
              <div class="sw-dish-desc">Fresh cottage cheese cubes simmered in velvety cashew-tomato makhani gravy with butter & aromatic spices.</div>
            </div>
            <div class="sw-dish-right">
              <img src="${checkoutItem1Base64}" class="sw-dish-img" alt="Paneer Butter Masala">
              <div class="sw-add-container">
                <button class="sw-add-btn" id="home-add-sm_6" onclick="updateQty('sm_6', 1)">ADD</button>
                <div class="sw-stepper-btn" id="home-stepper-sm_6">
                  <button class="sw-step-minus" onclick="updateQty('sm_6', -1)">−</button>
                  <span class="sw-step-qty" id="home-qty-sm_6">0</span>
                  <button class="sw-step-plus" onclick="updateQty('sm_6', 1)">+</button>
                </div>
              </div>
            </div>
          </div>

          <!-- Dish 3: Bihari Dum Biryani (sm_8) -->
          <div class="sw-dish-card">
            <div class="sw-dish-left">
              <div>
                <span class="sw-veg-indicator"><span class="sw-veg-dot"></span></span>
                <span class="sw-bestseller-tag">⭐ Bestseller</span>
              </div>
              <div class="sw-dish-name">Bihari Dum Biryani</div>
              <div class="sw-dish-price">₹279</div>
              <div class="sw-dish-desc">Fragrant aged basmati rice cooked on slow dum in sealed handi with cottage cheese, fried onions & saffron.</div>
            </div>
            <div class="sw-dish-right">
              <img src="${cardBiryaniBase64}" class="sw-dish-img" alt="Bihari Dum Biryani">
              <div class="sw-add-container">
                <button class="sw-add-btn" id="home-add-sm_8" onclick="updateQty('sm_8', 1)">ADD</button>
                <div class="sw-stepper-btn" id="home-stepper-sm_8">
                  <button class="sw-step-minus" onclick="updateQty('sm_8', -1)">−</button>
                  <span class="sw-step-qty" id="home-qty-sm_8">0</span>
                  <button class="sw-step-plus" onclick="updateQty('sm_8', 1)">+</button>
                </div>
              </div>
            </div>
          </div>

          <!-- Dish 4: Special Dahi Chura (sm_5) -->
          <div class="sw-dish-card">
            <div class="sw-dish-left">
              <div>
                <span class="sw-veg-indicator"><span class="sw-veg-dot"></span></span>
              </div>
              <div class="sw-dish-name">Mithila Dahi Chura</div>
              <div class="sw-dish-price">₹60</div>
              <div class="sw-dish-desc">Crisp flattened rice soaked in thick creamy buffalo curd, accompanied with natural organic palm jaggery.</div>
            </div>
            <div class="sw-dish-right">
              <img src="${thumbDahichuraBase64}" class="sw-dish-img" alt="Dahi Chura">
              <div class="sw-add-container">
                <button class="sw-add-btn" id="home-add-sm_5" onclick="updateQty('sm_5', 1)">ADD</button>
                <div class="sw-stepper-btn" id="home-stepper-sm_5">
                  <button class="sw-step-minus" onclick="updateQty('sm_5', -1)">−</button>
                  <span class="sw-step-qty" id="home-qty-sm_5">0</span>
                  <button class="sw-step-plus" onclick="updateQty('sm_5', 1)">+</button>
                </div>
              </div>
            </div>
          </div>

          <!-- Dish 5: Kesar Kheer (sm_14) -->
          <div class="sw-dish-card">
            <div class="sw-dish-left">
              <div>
                <span class="sw-veg-indicator"><span class="sw-veg-dot"></span></span>
              </div>
              <div class="sw-dish-name">Shahi Kesar Kheer</div>
              <div class="sw-dish-price">₹65</div>
              <div class="sw-dish-desc">Slow-reduced full cream milk rice pudding infused with aromatic saffron strands and topped with pistachios.</div>
            </div>
            <div class="sw-dish-right">
              <img src="${thumbKheerBase64}" class="sw-dish-img" alt="Kesar Kheer">
              <div class="sw-add-container">
                <button class="sw-add-btn" id="home-add-sm_14" onclick="updateQty('sm_14', 1)">ADD</button>
                <div class="sw-stepper-btn" id="home-stepper-sm_14">
                  <button class="sw-step-minus" onclick="updateQty('sm_14', -1)">−</button>
                  <span class="sw-step-qty" id="home-qty-sm_14">0</span>
                  <button class="sw-step-plus" onclick="updateQty('sm_14', 1)">+</button>
                </div>
              </div>
            </div>
          </div>

        </div>

        <!-- Browse Full Menu Callout -->
        <div style="padding: 10px 16px 20px;">
          <button onclick="showScreen('search')" style="width: 100%; padding: 13px; background: #FFF0D7; border: 1.5px dashed #861C24; border-radius: 14px; color: #861C24; font-size: 13px; font-weight: 800; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px;">
            <i class="fa-solid fa-book-open"></i>
            <span>Browse Complete Menu (15 Dishes) →</span>
          </button>
        </div>

      </div>

      <!-- Swiggy Floating "View Cart" Bottom Pill -->
      <div class="sw-floating-cart-bar" id="sw-home-cart-bar" onclick="showScreen('checkout')">
        <div class="sw-cart-info-left">
          <span class="sw-cart-count-title" id="sw-cart-count-span">1 ITEM</span>
          <span style="font-size: 14px; font-weight: 900;" id="sw-cart-price-span">₹120</span>
        </div>
        <div class="sw-cart-view-right">
          <span>View Cart</span>
          <i class="fa-solid fa-arrow-right text-xs"></i>
        </div>
      </div>

      <!-- Swiggy Fixed Bottom Navigation Bar -->
      <div class="sw-bottom-nav">
        <div class="sw-nav-tab active" onclick="showScreen('home')" title="Home">
          <i class="fa-solid fa-house"></i>
          <span class="sw-nav-label">Home</span>
        </div>
        <div class="sw-nav-tab" onclick="showScreen('search')" title="Menu">
          <i class="fa-solid fa-utensils"></i>
          <span class="sw-nav-label">Menu</span>
        </div>
        <div class="sw-nav-tab" onclick="showScreen('checkout')" title="Cart">
          <i class="fa-solid fa-basket-shopping"></i>
          <div class="sw-cart-badge-dot" id="sw-nav-cart-badge">0</div>
          <span class="sw-nav-label">Cart</span>
        </div>
        <div class="sw-nav-tab" onclick="showScreen('tracking')" title="Track Orders">
          <i class="fa-regular fa-clock"></i>
          <span class="sw-nav-label">Orders</span>
        </div>
        <div class="sw-nav-tab" onclick="alert('Desi Bites Profile: Guest Member')" title="Profile">
          <i class="fa-regular fa-user"></i>
          <span class="sw-nav-label">Profile</span>
        </div>
      </div>

    </div>


    <!-- ── SCREEN 5: SEARCH / MENU SCREEN ── -->
    <div id="screen-search" class="app-screen search-screen no-scrollbar">
      
      <!-- Header with palace artwork -->
      <div class="search-header-wrap">
        <img src="${searchHeaderBase64}" class="search-header-img" alt="Heritage Header">
        
        <div class="search-top-bar">
          <button class="search-back-btn" onclick="showScreen('home')" title="Back to Home">
            <i class="fa-solid fa-arrow-left"></i>
          </button>
          <button class="search-cart-btn" title="Cart">
            <i class="fa-solid fa-cart-shopping"></i>
            <div class="search-cart-badge" id="search-cart-badge">2</div>
          </button>
        </div>
        
        <div class="search-hero-title">आज क्या खाएंगे?</div>
      </div>

      <!-- Body -->
      <div class="search-body no-scrollbar">
        <!-- Lotus ornament -->
        <div class="search-lotus-ornament">
          <div class="search-lotus-l"></div>
          <div class="search-lotus-c"></div>
          <div class="search-lotus-r"></div>
        </div>

        <!-- Search bar -->
        <div class="search-bar-container">
          <i class="fa-solid fa-magnifying-glass search-bar-icon"></i>
          <input type="text" class="search-bar-input" placeholder="Search litti, chai, thekua" id="search-input" oninput="filterMenuItems()">
        </div>

        <!-- Category pills -->
        <div class="search-pills-row" id="search-pills">
          <button class="search-pill active" data-cat="All" onclick="setMenuCategory('All', this)">All</button>
          <button class="search-pill" data-cat="Nashta" onclick="setMenuCategory('Nashta', this)">Nashta</button>
          <button class="search-pill" data-cat="Thali" onclick="setMenuCategory('Thali', this)">Thali</button>
          <button class="search-pill" data-cat="Mithai" onclick="setMenuCategory('Mithai', this)">Mithai</button>
          <button class="search-pill" data-cat="Chai" onclick="setMenuCategory('Chai', this)">Chai</button>
        </div>

        <!-- Section label -->
        <div class="search-section-label-row">
          <span class="search-section-label">POPULAR TODAY</span>
          <div class="search-section-lotus">
            <div class="search-sec-l"></div>
            <div class="search-sec-c"></div>
            <div class="search-sec-r"></div>
          </div>
        </div>

        <!-- Menu items list -->
        <div class="search-menu-list no-scrollbar" id="search-menu-list">
          <!-- 1. Litti Chokha -->
          <div class="search-menu-item" data-id="sm_1" data-cat="Nashta" data-name="litti chokha">
            <div class="search-item-thumb"><img src="${thumbLittiBase64}" alt="Litti Chokha"></div>
            <div class="search-item-info">
              <div class="search-item-name-row">
                <div class="search-veg-indicator"><div class="search-veg-dot"></div></div>
                <span class="search-item-name">Litti Chokha</span>
              </div>
              <div class="search-item-desc">Sattu-stuffed, smoky chokha</div>
              <div class="search-item-price">₹120</div>
            </div>
            <div class="search-add-col">
              <div class="search-stepper" id="stepper-sm_1" style="display:none">
                <button class="search-stepper-btn" onclick="updateQty('sm_1', -1)">−</button>
                <span class="search-stepper-qty" id="qty-sm_1">0</span>
                <button class="search-stepper-btn" onclick="updateQty('sm_1', 1)">+</button>
              </div>
              <button class="search-add-btn" id="add-sm_1" onclick="updateQty('sm_1', 1)">ADD</button>
            </div>
          </div>

          <!-- 2. Sattu Paratha -->
          <div class="search-menu-item" data-id="sm_2" data-cat="Nashta" data-name="sattu paratha">
            <div class="search-item-thumb"><img src="${thumbParathaBase64}" alt="Sattu Paratha"></div>
            <div class="search-item-info">
              <div class="search-item-name-row">
                <div class="search-veg-indicator"><div class="search-veg-dot"></div></div>
                <span class="search-item-name">Sattu Paratha</span>
              </div>
              <div class="search-item-desc">Crisp paratha, spiced sattu</div>
              <div class="search-item-price">₹90</div>
            </div>
            <div class="search-add-col">
              <div class="search-stepper" id="stepper-sm_2" style="display:none">
                <button class="search-stepper-btn" onclick="updateQty('sm_2', -1)">−</button>
                <span class="search-stepper-qty" id="qty-sm_2">0</span>
                <button class="search-stepper-btn" onclick="updateQty('sm_2', 1)">+</button>
              </div>
              <button class="search-add-btn" id="add-sm_2" onclick="updateQty('sm_2', 1)">ADD</button>
            </div>
          </div>

          <!-- 3. Masala Chai -->
          <div class="search-menu-item" data-id="sm_3" data-cat="Chai" data-name="masala chai">
            <div class="search-item-thumb"><img src="${thumbChaiBase64}" alt="Masala Chai"></div>
            <div class="search-item-info">
              <div class="search-item-name-row">
                <div class="search-veg-indicator"><div class="search-veg-dot"></div></div>
                <span class="search-item-name">Masala Chai</span>
              </div>
              <div class="search-item-desc">Kulhad chai, ginger, elaichi</div>
              <div class="search-item-price">₹30</div>
            </div>
            <div class="search-add-col">
              <div class="search-stepper" id="stepper-sm_3" style="display:none">
                <button class="search-stepper-btn" onclick="updateQty('sm_3', -1)">−</button>
                <span class="search-stepper-qty" id="qty-sm_3">0</span>
                <button class="search-stepper-btn" onclick="updateQty('sm_3', 1)">+</button>
              </div>
              <button class="search-add-btn" id="add-sm_3" onclick="updateQty('sm_3', 1)">ADD</button>
            </div>
          </div>

          <!-- 4. Thekua -->
          <div class="search-menu-item" data-id="sm_4" data-cat="Mithai" data-name="thekua">
            <div class="search-item-thumb"><img src="${thumbThekuaBase64}" alt="Thekua"></div>
            <div class="search-item-info">
              <div class="search-item-name-row">
                <div class="search-veg-indicator"><div class="search-veg-dot"></div></div>
                <span class="search-item-name">Thekua</span>
              </div>
              <div class="search-item-desc">Wheat-jaggery crunch cookie</div>
              <div class="search-item-price">₹40</div>
            </div>
            <div class="search-add-col">
              <div class="search-stepper" id="stepper-sm_4" style="display:none">
                <button class="search-stepper-btn" onclick="updateQty('sm_4', -1)">−</button>
                <span class="search-stepper-qty" id="qty-sm_4">0</span>
                <button class="search-stepper-btn" onclick="updateQty('sm_4', 1)">+</button>
              </div>
              <button class="search-add-btn" id="add-sm_4" onclick="updateQty('sm_4', 1)">ADD</button>
            </div>
          </div>

          <!-- 5. Dahi Chura (Single Working Interactive Item) -->
          <div class="search-menu-item" data-id="sm_5" data-cat="Nashta" data-name="dahi chura">
            <div class="search-item-thumb"><img src="${thumbDahichuraBase64}" alt="Dahi Chura"></div>
            <div class="search-item-info">
              <div class="search-item-name-row">
                <div class="search-veg-indicator"><div class="search-veg-dot"></div></div>
                <span class="search-item-name">Dahi Chura</span>
              </div>
              <div class="search-item-desc">Curd, chura and organic jaggery</div>
              <div class="search-item-price">₹60</div>
            </div>
            <div class="search-add-col">
              <div class="search-stepper" id="stepper-sm_5" style="display:none">
                <button class="search-stepper-btn" onclick="updateQty('sm_5', -1)">−</button>
                <span class="search-stepper-qty" id="qty-sm_5">0</span>
                <button class="search-stepper-btn" onclick="updateQty('sm_5', 1)">+</button>
              </div>
              <button class="search-add-btn" id="add-sm_5" onclick="updateQty('sm_5', 1)">ADD</button>
            </div>
          </div>

          <!-- 6. Paneer Butter Masala -->
          <div class="search-menu-item" data-id="sm_6" data-cat="Thali" data-name="paneer butter masala">
            <div class="search-item-thumb"><img src="${checkoutItem1Base64}" alt="Paneer Butter Masala"></div>
            <div class="search-item-info">
              <div class="search-item-name-row">
                <div class="search-veg-indicator"><div class="search-veg-dot"></div></div>
                <span class="search-item-name">Paneer Butter Masala</span>
              </div>
              <div class="search-item-desc">Rich cottage cheese in makhani gravy</div>
              <div class="search-item-price">₹249</div>
            </div>
            <div class="search-add-col">
              <div class="search-stepper" id="stepper-sm_6" style="display:none">
                <button class="search-stepper-btn" onclick="updateQty('sm_6', -1)">−</button>
                <span class="search-stepper-qty" id="qty-sm_6">0</span>
                <button class="search-stepper-btn" onclick="updateQty('sm_6', 1)">+</button>
              </div>
              <button class="search-add-btn" id="add-sm_6" onclick="updateQty('sm_6', 1)">ADD</button>
            </div>
          </div>

          <!-- 7. Butter Naan -->
          <div class="search-menu-item" data-id="sm_7" data-cat="Thali" data-name="butter naan">
            <div class="search-item-thumb"><img src="${checkoutItem2Base64}" alt="Butter Naan"></div>
            <div class="search-item-info">
              <div class="search-item-name-row">
                <div class="search-veg-indicator"><div class="search-veg-dot"></div></div>
                <span class="search-item-name">Butter Naan</span>
              </div>
              <div class="search-item-desc">Clay-oven baked layered bread (2 Pcs)</div>
              <div class="search-item-price">₹45</div>
            </div>
            <div class="search-add-col">
              <div class="search-stepper" id="stepper-sm_7" style="display:none">
                <button class="search-stepper-btn" onclick="updateQty('sm_7', -1)">−</button>
                <span class="search-stepper-qty" id="qty-sm_7">0</span>
                <button class="search-stepper-btn" onclick="updateQty('sm_7', 1)">+</button>
              </div>
              <button class="search-add-btn" id="add-sm_7" onclick="updateQty('sm_7', 1)">ADD</button>
            </div>
          </div>

          <!-- 8. Bihari Dum Biryani -->
          <div class="search-menu-item" data-id="sm_8" data-cat="Thali" data-name="bihari dum biryani">
            <div class="search-item-thumb"><img src="${cardBiryaniBase64}" alt="Bihari Dum Biryani"></div>
            <div class="search-item-info">
              <div class="search-item-name-row">
                <div class="search-veg-indicator"><div class="search-veg-dot"></div></div>
                <span class="search-item-name">Bihari Dum Biryani</span>
              </div>
              <div class="search-item-desc">Fragrant basmati rice, paneer & herbs</div>
              <div class="search-item-price">₹279</div>
            </div>
            <div class="search-add-col">
              <div class="search-stepper" id="stepper-sm_8" style="display:none">
                <button class="search-stepper-btn" onclick="updateQty('sm_8', -1)">−</button>
                <span class="search-stepper-qty" id="qty-sm_8">0</span>
                <button class="search-stepper-btn" onclick="updateQty('sm_8', 1)">+</button>
              </div>
              <button class="search-add-btn" id="add-sm_8" onclick="updateQty('sm_8', 1)">ADD</button>
            </div>
          </div>

          <!-- 9. Dal Tadka -->
          <div class="search-menu-item" data-id="sm_9" data-cat="Thali" data-name="dal tadka">
            <div class="search-item-thumb"><img src="${thumbDalTadkaBase64}" alt="Dal Tadka"></div>
            <div class="search-item-info">
              <div class="search-item-name-row">
                <div class="search-veg-indicator"><div class="search-veg-dot"></div></div>
                <span class="search-item-name">Dal Tadka</span>
              </div>
              <div class="search-item-desc">Yellow lentils tempered with desi ghee</div>
              <div class="search-item-price">₹110</div>
            </div>
            <div class="search-add-col">
              <div class="search-stepper" id="stepper-sm_9" style="display:none">
                <button class="search-stepper-btn" onclick="updateQty('sm_9', -1)">−</button>
                <span class="search-stepper-qty" id="qty-sm_9">0</span>
                <button class="search-stepper-btn" onclick="updateQty('sm_9', 1)">+</button>
              </div>
              <button class="search-add-btn" id="add-sm_9" onclick="updateQty('sm_9', 1)">ADD</button>
            </div>
          </div>

          <!-- 10. Chana Ghugni -->
          <div class="search-menu-item" data-id="sm_10" data-cat="Nashta" data-name="chana ghugni">
            <div class="search-item-thumb"><img src="${thumbChanaMasalaBase64}" alt="Chana Ghugni"></div>
            <div class="search-item-info">
              <div class="search-item-name-row">
                <div class="search-veg-indicator"><div class="search-veg-dot"></div></div>
                <span class="search-item-name">Chana Ghugni</span>
              </div>
              <div class="search-item-desc">Spiced black chickpeas with sev</div>
              <div class="search-item-price">₹70</div>
            </div>
            <div class="search-add-col">
              <div class="search-stepper" id="stepper-sm_10" style="display:none">
                <button class="search-stepper-btn" onclick="updateQty('sm_10', -1)">−</button>
                <span class="search-stepper-qty" id="qty-sm_10">0</span>
                <button class="search-stepper-btn" onclick="updateQty('sm_10', 1)">+</button>
              </div>
              <button class="search-add-btn" id="add-sm_10" onclick="updateQty('sm_10', 1)">ADD</button>
            </div>
          </div>

          <!-- 11. Aloo Poori -->
          <div class="search-menu-item" data-id="sm_11" data-cat="Nashta" data-name="aloo poori">
            <div class="search-item-thumb"><img src="${thumbAlooPooiBase64}" alt="Aloo Poori"></div>
            <div class="search-item-info">
              <div class="search-item-name-row">
                <div class="search-veg-indicator"><div class="search-veg-dot"></div></div>
                <span class="search-item-name">Aloo Poori</span>
              </div>
              <div class="search-item-desc">Golden crisp pooris (4 pcs) with rasedaar aloo</div>
              <div class="search-item-price">₹80</div>
            </div>
            <div class="search-add-col">
              <div class="search-stepper" id="stepper-sm_11" style="display:none">
                <button class="search-stepper-btn" onclick="updateQty('sm_11', -1)">−</button>
                <span class="search-stepper-qty" id="qty-sm_11">0</span>
                <button class="search-stepper-btn" onclick="updateQty('sm_11', 1)">+</button>
              </div>
              <button class="search-add-btn" id="add-sm_11" onclick="updateQty('sm_11', 1)">ADD</button>
            </div>
          </div>

          <!-- 12. Masala Chaas -->
          <div class="search-menu-item" data-id="sm_12" data-cat="Chai" data-name="masala chaas">
            <div class="search-item-thumb"><img src="${checkoutItem3Base64}" alt="Masala Chaas"></div>
            <div class="search-item-info">
              <div class="search-item-name-row">
                <div class="search-veg-indicator"><div class="search-veg-dot"></div></div>
                <span class="search-item-name">Masala Chaas</span>
              </div>
              <div class="search-item-desc">Refreshing spiced buttermilk with mint</div>
              <div class="search-item-price">₹40</div>
            </div>
            <div class="search-add-col">
              <div class="search-stepper" id="stepper-sm_12" style="display:none">
                <button class="search-stepper-btn" onclick="updateQty('sm_12', -1)">−</button>
                <span class="search-stepper-qty" id="qty-sm_12">0</span>
                <button class="search-stepper-btn" onclick="updateQty('sm_12', 1)">+</button>
              </div>
              <button class="search-add-btn" id="add-sm_12" onclick="updateQty('sm_12', 1)">ADD</button>
            </div>
          </div>

          <!-- 13. Gulab Jamun -->
          <div class="search-menu-item" data-id="sm_13" data-cat="Mithai" data-name="gulab jamun">
            <div class="search-item-thumb"><img src="${catDessertsBase64}" alt="Gulab Jamun"></div>
            <div class="search-item-info">
              <div class="search-item-name-row">
                <div class="search-veg-indicator"><div class="search-veg-dot"></div></div>
                <span class="search-item-name">Gulab Jamun</span>
              </div>
              <div class="search-item-desc">Soft khoya dumplings in rose syrup (2 Pcs)</div>
              <div class="search-item-price">₹50</div>
            </div>
            <div class="search-add-col">
              <div class="search-stepper" id="stepper-sm_13" style="display:none">
                <button class="search-stepper-btn" onclick="updateQty('sm_13', -1)">−</button>
                <span class="search-stepper-qty" id="qty-sm_13">0</span>
                <button class="search-stepper-btn" onclick="updateQty('sm_13', 1)">+</button>
              </div>
              <button class="search-add-btn" id="add-sm_13" onclick="updateQty('sm_13', 1)">ADD</button>
            </div>
          </div>

          <!-- 14. Kesar Kheer -->
          <div class="search-menu-item" data-id="sm_14" data-cat="Mithai" data-name="kesar kheer">
            <div class="search-item-thumb"><img src="${thumbKheerBase64}" alt="Kesar Kheer"></div>
            <div class="search-item-info">
              <div class="search-item-name-row">
                <div class="search-veg-indicator"><div class="search-veg-dot"></div></div>
                <span class="search-item-name">Kesar Kheer</span>
              </div>
              <div class="search-item-desc">Rice pudding with saffron & pistachios</div>
              <div class="search-item-price">₹65</div>
            </div>
            <div class="search-add-col">
              <div class="search-stepper" id="stepper-sm_14" style="display:none">
                <button class="search-stepper-btn" onclick="updateQty('sm_14', -1)">−</button>
                <span class="search-stepper-qty" id="qty-sm_14">0</span>
                <button class="search-stepper-btn" onclick="updateQty('sm_14', 1)">+</button>
              </div>
              <button class="search-add-btn" id="add-sm_14" onclick="updateQty('sm_14', 1)">ADD</button>
            </div>
          </div>

          <!-- 15. Malai Lassi -->
          <div class="search-menu-item" data-id="sm_15" data-cat="Chai" data-name="malai lassi">
            <div class="search-item-thumb"><img src="${thumbLassiBase64}" alt="Malai Lassi"></div>
            <div class="search-item-info">
              <div class="search-item-name-row">
                <div class="search-veg-indicator"><div class="search-veg-dot"></div></div>
                <span class="search-item-name">Malai Lassi</span>
              </div>
              <div class="search-item-desc">Thick churned sweet curd with rabdi malai</div>
              <div class="search-item-price">₹50</div>
            </div>
            <div class="search-add-col">
              <div class="search-stepper" id="stepper-sm_15" style="display:none">
                <button class="search-stepper-btn" onclick="updateQty('sm_15', -1)">−</button>
                <span class="search-stepper-qty" id="qty-sm_15">0</span>
                <button class="search-stepper-btn" onclick="updateQty('sm_15', 1)">+</button>
              </div>
              <button class="search-add-btn" id="add-sm_15" onclick="updateQty('sm_15', 1)">ADD</button>
            </div>
          </div>

          <!-- Footer landscape (Cleaned - NO duplicate non-working Dahi Chura) -->
          <div class="search-footer-landscape">
            <img src="${searchFooterBase64}" alt="Village Landscape">
          </div>
        </div>
      </div>

      <!-- Floating cart bar -->
      <div class="search-floating-cart" id="search-floating-cart" style="display:none">
        <div class="search-cart-left-info">
          <div class="search-cart-count" id="search-cart-count-label">2 Items</div>
          <div class="search-cart-total" id="search-cart-total-label">₹150</div>
        </div>
        <button class="search-cart-view-btn" onclick="showScreen('checkout')">
          <span>View cart</span>
          <i class="fa-solid fa-arrow-right" style="font-size:12px"></i>
        </button>
      </div>
    </div>

    <!-- ── SCREEN 6: CHECKOUT SCREEN (PIXEL-ACCURATE RECREATION, NO APP NAME) ── -->
    <div id="screen-checkout" class="app-screen checkout-screen no-scrollbar">
      
      <!-- Header with temple artwork & title (Clean, NO APP NAME) -->
      <div class="checkout-header-wrap">
        <img src="${checkoutHeaderBase64}" class="checkout-header-img" alt="Order Header">
        
        <div class="checkout-top-bar">
          <button class="checkout-back-btn" onclick="showScreen('search')" title="Back to Menu">
            <i class="fa-solid fa-arrow-left"></i>
          </button>
          <div class="checkout-help-pill" onclick="alert('Help: Toll Free 1800-DESI-EXP | WhatsApp: +91 98765 43210')">
            <span>Help</span>
            <div class="checkout-help-circle">?</div>
          </div>
        </div>

        <div class="checkout-title-wrap">
          <div class="checkout-hindi-title">आपका ऑर्डर</div>
          <div class="checkout-english-sub">Review your order</div>
        </div>
      </div>

      <!-- Parchment Content Body -->
      <div class="checkout-body no-scrollbar">
        <!-- Symmetrical 3-Petal Lotus Bud -->
        <div class="checkout-lotus-apex">
          <div class="checkout-lotus-l"></div>
          <div class="checkout-lotus-c"></div>
          <div class="checkout-lotus-r"></div>
        </div>

        <!-- Restaurant Card ("घर का स्वाद") -->
        <div class="checkout-rest-card">
          <div class="checkout-cloche-badge">
            <i class="fa-solid fa-bell-concierge"></i>
          </div>
          <div>
            <div class="checkout-rest-name">घर का स्वाद</div>
            <div class="checkout-rest-meta">
              <i class="fa-solid fa-star text-amber-500 text-[11px]"></i>
              <span class="font-bold text-[#542719]">4.8</span>
              <span class="mx-1 text-[#A48978]">|</span>
              <i class="fa-regular fa-clock text-[11px]"></i>
              <span>25–35 min</span>
            </div>
          </div>
        </div>

        <!-- Order Items List (Dynamically rendered with ONLY the food added to cart in Menu) -->
        <div class="checkout-items-card" id="checkout-items-card">
          <!-- Dynamically populated from cart -->
        </div>

        <!-- Promo Code Box -->
        <div class="checkout-promo-bar">
          <div class="checkout-promo-box">
            <i class="fa-solid fa-tag text-[#861C24] text-xs"></i>
            <input type="text" class="checkout-promo-input" id="co-promo-input" value="DESI50" placeholder="Promo code">
          </div>
          <button class="checkout-apply-btn" id="co-promo-btn" onclick="togglePromo()">Applied</button>
        </div>

        <!-- Bill Details -->
        <div class="checkout-bill-card">
          <div class="checkout-bill-row">
            <span>Subtotal</span>
            <span class="font-bold" id="co-subtotal">₹497</span>
          </div>
          <div class="checkout-bill-row">
            <span>Delivery</span>
            <span class="font-bold">₹30</span>
          </div>
          <div class="checkout-bill-row">
            <span>Taxes</span>
            <span class="font-bold">₹25</span>
          </div>
          <div class="checkout-bill-row text-emerald-700" id="co-discount-row">
            <span>Discount</span>
            <span class="font-bold" id="co-discount">−₹50</span>
          </div>
          <div class="checkout-bill-divider"></div>
          <div class="checkout-total-row">
            <span>Total</span>
            <span class="checkout-total-val" id="co-total">₹502</span>
          </div>
        </div>

        <!-- Delivery Address Bar -->
        <div class="checkout-address-bar">
          <i class="fa-solid fa-location-dot checkout-addr-icon"></i>
          <div class="checkout-addr-info">
            <div class="checkout-addr-title">Deliver to</div>
            <div class="checkout-addr-text" id="co-addr-text">123, Green Park, New Delhi – 110016</div>
          </div>
          <button class="checkout-addr-btn" onclick="promptAddress()">Add address</button>
        </div>

        <!-- Primary Pay Button -->
        <button class="checkout-pay-btn" onclick="proceedToPayment()">
          <span>आगे बढ़ें • Continue to Payment</span>
          <i class="fa-solid fa-arrow-right text-xs"></i>
        </button>

        <!-- Bottom Lotus Divider -->
        <div class="checkout-bottom-divider">
          <div class="checkout-div-line"></div>
          <div class="flex items-end gap-[1.5px]">
            <div class="w-1 h-2 bg-[#861C24] rounded-tl rounded-br -rotate-[25deg]"></div>
            <div class="w-1.5 h-2.5 bg-[#861C24] rounded-t"></div>
            <div class="w-1 h-2 bg-[#861C24] rounded-tr rounded-bl rotate-[25deg]"></div>
          </div>
          <div class="checkout-div-line"></div>
        </div>

        <!-- Bottom Landscape Artwork -->
        <div class="checkout-footer-landscape">
          <img src="${checkoutFooterBase64}" alt="Bihar Village Landscape">
        </div>
      </div>
    </div>

    <!-- ── SCREEN 7: PAYMENT SCREEN (PIXEL-ACCURATE RECREATION, NO APP NAME) ── -->
    <div id="screen-payment" class="app-screen payment-screen no-scrollbar">
      
      <!-- Top Hero Header (Bihari Character, Gamcha, Temple, Sun - NO APP NAME) -->
      <div class="payment-header-wrap">
        <img src="${paymentHeaderBase64}" class="payment-header-img" alt="Bihari Hero Artwork">

        <div class="payment-top-bar">
          <button class="payment-back-btn" onclick="showScreen('checkout')" title="Back to Checkout">
            <i class="fa-solid fa-arrow-left"></i>
          </button>
          <div class="payment-help-pill" onclick="alert('Help: Toll Free 1800-DESI-EXP | WhatsApp: +91 98765 43210')">
            <span>Help</span>
            <div class="payment-help-circle">?</div>
          </div>
        </div>
      </div>

      <!-- Parchment Content Body -->
      <div class="payment-body no-scrollbar">
        <!-- 3-Petal Lotus Bud -->
        <div class="payment-lotus-apex">
          <div class="checkout-lotus-l"></div>
          <div class="checkout-lotus-c"></div>
          <div class="checkout-lotus-r"></div>
        </div>

        <!-- Heading: भुगतान करें -->
        <div class="payment-title-wrap">
          <div class="payment-hindi-title">भुगतान करें</div>
          <div class="payment-sub-row">
            <div class="payment-sub-line"></div>
            <span class="payment-sub-text">Choose your payment method</span>
            <div class="payment-sub-line"></div>
          </div>
        </div>

        <!-- Total payable card -->
        <div class="payment-payable-card">
          <div class="flex items-center">
            <div class="payment-pouch-box">
              <i class="fa-solid fa-bag-shopping"></i>
            </div>
            <span class="payment-payable-label">Total payable</span>
          </div>
          <span class="payment-payable-val" id="pm-total-val">₹502</span>
        </div>

        <!-- Payment Methods List -->
        <div class="payment-methods-list">
          <!-- 1. UPI (Active by default) -->
          <div class="payment-method-item active" id="p-opt-upi" onclick="selectPayOption('upi')">
            <div class="pm-radio"><div class="pm-radio-dot"></div></div>
            <div class="pm-icon-wrap">
              <div class="payment-upi-logo">
                <span>UPI</span>
                <div class="flex gap-[1px]">
                  <div class="payment-upi-tri bg-[#097939]"></div>
                  <div class="payment-upi-tri bg-[#ED752E]"></div>
                </div>
              </div>
            </div>
            <div class="pm-divider-v"></div>
            <div class="pm-text-col">
              <div class="pm-name">UPI</div>
              <div class="pm-sub">Google Pay, PhonePe, Paytm</div>
            </div>
            <div class="pm-check-badge" id="chk-upi"><i class="fa-solid fa-check text-xs"></i></div>
          </div>

          <!-- 2. Card -->
          <div class="payment-method-item" id="p-opt-card" onclick="selectPayOption('card')">
            <div class="pm-radio"><div class="pm-radio-dot" id="dot-card" style="display:none"></div></div>
            <div class="pm-icon-wrap">
              <div class="payment-card-badge">
                <div class="payment-card-chip"></div>
                <div class="payment-card-stripe"></div>
              </div>
            </div>
            <div class="pm-divider-v"></div>
            <div class="pm-text-col">
              <div class="pm-name">Credit / Debit Card</div>
              <div class="pm-sub">Visa, Mastercard & more</div>
            </div>
            <div class="pm-check-badge" id="chk-card" style="display:none"><i class="fa-solid fa-check text-xs"></i></div>
          </div>

          <!-- 3. Net Banking -->
          <div class="payment-method-item" id="p-opt-netbanking" onclick="selectPayOption('netbanking')">
            <div class="pm-radio"><div class="pm-radio-dot" id="dot-netbanking" style="display:none"></div></div>
            <div class="pm-icon-wrap">
              <i class="fa-solid fa-building-columns payment-bank-icon"></i>
            </div>
            <div class="pm-divider-v"></div>
            <div class="pm-text-col">
              <div class="pm-name">Net Banking</div>
              <div class="pm-sub">All major banks</div>
            </div>
            <div class="pm-check-badge" id="chk-netbanking" style="display:none"><i class="fa-solid fa-check text-xs"></i></div>
          </div>

          <!-- 4. Cash on Delivery -->
          <div class="payment-method-item" id="p-opt-cod" onclick="selectPayOption('cod')">
            <div class="pm-radio"><div class="pm-radio-dot" id="dot-cod" style="display:none"></div></div>
            <div class="pm-icon-wrap">
              <div class="payment-cash-badge">₹</div>
            </div>
            <div class="pm-divider-v"></div>
            <div class="pm-text-col">
              <div class="pm-name">Cash on Delivery</div>
              <div class="pm-sub">Pay when your order arrives</div>
            </div>
            <div class="pm-check-badge" id="chk-cod" style="display:none"><i class="fa-solid fa-check text-xs"></i></div>
          </div>
        </div>

        <!-- Security Note 1 -->
        <div class="payment-sec-notice">
          <i class="fa-solid fa-lock text-[#542719] text-[10px]"></i>
          <span>Your payment information is secure and encrypted</span>
        </div>

        <!-- Primary Action Pay Button -->
        <button class="payment-btn-main" onclick="handleFinalPay()">
          <span id="pm-pay-btn-label">Pay ₹502</span>
          <i class="fa-solid fa-arrow-right text-xs"></i>
        </button>

        <!-- Security Note 2 -->
        <div class="payment-prot-footer">
          <i class="fa-solid fa-lock text-[#542719] text-[10px]"></i>
          <span>Secure payment • Your details are protected</span>
        </div>

        <!-- Bottom Lotus Divider -->
        <div class="checkout-bottom-divider">
          <div class="checkout-div-line"></div>
          <div class="flex items-end gap-[1.5px]">
            <div class="w-1 h-2 bg-[#861C24] rounded-tl rounded-br -rotate-[25deg]"></div>
            <div class="w-1.5 h-2.5 bg-[#861C24] rounded-t"></div>
            <div class="w-1 h-2 bg-[#861C24] rounded-tr rounded-bl rotate-[25deg]"></div>
          </div>
          <div class="checkout-div-line"></div>
        </div>

        <!-- Bottom Village Landscape -->
        <div class="payment-landscape-wrap">
          <img src="${paymentFooterBase64}" alt="Village Landscape">
        </div>
      </div>
    </div>

    <!-- ── SCREEN 8: ORDER TRACKING SCREEN (HERITAGE BIHARI FOLK AESTHETIC) ── -->
    <div id="screen-tracking" class="app-screen tracking-screen no-scrollbar">
      
      <!-- Top Header (Temple & Landscape Artwork - NO APP NAME) -->
      <div class="tracking-header-wrap">
        <img src="${checkoutHeaderBase64}" class="tracking-header-img" alt="Tracking Header">

        <div class="tracking-top-bar">
          <button class="tracking-back-btn" onclick="showScreen('home')" title="Back to Home">
            <i class="fa-solid fa-arrow-left"></i>
          </button>
          <div class="checkout-help-pill" onclick="alert('Order Support: ID #DB-84920 | Toll Free 1800-DESI-EXP')">
            <span>Help</span>
            <div class="checkout-help-circle">?</div>
          </div>
        </div>

        <div class="tracking-title-wrap">
          <div class="tracking-hindi-title">ऑर्डर ट्रैक करें</div>
          <div class="tracking-english-sub">Live Order Tracking</div>
        </div>
      </div>

      <!-- Parchment Content Body -->
      <div class="tracking-body no-scrollbar">
        <!-- 3-Petal Lotus Bud -->
        <div class="checkout-lotus-apex">
          <div class="checkout-lotus-l"></div>
          <div class="checkout-lotus-c"></div>
          <div class="checkout-lotus-r"></div>
        </div>

        <!-- Live Status Card -->
        <div class="tracking-status-card">
          <div class="tracking-status-top">
            <div class="tracking-status-badge-row">
              <div class="tracking-pulse-dot"></div>
              <span class="tracking-status-main-text">रसोई में तैयारी हो रही है</span>
            </div>
            <span class="tracking-status-pill">ON TIME</span>
          </div>
          <div class="tracking-status-middle">
            <div class="tracking-eta-col">
              <span class="tracking-eta-label">ESTIMATED ARRIVAL</span>
              <div class="tracking-eta-val">⚡ 25 - 30 Mins</div>
            </div>
            <div class="tracking-eta-time">Arriving ~02:15 PM</div>
          </div>
          <div class="tracking-progress-track">
            <div class="tracking-progress-bar"></div>
          </div>
        </div>

        <!-- Delivery Partner Card (Raju Bhaiya) -->
        <div class="tracking-rider-card">
          <div class="tracking-rider-avatar">
            <i class="fa-solid fa-person-biking"></i>
          </div>
          <div class="tracking-rider-info">
            <div class="tracking-rider-name">राजू भैया (Raju Bhaiya)</div>
            <div class="tracking-rider-meta">
              <span class="tracking-rider-rating"><i class="fa-solid fa-star"></i> 4.9</span>
              <span>• Desi Delivery Partner</span>
            </div>
          </div>
          <div class="tracking-rider-actions">
            <button class="tracking-action-circle" onclick="alert('Calling Raju Bhaiya (+91 98765 12345)...')" title="Call Partner">
              <i class="fa-solid fa-phone"></i>
            </button>
            <button class="tracking-action-circle" onclick="alert('Raju Bhaiya: नमस्ते! आपका खाना तैयार होते ही मैं साइकिल से तुरंत निकलूंगा।')" title="Message Partner">
              <i class="fa-solid fa-comment-dots"></i>
            </button>
          </div>
        </div>

        <!-- Timeline Stepper Card (Collision-Free Robust Layout) -->
        <div class="tracking-timeline-card">
          <div class="tracking-timeline-title">ORDER STATUS & TIMELINE</div>
          
          <!-- Step 1 (Completed) -->
          <div class="tracking-step-row">
            <div class="tracking-step-indicator">
              <div class="tracking-step-circle done"><i class="fa-solid fa-check"></i></div>
              <div class="tracking-step-line done"></div>
            </div>
            <div class="tracking-step-content">
              <div class="tracking-step-header">
                <span class="tracking-step-title">ऑर्डर कन्फर्म हुआ</span>
                <span class="tracking-step-time">01:45 PM</span>
              </div>
              <div class="tracking-step-desc">Order Confirmed by Store</div>
            </div>
          </div>

          <!-- Step 2 (Active) -->
          <div class="tracking-step-row">
            <div class="tracking-step-indicator">
              <div class="tracking-step-circle active"><div class="active-dot"></div></div>
              <div class="tracking-step-line pending"></div>
            </div>
            <div class="tracking-step-content">
              <div class="tracking-step-header">
                <span class="tracking-step-title">रसोई में तैयारी चल रही है</span>
                <span class="tracking-step-time">01:48 PM</span>
              </div>
              <div class="tracking-step-desc">Freshly cooking in clay chulha with pure desi ghee</div>
            </div>
          </div>

          <!-- Step 3 (Pending) -->
          <div class="tracking-step-row">
            <div class="tracking-step-indicator">
              <div class="tracking-step-circle pending"><div class="pending-dot"></div></div>
              <div class="tracking-step-line pending"></div>
            </div>
            <div class="tracking-step-content">
              <div class="tracking-step-header">
                <span class="tracking-step-title" style="color:#8C6C58;">राजू भैया साइकिल से निकलेंगे</span>
                <span class="tracking-step-time">~02:05 PM</span>
              </div>
              <div class="tracking-step-desc">Delivery partner will pick up hot order</div>
            </div>
          </div>

          <!-- Step 4 (Pending) -->
          <div class="tracking-step-row">
            <div class="tracking-step-indicator">
              <div class="tracking-step-circle pending"><div class="pending-dot"></div></div>
            </div>
            <div class="tracking-step-content">
              <div class="tracking-step-header">
                <span class="tracking-step-title" style="color:#8C6C58;">दरवाजे पर गरम-गरम डिलीवरी</span>
                <span class="tracking-step-time">~02:15 PM</span>
              </div>
              <div class="tracking-step-desc">Delivered hot & fresh to your home</div>
            </div>
          </div>
        </div>

        <!-- Order Summary Card -->
        <div class="tracking-summary-card">
          <div class="tracking-summary-header">
            <div>
              <div class="tracking-order-id">#DB-84920</div>
              <div class="tracking-restaurant-title">घर का स्वाद (Ghar Ka Swad)</div>
            </div>
            <span class="tracking-paid-badge" id="tracking-paid-badge">PAID ₹502</span>
          </div>
          <div class="tracking-summary-divider"></div>
          <div class="tracking-items-list" id="tracking-items-list">
            <div class="tracking-item-line"><span class="tracking-item-name">1x Litti Chokha</span><span class="tracking-item-price">₹120</span></div>
            <div class="tracking-item-line"><span class="tracking-item-name">1x Paneer Butter Masala</span><span class="tracking-item-price">₹249</span></div>
            <div class="tracking-item-line"><span class="tracking-item-name">2x Butter Naan</span><span class="tracking-item-price">₹90</span></div>
          </div>
          <div class="tracking-summary-divider"></div>
          <div class="tracking-address-row">
            <i class="fa-solid fa-location-dot"></i>
            <span class="tracking-address-text">123, Green Park, New Delhi – 110016</span>
          </div>
        </div>

        <!-- Back to Home Action Button -->
        <button class="tracking-home-btn" onclick="showScreen('home')">
          <i class="fa-solid fa-house text-xs"></i>
          <span>होम पेज पर जाएं • Back to Home</span>
        </button>

        <!-- Bottom Lotus Divider -->
        <div class="checkout-bottom-divider">
          <div class="checkout-div-line"></div>
          <div class="flex items-end gap-[1.5px]">
            <div class="w-1 h-2 bg-[#861C24] rounded-tl rounded-br -rotate-[25deg]"></div>
            <div class="w-1.5 h-2.5 bg-[#861C24] rounded-t"></div>
            <div class="w-1 h-2 bg-[#861C24] rounded-tr rounded-bl rotate-[25deg]"></div>
          </div>
          <div class="checkout-div-line"></div>
        </div>

        <!-- Bottom Landscape -->
        <div class="payment-landscape-wrap">
          <img src="${checkoutFooterBase64}" alt="Bihar Village Landscape">
        </div>
      </div>
    </div>

  </div>

  <script>
    function showScreen(screen) {
      const screens = {
        onboarding: document.getElementById('screen-onboarding'),
        login: document.getElementById('screen-login'),
        otp: document.getElementById('screen-otp'),
        home: document.getElementById('screen-home'),
        search: document.getElementById('screen-search'),
        checkout: document.getElementById('screen-checkout'),
        payment: document.getElementById('screen-payment'),
        tracking: document.getElementById('screen-tracking')
      };
      const buttons = {
        onboarding: document.getElementById('btn-tab-ob'),
        login: document.getElementById('btn-tab-login'),
        otp: document.getElementById('btn-tab-otp'),
        home: document.getElementById('btn-tab-home'),
        search: document.getElementById('btn-tab-search'),
        checkout: document.getElementById('btn-tab-checkout'),
        payment: document.getElementById('btn-tab-payment'),
        tracking: document.getElementById('btn-tab-tracking')
      };
      const statusBar = document.getElementById('status-bar');

      Object.values(screens).forEach(el => el && el.classList.remove('active-screen'));
      Object.values(buttons).forEach(b => {
        if (b) b.className = 'px-2 py-1 rounded-full text-[11px] font-medium text-slate-400 hover:text-white transition-all';
      });

      if (screens[screen]) {
        screens[screen].classList.add('active-screen');
      }
      if (buttons[screen]) {
        buttons[screen].className = 'px-2 py-1 rounded-full text-[11px] font-bold bg-amber-600 text-white transition-all';
      }

      if (screen === 'onboarding') {
        statusBar.className = 'h-8 bg-[#59301F] text-[#FFF1D8] flex items-center justify-between px-7 shrink-0 z-40';
        setObSlide(0);
      } else if (screen === 'otp') {
        statusBar.className = 'h-8 bg-[#A50916] text-[#FFF0CE] flex items-center justify-between px-7 shrink-0 z-40';
        startOtpTimer();
      } else if (screen === 'home') {
        statusBar.className = 'h-8 bg-[#FFF8EE] text-[#542719] flex items-center justify-between px-7 shrink-0 z-40';
      } else if (screen === 'checkout') {
        statusBar.className = 'h-8 bg-[#672A18] text-[#FFF0D7] flex items-center justify-between px-7 shrink-0 z-40';
        renderCheckoutScreen();
      } else if (screen === 'payment') {
        statusBar.className = 'h-8 bg-[#672A18] text-[#FFF0D7] flex items-center justify-between px-7 shrink-0 z-40';
        recalcCheckoutBill();
      } else if (screen === 'tracking') {
        statusBar.className = 'h-8 bg-[#672A18] text-[#FFF0D7] flex items-center justify-between px-7 shrink-0 z-40';
        updateTrackingSummary();
      } else {
        statusBar.className = 'h-8 bg-[#672A18] text-[#FFF0D7] flex items-center justify-between px-7 shrink-0 z-40';
      }
    }

    function handleLoginSubmit() {
      const phoneInput = document.getElementById('input-phone');
      const phone = phoneInput ? phoneInput.value.trim() : '';
      if (phone.length < 10) {
        alert('Please enter a valid 10-digit number');
        return;
      }
      showScreen('otp');
    }

    // ── Onboarding slider ──
    const obPager = document.getElementById('ob-pager');
    const obDotsContainer = document.getElementById('ob-dots');
    const obDots = obDotsContainer ? obDotsContainer.querySelectorAll('i') : [];
    const obNext = document.getElementById('ob-next');
    let obIndex = 0;

    function setObSlide(idx) {
      obIndex = idx;
      if (obDots && obDots.length) {
        obDots.forEach((d, i) => {
          if (i === idx) d.classList.add('on');
          else d.classList.remove('on');
        });
      }
      if (obNext) {
        obNext.textContent = idx === 2 ? 'शुरू करें (Get Started)' : 'आगे बढ़ें';
      }
    }

    if (obNext && obPager) {
      obNext.addEventListener('click', () => {
        if (obIndex < 2) {
          obIndex++;
          setObSlide(obIndex);
          obPager.scrollTo({ left: obIndex * obPager.clientWidth, behavior: 'smooth' });
        } else {
          showScreen('login');
        }
      });
    }

    // ── Search/Menu Screen Interactive Logic ──
    const menuPrices = {
      sm_1: 120, sm_2: 90, sm_3: 30, sm_4: 40, sm_5: 60,
      sm_6: 249, sm_7: 45, sm_8: 279, sm_9: 110, sm_10: 70,
      sm_11: 80, sm_12: 40, sm_13: 50, sm_14: 65, sm_15: 50
    };
    const menuQtys = {
      sm_1: 1, sm_2: 0, sm_3: 0, sm_4: 0, sm_5: 1,
      sm_6: 0, sm_7: 0, sm_8: 0, sm_9: 0, sm_10: 0,
      sm_11: 0, sm_12: 0, sm_13: 0, sm_14: 0, sm_15: 0
    };
    let activeMenuCat = 'All';

    // ── Master Menu Dishes Dictionary (Photos & Details for Checkout & Tracking) ──
    const MENU_DISHES = {
      sm_1: { id: 'sm_1', name: 'Litti Chokha', sub: 'Sattu-stuffed smoky', price: 120, img: '${thumbLittiBase64}' },
      sm_2: { id: 'sm_2', name: 'Sattu Paratha', sub: 'Crisp spiced sattu', price: 90, img: '${thumbParathaBase64}' },
      sm_3: { id: 'sm_3', name: 'Masala Chai', sub: 'Kulhad 150ml', price: 30, img: '${thumbChaiBase64}' },
      sm_4: { id: 'sm_4', name: 'Thekua', sub: 'Wheat-jaggery cookie', price: 40, img: '${thumbThekuaBase64}' },
      sm_5: { id: 'sm_5', name: 'Dahi Chura', sub: 'Curd & organic jaggery', price: 60, img: '${thumbDahichuraBase64}' },
      sm_6: { id: 'sm_6', name: 'Paneer Butter Masala', sub: 'Rich makhani gravy', price: 249, img: '${checkoutItem1Base64}' },
      sm_7: { id: 'sm_7', name: 'Butter Naan', sub: '2 Pieces layered', price: 45, img: '${checkoutItem2Base64}' },
      sm_8: { id: 'sm_8', name: 'Bihari Dum Biryani', sub: 'Aromatic handi biryani', price: 279, img: '${cardBiryaniBase64}' },
      sm_9: { id: 'sm_9', name: 'Dal Tadka', sub: 'Desi ghee tempered', price: 110, img: '${thumbDalTadkaBase64}' },
      sm_10: { id: 'sm_10', name: 'Chana Ghugni', sub: 'Spiced chickpeas with sev', price: 70, img: '${thumbChanaMasalaBase64}' },
      sm_11: { id: 'sm_11', name: 'Aloo Poori', sub: '4 Pooris + rasedaar aloo', price: 80, img: '${thumbAlooPooiBase64}' },
      sm_12: { id: 'sm_12', name: 'Masala Chaas', sub: 'Chilled mint buttermilk', price: 40, img: '${checkoutItem3Base64}' },
      sm_13: { id: 'sm_13', name: 'Gulab Jamun', sub: '2 Pcs warm in rose syrup', price: 50, img: '${catDessertsBase64}' },
      sm_14: { id: 'sm_14', name: 'Kesar Kheer', sub: 'Saffron & pistachio', price: 65, img: '${thumbKheerBase64}' },
      sm_15: { id: 'sm_15', name: 'Malai Lassi', sub: 'Kulhad sweet curd', price: 50, img: '${thumbLassiBase64}' }
    };

    function updateQty(id, delta) {
      menuQtys[id] = Math.max(0, (menuQtys[id] || 0) + delta);
      const qty = menuQtys[id];
      
      // Update Menu Screen elements
      const stepper = document.getElementById('stepper-' + id);
      const addBtn = document.getElementById('add-' + id);
      const qtySpan = document.getElementById('qty-' + id);

      if (qty > 0) {
        if (stepper) stepper.style.display = 'flex';
        if (addBtn) addBtn.style.display = 'none';
        if (qtySpan) qtySpan.textContent = qty;
      } else {
        if (stepper) stepper.style.display = 'none';
        if (addBtn) addBtn.style.display = '';
      }

      // Update Swiggy Home Screen elements
      const homeStepper = document.getElementById('home-stepper-' + id);
      const homeAddBtn = document.getElementById('home-add-' + id);
      const homeQtySpan = document.getElementById('home-qty-' + id);

      if (qty > 0) {
        if (homeStepper) homeStepper.style.display = 'flex';
        if (homeAddBtn) homeAddBtn.style.display = 'none';
        if (homeQtySpan) homeQtySpan.textContent = qty;
      } else {
        if (homeStepper) homeStepper.style.display = 'none';
        if (homeAddBtn) homeAddBtn.style.display = '';
      }

      updateSearchCartBar();
    }

    function updateSearchCartBar() {
      let totalItems = 0, totalPrice = 0;
      for (const id in menuQtys) {
        if (menuQtys[id] > 0) {
          totalItems += menuQtys[id];
          totalPrice += menuQtys[id] * (menuPrices[id] || 0);
        }
      }

      // Menu Screen Cart Bar
      const bar = document.getElementById('search-floating-cart');
      const badge = document.getElementById('search-cart-badge');
      if (totalItems > 0) {
        if (bar) bar.style.display = 'flex';
        if (badge) {
          badge.textContent = totalItems;
          badge.style.display = 'flex';
        }
        const countLabel = document.getElementById('search-cart-count-label');
        if (countLabel) countLabel.textContent = totalItems + (totalItems === 1 ? ' Item' : ' Items');
        const totalLabel = document.getElementById('search-cart-total-label');
        if (totalLabel) totalLabel.textContent = '₹' + totalPrice;
      } else {
        if (bar) bar.style.display = 'none';
        if (badge) badge.style.display = 'none';
      }

      // Swiggy Home Screen Cart Bar & Badges
      const swHomeCartBar = document.getElementById('sw-home-cart-bar');
      const swNavCartBadge = document.getElementById('sw-nav-cart-badge');
      const swTopCartBadge = document.getElementById('sw-top-cart-badge');
      const swCartCountSpan = document.getElementById('sw-cart-count-span');
      const swCartPriceSpan = document.getElementById('sw-cart-price-span');

      if (swNavCartBadge) swNavCartBadge.textContent = totalItems;
      if (swTopCartBadge) swTopCartBadge.textContent = totalItems;

      if (totalItems > 0) {
        if (swHomeCartBar) swHomeCartBar.style.display = 'flex';
        if (swCartCountSpan) swCartCountSpan.textContent = totalItems + (totalItems === 1 ? ' ITEM' : ' ITEMS');
        if (swCartPriceSpan) swCartPriceSpan.textContent = '₹' + totalPrice;
      } else {
        if (swHomeCartBar) swHomeCartBar.style.display = 'none';
      }
    }

    function openMenuWithCat(catName) {
      showScreen('search');
      const pills = document.querySelectorAll('#search-pills .search-pill');
      pills.forEach(p => {
        if (p.textContent.trim().toLowerCase().includes(catName.toLowerCase())) {
          setMenuCategory(p.textContent.trim(), p);
        }
      });
    }

    function setMenuCategory(cat, btn) {
      activeMenuCat = cat;
      document.querySelectorAll('#search-pills .search-pill').forEach(p => p.classList.remove('active'));
      if (btn) btn.classList.add('active');
      filterMenuItems();
    }

    function filterMenuItems() {
      const input = document.getElementById('search-input');
      const query = (input ? input.value : '').toLowerCase().trim();
      document.querySelectorAll('#search-menu-list .search-menu-item').forEach(item => {
        const cat = item.getAttribute('data-cat');
        const name = item.getAttribute('data-name');
        const matchesCat = activeMenuCat === 'All' || cat === activeMenuCat;
        const matchesSearch = !query || (name && name.includes(query));
        item.style.display = (matchesCat && matchesSearch) ? 'flex' : 'none';
      });
    }

    // ── Checkout Dynamic Logic (ONLY Food Added in Menu Appears in Checkout) ──
    let isCoPromoActive = true;

    function renderCheckoutScreen() {
      var container = document.getElementById('checkout-items-card');
      if (!container) return;

      var activeIds = Object.keys(menuQtys).filter(function(id) { return menuQtys[id] > 0; });

      if (activeIds.length === 0) {
        container.innerHTML = '<div style=\"padding: 28px 16px; text-align: center; color: #8C6C58;\">' +
          '<i class=\"fa-solid fa-basket-shopping\" style=\"font-size: 32px; color: #861C24; margin-bottom: 8px;\"></i>' +
          '<div style=\"font-size: 15px; font-weight: 800; color: #542719;\">आपकी थाली खाली है (Cart is empty)</div>' +
          '<div style=\"font-size: 12px; color: #8C6C58; margin-top: 4px;\">Please add food from the menu to checkout.</div>' +
          '<button onclick=\"showScreen(\\'search\\')\" style=\"margin-top: 14px; padding: 8px 18px; background: #861C24; color: #FFF0D7; font-size: 12px; font-weight: 700; border-radius: 9999px; border: none; cursor: pointer; box-shadow: 0 2px 6px rgba(134,28,36,0.3);\">' +
            'मेनू देखें • Browse Menu' +
          '</button>' +
        '</div>';
      } else {
        var html = '';
        activeIds.forEach(function(id) {
          var dish = MENU_DISHES[id];
          if (!dish) return;
          var qty = menuQtys[id];
          var itemTotal = dish.price * qty;
          html += '<div class=\"checkout-item-row\" id=\"co-row-' + id + '\">' +
            '<div class=\"checkout-item-thumb\">' +
              '<img src=\"' + dish.img + '\" alt=\"' + dish.name + '\">' +
            '</div>' +
            '<div class=\"checkout-item-details\">' +
              '<div class=\"checkout-item-title\">' + dish.name + '</div>' +
              '<div class=\"checkout-item-sub\">' + dish.sub + '</div>' +
            '</div>' +
            '<div class=\"flex items-center border border-[#7B321F]/30 rounded-lg mr-3 bg-[#FFF8EC] overflow-hidden\">' +
              '<button class=\"w-6 h-7 flex items-center justify-center font-bold text-[#861C24] text-sm\" onclick=\"changeCoQty(\\'' + id + '\\', -1)\">−</button>' +
              '<span class=\"w-5 text-center text-xs font-bold text-[#542719]\" id=\"co-qty-' + id + '\">' + qty + '</span>' +
              '<button class=\"w-6 h-7 flex items-center justify-center font-bold text-[#861C24] text-sm\" onclick=\"changeCoQty(\\'' + id + '\\', 1)\">+</button>' +
            '</div>' +
            '<div class=\"checkout-item-price\" id=\"co-price-' + id + '\">₹' + itemTotal + '</div>' +
          '</div>';
        });
        container.innerHTML = html;
      }

      recalcCheckoutBill();
    }

    function changeCoQty(id, delta) {
      updateQty(id, delta);
      renderCheckoutScreen();
    }

    function recalcCheckoutBill() {
      let sub = 0;
      for (const id in menuQtys) {
        if (menuQtys[id] > 0 && MENU_DISHES[id]) {
          sub += menuQtys[id] * MENU_DISHES[id].price;
        }
      }
      const delivery = sub > 0 ? 30 : 0;
      const taxes = sub > 0 ? 25 : 0;
      const discount = (isCoPromoActive && sub > 100) ? 50 : 0;
      const total = Math.max(0, sub + delivery + taxes - discount);

      const subElem = document.getElementById('co-subtotal');
      if (subElem) subElem.textContent = '₹' + sub;
      const discRow = document.getElementById('co-discount-row');
      if (discRow) discRow.style.display = discount > 0 ? 'flex' : 'none';
      const totElem = document.getElementById('co-total');
      if (totElem) totElem.textContent = '₹' + total;

      const pmTot = document.getElementById('pm-total-val');
      if (pmTot) pmTot.textContent = '₹' + total;
      const pmBtn = document.getElementById('pm-pay-btn-label');
      if (pmBtn) pmBtn.textContent = 'Pay ₹' + total;

      updateTrackingSummary(total);
    }

    function proceedToPayment() {
      let totalQty = 0;
      for (const id in menuQtys) {
        if (menuQtys[id] > 0) totalQty += menuQtys[id];
      }
      if (totalQty === 0) {
        alert('Your cart is empty! Please add food from the menu first.');
        showScreen('search');
        return;
      }
      showScreen('payment');
    }

    function togglePromo() {
      isCoPromoActive = !isCoPromoActive;
      const btn = document.getElementById('co-promo-btn');
      const input = document.getElementById('co-promo-input');
      if (isCoPromoActive) {
        if (btn) {
          btn.textContent = 'Applied';
          btn.style.backgroundColor = '#2E7D32';
        }
        if (input) input.value = 'DESI50';
      } else {
        if (btn) {
          btn.textContent = 'Apply';
          btn.style.backgroundColor = '#861C24';
        }
        if (input) input.value = '';
      }
      recalcCheckoutBill();
    }

    function promptAddress() {
      const addrElem = document.getElementById('co-addr-text');
      const current = addrElem ? addrElem.textContent : '123, Green Park, New Delhi – 110016';
      const updated = prompt('Enter delivery address:', current);
      if (updated && updated.trim()) {
        if (addrElem) addrElem.textContent = updated.trim();
        const trackAddr = document.querySelector('.tracking-summary-card .truncate');
        if (trackAddr) trackAddr.textContent = updated.trim();
      }
    }

    function updateTrackingSummary(total) {
      var summaryCard = document.querySelector('.tracking-summary-card');
      if (!summaryCard) return;

      var itemsHtml = '';
      var hasItems = false;
      var billTotal = 0;
      for (var id in menuQtys) {
        if (menuQtys[id] > 0 && MENU_DISHES[id]) {
          hasItems = true;
          var d = MENU_DISHES[id];
          var q = menuQtys[id];
          billTotal += q * d.price;
          itemsHtml += '<div class="tracking-item-line"><span class="tracking-item-name">' + q + 'x ' + d.name + '</span><span class="tracking-item-price">₹' + (d.price * q) + '</span></div>';
        }
      }
      if (!hasItems) {
        itemsHtml = '<div class="text-xs text-[#8C6C58]">No food items added</div>';
      }

      var displayTotal = total !== undefined ? total : Math.max(0, billTotal + (billTotal > 0 ? 55 : 0) - (isCoPromoActive && billTotal > 100 ? 50 : 0));
      var addrElem = document.getElementById('co-addr-text');
      var deliveryAddress = addrElem ? addrElem.textContent : '123, Green Park, New Delhi – 110016';

      summaryCard.innerHTML = '<div class="tracking-summary-header">' +
        '<div>' +
          '<div class="tracking-order-id">#DB-84920</div>' +
          '<div class="tracking-restaurant-title">घर का स्वाद (Ghar Ka Swad)</div>' +
        '</div>' +
        '<span class="tracking-paid-badge" id="tracking-paid-badge">PAID ₹' + displayTotal + '</span>' +
      '</div>' +
      '<div class="tracking-summary-divider"></div>' +
      '<div class="tracking-items-list" id="tracking-items-list">' +
        itemsHtml +
      '</div>' +
      '<div class="tracking-summary-divider"></div>' +
      '<div class="tracking-address-row">' +
        '<i class="fa-solid fa-location-dot"></i>' +
        '<span class="tracking-address-text">' + deliveryAddress + '</span>' +
      '</div>';
    }

    // ── OTP Auto-Advance & Timer Logic ──
    let otpTimerInterval = null;

    function startOtpTimer() {
      // Clear any existing timer
      if (otpTimerInterval) clearInterval(otpTimerInterval);

      // Reset & clear all OTP boxes
      for (var i = 0; i < 4; i++) {
        var box = document.getElementById('otp-' + i);
        if (box) box.value = '';
      }

      // Disable Resend button, show 30s countdown
      var timerText = document.getElementById('otp-timer-text');
      var resendBtn = document.getElementById('otp-resend-btn');
      if (resendBtn) {
        resendBtn.disabled = true;
        resendBtn.style.opacity = '0.4';
        resendBtn.style.cursor = 'not-allowed';
      }

      var seconds = 30;
      function tick() {
        if (timerText) {
          var s = seconds < 10 ? '0' + seconds : '' + seconds;
          timerText.textContent = 'Resend in 00:' + s;
        }
        if (seconds <= 0) {
          clearInterval(otpTimerInterval);
          otpTimerInterval = null;
          if (timerText) timerText.textContent = 'OTP expired. Resend now.';
          if (resendBtn) {
            resendBtn.disabled = false;
            resendBtn.style.opacity = '1';
            resendBtn.style.cursor = 'pointer';
          }
          return;
        }
        seconds--;
      }
      tick();
      otpTimerInterval = setInterval(tick, 1000);

      // Focus first box
      setTimeout(function() {
        var firstBox = document.getElementById('otp-0');
        if (firstBox) firstBox.focus();
      }, 200);
    }

    function otpAdvance(input, index) {
      // Allow only digits
      input.value = input.value.replace(/[^0-9]/g, '').slice(-1);
      if (input.value.length === 1 && index < 3) {
        var nextBox = document.getElementById('otp-' + (index + 1));
        if (nextBox) {
          nextBox.focus();
          nextBox.select();
        }
      }
      // If all 4 filled, auto-verify after short delay
      var allFilled = true;
      for (var i = 0; i < 4; i++) {
        var b = document.getElementById('otp-' + i);
        if (!b || b.value.length === 0) { allFilled = false; break; }
      }
      if (allFilled) {
        setTimeout(function() { showScreen('home'); }, 400);
      }
    }

    function otpBackspace(event, index) {
      var input = document.getElementById('otp-' + index);
      if (event.key === 'Backspace' && input && input.value === '' && index > 0) {
        var prevBox = document.getElementById('otp-' + (index - 1));
        if (prevBox) {
          prevBox.focus();
          prevBox.select();
        }
      }
    }

    function otpResend() {
      var resendBtn = document.getElementById('otp-resend-btn');
      if (resendBtn && resendBtn.disabled) return;
      startOtpTimer();
    }

    // ── Payment Screen Interactive Logic ──
    let selectedPayMethod = 'upi';
    const allPayMethods = ['upi', 'card', 'netbanking', 'cod'];

    function selectPayOption(method) {
      selectedPayMethod = method;
      allPayMethods.forEach(m => {
        const item = document.getElementById('p-opt-' + m);
        const dot = item ? item.querySelector('.pm-radio-dot') : null;
        const chk = document.getElementById('chk-' + m);
        if (m === method) {
          if (item) item.classList.add('active');
          if (dot) dot.style.display = 'block';
          if (chk) chk.style.display = 'flex';
        } else {
          if (item) item.classList.remove('active');
          if (dot) dot.style.display = 'none';
          if (chk) chk.style.display = 'none';
        }
      });
    }

    function handleFinalPay() {
      const totElem = document.getElementById('pm-total-val');
      const total = totElem ? totElem.textContent : '₹502';
      alert('Order Placed Successfully! Paid ' + total + ' via ' + selectedPayMethod.toUpperCase() + '. Tracking your fresh delivery now!');
      showScreen('tracking');
    }

    // Initialize cart & checkout display
    updateSearchCartBar();
    renderCheckoutScreen();

    // Start with Onboarding screen
    showScreen('onboarding');
  </script>
</body>
</html>`;

const outputPath = 'C:/Users/legen/.gemini/antigravity/brain/975a047c-8df1-4a3d-9b83-48a93c0533c9/desi-app-preview.html';
fs.writeFileSync(outputPath, previewHtml, 'utf8');
fs.writeFileSync(path.join(__dirname, '..', 'desi-app-preview.html'), previewHtml, 'utf8');
console.log('Successfully updated preview HTML with recreated Login Screen!');
