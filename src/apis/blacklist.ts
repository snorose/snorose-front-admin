import { axiosInstance } from '@/shared/axios/instance';
import type { BaseResponse } from '@/shared/types';
import type { AdminBlacklistReq, AdminBlacklistResult } from '@/shared/types';

// 블랙리스트 이력 불러오기
export const blacklistHistoryAPI = async (
  encryptedUserId: string,
  params: {
    page?: number;
    startDate?: string;
    endDate?: string;
    type?: 'WARNING' | 'RELEGATION' | 'BLACKLIST';
  } = { page: 0 }
): Promise<AdminBlacklistResult> => {
  const response = await axiosInstance.get<BaseResponse<AdminBlacklistResult>>(
    `/v1/admin/blacklists/${encryptedUserId}`,
    { params }
  );
  return response.data.result;
};

// 경고 및 강등 부여
export const warnPenaltyAPI = async (
  data: AdminBlacklistReq
): Promise<void> => {
  await axiosInstance.post<BaseResponse<void>>('/v1/admin/blacklists', data);
};
