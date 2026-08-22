export type ParamType =
  | 'string'
  | 'number'
  | 'boolean'
  | 'array'
  | 'number-array';

/**
 * URL의 페이지 값을 1부터 시작하는 유효한 페이지 번호로 변환한다.
 *
 * @example
 * parseOneBasedPage('abc'); // 1
 */
export function parseOneBasedPage(value: string | null): number {
  if (value === null || !/^\d+$/.test(value)) return 1;

  const page = Number(value);
  return Number.isSafeInteger(page) && page >= 1 ? page : 1;
}

/**
 * 현재 페이지를 1부터 전체 페이지 사이의 범위로 보정한다.
 *
 * @example
 * clampOneBasedPage(7, 5); // currentPage=7, totalPage=5 → 5
 */
export function clampOneBasedPage(
  currentPage: number,
  totalPage: number
): number {
  return Math.min(Math.max(1, currentPage), Math.max(1, totalPage));
}

export function parseUrlParams<T extends object>(
  urlParams: URLSearchParams,
  schema: Record<string, ParamType>
): T {
  const params = {} as Record<string, unknown>;
  Object.entries(schema).forEach(([key, type]) => {
    const rawValue = urlParams.get(key);
    if (rawValue === null) return;

    if (type === 'number') {
      const parsed = parseInt(rawValue, 10);
      if (!isNaN(parsed)) params[key] = parsed;
    } else if (type === 'boolean') {
      if (rawValue === 'true') params[key] = true;
      if (rawValue === 'false') params[key] = false;
    } else if (type === 'array') {
      const arr = rawValue
        .split(',')
        .map((v) => v.trim())
        .filter((v) => v !== '')
        .map((v) => (isNaN(Number(v)) ? v : Number(v)));
      if (arr.length > 0) params[key] = arr;
    } else if (type === 'number-array') {
      const arr = rawValue
        .split(',')
        .map((v) => parseInt(v.trim(), 10))
        .filter((v) => !isNaN(v));
      if (arr.length > 0) params[key] = arr;
    } else {
      // string
      if (rawValue.trim() !== '') params[key] = rawValue;
    }
  });

  return params as unknown as T;
}
