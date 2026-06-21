import {
  EXAM_CONFIRM_STATUS,
  EXAM_REVIEW_PROCESS_STATUS,
  LECTURE_TYPE_OPTIONS,
} from '@/shared/constants';

import type { ExamReviewProcessStatus } from '@/domains/Reviews/types';

interface ExamReviewProcessStatusSource {
  deletionStatus?: ExamReviewProcessStatus | null;
  visibilityStatus?: ExamReviewProcessStatus | null;
  isSanctioned?: boolean | 'true' | 'false' | null;
}

const ACTION_LABELS: Record<string, string> = {
  CREATED: '생성',
  UPDATED: '수정',
  DELETED: '삭제',
  CONFIRMED: '확인',
  UNCONFIRMED: '미확인',
};

const STATUS_LABELS: Record<string, string> = {
  ...Object.fromEntries(
    EXAM_CONFIRM_STATUS.map(({ code, label }) => [code, label])
  ),
  ...Object.fromEntries(
    EXAM_REVIEW_PROCESS_STATUS.map(({ code, label }) => [code, label])
  ),
};

const SEMESTER_LABELS: Record<string, string> = {
  FIRST: '1학기',
  SECOND: '2학기',
  SUMMER: '여름계절',
  WINTER: '겨울계절',
  OTHER: '기타',
};

const formatStatusValue = (value: string): string =>
  value
    .split(/\s*->\s*/)
    .map((status) => STATUS_LABELS[status] ?? status)
    .join(' -> ');

const isBooleanString = (value: string): value is 'true' | 'false' =>
  value === 'true' || value === 'false';

export const isExamReviewSanctioned = (
  value: ExamReviewProcessStatusSource['isSanctioned']
): boolean => value === true || value === 'true';

export const getExamReviewProcessStatuses = (
  source: ExamReviewProcessStatusSource
): ExamReviewProcessStatus[] => {
  const processStatuses: ExamReviewProcessStatus[] = [];

  if (source.deletionStatus && source.deletionStatus !== 'VISIBLE') {
    processStatuses.push(source.deletionStatus);
  }

  if (source.visibilityStatus && source.visibilityStatus !== 'VISIBLE') {
    processStatuses.push(source.visibilityStatus);
  }

  if (isExamReviewSanctioned(source.isSanctioned)) {
    processStatuses.push('SANCTIONED');
  }

  return processStatuses.length > 0 ? processStatuses : ['VISIBLE'];
};

/**
 * lectureType enum을 문자열로 변환
 * @param lectureTypeEnum - 변환할 lectureType enum 값
 * @returns 한국어 문자열
 */
export const convertLectureTypeToString = (
  lectureTypeEnum: (typeof LECTURE_TYPE_OPTIONS)[number]['value']
): string => {
  return (
    LECTURE_TYPE_OPTIONS.find((option) => option.value === lectureTypeEnum)
      ?.label ?? lectureTypeEnum
  );
};

/**
 * semester enum을 문자열로 변환: "FIRST" -> "2024-1" 형식
 * @param semesterEnum - 변환할 semester enum 값
 * @param year - 연도
 * @returns 한국어 문자열 (예: "2024-1", "2024 여름")
 */
export const convertSemesterEnumToString = (
  semesterEnum: 'FIRST' | 'SECOND' | 'SUMMER' | 'WINTER' | 'OTHER',
  year: number
): string => {
  if (semesterEnum === 'FIRST') {
    return `${year}-1`;
  }
  if (semesterEnum === 'SECOND') {
    return `${year}-2`;
  }
  if (semesterEnum === 'SUMMER') {
    return `${year}-여름계절`;
  }
  if (semesterEnum === 'WINTER') {
    return `${year}-겨울계절`;
  }
  if (semesterEnum === 'OTHER') {
    return `${year} 기타`;
  }
  return '';
};

/**
 * examType enum을 문자열로 변환: "MIDTERM" -> "중간고사", "FINALTERM" -> "기말고사"
 * @param examTypeEnum - 변환할 examType enum 값
 * @returns 한국어 문자열
 */
