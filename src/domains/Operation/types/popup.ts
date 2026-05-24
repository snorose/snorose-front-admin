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
  isEnabled: boolean;
  createdAt: string;
  updatedAt: string;
};
