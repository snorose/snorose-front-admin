import { axiosInstance } from '@/axios/instance';
import type { AdjustSinglePoint } from '@/types';

export const postSinglePointAPI = async (data: AdjustSinglePoint) => {
  const response = await axiosInstance.post('/v1/points', data);
  return response.data;
};
