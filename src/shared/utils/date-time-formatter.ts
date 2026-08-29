/**
 * datetime-local input 형식을 API 형식으로 변환
 *
 * 예시) '2024-01-01T12:00' → '2024-01-01 12:00:00'
 */
export function formatDateTimeForAPI(dateTimeString: string): string {
  return dateTimeString.replace('T', ' ') + ':00';
}

/**
 * datetime-local input 형식을 T 포함 API 형식으로 변환
 *
 * 예시) '2024-01-01T12:00' → '2024-01-01T12:00:00'
 */
export function formatDateTimeWithT(dateTimeString: string): string {
  return `${dateTimeString}:00`;
}

/**
 * API 형식을 datetime-local input 형식으로 변환
 *
 * 예시) '2024-01-01 12:00:00' → '2024-01-01T12:00'
 *
 * @deprecated 새 코드에서는 toDateTimeInputValue를 사용한다.
 */
export function formatDateTimeForInput(dateTimeString: string): string {
  return toDateTimeInputValue(dateTimeString);
}

/**
 * 날짜/시간 문자열에서 날짜만 반환
 *
 * 예시) '2024-01-01 12:00:00' → '2024-01-01'
 *
 * 값이 없으면 '-' 반환
 */
export function formatDateOnly(
  dateTimeString: string | null | undefined
): string {
  if (!dateTimeString) return '-';
  return dateTimeString.slice(0, 10);
}

/**
 * 날짜/시간 문자열에서 초 단위를 제거
 *
 * 예시) '2024-01-01 12:00:00' → '2024-01-01 12:00'
 *
 * 값이 없으면 '-' 반환
 */
export function formatDateTimeToMinutes(
  dateTimeString: string | null | undefined
): string {
  if (!dateTimeString) return '-';
  return dateTimeString.slice(0, 16).replace('T', ' ');
}

/**
 * 날짜/시간 문자열을 초 단위까지 반환
 *
 * 예시) '2024-01-01T12:00:00.000' → '2024-01-01 12:00:00'
 *
 * 값이 없으면 '-' 반환
 */
export function formatDateTimeToSeconds(
  dateTimeString: string | null | undefined
): string {
  if (!dateTimeString) return '-';
  return dateTimeString.replace('T', ' ').split('.')[0].slice(0, 19);
}

/**
 * 날짜/시간 문자열을 'YYYY-MM-DD 오전/오후 h:mm' 형식으로 변환
 */
export function formatDateTimeWithAmPm(
  dateTimeString: string | null | undefined
): string {
  if (!dateTimeString) return '-';
  const isoString = dateTimeString.replace(' ', 'T');
  const date = new Date(isoString);
  if (isNaN(date.getTime())) return '-';

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  let hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const ampm = hours >= 12 ? '오후' : '오전';

  hours = hours % 12;
  hours = hours ? hours : 12; // 0시는 12시로 표시

  return `${year}-${month}-${day} ${ampm} ${hours}:${minutes}`;
}

/**
 * 날짜/시간 문자열을 datetime-local input 값으로 변환
 *
 * 예시) '2024-01-01 12:00:00' → '2024-01-01T12:00'
 *
 * 값이 없으면 빈 문자열 반환
 */
export function toDateTimeInputValue(
  dateTimeString: string | null | undefined
): string {
  if (!dateTimeString) return '';
  return dateTimeString.replace(' ', 'T').slice(0, 16);
}
