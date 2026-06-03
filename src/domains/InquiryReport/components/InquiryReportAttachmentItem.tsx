import { Paperclip } from 'lucide-react';

import type { InquiryAttachment } from '@/shared/types';

export default function InquiryReportAttachmentItem({
  attachment,
}: {
  attachment: InquiryAttachment;
}) {
  if (attachment.type === 'PHOTO') {
    return (
      <li className='flex flex-col gap-1'>
        <a
          href={attachment.url}
          target='_blank'
          rel='noopener noreferrer'
          aria-label={`${attachment.fileName} 새 창에서 보기`}
          title='새 창에서 보기'
          className='block rounded border border-gray-200 transition hover:border-slate-300 hover:shadow-sm'
        >
          <img
            src={attachment.url}
            alt={attachment.fileName}
            className='w-full rounded object-contain'
          />
        </a>
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
