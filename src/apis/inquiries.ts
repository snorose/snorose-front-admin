import { axiosInstance } from '@/shared/axios/instance';
import type {
  AdminInquiryListResponse,
  InquiryGroup,
  InquiryStatus,
  InquirySubGroup,
} from '@/shared/types';

export type AdminInquiryListParams = {
  page?: number;
  group?: InquiryGroup;
  subGroup?: InquirySubGroup;
  status?: InquiryStatus;
  userId?: string;
};

export const getAdminInquiriesAPI = async (
  params: AdminInquiryListParams = { page: 0 }
): Promise<AdminInquiryListResponse> => {
  const response = await axiosInstance.get<AdminInquiryListResponse>(
    '/v1/admin/inquiries',
    {
      params,
    }
  );
  return response.data;
};
