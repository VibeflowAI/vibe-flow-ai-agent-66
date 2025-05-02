
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { ProfileHeader } from './ProfileHeader';
import { ProfileDisplay } from './ProfileDisplay';
import { ProfileForm } from './ProfileForm';
import { UpdateDialog } from './UpdateDialog';

export const UserProfile = () => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  if (!user) return null;

  return (
    <>
      <ProfileHeader 
        user={user} 
      />
      
      {isEditing ? (
        <ProfileForm 
          user={user}
          isLoading={isLoading}
          setIsLoading={setIsLoading}
          setIsDialogOpen={setIsDialogOpen}
          setIsEditing={setIsEditing}
        />
      ) : (
        <ProfileDisplay 
          user={user} 
          setIsEditing={setIsEditing} 
        />
      )}

      {/* Loading Dialog */}
      <UpdateDialog 
        isDialogOpen={isDialogOpen}
        setIsDialogOpen={setIsDialogOpen}
        isLoading={isLoading}
      />
    </>
  );
};
