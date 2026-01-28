import { axiosInstance } from '@/shared/axios/instance';

export const blacklistHistoryAPI = async (encryptedUserId: string) => {
  const response = await axiosInstance.get(
    `/v1/admin/blacklists/${encryptedUserId}`
  );
  return response.data;
};
