// 상태 리스트
export const EXAM_CONFIRM_STATUS = [
  { code: 'CONFIRMED', label: '확인완료' },
  { code: 'UNCONFIRMED', label: '미확인' },
  { code: 'NEED_DISCUSS', label: '논의필요' },
  { code: 'NEED_ACTION', label: '징계필요' },
  { code: 'DELETED', label: '삭제됨' },
] as const;

// 수강 학기 자동 생성 함수 (2007년 ~ 현재년도)
const generateSemesterList = (): string[] => {
  const currentYear = new Date().getFullYear();
  const startYear = 2007;
  const semesterList: string[] = [];

  for (let year = currentYear; year >= startYear; year--) {
    semesterList.push(`${year}-겨울계절`);
    semesterList.push(`${year}-2`);
    semesterList.push(`${year}-여름계절`);
    semesterList.push(`${year}-1`);
  }

  return semesterList;
};

// 수강 학기
export const SEMESTER_LIST = generateSemesterList();

// 시험 종류 리스트
export const EXAM_TYPE_LIST = ['중간고사', '기말고사'];

// 강의 종류 옵션 리스트
export const LECTURE_TYPE_OPTIONS = [
  { value: 'MAJOR_REQUIRED', label: '전공필수' },
  { value: 'MAJOR_ELECTIVE', label: '전공선택' },
  { value: 'GENERAL_REQUIRED', label: '교양필수' },
  { value: 'GENERAL_ELECTIVE', label: '교양선택' },
  { value: 'OTHER', label: '기타' },
] as const;

// 강등 사유
export const DEGRADE_REASON_LIST = [
  // 일반 강등 (RELEGATION)
  {
    code: 'FRESHMAN_EXAM_REVIEW_POSSESSION',
    label: '규정 외 족보 취득 (새내기) - 6개월',
  },
  { code: 'CURRENT_WARNING_3_EXCEEDED', label: '누적 경고 3회 - 강등 1년' },
  { code: 'EXAM_REVIEW_POSSESSION', label: '규정 외 족보 취득 - 강등 2년' },
  {
    code: 'EXAM_REVIEW_PLAGIARIZED_UPLOAD',
    label: '타인 족보 업로드 - 강등 2년',
  },
  { code: 'UNOFFICIAL_EXAM_UPLOAD', label: '정규 시험 외 업로드 - 강등 2년' },
  { code: 'PASSWORD_PROTECTED_FILE', label: '암호가 걸려있는 파일 - 강등 2년' },

  // 영구 강등 (BLACKLIST)
  {
    code: 'EXAM_REVIEW_UNAUTHORIZED_DISTRIBUTION',
    label: '족보 무단 배포 - 영구 강등',
  },

  // 기타 사유를 직접 입력할 때 지정
  { code: 'ETC', label: '기타 - 강등기간/사유 직접 입력' },
];

export const WARNING_REASON_LIST = [
  // 경고 (WARNING)
  { code: 'LOW_QUALITY_POST', label: '무성의글 - 경고 1회' },
  { code: 'LOW_QUALITY_COMMENT', label: '무성의댓글 - 경고 1회' },
  {
    code: 'EXAM_REVIEW_TYPO_EXCESS',
    label: '족보 문항 수 및 분반 오기재 - 경고 1회',
  },
  {
    code: 'EXAM_REVIEW_FRAGMENTED_UPLOAD',
    label: '상시시험 업로드 - 경고 1회',
  },
  { code: 'EXAM_RECALL_UNDER_50', label: '족보 50% 미만 복기 - 경고 2회' },

  // 기타 사유를 직접 입력할 때 지정
  { code: 'ETC', label: '기타 - 경고횟수/사유 직접 입력' },
];
