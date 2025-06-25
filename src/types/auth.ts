
import { User, Session } from '@supabase/supabase-js';
import { Database } from '@/integrations/supabase/types';

export type Profile = Database['public']['Tables']['profiles']['Row'];

export interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  signUp: (email: string, password: string, fullName: string, phoneNumber?: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  refreshJWT: () => Promise<{ session: Session | null; error: any }>;
  forceReauth: () => Promise<void>;
  isLoading: boolean;
}

export interface AuthProviderProps {
  children: React.ReactNode;
}
