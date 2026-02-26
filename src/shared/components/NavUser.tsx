import {
  ExternalLink,
  ChevronsUpDown,
  LogOut,
  Rose,
  Instagram,
  NotebookPen,
} from 'lucide-react';
import { DropdownMenu, Sidebar } from '@/shared/components/ui';
import { useAuth } from '@/shared/hooks';

const EXTERNAL_LINKS = [
  {
    icon: ExternalLink,
    label: '스노로즈',
    url: 'https://snorose.com',
  },
  {
    icon: NotebookPen,
    label: '스노로즈 블로그',
    url: 'https://snorose.notion.site/1a37ef0aa3bf8071bcd0cb35c035636e',
  },
  {
    icon: Instagram,
    label: '인스타그램',
    url: 'https://www.instagram.com/snorose1906',
  },
] as const;

const ICON_SIZE = 16;

export function NavUser() {
  const { isMobile } = Sidebar.useSidebar();
  const { user, logout } = useAuth();

  return (
    <Sidebar.Menu>
      <Sidebar.MenuItem>
        <DropdownMenu>
          <DropdownMenu.Trigger asChild>
            <Sidebar.MenuButton
              size='lg'
              className='data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground focus:outline-none focus-visible:ring-0 focus-visible:ring-offset-0'
            >
              <div className='flex items-center'>
                <Rose size={ICON_SIZE} className='mr-2 text-red-400' />
                <span>{user?.nickname || '리자'}</span>
              </div>
              <ChevronsUpDown className='ml-auto size-4' />
            </Sidebar.MenuButton>
          </DropdownMenu.Trigger>
          <DropdownMenu.Content
            className='w-[var(--radix-dropdown-menu-trigger-width)] min-w-42 rounded-lg'
            side={isMobile ? 'bottom' : 'right'}
            align='end'
            sideOffset={4}
          >
            <DropdownMenu.Group>
              {EXTERNAL_LINKS.map(({ icon: Icon, label, url }) => (
                <DropdownMenu.Item key={label} asChild>
                  <a href={url} target='_blank' rel='noopener noreferrer'>
                    <Icon />
                    {label}
                  </a>
                </DropdownMenu.Item>
              ))}
            </DropdownMenu.Group>
            <DropdownMenu.Separator />
            <DropdownMenu.Item onClick={logout}>
              <LogOut />
              로그아웃
            </DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu>
      </Sidebar.MenuItem>
    </Sidebar.Menu>
  );
}
