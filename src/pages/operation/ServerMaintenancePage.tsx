import { useState } from 'react';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { NoticePanel, PageHeader } from '@/shared/components';
import { Alert, Button } from '@/shared/components/ui';
import { getErrorMessage } from '@/shared/utils';

import { MaintenanceDeleteModal } from '@/domains/Operation/components/MaintenanceDeleteModal';
import { MaintenanceEditModal } from '@/domains/Operation/components/MaintenanceEditModal';
import { MaintenanceListSection } from '@/domains/Operation/components/MaintenanceListSection';
import {
  type MaintenanceDraft,
  MaintenanceScheduleForm,
} from '@/domains/Operation/components/MaintenanceScheduleForm';
import type { ServerMaintenanceListItem } from '@/domains/Operation/types/maintenance';

import {
  MaintenanceOutcomeUnknownError,
  createAdminMaintenance,
  getAdminMaintenances,
  uploadMaintenanceImage,
} from '@/apis/maintenance';

const MAINTENANCE_QUERY_KEY = ['server-maintenances'];

export default function ServerMaintenancePage() {
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState<ServerMaintenanceListItem>();
  const [deleting, setDeleting] = useState<ServerMaintenanceListItem>();
  const refreshList = () => {
    void queryClient.invalidateQueries({ queryKey: MAINTENANCE_QUERY_KEY });
  };
  const list = useQuery({
    queryKey: MAINTENANCE_QUERY_KEY,
    queryFn: getAdminMaintenances,
  });
  const [upload, setUpload] = useState<{
    id: number;
    url?: string;
    file: File;
  }>();
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [unknownOutcome, setUnknownOutcome] = useState(false);

  const save = async (draft: MaintenanceDraft) => {
    let result;
    try {
      result = await createAdminMaintenance({
        title: draft.title,
        startAt: `${draft.startAt.replace('T', ' ')}:00`,
        endAt: `${draft.endAt.replace('T', ' ')}:00`,
        memo: draft.memo ?? '',
        noticeMessage:
          draft.noticeMessage ??
          '서비스 안정화를 위한 서버 점검이 진행 중입니다.',
        ...(draft.image
          ? {
              attachments: [
                {
                  type: 'PHOTO',
                  fileName: draft.image.name,
                  fileComment: '서버 점검 안내 이미지',
                },
              ],
            }
          : {}),
      });
    } catch (error) {
      if (error instanceof MaintenanceOutcomeUnknownError) {
        setUnknownOutcome(true);
        return;
      }
      throw error;
    }
    void queryClient.invalidateQueries({ queryKey: MAINTENANCE_QUERY_KEY });
    if (draft.image) {
      const pending = {
        id: result.id,
        url: result.attachmentUrlList?.[0],
        file: draft.image,
      };
      setUpload(pending);
      try {
        if (!pending.url)
          throw new Error('이미지 업로드 주소가 응답에 없습니다.');
        await uploadMaintenanceImage(pending.url, pending.file);
        setUpload(undefined);
      } catch (error) {
        setUploadError(getErrorMessage(error, '이미지 업로드에 실패했습니다.'));
        return;
      }
    }
    toast.success(`서버 점검 일정이 등록되었습니다. (번호: ${result.id})`);
  };

  return (
    <div className='flex w-full min-w-0 flex-col gap-6'>
      <PageHeader
        title='서버 점검 일정 관리'
        description='서버 점검 일정을 생성하고 조회·수정·삭제할 수 있어요.'
      />
      <NoticePanel
        items={[
          '서버 점검 일정은 시작 일시에 자동 노출되고 종료 일시에 자동 해제됩니다.',
          '진행 중 일정은 삭제할 수 없으며, 필요 시 종료 일시를 앞당겨 조기 종료할 수 있습니다.',
          '종료 일시는 시작 일시보다 이후여야 하며, 현재 시각보다 이전으로 설정할 수 없습니다.',
          '중복된 서버 점검 일정은 생성할 수 없습니다.',
        ]}
      />
      {unknownOutcome ? (
        <Alert variant='destructive'>
          <Alert.Title>등록 결과를 확인할 수 없습니다.</Alert.Title>
          <Alert.Description>
            중복 등록을 방지하기 위해 추가 등록을 중단했습니다. 관리자에게 등록
            여부를 확인해 주세요.
          </Alert.Description>
        </Alert>
      ) : upload ? (
        <Alert>
          <Alert.Title>
            일정은 등록되었지만 이미지 업로드가 완료되지 않았습니다. (번호:{' '}
            {upload.id})
          </Alert.Title>
          <Alert.Description>
            <p role='alert'>{uploadError || '이미지를 업로드하고 있습니다.'}</p>
            {uploadError &&
              (upload.url ? (
                <Button
                  size='sm'
                  disabled={uploading}
                  onClick={async () => {
                    if (uploading) return;
                    setUploading(true);
                    try {
                      await uploadMaintenanceImage(upload.url!, upload.file);
                      setUpload(undefined);
                      setUploadError('');
                      toast.success(
                        '서버 점검 안내 이미지가 업로드되었습니다.'
                      );
                    } catch (error) {
                      setUploadError(
                        getErrorMessage(error, '이미지 업로드에 실패했습니다.')
                      );
                    } finally {
                      setUploading(false);
                    }
                  }}
                >
                  {uploading ? '업로드 중…' : '이미지 업로드 재시도'}
                </Button>
              ) : (
                <p>관리자에게 이미지 업로드 주소를 확인해 주세요.</p>
              ))}
          </Alert.Description>
        </Alert>
      ) : (
        <MaintenanceScheduleForm onSave={save} />
      )}
      <MaintenanceListSection
        items={list.data ?? []}
        onEdit={setEditing}
        onDelete={setDeleting}
        isLoading={list.isPending}
        isFetching={list.isFetching}
        errorMessage={
          list.isError
            ? getErrorMessage(list.error, '서버 점검 일정 조회에 실패했습니다.')
            : undefined
        }
        onRetry={() => {
          void list.refetch();
        }}
      />
      {editing && (
        <MaintenanceEditModal
          key={editing.id}
          item={editing}
          onClose={() => setEditing(undefined)}
          onChanged={refreshList}
        />
      )}
      {deleting && (
        <MaintenanceDeleteModal
          key={deleting.id}
          item={deleting}
          onClose={() => setDeleting(undefined)}
          onChanged={refreshList}
        />
      )}
    </div>
  );
}
