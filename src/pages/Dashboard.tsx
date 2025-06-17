import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Plus, Clock, DollarSign, CheckCircle, XCircle, Upload } from 'lucide-react';

interface Task {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  moneyAtStake: number;
  status: 'pending' | 'submitted' | 'verified' | 'failed';
  createdAt: string;
  proofUrl?: string;
}

const Dashboard = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: '1',
      title: 'Complete Morning Workout',
      description: 'Do a 30-minute cardio workout',
      dueDate: '2025-06-17T09:00:00',
      moneyAtStake: 25,
      status: 'pending',
      createdAt: '2025-06-15T10:00:00'
    },
    {
      id: '2',
      title: 'Read 20 Pages',
      description: 'Read 20 pages of my book',
      dueDate: '2025-06-16T20:00:00',
      moneyAtStake: 15,
      status: 'verified',
      createdAt: '2025-06-14T14:00:00'
    }
  ]);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const shouldUseDark = savedTheme === 'dark' || (!savedTheme && systemTheme);
    
    setIsDarkMode(shouldUseDark);
    document.documentElement.classList.toggle('dark', shouldUseDark);
  }, []);

  const toggleTheme = () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);
    document.documentElement.classList.toggle('dark', newTheme);
    localStorage.setItem('theme', newTheme ? 'dark' : 'light');
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

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar 
        onToggleTheme={toggleTheme} 
        isDarkMode={isDarkMode} 
      />
      
      <main className="container mx-auto px-4 py-8">
        <div className="space-y-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold">Dashboard</h1>
              <p className="text-muted-foreground">Track your productivity and achievements</p>
            </div>
            <Link to="/add-task">
              <Button className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600">
                <Plus className="h-4 w-4 mr-2" />
                Create New Task
              </Button>
            </Link>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">Active</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Progress</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">Great</div>
                <Progress value={(completedTasks / tasks.length) * 100} className="mt-2" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Commitment</CardTitle>
                <DollarSign className="h-4 w-4 text-yellow-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">High</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Achievement</CardTitle>
                <DollarSign className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">Excellent</div>
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
                            Due: {new Date(task.dueDate).toLocaleDateString()} at {new Date(task.dueDate).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                          </div>
                          <div className="flex items-center">
                            <DollarSign className="h-4 w-4 mr-1" />
                            Commitment Set
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
      
      <Footer />
    </div>
  );
};

export default Dashboard;
