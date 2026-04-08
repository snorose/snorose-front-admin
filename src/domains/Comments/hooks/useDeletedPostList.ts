import { useQuery } from '@tanstack/react-query';

import { getDeletedPosts } from '@/apis';

export const useDeletedPostList = (page: number) => {
  return useQuery({
    queryKey: ['deletedPosts', page],
    queryFn: () => getDeletedPosts(page),
  });
};
