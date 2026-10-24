import { useEffect, useState } from 'react';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';

import { NoticePanel, PageHeader, PaginationBar } from '@/shared/components';
import { Alert, Button, ConfirmModal } from '@/shared/components/ui';
import { getErrorMessage } from '@/shared/utils';

import {
  PopupEditorDialog,
  PopupManagementTable,
} from '@/domains/Operation/components';
import type { PopupContent } from '@/domains/Operation/types';
import type {
  CreatePopupRequest,
  PopupDetail,
  PopupStatus,
  PopupSummary,
  UpdatePopupRequest,
} from '@/domains/Operation/types/popup';
import { validatePopupContent } from '@/domains/Operation/utils';
import { validatePopupImage } from '@/domains/Operation/utils/validate-popup';

import {
  createPopup,
  deletePopup,
  getPopupDetail,
  getPopups,
  updatePopup,
} from '@/apis/popups';

const EMPTY_POPUP: PopupContent = {
  id: 0,
  title: '',
  bodyMarkdown: '',
  imageFileName: '',
  startDate: '',
  endDate: '',
  displayPriority: 0,
  createdAt: '',
  updatedAt: '',
};
const STATUS_LABELS: Record<PopupStatus, string> = {
  ACTIVE: '진행중',
  SCHEDULED: '예약',
  ENDED: '종료',
};
const STATUS_CLASSES: Record<PopupStatus, string> = {
  ACTIVE: 'border-green-200 bg-green-50 text-green-700',
  SCHEDULED: 'border-blue-200 bg-blue-50 text-blue-700',
  ENDED: 'border-gray-200 bg-gray-50 text-gray-600',
};

