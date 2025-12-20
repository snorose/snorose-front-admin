import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  EXAM_REVIEW_LIST_DUMMY,
  STATUS_COLOR,
  SEMESTER_LIST,
  EXAM_TYPE_LIST,
  MANAGER_LIST,
} from '@/constants/exam-table-options';
import { StatusDropdown, TextDropdown } from './ExamDropdown';
import { useState, useEffect } from 'react';

interface ExamReview {
  id: number;
  status: string;
  reviewTitle: string;
  courseName: string;
  professor: string;
  semester: string;
  examType: string;
  examFormat: string;
  uploadTime: string;
  author: string;
  discussion: string;
  manager: string;
}

interface ExamTableProps {
  data?: ExamReview[];
}

// 상태 점 컴포넌트
const StatusDot = ({ status }: { status: string }) => {
  const getStatusColor = (status: string) => {
    const statusColor = STATUS_COLOR.find((color) => color.code === status);
    return statusColor?.color || 'bg-white';
  };

  return (
    <div className='flex items-center justify-center'>
      <div
        className={`h-2 w-2 rounded-full ${getStatusColor(status)}`}
        title={status}
      />
    </div>
  );
};

export default function ExamTable({
  data = EXAM_REVIEW_LIST_DUMMY,
}: ExamTableProps) {
  // 페이지네이션 설정
  const ITEMS_PER_PAGE = 15;
  const [currentPage, setCurrentPage] = useState(1);

  // 필터 옵션 (선택된 필터 값들)
  const [selectedFilters, setSelectedFilters] = useState<{
    semester: string[];
    examType: string[];
    manager: string[];
  }>({
    semester: [],
    examType: [],
    manager: [],
  });
  // 체크박스 상태 관리
  const [selectedItems, setSelectedItems] = useState<number[]>([]);

  // 드롭다운 상태 관리
  const [openDropdown, setOpenDropdown] = useState<number | null>(null);
  const [openManagerDropdown, setOpenManagerDropdown] = useState<number | null>(
    null
  );

  // 헤더 필터 드롭다운 상태 관리
  const [openHeaderFilter, setOpenHeaderFilter] = useState<string | null>(null);

  // 페이지네이션 계산
  const totalPages = Math.ceil(data.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentPageData = data.slice(startIndex, endIndex);

  // 페이지 변경 시 체크박스 선택 해제
  useEffect(() => {
    setSelectedItems([]);
  }, [currentPage]);

  // 전체 선택/해제 함수 (현재 페이지의 데이터만)
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedItems((prev) => [
        ...prev,
        ...currentPageData
          .map((review) => review.id)
          .filter((id) => !prev.includes(id)),
      ]);
    } else {
      setSelectedItems((prev) =>
        prev.filter((id) => !currentPageData.some((review) => review.id === id))
      );
    }
  };

  // 개별 아이템 선택/해제 함수
  const handleSelectItem = (id: number, checked: boolean) => {
    if (checked) {
      setSelectedItems((prev) => [...prev, id]);
    } else {
      setSelectedItems((prev) => prev.filter((itemId) => itemId !== id));
    }
  };

  // 상태 드롭다운 토글 함수
  const toggleDropdown = (id: number) => {
    setOpenDropdown(openDropdown === id ? null : id);
    setOpenManagerDropdown(null); // 다른 드롭다운 닫기
  };

  // 담당자 드롭다운 토글 함수
  const toggleManagerDropdown = (id: number) => {
    setOpenManagerDropdown(openManagerDropdown === id ? null : id);
    setOpenDropdown(null); // 다른 드롭다운 닫기
  };

  // 상태 선택 함수
  const handleStatusSelect = (
    reviewId: number,
    statusCode: string,
    statusName: string
  ) => {
    console.log(
      `Review ID: ${reviewId}, Selected Status: ${statusCode} (${statusName})`
    );
  };

  // 담당자 선택 함수
  const handleManagerSelect = (reviewId: number, managerName: string) => {
    console.log(`Review ID: ${reviewId}, Selected Manager: ${managerName}`);
  };

  // 헤더 필터 토글 함수
  const toggleHeaderFilter = (filterType: string) => {
    setOpenHeaderFilter(openHeaderFilter === filterType ? null : filterType);
    // 다른 드롭다운들 닫기
    setOpenDropdown(null);
    setOpenManagerDropdown(null);
  };

  // 헤더 필터 선택 함수
  const handleHeaderFilterSelect = (filterType: string, value: string) => {
    setSelectedFilters((prev) => {
      const currentFilters = prev[filterType as keyof typeof prev];
      const isSelected = currentFilters.includes(value);

      // 토글 방식: 이미 선택된 값이면 제거, 아니면 추가
      const updatedFilters = isSelected
        ? currentFilters.filter((filter) => filter !== value)
        : [...currentFilters, value];

      return {
        ...prev,
        [filterType]: updatedFilters,
      };
    });

    console.log(`Filter Type: ${filterType}, Selected Value: ${value}`);
    // 헤더 필터는 드롭다운을 닫지 않음 (다중 선택 가능)
  };

  // 외부 클릭 시 드롭다운 닫기
  useEffect(() => {
    const handleClickOutside = () => {
      setOpenDropdown(null);
      setOpenManagerDropdown(null);
      setOpenHeaderFilter(null);
    };

    if (
      openDropdown !== null ||
      openManagerDropdown !== null ||
      openHeaderFilter !== null
    ) {
      document.addEventListener('click', handleClickOutside);
    }

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [openDropdown, openManagerDropdown, openHeaderFilter]);

  // 선택된 필터 상태 디버깅
  useEffect(() => {
    console.log('Selected Filters:', selectedFilters);
  }, [selectedFilters]);

  return (
    <div className='overflow-visible'>
      <Table className='rounded-lg bg-white shadow'>
        {/* Table Header */}
        <TableHeader className='z-10 bg-gray-100 shadow-sm [&_tr]:border-b'>
          <TableRow>
            <TableHead className='min-w-[40px] text-center'></TableHead>
            <TableHead className='w-[60px] text-center'>상태</TableHead>
            <TableHead className='min-w-[200px]'>시험후기명</TableHead>
            <TableHead className='min-w-[120px]'>강의명</TableHead>
            <TableHead className='w-[60px]'>교수</TableHead>
            <TableHead className='relative w-[60px] hover:bg-gray-200'>
              <TextDropdown
                isOpen={openHeaderFilter === 'semester'}
                onSelect={(value) =>
                  handleHeaderFilterSelect('semester', value)
                }
                onClose={() => setOpenHeaderFilter(null)}
                options={SEMESTER_LIST}
                position='bottom'
                width='w-32'
                selectedValues={selectedFilters.semester}
              >
                <div
                  className='cursor-pointer'
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleHeaderFilter('semester');
                  }}
                >
                  수강학기 ▼
                </div>
              </TextDropdown>
            </TableHead>
            <TableHead className='relative w-[60px] hover:bg-gray-200'>
              <TextDropdown
                isOpen={openHeaderFilter === 'examType'}
                onSelect={(value) =>
                  handleHeaderFilterSelect('examType', value)
                }
                onClose={() => setOpenHeaderFilter(null)}
                options={EXAM_TYPE_LIST}
                position='bottom'
                width='w-28'
                selectedValues={selectedFilters.examType}
              >
                <div
                  className='cursor-pointer'
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleHeaderFilter('examType');
                  }}
                >
                  시험종류 ▼
                </div>
              </TextDropdown>
            </TableHead>
            <TableHead className='min-w-[150px]'>시험 유형 및 문항수</TableHead>
            <TableHead className='w-[110px]'>업로드 시간</TableHead>
            <TableHead className='w-[80px]'>게시자</TableHead>
            <TableHead className='min-w-[160px]'>기타 논의사항</TableHead>
            <TableHead className='relative w-[70px] hover:bg-gray-200'>
              <TextDropdown
                isOpen={openHeaderFilter === 'manager'}
                onSelect={(value) => handleHeaderFilterSelect('manager', value)}
                onClose={() => setOpenHeaderFilter(null)}
                options={MANAGER_LIST}
                position='left'
                width='w-32'
                selectedValues={selectedFilters.manager}
              >
                <div
                  className='cursor-pointer'
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleHeaderFilter('manager');
                  }}
                >
                  담당리자 ▼
                </div>
              </TextDropdown>
            </TableHead>
            <TableHead
              className='w-[20px] cursor-pointer text-center'
              onClick={() => {
                const allCurrentPageSelected = currentPageData.every((review) =>
                  selectedItems.includes(review.id)
                );
                handleSelectAll(!allCurrentPageSelected);
              }}
            >
              <div className='flex h-full items-center justify-center'>
                <input
                  type='checkbox'
                  checked={
                    currentPageData.length > 0 &&
                    currentPageData.every((review) =>
                      selectedItems.includes(review.id)
                    )
                  }
                  onChange={(e) => handleSelectAll(e.target.checked)}
                  className='pointer-events-none relative h-4 w-4 appearance-none rounded border-2 border-gray-300 bg-white checked:border-blue-500 checked:bg-blue-500 checked:before:absolute checked:before:inset-0 checked:before:flex checked:before:items-center checked:before:justify-center checked:before:text-xs checked:before:text-white checked:before:content-["✓"] focus:ring-2 focus:ring-blue-200'
                />
              </div>
            </TableHead>
          </TableRow>
        </TableHeader>

        {/* Table Body */}
        <TableBody>
          {currentPageData.map((review, index) => (
            <TableRow
              key={review.id}
              className={`hover:cursor-pointer [&_td]:h-[24px] ${
                openDropdown === review.id || openManagerDropdown === review.id
                  ? 'bg-blue-100 hover:bg-blue-100'
                  : ''
              }`}
            >
              <TableCell className='text-center text-gray-600'>
                {startIndex + index + 1}
              </TableCell>
              <TableCell
                className='relative cursor-pointer text-center'
                onClick={(e) => {
                  e.stopPropagation();
                  toggleDropdown(review.id);
                }}
              >
                <StatusDropdown
                  isOpen={openDropdown === review.id}
                  onStatusSelect={(statusCode, statusName) =>
                    handleStatusSelect(review.id, statusCode, statusName)
                  }
                  onClose={() => setOpenDropdown(null)}
                >
                  <div className='flex h-full w-full items-center justify-center border-none outline-none'>
                    <StatusDot status={review.status} />
                  </div>
                </StatusDropdown>
              </TableCell>
              <TableCell>
                <div
                  className='max-w-[200px] truncate'
                  title={review.reviewTitle}
                >
                  {review.reviewTitle}
                </div>
              </TableCell>
              <TableCell>
                <div
                  className='max-w-[120px] truncate'
                  title={review.courseName}
                >
                  {review.courseName}
                </div>
              </TableCell>
              <TableCell>{review.professor}</TableCell>
              <TableCell>{review.semester}</TableCell>
              <TableCell>{review.examType}</TableCell>
              <TableCell>
                <div
                  className='max-w-[150px] truncate'
                  title={review.examFormat}
                >
                  {review.examFormat}
                </div>
              </TableCell>
              <TableCell className='text-gray-600'>
                {review.uploadTime}
              </TableCell>
              <TableCell>{review.author}</TableCell>
              <TableCell>
                <div
                  className='max-w-[60px] truncate'
                  title={review.discussion}
                >
                  {review.discussion}
                </div>
              </TableCell>
              <TableCell
                className='relative cursor-pointer'
                onClick={(e) => {
                  e.stopPropagation();
                  toggleManagerDropdown(review.id);
                }}
              >
                <TextDropdown
                  isOpen={openManagerDropdown === review.id}
                  onSelect={(managerName) =>
                    handleManagerSelect(review.id, managerName)
                  }
                  onClose={() => setOpenManagerDropdown(null)}
                  position='left'
                >
                  <div className='flex h-full w-full items-center justify-center border-none outline-none'>
                    {review.manager}
                  </div>
                </TextDropdown>
              </TableCell>
              <TableCell
                className='max-w-[20px] cursor-pointer text-center'
                onClick={() =>
                  handleSelectItem(
                    review.id,
                    !selectedItems.includes(review.id)
                  )
                }
              >
                <div className='flex h-full items-center justify-center'>
                  <input
                    type='checkbox'
                    checked={selectedItems.includes(review.id)}
                    onChange={(e) =>
                      handleSelectItem(review.id, e.target.checked)
                    }
                    className='pointer-events-none relative h-4 w-4 appearance-none rounded border-2 border-gray-300 bg-white checked:border-blue-500 checked:bg-blue-500 checked:before:absolute checked:before:inset-0 checked:before:flex checked:before:items-center checked:before:justify-center checked:before:text-xs checked:before:text-white checked:before:content-["✓"] focus:ring-2 focus:ring-blue-200'
                  />
                </div>
              </TableCell>
            </TableRow>
          ))}
          {/* 빈 행 추가하여 항상 15개 행 표시 */}
          {Array.from({ length: ITEMS_PER_PAGE - currentPageData.length }).map(
            (_, index) => (
              <TableRow key={`empty-${index}`} className='[&_td]:h-[24px]'>
                <TableCell className='text-center text-gray-600'>
                  &nbsp;
                </TableCell>
                <TableCell>&nbsp;</TableCell>
                <TableCell>&nbsp;</TableCell>
                <TableCell>&nbsp;</TableCell>
                <TableCell>&nbsp;</TableCell>
                <TableCell>&nbsp;</TableCell>
                <TableCell>&nbsp;</TableCell>
                <TableCell>&nbsp;</TableCell>
                <TableCell>&nbsp;</TableCell>
                <TableCell>&nbsp;</TableCell>
                <TableCell>&nbsp;</TableCell>
                <TableCell>&nbsp;</TableCell>
                <TableCell>&nbsp;</TableCell>
              </TableRow>
            )
          )}
        </TableBody>
      </Table>

      {/* 페이지네이션 */}
      {totalPages > 1 && (
        <div className='relative flex flex-col items-center gap-3 px-4 py-4'>
          <div className='flex items-center gap-2'>
            <button
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className='rounded bg-gray-100 px-3 py-1 text-xs text-gray-800 hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50'
            >
              이전
            </button>
            <div className='flex items-center gap-1'>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`rounded px-3 py-1 text-xs ${
                      currentPage === page
                        ? 'bg-gray-300 text-gray-900'
                        : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                    }`}
                  >
                    {page}
                  </button>
                )
              )}
            </div>
            <button
              onClick={() =>
                setCurrentPage((prev) => Math.min(totalPages, prev + 1))
              }
              disabled={currentPage === totalPages}
              className='rounded bg-gray-100 px-3 py-1 text-xs text-gray-800 hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50'
            >
              다음
            </button>
          </div>
          <div className='absolute right-0 text-xs text-gray-600'>
            {startIndex + 1}-{Math.min(endIndex, data.length)} / {data.length}개
          </div>
        </div>
      )}
    </div>
  );
}
