export interface AdjustSinglePoint {
  userId: number;
  difference?: number;
  category: string;
  sourceId?: number;
  source: string;
  memo?: string;
}

export interface FreezingPoint {
  title: string;
  startAt: string;
  endAt: string;
}
