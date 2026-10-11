import { PATHS } from '@/shared/constants';
import type { MemberPointHistory } from '@/shared/types';

import { buildCommentDetailUrl } from '@/domains/Comments/utils/commentUrls';

type PointSourceKind =
  | 'post'
  | 'comment'
  | 'exam'
  | 'lecture'
  | 'admin'
  | 'other';

function getPointSourceKind(category: string, source: string): PointSourceKind {
  // 관리자 삭제의 sourceId는 관리자가 아닌 삭제 대상의 ID다.
  if (/^(ADMIN_)?EXAM_REVIEW_/.test(category)) return 'exam';
  if (/^(ADMIN_)?LECTURE_REVIEW_/.test(category)) return 'lecture';
  if (/^(ADMIN_)?COMMENT_/.test(category)) return 'comment';
  if (
    /^(ADMIN_)?POST_/.test(category) ||
    /^POINT_REWARD_(5|10|20|50|100|1000)_LIKES$/.test(category)
  ) {
    return 'post';
  }
  if (source === 'COMMENT') return 'comment';
  if (source === 'POST') return 'post';
  if (source === 'REVIEW') return 'exam';
  if (source === 'ADMIN') return 'admin';
  return 'other';
}

export function getPointSourceTarget(
  history: Pick<MemberPointHistory, 'category' | 'source' | 'sourceId'>
) {
  const kind = getPointSourceKind(history.category, history.source);
  const idLabel = {
    post: '관련 게시글 ID',
    comment: '관련 댓글 ID',
    exam: '시험후기 ID',
    lecture: '강의후기 ID',
    admin: '관리자 ID',
    other: '출처 ID',
  }[kind];
  const sourceId = history.sourceId;
  if (sourceId == null) return { idLabel, href: null, actionLabel: null };

  if (kind === 'post') {
    return {
      idLabel,
      href: `${PATHS.POST_MANAGE}/${sourceId}`,
      actionLabel: '게시글 상세 열기',
    };
  }
  if (kind === 'comment') {
    return {
      idLabel,
      href: buildCommentDetailUrl(sourceId),
      actionLabel: '해당 댓글 상세 열기',
    };
  }
  if (kind === 'exam') {
    const params = new URLSearchParams({
      keywordPost: String(sourceId),
      page: '1',
    });
    return {
      idLabel,
      href: `${PATHS.REVIEW_EXAM}?${params}`,
      actionLabel: '해당 시험후기 검색 결과 열기',
    };
  }
  // 강의후기·관리자·출석 등 연결할 관리 화면이 없는 출처는 복사만 제공한다.
  return { idLabel, href: null, actionLabel: null };
}
