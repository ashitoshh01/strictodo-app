
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Clock, CheckCircle, XCircle, BarChart3, Target } from 'lucide-react';
import { CoinIcon } from '@/components/ui/coin-icon';
import { useTasks } from '@/hooks/useTasks';
import { useAuth } from '@/contexts/AuthContext';
import { useOverdueTaskChecker } from '@/hooks/useOverdueTaskChecker';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import UserProfile from '@/components/dashboard/UserProfile';
import TaskCard from '@/components/dashboard/TaskCard';

const Dashboard = () => {
  const navigate = useNavigate();
  const { tasks, loading, refetch } = useTasks();
  const { userProfile, user } = useAuth();
  const { toast } = useToast();

  // Use the overdue task checker hook
  useOverdueTaskChecker();

  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('tasks')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'tasks', filter: `user_id=eq.${user.id}` },
        (payload) => {
          if (payload.new.status === 'verified' && payload.old.status !== 'verified') {
            toast({
              title: "🎉 Task Verified!",
              description: `Your task "${payload.new.title}" has been successfully verified.`,
            });
          }
          refetch();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, refetch, toast]);

  const taskStats = {
    total: tasks.length,
    pending: tasks.filter(task => task.status === 'pending').length,
    verified: tasks.filter(task => task.status === 'verified').length,
    failed: tasks.filter(task => task.status === 'failed').length,
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">Loading...</div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* User Profile Section */}
          <div className="animate-fade-in">
            <UserProfile />
          </div>

          {/* Task Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-fade-in">
            <Card className="hover:shadow-lg transition-all duration-200 hover:scale-105">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{taskStats.total}</div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-all duration-200 hover:scale-105">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Tasks</CardTitle>
                <Clock className="h-4 w-4 text-yellow-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">{taskStats.pending}</div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-all duration-200 hover:scale-105">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Verified Tasks</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{taskStats.verified}</div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-all duration-200 hover:scale-105">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Failed Tasks</CardTitle>
                <XCircle className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{taskStats.failed}</div>
              </CardContent>
            </Card>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 animate-fade-in">
            <Button 
              onClick={() => navigate('/add-task')}
              className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create New Task
            </Button>
            
            <Button 
              variant="outline" 
              onClick={() => navigate('/rewards')}
              className="border-yellow-500 text-yellow-600 hover:bg-yellow-50 dark:hover:bg-yellow-950"
            >
              <Target className="h-4 w-4 mr-2" />
              View Rewards
            </Button>
          </div>

          {/* Tasks List */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Your Tasks</h2>
            {tasks.length === 0 ? (
              <Card className="text-center py-8 animate-fade-in">
                <CardContent>
                  <div className="space-y-4">
                    <div className="mx-auto w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                      <Target className="h-8 w-8 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold mb-2">No tasks yet</h3>
                      <p className="text-muted-foreground">
                        Create your first task to start your productivity journey!
                      </p>
                    </div>
                    <Button 
                      onClick={() => navigate('/add-task')}
                      className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Create Task
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {tasks.map((task, index) => (
                  <div 
                    key={task.id} 
                    className="animate-fade-in"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <TaskCard task={task} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
