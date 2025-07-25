
import { useEffect } from 'react';
import { useTasks } from './useTasks';
import { useAuth } from '@/contexts/AuthContext';

export const useOverdueTaskChecker = () => {
  const { user } = useAuth();
  const { checkAndMarkOverdueTasks } = useTasks();

  useEffect(() => {
    if (!user) return;

    // Check for overdue tasks immediately when user logs in
    checkAndMarkOverdueTasks();

    // Set up a periodic check every 5 minutes
    const intervalId = setInterval(() => {
      checkAndMarkOverdueTasks();
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(intervalId);
  }, [user, checkAndMarkOverdueTasks]);
};
