export type ParamType =
  | 'string'
  | 'number'
  | 'boolean'
  | 'array'
  | 'number-array';

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
