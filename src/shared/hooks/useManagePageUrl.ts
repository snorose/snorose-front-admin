import { useSearchParams } from 'react-router-dom';

import { parseUrlParams } from '@/shared/utils/urlParamUtils';

type ParamType = 'string' | 'number' | 'boolean' | 'array';

export function useManagePageUrl<T extends object>(
  schema: Record<string, ParamType>
) {
  const [searchParamsFromUrl, setSearchParamsFromUrl] = useSearchParams();

  const currentPage = parseInt(searchParamsFromUrl.get('page') || '1', 10);
  const searchParams = parseUrlParams<T>(searchParamsFromUrl, schema);

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

  return { searchParams, currentPage, handleSearchChange, handlePageChange };
}
