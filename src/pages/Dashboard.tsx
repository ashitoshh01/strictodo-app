import { useAuth } from '@/contexts/AuthContext';
import { useTasks } from '@/hooks/useTasks';
import { useRewards } from '@/hooks/useRewards';
import { useOverdueTaskChecker } from '@/hooks/useOverdueTaskChecker';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Calendar, Clock, Trophy, Coins } from 'lucide-react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';

const Dashboard = () => {
  const { user, userProfile, claimWelcomeBonus } = useAuth();
  const { tasks, loading: tasksLoading } = useTasks();
  const { rewards, loading: rewardsLoading } = useRewards();
  
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
        <Card>
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

  return (
    <div className="min-h-screen bg-background text-foreground py-6">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* User Profile Card */}
          <Card>
            <CardHeader>
              <CardTitle>Welcome, {userProfile?.full_name || user.email}!</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-4">
                <img
                  src={userProfile?.avatar_url || "https://avatar.vercel.sh/vercel.svg"}
                  alt="Avatar"
                  className="w-12 h-12 rounded-full"
                />
                <div>
                  <p className="text-sm text-muted-foreground">
                    Email: {user.email}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Credits: {userProfile?.due_coins} <Coins className="inline-block w-4 h-4" />
                  </p>
                </div>
              </div>
              {!userProfile?.welcome_bonus_claimed && (
                <Button className="mt-4" onClick={claimWelcomeBonus}>
                  Claim Welcome Bonus
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Tasks Overview Card */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Your Tasks</CardTitle>
                <Link to="/tasks/create">
                  <Button size="sm">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Task
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {tasks.length > 0 ? (
                <ul className="space-y-3">
                  {tasks.slice(0, 3).map((task) => (
                    <li key={task.id} className="border rounded-md p-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-semibold">{task.title}</p>
                          <p className="text-sm text-muted-foreground">{task.description}</p>
                          <div className="flex items-center space-x-2 mt-2">
                            <Calendar className="h-4 w-4" />
                            <span>{format(new Date(task.due_date), 'MMM dd, yyyy')}</span>
                            <Clock className="h-4 w-4" />
                            <span>{format(new Date(task.due_date), 'hh:mm a')}</span>
                          </div>
                        </div>
                        <div>
                          <Badge variant="secondary">{task.status}</Badge>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No tasks yet. Create one to get started!</p>
              )}
              {tasks.length > 3 && (
                <Link to="/tasks">
                  <Button variant="link">View All Tasks</Button>
                </Link>
              )}
            </CardContent>
          </Card>

          {/* Rewards Overview Card */}
          <Card>
            <CardHeader>
              <CardTitle>Your Rewards</CardTitle>
            </CardHeader>
            <CardContent>
              {rewards.length > 0 ? (
                <ul className="space-y-3">
                  {rewards.slice(0, 3).map((reward) => (
                    <li key={reward.id} className="border rounded-md p-3">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-semibold">Reward: {reward.amount} Coins</p>
                          <p className="text-sm text-muted-foreground">Coupon: {reward.coupon_code}</p>
                        </div>
                        <div>
                          <Trophy className="h-6 w-6 text-yellow-500" />
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No rewards yet. Complete tasks to earn rewards!</p>
              )}
              {rewards.length > 3 && (
                <Link to="/rewards">
                  <Button variant="link">View All Rewards</Button>
                </Link>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
