export interface AuthUser {
  uid: string;
  phoneNumber: string | null;
  displayName: string | null;
  /** Local development-only marker; never represents a Firebase Admin claim. */
  isAdminDemo?: boolean;
}

export interface OtpConfirmation {
  confirm(code: string): Promise<unknown>;
}
