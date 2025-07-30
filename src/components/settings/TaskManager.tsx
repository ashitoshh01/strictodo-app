
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Trash2, Clock, CheckCircle, XCircle, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Task } from '@/hooks/useTasks';

interface TaskManagerProps {
  tasks: Task[];
  onTasksUpdate: () => void;
}

const TaskManager = ({ tasks, onTasksUpdate }: TaskManagerProps) => {
  const [tasksToDelete, setTasksToDelete] = useState<Set<string>>(new Set());
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500';
      case 'verified': return 'bg-green-500';
      case 'failed': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'verified': return <CheckCircle className="h-4 w-4" />;
      case 'failed': return <XCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const toggleTaskForDeletion = (taskId: string) => {
    const newTasksToDelete = new Set(tasksToDelete);
    if (newTasksToDelete.has(taskId)) {
      newTasksToDelete.delete(taskId);
    } else {
      newTasksToDelete.add(taskId);
    }
    setTasksToDelete(newTasksToDelete);
  };

  const handleSaveChanges = async () => {
    if (tasksToDelete.size === 0) {
      toast({
        title: "No changes to save",
        description: "No tasks were marked for deletion.",
      });
      return;
    }

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .in('id', Array.from(tasksToDelete));

      if (error) throw error;

      toast({
        title: "Success",
        description: `${tasksToDelete.size} task(s) deleted successfully! Kindly save after modifications.`,
      });

      setTasksToDelete(new Set());
      onTasksUpdate();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete tasks",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const clearChanges = () => {
    setTasksToDelete(new Set());
    toast({
      title: "Changes cleared",
      description: "All pending changes have been cleared.",
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Task Management</CardTitle>
        <CardDescription>
          Select tasks to delete and save all changes at once
        </CardDescription>
      </CardHeader>
      <CardContent>
        {tasks.length === 0 ? (
          <p className="text-muted-foreground">No tasks found</p>
        ) : (
          <div className="space-y-4">
            {tasks.map((task) => (
              <div 
                key={task.id} 
                className={`flex items-center justify-between p-4 border rounded-lg transition-colors ${
                  tasksToDelete.has(task.id) ? 'bg-red-50 border-red-200' : ''
                }`}
              >
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h3 className={`font-medium ${tasksToDelete.has(task.id) ? 'line-through text-muted-foreground' : ''}`}>
                      {task.title}
                    </h3>
                    <Badge className={`${getStatusColor(task.status)} text-white`}>
                      {getStatusIcon(task.status)}
                      <span className="ml-1 capitalize">{task.status}</span>
                    </Badge>
                  </div>
                  <p className={`text-sm text-muted-foreground ${tasksToDelete.has(task.id) ? 'line-through' : ''}`}>
                    {task.description}
                  </p>
                  <p className={`text-xs text-muted-foreground mt-1 ${tasksToDelete.has(task.id) ? 'line-through' : ''}`}>
                    Due: {new Date(task.due_date).toLocaleDateString()}
                  </p>
                </div>
                <Button
                  variant={tasksToDelete.has(task.id) ? "default" : "destructive"}
                  size="sm"
                  onClick={() => toggleTaskForDeletion(task.id)}
                >
                  <Trash2 className="h-4 w-4" />
                  {tasksToDelete.has(task.id) ? 'Restore' : 'Delete'}
                </Button>
              </div>
            ))}
            
            {tasksToDelete.size > 0 && (
              <div className="flex gap-2 pt-4 border-t">
                <Button 
                  onClick={handleSaveChanges}
                  disabled={isSaving}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {isSaving ? 'Saving...' : `Save Changes (${tasksToDelete.size})`}
                </Button>
                <Button 
                  variant="outline"
                  onClick={clearChanges}
                  disabled={isSaving}
                >
                  Clear Changes
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TaskManager;
