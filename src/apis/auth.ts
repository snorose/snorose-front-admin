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
): Promise<BaseResponse<LoginResult>> => {
  const response = await axiosInstance.post<BaseResponse<LoginResult>>(
    '/v1/users/login',
    credentials
  );
  return response.data;
};

export const reissueTokenAPI = async (
  request: ReissueTokenRequest
): Promise<BaseResponse<TokenResponse>> => {
  const response = await axiosInstance.post<BaseResponse<TokenResponse>>(
    REISSUE_TOKEN_ENDPOINT,
    request
  );
  return response.data;
};
