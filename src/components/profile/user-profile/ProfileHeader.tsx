
import React from 'react';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface ProfileHeaderProps {
  user: any;
}

export const ProfileHeader = ({ user }: ProfileHeaderProps) => {
  return (
    <CardHeader className="flex flex-col items-center text-center bg-gradient-to-r from-vibe-primary/10 to-vibe-primary/5 pb-6">
      <Avatar className="h-24 w-24 border-4 border-white shadow-sm">
        <AvatarImage src={user.photoURL || ''} alt={user.displayName} />
        <AvatarFallback className="bg-vibe-primary text-white text-xl">
          {user.displayName ? user.displayName.charAt(0) : 'U'}
        </AvatarFallback>
      </Avatar>
      <CardTitle className="mt-4 text-2xl">{user.displayName || 'User'}</CardTitle>
      <p className="text-gray-500">{user.email}</p>
    </CardHeader>
  );
};
