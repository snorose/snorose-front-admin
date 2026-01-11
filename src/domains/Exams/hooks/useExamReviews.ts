import { useQuery } from '@tanstack/react-query';
import { getExamReviews } from '@/apis/exam';
import type { ExamReviewApiResponse } from '@/apis/exam';
import type { ExamReview } from '@/domains/Exams/components/ExamTable';

// types
interface UseExamReviewsParams {
  page: number;
  keyword?: string;
  lectureYear?: number;
  semester?: string;
  examType?: string;
  enabled?: boolean;
}

interface ExamReviewsResponse {
  isSuccess: boolean;
  code: number;
  message: string;
  result: {
    data: ExamReviewApiResponse[];
    hasNext: boolean;
  };
}

// functions
// API 응답을 ExamReview로 변환하는 함수
const transformApiResponseToExamReview = (
  apiData: ExamReviewApiResponse
): ExamReview => {
  // title 파싱: "2023-1/기말/프로그래밍입문/이종우/001"
  const titleParts = apiData.title.split('/');
  const semester = titleParts[0] || '';
  const examType = titleParts[1] || '';
  const courseName = titleParts[2] || '';
  const professor = titleParts[3] || '';
  const classNumber = titleParts[4] || '';
  const reviewTitle = apiData.title;

  const date = new Date(apiData.createdAt);
  const uploadTime = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
  const status = apiData.isConfirmed ? 'CONFIRMED' : 'UNCONFIRMED';

  return {
    id: apiData.postId,
    status,
    reviewTitle,
    courseName,
    professor,
    semester,
    examType,
    classNumber,
    questionDetail: apiData.questionDetail,
    uploadTime,
    userDisplay: apiData.userDisplay,
  };
};

export const useExamReviews = (params: UseExamReviewsParams) => {
  const {
    page,
    keyword,
    lectureYear,
    semester,
    examType,
    enabled = true,
  } = params;

  return useQuery({
    queryKey: ['examReviews', page, keyword, lectureYear, semester, examType],
    queryFn: async () => {
      const response = (await getExamReviews({
        page: page - 1, // API는 0부터 시작
        keyword,
        lectureYear,
        semester,
        examType,
      })) as ExamReviewsResponse;

      if (!response.isSuccess || !response.result) {
        throw new Error(
          response.message || '시험 후기 목록을 불러오는데 실패했습니다.'
        );
      }

      return {
        data: response.result.data.map(transformApiResponseToExamReview),
        hasNext: response.result.hasNext,
      };
    },
    enabled,
    staleTime: 1000 * 60 * 5, // 5분간 fresh 상태 유지
  });
};
