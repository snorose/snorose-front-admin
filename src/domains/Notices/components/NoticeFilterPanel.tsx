import { Filter, Search, X } from 'lucide-react';

import { DatePicker, ResultCount } from '@/shared/components';
import {
  Button,
  Card,
  InputGroup,
  Label,
  Select,
  Separator,
} from '@/shared/components/ui';

import { NOTICE_STATUS_LABELS } from '../constants';
import type { NoticeFilters, NoticeStatus } from '../types';
import NoticeBoardSelect from './NoticeBoardSelect';

interface NoticeFilterPanelProps {
  filters: NoticeFilters;
  authorSearch: string;
  totalCount: number;
  onFilterChange: (updates: NoticeFilters) => void;
  onReset: () => void;
}

export default function NoticeFilterPanel({
  filters,
  authorSearch,
  totalCount,
  onFilterChange,
  onReset,
}: NoticeFilterPanelProps) {
  return (
    <Card
      aria-labelledby='notice-filter-title'
      className='flex min-w-0 flex-col gap-5 bg-white p-4'
    >
      <h2
        id='notice-filter-title'
        className='flex items-center gap-2 text-base font-semibold'
      >
        <Filter className='size-4 text-gray-500' />
        검색 / 필터
      </h2>
      <fieldset className='max-w-xl min-w-0'>
        <legend className='mb-2 text-sm font-semibold text-gray-700'>
          작성일 기간
        </legend>
        <div className='flex items-center gap-2'>
          <div className='min-w-0 flex-1'>
            <DatePicker
              id='notice-start-date'
              aria-label='작성 시작일'
              placeholder='시작일'
              value={filters.startDate}
              maxDate={filters.endDate || undefined}
              onValueChange={(value) => onFilterChange({ startDate: value })}
            />
          </div>
          <span className='text-gray-400'>~</span>
          <div className='min-w-0 flex-1'>
            <DatePicker
              id='notice-end-date'
              aria-label='작성 종료일'
              placeholder='종료일'
              value={filters.endDate}
              minDate={filters.startDate || undefined}
              onValueChange={(value) => onFilterChange({ endDate: value })}
            />
          </div>
        </div>
      </fieldset>
      <Separator />
      <div className='grid min-w-0 gap-4 md:grid-cols-2 xl:grid-cols-3'>
        <div className='space-y-2'>
          <Label htmlFor='notice-author-search'>
            작성자 검색 (아이디/닉네임)
          </Label>
          <InputGroup>
            <InputGroup.Addon>
              <Search />
            </InputGroup.Addon>
            <InputGroup.Input
              id='notice-author-search'
              placeholder='작성자 검색...'
              value={authorSearch}
              onChange={(event) =>
                onFilterChange({
                  keywordAuthor: event.target.value,
                  author: '',
                })
              }
            />
          </InputGroup>
        </div>
        <div className='min-w-0 space-y-2'>
          <Label htmlFor='notice-keyword'>게시글 검색</Label>
          <div className='flex gap-2'>
            <Select
              value={filters.scope || 'all'}
              onValueChange={(scope) => onFilterChange({ scope })}
            >
              <Select.Trigger
                aria-label='게시글 검색 범위'
                className='w-28 shrink-0'
              >
                <Select.Value />
              </Select.Trigger>
              <Select.Content>
                <Select.Item value='all'>제목+내용</Select.Item>
                <Select.Item value='title'>제목</Select.Item>
                <Select.Item value='content'>내용</Select.Item>
              </Select.Content>
            </Select>
            <InputGroup className='min-w-0 flex-1'>
              <InputGroup.Addon>
                <Search />
              </InputGroup.Addon>
              <InputGroup.Input
                id='notice-keyword'
                placeholder='검색어...'
                value={filters.keyword ?? ''}
                onChange={(event) =>
                  onFilterChange({ keyword: event.target.value })
                }
              />
            </InputGroup>
          </div>
        </div>
        <div className='space-y-2'>
          <Label htmlFor='notice-sort'>정렬</Label>
          <Select
            value={filters.sort || 'latest'}
            onValueChange={(sort) => onFilterChange({ sort })}
          >
            <Select.Trigger id='notice-sort' className='w-full'>
              <Select.Value />
            </Select.Trigger>
            <Select.Content>
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
      </div>
      <Separator />
      <NoticeBoardSelect
        allowAll
        group={filters.group ?? ''}
        board={filters.board ?? ''}
        onChange={(group, board) => onFilterChange({ group, board })}
      />
      <Separator />
      <div className='flex flex-wrap gap-x-8 gap-y-5'>
        <fieldset>
          <legend className='mb-2 text-sm font-semibold text-gray-700'>
            상태
          </legend>
          <div className='flex flex-wrap gap-2'>
            <Button
              size='sm'
              variant={!filters.status ? 'default' : 'outline'}
              aria-pressed={!filters.status}
              onClick={() => onFilterChange({ status: '' })}
            >
              전체
            </Button>
            {(Object.keys(NOTICE_STATUS_LABELS) as NoticeStatus[]).map(
              (status) => (
                <Button
                  key={status}
                  size='sm'
                  variant={filters.status === status ? 'default' : 'outline'}
                  aria-pressed={filters.status === status}
                  onClick={() => onFilterChange({ status })}
                >
                  {NOTICE_STATUS_LABELS[status]}
                </Button>
              )
            )}
          </div>
        </fieldset>
        <fieldset>
          <legend className='mb-2 text-sm font-semibold text-gray-700'>
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
                size='sm'
                variant={(filters.kind || '') === kind ? 'default' : 'outline'}
                aria-pressed={(filters.kind || '') === kind}
                onClick={() => onFilterChange({ kind })}
              >
                {label}
              </Button>
            ))}
          </div>
        </fieldset>
      </div>
      <div className='flex flex-wrap items-center justify-between gap-2'>
        <ResultCount totalCount={totalCount} status='ready' />
        <Button variant='outline' size='sm' onClick={onReset}>
          <X className='size-4' />
          필터 초기화
        </Button>
      </div>
    </Card>
  );
}
