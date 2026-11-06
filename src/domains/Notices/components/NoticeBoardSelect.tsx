import { Button } from '@/shared/components/ui';

import { NOTICE_BOARD_GROUPS } from '../constants';

interface NoticeBoardSelectProps {
  group: string;
  board: string;
  onChange: (group: string, board: string) => void;
  allowAll?: boolean;
}

// 기존 Button으로 목록 필터와 작성 화면의 동일한 게시판 선택을 구성합니다.
export default function NoticeBoardSelect({
  group,
  board,
  onChange,
  allowAll = false,
}: NoticeBoardSelectProps) {
  const selected = NOTICE_BOARD_GROUPS.find((item) => item.label === group);
  return (
    <fieldset className='space-y-3'>
      <legend className='mb-2 text-sm font-semibold text-gray-700'>
        {allowAll ? '게시판' : '게시판 선택'}
        {!allowAll && <span className='ml-1 text-red-400'>*</span>}
      </legend>
      <div className='flex flex-wrap gap-2'>
        {allowAll && (
          <Button
            type='button'
            size='sm'
            variant={!group ? 'default' : 'outline'}
            aria-pressed={!group}
            onClick={() => onChange('', '')}
          >
            전체
          </Button>
        )}
        {NOTICE_BOARD_GROUPS.map((item) => (
          <Button
            key={item.label}
            type='button'
            size='sm'
            variant={group === item.label ? 'default' : 'outline'}
            aria-pressed={group === item.label}
            onClick={() =>
              onChange(
                item.label,
                item.boards.length === 1 ? item.boards[0] : ''
              )
            }
          >
            {item.label}
          </Button>
        ))}
      </div>
      {selected && selected.boards.length > 1 && (
        <div className='flex flex-wrap gap-2 border-l-2 border-blue-200 pl-3'>
          {allowAll && (
            <Button
              type='button'
              size='sm'
              variant={!board ? 'secondary' : 'outline'}
              aria-pressed={!board}
              onClick={() => onChange(group, '')}
            >
              전체
            </Button>
          )}
          {selected.boards.map((item) => (
            <Button
              key={item}
              type='button'
              size='sm'
              variant={board === item ? 'secondary' : 'outline'}
              aria-pressed={board === item}
              onClick={() => onChange(group, item)}
            >
              {item}
            </Button>
          ))}
        </div>
      )}
      {!allowAll && !board && (
        <p className='text-xs text-gray-500'>
          {group
            ? '하위 게시판을 선택해 주세요.'
            : '대분류를 먼저 선택해 주세요.'}
        </p>
      )}
    </fieldset>
  );
}
