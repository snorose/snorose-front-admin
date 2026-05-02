import { axiosInstance } from '@/shared/axios/instance';

export interface PostCommentResponse {
  id: number;
  postId: number;
  encryptedUserId: string;
  userRoleId: number;
  userDisplay: string;
  isWriter: boolean;
  isWriterWithdrawn: boolean;
  content: string;
  likeCount: number;
  createdAt: string;
  updatedAt: string | null;
  isVisible: boolean;
  isUpdated: boolean;
  isDeleted: boolean;
  isLiked: boolean;
  children: PostCommentResponse[];
}

export interface GetPostCommentsResponse {
  isSuccess: boolean;
  code: number;
  message: string;
  result: {
    hasNext: boolean;
    data: PostCommentResponse[];
  };
}

export const getPostCommentsAPI = async (
  postId: number,
  page: number
): Promise<GetPostCommentsResponse> => {
  const response = await axiosInstance.get(`/v1/posts/${postId}/comments`, {
    params: {
      page,
    },
  });

  return response.data;
};
