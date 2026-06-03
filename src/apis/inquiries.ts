import { axiosInstance } from '@/shared/axios/instance';
import type {
  AdminInquiryCommentCreateRequest,
  AdminInquiryCommentCreateResponse,
  AdminInquiryCommentDeleteResponse,
  AdminInquiryCommentUpdateRequest,
  AdminInquiryCommentUpdateResponse,
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

export const createInquiryCommentAPI = async (
  postId: number,
  data: AdminInquiryCommentCreateRequest
): Promise<AdminInquiryCommentCreateResponse> => {
  const response = await axiosInstance.post<AdminInquiryCommentCreateResponse>(
    `/v1/posts/${postId}/comments`,
    data
  );
  return response.data;
};

export const updateInquiryCommentAPI = async (
  postId: number,
  commentId: number,
  data: AdminInquiryCommentUpdateRequest
): Promise<AdminInquiryCommentUpdateResponse> => {
  const response = await axiosInstance.patch<AdminInquiryCommentUpdateResponse>(
    `/v1/posts/${postId}/comments/${commentId}`,
    data
  );
  return response.data;
};

export const deleteInquiryCommentAPI = async (
  postId: number,
  commentId: number
): Promise<AdminInquiryCommentDeleteResponse> => {
  const response =
    await axiosInstance.delete<AdminInquiryCommentDeleteResponse>(
      `/v1/posts/${postId}/comments/${commentId}`
    );
  return response.data;
};
