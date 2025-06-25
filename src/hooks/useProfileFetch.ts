
import { useState } from 'react';

export const useProfileFetch = () => {
  // Authentication disabled - provide mock profile
  const [profile, setProfile] = useState<any>({
    id: 'mock-admin-id',
    email: 'admin@example.com',
    full_name: 'Mock Admin',
    role: 'admin'
  });

  const fetchProfile = async (userId: string) => {
    console.log('🚫 Profile fetch disabled - using mock profile');
    // No actual fetching needed
  };

  return { profile, setProfile, fetchProfile };
};
