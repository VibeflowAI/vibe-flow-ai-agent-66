
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { SidebarProvider, SidebarTrigger, SidebarInset } from '@/components/ui/sidebar';
import { AppSidebar } from './AppSidebar';

type AppLayoutProps = {
  children: React.ReactNode;
};

export const AppLayout = ({ children }: AppLayoutProps) => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/signin" replace />;
  }

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex min-h-screen w-full bg-vibe-background">
        <AppSidebar />
        <SidebarInset className="px-4 py-6 max-w-7xl mx-auto">
          <div className="mx-auto w-full">
            <div className="flex justify-between items-center mb-6">
              <div className="text-2xl font-bold text-vibe-primary">
                {/* Empty div to maintain spacing in header */}
              </div>
            </div>
            
            {/* Repositioned sidebar trigger button */}
            <div className="fixed top-20 left-4 z-20">
              <SidebarTrigger className="inline-flex md:hidden h-12 w-12 p-3 rounded-full bg-vibe-primary/10 hover:bg-vibe-primary/20 transition-colors shadow-md" />
            </div>
            
            {children}
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};
