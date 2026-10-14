import { NavLink, useLocation } from 'react-router-dom';

import { NavUser } from '@/shared/components';
import { Badge, Sidebar } from '@/shared/components/ui';
import { SIDEBAR_MENUS } from '@/shared/constants';
import { cn } from '@/shared/lib';

import { snoroseLogo } from '@/assets';

const sidebarMenuSubButtonClassName = cn(
  'hover:bg-blue-50 hover:!text-current',
  'data-[active=true]:bg-blue-100',
  'data-[active=true]:hover:!bg-blue-100 data-[active=true]:active:!bg-blue-100'
);

export const AppSidebar = ({
  className,
  ...props
}: React.ComponentProps<typeof Sidebar>) => {
  const location = useLocation();

  const isActive = (url: string) => {
    if (
      location.pathname.startsWith('/posts/manage/') &&
      location.pathname !== '/posts/manage'
    ) {
      const isFromComments = location.state?.from === 'comments';
      if (url === '/posts/comments') return isFromComments;
      if (url === '/posts/manage') return !isFromComments;
    }
    return location.pathname === url || location.pathname.startsWith(`${url}/`);
  };

  return (
    <Sidebar
      {...props}
      collapsible='offcanvas'
      className={cn('border-sidebar-border', className)}
    >
      <Sidebar.Content className='gap-0'>
        <div className='flex items-center justify-start px-4 pt-4 pb-2'>
          <img src={snoroseLogo} alt='logo' className='box-content h-5' />
        </div>

        <Sidebar.Group>
          <Sidebar.Menu className='p-2'>
            {SIDEBAR_MENUS.map((menu) => (
              <Sidebar.MenuItem key={menu.title}>
                <div className='flex h-8 items-center gap-2 p-2 text-sm font-semibold [&>svg]:size-4 [&>svg]:shrink-0'>
                  {menu.icon && <menu.icon />}
                  <span>{menu.title}</span>
                </div>
                <Sidebar.MenuSub>
                  {menu.items.map((subItem) => (
                    <Sidebar.MenuSubItem key={subItem.title}>
                      <Sidebar.MenuSubButton
                        asChild
                        isActive={isActive(subItem.url)}
                        className={sidebarMenuSubButtonClassName}
                      >
                        <NavLink to={subItem.url}>
                          <span>{subItem.title}</span>
                          {subItem.beta && (
                            <Badge variant='outline'>Beta</Badge>
                          )}
                        </NavLink>
                      </Sidebar.MenuSubButton>
                    </Sidebar.MenuSubItem>
                  ))}
                </Sidebar.MenuSub>
              </Sidebar.MenuItem>
            ))}
          </Sidebar.Menu>
        </Sidebar.Group>
      </Sidebar.Content>
      <Sidebar.Rail />
      <Sidebar.Footer>
        <NavUser />
      </Sidebar.Footer>
    </Sidebar>
  );
};
