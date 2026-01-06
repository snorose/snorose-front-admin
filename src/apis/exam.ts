import { axiosInstance } from '@/axios/instance';

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
