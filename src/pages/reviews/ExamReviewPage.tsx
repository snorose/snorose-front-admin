import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

import { useQueryClient } from '@tanstack/react-query';
import { isAxiosError } from 'axios';
import { toast } from 'sonner';

import { PageHeader } from '@/shared/components';
import { formatDateTimeToMinutes } from '@/shared/utils';

import {
  ExamDetailSection,
  ExamSearch,
  ExamTable,
} from '@/domains/Reviews/components';
import { isExamReviewSort } from '@/domains/Reviews/types';
import type {
  ExamReview,
  ExamReviewDetailResult,
  ExamReviewSearchParams,
  Semester,
} from '@/domains/Reviews/types';
import {
  convertExamTypeEnumToString,
  convertSemesterEnumToString,
  getExamReviewProcessStatuses,
} from '@/domains/Reviews/utils';

import { getExamReviewDetail } from '@/apis';

export default function ExamReviewPage() {
  const queryClient = useQueryClient();
  const [searchParamsFromUrl, setSearchParamsFromUrl] = useSearchParams();
  const [selectedExamReview, setSelectedExamReview] =
    useState<ExamReview | null>(null);
  const [selectedExamReviewDetail, setSelectedExamReviewDetail] =
    useState<ExamReviewDetailResult | null>(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const fetchingIdRef = useRef<number | null>(null);
  const [searchParams, setSearchParams] = useState<ExamReviewSearchParams>({});

  // URL에서 페이지 번호 읽기
  const currentPageFromUrl = parseInt(
    searchParamsFromUrl.get('page') || '1',
    10
  );
  const [currentPage, setCurrentPage] = useState<number>(
    currentPageFromUrl || 1
  );

  // URL의 페이지 번호가 변경되면 state 업데이트
  useEffect(() => {
    const pageFromUrl = parseInt(searchParamsFromUrl.get('page') || '1', 10);
    if (pageFromUrl !== currentPage) {
      setCurrentPage(pageFromUrl);
    }
  }, [searchParamsFromUrl, currentPage]);

  // URL 쿼리 파라미터를 searchParams로 변환 (검색 파라미터만, page 제외)
  useEffect(() => {
    const params: ExamReviewSearchParams = {};

    const startDate = searchParamsFromUrl.get('startDate');
    if (startDate) {
      params.startDate = startDate;
    }

    const endDate = searchParamsFromUrl.get('endDate');
    if (endDate) {
      params.endDate = endDate;
    }

    const keywordAuthor = searchParamsFromUrl.get('keywordAuthor');
    if (keywordAuthor) {
      params.keywordAuthor = keywordAuthor;
    }

    const keywordPost =
      searchParamsFromUrl.get('keywordPost') ||
      searchParamsFromUrl.get('keyword');
    if (keywordPost) {
      params.keywordPost = keywordPost;
    }

    const sort = searchParamsFromUrl.get('sort');
    if (sort && isExamReviewSort(sort)) {
      params.sort = sort;
    }

    const lectureYear = searchParamsFromUrl.get('lectureYear');
    if (lectureYear) {
      params.lectureYear = parseInt(lectureYear, 10);
    }

    const semester = searchParamsFromUrl.get('semester');
    if (semester) {
      params.semester = semester;
    }

    const examType = searchParamsFromUrl.get('examType');
    if (examType) {
      params.examType = examType;
    }

    const isConfirmed = searchParamsFromUrl.get('isConfirmed');
    if (isConfirmed === 'true') {
      params.isConfirmed = true;
    }
    if (isConfirmed === 'false') {
      params.isConfirmed = false;
    }

    const isDiscussed = searchParamsFromUrl.get('isDiscussed');
    if (isDiscussed === 'true') {
      params.isDiscussed = true;
    }
    if (isDiscussed === 'false') {
      params.isDiscussed = false;
    }

    const isReported = searchParamsFromUrl.get('isReported');
    if (isReported === 'true') {
      params.isReported = true;
    }
    if (isReported === 'false') {
      params.isReported = false;
    }

    const statuses = searchParamsFromUrl.get('statuses');
    if (statuses) {
      params.statuses = statuses;
    }

    // 실제로 검색 파라미터가 변경되었는지 확인
    const hasChanged =
      params.startDate !== searchParams.startDate ||
      params.endDate !== searchParams.endDate ||
      params.keywordAuthor !== searchParams.keywordAuthor ||
      params.keywordPost !== searchParams.keywordPost ||
      params.sort !== searchParams.sort ||
      params.lectureYear !== searchParams.lectureYear ||
      params.semester !== searchParams.semester ||
      params.examType !== searchParams.examType ||
      params.isConfirmed !== searchParams.isConfirmed ||
      params.isDiscussed !== searchParams.isDiscussed ||
      params.isReported !== searchParams.isReported ||
      params.statuses !== searchParams.statuses;

    if (hasChanged) {
      setSearchParams(params);
    }
  }, [searchParamsFromUrl, searchParams]);

  // searchParams가 변경될 때 URL 쿼리 파라미터 업데이트 (검색 시 첫 페이지로 이동)
  const handleSearchChange = (params: ExamReviewSearchParams) => {
    // URL 쿼리 파라미터 업데이트 (useEffect에서 자동으로 searchParams 업데이트됨)
    const newSearchParams = new URLSearchParams();
    if (params.startDate) {
      newSearchParams.set('startDate', params.startDate);
    }
    if (params.endDate) {
      newSearchParams.set('endDate', params.endDate);
    }
    if (params.keywordAuthor) {
      newSearchParams.set('keywordAuthor', params.keywordAuthor);
    }
    if (params.keywordPost) {
      newSearchParams.set('keywordPost', params.keywordPost);
    }
    if (params.sort) {
      newSearchParams.set('sort', params.sort);
    }
    if (params.lectureYear) {
      newSearchParams.set('lectureYear', params.lectureYear.toString());
    }
    if (params.semester) {
      newSearchParams.set('semester', params.semester);
    }
    if (params.examType) {
      newSearchParams.set('examType', params.examType);
    }
    if (params.isConfirmed !== undefined) {
      newSearchParams.set('isConfirmed', String(params.isConfirmed));
    }
    if (params.isDiscussed !== undefined) {
      newSearchParams.set('isDiscussed', String(params.isDiscussed));
    }
    if (params.isReported !== undefined) {
      newSearchParams.set('isReported', String(params.isReported));
    }
    if (params.statuses) {
      newSearchParams.set('statuses', params.statuses);
    }
    // 검색 시 첫 페이지로 이동
    newSearchParams.set('page', '1');

    setSearchParamsFromUrl(newSearchParams, { replace: true });
    setCurrentPage(1);
  };

  const handlePageChange = (
    pageOrUpdater: number | ((prev: number) => number)
  ) => {
    setCurrentPage((prev) => {
      const next =
        typeof pageOrUpdater === 'function'
          ? pageOrUpdater(prev)
          : pageOrUpdater;
      const newSearchParams = new URLSearchParams(searchParamsFromUrl);
      newSearchParams.set('page', next.toString());
      setSearchParamsFromUrl(newSearchParams, { replace: true });
      return next;
    });
  };

  const handleSaveSuccess = async (
    updatedDetailFromSave?: ExamReviewDetailResult
  ) => {
    // 쿼리 캐시를 직접 업데이트하여 스켈레톤 없이 즉시 반영
    if (selectedExamReview && selectedExamReviewDetail) {
      try {
        let updatedDetail: ExamReviewDetailResult;

        if (updatedDetailFromSave !== undefined) {
          updatedDetail = updatedDetailFromSave;
        } else {
          const response = await getExamReviewDetail(selectedExamReview.id);

          if (!response.isSuccess || !response.result) {
            throw new Error(
              response.message ||
                '시험 후기 상세 정보를 불러오는데 실패했습니다.'
            );
          }

          updatedDetail = response.result;
        }

        // 현재 검색 파라미터로 쿼리 키 생성
        const queryKey = [
          'examReviews',
          currentPage,
          searchParams.startDate,
          searchParams.endDate,
          searchParams.keywordAuthor,
          searchParams.keywordPost,
          searchParams.sort,
          searchParams.lectureYear,
          searchParams.semester,
          searchParams.examType,
          searchParams.isConfirmed,
          searchParams.isDiscussed,
          searchParams.isReported,
          searchParams.statuses,
          refreshKey,
        ];

        const courseName = updatedDetail.lectureName || '';
        const professor = updatedDetail.professor || '';
        const semester = convertSemesterEnumToString(
          updatedDetail.semester,
          updatedDetail.lectureYear
        );
        const examType = convertExamTypeEnumToString(updatedDetail.examType);
        const classNumber = String(updatedDetail.classNumber ?? '');
        const uploadTime = formatDateTimeToMinutes(updatedDetail.createdAt);

        const updatedItem: ExamReview = {
          id: updatedDetail.postId,
          status:
            updatedDetail.status ??
            (updatedDetail.isConfirmed ? 'CONFIRMED' : 'UNCONFIRMED'),
          reviewTitle: updatedDetail.title ?? selectedExamReview.reviewTitle,
          courseName,
          professor,
          semester,
          examType,
          classNumber,
          questionDetail: updatedDetail.questionDetail,
          uploadTime,
          userDisplay: updatedDetail.userDisplay,
          isDiscussed: updatedDetail.isDiscussed,
          isReported: selectedExamReview.isReported,
          reportCount: selectedExamReview.reportCount,
          processStatuses: getExamReviewProcessStatuses(updatedDetail),
        };

        // 캐시에서 현재 데이터 가져오기
        const cachedData = queryClient.getQueryData<{
          data: ExamReview[];
          hasNext: boolean;
        }>(queryKey);

        if (cachedData) {
          queryClient.setQueryData(queryKey, {
            ...cachedData,
            data: cachedData.data.map((item) =>
              item.id === selectedExamReview.id ? updatedItem : item
            ),
          });
        }

        // 선택된 항목도 업데이트
        setSelectedExamReview(updatedItem);
        setSelectedExamReviewDetail(updatedDetail);
      } catch (error) {
        // 에러 발생 시 기존 방식으로 fallback
        console.error('Failed to update cache:', error);
        setRefreshKey((prev) => prev + 1);
      }
    } else {
      // 선택된 항목이 없으면 기존 방식으로 처리
      setRefreshKey((prev) => prev + 1);
    }
  };

  const handleDeleteSuccess = () => {
    // 삭제 후 선택 해제 및 테이블 새로고침
    setSelectedExamReview(null);
    setSelectedExamReviewDetail(null);
    setRefreshKey((prev) => prev + 1);
  };

  // 시험후기 선택 시 상세 정보 조회
  useEffect(() => {
    const fetchExamReviewDetail = async () => {
      if (!selectedExamReview) {
        setSelectedExamReviewDetail(null);
        fetchingIdRef.current = null;
        return;
      }

      const examId = selectedExamReview.id;

      // 이미 같은 ID에 대한 요청이 진행 중이면 중복 호출 방지
      if (fetchingIdRef.current === examId) {
        return;
      }

      fetchingIdRef.current = examId;
      setIsLoadingDetail(true);

      try {
        const response = await getExamReviewDetail(examId);

        // 요청이 완료되었을 때 현재 선택된 ID와 일치하는지 확인
        if (fetchingIdRef.current === examId) {
          if (response.isSuccess && response.result) {
            setSelectedExamReviewDetail(response.result);
          } else {
            toast.error(
              response.message ||
                '시험 후기 상세 정보를 불러오는데 실패했습니다.'
            );
            setSelectedExamReviewDetail(null);
          }
        }
      } catch (error: unknown) {
        // 요청이 완료되었을 때 현재 선택된 ID와 일치하는지 확인
        if (fetchingIdRef.current === examId) {
          const errorMessage =
            (isAxiosError(error) && error.response?.data?.message) ||
            '시험 후기 상세 정보를 불러오는데 실패했습니다.';
          toast.error(errorMessage);
          setSelectedExamReviewDetail(null);
        }
      } finally {
        // 요청이 완료되었을 때 현재 선택된 ID와 일치하는지 확인
        if (fetchingIdRef.current === examId) {
          setIsLoadingDetail(false);
          fetchingIdRef.current = null;
        }
      }
    };

    fetchExamReviewDetail();
  }, [selectedExamReview]);

  return (
    <div className='flex w-full flex-col gap-6'>
      <PageHeader
        title='시험후기 관리'
        description='시험후기를 편집하거나 삭제하고, 경고 및 강등 처리를 할 수 있어요.'
      />

      <div className='flex flex-col gap-2'>
        <div className='flex'>
          <ExamSearch
            onSearchChange={handleSearchChange}
            initialEndDate={searchParamsFromUrl.get('endDate') || ''}
            initialKeywordAuthor={
              searchParamsFromUrl.get('keywordAuthor') || ''
            }
            initialKeywordPost={
              searchParamsFromUrl.get('keywordPost') ||
              searchParamsFromUrl.get('keyword') ||
              ''
            }
            initialSort={searchParamsFromUrl.get('sort') || undefined}
            initialSemester={
              searchParamsFromUrl.get('semester') &&
              searchParamsFromUrl.get('lectureYear')
                ? convertSemesterEnumToString(
                    searchParamsFromUrl.get('semester')! as Semester,
                    parseInt(searchParamsFromUrl.get('lectureYear')!, 10)
                  )
                : undefined
            }
            initialExamType={
              searchParamsFromUrl.get('examType') === 'MIDTERM'
                ? '중간고사'
                : searchParamsFromUrl.get('examType') === 'FINALTERM'
                  ? '기말고사'
                  : undefined
            }
            initialIsConfirmed={
              searchParamsFromUrl.get('isConfirmed') === 'true'
                ? true
                : searchParamsFromUrl.get('isConfirmed') === 'false'
                  ? false
                  : undefined
            }
            initialIsDiscussed={
              searchParamsFromUrl.get('isDiscussed') === 'true'
                ? true
                : searchParamsFromUrl.get('isDiscussed') === 'false'
                  ? false
                  : undefined
            }
            initialIsReported={
              searchParamsFromUrl.get('isReported') === 'true'
                ? true
                : searchParamsFromUrl.get('isReported') === 'false'
                  ? false
                  : undefined
            }
            initialStatuses={searchParamsFromUrl.get('statuses') || ''}
            initialStartDate={searchParamsFromUrl.get('startDate') || ''}
          />
        </div>

        <ExamTable
          onRowSelect={setSelectedExamReview}
          refreshKey={refreshKey}
          selectedId={selectedExamReview?.id}
          searchParams={searchParams}
          currentPage={currentPage}
          onPageChange={handlePageChange}
        />
      </div>

      <ExamDetailSection
        selectedExamReview={selectedExamReview}
        selectedExamReviewDetail={selectedExamReviewDetail}
        isLoadingDetail={isLoadingDetail}
        onSaveSuccess={handleSaveSuccess}
        onDeleteSuccess={handleDeleteSuccess}
      />
    </div>
  );
}
