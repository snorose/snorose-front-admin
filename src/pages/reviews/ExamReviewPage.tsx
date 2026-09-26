import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

import { useQueryClient } from '@tanstack/react-query';

import { PageHeader } from '@/shared/components';
import { Button } from '@/shared/components/ui';
import {
  formatDateTimeToMinutes,
  getErrorMessage,
  parseOneBasedPage,
} from '@/shared/utils';

import {
  ExamDetailSection,
  ExamSearch,
  ExamTable,
} from '@/domains/Reviews/components';
import {
  examReviewDetailQueryKey,
  useExamReviewDetail,
} from '@/domains/Reviews/hooks';
import { isExamReviewSort } from '@/domains/Reviews/types';
import type {
  ExamReview,
  ExamReviewDetailResult,
  ExamReviewSearchParams,
  RenameExamReviewFileResult,
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
  const {
    data: selectedExamReviewDetail = null,
    isLoading: isLoadingDetail,
    isFetching: isFetchingDetail,
    error: detailError,
    refetch: refetchDetail,
  } = useExamReviewDetail(selectedExamReview?.id ?? null);
  const [refreshKey, setRefreshKey] = useState(0);
  const selectedReviewIdRef = useRef<number | null>(null);
  selectedReviewIdRef.current = selectedExamReview?.id ?? null;
  const [searchParams, setSearchParams] = useState<ExamReviewSearchParams>({});

  // URL에서 페이지 번호 읽기
  const currentPageFromUrl = parseOneBasedPage(searchParamsFromUrl.get('page'));
  const [currentPage, setCurrentPage] = useState<number>(currentPageFromUrl);

  // URL의 페이지 번호가 변경되면 state 업데이트
  useEffect(() => {
    const rawPage = searchParamsFromUrl.get('page');
    const pageFromUrl = parseOneBasedPage(rawPage);

    if (rawPage !== null && rawPage !== String(pageFromUrl)) {
      const normalizedSearchParams = new URLSearchParams(searchParamsFromUrl);
      normalizedSearchParams.set('page', String(pageFromUrl));
      setSearchParamsFromUrl(normalizedSearchParams, { replace: true });
      return;
    }

    if (pageFromUrl !== currentPage) {
      setCurrentPage(pageFromUrl);
    }
  }, [searchParamsFromUrl, currentPage, setSearchParamsFromUrl]);

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

  const handlePageChange = (page: number) => {
    const newSearchParams = new URLSearchParams(searchParamsFromUrl);
    newSearchParams.set('page', String(page));
    setSearchParamsFromUrl(newSearchParams, { replace: true });
    setCurrentPage(page);
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
          updatedDetail = await queryClient.fetchQuery({
            queryKey: examReviewDetailQueryKey(selectedExamReview.id),
            queryFn: () => getExamReviewDetail(selectedExamReview.id),
            staleTime: 0,
          });
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
        queryClient.setQueryData(
          examReviewDetailQueryKey(selectedExamReview.id),
          updatedDetail
        );
        if (selectedReviewIdRef.current === selectedExamReview.id) {
          setSelectedExamReview(updatedItem);
        }
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
    if (selectedExamReview) {
      void queryClient.invalidateQueries({
        queryKey: examReviewDetailQueryKey(selectedExamReview.id),
      });
    }
    // 삭제 후 선택 해제 및 테이블 새로고침
    setSelectedExamReview(null);
    setRefreshKey((prev) => prev + 1);
  };

  const handleRestoreSuccess = (postId: number) => {
    void queryClient.invalidateQueries({
      queryKey: examReviewDetailQueryKey(postId),
    });
    if (selectedReviewIdRef.current === postId) {
      setSelectedExamReview(null);
    }
    setRefreshKey((prev) => prev + 1);
  };

  const handleFileNameChangeSuccess = (
    postId: number,
    result: RenameExamReviewFileResult
  ) => {
    queryClient.setQueryData<ExamReviewDetailResult>(
      examReviewDetailQueryKey(postId),
      (current) =>
        current
          ? { ...current, fileName: result.fileName, logs: result.logs }
          : current
    );
    void queryClient.invalidateQueries({
      queryKey: examReviewDetailQueryKey(postId),
    });
  };

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

      {selectedExamReview && detailError && (
        <div
          role='alert'
          className='flex flex-wrap items-center justify-between gap-2 rounded-md border p-3 text-sm'
        >
          <span>
            {getErrorMessage(
              detailError,
              '시험 후기 상세 정보를 불러오지 못했습니다.'
            )}
          </span>
          <Button
            type='button'
            variant='outline'
            size='sm'
            disabled={isFetchingDetail}
            onClick={() => {
              void refetchDetail();
            }}
          >
            다시 시도
          </Button>
        </div>
      )}

      <ExamDetailSection
        selectedExamReview={selectedExamReview}
        selectedExamReviewDetail={selectedExamReviewDetail}
        isLoadingDetail={isLoadingDetail}
        onSaveSuccess={handleSaveSuccess}
        onFileNameChangeSuccess={handleFileNameChangeSuccess}
        onDeleteSuccess={handleDeleteSuccess}
        onRestoreSuccess={handleRestoreSuccess}
      />
    </div>
  );
}
