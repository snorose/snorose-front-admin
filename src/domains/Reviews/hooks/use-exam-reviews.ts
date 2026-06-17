import { useQuery } from '@tanstack/react-query';

import { formatDateTimeToMinutes } from '@/shared/utils';

import { STATUS } from '@/domains/Reviews/constants';
import type {
  ExamReview,
  ExamReviewSearchParams,
  ExamReviews,
} from '@/domains/Reviews/types';
import {
  convertExamTypeEnumToString,
  convertSemesterEnumToString,
  getExamReviewProcessStatuses,
} from '@/domains/Reviews/utils';

import { getExamReviews } from '@/apis';

interface UseExamReviewsParams extends ExamReviewSearchParams {
  page: number;
  enabled?: boolean;
  refreshKey?: number;
}

const transformApiResponseToExamReview = (apiData: ExamReviews): ExamReview => {
  const reviewTitle = apiData.title || apiData.content || '';
  const courseName = apiData.lecture || '';
  const professor = apiData.professor || '';
  const semester =
    apiData.lectureSemester && apiData.lectureYear
      ? convertSemesterEnumToString(
          apiData.lectureSemester,
          apiData.lectureYear
        )
      : '';
  const examType = apiData.examType
    ? convertExamTypeEnumToString(apiData.examType)
    : '';
  const classNumber = String(apiData.classNumber ?? '');
  const uploadTime = formatDateTimeToMinutes(apiData.contentDate);
  const status =
    apiData.isConfirmed === true
      ? STATUS.CONFIRMED
      : apiData.isConfirmed === false
        ? STATUS.UNCONFIRMED
        : apiData.status || STATUS.UNCONFIRMED;
  const userDisplay = apiData.userName || apiData.userDisplay || '';
  const reportCount = apiData.reportCount ?? 0;

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
    isDiscussed: apiData.isDiscussed ?? false,
    isReported: reportCount > 0,
    reportCount,
    processStatuses: getExamReviewProcessStatuses(apiData),
  };
};

export const useExamReviews = (params: UseExamReviewsParams) => {
  const {
    page,
    startDate,
    endDate,
    keywordAuthor,
    keywordPost,
    sort,
    lectureYear,
    semester,
    examType,
    isConfirmed,
    isDiscussed,
    isReported,
    statuses,
    enabled = true,
    refreshKey,
  } = params;

  return useQuery({
    queryKey: [
      'examReviews',
      page,
      startDate,
      endDate,
      keywordAuthor,
      keywordPost,
      sort,
      lectureYear,
      semester,
      examType,
      isConfirmed,
      isDiscussed,
      isReported,
      statuses,
      refreshKey,
    ],
    queryFn: async () => {
      const response = await getExamReviews({
        page: page - 1, // API는 0부터 시작
        startDate,
        endDate,
        keywordAuthor,
        keywordPost,
        sort,
        lectureYear,
        semester,
        examType,
        isConfirmed,
        isDiscussed,
        isReported,
        statuses,
      });

      if (!response.isSuccess || !response.result) {
        throw new Error(
          response.message || '시험 후기 목록을 불러오는데 실패했습니다.'
        );
      }

      return {
        data: response.result.data.map(transformApiResponseToExamReview),
        hasNext: response.result.hasNext,
        totalPage: response.result.totalPage,
      };
    },
    enabled,
    staleTime: 1000 * 60 * 5, // 5분간 fresh 상태 유지
  });
};
