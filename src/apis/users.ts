import { axiosInstance } from '@/shared/axios/instance';
import type { BaseResponse } from '@/shared/types';
import type {
  AdminUserListParams,
  AdminUserListResult,
  EditMemberInfo,
  MemberInfo,
} from '@/shared/types';

export const getAllUsersAPI = async (
  params: AdminUserListParams = {}
): Promise<AdminUserListResult> => {
  const response = await axiosInstance.get<BaseResponse<AdminUserListResult>>(
    `/v2/admin/users`,
    {
      params,
    }
  );
  return response.data.result;
};

export const searchUsersAPI = async (keyword: string): Promise<MemberInfo> => {
  const response = await axiosInstance.get<BaseResponse<MemberInfo>>(
    `/v1/admin/users/search`,
    {
      params: { keyword },
    }
  );
  return response.data.result;
};

export const editUsersAPI = async (
  encryptedUserId: string,
  data: Partial<EditMemberInfo>
): Promise<void> => {
  await axiosInstance.patch<BaseResponse<void>>(
    `/v1/admin/users/${encryptedUserId}`,
    data
  );
};

export const getUserDetailAPI = async (
  encryptedUserId: string
): Promise<MemberInfo> => {
  const response = await axiosInstance.get<BaseResponse<MemberInfo>>(
    `/v1/admin/users/${encryptedUserId}`
  );
  return response.data.result;
};
