import { axiosInstance } from '@/shared/axios/instance';
import type {
  AdminInquiryDetailResponse,
  AdminInquiryListResponse,
  AdminInquiryStatusUpdateRequest,
  AdminInquiryStatusUpdateResponse,
  InquiryGroup,
  InquiryStatus,
  InquirySubGroup,
} from '@/shared/types';

export type AdminInquiryListParams = {
  page?: number;
  group?: InquiryGroup;
  subGroup?: InquirySubGroup;
  status?: InquiryStatus;
  userId?: number;
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

export const getAdminInquiryDetailAPI = async (
  inquiryId: number
): Promise<AdminInquiryDetailResponse> => {
  const response = await axiosInstance.get<AdminInquiryDetailResponse>(
    `/v1/admin/inquiries/${inquiryId}`
  );
  return response.data;
};

export const updateAdminInquiryStatusAPI = async (
  inquiryId: number,
  data: AdminInquiryStatusUpdateRequest
): Promise<AdminInquiryStatusUpdateResponse> => {
  const response = await axiosInstance.patch<AdminInquiryStatusUpdateResponse>(
    `/v1/admin/inquiries/${inquiryId}/status`,
    data
  );
  return response.data;
};
