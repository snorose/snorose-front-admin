import type { ReactNode } from 'react';

import { Megaphone } from 'lucide-react';

import { Alert } from '@/shared/components/ui';

interface NoticePanelProps {
  title?: string;
  items: readonly ReactNode[];
}

/**
 * 여러 안내 문구를 제목과 목록 형태로 보여주는 공통 컴포넌트입니다.
 * 제목을 전달하지 않으면 기본 제목으로 '안내 사항'을 표시합니다.
 * 문구 일부를 굵게 표시하려면 `<strong>` 태그를 사용합니다.
 *
 * @example
 * ```tsx
 * <NoticePanel
 *   items={[
 *     '파일 형식을 확인해 주세요.',
 *     <>문구 일부를 <strong>굵게 표시</strong>할 수 있습니다.</>,
 *   ]}
 * />
 * ```
 */
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
