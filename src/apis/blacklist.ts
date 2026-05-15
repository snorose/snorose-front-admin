import { axiosInstance } from '@/shared/axios/instance';
import type { AdminBlacklistReq } from '@/shared/types';

// 블랙리스트 이력 불러오기
export const blacklistHistoryAPI = async (
  encryptedUserId: string,
  params: {
    page?: number;
    startDate?: string;
    endDate?: string;
    type?: 'WARNING' | 'RELEGATION' | 'BLACKLIST';
  } = {}
) => {
  const response = await axiosInstance.get(
    `/v1/admin/blacklists/${encryptedUserId}`,
    {
      params,
    }
  );
  return response.data;
};

// 경고 및 강등 부여
export const warnPenaltyAPI = async (data: AdminBlacklistReq) => {
  const response = await axiosInstance.post('/v1/admin/blacklists', data);
  return response.data;
};
