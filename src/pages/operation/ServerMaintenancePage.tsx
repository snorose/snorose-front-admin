import { useState } from 'react';

import { AlertTriangleIcon } from 'lucide-react';
import { toast } from 'sonner';

import { PageHeader } from '@/shared/components';
import { Alert, ConfirmModal } from '@/shared/components/ui';

import { MaintenanceListSection } from '@/domains/Operation/components/MaintenanceListSection';
import {
  type MaintenanceDraft,
  MaintenanceScheduleForm,
} from '@/domains/Operation/components/MaintenanceScheduleForm';
import { createMockMaintenances } from '@/domains/Operation/mocks/maintenance';
import type { ServerMaintenance } from '@/domains/Operation/types/maintenance';

function localDateTime() {
  const now = new Date();
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
  return now.toISOString().slice(0, 16);
}

export default function ServerMaintenancePage() {
  const [items, setItems] = useState(createMockMaintenances);
  const [editing, setEditing] = useState<ServerMaintenance | null>(null);
  const [deleting, setDeleting] = useState<ServerMaintenance | null>(null);

  const save = (draft: MaintenanceDraft) => {
    const timestamp = localDateTime();
    if (editing) {
      setItems((current) =>
        current.map((item) =>
          item.id === editing.id
            ? { ...item, ...draft, updatedAt: timestamp }
            : item
        )
      );
      setEditing(null);
      toast.success('서버 점검 일정이 수정되었습니다.');
      return;
    }
    setItems((current) => [
      {
        ...draft,
        id: Math.max(0, ...current.map((item) => item.id)) + 1,
        createdAt: timestamp,
        updatedAt: timestamp,
      },
      ...current,
    ]);
    toast.success('서버 점검 일정이 등록되었습니다.');
  };

  return (
    <div className='flex w-full min-w-0 flex-col gap-6'>
      <PageHeader
        title='서버 점검 일정 관리'
        description='서버 점검 일정을 등록, 조회, 수정, 삭제할 수 있어요.'
      />
      <Alert className='border-amber-300 bg-amber-50 text-amber-950'>
        <AlertTriangleIcon aria-hidden='true' />
        <Alert.Title>현재 임시 데이터를 표시하고 있습니다.</Alert.Title>
        <Alert.Description className='text-amber-800'>
          실제 데이터는 API 연결 후 제공될 예정이며, 변경 내용은 새로고침하면
          초기화됩니다.
        </Alert.Description>
      </Alert>
      <MaintenanceScheduleForm
        key={editing?.id ?? 'create'}
        initial={editing ?? undefined}
        onSave={save}
        onCancel={() => setEditing(null)}
      />
      <MaintenanceListSection
        items={items}
        onEdit={setEditing}
        onDelete={setDeleting}
      />
      <ConfirmModal
        isOpen={deleting !== null}
        confirmVariant='destructive'
        title='서버 점검 일정을 삭제할까요?'
        description={
          deleting ? `${deleting.title} 일정이 목록에서 제거됩니다.` : undefined
        }
        confirmText='삭제'
        closeText='취소'
        onConfirm={() => {
          if (!deleting) return;
          setItems((current) =>
            current.filter((item) => item.id !== deleting.id)
          );
          if (editing?.id === deleting.id) setEditing(null);
          setDeleting(null);
          toast.success('서버 점검 일정이 삭제되었습니다.');
        }}
        onClose={() => setDeleting(null)}
      />
    </div>
  );
}
