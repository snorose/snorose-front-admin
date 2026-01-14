export interface AdjustSinglePoint {
  userId: number;
  difference?: number;
  category: string;
  sourceId?: number;
  source: string;
  memo?: string;
}

export interface PointFreezeBase {
  title: string;
  startAt: string;
  endAt: string;
}

export interface PointFreeze extends PointFreezeBase {
  id: number;
  createdAt: string;
  updatedAt: string;
}

export type CreatePointFreeze = PointFreezeBase;
export type UpdatePointFreeze = PointFreezeBase;

export interface AdjustAllMemberPoint {
  category: string;
  memo: string;
  difference: number;
}
