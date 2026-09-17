import { useMemo, useState } from 'react';

import {
  BarChart3Icon,
  FlaskConicalIcon,
  TriangleAlertIcon,
} from 'lucide-react';

import {
  Alert,
  Badge,
  Button,
  ConfirmModal,
  Dialog,
  Skeleton,
} from '@/shared/components/ui';

import { useExamReviewAdminStatusPeriods } from '@/domains/Reviews/hooks';
import { sortAdminStatusPeriods } from '@/domains/Reviews/utils';

import { ExamReviewAdminStatusPeriodEditor } from './ExamReviewAdminStatusPeriodEditor';

interface ExamReviewAdminStatusPeriodDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectedPeriodChange: (periodId: number | null) => void;
}

export function ExamReviewAdminStatusPeriodDialog({
  open,
  onOpenChange,
  onSelectedPeriodChange,
}: ExamReviewAdminStatusPeriodDialogProps) {
  const [isEditorDirty, setIsEditorDirty] = useState(false);
  const [isDiscardConfirmOpen, setIsDiscardConfirmOpen] = useState(false);
  const {
    periodsQuery,
    createPeriodMutation,
    updatePeriodMutation,
    deletePeriodMutation,
    isMutating,
  } = useExamReviewAdminStatusPeriods(open);
  const periods = useMemo(
    () => sortAdminStatusPeriods(periodsQuery.data ?? []),
    [periodsQuery.data]
  );

  const closeDialog = () => {
    setIsEditorDirty(false);
    setIsDiscardConfirmOpen(false);
    onOpenChange(false);
  };

  const requestClose = () => {
    if (isMutating) return;

    if (isEditorDirty) {
      setIsDiscardConfirmOpen(true);
      return;
    }

    closeDialog();
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (nextOpen) {
          onOpenChange(true);
          return;
        }

        requestClose();
      }}
    >
      <Dialog.Content className='max-h-[85vh] overflow-y-auto sm:max-w-5xl'>
        <Dialog.Header className='pr-8'>
          <div className='flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between'>
            <div className='flex flex-col gap-2'>
              <div className='flex flex-wrap items-center gap-2'>
                <Dialog.Title>기간 편집</Dialog.Title>
                <Badge variant='secondary'>
                  <FlaskConicalIcon />
                  Mock 데이터
                </Badge>
              </div>
              <Dialog.Description>
                담당 관리자 현황을 조회할 커스텀 기간을 관리합니다.
              </Dialog.Description>
            </div>
            <Button
              type='button'
              variant='outline'
              size='sm'
              onClick={requestClose}
              disabled={isMutating}
            >
              <BarChart3Icon />
              현황 보기
            </Button>
          </div>
        </Dialog.Header>

        {periodsQuery.isPending ? (
          <div className='flex flex-col gap-3'>
            {[0, 1, 2].map((item) => (
              <Skeleton key={item} className='h-14 w-full' />
            ))}
          </div>
        ) : periodsQuery.isError ? (
          <Alert variant='destructive'>
            <TriangleAlertIcon />
            <Alert.Title>기간을 불러오지 못했습니다.</Alert.Title>
            <Alert.Description>
              <Button
                type='button'
                variant='outline'
                size='sm'
                onClick={() => periodsQuery.refetch()}
              >
                다시 시도
              </Button>
            </Alert.Description>
          </Alert>
        ) : (
          <ExamReviewAdminStatusPeriodEditor
            periods={periods}
            isSubmitting={isMutating}
            onCreate={createPeriodMutation.mutateAsync}
            onUpdate={(periodId, input) =>
              updatePeriodMutation.mutateAsync({ periodId, input })
            }
            onDelete={deletePeriodMutation.mutateAsync}
            onSelectPeriod={onSelectedPeriodChange}
            onDirtyChange={setIsEditorDirty}
          />
        )}

        {isDiscardConfirmOpen && (
          <ConfirmModal
            isOpen
            title='저장하지 않은 변경사항이 있습니다.'
            description='변경 내용을 저장하지 않고 현황으로 돌아가시겠습니까?'
            confirmText='변경사항 버리기'
            confirmButtonClassName='bg-destructive text-white hover:bg-destructive/90'
            onConfirm={closeDialog}
            onClose={() => setIsDiscardConfirmOpen(false)}
          />
        )}
      </Dialog.Content>
    </Dialog>
  );
}