export const convertExamTypeEnumToString = (
  examTypeEnum: 'MIDTERM' | 'FINALTERM'
): string => {
  if (examTypeEnum === 'MIDTERM') {
    return '중간고사';
  }
  return '기말고사';
};

/**
 * semester 문자열을 enum으로 변환: "2024-1" -> "FIRST", "2024-2" -> "SECOND" 등
 * @param semesterStr - 변환할 semester 문자열
 * @returns semester enum 값
 */
export const convertSemesterToEnum = (
  semesterStr: string
): 'FIRST' | 'SECOND' | 'SUMMER' | 'WINTER' | 'OTHER' => {
  if (semesterStr.includes('여름')) {
    return 'SUMMER';
  }
  if (semesterStr.includes('겨울')) {
    return 'WINTER';
  }
  if (semesterStr.endsWith('-1')) {
    return 'FIRST';
  }
  if (semesterStr.endsWith('-2')) {
    return 'SECOND';
  }
  return 'OTHER';
};

/**
 * examType 문자열을 enum으로 변환
 * - "중간고사" 또는 "중간" -> "MIDTERM"
 * - "기말고사" 또는 "기말" -> "FINALTERM"
 * @param examTypeStr - 변환할 examType 문자열
 * @returns examType enum 값
 */
export const convertExamTypeToEnum = (
  examTypeStr: string
): 'MIDTERM' | 'FINALTERM' => {
  if (examTypeStr === '중간고사' || examTypeStr === '중간') {
    return 'MIDTERM';
  }
  return 'FINALTERM';
};

/**
 * semester 문자열에서 연도 추출: "2024-1" -> 2024
 * @param semesterStr - semester 문자열
 * @returns 연도 (number) 또는 undefined
 */
export const extractYearFromSemester = (
  semesterStr: string
): number | undefined => {
  const match = semesterStr.match(/^(\d{4})/);
  return match ? parseInt(match[1], 10) : undefined;
};

/**
 * 상태 코드로 상태 이름 가져오기
 * @param statusCode - 상태 코드
 * @returns 상태 이름
 */
export const getStatusName = (statusCode: string): string => {
  const statusOption = EXAM_CONFIRM_STATUS.find((s) => s.code === statusCode);
  return statusOption?.label || '확인';
};

export const formatExamReviewLogValue = (
  key: string,
  value: string | number | boolean | null,
  statusModifiedReason?: string | number | boolean | null
): string => {
  if (value === null) {
    return '-';
  }

  if (typeof value === 'boolean') {
    if (key === 'isConfirmed') {
      return value ? '확인' : '미확인';
    }
    if (key === 'isDiscussed') {
      return value ? '논의 있음' : '논의 없음';
    }
    if (key === 'isPF' || key === 'isOnline') {
      return value ? 'O' : 'X';
    }
    if (key === 'isSanctioned') {
      return value ? '징계' : '징계 없음';
    }
    return value ? 'true' : 'false';
  }

  const stringValue = String(value);

  if (stringValue.includes('->') && key !== 'status') {
    return stringValue
      .split(/\s*->\s*/)
      .map((partialValue) => formatExamReviewLogValue(key, partialValue))
      .join(' -> ');
  }

  if (key === 'action') {
    return ACTION_LABELS[stringValue] ?? stringValue;
  }

  if (key === 'status') {
    const formattedStatus = formatStatusValue(stringValue);
    return statusModifiedReason
      ? `${formattedStatus} (${String(statusModifiedReason)})`
      : formattedStatus;
  }

  if (key === 'deletionStatus' || key === 'visibilityStatus') {
    return formatStatusValue(stringValue);
  }

  if (key === 'lectureType') {
    return (
      LECTURE_TYPE_OPTIONS.find((option) => option.value === stringValue)
        ?.label ?? stringValue
    );
  }

  if (key === 'examType') {
    if (stringValue === 'MIDTERM' || stringValue === 'FINALTERM') {
      return convertExamTypeEnumToString(stringValue);
    }
    return stringValue;
  }

  if (isBooleanString(stringValue)) {
    return formatExamReviewLogValue(key, stringValue === 'true');
  }

  if (key === 'semester') {
    return SEMESTER_LABELS[stringValue] ?? stringValue;
  }

  return stringValue;
};
