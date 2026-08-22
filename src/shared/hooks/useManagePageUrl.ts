import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

import {
  type ParamType,
  parseOneBasedPage,
  parseUrlParams,
} from '@/shared/utils';

export function useManagePageUrl<T extends object>(
  schema: Record<string, ParamType>
) {
  const [searchParamsFromUrl, setSearchParamsFromUrl] = useSearchParams();

  const rawPage = searchParamsFromUrl.get('page');
  const currentPage = parseOneBasedPage(rawPage);
  const searchParams = parseUrlParams<T>(searchParamsFromUrl, schema);

  useEffect(() => {
    if (rawPage === null || rawPage === String(currentPage)) return;

    const normalizedSearchParams = new URLSearchParams(searchParamsFromUrl);
    normalizedSearchParams.set('page', String(currentPage));
    setSearchParamsFromUrl(normalizedSearchParams, { replace: true });
  }, [currentPage, rawPage, searchParamsFromUrl, setSearchParamsFromUrl]);

  const handleSearchChange = (params: T) => {
    const newSearchParams = new URLSearchParams();

    Object.entries(params as Record<string, unknown>).forEach(([key, val]) => {
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

  const handlePageChange = (page: number) => {
    const newSearchParams = new URLSearchParams(searchParamsFromUrl);
    newSearchParams.set('page', String(Math.max(1, page)));
    setSearchParamsFromUrl(newSearchParams, { replace: true });
  };

  return { searchParams, currentPage, handleSearchChange, handlePageChange };
}
