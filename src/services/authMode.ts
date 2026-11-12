const MOCK_AUTH_PLATFORMS = new Set(['web', 'android']);

export function isMockAuthEnabled(
  platform: string,
  authMode: string | undefined,
  isDevelopment: boolean,
): boolean {
  return isDevelopment && authMode === 'mock' && MOCK_AUTH_PLATFORMS.has(platform);
}
