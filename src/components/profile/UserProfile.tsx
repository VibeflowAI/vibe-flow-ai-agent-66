
import React from 'react';
import { Card } from '@/components/ui/card';
import { UserProfile as RefactoredUserProfile } from './user-profile';

export const UserProfile = () => {
  return (
    <Card className="w-full shadow-md">
      <RefactoredUserProfile />
    </Card>
  );
};
