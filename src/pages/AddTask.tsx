
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { CalendarIcon, Target, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { useTasks } from '@/hooks/useTasks';
import { CoinIcon } from '@/components/ui/coin-icon';

const AddTask = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { createTask } = useTasks();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    dueDate: undefined as Date | undefined,
    dueTime: '',
    dueCoins: ''
  });

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const shouldUseDark = savedTheme === 'dark' || (!savedTheme && systemTheme);
    
    setIsDarkMode(shouldUseDark);
    document.documentElement.classList.toggle('dark', shouldUseDark);
  }, []);

  const toggleTheme = useCallback(() => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);
    document.documentElement.classList.toggle('dark', newTheme);
    localStorage.setItem('theme', newTheme ? 'dark' : 'light');
  }, [isDarkMode]);

  const handleInputChange = useCallback((field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  // Simple utility functions without useCallback to prevent circular dependencies
  const getCurrentTimeString = () => {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  const isDateToday = (date: Date | undefined) => {
    if (!date) return false;
    const now = new Date();
    return date.toDateString() === now.toDateString();
  };

  const validateTime = (date: Date | undefined, time: string) => {
    if (!date || !time) return true;
    
    const now = new Date();
    const selectedDate = new Date(date);
    const isToday = selectedDate.toDateString() === now.toDateString();
    
    if (!isToday) return true;
    
    const [hours, minutes] = time.split(':').map(Number);
    const selectedDateTime = new Date(selectedDate);
    selectedDateTime.setHours(hours, minutes, 0, 0);
    
    return selectedDateTime > now;
  };

  const getMinTimeForDate = (date: Date | undefined) => {
    if (!date) return '';
    
    const now = new Date();
    const selectedDate = new Date(date);
    const isToday = selectedDate.toDateString() === now.toDateString();
    
    if (!isToday) return '';
    
    return getCurrentTimeString();
  };

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('Form submission started');
    
    if (!formData.title || !formData.description || !formData.dueDate || !formData.dueTime || !formData.dueCoins) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive"
      });
      return;
    }

    const dueCoins = parseFloat(formData.dueCoins);
    if (dueCoins <= 0) {
      toast({
        title: "Error",
        description: "Due coins must be greater than 0",
        variant: "destructive"
      });
      return;
    }

    // Validate time selection
    if (!validateTime(formData.dueDate, formData.dueTime)) {
      toast({
        title: "Error",
        description: "For today's date, please select a future time",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      console.log('Creating task...');
      
      // Combine date and time
      const [hours, minutes] = formData.dueTime.split(':');
      const dueDateTime = new Date(formData.dueDate);
      dueDateTime.setHours(parseInt(hours), parseInt(minutes));

      await createTask({
        title: formData.title,
        description: formData.description,
        due_date: dueDateTime.toISOString(),
        due_coins: dueCoins,
      });

      console.log('Task created successfully');

      toast({
        title: "Success!",
        description: "Task created successfully. Due coins have been deducted from your balance.",
      });

      navigate('/dashboard');
    } catch (error: any) {
      console.error('Task creation error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create task. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, createTask, toast, navigate]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar onToggleTheme={toggleTheme} isDarkMode={isDarkMode} />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <Button
              variant="ghost"
              onClick={() => navigate('/dashboard')}
              className="absolute top-20 left-4 p-2"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
            <div className="mx-auto w-16 h-16 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center">
              <Target className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold">Create New Task</h1>
            <p className="text-muted-foreground">
              Set a goal, put due coins on the line, and prove you completed it
            </p>
          </div>

          {/* Form */}
          <Card>
            <CardHeader>
              <CardTitle>Task Details</CardTitle>
              <CardDescription>
                Fill in the details for your new productivity challenge
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="title">Task Title</Label>
                  <Input
                    id="title"
                    placeholder="e.g., Complete morning workout"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe what you need to accomplish..."
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    rows={3}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Due Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !formData.dueDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {formData.dueDate ? (
                            format(formData.dueDate, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={formData.dueDate}
                          onSelect={(date) => handleInputChange('dueDate', date)}
                          disabled={(date) => {
                            const today = new Date();
                            today.setHours(0, 0, 0, 0);
                            const dateToCheck = new Date(date);
                            dateToCheck.setHours(0, 0, 0, 0);
                            return dateToCheck < today;
                          }}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="dueTime">Due Time</Label>
                    <Input
                      id="dueTime"
                      type="time"
                      min={getMinTimeForDate(formData.dueDate)}
                      value={formData.dueTime}
                      onChange={(e) => handleInputChange('dueTime', e.target.value)}
                      required
                    />
                    {isDateToday(formData.dueDate) && (
                      <p className="text-xs text-muted-foreground">
                        For today's date, select a future time
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dueCoins">Due Coins at Stake</Label>
                  <div className="relative">
                    <CoinIcon className="absolute left-3 top-3 h-4 w-4 text-yellow-500" />
                    <Input
                      id="dueCoins"
                      type="number"
                      min="1"
                      step="1"
                      placeholder="50"
                      className="pl-10"
                      value={formData.dueCoins}
                      onChange={(e) => handleInputChange('dueCoins', e.target.value)}
                      required
                    />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    These coins will be deducted from your balance and returned if you complete the task
                  </p>
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Creating Task...' : 'Create Task'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default AddTask;
