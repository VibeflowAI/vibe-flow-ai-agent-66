
import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface UpdateDialogProps {
  isDialogOpen: boolean;
  setIsDialogOpen: (isOpen: boolean) => void;
  isLoading: boolean;
}

export const UpdateDialog = ({ isDialogOpen, setIsDialogOpen, isLoading }: UpdateDialogProps) => {
  return (
    <Dialog open={isDialogOpen} onOpenChange={(open) => {
      // Prevent manual closing of dialog during loading
      if (isLoading) return;
      setIsDialogOpen(open);
    }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Updating Profile</DialogTitle>
          <DialogDescription>
            Please wait while your profile information is being updated...
          </DialogDescription>
        </DialogHeader>
        <div className="flex items-center justify-center py-4">
          <div className="flex flex-col items-center gap-2">
            <div className="h-8 w-8 rounded-full border-4 border-t-transparent border-vibe-primary animate-spin"></div>
            {isLoading && <p className="text-sm text-gray-500">This may take a moment...</p>}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
