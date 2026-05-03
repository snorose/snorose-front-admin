import { useQuery } from '@tanstack/react-query';

import { formatDateTimeToMinutes } from '@/shared/utils';

import { STATUS } from '@/domains/Reviews/constants';
import type { ExamReview, ExamReviews } from '@/domains/Reviews/types';
import {
  convertExamTypeEnumToString,
  convertSemesterEnumToString,
} from '@/domains/Reviews/utils';

import { getExamReviews } from '@/apis';

interface UseExamReviewsParams {
  page: number;
  keyword?: string;
  lectureYear?: number;
  semester?: string;
  examType?: string;
  enabled?: boolean;
  refreshKey?: number;
}

const transformApiResponseToExamReview = (apiData: ExamReviews): ExamReview => {
  const reviewTitle = apiData.content || '';
  const courseName = apiData.lecture || '';
  const professor = apiData.professor || '';
  const semester = convertSemesterEnumToString(
    apiData.lectureSemester,
    apiData.lectureYear
  );
  const examType = convertExamTypeEnumToString(apiData.examType);
  const classNumber = String(apiData.classNumber ?? '');
  const uploadTime = formatDateTimeToMinutes(apiData.contentDate);
  const status = apiData.status || STATUS.UNCONFIRMED;
  const userDisplay = apiData.userName || apiData.encryptedUserId || '';

  return {
    id: apiData.postId,
    status,
    reviewTitle,
    courseName,
    professor,
    semester,
    examType,
    classNumber,
    questionDetail: '',
    uploadTime,
    userDisplay,
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
    refreshKey,
  } = params;

  return useQuery({
    queryKey: [
      'examReviews',
      page,
      keyword,
      lectureYear,
      semester,
      examType,
      refreshKey,
    ],
    queryFn: async () => {
      const response = await getExamReviews({
        page: page - 1, // API는 0부터 시작
        keyword,
        lectureYear,
        semester,
        examType,
      });

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
