
import React from 'react';
import { Button } from '@/components/ui/button';
import { CardContent } from '@/components/ui/card';

interface ProfileDisplayProps {
  user: any;
  setIsEditing: (isEditing: boolean) => void;
}

export const ProfileDisplay = ({ user, setIsEditing }: ProfileDisplayProps) => {
  return (
    <CardContent className="pt-6">
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium mb-4">Profile Information</h3>
          <div className="grid grid-cols-1 gap-4">
            <div className="flex justify-between py-2 border-b">
              <span className="text-gray-500">Activity Level</span>
              <span className="capitalize font-medium">{user.preferences?.activityLevel || 'Not set'}</span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="text-gray-500">Dietary Preferences</span>
              <span className="font-medium">
                {user.preferences?.dietaryRestrictions?.length
                  ? user.preferences.dietaryRestrictions.map(pref => pref.charAt(0).toUpperCase() + pref.slice(1)).join(', ')
                  : 'None specified'}
              </span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="text-gray-500">Sleep Goal</span>
              <span className="font-medium">{user.preferences?.sleepGoals || 'Not set'}</span>
            </div>
          </div>
        </div>
        
        <div className="flex justify-end">
          <Button
            onClick={() => setIsEditing(true)}
            className="bg-vibe-primary hover:bg-vibe-dark"
          >
            Edit Profile
          </Button>
        </div>
      </div>
    </CardContent>
  );
};
