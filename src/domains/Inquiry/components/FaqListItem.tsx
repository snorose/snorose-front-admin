import { useState } from 'react';

import { ChevronDown, ChevronUp, Pencil, Trash2 } from 'lucide-react';

import { cn } from '@/shared/lib';

import type { Faq, FaqUpsertRequest } from '../types';
import FaqFormPanel from './FaqFormPanel';

interface FaqListItemProps {
  faq: Faq;
  onEdit: (data: FaqUpsertRequest) => void;
  onDelete: (id: number) => void;
}

export default function FaqListItem({
  faq,
  onEdit,
  onDelete,
}: FaqListItemProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  const handleEdit = (data: FaqUpsertRequest) => {
    onEdit(data);
    setIsEditMode(false);
  };

  return (
    <div className='rounded-md border bg-white'>
      {/* 헤더 행 */}
      <div
        className={cn(
          'flex cursor-pointer items-center gap-3 px-4 py-3',
          isExpanded && 'border-b'
        )}
        onClick={() => {
          if (!isEditMode) setIsExpanded((prev) => !prev);
        }}
      >
        {/* 카테고리 배지 */}
        <span className='shrink-0 rounded bg-gray-100 px-2 py-0.5 text-[11px] font-medium text-gray-600'>
          {faq.category}
        </span>

        {/* 질문 */}
        <p className='flex-1 truncate text-sm font-medium text-gray-800'>
          {faq.question}
        </p>

        {/* 날짜 */}
        <span className='hidden shrink-0 text-xs text-gray-400 sm:block'>
          {new Date(faq.updatedAt).toLocaleDateString('ko-KR')}
        </span>

        {/* 수정 버튼 */}
        <button
          type='button'
          onClick={(e) => {
            e.stopPropagation();
            setIsExpanded(true);
            setIsEditMode((prev) => !prev);
          }}
          className='shrink-0 rounded p-1 hover:bg-gray-100'
          aria-label='수정'
          title='수정'
        >
          <Pencil className='h-3.5 w-3.5 text-gray-500' />
        </button>

        {/* 삭제 버튼 */}
        <button
          type='button'
          onClick={(e) => {
            e.stopPropagation();
            onDelete(faq.id);
          }}
          className='shrink-0 rounded p-1 hover:bg-red-50'
          aria-label='삭제'
          title='삭제'
        >
          <Trash2 className='h-3.5 w-3.5 text-red-400' />
        </button>

        {/* 펼침 아이콘 */}
        {isExpanded ? (
          <ChevronUp className='h-4 w-4 shrink-0 text-gray-400' />
        ) : (
          <ChevronDown className='h-4 w-4 shrink-0 text-gray-400' />
        )}
      </div>

      {/* 펼침 영역 */}
      {isExpanded && (
        <div className='p-4'>
          {isEditMode ? (
            <FaqFormPanel
              initialData={faq}
              onSubmit={handleEdit}
              onCancel={() => setIsEditMode(false)}
            />
          ) : (
            <p className='text-sm leading-relaxed whitespace-pre-wrap text-gray-700'>
              {faq.answer}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
