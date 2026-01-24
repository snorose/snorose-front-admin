import {
  DownloadedExamReviewTab,
  UserPointHistoryTab,
  BlacklistHistoryTab,
} from '@/domains/MemberInfo';

export const getMemberInfoTabs = (
  encryptedUserId: string,
  studentNumber: string
) => [
  {
    label: '포인트 내역',
    value: 'point',
    content: (
      <UserPointHistoryTab
        encryptedUserId={encryptedUserId}
        studentNumber={studentNumber}
      />
    ),
  },
  {
    label: '다운받은 시험후기',
    value: 'review',
    content: (
      <DownloadedExamReviewTab
        encryptedUserId={encryptedUserId}
        studentNumber={studentNumber}
      />
    ),
  },
  {
    label: '강등/경고 내역',
    value: 'blacklist',
    content: (
      <BlacklistHistoryTab
        encryptedUserId={encryptedUserId}
        studentNumber={studentNumber}
      />
    ),
  },
];
