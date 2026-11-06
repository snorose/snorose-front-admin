import { axiosInstance } from '@/shared/axios/instance';
import type { BaseResponse } from '@/shared/types';

import type {
  AdminCreateNoticeRequest,
  AdminCreateNoticeResult,
  AdminNoticeListResult,
} from '@/domains/Notices/types';

// API 미배포 상태이므로 현재 화면은 이 클라이언트를 호출하지 않고 목 응답을 사용합니다.
export async function getAdminNotices(
  page = 0
): Promise<AdminNoticeListResult> {
  const { data } = await axiosInstance.get<BaseResponse<AdminNoticeListResult>>(
    '/v1/admin/notices',
    { params: { page } }
  );
  return data.result;
}

export async function createAdminNotice(
  body: AdminCreateNoticeRequest
): Promise<AdminCreateNoticeResult> {
  const { data } = await axiosInstance.post<
    BaseResponse<AdminCreateNoticeResult>
  >('/v1/admin/notices', body);
  return data.result;
}
