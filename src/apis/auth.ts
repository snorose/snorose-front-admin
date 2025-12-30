import { axiosInstance } from '@/axios/instance';
import type {
  LoginRequest,
  LoginResponse,
  ReissueTokenRequest,
  ReissueTokenResponse,
} from '@/types';

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
    '/v1/users/reissueToken',
    request
  );
  return response.data;
};

