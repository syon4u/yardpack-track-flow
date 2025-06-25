
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { MonitoringService } from '@/services/monitoringService';
import { toast } from '@/hooks/use-toast';
import { Profile } from '@/types/auth';

export const useProfileFetch = () => {
  const [profile, setProfile] = useState<Profile | null>(null);

  const fetchProfile = async (userId: string) => {
    try {
      if (import.meta.env.DEV) {
        console.log('🔍 Fetching profile for user:', userId);
      }
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (import.meta.env.DEV) {
        console.log('📊 Profile query result:', { data, error, userId });
      }
      
      if (error) {
        console.error('❌ Error fetching profile:', error);
        await MonitoringService.logError(error, { operation: 'fetch_profile', userId });
        
        if (error.code === 'PGRST116') {
          // No rows returned
          console.warn('⚠️ No profile found for user:', userId);
          toast({
            title: "Profile Not Found",
            description: "No profile found for your account. Please contact support if this persists.",
            variant: "destructive"
          });
        } else {
          toast({
            title: "Profile Load Error",
            description: "Failed to load your profile. Please try refreshing the page.",
            variant: "destructive"
          });
        }
        return;
      }
      
      if (!data) {
        console.warn('⚠️ Profile query returned null data for user:', userId);
        toast({
          title: "No Profile Found",
          description: "Your profile could not be loaded. Please contact support.",
          variant: "destructive"
        });
        return;
      }
      
      setProfile(data);
      if (import.meta.env.DEV) {
        console.log('✅ Profile loaded successfully:', data);
      }
      await MonitoringService.logUserActivity('profile_loaded', 'profile', userId);
    } catch (error) {
      console.error('💥 Exception in fetchProfile:', error);
      await MonitoringService.logError(error as Error, { operation: 'fetch_profile', userId });
      toast({
        title: "Profile Load Failed",
        description: "An unexpected error occurred while loading your profile.",
        variant: "destructive"
      });
    }
  };

  return { profile, setProfile, fetchProfile };
};
