export const SIDEBAR_MENUS: {
  title: string;
  url: string;
  items: { title: string; url: string }[];
}[] = [
  {
    title: '회원',
    url: '/member',
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
    url: '/exam',
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
    title: '포인트 증감 (지급/차감)',
    url: '/point',
    items: [
      {
        title: '단건 증감',
        url: '/point/single',
      },
      // {
      //   title: '일괄 증감',
      //   url: '/point/multiple',
      // },
      {
        title: '정회원 증감',
        url: '/point/all',
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
    url: '/operation',
    items: [
      {
        title: '푸시 알림 관리',
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
