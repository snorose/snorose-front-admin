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

export interface ExamReviewDetailResult {
  userId: string;
  userDisplay: string;
  isWriter: boolean;
  isWriterWithdrawn: boolean;
  postId: number;
  title: string;
  commentCount: number;
  scrapCount: number;
  isScrapped: boolean;
  createdAt: string;
  isNotice: boolean;
  isEdited: boolean;
  lectureName: string;
  professor: string;
  classNumber: number;
  lectureYear: number;
  semester: 'FIRST' | 'SECOND' | 'SUMMER' | 'WINTER' | 'OTHER';
  lectureType:
    | 'MAJOR_REQUIRED'
    | 'MAJOR_ELECTIVE'
    | 'GENERAL_REQUIRED'
    | 'GENERAL_ELECTIVE'
    | 'OTHER';
  isPF: boolean;
  isOnline: boolean;
  examType: 'MIDTERM' | 'FINALTERM';
  isConfirmed: boolean;
  fileName: string;
  questionDetail: string;
  isDownloaded: boolean;
}

export interface ExamReviewDetailResponse {
  isSuccess: boolean;
  code: number;
  message: string;
  result: ExamReviewDetailResult;
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

export const deleteExamReview = async (
  postId: number
): Promise<DeleteExamReviewResponse> => {
  const response = await axiosInstance.delete(`/v1/admin/reviews/${postId}`);
  return response.data;
};

export const getExamReviewDetail = async (
  postId: number
): Promise<ExamReviewDetailResponse> => {
  const response = await axiosInstance.get(`/v1/reviews/${postId}`);
  return response.data;
};

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
