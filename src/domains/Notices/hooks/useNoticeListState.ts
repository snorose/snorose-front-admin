import { useNavigate } from 'react-router-dom';

import { PATHS } from '@/shared/constants';
import { useManagePageUrl } from '@/shared/hooks';
import { clampOneBasedPage } from '@/shared/utils';

import { NOTICE_SCHEMA } from '../constants';
import { createMockNoticeListResponse } from '../mocks';
import type { Notice, NoticeFilters } from '../types';
import { fromAdminNotice } from '../utils/api.mapper';
import { filterNotices, getLatestNoticeId, sortNotices } from '../utils/notice';
import { useNotices } from './useNotices';

export function useNoticeListState() {
  const { notices } = useNotices();
  const navigate = useNavigate();
  const {
    searchParams: filters,
    currentPage: requestedPage,
    handleSearchChange,
    handlePageChange,
  } = useManagePageUrl<NoticeFilters>(NOTICE_SCHEMA);
  const selectedAuthor = notices.find(
    (notice) => notice.authorId === filters.author
  );
  const authorSearch = filters.keywordAuthor || selectedAuthor?.author || '';
  const latestId = getLatestNoticeId(notices);
  const sorted = filterNotices(sortNotices(notices, filters.sort), filters);
  const totalPage = Math.max(1, Math.ceil(sorted.length / 10));
  const currentPage = clampOneBasedPage(requestedPage, totalPage);
  // 화면의 1-based 페이지를 API의 0-based page로 변환합니다.
  const pageResult = createMockNoticeListResponse(
    currentPage - 1,
    sorted
  ).result;
  const visible = pageResult.data.map((item) =>
    fromAdminNotice(item, sorted.find((notice) => notice.id === item.postId)!)
  );
  const updateFilters = (updates: NoticeFilters) =>
    handleSearchChange({ ...filters, ...updates });

  const handleViewMemberInfo = (authorId: string) =>
    navigate(`${PATHS.MEMBER_INFO}/${encodeURIComponent(authorId)}`);
  return {
    filters,
    authorSearch,
    totalCount: pageResult.totalCount,
    updateFilters,
    resetFilters: () => handleSearchChange({}),
    notices: visible,
    latestId,
    currentPage,
    totalPage,
    onPageChange: handlePageChange,
    selectedAuthorName: filters.author
      ? (selectedAuthor?.author ?? '선택한 관리자')
      : undefined,
    onClearAuthor: () => updateFilters({ author: '', keywordAuthor: '' }),
    onViewMemberInfo: handleViewMemberInfo,
    onViewAuthorNotices: (notice: Notice) =>
      updateFilters({ author: notice.authorId, keywordAuthor: notice.author }),
  };
}
