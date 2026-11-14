import { useEffect, useState } from 'react';

import { Plus, RefreshCw, Search } from 'lucide-react';
import { toast } from 'sonner';

import {
  PageHeader,
  PaginationBar,
  ResultCount,
  SectionTitle,
  StatusBadge,
} from '@/shared/components';
import {
  Button,
  ConfirmModal,
  InputGroup,
  Label,
  Select,
} from '@/shared/components/ui';
import { useManagePageUrl } from '@/shared/hooks';
import { clampOneBasedPage, getErrorMessage } from '@/shared/utils';

import { FaqEditorDialog } from '@/domains/Faqs/components/FaqEditorDialog';
import { FaqTable } from '@/domains/Faqs/components/FaqTable';
import {
  FAQ_CATEGORIES,
  FAQ_CATEGORY_TONES,
} from '@/domains/Faqs/constants/categories';
import { FAQ_PAGE_SIZE } from '@/domains/Faqs/constants/pagination';
import { useFaqs } from '@/domains/Faqs/hooks/useFaqs';
import type { Faq } from '@/domains/Faqs/types';

const PAGE_SCHEMA = {
  category: 'string',
} as const;
type FaqFilters = { category?: string };

export default function FaqManagementPage() {
  const {
    searchParams: filters,
    currentPage,
    handlePageChange,
    handleSearchChange,
  } = useManagePageUrl<FaqFilters>(PAGE_SCHEMA);
  const { listQuery, saveMutation, deleteMutation } = useFaqs();
  const [editor, setEditor] = useState<{ faq: Faq | null } | null>(null);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Faq | null>(null);
  const [deleteError, setDeleteError] = useState('');
  const isMutating = saveMutation.isPending || deleteMutation.isPending;
  const allFaqs = listQuery.data ?? [];
  const categories = [
    ...new Set([
      ...FAQ_CATEGORIES,
      ...allFaqs.map((faq) => faq.faqCategory).filter(Boolean),
      ...(filters.category ? [filters.category] : []),
    ]),
  ];
  const filteredFaqs = allFaqs.filter(
    (faq) => !filters.category || faq.faqCategory === filters.category
  );
  const totalPage = Math.max(1, Math.ceil(filteredFaqs.length / FAQ_PAGE_SIZE));
  const faqs = filteredFaqs.slice(
    (currentPage - 1) * FAQ_PAGE_SIZE,
    currentPage * FAQ_PAGE_SIZE
  );
  const selectedFaq = listQuery.isSuccess
    ? (faqs.find((faq) => faq.faqId === selectedId) ?? null)
    : null;
  const disabled = isMutating || listQuery.isFetching;

  const updateFilters = (nextFilters: FaqFilters) => {
    setSelectedId(null);
    handleSearchChange(nextFilters);
  };
  const resetFilters = () => {
    updateFilters({});
  };

  useEffect(() => {
    if (!listQuery.isSuccess) return;
    const validPage = clampOneBasedPage(currentPage, totalPage);
    if (validPage !== currentPage) handlePageChange(validPage);
  }, [currentPage, totalPage, listQuery.isSuccess, handlePageChange]);

  const requestDelete = (faq: Faq) => {
    setDeleteError('');
    setDeleteTarget(faq);
  };
  return (
    <div className='flex w-full min-w-0 flex-col gap-6'>
      <PageHeader
        title='FAQ 관리'
        description='FAQ의 제목과 내용을 조회하고 작성·수정할 수 있어요.'
      />
      <section
        aria-labelledby='faq-search-title'
        className='flex min-w-0 flex-col gap-1'
      >
        <SectionTitle id='faq-search-title'>FAQ 검색</SectionTitle>
        <form
          aria-labelledby='faq-search-title'
          className='border-border bg-background @container flex min-w-0 flex-col gap-4 rounded-lg border p-4'
          onSubmit={(event) => {
            event.preventDefault();
          }}
        >
          <div className='grid min-w-0 grid-cols-1 items-end gap-4 @md:grid-cols-3'>
            <div className='flex min-w-0 flex-col gap-1 @md:col-span-2'>
              <Label htmlFor='faq-keyword'>게시글 검색</Label>
              <div className='flex min-w-0 gap-2'>
                <Select value='all' disabled>
                  <Select.Trigger
                    type='button'
                    aria-label='게시글 검색 범위'
                    aria-describedby='faq-search-unavailable'
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
                    <Search aria-hidden='true' />
                  </InputGroup.Addon>
                  <InputGroup.Input
                    id='faq-keyword'
                    placeholder='텍스트 검색 준비 중'
                    value=''
                    disabled
                    aria-describedby='faq-search-unavailable'
                  />
                </InputGroup>
              </div>
            </div>
            <div className='flex min-w-0 flex-col gap-1'>
              <Label htmlFor='faq-category-filter'>카테고리</Label>
              <Select
                value={
                  filters.category ? `category:${filters.category}` : 'all'
                }
                onValueChange={(value) =>
                  updateFilters({
                    ...filters,
                    category:
                      value === 'all'
                        ? undefined
                        : value.slice('category:'.length),
                  })
                }
              >
                <Select.Trigger
                  type='button'
                  id='faq-category-filter'
                  className='h-9 w-full min-w-0 shadow-none'
                >
                  <Select.Value />
                </Select.Trigger>
                <Select.Content align='start'>
                  <Select.Item value='all'>전체</Select.Item>
                  {categories.map((category) => (
                    <Select.Item
                      key={category}
                      value={`category:${category}`}
                      textValue={category}
                    >
                      <StatusBadge
                        tone={FAQ_CATEGORY_TONES[category] ?? 'neutral'}
                      >
                        {category}
                      </StatusBadge>
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select>
            </div>
          </div>
          <p
            id='faq-search-unavailable'
            className='text-muted-foreground text-xs'
          >
            텍스트 검색은 준비 중입니다. 카테고리로 필터링해 주세요.
          </p>
          <div className='flex gap-2 @md:ml-auto'>
            <Button
              type='button'
              variant='outline'
              size='sm'
              className='h-9 min-w-24 flex-1 shadow-none @md:flex-none'
              aria-label='검색 조건 초기화'
              onClick={resetFilters}
            >
              초기화
            </Button>
            <Button
              type='submit'
              disabled
              size='sm'
              className='h-9 min-w-24 flex-1 shadow-none @md:flex-none'
            >
              검색
            </Button>
          </div>
        </form>
      </section>
      <section aria-label='FAQ 목록' className='flex min-w-0 flex-col gap-3'>
        <div className='flex flex-col gap-2'>
          <div className='flex flex-wrap items-center justify-between gap-3'>
            <div className='flex min-w-0 flex-wrap items-center gap-3'>
              <SectionTitle id='faq-list-title'>FAQ 목록</SectionTitle>
              <Button
                variant='outline'
                size='sm'
                disabled={disabled}
                onClick={() => {
                  void listQuery.refetch();
                }}
              >
                <RefreshCw aria-hidden='true' />
                새로고침
              </Button>
            </div>
            <Button
              size='sm'
              disabled={isMutating}
              onClick={() => setEditor({ faq: null })}
            >
              <Plus aria-hidden='true' />
              FAQ 작성하기
            </Button>
          </div>
          <ResultCount
            totalCount={listQuery.data ? filteredFaqs.length : undefined}
            status={
              listQuery.isPending
                ? 'loading'
                : listQuery.isError
                  ? 'error'
                  : 'ready'
            }
          />
        </div>
        <FaqTable
          faqs={faqs}
          isLoading={listQuery.isPending}
          isError={listQuery.isError}
          disabled={disabled}
          emptyMessage={
            filters.category
              ? '검색 조건에 해당하는 FAQ가 없습니다.'
              : undefined
          }
          selectedId={selectedFaq?.faqId ?? null}
          onSelect={setSelectedId}
          onEdit={(faq) => setEditor({ faq })}
          onDelete={requestDelete}
        />

        <div
          inert={disabled}
          className={disabled ? 'pointer-events-none opacity-50' : undefined}
        >
          <PaginationBar
            currentPage={currentPage}
            totalPage={totalPage}
            onPageChange={(page) => {
              setSelectedId(null);
              handlePageChange(page);
            }}
          />
        </div>
      </section>
      {editor && (
        <FaqEditorDialog
          faq={editor.faq}
          availableCategories={categories}
          isSaving={saveMutation.isPending}
          onClose={() => setEditor(null)}
          onSave={async (input) => {
            await saveMutation.mutateAsync({ faqId: editor.faq?.faqId, input });
          }}
          onSaved={() => {
            setEditor(null);
            toast.success(
              editor.faq ? 'FAQ가 수정되었습니다.' : 'FAQ가 등록되었습니다.'
            );
            if (!editor.faq) {
              resetFilters();
            }
          }}
        />
      )}
      <ConfirmModal
        isOpen={deleteTarget !== null}
        title='FAQ를 삭제하시겠습니까?'
        description='삭제한 FAQ는 복구할 수 없습니다.'
        confirmText={deleteMutation.isPending ? '삭제 중…' : '삭제'}
        confirmVariant='destructive'
        isPending={deleteMutation.isPending}
        onClose={() => {
          if (!deleteMutation.isPending) setDeleteTarget(null);
        }}
        onConfirm={async () => {
          if (!deleteTarget || deleteMutation.isPending) return;
          setDeleteError('');
          try {
            await deleteMutation.mutateAsync(deleteTarget.faqId);
            setDeleteTarget(null);
            setSelectedId(null);
            toast.success('FAQ가 삭제되었습니다.');
          } catch (error) {
            setDeleteError(
              getErrorMessage(
                error,
                'FAQ 삭제에 실패했습니다. 다시 시도해 주세요.'
              )
            );
          }
        }}
      >
        <p className='text-sm break-words text-gray-700'>
          {deleteTarget?.question}
        </p>
        {deleteError && (
          <p role='alert' className='mt-3 text-sm text-red-600'>
            {deleteError}
          </p>
        )}
      </ConfirmModal>
    </div>
  );
}
