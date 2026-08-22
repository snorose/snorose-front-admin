import type { ReactNode } from 'react';

import { Megaphone } from 'lucide-react';

import { Alert } from '@/shared/components/ui';

interface NoticePanelProps {
  title?: string;
  items: readonly ReactNode[];
}

export function NoticePanel({ title = '안내 사항', items }: NoticePanelProps) {
  return (
    <Alert>
      <Megaphone aria-hidden='true' />
      <Alert.Title>{title}</Alert.Title>
      <Alert.Description>
        <ul className='list-inside list-disc text-sm'>
          {items.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      </Alert.Description>
    </Alert>
  );
}
