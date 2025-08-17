
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface Task {
  id: string;
  title: string;
  description: string;
  due_date: string;
  due_coins: number;
  status: 'pending' | 'verified' | 'failed' | 'pending-verification';
  proof_url?: string;
  created_at: string;
  updated_at: string;
  verification_feedback?: string;
}

export const useTasks = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchTasks = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Type assertion to ensure the data matches our Task interface
      const typedTasks = (data || []) as Task[];
      setTasks(typedTasks);
    } catch (error: any) {
      toast({
        title: "Error fetching tasks",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const checkAndMarkOverdueTasks = async () => {
    if (!user) return;

    try {
      console.log('Checking for overdue tasks...');
      
      // Get all pending tasks that are overdue
      const { data: overdueTasks, error: fetchError } = await supabase
        .from('tasks')
        .select('id, title, due_date')
        .eq('user_id', user.id)
        .eq('status', 'pending')
        .lt('due_date', new Date().toISOString());

      if (fetchError) {
        console.error('Error fetching overdue tasks:', fetchError);
        return;
      }

      if (overdueTasks && overdueTasks.length > 0) {
        console.log(`Found ${overdueTasks.length} overdue tasks, marking as failed...`);
        
        // Mark overdue tasks as failed
        const { error: updateError } = await supabase
          .from('tasks')
          .update({ status: 'failed', updated_at: new Date().toISOString() })
          .in('id', overdueTasks.map(task => task.id));

        if (updateError) {
          console.error('Error updating overdue tasks:', updateError);
        } else {
          toast({
            title: "Tasks updated",
            description: `${overdueTasks.length} overdue task(s) have been marked as failed.`,
            variant: "destructive"
          });
          
          // Refresh the tasks list to reflect the changes
          await fetchTasks();
        }
      }
    } catch (error) {
      console.error('Error in checkAndMarkOverdueTasks:', error);
    }
  };

  const createTask = async (taskData: {
    title: string;
    description: string;
    due_date: string;
    due_coins: number;
  }) => {
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('tasks')
      .insert([{
        ...taskData,
        user_id: user.id,
      }])
      .select()
      .single();

    if (error) throw error;
    await fetchTasks();
    return data;
  };

  const updateTask = async (id: string, updates: Partial<Task>) => {
    const { error } = await supabase
      .from('tasks')
      .update(updates)
      .eq('id', id);

    if (error) throw error;
    await fetchTasks();
  };

  useEffect(() => {
    fetchTasks();
  }, [user]);

  return {
    tasks,
    loading,
    createTask,
    updateTask,
    checkAndMarkOverdueTasks,
    refetch: fetchTasks
  };
};
