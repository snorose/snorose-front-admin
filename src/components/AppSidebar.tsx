import { ChevronRight } from 'lucide-react';
import { SIDEBAR_MENUS } from '@/constants';
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
import { Rose } from 'lucide-react';
import { snoroseLogo } from '@/assets';

export const AppSidebar = ({
  ...props
}: React.ComponentProps<typeof Sidebar>) => {
  const ICON_SIZE = 16;

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
            defaultOpen
            className='group/collapsible'
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
                        <SidebarMenuSubButton asChild>
                          <a href={item.url}>{item.title}</a>
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
