export const EXAM_REVIEW_LIST_DUMMY = [
  {
    id: 1,
    status: 'CONFIRMED',
    reviewTitle: '수학 중간고사 후기 - 난이도 적절',
    courseName: '미적분학 I',
    professor: '김교수',
    semester: '2024-1',
    examType: '중간고사',
    examFormat: '객관식 20문항, 주관식 5문항',
    uploadTime: '2024-03-15 14:30',
    author: '김학생',
    discussion: '계산 실수 주의',
    manager: '이관리자',
  },
  {
    id: 2,
    status: 'CONFIRMED_WITH_MODIFICATION',
    reviewTitle: '영어 기말고사 후기 - 리스닝 어려움',
    courseName: '영어회화 II',
    professor: '박교수',
    semester: '2024-1',
    examType: '기말고사',
    examFormat: '리스닝 30문항, 작문 2문항',
    uploadTime: '2024-06-20 16:45',
    author: '이학생',
    discussion: '리스닝 속도 빠름',
    manager: '박관리자',
  },
  {
    id: 3,
    status: 'CONFIRMED',
    reviewTitle: '물리학 중간고사 후기 - 공식 암기 필수',
    courseName: '일반물리학 I',
    professor: '최교수',
    semester: '2024-2',
    examType: '중간고사',
    examFormat: '계산문제 15문항',
    uploadTime: '2024-09-10 10:20',
    author: '박학생',
    discussion: '공식 정리 중요',
    manager: '김관리자',
  },
  {
    id: 4,
    status: 'PUNISHMENT',
    reviewTitle: '국어 모의고사 후기',
    courseName: '현대문학의 이해',
    professor: '정교수',
    semester: '2024-2',
    examType: '모의고사',
    examFormat: '서술형 10문항',
    uploadTime: '2024-10-05 13:15',
    author: '최학생',
    discussion: '부적절한 내용 포함',
    manager: '이관리자',
  },
  {
    id: 5,
    status: 'DELETED',
    reviewTitle: '화학 기말고사 후기 - 실험 문제 다수',
    courseName: '유기화학 II',
    professor: '한교수',
    semester: '2024-2',
    examType: '기말고사',
    examFormat: '실험문제 8문항, 이론 12문항',
    uploadTime: '2024-12-15 09:30',
    author: '정학생',
    discussion: '실험 과정 숙지 필요',
    manager: '박관리자',
  },
];

// 상태 리스트
export const STATUS_COLOR = [
  { id: 1, code: 'CONFIRMED', name: '확인완료', color: 'bg-blue-500' },
  {
    id: 2,
    code: 'CONFIRMED_WITH_MODIFICATION',
    name: '수정+확인완료',
    color: 'bg-green-500',
  },
  { id: 3, code: 'NEED_DISCUSSION', name: '논의필요', color: 'bg-orange-500' },
  { id: 4, code: 'PUNISHMENT', name: '징계', color: 'bg-red-500' },
  { id: 5, code: 'DELETED', name: '삭제된 족보', color: 'bg-gray-300' },
  { id: 6, code: 'UNCONFIRMED', name: '미확인 족보', color: 'bg-gray-900' },
];

// 수강 학기
export const SEMESTER_LIST = [
  '2025-1',
  '2025-여름',
  '2025-2',
  '2025-겨울',
  '2024-1',
  '2024-여름',
  '2024-2',
  '2024-겨울',
];

// 시험 종류 리스트
export const EXAM_TYPE_LIST = ['중간고사', '기말고사'];

// 담당자 리스트
export const MANAGER_LIST = ['김준희', '류미성', '장아현'];
