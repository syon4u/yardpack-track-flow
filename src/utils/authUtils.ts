
import { Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

// Disabled JWT refresh - just return empty session
export const refreshJWT = async (): Promise<{ session: Session | null; error: any }> => {
  console.log('JWT refresh disabled');
  return { session: null, error: 'JWT disabled' };
};

// Disabled force reauth
export const forceReauth = async (): Promise<void> => {
  console.log('Force reauth disabled');
};

export const signUpUser = async (email: string, password: string, fullName: string, phoneNumber?: string) => {
  try {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          phone_number: phoneNumber || ''
        }
      }
    });
    
    return { error };
  } catch (error) {
    return { error };
  }
};

export const signInUser = async (email: string, password: string) => {
  try {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    return { error };
  } catch (error) {
    return { error };
  }
};

export const signOutUser = async (userId?: string) => {
  try {
    await supabase.auth.signOut();
  } catch (error) {
    console.error('Logout error:', error);
  }
};
