import { Badge } from '@/shared/components/ui';

export default function WithdrawnUserBadge() {
  return (
    <Badge
      variant='unstyled'
      className='border-transparent bg-gray-900 text-white'
    >
      탈퇴
    </Badge>
  );
}
