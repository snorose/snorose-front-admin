import { useRef, useState } from 'react';

import { PencilIcon, PlusIcon, Trash2Icon } from 'lucide-react';
import { toast } from 'sonner';

import { Button, ConfirmModal } from '@/shared/components/ui';
import { formatDateTimeToMinutes, getErrorMessage } from '@/shared/utils';

import type {
  ExamReviewAdminStatusPeriod,
  ExamReviewAdminStatusPeriodInput,
} from '@/domains/Reviews/types';

import { ExamReviewAdminStatusPeriodFormModal } from './ExamReviewAdminStatusPeriodFormModal';

type EditorState =
  | { type: 'create' }
  | { type: 'update'; period: ExamReviewAdminStatusPeriod }
  | null;

interface ExamReviewAdminStatusPeriodListProps {
  periods: ExamReviewAdminStatusPeriod[];
  isSubmitting: boolean;
  onCreate: (
    input: ExamReviewAdminStatusPeriodInput
  ) => Promise<ExamReviewAdminStatusPeriod>;
  onUpdate: (
    periodId: number,
    input: ExamReviewAdminStatusPeriodInput
  ) => Promise<ExamReviewAdminStatusPeriod>;
  onDelete: (periodId: number) => Promise<number>;
  onSelectPeriod: (periodId: number) => void;
  onDirtyChange: (isDirty: boolean) => void;
}

export function ExamReviewAdminStatusPeriodList({
  periods,
  isSubmitting,
  onCreate,
  onUpdate,
  onDelete,
  onSelectPeriod,
  onDirtyChange,
}: ExamReviewAdminStatusPeriodListProps) {
  const [editor, setEditor] = useState<EditorState>(null);
  const editorTriggerRef = useRef<HTMLButtonElement | null>(null);
  const [deleteTarget, setDeleteTarget] =
    useState<ExamReviewAdminStatusPeriod | null>(null);

  const closeEditor = () => setEditor(null);

  const handleCreate = async (input: ExamReviewAdminStatusPeriodInput) => {
    const createdPeriod = await onCreate(input);
    onSelectPeriod(createdPeriod.id);
    closeEditor();
    toast.success('현황 집계 기간을 추가했습니다.');
  };

  const handleUpdate = async (
    periodId: number,
    input: ExamReviewAdminStatusPeriodInput
  ) => {
    await onUpdate(periodId, input);
    onSelectPeriod(periodId);
    closeEditor();
    toast.success('현황 집계 기간을 수정했습니다.');
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;

    try {
      await onDelete(deleteTarget.id);
      setDeleteTarget(null);
      toast.success('현황 집계 기간을 삭제했습니다.');
    } catch (error: unknown) {
      toast.error(
        getErrorMessage(error, '기간을 삭제하는 중 오류가 발생했습니다.')
      );
    }
  };

  return (
    <section className='flex flex-col gap-4'>
      <div className='overflow-hidden rounded-lg border'>
        <div className='bg-muted/50 hidden grid-cols-[minmax(0,1.4fr)_1fr_1fr_auto] gap-4 border-b px-4 py-2 text-sm font-semibold md:grid'>
          <span>기간 이름</span>
          <span>시작 일시</span>
          <span>종료 일시</span>
          <span className='w-20 text-center'>관리</span>
        </div>

        <div className='divide-y'>
          {periods.length === 0 && (
            <div className='text-muted-foreground px-4 py-10 text-center text-sm'>
              등록된 현황 집계 기간이 없습니다.
            </div>
          )}

          {periods.map((period) => (
            <div
              key={period.id}
              className='grid gap-2 px-4 py-3 md:grid-cols-[minmax(0,1.4fr)_1fr_1fr_auto] md:items-center md:gap-4'
            >
              <strong className='truncate text-sm'>{period.title}</strong>
              <div className='text-muted-foreground text-sm'>
                <span className='mr-2 font-medium md:hidden'>시작</span>
                {formatDateTimeToMinutes(period.startAt)}
              </div>
              <div className='text-muted-foreground text-sm'>
                <span className='mr-2 font-medium md:hidden'>종료</span>
                {formatDateTimeToMinutes(period.endAt)}
              </div>
              <div className='flex justify-end gap-1'>
                <Button
                  type='button'
                  variant='ghost'
                  size='icon-sm'
                  aria-label={`${period.title} 수정`}
                  onClick={(event) => {
                    editorTriggerRef.current = event.currentTarget;
                    setEditor({ type: 'update', period });
                  }}
                  disabled={Boolean(editor) || isSubmitting}
                >
                  <PencilIcon />
                </Button>
                <Button
                  type='button'
                  variant='ghost'
                  size='icon-sm'
                  className='text-destructive hover:text-destructive'
                  aria-label={`${period.title} 삭제`}
                  onClick={() => setDeleteTarget(period)}
                  disabled={Boolean(editor) || isSubmitting}
                >
                  <Trash2Icon />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Button
        type='button'
        variant='outline'
        className='self-start'
        onClick={(event) => {
          editorTriggerRef.current = event.currentTarget;
          setEditor({ type: 'create' });
        }}
        disabled={Boolean(editor) || isSubmitting}
      >
        <PlusIcon />
        기간 추가
      </Button>

      <ExamReviewAdminStatusPeriodFormModal
        open={Boolean(editor)}
        period={editor?.type === 'update' ? editor.period : undefined}
        periods={periods}
        isSubmitting={isSubmitting}
        onSubmit={
          editor?.type === 'update'
            ? (input) => handleUpdate(editor.period.id, input)
            : handleCreate
        }
        onOpenChange={(open) => {
          if (!open) closeEditor();
        }}
        onDirtyChange={onDirtyChange}
        onAfterClose={() => editorTriggerRef.current?.focus()}
      />

      {deleteTarget && (
        <ConfirmModal
          isOpen
          title='현황 집계 기간 삭제'
          description='이 기간 설정만 삭제되며 시험후기 원본과 확인 이력은 유지됩니다.'
          confirmText='삭제'
          confirmVariant='destructive'
          confirmDisabled={isSubmitting}
          onConfirm={handleDelete}
          onClose={() => setDeleteTarget(null)}
        >
          <div className='bg-muted/50 rounded-md p-3 text-sm'>
            <p className='font-semibold'>{deleteTarget.title}</p>
            <p className='text-muted-foreground mt-1'>
              {formatDateTimeToMinutes(deleteTarget.startAt)} ~{' '}
              {formatDateTimeToMinutes(deleteTarget.endAt)}
            </p>
          </div>
        </ConfirmModal>
      )}
    </section>
  );
}
