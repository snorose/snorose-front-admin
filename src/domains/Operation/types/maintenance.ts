export interface ServerMaintenance {
  id: number;
  title: string;
  startAt: string;
  endAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface ServerMaintenanceListItem extends ServerMaintenance {
  number: number;
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED';
}

export interface ServerMaintenanceDetail {
  title: string;
  noticeMessage: string | null;
  startAt: string;
  endAt: string;
  memo: string;
  imageUrl: string | null;
}
