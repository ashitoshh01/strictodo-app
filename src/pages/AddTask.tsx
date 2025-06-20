
import React, { useState, useEffect } from 'react';
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
import { CalendarIcon, IndianRupee, Target, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { useTasks } from '@/hooks/useTasks';

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
    moneyAtStake: ''
  });

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

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const getCurrentTimeString = () => {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  const isTimeValid = (selectedDate: Date | undefined, timeString: string) => {
    if (!selectedDate || !timeString) return true;
    
    const now = new Date();
    const selectedDateTime = new Date(selectedDate);
    const [hours, minutes] = timeString.split(':').map(Number);
    selectedDateTime.setHours(hours, minutes, 0, 0);
    
    // If selected date is today, time must be in the future
    if (selectedDate.toDateString() === now.toDateString()) {
      return selectedDateTime > now;
    }
    
    // If selected date is in the future, any time is valid
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.description || !formData.dueDate || !formData.dueTime || !formData.moneyAtStake) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive"
      });
      return;
    }

    if (parseFloat(formData.moneyAtStake) <= 0) {
      toast({
        title: "Error",
        description: "Money at stake must be greater than 0",
        variant: "destructive"
      });
      return;
    }

    // Validate time selection
    if (!isTimeValid(formData.dueDate, formData.dueTime)) {
      toast({
        title: "Error",
        description: "For today's date, please select a future time",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Combine date and time
      const [hours, minutes] = formData.dueTime.split(':');
      const dueDateTime = new Date(formData.dueDate);
      dueDateTime.setHours(parseInt(hours), parseInt(minutes));

      await createTask({
        title: formData.title,
        description: formData.description,
        due_date: dueDateTime.toISOString(),
        money_at_stake: parseFloat(formData.moneyAtStake),
      });

      toast({
        title: "Success!",
        description: "Task created successfully",
      });

      navigate('/dashboard');
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create task. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get minimum time for today
  const getMinTime = () => {
    if (!formData.dueDate) return '';
    
    const now = new Date();
    const selectedDate = new Date(formData.dueDate);
    
    // If selected date is today, minimum time is current time
    if (selectedDate.toDateString() === now.toDateString()) {
      return getCurrentTimeString();
    }
    
    // For future dates, no minimum time restriction
    return '';
  };

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
              Set a goal, put money on the line, and prove you completed it
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
                      min={getMinTime()}
                      value={formData.dueTime}
                      onChange={(e) => handleInputChange('dueTime', e.target.value)}
                      required
                    />
                    {formData.dueDate && formData.dueDate.toDateString() === new Date().toDateString() && (
                      <p className="text-xs text-muted-foreground">
                        For today's date, select a future time
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="moneyAtStake">Money at Stake (₹)</Label>
                  <div className="relative">
                    <IndianRupee className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="moneyAtStake"
                      type="number"
                      min="1"
                      step="0.01"
                      placeholder="100.00"
                      className="pl-10"
                      value={formData.moneyAtStake}
                      onChange={(e) => handleInputChange('moneyAtStake', e.target.value)}
                      required
                    />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    This amount will be at risk if you don't complete the task
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
