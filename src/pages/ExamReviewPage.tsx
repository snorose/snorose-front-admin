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
} from '@/components/exam/constants/exam-table-options';
import { useState } from 'react';

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

export default function ExamReviewPage() {
  // 체크박스 상태 관리
  const [selectedItems, setSelectedItems] = useState<number[]>([]);

  // 전체 선택/해제 함수
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedItems(EXAM_REVIEW_LIST_DUMMY.map((review) => review.id));
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

  return (
    <div className='w-full max-w-full py-10 px-6 box-border'>
      <div>
        <input
          type='text'
          placeholder='검색'
          className='w-[480px] h-[36px] rounded-2xl border-2 border-blue-500 bg-white px-4 py-2 mb-6'
        />
      </div>
      <div className='bg-white rounded-lg shadow overflow-hidden'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className='w-[60px] text-center'>상태</TableHead>
              <TableHead className='min-w-[200px]'>시험후기명</TableHead>
              <TableHead className='min-w-[120px]'>강의명</TableHead>
              <TableHead className='w-[80px]'>교수</TableHead>
              <TableHead className='w-[100px]'>수강학기</TableHead>
              <TableHead className='w-[80px]'>시험종류</TableHead>
              <TableHead className='min-w-[150px]'>
                시험 유형 및 문항수
              </TableHead>
              <TableHead className='w-[130px]'>업로드 시간</TableHead>
              <TableHead className='w-[80px]'>게시자</TableHead>
              <TableHead className='min-w-[160px]'>기타 논의사항</TableHead>
              <TableHead className='w-[60px]'>담당리자</TableHead>
              <TableHead
                className='w-[20px] text-center cursor-pointer'
                onClick={() =>
                  handleSelectAll(
                    !(
                      selectedItems.length === EXAM_REVIEW_LIST_DUMMY.length &&
                      EXAM_REVIEW_LIST_DUMMY.length > 0
                    )
                  )
                }
              >
                <input
                  type='checkbox'
                  checked={
                    selectedItems.length === EXAM_REVIEW_LIST_DUMMY.length &&
                    EXAM_REVIEW_LIST_DUMMY.length > 0
                  }
                  onChange={(e) => handleSelectAll(e.target.checked)}
                  className='w-4 h-4 appearance-none bg-white border-2 border-gray-300 rounded checked:bg-blue-500 checked:border-blue-500 focus:ring-2 focus:ring-blue-200 checked:before:content-["✓"] checked:before:text-white checked:before:text-xs checked:before:flex checked:before:items-center checked:before:justify-center checked:before:h-full pointer-events-none'
                />
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {EXAM_REVIEW_LIST_DUMMY.map((review) => (
              <TableRow key={review.id}>
                <TableCell className='text-center'>
                  <StatusDot status={review.status} />
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
                <TableCell className='text-sm'>{review.manager}</TableCell>
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
    </div>
  );
}
