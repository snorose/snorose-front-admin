export const cookie = {
  get: (name: string): string | null => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) {
      return parts.pop()?.split(';').shift() || null;
    }
    return null;
  },

  set: (name: string, value: string, days: number = 7): void => {
    const expires = new Date();
    expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
    document.cookie = `${name}=${value}; expires=${expires.toUTCString()}; path=/`;
  },

  remove: (name: string): void => {
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
  },
};

export const tokenStorage = {
  getAccessToken: (): string | null => cookie.get('accessToken'),

  setAccessToken: (token: string, minutes: number = 15): void =>
    cookie.set('accessToken', token, minutes / (24 * 60)),

  removeAccessToken: (): void => cookie.remove('accessToken'),

  getRefreshToken: (): string | null => cookie.get('refreshToken'),

  setRefreshToken: (token: string, days: number = 7): void =>
    cookie.set('refreshToken', token, days),

  removeRefreshToken: (): void => cookie.remove('refreshToken'),

  clearAll: (): void => {
    tokenStorage.removeAccessToken();
    tokenStorage.removeRefreshToken();
  },
};
