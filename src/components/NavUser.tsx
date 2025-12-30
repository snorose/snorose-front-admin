import {
  ExternalLink,
  ChevronsUpDown,
  LogOut,
  Rose,
  Instagram,
  NotebookPen,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuGroup,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui';
import { useAuth } from '@/hooks';

export function NavUser() {
  const { isMobile } = useSidebar();
  const { user, logout } = useAuth();

  const ICON_SIZE = 16;

  const SnoroseLinkButtonClick = () => {
    window.open('https://snorose.com', '_blank');
  };

  const BlogLinkButtonClick = () => {
    window.open(
      'https://snorose.notion.site/1a37ef0aa3bf8071bcd0cb35c035636e',
      '_blank'
    );
  };

  const InstagramLinkButtonClick = () => {
    window.open('https://www.instagram.com/snorose1906', '_blank');
  };

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size='lg'
              className='data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground'
            >
              <div className='flex items-center'>
                <Rose size={ICON_SIZE} className='mr-2 text-red-400' />
                <span>{user?.nickname || '리자'}</span>
              </div>
              <ChevronsUpDown className='ml-auto size-4' />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className='w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg'
            side={isMobile ? 'bottom' : 'right'}
            align='end'
            sideOffset={4}
          >
            <DropdownMenuGroup>
              <DropdownMenuItem onClick={SnoroseLinkButtonClick}>
                <ExternalLink />
                스노로즈
              </DropdownMenuItem>
              <DropdownMenuItem onClick={BlogLinkButtonClick}>
                <NotebookPen />
                스노로즈 블로그
              </DropdownMenuItem>
              <DropdownMenuItem onClick={InstagramLinkButtonClick}>
                <Instagram />
                인스타그램
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={logout}>
              <LogOut />
              로그아웃
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
