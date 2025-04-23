
import React, { ReactNode } from 'react';
import { Navbar } from './Navbar';

type LayoutProps = {
  children: ReactNode;
};

export const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="min-h-screen bg-vibe-background flex flex-col">
      <Navbar />
      <main className="flex-grow">{children}</main>
      <footer className="bg-white border-t border-vibe-light/30 py-6">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2">
              <div className="h-6 w-6 rounded-full bg-vibe-primary flex items-center justify-center">
                <span className="text-white font-bold text-sm">V</span>
              </div>
              <span className="font-semibold text-vibe-primary">VibeFlow</span>
            </div>
            <div className="text-sm text-gray-500 mt-4 md:mt-0">
              &copy; {new Date().getFullYear()} VibeFlow. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
