import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { CalendarIcon, DollarSign, Target } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

const AddTask = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
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

    setIsSubmitting(true);

    try {
      // Combine date and time
      const [hours, minutes] = formData.dueTime.split(':');
      const dueDateTime = new Date(formData.dueDate);
      dueDateTime.setHours(parseInt(hours), parseInt(minutes));

      // Create new task
      const newTask = {
        id: Date.now().toString(),
        title: formData.title,
        description: formData.description,
        dueDate: dueDateTime.toISOString(),
        moneyAtStake: parseFloat(formData.moneyAtStake),
        status: 'pending' as const,
        createdAt: new Date().toISOString()
      };

      // In a real app, this would be saved to a database
      console.log('New task created:', newTask);

      toast({
        title: "Success!",
        description: "Task created successfully",
      });

      navigate('/dashboard');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create task. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar 
        onToggleTheme={toggleTheme} 
        isDarkMode={isDarkMode} 
      />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
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
                {/* Task Title */}
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

                {/* Task Description */}
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

                {/* Due Date and Time */}
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
                          disabled={(date) => date < new Date()}
                          initialFocus
                          className="pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="dueTime">Due Time</Label>
                    <Input
                      id="dueTime"
                      type="time"
                      value={formData.dueTime}
                      onChange={(e) => handleInputChange('dueTime', e.target.value)}
                      required
                    />
                  </div>
                </div>

                {/* Money at Stake */}
                <div className="space-y-2">
                  <Label htmlFor="moneyAtStake">Money at Stake ($)</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="moneyAtStake"
                      type="number"
                      min="1"
                      step="0.01"
                      placeholder="25.00"
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

                {/* Submit Button */}
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
      
      <Footer />
    </div>
  );
};

export default AddTask;
