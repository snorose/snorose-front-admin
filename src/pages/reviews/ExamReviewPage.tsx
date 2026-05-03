import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

import { useQueryClient } from '@tanstack/react-query';
import { isAxiosError } from 'axios';
import { toast } from 'sonner';

import { PageHeader } from '@/shared/components';

import {
  ExamDetailSection,
  ExamSearch,
  ExamTable,
} from '@/domains/Reviews/components';
import type {
  ExamReview,
  ExamReviewDetailResult,
  Semester,
} from '@/domains/Reviews/types';
import { convertSemesterEnumToString } from '@/domains/Reviews/utils';

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
  const [searchParams, setSearchParams] = useState<{
    keyword?: string;
    lectureYear?: number;
    semester?: string;
    examType?: string;
  }>({});

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
    const params: {
      keyword?: string;
      lectureYear?: number;
      semester?: string;
      examType?: string;
    } = {};

    const keyword = searchParamsFromUrl.get('keyword');
    if (keyword) {
      params.keyword = keyword;
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

    // 실제로 검색 파라미터가 변경되었는지 확인
    const hasChanged =
      params.keyword !== searchParams.keyword ||
      params.lectureYear !== searchParams.lectureYear ||
      params.semester !== searchParams.semester ||
      params.examType !== searchParams.examType;

    if (hasChanged) {
      setSearchParams(params);
    }
  }, [searchParamsFromUrl, searchParams]);

  // searchParams가 변경될 때 URL 쿼리 파라미터 업데이트 (검색 시 첫 페이지로 이동)
  const handleSearchChange = (params: {
    keyword?: string;
    lectureYear?: number;
    semester?: string;
    examType?: string;
  }) => {
    // URL 쿼리 파라미터 업데이트 (useEffect에서 자동으로 searchParams 업데이트됨)
    const newSearchParams = new URLSearchParams();
    if (params.keyword) {
      newSearchParams.set('keyword', params.keyword);
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

  const handleSaveSuccess = async (nextStatus?: string) => {
    // 쿼리 캐시를 직접 업데이트하여 스켈레톤 없이 즉시 반영
    if (selectedExamReview && selectedExamReviewDetail) {
      // 저장 후 최신 상세 정보 가져오기 (백그라운드)
      try {
        const response = await getExamReviewDetail(selectedExamReview.id);
        if (response.isSuccess && response.result) {
          const updatedDetail = response.result;

          // 현재 검색 파라미터로 쿼리 키 생성
          const queryKey = [
            'examReviews',
            currentPage,
            searchParams.keyword,
            searchParams.lectureYear,
            searchParams.semester,
            searchParams.examType,
            refreshKey,
          ];

          // 캐시에서 현재 데이터 가져오기
          const cachedData = queryClient.getQueryData<{
            data: ExamReview[];
            hasNext: boolean;
          }>(queryKey);

          if (cachedData) {
            // 선택된 항목의 인덱스 찾기
            const itemIndex = cachedData.data.findIndex(
              (item) => item.id === selectedExamReview.id
            );

            if (itemIndex !== -1) {
              // 선택된 항목의 상태를 업데이트된 상태로 변경
              const updatedData = [...cachedData.data];

              // title 파싱: "2023-1/기말/프로그래밍입문/이종우/001"
              const titleParts = updatedDetail.title.split('/');
              const semester = titleParts[0] || '';
              const examType = titleParts[1] || '';
              const courseName = titleParts[2] || '';
              const professor = titleParts[3] || '';
              const classNumber = titleParts[4] || '';

              const date = new Date(updatedDetail.createdAt);
              const uploadTime = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;

              const updatedItem: ExamReview = {
                id: updatedDetail.postId,
                status:
                  nextStatus ??
                  updatedDetail.status ??
                  (updatedDetail.isConfirmed ? 'CONFIRMED' : 'UNCONFIRMED'),
                reviewTitle: updatedDetail.title,
                courseName,
                professor,
                semester,
                examType,
                classNumber,
                questionDetail: updatedDetail.questionDetail,
                uploadTime,
                userDisplay: updatedDetail.userDisplay,
              };

              updatedData[itemIndex] = updatedItem;

              // 캐시 업데이트 (스켈레톤 없이 즉시 반영)
              queryClient.setQueryData(queryKey, {
                ...cachedData,
                data: updatedData,
              });

              // 선택된 항목도 업데이트
              setSelectedExamReview(updatedItem);
              setSelectedExamReviewDetail((prev) => {
                if (!prev) return updatedDetail;
                if (!nextStatus) return updatedDetail;
                return {
                  ...prev,
                  ...updatedDetail,
                  status: nextStatus,
                } as ExamReviewDetailResult;
              });
            }
          }
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
            initialKeyword={searchParamsFromUrl.get('keyword') || ''}
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
