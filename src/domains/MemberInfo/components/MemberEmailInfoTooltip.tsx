import { useState } from 'react';

import { InfoIcon } from 'lucide-react';

import { Button, Tooltip } from '@/shared/components/ui';

export function MemberEmailInfoTooltip() {
  const [open, setOpen] = useState(false);

  return (
    <Tooltip.Provider delayDuration={150}>
      <Tooltip open={open} onOpenChange={setOpen}>
        <Tooltip.Trigger asChild>
          <Button
            type='button'
            variant='ghost'
            size='icon-sm'
            aria-label='이메일 변경 안내'
            className='text-muted-foreground size-11 sm:size-8'
            onClick={(event) => {
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
          이메일은 숙명인 메일로만 변경할 수 있습니다.
          <br />
          리뉴얼 이전에 가입한 계정은 숙명인 메일이 아닐 수 있습니다.
        </Tooltip.Content>
      </Tooltip>
    </Tooltip.Provider>
  );
}
