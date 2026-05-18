export type PopupLink = {
  title: string;
  url: string;
  isExternal: boolean;
};

export type PopupContent = {
  id: number;
  title: string;
  description: string;
  contentList: string[];
  links: PopupLink[];
  imageUrl: string;
  startDate: string;
  endDate: string;
  isEnabled: boolean;
  createdAt: string;
  updatedAt: string;
};
