import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import * as Popover from '@radix-ui/react-popover';
import {
  EXAM_REVIEW_LIST_DUMMY,
  STATUS_COLOR,
  SEMESTER_LIST,
  EXAM_TYPE_LIST,
  MANAGER_LIST,
} from '@/constants/exam-table-options';
import { useState, useEffect } from 'react';

export interface ExamReview {
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
  onRowSelect?: (review: ExamReview | null) => void;
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

// 다중 선택 Select 컴포넌트
interface MultiSelectProps {
  value: string[];
  onValueChange: (value: string[]) => void;
  options: string[];
  contentClassName?: string;
  side?: 'top' | 'bottom' | 'left' | 'right';
  align?: 'start' | 'center' | 'end';
  showStatusDot?: boolean;
  children: React.ReactNode;
}

const MultiSelect = ({
  value,
  onValueChange,
  options,
  contentClassName = '',
  side = 'bottom',
  align = 'start',
  showStatusDot = false,
  children,
}: MultiSelectProps) => {
  const [open, setOpen] = useState(false);

  // 드롭다운이 열려있을 때 body 스크롤 막기
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  const handleToggle = (optionValue: string) => {
    const isSelected = value.includes(optionValue);
    if (isSelected) {
      onValueChange(value.filter((v) => v !== optionValue));
    } else {
      onValueChange([...value, optionValue]);
    }
  };

  const allSelected =
    options.length > 0 && options.every((opt) => value.includes(opt));
  const handleSelectAll = () => {
    if (allSelected) {
      onValueChange([]);
    } else {
      onValueChange([...options]);
    }
  };

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>{children}</Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          side={side}
          align={align}
          sideOffset={4}
          className={`text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 max-h-[200px] min-w-[8rem] origin-[var(--radix-select-content-transform-origin)] overflow-x-hidden overflow-y-auto rounded-md border bg-blue-50 shadow-md ${contentClassName}`}
        >
          <div className='p-1'>
            {/* 전체 선택/해제 체크박스 */}
            <div
              className='relative mb-1 flex w-full cursor-default items-center rounded-sm border-b border-gray-200 px-1.5 py-1.5 text-xs outline-none select-none hover:bg-blue-100/50'
              onClick={handleSelectAll}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleSelectAll();
                }
              }}
              role='option'
              tabIndex={0}
            >
              <input
                type='checkbox'
                checked={allSelected}
                onChange={() => {}}
                className={`relative mr-2 h-3 w-3 shrink-0 cursor-pointer appearance-none rounded border-2 ${
                  allSelected
                    ? 'border-blue-500 bg-blue-500 checked:before:absolute checked:before:inset-0 checked:before:flex checked:before:items-center checked:before:justify-center checked:before:text-[8px] checked:before:text-white checked:before:content-["✓"]'
                    : 'border-gray-300 bg-transparent'
                }`}
                tabIndex={-1}
              />
              <span className='flex-1 font-medium'>전체 선택</span>
            </div>
            {options.map((option) => {
              const isSelected = value.includes(option);
              const statusOption = showStatusDot
                ? STATUS_COLOR.find((s) => s.name === option)
                : null;
              return (
                <div
                  key={option}
                  className='relative flex w-full cursor-default items-center rounded-sm px-1.5 py-1.5 text-xs outline-none select-none hover:bg-blue-100/50'
                  onClick={() => handleToggle(option)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleToggle(option);
                    }
                  }}
                  role='option'
                  aria-selected={isSelected}
                  tabIndex={0}
                >
                  <input
                    type='checkbox'
                    checked={isSelected}
                    onChange={() => {}}
                    className={`relative mr-2 h-3 w-3 shrink-0 cursor-pointer appearance-none rounded border-2 ${
                      isSelected
                        ? 'border-blue-500 bg-blue-500 checked:before:absolute checked:before:inset-0 checked:before:flex checked:before:items-center checked:before:justify-center checked:before:text-[8px] checked:before:text-white checked:before:content-["✓"]'
                        : 'border-gray-300 bg-transparent'
                    }`}
                    tabIndex={-1}
                  />
                  <span className='flex-1'>{option}</span>
                  {showStatusDot && statusOption && (
                    <div
                      className={`ml-2 h-2 w-2 shrink-0 rounded-full ${statusOption.color}`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
};

export default function ExamTable({
  data = EXAM_REVIEW_LIST_DUMMY,
  onRowSelect,
}: ExamTableProps) {
  // 페이지네이션 설정
  const ITEMS_PER_PAGE = 10;
  const [currentPage, setCurrentPage] = useState(1);

  // 체크박스 상태 관리
  const [selectedItems, setSelectedItems] = useState<number[]>([]);

  // 상태 및 담당자 선택 상태 관리
  const [selectedStatus, setSelectedStatus] = useState<{
    [key: number]: string;
  }>({});
  const [selectedManager, setSelectedManager] = useState<{
    [key: number]: string;
  }>({});

  // Select 열림 상태 관리
  const [openStatusSelect, setOpenStatusSelect] = useState<{
    [key: number]: boolean;
  }>({});
  const [openManagerSelect, setOpenManagerSelect] = useState<{
    [key: number]: boolean;
  }>({});

  // 클릭된 행 추적
  const [clickedRow, setClickedRow] = useState<number | null>(null);

  // 상태 리스트 생성
  const STATUS_LIST = STATUS_COLOR.map((status) => status.name);

  // 헤더 필터 선택 상태 관리 (다중 선택)
  const [headerFilters, setHeaderFilters] = useState<{
    status: string[];
    semester: string[];
    examType: string[];
    manager: string[];
  }>({
    status: STATUS_LIST,
    semester: SEMESTER_LIST,
    examType: EXAM_TYPE_LIST,
    manager: MANAGER_LIST,
  });

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

  // 상태 선택 함수
  const handleStatusSelect = (
    reviewId: number,
    statusCode: string,
    statusName: string
  ) => {
    setSelectedStatus((prev) => ({
      ...prev,
      [reviewId]: statusCode,
    }));
    console.log(
      `Review ID: ${reviewId}, Selected Status: ${statusCode} (${statusName})`
    );
  };

  // 담당자 선택 함수
  const handleManagerSelect = (reviewId: number, managerName: string) => {
    setSelectedManager((prev) => ({
      ...prev,
      [reviewId]: managerName,
    }));
    console.log(`Review ID: ${reviewId}, Selected Manager: ${managerName}`);
  };

  // 헤더 필터 다중 선택 함수
  const handleHeaderFilterSelect = (
    filterType: 'status' | 'semester' | 'examType' | 'manager',
    value: string[]
  ) => {
    setHeaderFilters((prev) => ({
      ...prev,
      [filterType]: value,
    }));
    console.log(`Filter Type: ${filterType}, Selected Values:`, value);
  };

  // 선택된 필터 상태 디버깅
  useEffect(() => {
    console.log('Header Filters:', headerFilters);
  }, [headerFilters]);

  return (
    <div className='overflow-visible'>
      <Table className='rounded-lg bg-white shadow'>
        {/* Table Header */}
        <TableHeader className='z-10 bg-gray-100 shadow-sm [&_tr]:border-b'>
          <TableRow className='hover:bg-gray-100'>
            <TableHead className='min-w-[40px] text-center'></TableHead>
            <MultiSelect
              value={headerFilters.status}
              onValueChange={(value) =>
                handleHeaderFilterSelect('status', value)
              }
              options={STATUS_LIST}
              contentClassName='w-32 max-h-[300px]'
              side='bottom'
              align='start'
              showStatusDot={true}
            >
              <TableHead className='relative w-[60px] cursor-pointer overflow-hidden text-center hover:bg-gray-200'>
                상태 ▼
              </TableHead>
            </MultiSelect>
            <TableHead className='min-w-[200px]'>시험후기명</TableHead>
            <TableHead className='min-w-[120px]'>강의명</TableHead>
            <TableHead className='w-[60px]'>교수</TableHead>
            <MultiSelect
              value={headerFilters.semester}
              onValueChange={(value) =>
                handleHeaderFilterSelect('semester', value)
              }
              options={SEMESTER_LIST}
              contentClassName='w-32'
              side='bottom'
              align='start'
            >
              <TableHead className='relative w-[60px] cursor-pointer overflow-hidden hover:bg-gray-200'>
                수강학기 ▼
              </TableHead>
            </MultiSelect>
            <MultiSelect
              value={headerFilters.examType}
              onValueChange={(value) =>
                handleHeaderFilterSelect('examType', value)
              }
              options={EXAM_TYPE_LIST}
              contentClassName='w-28'
              side='bottom'
              align='start'
            >
              <TableHead className='relative w-[60px] cursor-pointer overflow-hidden hover:bg-gray-200'>
                시험종류 ▼
              </TableHead>
            </MultiSelect>
            <TableHead className='min-w-[150px]'>시험 유형 및 문항수</TableHead>
            <TableHead className='w-[110px]'>업로드 시간</TableHead>
            <TableHead className='w-[80px]'>게시자</TableHead>
            <TableHead className='min-w-[160px]'>기타 논의사항</TableHead>
            <MultiSelect
              value={headerFilters.manager}
              onValueChange={(value) =>
                handleHeaderFilterSelect('manager', value)
              }
              options={MANAGER_LIST}
              contentClassName='w-32'
              side='left'
              align='start'
            >
              <TableHead className='relative w-[70px] cursor-pointer overflow-hidden hover:bg-gray-200'>
                담당리자 ▼
              </TableHead>
            </MultiSelect>
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
          {currentPageData.map((review, index) => {
            const isRowActive =
              openStatusSelect[review.id] ||
              openManagerSelect[review.id] ||
              clickedRow === review.id;
            return (
              <TableRow
                key={review.id}
                className={`hover:cursor-pointer [&_td]:h-[24px] ${
                  isRowActive ? 'bg-blue-100 hover:bg-blue-100' : ''
                }`}
                onClick={() => {
                  setClickedRow(review.id);
                  onRowSelect?.(review);
                }}
              >
                <TableCell className='text-center text-gray-600'>
                  {startIndex + index + 1}
                </TableCell>
                <TableCell className='relative cursor-pointer p-0 text-center'>
                  <Select
                    value={selectedStatus[review.id] || review.status}
                    onValueChange={(value) => {
                      const statusOption = STATUS_COLOR.find(
                        (s) => s.code === value
                      );
                      if (statusOption) {
                        handleStatusSelect(
                          review.id,
                          statusOption.code,
                          statusOption.name
                        );
                      }
                      setOpenStatusSelect((prev) => ({
                        ...prev,
                        [review.id]: false,
                      }));
                    }}
                    open={openStatusSelect[review.id] || false}
                    onOpenChange={(open) =>
                      setOpenStatusSelect((prev) => ({
                        ...prev,
                        [review.id]: open,
                      }))
                    }
                  >
                    <SelectTrigger className='!absolute !inset-0 !flex !h-full !w-full !items-center !justify-center !border-0 !bg-transparent !p-0 !shadow-none hover:!bg-transparent [&>svg]:!hidden'>
                      <SelectValue className='!flex !items-center !justify-center'>
                        <StatusDot
                          status={selectedStatus[review.id] || review.status}
                        />
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent
                      align='start'
                      className='max-h-[200px] overflow-y-auto bg-blue-50 text-[12px] [&_[data-highlighted]]:bg-blue-100/50 [&_[data-slot=select-scroll-down-button]]:hidden [&_[data-slot=select-scroll-up-button]]:hidden [&_[data-state=checked]]:bg-blue-100'
                    >
                      {STATUS_COLOR.map((statusOption) => (
                        <SelectItem
                          key={statusOption.id}
                          value={statusOption.code}
                          className='text-[12px] font-medium'
                        >
                          <div className='flex items-center gap-2'>
                            <div
                              className={`h-2 w-2 shrink-0 rounded-full ${statusOption.color}`}
                            />
                            <span>{statusOption.name}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
                <TableCell className='relative cursor-pointer overflow-hidden text-center'>
                  <Select
                    value={selectedManager[review.id] || review.manager}
                    onValueChange={(value) => {
                      handleManagerSelect(review.id, value);
                      setOpenManagerSelect((prev) => ({
                        ...prev,
                        [review.id]: false,
                      }));
                    }}
                    open={openManagerSelect[review.id] || false}
                    onOpenChange={(open) =>
                      setOpenManagerSelect((prev) => ({
                        ...prev,
                        [review.id]: open,
                      }))
                    }
                  >
                    <SelectTrigger className='!h-full !w-full !justify-center !border-0 !bg-transparent !p-0 !text-[11px] !font-medium !shadow-none !ring-0 !outline-none focus:!ring-0 focus:!ring-offset-0 focus-visible:!border-0 focus-visible:!ring-0 focus-visible:!ring-offset-0 [&>svg]:!hidden'>
                      <SelectValue className='!truncate !text-center !text-[10px] !text-inherit [&>span]:!truncate [&>span]:!text-center [&>span]:!text-[10px] [&>span]:!font-normal [&>span]:!text-inherit' />
                    </SelectTrigger>
                    <SelectContent
                      align='start'
                      className='max-h-[200px] overflow-y-auto bg-blue-50 text-[10px] [&_[data-highlighted]]:bg-blue-100/50 [&_[data-slot=select-scroll-down-button]]:hidden [&_[data-slot=select-scroll-up-button]]:hidden [&_[data-state=checked]]:bg-blue-100'
                    >
                      {MANAGER_LIST.map((manager) => (
                        <SelectItem
                          key={manager}
                          value={manager}
                          className='text-[10px]'
                        >
                          {manager}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
            );
          })}
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
