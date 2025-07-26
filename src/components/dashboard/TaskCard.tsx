
import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, CheckCircle, Upload, X, ChevronDown, ChevronUp, Calendar, Target } from 'lucide-react';
import { CoinIcon } from '@/components/ui/coin-icon';
import { Task } from '@/hooks/useTasks';
import TaskFileUpload from './TaskFileUpload';
import ScratchCard from '@/components/ui/scratch-card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface TaskCardProps {
  task: Task;
}

const TaskCard: React.FC<TaskCardProps> = ({ task }) => {
  const [showUpload, setShowUpload] = useState(false);
  const [showReward, setShowReward] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [isOpen, setIsOpen] = useState(false);

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
      case 'failed': return <X className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const handleTaskVerified = (taskId: string, generatedCouponCode: string) => {
    setCouponCode(generatedCouponCode);
    setShowUpload(false);
    setShowReward(true);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
  };

  const { date, time } = formatDate(task.due_date);

  return (
    <Card className="hover:shadow-lg transition-all duration-200 hover:scale-[1.02]">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3 flex-1">
                <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${getStatusColor(task.status)}`} />
                  {getStatusIcon(task.status)}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{task.title}</h3>
                  <Badge variant="secondary" className="text-xs">
                    {task.status.toUpperCase()}
                  </Badge>
                </div>
                <div className="flex items-center text-green-600 font-semibold">
                  <CoinIcon className="h-4 w-4 mr-1 text-yellow-500" />
                  {task.due_coins}
                </div>
              </div>
              <div className="transition-transform duration-200">
                {isOpen ? (
                  <ChevronUp className="h-5 w-5" />
                ) : (
                  <ChevronDown className="h-5 w-5" />
                )}
              </div>
            </div>
          </CardHeader>
        </CollapsibleTrigger>
        
        <CollapsibleContent className="animate-accordion-down data-[state=closed]:animate-accordion-up">
          <CardContent className="pt-0">
            <div className="space-y-4">
              <div className="text-gray-600">
                <p className="mb-3">{task.description}</p>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center text-muted-foreground">
                    <Calendar className="h-4 w-4 mr-1" />
                    Due: {date} at {time}
                  </div>
                  <div className="flex items-center text-muted-foreground">
                    <Target className="h-4 w-4 mr-1" />
                    Coins at stake: {task.due_coins}
                  </div>
                </div>
              </div>

              {task.status === 'pending' && !showUpload && (
                <Button
                  onClick={() => setShowUpload(true)}
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Submit Proof
                </Button>
              )}

              {showUpload && !showReward && (
                <TaskFileUpload
                  task={task}
                  onClose={() => setShowUpload(false)}
                  onTaskVerified={handleTaskVerified}
                />
              )}

              {showReward && (
                <div className="flex justify-center animate-fade-in">
                  <ScratchCard 
                    couponCode={couponCode}
                    amount={task.due_coins}
                    onReveal={() => {
                      setTimeout(() => {
                        setShowReward(false);
                      }, 5000);
                    }}
                  />
                </div>
              )}
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};

export default TaskCard;
