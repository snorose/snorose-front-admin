import { axiosInstance } from '@/shared/axios/instance';
import type { BaseResponse } from '@/shared/types';
import type {
  AdminInquiryCommentCreateRequest,
  AdminInquiryCommentCreateResult,
  AdminInquiryCommentDeleteResult,
  AdminInquiryCommentListResult,
  AdminInquiryCommentUpdateRequest,
  AdminInquiryCommentUpdateResult,
  AdminInquiryDetailResult,
  AdminInquiryListResult,
  AdminInquiryStatusUpdateRequest,
  AdminInquiryStatusUpdateResult,
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
): Promise<AdminInquiryListResult> => {
  const response = await axiosInstance.get<
    BaseResponse<AdminInquiryListResult>
  >('/v1/admin/inquiries', { params });
  return response.data.result;
};

export const getAdminInquiryDetailAPI = async (
  inquiryId: number
): Promise<AdminInquiryDetailResult> => {
  const response = await axiosInstance.get<
    BaseResponse<AdminInquiryDetailResult>
  >(`/v1/admin/inquiries/${inquiryId}`);
  return response.data.result;
};

export const updateAdminInquiryStatusAPI = async (
  inquiryId: number,
  data: AdminInquiryStatusUpdateRequest
): Promise<AdminInquiryStatusUpdateResult> => {
  const response = await axiosInstance.patch<
    BaseResponse<AdminInquiryStatusUpdateResult>
  >(`/v1/admin/inquiries/${inquiryId}/status`, data);
  return response.data.result;
};

export const getAdminInquiryCommentsAPI = async (
  postId: number,
  params: { page?: number } = { page: 0 }
): Promise<AdminInquiryCommentListResult> => {
  const response = await axiosInstance.get<
    BaseResponse<AdminInquiryCommentListResult>
  >(`/v1/posts/${postId}/comments`, { params });
  return response.data.result;
};

export const createInquiryCommentAPI = async (
  postId: number,
  data: AdminInquiryCommentCreateRequest
): Promise<AdminInquiryCommentCreateResult> => {
  const response = await axiosInstance.post<
    BaseResponse<AdminInquiryCommentCreateResult>
  >(`/v1/posts/${postId}/comments`, data);
  return response.data.result;
};

export const updateInquiryCommentAPI = async (
  postId: number,
  commentId: number,
  data: AdminInquiryCommentUpdateRequest
): Promise<AdminInquiryCommentUpdateResult> => {
  const response = await axiosInstance.patch<
    BaseResponse<AdminInquiryCommentUpdateResult>
  >(`/v1/posts/${postId}/comments/${commentId}`, data);
  return response.data.result;
};

export const deleteInquiryCommentAPI = async (
  postId: number,
  commentId: number
): Promise<AdminInquiryCommentDeleteResult> => {
  const response = await axiosInstance.delete<
    BaseResponse<AdminInquiryCommentDeleteResult>
  >(`/v1/posts/${postId}/comments/${commentId}`);
  return response.data.result;
};
