import { Badge, Table } from '@/shared/components/ui';
import {
  EXAM_CONFIRM_STATUS,
  EXAM_REVIEW_PROCESS_STATUS,
} from '@/shared/constants';
import { formatDateTimeToMinutes } from '@/shared/utils';

import type { ExamReviewDetailLog } from '@/domains/Reviews/types';

interface ExamReviewLogSectionProps {
  logs?: ExamReviewDetailLog[] | null;
}

const CHANGE_FIELD_LABELS: Record<string, string> = {
  action: '작업',
  status: '상태',
  statusModifiedReason: '변경 이유',
  isConfirmed: '확인여부',
  isDiscussed: '논의여부',
  lectureName: '강의명',
  professor: '교수명',
  lectureType: '강의종류',
  lectureYear: '강의연도',
  semester: '수강학기',
  classNumber: '분반',
  examType: '시험종류',
  isPF: 'P/F',
  isOnline: '온라인 여부',
  questionDetail: '시험 유형 및 문항수',
  deletionStatus: '삭제 상태',
  isSanctioned: '징계 여부',
  visibilityStatus: '공개 상태',
  memo: '메모',
  fileName: '파일명',
};

const ACTION_LABELS: Record<string, string> = {
  CREATED: '생성',
  UPDATED: '수정',
  DELETED: '삭제',
  CONFIRMED: '확인',
  UNCONFIRMED: '미확인',
};

const STATUS_LABELS: Record<string, string> = {
  ...Object.fromEntries(
    EXAM_CONFIRM_STATUS.map(({ code, label }) => [code, label])
  ),
  ...Object.fromEntries(
    EXAM_REVIEW_PROCESS_STATUS.map(({ code, label }) => [code, label])
  ),
};

const formatStatusValue = (value: string): string =>
  value
    .split(/\s*->\s*/)
    .map((status) => STATUS_LABELS[status] ?? status)
    .join(' -> ');

const formatChangeValue = (
  key: string,
  value: string | number | boolean | null
): string => {
  if (value === null) {
    return '-';
  }

  if (typeof value === 'boolean') {
    return value ? 'true' : 'false';
  }

  if (key === 'action') {
    const actionValue = String(value);
    return ACTION_LABELS[actionValue] ?? actionValue;
  }

  if (key === 'status') {
    return formatStatusValue(String(value));
  }

  return String(value);
};

export function ExamReviewLogSection({ logs }: ExamReviewLogSectionProps) {
  const safeLogs = logs ?? [];

  if (safeLogs.length === 0) {
    return (
      <div className='flex min-h-[240px] items-center justify-center rounded-md border border-gray-200 bg-gray-50 text-sm text-gray-500'>
        관리 이력이 없습니다.
      </div>
    );
  }

  return (
    <div className='overflow-hidden rounded-md border border-gray-200'>
      <Table className='table-fixed bg-white'>
        <colgroup>
          <col className='w-[150px]' />
          <col className='w-[120px]' />
          <col className='w-full' />
        </colgroup>
        <Table.Header className='bg-gray-100'>
          <Table.Row>
            <Table.Head>변경일시</Table.Head>
            <Table.Head>관리자</Table.Head>
            <Table.Head className='w-full'>변경 내용</Table.Head>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {safeLogs.map((log, index) => (
            <Table.Row key={`${log.createdAt}-${index}`}>
              <Table.Cell>{formatDateTimeToMinutes(log.createdAt)}</Table.Cell>
              <Table.Cell>{log.adminName || '-'}</Table.Cell>
              <Table.Cell className='whitespace-normal'>
                <div className='flex flex-col gap-1.5'>
                  {Object.entries(log.changes).map(([key, value]) => (
                    <div
                      key={key}
                      className='flex flex-wrap items-center gap-2'
                    >
                      <Badge
                        variant='outline'
                        className='bg-gray-50 text-gray-700'
                      >
                        {CHANGE_FIELD_LABELS[key] ?? key}
                      </Badge>
                      <span className='text-sm break-all text-gray-700'>
                        {formatChangeValue(key, value)}
                      </span>
                    </div>
                  ))}
                </div>
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table>
    </div>
  );
}
