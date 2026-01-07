export interface AdjustSinglePoint {
  userId: number;
  difference?: number;
  category: string;
  sourceId?: number;
  source: string;
  memo?: string;
}

export interface PointFreeze {
  id: number;
  title: string;
  startAt: string;
  endAt: string;
  createdAt: string;
  updatedAt: string;
}
