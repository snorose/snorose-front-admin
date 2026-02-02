import {
  ACCESS_TOKEN_EXPIRE_MINUTES,
  REFRESH_TOKEN_EXPIRE_DAYS,
} from '@/shared/constants';
import type { User } from '@/shared/types';

export const cookie = {
  get: (name: string): string | null => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);

    if (parts.length === 2) {
      return parts.pop()?.split(';').shift() || null;
    }

    return null;
  },

  set: (name: string, value: string, days: number): void => {
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

  setAccessToken: (
    token: string,
    minutes: number = ACCESS_TOKEN_EXPIRE_MINUTES
  ): void => cookie.set('accessToken', token, minutes / (24 * 60)),

  removeAccessToken: (): void => cookie.remove('accessToken'),

  getRefreshToken: (): string | null => cookie.get('refreshToken'),

  setRefreshToken: (
    token: string,
    days: number = REFRESH_TOKEN_EXPIRE_DAYS
  ): void => cookie.set('refreshToken', token, days),

  removeRefreshToken: (): void => cookie.remove('refreshToken'),

  clearAll: (): void => {
    tokenStorage.removeAccessToken();
    tokenStorage.removeRefreshToken();
  },
};

export const userStorage = {
  getUser: (): User | null => {
    const nickname = localStorage.getItem('userNickname');
    if (!nickname) return null;

    return { nickname } as User;
  },

  setUser: (user: User): void => {
    try {
      localStorage.setItem('userNickname', user.nickname);
    } catch {
      return;
    }
  },

  removeUser: (): void => {
    localStorage.removeItem('userNickname');
  },
};
