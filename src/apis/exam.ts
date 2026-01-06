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
  // Content-Type을 application/json으로 설정하기 위해 Blob 사용
  const postBlob = new Blob([JSON.stringify(data.post)], {
    type: 'application/json',
  });
  formData.append('post', postBlob);

  const response = await axiosInstance.patch(
    `/v1/admin/reviews/${postId}`,
    formData
  );
  return response.data;
};
