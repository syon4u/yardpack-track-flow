
import { Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

// Helper function to log session details
export const logSessionDetails = async (): Promise<Session | null> => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    
    console.log('🔐 Session Debug Info:', {
      hasSession: !!session,
      sessionId: session?.access_token ? 'Present' : 'Missing',
      tokenLength: session?.access_token?.length || 0,
      expiresAt: session?.expires_at,
      refreshToken: session?.refresh_token ? 'Present' : 'Missing',
      user: session?.user?.email || 'No user',
      error: error
    });

    if (session?.access_token) {
      console.log('🎟️ JWT Access Token (first 50 chars):', session.access_token.substring(0, 50) + '...');
      
      // Decode JWT payload for debugging (without verification)
      try {
        const base64Payload = session.access_token.split('.')[1];
        const payload = JSON.parse(atob(base64Payload));
        console.log('🔍 JWT Payload:', {
          sub: payload.sub,
          email: payload.email,
          role: payload.role,
          exp: payload.exp,
          iat: payload.iat,
          aud: payload.aud
        });
      } catch (jwtError) {
        console.error('❌ Failed to decode JWT:', jwtError);
      }
    }

    return session;
  } catch (error) {
    console.error('❌ Error getting session:', error);
    return null;
  }
};
