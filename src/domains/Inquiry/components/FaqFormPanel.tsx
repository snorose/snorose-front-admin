import { useEffect, useState } from 'react';

import { Button } from '@/shared/components/ui';

import type { Faq, FaqUpsertRequest } from '../types';

const FAQ_CATEGORIES = ['이용 방법', '포인트', '계정', '족보', '기타'];

interface FaqFormPanelProps {
  initialData?: Faq; // 수정 모드일 때 전달
  onSubmit: (data: FaqUpsertRequest) => void;
  onCancel: () => void;
}

export default function FaqFormPanel({
  initialData,
  onSubmit,
  onCancel,
}: FaqFormPanelProps) {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [category, setCategory] = useState(FAQ_CATEGORIES[0]);

  useEffect(() => {
    if (initialData) {
      setQuestion(initialData.question);
      setAnswer(initialData.answer);
      setCategory(initialData.category);
    }
  }, [initialData]);

  const handleSubmit = () => {
    if (!question.trim() || !answer.trim()) return;
    onSubmit({
      id: initialData?.id,
      question: question.trim(),
      answer: answer.trim(),
      category,
    });
  };

  const isEdit = !!initialData;

  return (
    <div className='flex flex-col gap-3 rounded-md border border-blue-200 bg-blue-50 p-4'>
      <p className='text-sm font-semibold text-gray-700'>
        {isEdit ? 'FAQ 수정' : '새 FAQ 등록'}
      </p>

      {/* 카테고리 */}
      <div className='flex flex-col gap-1'>
        <label className='text-xs font-medium text-gray-500'>카테고리</label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className='h-8 w-48 rounded border border-gray-300 bg-white px-2 text-sm focus:border-blue-400 focus:outline-none'
        >
          {FAQ_CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      {/* 질문 */}
      <div className='flex flex-col gap-1'>
        <label className='text-xs font-medium text-gray-500'>
          질문 <span className='text-red-400'>*</span>
        </label>
        <input
          type='text'
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder='자주 묻는 질문을 입력하세요.'
          className='h-9 w-full rounded border border-gray-300 bg-white px-3 text-sm focus:border-blue-400 focus:outline-none'
          autoFocus={!isEdit}
        />
      </div>

      {/* 답변 */}
      <div className='flex flex-col gap-1'>
        <label className='text-xs font-medium text-gray-500'>
          답변 <span className='text-red-400'>*</span>
        </label>
        <textarea
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          placeholder='답변 내용을 입력하세요.'
          rows={4}
          className='w-full resize-y rounded border border-gray-300 bg-white p-3 text-sm focus:border-blue-400 focus:outline-none'
        />
      </div>

      <div className='flex justify-end gap-2'>
        <Button variant='outline' size='sm' onClick={onCancel}>
          취소
        </Button>
        <Button
          size='sm'
          className='bg-gray-700 hover:bg-gray-800'
          onClick={handleSubmit}
          disabled={!question.trim() || !answer.trim()}
        >
          {isEdit ? '수정 저장' : '등록'}
        </Button>
      </div>
    </div>
  );
}
