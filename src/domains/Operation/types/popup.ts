export type PopupLink = {
  title: string;
  url: string;
  isExternal: boolean;
};

export type PopupContent = {
  id: number;
  title: string;
  bodyMarkdown: string;
  imageFileName: string;
  startDate: string;
  endDate: string;
  displayPriority: number;
  createdAt: string;
  updatedAt: string;
};

export type PopupStatus = 'SCHEDULED' | 'ACTIVE' | 'ENDED';

export type PopupSummary = {
  id: number;
  title: string;
  displayOrder: number;
  startDate: string;
  endDate: string;
  status: PopupStatus;
  createdAt: string;
  updatedAt: string | null;
};

export type PopupDetail = PopupSummary & {
  description: string | null;
  imageUrl: string | null;
};

export type PopupListResult = {
  hasNext: boolean;
  totalPage: number;
  totalCount: number;
  currentCount: number;
  data: PopupSummary[];
};

export type CreatePopupRequest = {
  title: string;
  description?: string | null;
  startDate: string;
  endDate: string;
  displayOrder?: number;
};

export type UpdatePopupRequest = Partial<CreatePopupRequest> & {
  removeImage?: boolean;
};
