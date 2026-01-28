import { axiosInstance } from '@/shared/axios/instance';
import type {
  AdjustSinglePoint,
  CreatePointFreeze,
  UpdatePointFreeze,
  AdjustAllMemberPoint,
} from '@/shared/types';

export const postSinglePointAPI = async (data: AdjustSinglePoint) => {
  const response = await axiosInstance.post('/v1/points', data);
  return response.data;
};

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

export const postAllMemberPointAPI = async (data: AdjustAllMemberPoint) => {
  const response = await axiosInstance.post(
    '/v1/admin/points/point-freeze/insert-bulk-logs',
    data
  );
  return response.data;
};
