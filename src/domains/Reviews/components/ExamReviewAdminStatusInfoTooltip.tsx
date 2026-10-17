import { useState } from 'react';

import { InfoIcon } from 'lucide-react';

import { Button, Tooltip } from '@/shared/components/ui';

interface ExamReviewAdminStatusInfoTooltipProps {
  label: string;
  description: string;
}

export function ExamReviewAdminStatusInfoTooltip({
  label,
  description,
}: ExamReviewAdminStatusInfoTooltipProps) {
  const [open, setOpen] = useState(false);

  return (
    <Tooltip.Provider delayDuration={150}>
      <Tooltip open={open} onOpenChange={setOpen}>
        <Tooltip.Trigger asChild>
          <Button
            type='button'
            variant='ghost'
            size='icon-sm'
            aria-label={label}
            className='text-muted-foreground relative size-6 after:absolute after:-inset-2.5 sm:after:-inset-1'
            onClick={(event) => {
              // Radix의 기본 클릭 닫기를 막아 터치로도 설명을 열 수 있게 한다.
              event.preventDefault();
              setOpen(true);
            }}
          >
            <InfoIcon className='size-4' aria-hidden='true' />
          </Button>
        </Tooltip.Trigger>
        <Tooltip.Content
          side='top'
          sideOffset={6}
          collisionPadding={12}
          className='w-max max-w-64 text-left leading-5 text-wrap break-keep'
        >
          {description}
        </Tooltip.Content>
      </Tooltip>
    </Tooltip.Provider>
  );
}
