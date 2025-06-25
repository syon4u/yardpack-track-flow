
import { Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

// Helper function to log session details - disabled JWT checking
export const logSessionDetails = async (): Promise<Session | null> => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    
    console.log('🔐 Session Debug Info (JWT disabled):', {
      hasSession: !!session,
      user: session?.user?.email || 'No user',
      error: error
    });

    return session;
  } catch (error) {
    console.error('❌ Error getting session:', error);
    return null;
  }
};
