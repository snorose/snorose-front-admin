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
}

export interface ExamReviews {
  postId: number;
  status: string;
  content: string;
  lecture: string;
  professor: string;
  encryptedUserId: string | null;
  userName: string | null;
  lectureYear: number;
  lectureSemester: Semester;
  examType: ExamType;
  classNumber: number;
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
  isConfirmed?: boolean;
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

export interface ExamReviewDetailResult {
  encryptedUserId: string;
  userDisplay: string;
  isWriter: boolean;
  isWriterWithdrawn: boolean;
  postId: number;
  title: string;
  commentCount: number;
  scrapCount: number;
  isScrapped: boolean;
  createdAt: string;
  isNotice: boolean;
  isEdited: boolean;
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
  fileName: string;
  questionDetail: string;
  isDownloaded: boolean;
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
  };
}
