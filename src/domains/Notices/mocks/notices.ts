import type { BaseResponse } from '@/shared/types';

import {
  NOTICE_BOARD_CATALOG,
  getNoticeBoard,
  getNoticeCategories,
} from '../constants/boards';
import type {
  AdminCreateNoticeRequest,
  AdminCreateNoticeResult,
  AdminNoticeListItem,
  AdminNoticeListResult,
} from '../types';
import type { Notice, NoticeBoard, NoticeStatus } from '../types';
import {
  fromAdminNotice,
  toAdminNotice,
  toNoticeLocalDateTime,
} from '../utils/api.mapper';
import { toNoticeHtml } from '../utils/content';
import { sortNotices } from '../utils/notice';

const rows: [string, NoticeBoard, NoticeStatus, boolean, string][] = [
  [
    '스노로즈 서비스 점검 안내',
    '공지사항',
    'published',
    false,
    '더 나은 서비스 제공을 위해 시스템 점검을 진행합니다. 점검 시간과 이용 안내를 확인해 주세요.',
  ],
  [
    '2026학년도 2학기 커뮤니티 이용 안내',
    '공지사항',
    'published',
    true,
    '눈송이 여러분, 안전하고 즐거운 커뮤니티를 위해 이용 규칙을 확인해 주세요.',
  ],
  [
    '시험후기 작성 및 포인트 지급 안내',
    '시험후기',
    'published',
    true,
    '시험후기를 작성하고 다음 학기를 준비하는 눈송이들에게 도움을 나눠 주세요.',
  ],
  [
    '11월 스노로즈 이벤트 안내 (작성 중)',
    '이벤트',
    'draft',
    false,
    '이벤트 일정과 참여 방법을 준비하고 있습니다.',
  ],
  [
    '신규 회원을 위한 첫눈온방 이용 가이드',
    '첫눈온방',
    'draft',
    false,
    '처음 오신 눈송이 여러분을 환영합니다.',
  ],
  [
    '기말고사 시험후기 작성 기간 안내',
    '시험후기',
    'scheduled',
    false,
    '기말고사 시험후기 작성 기간을 안내드립니다.',
  ],
  [
    '함박눈방 게시판 이용 수칙',
    '함박눈방',
    'published',
    false,
    '서로를 존중하는 따뜻한 대화를 함께 만들어 주세요.',
  ],
  [
    '만년설방 공지사항 안내',
    '만년설방',
    'published',
    false,
    '만년설방 이용 전 꼭 확인해 주세요.',
  ],
  [
    '총학생회 11월 주요 일정',
    '총학생회',
    'published',
    false,
    '이번 달 학생 자치 활동과 주요 일정을 안내합니다.',
  ],
  [
    '졸업앨범 촬영 일정 안내',
    '졸업준비위원회',
    'published',
    false,
    '졸업앨범 촬영 일정 및 준비 사항을 확인해 주세요.',
  ],
  [
    '하반기 학생회비 감사 안내',
    '재정감사위원회',
    'published',
    false,
    '학생회비 집행 내역과 감사 일정을 안내드립니다.',
  ],
  [
    '종료된 이벤트 안내',
    '이벤트',
    'private',
    false,
    '진행이 종료되어 비공개로 전환된 공지입니다.',
  ],
];

export function createSampleNotices(now = new Date()): Notice[] {
  const reserved = new Date(now.getTime() + 7 * 86_400_000);
  const scheduledAt = new Intl.DateTimeFormat('sv-SE', {
    timeZone: 'Asia/Seoul',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
    .format(reserved)
    .replace(' ', 'T');

  const additionalRows: typeof rows = NOTICE_BOARD_CATALOG.filter(
    (board) => !rows.some((row) => row[1] === board.name)
  ).map((board) => [
    `${board.name} 게시판 이용 안내`,
    board.name,
    'published',
    false,
    `${board.name} 게시판을 이용하는 눈송이 여러분께 안내드립니다. ${getNoticeCategories(board.name).length ? '말머리를 선택하고 주제에 맞는 글을 작성해 주세요.' : '게시판 주제에 맞는 글을 작성하고 서로를 존중해 주세요.'}`,
  ]);
  return [...rows, ...additionalRows].map(
    ([title, board, status, pinned, content], index) => {
      const date = new Date(
        now.getTime() - (index + 1) * 86_400_000
      ).toISOString();
      const posted = status === 'published' || status === 'private';
      const response: AdminNoticeListItem = {
        postId: 1082 - index,
        boardId: getNoticeBoard(board)!.id,
        boardName: board,
        title,
        content: toNoticeHtml(content),
        adminNickname: ['운영리자', '소통리자', '개발리자'][index % 3],
        viewCount: posted ? Math.max(12, 1260 - index * 37) : 0,
        likeCount: posted ? Math.max(1, 42 - index) : 0,
        scrapCount: posted ? Math.max(0, 24 - index) : 0,
        status: (
          {
            published: 'PUBLISHED',
            scheduled: 'SCHEDULED',
            draft: 'DRAFT',
            private: 'PRIVATE',
          } as const
        )[status],
        isNew: index === 0,
        isPinned: pinned,
        updatedAt: toNoticeLocalDateTime(date),
      };
      return fromAdminNotice(response, {
        category: getNoticeCategories(board)[0] ?? '',
        attachments: [],
        authorId: `sample-admin-${index % 3}`,
        createdAt: date,
        publishedAt: posted ? date : null,
        scheduledAt: status === 'scheduled' ? scheduledAt : '',
      });
    }
  );
}

/** GET /v1/admin/notices?page=0 과 동일한 envelope/페이지/항목 구조. */
export function createMockNoticeListResponse(
  page = 0,
  notices = sortNotices(createSampleNotices())
): BaseResponse<AdminNoticeListResult> {
  const data = notices.slice(page * 10, (page + 1) * 10).map(toAdminNotice);
  return {
    isSuccess: true,
    code: 1000,
    message: '요청에 성공하였습니다.',
    result: {
      hasNext: (page + 1) * 10 < notices.length,
      totalPage: Math.ceil(notices.length / 10),
      totalCount: notices.length,
      currentCount: data.length,
      data,
    },
  };
}

/** POST 응답 예시. 업로드 URL은 예시 전용이며 네트워크 요청에 사용하지 않습니다. */
export function createMockNoticeCreateResponse(
  request: AdminCreateNoticeRequest,
  postId: number
): BaseResponse<AdminCreateNoticeResult> {
  return {
    isSuccess: true,
    code: 1000,
    message: '요청에 성공하였습니다.',
    result: {
      postId,
      imageUploadUrls: request.images.map(
        (_, index) =>
          `https://example.invalid/notices/${postId}/upload/${index}`
      ),
      isDraft: request.isDraft,
      isScheduled: request.isScheduled,
      scheduledAt: request.scheduledAt,
    },
  };
}
