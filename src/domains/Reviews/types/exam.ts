import {
  EXAM_TYPE,
  LECTURE_TYPE,
  SEMESTER,
  STATUS,
} from '@/domains/Reviews/constants';

// constants/exam.ts에서 정의된 enum 값을 사용
export type LectureType = (typeof LECTURE_TYPE)[keyof typeof LECTURE_TYPE];

export type Semester = (typeof SEMESTER)[keyof typeof SEMESTER];

export type ExamType = (typeof EXAM_TYPE)[keyof typeof EXAM_TYPE];

export type Status = (typeof STATUS)[keyof typeof STATUS];

export const EXAM_REVIEW_SORTS = ['ASC', 'DESC'] as const;

export type ExamReviewSort = (typeof EXAM_REVIEW_SORTS)[number];

export type ExamReviewProcessStatus =
  | 'VISIBLE'
  | 'USER_DELETED'
  | 'ADMIN_DELETED'
  | 'ADMIN_HIDDEN'
  | 'AUTO_HIDDEN'
  | 'SANCTIONED'
  | 'DESANCTIONED';

export const isExamReviewSort = (
  value?: string | null
): value is ExamReviewSort =>
  EXAM_REVIEW_SORTS.includes(value as ExamReviewSort);

export interface ExamReviewSearchParams {
  startDate?: string;
  endDate?: string;
  keywordAuthor?: string;
  keywordPost?: string;
  sort?: ExamReviewSort;
  lectureYear?: number;
  semester?: string;
  examType?: string;
  isConfirmed?: boolean;
  isDiscussed?: boolean;
  isReported?: boolean;
  statuses?: string;
}

export interface ExamReview {
  id: number;
  status: string;
  reviewTitle: string;
  courseName: string;
  professor: string;
  semester: string;
  examType: string;
  classNumber: string;
  questionDetail: string;
  uploadTime: string;
  userDisplay: string;
  isDiscussed: boolean;
  isReported: boolean;
  reportCount: number;
  processStatuses: ExamReviewProcessStatus[];
}

export interface ExamReviews {
  postId: number;
  title?: string;
  status?: string;
  isConfirmed?: boolean;
  content?: string;
  lecture?: string;
  professor?: string;
  encryptedUserId: string | null;
  userDisplay?: string | null;
  userName: string | null;
  reportCount?: number;
  isDiscussed?: boolean;
  deletionStatus?: ExamReviewProcessStatus | null;
  isSanctioned?: boolean | 'true' | 'false' | null;
  visibilityStatus?: ExamReviewProcessStatus | null;
  lectureYear?: number;
  lectureSemester?: Semester;
  examType?: ExamType;
  classNumber?: number;
  contentDate: string;
  encryptedAdminId: string | null;
  adminName: string | null;
}

export interface ConfirmExamReviewRequest {
  isConfirmed: boolean;
}

export interface ConfirmExamReviewResponse {
  isSuccess: boolean;
  code: number;
  message: string;
  result: {
    postId: number;
    isConfirmed: boolean;
  };
}

export interface UpdateExamReviewPost {
  lectureName?: string;
  professor?: string;
  classNumber?: number;
  lectureYear?: number;
  semester?: Semester;
  lectureType?: LectureType;
  isPF?: boolean;
  isOnline?: boolean;
  status?: string;
  examType?: ExamType;
  questionDetail?: string;
}

export interface UpdateExamReviewRequest {
  file?: File;
  post: UpdateExamReviewPost;
}

export interface UpdateExamReviewResponse {
  isSuccess: boolean;
  code: number;
  message: string;
  result: {
    postId: number;
  };
}

export interface DeleteExamReviewResponse {
  isSuccess: boolean;
  code: number;
  message: string;
  result: {
    postId: number;
  };
}

export interface ExamReviewDetailLog {
  encryptedAdminId: string | null;
  adminName: string | null;
  changes: Record<string, string | number | boolean | null>;
  createdAt: string;
}

export interface ExamReviewDetailResult {
  encryptedUserId: string;
  userDisplay: string;
  postId: number;
  title?: string;
  commentCount: number;
  status?: string;
  createdAt: string;
  lectureName: string;
  professor: string;
  classNumber: number;
  lectureYear: number;
  semester: Semester;
  lectureType: LectureType;
  isPF: boolean;
  isOnline: boolean;
  examType: ExamType;
  isConfirmed: boolean;
  isDiscussed: boolean;
  deletionStatus: ExamReviewProcessStatus | null;
  isSanctioned: boolean | 'true' | 'false' | null;
  visibilityStatus: ExamReviewProcessStatus | null;
  memo: string | null;
  fileName: string;
  questionDetail: string;
  logs: ExamReviewDetailLog[];
}

export interface ExamReviewDetailResponse {
  isSuccess: boolean;
  code: number;
  message: string;
  result: ExamReviewDetailResult;
}

export interface ExamReviewsResponse {
  isSuccess: boolean;
  code: number;
  message: string;
  result: {
    data: ExamReviews[];
    hasNext: boolean;
    totalPage?: number;
    totalCount?: number;
  };
}
