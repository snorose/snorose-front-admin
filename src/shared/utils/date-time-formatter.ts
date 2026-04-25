/**
 * datetime-local input 형식을 API 형식으로 변환
 * '2024-01-01T12:00' → '2024-01-01 12:00:00'
 */
export function formatDateTimeForAPI(dateTimeString: string): string {
  return dateTimeString.replace('T', ' ') + ':00';
}

/**
 * datetime-local input 형식을 T 포함 API 형식으로 변환
 * '2024-01-01T12:00' → '2024-01-01T12:00:00'
 */
export function formatDateTimeWithT(dateTimeString: string): string {
  return `${dateTimeString}:00`;
}

/**
 * API 형식을 datetime-local input 형식으로 변환
 * '2024-01-01 12:00:00' → '2024-01-01T12:00'
 */
export function formatDateTimeForInput(dateTimeString: string): string {
  return dateTimeString.replace(' ', 'T').slice(0, 16);
}

/**
 * 날짜/시간 문자열에서 초 단위를 제거
 * '2024-01-01 12:00:00' → '2024-01-01 12:00'
 * 값이 없으면 '-' 반환
 */
export function formatDateTimeToMinutes(
  dateTimeString: string | null | undefined
): string {
  if (!dateTimeString) return '-';

  return dateTimeString.replace('T', ' ').slice(0, 16);
}
