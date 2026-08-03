import { axiosInstance } from '@/shared/axios/instance';
import { REISSUE_TOKEN_ENDPOINT } from '@/shared/constants';
import type { BaseResponse } from '@/shared/types';
import type {
  LoginRequest,
  LoginResult,
  ReissueTokenRequest,
  TokenResponse,
} from '@/shared/types';

export const loginAPI = async (
  credentials: LoginRequest
): Promise<LoginResult> => {
  const response = await axiosInstance.post<BaseResponse<LoginResult>>(
    '/v1/users/login',
    credentials
  );

  if (!response.data.isSuccess) {
    throw new Error(response.data.message || '로그인에 실패했습니다.');
  }

  return response.data.result;
};

export const reissueTokenAPI = async (
  request: ReissueTokenRequest
): Promise<TokenResponse> => {
  const response = await axiosInstance.post<BaseResponse<TokenResponse>>(
    REISSUE_TOKEN_ENDPOINT,
    request
  );

  if (!response.data.isSuccess) {
    throw new Error(response.data.message || '토큰 재발급에 실패했습니다.');
  }

  return response.data.result;
};
