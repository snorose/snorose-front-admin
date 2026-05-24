import { useState } from 'react';

import { Eye, Plus } from 'lucide-react';
import { toast } from 'sonner';

import { PageHeader } from '@/shared/components';
import { Button, ConfirmModal } from '@/shared/components/ui';

import {
  PopupEditorDialog,
  PopupManagementTable,
} from '@/domains/Operation/components';
import { MOCK_POPUP_CONTENTS } from '@/domains/Operation/mocks';
import type { PopupContent } from '@/domains/Operation/types';
import { validatePopupContent } from '@/domains/Operation/utils';

type PopupStatus = 'active' | 'reserved' | 'ended';
type PopupEditorMode = 'create' | 'edit';

const EMPTY_POPUP: PopupContent = {
  id: 0,
  title: '',
  bodyMarkdown: '',
  imageFileName: '',
  startDate: '',
  endDate: '',
  createdAt: '',
  updatedAt: '',
};

function getPopupStatus(popup: PopupContent): PopupStatus {
  const today = new Date();
  const startDate = new Date(`${popup.startDate}T00:00:00`);
  const endDate = new Date(`${popup.endDate}T23:59:59`);

  if (today < startDate) {
    return 'reserved';
  }

  if (today > endDate) {
    return 'ended';
  }

  return 'active';
}

function getStatusLabel(status: PopupStatus) {
  const statusMap = {
    active: '진행 중',
    reserved: '예약',
    ended: '종료',
  } as const;

  return statusMap[status];
}

function getStatusClassName(status: PopupStatus) {
  const statusClassNameMap = {
    active: 'border-green-200 bg-green-50 text-green-700',
    reserved: 'border-blue-200 bg-blue-50 text-blue-700',
    ended: 'border-gray-200 bg-gray-50 text-gray-600',
  } as const;

  return statusClassNameMap[status];
}

function createEmptyPopup() {
  return {
    ...EMPTY_POPUP,
    id: Date.now(),
  };
}

function getCurrentDateTimeString() {
  const now = new Date();
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset());

  return now.toISOString().slice(0, 16).replace('T', ' ');
}

export default function PopupManagementPage() {
  const [popups, setPopups] = useState(MOCK_POPUP_CONTENTS);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isSaveConfirmOpen, setIsSaveConfirmOpen] = useState(false);
  const [editorMode, setEditorMode] = useState<PopupEditorMode>('create');
  const [editingPopup, setEditingPopup] = useState<PopupContent>(EMPTY_POPUP);
  const [editingImagePreviewUrl, setEditingImagePreviewUrl] = useState('');

  const handleEditorPopupChange = (
    field: keyof PopupContent,
    value: PopupContent[keyof PopupContent]
  ) => {
    setEditingPopup((prevPopup) => ({ ...prevPopup, [field]: value }));
  };

  const handleImageAttach = (file: File) => {
    const imagePreviewUrl = URL.createObjectURL(file);

    setEditingImagePreviewUrl((prevUrl) => {
      if (prevUrl) {
        URL.revokeObjectURL(prevUrl);
      }

      return imagePreviewUrl;
    });
    handleEditorPopupChange('imageFileName', file.name);
  };

  const handleImageRemove = () => {
    setEditingImagePreviewUrl((prevUrl) => {
      if (prevUrl) {
        URL.revokeObjectURL(prevUrl);
      }

      return '';
    });
    handleEditorPopupChange('imageFileName', '');
  };

  const handleEditorOpenChange = (open: boolean) => {
    setIsEditorOpen(open);

    if (!open) {
      setEditingImagePreviewUrl((prevUrl) => {
        if (prevUrl) {
          URL.revokeObjectURL(prevUrl);
        }

        return '';
      });
    }
  };

  const handleNewPopupButtonClick = () => {
    setEditorMode('create');
    setEditingPopup(createEmptyPopup());
    setEditingImagePreviewUrl('');
    setIsEditorOpen(true);
  };

  const handleUpdatePopupButtonClick = (popup: PopupContent) => {
    setEditorMode('edit');
    setEditingPopup({ ...popup });
    setEditingImagePreviewUrl('');
    setIsEditorOpen(true);
  };

  const handleDeletePopupButtonClick = (id: number) => {
    setPopups((prevPopups) => prevPopups.filter((popup) => popup.id !== id));
  };

  const handleSavePopupButtonClick = () => {
    const validationMessage = validatePopupContent(editingPopup);

    if (validationMessage) {
      toast.error(validationMessage);
      return;
    }

    setIsSaveConfirmOpen(true);
  };

  const handleSaveConfirmButtonClick = () => {
    const currentDateTime = getCurrentDateTimeString();
    const savedPopup = {
      ...editingPopup,
      createdAt:
        editorMode === 'create' ? currentDateTime : editingPopup.createdAt,
      updatedAt: currentDateTime,
    };

    if (editorMode === 'create') {
      setPopups((prevPopups) => [savedPopup, ...prevPopups]);
    } else {
      setPopups((prevPopups) =>
        prevPopups.map((popup) =>
          popup.id === savedPopup.id ? savedPopup : popup
        )
      );
    }

    setIsSaveConfirmOpen(false);
    handleEditorOpenChange(false);
  };

  const handlePreviewPopupButtonClick = () => {
    console.log('특정 날짜 기준으로 팝업 보기');
  };

  return (
    <div className='flex w-full flex-col gap-6'>
      <PageHeader
        title='팝업창 관리'
        description='사용자 홈 화면에 노출되는 공지 팝업 콘텐츠와 노출 기간을 관리할 수 있어요.'
      />

      <section className='flex flex-col gap-4'>
        <div className='flex gap-2'>
          <Button
            type='button'
            className='gap-2'
            onClick={handleNewPopupButtonClick}
          >
            <Plus className='size-4' />새 팝업 등록
          </Button>
          <Button
            type='button'
            variant='outline'
            className='gap-2'
            onClick={handlePreviewPopupButtonClick}
          >
            <Eye className='size-4' />
            특정 날짜 기준으로 팝업 보기
          </Button>
        </div>

        <PopupManagementTable
          popups={popups}
          getStatusLabel={(popup) => getStatusLabel(getPopupStatus(popup))}
          getStatusClassName={(popup) =>
            getStatusClassName(getPopupStatus(popup))
          }
          onUpdate={handleUpdatePopupButtonClick}
          onDelete={handleDeletePopupButtonClick}
        />
      </section>

      <PopupEditorDialog
        open={isEditorOpen}
        mode={editorMode}
        popup={editingPopup}
        imagePreviewUrl={editingImagePreviewUrl}
        onOpenChange={handleEditorOpenChange}
        onPopupChange={handleEditorPopupChange}
        onImageAttach={handleImageAttach}
        onImageRemove={handleImageRemove}
        onSave={handleSavePopupButtonClick}
      />

      <ConfirmModal
        isOpen={isSaveConfirmOpen}
        title={
          editorMode === 'create' ? '팝업을 등록할까요?' : '팝업을 수정할까요?'
        }
        description='입력한 내용으로 저장합니다.'
        confirmText={editorMode === 'create' ? '등록' : '수정'}
        closeText='취소'
        onConfirm={handleSaveConfirmButtonClick}
        onClose={() => setIsSaveConfirmOpen(false)}
      />
    </div>
  );
}
