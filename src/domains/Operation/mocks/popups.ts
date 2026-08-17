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
    startDate: '2026-04-28T00:00',
    endDate: '2026-05-04T23:59',
    displayPriority: 10,
    createdAt: '2026-04-28 14:00',
    updatedAt: '2026-04-28 14:12',
  },
  {
    id: 2,
    title: '[캘린더] 5월 스노로즈 일정',
    bodyMarkdown: '',
    imageFileName: 'calendar.png',
    startDate: '2026-04-28T00:00',
    endDate: '2026-05-30T23:59',
    displayPriority: 20,
    createdAt: '2026-04-28 14:00',
    updatedAt: '2026-04-28 14:05',
  },
  {
    id: 3,
    title: '[공지] 8월 스노로즈 운영 안내',
    bodyMarkdown: '8월 커뮤니티 운영 일정과 주요 안내 사항을 확인해 주세요.',
    imageFileName: '',
    startDate: '2026-08-01T09:00',
    endDate: '2026-08-31T23:59',
    displayPriority: 30,
    createdAt: '2026-07-25 10:00',
    updatedAt: '2026-07-25 10:00',
  },
  {
    id: 4,
    title: '[학사] 2학기 주요 일정 안내',
    bodyMarkdown: '개강과 수강 정정 등 2학기 주요 학사 일정을 안내합니다.',
    imageFileName: 'fall-semester.png',
    startDate: '2026-08-05T09:00',
    endDate: '2026-09-30T23:59',
    displayPriority: 40,
    createdAt: '2026-07-28 11:00',
    updatedAt: '2026-08-03 15:30',
  },
  {
    id: 5,
    title: '[이벤트] 가을맞이 커뮤니티 이벤트',
    bodyMarkdown: '10월까지 진행되는 가을맞이 이벤트에 참여해 보세요.',
    imageFileName: 'autumn-event.webp',
    startDate: '2026-08-10T12:00',
    endDate: '2026-10-31T18:00',
    displayPriority: 50,
    createdAt: '2026-08-08 09:30',
    updatedAt: '2026-08-10 10:00',
  },
  {
    id: 6,
    title: '[예정] 11월 서비스 점검 안내',
    bodyMarkdown: '11월 서비스 점검 일정은 추후 상세 안내할 예정입니다.',
    imageFileName: '',
    startDate: '2026-11-01T09:00',
    endDate: '2026-11-30T23:59',
    displayPriority: 60,
    createdAt: '2026-08-11 14:00',
    updatedAt: '2026-08-11 14:00',
  },
  {
    id: 7,
    title: '[예정] 12월 연말 이벤트',
    bodyMarkdown: '12월에 진행될 연말 이벤트를 기대해 주세요.',
    imageFileName: 'year-end-event.jpg',
    startDate: '2026-12-01T00:00',
    endDate: '2026-12-31T23:59',
    displayPriority: 70,
    createdAt: '2026-08-12 16:00',
    updatedAt: '2026-08-12 16:00',
  },
];
