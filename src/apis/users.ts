import { axiosInstance } from '@/axios/instance';

export const searchUsersAPI = async (keyword: string) => {
  const response = await axiosInstance.get(`/v1/admin/users/search`, {
    params: { keyword },
  });
  return response.data;
};
