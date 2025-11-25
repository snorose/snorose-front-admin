import { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { ChevronRight, Rose } from 'lucide-react';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenuButton,
  SidebarRail,
  SidebarFooter,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
} from '@/components/ui';
import { snoroseLogo } from '@/assets';
import { SIDEBAR_MENUS } from '@/constants';

export const AppSidebar = ({
  ...props
}: React.ComponentProps<typeof Sidebar>) => {
  const [openStates, setOpenStates] = useState<Record<string, boolean>>({});
  const location = useLocation();
  const isActive = (url: string) => location.pathname.startsWith(url);

  const ICON_SIZE = 16;

  useEffect(() => {
    const storedStates = localStorage.getItem('sidebar-open-states');
    if (storedStates) {
      setOpenStates(JSON.parse(storedStates));
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

        {SIDEBAR_MENUS.map((item) => (
          <Collapsible
            key={item.title}
            title={item.title}
            className='group/collapsible'
            open={openStates[item.title] ?? false}
            onOpenChange={(open) => {
              handleOpenChange(item.title, open);
            }}
          >
            <SidebarGroup>
              <SidebarGroupLabel
                asChild
                className='group/label text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground text-sm'
              >
                <CollapsibleTrigger>
                  {item.title}
                  <ChevronRight className='ml-auto transition-transform group-data-[state=open]/collapsible:rotate-90' />
                </CollapsibleTrigger>
              </SidebarGroupLabel>
              {item.items?.length ? (
                <CollapsibleContent>
                  <SidebarMenuSub>
                    {item.items.map((item) => (
                      <SidebarMenuSubItem key={item.title}>
                        <SidebarMenuSubButton
                          asChild
                          isActive={isActive(item.url)}
                        >
                          <NavLink to={item.url}> {item.title}</NavLink>
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
        <SidebarMenuButton asChild>
          <div className='flex items-center'>
            <Rose size={ICON_SIZE} className='mr-2 text-red-400' />
            <span>리자 이름</span>
          </div>
        </SidebarMenuButton>
      </SidebarFooter>
    </Sidebar>
  );
};
