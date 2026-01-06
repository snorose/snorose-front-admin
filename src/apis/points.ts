import { axiosInstance } from '@/axios/instance';
import type { AdjustSinglePoint, FreezingPoint } from '@/types';

export const postSinglePointAPI = async (data: AdjustSinglePoint) => {
  const response = await axiosInstance.post('/v1/points', data);
  return response.data;
};

export const postFreezingPointAPI = async (data: FreezingPoint) => {
  const response = await axiosInstance.post(
    '/v1/admin/points/point-freeze',
    data
  );
  return response.data;
};

export const getFreezingPointsAPI = async () => {
  const response = await axiosInstance.get('/v1/admin/points/point-freeze');
  return response.data;
};

export const updateFreezingPointAPI = async (
  id: number,
  data: AdjustSinglePoint
) => {
  const response = await axiosInstance.put(
    `/v1/admin/points/point-freeze/${id}`,
    data
  );
  return response.data;
};

export const deleteFreezingPointAPI = async (id: number) => {
  const response = await axiosInstance.delete(
    `/v1/admin/points/point-freeze/${id}`
  );
  return response.data;
};
