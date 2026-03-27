import { useState } from 'react';

import { useQueryClient } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';

import { PageHeader } from '@/shared/components';
import { Button, ConfirmModal, Skeleton } from '@/shared/components/ui';

import { FaqFormPanel, FaqListItem } from '@/domains/Inquiry/components';
import { useFaqList } from '@/domains/Inquiry/hooks';
import type { Faq, FaqUpsertRequest } from '@/domains/Inquiry/types';

export default function InquiryFaqPage() {
  const queryClient = useQueryClient();
  const { data: faqs, isLoading } = useFaqList();

  const [isCreateMode, setIsCreateMode] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);

  // ── 캐시 직접 조작 (mock CRUD) ────────────────────────────────────────────
  const updateCache = (updater: (prev: Faq[]) => Faq[]) => {
    queryClient.setQueryData<Faq[]>(['faqList'], (old) => updater(old ?? []));
  };

  const handleCreate = (data: FaqUpsertRequest) => {
    const newFaq: Faq = {
      id: Date.now(),
      question: data.question,
      answer: data.answer,
      category: data.category,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    updateCache((prev) => [newFaq, ...prev]);
    setIsCreateMode(false);
    toast.success('FAQ가 등록되었습니다.');
  };

  const handleEdit = (data: FaqUpsertRequest) => {
    updateCache((prev) =>
      prev.map((faq) =>
        faq.id === data.id
          ? { ...faq, ...data, updatedAt: new Date().toISOString() }
          : faq
      )
    );
    toast.success('FAQ가 수정되었습니다.');
  };

  const handleDeleteConfirm = () => {
    if (deleteTargetId === null) return;
    updateCache((prev) => prev.filter((faq) => faq.id !== deleteTargetId));
    setDeleteTargetId(null);
    toast.success('FAQ가 삭제되었습니다.');
  };

  return (
    <div className='flex w-full flex-col gap-6'>
      <div className='flex items-center justify-between'>
        <PageHeader
          title='FAQ 관리'
          description='자주 묻는 질문을 등록, 수정, 삭제할 수 있어요.'
        />
        <Button
          onClick={() => setIsCreateMode((prev) => !prev)}
          className='shrink-0 gap-1.5 bg-gray-700 hover:bg-gray-800'
        >
          <Plus className='h-4 w-4' />새 FAQ 등록
        </Button>
      </div>

      {/* 등록 폼 */}
      {isCreateMode && (
        <FaqFormPanel
          onSubmit={handleCreate}
          onCancel={() => setIsCreateMode(false)}
        />
      )}

      {/* 목록 */}
      <div className='flex flex-col gap-2'>
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className='h-12 w-full rounded-md' />
          ))
        ) : !faqs || faqs.length === 0 ? (
          <div className='flex h-40 items-center justify-center rounded-md border bg-white text-sm text-gray-400'>
            등록된 FAQ가 없습니다.
          </div>
        ) : (
          faqs.map((faq) => (
            <FaqListItem
              key={faq.id}
              faq={faq}
              onEdit={handleEdit}
              onDelete={(id) => setDeleteTargetId(id)}
            />
          ))
        )}
      </div>

      {/* 삭제 확인 모달 */}
      <ConfirmModal
        isOpen={deleteTargetId !== null}
        title='FAQ 삭제'
        description='이 FAQ를 삭제하시겠습니까? 삭제 후 복구할 수 없습니다.'
        confirmText='삭제'
        closeText='취소'
        onClose={() => setDeleteTargetId(null)}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}
