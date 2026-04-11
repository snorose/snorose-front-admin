import { useParams } from 'react-router-dom';

import { useMemberDetailState } from '@/domains/MemberInfo/hooks/useMemberDetailState';
import { useMemberDirectoryState } from '@/domains/MemberInfo/hooks/useMemberDirectoryState';

export function useMemberInfoPageState() {
  const { memberKey: rawMemberKey } = useParams<{ memberKey?: string }>();
  const memberKey = rawMemberKey ? decodeURIComponent(rawMemberKey) : null;
  const isDetailRoute = Boolean(memberKey);

  const directoryState = useMemberDirectoryState(isDetailRoute);
  const detailState = useMemberDetailState({
    currentPage: directoryState.currentPage,
    loadMembers: directoryState.loadMembers,
    memberKey,
    members: directoryState.members,
    searchResultMembers: directoryState.searchResultMembers,
    updateCachedMember: directoryState.updateCachedMember,
  });

  return {
    ...directoryState,
    ...detailState,
    isDetailRoute,
    memberKey,
  };
}
