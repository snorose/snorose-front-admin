import { useState } from 'react';

import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react';

import { SectionTitleWithCount, TableStateRow } from '@/shared/components';
import {
  Badge,
  Button,
  Dialog,
  DropdownMenu,
  Input,
  Label,
  Table,
} from '@/shared/components/ui';

type SendStatus = '예약' | '성공' | '일부 실패' | '예약 취소';
type SendTarget = '전체 회원' | '관리자' | '일부 회원';

interface NotificationHistory {
  id: number;
  status: SendStatus;
  requestedAt: string;
  target: SendTarget;
  name: string;
  category: '광고성' | '정보성';
  memberCount: number | null;
  admin: string;
}

// 목록 API 연동 전 화면 확인용 데이터입니다.
const MOCK_NOTIFICATIONS: NotificationHistory[] = [
  {
    id: 5,
    status: '예약',
    requestedAt: '2026-08-13 16:00',
    target: '전체 회원',
    name: '2026.08.15 광복절 기념 이벤트 안내',
    category: '광고성',
    memberCount: null,
    admin: 'admin_kim',
  },
  {
    id: 4,
    status: '성공',
    requestedAt: '2026-08-13 14:32',
    target: '전체 회원',
    name: '2026.08.13 정기 모임 알림',
    category: '정보성',
    memberCount: null,
    admin: 'snorose_admin',
  },
  {
    id: 3,
    status: '일부 실패',
    requestedAt: '2026-08-11 16:48',
    target: '전체 회원',
    name: '2026.08.11 시스템 점검 공지',
    category: '정보성',
    memberCount: null,
    admin: 'snorose_admin',
  },
  {
    id: 2,
    status: '성공',
    requestedAt: '2026-08-10 09:20',
    target: '관리자',
    name: '2026.08.10 테스트 발송',
    category: '정보성',
    memberCount: 1,
    admin: 'admin_park',
  },
  {
    id: 1,
    status: '예약 취소',
    requestedAt: '2026-08-08 11:05',
    target: '일부 회원',
    name: '2026.08.08 컴퓨터공학과 회원 안내',
    category: '정보성',
    memberCount: 847,
    admin: 'admin_lee',
  },
];

const NEUTRAL_BADGE = 'border-slate-200 bg-slate-100 text-slate-500';
const STATUS_STYLES: Record<SendStatus, string> = {
  예약: 'border-indigo-200 bg-indigo-50 text-indigo-600',
  성공: 'border-green-200 bg-green-50 text-green-600',
  '일부 실패': 'border-amber-200 bg-amber-50 text-orange-600',
  '예약 취소': NEUTRAL_BADGE,
};
const TARGET_STYLES: Record<SendTarget, string> = {
  '전체 회원': 'border-gray-300 bg-gray-100 text-gray-900',
  관리자: 'border-purple-200 bg-purple-50 text-purple-600',
  '일부 회원': 'border-blue-200 bg-blue-50 text-blue-600',
};

function HistoryBadge({
  children,
  className,
}: {
  children: string;
  className: string;
}) {
  return (
    <Badge
      variant='outline'
      className={`rounded-md px-2 py-0.5 text-sm font-normal ${className}`}
    >
      {children}
    </Badge>
  );
}

function formatMemberCount(count: number | null) {
  return count === null ? '-' : `${count.toLocaleString('ko-KR')}명`;
}

