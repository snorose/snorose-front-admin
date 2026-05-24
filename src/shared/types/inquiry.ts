export type InquiryGroup = 'INQUIRY' | 'REPORT' | 'ETC';

export type InquirySubGroup =
  | 'EXAM_REVIEW_INQUIRY'
  | 'EVENT_INQUIRY'
  | 'NOTICE_INQUIRY'
  | 'ETC_INQUIRY'
  | 'POST_REPORT'
  | 'EXAM_REVIEW_REPORT'
  | 'COMMENT_REPORT'
  | 'USER_REPORT';

export type InquiryStatus = 'PENDING' | 'COMPLETED' | 'HOLD';

export type InquiryCategory =
  | 'EXAM_REVIEW_INQUIRY'
  | 'EVENT_INQUIRY'
  | 'NOTICE_INQUIRY'
  | 'ETC_INQUIRY'
  | 'POST_INSULT_OR_DEFAMATION'
  | 'POST_COMMERCIAL_ADVERTISEMENT'
  | 'POST_ILLEGAL_CONTENT'
  | 'POST_PERSONAL_DATA_LEAK'
  | 'POST_AGITATION_OR_DISPUTE'
  | 'POST_OBSCENE_OR_IMMORAL'
  | 'POST_LOW_QUALITY'
  | 'POST_OFFENSIVE_CONTENT'
  | 'POST_ETC'
  | 'EXAM_FALSE_REVIEW'
  | 'EXAM_COMMERCIAL_SELLING'
  | 'EXAM_ETC'
  | 'COMMENT_INSULT_OR_DEFAMATION'
  | 'COMMENT_COMMERCIAL_ADVERTISEMENT'
  | 'COMMENT_AGITATION_OR_DISPUTE'
  | 'COMMENT_PERSONAL_DATA_LEAK'
  | 'COMMENT_OBSCENE_OR_IMMORAL'
  | 'COMMENT_LOW_QUALITY'
  | 'COMMENT_ETC'
  | 'USER_IMPERSONATION'
  | 'USER_FRAUD'
  | 'USER_OUTSIDER'
  | 'USER_HARASSMENT'
  | 'USER_ETC';

export type InquiryListItem = {
  postId: number;
  title: string;
  userId: number;
  userLoginId: string;
  createdAt: string;
  isEdited: boolean;
  status: InquiryStatus;
  group: InquiryGroup;
  subGroup: InquirySubGroup;
};

export type InquiryAttachment = {
  id: number;
  url: string;
  type: 'PHOTO' | 'VIDEO';
  fileName: string;
  fileComment: string;
};

export type InquiryDetail = {
  postId: number;
  userRoleId: number;
  isWriter: boolean;
  userId: number;
  userDisplay: string;
  title: string;
  content: string;
  reportCause: InquiryCategory | null;
  target: string | null;
  link: string | null;
  group: InquiryGroup;
  subGroup: InquirySubGroup;
  status: InquiryStatus;
  commentCount: number;
  createdAt: string;
  updatedAt: string | null;
  isEdited: boolean;
  isWriterWithdrawn: boolean;
  attachments: InquiryAttachment[];
};

export type AdminInquiryListResponse = {
  isSuccess: boolean;
  code: number;
  message: string;
  result: {
    hasNext: boolean;
    data: InquiryListItem[];
  };
};

export type AdminInquiryDetailResponse = {
  isSuccess: boolean;
  code: number;
  message: string;
  result: InquiryDetail;
};

export type AdminInquiryStatusUpdateRequest = {
  status: InquiryStatus;
};

export type AdminInquiryStatusUpdateResponse = {
  isSuccess: boolean;
  code: number;
  message: string;
  result: {
    inquiryId: number;
  };
};
