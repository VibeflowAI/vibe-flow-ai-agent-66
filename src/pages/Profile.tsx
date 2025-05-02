
import React, { useEffect, useState } from 'react';
import { UserProfile } from '@/components/profile/UserProfile';
import { HealthHistoryForm } from '@/components/profile/health-history';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

const Profile = () => {
  const { user } = useAuth();
  const [isInitializing, setIsInitializing] = useState(true);

  // Check if there are any recommendations in the database
  useEffect(() => {
    const checkRecommendations = async () => {
      if (!user) return;
      
      try {
        setIsInitializing(true);
        console.log("Checking recommendations for user:", user.id);
        
        const { count, error } = await supabase
          .from('recommendations')
          .select('*', { count: 'exact', head: true });
        
        if (error) {
          console.error('Error checking recommendations:', error);
          return;
        }
        
        console.log("Found recommendation count:", count);
        
        // If no recommendations exist, add some default ones
        if (count === 0) {
          console.log('No recommendations found, adding defaults');
          
          // Call the RPC function to add default recommendations
          const { data, error: rpcError } = await supabase.rpc('add_default_recommendations');
          
          if (rpcError) {
            console.error('Error adding default recommendations via RPC:', rpcError);
          } else {
            console.log('Added default recommendations successfully:', data);
            toast({
              title: "Recommendations added",
              description: "Default wellness recommendations have been added to your account.",
            });
          }
        }
      } catch (err) {
        console.error('Error in checkRecommendations:', err);
      } finally {
        setIsInitializing(false);
      }
    };
    
    checkRecommendations();
  }, [user]);

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

        {isInitializing ? (
          <div className="flex justify-center items-center py-12">
            <div className="flex flex-col items-center gap-2">
              <div className="h-10 w-10 rounded-full border-4 border-t-transparent border-vibe-primary animate-spin"></div>
              <p className="text-sm text-gray-500">Loading your profile...</p>
            </div>
          </div>
        ) : (
          <>
            <UserProfile />
            <HealthHistoryForm />
          </>
        )}
      </div>
    </div>
  );
};

export default Profile;
