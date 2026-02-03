import { STATUS_COLOR } from '@/shared/constants';

/**
 * lectureType enum을 문자열로 변환
 * @param lectureTypeEnum - 변환할 lectureType enum 값
 * @returns 한국어 문자열
 */
export const convertLectureTypeToString = (
  lectureTypeEnum:
    | 'MAJOR_REQUIRED'
    | 'MAJOR_ELECTIVE'
    | 'GENERAL_REQUIRED'
    | 'GENERAL_ELECTIVE'
    | 'OTHER'
): string => {
  const typeMap: Record<string, string> = {
    MAJOR_REQUIRED: '전공필수',
    MAJOR_ELECTIVE: '전공선택',
    GENERAL_REQUIRED: '교양필수',
    GENERAL_ELECTIVE: '교양선택',
    OTHER: '기타',
  };
  return typeMap[lectureTypeEnum] || lectureTypeEnum;
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
  if (
    semesterStr.includes('1') &&
    !semesterStr.includes('여름') &&
    !semesterStr.includes('겨울')
  ) {
    return 'FIRST';
  }
  if (
    semesterStr.includes('2') &&
    !semesterStr.includes('여름') &&
    !semesterStr.includes('겨울')
  ) {
    return 'SECOND';
  }
  if (semesterStr.includes('여름')) {
    return 'SUMMER';
  }
  if (semesterStr.includes('겨울')) {
    return 'WINTER';
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
  const statusOption = STATUS_COLOR.find((s) => s.code === statusCode);
  return statusOption?.label || '확인';
};
