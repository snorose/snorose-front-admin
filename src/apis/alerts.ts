import { axiosInstance } from '@/shared/axios/instance';
import type { PushNotification } from '@/types';

export const postPushNotificationAPI = async (data: PushNotification) => {
  const response = await axiosInstance.post('/v1/admin/alerts', data);
  return response.data;
};
