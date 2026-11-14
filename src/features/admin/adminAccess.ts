export const DEVELOPMENT_ADMIN_PHONE = '+917644940067';

export function canAccessAdmin(hasAdminClaim: boolean, phone: string | null, isDevelopment: boolean): boolean {
  return hasAdminClaim && (!isDevelopment || phone === DEVELOPMENT_ADMIN_PHONE);
}

export function canRequestAdminOtp(phone: string, isDevelopment: boolean): boolean {
  return !isDevelopment || phone === DEVELOPMENT_ADMIN_PHONE;
}
