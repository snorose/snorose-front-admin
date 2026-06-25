import { axiosInstance } from '@/shared/axios/instance';
import type { BaseResponse } from '@/shared/types';
import type {
  AdjustAllMemberPoint,
  AdjustSinglePoint,
  CreatePointFreeze,
  ExcelPointBulkRewardRequest,
  ExcelPointBulkRewardResult,
  PointFreeze,
  UpdatePointFreeze,
} from '@/shared/types';

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
