import { axiosInstance } from '@/shared/axios/instance';
import type {
  ConfirmExamReviewRequest,
  ConfirmExamReviewResponse,
  UpdateExamReviewRequest,
  UpdateExamReviewResponse,
  DeleteExamReviewResponse,
  ExamReviewDetailResponse,
  ExamReviewsResponse,
} from '@/domains/Reviews/types';

// 시험후기 목록 조회 api
export const getExamReviews = async (params: {
  page: number;
  keyword?: string;
  lectureYear?: number;
  semester?: string;
  examType?: string;
}): Promise<ExamReviewsResponse> => {
  const response = await axiosInstance.get(`/v1/reviews`, {
    params,
  });
  return response.data;
};

// 시험후기 확인 처리 (isConfirmed 변경) api
export const confirmExamReview = async (
  postId: number,
  data: ConfirmExamReviewRequest
): Promise<ConfirmExamReviewResponse> => {
  const response = await axiosInstance.put(
    `/v1/admin/reviews/confirm/${postId}`,
    data
  );
  return response.data;
};

// 시험후기 상세 수정 api
export const updateExamReview = async (
  postId: number,
  data: UpdateExamReviewRequest
): Promise<UpdateExamReviewResponse> => {
  const formData = new FormData();

  if (data.file) {
    formData.append('file', data.file); // 파일이 있으면 추가
  }

  formData.append('post', JSON.stringify(data.post));

  const response = await axiosInstance.patch(
    `/v1/admin/reviews/${postId}`,
    formData,
    {
      headers: {
        'Content-Type': false,
      },
    }
  );
  return response.data;
};

// 시험후기 삭제 api
export const deleteExamReview = async (
  postId: number
): Promise<DeleteExamReviewResponse> => {
  const response = await axiosInstance.delete(`/v1/admin/reviews/${postId}`);
  return response.data;
};

// 시험후기 상세 조회 api
export const getExamReviewDetail = async (
  postId: number
): Promise<ExamReviewDetailResponse> => {
  const response = await axiosInstance.get(`/v1/reviews/${postId}`);
  return response.data;
};

// 시험후기 파일 다운로드 api
export const downloadExamReviewFile = async (
  postId: number,
  fileName: string
): Promise<Blob> => {
  const response = await axiosInstance.get(
    `/v1/reviews/files/${postId}/download/${fileName}`,
    {
      responseType: 'blob',
    }
  );
  return response.data;
};
