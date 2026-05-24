import { ExternalLink, Paperclip, X } from 'lucide-react';

import type { InquiryAttachment, InquiryStatus } from '@/shared/types';
import { formatDateTimeToMinutes } from '@/shared/utils';

import {
  INQUIRY_GROUP_LABELS,
  INQUIRY_REPORT_CAUSE_LABELS,
  INQUIRY_SUB_GROUP_LABELS,
} from '@/domains/InquiryReport/constants/inquiryReportLabels';

import { INQUIRY_DETAIL_MOCK_DATA } from '@/__mocks__';

import InquiryStatusSelect from './InquiryStatusSelect';

interface InquiryReportDetailPanelProps {
  postId: number;
  onClose: () => void;
  status: InquiryStatus;
  onStatusChange: (
    inquiryId: number,
    status: InquiryStatus
  ) => void | Promise<void>;
}

export default function InquiryReportDetailPanel({
  postId,
  onClose,
  status,
  onStatusChange,
}: InquiryReportDetailPanelProps) {
  const detail = INQUIRY_DETAIL_MOCK_DATA[postId];

  if (!detail) {
    return (
      <div className='flex h-40 w-full items-center justify-center overflow-y-auto rounded-md border border-gray-200 bg-white shadow-sm'>
        <p className='text-sm text-gray-400'>해당 항목을 찾을 수 없습니다.</p>
      </div>
    );
  }

  const currentStatus = status ?? detail.status;

  return (
    <div className='max-h-[calc(100vh-180px)] overflow-y-auto rounded-md border border-gray-200 bg-white shadow-sm'>
      {/* 헤더 */}
      <div className='flex items-start justify-between gap-2 border-b border-gray-100 px-4 py-3'>
        <p
          className='flex-1 truncate text-sm font-semibold text-gray-900'
          title={detail.title}
        >
          {detail.title}
        </p>
        <div className='flex shrink-0 items-center gap-2'>
          <InquiryStatusSelect
            inquiryId={postId}
            status={currentStatus}
            title={detail.title}
            onStatusChange={onStatusChange}
          />
          {detail.link && (
            <a
              href={detail.link}
              target='_blank'
              rel='noopener noreferrer'
              aria-label='해당 글 바로가기'
              title='해당 글 바로가기'
              style={{ color: '#475569' }}
              className='flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 bg-white shadow-xs transition hover:border-slate-300 hover:bg-slate-50'
            >
              <ExternalLink className='h-4 w-4 shrink-0' />
            </a>
          )}
          <button
            onClick={onClose}
            className='flex h-6 w-6 items-center justify-center rounded text-gray-400 hover:bg-gray-100 hover:text-gray-600'
            aria-label='닫기'
          >
            <X className='h-4 w-4' />
          </button>
        </div>
      </div>

      {/* 메타 정보 */}
      <div className='grid grid-cols-1 gap-x-8 gap-y-2 border-b border-gray-100 px-4 py-3 text-[13px] sm:grid-cols-2'>
        <div className='flex min-w-0 flex-col gap-2'>
          <div className='grid min-w-0 grid-cols-[4rem_minmax(0,1fr)] gap-3'>
            <span className='shrink-0 text-gray-500'>분류</span>
            <span className='min-w-0 break-words text-gray-800'>
              {INQUIRY_GROUP_LABELS[detail.group] ?? detail.group}
            </span>
          </div>

          <div className='grid min-w-0 grid-cols-[4rem_minmax(0,1fr)] gap-3'>
            <span className='shrink-0 text-gray-500'>중분류</span>
            <span className='min-w-0 break-words text-gray-800'>
              {INQUIRY_SUB_GROUP_LABELS[detail.subGroup] ?? detail.subGroup}
            </span>
          </div>

          {detail.reportCause && (
            <div className='grid min-w-0 grid-cols-[4rem_minmax(0,1fr)] gap-3'>
              <span className='shrink-0 text-gray-500'>신고 사유</span>
              <span className='min-w-0 break-words text-gray-800'>
                {INQUIRY_REPORT_CAUSE_LABELS[detail.reportCause] ??
                  detail.reportCause}
              </span>
            </div>
          )}

          {detail.target && (
            <div className='grid min-w-0 grid-cols-[4rem_minmax(0,1fr)] gap-3'>
              <span className='shrink-0 text-gray-500'>신고 대상</span>
              <span className='min-w-0 break-words text-gray-800'>
                {detail.target}
              </span>
            </div>
          )}
        </div>

        <div className='flex min-w-0 flex-col gap-2'>
          <div className='grid min-w-0 grid-cols-[4rem_minmax(0,1fr)] gap-3'>
            <span className='shrink-0 text-gray-500'>작성자</span>
            <span className='min-w-0 break-words text-gray-800'>
              {detail.isWriterWithdrawn ? '탈퇴한 사용자' : detail.userDisplay}
            </span>
          </div>

          <div className='grid min-w-0 grid-cols-[4rem_minmax(0,1fr)] gap-3'>
            <span className='shrink-0 text-gray-500'>작성일</span>
            <span className='min-w-0 break-words text-gray-800'>
              {formatDateTimeToMinutes(detail.createdAt)}
            </span>
          </div>

          {detail.updatedAt && (
            <div className='grid min-w-0 grid-cols-[4rem_minmax(0,1fr)] gap-3'>
              <span className='shrink-0 text-gray-500'>수정일</span>
              <span className='min-w-0 break-words text-gray-800'>
                {formatDateTimeToMinutes(detail.updatedAt)}
              </span>
            </div>
          )}

          <div className='grid min-w-0 grid-cols-[4rem_minmax(0,1fr)] gap-3'>
            <span className='shrink-0 text-gray-500'>답변</span>
            <span className='min-w-0 break-words text-gray-800'>
              {detail.commentCount}건
            </span>
          </div>

          {detail.isEdited && (
            <div className='grid min-w-0 grid-cols-[4rem_minmax(0,1fr)] gap-3'>
              <span className='shrink-0 text-gray-500'>수정 여부</span>
              <span className='min-w-0 break-words text-gray-800'>수정됨</span>
            </div>
          )}
        </div>
      </div>

      {/* 내용 */}
      <div className='flex flex-col gap-2 border-b border-gray-100 px-4 py-3'>
        <p className='text-[13px] font-medium text-gray-700'>내용</p>
        <div className='rounded border border-gray-200 bg-gray-50 px-3 py-2.5 text-[13px] leading-relaxed whitespace-pre-wrap text-gray-800'>
          {detail.content}
        </div>
      </div>

      {/* 첨부파일 */}
      {detail.attachments.length > 0 && (
        <div className='flex flex-col gap-2 px-4 py-3'>
          <p className='text-[13px] font-medium text-gray-700'>첨부파일</p>
          <ul className='flex flex-col gap-2'>
            {detail.attachments.map((attachment) => (
              <AttachmentItem key={attachment.id} attachment={attachment} />
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function AttachmentItem({ attachment }: { attachment: InquiryAttachment }) {
  if (attachment.type === 'PHOTO') {
    return (
      <li className='flex flex-col gap-1'>
        <img
          src={attachment.url}
          alt={attachment.fileName}
          className='w-full rounded border border-gray-200 object-contain'
        />
        {attachment.fileComment && (
          <span className='text-[12px] text-gray-500'>
            {attachment.fileComment}
          </span>
        )}
      </li>
    );
  }

  return (
    <li className='flex items-center gap-1.5 text-[13px] text-gray-700'>
      <Paperclip className='h-3.5 w-3.5 shrink-0 text-gray-400' />
      <a
        href={attachment.url}
        target='_blank'
        rel='noopener noreferrer'
        className='break-all text-blue-600 hover:underline'
      >
        {attachment.fileName}
      </a>
      {attachment.fileComment && (
        <span className='text-gray-400'>({attachment.fileComment})</span>
      )}
    </li>
  );
}
