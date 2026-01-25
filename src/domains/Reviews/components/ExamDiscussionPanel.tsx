import { useState } from 'react';
import { Button } from '@/components/ui';

// 시험후기 패널 - 논의사항 입력 컴포넌트
export default function ExamDiscussionPanel() {
  const [discussionNotes, setDiscussionNotes] = useState('');

  return (
    <div className='flex w-full flex-col gap-2 px-4 py-2'>
      <div className='w-full max-w-[600px] overflow-auto'>
        <p className='px-1 py-1 text-[14px] font-semibold'>
          # 시험후기 논의사항
        </p>
        <textarea
          placeholder='논의사항을 입력해주세요.'
          value={discussionNotes}
          onChange={(e) => {
            setDiscussionNotes(e.target.value);
            // 자동 리사이즈
            const textArea = e.target as HTMLTextAreaElement;
            textArea.style.height = 'auto';
            textArea.style.height = textArea.scrollHeight + 'px';
          }}
          className='min-h-[200px] w-full resize-none rounded-md border border-gray-300 bg-white px-3 py-2 text-[13px] outline-none'
          rows={1}
          style={{ overflow: 'hidden' }}
        />
        {/* 버튼 영역 */}
        <div className='flex justify-end gap-2 pt-2'>
          <Button
            variant='secondary'
            size='sm'
            className='h-6 w-20 text-sm'
            disabled={!discussionNotes}
            onClick={() => setDiscussionNotes('')}
          >
            취소
          </Button>
          <Button
            variant='default'
            size='sm'
            className='h-6 w-20 bg-gray-700 text-sm'
            disabled={!discussionNotes}
          >
            저장
          </Button>
        </div>
      </div>
    </div>
  );
}
