import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Profile, UserRole } from '@/types';
import { useAuth } from './useAuth';

export function useProfile() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchProfile = async () => {
    if (!user) {
      setProfile(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (fetchError) throw fetchError;
      setProfile(data);
      setError(null);
    } catch (err: any) {
      setError(err.message);
      console.error('Error fetching profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) return;

    try {
      const { data, error: updateError } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single();

      if (updateError) throw updateError;
      setProfile(data);
      setError(null);
      return data;
    } catch (err: any) {
      setError(err.message);
      console.error('Error updating profile:', err);
      throw err;
    }
  };

  const isCoordenador = () => {
    return profile?.role === 'coordenador';
  };

  const isProfessor = () => {
    return profile?.role === 'professor';
  };

  useEffect(() => {
    fetchProfile();
  }, [user]);

  return {
    profile,
    loading,
    error,
    updateProfile,
    isCoordenador,
    isProfessor,
    refetch: fetchProfile,
  };
}

