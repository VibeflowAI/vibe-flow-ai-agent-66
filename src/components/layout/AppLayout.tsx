
import React, { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { SidebarProvider, SidebarTrigger, SidebarInset } from '@/components/ui/sidebar';
import { AppSidebar } from './AppSidebar';
import { useAuth } from '@/contexts/AuthContext';

type AppLayoutProps = {
  children: ReactNode;
};

export const AppLayout = ({ children }: AppLayoutProps) => {
  const { user } = useAuth();

  // If user is not logged in, redirect to home page
  if (!user) {
    return <Navigate to="/" />;
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-vibe-background">
        <AppSidebar />
        <SidebarInset className="p-4">
          <div className="container mx-auto">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold">VibeFlow</h1>
              <SidebarTrigger />
            </div>
            {children}
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};
