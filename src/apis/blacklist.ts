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
  // result는 페이지네이션 객체({ hasNext, totalPage, totalCount, data }).
  // 이력이 없거나 응답이 비면 data가 배열이 아닐 수 있어 방어적으로 정규화한다.
  const result = response.data.result;

  return {
    hasNext: result?.hasNext ?? false,
    totalPage: result?.totalPage ?? 0,
    totalCount: result?.totalCount ?? 0,
    data: Array.isArray(result?.data) ? result.data : [],
  };
};

// 경고 및 강등 부여
export const warnPenaltyAPI = async (
  data: AdminBlacklistReq
): Promise<void> => {
  await axiosInstance.post<BaseResponse<void>>('/v1/admin/blacklists', data);
};
