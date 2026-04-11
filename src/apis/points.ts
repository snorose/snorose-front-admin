import { axiosInstance } from '@/shared/axios/instance';
import type {
  AdjustAllMemberPoint,
  AdjustSinglePoint,
  CreatePointFreeze,
  ExcelPointBulkRewardRequest,
  ExcelPointBulkRewardResponse,
  UpdatePointFreeze,
} from '@/shared/types';

// 어드민 포인트 증감
export const postSinglePointAPI = async (data: AdjustSinglePoint) => {
  const response = await axiosInstance.post('/v1/admin/points', data);
  return response.data;
};

export const postAllMemberPointAPI = async (data: AdjustAllMemberPoint) => {
  const response = await axiosInstance.post(
    '/v1/admin/points/bulk-reward',
    data
  );
  return response.data;
};

// 포인트 미지급 일정 관리
export const postPointFreezeAPI = async (data: CreatePointFreeze) => {
  const response = await axiosInstance.post(
    '/v1/admin/points/point-freeze',
    data
  );
  return response.data;
};

export const getPointFreezesAPI = async () => {
  const response = await axiosInstance.get('/v1/admin/points/point-freeze');
  return response.data;
};

export const patchPointFreezeAPI = async (
  id: number,
  data: UpdatePointFreeze
) => {
  const response = await axiosInstance.patch(
    `/v1/admin/points/point-freeze/${id}`,
    data
  );
  return response.data;
};

export const deletePointFreezeAPI = async (id: number) => {
  const response = await axiosInstance.delete(
    `/v1/admin/points/point-freeze/${id}`
  );
  return response.data;
};

export const postExcelPointBulkRewardAPI = async (params: {
  file: File;
  request: ExcelPointBulkRewardRequest;
}): Promise<ExcelPointBulkRewardResponse> => {
  const formData = new FormData();

  formData.append(
    'request',
    new Blob([JSON.stringify(params.request)], { type: 'application/json' }),
    'request.json'
  );
  formData.append('file', params.file);

  const response = await axiosInstance.post<ExcelPointBulkRewardResponse>(
    '/v1/admin/points/bulk-reward/excel',
    formData,
    {
      headers: {
        'Content-Type': undefined,
      },
    }
  );

  return response.data;
};
