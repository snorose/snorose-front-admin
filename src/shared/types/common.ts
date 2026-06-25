export type BaseResponse<T = void> = {
  isSuccess: boolean;
  code: number;
  message: string;
  result: T;
};
