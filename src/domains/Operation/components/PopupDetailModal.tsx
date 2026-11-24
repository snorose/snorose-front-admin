import { useQuery } from '@tanstack/react-query';

import { DescriptionList } from '@/shared/components';
import { Button, Dialog } from '@/shared/components/ui';
import { formatDateTimeToMinutes, getErrorMessage } from '@/shared/utils';

import { getPopupDetail } from '@/apis/popups';

import { MarkdownPreview } from './MarkdownPreview';

export function PopupDetailModal({
  id,
  onClose,
}: {
  id: number;
  onClose: () => void;
}) {
  const query = useQuery({
    queryKey: ['popups', 'detail', id],
    queryFn: () => getPopupDetail(id),
    retry: false,
    refetchOnMount: 'always',
  });
  const detail = query.data;

  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <Dialog.Content className='max-h-[90dvh] overflow-y-auto sm:max-w-lg'>
        <Dialog.Header>
          <Dialog.Title>팝업 상세</Dialog.Title>
          <Dialog.Description>
            등록된 팝업과 게시 정보를 확인합니다.
          </Dialog.Description>
        </Dialog.Header>
        {query.isPending ? (
          <p role='status'>팝업 정보를 불러오는 중입니다.</p>
        ) : query.isError ? (
          <div role='alert' className='flex flex-col gap-3'>
            <p>
              {getErrorMessage(
                query.error,
                '팝업 상세 정보를 불러오지 못했습니다.'
              )}
            </p>
            <Button
              type='button'
              variant='outline'
              disabled={query.isFetching}
              onClick={() => void query.refetch()}
            >
              다시 시도
            </Button>
          </div>
        ) : detail ? (
          <>
            <DescriptionList
              items={[
                { label: '팝업 ID', value: detail.id },
                { label: '팝업 제목', value: detail.title },
                {
                  label: '상태',
                  value: { SCHEDULED: '예약', ACTIVE: '진행중', ENDED: '종료' }[
                    detail.status
                  ],
                },
                { label: '노출 순번', value: detail.displayOrder },
                { label: '게시 시작일', value: detail.startDate },
                { label: '게시 종료일', value: detail.endDate },
                {
                  label: '생성일시',
                  value: formatDateTimeToMinutes(detail.createdAt),
                },
                {
                  label: '수정일시',
                  value: formatDateTimeToMinutes(detail.updatedAt),
                },
              ]}
            />
            <dl className='flex min-w-0 flex-col gap-2.5 text-sm'>
              <dt className='font-medium text-gray-700'>본문 내용</dt>
              <dd>
                {detail.description ? (
                  <MarkdownPreview markdown={detail.description} />
                ) : (
                  '없음'
                )}
              </dd>
              <dt className='font-medium text-gray-700'>팝업 이미지</dt>
              <dd>
                {detail.imageUrl ? (
                  <img
                    src={detail.imageUrl}
                    alt='팝업 이미지'
                    className='h-auto max-h-48 w-auto max-w-full rounded-md border object-contain'
                  />
                ) : (
                  '첨부 이미지 없음'
                )}
              </dd>
            </dl>
          </>
        ) : null}
        <Dialog.Footer>
          <Button type='button' variant='outline' onClick={onClose}>
            닫기
          </Button>
        </Dialog.Footer>
      </Dialog.Content>
    </Dialog>
  );
}
