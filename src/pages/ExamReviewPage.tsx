import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import ExamTable from '@/components/exam/ExamTable';
import ExamSearch from '@/components/exam/ExamSearch';
import ExamIconInfo from '@/components/exam/ExamIconInfo';
import ExamPanel from '@/components/exam/ExamPanel';
import PageHeader from '@/components/PageHeader';
import type { ExamReview } from '@/components/exam/ExamTable';
import { getExamReviewDetail, type ExamReviewDetailResult } from '@/apis/exam';
import { toast } from 'sonner';
import { isAxiosError } from 'axios';

// semester enum을 문자열로 변환: "FIRST" + 2024 -> "2024-1"
const convertSemesterEnumToString = (
  semesterEnum: string,
  year: number
): string => {
  switch (semesterEnum) {
    case 'FIRST':
      return `${year}-1`;
    case 'SECOND':
      return `${year}-2`;
    case 'SUMMER':
      return `${year}-여름계절`;
    case 'WINTER':
      return `${year}-겨울계절`;
    default:
      return `${year}-1`;
  }
};

export default function ExamReviewPage() {
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
  }, [searchParamsFromUrl]);

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

  // 페이지 변경 핸들러
  const handlePageChange = (page: number) => {
    const newSearchParams = new URLSearchParams(searchParamsFromUrl);
    newSearchParams.set('page', page.toString());
    setSearchParamsFromUrl(newSearchParams, { replace: true });
    setCurrentPage(page);
  };

  const handleSaveSuccess = () => {
    // Table과 Panel을 새로고침하기 위해 refreshKey 증가
    setRefreshKey((prev) => prev + 1);
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
    <div className='box-border w-full max-w-full'>
      {/* 검색 + 아이콘 정보*/}
      <div className='flex items-end justify-between'>
        <div>
          <PageHeader
            title='시험후기 관리'
            description='시험후기를 편집하거나 삭제하고, 경고 및 강등 처리를 할 수 있어요.'
          />
          <ExamSearch
            onSearchChange={handleSearchChange}
            initialKeyword={searchParamsFromUrl.get('keyword') || ''}
            initialSemester={
              searchParamsFromUrl.get('semester') &&
              searchParamsFromUrl.get('lectureYear')
                ? convertSemesterEnumToString(
                    searchParamsFromUrl.get('semester')!,
                    parseInt(searchParamsFromUrl.get('lectureYear')!, 10)
                  )
                : undefined
            }
            initialExamType={
              searchParamsFromUrl.get('examType') === 'MIDTERM'
                ? '중간'
                : searchParamsFromUrl.get('examType') === 'FINALTERM'
                  ? '기말'
                  : undefined
            }
          />
        </div>

        <ExamIconInfo />
      </div>

      {/* 시험후기 테이블 */}
      <ExamTable
        onRowSelect={setSelectedExamReview}
        refreshKey={refreshKey}
        selectedId={selectedExamReview?.id}
        searchParams={searchParams}
        currentPage={currentPage}
        onPageChange={handlePageChange}
      />

      {/* 시험후기 패널 - 편집, 삭제, 경고, 메모, 강등... */}
      <ExamPanel
        selectedExamReview={selectedExamReview}
        selectedExamReviewDetail={selectedExamReviewDetail}
        isLoadingDetail={isLoadingDetail}
        onSaveSuccess={handleSaveSuccess}
        onDeleteSuccess={handleDeleteSuccess}
      />
    </div>
  );
}
