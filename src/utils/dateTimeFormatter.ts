/**
 * datetime-local input 형식을 API 형식으로 변환
 * '2024-01-01T12:00' → '2024-01-01 12:00:00'
 */
export function formatDateTimeForAPI(dateTimeString: string): string {
  return dateTimeString.replace('T', ' ') + ':00';
}

/**
 * API 형식을 datetime-local input 형식으로 변환
 * '2024-01-01 12:00:00' → '2024-01-01T12:00'
 */
export function formatDateTimeForInput(dateTimeString: string): string {
  return dateTimeString.replace(' ', 'T').slice(0, 16);
}
