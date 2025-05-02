
import React, { useEffect } from 'react';
import { UserProfile } from '@/components/profile/UserProfile';
import { HealthHistoryForm } from '@/components/profile/HealthHistoryForm';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

const Profile = () => {
  const { user } = useAuth();

  // Check if there are any recommendations in the database
  useEffect(() => {
    const checkRecommendations = async () => {
      if (!user) return;
      
      try {
        const { count, error } = await supabase
          .from('recommendations')
          .select('*', { count: 'exact', head: true });
        
        if (error) {
          console.error('Error checking recommendations:', error);
          return;
        }
        
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

        <UserProfile />
        <HealthHistoryForm />
      </div>
    </div>
  );
};

export default Profile;
