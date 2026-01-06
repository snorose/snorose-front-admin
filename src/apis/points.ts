import { axiosInstance } from '@/axios/instance';
import type { AdjustSinglePoint } from '@/types';

export const postSinglePointAPI = async (data: AdjustSinglePoint) => {
  const response = await axiosInstance.post('/v1/points', data);
  return response.data;
};

export const getPendingPointsAPI = async () => {
  const response = await axiosInstance.get('/v1/admin/points/point-freeze');
  return response.data;
};
