import { ExternalLink } from 'lucide-react';

import { USER_FRONT_BASE_URL } from '@/shared/constants';

import { Button } from './ui/button';

export type OriginalPostButtonProps = {
  href: string | null | undefined;
  label: string;
  title?: string;
  isUserSnorose: boolean;
};

export function OriginalPostButton({
  href,
  label,
  title = `${label} 바로가기`,
  isUserSnorose,
}: OriginalPostButtonProps) {
  if (!href?.trim()) return null;

  const targetUrl = isUserSnorose
    ? `${USER_FRONT_BASE_URL}${href.startsWith('/') ? '' : '/'}${href}`
    : href;

  return (
    <Button asChild variant='outline' size='sm'>
      <a
        href={targetUrl}
        title={title}
        target='_blank'
        rel='noopener noreferrer'
      >
        {label}
        <ExternalLink className='size-4' aria-hidden='true' />
        <span className='sr-only'> (새 탭에서 열림)</span>
      </a>
    </Button>
  );
}
