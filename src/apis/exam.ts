import { axiosInstance } from '@/axios/instance';

// type 정의
export interface ExamReviewApiResponse {
  userDisplay: string;
  isWriterWithdrawn: boolean;
  postId: number;
  title: string;
  questionDetail: string;
  isConfirmed: boolean;
  commentCount: number;
  scrapCount: number;
  isScrapped: boolean;
  createdAt: string;
  isEdited: boolean;
}

export interface ConfirmExamReviewRequest {
  isConfirmed: boolean;
}

export interface ConfirmExamReviewResponse {
  isSuccess: boolean;
  code: number;
  message: string;
  result: {
    postId: number;
    isConfirmed: boolean;
  };
}

export interface UpdateExamReviewPost {
  lectureName?: string;
  professor?: string;
  classNumber?: number;
  lectureYear?: number;
  semester?: 'FIRST' | 'SECOND' | 'SUMMER' | 'WINTER' | 'OTHER';
  lectureType?:
    | 'MAJOR_REQUIRED'
    | 'MAJOR_ELECTIVE'
    | 'GENERAL_REQUIRED'
    | 'GENERAL_ELECTIVE'
    | 'OTHER';
  isPF?: boolean;
  isOnline?: boolean;
  isConfirmed?: boolean;
  examType?: 'MIDTERM' | 'FINALTERM';
  questionDetail?: string;
}

export interface UpdateExamReviewRequest {
  file?: File;
  post: UpdateExamReviewPost;
}

export interface UpdateExamReviewResponse {
  isSuccess: boolean;
  code: number;
  message: string;
  result: {
    postId: number;
  };
}

export interface DeleteExamReviewResponse {
  isSuccess: boolean;
  code: number;
  message: string;
  result: {
    postId: number;
  };
}

// api 함수
export const getExamReviews = async (params: {
  page: number;
  keyword?: string;
  lectureYear?: number;
  semester?: string;
  examType?: string;
}) => {
  const response = await axiosInstance.get(`/v1/reviews`, {
    params,
  });
  return response.data;
};

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

export const updateExamReview = async (
  postId: number,
  data: UpdateExamReviewRequest
): Promise<UpdateExamReviewResponse> => {
  const formData = new FormData();

  // 파일이 있으면 추가
  if (data.file) {
    formData.append('file', data.file);
  }

  // post 객체를 JSON 문자열로 변환하여 추가
  // API 스펙에 따라 JSON 문자열로 직접 전송
  formData.append('post', JSON.stringify(data.post));

  // FormData를 사용하면 request interceptor에서 자동으로 Content-Type이 제거됨
  const response = await axiosInstance.patch(
    `/v1/admin/reviews/${postId}`,
    formData
  );
  return response.data;
};

export const deleteExamReview = async (
  postId: number
): Promise<DeleteExamReviewResponse> => {
  const response = await axiosInstance.delete(`/v1/admin/reviews/${postId}`);
  return response.data;
};
