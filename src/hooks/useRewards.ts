
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface Reward {
  id: string;
  task_id: string;
  coupon_code: string;
  amount: number;
  is_scratched: boolean;
  created_at: string;
}

export const useRewards = () => {
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchRewards = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('rewards')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRewards(data || []);
    } catch (error: any) {
      toast({
        title: "Error fetching rewards",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const createReward = async (taskId: string, amount: number) => {
    if (!user) throw new Error('User not authenticated');

    const couponCode = `REWARD-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    const { data, error } = await supabase
      .from('rewards')
      .insert([{
        user_id: user.id,
        task_id: taskId,
        coupon_code: couponCode,
        amount,
      }])
      .select()
      .single();

    if (error) throw error;
    await fetchRewards();
    return data;
  };

  const scratchReward = async (id: string) => {
    const { error } = await supabase
      .from('rewards')
      .update({ is_scratched: true })
      .eq('id', id);

    if (error) throw error;
    await fetchRewards();
  };

  useEffect(() => {
    fetchRewards();
  }, [user]);

  return {
    rewards,
    loading,
    createReward,
    scratchReward,
    refetch: fetchRewards
  };
};