export function PushNotificationList() {
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);
  const [editing, setEditing] = useState<NotificationHistory | null>(null);
  const [deleting, setDeleting] = useState<NotificationHistory | null>(null);
  return (
    <section
      aria-labelledby='notification-history-title'
      className='flex w-full min-w-0 flex-col gap-1'
    >
      <SectionTitleWithCount
        title='알림 발송 목록 조회'
        titleId='notification-history-title'
        totalCount={notifications.length}
        status='ready'
      />
      <div className='overflow-x-auto rounded-lg border'>
        <Table className='w-full min-w-[1120px] table-fixed [&_td]:text-center'>
          <caption className='sr-only'>알림 발송 목록 조회</caption>
          <colgroup>
            <col className='w-[5%]' />
            <col className='w-[11%]' />
            <col className='w-[17%]' />
            <col className='w-[11%]' />
            <col className='w-[19%]' />
            <col className='w-[9%]' />
            <col className='w-[12%]' />
            <col className='w-[11%]' />
            <col className='w-[5%]' />
          </colgroup>
          <Table.Header>
            <Table.Row>
              {[
                'ID',
                '발송 상태',
                '발송 요청 일시',
                '발송 대상',
                '알림명',
                '알림 구분',
                '발송 대상 회원 수',
                '요청 관리자',
                '더보기',
              ].map((header) => (
                <Table.Head key={header} scope='col' className='text-center'>
                  {header}
                </Table.Head>
              ))}
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {notifications.length === 0 ? (
              <TableStateRow
                state='empty'
                colSpan={9}
                message='발송한 알림이 없습니다.'
              />
            ) : (
              notifications.map((notification) => (
                <Table.Row key={notification.id}>
                  <Table.Cell>{notification.id}</Table.Cell>
                  <Table.Cell>
                    <HistoryBadge
                      className={STATUS_STYLES[notification.status]}
                    >
                      {notification.status}
                    </HistoryBadge>
                  </Table.Cell>
                  <Table.Cell>{notification.requestedAt}</Table.Cell>
                  <Table.Cell>
                    <HistoryBadge
                      className={TARGET_STYLES[notification.target]}
                    >
                      {notification.target}
                    </HistoryBadge>
                  </Table.Cell>
                  <Table.Cell>
                    <span className='block truncate' title={notification.name}>
                      {notification.name}
                    </span>
                  </Table.Cell>
                  <Table.Cell>
                    <HistoryBadge
                      className={
                        notification.category === '광고성'
                          ? STATUS_STYLES['일부 실패']
                          : NEUTRAL_BADGE
                      }
                    >
                      {notification.category}
                    </HistoryBadge>
                  </Table.Cell>
                  <Table.Cell>
                    {formatMemberCount(notification.memberCount)}
                  </Table.Cell>
                  <Table.Cell>{notification.admin}</Table.Cell>
                  <Table.Cell>
                    {notification.status === '예약' && (
                      <DropdownMenu>
                        <DropdownMenu.Trigger asChild>
                          <Button
                            type='button'
                            variant='ghost'
                            size='icon-sm'
                            aria-label={`알림 ${notification.id} 더보기`}
                          >
                            <MoreHorizontal aria-hidden='true' />
                          </Button>
                        </DropdownMenu.Trigger>
                        <DropdownMenu.Content align='end'>
                          <DropdownMenu.Item
                            onSelect={() => setEditing({ ...notification })}
                          >
                            <Pencil aria-hidden='true' />
                            수정
                          </DropdownMenu.Item>
                          <DropdownMenu.Separator />
                          <DropdownMenu.Item
                            variant='destructive'
                            onSelect={() => setDeleting(notification)}
                          >
                            <Trash2 aria-hidden='true' />
                            삭제
                          </DropdownMenu.Item>
                        </DropdownMenu.Content>
                      </DropdownMenu>
                    )}
                  </Table.Cell>
                </Table.Row>
              ))
            )}
          </Table.Body>
        </Table>
      </div>
      <Dialog
        open={editing !== null}
        onOpenChange={(open) => {
          if (!open) setEditing(null);
        }}
      >
        <Dialog.Content>
          <Dialog.Header>
            <Dialog.Title>알림 수정</Dialog.Title>
            <Dialog.Description>
              예약 알림의 알림명을 수정합니다.
            </Dialog.Description>
          </Dialog.Header>
          <form
            className='flex flex-col gap-4'
            onSubmit={(event) => {
              event.preventDefault();
              if (!editing?.name.trim()) return;
              setNotifications((items) =>
                items.map((item) =>
                  item.id === editing.id
                    ? { ...editing, name: editing.name.trim() }
                    : item
                )
              );
              setEditing(null);
            }}
          >
            <div className='flex flex-col gap-1'>
              <Label htmlFor='notification-edit-name'>알림명</Label>
              <Input
                id='notification-edit-name'
                required
                value={editing?.name ?? ''}
                onChange={(event) =>
                  setEditing((item) =>
                    item ? { ...item, name: event.target.value } : null
                  )
                }
              />
            </div>
            <Dialog.Footer>
              <Button
                type='button'
                variant='outline'
                onClick={() => setEditing(null)}
              >
                취소
              </Button>
              <Button type='submit' disabled={!editing?.name.trim()}>
                저장
              </Button>
            </Dialog.Footer>
          </form>
        </Dialog.Content>
      </Dialog>
      <Dialog
        open={deleting !== null}
        onOpenChange={(open) => {
          if (!open) setDeleting(null);
        }}
      >
        <Dialog.Content>
          <Dialog.Header>
            <Dialog.Title>알림 삭제</Dialog.Title>
            <Dialog.Description className='break-words'>
              ‘{deleting?.name}’ 알림을 삭제하시겠습니까?
            </Dialog.Description>
          </Dialog.Header>
          <Dialog.Footer>
            <Button
              type='button'
              variant='outline'
              onClick={() => setDeleting(null)}
            >
              취소
            </Button>
            <Button
              type='button'
              variant='destructive'
              onClick={() => {
                setNotifications((items) =>
                  items.filter((item) => item.id !== deleting?.id)
                );
                setDeleting(null);
              }}
            >
              삭제
            </Button>
          </Dialog.Footer>
        </Dialog.Content>
      </Dialog>
    </section>
  );
}
