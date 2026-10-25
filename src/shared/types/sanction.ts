export interface AdminSanctionResponse {
  type: string;
  createdAt: string;
  startAt: string;
  relegationMonth?: number | null;
  reason: string;
  encryptedAdminId: string;
  memo?: string;
}

export interface AdminSanctionListResult {
  hasNext: boolean;
  totalPage: number;
  totalCount: number;
  currentCount: number;
  data: AdminSanctionResponse[];
}
