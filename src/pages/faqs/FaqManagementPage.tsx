import { useEffect, useState } from 'react';

import { Plus, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

import {
  PageHeader,
  PaginationBar,
  ResultCount,
  SectionTitle,
} from '@/shared/components';
import { Button, ConfirmModal } from '@/shared/components/ui';
import { useManagePageUrl } from '@/shared/hooks';
import { clampOneBasedPage, getErrorMessage } from '@/shared/utils';

import { FaqEditorDialog } from '@/domains/Faqs/components/FaqEditorDialog';
import { FaqTable } from '@/domains/Faqs/components/FaqTable';
import { FAQ_PAGE_SIZE } from '@/domains/Faqs/constants/pagination';
import { useFaqs } from '@/domains/Faqs/hooks/useFaqs';
import type { Faq } from '@/domains/Faqs/types';

const PAGE_SCHEMA = {};

export default function FaqManagementPage() {
  const { currentPage, handlePageChange } = useManagePageUrl(PAGE_SCHEMA);
  const { listQuery, saveMutation, deleteMutation } = useFaqs();
  const [editor, setEditor] = useState<{ faq: Faq | null } | null>(null);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Faq | null>(null);
  const [deleteError, setDeleteError] = useState('');
  const isMutating = saveMutation.isPending || deleteMutation.isPending;
  const allFaqs = listQuery.data ?? [];
  const totalPage = Math.max(1, Math.ceil(allFaqs.length / FAQ_PAGE_SIZE));
  const faqs = allFaqs.slice(
    (currentPage - 1) * FAQ_PAGE_SIZE,
    currentPage * FAQ_PAGE_SIZE
  );
  const selectedFaq = listQuery.isSuccess
    ? (faqs.find((faq) => faq.faqId === selectedId) ?? null)
    : null;
  const disabled = isMutating || listQuery.isFetching;

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
            totalCount={listQuery.data?.length}
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
              setSelectedId(null);
              if (currentPage !== 1) handlePageChange(1);
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
        confirmDisabled={deleteMutation.isPending}
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
