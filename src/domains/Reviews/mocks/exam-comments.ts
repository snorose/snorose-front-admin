export interface ExamReviewCommentMock {
  commentId: number;
  nickname: string;
  createdAt: string;
  content: string;
}

export const MOCK_EXAM_REVIEW_COMMENTS: ExamReviewCommentMock[] = [
  {
    commentId: 1,
    nickname: '눈송이24',
    createdAt: '2026-04-28 09:12:00',
    content: '이 시험후기 정말 도움이 됐어요. 문제 유형 정리도 잘 되어 있네요.',
  },
  {
    commentId: 2,
    nickname: '눈송이81',
    createdAt: '2026-04-28 10:05:00',
    content: '추가로 어떤 과목이었는지 정보가 있으면 더 좋을 것 같아요.',
  },
  {
    commentId: 3,
    nickname: '눈송이07',
    createdAt: '2026-04-28 11:40:00',
    content: '작성자분이 정리한 형식이 깔끔해서 검수하기 편합니다.',
  },
  {
    commentId: 4,
    nickname: '눈송이56',
    createdAt: '2026-04-28 13:18:00',
    content: '댓글도 같이 관리할 수 있게 되면 운영할 때 훨씬 편하겠어요.',
  },
];
