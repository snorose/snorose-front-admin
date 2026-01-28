import { isAxiosError } from 'axios';
import type { ApiErrorResponse } from '@/types';

/**
 * API 에러에서 메시지를 추출하는 유틸리티 함수
 * @param error - catch 블록에서 받은 에러 객체
 * @param defaultMessage - 기본 에러 메시지
 * @returns 에러 메시지 문자열
 */
export function getErrorMessage(
  error: unknown,
  defaultMessage: string = '요청 처리 중 오류가 발생했습니다.'
): string {
  if (isAxiosError<ApiErrorResponse>(error)) {
    return error.response?.data?.message || defaultMessage;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return defaultMessage;
}
