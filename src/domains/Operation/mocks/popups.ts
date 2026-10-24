import type { PopupDetail, PopupStatus } from '@/domains/Operation/types/popup';

import { snoroseLogo } from '@/assets';

export function getKstDateTime(now = new Date()) {
  return new Date(now.getTime() + 9 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 19);
}

export function getMockPopupStatus(
  startDate: string,
  endDate: string
): PopupStatus {
  const today = getKstDateTime().slice(0, 10);
  return today < startDate ? 'SCHEDULED' : today > endDate ? 'ENDED' : 'ACTIVE';
}

export function createMockPopupDetails(): PopupDetail[] {
  const today = getKstDateTime().slice(0, 10);
  const date = (offset: number) =>
    new Date(Date.parse(`${today}T00:00:00Z`) + offset * 86400000)
      .toISOString()
      .slice(0, 10);
  const titles = [
    '[공지] 서비스 점검 안내',
    '[캘린더] 이번 달 주요 일정',
    '[이벤트] 스노로즈 체험단 모집',
    '[공지] 커뮤니티 이용 안내',
    '[학사] 수강 신청 일정 안내',
    '[이벤트] 커뮤니티 설문조사',
    '[공지] 개인정보 처리방침 변경',
    '[캘린더] 다음 달 학사 일정',
    '[이벤트] 신규 회원 환영 이벤트',
    '[공지] 시험 기간 운영 안내',
    '[학사] 장학금 신청 안내',
    '[이벤트] 스노로즈와 함께하는 캠퍼스 생활 후기 모집 및 참여 혜택 안내',
  ];
  return titles.map((title, index) => {
    const startDate = date(index % 3 === 0 ? -2 : index % 3 === 1 ? 2 : -7);
    const endDate = date(index % 3 === 0 ? 2 : index % 3 === 1 ? 7 : -1);
    return {
      id: index + 1,
      title,
      displayOrder: index,
      description:
        index % 4 === 1 || index % 4 === 3
          ? null
          : '**스노로즈 안내**\n\n- 자세한 일정을 확인해 주세요.\n- 게시 기간에만 표시되는 팝업입니다.\n\n[공지 확인하기](/board/notice/post/123)',
      imageUrl: index % 4 < 2 ? snoroseLogo : null,
      startDate,
      endDate,
      status: getMockPopupStatus(startDate, endDate),
      createdAt: `${date(index - 14)}T10:00:00`,
      updatedAt: index % 4 === 0 ? `${date(index - 13)}T15:30:00` : null,
    };
  });
}
