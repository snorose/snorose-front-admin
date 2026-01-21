import {
  DownloadedExamReviewTab,
  UserPointHistoryTab,
  BlacklistHistoryTab,
} from '@/domains/MemberInfo';

export const getMemberInfoTabs = (loginId: string, studentNumber: string) => [
  {
    label: '포인트 내역',
    value: 'point',
    content: (
      <UserPointHistoryTab loginId={loginId} studentNumber={studentNumber} />
    ),
  },
  {
    label: '다운받은 시험후기',
    value: 'review',
    content: (
      <DownloadedExamReviewTab
        loginId={loginId}
        studentNumber={studentNumber}
      />
    ),
  },
  {
    label: '강등/경고 내역',
    value: 'blacklist',
    content: (
      <BlacklistHistoryTab loginId={loginId} studentNumber={studentNumber} />
    ),
  },
];
