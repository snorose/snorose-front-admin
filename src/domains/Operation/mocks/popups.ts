import type { PopupContent } from '@/domains/Operation/types';

export const MOCK_POPUP_CONTENTS: PopupContent[] = [
  {
    id: 1,
    title: '[EVENT] 스노로즈 X 웰라쥬 체험단 이벤트',
    bodyMarkdown: `무너진 피부에 #속수분텐션업할 시간!

  - 모집 인원: 스노로즈 가입자 중 숙명여대 재학생, 휴학생, 졸업생 포함 총 50인
  - 체험 제품: 웰라쥬 리얼 히알루로닉 수딩 크림 본품(80ml)
  - 모집 기간: 4월 27일(월) ~ 5월 4일(월)

  [이벤트 관련 링크](/board/notice/post/1895414)`,
    imageFileName: 'event.png',
    startDate: '2026-04-28',
    endDate: '2026-05-04',
    createdAt: '2026-04-28 14:00',
    updatedAt: '2026-04-28 14:12',
  },
  {
    id: 2,
    title: '[캘린더] 5월 스노로즈 일정',
    bodyMarkdown: '',
    imageFileName: 'calendar.png',
    startDate: '2026-04-28',
    endDate: '2026-05-30',
    createdAt: '2026-04-28 14:00',
    updatedAt: '2026-04-28 14:05',
  },
];
