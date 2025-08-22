
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface FeatureFlag {
  id: string;
  flag_name: string;
  is_enabled: boolean;
}

export const useFeatureFlags = () => {
  const [flags, setFlags] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchFlags = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('feature_flags')
          .select('flag_name, is_enabled');

        if (error) throw error;

        const flagsMap = data.reduce((acc, flag) => {
          acc[flag.flag_name] = flag.is_enabled;
          return acc;
        }, {} as Record<string, boolean>);

        setFlags(flagsMap);
      } catch (error) {
        console.error('Error fetching feature flags:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFlags();
  }, [user]);

  return { flags, loading, isEnabled: (flagName: string) => flags[flagName] || false };
};
