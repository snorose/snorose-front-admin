import { type KeyboardEvent, useId, useState } from 'react';

import { Pin, Search } from 'lucide-react';

import { DatePicker, SectionTitle, StatusBadge } from '@/shared/components';
import {
  Button,
  Input,
  InputGroup,
  Label,
  Select,
} from '@/shared/components/ui';

import {
  NOTICE_BOARD_GROUPS,
  NOTICE_STATUS_LABELS,
  NOTICE_STATUS_TONES,
} from '../constants';
import type { NoticeFilters, NoticeStatus } from '../types';

interface NoticeFilterPanelProps {
  initialFilters: NoticeFilters;
  onFilterChange: (filters: NoticeFilters) => void;
  onReset: () => void;
}

export default function NoticeFilterPanel({
  initialFilters,
  onFilterChange,
  onReset,
}: NoticeFilterPanelProps) {
  const headingId = useId();
  const [searchFields, setSearchFields] = useState(() => ({
    keyword: initialFilters.keyword,
    keywordAuthor: initialFilters.keywordAuthor,
    author: initialFilters.author,
  }));
  const filters = { ...initialFilters, ...searchFields };
  const selectedGroup = NOTICE_BOARD_GROUPS.find(
    (group) => group.label === filters.group
  );
  const hasSubBoards = !!selectedGroup && selectedGroup.boards.length > 1;
  // 선택형 조건은 즉시 적용하되 아직 검색하지 않은 텍스트까지 적용하지 않습니다.
  const updateFilters = (updates: NoticeFilters) =>
    onFilterChange({ ...initialFilters, ...updates });
  const handleSearchKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== 'Enter') return;
    event.preventDefault();
    if (event.nativeEvent.isComposing || event.nativeEvent.keyCode === 229)
      return;
    onFilterChange(filters);
  };

  return (
    <section
      aria-labelledby={headingId}
      className='flex min-w-0 flex-col gap-1'
    >
      <SectionTitle id={headingId}>공지사항 검색</SectionTitle>
      <form
        aria-labelledby={headingId}
        className='border-border bg-background @container flex min-w-0 flex-col gap-4 rounded-lg border p-4'
        onSubmit={(event) => {
          event.preventDefault();
          onFilterChange(filters);
        }}
      >
        <div className='grid min-w-0 grid-cols-1 items-end gap-4 @md:grid-cols-2 @5xl:grid-cols-4'>
          <div className='flex min-w-0 flex-col gap-1 @md:col-span-2'>
            <Label htmlFor='notice-keyword'>게시글 검색</Label>
            <div className='flex min-w-0 gap-2'>
              <Select
                value={filters.scope || 'all'}
                onValueChange={(scope) => updateFilters({ scope })}
              >
                <Select.Trigger
                  type='button'
                  aria-label='게시글 검색 범위'
                  className='h-9 w-28 shrink-0 shadow-none'
                >
                  <Select.Value />
                </Select.Trigger>
                <Select.Content align='start'>
                  <Select.Item value='all'>제목+내용</Select.Item>
                  <Select.Item value='title'>제목</Select.Item>
                  <Select.Item value='content'>내용</Select.Item>
                </Select.Content>
              </Select>
              <InputGroup className='min-w-0 flex-1 shadow-none'>
                <InputGroup.Addon>
                  <Search />
                </InputGroup.Addon>
                <InputGroup.Input
                  id='notice-keyword'
                  placeholder='검색어를 입력하세요'
                  value={filters.keyword ?? ''}
                  onKeyDown={handleSearchKeyDown}
                  onChange={(event) =>
                    setSearchFields((previous) => ({
                      ...previous,
                      keyword: event.target.value,
                    }))
                  }
                />
              </InputGroup>
            </div>
          </div>
          <div className='flex min-w-0 flex-col gap-1'>
            <Label htmlFor='notice-author-search'>작성자 검색 (닉네임)</Label>
            <Input
              id='notice-author-search'
              className='shadow-none'
              placeholder='닉네임'
              value={filters.keywordAuthor ?? ''}
              onKeyDown={handleSearchKeyDown}
              onChange={(event) =>
                setSearchFields((previous) => ({
                  ...previous,
                  keywordAuthor: event.target.value,
                  author: '',
                }))
              }
            />
          </div>
          <fieldset className='min-w-0'>
            <legend className='mb-1 py-1 text-sm leading-none font-semibold text-gray-700'>
              마지막 수정일 기간
            </legend>
            <div className='flex min-w-0 items-center gap-1'>
              <div className='min-w-0 flex-1'>
                <DatePicker
                  id='notice-start-date'
                  aria-label='수정 시작일'
                  placeholder='시작일'
                  className='gap-1 px-2 shadow-none'
                  value={filters.startDate}
                  maxDate={filters.endDate || undefined}
                  onValueChange={(startDate) => updateFilters({ startDate })}
                />
              </div>
              <span aria-hidden='true' className='text-muted-foreground'>
                ~
              </span>
              <div className='min-w-0 flex-1'>
                <DatePicker
                  id='notice-end-date'
                  aria-label='수정 종료일'
                  placeholder='종료일'
                  className='gap-1 px-2 shadow-none'
                  value={filters.endDate}
                  minDate={filters.startDate || undefined}
                  onValueChange={(endDate) => updateFilters({ endDate })}
                />
              </div>
            </div>
          </fieldset>
        </div>
        <div className='grid min-w-0 grid-cols-1 items-end gap-4 @md:grid-cols-2 @3xl:grid-cols-5'>
          <div className='flex min-w-0 flex-col gap-1'>
            <Label htmlFor='notice-board-group'>게시판</Label>
            <Select
              value={filters.group || 'all'}
              onValueChange={(value) => {
                const group = NOTICE_BOARD_GROUPS.find(
                  (item) => item.label === value
                );
                updateFilters({
                  group: group?.label ?? '',
                  board: group?.boards.length === 1 ? group.boards[0] : '',
                });
              }}
            >
              <Select.Trigger
                type='button'
                id='notice-board-group'
                className='h-9 w-full min-w-0 shadow-none'
              >
                <Select.Value />
              </Select.Trigger>
              <Select.Content align='start'>
                <Select.Item value='all'>전체</Select.Item>
                {NOTICE_BOARD_GROUPS.map((group) => (
                  <Select.Item
                    key={group.label}
                    value={group.label}
                    textValue={group.label}
                  >
                    <StatusBadge tone='outline'>{group.label}</StatusBadge>
                  </Select.Item>
                ))}
              </Select.Content>
            </Select>
          </div>
          <div className='flex min-w-0 flex-col gap-1'>
            <Label htmlFor='notice-sub-board'>하위 게시판</Label>
            <Select
              disabled={!hasSubBoards}
              value={hasSubBoards ? filters.board || 'all' : ''}
              onValueChange={(board) =>
                updateFilters({ board: board === 'all' ? '' : board })
              }
            >
              <Select.Trigger
                type='button'
                id='notice-sub-board'
                className='h-9 w-full min-w-0 shadow-none'
              >
                <Select.Value
                  placeholder={selectedGroup ? '해당 없음' : '게시판 선택'}
                />
              </Select.Trigger>
              <Select.Content align='start'>
                <Select.Item value='all'>전체</Select.Item>
                {hasSubBoards &&
                  selectedGroup.boards.map((board) => (
                    <Select.Item key={board} value={board} textValue={board}>
                      <StatusBadge tone='outline'>{board}</StatusBadge>
                    </Select.Item>
                  ))}
              </Select.Content>
            </Select>
          </div>
          <div className='flex min-w-0 flex-col gap-1'>
            <Label htmlFor='notice-sort'>정렬</Label>
            <Select
              value={filters.sort || 'latest'}
              onValueChange={(sort) => updateFilters({ sort })}
            >
              <Select.Trigger
                type='button'
                id='notice-sort'
                className='h-9 w-full min-w-0 shadow-none'
              >
                <Select.Value />
              </Select.Trigger>
              <Select.Content align='start'>
                {[
                  ['latest', '최신순'],
                  ['oldest', '오래된순'],
                  ['views', '조회수순'],
                  ['likes', '공감수순'],
                  ['scraps', '스크랩수순'],
                ].map(([value, label]) => (
                  <Select.Item key={value} value={value}>
                    {label}
                  </Select.Item>
                ))}
              </Select.Content>
            </Select>
          </div>
          <div className='flex min-w-0 flex-col gap-1'>
            <Label htmlFor='notice-status'>상태</Label>
            <Select
              value={filters.status || 'all'}
              onValueChange={(status) =>
                updateFilters({ status: status === 'all' ? '' : status })
              }
            >
              <Select.Trigger
                type='button'
                id='notice-status'
                className='h-9 w-full min-w-0 shadow-none'
              >
                <Select.Value />
              </Select.Trigger>
              <Select.Content align='start'>
                <Select.Item value='all'>전체</Select.Item>
                {(Object.keys(NOTICE_STATUS_LABELS) as NoticeStatus[]).map(
                  (status) => (
                    <Select.Item
                      key={status}
                      value={status}
                      textValue={NOTICE_STATUS_LABELS[status]}
                    >
                      {status === 'private' ? (
                        <span className='rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-red-600'>
                          {NOTICE_STATUS_LABELS[status]}
                        </span>
                      ) : (
                        <StatusBadge tone={NOTICE_STATUS_TONES[status]}>
                          {NOTICE_STATUS_LABELS[status]}
                        </StatusBadge>
                      )}
                    </Select.Item>
                  )
                )}
              </Select.Content>
            </Select>
          </div>
          <div className='flex min-w-0 flex-col gap-1 @md:col-span-2 @3xl:col-span-1'>
            <Label htmlFor='notice-kind'>구분</Label>
            <Select
              value={filters.kind || 'all'}
              onValueChange={(kind) =>
                updateFilters({ kind: kind === 'all' ? '' : kind })
              }
            >
              <Select.Trigger
                type='button'
                id='notice-kind'
                className='h-9 w-full min-w-0 shadow-none'
              >
                <Select.Value />
              </Select.Trigger>
              <Select.Content align='start'>
                {[
                  ['all', '전체'],
                  ['new', 'NEW'],
                  ['pinned', '핀 고정'],
                  ['normal', '일반'],
                ].map(([kind, label]) => (
                  <Select.Item key={kind} value={kind} textValue={label}>
                    {kind === 'all' ? (
                      label
                    ) : (
                      <StatusBadge
                        tone={
                          kind === 'new'
                            ? 'danger'
                            : kind === 'pinned'
                              ? 'accent'
                              : 'neutral'
                        }
                      >
                        {kind === 'pinned' && (
                          <Pin className='size-3' aria-hidden='true' />
                        )}
                        {label}
                      </StatusBadge>
                    )}
                  </Select.Item>
                ))}
              </Select.Content>
            </Select>
          </div>
        </div>
        <div className='flex flex-col gap-3 @md:flex-row @md:items-center'>
          <div className='flex gap-2 @md:ml-auto'>
            <Button
              type='button'
              variant='outline'
              size='sm'
              className='h-9 min-w-24 flex-1 shadow-none @md:flex-none'
              aria-label='검색 조건 초기화'
              onClick={() => {
                setSearchFields({ keyword: '', keywordAuthor: '', author: '' });
                onReset();
              }}
            >
              초기화
            </Button>
            <Button
              type='submit'
              size='sm'
              className='h-9 min-w-24 flex-1 shadow-none @md:flex-none'
            >
              검색
            </Button>
          </div>
        </div>
      </form>
    </section>
  );
}
