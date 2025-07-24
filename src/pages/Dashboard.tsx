import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Plus, Clock, CheckCircle, XCircle, Upload, Gift, RefreshCw } from 'lucide-react';
import { useTasks } from '@/hooks/useTasks';
import { useAuth } from '@/contexts/AuthContext';
import { CoinIcon } from '@/components/ui/coin-icon';

const Dashboard = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const { tasks, loading, refetch } = useTasks();
  const { userProfile, claimWelcomeBonus, checkOverdueTasks } = useAuth();
  const [showWelcomeBonus, setShowWelcomeBonus] = useState(false);
  const [isCheckingOverdue, setIsCheckingOverdue] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const shouldUseDark = savedTheme === 'dark' || (!savedTheme && systemTheme);
    
    setIsDarkMode(shouldUseDark);
    document.documentElement.classList.toggle('dark', shouldUseDark);
  }, []);

  useEffect(() => {
    // Show welcome bonus if user hasn't claimed it yet
    if (userProfile && !userProfile.welcome_bonus_claimed && !loading) {
      setShowWelcomeBonus(true);
    }
  }, [userProfile, loading]);

  const toggleTheme = () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);
    document.documentElement.classList.toggle('dark', newTheme);
    localStorage.setItem('theme', newTheme ? 'dark' : 'light');
  };

  const handleCheckOverdueTasks = async () => {
    setIsCheckingOverdue(true);
    await checkOverdueTasks();
    await refetch(); // Refresh tasks after checking
    setIsCheckingOverdue(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500';
      case 'submitted': return 'bg-blue-500';
      case 'verified': return 'bg-green-500';
      case 'failed': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'submitted': return <Upload className="h-4 w-4" />;
      case 'verified': return <CheckCircle className="h-4 w-4" />;
      case 'failed': return <XCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const completedTasks = tasks.filter(task => task.status === 'verified').length;
  const totalStake = tasks.reduce((sum, task) => sum + task.due_coins, 0);
  const earnedCoins = tasks.filter(task => task.status === 'verified').reduce((sum, task) => sum + task.due_coins, 0);

  const handleClaimWelcomeBonus = async () => {
    await claimWelcomeBonus();
    setShowWelcomeBonus(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Navbar onToggleTheme={toggleTheme} isDarkMode={isDarkMode} />
        <main className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">Loading your tasks...</div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar onToggleTheme={toggleTheme} isDarkMode={isDarkMode} />
      
      <main className="container mx-auto px-4 py-8">
        <div className="space-y-8">
          {/* Welcome Bonus Card */}
          {showWelcomeBonus && (
            <Card className="border-green-200 bg-green-50 dark:bg-green-900/20 dark:border-green-800">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-green-100 dark:bg-green-800 rounded-full">
                      <Gift className="h-6 w-6 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-green-800 dark:text-green-200">
                        Welcome Bonus Available!
                      </h3>
                      <p className="text-green-600 dark:text-green-400">
                        Claim your free 100 credits to start your productivity journey!
                      </p>
                    </div>
                  </div>
                  <Button 
                    onClick={handleClaimWelcomeBonus}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    Claim Bonus
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold">Dashboard</h1>
              <p className="text-muted-foreground">Track your productivity and achievements</p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleCheckOverdueTasks}
                disabled={isCheckingOverdue}
                className="flex items-center gap-2"
              >
                <RefreshCw className={`h-4 w-4 ${isCheckingOverdue ? 'animate-spin' : ''}`} />
                Check Overdue
              </Button>
              <Link to="/add-task">
                <Button className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600">
                  <Plus className="h-4 w-4 mr-2" />
                  Create New Task
                </Button>
              </Link>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Due Coins</CardTitle>
                <CoinIcon className="h-4 w-4 text-yellow-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{userProfile?.due_coins || 0}</div>
                <p className="text-xs text-muted-foreground">Available balance</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{tasks.length}</div>
                <p className="text-xs text-muted-foreground">Active tasks</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Completed</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{completedTasks}</div>
                {tasks.length > 0 && (
                  <Progress value={(completedTasks / tasks.length) * 100} className="mt-2" />
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Coins at Stake</CardTitle>
                <CoinIcon className="h-4 w-4 text-yellow-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalStake}</div>
                <p className="text-xs text-muted-foreground">Coins at risk</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Earned</CardTitle>
                <CoinIcon className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{earnedCoins}</div>
                <p className="text-xs text-muted-foreground">From completed tasks</p>
              </CardContent>
            </Card>
          </div>

          {/* Tasks List */}
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold">Your Tasks</h2>
            {tasks.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <CheckCircle className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No tasks yet</h3>
                  <p className="text-muted-foreground mb-4">Create your first task to start your productivity journey</p>
                  <Link to="/add-task">
                    <Button>Create Task</Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {tasks.map((task) => (
                  <Card key={task.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="space-y-2">
                          <CardTitle className="text-lg">{task.title}</CardTitle>
                          <CardDescription>{task.description}</CardDescription>
                        </div>
                        <Badge className={`${getStatusColor(task.status)} text-white`}>
                          {getStatusIcon(task.status)}
                          <span className="ml-1 capitalize">{task.status}</span>
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 mr-1" />
                            Due: {new Date(task.due_date).toLocaleDateString()} at {new Date(task.due_date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                          </div>
                          <div className="flex items-center">
                            <CoinIcon className="h-4 w-4 mr-1 text-yellow-500" />
                            {task.due_coins} coins
                          </div>
                        </div>
                        {task.status === 'pending' && (
                          <Link to={`/submit-proof/${task.id}`}>
                            <Button size="sm">Submit Proof</Button>
                          </Link>
                        )}
                      </div>
                    </CardContent>
                  </Card>
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
