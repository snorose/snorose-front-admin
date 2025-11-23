export type SubMenuItem = {
  path: string;
  label: string;
};

export type SidebarMenuSingle = {
  type: 'single';
  path: string;
  label: string;
  icon: string;
};

export type SidebarMenuGroup = {
  type: 'group';
  path: string;
  label: string;
  icon: string;
  items: SubMenuItem[];
};

export type SidebarMenu = SidebarMenuSingle | SidebarMenuGroup;

export const SIDEBAR_MENUS: SidebarMenu[] = [
  {
    type: 'single',
    path: '/home',
    label: '홈 (준비중)',
    icon: 'House',
  },
  {
    type: 'group',
    path: '/member',
    label: '회원',
    icon: 'UserCog',
    items: [
      { path: '/member/list', label: '회원 관리' },
      { path: '/member/warning', label: '경고 및 강등 관리' },
    ],
  },
  {
    type: 'group',
    path: '/board',
    label: '게시글 관리 (준비중)',
    icon: 'FileText',
    items: [
      { path: '/board/list', label: '게시글 관리' },
      { path: '/board/comment', label: '댓글 관리' },
    ],
  },
  {
    type: 'group',
    path: '/exam',
    label: '시험 후기 (준비중)',
    icon: 'BookOpen',
    items: [
      { path: '/exam/list', label: '시험 후기 관리' },
      { path: '/exam/period', label: '시험후기 작성 기간 설정' },
    ],
  },
  {
    type: 'group',
    path: '/point',
    label: '포인트',
    icon: 'CircleParking',
    items: [
      { path: '/point/single', label: '포인트 증감 (단건)' },
      { path: '/point/multiple', label: '포인트 증감 (일괄)' },
      { path: '/point/all', label: '포인트 증감 (정회원)' },
    ],
  },
  {
    type: 'group',
    path: '/report',
    label: '문의 및 신고',
    icon: 'TriangleAlert',
    items: [
      { path: '/report/inquiry', label: '문의 및 신고' },
      { path: '/report/report', label: '신고 글/댓글 조회' },
    ],
  },
  {
    type: 'group',
    path: '/operation',
    label: '운영',
    icon: 'Settings',
    items: [
      { path: '/operation/push', label: '푸쉬 알림 발송' },
      { path: '/operation/event', label: '이벤트 신청자 조회' },
      { path: '/operation/popup', label: '팝업 관리' },
      { path: '/operation/banner', label: '배너 관리' },
    ],
  },
];
