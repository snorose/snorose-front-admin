export type SidebarMenu = {
  title: string;
  items: SidebarSubMenu[];
};

export type SidebarSubMenu = {
  title: string;
  url: string;
};

export const SIDEBAR_MENUS: SidebarMenu[] = [
  {
    title: '회원',
    items: [
      {
        title: '회원 관리',
        url: '/member/info',
      },
      {
        title: '경고 및 강등 관리',
        url: '/member/warning',
      },
    ],
  },
  // {
  //   title: '게시글 관리',
  //   url: '/post',
  //   items: [
  //     {
  //       title: '게시글 관리',
  //       url: '/post/list',
  //     },
  //     {
  //       title: '댓글 관리',
  //       url: '/post/comment',
  //     },
  //   ],
  // },
  {
    title: '시험 후기',
    items: [
      {
        title: '시험 후기 관리',
        url: '/exam/list',
      },
      {
        title: '작성 기간 설정',
        url: '/exam/period',
      },
    ],
  },
  {
    title: '포인트 지급/차감',
    items: [
      {
        title: '단일 지급',
        url: '/points/single',
      },
      // {
      //   title: '일괄 증감',
      //   url: '/points/multiple',
      // },
      {
        title: '정회원 전체',
        url: '/points/all',
      },
    ],
  },
  // {
  //   title: '문의 및 신고',
  //   url: '/report',
  //   items: [
  //     {
  //       title: '문의 및 신고',
  //       url: '/report/inquiry',
  //     },
  //     {
  //       title: '신고 글/댓글 조회',
  //       url: '/report/report',
  //     },
  //   ],
  // },
  {
    title: '운영',
    items: [
      {
        title: '푸시 알림 전송',
        url: '/operation/push',
      },
      // {
      //   title: '이벤트 관리',
      //   url: '/operation/event',
      // },
      // {
      //   title: '팝업 관리',
      //   url: '/operation/popup',
      // },
      // {
      //   title: '배너 관리',
      //   url: '/operation/banner',
      // },
    ],
  },
];
