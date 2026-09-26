import {
  AxiosError,
  AxiosHeaders,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from 'axios';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import { REISSUE_TOKEN_ENDPOINT } from '@/shared/constants';
import { TokenRefreshManager, tokenStorage } from '@/shared/utils';

import { reissueTokenAPI } from '@/apis';

import { axiosInstance } from './instance';

vi.mock('@/apis', () => ({ reissueTokenAPI: vi.fn() }));

const tokens = {
  grantType: 'Bearer',
  accessToken: 'renewed-access-token',
  refreshToken: 'renewed-refresh-token',
};

function response(config: InternalAxiosRequestConfig): AxiosResponse {
  return {
    config,
    data: [],
    status: 200,
    statusText: 'OK',
    headers: new AxiosHeaders(),
  };
}

describe('인증 요청의 토큰 재발급', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    tokenStorage.clearAll();
    TokenRefreshManager.reset();
    tokenStorage.setRefreshToken('saved-refresh-token');
    vi.mocked(reissueTokenAPI).mockResolvedValue(tokens);
  });

  afterEach(() => tokenStorage.clearAll());

  test('액세스 토큰 만료 시 API 호출 전에 재발급한 토큰을 첨부한다', async () => {
    const adapter = vi.fn(async (config: InternalAxiosRequestConfig) => {
      expect(config.headers.Authorization).toBe(`Bearer ${tokens.accessToken}`);
      return response(config);
    });

    await axiosInstance.get('/v1/admin/points/point-freeze', { adapter });

    expect(reissueTokenAPI).toHaveBeenCalledExactlyOnceWith({
      refreshToken: 'saved-refresh-token',
    });
    expect(adapter).toHaveBeenCalledTimes(1);
  });

  test('동시에 발생한 여러 요청은 하나의 토큰 재발급을 공유한다', async () => {
    let resolve!: (value: typeof tokens) => void;
    vi.mocked(reissueTokenAPI).mockReturnValueOnce(
      new Promise((done) => {
        resolve = done;
      })
    );
    const adapter = vi.fn(async (config: InternalAxiosRequestConfig) => {
      expect(config.headers.Authorization).toBe(`Bearer ${tokens.accessToken}`);
      return response(config);
    });

    const requests = Promise.all([
      axiosInstance.get('/v1/admin/points/point-freeze', { adapter }),
      axiosInstance.get('/v2/admin/users', { adapter }),
    ]);
    await vi.waitFor(() => expect(reissueTokenAPI).toHaveBeenCalledTimes(1));
    expect(adapter).not.toHaveBeenCalled();
    resolve(tokens);
    await requests;
    expect(reissueTokenAPI).toHaveBeenCalledTimes(1);
    expect(adapter).toHaveBeenCalledTimes(2);
  });

  test.each(['/v1/users/login', REISSUE_TOKEN_ENDPOINT])(
    '%s 요청은 재발급을 기다리지 않고 바로 전송한다',
    async (url) => {
      const adapter = vi.fn(async (config: InternalAxiosRequestConfig) =>
        response(config)
      );
      await axiosInstance.post(url, {}, { adapter });
      expect(reissueTokenAPI).not.toHaveBeenCalled();
      expect(adapter).toHaveBeenCalledTimes(1);
    }
  );

  test('쿠키가 있어도 서버에서 만료된 토큰을 거절하면 재발급 후 다시 요청한다', async () => {
    tokenStorage.setAccessToken('expired-access-token');
    const adapter = vi.fn(async (config: InternalAxiosRequestConfig) => {
      if (config.headers.Authorization === 'Bearer expired-access-token') {
        throw new AxiosError('Unauthorized', 'ERR_BAD_REQUEST', config, null, {
          ...response(config),
          status: 401,
        });
      }
      expect(config.headers.Authorization).toBe(`Bearer ${tokens.accessToken}`);
      return response(config);
    });

    await axiosInstance.get('/v1/admin/points/point-freeze', { adapter });
    expect(adapter).toHaveBeenCalledTimes(2);
    expect(reissueTokenAPI).toHaveBeenCalledTimes(1);
  });
});
