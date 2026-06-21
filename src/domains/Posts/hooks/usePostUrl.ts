import { useSearchParams } from 'react-router-dom';

import { parseUrlParams } from '@/shared/utils/urlParamUtils';

import type { PostSearchParams } from '@/domains/Posts/types';

export function usePostUrl() {
  const [searchParamsFromUrl, setSearchParamsFromUrl] = useSearchParams();

  // URL로부터 직접 현재 페이지와 검색 조건 유도
  const currentPage = parseInt(searchParamsFromUrl.get('page') || '1', 10);
  const searchParams = parseUrlParams<PostSearchParams>(searchParamsFromUrl, {
    encryptedUserId: 'string',
    boardId: 'number',
    isVisible: 'boolean',
    isKeywordExist: 'boolean',
    startDate: 'string',
    endDate: 'string',
    sortTypes: 'string',
    sortDirection: 'string',
    keywordAuthor: 'string',
    keywordPost: 'string',
    postSearchScope: 'string',
    isNotice: 'boolean',
    adminCommonStatuses: 'array',
  });
  // 검색 조건 객체를 URL 쿼리 파라미터로 일괄 변환하여 주소 업데이트
  const handleSearchChange = (params: PostSearchParams) => {
    const newSearchParams = new URLSearchParams();

    Object.entries(params).forEach(([key, val]) => {
      if (val === undefined || val === null || val === '') return;
      if (Array.isArray(val)) {
        if (val.length > 0) {
          newSearchParams.set(key, val.join(','));
        }
      } else {
        newSearchParams.set(key, String(val));
      }
    });

    newSearchParams.set('page', '1');
    setSearchParamsFromUrl(newSearchParams, { replace: true });
  };

  // 페이지네이션 변경 시 URL의 page 값만 수정
  const handlePageChange = (
    pageOrUpdater: number | ((prev: number) => number)
  ) => {
    const next =
      typeof pageOrUpdater === 'function'
        ? pageOrUpdater(currentPage)
        : pageOrUpdater;
    const newSearchParams = new URLSearchParams(searchParamsFromUrl);
    newSearchParams.set('page', next.toString());
    setSearchParamsFromUrl(newSearchParams, { replace: true });
  };
  return {
    searchParams,
    currentPage,
    handleSearchChange,
    handlePageChange,
  };
}
