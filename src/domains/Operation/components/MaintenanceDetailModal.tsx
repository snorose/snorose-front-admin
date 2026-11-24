import { DescriptionList } from '@/shared/components';
import { Button, Dialog } from '@/shared/components/ui';
import { formatDateTimeToMinutes } from '@/shared/utils';

import { MaintenanceDetailLoader } from './MaintenanceDetailLoader';

export function MaintenanceDetailModal({
  id,
  onClose,
}: {
  id: number;
  onClose: () => void;
}) {
  return (
    <MaintenanceDetailLoader
      id={id}
      title='서버 점검 일정 상세'
      onClose={onClose}
    >
      {(detail) => (
        <Dialog
          open
          onOpenChange={(open) => {
            if (!open) onClose();
          }}
        >
          <Dialog.Content className='max-h-[90dvh] overflow-y-auto sm:max-w-lg'>
            <Dialog.Header>
              <Dialog.Title>서버 점검 일정 상세</Dialog.Title>
              <Dialog.Description>
                등록된 점검 일정과 사용자 안내 정보를 확인합니다.
              </Dialog.Description>
            </Dialog.Header>
            <DescriptionList
              items={[
                { label: '관리용 일정 제목', value: detail.title },
                {
                  label: '시작 일시',
                  value: formatDateTimeToMinutes(detail.startAt),
                },
                {
                  label: '종료 일시',
                  value: formatDateTimeToMinutes(detail.endAt),
                },
                {
                  label: '사용자 안내 문구',
                  value: detail.noticeMessage || '없음',
                },
                { label: '관리자 메모', value: detail.memo || '없음' },
              ]}
            />
            <dl className='flex min-w-0 flex-col gap-2.5 text-sm'>
              <dt className='font-medium text-gray-700'>사용자 안내 이미지</dt>
              <dd className='text-foreground min-w-0'>
                {detail.imageUrl ? (
                  <img
                    src={detail.imageUrl}
                    alt='사용자 안내 이미지'
                    className='h-auto max-h-48 w-auto max-w-full rounded-md border border-gray-200 object-contain'
                  />
                ) : (
                  '첨부 이미지 없음 (기본 이미지 표시)'
                )}
              </dd>
            </dl>
            <Dialog.Footer>
              <Button type='button' variant='outline' onClick={onClose}>
                닫기
              </Button>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog>
      )}
    </MaintenanceDetailLoader>
  );
}
