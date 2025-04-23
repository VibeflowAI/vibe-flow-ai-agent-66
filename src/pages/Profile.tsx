
import React from 'react';
import { UserProfile } from '@/components/profile/UserProfile';
import { HealthHistoryForm } from '@/components/profile/HealthHistoryForm';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';

const Profile = () => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/signin" />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto space-y-8">
        <header className="mb-8">
          <h1 className="text-3xl font-bold">Your Profile</h1>
          <p className="text-gray-600 mt-1">
            Manage your personal information and health history
          </p>
        </header>

        <UserProfile />
        <HealthHistoryForm />
      </div>
    </div>
  );
};

export default Profile;
