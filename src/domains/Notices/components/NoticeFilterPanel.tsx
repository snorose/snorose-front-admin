import { type KeyboardEvent, useId, useState } from 'react';

import { Search } from 'lucide-react';

import { DatePicker, SectionTitle } from '@/shared/components';
import {
  Button,
  Input,
  InputGroup,
  Label,
  Select,
} from '@/shared/components/ui';

import { NOTICE_STATUS_LABELS } from '../constants';
import type { NoticeFilters, NoticeStatus } from '../types';
import NoticeBoardSelect from './NoticeBoardSelect';

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
        <NoticeBoardSelect
          allowAll
          group={filters.group ?? ''}
          board={filters.board ?? ''}
          onChange={(group, board) => updateFilters({ group, board })}
        />
        <div className='grid min-w-0 grid-cols-1 gap-4 @md:grid-cols-2 @5xl:grid-cols-3'>
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
          <fieldset className='min-w-0'>
            <legend className='mb-1 py-1 text-sm leading-none font-semibold text-gray-700'>
              상태
            </legend>
            <div className='flex flex-wrap gap-2'>
              <Button
                type='button'
                size='sm'
                variant={!filters.status ? 'default' : 'outline'}
                aria-pressed={!filters.status}
                onClick={() => updateFilters({ status: '' })}
              >
                전체
              </Button>
              {(Object.keys(NOTICE_STATUS_LABELS) as NoticeStatus[]).map(
                (status) => (
                  <Button
                    key={status}
                    type='button'
                    size='sm'
                    variant={filters.status === status ? 'default' : 'outline'}
                    aria-pressed={filters.status === status}
                    onClick={() => updateFilters({ status })}
                  >
                    {NOTICE_STATUS_LABELS[status]}
                  </Button>
                )
              )}
            </div>
          </fieldset>
          <fieldset className='min-w-0'>
            <legend className='mb-1 py-1 text-sm leading-none font-semibold text-gray-700'>
              구분
            </legend>
            <div className='flex flex-wrap gap-2'>
              {[
                ['', '전체'],
                ['new', 'NEW'],
                ['pinned', '핀 고정'],
                ['normal', '일반'],
              ].map(([kind, label]) => (
                <Button
                  key={kind}
                  type='button'
                  size='sm'
                  variant={
                    (filters.kind || '') === kind ? 'default' : 'outline'
                  }
                  aria-pressed={(filters.kind || '') === kind}
                  onClick={() => updateFilters({ kind })}
                >
                  {label}
                </Button>
              ))}
            </div>
          </fieldset>
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
