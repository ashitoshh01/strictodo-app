
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
      console.log('Fetching rewards for user:', user.id);
      const { data, error } = await supabase
        .from('rewards')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching rewards:', error);
        throw error;
      }
      
      console.log('Fetched rewards:', data);
      setRewards(data || []);
    } catch (error: any) {
      console.error('Error in fetchRewards:', error);
      toast({
        title: "Error fetching rewards",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const createReward = async (taskId: string) => {
    if (!user) throw new Error('User not authenticated');

    const couponCode = `COIN-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    
    // Generate reward amount: 1-2 coins normally, 5 coins with 1/50 chance
    const randomChance = Math.floor(Math.random() * 50) + 1;
    const rewardAmount = randomChance === 1 ? 5 : Math.floor(Math.random() * 2) + 1;

    console.log('Creating reward:', { taskId, rewardAmount, couponCode, userId: user.id });

    try {
      const { data, error } = await supabase
        .from('rewards')
        .insert([{
          user_id: user.id,
          task_id: taskId,
          coupon_code: couponCode,
          amount: rewardAmount,
        }])
        .select()
        .single();

      if (error) {
        console.error('Error creating reward:', error);
        
        // Check if this is an RLS error and provide more specific message
        if (error.code === '42501' || error.message.includes('row-level security')) {
          throw new Error('Permission denied: Unable to create reward. Please contact support.');
        }
        
        throw error;
      }
      
      console.log('Created reward:', data);
      await fetchRewards();
      return data;
    } catch (error: any) {
      console.error('Error in createReward:', error);
      throw error;
    }
  };

  const scratchReward = async (id: string) => {
    if (!user) throw new Error('User not authenticated');
    
    console.log('Scratching reward with ID:', id);
    
    try {
      // First, get the reward to know the amount
      const { data: rewardData, error: fetchError } = await supabase
        .from('rewards')
        .select('amount')
        .eq('id', id)
        .eq('user_id', user.id)
        .single();

      if (fetchError) {
        console.error('Error fetching reward data:', fetchError);
        throw fetchError;
      }

      // Mark the reward as scratched
      const { data, error } = await supabase
        .from('rewards')
        .update({ is_scratched: true })
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) {
        console.error('Error scratching reward:', error);
        
        // Check if this is an RLS error
        if (error.code === '42501' || error.message.includes('row-level security')) {
          throw new Error('Permission denied: Unable to scratch reward. Please contact support.');
        }
        
        throw error;
      }

      // Get current user profile to calculate new coin balance
      const { data: currentProfile, error: profileFetchError } = await supabase
        .from('profiles')
        .select('due_coins')
        .eq('id', user.id)
        .single();

      if (profileFetchError) {
        console.error('Error fetching current profile:', profileFetchError);
        throw profileFetchError;
      }

      // Add the reward coins to the user's balance
      const newCoinBalance = currentProfile.due_coins + rewardData.amount;
      
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ 
          due_coins: newCoinBalance,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (profileError) {
        console.error('Error updating user coins:', profileError);
        // We still mark the reward as scratched but notify about the coin update issue
        toast({
          title: "Warning",
          description: "Reward revealed but there was an issue updating your coin balance. Please refresh the page.",
          variant: "destructive"
        });
      }

      console.log('Scratched reward successfully:', data);
      await fetchRewards();
      return data;
    } catch (error: any) {
      console.error('Error in scratchReward:', error);
      throw error;
    }
  };

  const getRewardByTask = async (taskId: string) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('rewards')
        .select('*')
        .eq('task_id', taskId)
        .eq('user_id', user.id)
        .single();

      if (error) {
        // It's okay if no reward is found, so we don't throw an error here.
        // We only log it for debugging.
        console.log('No reward found for task:', taskId);
        return null;
      }

      return data;
    } catch (error: any) {
      console.error('Error fetching reward by task:', error);
      return null;
    }
  };

  useEffect(() => {
    fetchRewards();
  }, [user]);

  return {
    rewards,
    loading,
    createReward,
    scratchReward,
    getRewardByTask,
    refetch: fetchRewards
  };
};
