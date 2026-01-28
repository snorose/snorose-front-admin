import { User, BookOpen, HandCoins, Bell, type LucideIcon } from 'lucide-react';

export type SidebarMenu = {
  title: string;
  icon: LucideIcon;
  items: SidebarSubMenu[];
};

export type SidebarSubMenu = {
  title: string;
  url: string;
  beta?: boolean;
};

export const SIDEBAR_MENUS: SidebarMenu[] = [
  {
    title: '회원',
    icon: User,
    items: [
      {
        title: '회원 관리',
        url: '/member/info',
      },
      {
        title: '경고 및 강등 관리',
        url: '/member/penalty',
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
    icon: BookOpen,
    items: [
      {
        title: '시험 후기 관리',
        url: '/reviews/exam',
      },
    ],
  },
  {
    title: '포인트 관리',
    icon: HandCoins,
    items: [
      {
        title: '단일건 증감',
        url: '/points/single',
      },
      // {
      //   title: '일괄 증감',
      //   url: '/points/multiple',
      // },
      {
        title: '정회원 전체 증감',
        url: '/points/all',
      },
      {
        title: '미지급 일정 관리',
        url: '/points/freeze',
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
    title: '알림',
    icon: Bell,
    items: [
      {
        title: '푸시 알림 전송',
        url: '/alerts',
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
