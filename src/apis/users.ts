import { axiosInstance } from '@/shared/axios/instance';
import type { EditMemberInfo, UpdateUserInfoResponse } from '@/shared/types';

export const searchUsersAPI = async (keyword: string) => {
  const response = await axiosInstance.get(`/v1/admin/users/search`, {
    params: { keyword },
  });
  return response.data;
};

export const editUsersAPI = async (
  encryptedUserId: string,
  data: Partial<EditMemberInfo>
): Promise<UpdateUserInfoResponse> => {
  const response = await axiosInstance.patch(
    `/v1/admin/users/${encryptedUserId}`,
    data
  );
  return response.data;
};