export default function PopupManagementPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(0);
  const list = useQuery({
    queryKey: ['popups', page],
    queryFn: () => getPopups(page),
  });
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isSaveConfirmOpen, setIsSaveConfirmOpen] = useState(false);
  const [deletingPopupId, setDeletingPopupId] = useState<number | null>(null);
  const [originalPopup, setOriginalPopup] = useState<PopupDetail | null>(null);
  const [editingPopup, setEditingPopup] = useState<PopupContent>(EMPTY_POPUP);
  const [imageFile, setImageFile] = useState<File>();
  const [imagePreviewUrl, setImagePreviewUrl] = useState('');
  const editorMode = originalPopup ? 'edit' : 'create';
  const maxDisplayOrder = Math.max(
    0,
    (list.data?.totalCount ?? 0) - (originalPopup ? 1 : 0)
  );

  useEffect(
    () => () => {
      if (imagePreviewUrl.startsWith('blob:'))
        URL.revokeObjectURL(imagePreviewUrl);
    },
    [imagePreviewUrl]
  );

  const detail = useMutation({
    mutationFn: (id: number) => getPopupDetail(id),
    onSuccess: (popup) => {
      setOriginalPopup(popup);
      setEditingPopup({
        id: popup.id,
        title: popup.title,
        bodyMarkdown: popup.description ?? '',
        imageFileName: popup.imageUrl ? '기존 이미지' : '',
        startDate: popup.startDate,
        endDate: popup.endDate,
        displayPriority: popup.displayOrder,
        createdAt: popup.createdAt,
        updatedAt: popup.updatedAt ?? '',
      });
      setImageFile(undefined);
      setImagePreviewUrl(popup.imageUrl ?? '');
      setIsEditorOpen(true);
    },
    onError: (error) =>
      toast.error(
        getErrorMessage(error, '팝업 상세 정보를 불러오지 못했습니다.')
      ),
  });

  const save = useMutation({
    mutationFn: async () => {
      const request: CreatePopupRequest = {
        title: editingPopup.title.trim(),
        description: editingPopup.bodyMarkdown || null,
        startDate: editingPopup.startDate,
        endDate: editingPopup.endDate,
        displayOrder: editingPopup.displayPriority,
      };
      if (!originalPopup) return createPopup(request, imageFile);
      const changes: UpdatePopupRequest = {};
      if (request.title !== originalPopup.title) changes.title = request.title;
      if (request.description !== originalPopup.description)
        changes.description = request.description;
      if (request.startDate !== originalPopup.startDate)
        changes.startDate = request.startDate;
      if (request.endDate !== originalPopup.endDate)
        changes.endDate = request.endDate;
      if (request.displayOrder !== originalPopup.displayOrder)
        changes.displayOrder = request.displayOrder;
      if (originalPopup.imageUrl && !imagePreviewUrl && !imageFile)
        changes.removeImage = true;
      return updatePopup(originalPopup.id, changes, imageFile);
    },
    onSuccess: async () => {
      toast.success(
        originalPopup ? '팝업이 수정되었습니다.' : '팝업이 등록되었습니다.'
      );
      setIsSaveConfirmOpen(false);
      setIsEditorOpen(false);
      setImageFile(undefined);
      setImagePreviewUrl('');
      if (!originalPopup) setPage(0);
      await queryClient.invalidateQueries({ queryKey: ['popups'] });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, '팝업을 저장하지 못했습니다.'));
      setIsSaveConfirmOpen(false);
    },
  });

  const remove = useMutation({
    mutationFn: (id: number) => deletePopup(id),
    onSuccess: async () => {
      toast.success('팝업이 삭제되었습니다.');
      setDeletingPopupId(null);
      if (page > 0 && list.data?.data.length === 1) setPage(page - 1);
      await queryClient.invalidateQueries({ queryKey: ['popups'] });
    },
    onError: (error) =>
      toast.error(getErrorMessage(error, '팝업을 삭제하지 못했습니다.')),
  });
  const busy = detail.isPending || save.isPending || remove.isPending;

  const handleEditorOpenChange = (open: boolean) => {
    if (save.isPending) return;
    setIsEditorOpen(open);
    if (!open) {
      setIsSaveConfirmOpen(false);
      setImageFile(undefined);
      setImagePreviewUrl('');
    }
  };
  const handlePopupChange = (
    field: keyof PopupContent,
    value: PopupContent[keyof PopupContent]
  ) => {
    setEditingPopup((previous) => ({ ...previous, [field]: value }));
  };
  const handleImageAttach = (file: File) => {
    const message = validatePopupImage(file);
    if (message) {
      toast.error(message);
      return;
    }
    setImageFile(file);
    setImagePreviewUrl(URL.createObjectURL(file));
    handlePopupChange('imageFileName', file.name);
  };
  const handleSave = () => {
    const message = validatePopupContent(editingPopup, maxDisplayOrder);
    if (message) {
      toast.error(message);
      return;
    }
    setIsSaveConfirmOpen(true);
  };

  return (
    <div className='flex w-full flex-col gap-6'>
      <PageHeader
        title='팝업창 관리'
        description='사용자 홈 화면에 노출되는 공지 팝업 콘텐츠와 노출 기간을 관리할 수 있어요.'
      />
      <NoticePanel
        items={[
          <>
            <strong>게시 기간:</strong> 한국 시간(KST) 기준으로 시작일과
            종료일을 포함해 날짜 단위로 노출됩니다.
          </>,
          <>
            <strong>노출 순서:</strong> 0부터 시작하며 작은 숫자부터 표시됩니다.
            등록·이동·삭제 시 다른 팝업의 순서도 조정됩니다. 관리자 목록은 최신
            등록순입니다.
          </>,
          <>
            <strong>본문 서식:</strong> 마크다운으로 굵은 글씨, 목록,
            [링크명](URL)을 입력하고 미리 볼 수 있습니다.
          </>,
        ]}
      />
      <section
        className='flex flex-col gap-4'
        aria-busy={list.isFetching || busy}
      >
        <div className='flex flex-wrap items-center gap-3'>
          <Button
            type='button'
            className='gap-2'
            disabled={busy || list.isFetching || list.isError || !list.data}
            onClick={() => {
              setOriginalPopup(null);
              setEditingPopup({
                ...EMPTY_POPUP,
                displayPriority: list.data?.totalCount ?? 0,
              });
              setImageFile(undefined);
              setImagePreviewUrl('');
              setIsEditorOpen(true);
            }}
          >
            <Plus className='size-4' />새 팝업 등록
          </Button>
          {detail.isPending && (
            <span role='status' className='text-muted-foreground text-sm'>
              팝업 정보를 불러오는 중입니다.
            </span>
          )}
        </div>
        {list.isPending ? (
          <p role='status' className='py-12 text-center'>
            팝업 목록을 불러오는 중입니다.
          </p>
        ) : list.isError ? (
          <Alert variant='destructive'>
            <Alert.Title>팝업 목록을 불러오지 못했습니다.</Alert.Title>
            <Alert.Description>
              {getErrorMessage(list.error)}
              <Button
                type='button'
                variant='outline'
                disabled={list.isFetching}
                onClick={() => void list.refetch()}
              >
                다시 시도
              </Button>
            </Alert.Description>
          </Alert>
        ) : (
          <>
            <PopupManagementTable
              popups={list.data.data}
              getStatusLabel={(popup) => STATUS_LABELS[popup.status]}
              getStatusClassName={(popup) => STATUS_CLASSES[popup.status]}
              onUpdate={(popup: PopupSummary) => detail.mutate(popup.id)}
              onDelete={setDeletingPopupId}
              disabled={busy || list.isFetching}
            />
            {list.data.totalPage > 0 && (
              <PaginationBar
                currentPage={page + 1}
                totalPage={list.data.totalPage}
                onPageChange={(nextPage) => {
                  if (!busy) setPage(nextPage - 1);
                }}
              />
            )}
          </>
        )}
      </section>
      {isEditorOpen && (
        <PopupEditorDialog
          open={isEditorOpen}
          mode={editorMode}
          popup={editingPopup}
          imagePreviewUrl={imagePreviewUrl}
          maxDisplayOrder={maxDisplayOrder}
          disabled={save.isPending || isSaveConfirmOpen}
          onOpenChange={handleEditorOpenChange}
          onPopupChange={handlePopupChange}
          onImageAttach={handleImageAttach}
          onImageRemove={() => {
            setImageFile(undefined);
            setImagePreviewUrl('');
            handlePopupChange('imageFileName', '');
          }}
          onSave={handleSave}
        />
      )}
      <ConfirmModal
        isOpen={isSaveConfirmOpen}
        title={
          editorMode === 'create' ? '팝업을 등록할까요?' : '팝업을 수정할까요?'
        }
        description='입력한 내용으로 저장합니다.'
        confirmText={
          save.isPending
            ? '저장 중…'
            : editorMode === 'create'
              ? '등록'
              : '수정'
        }
        confirmDisabled={save.isPending}
        closeText='취소'
        onConfirm={() => {
          if (!save.isPending) save.mutate();
        }}
        onClose={() => {
          if (!save.isPending) setIsSaveConfirmOpen(false);
        }}
      />
      <ConfirmModal
        isOpen={deletingPopupId !== null}
        confirmVariant='destructive'
        title='팝업을 삭제할까요?'
        description='삭제한 팝업은 목록에서 제거됩니다.'
        confirmText={remove.isPending ? '삭제 중…' : '삭제'}
        confirmDisabled={remove.isPending}
        closeText='취소'
        onConfirm={() => {
          if (deletingPopupId !== null && !remove.isPending)
            remove.mutate(deletingPopupId);
        }}
        onClose={() => {
          if (!remove.isPending) setDeletingPopupId(null);
        }}
      />
    </div>
  );
}
