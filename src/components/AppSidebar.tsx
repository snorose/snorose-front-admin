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
  SidebarGroupLabel,
  SidebarRail,
  SidebarFooter,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
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
    const storedStates = localStorage.getItem('sidebar-open-states');
    if (storedStates) {
      try {
        setOpenStates(JSON.parse(storedStates));
      } catch (error) {
        console.error('Error parsing sidebar open states:', error);
        localStorage.removeItem('sidebar-open-states');
      }
    }
  }, []);

  const handleOpenChange = (itemTitle: string, open: boolean) => {
    const updated = { ...openStates, [itemTitle]: open };
    setOpenStates(updated);
    localStorage.setItem('sidebar-open-states', JSON.stringify(updated));
  };

  return (
    <Sidebar {...props}>
      <SidebarContent className='gap-0'>
        <div className='flex items-center justify-start p-4'>
          <img src={snoroseLogo} alt='logo' className='box-content h-5' />
        </div>

        {SIDEBAR_MENUS.map(({ title, items }) => (
          <Collapsible
            key={title}
            title={title}
            className='group/collapsible'
            open={openStates[title] ?? false}
            onOpenChange={(open) => {
              handleOpenChange(title, open);
            }}
          >
            <SidebarGroup>
              <SidebarGroupLabel
                asChild
                className='group/label text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground text-sm'
              >
                <CollapsibleTrigger>
                  {title}
                  <ChevronRight className='ml-auto transition-transform group-data-[state=open]/collapsible:rotate-90' />
                </CollapsibleTrigger>
              </SidebarGroupLabel>
              {items?.length ? (
                <CollapsibleContent>
                  <SidebarMenuSub>
                    {items.map(({ title: subMenuTitle, url: subMenuUrl }) => (
                      <SidebarMenuSubItem key={subMenuTitle}>
                        <SidebarMenuSubButton
                          asChild
                          isActive={isActive(subMenuUrl)}
                        >
                          <NavLink to={subMenuUrl}> {subMenuTitle}</NavLink>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    ))}
                  </SidebarMenuSub>
                </CollapsibleContent>
              ) : null}
            </SidebarGroup>
          </Collapsible>
        ))}
      </SidebarContent>
      <SidebarRail />
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
};
