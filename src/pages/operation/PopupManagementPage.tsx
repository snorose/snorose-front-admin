import { useMemo, useState } from 'react';

import { Plus, Search } from 'lucide-react';

import { PageHeader } from '@/shared/components';
import { Button, Input } from '@/shared/components/ui';

import {
  PopupEditorDialog,
  PopupManagementTable,
  PopupStatusSummary,
} from '@/domains/Operation/components';
import { MOCK_POPUP_CONTENTS } from '@/domains/Operation/mocks';
import type { PopupContent } from '@/domains/Operation/types';

type PopupStatus = 'active' | 'reserved' | 'ended' | 'disabled';
type PopupEditorMode = 'create' | 'edit';

const EMPTY_POPUP: PopupContent = {
  id: 0,
  title: '',
  bodyMarkdown: '',
  imageUrl: '',
  startDate: '',
  endDate: '',
  isEnabled: true,
  createdAt: '',
  updatedAt: '',
};

function getPopupStatus(popup: PopupContent): PopupStatus {
  if (!popup.isEnabled) {
    return 'disabled';
  }

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
    disabled: '비활성',
  } as const;

  return statusMap[status];
}

function getStatusClassName(status: PopupStatus) {
  const statusClassNameMap = {
    active: 'border-green-200 bg-green-50 text-green-700',
    reserved: 'border-blue-200 bg-blue-50 text-blue-700',
    ended: 'border-gray-200 bg-gray-50 text-gray-600',
    disabled: 'border-red-200 bg-red-50 text-red-700',
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
  const [keyword, setKeyword] = useState('');
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editorMode, setEditorMode] = useState<PopupEditorMode>('create');
  const [editingPopup, setEditingPopup] = useState<PopupContent>(EMPTY_POPUP);

  const filteredPopups = useMemo(() => {
    const normalizedKeyword = keyword.trim().toLowerCase();

    if (!normalizedKeyword) {
      return popups;
    }

    return popups.filter((popup) =>
      popup.title.toLowerCase().includes(normalizedKeyword)
    );
  }, [keyword, popups]);

  const popupStatusItems = useMemo(
    () =>
      (['active', 'reserved', 'ended', 'disabled'] as const).map((status) => ({
        label: getStatusLabel(status),
        value: popups.filter((popup) => getPopupStatus(popup) === status)
          .length,
      })),
    [popups]
  );

  const handleEditorPopupChange = (
    field: keyof PopupContent,
    value: PopupContent[keyof PopupContent]
  ) => {
    setEditingPopup((prevPopup) => ({ ...prevPopup, [field]: value }));
  };

  const handleNewPopupButtonClick = () => {
    setEditorMode('create');
    setEditingPopup(createEmptyPopup());
    setIsEditorOpen(true);
  };

  const handleUpdatePopupButtonClick = (popup: PopupContent) => {
    setEditorMode('edit');
    setEditingPopup({ ...popup });
    setIsEditorOpen(true);
  };

  const handleDeletePopupButtonClick = (id: number) => {
    setPopups((prevPopups) => prevPopups.filter((popup) => popup.id !== id));
  };

  const handleSavePopupButtonClick = () => {
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

    setIsEditorOpen(false);
  };

  return (
    <div className='flex w-full flex-col gap-6'>
      <PageHeader
        title='팝업창 관리'
        description='사용자 홈 화면에 노출되는 공지 팝업 콘텐츠와 노출 기간을 관리할 수 있어요.'
      />

      <PopupStatusSummary items={popupStatusItems} />

      <section className='flex flex-col gap-4 rounded-md border p-4'>
        <div className='flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between'>
          <div className='relative w-full lg:max-w-sm'>
            <Search className='absolute top-1/2 left-3 size-4 -translate-y-1/2 text-gray-400' />
            <Input
              className='pl-9'
              placeholder='팝업명 검색'
              aria-label='팝업명 검색'
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
            />
          </div>
          <div className='flex flex-col gap-2 sm:flex-row'>
            <Button type='button' variant='outline' disabled>
              이전 팝업 보기(준비중)
            </Button>
            <Button
              type='button'
              className='gap-2'
              onClick={handleNewPopupButtonClick}
            >
              <Plus className='size-4' />새 팝업 등록
            </Button>
          </div>
        </div>

        <PopupManagementTable
          popups={filteredPopups}
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
        onOpenChange={setIsEditorOpen}
        onPopupChange={handleEditorPopupChange}
        onSave={handleSavePopupButtonClick}
      />
    </div>
  );
}
