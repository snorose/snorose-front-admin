import { Fragment } from 'react';

import { ChevronDown, Pencil, Trash2 } from 'lucide-react';

import {
  MemberInfoPopover,
  StatusBadge,
  TableStateRow,
} from '@/shared/components';
import { Button, Table } from '@/shared/components/ui';
import { cn } from '@/shared/lib';
import { formatDateTimeToMinutes } from '@/shared/utils';

import { FAQ_CATEGORY_TONES } from '../constants/categories';
import { FAQ_PAGE_SIZE } from '../constants/pagination';
import type { Faq } from '../types';

interface FaqTableProps {
  faqs: Faq[];
  isLoading: boolean;
  isError: boolean;
  disabled: boolean;
  emptyMessage?: string;
  selectedId: number | null;
  onSelect: (faqId: number | null) => void;
  onEdit: (faq: Faq) => void;
  onDelete: (faq: Faq) => void;
}

export function FaqTable({
  faqs,
  isLoading,
  isError,
  disabled,
  emptyMessage = '등록된 FAQ가 없습니다.',
  selectedId,
  onSelect,
  onEdit,
  onDelete,
}: FaqTableProps) {
  const state = isLoading
    ? 'loading'
    : isError
      ? 'error'
      : faqs.length === 0
        ? 'empty'
        : null;
  const select = (faqId: number) => {
    if (!disabled) onSelect(selectedId === faqId ? null : faqId);
  };
  return (
    <div className='w-full overflow-x-auto rounded-lg border'>
      <Table className='w-full min-w-[1020px] table-fixed bg-white shadow'>
        <colgroup>
          <col style={{ width: '7%' }} />
          <col style={{ width: '13%' }} />
          <col style={{ width: '28%' }} />
          <col style={{ width: '20%' }} />
          <col style={{ width: '16%' }} />
          <col style={{ width: '16%' }} />
        </colgroup>
        <Table.Header className='h-[40px] shadow-sm [&_tr]:border-b'>
          <Table.Row>
            <Table.Head className='text-center'>ID</Table.Head>
            <Table.Head>분류</Table.Head>
            <Table.Head>제목</Table.Head>
            <Table.Head>작성자</Table.Head>
            <Table.Head>작성일시</Table.Head>
            <Table.Head>수정일시</Table.Head>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {state ? (
            <TableStateRow
              state={state}
              colSpan={6}
              message={state === 'empty' ? emptyMessage : undefined}
            />
          ) : (
            <>
              {faqs.map((faq) => {
                const expanded = selectedId === faq.faqId;
                return (
                  <Fragment key={faq.faqId}>
                    <Table.Row
                      data-faq-id={faq.faqId}
                      data-state={expanded ? 'selected' : undefined}
                      className={cn(
                        'cursor-pointer [&_td]:h-[40px]',
                        expanded && 'bg-blue-100 hover:bg-blue-100'
                      )}
                      onClick={() => select(faq.faqId)}
                    >
                      <Table.Cell
                        className='text-center'
                        title={String(faq.faqId)}
                      >
                        {faq.faqId}
                      </Table.Cell>
                      <Table.Cell>
                        <StatusBadge
                          tone={
                            FAQ_CATEGORY_TONES[faq.faqCategory] ?? 'neutral'
                          }
                        >
                          {faq.faqCategory || '미분류'}
                        </StatusBadge>
                      </Table.Cell>
                      <Table.Cell className='overflow-hidden text-ellipsis'>
                        <button
                          type='button'
                          className='focus-visible:ring-ring flex w-full items-center justify-between gap-2 text-left focus-visible:ring-2 focus-visible:outline-none'
                          disabled={disabled}
                          aria-expanded={expanded}
                          aria-controls={`faq-content-${faq.faqId}`}
                          title={faq.question}
                          onClick={(event) => {
                            event.stopPropagation();
                            select(faq.faqId);
                          }}
                        >
                          <span
                            className={cn(
                              'min-w-0',
                              expanded
                                ? 'break-words whitespace-normal'
                                : 'truncate'
                            )}
                          >
                            {faq.question}
                          </span>
                          <ChevronDown
                            aria-hidden='true'
                            className={cn(
                              'size-4 shrink-0 text-gray-500 transition-transform',
                              expanded && 'rotate-180'
                            )}
                          />
                        </button>
                      </Table.Cell>
                      <Table.Cell>
                        {faq.encryptedUserId?.trim() ? (
                          <MemberInfoPopover
                            key={faq.encryptedUserId}
                            encryptedUserId={faq.encryptedUserId}
                            displayName={faq.writer?.trim() ? faq.writer : '-'}
                          />
                        ) : faq.writer?.trim() ? (
                          faq.writer
                        ) : (
                          '-'
                        )}
                      </Table.Cell>
                      <Table.Cell className='text-gray-600'>
                        {formatDateTimeToMinutes(faq.createdAt)}
                      </Table.Cell>
                      <Table.Cell className='text-gray-600'>
                        {formatDateTimeToMinutes(faq.updatedAt)}
                      </Table.Cell>
                    </Table.Row>
                    {expanded && (
                      <Table.Row className='bg-gray-50 hover:bg-gray-50'>
                        <Table.Cell colSpan={2} aria-hidden='true' />
                        <Table.Cell
                          colSpan={2}
                          className='p-0 whitespace-normal'
                        >
                          <div
                            id={`faq-content-${faq.faqId}`}
                            role='region'
                            aria-label='FAQ 내용'
                            className='space-y-4 px-2 py-4'
                          >
                            <section
                              aria-label='내용'
                              className='text-sm leading-7 break-words whitespace-pre-wrap text-gray-900'
                            >
                              {faq.answer}
                            </section>
                            <div className='flex justify-end gap-2'>
                              <Button
                                type='button'
                                variant='secondary'
                                className='hover:bg-gray-200 hover:text-gray-950 hover:ring-1 hover:ring-gray-300'
                                size='sm'
                                disabled={disabled}
                                onClick={() => onEdit(faq)}
                                aria-label='FAQ 수정'
                              >
                                <Pencil aria-hidden='true' />
                                수정
                              </Button>
                              <Button
                                type='button'
                                variant='destructive-outline'
                                size='sm'
                                disabled={disabled}
                                onClick={() => onDelete(faq)}
                                aria-label='FAQ 삭제'
                              >
                                <Trash2 aria-hidden='true' />
                                삭제
                              </Button>
                            </div>
                          </div>
                        </Table.Cell>
                        <Table.Cell colSpan={2} aria-hidden='true' />
                      </Table.Row>
                    )}
                  </Fragment>
                );
              })}
              {Array.from(
                { length: Math.max(0, FAQ_PAGE_SIZE - faqs.length) },
                (_, index) => (
                  <Table.Row
                    key={`empty-${index}`}
                    aria-hidden='true'
                    className='[&_td]:h-[24px]'
                  >
                    <Table.Cell colSpan={6}>&nbsp;</Table.Cell>
                  </Table.Row>
                )
              )}
            </>
          )}
        </Table.Body>
      </Table>
    </div>
  );
}
