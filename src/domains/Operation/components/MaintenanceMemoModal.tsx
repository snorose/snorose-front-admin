import { DescriptionList } from '@/shared/components';
import { Button, Dialog } from '@/shared/components/ui';

import { MaintenanceDetailLoader } from './MaintenanceDetailLoader';

export function MaintenanceMemoModal({
  id,
  onClose,
}: {
  id: number;
  onClose: () => void;
}) {
  return (
    <MaintenanceDetailLoader id={id} title='관리자 메모 조회' onClose={onClose}>
      {(detail) => (
        <Dialog
          open
          onOpenChange={(open) => {
            if (!open) onClose();
          }}
        >
          <Dialog.Content
            className='max-h-[90dvh] min-w-0 overflow-y-auto sm:max-w-lg'
            aria-describedby={undefined}
          >
            <Dialog.Header>
              <Dialog.Title>관리자 메모 조회</Dialog.Title>
            </Dialog.Header>
            <DescriptionList
              items={[
                { label: '관리용 일정 제목', value: detail.title },
                {
                  label: '관리자 메모',
                  value: detail.memo?.trim()
                    ? detail.memo
                    : '등록된 메모가 없습니다.',
                },
              ]}
            />
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
