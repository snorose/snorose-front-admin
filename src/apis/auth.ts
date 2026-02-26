import { axiosInstance } from '@/shared/axios/instance';
import type {
  LoginRequest,
  LoginResponse,
  ReissueTokenRequest,
  ReissueTokenResponse,
} from '@/shared/types';
import { REISSUE_TOKEN_ENDPOINT } from '@/shared/constants';

export const loginAPI = async (
  credentials: LoginRequest
): Promise<LoginResponse> => {
  const response = await axiosInstance.post<LoginResponse>(
    '/v1/users/login',
    credentials
  );
  return response.data;
};

export const reissueTokenAPI = async (
  request: ReissueTokenRequest
): Promise<ReissueTokenResponse> => {
  const response = await axiosInstance.post<ReissueTokenResponse>(
    REISSUE_TOKEN_ENDPOINT,
    request
  );
  return response.data;
};
