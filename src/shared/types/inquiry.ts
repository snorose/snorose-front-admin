export type InquiryGroup = 'INQUIRY' | 'REPORT' | 'ETC' | 'Inquiry' | 'Report';

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

export type AdminInquiryListResponse = {
  isSuccess: boolean;
  code: number;
  message: string;
  result: {
    hasNext: boolean;
    data: InquiryListItem[];
  };
};
