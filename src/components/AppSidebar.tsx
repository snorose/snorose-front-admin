import { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarRail,
  SidebarFooter,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenu,
  Badge,
} from '@/components/ui';
import { snoroseLogo } from '@/assets';
import { SIDEBAR_MENUS } from '@/constants';
import { NavUser } from '@/components';

export const AppSidebar = ({
  ...props
}: React.ComponentProps<typeof Sidebar>) => {
  const [openStates, setOpenStates] = useState<Record<string, boolean>>({});
  const location = useLocation();

  const isActive = (url: string) => location.pathname.startsWith(url);

  useEffect(() => {
    const stored = sessionStorage.getItem('sidebar-open-states');
    if (stored) {
      try {
        setOpenStates(JSON.parse(stored));
      } catch {
        sessionStorage.removeItem('sidebar-open-states');
      }
    }
  }, []);

  const handleOpenChange = (title: string, open: boolean) => {
    const updated = { ...openStates, [title]: open };
    setOpenStates(updated);
    sessionStorage.setItem('sidebar-open-states', JSON.stringify(updated));
  };

  return (
    <Sidebar {...props}>
      <SidebarContent className='gap-0'>
        <div className='flex items-center justify-start px-4 pt-4 pb-2'>
          <img src={snoroseLogo} alt='logo' className='box-content h-5' />
        </div>

        <SidebarGroup>
          <SidebarMenu className='p-2'>
            {SIDEBAR_MENUS.map((menu) => (
              <Collapsible
                key={menu.title}
                asChild
                open={openStates[menu.title] ?? false}
                onOpenChange={(open) => handleOpenChange(menu.title, open)}
                className='group/collapsible'
              >
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton tooltip={menu.title}>
                      {menu.icon && <menu.icon />}
                      <span>{menu.title}</span>
                      <ChevronRight className='ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90' />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {menu.items?.map((subItem) => (
                        <SidebarMenuSubItem key={subItem.title}>
                          <SidebarMenuSubButton
                            asChild
                            isActive={isActive(subItem.url)}
                          >
                            <NavLink to={subItem.url}>
                              <span>{subItem.title}</span>{' '}
                              {subItem.beta && (
                                <Badge variant='outline'>Beta</Badge>
                              )}
                            </NavLink>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarRail />
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
};
