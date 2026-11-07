export interface AuthUser {
  uid: string;
  phoneNumber: string | null;
  displayName: string | null;
}

export interface OtpConfirmation {
  confirm(code: string): Promise<unknown>;
}
