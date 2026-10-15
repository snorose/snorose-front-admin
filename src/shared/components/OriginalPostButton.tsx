import { ExternalLink } from 'lucide-react';

import { Button } from './ui/button';

export type OriginalPostButtonProps = {
  href: string | null | undefined;
  label: string;
};

export function OriginalPostButton({ href, label }: OriginalPostButtonProps) {
  if (!href?.trim()) return null;

  return (
    <Button asChild variant='outline' size='sm'>
      <a
        href={href}
        title={`${label} 바로가기`}
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
