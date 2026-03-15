import { PATHS } from './paths';
import { Bell, BookOpen, HandCoins, type LucideIcon, User } from 'lucide-react';


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
        url: PATHS.MEMBER_INFO,
      },
      // {
      //   title: '경고 및 강등 관리',
      //   url: '/member/penalty',
      // },
    ],
  },
  {
    title: '게시글 관리',
    icon: FileText,
    items: [
      {
        title: '댓글 관리',
        url: PATHS.POST_COMMENTS,
      },
    ],
  },
  {
    title: '시험 후기',
    icon: BookOpen,
    items: [
      {
        title: '시험 후기 관리',
        url: PATHS.REVIEW_EXAM,
      },
    ],
  },
  {
    title: '포인트 관리',
    icon: HandCoins,
    items: [
      // {
      //   title: '단일건 증감',
      //   url: '/points/single',
      // },
      {
        title: '정회원 전체 증감',
        url: PATHS.POINT_ALL,
      },
      {
        title: '미지급 일정 관리',
        url: PATHS.POINT_FREEZE,
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
      //     // {
      //     //   title: '이벤트 관리',
      //     //   url: '/operation/event',
      //     // },
      //     // {
      //     //   title: '팝업 관리',
      //     //   url: '/operation/popup',
      //     // },
      //     // {
      //     //   title: '배너 관리',
      //     //   url: '/operation/banner',
      //     // },
    ],
  },
];
