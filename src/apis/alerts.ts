import { axiosInstance } from '@/shared/axios/instance';
import type { BaseResponse, PushNotification } from '@/shared/types';

export const postPushNotificationAPI = async (
  data: PushNotification
): Promise<void> => {
  await axiosInstance.post<BaseResponse<void>>('/v1/admin/alerts', data);
};
