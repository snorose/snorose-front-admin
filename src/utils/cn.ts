type ClassPrimitive = string | number | null | false | undefined;
type ClassDictionary = Record<string, ClassPrimitive | boolean>;
type ClassValue = ClassPrimitive | ClassValue[] | ClassDictionary;

export function cn(...inputs: ClassValue[]): string {
  const result: string[] = [];

  const append = (value: ClassValue): void => {
    if (!value) return;

    // 1. 문자열이나 숫자 처리
    if (typeof value === 'string' || typeof value === 'number') {
      result.push(String(value));
      return;
    }
    // 2. 배열 처리
    if (Array.isArray(value)) {
      for (const item of value) append(item);
      return;
    }
    // 3. 객체 처리
    if (typeof value === 'object') {
      for (const key in value as ClassDictionary) {
        if (!Object.prototype.hasOwnProperty.call(value, key)) continue;
        const enabled = (value as ClassDictionary)[key];
        if (enabled) result.push(key);
      }
    }
  };

  for (const input of inputs) append(input);
  return result.join(' ');
}
