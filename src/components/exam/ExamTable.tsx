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
        className={`w-3 h-3 rounded-full ${getStatusColor(status)}`}
        title={status}
      />
    </div>
  );
};

export default function ExamTable({
  data = EXAM_REVIEW_LIST_DUMMY,
}: ExamTableProps) {
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

  // 전체 선택/해제 함수
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedItems(data.map((review) => review.id));
    } else {
      setSelectedItems([]);
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
    <div className='bg-white rounded-lg shadow overflow-hidden max-h-[400px] overflow-y-auto pr-4'>
      <Table>
        {/* Table Header */}
        <TableHeader className='sticky top-0 bg-gray-100 z-10 shadow-sm [&_tr]:border-b'>
          <TableRow>
            <TableHead className='w-[60px] text-center'>상태</TableHead>
            <TableHead className='min-w-[200px]'>시험후기명</TableHead>
            <TableHead className='min-w-[120px]'>강의명</TableHead>
            <TableHead className='w-[60px]'>교수</TableHead>
            <TableHead
              className='w-[60px] cursor-pointer relative hover:bg-gray-200'
              onClick={(e) => {
                e.stopPropagation();
                toggleHeaderFilter('semester');
              }}
            >
              수강학기 ▼{/* 수강학기 필터 드롭다운 */}
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
              />
            </TableHead>
            <TableHead
              className='w-[60px] cursor-pointer relative hover:bg-gray-200'
              onClick={(e) => {
                e.stopPropagation();
                toggleHeaderFilter('examType');
              }}
            >
              시험종류 ▼{/* 시험종류 필터 드롭다운 */}
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
              />
            </TableHead>
            <TableHead className='min-w-[150px]'>시험 유형 및 문항수</TableHead>
            <TableHead className='w-[110px]'>업로드 시간</TableHead>
            <TableHead className='w-[80px]'>게시자</TableHead>
            <TableHead className='min-w-[160px]'>기타 논의사항</TableHead>
            <TableHead
              className='w-[70px] cursor-pointer relative hover:bg-gray-200'
              onClick={(e) => {
                e.stopPropagation();
                toggleHeaderFilter('manager');
              }}
            >
              담당리자 ▼{/* 담당리자 필터 드롭다운 */}
              <TextDropdown
                isOpen={openHeaderFilter === 'manager'}
                onSelect={(value) => handleHeaderFilterSelect('manager', value)}
                onClose={() => setOpenHeaderFilter(null)}
                options={MANAGER_LIST}
                position='bottom'
                width='w-32'
                selectedValues={selectedFilters.manager}
              />
            </TableHead>
            <TableHead
              className='w-[20px] text-center cursor-pointer'
              onClick={() =>
                handleSelectAll(
                  !(selectedItems.length === data.length && data.length > 0)
                )
              }
            >
              <div className='flex items-center justify-center h-full'>
                <input
                  type='checkbox'
                  checked={
                    selectedItems.length === data.length && data.length > 0
                  }
                  onChange={(e) => handleSelectAll(e.target.checked)}
                  className='w-4 h-4 appearance-none bg-white border-2 border-gray-300 rounded checked:bg-blue-500 checked:border-blue-500 focus:ring-2 focus:ring-blue-200 checked:before:content-["✓"] checked:before:text-white checked:before:text-xs checked:before:absolute checked:before:inset-0 checked:before:flex checked:before:items-center checked:before:justify-center relative pointer-events-none'
                />
              </div>
            </TableHead>
          </TableRow>
        </TableHeader>

        {/* Table Body */}
        <TableBody>
          {data.map((review) => (
            <TableRow key={review.id} className='hover:cursor-pointer'>
              <TableCell
                className='text-center relative cursor-pointer'
                onClick={(e) => {
                  e.stopPropagation();
                  toggleDropdown(review.id);
                }}
              >
                <StatusDot status={review.status} />

                {/* 상태 드롭다운 메뉴 */}
                <StatusDropdown
                  isOpen={openDropdown === review.id}
                  onStatusSelect={(statusCode, statusName) =>
                    handleStatusSelect(review.id, statusCode, statusName)
                  }
                  onClose={() => setOpenDropdown(null)}
                />
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
              <TableCell className='text-sm'>{review.semester}</TableCell>
              <TableCell className='text-sm'>{review.examType}</TableCell>
              <TableCell className='text-sm'>
                <div
                  className='max-w-[150px] truncate'
                  title={review.examFormat}
                >
                  {review.examFormat}
                </div>
              </TableCell>
              <TableCell className='text-sm text-gray-600'>
                {review.uploadTime}
              </TableCell>
              <TableCell>{review.author}</TableCell>
              <TableCell className='text-sm'>
                <div
                  className='max-w-[60px] truncate'
                  title={review.discussion}
                >
                  {review.discussion}
                </div>
              </TableCell>
              <TableCell
                className='cursor-pointer relative'
                onClick={(e) => {
                  e.stopPropagation();
                  toggleManagerDropdown(review.id);
                }}
              >
                {review.manager}

                {/* 담당자 드롭다운 메뉴 */}
                <TextDropdown
                  isOpen={openManagerDropdown === review.id}
                  onSelect={(managerName) =>
                    handleManagerSelect(review.id, managerName)
                  }
                  onClose={() => setOpenManagerDropdown(null)}
                  position='left'
                />
              </TableCell>
              <TableCell
                className='max-w-[20px] text-center cursor-pointer'
                onClick={() =>
                  handleSelectItem(
                    review.id,
                    !selectedItems.includes(review.id)
                  )
                }
              >
                <div className='flex items-center justify-center h-full'>
                  <input
                    type='checkbox'
                    checked={selectedItems.includes(review.id)}
                    onChange={(e) =>
                      handleSelectItem(review.id, e.target.checked)
                    }
                    className='w-4 h-4 appearance-none bg-white border-2 border-gray-300 rounded checked:bg-blue-500 checked:border-blue-500 focus:ring-2 focus:ring-blue-200 checked:before:content-["✓"] checked:before:text-white checked:before:text-xs checked:before:absolute checked:before:inset-0 checked:before:flex checked:before:items-center checked:before:justify-center relative pointer-events-none'
                  />
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
