import { axiosInstance } from '@/shared/axios/instance';
import type { BaseResponse } from '@/shared/types';
import type {
  AdjustAllMemberPoint,
  AdjustSinglePoint,
  AdminUserListItem,
  CreatePointFreeze,
  ExcelPointBulkRewardRequest,
  ExcelPointBulkRewardResult,
  PointFreeze,
  UpdatePointFreeze,
} from '@/shared/types';

import { getAllUsersAPI } from './users';

export const searchSinglePointMemberAPI = async (
  keyword: string
): Promise<AdminUserListItem> => {
  const query = keyword.trim();
  if (!query) throw new Error('검색어를 입력해주세요.');

  const matches = new Map<string, AdminUserListItem>();
  let page = 0;
  let hasNext: boolean;

  do {
    const result = await getAllUsersAPI({ keyword: query, page });
    for (const member of result.data) {
      if (member.studentNumber === query || member.loginId === query) {
        matches.set(member.encryptedUserId, member);
      }
    }
    if (matches.size > 1) {
      throw new Error(
        '일치하는 회원이 여러 명입니다. 다른 학번 또는 아이디로 검색해주세요.'
      );
    }
    hasNext = result.hasNext;
    page += 1;
  } while (hasNext);

  const member = matches.values().next().value;
  if (!member) {
    throw new Error(
      '입력한 학번 또는 아이디와 정확히 일치하는 회원이 없습니다.'
    );
  }
  return member;
};

// 어드민 포인트 증감
export const postSinglePointAPI = async (
  data: AdjustSinglePoint
): Promise<void> => {
  await axiosInstance.post<BaseResponse<void>>('/v1/admin/points', data);
};

export const postAllMemberPointAPI = async (
  data: AdjustAllMemberPoint
): Promise<void> => {
  await axiosInstance.post<BaseResponse<void>>(
    '/v1/admin/points/bulk-reward',
    data
  );
};

// 포인트 미지급 일정 관리
export const postPointFreezeAPI = async (
  data: CreatePointFreeze
): Promise<void> => {
  await axiosInstance.post<BaseResponse<void>>(
    '/v1/admin/points/point-freeze',
    data
  );
};

export const getPointFreezesAPI = async (): Promise<PointFreeze[]> => {
  const response = await axiosInstance.get<BaseResponse<PointFreeze[]>>(
    '/v1/admin/points/point-freeze'
  );
  return response.data.result;
};

export const patchPointFreezeAPI = async (
  id: number,
  data: UpdatePointFreeze
): Promise<void> => {
  await axiosInstance.patch<BaseResponse<void>>(
    `/v1/admin/points/point-freeze/${id}`,
    data
  );
};

export const deletePointFreezeAPI = async (id: number): Promise<void> => {
  await axiosInstance.delete<BaseResponse<void>>(
    `/v1/admin/points/point-freeze/${id}`
  );
};

export const postExcelPointBulkRewardAPI = async (params: {
  file: File;
  request: ExcelPointBulkRewardRequest;
}): Promise<ExcelPointBulkRewardResult> => {
  const formData = new FormData();

  formData.append(
    'request',
    new Blob([JSON.stringify(params.request)], { type: 'application/json' }),
    'request.json'
  );
  formData.append('file', params.file);

  const response = await axiosInstance.post<
    BaseResponse<ExcelPointBulkRewardResult>
  >('/v1/admin/points/bulk-reward/excel', formData, {
    headers: {
      'Content-Type': undefined,
    },
  });

  return response.data.result;
};
