import { axiosInstance } from '@/shared/axios/instance';
import type { BaseResponse } from '@/shared/types';
import type {
  CreateExamReviewPeriod,
  ExamReviewPeriod,
  UpdateExamReviewPeriod,
} from '@/shared/types';

import type {
  ExamReviewDetailResult,
  ExamReviewSearchParams,
  ExamReviewsResult,
  UpdateExamReviewRequest,
} from '@/domains/Reviews/types';

// 시험후기 목록 조회 api
export const getExamReviews = async (
  params: ExamReviewSearchParams & { page: number }
): Promise<ExamReviewsResult> => {
  const response = await axiosInstance.get<BaseResponse<ExamReviewsResult>>(
    `/v1/admin/reviews`,
    {
      params,
    }
  );
  return response.data.result;
};

// 시험후기 상세 수정 api
export const updateExamReview = async (
  postId: number,
  data: UpdateExamReviewRequest
): Promise<ExamReviewDetailResult> => {
  const formData = new FormData();

  if (data.file) {
    formData.append('file', data.file);
  }

  formData.append(
    'post',
    new Blob([JSON.stringify(data.post)], { type: 'application/json' })
  );

  const response = await axiosInstance.patch<
    BaseResponse<ExamReviewDetailResult>
  >(`/v1/admin/reviews/${postId}`, formData, {
    headers: {
      'Content-Type': undefined,
    },
  });
  return response.data.result;
};

// 시험후기 삭제 api
export const deleteExamReview = async (
  postId: number
): Promise<{ postId: number }> => {
  const response = await axiosInstance.delete<BaseResponse<{ postId: number }>>(
    `/v1/admin/reviews/${postId}`
  );
  return response.data.result;
};

// 시험후기 상세 조회 api
export const getExamReviewDetail = async (
  postId: number
): Promise<ExamReviewDetailResult> => {
  const response = await axiosInstance.get<
    BaseResponse<ExamReviewDetailResult>
  >(`/v1/admin/reviews/${postId}`);
  return response.data.result;
};

// 시험후기 파일 다운로드 api
export const downloadExamReviewFile = async (
  postId: number,
  fileName: string
): Promise<Blob> => {
  const response = await axiosInstance.get(
    `/v1/reviews/files/${postId}/download/${fileName}`,
    { responseType: 'blob' }
  );
  return response.data;
};

// 시험 후기 작성 기간 관리 api
export const postExamReviewPeriodAPI = async (
  data: CreateExamReviewPeriod
): Promise<void> => {
  await axiosInstance.post<BaseResponse<void>>(
    '/v1/admin/reviews/period',
    data
  );
};

export const getExamReviewPeriodsAPI = async (): Promise<
  ExamReviewPeriod[]
> => {
  const response = await axiosInstance.get<BaseResponse<ExamReviewPeriod[]>>(
    '/v1/admin/reviews/period'
  );
  return response.data.result;
};

export const patchExamReviewPeriodAPI = async (
  periodId: number,
  data: UpdateExamReviewPeriod
): Promise<void> => {
  await axiosInstance.patch<BaseResponse<void>>(
    `/v1/admin/reviews/period/${periodId}`,
    data
  );
};

export const deleteExamReviewPeriodAPI = async (
  periodId: number
): Promise<void> => {
  await axiosInstance.delete<BaseResponse<void>>(
    `/v1/admin/reviews/period/${periodId}`
  );
};
