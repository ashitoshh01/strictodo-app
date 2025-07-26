
import { useAuth } from '@/contexts/AuthContext';
import { useTasks } from '@/hooks/useTasks';
import { useRewards } from '@/hooks/useRewards';
import { useOverdueTaskChecker } from '@/hooks/useOverdueTaskChecker';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Calendar, Clock, Trophy, Coins, ChevronDown, ChevronUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import TaskFileUpload from '@/components/dashboard/TaskFileUpload';
import { useState } from 'react';

const Dashboard = () => {
  const { user, userProfile, claimWelcomeBonus } = useAuth();
  const { tasks, loading: tasksLoading } = useTasks();
  const { rewards, loading: rewardsLoading } = useRewards();
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null);
  
  // Initialize the overdue task checker
  useOverdueTaskChecker();

  if (tasksLoading || rewardsLoading) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Not authenticated</CardTitle>
          </CardHeader>
          <CardContent>
            Please sign in to view the dashboard.
          </CardContent>
        </Card>
      </div>
    );
  }

  const pendingTasks = tasks.filter(task => task.status === 'pending');
  const completedTasks = tasks.filter(task => task.status === 'verified');
  const failedTasks = tasks.filter(task => task.status === 'failed');

  const handleTaskClick = (taskId: string) => {
    setExpandedTaskId(expandedTaskId === taskId ? null : taskId);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
          <p className="text-muted-foreground">Manage your tasks and track your progress</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{tasks.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Tasks</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingTasks.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed Tasks</CardTitle>
              <Trophy className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{completedTasks.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Credits</CardTitle>
              <Coins className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{userProfile?.due_coins || 0}</div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* User Profile Card */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>Profile</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-4 mb-4">
                <img
                  src={userProfile?.avatar_url || "https://avatar.vercel.sh/vercel.svg"}
                  alt="Avatar"
                  className="w-16 h-16 rounded-full border-2 border-border"
                />
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">
                    {userProfile?.full_name || user.email?.split('@')[0]}
                  </h3>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                  <div className="flex items-center mt-2">
                    <Coins className="w-4 h-4 mr-1 text-yellow-500" />
                    <span className="font-medium">{userProfile?.due_coins || 0} credits</span>
                  </div>
                </div>
              </div>
              
              {!userProfile?.welcome_bonus_claimed && (
                <Button 
                  className="w-full" 
                  onClick={claimWelcomeBonus}
                  variant="default"
                >
                  <Trophy className="w-4 h-4 mr-2" />
                  Claim Welcome Bonus
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Recent Tasks Card */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Recent Tasks</CardTitle>
                <Link to="/add-task">
                  <Button size="sm">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Task
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {tasks.length > 0 ? (
                <div className="space-y-4">
                  {tasks.slice(0, 5).map((task) => (
                    <div key={task.id}>
                      <div 
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                        onClick={() => handleTaskClick(task.id)}
                      >
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h4 className="font-semibold">{task.title}</h4>
                            <div className="flex items-center space-x-2">
                              <Badge 
                                variant={
                                  task.status === 'verified' ? 'default' :
                                  task.status === 'failed' ? 'destructive' :
                                  task.status === 'submitted' ? 'secondary' : 'outline'
                                }
                              >
                                {task.status}
                              </Badge>
                              {expandedTaskId === task.id ? (
                                <ChevronUp className="h-4 w-4" />
                              ) : (
                                <ChevronDown className="h-4 w-4" />
                              )}
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground line-clamp-1">{task.description}</p>
                          <div className="flex items-center space-x-4 mt-2 text-sm text-muted-foreground">
                            <div className="flex items-center space-x-1">
                              <Calendar className="h-3 w-3" />
                              <span>{format(new Date(task.due_date), 'MMM dd, yyyy')}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Clock className="h-3 w-3" />
                              <span>{format(new Date(task.due_date), 'hh:mm a')}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Coins className="h-3 w-3" />
                              <span>{task.due_coins} credits</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* File Upload Section */}
                      {expandedTaskId === task.id && (
                        <TaskFileUpload 
                          task={task}
                          onClose={() => setExpandedTaskId(null)}
                        />
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Calendar className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground mb-4">No tasks yet. Create your first task to get started!</p>
                  <Link to="/add-task">
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      Create Task
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recent Rewards Section */}
        {rewards.length > 0 && (
          <div className="mt-8">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Recent Rewards</CardTitle>
                  <Link to="/rewards">
                    <Button variant="outline" size="sm">
                      View All
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {rewards.slice(0, 3).map((reward) => (
                    <div key={reward.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <div className="flex items-center space-x-2">
                          <Coins className="h-4 w-4 text-yellow-500" />
                          <span className="font-semibold">{reward.amount} Credits</span>
                        </div>
                        <p className="text-sm text-muted-foreground">Code: {reward.coupon_code}</p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(reward.created_at), 'MMM dd, yyyy')}
                        </p>
                      </div>
                      <Trophy className="h-6 w-6 text-yellow-500" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
