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
  MANAGER_LIST,
} from '@/constants/exam-table-options';
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

// 상태 드롭다운 컴포넌트
const StatusDropdown = ({
  isOpen,
  onStatusSelect,
  onClose,
}: {
  isOpen: boolean;
  onStatusSelect: (statusCode: string, statusName: string) => void;
  onClose: () => void;
}) => {
  if (!isOpen) return null;

  return (
    <ul
      className='absolute top-0 left-full z-50 ml-1 w-48 bg-blue-100 border border-gray-300 rounded-md shadow-lg'
      onClick={(e) => e.stopPropagation()}
    >
      {STATUS_COLOR.map((statusOption) => (
        <li
          key={statusOption.id}
          className='flex items-center px-3 py-2 hover:bg-blue-200 cursor-pointer'
          onClick={() => {
            onStatusSelect(statusOption.code, statusOption.name);
            onClose();
          }}
        >
          <div className={`w-3 h-3 rounded-full ${statusOption.color} mr-2`} />
          <span className='text-sm'>{statusOption.name}</span>
        </li>
      ))}
    </ul>
  );
};

// 담당자 드롭다운 컴포넌트
const ManagerDropdown = ({
  isOpen,
  onManagerSelect,
  onClose,
}: {
  isOpen: boolean;
  onManagerSelect: (managerName: string) => void;
  onClose: () => void;
}) => {
  if (!isOpen) return null;

  return (
    <ul
      className='absolute top-0 right-full z-50 mr-1 w-24 max-h-[200px] overflow-y-scroll bg-blue-100 border border-gray-300 rounded-md shadow-lg'
      onClick={(e) => e.stopPropagation()}
    >
      {MANAGER_LIST.map((manager, index) => (
        <li
          key={index}
          className='flex items-center px-3 py-2 hover:bg-blue-200 cursor-pointer'
          onClick={() => {
            onManagerSelect(manager);
            onClose();
          }}
        >
          <span className='text-sm'>{manager}</span>
        </li>
      ))}
    </ul>
  );
};

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
  // 체크박스 상태 관리
  const [selectedItems, setSelectedItems] = useState<number[]>([]);

  // 드롭다운 상태 관리
  const [openDropdown, setOpenDropdown] = useState<number | null>(null);
  const [openManagerDropdown, setOpenManagerDropdown] = useState<number | null>(
    null
  );

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

  // 외부 클릭 시 드롭다운 닫기
  useEffect(() => {
    const handleClickOutside = () => {
      setOpenDropdown(null);
      setOpenManagerDropdown(null);
    };

    if (openDropdown !== null || openManagerDropdown !== null) {
      document.addEventListener('click', handleClickOutside);
    }

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [openDropdown, openManagerDropdown]);

  return (
    <div className='bg-white rounded-lg shadow overflow-hidden max-h-[400px] overflow-y-auto pr-4'>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className='w-[60px] text-center'>상태</TableHead>
            <TableHead className='min-w-[200px]'>시험후기명</TableHead>
            <TableHead className='min-w-[120px]'>강의명</TableHead>
            <TableHead className='w-[80px]'>교수</TableHead>
            <TableHead className='w-[100px]'>수강학기</TableHead>
            <TableHead className='w-[80px]'>시험종류</TableHead>
            <TableHead className='min-w-[150px]'>시험 유형 및 문항수</TableHead>
            <TableHead className='w-[130px]'>업로드 시간</TableHead>
            <TableHead className='w-[80px]'>게시자</TableHead>
            <TableHead className='min-w-[160px]'>기타 논의사항</TableHead>
            <TableHead className='w-[60px]'>담당리자</TableHead>
            <TableHead
              className='w-[20px] text-center cursor-pointer'
              onClick={() =>
                handleSelectAll(
                  !(selectedItems.length === data.length && data.length > 0)
                )
              }
            >
              <input
                type='checkbox'
                checked={
                  selectedItems.length === data.length && data.length > 0
                }
                onChange={(e) => handleSelectAll(e.target.checked)}
                className='w-4 h-4 appearance-none bg-white border-2 border-gray-300 rounded checked:bg-blue-500 checked:border-blue-500 focus:ring-2 focus:ring-blue-200 checked:before:content-["✓"] checked:before:text-white checked:before:text-xs checked:before:flex checked:before:items-center checked:before:justify-center checked:before:h-full pointer-events-none'
              />
            </TableHead>
          </TableRow>
        </TableHeader>
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
              <TableCell>
                <span className='inline-flex items-center px-2 py-1 rounded-md text-xs bg-blue-100 text-blue-800'>
                  {review.examType}
                </span>
              </TableCell>
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
                className='text-sm cursor-pointer relative'
                onClick={(e) => {
                  e.stopPropagation();
                  toggleManagerDropdown(review.id);
                }}
              >
                {review.manager}

                {/* 담당자 드롭다운 메뉴 */}
                <ManagerDropdown
                  isOpen={openManagerDropdown === review.id}
                  onManagerSelect={(managerName) =>
                    handleManagerSelect(review.id, managerName)
                  }
                  onClose={() => setOpenManagerDropdown(null)}
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
                <input
                  type='checkbox'
                  checked={selectedItems.includes(review.id)}
                  onChange={(e) =>
                    handleSelectItem(review.id, e.target.checked)
                  }
                  className='w-4 h-4 appearance-none bg-white border-2 border-gray-300 rounded checked:bg-blue-500 checked:border-blue-500 focus:ring-2 focus:ring-blue-200 checked:before:content-["✓"] checked:before:text-white checked:before:text-xs checked:before:flex checked:before:items-center checked:before:justify-center checked:before:h-full pointer-events-none'
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
