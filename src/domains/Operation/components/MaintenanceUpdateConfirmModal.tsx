import { ConfirmModal, Table } from '@/shared/components/ui';

export interface MaintenanceChange {
  label: string;
  before: string;
  after: string;
}

export function MaintenanceUpdateConfirmModal({
  changes,
  isPending,
  onClose,
  onConfirm,
}: {
  changes: MaintenanceChange[];
  isPending: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) {
  return (
    <ConfirmModal
      isOpen
      title='서버 점검 일정 수정 확인'
      description='아래 항목이 수정됩니다. 저장하시겠습니까?'
      confirmText={isPending ? '저장 중…' : '저장'}
      closeText='취소'
      isPending={isPending}
      onClose={onClose}
      onConfirm={onConfirm}
      className='sm:max-w-3xl'
    >
      <div className='min-w-0 overflow-x-auto rounded-md border'>
        <Table className='w-full table-fixed'>
          <Table.Header>
            <Table.Row>
              <Table.Head className='w-1/4'>항목</Table.Head>
              <Table.Head>수정 전</Table.Head>
              <Table.Head>수정 후</Table.Head>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {changes.map((change) => (
              <Table.Row key={change.label}>
                <Table.Cell className='align-top break-keep whitespace-normal'>
                  {change.label}
                </Table.Cell>
                <Table.Cell className='align-top wrap-anywhere whitespace-pre-wrap'>
                  {change.before || '-'}
                </Table.Cell>
                <Table.Cell className='text-primary align-top wrap-anywhere whitespace-pre-wrap'>
                  {change.after || '-'}
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      </div>
    </ConfirmModal>
  );
}
