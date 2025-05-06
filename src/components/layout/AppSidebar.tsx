
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';
import { LogOut, Home, BarChart, MessageSquare, User, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';

export function AppSidebar() {
  const location = useLocation();
  const { signOut } = useAuth();
  const { open, openMobile, setOpenMobile } = useSidebar();
  const isMobile = useIsMobile();

  // Define our navigation items
  const navigationItems = [
    { title: 'Dashboard', icon: Home, path: '/dashboard' },
    { title: 'Stats', icon: BarChart, path: '/stats' },
    { title: 'Chat', icon: MessageSquare, path: '/chat' },
    { title: 'Profile', icon: User, path: '/profile' },
    { title: 'Settings', icon: Settings, path: '/settings' },
  ];

  // Handle clicks to close the menu in mobile portrait mode after selection
  const handleMenuItemClick = () => {
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  return (
    <Sidebar>
      <SidebarHeader className="sticky top-0 z-20 bg-sidebar">
        <div className="flex items-center p-2">
          <div className="h-8 w-8 rounded-full bg-vibe-primary flex items-center justify-center mr-2">
            <span className="text-white font-bold text-xl">V</span>
          </div>
          <span className="font-bold text-xl text-vibe-primary">VibeFlow</span>
        </div>
      </SidebarHeader>
      
      <SidebarContent className="flex-grow overflow-auto">
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild 
                    isActive={location.pathname === item.path}
                    tooltip={item.title}
                    onClick={handleMenuItemClick}
                  >
                    <Link to={item.path}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="sticky bottom-0 z-20 bg-sidebar">
        <div className="p-2">
          <Button 
            variant="outline" 
            className="w-full justify-start" 
            onClick={signOut}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
